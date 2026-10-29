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
            seconds = len(_read(out / "audio.webm")) / RATE
            self.assertAlmostEqual(seconds, piece().duration, delta=0.02)


if __name__ == "__main__":
    unittest.main()
