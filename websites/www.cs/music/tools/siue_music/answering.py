"""Optional steps for answering notes: speech to text (faster-whisper) and humming to MIDI (librosa.pyin, mido)."""
import math
import os
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Sequence

INSTALL = "pip install -r music/tools/requirements-answering.txt (and brew install ffmpeg)"
DEFAULT_WHISPER_MODEL = "small.en"
PITCH_RATE = 16_000
PITCH_HOP = 160


class MissingDependency(Exception):
    """The message names the package (or program) and the install command."""


def _missing(what: str, package: str) -> MissingDependency:
    return MissingDependency(f"{what} needs {package}: {INSTALL}")


# The demuxer is named explicitly from the saved file's extension: ffmpeg never sniffs untrusted note audio,
# so a crafted file cannot turn into a playlist that reads other files or fetches URLs.
INPUT_FORMATS = {".webm": "webm", ".m4a": "mp4", ".aiff": "aiff"}
FFMPEG_SECONDS = 120


def to_wav(src: Path, dst: Path, rate: int = 16_000) -> Path:
    if src.suffix.lower() == ".wav":
        return src
    fmt = INPUT_FORMATS.get(src.suffix.lower())
    if fmt is None:
        raise ValueError(f"{src.name}: the audio format is not one this tool converts (webm, m4a)")
    if shutil.which("ffmpeg") is None:
        raise _missing("converting audio", "ffmpeg")
    cmd = ["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-protocol_whitelist", "file", "-f", fmt, "-i", str(src),
           "-ac", "1", "-ar", str(rate), str(dst)]
    try:
        done = subprocess.run(cmd, capture_output=True, text=True, timeout=FFMPEG_SECONDS)
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"ffmpeg took longer than {FFMPEG_SECONDS} s on {src.name}") from None
    if done.returncode != 0:
        raise RuntimeError(f"ffmpeg could not read {src.name}: {done.stderr.strip()[-200:]}")
    return dst


def transcribe(audio: Path, model_factory: Callable[[], Any] | None = None) -> str:
    if model_factory is None:
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise _missing("speech-to-text", "faster-whisper") from None
        name = os.environ.get("SIUE_MUSIC_WHISPER_MODEL") or DEFAULT_WHISPER_MODEL
        model_factory = lambda: WhisperModel(name, compute_type="int8")  # noqa: E731
    with tempfile.TemporaryDirectory() as d:
        wav = to_wav(audio, Path(d) / "speech.wav")
        segments, _info = model_factory().transcribe(str(wav), language="en")
        return " ".join(s.text.strip() for s in segments).strip()


def f0_to_notes(f0: Sequence[float | None], hop_seconds: float, min_seconds: float = 0.08) -> list[tuple[int, float, float]]:
    """Frames of fundamental frequency (None, NaN or 0 are unvoiced) to (midi, start, length) notes; runs shorter than min_seconds are dropped."""
    runs: list[tuple[int, int, int]] = []  # midi, first frame, frame count
    for i, f in enumerate(f0):
        if f is None or not math.isfinite(f) or f <= 0:
            continue
        midi = round(69 + 12 * math.log2(f / 440))
        if runs and runs[-1][0] == midi and runs[-1][1] + runs[-1][2] == i:
            runs[-1] = (midi, runs[-1][1], runs[-1][2] + 1)
        else:
            runs.append((midi, i, 1))
    return [(m, first * hop_seconds, count * hop_seconds) for m, first, count in runs if count * hop_seconds >= min_seconds - 1e-9]


def hum_to_midi(audio: Path, out: Path) -> int:
    try:
        import librosa
        import mido
    except ImportError as e:
        raise _missing("humming-to-MIDI", e.name or "librosa and mido") from None
    with tempfile.TemporaryDirectory() as d:
        wav = to_wav(audio, Path(d) / "hum.wav", PITCH_RATE)
        y, _ = librosa.load(str(wav), sr=PITCH_RATE)
    f0, _voiced, _prob = librosa.pyin(y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C6"), sr=PITCH_RATE,
                                      frame_length=1024, hop_length=PITCH_HOP)
    notes = f0_to_notes([None if math.isnan(f) else float(f) for f in f0], PITCH_HOP / PITCH_RATE)
    mid = mido.MidiFile(ticks_per_beat=480)
    track = mido.MidiTrack()
    mid.tracks.append(track)
    track.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(60)))  # 60 bpm: one beat a second
    at = 0
    for midi, start, length in notes:
        on, off = round(start * 480), round((start + length) * 480)
        track.append(mido.Message("note_on", note=max(0, min(127, midi)), velocity=80, time=max(0, on - at)))
        track.append(mido.Message("note_off", note=max(0, min(127, midi)), velocity=0, time=max(0, off - on)))
        at = off
    mid.save(str(out))
    return len(notes)


@dataclass
class Steps:
    transcribe: Callable[[Path], str]
    hum_to_midi: Callable[[Path, Path], int]


def default_steps() -> Steps:
    return Steps(transcribe=transcribe, hum_to_midi=hum_to_midi)
