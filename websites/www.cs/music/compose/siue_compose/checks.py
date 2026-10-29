"""The design's anti-goals as checks run on every draft: a tune statement repeated note for note, and sharp or bright sound."""
import subprocess
from pathlib import Path

import numpy as np

from .export import MOTIF_GAP_BEATS
from .piece import Piece

TRANSIENT_WINDOW = 0.005  # seconds
LOCAL_WINDOW = 0.05  # centred on each frame
BEFORE_WINDOW = 0.4  # just before the local window
MAX_CLICK_DB = 18.0  # a 5 ms peak this far above the 50 ms around it is a click
MAX_JUMP_DB = 24.0  # 50 ms this far above the 400 ms before it is a sudden loud entry (a pluck's decay cannot hide it)
FLOOR_DB = -20.0  # below the whole piece's loudness, silence before a soft entrance does not count as quiet
AUDIBLE_DB = -50.0  # quieter peaks are not judged
HIGH_HZ = 8000
MAX_HIGH_DB = -30.0  # energy above HIGH_HZ against the whole


def repetition(piece: Piece, motif: str) -> list[str]:
    """Each pair of the motif's statements that has the same notes in the same lanes."""
    notes = [n for n in piece.clipped_notes() if n.motif == motif]
    statements: list[list] = []
    end = None
    for n in notes:
        if end is None or n.beat - end >= MOTIF_GAP_BEATS:
            statements.append([])
        statements[-1].append(n)
        end = n.beat + n.beats if end is None else max(end, n.beat + n.beats)
    shapes = []
    for s in statements:
        start = s[0].beat
        shapes.append((start, frozenset((n.lane, n.beat - start, n.beats, n.pitch) for n in s)))
    bar = lambda beat: int(beat // piece.beats_per_bar) + 1  # noqa: E731
    return [f"the {motif} statements at bar {bar(a)} and bar {bar(b)} are the same notes in the same lanes"
            for i, (a, sa) in enumerate(shapes) for b, sb in shapes[i + 1:] if sa == sb]


def sharpness_of(samples: np.ndarray, rate: int) -> list[str]:
    """Sharp transients (with their time) and too much energy above HIGH_HZ, in mono samples from -1 to 1."""
    problems = []
    x = np.asarray(samples, dtype=np.float64)
    hop = max(1, int(TRANSIENT_WINDOW * rate))
    frames = len(x) // hop
    if frames:
        f = x[: frames * hop].reshape(frames, hop)
        peak = np.abs(f).max(axis=1)
        power = (f ** 2).mean(axis=1)
        sums = np.concatenate([[0.0], np.cumsum(power)])
        idx = np.arange(frames)

        def rms(lo, hi):
            lo, hi = np.clip(lo, 0, frames), np.clip(hi, 0, frames)
            return np.sqrt((sums[hi] - sums[lo]) / np.maximum(hi - lo, 1))

        half = max(1, int(LOCAL_WINDOW / TRANSIENT_WINDOW) // 2)
        span = max(1, int(BEFORE_WINDOW / TRANSIENT_WINDOW))
        local = rms(idx - half, idx + half + 1)
        floor = np.sqrt(power.mean()) * 10 ** (FLOOR_DB / 20)
        before = np.maximum(rms(idx - half - span, idx - half), floor)
        db = lambda v: 20 * np.log10(np.maximum(v, 1e-12))  # noqa: E731
        audible = db(peak) > AUDIBLE_DB
        for kind, rise in (("click", db(peak) - db(local)), ("sudden entry", db(local) - db(before))):
            limit = MAX_CLICK_DB if kind == "click" else MAX_JUMP_DB
            for i in np.flatnonzero(audible & (rise > limit))[:5]:
                problems.append(f"a sharp transient ({kind}) at {i * hop / rate:.1f} s, {rise[i]:.0f} dB above its surroundings")
    total = float((x ** 2).sum())
    if total > 0:
        spectrum = np.abs(np.fft.rfft(x)) ** 2
        freqs = np.fft.rfftfreq(len(x), 1 / rate)
        high = 10 * np.log10(max(float(spectrum[freqs > HIGH_HZ].sum()), 1e-30) / float(spectrum.sum()))
        if high > MAX_HIGH_DB:
            problems.append(f"too bright: the energy above 8 kHz is {high:.0f} dB of the whole (at most {MAX_HIGH_DB:.0f})")
    return problems


def sharpness(audio: Path, rate: int = 48000) -> list[str]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(audio), "-ac", "1", "-ar", str(rate), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return sharpness_of(np.frombuffer(raw, dtype=np.float32), rate)
