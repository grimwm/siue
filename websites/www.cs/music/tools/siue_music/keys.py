"""The notes keys: 1Password is the home, the cache holds a working copy, the repository's public.json says which key is current."""
import base64
import binascii
import json
import os
import hmac
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from . import sealing
from .op import Op, OpError

KEY_TAG = "siue-music-key"
API_TAG = "siue-music-api"
WORKROOM_URL = "https://www.cs.siue.edu/~wgrim/music/"
_API_KEY = re.compile(r"[0-9a-f]{64}")
_API_NAME = re.compile(r"[a-z0-9][a-z0-9-]{0,47}")


class KeyMismatch(Exception):
    """The repository, 1Password and the cache disagree about the current key. Exit code 3."""


class KeysError(Exception):
    """Exit code 1."""


def display(fp: str) -> str:
    return " ".join(fp[i:i + 4] for i in range(0, 16, 4))


@dataclass
class RepoKeys:
    current: str | None
    previous: list[str] = field(default_factory=list)
    spki: dict[str, bytes] = field(default_factory=dict)


def read_repo_keys(path: Path) -> RepoKeys:
    if not path.exists():
        return RepoKeys(None, [], {})
    try:
        data = json.loads(path.read_text())
    except ValueError:
        raise KeysError(f"{path} is not JSON") from None
    if not isinstance(data, dict) or data.get("schema") != 1:
        raise KeysError(f"{path} is not a schema 1 public key file")
    spki: dict[str, bytes] = {}

    def entry(e: object) -> str:
        fp = e.get("fingerprint") if isinstance(e, dict) else None
        try:
            der = base64.b64decode(e.get("spki", ""), validate=True) if isinstance(e, dict) else b""
        except (binascii.Error, ValueError):
            der = b""
        if not isinstance(fp, str) or not der or sealing.fingerprint(der) != fp:
            raise KeysError(f"{path} names a public key whose fingerprint does not match its key")
        spki[fp] = der
        return fp

    current = entry(data["current"]) if data.get("current") else None
    previous = [entry(e) for e in data.get("previous") or []]
    return RepoKeys(current, previous, spki)


class Cache:
    """<config>/music.json: {"v": 1, "keys": {fingerprint: pkcs8 base64}, "api": {name: key}}; folder 0700, file 0600."""

    def __init__(self, path: Path):
        self.path = path

    def load(self) -> dict:
        try:
            data = json.loads(self.path.read_text())
        except FileNotFoundError:
            return {"v": 1, "keys": {}, "api": {}}
        except ValueError:
            raise KeysError(f"{self.path} is damaged: make keys-forget, then make keys-pull") from None
        if not isinstance(data, dict) or not isinstance(data.get("keys"), dict) or not isinstance(data.get("api"), dict):
            raise KeysError(f"{self.path} is damaged: make keys-forget, then make keys-pull")
        return data

    def save(self, data: dict) -> None:
        self.path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        os.chmod(self.path.parent, 0o700)
        tmp = self.path.with_name(self.path.name + ".tmp")
        tmp.unlink(missing_ok=True)
        fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        try:
            with os.fdopen(fd, "w") as f:
                os.fchmod(f.fileno(), 0o600)
                f.write(json.dumps(data))
            os.replace(tmp, self.path)
        except BaseException:
            tmp.unlink(missing_ok=True)
            raise

    def forget(self) -> bool:
        try:
            self.path.unlink()
            return True
        except FileNotFoundError:
            return False


