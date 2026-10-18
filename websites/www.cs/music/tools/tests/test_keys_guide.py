"""keys status: the "What's left" checklist, and the API key checks it makes against the server."""
import json
import subprocess
import unittest

from support import World, pool_key
from siue_music.keys import PICKUP_KEY, PUBLISH_KEY, api_problem, display

SECRET = "e" * 64


def git(repo, *args):
    subprocess.run(["git", "-C", str(repo), "-c", "user.email=t@example.com", "-c", "user.name=t", *args],
                   check=True, capture_output=True)


class FakeKey:
    """What the server says about one API key."""

    def __init__(self, pickup, publish):
        self.states = {"notes:pickup": pickup, "keys:publish": publish, "drafts:publish": publish}

    def holds(self, scope):
        return self.states[scope]


class GuideTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.uploads = []

    def text(self):
        return "\n".join(self.w.out)

    def checklist(self, check=None):
        self.w.out.clear()
        code = self.w.keys.status(check)
        return code, self.text().split("What's left")[1]

    def make_repo(self):
        git(self.w.repo, "init", "-q")

    def commit(self):
        dist = self.w.repo / "games" / "workroom" / "dist"
        dist.mkdir(parents=True, exist_ok=True)
        (dist / "index.js").write_text("built")
        git(self.w.repo, "add", "-A")
        git(self.w.repo, "commit", "-qm", "key")

    def finish(self):
        self.make_repo()
        self.w.keys.api_key_set(PUBLISH_KEY, SECRET)
        self.w.keys.api_key_set(PICKUP_KEY, "f" * 64)
        self.w.keys.init(self.uploads.append)
        self.commit()

    def test_the_hub_address_follows_the_music_base(self):
        self.w.keys.base = "http://127.0.0.1:9/~me/music/"
        self.assertEqual(self.w.keys.hub_url(), "http://127.0.0.1:9/~me/admin/")

    def test_init_without_an_api_key_points_at_music_setup_and_explains_the_two_kinds_of_key(self):
        self.w.keys.init(None)
        text = self.text()
        self.assertIn("Run make music-setup to finish", text)
        self.assertIn("NOTES KEY  seals your notes", text)
        self.assertIn("API KEYS   (music-publish, music-pickup)", text)
        self.assertNotIn(SECRET, text)

    def test_status_when_nothing_is_done(self):
        code = self.w.keys.status()
        self.assertEqual(code, 3)
        self.assertEqual(self.text().strip(), "Nothing is set up yet.\nNext: make music-setup")

    def test_status_with_the_key_made_but_not_committed_and_nothing_else(self):
        self.make_repo()
        self.w.keys.init(None)
        code, left = self.checklist()
        self.assertEqual(code, 0)
        self.assertIn("✓ The notes key is in the repository", left)
        self.assertIn("→ The public key is not committed yet.", left)
        self.assertIn("✓ The key is saved in 1Password.", left)
        self.assertIn("✓ The key is in this computer's cache.", left)
        self.assertIn("→ The music-publish API key is not saved.", left)
        self.assertIn("→ The music-pickup API key is not saved.", left)
        self.assertIn("→ The locked copy of your key is not on the server yet.", left)
        self.assertTrue(left.rstrip().endswith("Next: make music-setup"))

    def test_status_without_git_asks_to_check_the_commit(self):
        self.w.keys.init(None)
        self.assertIn("Check that music/keys/public.json is committed", self.checklist()[1])

    def test_status_when_everything_is_done(self):
        self.finish()
        code, left = self.checklist()
        self.assertEqual(code, 0)
        self.assertNotIn("→", left)
        self.assertEqual(left.count("✓"), 7)
        self.assertIn("Setup is complete. Notes you leave in the workroom will be sealed to this key; pick them up with make music-pickup.", left)
        self.assertNotIn("Next:", left)

    def test_a_key_changed_after_the_commit_is_uncommitted_again(self):
        self.finish()
        self.w.public_ts.write_text(self.w.public_ts.read_text() + "// edited\n")
        self.assertIn("→ The public key is not committed yet.", self.checklist()[1])

    def test_a_missing_upload_is_the_one_thing_left(self):
        self.make_repo()
        self.w.keys.api_key_set(PUBLISH_KEY, SECRET)
        self.w.keys.api_key_set(PICKUP_KEY, "f" * 64)
        self.w.keys.init(None)
        self.commit()
        _, left = self.checklist()
        self.assertEqual(left.count("→"), 1)
        self.assertIn("The locked copy of your key is not on the server yet.", left)

    def test_an_upload_of_an_older_key_does_not_cover_a_rotation(self):
        self.finish()
        data = self.w.cache.load()
        data["uploaded"]["fingerprints"] = [pool_key(7)[0]]
        self.w.cache.save(data)
        self.assertIn("→ The locked copy of your key is not on the server yet.", self.checklist()[1])

    def test_a_pull_keeps_the_upload_record_and_no_secret_is_printed(self):
        self.finish()
        self.w.keys.pull()
        self.assertIn("uploaded", self.w.cache.load())
        self.assertNotIn(SECRET, self.text())
        self.assertNotIn(SECRET, repr(self.w.cache.load()["uploaded"]))

    def test_keys_upload_records_the_upload(self):
        self.w.keys.init(None)
        self.assertNotIn("uploaded", self.w.cache.load())
        self.w.keys.upload_keyring(self.uploads.append)
        self.assertEqual(len(self.w.cache.load()["uploaded"]["fingerprints"]), 1)

    def test_a_missing_api_key_error_says_to_run_music_setup(self):
        with self.assertRaises(Exception) as ctx:
            self.w.keys.api_key(PICKUP_KEY, "make music-pickup")
        self.assertIn("Run make music-setup", str(ctx.exception))
        self.assertIn("then run make music-pickup again", str(ctx.exception))

    def test_api_problem_names_a_misnamed_key(self):
        publish_key = FakeKey("no", "yes").states
        self.assertIn("really the music-publish key", api_problem(PICKUP_KEY, publish_key))
        self.assertIsNone(api_problem(PUBLISH_KEY, publish_key))
        self.assertIn("no longer works", api_problem(PICKUP_KEY, FakeKey("invalid", "invalid").states))
        self.assertIsNone(api_problem(PICKUP_KEY, FakeKey("unknown", "unknown").states), "an unreachable server is not a verdict")

    def test_status_reports_a_misnamed_key_from_the_server(self):
        self.finish()
        self.w.cache.save({**self.w.cache.load(), "api": {}})
        _, left = self.checklist(lambda secret: FakeKey("no", "yes"))
        self.assertIn("→ The key saved as music-pickup is really the music-publish key", left)
        self.assertNotIn("f" * 64, self.text())



