"""1Password decides which notes key is current (the item not titled "(previous)"); the sync check every music-* target
runs first compares the cache with it, pulls once when they differ, and stops saying which side is out of date."""
import base64
import unittest

from support import World, pool_key
from siue_music import sealing
from siue_music.keys import KeyMismatch, KeysError
from siue_music.sealing import fingerprint, spki_of


class SyncTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)

    def test_no_key_yet_says_music_setup(self):
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("make music-setup", str(e.exception))

    def test_the_current_key_is_the_item_not_marked_previous(self):
        old = self.w.add_key_to_op(0, previous=True)
        new = self.w.add_key_to_op(1)
        ring = self.w.keys.ensure_synced()
        self.assertEqual(list(ring), [new, old], "the current key first, then the previous one")
        data = self.w.cache.load()
        self.assertEqual((data["current"], data["previous"]), (new, [old]))

    def test_two_current_items_stop_with_what_to_fix_in_1password(self):
        self.w.add_key_to_op(0)
        self.w.add_key_to_op(1)
        with self.assertRaises(KeysError) as e:
            self.w.keys.ensure_synced()
        msg = str(e.exception)
        self.assertIn("2 notes key items that are not marked (previous)", msg)
        self.assertIn("add (previous) to the title of every other one", msg)

    def test_every_item_marked_previous_stops_with_what_to_fix(self):
        self.w.add_key_to_op(0, previous=True)
        with self.assertRaises(KeysError) as e:
            self.w.keys.ensure_synced()
        self.assertIn("none is current", str(e.exception))
        self.assertIn("Remove (previous)", str(e.exception))

    def test_a_cache_that_names_the_current_key_is_not_pulled_again(self):
        fp = self.w.add_key_to_op(0)
        self.w.keys.pull()
        self.w.clear_op_log()
        ring = self.w.keys.ensure_synced()
        self.assertEqual(fingerprint(spki_of(ring[fp])), fp)
        self.assertFalse(any(call[:2] == ["item", "list"] and "siue-music-api" in call for call in self.w.op_calls()),
                         "the API keys were not fetched again")

    def test_a_rotated_key_is_fetched_once_then_used(self):
        old = self.w.add_key_to_op(0)
        self.w.keys.pull()
        new = self.w.add_key_to_op(1)  # a rotation made on another computer
        self.w.op.retitle(self.w.op.list_items("siue-music-key")[0]["id"], "SIUE music notes key (previous)")
        ring = self.w.keys.ensure_synced()
        self.assertEqual(list(ring), [new, old])
        self.assertEqual(self.w.cache.load()["current"], new)

    def test_1password_without_a_key_while_the_cache_has_one_names_1password_as_out_of_date(self):
        fp = self.w.add_key_to_op(0)
        self.w.keys.pull()
        for item in self.w.op.list_items("siue-music-key"):
            self.w.op.archive(item["id"])
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        msg = str(e.exception)
        self.assertIn("1Password (vault SIUE) holds no notes key", msg)
        self.assertIn("1Password is out of date", msg)
        self.assertIn(fp[:4], msg)
        self.assertIn("OP_VAULT", msg)

    def test_an_item_whose_private_key_does_not_match_its_fingerprint_is_refused(self):
        _, wrong_pkcs8, _ = pool_key(1)
        fp = self.w.add_key_to_op(0, private_key=wrong_pkcs8)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("holds a private key whose fingerprint is", str(e.exception))
        self.assertNotIn(fp, self.w.cache.load().get("keys", {}))

    def test_the_keyring_lists_the_current_key_first_and_locks_in_that_order(self):
        old = self.w.add_key_to_op(0, previous=True)
        new = self.w.add_key_to_op(1)
        ring = self.w.keys.keyring()
        self.assertEqual(list(ring), [new, old])
        locked = sealing.lock_keyring(ring, "a test passphrase")
        self.assertEqual(list(sealing.unlock_keyring(locked, "a test passphrase")), [new, old], "lock_keyring keeps insertion order")

    def test_a_key_only_this_computer_holds_is_kept_as_previous(self):
        old = self.w.add_key_to_op(0)
        self.w.keys.pull()
        for item in self.w.op.list_items("siue-music-key"):
            self.w.op.archive(item["id"])
        new = self.w.add_key_to_op(1)
        self.w.keys.pull()
        self.assertEqual(self.w.cache.load()["previous"], [old])
        self.assertTrue(any(old[:4] in line and "kept" in line for line in self.w.out))
        self.assertEqual(list(self.w.keys.keyring()), [new, old])

    def test_a_corrupt_cached_key_is_refused(self):
        fp = self.w.add_key_to_op(0)
        self.w.keys.pull()
        data = self.w.cache.load()
        data["keys"][fp] = base64.b64encode(pool_key(3)[1]).decode()  # a real key filed under the wrong fingerprint
        self.w.cache.save(data)
        with self.assertRaises(KeysError) as e:
            self.w.keys.ensure_synced()
        self.assertIn("make music-forget", str(e.exception))

    def test_a_key_item_without_a_password_is_a_plain_error(self):
        self.w.add_key_to_op(0, passphrase="")
        with self.assertRaises(KeysError) as e:
            self.w.keys.passphrase()
        self.assertIn("password", str(e.exception))

    def test_the_hub_address_follows_the_music_base(self):
        self.w.keys.base = "http://127.0.0.1:9/~me/music/"
        self.assertEqual(self.w.keys.hub_url(), "http://127.0.0.1:9/~me/admin/")


if __name__ == "__main__":
    unittest.main()
