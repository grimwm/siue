"""Speech and humming are optional: missing packages give one clear message;
the pitch-track-to-notes step is exact on a small fixture; with the packages
installed, a synthetic two-note hum (two tones with a 100 ms silence between)
becomes a two-note MIDI motif, each note within a semitone of what was played."""
import importlib.util
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import support  # noqa: F401  (puts siue_music on the path)
from siue_music.answering import MissingDependency, f0_to_notes, hum_to_midi, transcribe

HAVE_HUM = all(importlib.util.find_spec(m) for m in ("librosa", "mido", "numpy", "soundfile"))
HAVE_SPEECH = importlib.util.find_spec("faster_whisper") is not None and shutil.which("ffmpeg") and shutil.which("say")


class PitchTrackTest(unittest.TestCase):
    def test_frames_become_notes_and_blips_are_dropped(self):
        f0 = [440.0] * 10 + [None] * 2 + [493.88] * 10 + [261.63]
        notes = [(m, round(s, 3), round(d, 3)) for m, s, d in f0_to_notes(f0, 0.01)]
        self.assertEqual(notes, [(69, 0.0, 0.1), (71, 0.12, 0.1)])

    def test_nan_is_unvoiced(self):
        self.assertEqual(f0_to_notes([float("nan")] * 20, 0.01), [])


class MissingPackagesTest(unittest.TestCase):
    def test_speech_without_whisper(self):
        with mock.patch.dict(sys.modules, {"faster_whisper": None}):
            with self.assertRaises(MissingDependency) as e:
                transcribe(Path("x.wav"))
        self.assertIn("pip install -r music/tools/requirements-answering.txt", str(e.exception))

    def test_humming_without_librosa(self):
        with mock.patch.dict(sys.modules, {"librosa": None}):
            with self.assertRaises(MissingDependency) as e:
                hum_to_midi(Path("x.wav"), Path("y.mid"))
        self.assertIn("librosa", str(e.exception))

    def test_transcribe_joins_the_model_segments(self):
        class Seg:
            def __init__(self, text): self.text = text
        class Model:
            def transcribe(self, path, **kw): return iter([Seg(" louder at"), Seg(" bar thirty three ")]), None
        with tempfile.TemporaryDirectory() as d:
            wav = Path(d) / "a.wav"
            wav.write_bytes(b"RIFF")
            self.assertEqual(transcribe(wav, model_factory=Model), "louder at bar thirty three")


@unittest.skipUnless(HAVE_HUM, "humming needs " + "librosa, mido, numpy, soundfile")
class HumFixtureTest(unittest.TestCase):
    def test_a_two_note_hum_becomes_a_two_note_motif(self):
        import mido
        import numpy as np
        import soundfile
        rate = 16_000
        t = np.arange(int(rate * 0.5)) / rate
        gap = np.zeros(int(rate * 0.1))  # 100 ms of silence, so pyin hears two notes and not a glide across a splice
        tone = np.concatenate([np.sin(2 * np.pi * 440 * t), gap, np.sin(2 * np.pi * 493.88 * t)]) * 0.5
        with tempfile.TemporaryDirectory() as d:
            wav, mid = Path(d) / "hum.wav", Path(d) / "hum.mid"
            soundfile.write(wav, tone, rate)
            self.assertEqual(hum_to_midi(wav, mid), 2)
            pitches = [m.note for m in mido.MidiFile(mid).tracks[0] if m.type == "note_on" and m.velocity > 0]
            self.assertEqual(len(pitches), 2)
            for got, want in zip(pitches, (69, 71)):  # A4 and B4, each within a semitone: pitch tracking is not exact
                self.assertLessEqual(abs(got - want), 1, (pitches, want))


@unittest.skipUnless(HAVE_SPEECH, "speech needs faster-whisper, ffmpeg and macOS say")
class SpeechFixtureTest(unittest.TestCase):
    def test_a_spoken_sentence_is_transcribed(self):
        import subprocess
        with tempfile.TemporaryDirectory() as d:
            aiff = Path(d) / "s.aiff"
            subprocess.run(["say", "-o", str(aiff), "make the horns louder"], check=True)
            self.assertIn("louder", transcribe(aiff).lower())


if __name__ == "__main__":
    unittest.main()
