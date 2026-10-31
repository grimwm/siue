"""The sealed-note bundle and the locked keyring: the same formats the page speaks (games/workroom/src/seal.ts, unlock.ts)."""
import base64
import binascii
import hashlib
import json
import os
import re
import secrets
import struct
import unicodedata
from dataclasses import dataclass
from typing import Mapping

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

MAGIC = b"SIUEN1"
MAGIC2 = b"SIUEN2"  # one AES key wrapped once per recipient: the person's key and each paired AI key's (seal.ts sealTo)
MAX_RECIPIENTS = 16
ITERATIONS = 600_000
MAX_ITERATIONS = 10_000_000
KEYRING_AAD = b"siue-music-keyring-v1"
FP_LENGTH = 32
HEADER_LENGTH = len(MAGIC) + FP_LENGTH + 2
AAD_LENGTH = len(MAGIC) + FP_LENGTH
IV_LENGTH = 12
TAG_LENGTH = 16
SALT_LENGTH = 16
NOTE_KINDS = ("text", "speech", "hum", "react", "energy")
# The characters stripped from both ends of a passphrase: exactly the set in unlock.ts (STRIPPED), never str.strip().
STRIPPED = frozenset(" \t\n\r\f\v             "
                     "    　﻿")
_OAEP = padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
_FINGERPRINT = re.compile(r"[0-9a-f]{64}")


class NoteUnreadable(Exception):
    def __init__(self, reason: str):
        super().__init__(f"note unreadable: {reason}")
        self.reason = reason  # "format" | "unknown-key" | "tampered"


class WrongPassphrase(Exception):
    pass


class KeyringInvalid(Exception):
    pass


@dataclass(frozen=True)
class Opened:
    fingerprint: str
    body: dict
    audio: bytes


def fingerprint(spki_der: bytes) -> str:
    return hashlib.sha256(spki_der).hexdigest()


def generate() -> tuple[bytes, bytes]:
    key = rsa.generate_private_key(public_exponent=65537, key_size=4096)
    pkcs8 = key.private_bytes(serialization.Encoding.DER, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
    return pkcs8, _spki(key.public_key())


def _spki(pub) -> bytes:
    return pub.public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)


def spki_of(pkcs8_der: bytes) -> bytes:
    return _spki(serialization.load_der_private_key(pkcs8_der, password=None).public_key())


def normalize_passphrase(p: str) -> bytes:
    chars = unicodedata.normalize("NFC", p)
    start, end = 0, len(chars)
    while start < end and chars[start] in STRIPPED:
        start += 1
    while end > start and chars[end - 1] in STRIPPED:
        end -= 1
    return chars[start:end].encode("utf-8")


def new_passphrase() -> str:
    return secrets.token_urlsafe(32)


def _b64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def _unb64(s: object) -> bytes | None:
    """Standard base64 with '=' padding that round-trips exactly (what the server accepts), else None."""
    if not isinstance(s, str):
        return None
    try:
        raw = base64.b64decode(s, validate=True)
    except (binascii.Error, ValueError):
        return None
    return raw if base64.b64encode(raw).decode("ascii") == s else None


def _derive(passphrase: str, salt: bytes, iterations: int) -> bytes:
    return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=iterations).derive(normalize_passphrase(passphrase))


def lock_keyring(keys: Mapping[str, bytes], passphrase: str) -> dict:
    salt, iv = os.urandom(SALT_LENGTH), os.urandom(IV_LENGTH)
    plain = json.dumps({"v": 1, "keys": [{"fingerprint": fp, "pkcs8": _b64(k)} for fp, k in keys.items()]}).encode()
    ct = AESGCM(_derive(passphrase, salt, ITERATIONS)).encrypt(iv, plain, KEYRING_AAD)
    return {"v": 1, "kdf": "PBKDF2-SHA-256", "iterations": ITERATIONS, "salt": _b64(salt), "iv": _b64(iv), "ct": _b64(ct)}


def unlock_keyring(locked: dict, passphrase: str) -> dict[str, bytes]:
    bad = KeyringInvalid("the keyring envelope is weak or malformed")
    if not isinstance(locked, dict) or set(locked) != {"v", "kdf", "iterations", "salt", "iv", "ct"}:
        raise bad
    iterations = locked["iterations"]
    salt, iv, ct = _unb64(locked["salt"]), _unb64(locked["iv"]), _unb64(locked["ct"])
    if (locked["v"] != 1 or isinstance(locked["v"], bool) or locked["kdf"] != "PBKDF2-SHA-256"
            or not isinstance(iterations, int) or isinstance(iterations, bool) or not ITERATIONS <= iterations <= MAX_ITERATIONS
            or salt is None or len(salt) != SALT_LENGTH or iv is None or len(iv) != IV_LENGTH
            or ct is None or len(ct) < TAG_LENGTH + 1):
        raise bad
    try:
        plain = AESGCM(_derive(passphrase, salt, iterations)).decrypt(iv, ct, KEYRING_AAD)
    except InvalidTag:
        raise WrongPassphrase("the passphrase does not unlock the keyring") from None
    try:
        data = json.loads(plain.decode("utf-8"))
    except ValueError:
        raise KeyringInvalid("the keyring is not JSON") from None
    if not isinstance(data, dict) or data.get("v") != 1 or not isinstance(data.get("keys"), list):
        raise KeyringInvalid("the keyring is malformed")
    ring: dict[str, bytes] = {}
    for entry in data["keys"]:
        fp = entry.get("fingerprint") if isinstance(entry, dict) else None
        pkcs8 = _unb64(entry.get("pkcs8")) if isinstance(entry, dict) else None
        if not isinstance(fp, str) or not _FINGERPRINT.fullmatch(fp) or not pkcs8:
            raise KeyringInvalid("a keyring entry is malformed")
        if fp in ring:
            raise KeyringInvalid("the keyring repeats a fingerprint")
        try:
            actual = fingerprint(spki_of(pkcs8))
        except ValueError:
            raise KeyringInvalid("a keyring entry is not a private key") from None
        if actual != fp:
            raise KeyringInvalid(f"the keyring entry {fp[:16]} does not match its key")
        ring[fp] = pkcs8
    return ring


