"""The 1Password CLI (op v2). Secrets go to op on standard input, never in argv."""
import json
import re
import subprocess
from typing import Callable, Sequence

MIN_VERSION = (2, 25)


class OpError(Exception):
    pass


class Op:
    def __init__(self, vault: str, exe: Sequence[str] = ("op",),
                 run: Callable[..., subprocess.CompletedProcess] = subprocess.run):
        self.vault = vault
        self.exe = tuple(exe)
        self._run_process = run

    def _run(self, args: Sequence[str], stdin: str | None = None) -> str:
        what = " ".join(args[:2])
        try:
            done = self._run_process([*self.exe, *args], input=stdin, capture_output=True, text=True)
        except FileNotFoundError:
            raise OpError("the 1Password CLI is not installed: brew install 1password-cli") from None
        if done.returncode != 0:
            lines = (done.stderr or "").strip().splitlines()
            raise OpError(f"op {what} failed: {lines[0] if lines else 'exit ' + str(done.returncode)}")
        return done.stdout

    def _json(self, args: Sequence[str], stdin: str | None = None):
        out = self._run(args, stdin)
        try:
            return json.loads(out)
        except ValueError:
            raise OpError(f"op {' '.join(args[:2])} did not answer with JSON") from None

    def check_version(self) -> None:
        text = self._run(["--version"]).strip()
        m = re.match(r"(\d+)\.(\d+)", text)
        if m is None:
            raise OpError(f"could not read the op version from {text!r}: brew upgrade 1password-cli")
        if (int(m.group(1)), int(m.group(2))) < MIN_VERSION:
            need = ".".join(map(str, MIN_VERSION))
            raise OpError(f"op {text} is too old (need {need} or newer): brew upgrade 1password-cli")

    def list_items(self, tag: str) -> list[dict]:
        items = self._json(["item", "list", "--vault", self.vault, "--tags", tag, "--format", "json"])
        return items if isinstance(items, list) else []

    def fields(self, item_id: str) -> dict[str, str]:
        item = self._json(["item", "get", item_id, "--vault", self.vault, "--reveal", "--format", "json"])
        out: dict[str, str] = {}
        for f in item.get("fields", []):
            label = f.get("label") or f.get("id")
            if label and isinstance(f.get("value"), str):
                out[label] = f["value"]
        return out

    def create(self, title: str, category: str, tags: list[str], fields: list[dict], urls: Sequence[str] = ()) -> str:
        template = {"title": title, "category": category, "tags": tags, "fields": fields,
                    "urls": [{"href": u, "primary": i == 0} for i, u in enumerate(urls)]}
        made = self._json(["item", "create", "--vault", self.vault, "--format", "json", "-"], json.dumps(template))
        return made["id"]

    def retitle(self, item_id: str, title: str) -> None:
        self._run(["item", "edit", item_id, "--vault", self.vault, "--title", title])

    def archive(self, item_id: str) -> None:
        self._run(["item", "delete", item_id, "--vault", self.vault, "--archive"])
