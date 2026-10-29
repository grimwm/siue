"""The server's address is configuration: SIUE_MUSIC_BASE, else "base" in music-config.json in the config folder, else
the default. The same file holds how often the MCP server polls for notes. Nothing the tool writes names another address."""
import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from support import World
from siue_music import cli, paths
from siue_music.paths import BadConfig, DEFAULT_BASE, api_base, poll_seconds


class ServerAddressTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.home = Path(tmp.name)
        self.config = self.home / ".config" / "siue"

    def write(self, data) -> None:
        self.config.mkdir(parents=True, exist_ok=True)
        (self.config / "music-config.json").write_text(data if isinstance(data, str) else json.dumps(data))

    def test_the_default_when_nothing_is_set(self):
        self.assertEqual(api_base({}, self.home), DEFAULT_BASE)

    def test_the_config_file_names_the_server(self):
        self.write({"base": "https://music.example.org/workroom/"})
        self.assertEqual(api_base({}, self.home), "https://music.example.org/workroom/")

    def test_the_environment_wins_over_the_file(self):
        self.write({"base": "https://music.example.org/"})
        self.assertEqual(api_base({"SIUE_MUSIC_BASE": "https://other.example.org/music/"}, self.home), "https://other.example.org/music/")

    def test_the_config_folder_can_be_moved_by_the_environment(self):
        moved = self.home / "elsewhere"
        moved.mkdir()
        (moved / "music-config.json").write_text(json.dumps({"base": "https://moved.example.org/music/"}))
        self.assertEqual(api_base({"SIUE_CONFIG_DIR": str(moved)}), "https://moved.example.org/music/")

    def test_a_malformed_file_is_refused_with_its_path_whichever_setting_is_read(self):
        for bad in ("{not json", "[1, 2]", json.dumps({"base": 7}), json.dumps({"poll_seconds": "soon"})):
            self.write(bad)
            with self.assertRaises(BadConfig) as e:
                api_base({}, self.home)
            self.assertIn("music-config.json", str(e.exception))

    def test_poll_seconds_from_the_environment_or_the_file_never_below_two(self):
        self.assertEqual(poll_seconds({}, self.home), paths.DEFAULT_POLL_SECONDS)
        self.write({"poll_seconds": 30})
        self.assertEqual(poll_seconds({}, self.home), 30)
        self.assertEqual(poll_seconds({"SIUE_MUSIC_POLL_SECONDS": "5"}, self.home), 5)
        self.assertEqual(poll_seconds({"SIUE_MUSIC_POLL_SECONDS": "0.1"}, self.home), paths.MIN_POLL_SECONDS)
        with self.assertRaises(BadConfig):
            poll_seconds({"SIUE_MUSIC_POLL_SECONDS": "often"}, self.home)

    def test_the_cli_reads_the_server_from_the_config_file(self):
        w = World(self)
        w.add_key_to_op(0)
        w.keys.api_key_set("music-pickup", "c" * 64)
        w.keys.pull()
        cfg = w.root / "config" / "siue"
        (cfg / "music-config.json").write_text(json.dumps({"base": "https://moved.example.org/music/"}))
        bases = []

        class Quiet:
            def waiting(self):
                return []

        env = {"OP_VAULT": "SIUE", "SIUE_CONFIG_DIR": str(cfg), "SIUE_MUSIC_NOTES_DIR": str(w.root / "notes"),
               "SIUE_OP": " ".join(w.op.exe)}
        with mock.patch("siue_music.cli.make_api", side_effect=lambda base, key: (bases.append(base), Quiet())[1]), \
                contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(cli.main(["pickup"], env), 0)
        self.assertEqual(bases, ["https://moved.example.org/music/"])

    def test_a_malformed_config_file_stops_the_cli_with_exit_1(self):
        self.write("{not json")
        err = io.StringIO()
        with contextlib.redirect_stderr(err), contextlib.redirect_stdout(io.StringIO()):
            code = cli.main(["pickup"], {"SIUE_CONFIG_DIR": str(self.config), "SIUE_OP": "false"})
        self.assertEqual(code, 1)
        self.assertIn("music-config.json", err.getvalue())

    def test_the_1password_items_name_the_configured_server(self):
        w = World(self)
        w.keys.base = "https://moved.example.org/music/"
        w.keys.api_key_set("music-pickup", "c" * 64)
        w.keys.ensure_key(None)
        store = json.loads((w.root / "op.json").read_text())
        self.assertEqual({u["href"] for item in store["items"] for u in item["urls"]}, {"https://moved.example.org/music/"})


if __name__ == "__main__":
    unittest.main()
