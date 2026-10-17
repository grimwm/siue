"""Where the tool reads and writes. Every function that depends on the environment takes it as an argument."""
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


def public_keys_path(env: Mapping[str, str]) -> Path:
    return Path(env["SIUE_MUSIC_PUBLIC_KEYS"]) if env.get("SIUE_MUSIC_PUBLIC_KEYS") else site_dir() / "music" / "keys" / "public.json"


def public_key_ts_path(env: Mapping[str, str]) -> Path:
    return Path(env["SIUE_MUSIC_PUBLIC_KEY_TS"]) if env.get("SIUE_MUSIC_PUBLIC_KEY_TS") else site_dir() / "games" / "workroom" / "src" / "public-key.ts"


def glossary_path() -> Path:
    return site_dir() / "games" / "workroom" / "src" / "glossary.json"


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
    if resolved == root or root in resolved.parents:
        raise NotesInsideRepo(f"{resolved} is inside the repository {root}: opened notes must never be committed; "
                              "set SIUE_MUSIC_NOTES_DIR to a folder outside it")
