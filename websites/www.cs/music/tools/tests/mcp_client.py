"""A minimal MCP client over stdio for tests: starts a server command, initializes, calls tools, and keeps every line it
read from stdout and stderr so a test can check nothing but protocol went to stdout and no key leaked."""
import json
import queue
import subprocess
import threading
import time


class StdioClient:
    def __init__(self, argv: list[str], env: dict[str, str]):
        self.proc = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, text=True, encoding="utf-8")
        self.lines: queue.Queue[str] = queue.Queue()
        self.raw: list[str] = []
        self.err: list[str] = []
        self.next_id = 0
        threading.Thread(target=self._read, daemon=True).start()
        threading.Thread(target=lambda: self.err.extend(self.proc.stderr), daemon=True).start()

    def _read(self):
        for line in self.proc.stdout:
            self.raw.append(line)
            self.lines.put(line)

    def close(self) -> None:
        if self.proc.poll() is None:
            self.proc.stdin.close()
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait()
        self.proc.stdout.close()
        self.proc.stderr.close()

    def send(self, message: dict) -> None:
        self.proc.stdin.write(json.dumps(message) + "\n")
        self.proc.stdin.flush()

    def request(self, method: str, params: dict | None = None, timeout: float = 60) -> dict:
        self.next_id += 1
        self.send({"jsonrpc": "2.0", "id": self.next_id, "method": method, **({"params": params} if params is not None else {})})
        end = time.monotonic() + timeout
        while True:
            try:
                message = json.loads(self.lines.get(timeout=max(0.1, end - time.monotonic())))
            except queue.Empty:
                raise AssertionError(f"no answer to {method} in {timeout} s; stderr: {''.join(self.err)[-2000:]}") from None
            if message.get("id") == self.next_id:
                if "error" in message:
                    raise AssertionError(message)
                return message["result"]

    def initialize(self) -> dict:
        result = self.request("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "test", "version": "1"}})
        self.send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        return result

    def call(self, name: str, arguments: dict | None = None, timeout: float = 60) -> dict:
        """The tool's structured answer; AssertionError with its words when the tool refused."""
        result = self.request("tools/call", {"name": name, "arguments": arguments or {}}, timeout)
        if result.get("isError"):
            raise AssertionError(result["content"][0]["text"])
        return result["structuredContent"]

    def refusal(self, name: str, arguments: dict | None = None, timeout: float = 60) -> str:
        """The words of a tool's refusal; AssertionError when it did not refuse."""
        result = self.request("tools/call", {"name": name, "arguments": arguments or {}}, timeout)
        if not result.get("isError"):
            raise AssertionError(f"{name} did not refuse: {result}")
        return result["content"][0]["text"]
