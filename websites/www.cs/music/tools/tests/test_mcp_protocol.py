"""`siue-music owner-mcp` over stdio as an MCP client sees it: it starts, initializes, lists its tools (delete_draft is the one
delete), and its list, wait, pickup and delete tools answer from a fake API on 127.0.0.1, with every line on stdout a JSON-RPC message and no key
in anything it says. It needs the MCP SDK: this Python's, or the tool's virtualenv (make music-mcp-setup)."""
import json
import os
import queue
import subprocess
import sys
import threading
import time
import unittest

from fake_server import FakeServer
from support import TOOLS, World, pool_key
from siue_music import sealing

PICKUP, PUBLISH = "3" * 64, "4" * 64
NOTE = "d" * 32
TOOL_NAMES = {"list_pieces", "read_score", "publish_draft", "delete_draft", "pick_up_notes", "read_notes", "wait_for_notes"}


def python_with_mcp() -> str | None:
    for candidate in (sys.executable, str(TOOLS / ".venv" / "bin" / "python")):
        if os.path.exists(candidate) and subprocess.run([candidate, "-c", "import mcp.server.mcpserver"], capture_output=True).returncode == 0:
            return candidate
    return None


PYTHON = python_with_mcp()


@unittest.skipUnless(PYTHON, "the MCP SDK is not installed here: make music-mcp-setup")
class McpProtocolTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.w.add_key_to_op(0)
        self.w.keys.api_key_set("music-pickup", PICKUP)
        self.w.keys.api_key_set("music-publish", PUBLISH)
        self.w.keys.pull()
        self.server = FakeServer(PICKUP, PUBLISH).__enter__()
        self.addCleanup(self.server.__exit__)
        self.server.drafts = [{"piece": "test-piece", "version": 2, "published_at": 1_800_000_000, "project_id": "crete",
                               "project_name": "Crete", "kind": "music"}]
        env = {**os.environ, "SIUE_CONFIG_DIR": str(self.w.root / "config" / "siue"), "SIUE_MUSIC_BASE": self.server.base,
               "SIUE_MUSIC_NOTES_DIR": str(self.w.root / "notes"), "OP_VAULT": "SIUE",
               "SIUE_OP": f"{sys.executable} {TOOLS / 'tests' / 'fake_op.py'}"}
        self.proc = subprocess.Popen([PYTHON, str(TOOLS / "siue-music"), "owner-mcp"], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                     stderr=subprocess.PIPE, env=env, text=True, encoding="utf-8")
        self.addCleanup(self.stop)
        self.lines: queue.Queue[str] = queue.Queue()
        self.raw: list[str] = []
        self.err: list[str] = []
        threading.Thread(target=self._read, daemon=True).start()
        threading.Thread(target=lambda: self.err.extend(self.proc.stderr), daemon=True).start()
        self.next_id = 0

    def stop(self):
        if self.proc.poll() is None:
            self.proc.stdin.close()
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait()
        self.proc.stdout.close()
        self.proc.stderr.close()

    def _read(self):
        for line in self.proc.stdout:
            self.raw.append(line)
            self.lines.put(line)

    def send(self, message: dict) -> None:
        self.proc.stdin.write(json.dumps(message) + "\n")
        self.proc.stdin.flush()

    def request(self, method: str, params: dict | None = None, timeout: float = 30) -> dict:
        self.next_id += 1
        self.send({"jsonrpc": "2.0", "id": self.next_id, "method": method, **({"params": params} if params is not None else {})})
        return self.answer(self.next_id, timeout)

    def answer(self, wanted: int, timeout: float) -> dict:
        end = time.monotonic() + timeout
        while True:
            try:
                message = json.loads(self.lines.get(timeout=max(0.1, end - time.monotonic())))
            except queue.Empty:
                self.fail(f"no answer to request {wanted} in {timeout} s; stderr: {''.join(self.err)[-2000:]}")
            if message.get("id") == wanted:
                self.assertNotIn("error", message, message)
                return message["result"]

    def call(self, name: str, arguments: dict, timeout: float = 30) -> dict:
        result = self.request("tools/call", {"name": name, "arguments": arguments}, timeout)
        self.assertFalse(result.get("isError"), result)
        return result["structuredContent"]

    def initialize(self) -> dict:
        result = self.request("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "test", "version": "1"}})
        self.send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        return result

    def test_initialize_and_list_the_tools(self):
        result = self.initialize()
        self.assertEqual(result["serverInfo"]["name"], "siue-music-owner")
        self.assertIn("delete_draft", result["instructions"])
        self.assertIn("cannot delete notes", result["instructions"])
        tools = self.request("tools/list")["tools"]
        self.assertEqual({t["name"] for t in tools}, TOOL_NAMES)
        wait = next(t for t in tools if t["name"] == "wait_for_notes")
        self.assertIn("timeout_seconds", wait["inputSchema"]["required"])
        for t in tools:
            self.assertTrue(t["description"], t["name"])
        self.assertEqual([t["name"] for t in tools if "delete" in t["name"]], ["delete_draft"])
        delete = next(t for t in tools if t["name"] == "delete_draft")
        self.assertEqual(sorted(delete["inputSchema"]["required"]), ["piece", "version"])

    def test_list_then_wait_then_pick_up_against_the_fake_api(self):
        self.initialize()
        listed = self.call("list_pieces", {})
        self.assertEqual((listed["server"], listed["published"]), (self.server.base, self.server.drafts))
        self.assertIsInstance(listed["local"], list)

        _, _, spki = pool_key(0)
        body = {"v": 1, "kind": "text", "piece": "general", "draft": 1, "from": 0, "to": 0, "fromBar": None, "toBar": None, "lane": None,
                "text": "a slower start", "reaction": None, "curve": None, "audio": None, "made": "2027-01-15T08:00:00.000Z"}
        threading.Timer(2.5, lambda: self.server.add_note(NOTE, sealing.seal(body, b"", spki))).start()
        started = time.monotonic()
        self.next_id += 1
        self.send({"jsonrpc": "2.0", "id": self.next_id, "method": "tools/call",
                   "params": {"name": "wait_for_notes", "arguments": {"timeout_seconds": 60, "poll_seconds": 2}, "_meta": {"progressToken": "w"}}})
        result = self.answer(self.next_id, 60)
        self.assertFalse(result.get("isError"), result)
        waited = result["structuredContent"]
        progress = [json.loads(l) for l in self.raw if '"notifications/progress"' in l]
        self.assertTrue(progress and progress[0]["params"]["progressToken"] == "w", "each empty poll is reported as progress")
        self.assertLess(time.monotonic() - started, 30, "it answered when the note arrived, not at the timeout")
        self.assertEqual((waited["waiting"], waited["timed_out"], [n["id"] for n in waited["notes"]]), (1, False, [NOTE]))
        self.assertEqual(self.server.marked, [], "waiting marks nothing")

        picked = self.call("pick_up_notes", {}, timeout=60)
        [note] = picked["notes"]
        self.assertEqual((note["id"], note["text"], note["general"]), (NOTE, "a slower start", True))
        self.assertEqual(self.server.marked, [NOTE])
        self.assertEqual(self.call("read_notes", {"limit": 5})["notes"][0]["id"], NOTE)

        for line in self.raw:
            self.assertEqual(json.loads(line)["jsonrpc"], "2.0", "stdout carries only protocol messages")
        everything = "".join(self.raw) + "".join(self.err)
        for secret in (PICKUP, PUBLISH):
            self.assertNotIn(secret, everything)

    def test_a_refusal_is_a_tool_error_not_a_crash(self):
        self.initialize()
        result = self.request("tools/call", {"name": "read_score", "arguments": {"piece": "../etc"}})
        self.assertTrue(result["isError"])
        self.assertIn("not a piece id", result["content"][0]["text"])
        self.assertEqual(self.call("list_pieces", {})["server"], self.server.base, "the server still answers")

    def test_delete_a_draft_and_a_key_without_the_permission(self):
        self.initialize()
        self.server.drafts.append({"piece": "test-piece", "version": 1, "published_at": 1_700_000_000, "project_id": "crete",
                                   "project_name": "Crete", "kind": "music"})
        self.assertEqual(self.call("delete_draft", {"piece": "test-piece", "version": 2})["deleted"], True)
        self.assertEqual([(d["piece"], d["version"]) for d in self.call("list_pieces", {})["published"]], [("test-piece", 1)])
        self.assertIn("POST /music/api/delete-draft.php", self.server.requests)

        result = self.request("tools/call", {"name": "delete_draft", "arguments": {"piece": "test-piece", "version": 2}})
        self.assertTrue(result["isError"])
        self.assertIn("does not hold test-piece v2", result["content"][0]["text"])

        self.server.keys[PUBLISH].discard("drafts:delete")
        result = self.request("tools/call", {"name": "delete_draft", "arguments": {"piece": "test-piece", "version": 1}})
        self.assertTrue(result["isError"])
        self.assertIn("drafts:delete", result["content"][0]["text"])
        self.assertIn("make music-setup", result["content"][0]["text"])
        self.assertEqual(len(self.server.drafts), 1, "the refused delete removed nothing")

        result = self.request("tools/call", {"name": "delete_draft", "arguments": {"piece": "general", "version": 1}})
        self.assertTrue(result["isError"])


if __name__ == "__main__":
    unittest.main()
