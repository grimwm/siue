"""Shared test world: the fake op, a key cache, a fake server, and a small pool of RSA-4096 test keys (made once per run)."""
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
from siue_music.keys import Cache, Keys, KEY_TAG, PREVIOUS_SUFFIX, WORKROOM_URL  # noqa: E402
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
        self.log = self.root / "op.log"
        env = mock.patch.dict(os.environ, {"FAKE_OP_LOG": str(self.log), "FAKE_OP_STORE": str(self.root / "op.json")})
        env.start()
        case.addCleanup(env.stop)
        self.op = Op("SIUE", exe=(sys.executable, str(TOOLS / "tests" / "fake_op.py")))
        self.cache = Cache(self.root / "config" / "siue" / "music.json")
        self.out: list[str] = []
        self.keys = Keys(self.op, self.cache, out=self.out.append)

    def op_calls(self) -> list[list[str]]:
        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def clear_op_log(self) -> None:
        self.log.unlink(missing_ok=True)

    def add_key_to_op(self, i: int, passphrase: str = "a test passphrase", private_key: bytes | None = None, previous: bool = False) -> str:
        """A notes key item in 1Password, titled as the tool titles it (plus " (previous)" when `previous`)."""
        fp, pkcs8, _ = pool_key(i)
        self.op.create(f"SIUE music notes key {fp[:16]}" + (PREVIOUS_SUFFIX if previous else ""), "PASSWORD", [KEY_TAG], [
            {"id": "password", "type": "CONCEALED", "purpose": "PASSWORD", "label": "password", "value": passphrase},
            {"id": "private_key", "type": "CONCEALED", "label": "private_key", "value": base64.b64encode(private_key or pkcs8).decode()},
            {"id": "fingerprint", "type": "STRING", "label": "fingerprint", "value": fp},
        ], urls=[WORKROOM_URL])
        return fp


class ServerApi:
    """The workroom's API as one API key sees it: `scopes` maps each scope to what holds() answers, and the keyring
    route keeps what is posted."""

    def __init__(self, scopes: dict[str, str] | None = None):
        self.scopes = scopes or {"notes:pickup": "yes", "keys:publish": "yes", "drafts:publish": "yes", "drafts:delete": "yes"}
        self.uploads: list[dict] = []  # {"keyring", "current", "previous"} per call
        self.stored: dict | None = None

    def holds(self, scope: str) -> str:
        return self.scopes[scope]

    def publish_keyring(self, locked: dict, current: str, previous: list[str]) -> None:
        self.uploads.append({"keyring": locked, "current": current, "previous": list(previous)})
        self.stored = {"current": current, "previous": list(previous), "uploaded_at": 1}

    def keyring_fingerprints(self) -> dict | None:
        return self.stored