def seal(body: dict, audio: bytes, spki_der: bytes) -> bytes:
    pub = serialization.load_der_public_key(spki_der)
    aes_key = AESGCM.generate_key(bit_length=256)
    wrapped = pub.encrypt(aes_key, _OAEP)
    header = MAGIC + hashlib.sha256(spki_der).digest() + struct.pack(">H", len(wrapped))
    js = json.dumps(body).encode("utf-8")
    plain = struct.pack(">I", len(js)) + js + audio
    iv = os.urandom(IV_LENGTH)
    return header + wrapped + iv + AESGCM(aes_key).encrypt(iv, plain, header[:AAD_LENGTH])


def seal_to(body: dict, audio: bytes, spkis: list[bytes]) -> bytes:
    """SIUEN2 to every key in `spkis` (the person's first), as the page seals a note for the person and their paired AIs."""
    if not 1 <= len(spkis) <= MAX_RECIPIENTS or len({hashlib.sha256(k).digest() for k in spkis}) != len(spkis):
        raise ValueError("a note is sealed to 1 to 16 distinct keys")
    aes_key = AESGCM.generate_key(bit_length=256)
    header = bytearray(MAGIC2 + bytes([len(spkis)]))
    aad = bytearray(header)
    for spki in spkis:
        wrapped = serialization.load_der_public_key(spki).encrypt(aes_key, _OAEP)
        fp = hashlib.sha256(spki).digest()
        header += fp + struct.pack(">H", len(wrapped)) + wrapped
        aad += fp
    js = json.dumps(body).encode("utf-8")
    iv = os.urandom(IV_LENGTH)
    return bytes(header) + iv + AESGCM(aes_key).encrypt(iv, struct.pack(">I", len(js)) + js + audio, bytes(aad))


def recipients(bundle: bytes) -> list[str] | None:
    """The fingerprints a sealed note names, in order (SIUEN1: one), or None when its header is malformed."""
    parsed = _header(bundle)
    return None if parsed is None else [fp for fp, _ in parsed[0]]


def _header(bundle: bytes) -> tuple[list[tuple[str, bytes]], bytes, int] | None:
    """([(fingerprint, wrapped key)], additional data, where the IV starts), or None for a malformed header."""
    if bundle[:len(MAGIC)] == MAGIC:
        if len(bundle) < HEADER_LENGTH:
            return None
        (wrapped_len,) = struct.unpack(">H", bundle[AAD_LENGTH:HEADER_LENGTH])
        iv_at = HEADER_LENGTH + wrapped_len
        if wrapped_len == 0 or len(bundle) < iv_at + IV_LENGTH + TAG_LENGTH:
            return None
        return [(bundle[len(MAGIC):AAD_LENGTH].hex(), bundle[HEADER_LENGTH:iv_at])], bundle[:AAD_LENGTH], iv_at
    if bundle[:len(MAGIC2)] != MAGIC2 or len(bundle) < len(MAGIC2) + 1:
        return None
    n = bundle[len(MAGIC2)]
    if not 1 <= n <= MAX_RECIPIENTS:
        return None
    at, wraps = len(MAGIC2) + 1, []
    for _ in range(n):
        if at + FP_LENGTH + 2 > len(bundle):
            return None
        fp = bundle[at:at + FP_LENGTH].hex()
        (length,) = struct.unpack(">H", bundle[at + FP_LENGTH:at + FP_LENGTH + 2])
        at += FP_LENGTH + 2
        if length == 0 or at + length > len(bundle) or any(fp == w for w, _ in wraps):
            return None
        wraps.append((fp, bundle[at:at + length]))
        at += length
    if at + IV_LENGTH + TAG_LENGTH > len(bundle):
        return None
    aad = MAGIC2 + bytes([n]) + b"".join(bytes.fromhex(fp) for fp, _ in wraps)
    return wraps, aad, at


def open_bundle(bundle: bytes, keyring: Mapping[str, bytes]) -> Opened:
    """Opens a SIUEN1 note with the key its header names, or a SIUEN2 note with the first recipient the keyring holds."""
    parsed = _header(bundle)
    if parsed is None:
        raise NoteUnreadable("format")
    wraps, aad, iv_at = parsed
    mine = next(((fp, w) for fp, w in wraps if fp in keyring), None)
    if mine is None:
        raise NoteUnreadable("unknown-key")
    fp, wrapped = mine
    pkcs8 = keyring[fp]
    try:
        priv = serialization.load_der_private_key(pkcs8, password=None)
        aes_key = priv.decrypt(wrapped, _OAEP)
        plain = AESGCM(aes_key).decrypt(bundle[iv_at:iv_at + IV_LENGTH], bundle[iv_at + IV_LENGTH:], aad)
        (js_len,) = struct.unpack(">I", plain[:4])
        if len(plain) < 4 + js_len:
            raise NoteUnreadable("tampered")
        body = json.loads(plain[4:4 + js_len].decode("utf-8"))
    except NoteUnreadable:
        raise
    except Exception:
        raise NoteUnreadable("tampered") from None
    if not isinstance(body, dict) or body.get("v") != 1 or body.get("kind") not in NOTE_KINDS:
        raise NoteUnreadable("tampered")
    return Opened(fp, body, plain[4 + js_len:])
