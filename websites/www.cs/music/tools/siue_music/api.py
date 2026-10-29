"""The workroom's HTTP API as the owner's tool speaks it: Bearer key, HTTPS, raw bodies with their length declared."""
import json
import math
import struct
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Callable, Mapping

MAX_REQUEST_BYTES = 8_388_608  # what the server accepts in one draft request
DRAFT_MAGIC = b"SIUED1"
TIMEOUT_SECONDS = 30
RATE_LIMIT_PAUSES = (2.0, 5.0, 15.0, 40.0)  # the server counts 60 calls in a sliding minute; the pauses add up to more than that, so a 429 clears
MAX_RETRY_AFTER = 60.0
_LOCAL_HOSTS = ("localhost", "127.0.0.1")


class _NeverRedirect(urllib.request.HTTPRedirectHandler):
    """A redirect would forward the Bearer key, or turn a POST into a GET that reports a false success: never follow one."""

    def redirect_request(self, *_args, **_kwargs):
        return None


def default_opener(request, timeout=None):
    return urllib.request.build_opener(_NeverRedirect).open(request, timeout=timeout)


class ApiError(Exception):
    def __init__(self, message: str, status: int = 0):
        super().__init__(message)
        self.status = status


def draft_size(files: Mapping[str, Path]) -> int:
    """The SIUED1 body's length in bytes."""
    return len(DRAFT_MAGIC) + 1 + sum(1 + len(name.encode()) + 4 + Path(path).stat().st_size for name, path in files.items())


def draft_container(files: Mapping[str, Path]) -> bytes:
    """The SIUED1 bundle: magic, a file count byte, then per file a name length byte, the name, a big-endian u32 size and the bytes."""
    out = bytearray(DRAFT_MAGIC + bytes([len(files)]))
    for name, path in files.items():
        raw, data = name.encode(), Path(path).read_bytes()
        out += bytes([len(raw)]) + raw + struct.pack(">I", len(data)) + data
    return bytes(out)