class PendingKeyTest(unittest.TestCase):
    """The key is made and saved, but music/keys/public.json is not on this checkout: it waits on a branch or in a pull request."""

    def setUp(self):
        self.w = World(self)
        self.gh_calls = []
        self.gh_output = None
        self.w.keys.run = self.run_cmd
        self.w.keys.api_key_set(PUBLISH_KEY, SECRET)
        self.w.keys.api_key_set(PICKUP_KEY, "f" * 64)
        self.w.keys.init(lambda locked: None)
        self.fp = pool_key(0)[0] if False else next(iter(self.w.cache.load()["keys"]))
        self.w.public_json.unlink()
        git(self.w.repo, "init", "-q")
        git(self.w.repo, "commit", "-q", "--allow-empty", "-m", "base")

    def run_cmd(self, argv, **kw):
        if argv[0] == "gh":
            self.gh_calls.append((argv, kw.get("timeout")))
            if self.gh_output is None:
                raise FileNotFoundError("gh")
            return subprocess.CompletedProcess(argv, 0, json.dumps(self.gh_output), "")
        return subprocess.run(argv, **kw)

    def branch(self):
        git(self.w.repo, "branch", f"music/notes-key-{self.fp[:8]}")

    def status(self):
        self.w.out.clear()
        code = self.w.keys.status()
        return code, "\n".join(self.w.out)

    def test_open_pull_request_is_named_and_is_the_next_step(self):
        self.branch()
        self.gh_output = [{"number": 166, "url": "https://github.com/o/r/pull/166", "state": "OPEN"}]
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertNotIn("No notes key yet", text)
        self.assertIn(f"The notes key is made ({display(self.fp)})", text)
        self.assertIn("\u2713 The key is saved in 1Password.", text)
        self.assertIn("\u2713 The key is in this computer's cache.", text)
        self.assertIn("\u2713 The locked copy of your key is on the server", text)
        self.assertIn("The public key is waiting in pull request #166: https://github.com/o/r/pull/166 \u2014 merge it, then the workroom can take your notes.", text)
        self.assertTrue(text.rstrip().endswith("Next: merge pull request #166 (https://github.com/o/r/pull/166)"))
        self.assertTrue(all(t for _, t in self.gh_calls))

    def test_branch_without_a_pull_request(self):
        self.branch()
        self.gh_output = []
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertIn(f"on branch music/notes-key-{self.fp[:8]} (no pull request yet): make music-setup opens one", text)
        self.assertTrue(text.rstrip().endswith("Next: make music-setup"))

    def test_gh_missing_degrades_to_the_branch_line(self):
        self.branch()
        _, text = self.status()
        self.assertIn("(no pull request yet)", text)

    def test_nothing_committed_anywhere(self):
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertIn("The public key is not committed anywhere yet: make music-setup", text)
        self.assertTrue(text.rstrip().endswith("Next: make music-setup"))
        self.assertEqual(self.gh_calls, [])

    def test_missing_pieces_still_send_the_owner_to_music_setup(self):
        self.branch()
        self.gh_output = [{"number": 166, "url": "https://github.com/o/r/pull/166", "state": "OPEN"}]
        data = self.w.cache.load()
        data["keys"] = {}
        self.w.cache.save(data)
        _, text = self.status()
        self.assertIn("\u2192 The key is not in this computer's cache.", text)
        self.assertTrue(text.rstrip().endswith("Next: make music-setup"))

    def test_everything_done_once_the_key_is_in_the_repository(self):
        self.branch()
        self.gh_output = [{"number": 166, "url": "https://github.com/o/r/pull/166", "state": "OPEN"}]
        self.w.keys.init(None, adopt=True)
        (self.w.repo / "games" / "workroom" / "dist").mkdir(parents=True)
        (self.w.repo / "games" / "workroom" / "dist" / "index.js").write_text("built")
        git(self.w.repo, "add", "-A")
        git(self.w.repo, "commit", "-qm", "key")
        self.w.out.clear()
        code = self.w.keys.status()
        text = "\n".join(self.w.out)
        self.assertNotIn("waiting in pull request", text)
        self.assertIn("Setup is complete", text)
        self.assertEqual(code, 0)


if __name__ == "__main__":
    unittest.main()
