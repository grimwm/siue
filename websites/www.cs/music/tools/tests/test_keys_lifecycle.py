"""Making, uploading and rotating the notes key: the pair and passphrase go to 1Password first, the uploaded keyring opens
with the passphrase and holds the current key then every retained one, the wrapper names those fingerprints, rotation
never drops a key, and nothing secret reaches argv or output."""
import base64
import os
import unittest
from unittest import mock

from support import ServerApi, World, pool_key
from siue_music import sealing
from siue_music.keys import KeysError, NotUploaded


class LifecycleTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.server = ServerApi()

    def item_fields(self):
        return [self.w.op.fields(i["id"]) for i in self.w.op.list_items("siue-music-key")]

    def test_ensure_key_makes_one_item_and_caches_it_as_current(self):
        self.assertTrue(self.w.keys.ensure_key(self.server))
        [fields] = self.item_fields()
        fp = fields["fingerprint"]
        passphrase, pkcs8 = fields["password"], base64.b64decode(fields["private_key"])
        self.assertGreaterEqual(len(passphrase), 40)
        self.assertEqual(sealing.fingerprint(sealing.spki_of(pkcs8)), fp)
        self.assertEqual(self.w.cache.load()["current"], fp)
        for call in self.w.op_calls():
            self.assertFalse(any(passphrase in a or fields["private_key"][200:260] in a for a in call))
        self.assertNotIn(passphrase, "\n".join(self.w.out))
        self.assertIn("NOTES KEY  seals your notes", "\n".join(self.w.out))

    def test_ensure_key_adopts_what_1password_holds(self):
        fp = self.w.add_key_to_op(0, passphrase="orphan passphrase")
        self.assertFalse(self.w.keys.ensure_key(self.server))
        self.assertEqual(self.w.cache.load()["current"], fp)
        self.assertEqual(len(self.item_fields()), 1, "no second item")

    def test_ensure_key_refuses_to_start_over_while_the_server_holds_a_keyring(self):
        self.server.stored = {"current": "c" * 64, "previous": [], "uploaded_at": 1}
        with self.assertRaises(KeysError) as e:
            self.w.keys.ensure_key(self.server)
        self.assertIn("OP_VAULT", str(e.exception))
        self.assertIn(f"remove it on the admin hub ({self.w.keys.hub_url()}: Music notes key \u2192 Remove the notes key) first", str(e.exception))
        self.assertEqual(self.item_fields(), [], "no key was made")

    def test_upload_posts_the_wrapper_with_the_fingerprints_and_a_keyring_the_passphrase_opens(self):
        self.w.add_key_to_op(0, previous=True)
        new = self.w.add_key_to_op(1, passphrase="pp")
        old = pool_key(0)[0]
        self.assertEqual(self.w.keys.upload_keyring(self.server), 2)
        [sent] = self.server.uploads
        self.assertEqual((sent["current"], sent["previous"], set(sent)), (new, [old], {"keyring", "current", "previous"}))
        self.assertEqual(set(sent["keyring"]), {"v", "kdf", "iterations", "salt", "iv", "ct"})
        self.assertEqual(list(sealing.unlock_keyring(sent["keyring"], "pp")), [new, old])

    def test_upload_refuses_when_the_server_holds_a_key_the_keyring_lacks(self):
        self.w.add_key_to_op(0)
        self.server.stored = {"current": "c" * 64, "previous": [], "uploaded_at": 1}
        with self.assertRaises(KeysError) as e:
            self.w.keys.upload_keyring(self.server)
        self.assertIn("so nothing was changed", str(e.exception))
        self.assertEqual(self.server.uploads, [])

    def test_upload_checks_the_server_kept_the_keyring(self):
        self.w.add_key_to_op(0)

        class Forgetful(ServerApi):
            def publish_keyring(self, locked, current, previous):
                pass

        with self.assertRaises(KeysError) as e:
            self.w.keys.upload_keyring(Forgetful())
        self.assertIn("did not keep the keyring", str(e.exception))

    def test_rotate_makes_the_new_key_current_retitles_the_old_and_uploads(self):
        old = self.w.add_key_to_op(0, passphrase="pp")
        new = self.w.keys.rotate(self.server)
        self.assertNotEqual(new, old)
        titles = {i["title"] for i in self.w.op.list_items("siue-music-key")}
        self.assertEqual(len(titles), 2)
        self.assertTrue(any(t.endswith("(previous)") and old[:16] in t for t in titles))
        self.assertTrue(any(not t.endswith("(previous)") and new[:16] in t for t in titles))
        fresh = self.w.keys.passphrase()
        self.assertNotEqual(fresh, "pp", "a rotation changes the passphrase, so a leaked one stops working")
        [sent] = self.server.uploads
        self.assertEqual((sent["current"], sent["previous"]), (new, [old]))
        self.assertEqual(list(sealing.unlock_keyring(sent["keyring"], fresh)), [new, old])
        with self.assertRaises(sealing.WrongPassphrase):
            sealing.unlock_keyring(sent["keyring"], "pp")
        self.assertEqual(list(self.w.keys.keyring()), [new, old])

    def test_a_second_rotation_keeps_every_earlier_key(self):
        self.w.add_key_to_op(0)
        mid = self.w.keys.rotate(self.server)
        new = self.w.keys.rotate(self.server)
        sent = self.server.uploads[-1]
        self.assertEqual((sent["current"], set(sent["previous"])), (new, {pool_key(0)[0], mid}))

    def test_a_note_sealed_before_a_rotation_opens_with_the_rotated_keyring(self):
        old = self.w.add_key_to_op(0, passphrase="pp")
        note = sealing.seal({"v": 1, "kind": "text", "text": "before the rotation"}, b"", sealing.spki_of(self.w.keys.keyring()[old]))
        new = self.w.keys.rotate(self.server)
        for ring in (self.w.keys.ensure_synced(), sealing.unlock_keyring(self.server.uploads[-1]["keyring"], self.w.keys.passphrase())):
            self.assertEqual(sealing.open_bundle(note, ring).body["text"], "before the rotation")
        after = sealing.seal({"v": 1, "kind": "text", "text": "after"}, b"", sealing.spki_of(self.w.keys.keyring()[new]))
        self.assertEqual(sealing.open_bundle(after, self.w.keys.ensure_synced()).body["text"], "after")

    def test_a_failed_retitle_stops_before_the_upload_and_names_the_item(self):
        self.w.add_key_to_op(0)
        with mock.patch.dict(os.environ, {"FAKE_OP_FAIL_EDIT": "1"}):
            with self.assertRaises(KeysError) as e:
                self.w.keys.rotate(self.server)
        self.assertIn("Add (previous) to its title by hand", str(e.exception))
        self.assertEqual(self.server.uploads, [])

    def test_a_failed_rotate_upload_raises_not_uploaded_and_says_how_to_retry(self):
        self.w.add_key_to_op(0)

        class Down(ServerApi):
            def publish_keyring(self, locked, current, previous):
                raise OSError("network down")

        with self.assertRaises(NotUploaded):
            self.w.keys.rotate(Down())
        self.assertIn("network down", "\n".join(self.w.out))
        self.assertIn("make music-setup", "\n".join(self.w.out))
        with self.assertRaises(NotUploaded):
            self.w.keys.rotate(None)
        self.assertIn("no music-publish API key", "\n".join(self.w.out))

    def test_rotate_never_drops_a_key_the_server_holds(self):
        self.w.add_key_to_op(0)
        self.server.stored = {"current": pool_key(5)[0], "previous": [], "uploaded_at": 1}  # a key neither 1Password nor the cache holds
        with self.assertRaises(KeysError):
            self.w.keys.rotate(self.server)
        self.assertEqual((self.server.uploads, len(self.item_fields())), ([], 1), "nothing uploaded, no new item")

    def test_a_read_back_failure_archives_the_new_item(self):
        def boom(item_id):
            raise OSError("op died")
        original, self.w.op.fields = self.w.op.fields, boom
        with self.assertRaises(OSError):
            self.w.keys.ensure_key()
        self.w.op.fields = original
        self.assertEqual(self.w.op.list_items("siue-music-key"), [], "no orphan item")

    def test_an_archive_failure_keeps_the_read_back_error_first(self):
        original_fields, original_archive = self.w.op.fields, self.w.op.archive

        def boom(item_id):
            raise OSError("op died")

        def stuck(item_id):
            raise OSError("archive refused")
        self.w.op.fields, self.w.op.archive = boom, stuck
        with self.assertRaises(KeysError) as ctx:
            self.w.keys.ensure_key()
        self.w.op.fields, self.w.op.archive = original_fields, original_archive
        self.assertTrue(str(ctx.exception).startswith("op died"))
        self.assertIn("make music-setup", str(ctx.exception))
        self.assertIsInstance(ctx.exception.__cause__, OSError)


if __name__ == "__main__":
    unittest.main()
