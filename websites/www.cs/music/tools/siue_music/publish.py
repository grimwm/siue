"""Publishing a draft: validate score.json as the page does, check the files are complete and fit the server's limit, then send."""
import json
import re
from pathlib import Path

from .api import MAX_REQUEST_BYTES, draft_size
from .score import ID_RE, validate

_VERSION_DIR = re.compile(r"v([1-9][0-9]*)")
DRAFT_FILES = ("score.json", "score.musicxml", "audio.webm", "audio.m4a", "spectrogram.png")


GENERAL_PIECE = "general"  # the front page's notes carry this piece id (games/workroom/src/note.ts)


class PublishError(Exception):
    pass


def latest_version(piece_dir: Path) -> int:
    found = [int(m.group(1)) for p in Path(piece_dir).glob("v*") if p.is_dir() and (m := _VERSION_DIR.fullmatch(p.name))]
    if not found:
        raise PublishError(f"no drafts (v1, v2, ...) in {piece_dir}")
    return max(found)


def publish(piece: str, version: int | None, pieces: Path, api, glossary_ids: frozenset[str], instrument_ids: frozenset[str] | None = None) -> int:
    if not ID_RE.fullmatch(piece):
        raise PublishError(f"{piece!r} is not a piece id (lowercase letters, digits and hyphens)")
    if piece == GENERAL_PIECE:
        raise PublishError(f"{piece!r} is the id of the workroom's general notes, so no piece can use it")
    pieces = Path(pieces)
    piece_dir = pieces / piece
    if version is None:
        version = latest_version(piece_dir)
    if not isinstance(version, int) or isinstance(version, bool) or version < 1:
        raise PublishError(f"{version!r} is not a draft version")
    folder = piece_dir / f"v{version}"
    for directory in (pieces, piece_dir, folder):
        if directory.is_symlink():
            raise PublishError(f"{directory} is a symbolic link; publish needs real folders")
    if (folder / "score.json").is_symlink():
        raise PublishError(f"{folder / 'score.json'} is a symbolic link; publish sends only regular files")
    try:
        score = json.loads((folder / "score.json").read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        raise PublishError(f"{folder / 'score.json'} could not be read: {e}") from None
    errors = validate(score, glossary_ids, instrument_ids)
    if errors:
        raise PublishError(f"score.json is not valid: {errors[0]}")
    if score["piece"]["id"] != piece or score["draft"] != version:
        raise PublishError(f"score.json says piece {score['piece']['id']} draft {score['draft']}, not {piece} v{version}")
    files = {}
    for name in DRAFT_FILES:
        path = folder / name
        if path.is_symlink():
            raise PublishError(f"{path} is a symbolic link; publish sends only regular files")
        if path.is_file():
            files[name] = path
    if score["kind"] == "music" and "score.musicxml" not in files:
        raise PublishError(f"a music draft needs score.musicxml, which {folder} lacks")
    if score["audio"]:  # a renderable score lists none: the page plays it from its sound and mix
        if "audio.webm" not in files and "audio.m4a" not in files:
            raise PublishError(f"{folder} has no audio.webm or audio.m4a")
    if score.get("spectrogram") is not None and "spectrogram.png" not in files:
        raise PublishError(f"{folder} has no spectrogram.png")
    size = draft_size(files)
    if size > MAX_REQUEST_BYTES:
        raise PublishError(f"the draft is {size} bytes, over the server's 8 MB limit for one draft")
    api.publish_draft(piece, version, files)
    return version
