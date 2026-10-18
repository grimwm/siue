"""The command line: exit codes, and every location from the env it is given."""
import contextlib
import io
import os
import stat
import sys
import unittest
from unittest import mock

from support import TOOLS, World
from siue_music import cli


class CliTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        fake = TOOLS / "tests" / "fake_op.py"
        self.assertTrue(fake.stat().st_mode & stat.S_IXUSR)
        self.env = {"SIUE_OP": str(fake), "SIUE_CONFIG_DIR": str(self.w.root / "cfg"), "OP_VAULT": "SIUE",
                    "SIUE_MUSIC_PUBLIC_KEYS": str(self.w.public_json), "SIUE_MUSIC_PUBLIC_KEY_TS": str(self.w.public_ts)}

    def run_cli(self, *argv, stdin=""):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err), mock.patch.object(sys, "stdin", io.StringIO(stdin)):
            code = cli.main(list(argv), self.env)
        return code, out.getvalue(), err.getvalue()

    def test_status_without_a_key_exits_3_and_names_the_remedy(self):
        code, out, _ = self.run_cli("keys", "status")
        self.assertEqual((code, "make music-setup" in out), (3, True))

    def test_pull_then_status_then_forget(self):
        fp = self.w.add_key_to_op(0)
        self.w.write_repo(fp)
        self.assertEqual(self.run_cli("keys", "pull")[0], 0)
        cache = self.w.root / "cfg" / "music.json"
        self.assertEqual(os.stat(cache).st_mode & 0o777, 0o600)
        self.assertEqual(self.run_cli("keys", "status")[0], 0)
        self.assertEqual(self.run_cli("keys", "forget")[0], 0)
        self.assertFalse(cache.exists())

    def test_pull_with_a_mismatch_exits_3_on_stderr(self):
        self.w.add_key_to_op(0)
        from support import pool_key
        self.w.write_repo(pool_key(1)[0])
        code, out, err = self.run_cli("keys", "pull")
        self.assertEqual((code, out), (3, ""))
        self.assertIn("git pull", err)

    def test_api_key_set_reads_stdin_and_a_bad_key_exits_1(self):
        self.assertEqual(self.run_cli("api-key-set", "music-pickup", stdin="c" * 64 + "\n")[0], 0)
        code, _, err = self.run_cli("api-key-set", "music-pickup", stdin="nope\n")
        self.assertEqual(code, 1)
        self.assertNotIn("nope", err)
        for call in self.w.op_calls():
            self.assertNotIn("c" * 64, " ".join(call))

    def test_keys_init_uploads_with_the_music_publish_key(self):
        sent = []

        class StubApi:
            def __init__(self, base, key):
                sent.append((base, key))

            def publish_keyring(self, locked):
                sent.append(locked)

        self.run_cli("api-key-set", "music-publish", stdin="d" * 64 + "\n")
        self.env["SIUE_MUSIC_BASE"] = "http://127.0.0.1:1/music/"
        with mock.patch.object(cli, "make_api", StubApi):
            code, out, _ = self.run_cli("keys", "init")
        self.assertEqual(code, 0)
        self.assertEqual(sent[0], ("http://127.0.0.1:1/music/", "d" * 64))
        self.assertEqual(sent[1]["iterations"], 600_000)
        self.assertIn("Uploaded the locked copy", out)

    def test_keys_init_without_an_api_key_still_succeeds_and_says_how_to_upload(self):
        code, out, _ = self.run_cli("keys", "init")
        self.assertEqual(code, 0)
        self.assertIn("make music-setup", out)
        self.assertIn("no music-publish API key", out)
        self.assertEqual(self.run_cli("keys", "init")[0], 1, "a second init is refused")

    def test_keys_upload_without_a_key_exits_1(self):
        self.run_cli("keys", "init")
        code, _, err = self.run_cli("keys", "upload")
        self.assertEqual(code, 1)
        self.assertIn("music-publish", err)

    def test_a_missing_api_key_says_to_run_music_setup(self):
        self.run_cli("keys", "init")
        for argv, name in ((("keys", "upload"), "music-publish"), (("pickup",), "music-pickup"), (("publish", "ch1-labyrinth"), "music-publish")):
            code, _, err = self.run_cli(*argv)
            self.assertEqual(code, 1, argv)
            self.assertIn(f"There is no API key named {name}", err)
            self.assertIn("Run make music-setup", err)

    def test_a_failed_init_upload_exits_0_and_a_failed_rotate_upload_exits_4(self):
        class Failing:
            def __init__(self, base, key):
                pass

            def publish_keyring(self, locked):
                raise OSError("network down")

        self.run_cli("api-key-set", "music-publish", stdin="d" * 64 + "\n")
        with mock.patch.object(cli, "make_api", Failing):
            code, out, _ = self.run_cli("keys", "init")
            self.assertEqual(code, 0)
            self.assertIn("network down", out)
            code, out, err = self.run_cli("keys", "rotate")
        self.assertEqual(code, 4)
        self.assertIn("make music-setup", out)
        self.assertNotIn("Then commit", out)
        self.assertIn("not uploaded", err)

    def test_init_adopt_flag(self):
        fp = self.w.add_key_to_op(0)
        self.assertEqual(self.run_cli("keys", "init")[0], 1)
        self.assertEqual(self.run_cli("keys", "init", "--adopt")[0], 0)
        self.assertIn(fp, self.w.public_json.read_text())

    def test_usage_exits_2(self):
        self.assertEqual(self.run_cli("bogus")[0], 2)


if __name__ == "__main__":
    unittest.main()
