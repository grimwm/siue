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
import subprocess
from siue_music import answering
from siue_music.answering import MissingDependency, f0_to_notes, hum_to_midi, to_wav, transcribe

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


class FfmpegIsLockedDownTest(unittest.TestCase):
    def test_the_command_names_the_format_and_closes_every_other_door(self):
        seen = {}
        def fake_run(cmd, **kw):
            seen["cmd"], seen["kw"] = cmd, kw
            return subprocess.CompletedProcess(cmd, 0, "", "")
        with mock.patch("shutil.which", return_value="/usr/bin/ffmpeg"), mock.patch("subprocess.run", fake_run):
            to_wav(Path("a.m4a"), Path("o.wav"))
        cmd = seen["cmd"]
        self.assertIn("-nostdin", cmd)
        self.assertEqual(cmd[cmd.index("-protocol_whitelist") + 1], "file")
        self.assertEqual(cmd[cmd.index("-f") + 1], "mp4")
        self.assertLess(cmd.index("-f"), cmd.index("-i"))
        self.assertEqual(seen["kw"]["timeout"], answering.FFMPEG_SECONDS)

    def test_an_unknown_format_is_refused_before_ffmpeg_runs(self):
        with mock.patch("subprocess.run") as run:
            with self.assertRaises(ValueError):
                to_wav(Path("a.mp3"), Path("o.wav"))
        run.assert_not_called()

    def test_a_timeout_is_a_clean_error(self):
        def slow(cmd, **kw):
            raise subprocess.TimeoutExpired(cmd, 1)
        with mock.patch("shutil.which", return_value="/usr/bin/ffmpeg"), mock.patch("subprocess.run", slow):
            with self.assertRaises(RuntimeError) as e:
                to_wav(Path("a.webm"), Path("o.wav"))
        self.assertIn("longer than", str(e.exception))

    @unittest.skipUnless(shutil.which("ffmpeg"), "needs ffmpeg")
    def test_a_playlist_declared_as_webm_reads_nothing(self):
        with tempfile.TemporaryDirectory() as d:
            sentinel = Path(d) / "sentinel.wav"
            sentinel.write_bytes(b"RIFF")
            playlist = Path(d) / "audio.webm"
            playlist.write_text(f"#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:1\n#EXTINF:1,\nfile:{sentinel}\n#EXT-X-ENDLIST\n")
            out = Path(d) / "out.wav"
            with self.assertRaises(RuntimeError) as e:
                to_wav(playlist, out)
            self.assertFalse(out.exists())
            self.assertNotIn("sentinel", str(e.exception).replace(str(playlist), ""))


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
            ogg = Path(d) / "audio.ogg"
            subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(aiff), str(ogg)], check=True)
            self.assertIn("louder", transcribe(ogg).lower())


if __name__ == "__main__":
    unittest.main()
