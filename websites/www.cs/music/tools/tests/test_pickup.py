"""Pickup verifies the download's hash and opens the note before marking it;
a corrupt download or a note that will not open stays waiting; opened notes
land outside the repository; a key mismatch never reaches the server."""
import contextlib
import hashlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from support import SITE, ServerApi, World, pool_key
from siue_music import cli, sealing
from siue_music.answering import MissingDependency, Steps
from siue_music.paths import NotesInsideRepo
from siue_music.pickup import pickup

A, B = "a" * 32, "b" * 32


class FakeApi:
    def __init__(self, notes: dict[str, bytes], corrupt: frozenset[str] = frozenset()):
        self.notes, self.corrupt, self.calls, self.marked = notes, corrupt, [], []

    def waiting(self):
        self.calls.append("list")
        return [{"id": i, "size": len(b), "sha256": hashlib.sha256(b).hexdigest(), "arrived_at": 1_800_000_000} for i, b in self.notes.items()]

    def note(self, note_id):
        self.calls.append(f"get {note_id}")
        b = self.notes[note_id]
        return b[:-1] + bytes([b[-1] ^ 1]) if note_id in self.corrupt else b

    def mark_picked_up(self, note_id):
        self.calls.append(f"mark {note_id}")
        self.marked.append(note_id)


def missing(*_):
    raise MissingDependency("speech-to-text needs faster-whisper: pip install -r music/tools/requirements-answering.txt")


class PickupTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.notes = Path(tmp.name) / "notes"
        self.repo = SITE.parents[1]
        self.fp, self.pkcs8, self.spki = pool_key(0)
        self.ring = {self.fp: self.pkcs8}
        self.steps = Steps(transcribe=missing, hum_to_midi=missing)

    def sealed(self, text, kind="text", audio=b"", spki=None):
        body = {"v": 1, "kind": kind, "piece": "test-piece", "draft": 1, "from": 8, "to": 12, "fromBar": 5, "toBar": 6,
                "lane": "brass", "text": text, "reaction": None, "curve": None,
                "audio": {"mime": "audio/webm", "seconds": 1} if audio else None, "made": "2027-01-15T08:00:00.000Z"}
        return sealing.seal(body, audio, spki or self.spki)

    def test_verified_opened_saved_then_marked(self):
        api = FakeApi({A: self.sealed("louder here")})
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual((report.picked, api.marked), ([A], [A]))
        self.assertLess(api.calls.index(f"get {A}"), api.calls.index(f"mark {A}"))
        saved = json.loads((self.notes / f"2027-01-15-{A}" / "note.json").read_text())
        self.assertEqual((saved["body"]["text"], saved["fingerprint"]), ("louder here", self.fp))

    def test_a_corrupt_download_is_not_marked(self):
        api = FakeApi({A: self.sealed("x")}, corrupt=frozenset({A}))
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual(api.marked, [])
        self.assertIn("did not match its hash", report.left[A])
        self.assertFalse(any(self.notes.glob(f"*{A}*")))

    def test_a_note_that_will_not_open_is_not_marked(self):
        _, _, other_spki = pool_key(1)
        api = FakeApi({A: self.sealed("x", spki=other_spki)})
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual(api.marked, [])
        self.assertIn("git pull, then make music-setup", report.left[A])

    def test_one_bad_note_does_not_stop_the_rest(self):
        api = FakeApi({A: self.sealed("bad"), B: self.sealed("good")}, corrupt=frozenset({A}))
        self.assertEqual(pickup(api, self.ring, self.notes, self.repo, self.steps).picked, [B])
        self.assertEqual(api.marked, [B])

    def test_notes_inside_the_repository_are_refused_before_any_request(self):
        api = FakeApi({A: self.sealed("x")})
        with self.assertRaises(NotesInsideRepo):
            pickup(api, self.ring, self.repo / "notes", self.repo, self.steps)
        self.assertEqual(api.calls, [])

    def test_audio_is_saved_and_a_missing_step_is_a_notice_not_a_failure(self):
        api = FakeApi({A: self.sealed(None, kind="speech", audio=b"\x1aE\xdf\xa3" + b"0" * 100)})
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual(api.marked, [A])
        self.assertTrue((self.notes / f"2027-01-15-{A}" / "audio.webm").exists())
        self.assertEqual(len([n for n in report.notices if "pip install" in n]), 1)

    def test_an_id_that_is_not_a_note_id_is_never_a_path_component(self):
        evil = "../../escape"
        api = FakeApi({evil: self.sealed("x")})
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual((api.marked, [c for c in api.calls if c.startswith("get")]), ([], []))
        self.assertEqual(len(report.left), 1)
        self.assertFalse((self.notes.parent / "escape").exists())

    def test_files_are_private(self):
        api = FakeApi({A: self.sealed("x")})
        pickup(api, self.ring, self.notes, self.repo, self.steps)
        folder = self.notes / f"2027-01-15-{A}"
        self.assertEqual((self.notes.stat().st_mode & 0o777, folder.stat().st_mode & 0o777, (folder / "note.json").stat().st_mode & 0o777), (0o700, 0o700, 0o600))

    def test_an_empty_existing_folder_is_rewritten(self):
        (self.notes / f"2027-01-15-{A}").mkdir(parents=True)
        api = FakeApi({A: self.sealed("x")})
        pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertEqual(json.loads((self.notes / f"2027-01-15-{A}" / "note.json").read_text())["id"], A)
        self.assertEqual(api.marked, [A])

    def test_a_missing_transcript_is_made_for_a_folder_that_already_exists(self):
        audio = b"\x1aE\xdf\xa3" + b"0" * 100
        api = FakeApi({A: self.sealed(None, kind="speech", audio=audio)})
        pickup(api, self.ring, self.notes, self.repo, self.steps)
        folder = self.notes / f"2027-01-15-{A}"
        self.assertFalse((folder / "transcript.txt").exists())
        steps = Steps(transcribe=lambda p: "louder", hum_to_midi=missing)
        pickup(api, self.ring, self.notes, self.repo, steps)
        self.assertEqual((folder / "transcript.txt").read_text(), "louder\n")

    def test_a_non_integer_arrival_time_does_not_stop_the_run(self):
        api = FakeApi({A: self.sealed("a"), B: self.sealed("b")})
        listing = api.waiting
        api.waiting = lambda: [{**n, "arrived_at": "soon"} if n["id"] == A else n for n in listing()]
        report = pickup(api, self.ring, self.notes, self.repo, self.steps)
        self.assertIn(A, report.left)
        self.assertEqual(report.picked, [B])

    def test_a_failing_step_says_could_not_process(self):
        def boom(_):
            raise RuntimeError("bad audio")
        api = FakeApi({A: self.sealed(None, kind="speech", audio=b"\x1aE\xdf\xa3" + b"0" * 100)})
        report = pickup(api, self.ring, self.notes, self.repo, Steps(transcribe=boom, hum_to_midi=missing))
        self.assertEqual((api.marked, report.notices), ([A], [f"could not process {A}: bad audio"]))


