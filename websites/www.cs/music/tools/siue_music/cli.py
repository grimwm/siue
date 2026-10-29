"""siue-music's command line. Every location comes from the env it is given."""
import getpass
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path
from typing import Mapping, Sequence

from . import paths
from .api import Api, ApiError
from .keys import PICKUP_KEY, PUBLISH_KEY, NotUploaded, Cache, Keys, KeyMismatch, KeysError
from .answering import default_steps
from .op import Op, OpError
from .paths import NotesInsideRepo
from .pickup import pickup
from .publish import GENERAL_PIECE, PublishError, publish
from .score import ID_RE, glossary_ids
from .setup import Setup

USAGE = """usage: siue-music setup
       siue-music keys status|pull|forget|rotate
       siue-music pickup
       siue-music publish PIECE [--version N]
       siue-music delete PIECE VERSION   (deletes that one published draft from the server)
       siue-music api-key-set NAME   (the key is read from the terminal, or one line of stdin)"""


_VERSION = re.compile(r"[1-9][0-9]{0,3}")  # 1 to 9999, as the server accepts


def build_keys(env: Mapping[str, str], out=print) -> Keys:
    op = Op(env.get("OP_VAULT") or "SIUE", exe=tuple(shlex.split(env.get("SIUE_OP") or "op")))
    cache = Cache(paths.config_dir(env, Path.home()) / "music.json")
    return Keys(op, cache, out=out, base=paths.api_base(env))


def make_api(base: str, key: str) -> Api:
    return Api(base, key)


def publisher(keys: Keys, env: Mapping[str, str], rerun: str | None = None):
    """The server as the music-publish API key in 1Password sees it."""
    return make_api(paths.api_base(env), keys.api_key(PUBLISH_KEY, rerun))


def open_browser(url: str) -> bool:
    """Opens the address in the default browser (`open` on macOS, `xdg-open` elsewhere); False when it cannot."""
    exe = "open" if sys.platform == "darwin" else "xdg-open"
    try:
        return subprocess.run([exe, url], capture_output=True, timeout=30).returncode == 0
    except (OSError, subprocess.SubprocessError):
        return False


def read_secret(prompt: str) -> str:
    if sys.stdin.isatty():
        return getpass.getpass(prompt)
    line = sys.stdin.readline()
    if line == "":
        raise EOFError
    return line.strip()


def main(argv: Sequence[str], env: Mapping[str, str] = os.environ) -> int:
    args = list(argv)
    try:
        keys = build_keys(env)
        if args == ["setup"]:
            return Setup(keys, lambda secret: make_api(paths.api_base(env), secret), read_secret, open_browser, out=print).run_all()
        if args[:1] == ["keys"] and args[1:2] in (["status"], ["pull"], ["forget"]) and len(args) == 2:
            if args[1] == "status":
                return keys.status(lambda secret: make_api(paths.api_base(env), secret))
            if args[1] == "pull":
                keys.pull_checked()
                keys.out("Pulled the keys from 1Password.")
            else:
                keys.forget()
            return 0
        if args == ["keys", "rotate"]:
            try:
                api = publisher(keys, env, None)
            except (KeysError, ApiError):
                api = None
            keys.rotate(api)
            return 0
        if args == ["pickup"]:
            ring = keys.ensure_synced()
            notes = paths.notes_dir(sys.platform, env, Path.home())
            api = make_api(paths.api_base(env), keys.api_key(PICKUP_KEY, "make music-pickup"))
            report = pickup(api, ring, notes, paths.repo_root(), default_steps())
            general = f" ({len(report.general)} general)" if report.general else ""
            print(f"Picked up {len(report.picked)} note{'' if len(report.picked) == 1 else 's'}{general} into {notes}.")
            for note_id, why in report.left.items():
                print(f"Left {note_id}: {why}")
            for notice in report.notices:
                print(notice)
            return 1 if report.left else 0
        if args[:1] == ["publish"] and len(args) in (2, 4) and (len(args) == 2 or (args[2] == "--version" and args[3].isdecimal())):
            version = int(args[3]) if len(args) == 4 else None
            keys.ensure_synced()
            api = make_api(paths.api_base(env), keys.api_key(PUBLISH_KEY, f"make music-publish PIECE={args[1]}"))
            done = publish(args[1], version, paths.pieces_dir(), api, glossary_ids(paths.glossary_path()))
            print(f"Published {args[1]} v{done}.")
            return 0
        if args[:1] == ["delete"] and len(args) == 3:
            piece, version = args[1], args[2]
            if not ID_RE.fullmatch(piece) or piece == GENERAL_PIECE:
                print(f"{piece!r} is not a piece id (lowercase letters, digits and hyphens)", file=sys.stderr)
                return 1
            if not _VERSION.fullmatch(version):
                print(f"{version!r} is not a draft version (1 to 9999)", file=sys.stderr)
                return 1
            api = make_api(paths.api_base(env), keys.api_key(PUBLISH_KEY, f"make music-delete PIECE={piece} VERSION={version}"))
            api.delete_draft(piece, int(version))
            print(f"Deleted {piece} v{version}.")
            return 0
        if args[:1] == ["api-key-set"] and len(args) == 2:
            try:
                secret = read_secret("API key (shown once on the hub): ")
            except EOFError:
                print("No key was given on standard input.", file=sys.stderr)
                return 1
            keys.api_key_set(args[1], secret)
            return 0
    except KeyMismatch as e:
        print(str(e), file=sys.stderr)
        return 3
    except NotUploaded as e:
        print(str(e), file=sys.stderr)
        return 4
    except (KeysError, OpError, ApiError, NotesInsideRepo, PublishError) as e:
        print(str(e), file=sys.stderr)
        return 1
    print(USAGE, file=sys.stderr)
    return 2
