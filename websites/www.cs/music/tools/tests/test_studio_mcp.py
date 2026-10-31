"""`siue-music mcp`, the studio MCP server, over stdio as an AI app sees it: it starts with no key and says what to do
instead of crashing; with an AI key it gives the pairing code, then once paired it waits for, reads and marks the notes
sealed to it, and publishes and deletes drafts; its tools never delete a note; stdout carries only protocol and no
answer carries the key. It needs the MCP SDK (this Python's or the tool's virtualenv)."""
import base64
import json
import os
import tempfile
import threading
import unittest
from pathlib import Path

from fake_server import FakeServer
from mcp_client import StdioClient
from support import TOOLS
from siue_music import sealing
from siue_music.studio import PLACEHOLDER
from test_mcp_protocol import PYTHON
from test_studio import KEY, body

TOOL_NAMES = {"studio_status", "list_pieces", "read_score", "publish_draft", "delete_draft", "delete_piece",
              "read_new_notes", "mark_notes_picked_up", "wait_for_notes"}


@unittest.skipUnless(PYTHON, "the MCP SDK is not installed here: make music-mcp-setup")
class StudioMcpTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.server = FakeServer("1" * 64, "2" * 64).__enter__()
        self.addCleanup(self.server.__exit__)
        self.server.add_ai_key(KEY, {"notes:pickup", "drafts:publish", "drafts:delete"})

    def start(self, key: str) -> StdioClient:
        env = {k: v for k, v in os.environ.items() if not k.startswith("SIUE_")}
        env |= {"SIUE_MUSIC_BASE": self.server.base, "SIUE_MUSIC_AI_KEY": key, "SIUE_MUSIC_CONFIG_DIR": str(self.root / "cfg"),
                "SIUE_MUSIC_NOTES_DIR": str(self.root / "notes"), "HOME": str(self.root)}
        client = StdioClient([PYTHON, str(TOOLS / "siue-music"), "mcp"], env)
        self.addCleanup(client.close)
        return client

    def test_with_the_placeholder_it_starts_lists_its_tools_and_says_to_make_a_key(self):
        c = self.start(PLACEHOLDER)
        init = c.initialize()
        self.assertEqual(init["serverInfo"]["name"], "siue-music")
        self.assertIn("pairing code", init["instructions"])
        self.assertIn("cannot delete notes", init["instructions"])
        tools = c.request("tools/list")["tools"]
        self.assertEqual({t["name"] for t in tools}, TOOL_NAMES)
        self.assertEqual(sorted(t["name"] for t in tools if "delete" in t["name"]), ["delete_draft", "delete_piece"], "no tool deletes notes")
        status = c.call("studio_status")
        self.assertFalse(status["connected"])
        self.assertIn("Make an AI key on Your studio", status["next"])
        self.assertIn("Make an AI key on Your studio", c.refusal("list_pieces"))
        self.assertIn("Make an AI key on Your studio", c.refusal("wait_for_notes", {"timeout_seconds": 1}))

    def test_pair_then_wait_read_and_mark_a_note(self):
        c = self.start(KEY)
        c.initialize()
        status = c.call("studio_status")
        code = status["pairing_code"]
        self.assertFalse(status["paired"])
        self.assertIn(code, status["next"])
        self.assertIn(code, c.refusal("read_new_notes"), "before pairing every notes tool gives the code")
        self.assertIn(code, "".join(c.err), "the code is also in the app's log")

        self.server.pair(KEY)
        self.assertTrue(c.call("studio_status")["paired"])
        mine = self.server.ai[KEY]["sealing"]["fingerprint"]
        spki = sealing.spki_of(base64.b64decode(json.loads((self.root / "cfg" / "sealing-key.json").read_text())["pkcs8"]))
        self.assertEqual(sealing.fingerprint(spki), mine)
        person = sealing.generate()[1]
        threading.Timer(2.5, lambda: self.server.add_note("e" * 32, sealing.seal_to(body("a slower start"), b"", [person, spki]))).start()
        waited = c.call("wait_for_notes", {"timeout_seconds": 60, "poll_seconds": 2})
        self.assertEqual([n["id"] for n in waited["notes"]], ["e" * 32])
        read = c.call("read_new_notes")
        self.assertEqual([(n["id"], n["text"]) for n in read["notes"]], [("e" * 32, "a slower start")])
        self.assertEqual(self.server.marked, [])
        self.assertEqual(c.call("mark_notes_picked_up", {"note_ids": ["e" * 32]})["marked"], ["e" * 32])
        self.assertEqual(self.server.marked, ["e" * 32])

        for line in c.raw:
            self.assertEqual(json.loads(line)["jsonrpc"], "2.0", "stdout carries only protocol messages")
        self.assertNotIn(KEY, "".join(c.raw) + "".join(c.err))

    def test_a_revoked_key_stops_working_with_what_to_do(self):
        c = self.start(KEY)
        c.initialize()
        self.assertTrue(c.call("studio_status")["connected"])
        del self.server.keys[KEY]
        self.assertIn("revoked or mistyped", c.refusal("list_pieces"))
        self.assertIn("revoked or mistyped", c.call("studio_status")["next"])


if __name__ == "__main__":
    unittest.main()