class Keys:
    def __init__(self, op: Op, cache: Cache, public_json: Path, public_ts: Path, out: Callable[[str], None] = print):
        self.op = op
        self.cache = cache
        self.public_json = public_json
        self.public_ts = public_ts
        self.out = out

    def _ready(self) -> None:
        self.op.check_version()

    def _held(self) -> dict[str, tuple[str, dict[str, str]]]:
        """Every key item in 1Password, checked: fingerprint -> (item title, revealed fields)."""
        held: dict[str, tuple[str, dict[str, str]]] = {}
        for item in self.op.list_items(KEY_TAG):
            f = self.op.fields(item["id"])
            title = item.get("title", item["id"])
            try:
                pkcs8 = base64.b64decode(f["private_key"], validate=True)
                actual = sealing.fingerprint(sealing.spki_of(pkcs8))
            except (KeyError, binascii.Error, ValueError):
                raise KeysError(f"The 1Password item {title} does not hold a usable private key: fix the item") from None
            claimed = f.get("fingerprint", "")
            if actual != claimed:
                raise KeyMismatch(f"The 1Password item {title} holds a private key whose fingerprint is {display(actual)}, "
                                  f"not {display(claimed)}: fix the item")
            held[actual] = (title, f)
        return held

    def _api_items(self) -> list[tuple[str, str]]:
        return [(item["id"], self.op.fields(item["id"]).get("name", "")) for item in self.op.list_items(API_TAG)]

    def pull(self) -> None:
        self._ready()
        held = self._held()
        api: dict[str, str] = {}
        for item in self.op.list_items(API_TAG):
            f = self.op.fields(item["id"])
            if f.get("name") and f.get("credential"):
                api[f["name"]] = f["credential"]
        self.cache.save({"v": 1, "keys": {fp: f["private_key"] for fp, (_, f) in held.items()}, "api": api})

    def pull_checked(self) -> None:
        self.pull()
        self.ensure_synced()

    def ensure_synced(self) -> dict[str, bytes]:
        repo = read_repo_keys(self.public_json)
        if repo.current is None:
            raise KeyMismatch("No notes key yet: run make keys-init")
        wanted = [repo.current, *repo.previous]
        cached = self.cache.load()["keys"]
        if repo.current not in cached:
            self.pull()
            cached = self.cache.load()["keys"]
        if repo.current not in cached:
            unknown = [fp for fp in cached if fp not in wanted]
            if unknown:
                raise KeyMismatch(f"1Password holds a key the repository does not know ({', '.join(display(fp) for fp in unknown)}). "
                                  "The repository may be out of date: git pull, then run this again. If it is up to date, "
                                  f"the repository's key {display(repo.current)} was never saved to 1Password: run make keys-status.")
            raise KeyMismatch(f"1Password (vault {self.op.vault}) has no private key for the repository's public key "
                              f"{display(repo.current)}. Check OP_VAULT, or the key was never saved to 1Password: run make keys-status.")
        return {fp: base64.b64decode(cached[fp]) for fp in wanted if fp in cached}

    def status(self) -> int:
        repo = read_repo_keys(self.public_json)
        if repo.current is None:
            self.out("No notes key yet: run make keys-init")
            return 3
        self.out(f"Repository key: {display(repo.current)}")
        ok = True
        try:
            self._ready()
            held = sorted(self._held())
            self.out("1Password (vault " + self.op.vault + "): " + (", ".join(display(fp) for fp in held) or "no keys"))
            side_ok = repo.current in held
            self.out("1Password: match" if side_ok else "1Password: out of date: the repository's key is not saved there; run make keys-init or check OP_VAULT")
            ok &= side_ok
        except (OpError, KeysError, KeyMismatch) as e:
            self.out(f"1Password: unreachable: {e}")
            ok = False
        cache = self.cache.load()
        self.out("Cache: " + (", ".join(display(fp) for fp in cache["keys"]) or "no keys"))
        side_ok = repo.current in cache["keys"]
        self.out("Cache: match" if side_ok else "Cache: out of date: run make keys-pull")
        ok &= side_ok
        self.out("API keys: " + (", ".join(sorted(cache["api"])) or "none"))
        return 0 if ok else 3

    def forget(self) -> None:
        self.out("Forgot the cached keys." if self.cache.forget() else "Nothing cached.")

    def api_key_set(self, name: str, secret: str) -> None:
        if not _API_NAME.fullmatch(name):
            raise KeysError("the API key name is lowercase letters, digits and hyphens, e.g. music-pickup")
        if not _API_KEY.fullmatch(secret):
            raise KeysError("an API key is 64 lowercase hex characters, as the hub shows it once")
        self._ready()
        old = [item_id for item_id, existing in self._api_items() if existing == name]
        new_id = self.op.create(f"SIUE music API {name}", "API_CREDENTIAL", [API_TAG], [
            {"id": "name", "type": "STRING", "label": "name", "value": name},
            {"id": "credential", "type": "CONCEALED", "label": "credential", "value": secret},
        ], urls=[WORKROOM_URL])
        stored = self.op.fields(new_id)
        for label, want in (("name", name), ("credential", secret)):
            if not hmac.compare_digest(stored.get(label, "").encode(), want.encode()):
                self.op.archive(new_id)
                raise KeysError(f"1Password did not store the API key's {label} field as sent; the new item was removed "
                                "and the old key (if any) is untouched")
        for item_id in old:
            self.op.archive(item_id)
        self.out(f"Saved the API key {name} to 1Password (vault {self.op.vault}).")

    def api_key(self, name: str) -> str:
        api = self.cache.load()["api"]
        if name not in api:
            self.pull()
            api = self.cache.load()["api"]
        if name not in api:
            raise KeysError(f"No API key named {name} in 1Password (vault {self.op.vault}): make api-key-set NAME={name}")
        return api[name]

    def passphrase(self) -> str:
        repo = read_repo_keys(self.public_json)
        if repo.current is None:
            raise KeyMismatch("No notes key yet: run make keys-init")
        self._ready()
        held = self._held()
        if repo.current not in held:
            raise KeyMismatch(f"1Password (vault {self.op.vault}) has no private key for the repository's public key "
                              f"{display(repo.current)}. Check OP_VAULT, or the key was never saved to 1Password: run make keys-status.")
        password = held[repo.current][1].get("password")
        if not password:
            raise KeysError(f"The 1Password item {held[repo.current][0]} has no password field: fix the item")
        return password
