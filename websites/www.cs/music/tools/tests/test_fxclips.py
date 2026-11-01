"""DJ & Effects' clips in Python: the shared vectors (games/workroom/test/fixtures/fxclips-vectors.json) parse and break
exactly as the page's validator says, and a bar position is the same seconds as the page's barSeconds."""
import copy
import json
import unittest

from support import FIXTURES, GLOSSARY_JSON, LIBRARY_JSON
from siue_music.score import FX_CLIP_EFFECTS, bar_seconds, glossary_ids, library_ids, validate

VECTORS = json.loads((FIXTURES / "fxclips-vectors.json").read_text())


def set_path(root, path, value):
    *keys, last = path.split(".")
    at = root
    for k in keys:
        at = at[int(k)] if isinstance(at, list) else at[k]
    if isinstance(at, list):
        at[int(last)] = value
    elif value == "__delete__":
        del at[last]
    else:
        at[last] = value


class FxClipsTest(unittest.TestCase):
    def setUp(self):
        self.glossary = glossary_ids(GLOSSARY_JSON)
        self.instruments = library_ids(LIBRARY_JSON)

    def test_a_clip_of_every_effect_is_valid(self):
        score = copy.deepcopy(VECTORS["score"])
        self.assertEqual({c["effect"] for c in score["fx_clips"]}, set(FX_CLIP_EFFECTS))
        self.assertEqual(validate(score, self.glossary, self.instruments), [])

    def test_each_broken_clip_names_the_pages_path(self):
        for case in VECTORS["invalid"]:
            with self.subTest(case["name"]):
                score = copy.deepcopy(VECTORS["score"])
                set_path(score, case["set"], case["value"])
                errors = validate(score, self.glossary, self.instruments)
                self.assertEqual(len(errors), 1, errors)
                self.assertTrue(errors[0].startswith(case["error"] + ":"), errors[0])

    def test_schema_1_refuses_clips(self):
        score = copy.deepcopy(VECTORS["score"])
        score["schema"] = 1
        self.assertNotEqual(validate(score, self.glossary, self.instruments), [])

    def test_bar_positions_are_the_pages_seconds(self):
        tempo = VECTORS["score"]["tempo"]
        for bar, seconds in VECTORS["seconds"]:
            self.assertEqual(bar_seconds(tempo, bar), seconds, bar)


if __name__ == "__main__":
    unittest.main()
