"""The music API's key routes over real HTTP on 127.0.0.1, for tests that run the tool in another process: it lists, serves
and marks notes for the pickup key, and lists and keeps drafts for the publish key, as music/lib/Api.php does."""
import hashlib
import json
import threading
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class FakeServer:
    def __init__(self, pickup_key: str, publish_key: str):
        self.keys = {pickup_key: "notes:pickup", publish_key: "drafts:publish"}
        self.notes: dict[str, bytes] = {}
        self.marked: list[str] = []
        self.drafts: list[dict] = []
        self.requests: list[str] = []
        self.lock = threading.Lock()
        handler = type("Handler", (_Handler,), {"server_state": self})
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)

    @property
    def base(self) -> str:
        return f"http://127.0.0.1:{self.httpd.server_address[1]}/music/"

    def add_note(self, note_id: str, sealed: bytes) -> None:
        with self.lock:
            self.notes[note_id] = sealed

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *_):
        self.httpd.shutdown()
        self.httpd.server_close()


class _Handler(BaseHTTPRequestHandler):
    server_state: FakeServer

    def log_message(self, *_):
        pass

    def _send(self, status: int, body: bytes, kind: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, data) -> None:
        self._send(status, json.dumps(data).encode())

    def _route(self, method: str) -> None:
        s = self.server_state
        url = urllib.parse.urlsplit(self.path)
        query = dict(urllib.parse.parse_qsl(url.query))
        s.requests.append(f"{method} {url.path}")
        auth = self.headers.get("Authorization", "")
        scope = s.keys.get(auth.removeprefix("Bearer ")) if auth.startswith("Bearer ") else None
        if scope is None:
            return self._json(401, {"error": "key"})
        route = url.path.removeprefix("/music/")
        need = {"api/notes.php": "notes:pickup", "api/note.php": "notes:pickup", "api/picked-up.php": "notes:pickup",
                "api/drafts.php": "drafts:publish"}.get(route)
        if need is None:
            return self._json(404, {"error": "not_found"})
        if need != scope:
            return self._json(403, {"error": "scope"})
        body = self.rfile.read(int(self.headers.get("Content-Length") or 0)) if method == "POST" else b""
        with s.lock:
            if route == "api/notes.php" and method == "GET":
                listed = [{"id": i, "size": len(b), "sha256": hashlib.sha256(b).hexdigest(), "arrived_at": 1_800_000_000 + n}
                          for n, (i, b) in enumerate(s.notes.items()) if i not in s.marked]
                return self._json(200, {"notes": listed})
            if route == "api/note.php" and method == "GET" and query.get("id") in s.notes:
                return self._send(200, s.notes[query["id"]], "application/octet-stream")
            if route == "api/picked-up.php" and method == "POST" and query.get("id") in s.notes:
                s.marked.append(query["id"])
                return self._json(200, {"id": query["id"], "picked_up": True})
            if route == "api/drafts.php" and method == "GET":
                return self._json(200, {"drafts": s.drafts})
            if route == "api/drafts.php" and method == "POST":
                s.drafts.insert(0, {"piece": query["piece"], "version": int(query["version"]), "published_at": 1_800_000_000,
                                    "project_id": "", "project_name": "", "kind": "music", "bytes": len(body)})
                return self._json(201, {"piece": query["piece"], "version": int(query["version"])})
        return self._json(405, {"error": "method"})

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")

    def do_DELETE(self):
        self._route("DELETE")
