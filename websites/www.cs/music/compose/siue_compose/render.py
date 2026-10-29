"""A Piece to a complete workroom draft: one stem per lane with sfizz, then the lo-fi master, the folded loop, Opus and the spectrogram."""
import json
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np

from .checks import repetition, sharpness
from .export import midi_files, musicxml, score_json
from .piece import Piece
from .sfz import write_sfz

RATE = 48000
TAIL = 6.0  # seconds of reverb and release rendered past the end, then folded onto the start
BITRATE = "96k"
LOUDNESS = -20.0  # LUFS
PEAK = -3.0  # dBFS


class RenderError(Exception):
    pass


def _run(*args: str) -> None:
    r = subprocess.run(list(args), capture_output=True, text=True)
    if r.returncode != 0:
        raise RenderError(f"{args[0]} failed: {r.stderr.strip()[-800:]}")


def _read(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(RATE), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)


def _write(samples: np.ndarray, path: Path) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "2", "-i", "-", "-c:a", "pcm_f32le", str(path)],
                   input=np.ascontiguousarray(samples, dtype=np.float32).tobytes(), check=True)


def reverb_ir(seconds: float = 4.5, seed: int = 7) -> np.ndarray:
    """A long, dark hall: decaying stereo noise, darker as it fades."""
    n = int(seconds * RATE)
    t = np.arange(n) / RATE
    noise = np.random.default_rng(seed).normal(0, 1, (n, 2))
    smooth = np.ones(24) / 24  # a gentle low-pass so the tail has no fizz
    noise = np.stack([np.convolve(noise[:, c], smooth, mode="same") for c in range(2)], axis=1)
    ir = noise * np.exp(-t / (seconds / 6.9))[:, None]
    ir[: int(0.02 * RATE)] *= np.linspace(0, 1, int(0.02 * RATE))[:, None]
    return (ir / np.abs(ir).max() * 0.5).astype(np.float32)


def fold(samples: np.ndarray, length: int) -> np.ndarray:
    """The audio cut to `length` with everything after it added onto the start, so the loop carries its own tail."""
    out = np.array(samples[:length], dtype=np.float32)
    if len(out) < length:
        out = np.concatenate([out, np.zeros((length - len(out), out.shape[1]), dtype=np.float32)])
    tail = samples[length:]
    while len(tail):
        k = min(len(tail), length)
        out[:k] += tail[:k]
        tail = tail[k:]
    return out


def loudness(path: Path) -> float:
    """Integrated loudness in LUFS (EBU R128)."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    found = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    if not found:
        raise RenderError(f"could not measure the loudness of {path}")
    return float(found[-1])


def level(path: Path, samples: np.ndarray) -> float:
    """One gain for the whole piece (a changing gain would break the loop point): LOUDNESS, or less if a peak would pass PEAK."""
    gain = 10 ** ((LOUDNESS - loudness(path)) / 20)
    peak = float(np.abs(samples).max())
    return min(gain, 10 ** (PEAK / 20) / peak) if peak > 0 else gain


def render(piece: Piece, draft: int, out: Path, manifest: dict, samples: Path, made: str, changes: list[dict] | None = None) -> list[str]:
    """Writes the draft folder; returns the checks' problems (empty when the draft may be published)."""
    out = Path(out)
    work = out / "work"
    for d in (out / "stems", out / "midi", work):
        d.mkdir(parents=True, exist_ok=True)
    problems = [p for m in piece.motifs for p in repetition(piece, m.id)]
    length = round(piece.duration * RATE)
    stems = []
    for lane in piece.lanes:
        if not any(n.lane == lane.id for n in piece.clipped_notes()):
            continue
        midi = out / "midi" / f"{lane.id}.mid"
        midi_files(piece)[lane.id].save(midi)
        sfz = write_sfz(lane, manifest["instruments"][lane.instrument], samples, work)
        stem = out / "stems" / f"{lane.id}.wav"
        _run("sfizz_render", "--sfz", str(sfz), "--midi", str(midi), "--wav", str(stem), "-s", str(RATE), "-q", "3")
        audio = _read(stem)[: length + int(TAIL * RATE)] * (10 ** (lane.gain_db / 20))
        stems.append(np.pad(audio, ((0, max(0, length + int(TAIL * RATE) - len(audio))), (0, 0))))
    if not stems:
        raise RenderError("the piece has no notes")
    dry = np.sum(stems, axis=0)
    _write(dry, work / "dry.wav")
    _write(reverb_ir(), work / "ir.wav")
    chain = (
        "[0:a]asoftclip=type=tanh,vibrato=f=0.45:d=0.012,vibrato=f=5.5:d=0.003,highpass=f=30,lowpass=f=6500,lowpass=f=9000,asplit[d][w];"
        "[w][1:a]afir=dry=0:wet=10[r];"
        "[d][r]amix=inputs=2:weights='1 0.55':normalize=0[m];"
        "anoisesrc=color=pink:amplitude=0.0015:sample_rate=48000:seed=3,lowpass=f=5000[h];"
        "[m][h]amix=inputs=2:normalize=0:duration=first,aformat=channel_layouts=stereo[o]"
    )
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "dry.wav"), "-i", str(work / "ir.wav"),
         "-filter_complex", chain, "-map", "[o]", "-c:a", "pcm_f32le", str(work / "wet.wav"))
    folded = fold(_read(work / "wet.wav"), length)
    _write(folded, work / "folded.wav")
    _write(folded * level(work / "folded.wav", folded), work / "master.wav")
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "master.wav"), "-c:a", "libopus", "-b:a", BITRATE,
         "-t", f"{piece.duration:.6f}", str(out / "audio.webm"))
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "master.wav"), "-lavfi",
         "aresample=24000,showspectrumpic=s=1600x480:legend=0:fscale=log:color=intensity:scale=log", str(out / "spectrogram.png"))
    problems += sharpness(work / "master.wav")
    (out / "score.json").write_text(json.dumps(score_json(piece, draft, made, changes), indent=1) + "\n")
    (out / "score.musicxml").write_text(musicxml(piece))
    shutil.rmtree(work)
    return problems
