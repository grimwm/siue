"""Pickup: download each waiting note, check its hash, open it, save it under the notes folder, and only then mark it picked up."""
import hashlib
import json
import os
import re
import shutil
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Mapping

from .answering import MissingDependency, Steps
from .api import ApiError
from .paths import check_outside
from .sealing import NoteUnreadable, open_bundle

_NOTE_ID = re.compile(r"[0-9a-f]{32}")
_SHA256 = re.compile(r"[0-9a-f]{64}")
_AUDIO_MIMES = {"audio/webm": "webm", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/ogg": "ogg"}


@dataclass
class Report:
    picked: list[str] = field(default_factory=list)
    left: dict[str, str] = field(default_factory=dict)
    notices: list[str] = field(default_factory=list)


def _audio_extension(body: dict, audio: bytes) -> str | None:
    """The file extension for the note's audio, from its bytes first and its declared type second; None when neither is known."""
    if audio[:4] == b"\x1aE\xdf\xa3":
        return "webm"
    if audio[4:8] == b"ftyp":
        return "m4a"
    if audio[:4] == b"OggS":
        return "ogg"
    declared = body.get("audio")
    mime = declared.get("mime") if isinstance(declared, dict) else None
    return _AUDIO_MIMES.get(mime.split(";")[0].strip().lower()) if isinstance(mime, str) else None


def _write(path: Path, data: bytes) -> None:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "wb") as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())


def _sync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _arrival(n) -> int:
    value = n.get("arrived_at") if isinstance(n, dict) else None
    return value if isinstance(value, int) and not isinstance(value, bool) else 0


def _shape_problem(body: dict, audio: bytes) -> str | None:
    if body.get("audio") is not None and not isinstance(body["audio"], dict):
        return "its audio description is malformed"
    if body.get("text") is not None and not isinstance(body["text"], str):
        return "its text is malformed"
    if body["kind"] in ("speech", "hum") and not audio:
        return f"a {body['kind']} note without audio"
    return None


def pickup(api, keyring: Mapping[str, bytes], notes: Path, repo: Path, steps: Steps) -> Report:
    check_outside(notes, repo)
    report = Report()
    listed = api.waiting()
    for item in sorted(listed, key=_arrival):
        note_id = item.get("id") if isinstance(item, dict) else None
        if not (isinstance(note_id, str) and _NOTE_ID.fullmatch(note_id)):
            report.left[str(note_id)[:40]] = "the server listed an id that is not a note id; left waiting"
            continue
        try:
            _one(api, keyring, notes, steps, report, note_id, item)
        except ApiError as e:
            report.left[note_id] = f"{e}; left waiting"
        except OSError as e:
            report.left[note_id] = f"could not save it ({e}); left waiting"
    return report


def _one(api, keyring, notes: Path, steps: Steps, report: Report, note_id: str, item: dict) -> None:
    arrived, size, digest = item.get("arrived_at"), item.get("size"), item.get("sha256")
    if not (isinstance(arrived, int) and not isinstance(arrived, bool) and isinstance(size, int) and isinstance(digest, str) and _SHA256.fullmatch(digest)):
        report.left[note_id] = "the server's listing of it is malformed; left waiting"
        return
    try:
        day = datetime.fromtimestamp(arrived, timezone.utc).strftime("%Y-%m-%d")
    except (OverflowError, OSError, ValueError):
        report.left[note_id] = "the server's listing of it has an impossible arrival time; left waiting"
        return
    data = api.note(note_id)
    if len(data) != size or hashlib.sha256(data).hexdigest() != digest:
        report.left[note_id] = "download did not match its hash; left waiting"
        return
    try:
        opened = open_bundle(data, keyring)
    except NoteUnreadable as e:
        report.left[note_id] = f"could not open ({e.reason}); left waiting"
        return
    problem = _shape_problem(opened.body, opened.audio)
    ext = _audio_extension(opened.body, opened.audio) if opened.audio else None
    if problem is None and opened.audio and ext is None:
        problem = "its audio is in a format this tool does not know"
    if problem:
        report.left[note_id] = f"could not open ({problem}); left waiting"
        return

    final = notes / f"{day}-{note_id}"
    if not _saved(final, note_id):
        shutil.rmtree(final, ignore_errors=True)
        _save(notes, final, note_id, arrived, opened, ext)
    _derive(final, opened.body["kind"], ext, steps, report, note_id)
    api.mark_picked_up(note_id)
    report.picked.append(note_id)


def _saved(final: Path, note_id: str) -> bool:
    try:
        return json.loads((final / "note.json").read_text(encoding="utf-8")).get("id") == note_id
    except (OSError, ValueError, AttributeError):
        return False


def _save(notes: Path, final: Path, note_id: str, arrived: int, opened, ext: str | None) -> None:
    notes.mkdir(mode=0o700, parents=True, exist_ok=True)
    partial = final.with_name(final.name + ".partial")
    shutil.rmtree(partial, ignore_errors=True)
    partial.mkdir(mode=0o700)
    try:
        record = {"id": note_id, "arrived_at": arrived, "fingerprint": opened.fingerprint, "body": opened.body}
        _write(partial / "note.json", json.dumps(record, indent=2).encode("utf-8"))
        if ext:
            _write(partial / f"audio.{ext}", opened.audio)
        _sync_dir(partial)
        os.rename(partial, final)
        _sync_dir(notes)
    except BaseException:
        shutil.rmtree(partial, ignore_errors=True)
        raise


def _derive(folder: Path, kind: str, ext: str | None, steps: Steps, report: Report, note_id: str) -> None:
    """Speech and humming are extras on a note that is already safely on disk: a failure here is reported, never fatal."""
    if ext is None or kind not in ("speech", "hum"):
        return
    audio = folder / f"audio.{ext}"
    wanted = "transcript.txt" if kind == "speech" else "motif.mid"
    if (folder / wanted).exists():
        return
    try:
        if kind == "speech":
            _write(folder / "transcript.txt", (steps.transcribe(audio) + "\n").encode("utf-8"))
        else:
            steps.hum_to_midi(audio, folder / "motif.mid")
            os.chmod(folder / "motif.mid", 0o600)
    except MissingDependency as e:
        if str(e) not in report.notices:
            report.notices.append(str(e))
    except Exception as e:  # noqa: BLE001 - any step failure leaves the opened note in place
        report.notices.append(f"could not process {note_id}: {e}")
