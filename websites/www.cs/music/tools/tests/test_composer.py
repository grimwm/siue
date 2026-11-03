"""The composer's score fields in Python: regions, markers, the key and the crossfader's fade read from the shared
vectors (games/workroom/test/fixtures/composer-vectors.json) parse and break exactly as the page's validator says."""
import copy
import json
import unittest

from support import FIXTURES, GLOSSARY_JSON, LIBRARY_JSON
from siue_music.score import glossary_ids, library_ids, validate
from test_fxclips import set_path

VECTORS = json.loads((FIXTURES / "composer-vectors.json").read_text())


class ComposerFieldsTest(unittest.TestCase):
    def setUp(self):
        self.glossary = glossary_ids(GLOSSARY_JSON)
        self.instruments = library_ids(LIBRARY_JSON)

    def test_regions_markers_key_and_a_fade_out_are_valid(self):
        self.assertEqual(validate(copy.deepcopy(VECTORS["score"]), self.glossary, self.instruments), [])

    def test_each_broken_field_names_the_pages_path(self):
        for case in VECTORS["invalid"]:
            with self.subTest(case["name"]):
                score = copy.deepcopy(VECTORS["score"])
                set_path(score, case["set"], case["value"])
                errors = validate(score, self.glossary, self.instruments)
                self.assertEqual(len(errors), 1, errors)
                self.assertTrue(errors[0].startswith(case["error"] + ":"), errors[0])

    def test_schema_1_refuses_them_naming_them(self):
        for case in VECTORS["schema1"]:
            with self.subTest(case["name"]):
                score = json.loads((FIXTURES / "score-renderable-v1.json").read_text())
                set_path(score, case["set"], case["value"])
                errors = validate(score, self.glossary, self.instruments)
                self.assertEqual(len(errors), 1, errors)
                self.assertTrue(errors[0].startswith(case["error"] + ":"), errors[0])


if __name__ == "__main__":
    unittest.main()
