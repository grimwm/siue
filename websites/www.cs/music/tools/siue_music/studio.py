"""The studio connection: what `siue-music mcp` does for anyone with a studio, with no repository, make or 1Password.

It finds the AI key (SIUE_MUSIC_AI_KEY, else the `ai-key` file in its config folder), makes its own RSA-4096 sealing key
there on first use (0600, in a 0700 folder), registers the public half with the studio through the AI key, and shows the
pairing code made from that key's fingerprint. The person types the code on Your studio; from then on the browser
seals each new note to this key too, and the notes are opened here, on this computer. Drafts are listed, read,
published (a score) and deleted on the server. Nothing here deletes a note."""
import asyncio
import base64
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from importlib import resources
from pathlib import Path
from typing import Awaitable, Callable, Mapping

from . import __version__, paths, sealing
from .answering import Steps, default_steps
from .api import Api, ApiError
from .pickup import GENERAL_PIECE, pickup
from .score import ID_RE, validate

PLACEHOLDER = "PASTE-YOUR-AI-KEY-HERE"  # what the page's commands carry until the person pastes a key (music/lib/Connect.php)
KEY_FILE = "ai-key"
SEAL_FILE = "sealing-key.json"
ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"  # Crockford's base32 (music/lib/Pairing.php, games/workroom/src/pairing.ts)
_KEY = re.compile(r"[0-9a-f]{64}")
_NOTE = re.compile(r"[0-9a-f]{32}")
_NOTE_DIR = re.compile(r"\d{4}-\d{2}-\d{2}-([0-9a-f]{32})")
MAX_WAIT_SECONDS = 3600
MAX_VERSION = 9999
# The composer's instrument categories in picker order (games/workroom/src/catalogue.ts), and what list_instruments tells the AI.
CATEGORIES = ("strings", "woodwinds", "brass", "keys", "pitched", "drums", "voices")
INSTRUMENT_FIELDS = ("name", "category", "range", "expert", "clef", "written", "gm", "gm_name", "pieces", "standin_note")


class StudioError(Exception):
    """A refusal or failure the AI is told in words, with what the person can do about it."""


def config_dir(platform: str, env: Mapping[str, str], home: Path) -> Path:
    """Where the AI key and the sealing key live: SIUE_MUSIC_CONFIG_DIR, else the platform's user config folder."""
    if env.get("SIUE_MUSIC_CONFIG_DIR"):
        return Path(env["SIUE_MUSIC_CONFIG_DIR"])
    if platform == "darwin":
        return home / "Library" / "Application Support" / "siue-music"
    if platform == "win32":
        return (Path(env["APPDATA"]) if env.get("APPDATA") else home / "AppData" / "Roaming") / "siue-music"
    return (Path(env["XDG_CONFIG_HOME"]) if env.get("XDG_CONFIG_HOME") else home / ".config") / "siue-music"


def pairing_code(fingerprint: str) -> str:
    """The first 80 bits of the fingerprint in Crockford's base32, as XXXX-XXXX-XXXX-XXXX."""
    n = int(fingerprint[:20], 16)
    chars = "".join(ALPHABET[(n >> (75 - 5 * i)) & 31] for i in range(16))
    return "-".join(chars[i:i + 4] for i in range(0, 16, 4))


def _private_dir(path: Path) -> None:
    path.mkdir(mode=0o700, parents=True, exist_ok=True)
    if os.name != "nt":
        os.chmod(path, 0o700)


def _write_private(path: Path, data: bytes, replace: bool) -> bool:
    """Writes the file whole with mode 0600 (a temporary name, then a link or a rename). With replace False an existing
    file wins (two apps starting at once make one key): False when it was already there."""
    _private_dir(path.parent)
    tmp = path.with_name(f".{path.name}.{os.getpid()}.{time.monotonic_ns()}")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        if replace:
            os.replace(tmp, path)
            return True
        try:
            os.link(tmp, path)
            return True
        except FileExistsError:
            return False
    finally:
        tmp.unlink(missing_ok=True)


