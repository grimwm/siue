"""The notes keys: 1Password is the home, the cache holds a working copy, the repository's public.json says which key is current."""
import base64
import binascii
import json
import os
import hmac
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable
from urllib.parse import urljoin
from datetime import datetime, timezone

from . import sealing
from .op import Op, OpError
from .paths import DEFAULT_BASE

KEY_TAG = "siue-music-key"
API_TAG = "siue-music-api"
WORKROOM_URL = "https://www.cs.siue.edu/~wgrim/music/"
_API_KEY = re.compile(r"[0-9a-f]{64}")
_API_NAME = re.compile(r"[a-z0-9][a-z0-9-]{0,47}")
KEY_TITLE = "SIUE music notes key "
PREVIOUS_SUFFIX = " (previous)"
PUBLISH_KEY = "music-publish"
PICKUP_KEY = "music-pickup"
KEY_KINDS = ("Two kinds of key are involved. The NOTES KEY (made by make music-setup) is the encryption key: its public half is built into\n"
             "the page so notes are sealed before they leave the phone; its private half and passphrase live in 1Password, and a\n"
             "locked copy goes to the server so any device can open notes with the passphrase. API KEYS (music-publish, music-pickup)\n"
             "are not encryption: they are passwords that let this tool talk to the server (publish uploads drafts and the locked\n"
             "copy; pickup downloads waiting notes).")
PUBLISH_SCOPES = ("drafts:publish", "keys:publish")
PICKUP_SCOPES = ("notes:pickup",)
REPO_PATHS = ("music/keys/public.json", "games/workroom/src/public-key.ts", "games/workroom/dist/")

Upload = Callable[[dict], None]
ApiCheck = Callable[[str], "object"]  # secret -> something with holds(scope)


SCOPE_ROUTES = ("notes:pickup", "keys:publish", "drafts:publish")
WANT = {PICKUP_KEY: ("notes:pickup",), PUBLISH_KEY: ("keys:publish", "drafts:publish")}


def probe_states(api: object) -> dict[str, str]:
    """What the server says this API key may do: scope -> yes | no | invalid | https | unknown."""
    return {scope: api.holds(scope) for scope in SCOPE_ROUTES}  # type: ignore[attr-defined]


def _other(name: str) -> str:
    return PUBLISH_KEY if name == PICKUP_KEY else PICKUP_KEY


def is_misnamed(name: str, states: dict[str, str]) -> bool:
    """The key saved as `name` lacks what `name` needs and has everything the other key needs."""
    lacks = any(states[s] == "no" for s in WANT[name])
    return lacks and all(states[s] == "yes" for s in WANT[_other(name)])


def api_problem(name: str, states: dict[str, str]) -> str | None:
    """One line on why the key saved as `name` does not do its job, or None when it does (or cannot be checked)."""
    if "https" in states.values():
        return ("The server refused the check because the address is not https:// "
                "(set SIUE_MUSIC_BASE to the https:// workroom address).")
    if "invalid" in states.values():
        return f"The {name} API key no longer works (revoked or mistyped)."
    missing = [s for s in WANT[name] if states[s] == "no"]
    if not missing:
        return None
    if is_misnamed(name, states):
        return f"The key saved as {name} is really the {_other(name)} key (it has that key's permissions, not {name}'s)."
    return f"The {name} API key lacks the {' and '.join(missing)} permission."


class KeyMismatch(Exception):
    """The repository, 1Password and the cache disagree about the current key. Exit code 3."""


class KeysError(Exception):
    """Exit code 1."""


class NotUploaded(Exception):
    """The keys changed but the locked keyring did not reach the server. Exit code 4."""


def display(fp: str) -> str:
    return " ".join(fp[i:i + 4] for i in range(0, len(fp), 4))


@dataclass
class RepoKeys:
    current: str | None
    previous: list[str] = field(default_factory=list)
    spki: dict[str, bytes] = field(default_factory=dict)


