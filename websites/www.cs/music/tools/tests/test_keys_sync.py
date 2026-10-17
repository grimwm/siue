"""The sync check every music-* target runs first: a cached current key needs
no 1Password; a rotated key is fetched automatically; when the keys still
differ it stops and says which side is out of date."""
import base64
import unittest

from support import World, pool_key
from siue_music.keys import KeyMismatch
from siue_music.sealing import fingerprint, spki_of


class SyncTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)

    def test_no_key_yet_says_keys_init(self):
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("make keys-init", str(e.exception))

    def test_a_cached_current_key_needs_no_1password(self):
        fp = self.w.add_key_to_op(0)
        self.w.write_repo(fp)
        self.w.keys.pull()
        self.w.clear_op_log()
        ring = self.w.keys.ensure_synced()
        self.assertEqual(fingerprint(spki_of(ring[fp])), fp)
        self.assertEqual(self.w.op_calls(), [])

    def test_a_rotated_key_is_fetched_then_used(self):
        old = self.w.add_key_to_op(0)
        self.w.write_repo(old)
        self.w.keys.pull()
        new = self.w.add_key_to_op(1)
        self.w.write_repo(new, (old,))  # what a git pull after a rotation brings
        ring = self.w.keys.ensure_synced()
        self.assertEqual(set(ring), {old, new})
        self.assertIn(new, self.w.cache.load()["keys"])

    def test_the_repository_key_missing_from_1password_stops(self):
        known = self.w.add_key_to_op(0)
        self.w.write_repo(known)
        self.w.keys.pull()
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan, (known,))
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        msg = str(e.exception)
        self.assertIn("1Password (vault SIUE) has no private key for the repository's public key", msg)
        self.assertIn(orphan[:4], msg)
        self.assertIn("OP_VAULT", msg)

    def test_a_key_the_repository_does_not_know_suggests_git_pull(self):
        unknown = self.w.add_key_to_op(0)
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("git pull", str(e.exception))
        self.assertIn(unknown[:4], str(e.exception))

    def test_an_item_whose_private_key_does_not_match_its_fingerprint_is_refused(self):
        _, wrong_pkcs8, _ = pool_key(1)
        fp = self.w.add_key_to_op(0, private_key=wrong_pkcs8)
        self.w.write_repo(fp)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.ensure_synced()
        self.assertIn("holds a private key whose fingerprint is", str(e.exception))
        self.assertNotIn(fp, self.w.cache.load().get("keys", {}))

    def test_pull_checks_the_pulled_key_against_the_repository(self):
        known = self.w.add_key_to_op(0)
        orphan, _, _ = pool_key(1)
        self.w.write_repo(orphan)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.pull_checked()
        self.assertIn("git pull", str(e.exception), "1Password holds a key the repository does not name")
        self.assertIn(known[:4], str(e.exception))
        self.assertIn(known, self.w.cache.load()["keys"], "the pull itself still saved what 1Password holds")
        self.w.write_repo(known)
        self.w.keys.pull_checked()

    def test_pull_with_no_repository_key_says_keys_init(self):
        self.w.add_key_to_op(0)
        with self.assertRaises(KeyMismatch) as e:
            self.w.keys.pull_checked()
        self.assertIn("make keys-init", str(e.exception))

    def test_status_names_fingerprints_and_never_a_secret(self):
        fp = self.w.add_key_to_op(0, passphrase="never print me")
        self.w.write_repo(fp)
        self.w.keys.api_key_set("music-pickup", "f" * 64)
        self.w.keys.pull()
        self.assertEqual(self.w.keys.status(), 0)
        text = "\n".join(self.w.out)
        self.assertIn(fp[:4] + " " + fp[4:8], text)
        self.assertIn("match", text)
        self.assertIn("music-pickup", text)
        _, pkcs8, _ = pool_key(0)
        for secret in ("never print me", "f" * 64, base64.b64encode(pkcs8).decode()[:40]):
            self.assertNotIn(secret, text)

    def test_a_key_item_without_a_password_is_a_plain_error(self):
        from siue_music.keys import KeysError
        fp = self.w.add_key_to_op(0, passphrase="")
        self.w.write_repo(fp)
        with self.assertRaises(KeysError) as e:
            self.w.keys.passphrase()
        self.assertIn("password", str(e.exception))


if __name__ == "__main__":
    unittest.main()
