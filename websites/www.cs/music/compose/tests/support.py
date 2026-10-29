"""Shared paths for the composing tests: the package, the workroom tool and the glossary."""
import sys
from pathlib import Path

COMPOSE = Path(__file__).resolve().parent.parent
MUSIC = COMPOSE.parent
GLOSSARY_JSON = MUSIC.parent / "games" / "workroom" / "src" / "glossary.json"
LIBRARY_JSON = MUSIC / "library" / "library.json"
for p in (COMPOSE, MUSIC / "tools"):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))
