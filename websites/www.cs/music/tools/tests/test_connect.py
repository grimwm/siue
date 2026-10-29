"""`make music-mcp-setup` prints the commands that connect an AI app to the MCP server: Claude Code's `claude mcp add`
line and Claude Desktop's JSON, with this checkout's absolute paths, the server address and the op the app should run."""
import contextlib
import io
import json
import shlex
import unittest
from pathlib import Path

import support  # noqa: F401  (puts siue_music on the path)
from siue_music import cli
from siue_music.connect import connect_text

PY = Path("/home/me/My Repos/siue/websites/www.cs/music/tools/.venv/bin/python")
TOOL = Path("/home/me/My Repos/siue/websites/www.cs/music/tools/siue-music")


class ConnectTest(unittest.TestCase):
    def text(self, **over):
        args = dict(python=PY, tool=TOOL, base="https://music.example.org/music/", op="/opt/homebrew/bin/op", vault=None,
                    config=Path("/home/me/.config/siue/music-config.json"), platform="darwin")
        return connect_text(**{**args, **over})

    def claude_line(self, text):
        [line] = [l.strip() for l in text.splitlines() if l.strip().startswith("claude mcp add")]
        return shlex.split(line)

    def desktop_json(self, text):
        start = text.index("{")
        depth = 0
        for i, ch in enumerate(text[start:], start):
            depth += {"{": 1, "}": -1}.get(ch, 0)
            if depth == 0:
                return json.loads(text[start:i + 1])
        self.fail("no JSON block")

    def test_the_claude_code_line_runs_this_checkouts_tool_with_the_server_address(self):
        argv = self.claude_line(self.text())
        self.assertEqual(argv[:3], ["claude", "mcp", "add"])
        self.assertIn("--scope", argv)
        self.assertEqual(argv[argv.index("--scope") + 1], "user")
        self.assertIn("SIUE_MUSIC_BASE=https://music.example.org/music/", argv)
        self.assertIn("SIUE_OP=/opt/homebrew/bin/op", argv)
        self.assertEqual(argv[argv.index("--") - 1], "siue-music")
        self.assertEqual(argv[argv.index("--") + 1:], [str(PY), str(TOOL), "mcp"])

    def test_the_desktop_json_runs_the_same_command(self):
        server = self.desktop_json(self.text())["mcpServers"]["siue-music"]
        self.assertEqual((server["command"], server["args"]), (str(PY), [str(TOOL), "mcp"]))
        self.assertEqual(server["env"], {"SIUE_MUSIC_BASE": "https://music.example.org/music/", "SIUE_OP": "/opt/homebrew/bin/op"})

    def test_it_says_where_the_desktop_config_lives_and_where_to_change_the_address(self):
        text = self.text()
        self.assertIn("~/Library/Application Support/Claude/claude_desktop_config.json", text)
        self.assertIn("%APPDATA%\\Claude\\claude_desktop_config.json", self.text(platform="win32"))
        self.assertIn("SIUE_MUSIC_BASE", text)
        self.assertIn("/home/me/.config/siue/music-config.json", text)
        self.assertIn("delete published drafts", text)
        self.assertIn("drafts:delete", text)
        self.assertIn("cannot delete notes", text)

    def test_a_vault_other_than_the_default_is_passed_on_and_a_missing_op_is_named(self):
        argv = self.claude_line(self.text(vault="Music", op=None))
        self.assertIn("OP_VAULT=Music", argv)
        self.assertFalse([a for a in argv if a.startswith("SIUE_OP=")])
        self.assertIn("1Password CLI", self.text(op=None))

    def test_the_cli_prints_it_without_touching_1password(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = cli.main(["mcp-setup"], {"SIUE_OP": "/nonexistent/op", "SIUE_CONFIG_DIR": "/nonexistent/cfg",
                                            "SIUE_MUSIC_BASE": "https://music.example.org/music/"})
        self.assertEqual(code, 0)
        argv = self.claude_line(out.getvalue())
        self.assertIn("SIUE_MUSIC_BASE=https://music.example.org/music/", argv)
        self.assertTrue(Path(argv[argv.index("--") + 2]).is_absolute())
        self.assertEqual(Path(argv[argv.index("--") + 2]).name, "siue-music")

    def test_the_server_without_the_sdk_says_how_to_install_it(self):
        try:
            import mcp  # noqa: F401
            self.skipTest("this Python has the MCP SDK")
        except ImportError:
            pass
        err = io.StringIO()
        with contextlib.redirect_stderr(err):
            self.assertEqual(cli.main(["mcp"], {}), 1)
        self.assertIn("make music-mcp-setup", err.getvalue())


if __name__ == "__main__":
    unittest.main()
