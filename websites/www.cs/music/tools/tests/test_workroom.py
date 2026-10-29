"""What the MCP server's tools do, without the protocol: list the pieces (published and local), read a score, publish
with publish.py's refusals, pick up notes the way `make music-pickup` does and read them back, and wait for notes by
polling the waiting list, and delete one published draft. No answer carries a key; deleting one draft is the only delete."""
import asyncio
import hashlib
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from support import FIXTURES, GLOSSARY_JSON, SITE, pool_key
from siue_music import sealing
from siue_music.answering import MissingDependency, Steps
from siue_music.api import ApiError
from siue_music.keys import PICKUP_KEY, PUBLISH_KEY
from siue_music.score import glossary_ids
from siue_music.workroom import Workroom, WorkroomError

A, B, C = "a" * 32, "b" * 32, "c" * 32
PICKUP_SECRET, PUBLISH_SECRET = "1" * 64, "2" * 64


def missing(*_):
    raise MissingDependency("speech-to-text needs faster-whisper: pip install -r music/tools/requirements-answering.txt")


class FakeKeys:
    def __init__(self, ring):
        self.ring, self.asked = ring, []

    def ensure_synced(self):
        return self.ring

    def api_key(self, name, rerun=None):
        self.asked.append(name)
        return {PICKUP_KEY: PICKUP_SECRET, PUBLISH_KEY: PUBLISH_SECRET}[name]


class FakeApi:
    def __init__(self):
        self.notes: dict[str, bytes] = {}
        self.published: list[dict] = []
        self.sent: list[tuple] = []
        self.marked: list[str] = []
        self.calls: list[str] = []
        self.listings: list[list[str]] | None = None  # per waiting() call, the ids listed; None lists self.notes
        self.drafts_error: ApiError | None = None
        self.delete_error: ApiError | None = None

    def waiting(self):
        self.calls.append("list")
        ids = self.listings.pop(0) if self.listings is not None else [i for i in self.notes if i not in self.marked]
        return [{"id": i, "size": len(self.notes[i]), "sha256": hashlib.sha256(self.notes[i]).hexdigest(), "arrived_at": 1_800_000_000 + n}
                for n, i in enumerate(ids)]

    def note(self, note_id):
        self.calls.append(f"get {note_id}")
        return self.notes[note_id]

    def mark_picked_up(self, note_id):
        self.calls.append(f"mark {note_id}")
        self.marked.append(note_id)

    def drafts(self):
        self.calls.append("drafts")
        if self.drafts_error:
            raise self.drafts_error
        return self.published

    def publish_draft(self, piece, version, files):
        self.sent.append((piece, version, sorted(files)))

    def delete_draft(self, piece, version):
        self.calls.append(f"delete {piece} {version}")
        if self.delete_error:
            raise self.delete_error


class WorkroomTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.pieces = self.root / "pieces"
        shutil.copytree(FIXTURES / "draft", self.pieces / "test-piece" / "v1")
        self.notes = self.root / "notes"
        self.fp, self.pkcs8, self.spki = pool_key(0)
        self.keys = FakeKeys({self.fp: self.pkcs8})
        self.api = FakeApi()
        self.made: list[tuple[str, str]] = []
        self.slept: list[float] = []
        self.env = {"SIUE_MUSIC_BASE": "https://music.example.org/music/", "SIUE_CONFIG_DIR": str(self.root / "cfg")}
        self.room = self.workroom()

    def workroom(self, **over):
        def make_api(base, key):
            self.made.append((base, key))
            return self.api

        async def sleep(seconds):
            self.slept.append(seconds)

        args = dict(env=self.env, home=self.root, keys=lambda: self.keys, make_api=make_api, pieces=self.pieces, notes=self.notes,
                    repo=SITE.parents[1], steps=Steps(transcribe=missing, hum_to_midi=missing), glossary=glossary_ids(GLOSSARY_JSON),
                    sleep=sleep, clock=lambda: sum(self.slept))
        return Workroom(**{**args, **over})

    def sealed(self, text, kind="text", audio=b"", general=False, **extra):
        body = {"v": 1, "kind": kind, "piece": "general" if general else "test-piece", "draft": 1, "from": 0 if general else 8,
                "to": 0 if general else 12, "fromBar": None if general else 5, "toBar": None if general else 6,
                "lane": None if general else "brass", "text": text, "reaction": None, "curve": None,
                "audio": {"mime": "audio/webm", "seconds": 1} if audio else None, "made": "2027-01-15T08:00:00.000Z", **extra}
        return sealing.seal(body, audio, self.spki)

    def assert_no_secret(self, answer):
        text = json.dumps(answer)
        for secret in (PICKUP_SECRET, PUBLISH_SECRET, self.pkcs8.hex()[:64]):
            self.assertNotIn(secret, text)
        import base64
        self.assertNotIn(base64.b64encode(self.pkcs8).decode()[100:160], text)

    # listing and reading

    def test_list_pieces_shows_the_published_drafts_and_the_local_ones(self):
        self.api.published = [{"piece": "test-piece", "version": 1, "published_at": 1_800_000_000, "project_id": "crete",
                               "project_name": "Crete", "kind": "music"}]
        answer = self.room.list_pieces()
        self.assertEqual(answer["server"], "https://music.example.org/music/")
        self.assertEqual(answer["published"], self.api.published)
        self.assertIsNone(answer["published_error"])
        [local] = answer["local"]
        self.assertEqual(local["piece"], "test-piece")
        [draft] = local["drafts"]
        self.assertEqual((draft["version"], draft["files"]), (1, ["audio.webm", "score.json", "score.musicxml", "spectrogram.png"]))
        self.assertEqual(self.made, [("https://music.example.org/music/", PUBLISH_SECRET)])
        self.assert_no_secret(answer)

    def test_list_pieces_still_lists_the_local_drafts_when_the_server_cannot_answer(self):
        self.api.drafts_error = ApiError("api/drafts.php answered 405: method", 405)
        answer = self.room.list_pieces()
        self.assertEqual(answer["published"], [])
        self.assertIn("405", answer["published_error"])
        self.assertEqual([p["piece"] for p in answer["local"]], ["test-piece"])

    def test_list_pieces_skips_folders_that_are_not_pieces_or_drafts(self):
        (self.pieces / "Not A Piece").mkdir()
        (self.pieces / "test-piece" / "notes").mkdir()
        (self.pieces / "README.md").write_text("x")
        [local] = self.room.list_pieces()["local"]
        self.assertEqual([d["version"] for d in local["drafts"]], [1])

    def test_read_score_reads_the_newest_draft_and_names_its_file(self):
        v2 = self.pieces / "test-piece" / "v2"
        shutil.copytree(self.pieces / "test-piece" / "v1", v2)
        score = json.loads((v2 / "score.json").read_text())
        (v2 / "score.json").write_text(json.dumps({**score, "draft": 2}))
        answer = self.room.read_score("test-piece")
        self.assertEqual((answer["version"], answer["score"]["draft"], answer["problems"]), (2, 2, []))
        self.assertEqual(answer["path"], str(v2 / "score.json"))
        self.assertEqual(self.room.read_score("test-piece", 1)["score"]["draft"], 1)

    def test_read_score_reports_what_is_wrong_with_an_invalid_score(self):
        path = self.pieces / "test-piece" / "v1" / "score.json"
        path.write_text(json.dumps({**json.loads(path.read_text()), "kind": "opera"}))
        self.assertTrue(self.room.read_score("test-piece", 1)["problems"])

    def test_read_score_refuses_what_is_not_a_piece_or_a_draft(self):
        for piece, version in (("../etc", None), ("test-piece", 9), ("test-piece", 0), ("nothing-here", None)):
            with self.assertRaises(WorkroomError):
                self.room.read_score(piece, version)

    # publishing

    def test_publish_sends_the_draft_with_the_publish_key(self):
        answer = self.room.publish_draft("test-piece")
        self.assertEqual(answer, {"piece": "test-piece", "version": 1, "published": True, "server": "https://music.example.org/music/"})
        self.assertEqual(self.api.sent, [("test-piece", 1, ["audio.webm", "score.json", "score.musicxml", "spectrogram.png"])])
        self.assertEqual(self.made, [("https://music.example.org/music/", PUBLISH_SECRET)])

    def test_publish_refuses_as_publish_py_does(self):
        (self.pieces / "test-piece" / "v1" / "spectrogram.png").unlink()
        with self.assertRaises(WorkroomError) as e:
            self.room.publish_draft("test-piece", 1)
        self.assertIn("spectrogram.png", str(e.exception))
        with self.assertRaises(WorkroomError) as e:
            self.room.publish_draft("general")
        self.assertIn("general notes", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_an_instrument_the_library_lacks_is_refused_as_publish_py_refuses_it(self):
        v1 = self.pieces / "test-piece" / "v1"
        score = json.loads((FIXTURES / "score-renderable-v1.json").read_text())
        score["lanes"][0]["sound"]["instrument"] = "kazoo"
        (v1 / "score.json").write_text(json.dumps(score))
        self.assertTrue(any("lanes[0].sound.instrument" in p for p in self.room.read_score("test-piece", 1)["problems"]))
        with self.assertRaises(WorkroomError) as e:
            self.room.publish_draft("test-piece", 1)
        self.assertIn("lanes[0].sound.instrument", str(e.exception))
        self.assertEqual(self.api.sent, [])

    # notes

    def test_pick_up_saves_marks_and_answers_each_note(self):
        self.api.notes = {A: self.sealed("louder here"), B: self.sealed("play the theme again", general=True)}
        answer = self.room.pick_up_notes()
        self.assertEqual((answer["picked_up"], sorted(self.api.marked)), (2, [A, B]))
        self.assertLess(self.api.calls.index(f"get {A}"), self.api.calls.index(f"mark {A}"))
        by_id = {n["id"]: n for n in answer["notes"]}
        self.assertEqual((by_id[A]["text"], by_id[A]["kind"], by_id[A]["fromBar"], by_id[A]["lane"], by_id[A]["general"]),
                         ("louder here", "text", 5, "brass", False))
        self.assertTrue(by_id[B]["general"])
        self.assertTrue(Path(by_id[A]["files"]["note"]).is_file())
        self.assertEqual(self.made, [("https://music.example.org/music/", PICKUP_SECRET)])
        self.assertEqual(answer["notes_folder"], str(self.notes))
        self.assert_no_secret(answer)

    def test_a_hum_comes_back_as_a_path_to_its_audio_and_a_missing_step_is_a_notice(self):
        self.api.notes = {A: self.sealed(None, kind="hum", audio=b"\x1aE\xdf\xa3" + b"0" * 100)}
        answer = self.room.pick_up_notes()
        [note] = answer["notes"]
        self.assertEqual(note["kind"], "hum")
        self.assertTrue(Path(note["files"]["audio"]).is_file())
        self.assertNotIn("motif_midi", note["files"])
        self.assertEqual(len(answer["notices"]), 1)

    def test_reactions_and_energy_curves_come_back_as_data(self):
        self.api.notes = {A: self.sealed(None, kind="react", reaction="darker"),
                          B: self.sealed(None, kind="energy", curve=[[8, 0.2], [12, 0.9]])}
        by_id = {n["id"]: n for n in self.room.pick_up_notes()["notes"]}
        self.assertEqual(by_id[A]["reaction"], "darker")
        self.assertEqual(by_id[B]["curve"], [[8, 0.2], [12, 0.9]])

    def test_a_note_that_will_not_open_is_left_waiting_and_said_why(self):
        self.api.notes = {A: sealing.seal({"v": 1, "kind": "text", "text": "x"}, b"", pool_key(1)[2])}
        answer = self.room.pick_up_notes()
        self.assertEqual((answer["picked_up"], self.api.marked), (0, []))
        self.assertIn("left waiting", answer["left"][A])

    def test_read_notes_reads_the_saved_notes_newest_first_with_their_transcript(self):
        self.api.notes = {A: self.sealed("first"), B: self.sealed("second"), C: self.sealed("general", general=True)}
        self.room.pick_up_notes()
        speech = next(self.notes.glob(f"*-{B}"))
        (speech / "transcript.txt").write_text("the words\n")
        answer = self.room.read_notes()
        self.assertEqual([n["id"] for n in answer["notes"]], [C, B, A])
        self.assertEqual(answer["notes"][1]["transcript"], "the words")
        self.assertEqual(answer["notes"][1]["files"]["transcript"], str(speech / "transcript.txt"))
        self.assertEqual([n["id"] for n in self.room.read_notes(limit=1)["notes"]], [C])
        self.assertEqual([n["id"] for n in self.room.read_notes(piece="general")["notes"]], [C])

    def test_read_notes_with_no_folder_yet_is_empty(self):
        self.assertEqual(self.room.read_notes()["notes"], [])

    # waiting

    def test_wait_returns_as_soon_as_a_note_is_waiting_and_marks_nothing(self):
        self.api.notes = {A: self.sealed("x")}
        self.api.listings = [[], [], [A]]
        answer = asyncio.run(self.room.wait_for_notes(600, 5))
        self.assertEqual((answer["waiting"], answer["timed_out"]), (1, False))
        self.assertEqual([n["id"] for n in answer["notes"]], [A])
        self.assertEqual(self.slept, [5, 5])
        self.assertEqual(self.api.marked, [])
        self.assertEqual(self.made, [("https://music.example.org/music/", PICKUP_SECRET)], "one key lookup for the whole wait")

    def test_wait_gives_up_at_the_timeout(self):
        self.api.listings = [[]] * 10
        answer = asyncio.run(self.room.wait_for_notes(12, 5))
        self.assertEqual((answer["waiting"], answer["timed_out"]), (0, True))
        self.assertEqual(sum(self.slept), 12, "the last sleep is cut to the time left")

    def test_wait_polls_at_the_configured_pace_never_faster_than_two_seconds(self):
        (self.root / "cfg").mkdir()
        (self.root / "cfg" / "music-config.json").write_text(json.dumps({"poll_seconds": 7}))
        self.api.listings = [[], []]
        self.api.notes = {}
        asyncio.run(self.room.wait_for_notes(7))
        self.assertEqual(self.slept, [7])
        self.slept.clear()
        self.api.listings = [[], []]
        asyncio.run(self.room.wait_for_notes(1, 0.01))
        self.assertEqual(self.slept, [1])

    def test_wait_reports_each_empty_poll(self):
        self.api.listings = [[], [], []]
        seen = []
        asyncio.run(self.room.wait_for_notes(10, 5, on_poll=lambda waited, total: seen.append((waited, total))))
        self.assertEqual(seen, [(0, 10), (5, 10), (10, 10)])

    def test_wait_refuses_a_timeout_outside_its_range(self):
        for bad in (-1, self.room.MAX_WAIT_SECONDS + 1):
            with self.assertRaises(WorkroomError):
                asyncio.run(self.room.wait_for_notes(bad))

    # deleting

    def test_delete_removes_one_published_draft_with_the_publish_key_and_leaves_the_local_files(self):
        answer = self.room.delete_draft("test-piece", 1)
        self.assertEqual(answer, {"piece": "test-piece", "version": 1, "deleted": True, "server": "https://music.example.org/music/"})
        self.assertEqual(self.api.calls, ["delete test-piece 1"])
        self.assertEqual(self.made, [("https://music.example.org/music/", PUBLISH_SECRET)])
        self.assertTrue((self.pieces / "test-piece" / "v1" / "score.json").is_file())

    def test_delete_refuses_what_is_not_a_piece_or_a_version_before_asking_for_a_key(self):
        for piece, version in (("../etc", 1), ("general", 1), ("Test", 1), ("test-piece", 0), ("test-piece", 10000),
                               ("test-piece", None), ("test-piece", True), ("test-piece", "1")):
            with self.assertRaises(WorkroomError):
                self.room.delete_draft(piece, version)
        self.assertEqual((self.api.calls, self.keys.asked), ([], []))

    def test_a_key_without_the_delete_permission_is_told_what_to_do(self):
        self.api.delete_error = ApiError("api/delete-draft.php answered 403: scope", 403)
        with self.assertRaises(WorkroomError) as e:
            self.room.delete_draft("test-piece", 1)
        self.assertIn("drafts:delete", str(e.exception))
        self.assertIn("make music-setup", str(e.exception))
        self.assertIn("server", str(e.exception))

    def test_a_draft_the_server_does_not_hold_and_a_server_without_the_route_are_told_apart(self):
        self.api.delete_error = ApiError("api/delete-draft.php answered 404: not_found", 404)
        with self.assertRaises(WorkroomError) as e:
            self.room.delete_draft("test-piece", 3)
        self.assertIn("does not hold test-piece v3", str(e.exception))
        self.api.delete_error = ApiError("api/delete-draft.php answered 404: Not Found", 404)
        with self.assertRaises(WorkroomError) as e:
            self.room.delete_draft("test-piece", 3)
        self.assertIn("must be updated", str(e.exception))

    def test_deleting_one_draft_is_the_only_delete(self):
        names = [n for n in dir(Workroom) if not n.startswith("_")]
        self.assertEqual([n for n in names if "delete" in n or "remove" in n or "forget" in n], ["delete_draft"])


if __name__ == "__main__":
    unittest.main()