class Api:
    """HTTPS only (http:// allowed only for localhost and 127.0.0.1, the local docker check)."""

    def __init__(self, base: str, key: str, opener: Callable = default_opener, sleep: Callable[[float], None] = time.sleep):
        parts = urllib.parse.urlsplit(base)
        if parts.scheme != "https" and not (parts.scheme == "http" and parts.hostname in _LOCAL_HOSTS):
            raise ApiError("the workroom address must be https:// (http:// is only for localhost)")
        self.base = base if base.endswith("/") else base + "/"
        self._key = key
        self._open = opener
        self._sleep = sleep

    def _request(self, method: str, route: str, query: Mapping[str, object] | None = None, body: bytes | None = None,
                 content_type: str | None = None) -> bytes:
        url = self.base + route + ("?" + urllib.parse.urlencode(query) if query else "")
        headers = {"Authorization": "Bearer " + self._key}
        if body is not None:
            headers["Content-Type"] = content_type or "application/octet-stream"
            headers["Content-Length"] = str(len(body))
        request = urllib.request.Request(url, data=body, headers=headers, method=method)
        for attempt in range(len(RATE_LIMIT_PAUSES) + 1):
            try:
                with self._open(request, timeout=TIMEOUT_SECONDS) as response:
                    status, payload = getattr(response, "status", 200), response.read()
                if not 200 <= status < 300:
                    raise ApiError(f"{route} answered {status}", status)
                return payload
            except urllib.error.HTTPError as e:
                detail = _error_text(e)
                e.close()
                if e.code == 429 and attempt < len(RATE_LIMIT_PAUSES):
                    self._sleep(_pause(e, RATE_LIMIT_PAUSES[attempt]))
                    continue
                if 300 <= e.code < 400:
                    raise ApiError(f"{route} was redirected ({e.code}); the tool does not follow redirects: check the workroom address", e.code) from None
                raise ApiError(f"{route} answered {e.code}: {detail}", e.code) from None
            except urllib.error.URLError as e:
                raise ApiError(f"{route} could not be reached: {e.reason}") from None
            except OSError as e:
                raise ApiError(f"{route} could not be reached: {e}") from None
        raise AssertionError("unreachable")

    def waiting(self) -> list[dict]:
        data = json.loads(self._request("GET", "api/notes.php", {"state": "waiting"}))
        return data["notes"]

    def note(self, note_id: str) -> bytes:
        return self._request("GET", "api/note.php", {"id": note_id})

    def mark_picked_up(self, note_id: str) -> None:
        self._request("POST", "api/picked-up.php", {"id": note_id}, body=b"")

    def publish_draft(self, piece: str, version: int, files: Mapping[str, Path]) -> None:
        size = draft_size(files)
        if size > MAX_REQUEST_BYTES:
            raise ApiError(f"the draft is {size} bytes; the server accepts at most {MAX_REQUEST_BYTES}")
        self._request("POST", "api/drafts.php", {"piece": piece, "version": version}, draft_container(files))

    def delete_draft(self, piece: str, version: int) -> None:
        """Deletes one published draft (its row and files) with a drafts:delete key; a draft the server does not hold raises 404."""
        self._request("POST", "api/delete-draft.php", {"piece": piece, "version": version}, body=b"")

    def holds(self, scope: str) -> str:
        """Whether this key holds `scope`, by a GET that changes nothing: "yes", "no" (403), "invalid" (401: revoked or
        mistyped), "https" (403 because the address is not https://) or "unknown" (the server could not be asked).
        The publish and delete routes answer a GET 405 once the key is accepted; the keyring route answers 200, or 404 while none is stored."""
        routes = {"notes:pickup": ("api/notes.php", {"state": "waiting"}), "keys:publish": ("api/keyring.php", None),
                  "drafts:publish": ("api/drafts.php", None), "drafts:delete": ("api/delete-draft.php", None)}
        if scope not in routes:
            raise ValueError(f"cannot probe {scope}")
        route, query = routes[scope]
        try:
            self._request("GET", route, query)
            return "yes"
        except ApiError as e:
            if (e.status == 405 and scope != "notes:pickup") or (e.status == 404 and scope == "keys:publish" and _no_keyring(e)):
                return "yes"
            if e.status == 403 and "HTTPS required" in str(e):
                return "https"
            return {401: "invalid", 403: "no"}.get(e.status, "unknown")

    def publish_keyring(self, locked: dict, current: str, previous: list[str]) -> None:
        """Uploads the locked keyring with the fingerprints of the key it holds: the current one, then the earlier ones."""
        body = {"keyring": locked, "current": current, "previous": previous}
        self._request("POST", "api/keyring.php", body=json.dumps(body).encode(), content_type="application/json")

    def keyring_fingerprints(self) -> dict | None:
        """{"current", "previous", "uploaded_at"} as the server stores them, or None while no keyring is stored."""
        try:
            return json.loads(self._request("GET", "api/keyring.php"))
        except ApiError as e:
            if e.status == 404 and _no_keyring(e):
                return None
            raise


def _no_keyring(e: ApiError) -> bool:
    """A 404 the music API sent on purpose because no keyring is stored, not a wrong address or a web server's own 404."""
    return str(e).endswith(": no_keyring")


def _error_text(e: urllib.error.HTTPError) -> str:
    try:
        data = json.loads(e.read())
        return str(data.get("error", e.reason)) if isinstance(data, dict) else str(e.reason)
    except (ValueError, OSError):
        return str(e.reason)


def _pause(e: urllib.error.HTTPError, default: float) -> float:
    try:
        asked = float(e.headers.get("Retry-After", ""))
    except (TypeError, ValueError, AttributeError):
        return default
    if not math.isfinite(asked):
        return default
    return min(max(asked, default), MAX_RETRY_AFTER)
