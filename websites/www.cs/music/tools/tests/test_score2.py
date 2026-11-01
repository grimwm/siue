"""Score schema 2 in Python: the shared vectors (games/workroom/test/fixtures/schema2-vectors.json) parse and break
exactly as the page's validator says, and the renderer's loudness and bend rules give the page's numbers."""
import copy
import json
import unittest

from support import FIXTURES, GLOSSARY_JSON, LIBRARY_JSON
from siue_music.score import bend_rate, effective_velocity, glossary_ids, level_at, library_ids, tempo_line_bpm, validate

VECTORS = json.loads((FIXTURES / "schema2-vectors.json").read_text())


def set_path(root, path, value):
    *keys, last = path.split(".")
    at = root
    for k in keys:
        at = at[int(k)] if isinstance(at, list) else at[k]
    if isinstance(at, list):
        i = int(last)
        if value == "__delete__":
            del at[i]
        elif i == len(at):
            at.append(value)
        else:
            at[i] = value
    elif value == "__delete__":
        del at[last]
    else:
        at[last] = value


class Schema2Test(unittest.TestCase):
    def setUp(self):
        self.glossary = glossary_ids(GLOSSARY_JSON)
        self.instruments = library_ids(LIBRARY_JSON)

    def test_the_schema_2_score_is_valid(self):
        self.assertEqual(validate(copy.deepcopy(VECTORS["score"]), self.glossary, self.instruments), [])

    def test_each_broken_case_names_the_pages_path(self):
        for case in VECTORS["invalid"]:
            score = copy.deepcopy(VECTORS["score"])
            set_path(score, case["set"], case["value"])
            problems = validate(score, self.glossary, self.instruments)
            self.assertEqual(len(problems), 1, case["name"])
            self.assertEqual(problems[0].split(": ")[0], case["error"], f"{case['name']}: {problems[0]}")

    def test_a_ramp_moves_by_bar(self):
        line = [{"bar": 1, "bpm": 92, "shape": "speed_up"}, {"bar": 5, "bpm": 128, "shape": "steady"}]
        self.assertEqual([tempo_line_bpm(line, b) for b in (1, 2, 3, 4, 5, 9)], [92, 101, 110, 119, 128, 128])

    def test_loudness_gives_the_pages_velocities(self):
        score = VECTORS["score"]
        lanes = {l["id"]: l for l in score["lanes"]}
        for want in VECTORS["velocities"]:
            n = score["notes"][want["note"]]
            level = level_at(score, lanes[n["lane"]], n["start"])
            self.assertAlmostEqual(level, want["level"], places=5)
            self.assertEqual(effective_velocity(n["velocity"], level), want["velocity"])

    def test_no_loudness_line_leaves_the_velocity(self):
        self.assertEqual(effective_velocity(77, None), 77)

    def test_bends_give_the_pages_rates(self):
        for want in VECTORS["bends"]:
            bend = VECTORS["score"]["notes"][want["note"]]["bend"]
            self.assertAlmostEqual(bend_rate(bend, want["t"]), want["rate"], places=8)


if __name__ == "__main__":
    unittest.main()
