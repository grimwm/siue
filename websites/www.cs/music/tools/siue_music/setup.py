"""`siue-music setup`: the one guided command. Every step checks what is already done and skips it, so it can be run again."""
import json
import re
import shutil
import subprocess
import tempfile
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
                 out: Callable[[str], None] = print, interactive: bool = True):
        self.interactive = interactive
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
        """Keys saved under the wrong name are saved again under the right one (both, when they are swapped), and only
        then are the wrongly named items archived, so a stop half-way never loses a key."""
        moves = [(wrong, right) for wrong, right in ((PICKUP_KEY, PUBLISH_KEY), (PUBLISH_KEY, PICKUP_KEY))
                 if wrong in secrets and is_misnamed(wrong, states[wrong])
                 and (right not in secrets or api_problem(right, states[right]) is not None)]
        if not moves:
            return
        old_names = {name for move in moves for name in move}
        old_ids = [item_id for item_id, name in self.keys._api_items() if name in old_names]
        moved = {right: (secrets[wrong], states[wrong]) for wrong, right in moves}
        for wrong, right in moves:
            self.out(f"The key saved as {wrong} is really the {right} key: filing it under that name.")
            self.keys.api_item_add(right, secrets[wrong])
        for item_id in old_ids:
            self.keys.op.archive(item_id)
        for wrong, _ in moves:
            secrets.pop(wrong, None)
            states.pop(wrong, None)
        for right, (secret, state) in moved.items():
            secrets[right], states[right] = secret, state

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

    def _confirm(self, prompt: str, finish: str) -> bool:
        """The answer to a yes/no question; no terminal, end of input or n means no (and `finish` says how to go on)."""
        if not self.interactive:
            self.out(f"Not asking, because this is not a terminal. To finish, {finish}")
            return False
        try:
            answer = self.ask(prompt)
        except EOFError:
            self.out(f"No answer was given. To finish, {finish}")
            return False
        return answer.strip().lower() not in ("n", "no")

    def _pull_request(self, branch: str, cwd: Path) -> None:
        """Reports the branch's open pull request, or opens one; without gh it prints the address that opens one."""
        url = None
        try:
            seen = self.run(["gh", "pr", "view", branch, "--json", "url"], cwd=cwd, capture_output=True, text=True, timeout=120)
            if seen.returncode == 0:
                url = json.loads(seen.stdout).get("url")
                if url:
                    self.out(f"The pull request is already open: {url}")
            if not url:
                made = self.run(["gh", "pr", "create", "--fill"], cwd=cwd, capture_output=True, text=True, timeout=120)
                if made.returncode == 0:
                    url = (made.stdout.strip().splitlines() or [""])[-1]
                    self.out(f"Opened the pull request: {url}")
                    self.done.append("pull request opened")
        except (OSError, subprocess.SubprocessError, ValueError, AttributeError):
            url = None
        if url:
            self.pr_url = url
            return
        remote = self._git("remote", "get-url", "origin").stdout.strip()
        m = re.search(r"github\.com[:/](.+?)(?:\.git)?$", remote)
        where = f"https://github.com/{m.group(1)}/pull/new/{branch}" if m else "your repository's pull request page"
        self.out(f"The branch {branch} is pushed. Open the pull request here: {where}")

    def _restore(self, top: Path) -> None:
        """Puts the user's checkout back to what git holds for the key files, so a later pull does not conflict."""
        rel = lambda p: str(p.resolve().relative_to(top.resolve()))  # noqa: E731
        tracked = self._git("ls-files", "--error-unmatch", "--", str(self.keys.public_json)).returncode == 0
        if tracked:
            self._git("checkout", "--", rel(self.keys.public_json), cwd=top)
        else:
            self.keys.public_json.unlink(missing_ok=True)
        dist = rel(self.keys.public_ts.parents[1] / "dist")
        self._git("checkout", "--", rel(self.keys.public_ts), dist, cwd=top)
        self._git("clean", "-fdq", "--", dist, cwd=top)
        self.out("Your checkout is back to main's files; they arrive with the merge.")

    def _publish(self, top: Path, branch: str) -> None:
        """Commits the key files on `branch` in a temporary worktree cut from origin/main, pushes it and removes the worktree."""
        keys = self.keys
        self._step(["git", "fetch", "origin", "main"], top, "git fetch")
        holder = Path(tempfile.mkdtemp(prefix="siue-music-"))
        tree = holder / "tree"
        have = self._git("rev-parse", "--verify", "--quiet", f"refs/heads/{branch}", cwd=top).returncode == 0
        add = ["git", "worktree", "add", str(tree), branch] if have else ["git", "worktree", "add", str(tree), "-b", branch, "origin/main"]
        try:
            self._step(add, top, "git worktree add")
            for path in self._paths():
                rel = path.resolve().relative_to(top.resolve())
                target = tree / rel
                if path.is_dir():
                    shutil.rmtree(target, ignore_errors=True)
                    shutil.copytree(path, target)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(path, target)
            rels = [str(p.resolve().relative_to(top.resolve())) for p in self._paths()]
            self._step(["git", "add", "-A", "--", *rels], tree, "git add")
            if self.run(["git", "diff", "--cached", "--quiet"], cwd=tree, capture_output=True, text=True, timeout=120).returncode != 0:
                fp = read_repo_keys(keys.public_json).current or ""
                self._step(["git", "commit", "-m", f"Music workroom: notes key {display(fp)[:19]}"], tree, "git commit")
            pushed = self.run(["git", "push", "-u", "origin", "HEAD"], cwd=tree, capture_output=True, text=True, timeout=300)
            if pushed.returncode != 0:
                tail = ((pushed.stderr or "") + (pushed.stdout or "")).strip().splitlines()[-3:]
                raise SetupAbort("The push failed:\n  " + "\n  ".join(tail) + f"\nThe commit is kept on branch {branch}. "
                                 "Run make music-setup again to retry.")
            self.done.append("public key committed and pushed")
            self._pull_request(branch, tree)
        finally:
            try:
                self.run(["git", "worktree", "remove", "--force", str(tree)], cwd=top, capture_output=True, text=True, timeout=120)
            except (OSError, subprocess.SubprocessError):
                self.out(f"Could not remove the temporary worktree {tree}: run git worktree prune in your checkout.")
            shutil.rmtree(holder, ignore_errors=True)
        self._restore(top)

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
        fp = read_repo_keys(keys.public_json).current or ""
        branch = f"music/notes-key-{fp[:8]}"
        top = Path(self._git("rev-parse", "--show-toplevel").stdout.strip())
        if self._git("ls-remote", "--exit-code", "--heads", "origin", branch).returncode == 0:
            self.out(f"The public key is already on branch {branch}.")
            self.done.append("public key pushed")
            self._pull_request(branch, top)
            self._restore(top)
            return
        self._build()
        finish = "run make music-setup in a terminal."
        if not self._confirm(f"Commit the public key on branch {branch} and open a pull request? [Y/n] ", finish):
            self.out(f"Left uncommitted; the page is built. Commit {names} when you are ready.")
            return
        self._publish(top, branch)

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
        except (OSError, subprocess.SubprocessError) as e:
            self.out(f"A command did not finish: {e}. Run make music-setup again.")
            return 1
        self.out("\nDone:")
        for line in self.done:
            self.out(f"  ✓ {line}")
        if self.pr_url:
            self.out("After it merges and deploys, the workroom can take your notes.")
        return 0
