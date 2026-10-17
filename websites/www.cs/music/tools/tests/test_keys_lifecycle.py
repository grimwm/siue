"""keys-init and keys-rotate: the pair and passphrase go to 1Password first,
the repository gets only public halves, the uploaded keyring opens with the
passphrase and holds the current key and every retained one, rotation keeps
the old keys and the passphrase and never drops one, a note sealed before a
rotation opens with the rotated keyring, and nothing secret reaches argv or
output."""
import base64
import json
import unittest

from support import World, pool_key
from siue_music import sealing
from siue_music.keys import KeyMismatch, KeysError


class LifecycleTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.uploads: list[dict] = []

    def item_fields(self):
        return [self.w.op.fields(i["id"]) for i in self.w.op.list_items("siue-music-key")]

    def test_init_saves_uploads_a_keyring_of_one_and_writes_only_public_halves(self):
        fp = self.w.keys.init(self.uploads.append)
        repo = json.loads(self.w.public_json.read_text())
        self.assertEqual(repo["current"]["fingerprint"], fp)
        self.assertEqual(sealing.fingerprint(base64.b64decode(repo["current"]["spki"])), fp)
        [fields] = self.item_fields()
        passphrase, pkcs8 = fields["password"], base64.b64decode(fields["private_key"])
        self.assertGreaterEqual(len(passphrase), 40)
        self.assertEqual(sealing.fingerprint(sealing.spki_of(pkcs8)), fp)
        [locked] = self.uploads
        self.assertEqual((locked["v"], locked["iterations"], set(locked)), (1, 600_000, {"v", "kdf", "iterations", "salt", "iv", "ct"}))
        self.assertEqual(sealing.unlock_keyring(locked, passphrase), {fp: pkcs8}, "the browser's passphrase opens the uploaded keyring of one")
        ts = self.w.public_ts.read_text()
        self.assertIn(fp, ts)
        self.assertNotIn(fields["private_key"][:40], ts + self.w.public_json.read_text())
        for call in self.w.op_calls():
            self.assertFalse(any(passphrase in a or fields["private_key"][:40] in a for a in call))
        self.assertNotIn(passphrase, "\n".join(self.w.out))

    def test_init_refuses_when_a_key_exists_anywhere(self):
        self.w.keys.init(self.uploads.append)
        with self.assertRaises(KeysError):
            self.w.keys.init(self.uploads.append)
        self.w.public_json.unlink()
        with self.assertRaises(KeysError, msg="1Password still holds one"):
            self.w.keys.init(self.uploads.append)
        self.assertEqual((len(self.item_fields()), len(self.uploads)), (1, 1))

    def test_a_failed_upload_keeps_the_keys_and_says_how_to_retry(self):
        def fail(_locked):
            raise OSError("network down")
        fp = self.w.keys.init(fail)
        self.assertIn(fp, self.w.cache.load()["keys"])
        self.assertIn("make keys-upload", "\n".join(self.w.out))
        self.assertEqual(self.w.keys.upload_keyring(self.uploads.append), 1)

    def test_rotate_uploads_the_full_keyring_and_keeps_the_passphrase(self):
        old = self.w.keys.init(self.uploads.append)
        new = self.w.keys.rotate(self.uploads.append)
        repo = json.loads(self.w.public_json.read_text())
        self.assertEqual((repo["current"]["fingerprint"], [p["fingerprint"] for p in repo["previous"]]), (new, [old]))
        fields = self.item_fields()
        self.assertEqual(len({f["password"] for f in fields}), 1, "one passphrase, so every device keeps working")
        titles = sorted(i["title"] for i in self.w.op.list_items("siue-music-key"))
        self.assertTrue(any(t.endswith("(previous)") and old[:16] in t for t in titles))
        ring = self.w.keys.keyring()
        self.assertEqual(list(ring), [new, old], "current first, then the retained key")
        unlocked = sealing.unlock_keyring(self.uploads[-1], fields[0]["password"])
        self.assertEqual(unlocked, ring, "the uploaded keyring is the full keyring, current first")
        self.assertEqual(len(self.uploads), 2, "init uploaded a keyring of one, rotate the full keyring")
        self.assertIn(new, self.w.public_ts.read_text())
        self.assertIn(old, self.w.public_ts.read_text(), "PREVIOUS_KEYS keeps the old public key")

    def test_a_note_sealed_before_a_rotation_opens_with_the_rotated_keyring(self):
        old = self.w.keys.init(self.uploads.append)
        note = sealing.seal({"v": 1, "kind": "text", "text": "before the rotation"}, b"", sealing.spki_of(self.w.keys.keyring()[old]))
        new = self.w.keys.rotate(self.uploads.append)
        passphrase = self.item_fields()[0]["password"]
        for ring in (self.w.keys.ensure_synced(), sealing.unlock_keyring(self.uploads[-1], passphrase)):
            self.assertEqual(sealing.open_bundle(note, ring).body["text"], "before the rotation")
        after = sealing.seal({"v": 1, "kind": "text", "text": "after"}, b"", sealing.spki_of(self.w.keys.keyring()[new]))
        self.assertEqual(sealing.open_bundle(after, sealing.unlock_keyring(self.uploads[-1], passphrase)).body["text"], "after")

    def test_rotate_never_drops_a_retained_key(self):
        old = self.w.keys.init(self.uploads.append)
        self.w.keys.rotate(self.uploads.append)
        count = len(self.uploads)
        for item in self.w.op.list_items("siue-music-key"):
            if old[:16] in item["title"]:
                self.w.op.archive(item["id"])
        data = self.w.cache.load()
        del data["keys"][old]
        self.w.cache.save(data)
        with self.assertRaises(KeysError):
            self.w.keys.rotate(self.uploads.append)
        self.assertEqual(len(self.uploads), count, "nothing was uploaded")
        self.assertEqual(len(self.item_fields()), 1, "no new item was made")

    def test_rotate_refuses_on_a_mismatched_key(self):
        self.w.add_key_to_op(0)
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan)  # the repository names a key that 1Password never held
        with self.assertRaises(KeyMismatch):
            self.w.keys.rotate(self.uploads.append)
        self.assertEqual(self.uploads, [], "nothing was uploaded")
        self.assertEqual(len(self.item_fields()), 1, "no new item was made")
        self.assertEqual(json.loads(self.w.public_json.read_text())["current"]["fingerprint"], orphan, "public.json is untouched")


if __name__ == "__main__":
    unittest.main()
