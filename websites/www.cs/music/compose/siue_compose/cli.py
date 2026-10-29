"""python3 -m siue_compose.cli render <piece> <version>: compose, render, check and validate one draft."""
import importlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from .render import render
from .samples import fetch

COMPOSE = Path(__file__).resolve().parent.parent
MUSIC = COMPOSE.parent
sys.path.insert(0, str(MUSIC / "tools"))
sys.path.insert(0, str(COMPOSE))

from siue_music.api import MAX_REQUEST_BYTES  # noqa: E402
from siue_music.publish import DRAFT_FILES  # noqa: E402
from siue_music.score import glossary_ids, validate  # noqa: E402

GLOSSARY = MUSIC.parent / "games" / "workroom" / "src" / "glossary.json"


def main(argv: list[str]) -> int:
    if len(argv) != 3 or argv[0] != "render" or not argv[2].isdigit() or int(argv[2]) < 1:
        print("usage: siue_compose.cli render <piece> <version>", file=sys.stderr)
        return 2
    piece_id, draft = argv[1], int(argv[2])
    module = importlib.import_module(f"pieces.{piece_id.replace('-', '_')}")
    piece = module.compose(draft)
    if piece.piece_id != piece_id:
        print(f"pieces/{piece_id.replace('-', '_')}.py composes {piece.piece_id}, not {piece_id}", file=sys.stderr)
        return 1
    manifest = json.loads((COMPOSE / "samples.json").read_text())
    root = fetch(manifest)[piece.lanes[0].instrument]
    out = MUSIC / "pieces" / piece_id / f"v{draft}"
    made = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    problems = render(piece, draft, out, manifest, root, made, getattr(module, "CHANGES", {}).get(draft))
    problems += validate(json.loads((out / "score.json").read_text()), glossary_ids(GLOSSARY))
    size = sum((out / f).stat().st_size for f in DRAFT_FILES if (out / f).is_file())
    if size > MAX_REQUEST_BYTES:
        problems.append(f"the draft is {size} bytes, over the 8 MB limit")
    print(f"{out}: {piece.duration:.1f} s, {size / 1e6:.1f} MB")
    for p in problems:
        print(f"  problem: {p}", file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
