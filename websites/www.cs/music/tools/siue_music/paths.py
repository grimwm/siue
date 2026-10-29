"""Where the tool reads and writes. Every function that depends on the environment takes it as an argument."""
import json
import math
import os
import subprocess
from pathlib import Path
from typing import Mapping

DEFAULT_BASE = "https://www.cs.siue.edu/~wgrim/music/"  # used only when neither SIUE_MUSIC_BASE nor music-config.json names one
CONFIG_FILE = "music-config.json"
DEFAULT_POLL_SECONDS = 10.0
MIN_POLL_SECONDS = 2.0  # the server counts 60 API calls a minute per key


class BadConfig(Exception):
    """music-config.json is not a JSON object of the settings it may hold, or a setting in the environment is malformed."""


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


def library_path() -> Path:
    return site_dir() / "music" / "library" / "library.json"


def pieces_dir() -> Path:
    return site_dir() / "music" / "pieces"


def config_dir(env: Mapping[str, str], home: Path) -> Path:
    return Path(env["SIUE_CONFIG_DIR"]) if env.get("SIUE_CONFIG_DIR") else home / ".config" / "siue"


def settings(env: Mapping[str, str], home: Path | None) -> dict:
    """music-config.json in the config folder: {"base": the workroom's music/ address, "poll_seconds": how often the MCP
    server asks for notes}, both optional. {} when there is no file, or no home and no SIUE_CONFIG_DIR to find it by."""
    if home is None and not env.get("SIUE_CONFIG_DIR"):
        return {}
    path = config_dir(env, home or Path.home()) / CONFIG_FILE
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return {}
    except (OSError, ValueError) as e:
        raise BadConfig(f"{path} could not be read: {e}") from None
    if not isinstance(data, dict):
        raise BadConfig(f"{path} must hold a JSON object, like {{\"base\": \"https://example.org/music/\"}}")
    if "base" in data and not (isinstance(data["base"], str) and data["base"]):
        raise BadConfig(f"{path}: base must be the workroom's music/ address as a string")
    poll = data.get("poll_seconds")
    if poll is not None and (isinstance(poll, bool) or not isinstance(poll, (int, float))):
        raise BadConfig(f"{path}: poll_seconds must be a number of seconds")
    return data


def api_base(env: Mapping[str, str], home: Path | None = None) -> str:
    """SIUE_MUSIC_BASE, else "base" in music-config.json, else DEFAULT_BASE."""
    return env.get("SIUE_MUSIC_BASE") or settings(env, home).get("base") or DEFAULT_BASE


def poll_seconds(env: Mapping[str, str], home: Path | None = None) -> float:
    """How often the MCP server asks for waiting notes: SIUE_MUSIC_POLL_SECONDS, else "poll_seconds" in
    music-config.json, else DEFAULT_POLL_SECONDS; never more often than MIN_POLL_SECONDS."""
    raw = env.get("SIUE_MUSIC_POLL_SECONDS")
    if raw:
        try:
            value = float(raw)
        except ValueError:
            raise BadConfig(f"SIUE_MUSIC_POLL_SECONDS must be a number of seconds, not {raw!r}") from None
    else:
        poll = settings(env, home).get("poll_seconds")
        value = DEFAULT_POLL_SECONDS if poll is None else poll
    if not math.isfinite(value):
        raise BadConfig("the poll interval must be a finite number of seconds")
    return max(float(value), MIN_POLL_SECONDS)


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
