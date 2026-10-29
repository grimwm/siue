"""A cut: the same stems mixed again with some lanes moved, through the same master chain and loop fold."""
import importlib
import json
import shutil
import tempfile
import unittest
from pathlib import Path

import numpy as np

import support
from fixture_piece import piece
from siue_compose.cut import FULL, Cut, cut_named, lane_gains
from siue_compose.render import RATE, RenderError, _read, loudness, render, render_cut
from siue_compose.samples import DEFAULT_CACHE

MANIFEST = json.loads((support.COMPOSE / "samples.json").read_text())
SAMPLES = DEFAULT_CACHE / MANIFEST["commit"]


class CutTest(unittest.TestCase):
    def test_a_lane_gain_adds_to_the_lanes_own(self):
        gains = lane_gains(piece(), Cut({"drone": -6.0}))
        self.assertEqual(gains["lyre"], 1.0)
        self.assertAlmostEqual(gains["drone"], 10 ** (-6 / 20))

    def test_the_full_cut_moves_nothing(self):
        self.assertEqual(lane_gains(piece(), FULL), {"lyre": 1.0, "drone": 1.0})

    def test_a_lane_the_piece_does_not_have_is_refused(self):
        with self.assertRaisesRegex(RenderError, "organ"):
            lane_gains(piece(), Cut({"organ": -6.0}))

    def test_cuts_by_name(self):
        story = Cut({"organ": -12.0}, loudness=-23.0)
        self.assertIs(cut_named({"story": story}, "story"), story)
        self.assertIs(cut_named({}, "full"), FULL)
        with self.assertRaisesRegex(RenderError, "full, story"):
            cut_named({"story": story}, "story2")

    def test_every_cut_of_every_piece_names_lanes_of_its_latest_draft(self):
        for name in ("crete_title", "crete_title_short"):
            module = importlib.import_module(f"pieces.{name}")
            p = module.compose(max(getattr(module, "CHANGES", {}) or [1]))
            for cut in getattr(module, "CUTS", {}).values():
                lane_gains(p, cut)


@unittest.skipUnless(shutil.which("sfizz_render") and SAMPLES.is_dir(), "needs the container and the sample cache")
class RenderCutTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.out = Path(cls.tmp.name)
        render(piece(), 1, cls.out, MANIFEST, SAMPLES, "2026-10-28T12:00:00Z")

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_the_full_cut_is_the_draft_in_both_encodings(self):
        made = render_cut(piece(), self.out, "full", FULL)
        self.assertEqual(sorted(p.name for p in made), ["full.m4a", "full.webm"])
        draft = _read(self.out / "audio.webm")
        np.testing.assert_allclose(_read(self.out / "cuts" / "full.webm"), draft, atol=1e-4)
        self.assertAlmostEqual(len(_read(self.out / "cuts" / "full.m4a")) / RATE, piece().duration, delta=0.05)

    def test_a_cut_moves_its_lanes_and_meets_its_own_loudness(self):
        render_cut(piece(), self.out, "quiet", Cut({"lyre": -40.0}, loudness=-26.0))
        quiet = self.out / "cuts" / "quiet.webm"
        self.assertAlmostEqual(len(_read(quiet)) / RATE, piece().duration, delta=0.02)
        self.assertAlmostEqual(loudness(quiet), -26.0, delta=1.5)
        self.assertGreater(float(np.abs(_read(quiet) - _read(self.out / "audio.webm")).max()), 0.01)

    def test_a_cut_needs_the_drafts_stems(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(RenderError, "make music-render"):
                render_cut(piece(), Path(tmp), "full", FULL)


if __name__ == "__main__":
    unittest.main()
