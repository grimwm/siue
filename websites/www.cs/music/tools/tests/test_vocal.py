"""Vocal Tracks in Python: the shared vectors (games/workroom/test/fixtures/vocal-vectors.json) parse and break exactly
as the page's validator says."""
import copy
import json
import unittest

from support import FIXTURES, GLOSSARY_JSON, LIBRARY_JSON
from siue_music.score import glossary_ids, library_ids, validate
from test_score2 import set_path

VECTORS = json.loads((FIXTURES / "vocal-vectors.json").read_text())


class VocalTest(unittest.TestCase):
    def setUp(self):
        self.glossary = glossary_ids(GLOSSARY_JSON)
        self.instruments = library_ids(LIBRARY_JSON)

    def test_a_vocal_lane_is_valid(self):
        self.assertEqual(validate(copy.deepcopy(VECTORS["score"]), self.glossary, self.instruments), [])

    def test_each_broken_case_names_the_pages_path(self):
        for case in VECTORS["invalid"]:
            score = copy.deepcopy(VECTORS["score"])
            set_path(score, case["set"], case["value"])
            problems = validate(score, self.glossary, self.instruments)
            self.assertEqual(len(problems), 1, case["name"])
            self.assertEqual(problems[0].split(": ")[0], case["error"], f"{case['name']}: {problems[0]}")


if __name__ == "__main__":
    unittest.main()
