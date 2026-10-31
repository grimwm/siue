"""The studio connection (siue-music mcp for every studio): where its files live and how private they are, where the AI key
comes from, the pairing code, and each tool against the fake studio over real HTTP, as an AI key sees it."""
import asyncio
import contextlib
import io
import json
import os
import stat
import tempfile
import unittest
import unittest.mock
from pathlib import Path

from fake_server import FakeServer
from support import FIXTURES, LIBRARY_JSON
from siue_music import cli, sealing
from siue_music.answering import MissingDependency, Steps
from siue_music.studio import PLACEHOLDER, Studio, StudioError, config_dir, pairing_code

KEY = "a" * 64
OTHER = "b" * 64
NOTE = "e" * 32
SCORE = json.loads((FIXTURES / "draft-score" / "score.json").read_text())


def _no_steps() -> Steps:
    def missing(*_):
        raise MissingDependency("optional speech and humming steps are not installed")
    return Steps(missing, missing)


def body(text: str) -> dict:
    return {"v": 1, "kind": "text", "piece": "general", "draft": 1, "from": 0, "to": 0, "fromBar": None, "toBar": None, "lane": None,
            "text": text, "reaction": None, "curve": None, "audio": None, "made": "2027-01-15T08:00:00.000Z"}


class PlacesTest(unittest.TestCase):
    def test_each_platform_keeps_the_keys_in_its_user_config_folder(self):
        home = Path("/home/me")
        self.assertEqual(config_dir("linux", {}, home), home / ".config" / "siue-music")
        self.assertEqual(config_dir("linux", {"XDG_CONFIG_HOME": "/x"}, home), Path("/x/siue-music"))
        self.assertEqual(config_dir("darwin", {}, home), home / "Library" / "Application Support" / "siue-music")
        self.assertEqual(config_dir("win32", {"APPDATA": "C:/Users/me/AppData/Roaming"}, home), Path("C:/Users/me/AppData/Roaming/siue-music"))
        self.assertEqual(config_dir("linux", {"SIUE_MUSIC_CONFIG_DIR": "/k"}, home), Path("/k"))

    def test_the_pairing_code_vectors_match_the_page_and_the_server(self):
        import hashlib
        self.assertEqual(pairing_code(hashlib.sha256(b"siue").hexdigest()), "BH16-EYT6-88ZR-N5Z4")
        self.assertEqual(pairing_code(hashlib.sha256(b"pair").hexdigest()), "8ZCB-THM7-F0RW-SNGW")
        self.assertEqual(pairing_code("0" * 64), "0000-0000-0000-0000")
        self.assertEqual(pairing_code("f" * 64), "ZZZZ-ZZZZ-ZZZZ-ZZZZ")


class StudioTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.server = FakeServer("1" * 64, "2" * 64).__enter__()
        self.addCleanup(self.server.__exit__)
        self.server.add_ai_key(KEY, {"notes:pickup", "drafts:publish", "drafts:delete"})
        self.env = {"SIUE_MUSIC_BASE": self.server.base, "SIUE_MUSIC_AI_KEY": KEY, "SIUE_MUSIC_CONFIG_DIR": str(self.root / "cfg"),
                    "SIUE_MUSIC_NOTES_DIR": str(self.root / "notes"), "SIUE_MUSIC_POLL_SECONDS": "2"}

    def studio(self, **over) -> Studio:
        library = LIBRARY_JSON.read_bytes()
        return Studio({**self.env, **over}, self.root, "linux", steps=_no_steps(), fetch=lambda _url: library)

    def note_for_both(self, studio: Studio, text: str, note_id: str = NOTE) -> None:
        person = sealing.generate()[1]
        self.server.add_note(note_id, sealing.seal_to(body(text), b"", [person, studio.sealing_key()[2]]))

    def test_the_key_and_the_sealing_key_are_private_and_made_once(self):
        studio = self.studio(SIUE_MUSIC_AI_KEY="")
        studio.save_key(KEY + "\n")
        fp = studio.sealing_key()[0]
        self.assertEqual(Studio({**self.env}, self.root, "linux").sealing_key()[0], fp, "a second app on this computer uses the same key")
        folder = self.root / "cfg"
        if os.name != "nt":
            self.assertEqual(stat.S_IMODE(folder.stat().st_mode), 0o700)
            for name in ("ai-key", "sealing-key.json"):
                self.assertEqual(stat.S_IMODE((folder / name).stat().st_mode), 0o600, name)
        self.assertEqual(studio.ai_key(), KEY, "the saved key serves an app started without one")
        self.assertEqual(sorted(p.name for p in folder.iterdir()), ["ai-key", "sealing-key.json"], "no temporary file is left")

    def test_no_key_or_the_placeholder_says_to_make_one_and_where_to_paste_it(self):
        for given in ("", PLACEHOLDER):
            with self.assertRaises(StudioError) as e:
                self.studio(SIUE_MUSIC_AI_KEY=given).ai_key()
            self.assertIn("Make an AI key on Your studio", str(e.exception))
            self.assertIn(PLACEHOLDER, str(e.exception))
            self.assertIn(self.server.base + "studio.php", str(e.exception))
        with self.assertRaises(StudioError) as e:
            self.studio(SIUE_MUSIC_AI_KEY="not-a-key").ai_key()
        self.assertIn("is not an AI key", str(e.exception))
        status = self.studio(SIUE_MUSIC_AI_KEY=PLACEHOLDER).status()
        self.assertFalse(status["connected"])
        self.assertIn("Make an AI key", status["next"])

    def test_status_registers_the_sealing_key_and_gives_the_code_until_it_is_paired(self):
        studio = self.studio()
        status = studio.status()
        self.assertEqual((status["connected"], status["paired"], status["label"]), (True, False, "my assistant"))
        self.assertEqual(status["pairing_code"], pairing_code(studio.sealing_key()[0]))
        self.assertIn(status["pairing_code"], status["next"])
        self.assertIn("'my assistant'", status["next"])
        self.assertEqual(self.server.ai[KEY]["sealing"]["fingerprint"], studio.sealing_key()[0])
        with self.assertRaises(StudioError) as e:
            studio.read_new_notes()
        self.assertIn(status["pairing_code"], str(e.exception), "a notes tool before pairing gives the code")
        self.server.pair(KEY)
        self.assertTrue(studio.status()["paired"])

    def test_a_key_that_cannot_read_notes_needs_no_pairing(self):
        self.server.add_ai_key(OTHER, {"drafts:publish"})
        studio = self.studio(SIUE_MUSIC_AI_KEY=OTHER)
        self.assertIn("needs no pairing", studio.status()["next"])
        with self.assertRaises(StudioError) as e:
            studio.read_new_notes()
        self.assertIn("may not read notes", str(e.exception))

    def test_a_revoked_or_unknown_key_says_so(self):
        studio = self.studio(SIUE_MUSIC_AI_KEY="c" * 64)
        self.assertIn("revoked or mistyped", studio.status()["next"])
        with self.assertRaises(StudioError) as e:
            studio.list_pieces()
        self.assertIn("revoked or mistyped", str(e.exception))

    def test_a_key_paired_on_another_computer_is_named(self):
        self.studio().status()
        self.server.pair(KEY)
        elsewhere = self.studio(SIUE_MUSIC_CONFIG_DIR=str(self.root / "laptop"))
        with self.assertRaises(StudioError) as e:
            elsewhere.status()
        self.assertIn("another computer", str(e.exception))

    def test_read_new_notes_opens_only_notes_sealed_to_this_ai_and_marks_none(self):
        studio = self.studio()
        studio.status()
        self.server.pair(KEY)
        person = sealing.generate()[1]
        self.server.add_note("d" * 32, sealing.seal(body("before pairing"), b"", person))
        self.note_for_both(studio, "after pairing")
        read = studio.read_new_notes()
        self.assertEqual([(n["id"], n["text"]) for n in read["notes"]], [(NOTE, "after pairing")])
        self.assertEqual(self.server.marked, [], "reading marks nothing")
        self.assertTrue(Path(read["notes"][0]["files"]["note"]).is_file(), "opened and saved on this computer")
        self.assertEqual(studio.mark_picked_up([NOTE]), {"marked": [NOTE], "not_found": []})
        self.assertEqual(self.server.marked, [NOTE])
        self.assertEqual(studio.mark_picked_up(["d" * 32]), {"marked": [], "not_found": ["d" * 32]}, "a note not sealed to it is not its to mark")
        with self.assertRaises(StudioError):
            studio.mark_picked_up(["../x"])

    def test_wait_answers_when_a_new_note_arrives_and_ignores_ones_already_opened(self):
        studio = self.studio()
        studio.status()
        self.server.pair(KEY)
        now = [0.0]

        async def sleep(s: float) -> None:
            now[0] += s
            if now[0] >= 4:
                self.note_for_both(studio, "arrived", "f" * 32)

        waiting = Studio(self.env, self.root, "linux", steps=_no_steps(), sleep=sleep, clock=lambda: now[0])
        got = asyncio.run(waiting.wait_for_notes(60))
        self.assertEqual((got["timed_out"], [n["id"] for n in got["notes"]]), (False, ["f" * 32]))
        studio.read_new_notes()
        again = asyncio.run(Studio(self.env, self.root, "linux", sleep=sleep, clock=lambda: now[0]).wait_for_notes(5))
        self.assertTrue(again["timed_out"], "a note already opened here is not new")

    def test_drafts_publish_read_list_and_delete(self):
        studio = self.studio()
        score = dict(SCORE, piece=dict(SCORE["piece"], id="studio-piece"), draft=1)
        done = studio.publish_draft(score)
        self.assertEqual((done["piece"], done["version"]), ("studio-piece", 1))
        self.assertTrue(done["page"].endswith("piece.php?id=studio-piece&v=1"))
        with self.assertRaises(StudioError) as e:
            studio.publish_draft(score)
        self.assertIn("published already", str(e.exception))
        self.assertEqual(studio.read_score("studio-piece")["score"]["piece"]["id"], "studio-piece")
        self.assertEqual([p["piece"] for p in studio.list_pieces()["pieces"]], ["studio-piece"])
        bad = dict(score, draft=2, lanes=[dict(score["lanes"][0], sound=dict(score["lanes"][0]["sound"], instrument="kazoo"))])
        with self.assertRaises(StudioError) as e:
            studio.publish_draft(bad)
        self.assertIn("not valid", str(e.exception))
        self.assertEqual(studio.delete_draft("studio-piece", 1), {"piece": "studio-piece", "version": 1, "deleted": True})
        studio.publish_draft(dict(score, draft=2))
        self.assertEqual(studio.delete_piece("studio-piece")["deleted_drafts"], 1)
        with self.assertRaises(StudioError):
            studio.delete_piece("studio-piece")
        with self.assertRaises(StudioError):
            studio.read_score("../etc")

    def test_without_the_permission_a_draft_tool_says_which_key_to_make(self):
        self.server.add_ai_key(OTHER, {"notes:pickup"})
        with self.assertRaises(StudioError) as e:
            self.studio(SIUE_MUSIC_AI_KEY=OTHER).delete_draft("p", 1)
        self.assertIn("may not delete drafts", str(e.exception))

    def test_the_command_line_saves_a_key_and_prints_the_code(self):
        env = {**self.env, "SIUE_MUSIC_AI_KEY": ""}
        out = io.StringIO()
        with contextlib.redirect_stdout(out), unittest.mock.patch("siue_music.cli.read_secret", return_value=KEY):
            self.assertEqual(cli.main(["save-key"], env), 0)
        self.assertIn("Saved the AI key", out.getvalue())
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            self.assertEqual(cli.main(["pairing-code"], env), 0)
        code = out.getvalue().splitlines()[0]
        self.assertRegex(code, r"^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$")
        self.assertIn(code, out.getvalue().splitlines()[1])



if __name__ == "__main__":
    unittest.main()
