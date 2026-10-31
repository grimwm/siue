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


class Siuen2Test(unittest.TestCase):
    """SIUEN2: the note the page seals to the person and their paired AI keys (seal.ts sealTo)."""

    def setUp(self):
        self.fx = json.loads((FIXTURES / "test-key.json").read_text())

    def test_opens_what_the_browser_sealed_to_two_keys_with_either(self):
        bundle = (FIXTURES / "siuen2-note.bin").read_bytes()
        self.assertEqual(sealing.recipients(bundle), [self.fx["fingerprint"], self.fx["other"]["fingerprint"]])
        for key in (self.fx, self.fx["other"]):
            opened = sealing.open_bundle(bundle, {key["fingerprint"]: base64.b64decode(key["pkcs8"])})
            self.assertEqual((opened.fingerprint, opened.body["text"]), (key["fingerprint"], "sealed to the person and an AI"))
        with self.assertRaises(sealing.NoteUnreadable) as e:
            sealing.open_bundle(bundle, {})
        self.assertEqual(e.exception.reason, "unknown-key")

    def test_seal_to_round_trips_and_a_changed_header_does_not_open(self):
        (fp_a, pkcs8_a, spki_a), (fp_b, pkcs8_b, spki_b) = pool_key(0), pool_key(1)
        body = {"v": 1, "kind": "text", "text": "hi"}
        bundle = sealing.seal_to(body, b"\x01\x02", [spki_a, spki_b])
        self.assertEqual(sealing.recipients(bundle), [fp_a, fp_b])
        self.assertEqual(sealing.open_bundle(bundle, {fp_b: pkcs8_b}).audio, b"\x01\x02")
        edited = bytearray(bundle)
        edited[7] ^= 1  # the first fingerprint, part of the additional data
        with self.assertRaises(sealing.NoteUnreadable) as e:
            sealing.open_bundle(bytes(edited), {fp_b: pkcs8_b})
        self.assertEqual(e.exception.reason, "tampered")
        for bad in (bundle[:60], b"SIUEN2\x00" + bundle[7:], b"SIUEN2\x11" + bundle[7:]):
            self.assertIsNone(sealing.recipients(bad))
        with self.assertRaises(ValueError):
            sealing.seal_to(body, b"", [spki_a, spki_a])