class RotationTest(unittest.TestCase):
    def test_a_note_sealed_before_a_rotation_is_picked_up_with_the_rotated_keyring(self):
        w = World(self)
        old = w.add_key_to_op(0)
        old_spki = sealing.spki_of(w.keys.keyring()[old])
        w.keys.rotate(ServerApi())
        body = {"v": 1, "kind": "text", "piece": "test-piece", "draft": 1, "from": 0, "to": 1, "fromBar": 1, "toBar": 1, "lane": None,
                "text": "sealed before the rotation", "reaction": None, "curve": None, "audio": None, "made": "2027-01-15T08:00:00.000Z"}
        api = FakeApi({A: sealing.seal(body, b"", old_spki)})
        with tempfile.TemporaryDirectory() as d:
            notes = Path(d) / "notes"
            report = pickup(api, w.keys.ensure_synced(), notes, SITE.parents[1], Steps(transcribe=missing, hum_to_midi=missing))
            self.assertEqual((report.picked, api.marked), ([A], [A]))
            saved = json.loads((notes / f"2027-01-15-{A}" / "note.json").read_text())
        self.assertEqual((saved["body"]["text"], saved["fingerprint"]), ("sealed before the rotation", old))


class MismatchNeverReachesTheServer(unittest.TestCase):
    def env(self, w: World) -> dict[str, str]:
        # Every location the CLI reads comes from this env, so the test never touches the owner's cache or 1Password.
        return {"OP_VAULT": "SIUE", "SIUE_CONFIG_DIR": str(w.root / "config" / "siue"), "SIUE_MUSIC_BASE": "https://example.test/music/",
                "SIUE_OP": f"{sys.executable} {Path(__file__).parent / 'fake_op.py'}",
                "FAKE_OP_LOG": str(w.log), "FAKE_OP_STORE": str(w.root / "op.json")}

    def run_pickup(self, w: World) -> tuple[int, list, str]:
        opened, err = [], io.StringIO()
        with mock.patch("siue_music.cli.make_api", side_effect=lambda *a: opened.append(a)), contextlib.redirect_stderr(err):
            code = cli.main(["pickup"], env=self.env(w))
        return code, opened, err.getvalue()

    def test_a_cache_key_1password_no_longer_holds_stops_with_exit_3(self):
        w = World(self)
        fp = w.add_key_to_op(0)
        w.keys.pull()
        for item in w.op.list_items("siue-music-key"):
            w.op.archive(item["id"])
        code, opened, err = self.run_pickup(w)
        self.assertEqual((code, opened), (3, []))
        self.assertIn("1Password (vault SIUE) holds no notes key", err)
        self.assertIn(fp[:4], err)

    def test_two_current_keys_in_1password_stop_with_exit_1(self):
        w = World(self)
        w.add_key_to_op(0)
        w.add_key_to_op(1)
        code, opened, err = self.run_pickup(w)
        self.assertEqual((code, opened), (1, []))
        self.assertIn("(previous)", err)

    def test_the_base_comes_from_the_env_for_pickup(self):
        w = World(self)
        w.add_key_to_op(0)
        w.keys.api_key_set("music-pickup", "c" * 64)
        w.keys.pull()
        bases = []
        class Quiet:
            def waiting(self): return []
        with mock.patch("siue_music.cli.make_api", side_effect=lambda base, key: (bases.append((base, key)), Quiet())[1]), contextlib.redirect_stdout(io.StringIO()):
            code = cli.main(["pickup"], env={**self.env(w), "SIUE_MUSIC_NOTES_DIR": str(w.root / "notes")})
        self.assertEqual((code, bases), (0, [("https://example.test/music/", "c" * 64)]))


if __name__ == "__main__":
    unittest.main()