class StudioApi(Api):
    """The studio's API routes an AI key reaches, beyond the owner tool's."""

    def seal_status(self) -> dict:
        """{"label", "scopes", "sealing": {"fingerprint", "code", "paired", "paired_at"} | None}."""
        return json.loads(self._request("GET", "api/seal-key.php"))

    def register_seal(self, spki: bytes) -> dict:
        body = json.dumps({"spki": base64.b64encode(spki).decode()}).encode()
        return json.loads(self._request("POST", "api/seal-key.php", body=body, content_type="application/json"))

    def score(self, piece: str, version: int) -> dict:
        return json.loads(self._request("GET", "api/draft.php", {"piece": piece, "version": version}))

    def publish_score(self, piece: str, version: int, score_json: bytes) -> None:
        body = draft_container_bytes({"score.json": score_json})
        self._request("POST", "api/drafts.php", {"piece": piece, "version": version}, body)

    def delete_piece(self, piece: str) -> int:
        return int(json.loads(self._request("POST", "api/delete-piece.php", {"piece": piece}, body=b""))["deleted"])


def draft_container_bytes(files: Mapping[str, bytes]) -> bytes:
    """The SIUED1 bundle of name -> bytes, as api.draft_container makes it from files on disk."""
    out = bytearray(b"SIUED1" + bytes([len(files)]))
    for name, data in files.items():
        raw = name.encode()
        out += bytes([len(raw)]) + raw + len(data).to_bytes(4, "big") + data
    return bytes(out)



def _glossary() -> frozenset[str]:
    """The page's glossary ids: the copy built into the wheel, else the checkout's."""
    try:
        text = resources.files("siue_music").joinpath("data", "glossary.json").read_text(encoding="utf-8")
    except (FileNotFoundError, ModuleNotFoundError, OSError):
        try:
            text = paths.glossary_path().read_text(encoding="utf-8")
        except Exception:  # noqa: BLE001 - not in a checkout either: no glossary terms can be checked
            return frozenset()
    data = json.loads(text)
    return frozenset(t["id"] for t in data.get("terms", []) if isinstance(t, dict) and isinstance(t.get("id"), str))


