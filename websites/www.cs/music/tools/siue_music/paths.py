"""Where the tool reads and writes. Every function that depends on the environment takes it as an argument."""
import os
import subprocess
from pathlib import Path
from typing import Mapping

DEFAULT_BASE = "https://www.cs.siue.edu/~wgrim/music/"


class NotesInsideRepo(Exception):
    """The notes folder would be inside the repository, where opened notes could be committed."""


def repo_root() -> Path:
    out = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=Path(__file__).resolve().parent,
                         capture_output=True, text=True, check=True)
    return Path(out.stdout.strip())


def site_dir() -> Path:
    return repo_root() / "websites" / "www.cs"


def glossary_path() -> Path:
    return site_dir() / "games" / "workroom" / "src" / "glossary.json"


def pieces_dir() -> Path:
    return site_dir() / "music" / "pieces"


def config_dir(env: Mapping[str, str], home: Path) -> Path:
    return Path(env["SIUE_CONFIG_DIR"]) if env.get("SIUE_CONFIG_DIR") else home / ".config" / "siue"


def api_base(env: Mapping[str, str]) -> str:
    return env.get("SIUE_MUSIC_BASE") or DEFAULT_BASE


def notes_dir(platform: str, env: Mapping[str, str], home: Path) -> Path:
    if env.get("SIUE_MUSIC_NOTES_DIR"):
        return Path(env["SIUE_MUSIC_NOTES_DIR"])
    if platform == "darwin":
        return home / "Library" / "Application Support" / "siue-music" / "notes"
    if platform == "win32":
        base = Path(env["APPDATA"]) if env.get("APPDATA") else home / "AppData" / "Roaming"
        return base / "siue-music" / "notes"
    base = Path(env["XDG_DATA_HOME"]) if env.get("XDG_DATA_HOME") else home / ".local" / "share"
    return base / "siue-music" / "notes"


def check_outside(path: Path, repo: Path) -> None:
    resolved = path.resolve()
    root = repo.resolve()
    inside = resolved == root or root in resolved.parents
    if not inside:
        # A case-insensitive filesystem keeps the spelling it was given, so compare file identity too.
        for p in (resolved, *resolved.parents):
            try:
                if os.path.samefile(p, root):
                    inside = True
                    break
            except OSError:
                continue
    if inside:
        raise NotesInsideRepo(f"{resolved} is inside the repository {root}: opened notes must never be committed; "
                              "set SIUE_MUSIC_NOTES_DIR to a folder outside it")
