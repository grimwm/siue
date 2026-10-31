"""The SFZ instrument: pitched samples split the keyboard between their roots; drums keep each sample on its own key."""
import tempfile
import unittest
from pathlib import Path

import support  # noqa: F401
from siue_compose.piece import Lane
from siue_compose.sfz import instrument, regions, write_sfz

FILES = [{"path": "Drums/kick.wav", "pitch": 36}, {"path": "Drums/snare.wav", "pitch": 38}]


class SfzTest(unittest.TestCase):
    def test_pitched_sfz_regions(self):
        self.assertEqual([(lo, hi, f["pitch"]) for lo, hi, f in regions(FILES)], [(0, 37, 36), (38, 127, 38)])

    def test_unpitched_sfz_regions(self):
        self.assertEqual([(lo, hi, f["pitch"]) for lo, hi, f in regions(FILES, pitched=False)], [(36, 36, 36), (38, 38, 38)])

    def test_unpitched_instrument_writes_one_key_regions(self):
        with tempfile.TemporaryDirectory() as tmp:
            lane = Lane("drums", "Drums", "percussion", "#aabbcc", "kit", attack=0.005, release=0.4)
            text = write_sfz(lane, {"files": FILES, "pitched": False}, Path(tmp), Path(tmp)).read_text()
        self.assertIn("lokey=36 hikey=36 pitch_keycenter=36", text)
        self.assertIn("lokey=38 hikey=38 pitch_keycenter=38", text)

    def test_standin_plays_its_target(self):
        manifest = {"instruments": {"organ": {"files": FILES, "loop": [1, 2]}, "choir": {"standin": "organ", "name": "Choir"}}}
        self.assertEqual(instrument(manifest, "choir"), {"files": FILES, "loop": [1, 2]})
        self.assertIs(instrument(manifest, "organ"), manifest["instruments"]["organ"])

    def test_standin_shift_and_unpitched_target_carry_over(self):
        manifest = {"instruments": {"glock": {"files": FILES}, "celesta": {"standin": "glock", "standin_shift": -12},
                                    "kit": {"files": FILES, "pitched": False}, "pads": {"standin": "kit"}}}
        self.assertEqual([f["pitch"] for f in instrument(manifest, "celesta")["files"]], [24, 26])
        self.assertEqual([f["path"] for f in instrument(manifest, "celesta")["files"]], ["Drums/kick.wav", "Drums/snare.wav"])
        self.assertIs(instrument(manifest, "pads")["pitched"], False)


if __name__ == "__main__":
    unittest.main()
