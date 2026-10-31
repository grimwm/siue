"""The notes keys: 1Password is the home and says which key is current (the item not marked "(previous)"); the cache holds a working copy."""
import base64
import binascii
import json
import os
import hmac
import re
from pathlib import Path
from typing import Callable
from urllib.parse import urljoin

from . import sealing
from .api import ApiError
from .op import Op, OpError
from .paths import DEFAULT_BASE

KEY_TAG = "siue-music-key"
API_TAG = "siue-music-api"
_API_KEY = re.compile(r"[0-9a-f]{64}")
_API_NAME = re.compile(r"[a-z0-9][a-z0-9-]{0,47}")
KEY_TITLE = "SIUE music notes key"
PREVIOUS_SUFFIX = " (previous)"
PUBLISH_KEY = "music-publish"
PICKUP_KEY = "music-pickup"
KEY_KINDS = ("Two kinds of key:\n"
             "  NOTES KEY  seals your notes so only you can open them (kept in 1Password).\n"
             "  API KEYS   (music-publish, music-pickup) let this tool talk to the server.")
# A key that publishes drafts may also delete them; drafts:delete is optional, so WANT leaves it out.
PUBLISH_SCOPES = ("drafts:publish", "keys:publish", "drafts:delete")
PICKUP_SCOPES = ("notes:pickup",)

ApiCheck = Callable[[str], "object"]  # secret -> something with holds(scope)


SCOPE_ROUTES = ("notes:pickup", "keys:publish", "drafts:publish")
WANT = {PICKUP_KEY: ("notes:pickup",), PUBLISH_KEY: ("keys:publish", "drafts:publish")}


def probe_states(api: object) -> dict[str, str]:
    """What the server says this API key may do: scope -> yes | no | invalid | https | unknown."""
    return {scope: api.holds(scope) for scope in SCOPE_ROUTES}  # type: ignore[attr-defined]


def _other(name: str) -> str:
    return PUBLISH_KEY if name == PICKUP_KEY else PICKUP_KEY


def is_misnamed(name: str, states: dict[str, str]) -> bool:
    """The key saved as `name` lacks what `name` needs and has everything the other key needs."""
    lacks = any(states[s] == "no" for s in WANT[name])
    return lacks and all(states[s] == "yes" for s in WANT[_other(name)])


def api_problem(name: str, states: dict[str, str]) -> str | None:
    """One line on why the key saved as `name` does not do its job, or None when it does (or cannot be checked)."""
    if "https" in states.values():
        return ("The server refused the check because the address is not https:// "
                "(set SIUE_MUSIC_BASE to the https:// workroom address).")
    if "invalid" in states.values():
        return f"The {name} API key no longer works (revoked or mistyped)."
    missing = [s for s in WANT[name] if states[s] == "no"]
    if not missing:
        return None
    if is_misnamed(name, states):
        return f"The key saved as {name} is really the {_other(name)} key (it has that key's permissions, not {name}'s)."
    return f"The {name} API key lacks the {' and '.join(missing)} permission."


class KeyMismatch(Exception):
    """1Password and the cache disagree about the current key, or one of them has none. Exit code 3."""


class KeysError(Exception):
    """Exit code 1."""


class NotUploaded(Exception):
    """The keys changed but the locked keyring did not reach the server. Exit code 4."""


def display(fp: str) -> str:
    return " ".join(fp[i:i + 4] for i in range(0, len(fp), 4))


