"""siue-music's command line. Every location comes from the env it is given."""
import getpass
import os
import sys
from pathlib import Path
from typing import Mapping, Sequence

from . import paths
from .keys import Cache, Keys, KeyMismatch, KeysError
from .op import Op, OpError

USAGE = """usage: siue-music keys status|pull|forget
       siue-music api-key-set NAME   (the key is read from the terminal, or one line of stdin)"""


def build_keys(env: Mapping[str, str], out=print) -> Keys:
    op = Op(env.get("OP_VAULT") or "SIUE", exe=(env.get("SIUE_OP") or "op",))
    cache = Cache(paths.config_dir(env, Path.home()) / "music.json")
    return Keys(op, cache, paths.public_keys_path(env), paths.public_key_ts_path(env), out=out)


def read_secret(prompt: str) -> str:
    if sys.stdin.isatty():
        return getpass.getpass(prompt)
    return sys.stdin.readline().strip()


def main(argv: Sequence[str], env: Mapping[str, str] = os.environ) -> int:
    args = list(argv)
    try:
        keys = build_keys(env)
        if args[:1] == ["keys"] and args[1:2] in (["status"], ["pull"], ["forget"]) and len(args) == 2:
            if args[1] == "status":
                return keys.status()
            if args[1] == "pull":
                keys.pull_checked()
                keys.out("Pulled the keys from 1Password and checked them against the repository.")
            else:
                keys.forget()
            return 0
        if args[:1] == ["api-key-set"] and len(args) == 2:
            keys.api_key_set(args[1], read_secret("API key (shown once on the hub): "))
            return 0
    except KeyMismatch as e:
        print(str(e), file=sys.stderr)
        return 3
    except (KeysError, OpError) as e:
        print(str(e), file=sys.stderr)
        return 1
    print(USAGE, file=sys.stderr)
    return 2
