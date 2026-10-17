"""The 1Password wrapper: secrets go to op on stdin, never in argv; an old op
is refused with the command that fixes it; a failed op call is an OpError."""
import os
import unittest
from unittest import mock

from support import World
from siue_music.keys import Cache, KeysError
from siue_music.op import OpError


class OpTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)

    def test_secrets_ride_on_stdin_never_argv(self):
        secret = "s3cret-" + "x" * 40
        item = self.w.op.create("t", "API_CREDENTIAL", ["siue-music-api"],
                                [{"id": "credential", "type": "CONCEALED", "label": "credential", "value": secret}])
        self.assertEqual(self.w.op.fields(item)["credential"], secret)
        self.w.keys.api_key_set("music-pickup", "e" * 64)
        for call in self.w.op_calls():
            for arg in call:
                self.assertNotIn(secret, arg)
                self.assertNotIn("e" * 64, arg)

    def test_an_old_op_is_refused_with_the_remedy(self):
        with mock.patch.dict(os.environ, {"FAKE_OP_VERSION": "2.10.0"}):
            with self.assertRaises(OpError) as e:
                self.w.op.check_version()
        self.assertIn("brew upgrade 1password-cli", str(e.exception))

    def test_a_missing_item_is_an_op_error(self):
        with self.assertRaises(OpError):
            self.w.op.fields("nope")

    def test_api_key_set_replaces_the_old_item(self):
        self.w.keys.api_key_set("music-pickup", "a" * 64)
        self.w.keys.api_key_set("music-pickup", "b" * 64)
        items = self.w.op.list_items("siue-music-api")
        self.assertEqual(len(items), 1)
        self.assertEqual(self.w.op.fields(items[0]["id"])["credential"], "b" * 64)
        with self.assertRaises(KeysError):
            self.w.keys.api_key_set("music-pickup", "not hex")
        self.assertEqual(len(self.w.op.list_items("siue-music-api")), 1, "a refused key changes nothing")

    def test_the_cache_is_private_and_forget_removes_it(self):
        cache = Cache(self.w.root / "c" / "siue" / "music.json")
        cache.save({"v": 1, "keys": {}, "api": {}})
        self.assertEqual(os.stat(cache.path).st_mode & 0o777, 0o600)
        self.assertEqual(os.stat(cache.path.parent).st_mode & 0o777, 0o700)
        self.assertTrue(cache.forget())
        self.assertFalse(cache.path.exists())


if __name__ == "__main__":
    unittest.main()
