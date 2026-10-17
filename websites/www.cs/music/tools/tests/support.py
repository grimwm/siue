"""Shared test world: a temporary repository with music/keys/public.json, the
fake op, a key cache, and a small pool of RSA-4096 test keys (made once per run)."""
import base64
import json
import os
import sys
import tempfile
from pathlib import Path
from unittest import mock

TOOLS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(TOOLS))

from siue_music import sealing  # noqa: E402
from siue_music.keys import Cache, Keys, KEY_TAG, WORKROOM_URL  # noqa: E402
from siue_music.op import Op  # noqa: E402

SITE = TOOLS.parents[1]
FIXTURES = SITE / "games" / "workroom" / "test" / "fixtures"
GLOSSARY_JSON = SITE / "games" / "workroom" / "src" / "glossary.json"
_POOL: list[tuple[str, bytes, bytes]] = []


def pool_key(i: int) -> tuple[str, bytes, bytes]:
    """(fingerprint, pkcs8, spki) of test key i, generated on first use."""
    while len(_POOL) <= i:
        pkcs8, spki = sealing.generate()
        _POOL.append((sealing.fingerprint(spki), pkcs8, spki))
    return _POOL[i]


class World:
    def __init__(self, case):
        tmp = tempfile.TemporaryDirectory()
        case.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.repo = self.root / "repo"
        (self.repo / "music" / "keys").mkdir(parents=True)
        (self.repo / "games" / "workroom" / "src").mkdir(parents=True)
        self.public_json = self.repo / "music" / "keys" / "public.json"
        self.public_ts = self.repo / "games" / "workroom" / "src" / "public-key.ts"
        self.log = self.root / "op.log"
        env = mock.patch.dict(os.environ, {"FAKE_OP_LOG": str(self.log), "FAKE_OP_STORE": str(self.root / "op.json")})
        env.start()
        case.addCleanup(env.stop)
        self.op = Op("SIUE", exe=(sys.executable, str(TOOLS / "tests" / "fake_op.py")))
        self.cache = Cache(self.root / "config" / "siue" / "music.json")
        self.out: list[str] = []
        self.keys = Keys(self.op, self.cache, self.public_json, self.public_ts, out=self.out.append)
        self.spki: dict[str, bytes] = {}

    def op_calls(self) -> list[list[str]]:
        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def clear_op_log(self) -> None:
        self.log.unlink(missing_ok=True)

    def add_key_to_op(self, i: int, passphrase: str = "a test passphrase", private_key: bytes | None = None) -> str:
        fp, pkcs8, spki = pool_key(i)
        self.spki[fp] = spki
        self.op.create(f"SIUE music notes key {fp[:16]}", "PASSWORD", [KEY_TAG], [
            {"id": "password", "type": "CONCEALED", "purpose": "PASSWORD", "label": "password", "value": passphrase},
            {"id": "private_key", "type": "CONCEALED", "label": "private_key", "value": base64.b64encode(private_key or pkcs8).decode()},
            {"id": "fingerprint", "type": "STRING", "label": "fingerprint", "value": fp},
        ], urls=[WORKROOM_URL])
        return fp

    def write_repo(self, current: str, previous: tuple[str, ...] = ()) -> None:
        for fp in (current, *previous):
            if fp not in self.spki:
                self.spki[fp] = next(s for f, _, s in _POOL if f == fp)
        entry = lambda fp: {"fingerprint": fp, "spki": base64.b64encode(self.spki[fp]).decode()}  # noqa: E731
        self.public_json.write_text(json.dumps({"schema": 1, "current": entry(current), "previous": [entry(p) for p in previous]}))