class Studio:
    def __init__(self, env: Mapping[str, str], home: Path | None = None, platform: str = sys.platform,
                 make_api: Callable[[str, str], StudioApi] | None = None, steps: Steps | None = None,
                 fetch: Callable[[str], bytes] | None = None,
                 sleep: Callable[[float], Awaitable[None]] = asyncio.sleep, clock: Callable[[], float] = time.monotonic):
        self.env = env
        self.home = home if home is not None else Path.home()
        self.platform = platform
        self._make_api = make_api or (lambda base, key: StudioApi(base, key))
        self._steps = steps
        self._fetch = fetch or _fetch
        self._sleep = sleep
        self._clock = clock
        self._registered: str | None = None  # the fingerprint this run registered

    # where things are

    def base(self) -> str:
        return paths.api_base(self.env, None)

    def folder(self) -> Path:
        return config_dir(self.platform, self.env, self.home)

    def notes_dir(self) -> Path:
        return paths.notes_dir(self.platform, self.env, self.home)

    def studio_page(self) -> str:
        return self.base().rstrip("/") + "/studio.php"

    # the AI key

    def ai_key(self) -> str:
        """SIUE_MUSIC_AI_KEY (unless it is the page's placeholder), else the ai-key file. StudioError when neither."""
        given = (self.env.get("SIUE_MUSIC_AI_KEY") or "").strip()
        if given and given != PLACEHOLDER:
            if not _KEY.fullmatch(given):
                raise StudioError(f"SIUE_MUSIC_AI_KEY is not an AI key (64 letters and digits, 0-9 and a-f). Copy the key again from Your studio "
                                  f"({self.studio_page()}) into your AI app's siue-music settings, then restart the app.")
            return given
        path = self.folder() / KEY_FILE
        try:
            saved = path.read_text(encoding="ascii").strip()
        except FileNotFoundError:
            saved = ""
        except (OSError, UnicodeDecodeError) as e:
            raise StudioError(f"{path} could not be read ({e}).") from None
        if _KEY.fullmatch(saved):
            return saved
        raise StudioError(f"No AI key yet. Make an AI key on Your studio ({self.studio_page()}), then put it in your AI app's siue-music "
                          f"settings where it says {PLACEHOLDER} (SIUE_MUSIC_AI_KEY), and restart the app.")

    def save_key(self, secret: str) -> Path:
        """Keeps the AI key in the config folder (0600), for every app on this computer that runs siue-music without one."""
        secret = secret.strip()
        if not _KEY.fullmatch(secret):
            raise StudioError("That is not an AI key: it is 64 letters and digits (0-9 and a-f), shown once on Your studio.")
        path = self.folder() / KEY_FILE
        _write_private(path, (secret + "\n").encode("ascii"), replace=True)
        return path

    # the sealing key

    def sealing_key(self) -> tuple[str, bytes, bytes]:
        """(fingerprint, PKCS#8 DER, SPKI DER) of this computer's sealing key, made on first use."""
        path = self.folder() / SEAL_FILE
        if not path.exists():
            pkcs8, spki = sealing.generate()
            record = {"v": 1, "fingerprint": sealing.fingerprint(spki), "pkcs8": base64.b64encode(pkcs8).decode()}
            _write_private(path, json.dumps(record).encode(), replace=False)
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
            pkcs8 = base64.b64decode(record["pkcs8"], validate=True)
            spki = sealing.spki_of(pkcs8)
        except (OSError, ValueError, KeyError, TypeError) as e:
            raise StudioError(f"The sealing key in {path} is damaged ({e}). Move it away; siue-music makes a new one, and you pair again.") from None
        fp = sealing.fingerprint(spki)
        if record.get("fingerprint") != fp:
            raise StudioError(f"The sealing key in {path} does not match its fingerprint. Move it away; siue-music makes a new one, and you pair again.")
        return fp, pkcs8, spki

    def pairing_code(self) -> str:
        return pairing_code(self.sealing_key()[0])

    # the server

    def _api(self) -> StudioApi:
        try:
            return self._make_api(self.base(), self.ai_key())
        except ApiError as e:
            raise StudioError(str(e)) from None

    def _call(self, what: str, fn: Callable[[], object]):
        try:
            return fn()
        except ApiError as e:
            raise StudioError(self._why(what, e)) from None

    def _why(self, what: str, e: ApiError) -> str:
        if e.status == 401:
            return (f"The studio did not accept the AI key: it was revoked or mistyped. Make a new AI key on Your studio "
                    f"({self.studio_page()}), put it in your AI app's siue-music settings, and restart the app.")
        if e.status == 403 and "HTTPS" in str(e):
            return "The studio refused the request because the address is not https://."
        if e.status == 403:
            return f"This AI key may not {what}: make an AI key with that permission on Your studio ({self.studio_page()})."
        if e.status == 429:
            return "The studio is answering too many requests from this key right now (60 a minute). Wait a minute and try again."
        if e.status == 0:
            return f"The studio could not be reached ({e}). Check the connection, and that SIUE_MUSIC_BASE is {self.base()}."
        return f"The studio refused to {what} ({e})."

    def status(self) -> dict:
        """Everything a person needs to finish connecting: the server, the key's label and permissions, the pairing code
        and whether it is paired, and the next step. Registers this computer's sealing key first when the key may read notes."""
        out: dict = {"server": self.base(), "version": __version__, "config_folder": str(self.folder()), "notes_folder": str(self.notes_dir())}
        try:
            api = self._api()
        except StudioError as e:
            return out | {"connected": False, "next": str(e)}
        try:
            seal = self._call("read its status", api.seal_status)
        except StudioError as e:
            return out | {"connected": False, "next": str(e)}
        scopes = list(seal.get("scopes") or [])
        out |= {"connected": True, "label": seal.get("label"), "permissions": scopes}
        if "notes:pickup" not in scopes:
            return out | {"paired": False, "next": "This key may not read notes, so it needs no pairing. It can do what its permissions allow."}
        fp = self.sealing_key()[0]
        sealed = seal.get("sealing")
        if not (isinstance(sealed, dict) and sealed.get("fingerprint") == fp):
            reply = self._register(api)
            sealed = reply.get("sealing") if isinstance(reply, dict) else None
        paired = bool(isinstance(sealed, dict) and sealed.get("paired"))
        out |= {"pairing_code": pairing_code(fp), "paired": paired}
        if paired:
            return out | {"next": "Paired: the notes the person sends from now on are sealed to this AI. Call wait_for_notes or read_new_notes."}
        return out | {"next": self._pair_words(seal.get("label"))}

    def _pair_words(self, label: object) -> str:
        name = f" '{label}'" if isinstance(label, str) and label else ""
        return (f"Not paired yet. Tell the person their pairing code is {self.pairing_code()}: on Your studio ({self.studio_page()}), "
                f"on the row of the AI key{name}, they type it with their notes passphrase and press Pair. Notes sent after that "
                "are sealed to this AI.")

    def _register(self, api: StudioApi) -> dict:
        try:
            return api.register_seal(self.sealing_key()[2])
        except ApiError as e:
            if e.status == 409:
                raise StudioError("This AI key is paired with another computer's siue-music. Make a new AI key on Your studio "
                                  f"({self.studio_page()}) for this computer.") from None
            raise StudioError(self._why("register its sealing key", e)) from None

    def _paired_api(self) -> tuple[StudioApi, str, bytes]:
        """The API, this computer's fingerprint and private key, once the person paired it; else StudioError with the code."""
        api = self._api()
        seal = self._call("read notes", api.seal_status)
        if "notes:pickup" not in (seal.get("scopes") or []):
            raise StudioError(f"This AI key may not read notes: make an AI key with \"read notes\" on Your studio ({self.studio_page()}).")
        fp, pkcs8, spki = self.sealing_key()
        sealed = seal.get("sealing")
        if not (isinstance(sealed, dict) and sealed.get("fingerprint") == fp):
            sealed = self._register(api).get("sealing")
        if not (isinstance(sealed, dict) and sealed.get("paired")):
            raise StudioError(self._pair_words(seal.get("label")))
        return api, fp, pkcs8

    def register_quietly(self) -> None:
        """At start: registers the sealing key when there is a key that may read notes. Any failure waits for the next tool."""
        try:
            self.status()
        except Exception:  # noqa: BLE001 - a tool call says what is wrong
            pass

    # drafts

    def list_pieces(self) -> dict:
        api = self._api()
        drafts = self._call("list drafts", api.drafts)
        pieces: dict[str, dict] = {}
        for d in drafts:
            p = pieces.setdefault(d["piece"], {"piece": d["piece"], "project": {"id": d.get("project_id"), "name": d.get("project_name")},
                                               "kind": d.get("kind"), "versions": []})
            p["versions"].append(d["version"])
        return {"server": self.base(), "pieces": list(pieces.values())}

    def read_score(self, piece: str, version: int | None = None) -> dict:
        self._check_piece(piece)
        api = self._api()
        if version is None:
            versions = [d["version"] for d in self._call("list drafts", api.drafts) if d["piece"] == piece]
            if not versions:
                raise StudioError(f"The studio has no drafts of {piece}; list_pieces shows the pieces.")
            version = max(versions)
        self._check_version(version)
        try:
            score = api.score(piece, version)
        except ApiError as e:
            if e.status == 404:
                raise StudioError(f"The studio does not hold {piece} v{version}; list_pieces shows the drafts.") from None
            raise StudioError(self._why("read drafts", e)) from None
        return {"piece": piece, "version": version, "score": score, "page": self._page(piece, version)}

    def publish_draft(self, score: dict) -> dict:
        """Checks the score as the page does (the page's glossary, the site's instrument library), then publishes it as
        draft score.draft of piece score.piece.id. A studio stores the score alone: the page builds its sound."""
        if not isinstance(score, dict):
            raise StudioError("score must be a score.json object (schema 1 or 2).")
        problems = validate(score, _glossary(), self._instruments())
        if problems:
            raise StudioError(f"The score is not valid: {problems[0]}. Nothing was published.")
        piece, version = score["piece"]["id"], score["draft"]
        self._check_piece(piece)
        self._check_version(version)
        api = self._api()
        raw = json.dumps(score, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        try:
            api.publish_score(piece, version, raw)
        except ApiError as e:
            if e.status == 409:
                raise StudioError(f"{piece} v{version} is published already; drafts cannot be replaced. Publish it as the next draft number.") from None
            if e.status in (413, 422):
                raise StudioError(f"The studio refused the draft ({e}).") from None
            raise StudioError(self._why("publish drafts", e)) from None
        return {"piece": piece, "version": version, "published": True, "page": self._page(piece, version)}

    def delete_draft(self, piece: str, version: int) -> dict:
        self._check_piece(piece)
        self._check_version(version)
        api = self._api()
        try:
            api.delete_draft(piece, version)
        except ApiError as e:
            if e.status == 404:
                raise StudioError(f"The studio does not hold {piece} v{version}; list_pieces shows the drafts.") from None
            raise StudioError(self._why("delete drafts", e)) from None
        return {"piece": piece, "version": version, "deleted": True}

    def delete_piece(self, piece: str) -> dict:
        self._check_piece(piece)
        api = self._api()
        try:
            n = api.delete_piece(piece)
        except ApiError as e:
            if e.status == 404:
                raise StudioError(f"The studio has no drafts of {piece}.") from None
            raise StudioError(self._why("delete drafts", e)) from None
        return {"piece": piece, "deleted_drafts": n}

    def _page(self, piece: str, version: int) -> str:
        return self.base().rstrip("/") + f"/piece.php?id={piece}&v={version}"

    @staticmethod
    def _check_piece(piece: object) -> None:
        if not (isinstance(piece, str) and ID_RE.fullmatch(piece)) or piece == GENERAL_PIECE:
            raise StudioError(f"{piece!r} is not a piece id (lowercase letters, digits and hyphens).")

    @staticmethod
    def _check_version(version: object) -> None:
        if isinstance(version, bool) or not isinstance(version, int) or not 1 <= version <= MAX_VERSION:
            raise StudioError(f"{version!r} is not a draft version (1 to {MAX_VERSION}).")

    def list_vocal_takes(self, piece: str, version: int | None = None) -> dict:
        """A draft's Vocal Tracks, read from its score: each vocal lane's takes (file, seconds, quality) and clips (which
        take, where it starts in the piece, the stretch of the take heard, its volume and fades). The recorded voice
        itself stays in the studio: the AI never needs it, and changes a vocal lane only by its clips and settings."""
        read = self.read_score(piece, version)
        tracks = []
        for lane in read["score"].get("lanes", []):
            vocal = lane.get("vocal")
            if not isinstance(vocal, dict):
                continue
            takes = [{"file": t["file"], "seconds": t["seconds"], "quality": "perfect" if t["file"].endswith(".flac") else "good_to_the_ear"}
                     for t in vocal.get("takes", [])]
            tracks.append({"lane": lane.get("id"), "name": lane.get("name"), "takes": takes, "clips": vocal.get("clips", []),
                           "voice": lane.get("voice", []), "fx": lane.get("fx", {})})
        return {"piece": read["piece"], "version": read["version"], "tracks": tracks, "page": read["page"]}

    def list_instruments(self) -> dict:
        """The studio's instruments as the composer's catalogue lists them (music/library/library.json), in picker order."""
        try:
            data = json.loads(self._fetch(self.base().rstrip("/") + "/library/library.json"))
            library = data["instruments"]
            if not isinstance(library, dict) or not all(isinstance(e, dict) for e in library.values()):
                raise TypeError("instruments is not an object of objects")
        except Exception as e:  # noqa: BLE001 - any failure is "cannot read it"
            raise StudioError(f"The studio's instrument library could not be read ({type(e).__name__}). Try again in a minute.") from None
        order = {c: n for n, c in enumerate(CATEGORIES)}
        picked = [(i, e) for i, e in library.items() if e.get("name") and e.get("category") in order]
        picked.sort(key=lambda p: order[p[1]["category"]])  # stable: library order within a category
        return {"instruments": [{"id": i, **{k: e.get(k) for k in INSTRUMENT_FIELDS}} for i, e in picked]}

    def _instruments(self) -> frozenset[str] | None:
        """The site's instrument ids (music/library/library.json), or None when it cannot be read: the server checks them too."""
        try:
            data = json.loads(self._fetch(self.base().rstrip("/") + "/library/library.json"))
            return frozenset(data["instruments"])
        except Exception:  # noqa: BLE001 - only the server's check remains
            return None

    # notes

    def read_new_notes(self, limit: int = 20) -> dict:
        """Downloads every waiting note sealed to this AI, checks it, opens it here with this computer's sealing key and
        saves it in the notes folder. Marks none picked up: mark_notes_picked_up does, once the AI has acted on them."""
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 200:
            raise StudioError("limit must be a whole number from 1 to 200.")
        api, fp, pkcs8 = self._paired_api()
        notes = self.notes_dir()
        report = self._call("read notes", lambda: pickup(api, {fp: pkcs8}, notes, None, self._steps or default_steps(), mark=False,
                                                      unknown_key="could not open: it was sealed before this AI was paired, or to another key; left waiting"))
        opened = set(report.picked)
        found = [n for n in saved_notes(notes) if n["id"] in opened][:limit]
        return {"notes": found, "notes_folder": str(notes), "left": dict(report.left), "notices": list(report.notices),
                "next": "When you have acted on these, call mark_notes_picked_up with their ids." if found else "No new notes."}

    def mark_picked_up(self, ids: list[str]) -> dict:
        if not isinstance(ids, list) or not ids or len(ids) > 200 or not all(isinstance(i, str) and _NOTE.fullmatch(i) for i in ids):
            raise StudioError("note_ids must be 1 to 200 note ids (32 letters and digits), as read_new_notes gives them.")
        api, _, _ = self._paired_api()
        marked, missing = [], []
        for note_id in ids:
            try:
                api.mark_picked_up(note_id)
                marked.append(note_id)
            except ApiError as e:
                if e.status != 404:
                    raise StudioError(self._why("mark notes picked up", e)) from None
                missing.append(note_id)
        return {"marked": marked, "not_found": missing}

    async def wait_for_notes(self, timeout_seconds: float, poll_seconds: float | None = None,
                             on_poll: Callable[[float, float], object] | None = None) -> dict:
        """Asks the studio every poll_seconds until a note sealed to this AI waits that this computer has not opened yet,
        or timeout_seconds pass. Only lists: read_new_notes opens them."""
        if isinstance(timeout_seconds, bool) or not isinstance(timeout_seconds, (int, float)) or not math.isfinite(timeout_seconds) \
                or not 0 <= timeout_seconds <= MAX_WAIT_SECONDS:
            raise StudioError(f"timeout_seconds must be from 0 to {MAX_WAIT_SECONDS}.")
        if poll_seconds is None:
            poll = paths.poll_seconds(self.env, None)
        elif isinstance(poll_seconds, bool) or not isinstance(poll_seconds, (int, float)) or not math.isfinite(poll_seconds):
            raise StudioError("poll_seconds must be a number of seconds.")
        else:
            poll = max(float(poll_seconds), paths.MIN_POLL_SECONDS)
        api, _, _ = await asyncio.to_thread(self._paired_api)
        started = self._clock()
        while True:
            listed = await asyncio.to_thread(self._call, "read notes", api.waiting)
            seen = {n["id"] for n in saved_notes(self.notes_dir())}
            fresh = [n for n in listed if isinstance(n, dict) and n.get("id") not in seen]
            waited = self._clock() - started
            if fresh:
                return {"waiting": len(fresh), "timed_out": False, "waited_seconds": round(waited, 1),
                        "notes": [{"id": n.get("id"), "arrived_at": n.get("arrived_at"), "size": n.get("size")} for n in fresh],
                        "next": "call read_new_notes to open and read them"}
            if on_poll is not None:
                done = on_poll(waited, float(timeout_seconds))
                if asyncio.iscoroutine(done):
                    await done
            left = timeout_seconds - waited
            if left <= 0:
                return {"waiting": 0, "timed_out": True, "waited_seconds": round(waited, 1), "notes": [],
                        "next": "no new notes yet; call wait_for_notes again to keep waiting"}
            await self._sleep(min(poll, left))


def saved_notes(notes: Path) -> list[dict]:
    """The notes opened onto this computer, newest first, as data (workroom.Workroom._note)."""
    from .workroom import Workroom
    out = []
    for folder in notes.iterdir() if notes.is_dir() else []:
        m = _NOTE_DIR.fullmatch(folder.name)
        if not (m and folder.is_dir()):
            continue
        try:
            record = json.loads((folder / "note.json").read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        body = record.get("body") if isinstance(record, dict) else None
        if record.get("id") != m.group(1) or not isinstance(body, dict):
            continue
        out.append(Workroom._note(folder, record, body))
    out.sort(key=lambda n: (n["arrived_at"], n["id"]), reverse=True)
    return out


def _fetch(url: str) -> bytes:
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != "https" and not (parts.scheme == "http" and parts.hostname in ("localhost", "127.0.0.1")):
        raise ValueError("https only")
    with urllib.request.urlopen(url, timeout=15) as r:  # noqa: S310 - the scheme is checked above
        return r.read(2_000_000)

