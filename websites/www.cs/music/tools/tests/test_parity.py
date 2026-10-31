"""Passphrase normalisation matches the page's unlock.ts byte for byte."""
import codecs
import json
import re
import unittest

from support import FIXTURES, GLOSSARY_JSON, LIBRARY_JSON, SITE
from siue_music.score import glossary_ids, library_ids, validate
from siue_music.sealing import STRIPPED, normalize_passphrase

STRIPPED_PY = " \t\n\r\f\v                 　﻿"


class PassphraseParityTest(unittest.TestCase):
    def test_the_stripped_set_is_the_one_in_unlock_ts(self):
        src = (SITE / "games" / "workroom" / "src" / "unlock.ts").read_text()
        literal = re.search(r"export const STRIPPED = '([^']*)'", src).group(1)
        ts_set = codecs.decode(literal, "unicode_escape")
        self.assertEqual(ts_set, STRIPPED_PY)
        self.assertEqual(frozenset(ts_set), STRIPPED)

    def test_stripping(self):
        cases = {
            "  hello \n": b"hello",
            "﻿　secret　﻿": b"secret",
            "  x ": b"x",
            "\u0085x\u0085": "\u0085x\u0085".encode(),
            "​x​": "​x​".encode(),
            "\u00a0x\u00a0": b"x",
            "\u2000x\u2000": b"x",
            "\u2028x\u2028": b"x",
            "\u202fx\u202f": b"x",
            "\u205fx\u205f": b"x",
            "a b": b"a b",
            "   ": b"",
            "café ": "café".encode(),
        }
        for given, want in cases.items():
            self.assertEqual(normalize_passphrase(given), want, repr(given))

    def test_nfc_happens_before_stripping_and_inside_is_kept(self):
        self.assertEqual(normalize_passphrase(" a b "), "a b".encode())


class RenderableScoreParityTest(unittest.TestCase):
    """score-renderable-v1.json is the fixture games/workroom/test/score.test.ts parses too; both validators name the same paths."""

    def setUp(self):
        self.base = json.loads((FIXTURES / "score-renderable-v1.json").read_text())
        self.glossary = glossary_ids(GLOSSARY_JSON)
        self.library = library_ids(LIBRARY_JSON)

    def errors(self, change):
        s = json.loads(json.dumps(self.base))
        change(s)
        return validate(s, self.glossary, self.library)

    def test_the_library_ids_are_the_ones_in_library_json(self):
        self.assertEqual(self.library, frozenset({
            "violin", "viola", "cello", "bass", "harp", "lyre", "flute", "piccolo", "oboe", "clarinet", "bassoon", "trumpet", "horn", "trombone",
            "tuba", "piano", "organ", "celesta", "timpani", "glock", "xylo", "marimba", "vibes", "bells", "kit", "orch", "choir"}))

    def test_stand_ins_drums_and_new_instruments_pass(self):
        for pair in (("celesta", "kit"), ("violin", "choir")):
            def orchestra(s, pair=pair):
                for lane, instrument in zip(s["lanes"], pair):
                    lane["sound"]["instrument"] = instrument
            self.assertEqual(self.errors(orchestra), [], pair)

    def test_a_renderable_score_needs_no_audio_file_or_spectrogram(self):
        self.assertEqual(self.base["audio"], [])
        self.assertNotIn("spectrogram", self.base)
        self.assertEqual(validate(self.base, self.glossary, self.library), [])
        self.assertEqual(validate(self.base, self.glossary), [], "without the library only the id format is checked")

    def test_the_same_paths_are_named(self):
        cases = [
            (lambda s: s["lanes"][0]["sound"].__setitem__("instrument", "kazoo"), "lanes[0].sound.instrument"),
            (lambda s: s["lanes"][0]["sound"].__setitem__("instrument", "Not An Id"), "lanes[0].sound.instrument"),
            (lambda s: s["lanes"][1]["sound"].__setitem__("gain_db", 21), "lanes[1].sound.gain_db"),
            (lambda s: s["lanes"][1]["sound"].__setitem__("gain_db", -41), "lanes[1].sound.gain_db"),
            (lambda s: s["lanes"][0]["sound"].__setitem__("attack", 11), "lanes[0].sound.attack"),
            (lambda s: s["lanes"][0]["sound"].__setitem__("attack", -1), "lanes[0].sound.attack"),
            (lambda s: s["lanes"][0]["sound"].__setitem__("release", 21), "lanes[0].sound.release"),
            (lambda s: s["lanes"][0].__setitem__("sound", "cello"), "lanes[0].sound"),
            (lambda s: s["mix"].__setitem__("style", "hall"), "mix.style"),
            (lambda s: s["mix"].__setitem__("loudness", -9), "mix.loudness"),
            (lambda s: s["mix"].__setitem__("loudness", -31), "mix.loudness"),
            (lambda s: s.__setitem__("mix", "lofi"), "mix"),
            (lambda s: s["lanes"][1].pop("sound"), "audio"),
            (lambda s: s.pop("mix"), "audio"),
            (lambda s: s.__setitem__("audio", [{"file": "audio.webm", "type": "audio/mp4"}]), "audio[0].type"),
        ]
        for change, path in cases:
            errors = self.errors(change)
            self.assertTrue(errors and errors[0].split(": ", 1)[0] == path, (path, errors))

    def test_the_library_is_only_asked_when_given(self):
        s = json.loads(json.dumps(self.base))
        s["lanes"][0]["sound"]["instrument"] = "kazoo"
        self.assertEqual(validate(s, self.glossary), [])
        self.assertEqual(validate(s, self.glossary, self.library)[0].split(": ")[0], "lanes[0].sound.instrument")

    def test_a_score_that_is_not_renderable_still_needs_a_spectrogram(self):
        music = json.loads((FIXTURES / "score-v1.json").read_text())
        del music["spectrogram"]
        self.assertTrue(validate(music, self.glossary)[0].startswith("spectrogram:"))
        music["lanes"][0]["sound"] = self.base["lanes"][0]["sound"]
        self.assertTrue(validate(music, self.glossary)[0].startswith("spectrogram:"), "one lane with sound is not renderable")


if __name__ == "__main__":
    unittest.main()