class Cache:
    """<config>/music.json: {"v": 1, "keys": {fingerprint: pkcs8 base64}, "api": {name: key}, "current": fingerprint, "previous": [fingerprint, ...]}; folder 0700, file 0600.
    "current" and "previous" are not secret: they record which keys 1Password named when the cache was last filled."""

    def __init__(self, path: Path):
        self.path = path

    def load(self) -> dict:
        try:
            data = json.loads(self.path.read_text())
        except FileNotFoundError:
            return {"v": 1, "keys": {}, "api": {}}
        except ValueError:
            raise KeysError(f"{self.path} is damaged: make music-forget, then make music-setup") from None
        if not isinstance(data, dict) or not isinstance(data.get("keys"), dict) or not isinstance(data.get("api"), dict):
            raise KeysError(f"{self.path} is damaged: make music-forget, then make music-setup")
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
    def __init__(self, op: Op, cache: Cache, out: Callable[[str], None] = print, base: str = DEFAULT_BASE):
        self.op = op
        self.cache = cache
        self.out = out
        self.base = base if base.endswith("/") else base + "/"

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

    def _roles(self, held: dict[str, tuple[str, dict[str, str]]]) -> tuple[str | None, list[str]]:
        """(the current key, the previous keys): the current one is the item whose title does not end in "(previous)"."""
        current = [fp for fp, (title, _) in held.items() if not title.endswith(PREVIOUS_SUFFIX)]
        previous = [fp for fp, (title, _) in held.items() if title.endswith(PREVIOUS_SUFFIX)]
        if len(current) > 1:
            titles = ", ".join(held[fp][0] for fp in current)
            raise KeysError(f"1Password (vault {self.op.vault}) has {len(current)} notes key items that are not marked{PREVIOUS_SUFFIX} ({titles}). "
                            f"Only the current key may lack it: add{PREVIOUS_SUFFIX} to the title of every other one.")
        if held and not current:
            raise KeysError(f"Every notes key item in 1Password (vault {self.op.vault}) is marked{PREVIOUS_SUFFIX}, so none is current. "
                            f"Remove{PREVIOUS_SUFFIX} from the title of the key to use now.")
        return (current[0] if current else None), previous

    def _api_items(self) -> list[tuple[str, str]]:
        return [(item["id"], self.op.fields(item["id"]).get("name", "")) for item in self.op.list_items(API_TAG)]

    def pull(self) -> None:
        self._ready()
        held = self._held()
        current, previous = self._roles(held)
        api: dict[str, str] = {}
        for item in self.op.list_items(API_TAG):
            f = self.op.fields(item["id"])
            if f.get("name") and f.get("credential"):
                api[f["name"]] = f["credential"]
        data = self.cache.load()
        cached = data["keys"]
        only_here = [fp for fp in cached if fp not in held]
        for fp in only_here:
            self._verified(fp, cached[fp])
            self.out(f"Only this computer holds key {display(fp)}; it is kept.")
        data.update({"keys": {**cached, **{fp: f["private_key"] for fp, (_, f) in held.items()}}, "api": api,
                     "current": current, "previous": [*previous, *only_here]})
        self.cache.save(data)

    @staticmethod
    def _verified(fp: str, encoded: object) -> bytes:
        """A cached private key's DER, proven to belong to the fingerprint it is filed under."""
        try:
            pkcs8 = base64.b64decode(encoded, validate=True)  # type: ignore[arg-type]
            ok = sealing.fingerprint(sealing.spki_of(pkcs8)) == fp
        except (binascii.Error, ValueError, TypeError):
            ok = False
        if not ok:
            raise KeysError(f"The cached key {display(fp)} is damaged or does not match its fingerprint: "
                            "make music-forget, then make music-setup")
        return pkcs8

    def pull_checked(self) -> None:
        self.pull()
        self.ensure_synced()

    def ensure_synced(self) -> dict[str, bytes]:
        """fingerprint -> PKCS#8 DER, the current key first, then the previous ones. The cache is refilled from 1Password once
        when it names another current key; a mismatch that remains stops with the side that is out of date."""
        self._ready()
        current, _ = self._roles(self._held())
        cache = self.cache.load()
        if current is None:
            held_here = sorted(cache["keys"])
            if held_here:
                raise KeyMismatch(f"1Password (vault {self.op.vault}) holds no notes key, but this computer's cache holds "
                                  f"{', '.join(display(fp) for fp in held_here)}. 1Password is out of date: check OP_VAULT, "
                                  "or the key was never saved there; run make music-status.")
            raise KeyMismatch("No notes key yet: run make music-setup")
        if cache.get("current") != current or current not in cache["keys"]:
            self.pull()
            cache = self.cache.load()
        if cache.get("current") != current or current not in cache["keys"]:
            raise KeyMismatch(f"1Password names {display(current)} as the current notes key, but this computer's cache could not be "
                              "brought up to date: make music-forget, then make music-setup")
        wanted = [current, *(fp for fp in cache.get("previous") or [] if fp != current)]
        return {fp: self._verified(fp, cache["keys"][fp]) for fp in wanted if fp in cache["keys"]}

    def status(self, check: ApiCheck | None = None) -> int:
        cache = self.cache.load()
        secrets = dict(cache["api"])
        held: dict[str, tuple[str, dict[str, str]]] = {}
        op_current: str | None = None
        op_previous: list[str] = []
        op_problem = None
        try:
            self._ready()
            held = self._held()
            op_current, op_previous = self._roles(held)
            secrets.update(self.api_secrets())
        except (OpError, KeysError, KeyMismatch) as e:
            op_problem = str(e)
        cache_current = cache.get("current")
        if op_problem is None and op_current is None and not cache["keys"] and not secrets:
            self.out("Nothing is set up yet.\nNext: make music-setup")
            return 3
        if op_problem is not None:
            self.out(f"Notes key in 1Password (vault {self.op.vault}): could not be checked: {op_problem}")
        else:
            self.out(f"Notes key in 1Password (vault {self.op.vault}): " + (display(op_current) if op_current else "none yet"))
        in_op = op_current is not None
        in_cache = in_op and cache_current == op_current and op_current in cache["keys"]
        if cache_current is None:
            self.out("Notes key in this computer's cache: none yet")
        elif op_problem is not None:
            self.out(f"Notes key in this computer's cache: {display(cache_current)}")
        else:
            self.out(f"Notes key in this computer's cache: {display(cache_current)}" + (" (matches 1Password)" if in_cache else
                     " (does not match 1Password: run make music-setup)"))
        only_here = [fp for fp in cache["keys"] if fp not in held] if op_problem is None else []
        if only_here:
            self.out("Only this computer holds: " + ", ".join(display(fp) for fp in only_here) + " (not in 1Password)")
        self.out("API keys: " + (", ".join(sorted(cache["api"])) or "none"))
        problems: dict[str, str] = {}
        publish_api = None
        for name in (PUBLISH_KEY, PICKUP_KEY):
            if name in secrets and check is not None:
                api = check(secrets[name])
                states = probe_states(api)
                problem = api_problem(name, states)
                if problem:
                    problems[name] = problem
                elif name == PUBLISH_KEY and states["keys:publish"] == "yes":
                    publish_api = api
                if name == PUBLISH_KEY and not problem:
                    may = {"yes": "allowed", "no": "not allowed"}.get(api.holds("drafts:delete"), "could not be checked")  # type: ignore[attr-defined]
                    self.out(f"Deleting drafts (make music-delete): {may} for the {PUBLISH_KEY} API key")
        on_server = self._server_line(publish_api, op_current, [*op_previous, *only_here], op_problem is None)
        self._checklist(in_op, in_cache, set(secrets), problems, on_server)
        return 0 if in_op and in_cache and on_server else 3

    def _server_line(self, api: object | None, current: str | None, previous: list[str], known: bool) -> bool:
        """Prints what the server holds and returns True when it is the current key and the same earlier keys as 1Password."""
        if api is None:
            self.out("Notes key on the server: not checked (no working music-publish API key)")
            return False
        try:
            server = api.keyring_fingerprints()  # type: ignore[attr-defined]
        except ApiError as e:
            self.out(f"Notes key on the server: could not be checked: {e}")
            return False
        if server is None:
            self.out("Notes key on the server: none yet" + (": make music-setup uploads it" if known else ""))
            return False
        shown = display(server["current"])
        if not known or current is None:
            self.out(f"Notes key on the server: {shown}")
            return False
        if server["current"] != current:
            self.out(f"Notes key on the server: {shown} (does not match 1Password: run make music-setup)")
            return False
        if set(server.get("previous") or []) != set(previous):
            self.out(f"Notes key on the server: {shown} (the earlier keys differ from 1Password: run make music-setup)")
            return False
        self.out(f"Notes key on the server: {shown} (matches 1Password)")
        return True

    def _checklist(self, in_op: bool, in_cache: bool, api_names: set[str], problems: dict[str, str], on_server: bool) -> None:
        """What's left, from what this tool can see: each line is done or points at make music-setup."""
        done, todo = "\u2713", "\u2192"
        left = 0
        lines: list[str] = []

        def line(ok: bool, did: str, todo_text: str) -> None:
            nonlocal left
            left += not ok
            lines.append(f"  {done} {did}" if ok else f"  {todo} {todo_text}")

        line(in_op, "The notes key is saved in 1Password.", "The notes key is not made or saved in 1Password yet.")
        line(in_cache, "The key is in this computer's cache.", "The key is not in this computer's cache.")
        for name in (PUBLISH_KEY, PICKUP_KEY):
            problem = problems.get(name)
            line(name in api_names and problem is None, f"The {name} API key is saved.", problem or f"The {name} API key is not saved.")
        line(on_server, "The locked copy of your key is on the server and its current key is yours.",
             "The locked copy of your key is not on the server, or the server's current key is not yours.")
        self.out("\nWhat's left:")
        for text in lines:
            self.out(text)
        self.out("Setup is complete. Notes you leave in the workroom will be sealed to this key; pick them up with make music-pickup."
                 if left == 0 else "Next: make music-setup")

    def forget(self) -> None:
        self.out("Forgot the cached keys." if self.cache.forget() else "Nothing cached.")

    def api_key_set(self, name: str, secret: str) -> None:
        if not _API_NAME.fullmatch(name):
            raise KeysError("the API key name is lowercase letters, digits and hyphens, e.g. music-pickup")
        if not _API_KEY.fullmatch(secret):
            raise KeysError("an API key is 64 lowercase hex characters, as the hub shows it once")
        self._ready()
        old = [item_id for item_id, existing in self._api_items() if existing == name]
        self.api_item_add(name, secret)
        for item_id in old:
            self.op.archive(item_id)
        self.out(f"Saved the API key {name} to 1Password (vault {self.op.vault}).")

    def api_item_add(self, name: str, secret: str) -> str:
        """Makes the 1Password item for an API key and reads it back; an item that was not stored as sent is removed."""
        new_id = self.op.create(f"SIUE music API key: {name.removeprefix('music-')}", "API_CREDENTIAL", [API_TAG], [
            {"id": "name", "type": "STRING", "label": "name", "value": name},
            {"id": "credential", "type": "CONCEALED", "label": "credential", "value": secret},
        ])  # no url: the key is for the CLI, so 1Password never offers it on a page
        stored = self.op.fields(new_id)
        for label, want in (("name", name), ("credential", secret)):
            if not hmac.compare_digest(stored.get(label, "").encode(), want.encode()):
                self.op.archive(new_id)
                raise KeysError(f"1Password did not store the API key's {label} field as sent; the new item was removed "
                                "and the old key (if any) is untouched")
        return new_id

    def api_secrets(self) -> dict[str, str]:
        """name -> API key for every API key saved in 1Password."""
        out: dict[str, str] = {}
        for item in self.op.list_items(API_TAG):
            f = self.op.fields(item["id"])
            if f.get("name") and f.get("credential"):
                out[f["name"]] = f["credential"]
        return out

    def api_key(self, name: str, rerun: str | None = None) -> str:
        api = self.cache.load()["api"]
        if name not in api:
            self.pull()
            api = self.cache.load()["api"]
        if name not in api:
            raise KeysError(f"There is no API key named {name} in 1Password (vault {self.op.vault}) yet. "
                            "An API key is a password that lets this tool talk to the server. "
                            "Run make music-setup: it opens the hub with the form filled in and saves the key for you"
                            + (f", then run {rerun} again." if rerun else "."))
        return api[name]

    def hub_url(self) -> str:
        """The admin hub, a sibling of the music folder: https://host/~user/admin/"""
        return urljoin(self.base, "../admin/")

    def passphrase(self) -> str:
        self._ready()
        held = self._held()
        current, _ = self._roles(held)
        if current is None:
            raise KeyMismatch("No notes key yet: run make music-setup")
        password = held[current][1].get("password")
        if not password:
            raise KeysError(f"The 1Password item {held[current][0]} has no password field: fix the item")
        return password

    def keyring(self) -> dict[str, bytes]:
        """fingerprint -> PKCS#8 DER for the current key, then every previous one; a key the cache lacks is an error, never skipped."""
        ring = self.ensure_synced()
        cache = self.cache.load()
        missing = [fp for fp in (cache.get("current"), *(cache.get("previous") or [])) if fp and fp not in ring]
        if missing:
            raise KeysError("1Password holds no private key for " + ", ".join(display(fp) for fp in missing)
                            + ": a keyring without it would stop opening the notes sealed to it, so nothing was changed")
        return ring

    def _item(self, fp: str) -> dict:
        for item in self.op.list_items(KEY_TAG):
            if self.op.fields(item["id"]).get("fingerprint") == fp:
                return item
        raise KeysError(f"1Password has no item for the key {display(fp)}")

    def _create_key_item(self, pkcs8: bytes, fp: str, passphrase: str) -> None:
        private_key = base64.b64encode(pkcs8).decode("ascii")
        new_id = self.op.create(KEY_TITLE, "PASSWORD", [KEY_TAG], [
            {"id": "password", "type": "CONCEALED", "purpose": "PASSWORD", "label": "password", "value": passphrase},
            {"id": "private_key", "type": "CONCEALED", "label": "private_key", "value": private_key},
            {"id": "fingerprint", "type": "STRING", "label": "fingerprint", "value": fp},
        ], urls=[self.base])
        try:
            stored = self.op.fields(new_id)
            bad = next((label for label, want in (("password", passphrase), ("private_key", private_key), ("fingerprint", fp))
                        if not hmac.compare_digest(stored.get(label, "").encode(), want.encode())), None)
        except Exception as e:
            left = self._discard(new_id)
            if left:
                raise KeysError(f"{e}{left}") from e
            raise
        if bad is not None:
            left = self._discard(new_id)
            raise KeysError(f"1Password did not store the key's {bad} field as sent; " + (
                f"nothing else was changed.{left}" if left else "the new item was removed and nothing was changed"))

    def _discard(self, item_id: str) -> str:
        """Archive a half-made item; returns "" or a sentence naming the orphan when that fails too."""
        try:
            self.op.archive(item_id)
        except Exception as e:
            return f" The new 1Password item {item_id} could not be removed ({e}): remove it by hand, or run make music-setup to adopt it."
        return ""

    def ensure_key(self, api: object | None = None) -> bool:
        """The cache holds 1Password's current key afterwards. Makes a key when 1Password has none (True), else adopts the one it has.
        With `api`, refuses to make a key while the server holds a keyring this computer cannot open."""
        self._ready()
        items = self.op.list_items(KEY_TAG)
        if items:
            self._roles(self._held())
            self.pull()
            return False
        if api is not None:
            server = api.keyring_fingerprints()  # type: ignore[attr-defined]
            if server is not None:
                raise KeysError(f"The server already holds a keyring (current key {display(server['current'])}) but 1Password "
                                f"(vault {self.op.vault}) has no notes key. Check OP_VAULT. To start over on purpose, remove it "
                                f"on the admin hub ({self.hub_url()}: Music notes key \u2192 Remove the notes key) first; notes sealed to the old key stay unreadable.")
        pkcs8, spki = sealing.generate()
        fp, passphrase = sealing.fingerprint(spki), sealing.new_passphrase()
        self._create_key_item(pkcs8, fp, passphrase)
        self.pull()
        self.out(f"Made your notes key and saved it in 1Password (vault {self.op.vault}).\n"
                 f"Its fingerprint, an ID to compare later: {display(fp)}\n\n" + KEY_KINDS)
        return True

    def server_holds_ours(self, api: object) -> bool:
        """True when the server's current and previous fingerprints are exactly this computer's keyring."""
        current, *previous = self.keyring()
        server = api.keyring_fingerprints()  # type: ignore[attr-defined]
        return server is not None and server["current"] == current and set(server.get("previous") or []) == set(previous)

    def upload_keyring(self, api: object) -> int:
        """Locks the keyring (current key first), posts it with its fingerprints, and reads the fingerprints back to check
        the server kept it. Refuses when the server holds a key this keyring lacks, because that would orphan its notes."""
        ring = self.keyring()
        current, *previous = ring
        self._refuse_to_lose(api, ring)
        api.publish_keyring(sealing.lock_keyring(ring, self.passphrase()), current, previous)  # type: ignore[attr-defined]
        server = api.keyring_fingerprints()  # type: ignore[attr-defined]
        if server is None or server["current"] != current or set(server.get("previous") or []) != set(previous):
            raise KeysError("The server did not keep the keyring (its current key is "
                            + (display(server["current"]) if server else "missing") + "): run make music-setup again")
        return len(ring)

    def _refuse_to_lose(self, api: object, ring: dict[str, bytes]) -> None:
        server = api.keyring_fingerprints()  # type: ignore[attr-defined]
        lost = [fp for fp in ([server["current"], *(server.get("previous") or [])] if server else []) if fp not in ring]
        if lost:
            raise KeysError("The server's keyring holds " + ", ".join(display(fp) for fp in lost) + ", which neither 1Password nor this "
                            "computer holds a private key for: a keyring without it would stop opening the notes sealed to it, "
                            "so nothing was changed")

    def rotate(self, api: object | None) -> str:
        """A new key under a new passphrase becomes current in 1Password, the old one is marked previous, and the keyring,
        every key in it, is uploaded locked under the new passphrase."""
        ring = self.keyring()
        if api is not None:
            self._refuse_to_lose(api, ring)
        passphrase = sealing.new_passphrase()  # a passphrase that leaked cannot unlock, or forge, the rotated keyring
        old = next(iter(ring))
        pkcs8, spki = sealing.generate()
        fp = sealing.fingerprint(spki)
        self._create_key_item(pkcs8, fp, passphrase)
        self._retitle_previous(old)
        self.pull()
        self.out(f"Rotated to the notes key {display(fp)}; the earlier keys are kept.")
        reason = "no music-publish API key"
        if api is not None:
            try:
                self.upload_keyring(api)
                self.out("Uploaded the locked copy of your notes keys to the server.\n"
                         "Any device can now open your notes once you type the passphrase from 1Password.")
                return fp
            except Exception as e:  # any failure leaves the keys safe in 1Password; the retry is make music-setup
                reason = str(e) or type(e).__name__
        self.out(f"The locked copy of your notes key was not uploaded ({reason}). Run make music-setup to finish; "
                 "until then other devices cannot open notes sealed to the new key.")
        raise NotUploaded(f"Rotated to {display(fp)}; the keyring was not uploaded")

    def _retitle_previous(self, old: str) -> None:
        """Two current keys in 1Password would stop every command, so a failed retitle is an error that names the item."""
        item_id = old
        try:
            item = self._item(old)
            item_id = item["id"]
            title = item.get("title") or KEY_TITLE
            if not title.endswith(PREVIOUS_SUFFIX):
                self.op.retitle(item_id, title + PREVIOUS_SUFFIX)
        except Exception as e:  # noqa: BLE001
            raise KeysError(f"The new key is saved, but the old 1Password item ({item_id}) could not be retitled ({e}). "
                            f"Add{PREVIOUS_SUFFIX} to its title by hand, then run make music-setup.") from None
