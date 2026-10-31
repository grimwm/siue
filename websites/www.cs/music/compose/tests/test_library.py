"""The shared sample library: each manifest sample becomes one lossless FLAC and an entry in library.json."""
import json
import math
import subprocess
import tempfile
import unittest
import wave
from pathlib import Path

import support  # noqa: F401
from siue_compose.library import CATALOGUE_FIELDS, LibraryError, build


def write_wav(path: Path, rate=22050, width=2, channels=2, frames=2000, freq=440.0):
    path.parent.mkdir(parents=True, exist_ok=True)
    top = 2 ** (8 * width - 1) - 1
    data = bytearray()
    for i in range(frames):
        v = int(top * 0.5 * math.sin(2 * math.pi * freq * i / rate))
        for c in range(channels):
            data += (v if c == 0 else -v // 3).to_bytes(width, "little", signed=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(width)
        w.setframerate(rate)
        w.writeframes(bytes(data))


def pcm(path: Path) -> bytes:
    """The decoded samples at full precision, whatever the container."""
    return subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "s32le", "-"], check=True, capture_output=True).stdout


MANIFEST = {
    "library": "Test Library 1.0", "licence": "CC0 1.0 Universal", "credit": "Test Studios",
    "source": "https://example.test/lib", "commit": "abc",
    "instruments": {
        "harp": {"files": [{"path": "Strings/Harp/a.wav", "sha256": "x", "pitch": 57},
                           {"path": "Strings/Harp/b.wav", "sha256": "x", "pitch": 69}]},
        "organ": {"files": [{"path": "Keys/Organ/c.wav", "sha256": "x", "pitch": 48}], "loop": [0.02, 0.06]},
    },
}


class BuildTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.samples = Path(tmp.name) / "samples"
        self.out = Path(tmp.name) / "library"
        write_wav(self.samples / "Strings/Harp/a.wav")
        write_wav(self.samples / "Strings/Harp/b.wav", rate=44100, channels=1, freq=880.0)
        write_wav(self.samples / "Keys/Organ/c.wav", width=3, freq=220.0)

    def test_writes_one_flac_per_sample_and_the_index(self):
        index = build(MANIFEST, self.samples, self.out)
        self.assertEqual(index, json.loads((self.out / "library.json").read_text()))
        self.assertEqual(sorted(p.relative_to(self.out).as_posix() for p in self.out.rglob("*.flac")),
                         ["harp/57.flac", "harp/69.flac", "organ/48.flac"])
        self.assertEqual(index["version"], 1)
        self.assertEqual(index["instruments"]["harp"]["files"], [
            {"pitch": 57, "file": "harp/57.flac", "rate": 22050, "channels": 2},
            {"pitch": 69, "file": "harp/69.flac", "rate": 44100, "channels": 1}])
        self.assertEqual(index["instruments"]["organ"]["files"], [{"pitch": 48, "file": "organ/48.flac", "rate": 22050, "channels": 2}])

    def test_flac_decodes_to_the_same_samples(self):
        build(MANIFEST, self.samples, self.out)
        for src, flac in (("Strings/Harp/a.wav", "harp/57.flac"), ("Strings/Harp/b.wav", "harp/69.flac"), ("Keys/Organ/c.wav", "organ/48.flac")):
            self.assertEqual(pcm(self.out / flac), pcm(self.samples / src), flac)

    def test_loop_and_credit_are_carried(self):
        index = build(MANIFEST, self.samples, self.out)
        self.assertEqual(index["instruments"]["organ"]["loop"], [0.02, 0.06])
        self.assertNotIn("loop", index["instruments"]["harp"])
        for key, want in (("source", "https://example.test/lib"), ("commit", "abc"), ("licence", "CC0 1.0 Universal"), ("credit", "Test Studios")):
            self.assertEqual(index[key], want)

    def test_catalogue_fields_copied(self):
        fields = {"name": "Harp", "category": "strings", "range": [23, 104], "expert": [23, 104], "home": 60, "clef": "grand",
                  "written": 0, "gm": 47, "gm_name": "Orchestral Harp", "pieces": None, "standin_note": "n", "attack": 0.005,
                  "release": 0.4}
        self.assertEqual(set(fields), set(CATALOGUE_FIELDS))
        manifest = {**MANIFEST, "instruments": {**MANIFEST["instruments"], "harp": {**MANIFEST["instruments"]["harp"], **fields}}}
        index = build(manifest, self.samples, self.out)
        for k, v in fields.items():
            self.assertEqual(index["instruments"]["harp"][k], v, k)
        self.assertNotIn("name", index["instruments"]["organ"])

    def test_standin_shares_target_files(self):
        manifest = {**MANIFEST, "instruments": {"choir": {"standin": "organ", "name": "Choir"}, **MANIFEST["instruments"]}}
        index = build(manifest, self.samples, self.out)
        choir, organ = index["instruments"]["choir"], index["instruments"]["organ"]
        self.assertEqual(choir["files"], organ["files"])
        self.assertEqual(choir["loop"], organ["loop"])
        self.assertEqual(choir["standin"], "organ")
        self.assertEqual(choir["name"], "Choir")
        self.assertFalse((self.out / "choir").exists())

    def test_standin_shift_moves_the_roots(self):
        manifest = {**MANIFEST, "instruments": {**MANIFEST["instruments"], "celesta": {"standin": "harp", "standin_shift": -12}}}
        index = build(manifest, self.samples, self.out)
        harp, celesta = index["instruments"]["harp"]["files"], index["instruments"]["celesta"]["files"]
        self.assertEqual([f["pitch"] for f in celesta], [f["pitch"] - 12 for f in harp])
        self.assertEqual([f["file"] for f in celesta], [f["file"] for f in harp])
        self.assertNotIn("standin_shift", index["instruments"]["celesta"])

    def test_standin_of_standin_refused(self):
        manifest = {**MANIFEST, "instruments": {**MANIFEST["instruments"], "choir": {"standin": "organ"}, "voice": {"standin": "choir"}}}
        with self.assertRaises(LibraryError) as e:
            build(manifest, self.samples, self.out)
        self.assertIn("voice", str(e.exception))
        self.assertIn("choir", str(e.exception))

    def test_unpitched_kept(self):
        manifest = {**MANIFEST, "instruments": {**MANIFEST["instruments"], "harp": {**MANIFEST["instruments"]["harp"], "pitched": False}}}
        index = build(manifest, self.samples, self.out)
        self.assertIs(index["instruments"]["harp"]["pitched"], False)
        self.assertNotIn("pitched", index["instruments"]["organ"])

    def _organ_loop(self, loop):
        organ = {**MANIFEST["instruments"]["organ"], "loop": loop}
        return {**MANIFEST, "instruments": {**MANIFEST["instruments"], "organ": organ}}

    def test_loop_past_sample_end_refused(self):
        # c.wav is 2000 frames at 22050 Hz, about 0.0907 s long
        with self.assertRaises(LibraryError) as e:
            build(self._organ_loop([0.02, 0.2]), self.samples, self.out)
        self.assertIn("organ/48.flac", str(e.exception))

    def test_published_loop_past_end_kept(self):
        manifest = self._organ_loop([0.02, 0.2])
        manifest["instruments"]["organ"]["loop_past_end"] = [48]
        index = build(manifest, self.samples, self.out)
        self.assertEqual(index["instruments"]["organ"]["loop"], [0.02, 0.2])
        self.assertNotIn("loop_past_end", index["instruments"]["organ"])

    def test_bad_loop_interval_refused(self):
        for loop in ([-0.01, 0.05], [0.06, 0.06], [0.07, 0.03], [0.1, 0.2]):
            with self.subTest(loop=loop), self.assertRaises(LibraryError):
                build(self._organ_loop(loop), self.samples, self.out)


if __name__ == "__main__":
    unittest.main()