def read_repo_keys(path: Path) -> RepoKeys:
    if not path.exists():
        return RepoKeys(None, [], {})
    try:
        data = json.loads(path.read_text())
    except ValueError:
        raise KeysError(f"{path} is not JSON") from None
    if not isinstance(data, dict) or data.get("schema") != 1:
        raise KeysError(f"{path} is not a schema 1 public key file")
    spki: dict[str, bytes] = {}

    def entry(e: object) -> str:
        fp = e.get("fingerprint") if isinstance(e, dict) else None
        try:
            der = base64.b64decode(e.get("spki", ""), validate=True) if isinstance(e, dict) else b""
        except (binascii.Error, ValueError):
            der = b""
        if not isinstance(fp, str) or not der or sealing.fingerprint(der) != fp:
            raise KeysError(f"{path} names a public key whose fingerprint does not match its key")
        spki[fp] = der
        return fp

    current = entry(data["current"]) if data.get("current") else None
    previous = [entry(e) for e in data.get("previous") or []]
    return RepoKeys(current, previous, spki)


def _write_atomic(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text)
    os.replace(tmp, path)


def write_public_files(json_path: Path, ts_path: Path, current: tuple[str, bytes], previous: list[tuple[str, bytes]]) -> None:
    """music/keys/public.json and the page's built-in public-key.ts, from the same public halves."""
    entry = lambda k: {"fingerprint": k[0], "spki": base64.b64encode(k[1]).decode("ascii")}  # noqa: E731
    now, before = entry(current), [entry(k) for k in previous]
    _write_atomic(json_path, json.dumps({"schema": 1, "current": now, "previous": before}, indent=2) + "\n")
    compact = lambda v: json.dumps(v, separators=(",", ":"))  # noqa: E731
    _write_atomic(ts_path, "// The notes key built into the page: written by `siue-music keys init|rotate`\n"
                  "// from music/keys/public.json (a unit test keeps them equal). Not secret.\n"
                  "import type { BuiltInKey } from './seal.ts';\n\n"
                  f"export const PUBLIC_KEY: BuiltInKey | null = {compact(now)};\n"
                  f"export const PREVIOUS_KEYS: readonly BuiltInKey[] = {compact(before)};\n")


class Cache:
    """<config>/music.json: {"v": 1, "keys": {fingerprint: pkcs8 base64}, "api": {name: key}, "uploaded": {"fingerprints": [...], "at": iso}}; folder 0700, file 0600.
    "uploaded" is not secret: it records which keys the last successful keyring upload covered."""

    def __init__(self, path: Path):
        self.path = path

    def load(self) -> dict:
        try:
            data = json.loads(self.path.read_text())
        except FileNotFoundError:
            return {"v": 1, "keys": {}, "api": {}}
        except ValueError:
            raise KeysError(f"{self.path} is damaged: make music-forget, then make music-setup") from None
        if not isinstance(data, dict) or not isinstance(data.get("keys"), dict) or not isinstance(data.get("api"), dict):
            raise KeysError(f"{self.path} is damaged: make music-forget, then make music-setup")
        return data

    def save(self, data: dict) -> None:
        self.path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        os.chmod(self.path.parent, 0o700)
        tmp = self.path.with_name(self.path.name + ".tmp")
        tmp.unlink(missing_ok=True)
        fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        try:
            with os.fdopen(fd, "w") as f:
                os.fchmod(f.fileno(), 0o600)
                f.write(json.dumps(data))
            os.replace(tmp, self.path)
        except BaseException:
            tmp.unlink(missing_ok=True)
            raise

    def forget(self) -> bool:
        try:
            self.path.unlink()
            return True
        except FileNotFoundError:
            return False


