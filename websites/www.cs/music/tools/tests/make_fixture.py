"""Writes games/workroom/test/fixtures/keyring-by-python.json: the TEST keys
from test-key.json (current, then the earlier one) locked in one keyring by
Python, so the page's tests prove they unlock what the tool uploads. Rerun only
after tools/make-fixtures.ts replaces the test keys."""
import base64
import json

from support import FIXTURES
from siue_music import sealing

fx = json.loads((FIXTURES / "test-key.json").read_text())
keys = {fx["fingerprint"]: base64.b64decode(fx["pkcs8"]), fx["other"]["fingerprint"]: base64.b64decode(fx["other"]["pkcs8"])}
locked = sealing.lock_keyring(keys, fx["passphrase"])
(FIXTURES / "keyring-by-python.json").write_text(json.dumps(locked, indent=2) + "\n")
print("wrote keyring-by-python.json")
