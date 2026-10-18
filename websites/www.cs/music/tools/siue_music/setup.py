"""`siue-music setup`: the one guided command. Every step checks what is already done and skips it, so it can be run again."""
import re
import subprocess
from pathlib import Path
from typing import Callable
from urllib.parse import urlencode

from .api import Api, ApiError
from .keys import (PICKUP_KEY, PICKUP_SCOPES, PUBLISH_KEY, PUBLISH_SCOPES, REPO_PATHS, Keys, KeyMismatch, KeysError,
                   KEY_KINDS, api_problem, display, is_misnamed, probe_states, read_repo_keys)
from .op import OpError

_API_KEY = re.compile(r"[0-9a-f]{64}")
MAX_PASTES = 5
ROLES = ((PUBLISH_KEY, PUBLISH_SCOPES), (PICKUP_KEY, PICKUP_SCOPES))


class SetupAbort(Exception):
    """A step cannot go on; the message says what to do. Exit code 1."""


class Setup:
    def __init__(self, keys: Keys, make_api: Callable[[str], Api], ask: Callable[[str], str], secret: Callable[[str], str],
                 open_url: Callable[[str], bool], run: Callable[..., subprocess.CompletedProcess] = subprocess.run,
                 out: Callable[[str], None] = print):
        self.keys = keys
        self.make_api = make_api
        self.ask = ask
        self.secret = secret
        self.open_url = open_url
        self.run = run
        self.out = out
        self.done: list[str] = []
        self.pr_url: str | None = None

    # -- 1Password and the two API keys

    def _check_op(self) -> None:
        try:
            self.keys.op.check_version()
            self.keys.op.list_items("siue-music-key")
        except OpError as e:
            raise SetupAbort(f"1Password is not ready: {e}. Install it with `brew install 1password-cli`, turn on "
                             "the 1Password app's CLI integration and sign in, then run make music-setup again.") from None

    def _refile(self, secrets: dict[str, str], states: dict[str, dict[str, str]]) -> None:
        """A key saved under the wrong name is saved again under the right one and the wrong item archived."""
        for wrong, right in ((PICKUP_KEY, PUBLISH_KEY), (PUBLISH_KEY, PICKUP_KEY)):
            if wrong in secrets and is_misnamed(wrong, states[wrong]) and (right not in secrets or api_problem(right, states[right])):
                self.out(f"The key saved as {wrong} is really the {right} key: filing it under that name.")
                wrong_ids = [i for i, n in self.keys._api_items() if n == wrong]
                self.keys.api_key_set(right, secrets[wrong])
                for item_id in wrong_ids:
                    self.keys.op.archive(item_id)
                secrets[right], states[right] = secrets.pop(wrong), states.pop(wrong)
                return

    def _api_keys(self) -> None:
        secrets = self.keys.api_secrets()
        states = {name: probe_states(self.make_api(secret)) for name, secret in secrets.items()}
        self._refile(secrets, states)
        for name, scopes in ROLES:
            problem = api_problem(name, states[name]) if name in secrets else None
            if name in secrets and problem is None:
                self.out(f"The {name} API key is saved and works.")
            else:
                if problem:
                    self.out(problem + " Let's make a new one.")
                self._create_api_key(name, scopes)
            self.done.append(f"{name} API key saved")
        self.keys.pull()

    def hub_form_url(self, name: str, scopes: tuple[str, ...]) -> str:
        return self.keys.hub_url() + "keys.php?" + urlencode({"label": name, "scopes": ",".join(scopes)}, safe=",:")

    def _create_api_key(self, name: str, scopes: tuple[str, ...]) -> None:
        url = self.hub_form_url(name, scopes)
        use = "publishes drafts and the locked copy of your key" if name == PUBLISH_KEY else "picks up your notes"
        self.out(f"The {name} API key ({use}) is made on the admin hub; the form is filled in for you: {url}")
        if not self.open_url(url):
            self.out("Open that address in a browser and sign in.")
        for _ in range(MAX_PASTES):
            try:
                pasted = self.secret("Press Create on that page, copy the key and paste it here: ").strip()
            except EOFError:
                raise SetupAbort("No key was pasted. Run make music-setup again when you have it.") from None
            if not _API_KEY.fullmatch(pasted):
                self.out("That is not an API key (it is 64 letters and digits, shown once under \"New key\"). Try again.")
                continue
            states = probe_states(self.make_api(pasted))
            problem = api_problem(name, states)
            if problem:
                self.out(problem.replace("The " + name + " API key", "That key") + " Make sure the right boxes are ticked, then try again.")
                continue
            self.keys.api_key_set(name, pasted)
            return
        raise SetupAbort(f"No working {name} key after {MAX_PASTES} tries. Run make music-setup again.")

    # -- the notes key and its locked copy

    def _uploader(self) -> Callable[[dict], None]:
        return self.make_api(self.keys.api_key(PUBLISH_KEY)).publish_keyring

    def _notes_key(self) -> None:
        keys = self.keys
        repo = read_repo_keys(keys.public_json)
        if repo.current is None:
            if keys.op.list_items("siue-music-key"):
                self.out("1Password already holds a notes key; using it.")
                keys.init(self._uploader(), adopt=True)
            else:
                self.out("Making the notes key (the encryption key) and saving it to 1Password...")
                keys.init(self._uploader())
        else:
            keys.pull_checked()
            self.out(f"The notes key {display(repo.current)} is in the repository and in 1Password.")
        repo = read_repo_keys(keys.public_json)
        self.done.append("notes key made and saved in 1Password")
        if keys.upload_covers(repo):
            self.out("The locked copy of the key is on the server.")
        else:
            count = keys.upload_keyring(self._uploader())
            self.out(f"Uploaded the locked copy of your notes key ({count} key{'' if count == 1 else 's'}) to the server.")
        self.done.append("locked copy uploaded")

    # -- the repository

    def _git(self, *args: str, cwd: Path | None = None) -> subprocess.CompletedProcess:
        return self.run(["git", *args], cwd=cwd or self.keys.public_json.parent, capture_output=True, text=True, timeout=120)

    def _step(self, argv: list[str], cwd: Path, what: str) -> subprocess.CompletedProcess:
        try:
            done = self.run(argv, cwd=cwd, capture_output=True, text=True, timeout=1800)
        except (OSError, subprocess.SubprocessError) as e:
            raise SetupAbort(f"{what} failed: {e}") from None
        if done.returncode != 0:
            tail = ((done.stderr or "") + (done.stdout or "")).strip().splitlines()[-5:]
            raise SetupAbort(f"{what} failed:\n  " + "\n  ".join(tail))
        return done

    def _build(self) -> None:
        games = self.keys.public_ts.parents[2]
        modules, lock = games / "node_modules" / ".package-lock.json", games / "package-lock.json"
        if not modules.exists() or (lock.exists() and modules.stat().st_mtime < lock.stat().st_mtime):
            self.out("Installing the page's build tools (npm ci)...")
            self._step(["npm", "ci", "--silent"], games, "npm ci")
        self.out("Building the page...")
        self._step(["node", "_kit/build/build.mjs", "workroom"], games, "The page build")

    def _paths(self) -> list[Path]:
        return [self.keys.public_json, self.keys.public_ts, self.keys.public_ts.parents[1] / "dist"]

    def _repository(self) -> None:
        keys = self.keys
        state = keys._git_state()
        names = " ".join(REPO_PATHS)
        if state == "committed":
            self.out("The public key is committed.")
            self.done.append("public key committed")
            return
        if state == "unknown":
            self.out(f"git is not available here. Rebuild the page and commit these yourself: {names}")
            return
        self._build()
        top = Path(self._git("rev-parse", "--show-toplevel").stdout.strip())
        mine = {p.resolve() for p in self._paths()}
        staged = [Path(top, n).resolve() for n in self._git("diff", "--cached", "--name-only", cwd=top).stdout.splitlines() if n]
        stray = [p for p in staged if p not in mine and not any(m in p.parents for m in mine)]
        if stray:
            raise SetupAbort(f"Something else is staged for commit ({stray[0].name}...). Unstage it with `git restore --staged .` "
                             "(your edits stay), then run make music-setup again.")
        if self.ask("Commit the public key and open a pull request? [Y/n] ").strip().lower() in ("n", "no"):
            self.out(f"Left uncommitted. Build is done; commit {names} when you are ready.")
            return
        fp = read_repo_keys(keys.public_json).current or ""
        branch = self._git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
        if branch in ("main", "master", "HEAD"):
            branch = f"music/notes-key-{fp[:8]}"
            self._step(["git", "switch", "-c", branch], keys.public_json.parent, "git switch")
        rel = [str(p) for p in self._paths()]
        self._step(["git", "add", "--", *rel], keys.public_json.parent, "git add")
        self._step(["git", "commit", "-m", f"Music workroom: notes key {display(fp)[:19]}", "--", *rel], keys.public_json.parent, "git commit")
        self._step(["git", "push", "-u", "origin", "HEAD"], keys.public_json.parent, "git push")
        self.done.append("public key committed and pushed")
        try:
            made = self.run(["gh", "pr", "create", "--fill"], cwd=keys.public_json.parent, capture_output=True, text=True, timeout=120)
            ok = made.returncode == 0
        except (OSError, subprocess.SubprocessError):
            made, ok = None, False
        if ok:
            self.pr_url = (made.stdout.strip().splitlines() or [""])[-1]
            self.out(f"Opened the pull request: {self.pr_url}")
            self.done.append("pull request opened")
        else:
            remote = self._git("remote", "get-url", "origin").stdout.strip()
            m = re.search(r"github\.com[:/](.+?)(?:\.git)?$", remote)
            where = f"https://github.com/{m.group(1)}/pull/new/{branch}" if m else "your repository's pull request page"
            self.out(f"The branch {branch} is pushed. Open the pull request here: {where}")

    # -- the whole run

    def run_all(self) -> int:
        try:
            self._check_op()
            self._api_keys()
            self._notes_key()
            self._repository()
        except SetupAbort as e:
            self.out(str(e))
            return 1
        except KeyMismatch as e:
            self.out(str(e))
            return 3
        except (KeysError, OpError, ApiError) as e:
            self.out(str(e))
            return 1
        self.out("\nDone:")
        for line in self.done:
            self.out(f"  ✓ {line}")
        if self.pr_url:
            self.out("After it merges and deploys, the workroom can take your notes.")
        return 0
