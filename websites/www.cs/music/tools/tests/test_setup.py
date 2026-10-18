"""make music-setup: each step is skipped when it is already done. Fake op, fake server, fake browser, fake git and gh."""
import json
import subprocess
import unittest
from pathlib import Path

from support import World, pool_key
from siue_music.keys import PICKUP_KEY, PUBLISH_KEY
from siue_music.setup import Setup

PUB, PICK, SPARE = "a" * 64, "b" * 64, "c" * 64
HUB = "https://www.cs.siue.edu/~wgrim/admin/keys.php"


class FakeServer:
    """What the server says of each API key; records every keyring it is sent."""

    def __init__(self):
        self.keys = {PUB: ("no", "yes"), PICK: ("yes", "no"), SPARE: ("yes", "yes")}
        self.uploads = []

    def api(self, secret):
        outer = self

        class Api:
            def holds(self, scope):
                state = outer.keys.get(secret)
                if state is None:
                    return "invalid"
                return state[0 if scope == "notes:pickup" else 1]

            def publish_keyring(self, locked):
                outer.uploads.append(locked)

        return Api()


class FakeRun:
    """Stands in for subprocess.run: answers git, npm, node and gh from a script and records every call."""

    def __init__(self, repo: Path, state="uncommitted", branch="main", staged=(), gh=True):
        self.repo, self.state, self.branch, self.staged, self.gh = repo, state, branch, list(staged), gh
        self.calls: list[list[str]] = []

    def __call__(self, argv, **kw):
        self.calls.append(list(argv))
        done = lambda out="", code=0: subprocess.CompletedProcess(argv, code, out, "")  # noqa: E731
        if argv[0] == "gh":
            if not self.gh:
                raise FileNotFoundError("gh")
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
        if sub[:2] == ["diff", "--cached"]:
            return done("\n".join(self.staged) + "\n")
        if sub[:2] == ["rev-parse", "--abbrev-ref"]:
            return done(self.branch + "\n")
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

    def go(self):
        def secret(prompt):
            self.prompts.append(prompt)
            if not self.pastes:
                raise EOFError
            return self.pastes.pop(0)

        def ask(prompt):
            self.asked.append(prompt)
            return self.answers.pop(0)

        setup = Setup(self.w.keys, self.server.api, ask, secret, lambda url: self.opened.append(url) or True, self.run, out=self.w.out.append)
        self.code = setup.run_all()
        return self.code

    def text(self):
        return "\n".join(self.w.out)

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
        self.assertEqual(self.asked, ["Commit the public key and open a pull request? [Y/n] "])
        ran = [" ".join(c) for c in self.run.calls]
        self.assertTrue(any(c.startswith("npm ci") for c in ran) and any(c.startswith("node _kit/build/build.mjs workroom") for c in ran))
        self.assertEqual(len(self.run.ran("git", "switch", "-c")), 1)
        self.assertTrue(self.run.ran("git", "switch", "-c")[0][3].startswith("music/notes-key-"))
        added = self.run.ran("git", "add")[0]
        self.assertEqual([Path(p).relative_to(self.w.repo).as_posix() for p in added[3:]],
                         ["music/keys/public.json", "games/workroom/src/public-key.ts", "games/workroom/dist"])
        self.assertEqual(len(self.run.ran("git", "commit")), 1)
        self.assertEqual(self.run.ran("git", "push")[0], ["git", "push", "-u", "origin", "HEAD"])
        self.assertEqual(self.run.ran("gh")[0], ["gh", "pr", "create", "--fill"])
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
        self.assertTrue(self.w.public_json.exists())
        self.assertEqual(len(self.server.uploads), 1, "init uploads in the same run")
        self.assertIn("Making the notes key", self.text())

    def test_a_key_in_1password_but_not_in_the_repository_is_adopted(self):
        self.save(PUBLISH_KEY, PUB)
        self.save(PICKUP_KEY, PICK)
        self.w.add_key_to_op(0)
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("1Password already holds a notes key; using it.", self.text())
        self.assertIn(pool_key(0)[0], self.w.public_json.read_text())

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
        self.assertEqual(self.run.ran("git", "add"), [])
        self.assertIn("Left uncommitted", self.text())

    def test_something_else_staged_stops_before_any_commit(self):
        self.everything_done()
        self.run.state, self.run.staged = "uncommitted", ["README.md"]
        self.assertEqual(self.go(), 1)
        self.assertIn("Something else is staged for commit", self.text())
        self.assertEqual((self.run.ran("git", "add"), self.run.ran("git", "commit"), self.asked), ([], [], []))

    def test_on_a_branch_already_no_new_branch_is_made_and_missing_gh_prints_the_compare_url(self):
        self.everything_done()
        self.run.state, self.run.branch, self.run.gh = "uncommitted", "music/notes-key", False
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual(self.run.ran("git", "switch"), [])
        self.assertIn("https://github.com/o/r/pull/new/music/notes-key", self.text())

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

    def test_op_missing_stops_with_the_fix(self):
        from siue_music.op import Op
        self.w.keys.op = Op("SIUE", exe=("/nonexistent/op",))
        self.assertEqual(self.go(), 1)
        self.assertIn("brew install 1password-cli", self.text())


if __name__ == "__main__":
    unittest.main()
