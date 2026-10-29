"""The shared sample library: every sample in samples.json as a lossless FLAC, plus library.json, for the browser renderer."""
import json
import shutil
import subprocess
import sys
from pathlib import Path

from .samples import DEFAULT_CACHE, fetch

MANIFEST = Path(__file__).resolve().parent.parent / "samples.json"
LIBRARY = Path(__file__).resolve().parents[2] / "library"


def _probe(path: Path) -> tuple[int, int]:
    """(sample rate, channels) of an audio file."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate,channels",
                        "-of", "json", str(path)], check=True, capture_output=True, text=True)
    s = json.loads(r.stdout)["streams"][0]
    return int(s["sample_rate"]), int(s["channels"])


def _encode(src: Path, dest: Path) -> None:
    """Lossless: the rate and sample depth stay as sampled."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-map_metadata", "-1", "-c:a", "flac", "-compression_level", "12", str(dest)],
                   check=True)


def build(manifest: dict, samples: Path, out: Path) -> dict:
    """Write each sample under `out` as <instrument>/<pitch>.flac and library.json beside them; returns that index."""
    out = Path(out)
    instruments = {}
    for name, inst in manifest["instruments"].items():
        files = []
        for f in sorted(inst["files"], key=lambda f: f["pitch"]):
            rel = f"{name}/{f['pitch']}.flac"
            _encode(Path(samples) / f["path"], out / rel)
            rate, channels = _probe(out / rel)
            files.append({"pitch": f["pitch"], "file": rel, "rate": rate, "channels": channels})
        instruments[name] = {"files": files}
        if "loop" in inst:
            instruments[name]["loop"] = inst["loop"]
    index = {"version": 1, **{k: manifest[k] for k in ("source", "commit", "licence", "credit")}, "instruments": instruments}
    (out / "library.json").write_text(json.dumps(index, indent=1) + "\n")
    return index


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    root = fetch(manifest, DEFAULT_CACHE)[next(iter(manifest["instruments"]))]
    for old in LIBRARY.glob("*/"):
        shutil.rmtree(old)
    index = build(manifest, root, LIBRARY)
    print(f"{sum(len(i['files']) for i in index['instruments'].values())} samples in {LIBRARY}", file=sys.stderr)


if __name__ == "__main__":
    main()
