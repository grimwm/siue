"""make music-setup: each step is skipped when it is already done. Fake op, fake server, fake browser; no git, no build."""
import io
import sys
import unittest
from unittest import mock

from support import ServerApi, World, pool_key
from siue_music import cli
from siue_music.keys import PICKUP_KEY, PUBLISH_KEY
from siue_music.setup import Setup

PUB, PICK, SPARE = "a" * 64, "b" * 64, "c" * 64
HUB = "https://www.cs.siue.edu/~wgrim/admin/keys.php"


class FakeServer:
    """What the server says of each API key, and the keyring it stores (one store for every key)."""

    def __init__(self):
        # (notes:pickup, keys:publish and drafts:publish) per key
        self.keys = {PUB: ("no", "yes"), PICK: ("yes", "no"), SPARE: ("yes", "yes")}
        self.store = ServerApi()

    @property
    def uploads(self):
        return self.store.uploads

    def api(self, secret):
        outer = self

        class Api:
            def holds(self, scope):
                state = outer.keys.get(secret)
                if state is None:
                    return "invalid"
                return state[0 if scope == "notes:pickup" else 1]  # publish keys hold both publish scopes

            def publish_keyring(self, locked, current, previous):
                outer.store.publish_keyring(locked, current, previous)

            def keyring_fingerprints(self):
                return outer.store.keyring_fingerprints()

        return Api()


