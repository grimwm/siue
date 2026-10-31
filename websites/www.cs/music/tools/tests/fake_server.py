"""The music API's key routes over real HTTP on 127.0.0.1, for tests that run the tool in another process: it lists, serves
and marks notes for the pickup key, and lists, keeps and deletes drafts for the publish key, as music/lib/Api.php does."""
import hashlib
import json
import threading
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class FakeServer:
    def __init__(self, pickup_key: str, publish_key: str):
        self.keys = {pickup_key: {"notes:pickup"}, publish_key: {"drafts:publish", "drafts:delete"}}
        # Studio AI keys (add_ai_key): their label, their sealing key {"spki", "fingerprint", "paired"} and their scopes.
        self.ai: dict[str, dict] = {}
        self.scores: dict[tuple[str, int], bytes] = {}
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

    def add_ai_key(self, key: str, scopes: set[str], label: str = "my assistant") -> None:
        """A studio AI key, as Your studio makes it: the notes it lists are only those sealed to its paired key."""
        self.keys[key] = set(scopes)
        self.ai[key] = {"label": label, "sealing": None}

    def pair(self, key: str) -> None:
        """What the person's browser does on Your studio once the code matches."""
        self.ai[key]["sealing"]["paired"] = True

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
        scopes = s.keys.get(auth.removeprefix("Bearer ")) if auth.startswith("Bearer ") else None
        if scopes is None:
            return self._json(401, {"error": "key"})
        route = url.path.removeprefix("/music/")
        ai = s.ai.get(auth.removeprefix("Bearer "))
        if route == "api/seal-key.php":
            return self._seal(s, ai, scopes, method)
        need = {"api/draft.php": "drafts:publish", "api/delete-piece.php": "drafts:delete", "api/notes.php": "notes:pickup", "api/note.php": "notes:pickup", "api/picked-up.php": "notes:pickup",
                "api/drafts.php": "drafts:publish", "api/delete-draft.php": "drafts:delete"}.get(route)
        if need is None:
            return self._json(404, {"error": "not_found"})
        if need not in scopes:
            return self._json(403, {"error": "scope"})
        body = self.rfile.read(int(self.headers.get("Content-Length") or 0)) if method == "POST" else b""
        with s.lock:
            visible = {i: b for i, b in s.notes.items() if ai is None or self._sealed_to(ai, b)}
            if route == "api/notes.php" and method == "GET":
                listed = [{"id": i, "size": len(b), "sha256": hashlib.sha256(b).hexdigest(), "arrived_at": 1_800_000_000 + n}
                          for n, (i, b) in enumerate(visible.items()) if i not in s.marked]
                return self._json(200, {"notes": listed})
            if route == "api/note.php" and method == "GET" and query.get("id") in visible:
                return self._send(200, s.notes[query["id"]], "application/octet-stream")
            if route == "api/draft.php" and method == "GET":
                found = s.scores.get((query.get("piece", ""), int(query.get("version", "0"))))
                return self._send(200, found) if found is not None else self._json(404, {"error": "not_found"})
            if route == "api/delete-piece.php" and method == "POST":
                gone = [d for d in s.drafts if d["piece"] == query.get("piece")]
                if not gone:
                    return self._json(404, {"error": "not_found"})
                s.drafts = [d for d in s.drafts if d["piece"] != query.get("piece")]
                return self._json(200, {"piece": query["piece"], "deleted": len(gone)})
            if route == "api/picked-up.php" and method == "POST" and query.get("id") in visible:
                s.marked.append(query["id"])
                return self._json(200, {"id": query["id"], "picked_up": True})
            if route == "api/drafts.php" and method == "GET":
                return self._json(200, {"drafts": s.drafts})
            if route == "api/drafts.php" and method == "POST":
                if any((d["piece"], d["version"]) == (query["piece"], int(query["version"])) for d in s.drafts):
                    return self._json(409, {"error": "exists"})
                s.drafts.insert(0, {"piece": query["piece"], "version": int(query["version"]), "published_at": 1_800_000_000,
                                    "project_id": "", "project_name": "", "kind": "music", "bytes": len(body)})
                if body[:6] == b"SIUED1" and body[8:18] == b"score.json":  # the magic, a count, a name length, the name
                    size = int.from_bytes(body[18:22], "big")
                    s.scores[(query["piece"], int(query["version"]))] = body[22:22 + size]
                return self._json(201, {"piece": query["piece"], "version": int(query["version"])})
            if route == "api/delete-draft.php" and method == "POST":
                kept = [d for d in s.drafts if (d["piece"], str(d["version"])) != (query.get("piece"), query.get("version"))]
                if len(kept) == len(s.drafts):
                    return self._json(404, {"error": "not_found"})
                s.drafts = kept
                return self._json(200, {"piece": query["piece"], "version": int(query["version"]), "deleted": True})
            if route in ("api/note.php", "api/picked-up.php"):
                return self._json(404, {"error": "not_found"})
        return self._json(405, {"error": "method"})

    @staticmethod
    def _sealed_to(ai: dict, sealed: bytes) -> bool:
        from siue_music.sealing import recipients
        seal = ai.get("sealing")
        return bool(seal and seal.get("paired") and seal["fingerprint"] in (recipients(sealed) or []))

    def _seal(self, s: FakeServer, ai: dict | None, scopes: set[str], method: str) -> None:
        import base64
        from siue_music.studio import pairing_code
        if ai is None:
            return self._json(403, {"error": "not_ai_key"})
        if method == "POST":
            if "notes:pickup" not in scopes:
                return self._json(403, {"error": "scope"})
            spki = base64.b64decode(json.loads(self.rfile.read(int(self.headers.get("Content-Length") or 0)))["spki"])
            fp = hashlib.sha256(spki).hexdigest()
            with s.lock:
                seal = ai["sealing"]
                if seal and seal["fingerprint"] != fp and seal["paired"]:
                    return self._json(409, {"error": "paired"})
                if not seal or seal["fingerprint"] != fp:
                    ai["sealing"] = {"fingerprint": fp, "paired": False}
        seal = ai["sealing"]
        out = None if seal is None else {"fingerprint": seal["fingerprint"], "code": pairing_code(seal["fingerprint"]), "paired": seal["paired"], "paired_at": None}
        return self._json(200, {"label": ai["label"], "scopes": sorted(scopes), "sealing": out})

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")

    def do_DELETE(self):
        self._route("DELETE")