class Keys:
    def __init__(self, op: Op, cache: Cache, public_json: Path, public_ts: Path, out: Callable[[str], None] = print,
                 base: str = DEFAULT_BASE, run: Callable[..., subprocess.CompletedProcess] = subprocess.run):
        self.op = op
        self.cache = cache
        self.public_json = public_json
        self.public_ts = public_ts
        self.out = out
        self.run = run
        self.base = base if base.endswith("/") else base + "/"

    def _ready(self) -> None:
        self.op.check_version()

    def _held(self) -> dict[str, tuple[str, dict[str, str]]]:
        """Every key item in 1Password, checked: fingerprint -> (item title, revealed fields)."""
        held: dict[str, tuple[str, dict[str, str]]] = {}
        for item in self.op.list_items(KEY_TAG):
            f = self.op.fields(item["id"])
            title = item.get("title", item["id"])
            try:
                pkcs8 = base64.b64decode(f["private_key"], validate=True)
                actual = sealing.fingerprint(sealing.spki_of(pkcs8))
            except (KeyError, binascii.Error, ValueError):
                raise KeysError(f"The 1Password item {title} does not hold a usable private key: fix the item") from None
            claimed = f.get("fingerprint", "")
            if actual != claimed:
                raise KeyMismatch(f"The 1Password item {title} holds a private key whose fingerprint is {display(actual)}, "
                                  f"not {display(claimed)}: fix the item")
            held[actual] = (title, f)
        return held

    def _api_items(self) -> list[tuple[str, str]]:
        return [(item["id"], self.op.fields(item["id"]).get("name", "")) for item in self.op.list_items(API_TAG)]

    def pull(self) -> None:
        self._ready()
        held = self._held()
        api: dict[str, str] = {}
        for item in self.op.list_items(API_TAG):
            f = self.op.fields(item["id"])
            if f.get("name") and f.get("credential"):
                api[f["name"]] = f["credential"]
        cached = self.cache.load()["keys"]
        for fp in cached:
            if fp not in held:
                self._verified(fp, cached[fp])
                self.out(f"Only this computer holds key {display(fp)}; it is kept.")
        data = self.cache.load()
        data.update({"keys": {**cached, **{fp: f["private_key"] for fp, (_, f) in held.items()}}, "api": api})
        self.cache.save(data)

    @staticmethod
    def _verified(fp: str, encoded: object) -> bytes:
        """A cached private key's DER, proven to belong to the fingerprint it is filed under."""
        try:
            pkcs8 = base64.b64decode(encoded, validate=True)  # type: ignore[arg-type]
            ok = sealing.fingerprint(sealing.spki_of(pkcs8)) == fp
        except (binascii.Error, ValueError, TypeError):
            ok = False
        if not ok:
            raise KeysError(f"The cached key {display(fp)} is damaged or does not match its fingerprint: "
                            "make music-forget, then make music-setup")
        return pkcs8

    def pull_checked(self) -> None:
        self.pull()
        self.ensure_synced()

    def ensure_synced(self) -> dict[str, bytes]:
        repo = read_repo_keys(self.public_json)
        if repo.current is None:
            raise KeyMismatch("No notes key yet: run make music-setup")
        wanted = [repo.current, *repo.previous]
        cached = self.cache.load()["keys"]
        if repo.current not in cached:
            self.pull()
            cached = self.cache.load()["keys"]
        if repo.current not in cached:
            unknown = [fp for fp in cached if fp not in wanted]
            if unknown:
                raise KeyMismatch(f"This computer or 1Password holds a key the repository does not know ({', '.join(display(fp) for fp in unknown)}). "
                                  "The repository may be out of date: git pull, then run this again. If it is up to date, "
                                  f"the repository's key {display(repo.current)} was never saved to 1Password: run make music-status.")
            raise KeyMismatch(f"1Password (vault {self.op.vault}) has no private key for the repository's public key "
                              f"{display(repo.current)}. Check OP_VAULT, or the key was never saved to 1Password: run make music-status.")
        return {fp: self._verified(fp, cached[fp]) for fp in wanted if fp in cached}

    def status(self, check: ApiCheck | None = None) -> int:
        repo = read_repo_keys(self.public_json)
        if repo.current is None:
            self.out("No notes key yet: run make music-setup")
            self._checklist(repo, False, False, set(self.cache.load()["api"]))
            return 3
        self.out(f"Repository key: {display(repo.current)}")
        ok = True
        in_op = False
        secrets = dict(self.cache.load()["api"])
        try:
            self._ready()
            held = sorted(self._held())
            self.out("1Password (vault " + self.op.vault + "): " + (", ".join(display(fp) for fp in held) or "no keys"))
            in_op = repo.current in held
            self.out("1Password: match" if in_op else "1Password: out of date: the repository's key is not saved there; run make music-setup or check OP_VAULT")
            ok &= in_op
            secrets.update(self.api_secrets())
            only_here = [fp for fp in self.cache.load()["keys"] if fp not in held]
            if only_here:
                self.out("Only this computer holds: " + ", ".join(display(fp) for fp in only_here) + " (not in 1Password)")
        except (OpError, KeysError, KeyMismatch) as e:
            self.out(f"1Password: unreachable: {e}")
            ok = False
        cache = self.cache.load()
        self.out("Cache: " + (", ".join(display(fp) for fp in cache["keys"]) or "no keys"))
        in_cache = repo.current in cache["keys"]
        self.out("Cache: match" if in_cache else "Cache: out of date: run make music-setup")
        ok &= in_cache
        self.out("API keys: " + (", ".join(sorted(cache["api"])) or "none"))
        problems: dict[str, str] = {}
        if check is not None:
            for name in (PUBLISH_KEY, PICKUP_KEY):
                if name in secrets:
                    problem = api_problem(name, probe_states(check(secrets[name])))
                    if problem:
                        problems[name] = problem
        self._checklist(repo, in_op, in_cache, set(secrets), problems)
        return 0 if ok else 3

    def _git_state(self) -> str:
        """"committed", "uncommitted", or "unknown" for the public key files, from git in the key file's folder."""
        folder = self.public_json.parent
        paths = [self.public_json, self.public_ts, self.public_ts.parents[1] / "dist"]
        try:
            if not self.public_json.exists():
                return "uncommitted"
            tracked = self.run(["git", "-C", str(folder), "ls-files", "--error-unmatch", "--", *map(str, paths)],
                                     capture_output=True, text=True, timeout=20)
            if tracked.returncode != 0:
                probe = self.run(["git", "-C", str(folder), "rev-parse", "--is-inside-work-tree"],
                                       capture_output=True, text=True, timeout=20)
                return "uncommitted" if probe.returncode == 0 else "unknown"
            dirty = self.run(["git", "-C", str(folder), "status", "--porcelain", "--", *map(str, paths)],
                                   capture_output=True, text=True, timeout=20)
            if dirty.returncode != 0:
                return "unknown"
            return "uncommitted" if dirty.stdout.strip() else "committed"
        except (OSError, subprocess.SubprocessError):
            return "unknown"

    def upload_covers(self, repo: RepoKeys) -> bool:
        """True when the last successful upload held the repository's current key and every retained one."""
        up = self.cache.load().get("uploaded") or {}
        return isinstance(up.get("fingerprints"), list) and repo.current is not None \
            and all(fp in up["fingerprints"] for fp in (repo.current, *repo.previous))

    def _checklist(self, repo: RepoKeys, in_op: bool, in_cache: bool, api_names: set[str],
                   problems: dict[str, str] | None = None) -> None:
        """What's left, from what this tool can see: each line is done or points at make music-setup."""
        problems = problems or {}
        done, todo = "\u2713", "\u2192"
        left = 0
        lines: list[str] = []

        def line(ok: bool, did: str, todo_text: str) -> None:
            nonlocal left
            left += not ok
            lines.append(f"  {done} {did}" if ok else f"  {todo} {todo_text}")

        line(repo.current is not None, "The notes key is in the repository (music/keys/public.json).", "The notes key is not made yet.")
        git = self._git_state() if repo.current is not None else "uncommitted"
        if git == "unknown":
            lines.append("  ? Check that music/keys/public.json is committed (git is not available here).")
            left += 1
        else:
            line(git == "committed", "The notes key is committed.", "The public key is not committed yet.")
        line(in_op, "The key is saved in 1Password.", "The key is not saved in 1Password.")
        line(in_cache, "The key is in this computer's cache.", "The key is not in this computer's cache.")
        for name in (PUBLISH_KEY, PICKUP_KEY):
            problem = problems.get(name)
            line(name in api_names and problem is None, f"The {name} API key is saved.",
                 problem or f"The {name} API key is not saved.")
        up = self.cache.load().get("uploaded") or {}
        line(self.upload_covers(repo), f"The locked copy of your key is on the server (uploaded {up.get('at', '')}).",
             "The locked copy of your key is not on the server yet.")
        self.out("\nWhat's left:\n" + KEY_KINDS)
        for text in lines:
            self.out(text)
        self.out("Setup is complete. Notes you leave in the workroom will be sealed to this key; pick them up with make music-pickup."
                 if left == 0 else "Next: make music-setup")

    def forget(self) -> None:
        self.out("Forgot the cached keys." if self.cache.forget() else "Nothing cached.")

    def api_key_set(self, name: str, secret: str) -> None:
        if not _API_NAME.fullmatch(name):
            raise KeysError("the API key name is lowercase letters, digits and hyphens, e.g. music-pickup")
        if not _API_KEY.fullmatch(secret):
            raise KeysError("an API key is 64 lowercase hex characters, as the hub shows it once")
        self._ready()
        old = [item_id for item_id, existing in self._api_items() if existing == name]
        self.api_item_add(name, secret)
        for item_id in old:
            self.op.archive(item_id)
        self.out(f"Saved the API key {name} to 1Password (vault {self.op.vault}).")

    def api_item_add(self, name: str, secret: str) -> str:
        """Makes the 1Password item for an API key and reads it back; an item that was not stored as sent is removed."""
        new_id = self.op.create(f"SIUE music API {name}", "API_CREDENTIAL", [API_TAG], [
            {"id": "name", "type": "STRING", "label": "name", "value": name},
            {"id": "credential", "type": "CONCEALED", "label": "credential", "value": secret},
        ], urls=[WORKROOM_URL])
        stored = self.op.fields(new_id)
        for label, want in (("name", name), ("credential", secret)):
            if not hmac.compare_digest(stored.get(label, "").encode(), want.encode()):
                self.op.archive(new_id)
                raise KeysError(f"1Password did not store the API key's {label} field as sent; the new item was removed "
                                "and the old key (if any) is untouched")
        return new_id

    def api_secrets(self) -> dict[str, str]:
        """name -> API key for every API key saved in 1Password."""
        out: dict[str, str] = {}
        for item in self.op.list_items(API_TAG):
            f = self.op.fields(item["id"])
            if f.get("name") and f.get("credential"):
                out[f["name"]] = f["credential"]
        return out

    def api_key(self, name: str, rerun: str | None = None) -> str:
        api = self.cache.load()["api"]
        if name not in api:
            self.pull()
            api = self.cache.load()["api"]
        if name not in api:
            raise KeysError(f"There is no API key named {name} in 1Password (vault {self.op.vault}) yet. "
                            "An API key is a password that lets this tool talk to the server. "
                            "Run make music-setup: it opens the hub with the form filled in and saves the key for you"
                            + (f", then run {rerun} again." if rerun else "."))
        return api[name]

    def passphrase(self) -> str:
        repo = read_repo_keys(self.public_json)
        if repo.current is None:
            raise KeyMismatch("No notes key yet: run make music-setup")
        self._ready()
        held = self._held()
        if repo.current not in held:
            raise KeyMismatch(f"1Password (vault {self.op.vault}) has no private key for the repository's public key "
                              f"{display(repo.current)}. Check OP_VAULT, or the key was never saved to 1Password: run make music-status.")
        password = held[repo.current][1].get("password")
        if not password:
            raise KeysError(f"The 1Password item {held[repo.current][0]} has no password field: fix the item")
        return password

    def keyring(self) -> dict[str, bytes]:
        """fingerprint -> PKCS#8 DER for the current key, then every retained one; a key the cache lacks is an error, never skipped."""
        ring = self.ensure_synced()
        repo = read_repo_keys(self.public_json)
        missing = [fp for fp in (repo.current, *repo.previous) if fp not in ring]
        if missing:
            self.pull()
            ring = self.ensure_synced()
            missing = [fp for fp in (repo.current, *repo.previous) if fp not in ring]
        if missing:
            raise KeysError("1Password holds no private key for " + ", ".join(display(fp) for fp in missing)
                            + ": a keyring without it would stop opening the notes sealed to it, so nothing was changed")
        return ring

    def _item(self, fp: str) -> dict:
        for item in self.op.list_items(KEY_TAG):
            if self.op.fields(item["id"]).get("fingerprint") == fp:
                return item
        raise KeysError(f"1Password has no item for the key {display(fp)}")

    def _create_key_item(self, pkcs8: bytes, fp: str, passphrase: str) -> None:
        private_key = base64.b64encode(pkcs8).decode("ascii")
        new_id = self.op.create(KEY_TITLE + fp[:16], "PASSWORD", [KEY_TAG], [
            {"id": "password", "type": "CONCEALED", "purpose": "PASSWORD", "label": "password", "value": passphrase},
            {"id": "private_key", "type": "CONCEALED", "label": "private_key", "value": private_key},
            {"id": "fingerprint", "type": "STRING", "label": "fingerprint", "value": fp},
        ], urls=[WORKROOM_URL])
        try:
            stored = self.op.fields(new_id)
            bad = next((label for label, want in (("password", passphrase), ("private_key", private_key), ("fingerprint", fp))
                        if not hmac.compare_digest(stored.get(label, "").encode(), want.encode())), None)
        except Exception as e:
            left = self._discard(new_id)
            if left:
                raise KeysError(f"{e}{left}") from e
            raise
        if bad is not None:
            left = self._discard(new_id)
            raise KeysError(f"1Password did not store the key's {bad} field as sent; " + (
                f"nothing else was changed.{left}" if left else "the new item was removed and nothing was changed"))

    def _discard(self, item_id: str) -> str:
        """Archive a half-made item; returns "" or a sentence naming the orphan when that fails too."""
        try:
            self.op.archive(item_id)
        except Exception as e:
            return f" The new 1Password item {item_id} could not be removed ({e}): remove it by hand, or run make music-setup to adopt it."
        return ""

    def _remember(self, fp: str, pkcs8: bytes) -> None:
        data = self.cache.load()
        data["keys"][fp] = base64.b64encode(pkcs8).decode("ascii")
        self.cache.save(data)

    def hub_url(self) -> str:
        """The admin hub, a sibling of the music folder: https://host/~user/admin/"""
        return urljoin(self.base, "../admin/")

    def _record_upload(self, fingerprints: list[str]) -> None:
        data = self.cache.load()
        data["uploaded"] = {"fingerprints": sorted(fingerprints), "at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}
        self.cache.save(data)

    def _send(self, upload: Upload | None, ring: dict[str, bytes], passphrase: str, first: bool) -> bool:
        locked = sealing.lock_keyring(ring, passphrase)
        reason = "no music-publish API key"
        if upload is not None:
            try:
                upload(locked)
                self._record_upload(list(ring))
                self.out(f"Uploaded the locked copy of your notes key{'' if len(ring) == 1 else 's'} to the server ({len(ring)} key{'' if len(ring) == 1 else 's'}).\n"
                         "Any device can now open your notes once you type the passphrase from 1Password.")
                return True
            except Exception as e:  # any failure leaves the keys safe in 1Password; the retry is make music-setup
                reason = str(e) or type(e).__name__
        self.out(f"The locked copy of your notes key was not uploaded ({reason}). Run make music-setup to finish; "
                 "until then other devices cannot open notes" + (" sealed to the new key." if not first else "."))
        return False

    def init(self, upload: Upload | None, adopt: bool = False) -> str:
        self._ready()
        if read_repo_keys(self.public_json).current is not None:
            raise KeysError("A notes key already exists in the repository: use make music-rotate")
        items = self.op.list_items(KEY_TAG)
        if adopt:
            fp, pkcs8, spki, passphrase = self._adopt(items)
        else:
            if items:
                names = ", ".join(i.get("title", i["id"]) for i in items)
                raise KeysError(f"1Password already holds a notes key ({names}) but the repository has no music/keys/public.json "
                                "(an earlier init stopped part-way, or the repository is out of date: git pull). "
                                "To adopt that key: run make music-setup")
            pkcs8, spki = sealing.generate()
            fp, passphrase = sealing.fingerprint(spki), sealing.new_passphrase()
            self._create_key_item(pkcs8, fp, passphrase)
        write_public_files(self.public_json, self.public_ts, (fp, spki), [])
        self._remember(fp, pkcs8)
        self.out(("Done: your notes key is " + ("taken from" if adopt else "made and saved in")
                  + f" 1Password (vault {self.op.vault}).\n"
                  f"Its fingerprint, an ID to compare later: {display(fp)}\n\n" + KEY_KINDS))
        if not (adopt and self._already_uploaded(fp)):
            self._send(upload, {fp: pkcs8}, passphrase, first=True)
        return fp

    def _already_uploaded(self, fp: str) -> bool:
        """True when the last successful upload held `fp` (a rerun adopting the key before its pull request merges)."""
        up = self.cache.load().get("uploaded") or {}
        return isinstance(up.get("fingerprints"), list) and fp in up["fingerprints"]

    def _adopt(self, items: list[dict]) -> tuple[str, bytes, bytes, str]:
        if len(items) != 1:
            raise KeysError(f"--adopt needs exactly one notes key item in 1Password (vault {self.op.vault}); found {len(items)}")
        [(fp, (title, fields))] = self._held().items()
        passphrase = fields.get("password")
        if not passphrase:
            raise KeysError(f"The 1Password item {title} has no password field: fix the item")
        pkcs8 = base64.b64decode(fields["private_key"])
        return fp, pkcs8, sealing.spki_of(pkcs8), passphrase

    def rotate(self, upload: Upload | None) -> str:
        self.ensure_synced()
        self.pull()
        ring = self.keyring()
        repo = read_repo_keys(self.public_json)
        assert repo.current is not None
        passphrase = self.passphrase()
        old = repo.current
        pkcs8, spki = sealing.generate()
        fp = sealing.fingerprint(spki)
        self._create_key_item(pkcs8, fp, passphrase)
        write_public_files(self.public_json, self.public_ts, (fp, spki),
                           [(k, repo.spki[k]) for k in (old, *repo.previous)])
        self._remember(fp, pkcs8)
        self.out(f"Rotated to the notes key {display(fp)}; the earlier keys are kept.")
        sent = self._send(upload, {fp: pkcs8, **ring}, passphrase, first=False)
        self._retitle_previous(old)
        if not sent:
            raise NotUploaded(f"Rotated to {display(fp)}; the keyring was not uploaded")
        return fp

    def _retitle_previous(self, old: str) -> None:
        """Marking the old item "(previous)" is cosmetic: a failure is a warning, never a failed rotation."""
        item_id = old
        try:
            item = self._item(old)
            item_id = item["id"]
            title = item.get("title") or KEY_TITLE + old[:16]
            if not title.endswith(PREVIOUS_SUFFIX):
                self.op.retitle(item_id, title + PREVIOUS_SUFFIX)
        except Exception as e:  # noqa: BLE001
            self.out(f"Could not retitle the old 1Password item ({e}): retitle it by hand, adding{PREVIOUS_SUFFIX}: {item_id}")

    def upload_keyring(self, upload: Upload) -> int:
        ring = self.keyring()
        upload(sealing.lock_keyring(ring, self.passphrase()))
        self._record_upload(list(ring))
        return len(ring)
