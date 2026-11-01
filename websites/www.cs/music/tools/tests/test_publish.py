"""Publish validates score.json with the same rules as the page and sends only
a complete, valid draft (music with its MusicXML, a sound effect without);
the newest version is the default."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from support import FIXTURES, GLOSSARY_JSON, LIBRARY_JSON
from siue_music.publish import PublishError, latest_version, publish
from siue_music.score import glossary_ids, library_ids, validate


class FakeApi:
    def __init__(self):
        self.sent = []

    def publish_draft(self, piece, version, files):
        self.sent.append((piece, version, sorted(files)))


class PublishTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.pieces = Path(tmp.name)
        self.v1 = self.pieces / "test-piece" / "v1"
        shutil.copytree(FIXTURES / "draft", self.v1)
        self.api = FakeApi()
        self.ids = glossary_ids(GLOSSARY_JSON)
        self.library = library_ids(LIBRARY_JSON)

    def test_publishes_the_newest_valid_draft(self):
        v2 = self.pieces / "test-piece" / "v2"
        shutil.copytree(self.v1, v2)
        score = json.loads((v2 / "score.json").read_text())
        (v2 / "score.json").write_text(json.dumps({**score, "draft": 2}))
        self.assertEqual(latest_version(self.pieces / "test-piece"), 2)
        self.assertEqual(publish("test-piece", None, self.pieces, self.api, self.ids), 2)
        self.assertEqual(self.api.sent, [("test-piece", 2, ["audio.webm", "score.json", "score.musicxml", "spectrogram.png"])])

    def make_renderable(self):
        """v1 as a renderable draft: sound on every lane and a mix in score.json, no audio and no spectrogram."""
        shutil.copy(FIXTURES / "score-renderable-v1.json", self.v1 / "score.json")
        (self.v1 / "audio.webm").unlink()
        (self.v1 / "spectrogram.png").unlink()

    def test_a_renderable_music_score_publishes_without_audio_or_spectrogram(self):
        self.make_renderable()
        self.assertEqual(publish("test-piece", 1, self.pieces, self.api, self.ids, self.library), 1)
        self.assertEqual(self.api.sent, [("test-piece", 1, ["score.json", "score.musicxml"])])

    def test_a_renderable_score_with_a_null_spectrogram_publishes_without_one(self):
        self.make_renderable()
        score = json.loads((self.v1 / "score.json").read_text())
        (self.v1 / "score.json").write_text(json.dumps({**score, "spectrogram": None}))
        self.assertEqual(validate({**score, "spectrogram": None}, self.ids, self.library), [])
        self.assertEqual(publish("test-piece", 1, self.pieces, self.api, self.ids, self.library), 1)
        self.assertEqual(self.api.sent, [("test-piece", 1, ["score.json", "score.musicxml"])])

    def test_a_renderable_music_score_still_needs_its_musicxml(self):
        self.make_renderable()
        (self.v1 / "score.musicxml").unlink()
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids, self.library)
        self.assertIn("score.musicxml", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_an_instrument_the_library_lacks_never_leaves_the_computer(self):
        self.make_renderable()
        score = json.loads((self.v1 / "score.json").read_text())
        score["lanes"][0]["sound"]["instrument"] = "kazoo"
        (self.v1 / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids, self.library)
        self.assertIn("lanes[0].sound.instrument", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_score_with_neither_audio_nor_sound_never_leaves_the_computer(self):
        score = json.loads((self.v1 / "score.json").read_text())
        score["audio"] = []
        (self.v1 / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids, self.library)
        self.assertIn("audio", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_draft_whose_score_names_audio_but_lacks_the_file_never_leaves_the_computer(self):
        (self.v1 / "audio.webm").unlink()
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids, self.library)
        self.assertIn("audio.webm or audio.m4a", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_the_general_notes_piece_id_is_not_publishable(self):
        with self.assertRaises(PublishError) as raised:
            publish("general", None, self.pieces, self.api, self.ids)
        self.assertIn("general notes", str(raised.exception))
        self.assertEqual(self.api.sent, [])

    def test_an_invalid_score_never_leaves_the_computer(self):
        score = json.loads((self.v1 / "score.json").read_text())
        score["sections"][1]["from_bar"] = 6
        (self.v1 / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("sections[1].from_bar", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_term_the_page_does_not_know_never_leaves_the_computer(self):
        score = json.loads((self.v1 / "score.json").read_text())
        score["glossary"][0]["term"] = "flibbertigibbet"
        (self.v1 / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("glossary[0].term", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_draft_past_the_servers_8_mb_never_leaves_the_computer(self):
        (self.v1 / "audio.webm").write_bytes(b"\x1a\x45\xdf\xa3" + b"0" * 8_388_608)
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("8 MB", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_draft_without_audio_is_refused(self):
        (self.v1 / "audio.webm").unlink()
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("no audio.webm or audio.m4a", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_symlinked_draft_file_or_folder_never_leaves_the_computer(self):
        secret = self.pieces / "secret.webm"
        secret.write_bytes(b"\x1a\x45\xdf\xa3secret")
        (self.v1 / "audio.webm").unlink()
        (self.v1 / "audio.webm").symlink_to(secret)
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("symbolic link", str(e.exception))
        self.assertEqual(self.api.sent, [])
        (self.v1 / "audio.webm").unlink()
        (self.v1 / "audio.webm").write_bytes(b"\x1a\x45\xdf\xa3")
        moved = self.pieces / "elsewhere"
        self.v1.rename(moved)
        self.v1.symlink_to(moved, target_is_directory=True)
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("symbolic link", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_sound_effect_publishes_without_musicxml(self):
        shutil.copytree(FIXTURES / "draft-sound", self.pieces / "cannon-fire" / "v1")
        self.assertEqual(publish("cannon-fire", None, self.pieces, self.api, self.ids), 1)
        self.assertEqual(self.api.sent, [("cannon-fire", 1, ["audio.webm", "score.json", "spectrogram.png"])])

    def test_music_without_musicxml_never_leaves_the_computer(self):
        (self.v1 / "score.musicxml").unlink()
        with self.assertRaises(PublishError) as e:
            publish("test-piece", 1, self.pieces, self.api, self.ids)
        self.assertIn("score.musicxml", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_a_sound_effect_with_bars_never_leaves_the_computer(self):
        sound = self.pieces / "cannon-fire" / "v1"
        shutil.copytree(FIXTURES / "draft-sound", sound)
        score = json.loads((sound / "score.json").read_text())
        score["bars"] = 8
        (sound / "score.json").write_text(json.dumps(score))
        with self.assertRaises(PublishError) as e:
            publish("cannon-fire", 1, self.pieces, self.api, self.ids)
        self.assertIn("bars", str(e.exception))
        self.assertEqual(self.api.sent, [])

    def test_python_and_the_page_name_the_same_paths(self):
        base = json.loads((FIXTURES / "score-v1.json").read_text())
        self.assertEqual(validate(base, self.ids), [])
        cases = [
            (lambda s: s["piece"].__setitem__("id", "Bad Id"), "piece.id"),
            (lambda s: s["sections"][1].__setitem__("to_bar", 7), "sections[1].to_bar"),
            (lambda s: s.__setitem__("kind", "noise"), "kind"),
            (lambda s: s["project"].__setitem__("id", "Not An Id"), "project.id"),
            (lambda s: s["project"].__setitem__("name", ""), "project.name"),
            (lambda s: s["characters"][0].__setitem__("color", "gold"), "characters[0].color"),
            (lambda s: s["characters"][1].__setitem__("id", "ariadne"), "characters[1].id"),
            (lambda s: s["motifs"][0].__setitem__("character", "nobody"), "motifs[0].character"),
            (lambda s: s.pop("musicxml"), "musicxml"),
            (lambda s: s.pop("bars"), "bars"),
            (lambda s: s["notes"][0].__setitem__("lane", "violas"), "notes[0].lane"),
            (lambda s: s["energy"][1].__setitem__(1, 1.5), "energy[1]"),
            (lambda s: s["glossary"][0].__setitem__("term", "flibbertigibbet"), "glossary[0].term"),
            (lambda s: s.__setitem__("schema", 3), "schema"),
        ]
        for change, path in cases:
            s = json.loads(json.dumps(base))
            change(s)
            errors = validate(s, self.ids)
            self.assertTrue(errors and errors[0].split(": ", 1)[0].startswith(path), (path, errors))

    def test_python_and_the_page_name_the_same_sound_paths(self):
        base = json.loads((FIXTURES / "score-sound-v1.json").read_text())
        self.assertEqual(validate(base, self.ids), [])
        with_xml = json.loads(json.dumps(base))
        with_xml["musicxml"] = "score.musicxml"
        self.assertEqual(validate(with_xml, self.ids), [], "a sound piece may carry MusicXML")
        no_moments = json.loads(json.dumps(base))
        no_moments["sections"] = []
        self.assertEqual(validate(no_moments, self.ids), [], "sections are optional for a sound piece")
        cases = [
            (lambda s: s.__setitem__("bars", 8), "bars"),
            (lambda s: s.__setitem__("tempo", [{"bar": 1, "bpm": 120, "beats": 4, "unit": 4}]), "tempo"),
            (lambda s: s.__setitem__("duration", 0.04), "duration"),
            (lambda s: s["sections"][0].__setitem__("from_bar", 1), "sections[0]"),
            (lambda s: s["sections"][1].__setitem__("from", 0.05), "sections[1].from"),
            (lambda s: s["sections"][1].__setitem__("to", 0.5), "sections[1].to"),
            (lambda s: s["changes"][0].__setitem__("to", 0.5), "changes[0].to"),
            (lambda s: s["lanes"][0].__setitem__("family", "kazoo"), "lanes[0].family"),
            (lambda s: s["project"].__setitem__("id", "Bad Id"), "project.id"),
        ]
        for change, path in cases:
            s = json.loads(json.dumps(base))
            change(s)
            errors = validate(s, self.ids)
            self.assertTrue(errors and errors[0].split(": ", 1)[0].startswith(path), (path, errors))

    def test_either_kind_may_use_any_lane_family(self):
        music = json.loads((FIXTURES / "score-v1.json").read_text())
        music["lanes"][0].update(family="impact", icon="impact")
        self.assertEqual(validate(music, self.ids), [])
        sound = json.loads((FIXTURES / "score-sound-v1.json").read_text())
        sound["lanes"][1].update(family="strings", icon="strings")
        self.assertEqual(validate(sound, self.ids), [])


if __name__ == "__main__":
    unittest.main()
