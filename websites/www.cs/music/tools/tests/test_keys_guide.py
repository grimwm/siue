"""keys status: the notes key in 1Password, in the cache and on the server, the "What's left" checklist, and the API key
checks it makes against the server."""
import unittest

from support import ServerApi, World
from siue_music.keys import PICKUP_KEY, PUBLISH_KEY, api_problem, display

SECRET = "e" * 64


class FakeKey:
    """What the server says about one API key."""

    def __init__(self, pickup, publish):
        self.states = {"notes:pickup": pickup, "keys:publish": publish, "drafts:publish": publish}

    def holds(self, scope):
        return self.states[scope]

    def keyring_fingerprints(self):
        return None


class GuideTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.server = ServerApi()

    def text(self):
        return "\n".join(self.w.out)

    def status(self, check="server"):
        self.w.out.clear()
        code = self.w.keys.status(lambda secret: self.server if check == "server" else check)
        return code, self.text()

    def finish(self):
        self.w.keys.api_key_set(PUBLISH_KEY, SECRET)
        self.w.keys.api_key_set(PICKUP_KEY, "f" * 64)
        self.w.keys.ensure_key(self.server)
        self.w.keys.upload_keyring(self.server)

    def test_status_when_nothing_is_done(self):
        code = self.w.keys.status()
        self.assertEqual(code, 3)
        self.assertIn("Nothing is set up yet.\nNext: make music-setup", self.text())

    def test_everything_done_shows_the_same_key_in_all_three_places_and_exits_0(self):
        self.finish()
        code, text = self.status()
        fp = self.w.cache.load()["current"]
        self.assertEqual(code, 0, text)
        self.assertIn(f"Notes key in 1Password (vault SIUE): {display(fp)}", text)
        self.assertIn(f"Notes key in this computer's cache: {display(fp)} (matches 1Password)", text)
        self.assertIn(f"Notes key on the server: {display(fp)} (matches 1Password)", text)
        self.assertIn("Setup is complete.", text)
        self.assertNotIn("Next: make music-setup", text)
        for secret in (SECRET, "f" * 64):
            self.assertNotIn(secret, text)

    def test_a_server_key_that_is_not_the_current_one_exits_3_and_points_at_setup(self):
        self.finish()
        self.server.stored = {"current": "c" * 64, "previous": [], "uploaded_at": 1}
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertIn(f"Notes key on the server: {display('c' * 64)} (does not match 1Password: run make music-setup)", text)
        self.assertTrue(text.rstrip().endswith("Next: make music-setup"))

    def test_earlier_keys_that_differ_on_the_server_are_reported(self):
        self.finish()
        self.w.add_key_to_op(7, previous=True)
        self.w.keys.pull()
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertIn("the earlier keys differ from 1Password", text)

    def test_no_keyring_on_the_server_is_none_yet(self):
        self.finish()
        self.server.stored = None
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertIn("Notes key on the server: none yet", text)
        self.assertIn("→ The locked copy of your key is not on the server", text)

    def test_without_a_working_publish_key_the_server_is_not_checked(self):
        self.finish()
        code, text = self.status(FakeKey("no", "no"))
        self.assertEqual(code, 3)
        self.assertIn("Notes key on the server: not checked", text)
        self.assertIn("lacks the keys:publish and drafts:publish permission", text)

    def test_a_cache_that_names_another_key_is_reported(self):
        self.finish()
        data = self.w.cache.load()
        data["current"] = "d" * 64
        self.w.cache.save(data)
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertIn("does not match 1Password", text)

    def test_two_current_items_show_the_fix_in_the_1password_line(self):
        self.finish()
        self.w.add_key_to_op(4)
        code, text = self.status()
        self.assertEqual(code, 3)
        self.assertIn("could not be checked", text)
        self.assertIn("add (previous) to the title", text)

    def test_a_key_only_the_cache_holds_is_named(self):
        self.finish()
        for item in self.w.op.list_items("siue-music-key"):
            self.w.op.archive(item["id"])
        self.w.add_key_to_op(2)
        _, text = self.status()
        self.assertIn("Only this computer holds", text)

    def test_the_checklist_lists_what_is_missing_and_never_mentions_git(self):
        self.w.keys.ensure_key()
        code, text = self.status(FakeKey("yes", "yes"))
        self.assertEqual(code, 3)
        left = text.split("What's left")[1]
        self.assertIn("→ The music-publish API key is not saved.", left)
        self.assertIn("Next: make music-setup", left)
        for word in ("repository", "committed", "pull request", "branch"):
            self.assertNotIn(word, text)

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
        _, text = self.status(FakeKey("no", "yes"))
        self.assertIn("→ The key saved as music-pickup is really the music-publish key", text)
        self.assertNotIn("f" * 64, text)


if __name__ == "__main__":
    unittest.main()
