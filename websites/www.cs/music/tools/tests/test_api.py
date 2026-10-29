"""The tool's side of the wire formats: the draft body is exactly the SIUED1
bundle the server parses, the request declares its length, a body past the
server's 8 MB is refused before it is sent, and plain HTTP is refused."""
import io
import json
import struct
import tempfile
import unittest
import urllib.error
from pathlib import Path

import support  # noqa: F401  (puts siue_music on the path)
from siue_music.api import MAX_REQUEST_BYTES, Api, ApiError, draft_container, draft_size


CURRENT, EARLIER = "a" * 64, "b" * 64


class FakeResponse:
    status = 201

    def __init__(self, body=b'{"piece":"p","version":1}'):
        self.body = body

    def read(self):
        return self.body

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False


class ApiTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = Path(tmp.name)

    def files(self, **sizes):
        out = {}
        for name, size in sizes.items():
            path = self.dir / name.replace("_", ".")
            path.write_bytes(b"x" * size)
            out[name.replace("_", ".")] = path
        return out

    def test_the_container_has_the_documented_layout(self):
        files = self.files(score_json=5, audio_webm=3)
        body = draft_container(files)
        self.assertEqual(body[:7], b"SIUED1" + bytes([2]))
        self.assertEqual(body[7:7 + 1 + 10 + 4 + 5], bytes([10]) + b"score.json" + struct.pack(">I", 5) + b"xxxxx")
        self.assertEqual(len(body), draft_size(files))

    def test_the_request_declares_its_length_and_carries_the_piece_and_version(self):
        seen = {}

        def opener(request, timeout=None):
            seen["url"], seen["headers"], seen["data"], seen["method"] = request.full_url, dict(request.header_items()), request.data, request.get_method()
            return FakeResponse()

        files = self.files(score_json=5, audio_webm=3)
        Api("https://example.test/~wgrim/music/", "k" * 64, opener).publish_draft("ch1-labyrinth", 3, files)
        self.assertEqual(seen["url"], "https://example.test/~wgrim/music/api/drafts.php?piece=ch1-labyrinth&version=3")
        self.assertEqual((seen["method"], seen["headers"]["Content-type"]), ("POST", "application/octet-stream"))
        self.assertEqual(seen["headers"]["Content-length"], str(len(seen["data"])))
        self.assertEqual(seen["data"], draft_container(files))
        self.assertEqual(seen["headers"]["Authorization"], "Bearer " + "k" * 64)

    def test_the_published_drafts_are_listed_by_a_get_on_the_drafts_route(self):
        seen = {}
        listed = [{"piece": "ch1-labyrinth", "version": 3, "published_at": 1, "project_id": "crete", "project_name": "Crete", "kind": "music"}]

        def opener(request, timeout=None):
            seen["url"], seen["method"], seen["auth"] = request.full_url, request.get_method(), request.get_header("Authorization")
            return FakeResponse(json.dumps({"drafts": listed}).encode())

        self.assertEqual(Api("https://example.test/music/", "k" * 64, opener).drafts(), listed)
        self.assertEqual((seen["url"], seen["method"], seen["auth"]), ("https://example.test/music/api/drafts.php", "GET", "Bearer " + "k" * 64))

    def test_a_body_past_the_servers_limit_is_never_sent(self):
        sent = []
        files = self.files(audio_webm=MAX_REQUEST_BYTES)
        with self.assertRaises(ApiError):
            Api("https://example.test/music/", "k" * 64, lambda *a, **k: sent.append(a)).publish_draft("p", 1, files)
        self.assertEqual(sent, [])

    def test_a_body_of_exactly_the_limit_is_sent(self):
        files = self.files(score_json=1, audio_webm=1)
        overhead = draft_size(files) - 2
        files = self.files(score_json=1, audio_webm=MAX_REQUEST_BYTES - overhead - 1)
        self.assertEqual(draft_size(files), MAX_REQUEST_BYTES)
        sent = []
        Api("https://example.test/music/", "k" * 64, lambda r, timeout=None: (sent.append(r), FakeResponse())[1]).publish_draft("p", 1, files)
        self.assertEqual(len(sent), 1)

    def test_plain_http_is_refused_except_for_localhost(self):
        with self.assertRaises(ApiError):
            Api("http://www.cs.siue.edu/~wgrim/music/", "k" * 64)
        Api("http://localhost:5555/music/", "k" * 64)
        Api("http://127.0.0.1/music/", "k" * 64)


    def test_the_keyring_goes_to_the_keyring_route_as_a_raw_json_body_with_its_length(self):
        seen = {}

        def opener(request, timeout=None):
            seen["url"], seen["headers"], seen["data"], seen["method"] = request.full_url, dict(request.header_items()), request.data, request.get_method()
            return FakeResponse(b'{"uploaded":true}')

        locked = {"v": 1, "kdf": "PBKDF2-SHA-256", "iterations": 600000, "salt": "s", "iv": "i", "ct": "c"}
        Api("https://example.test/~wgrim/music/", "k" * 64, opener).publish_keyring(locked, CURRENT, [EARLIER])
        self.assertEqual(seen["url"], "https://example.test/~wgrim/music/api/keyring.php")
        self.assertEqual((seen["method"], json.loads(seen["data"])), ("POST", {"keyring": locked, "current": CURRENT, "previous": [EARLIER]}))
        self.assertEqual(seen["headers"]["Content-type"], "application/json")
        self.assertEqual(seen["headers"]["Content-length"], str(len(seen["data"])))
        self.assertEqual(seen["headers"]["Authorization"], "Bearer " + "k" * 64)
        self.assertNotIn("k" * 64, seen["url"])

    def test_a_429_is_retried_after_a_back_off_then_succeeds(self):
        calls, naps = [], []

        def opener(request, timeout=None):
            calls.append(request)
            if len(calls) < 3:
                raise urllib.error.HTTPError(request.full_url, 429, "Too Many Requests", {}, io.BytesIO(b'{"error":"rate_limited"}'))
            return FakeResponse(b'{"uploaded":true}')

        Api("https://example.test/music/", "k" * 64, opener, sleep=naps.append).publish_keyring({"v": 1}, CURRENT, [])
        self.assertEqual((len(calls), len(naps)), (3, 2))
        self.assertTrue(all(n > 0 for n in naps))

    def test_a_non_finite_retry_after_falls_back_to_the_default_pause(self):
        for value in ("nan", "inf", "-inf"):
            naps, calls = [], []

            def opener(request, timeout=None):
                calls.append(request)
                if len(calls) < 2:
                    raise urllib.error.HTTPError(request.full_url, 429, "Too Many Requests", {"Retry-After": value}, io.BytesIO(b"{}"))
                return FakeResponse(b"{}")

            Api("https://example.test/music/", "k" * 64, opener, sleep=naps.append).publish_keyring({"v": 1}, CURRENT, [])
            self.assertEqual(len(naps), 1, value)
            self.assertTrue(0 < naps[0] <= 60, (value, naps))

    def test_the_back_off_outlasts_the_servers_minute(self):
        from siue_music.api import RATE_LIMIT_PAUSES
        self.assertGreater(sum(RATE_LIMIT_PAUSES), 60)

    def test_a_429_that_never_clears_gives_up_with_an_api_error(self):
        def opener(request, timeout=None):
            raise urllib.error.HTTPError(request.full_url, 429, "Too Many Requests", {}, io.BytesIO(b'{"error":"rate_limited"}'))

        with self.assertRaises(ApiError) as ctx:
            Api("https://example.test/music/", "k" * 64, opener, sleep=lambda _s: None).publish_keyring({"v": 1}, CURRENT, [])
        self.assertEqual(ctx.exception.status, 429)

    def test_another_error_status_raises_with_the_servers_error_and_is_not_retried(self):
        calls = []

        def opener(request, timeout=None):
            calls.append(request)
            raise urllib.error.HTTPError(request.full_url, 403, "Forbidden", {}, io.BytesIO(b'{"error":"scope"}'))

        with self.assertRaises(ApiError) as ctx:
            Api("https://example.test/music/", "k" * 64, opener, sleep=lambda _s: None).publish_keyring({"v": 1}, CURRENT, [])
        self.assertEqual((ctx.exception.status, len(calls)), (403, 1))
        self.assertIn("scope", str(ctx.exception))


    def test_a_real_local_server_receives_the_keyring_body_and_length(self):
        import http.server
        import threading
        got = {}

        class Handler(http.server.BaseHTTPRequestHandler):
            def do_POST(self):
                got["length"] = self.headers["Content-Length"]
                got["auth"] = self.headers["Authorization"]
                got["body"] = self.rfile.read(int(self.headers["Content-Length"]))
                self.send_response(201)
                self.send_header("Content-Length", "2")
                self.end_headers()
                self.wfile.write(b"{}")

            def log_message(self, *_):
                pass

        server = http.server.HTTPServer(("127.0.0.1", 0), Handler)  # an ephemeral port
        threading.Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        Api(f"http://127.0.0.1:{server.server_port}/music/", "k" * 64).publish_keyring({"v": 1}, CURRENT, [])
        self.assertEqual((json.loads(got["body"]), got["length"], got["auth"]), ({"keyring": {"v": 1}, "current": CURRENT, "previous": []}, str(len(got["body"])), "Bearer " + "k" * 64))


    def test_a_redirect_is_refused_and_the_key_never_follows_it(self):
        import http.server
        import threading
        seen = {"target_auth": None, "target_hit": False}

        class Handler(http.server.BaseHTTPRequestHandler):
            def _go(self):
                if self.path.startswith("/target"):
                    seen["target_hit"] = True
                    seen["target_auth"] = self.headers.get("Authorization")
                    self.send_response(200)
                    self.send_header("Content-Length", "2")
                    self.end_headers()
                    self.wfile.write(b"{}")
                    return
                self.rfile.read(int(self.headers.get("Content-Length") or 0))
                self.send_response(302)
                self.send_header("Location", f"http://127.0.0.1:{self.server.server_port}/target")
                self.send_header("Content-Length", "0")
                self.end_headers()

            do_GET = do_POST = _go

            def log_message(self, *_):
                pass

        server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        with self.assertRaises(ApiError) as ctx:
            Api(f"http://127.0.0.1:{server.server_port}/music/", "k" * 64).publish_keyring({"v": 1}, CURRENT, [])
        self.assertEqual(ctx.exception.status, 302)
        self.assertFalse(seen["target_hit"], "the redirect target was never contacted")
        self.assertIsNone(seen["target_auth"])


    def probe(self, scope, code, body=b'{"error":"x"}'):
        """Api.holds against a server that answers every request with `code` (200 = success)."""
        def opener(request, timeout=None):
            if code == 200:
                return FakeResponse(b"{}")
            raise urllib.error.HTTPError(request.full_url, code, "reason", {}, io.BytesIO(body))

        api = Api("https://example.test/music/", "k" * 64, opener=opener, sleep=lambda _s: None)
        return api.holds(scope)

    def test_holds_reads_the_status_of_a_get_probe(self):
        self.assertEqual(self.probe("notes:pickup", 200), "yes")
        self.assertEqual(self.probe("notes:pickup", 403), "no")
        self.assertEqual(self.probe("notes:pickup", 401), "invalid")
        for scope in ("keys:publish", "drafts:publish"):
            self.assertEqual(self.probe(scope, 405), "yes", scope)
            self.assertEqual(self.probe(scope, 403), "no", scope)
            self.assertEqual(self.probe(scope, 401), "invalid", scope)
            self.assertEqual(self.probe(scope, 429), "unknown", scope)
            self.assertEqual(self.probe(scope, 302), "unknown", scope)
        self.assertEqual(self.probe("notes:pickup", 405), "unknown", "a pickup route never answers 405")

    def test_the_keyring_route_answers_200_or_404_to_a_key_that_may_publish_keys(self):
        self.assertEqual(self.probe("keys:publish", 200), "yes")
        self.assertEqual(self.probe("keys:publish", 404, b'{"error":"no_keyring"}'), "yes", "no keyring stored yet")
        self.assertEqual(self.probe("keys:publish", 404, b"<html>Not Found</html>"), "unknown", "a wrong address is not the music API")
        self.assertEqual(self.probe("keys:publish", 405), "yes")
        self.assertEqual(self.probe("drafts:publish", 404), "unknown", "only the keyring route reports 404 for a valid key")

    def test_keyring_fingerprints_reads_what_the_server_stores(self):
        seen = {}

        def opener(request, timeout=None):
            seen["url"], seen["method"], seen["auth"] = request.full_url, request.get_method(), request.get_header("Authorization")
            return FakeResponse(json.dumps({"current": CURRENT, "previous": [EARLIER], "uploaded_at": 1}).encode())

        got = Api("https://example.test/music/", "k" * 64, opener).keyring_fingerprints()
        self.assertEqual(got, {"current": CURRENT, "previous": [EARLIER], "uploaded_at": 1})
        self.assertEqual((seen["url"], seen["method"], seen["auth"]), ("https://example.test/music/api/keyring.php", "GET", "Bearer " + "k" * 64))

    def test_keyring_fingerprints_is_none_on_404_and_raises_on_other_errors(self):
        def refusing(code, body=b'{"error":"no_keyring"}'):
            def opener(request, timeout=None):
                raise urllib.error.HTTPError(request.full_url, code, "reason", {}, io.BytesIO(body))
            return opener

        self.assertIsNone(Api("https://example.test/music/", "k" * 64, refusing(404)).keyring_fingerprints())
        with self.assertRaises(ApiError, msg="a web server's own 404 (a wrong address) is not 'no keyring'"):
            Api("https://example.test/music/", "k" * 64, refusing(404, b"<html>Not Found</html>")).keyring_fingerprints()
        with self.assertRaises(ApiError) as ctx:
            Api("https://example.test/music/", "k" * 64, refusing(403)).keyring_fingerprints()
        self.assertEqual(ctx.exception.status, 403)

    def test_a_403_about_https_is_not_a_missing_permission(self):
        self.assertEqual(self.probe("keys:publish", 403, b'{"error":"HTTPS required."}'), "https")

    def test_delete_draft_posts_the_piece_and_version_with_the_key(self):
        seen = {}

        def opener(request, timeout=None):
            seen.update(url=request.full_url, method=request.get_method(), auth=request.get_header("Authorization"),
                        length=request.get_header("Content-length"), body=request.data)
            return FakeResponse(b'{"piece":"ch1-labyrinth","version":3,"deleted":true}')

        Api("https://example.test/music/", "k" * 64, opener).delete_draft("ch1-labyrinth", 3)
        self.assertEqual(seen, {"url": "https://example.test/music/api/delete-draft.php?piece=ch1-labyrinth&version=3",
                                "method": "POST", "auth": "Bearer " + "k" * 64, "length": "0", "body": b""})

    def test_delete_draft_raises_the_servers_refusal(self):
        def opener(request, timeout=None):
            raise urllib.error.HTTPError(request.full_url, 404, "Not Found", {}, io.BytesIO(b'{"error":"not_found"}'))

        with self.assertRaises(ApiError) as ctx:
            Api("https://example.test/music/", "k" * 64, opener).delete_draft("ch1-labyrinth", 3)
        self.assertEqual(ctx.exception.status, 404)
        self.assertIn("not_found", str(ctx.exception))

    def test_drafts_delete_is_probed_on_its_own_route(self):
        self.assertEqual(self.probe("drafts:delete", 405), "yes")
        self.assertEqual(self.probe("drafts:delete", 403), "no")
        self.assertEqual(self.probe("drafts:delete", 401), "invalid")

    def test_holds_only_makes_get_requests(self):
        methods = []

        def opener(request, timeout=None):
            methods.append(request.get_method())
            raise urllib.error.HTTPError(request.full_url, 405, "m", {}, io.BytesIO(b"{}"))

        api = Api("https://example.test/music/", "k" * 64, opener=opener)
        for scope in ("notes:pickup", "keys:publish", "drafts:publish", "drafts:delete"):
            api.holds(scope)
        self.assertEqual(set(methods), {"GET"})


if __name__ == "__main__":
    unittest.main()