class SetupTest(unittest.TestCase):
    def setUp(self):
        self.w = World(self)
        self.server = FakeServer()
        self.opened: list[str] = []
        self.prompts: list[str] = []
        self.pastes: list[str] = []

    def go(self):
        def secret(prompt):
            self.prompts.append(prompt)
            if not self.pastes:
                raise EOFError
            return self.pastes.pop(0)

        setup = Setup(self.w.keys, self.server.api, secret, lambda url: self.opened.append(url) or True, out=self.w.out.append)
        # 1Password goes through the Op object (the fake op script); anything else that shells out, git above all, fails here.
        with mock.patch("subprocess.run", side_effect=AssertionError("setup must not run any command")) as run:
            self.code = setup.run_all()
        self.assertEqual(run.call_count, 0)
        return self.code

    def text(self):
        return "\n".join(self.w.out)

    def save(self, name, secret):
        self.w.keys.api_key_set(name, secret)

    def everything_done(self):
        self.save(PUBLISH_KEY, PUB)
        self.save(PICKUP_KEY, PICK)
        self.w.keys.ensure_key()
        self.w.keys.upload_keyring(self.server.api(PUB))
        self.w.out.clear()
        self.server.uploads.clear()

    def test_the_owners_state_is_finished_in_one_run_without_git(self):
        """The publish key saved under the pickup name, no notes key, nothing uploaded."""
        self.save(PICKUP_KEY, PUB)
        self.pastes = [PICK]
        self.assertEqual(self.go(), 0, self.text())
        text = self.text()
        self.assertIn("The key saved as music-pickup is really the music-publish key: filing it under that name.", text)
        self.assertEqual(self.opened, [HUB + "?label=music-pickup&scopes=notes:pickup"])
        self.assertEqual(self.prompts, ["In the browser, press Create key, then copy the key from \"Your new key\" and paste it here: "])
        [sent] = self.server.uploads
        self.assertEqual(sent["current"], self.w.keys.cache.load()["current"])
        self.assertEqual(sent["previous"], [])
        for line in ("music-publish API key saved", "music-pickup API key saved", "notes key made and saved in 1Password",
                     "locked copy on the server, its current key checked"):
            self.assertIn("✓ " + line, text)
        self.assertIn("Next: publish a draft with make music-publish PIECE=<id>", text)
        self.assertIn("then open it in the workroom, https://www.cs.siue.edu/~wgrim/music/, and leave a note on its page.", text)
        self.assertIn("Pick up the notes with make music-pickup.", text)
        self.assertEqual(text.count("Done:"), 1, "only the closing checklist says Done")
        for word in ("pull request", "branch", "commit", "[Y/n]"):
            self.assertNotIn(word, text)
        secrets_seen = text + " ".join(self.opened) + " ".join(self.prompts)
        for secret in (PUB, PICK):
            self.assertNotIn(secret, secrets_seen)
            for call in self.w.op_calls():
                self.assertNotIn(secret, " ".join(call))

    def test_end_of_input_at_the_paste_prompt_stops_after_one_try(self):
        setup = Setup(self.w.keys, self.server.api, cli.read_secret, lambda url: True, out=self.w.out.append)
        with mock.patch.object(sys, "stdin", io.StringIO("")):
            self.assertEqual(setup.run_all(), 1)
        self.assertIn("No key was pasted. Run make music-setup again when you have it.", self.text())
        self.assertNotIn("That is not an API key", self.text())

    def test_a_second_run_does_nothing_and_asks_nothing(self):
        self.everything_done()
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual((self.opened, self.prompts, self.server.uploads), ([], [], []))
        self.assertIn("The server already holds the locked copy of this key and the earlier ones.", self.text())
        self.assertIn("The music-pickup API key is saved and works.", self.text())

    def test_the_upload_is_skipped_only_when_the_server_holds_the_current_and_previous_keys(self):
        self.everything_done()
        self.w.add_key_to_op(3, previous=True)  # a retained key the server does not know yet
        self.assertEqual(self.go(), 0, self.text())
        [sent] = self.server.uploads
        self.assertEqual(sent["previous"], [pool_key(3)[0]])
        self.server.uploads.clear()
        self.assertEqual(self.go(), 0)
        self.assertEqual(self.server.uploads, [])

    def test_a_server_holding_a_key_this_computer_cannot_open_is_not_overwritten(self):
        self.everything_done()
        self.server.store.stored = {"current": pool_key(5)[0], "previous": [], "uploaded_at": 1}
        self.assertEqual(self.go(), 1)
        self.assertIn("so nothing was changed", self.text())
        self.assertEqual(self.server.uploads, [])

    def test_a_server_that_does_not_keep_the_upload_fails_the_run(self):
        self.everything_done()
        self.server.store.stored = None

        class Forgetful(ServerApi):
            def publish_keyring(self, locked, current, previous):
                pass

        self.server.store = Forgetful()
        self.assertEqual(self.go(), 1)
        self.assertIn("did not keep the keyring", self.text())

    def test_a_key_in_1password_is_adopted_not_replaced(self):
        self.save(PUBLISH_KEY, PUB)
        self.save(PICKUP_KEY, PICK)
        fp = self.w.add_key_to_op(0)
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("1Password already holds a notes key; using it.", self.text())
        self.assertEqual(len(self.w.op.list_items("siue-music-key")), 1)
        self.assertEqual(self.server.uploads[0]["current"], fp)

    def test_two_current_keys_in_1password_stop_with_what_to_fix(self):
        self.save(PUBLISH_KEY, PUB)
        self.save(PICKUP_KEY, PICK)
        self.w.add_key_to_op(0)
        self.w.add_key_to_op(1)
        self.assertEqual(self.go(), 1)
        self.assertIn("add (previous) to the title of every other one", self.text())
        self.assertEqual(self.server.uploads, [])

    def test_a_fresh_start_makes_the_notes_key_after_both_api_keys(self):
        self.pastes = [PUB, PICK]
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual(self.prompts.count("In the browser, press Create key, then copy the key from \"Your new key\" and paste it here: "), 2)
        self.assertEqual(len(self.w.op.list_items("siue-music-key")), 1)
        self.assertEqual(len(self.server.uploads), 1)

    def test_a_revoked_key_is_replaced_in_the_guided_way(self):
        self.everything_done()
        del self.server.keys[PICK]
        self.server.keys[SPARE] = ("yes", "no")
        self.pastes = [SPARE]
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("The music-pickup API key no longer works (revoked or mistyped). Let's make a new one.", self.text())
        self.assertEqual(self.w.keys.api_secrets()[PICKUP_KEY], SPARE)

    def test_a_bad_paste_is_explained_and_asked_again(self):
        self.save(PUBLISH_KEY, PUB)
        self.pastes = ["not a key", PICK]
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("That is not an API key", self.text())
        self.assertEqual(len(self.prompts), 2)

    def test_giving_up_on_pasting_stops_with_a_plain_line(self):
        self.save(PUBLISH_KEY, PUB)
        self.assertEqual(self.go(), 1)
        self.assertIn("No key was pasted. Run make music-setup again", self.text())

    def test_two_keys_saved_under_each_others_names_are_swapped_back_without_asking(self):
        self.save(PUBLISH_KEY, PICK)
        self.save(PICKUP_KEY, PUB)
        self.assertEqual(self.go(), 0, self.text())
        self.assertEqual((self.prompts, self.opened), ([], []))
        secrets = self.w.keys.api_secrets()
        self.assertEqual((secrets[PUBLISH_KEY], secrets[PICKUP_KEY]), (PUB, PICK))

    def test_a_publish_key_lacking_drafts_publish_is_replaced(self):
        self.everything_done()
        self.server.keys[PUB] = ("no", "no")
        self.pastes = [SPARE]
        self.assertEqual(self.go(), 0, self.text())
        self.assertIn("The music-publish API key lacks the keys:publish and drafts:publish permission.", self.text())

    def test_an_http_refusal_is_not_reported_as_a_missing_permission(self):
        self.everything_done()
        self.server.keys[PICK] = ("https", "https")
        self.pastes = [SPARE]
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
