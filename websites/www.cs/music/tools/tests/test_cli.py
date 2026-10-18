"""The command line: exit codes, and every location from the env it is given."""
import contextlib
import io
import os
import stat
import sys
import unittest
from unittest import mock

from support import ServerApi, TOOLS, World
from siue_music import cli


class CliTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        fake = TOOLS / "tests" / "fake_op.py"
        self.assertTrue(fake.stat().st_mode & stat.S_IXUSR)
        self.env = {"SIUE_OP": str(fake), "SIUE_CONFIG_DIR": str(self.w.root / "cfg"), "OP_VAULT": "SIUE"}

    def run_cli(self, *argv, stdin=""):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err), mock.patch.object(sys, "stdin", io.StringIO(stdin)):
            code = cli.main(list(argv), self.env)
        return code, out.getvalue(), err.getvalue()

    def test_status_without_a_key_exits_3_and_names_the_remedy(self):
        code, out, _ = self.run_cli("keys", "status")
        self.assertEqual((code, "make music-setup" in out), (3, True))

    def test_pull_then_status_then_forget(self):
        self.w.add_key_to_op(0)
        self.assertEqual(self.run_cli("keys", "pull")[0], 0)
        cache = self.w.root / "cfg" / "music.json"
        self.assertEqual(os.stat(cache).st_mode & 0o777, 0o600)
        self.assertEqual(self.run_cli("keys", "status")[0], 3, "the server is not reachable without an API key")
        self.assertEqual(self.run_cli("keys", "forget")[0], 0)
        self.assertFalse(cache.exists())

    def test_pull_with_two_current_keys_exits_1_on_stderr(self):
        self.w.add_key_to_op(0)
        self.w.add_key_to_op(1)
        code, out, err = self.run_cli("keys", "pull")
        self.assertEqual((code, out), (1, ""))
        self.assertIn("add (previous) to the title", err)

    def test_api_key_set_reads_stdin_and_a_bad_key_exits_1(self):
        self.assertEqual(self.run_cli("api-key-set", "music-pickup", stdin="c" * 64 + "\n")[0], 0)
        code, _, err = self.run_cli("api-key-set", "music-pickup", stdin="nope\n")
        self.assertEqual(code, 1)
        self.assertNotIn("nope", err)
        for call in self.w.op_calls():
            self.assertNotIn("c" * 64, " ".join(call))

    def test_rotate_uploads_with_the_music_publish_key(self):
        server = ServerApi()
        made = []

        def make_api(base, key):
            made.append((base, key))
            return server

        self.w.add_key_to_op(0)
        self.run_cli("api-key-set", "music-publish", stdin="d" * 64 + "\n")
        self.env["SIUE_MUSIC_BASE"] = "http://127.0.0.1:1/music/"
        with mock.patch.object(cli, "make_api", make_api):
            code, out, _ = self.run_cli("keys", "rotate")
        self.assertEqual(code, 0)
        self.assertEqual(made[0], ("http://127.0.0.1:1/music/", "d" * 64))
        self.assertEqual(len(server.uploads), 1)
        self.assertEqual(server.uploads[0]["keyring"]["iterations"], 600_000)
        self.assertIn("Uploaded the locked copy", out)

    def test_a_failed_rotate_upload_exits_4(self):
        class Failing(ServerApi):
            def publish_keyring(self, locked, current, previous):
                raise OSError("network down")

        self.w.add_key_to_op(0)
        self.run_cli("api-key-set", "music-publish", stdin="d" * 64 + "\n")
        with mock.patch.object(cli, "make_api", lambda base, key: Failing()):
            code, out, err = self.run_cli("keys", "rotate")
        self.assertEqual(code, 4)
        self.assertIn("network down", out)
        self.assertIn("make music-setup", out)
        self.assertIn("not uploaded", err)

    def test_rotate_without_an_api_key_exits_4_and_says_how_to_upload(self):
        self.w.add_key_to_op(0)
        code, out, _ = self.run_cli("keys", "rotate")
        self.assertEqual(code, 4)
        self.assertIn("no music-publish API key", out)

    def test_a_missing_api_key_says_to_run_music_setup(self):
        self.w.add_key_to_op(0)
        for argv, name in ((("pickup",), "music-pickup"), (("publish", "ch1-labyrinth"), "music-publish")):
            code, _, err = self.run_cli(*argv)
            self.assertEqual(code, 1, argv)
            self.assertIn(f"There is no API key named {name}", err)
            self.assertIn("Run make music-setup", err)

    def test_the_removed_key_commands_and_unknown_ones_print_usage_and_exit_2(self):
        for argv in (("bogus",), ("keys", "init"), ("keys", "upload")):
            self.assertEqual(self.run_cli(*argv)[0], 2, argv)


if __name__ == "__main__":
    unittest.main()
