"""An SFZ instrument per lane: each sample covers the keys nearest its root, with the lane's soft attack and long release."""
import wave
from pathlib import Path

from .piece import Lane


def regions(files: list[dict]) -> list[tuple[int, int, dict]]:
    """(lokey, hikey, file) per sample, split halfway between neighbouring roots and reaching 0 and 127."""
    ordered = sorted(files, key=lambda f: f["pitch"])
    out = []
    for i, f in enumerate(ordered):
        lo = 0 if i == 0 else (ordered[i - 1]["pitch"] + f["pitch"]) // 2 + 1
        hi = 127 if i == len(ordered) - 1 else (f["pitch"] + ordered[i + 1]["pitch"]) // 2
        out.append((lo, hi, f))
    return out


def _loop(path: Path, loop: list[float]) -> str:
    """Opcodes that repeat the sustained stretch (seconds, from samples.json) with a crossfade, so a note may outlast its sample."""
    with wave.open(str(path)) as w:
        rate = w.getframerate()
    return f" loop_mode=loop_continuous loop_start={round(loop[0] * rate)} loop_end={round(loop[1] * rate)} loop_crossfade=1.0"


def write_sfz(lane: Lane, instrument: dict, samples: Path, folder: Path) -> Path:
    """The lane's instrument (an entry of samples.json's instruments) as an SFZ file whose sample paths are under `samples`."""
    lines = [f"<global> ampeg_attack={lane.attack} ampeg_release={lane.release} amp_veltrack=80"]
    for lo, hi, f in regions(instrument["files"]):
        path = Path(samples) / f["path"]
        loop = _loop(path, instrument["loop"]) if "loop" in instrument else " loop_mode=no_loop"
        lines.append(f'<region> sample={path} lokey={lo} hikey={hi} pitch_keycenter={f["pitch"]}{loop}')
    path = Path(folder) / f"{lane.id}.sfz"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n")
    return path
