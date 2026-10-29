"""What the MCP server's tools do, for an AI working on the owner's computer: list the pieces, read a score, publish a
draft, pick up and read the owner's notes, and wait for notes. Keys, sealing and refusals are the ones `make
music-publish` and `make music-pickup` use. No answer carries a key, and nothing here can delete."""
import asyncio
import json
import math
import re
import sys
import time
from pathlib import Path
from typing import Awaitable, Callable, Mapping

from . import paths
from .answering import Steps, default_steps
from .api import ApiError
from .keys import PICKUP_KEY, PUBLISH_KEY
from .pickup import GENERAL_PIECE, pickup
from .publish import DRAFT_FILES, PublishError, latest_version, publish
from .score import ID_RE, glossary_ids, validate

_VERSION_DIR = re.compile(r"v([1-9][0-9]*)")
_NOTE_DIR = re.compile(r"\d{4}-\d{2}-\d{2}-([0-9a-f]{32})")
_BODY_FIELDS = ("kind", "piece", "draft", "from", "to", "fromBar", "toBar", "lane", "text", "reaction", "curve", "audio", "made")


class WorkroomError(Exception):
    """A refusal or failure the AI is told in words."""


def _stderr(line: str) -> None:
    print(line, file=sys.stderr)


class Workroom:
    MAX_WAIT_SECONDS = 3600
    MAX_NOTES_READ = 200

    def __init__(self, env: Mapping[str, str], home: Path | None = None, keys: Callable[[], object] | None = None,
                 make_api: Callable[[str, str], object] | None = None, pieces: Path | None = None, notes: Path | None = None,
                 repo: Path | None = None, steps: Steps | None = None, glossary: frozenset[str] | None = None,
                 sleep: Callable[[float], Awaitable[None]] = asyncio.sleep, clock: Callable[[], float] = time.monotonic):
        from . import cli  # the command line's own key and API builders, so both read 1Password the same way
        self.env = env
        self.home = home if home is not None else Path.home()
        self._keys = keys or (lambda: cli.build_keys(env, out=_stderr))
        self._make_api = make_api or cli.make_api
        self._pieces = pieces
        self._notes = notes
        self._repo = repo
        self._steps = steps
        self._glossary = glossary
        self._sleep = sleep
        self._clock = clock

    # where things are

    def base(self) -> str:
        return paths.api_base(self.env, self.home)

    def pieces_dir(self) -> Path:
        return self._pieces if self._pieces is not None else paths.pieces_dir()

    def notes_dir(self) -> Path:
        return self._notes if self._notes is not None else paths.notes_dir(sys.platform, self.env, self.home)

    def _api(self, name: str, rerun: str):
        return self._make_api(self.base(), self._keys().api_key(name, rerun))

    # pieces and drafts

    def list_pieces(self) -> dict:
        """The drafts published on the server (newest first) and the drafts in the local pieces folder."""
        published, problem = [], None
        try:
            published = self._api(PUBLISH_KEY, "make music-publish").drafts()
        except ApiError as e:
            problem = f"the server's list of published drafts could not be read: {e}"
        local = []
        root = self.pieces_dir()
        for piece in sorted(p for p in root.iterdir() if p.is_dir() and ID_RE.fullmatch(p.name)) if root.is_dir() else []:
            drafts = []
            for folder in sorted((d for d in piece.iterdir() if d.is_dir() and _VERSION_DIR.fullmatch(d.name)), key=lambda d: int(d.name[1:])):
                drafts.append({"version": int(folder.name[1:]), "folder": str(folder),
                               "files": sorted(n for n in DRAFT_FILES if (folder / n).is_file())})
            local.append({"piece": piece.name, "drafts": drafts})
        return {"server": self.base(), "published": published, "published_error": problem, "pieces_folder": str(root), "local": local}

    def _draft_folder(self, piece: str, version: int | None) -> tuple[Path, int]:
        if not (isinstance(piece, str) and ID_RE.fullmatch(piece)):
            raise WorkroomError(f"{piece!r} is not a piece id (lowercase letters, digits and hyphens)")
        piece_dir = self.pieces_dir() / piece
        if version is None:
            try:
                version = latest_version(piece_dir)
            except PublishError as e:
                raise WorkroomError(str(e)) from None
        if isinstance(version, bool) or not isinstance(version, int) or version < 1:
            raise WorkroomError(f"{version!r} is not a draft version")
        folder = piece_dir / f"v{version}"
        if not (folder / "score.json").is_file():
            raise WorkroomError(f"there is no {folder / 'score.json'}")
        return folder, version

    def read_score(self, piece: str, version: int | None = None) -> dict:
        """A local draft's score.json (the newest draft when no version is given), with what publish would refuse in it."""
        folder, version = self._draft_folder(piece, version)
        path = folder / "score.json"
        try:
            score = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as e:
            raise WorkroomError(f"{path} could not be read: {e}") from None
        return {"piece": piece, "version": version, "path": str(path), "score": score, "problems": validate(score, self.glossary())}

    def glossary(self) -> frozenset[str]:
        return self._glossary if self._glossary is not None else glossary_ids(paths.glossary_path())

    def publish_draft(self, piece: str, version: int | None = None) -> dict:
        """Publishes a local draft as `make music-publish PIECE= VERSION=` does, with the same checks and refusals."""
        rerun = f"make music-publish PIECE={piece}" + (f" VERSION={version}" if version is not None else "")
        keys = self._keys()
        keys.ensure_synced()
        api = self._make_api(self.base(), keys.api_key(PUBLISH_KEY, rerun))
        try:
            done = publish(piece, version, self.pieces_dir(), api, self.glossary())
        except PublishError as e:
            raise WorkroomError(str(e)) from None
        return {"piece": piece, "version": done, "published": True, "server": self.base()}

    # notes

    def pick_up_notes(self) -> dict:
        """Downloads, opens and saves every waiting note, then marks each picked up, as `make music-pickup` does."""
        keys = self._keys()
        ring = keys.ensure_synced()
        notes = self.notes_dir()
        api = self._make_api(self.base(), keys.api_key(PICKUP_KEY, "make music-pickup"))
        report = pickup(api, ring, notes, self._repo if self._repo is not None else paths.repo_root(), self._steps or default_steps())
        picked = set(report.picked)
        return {"picked_up": len(report.picked), "notes_folder": str(notes),
                "notes": [n for n in self._saved_notes(notes) if n["id"] in picked],
                "left": dict(report.left), "notices": list(report.notices)}

    def read_notes(self, limit: int = 20, piece: str | None = None) -> dict:
        """The notes already picked up onto this computer, newest first."""
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= self.MAX_NOTES_READ:
            raise WorkroomError(f"limit must be a whole number from 1 to {self.MAX_NOTES_READ}")
        notes = self.notes_dir()
        found = [n for n in self._saved_notes(notes) if piece is None or n["piece"] == piece]
        return {"notes_folder": str(notes), "notes": found[:limit]}

    def _saved_notes(self, notes: Path) -> list[dict]:
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
            out.append(self._note(folder, record, body))
        out.sort(key=lambda n: (n["arrived_at"], n["id"]), reverse=True)
        return out

    @staticmethod
    def _note(folder: Path, record: dict, body: dict) -> dict:
        """A saved note as data: what the owner wrote, reacted, drew or recorded, where in the piece, and the paths of its
        files (the recording, its transcript, the hum's MIDI). The key fingerprint it was sealed to stays on disk."""
        files = {"note": str(folder / "note.json")}
        for audio in sorted(folder.glob("audio.*")):
            files["audio"] = str(audio)
        transcript = None
        if (folder / "transcript.txt").is_file():
            files["transcript"] = str(folder / "transcript.txt")
            transcript = (folder / "transcript.txt").read_text(encoding="utf-8").strip()
        if (folder / "motif.mid").is_file():
            files["motif_midi"] = str(folder / "motif.mid")
        arrived = record.get("arrived_at")
        return {"id": record["id"], "arrived_at": arrived if isinstance(arrived, int) else 0, "folder": str(folder),
                "general": body.get("piece") == GENERAL_PIECE, **{k: body.get(k) for k in _BODY_FIELDS},
                "transcript": transcript, "files": files}

    async def wait_for_notes(self, timeout_seconds: float, poll_seconds: float | None = None,
                             on_poll: Callable[[float, float], object] | None = None) -> dict:
        """Asks the server for waiting notes every poll_seconds until one is waiting or timeout_seconds pass. Only lists:
        nothing is downloaded or marked."""
        if isinstance(timeout_seconds, bool) or not isinstance(timeout_seconds, (int, float)) or not math.isfinite(timeout_seconds) \
                or not 0 <= timeout_seconds <= self.MAX_WAIT_SECONDS:
            raise WorkroomError(f"timeout_seconds must be from 0 to {self.MAX_WAIT_SECONDS}")
        if poll_seconds is None:
            poll = paths.poll_seconds(self.env, self.home)
        elif isinstance(poll_seconds, bool) or not isinstance(poll_seconds, (int, float)) or not math.isfinite(poll_seconds):
            raise WorkroomError("poll_seconds must be a number of seconds")
        else:
            poll = max(float(poll_seconds), paths.MIN_POLL_SECONDS)
        api = self._api(PICKUP_KEY, "make music-pickup")
        started = self._clock()
        while True:
            listed = await asyncio.to_thread(api.waiting)
            waited = self._clock() - started
            if listed:
                return {"waiting": len(listed), "timed_out": False, "waited_seconds": round(waited, 1),
                        "notes": [{"id": n.get("id"), "arrived_at": n.get("arrived_at"), "size": n.get("size")} for n in listed if isinstance(n, dict)],
                        "next": "call pick_up_notes to download, open and read them"}
            if on_poll is not None:
                done = on_poll(waited, float(timeout_seconds))
                if asyncio.iscoroutine(done):
                    await done
            left = timeout_seconds - waited
            if left <= 0:
                return {"waiting": 0, "timed_out": True, "waited_seconds": round(waited, 1), "notes": [],
                        "next": "no notes yet; call wait_for_notes again to keep waiting"}
            await self._sleep(min(poll, left))
