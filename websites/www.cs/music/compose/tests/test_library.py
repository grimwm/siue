"""The shared sample library: each manifest sample becomes one lossless FLAC and an entry in library.json."""
import json
import math
import subprocess
import tempfile
import unittest
import wave
from pathlib import Path

import support  # noqa: F401
from siue_compose.library import build


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


if __name__ == "__main__":
    unittest.main()
