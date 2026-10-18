"""make music-setup: each step is skipped when it is already done. Fake op, fake server, fake browser, fake git and gh."""
import json
import subprocess
import unittest
from pathlib import Path

from support import World, pool_key
from siue_music.keys import PICKUP_KEY, PUBLISH_KEY, read_repo_keys
from siue_music.setup import Setup

PUB, PICK, SPARE = "a" * 64, "b" * 64, "c" * 64
HUB = "https://www.cs.siue.edu/~wgrim/admin/keys.php"


class FakeServer:
    """What the server says of each API key; records every keyring it is sent."""

    def __init__(self):
        # (notes:pickup, keys:publish and drafts:publish) per key
        self.keys = {PUB: ("no", "yes"), PICK: ("yes", "no"), SPARE: ("yes", "yes")}
        self.uploads = []

    def api(self, secret):
        outer = self

        class Api:
            def holds(self, scope):
                state = outer.keys.get(secret)
                if state is None:
                    return "invalid"
                return state[0 if scope == "notes:pickup" else 1]  # publish keys hold both publish scopes

            def publish_keyring(self, locked):
                outer.uploads.append(locked)

        return Api()


class FakeRun:
    """Stands in for subprocess.run: answers git, npm, node and gh from a script and records every call."""

    def __init__(self, repo: Path, state="uncommitted", gh=True):
        self.repo, self.state, self.gh = repo, state, gh
        self.local_branches: set[str] = set()
        self.remote_branches: set[str] = set()
        self.push_ok = True
        self.pr_open = False
        self.calls: list[list[str]] = []
        self.worktrees: list[Path] = []

    def __call__(self, argv, **kw):
        self.calls.append(list(argv))
        done = lambda out="", code=0: subprocess.CompletedProcess(argv, code, out, "")  # noqa: E731
        if argv[0] == "node":
            (self.repo / "games" / "workroom" / "dist").mkdir(parents=True, exist_ok=True)
            (self.repo / "games" / "workroom" / "dist" / "index.js").write_text("built")
            return done()
        if argv[0] == "gh":
            if not self.gh:
                raise FileNotFoundError("gh")
            if argv[2] == "view":
                return done('{"url": "https://github.com/o/r/pull/7"}\n') if self.pr_open else done("", 1)
            return done("https://github.com/o/r/pull/7\n")
        if argv[0] != "git":
            return done()
        sub = argv[3:] if argv[1] == "-C" else argv[1:]
        if sub[:2] == ["ls-files", "--error-unmatch"]:
            return done(code=0 if self.state == "committed" else 1)
        if sub[:2] == ["rev-parse", "--is-inside-work-tree"]:
            return done("true\n")
        if sub[0] == "status":
            return done("" if self.state == "committed" else " M x\n")
        if sub[:2] == ["rev-parse", "--show-toplevel"]:
            return done(str(self.repo) + "\n")
        if sub[:2] == ["rev-parse", "--verify"]:
            return done(code=0 if sub[3].removeprefix("refs/heads/") in self.local_branches else 1)
        if sub[:2] == ["ls-remote", "--exit-code"]:
            return done(code=0 if sub[-1] in self.remote_branches else 2)
        if sub[:2] == ["worktree", "add"]:
            tree = Path(sub[2])
            tree.mkdir(parents=True)
            self.worktrees.append(tree)
            branch = sub[4] if sub[3] == "-b" else sub[3]
            self.local_branches.add(branch)
            self.current = branch
            return done()
        if sub[:2] == ["worktree", "remove"]:
            return done()
        if sub[:2] == ["diff", "--cached"]:
            return done(code=1)
        if sub[0] == "push":
            if self.push_ok:
                self.remote_branches.add(self.current)
            return done("", 0 if self.push_ok else 1) if self.push_ok else subprocess.CompletedProcess(argv, 1, "", "remote rejected")
        if sub[:2] == ["remote", "get-url"]:
            return done("git@github.com:o/r.git\n")
        return done()

    def ran(self, *prefix):
        return [c for c in self.calls if c[:len(prefix)] == list(prefix)]


class SetupTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.server = FakeServer()
        self.run = FakeRun(self.w.repo)
        self.w.keys.run = self.run
        self.opened: list[str] = []
        self.asked: list[str] = []
        self.prompts: list[str] = []
        self.pastes: list[str] = []
        self.answers: list[str] = ["y"]
        self.interactive = True

    def go(self):
        def secret(prompt):
            self.prompts.append(prompt)
            if not self.pastes:
                raise EOFError
            return self.pastes.pop(0)

        def ask(prompt):
            self.asked.append(prompt)
            if not self.answers:
                raise EOFError
            return self.answers.pop(0)

        setup = Setup(self.w.keys, self.server.api, ask, secret, lambda url: self.opened.append(url) or True, self.run, out=self.w.out.append, interactive=self.interactive)
        self.code = setup.run_all()
        return self.code

    def text(self):
        return "\n".join(self.w.out)

    def made_branch(self):
        add = self.run.ran("git", "worktree", "add")[0]
        return add[5] if add[4] == "-b" else add[4]

    def fp8_branch(self):
        return "music/notes-key-" + read_repo_keys(self.w.public_json).current[:8]

    def save(self, name, secret):
        self.w.keys.api_key_set(name, secret)

    def everything_done(self):
        self.save(PUBLISH_KEY, PUB)
        self.save(PICKUP_KEY, PICK)
        self.w.keys.init(self.server.api(PUB).publish_keyring)
        self.run.state = "committed"
        self.w.out.clear()
        self.server.uploads.clear()

    def test_the_owners_state_is_finished_in_one_run(self):
        """Key made but uncommitted, the publish key saved under the pickup name, nothing uploaded."""
        self.w.keys.init(None)
        self.save(PICKUP_KEY, PUB)
        self.w.out.clear()
        self.pastes = [PICK]
        self.assertEqual(self.go(), 0, self.text())
        text = self.text()
        self.assertIn("The key saved as music-pickup is really the music-publish key: filing it under that name.", text)
        self.assertEqual(self.opened, [HUB + "?label=music-pickup&scopes=notes:pickup"])
        self.assertEqual(self.prompts, ["Press Create on that page, copy the key and paste it here: "])
        self.assertEqual(len(self.server.uploads), 1)
        branch = self.made_branch()
        self.assertRegex(branch, r"^music/notes-key-[0-9a-f]{8}$")
        self.assertEqual(self.asked, [f"Commit the public key on branch {branch} and open a pull request? [Y/n] "])
        ran = [" ".join(c) for c in self.run.calls]
        self.assertTrue(any(c.startswith("npm ci") for c in ran) and any(c.startswith("node _kit/build/build.mjs workroom") for c in ran))
        self.assertEqual(self.run.ran("git", "fetch"), [["git", "fetch", "origin", "main"]])
        add = self.run.ran("git", "worktree", "add")[0]
        self.assertEqual(add[4:], ["-b", branch, "origin/main"])
        self.assertEqual(self.run.ran("git", "switch"), [], "the user's checkout is never switched")
        staged = self.run.ran("git", "add")[0]
        self.assertEqual(staged[:4], ["git", "add", "-A", "--"])
        self.assertEqual(staged[4:], ["music/keys/public.json", "games/workroom/src/public-key.ts", "games/workroom/dist"])
        self.assertEqual(len(self.run.ran("git", "commit")), 1)
        self.assertEqual(self.run.ran("git", "push")[0], ["git", "push", "-u", "origin", "HEAD"])
        self.assertEqual(self.run.ran("gh", "pr", "create")[0], ["gh", "pr", "create", "--fill"])
        self.assertEqual(len(self.run.ran("git", "worktree", "remove")), 1)
        self.assertFalse(self.run.worktrees[0].exists(), "the temporary worktree is gone")
        self.assertEqual(self.run.ran("git", "checkout")[0][2:], ["--", "games/workroom/src/public-key.ts", "games/workroom/dist"])
        self.assertFalse(self.w.public_json.exists(), "the untracked key file leaves the user's checkout")
        self.assertIn("Your checkout is back to main's files; they arrive with the merge.", text)
        self.assertIn("https://github.com/o/r/pull/7", text)
        self.assertIn("After it merges and deploys, the workroom can take your notes.", text)
        for line in ("music-publish API key saved", "music-pickup API key saved", "locked copy uploaded", "pull request opened"):
            self.assertIn("✓ " + line, text)
        names = {i["title"] for i in json.loads((self.w.root / "op.json").read_text())["items"] if "Archive" not in i["title"]}
        self.assertIn("SIUE music API music-publish", names)
        secrets_seen = " ".join(" ".join(c) for c in self.run.calls) + text + " ".join(self.opened) + " ".join(self.prompts)
        for secret in (PUB, PICK):
            self.assertNotIn(secret, secrets_seen)
            for call in self.w.op_calls():
                self.assertNotIn(secret, " ".join(call))

    def test_a_second_run_does_nothing_and_asks_nothing(self):
        self.everything_done()
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual((self.opened, self.prompts, self.asked, self.server.uploads), ([], [], [], []))
        self.assertEqual([c for c in self.run.calls if c[0] in ("npm", "node", "gh") or c[:2] in (["git", "add"], ["git", "commit"], ["git", "push"])], [])
        self.assertIn("The public key is committed.", self.text())
        self.assertIn("The music-pickup API key is saved and works.", self.text())

    def test_a_fresh_start_makes_the_notes_key_after_both_api_keys(self):
        self.pastes = [PUB, PICK]
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual(self.opened, [HUB + "?label=music-publish&scopes=drafts:publish,keys:publish", HUB + "?label=music-pickup&scopes=notes:pickup"])
        self.assertEqual(len(self.server.uploads), 1, "init uploads in the same run")
        self.assertIn("Making the notes key", self.text())

    def test_a_key_in_1password_but_not_in_the_repository_is_adopted(self):
        self.save(PUBLISH_KEY, PUB)
        self.save(PICKUP_KEY, PICK)
        self.w.add_key_to_op(0)
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("1Password already holds a notes key; using it.", self.text())
        self.assertIn(pool_key(0)[0][:8], self.made_branch())

    def test_a_key_that_is_not_in_the_repository_upload_is_skipped_when_recorded(self):
        self.everything_done()
        self.run.state = "uncommitted"
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual(self.server.uploads, [], "the record says the current key is already uploaded")

    def test_a_revoked_key_is_replaced_in_the_guided_way(self):
        self.everything_done()
        del self.server.keys[PICK]
        self.pastes = [SPARE]
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("The music-pickup API key no longer works (revoked or mistyped). Let's make a new one.", self.text())
        self.assertEqual(len(self.opened), 1)

    def test_a_bad_paste_is_explained_and_asked_again(self):
        self.everything_done()
        del self.server.keys[PICK]
        self.pastes = ["not a key", PUB, SPARE]
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("That is not an API key", self.text())
        self.assertIn("is really the music-publish key", self.text())
        self.assertEqual(len(self.prompts), 3)
        self.assertNotIn("not a key", self.text().replace("That is not an API key", ""))

    def test_giving_up_on_pasting_stops_with_a_plain_line(self):
        self.save(PUBLISH_KEY, PUB)
        self.assertEqual(self.go(), 1)
        self.assertIn("No key was pasted. Run make music-setup again", self.text())

    def test_declining_the_pull_request_leaves_the_files_alone(self):
        self.everything_done()
        self.run.state = "uncommitted"
        self.answers = ["n"]
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual((self.run.ran("git", "worktree"), self.run.ran("git", "push")), ([], []))
        self.assertIn("Left uncommitted", self.text())
        self.assertTrue(self.w.public_json.exists())

    def test_without_a_terminal_it_does_not_ask_and_says_how_to_finish(self):
        self.everything_done()
        self.run.state, self.interactive = "uncommitted", False
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual((self.asked, self.run.ran("git", "worktree")), ([], []))
        self.assertIn("Not asking, because this is not a terminal. To finish, run make music-setup in a terminal.", self.text())

    def test_end_of_input_at_the_question_counts_as_no(self):
        self.everything_done()
        self.run.state, self.answers = "uncommitted", []
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("No answer was given. To finish, run make music-setup in a terminal.", self.text())
        self.assertEqual(self.run.ran("git", "push"), [])

    def test_a_branch_that_exists_is_reused_in_the_worktree(self):
        self.everything_done()
        self.run.state = "uncommitted"
        branch = self.fp8_branch()
        self.run.local_branches.add(branch)
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual(self.run.ran("git", "worktree", "add")[0][4:], [branch])

    def test_an_open_pull_request_is_reported_not_duplicated(self):
        self.everything_done()
        self.run.state, self.run.pr_open = "uncommitted", True
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("The pull request is already open: https://github.com/o/r/pull/7", self.text())
        self.assertEqual(self.run.ran("gh", "pr", "create"), [])

    def test_a_branch_already_on_origin_is_not_built_or_asked_about_again(self):
        self.everything_done()
        self.run.state = "uncommitted"
        self.run.remote_branches.add(self.fp8_branch())
        self.run.pr_open = True
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual((self.asked, self.run.ran("node"), self.run.ran("git", "push")), ([], [], []))
        self.assertIn("is already on branch", self.text())
        self.assertFalse(self.w.public_json.exists())

    def test_missing_gh_prints_the_compare_url(self):
        self.everything_done()
        self.run.state, self.run.gh = "uncommitted", False
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("https://github.com/o/r/pull/new/music/notes-key-", self.text())
        self.assertIn("is pushed. Open the pull request here", self.text())

    def test_a_failed_push_keeps_the_commit_and_the_next_run_pushes_and_opens_the_pull_request(self):
        self.everything_done()
        self.run.state, self.run.push_ok = "uncommitted", False
        self.assertEqual(self.go(), 1)
        self.assertIn("The push failed", self.text())
        self.assertIn("Run make music-setup again to retry.", self.text())
        self.assertTrue(self.w.public_json.exists(), "nothing is restored until the push works")
        self.assertEqual(len(self.run.ran("git", "worktree", "remove")), 1)
        self.assertEqual(self.run.ran("gh"), [])
        self.run.push_ok, self.run.calls, self.answers = True, [], ["y"]
        self.w.out.clear()
        self.assertEqual(self.go(), 0, self.text())
        add = self.run.ran("git", "worktree", "add")[0]
        self.assertEqual(len(add), 5, "the kept branch is reused")
        self.assertEqual(len(self.run.ran("git", "push")), 1)
        self.assertEqual(len(self.run.ran("gh", "pr", "create")), 1)

    def test_the_build_skips_npm_ci_when_node_modules_is_current(self):
        self.everything_done()
        self.run.state = "uncommitted"
        modules = self.w.repo / "games" / "node_modules"
        modules.mkdir(parents=True)
        (self.w.repo / "games" / "package-lock.json").write_text("{}")
        (modules / ".package-lock.json").write_text("{}")
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual(self.run.ran("npm"), [])
        self.assertEqual(len(self.run.ran("node")), 1)

    def test_two_keys_saved_under_each_others_names_are_swapped_back_without_asking(self):
        self.w.keys.init(None)
        self.save(PUBLISH_KEY, PICK)
        self.save(PICKUP_KEY, PUB)
        self.run.state = "committed"
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual((self.prompts, self.opened), ([], []))
        secrets = self.w.keys.api_secrets()
        self.assertEqual((secrets[PUBLISH_KEY], secrets[PICKUP_KEY]), (PUB, PICK))

    def test_a_publish_key_lacking_drafts_publish_is_replaced(self):
        self.everything_done()
        self.server.keys[PUB] = ("no", "no")
        self.server.keys[SPARE] = ("yes", "yes")
        self.pastes = [SPARE]
        self.run.state = "committed"
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("The music-publish API key lacks the keys:publish and drafts:publish permission.", self.text())

    def test_an_http_refusal_is_not_reported_as_a_missing_permission(self):
        self.everything_done()
        self.server.keys[PICK] = ("https", "https")
        self.pastes = [SPARE]
        self.run.state = "committed"
        self.go()
        self.assertIn("is not https://", self.text())
        self.assertNotIn("lacks", self.text())

    def test_op_missing_stops_with_the_fix(self):
        from siue_music.op import Op
        self.w.keys.op = Op("SIUE", exe=("/nonexistent/op",))
        self.assertEqual(self.go(), 1)
        self.assertIn("brew install 1password-cli", self.text())


if __name__ == "__main__":
    unittest.main()
