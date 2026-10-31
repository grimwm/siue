"""A Piece to a complete workroom draft: one stem per lane with sfizz, then the lo-fi master, the folded loop, Opus and the spectrogram."""
import json
import re
import shutil
import subprocess
from collections.abc import Mapping
from pathlib import Path

import numpy as np

from .checks import repetition, sharpness
from .cut import LOUDNESS, Cut, RenderError, lane_gains
from .export import midi_files, musicxml, score_json
from .piece import Piece
from .sfz import instrument, write_sfz

RATE = 48000
TAIL = 6.0  # seconds of reverb and release rendered past the end, then folded onto the start
BITRATE = "96k"
AAC_BITRATE = "96k"  # a cut's M4A, for browsers without Opus in WebM (Safari)
PEAK = -3.0  # dBFS


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


def level(path: Path, samples: np.ndarray, target: float = LOUDNESS) -> float:
    """One gain for the whole piece (a changing gain would break the loop point): `target` LUFS, or less if a peak would pass PEAK."""
    gain = 10 ** ((target - loudness(path)) / 20)
    peak = float(np.abs(samples).max())
    return min(gain, 10 ** (PEAK / 20) / peak) if peak > 0 else gain


def _stem(path: Path, length: int, gain: float) -> np.ndarray:
    """A lane's stem at its gain, cut or padded to the piece plus TAIL."""
    audio = _read(path)[: length + int(TAIL * RATE)] * gain
    return np.pad(audio, ((0, max(0, length + int(TAIL * RATE) - len(audio))), (0, 0)))


def mixdown(stems: list[np.ndarray], length: int, work: Path) -> np.ndarray:
    """The stems summed and through the lo-fi chain, the tail folded onto the start, with the hiss: the loop before its level."""
    dry = np.sum(stems, axis=0)
    _write(dry, work / "dry.wav")
    _write(reverb_ir(), work / "ir.wav")
    chain = (
        "[0:a]asoftclip=type=tanh,vibrato=f=0.45:d=0.012,vibrato=f=5.5:d=0.003,highpass=f=30,lowpass=f=6500,lowpass=f=9000,asplit[d][w];"
        "[w][1:a]afir=dry=0:wet=10[r];"
        "[d][r]amix=inputs=2:weights='1 0.55':normalize=0,aformat=channel_layouts=stereo[o]"
    )
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "dry.wav"), "-i", str(work / "ir.wav"),
         "-filter_complex", chain, "-map", "[o]", "-c:a", "pcm_f32le", str(work / "wet.wav"))
    # The hiss goes on after the fold, so the loop's start does not carry two layers of it.
    _run("ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i",
         f"anoisesrc=color=pink:amplitude=0.0015:sample_rate={RATE}:seed=3:duration={length / RATE:.6f},lowpass=f=5000",
         "-ac", "2", "-c:a", "pcm_f32le", str(work / "hiss.wav"))
    folded = fold(_read(work / "wet.wav"), length) + fold(_read(work / "hiss.wav"), length)
    _write(folded, work / "folded.wav")
    return folded


def render(piece: Piece, draft: int, out: Path, manifest: dict, samples: Path | Mapping[str, Path], made: str, changes: list[dict] | None = None,
           score_only: bool = False) -> list[str]:
    """
    Writes the draft folder; returns the checks' problems. With any problem the audio is removed, so publish refuses the draft.
    A score-only draft is still rendered, for the checks, but keeps only its score: the workroom builds its sound. With any
    problem it keeps no score.json, so publish refuses it too.
    """
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
        folder = samples[lane.instrument] if isinstance(samples, Mapping) else samples  # one folder per instrument, as fetch gives
        sfz = write_sfz(lane, instrument(manifest, lane.instrument), folder, work)
        stem = out / "stems" / f"{lane.id}.wav"
        _run("sfizz_render", "--sfz", str(sfz), "--midi", str(midi), "--wav", str(stem), "-s", str(RATE), "-q", "3")
        stems.append(_stem(stem, length, 10 ** (lane.gain_db / 20)))
    if not stems:
        raise RenderError("the piece has no notes")
    folded = mixdown(stems, length, work)
    _write(folded * level(work / "folded.wav", folded), work / "master.wav")
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "master.wav"), "-c:a", "libopus", "-b:a", BITRATE,
         "-t", f"{piece.duration:.6f}", str(out / "audio.webm"))
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "master.wav"), "-lavfi",
         "aresample=24000,showspectrumpic=s=1600x480:legend=0:fscale=log:color=intensity:scale=log", str(out / "spectrogram.png"))
    problems += sharpness(work / "master.wav")
    if problems or score_only:
        # publish needs the audio of a draft that lists it, so a draft that breaks a check cannot be sent; a score-only draft lists none.
        (out / "audio.webm").unlink()
    if score_only:
        (out / "spectrogram.png").unlink()
    if problems and score_only:
        # A score-only draft has no audio to withhold, so it keeps no score.json, and publish has nothing to send.
        (out / "score.json").unlink(missing_ok=True)
    else:
        (out / "score.json").write_text(json.dumps(score_json(piece, draft, made, changes, score_only), indent=1) + "\n")
    (out / "score.musicxml").write_text(musicxml(piece))
    shutil.rmtree(work)
    return problems


def render_cut(piece: Piece, out: Path, name: str, cut: Cut) -> list[Path]:
    """Mixes a rendered draft's stems again as `cut` and writes cuts/<name>.webm (Opus) and cuts/<name>.m4a (AAC)."""
    out = Path(out)
    gains = lane_gains(piece, cut)
    length = round(piece.duration * RATE)
    paths = [out / "stems" / f"{lane}.wav" for lane in gains]
    present = [p for p in paths if p.is_file()]
    if not present:
        raise RenderError(f"{out} has no stems; run make music-render PIECE={piece.piece_id} first")
    work = out / "work"
    cuts = out / "cuts"
    for d in (work, cuts):
        d.mkdir(parents=True, exist_ok=True)
    folded = mixdown([_stem(p, length, gains[p.stem]) for p in present], length, work)
    _write(folded * level(work / "folded.wav", folded, cut.loudness), work / "master.wav")
    made = [cuts / f"{name}.webm", cuts / f"{name}.m4a"]
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "master.wav"), "-c:a", "libopus", "-b:a", BITRATE,
         "-t", f"{piece.duration:.6f}", str(made[0]))
    _run("ffmpeg", "-v", "error", "-y", "-i", str(work / "master.wav"), "-c:a", "aac", "-b:a", AAC_BITRATE,
         "-t", f"{piece.duration:.6f}", "-movflags", "+faststart", str(made[1]))
    shutil.rmtree(work)
    return made
