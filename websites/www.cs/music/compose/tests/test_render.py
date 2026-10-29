"""A short render in the container makes every draft file, as long as the score, with a seamless fold."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path

import numpy as np

import support
from fixture_piece import piece
from siue_compose.render import RATE, _read, fold, render
from siue_compose.samples import DEFAULT_CACHE

MANIFEST = json.loads((support.COMPOSE / "samples.json").read_text())
SAMPLES = DEFAULT_CACHE / MANIFEST["commit"]


class FoldTest(unittest.TestCase):
    def test_tail_is_added_onto_the_start(self):
        audio = np.ones((10, 2), dtype=np.float32)
        out = fold(audio, 6)
        self.assertEqual(out.shape, (6, 2))
        self.assertEqual(out[:, 0].tolist(), [2, 2, 2, 2, 1, 1])


@unittest.skipUnless(shutil.which("sfizz_render") and SAMPLES.is_dir(), "needs the container and the sample cache")
class RenderTest(unittest.TestCase):
    def test_short_render_makes_every_draft_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            render(piece(), 1, out, MANIFEST, SAMPLES, "2026-10-28T12:00:00Z")
            names = sorted(p.name for p in out.iterdir() if p.is_file())
            self.assertEqual(names, ["audio.webm", "score.json", "score.musicxml", "spectrogram.png"])
            self.assertEqual(sorted(p.name for p in (out / "stems").iterdir()), ["drone.wav", "lyre.wav"])
            audio = _read(out / "audio.webm")
            self.assertAlmostEqual(len(audio) / RATE, piece().duration, delta=0.02)
            # The loop point: the step from the last sample to the first is no bigger than the steps beside it.
            near = int(0.01 * RATE)
            steps = np.abs(np.diff(np.concatenate([audio[-near:, 0], audio[:near, 0]])))
            self.assertLessEqual(float(steps[near - 1]), 2 * float(np.delete(steps, near - 1).max()))

    def test_a_score_only_draft_keeps_only_its_score(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp)
            problems = render(piece(), 1, out, MANIFEST, SAMPLES, "2026-10-28T12:00:00Z", score_only=True)
            self.assertEqual(problems, [])
            self.assertEqual(sorted(p.name for p in out.iterdir() if p.is_file()), ["score.json", "score.musicxml"])
            score = json.loads((out / "score.json").read_text())
            self.assertEqual(score["audio"], [])
            self.assertNotIn("spectrogram", score)

    def test_a_draft_that_fails_a_check_cannot_be_published(self):
        from siue_compose.piece import Note
        tune = [Note("lyre", b, 1, 62 + b, 50, "ariadne") for b in (0, 1)]
        p = piece(tune + [Note(n.lane, n.beat + 6, n.beats, n.pitch, n.velocity, n.motif) for n in tune])
        with tempfile.TemporaryDirectory() as tmp:
            problems = render(p, 1, Path(tmp), MANIFEST, SAMPLES, "2026-10-28T12:00:00Z")
            self.assertTrue(any("same notes" in x for x in problems), problems)
            self.assertFalse((Path(tmp) / "audio.webm").exists())


if __name__ == "__main__":
    unittest.main()
