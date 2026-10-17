"""Python and the page speak one format: the browser-made fixtures open here."""
import base64
import json
import unittest

from support import FIXTURES, pool_key
from siue_music import sealing


class SealingTest(unittest.TestCase):
    def setUp(self):
        self.fx = json.loads((FIXTURES / "test-key.json").read_text())
        self.pkcs8 = base64.b64decode(self.fx["pkcs8"])
        self.ring = {self.fx["fingerprint"]: self.pkcs8}

    def test_opens_what_the_browser_sealed(self):
        text = sealing.open_bundle((FIXTURES / "note-text.sealed").read_bytes(), self.ring)
        self.assertEqual(text.body["text"], "Fixture note: louder at bar 33")
        hum = sealing.open_bundle((FIXTURES / "note-hum.sealed").read_bytes(), self.ring)
        self.assertEqual((hum.body["kind"], len(hum.audio)), ("hum", 2048))

    def test_unlocks_what_the_browser_locked(self):
        other = base64.b64decode(self.fx["other"]["pkcs8"])
        ring = sealing.unlock_keyring(self.fx["keyring"], self.fx["passphrase"])
        self.assertEqual(ring, {self.fx["fingerprint"]: self.pkcs8, self.fx["other"]["fingerprint"]: other})
        self.assertEqual(list(ring), [self.fx["fingerprint"], self.fx["other"]["fingerprint"]], "current first")
        with self.assertRaises(sealing.WrongPassphrase):
            sealing.unlock_keyring(self.fx["keyring"], "wrong")

    def test_a_keyring_round_trips_in_order(self):
        (fp0, pkcs0, _), (fp1, pkcs1, _) = pool_key(0), pool_key(1)
        locked = sealing.lock_keyring({fp1: pkcs1, fp0: pkcs0}, "a test passphrase")
        self.assertEqual(set(locked), {"v", "kdf", "iterations", "salt", "iv", "ct"})
        self.assertEqual(list(sealing.unlock_keyring(locked, "a test passphrase").items()), [(fp1, pkcs1), (fp0, pkcs0)])

    def test_round_trip_and_tampering(self):
        fp, pkcs8, spki = pool_key(0)
        bundle = sealing.seal({"v": 1, "kind": "text", "text": "hi"}, b"", spki)
        self.assertEqual(sealing.open_bundle(bundle, {fp: pkcs8}).body["text"], "hi")
        bad = bytearray(bundle)
        bad[-1] ^= 1
        for blob, reason in ((bytes(bad), "tampered"), (bundle[:20], "format"), (bundle, "unknown-key")):
            with self.assertRaises(sealing.NoteUnreadable) as e:
                sealing.open_bundle(blob, {fp: pkcs8} if reason != "unknown-key" else {})
            self.assertEqual(e.exception.reason, reason)

    def test_weak_or_malformed_keyrings_are_refused(self):
        for bad in ({"iterations": 1000}, {"v": 2}, {"kdf": "scrypt"}, {"salt": "AAAA"}, {"iv": "AAAA"}, {"ct": ""}):
            with self.assertRaises(sealing.KeyringInvalid, msg=str(bad)):
                sealing.unlock_keyring({**self.fx["keyring"], **bad}, self.fx["passphrase"])


if __name__ == "__main__":
    unittest.main()
