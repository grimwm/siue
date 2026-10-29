"""python3 -m siue_compose.cli render <piece> <version> [--cut <name>]: compose, render, check and validate one draft;
with --cut, mix the rendered draft's stems again as that cut (the piece's CUTS, or full) into cuts/<name>.webm and .m4a."""
import importlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from .cut import RenderError, cut_named
from .render import render, render_cut
from .samples import fetch

COMPOSE = Path(__file__).resolve().parent.parent
MUSIC = COMPOSE.parent
sys.path.insert(0, str(MUSIC / "tools"))
sys.path.insert(0, str(COMPOSE))

from siue_music.api import MAX_REQUEST_BYTES  # noqa: E402
from siue_music.publish import DRAFT_FILES  # noqa: E402
from siue_music.score import glossary_ids, library_ids, validate  # noqa: E402

GLOSSARY = MUSIC.parent / "games" / "workroom" / "src" / "glossary.json"
LIBRARY = MUSIC / "library" / "library.json"


def main(argv: list[str]) -> int:
    shape = len(argv) == 3 or (len(argv) == 5 and argv[3] == "--cut")
    if not shape or argv[0] != "render" or not argv[2].isdigit() or int(argv[2]) < 1:
        print("usage: siue_compose.cli render <piece> <version> [--cut <name>]", file=sys.stderr)
        return 2
    piece_id, draft = argv[1], int(argv[2])
    module = importlib.import_module(f"pieces.{piece_id.replace('-', '_')}")
    piece = module.compose(draft)
    if piece.piece_id != piece_id:
        print(f"pieces/{piece_id.replace('-', '_')}.py composes {piece.piece_id}, not {piece_id}", file=sys.stderr)
        return 1
    out = MUSIC / "pieces" / piece_id / f"v{draft}"
    cut = argv[4] if len(argv) == 5 else None
    if cut is not None:
        try:
            made = render_cut(piece, out, cut, cut_named(getattr(module, "CUTS", {}), cut))
        except RenderError as e:
            print(e, file=sys.stderr)
            return 1
        for path in made:
            print(f"{path}: {path.stat().st_size / 1e6:.1f} MB")
        return 0
    manifest = json.loads((COMPOSE / "samples.json").read_text())
    root = fetch(manifest)[piece.lanes[0].instrument]
    made = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    # A piece's SCORE_ONLY drafts keep only their score; the workroom builds their sound.
    problems = render(piece, draft, out, manifest, root, made, getattr(module, "CHANGES", {}).get(draft),
                      draft in getattr(module, "SCORE_ONLY", ()))
    if (out / "score.json").is_file():  # a score-only draft that breaks a check keeps none
        problems += validate(json.loads((out / "score.json").read_text()), glossary_ids(GLOSSARY), library_ids(LIBRARY))
    size = sum((out / f).stat().st_size for f in DRAFT_FILES if (out / f).is_file())
    if size > MAX_REQUEST_BYTES:
        problems.append(f"the draft is {size} bytes, over the 8 MB limit")
    print(f"{out}: {piece.duration:.1f} s, {size / 1e6:.1f} MB")
    for p in problems:
        print(f"  problem: {p}", file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
