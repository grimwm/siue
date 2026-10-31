"""The shared sample library: every sample in samples.json as a lossless FLAC, plus library.json, for the browser renderer."""
import json
import shutil
import subprocess
import sys
from collections.abc import Mapping
from pathlib import Path

from .samples import DEFAULT_CACHE, fetch

MANIFEST = Path(__file__).resolve().parent.parent / "samples.json"
LIBRARY = Path(__file__).resolve().parents[2] / "library"
# The composer's catalogue entry, copied from samples.json into library.json as it is.
CATALOGUE_FIELDS = ("name", "category", "range", "expert", "home", "clef", "written", "gm", "gm_name", "pieces", "standin_note",
                    "icon", "attack", "release")


class LibraryError(Exception):
    pass


def _probe(path: Path) -> tuple[int, int, int]:
    """(sample rate, channels, frames) of an audio file."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-count_packets", "-show_entries",
                        "stream=sample_rate,channels,duration_ts", "-of", "json", str(path)], check=True, capture_output=True, text=True)
    s = json.loads(r.stdout)["streams"][0]
    return int(s["sample_rate"]), int(s["channels"]), int(s["duration_ts"])


def _check_loop(name: str, loop: list[float], probed: list[tuple[int, str, int, int]], past_end: list[int]) -> None:
    """
    The loop must be a forward stretch inside every one of the instrument's samples. `past_end` names the pitches of a published
    instrument whose loop already ran past their end; both renderers stop that loop at the sample's end, and it stays as published.
    """
    if not 0 <= loop[0] < loop[1]:
        raise LibraryError(f"{name}: loop {loop} must start at 0 or later and end after it starts")
    for pitch, rel, rate, frames in probed:
        if loop[0] * rate >= frames:
            raise LibraryError(f"{name}: loop {loop} starts after {rel}, which is {frames / rate:.3f} s long")
        if loop[1] * rate > frames and pitch not in past_end:
            raise LibraryError(f"{name}: loop {loop} ends after {rel}, which is {frames / rate:.3f} s long")


def _encode(src: Path, dest: Path) -> None:
    """Lossless: the rate and sample depth stay as sampled."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-map_metadata", "-1", "-c:a", "flac", "-compression_level", "12", str(dest)],
                   check=True)


def build(manifest: dict, samples: Path | Mapping[str, Path], out: Path) -> dict:
    """
    Write each sample under `out` as <instrument>/<pitch>.flac and library.json beside them; returns that index. `samples` is
    the folder the manifest's paths are under, or one folder per instrument (as fetch gives them).
    """
    out = Path(out)
    root = (lambda name: Path(samples[name])) if isinstance(samples, Mapping) else (lambda _name: Path(samples))
    instruments = {}
    sampled = {name: inst for name, inst in manifest["instruments"].items() if "standin" not in inst}
    for name, inst in manifest["instruments"].items():
        target = inst.get("standin")
        if target is not None and target not in sampled:
            raise LibraryError(f"{name}: its stand-in {target} must be a sampled instrument, not a stand-in or missing")
    for name, inst in sampled.items():
        files, probed = [], []
        for f in sorted(inst["files"], key=lambda f: f["pitch"]):
            rel = f"{name}/{f['pitch']}.flac"
            _encode(root(name) / f["path"], out / rel)
            rate, channels, frames = _probe(out / rel)
            files.append({"pitch": f["pitch"], "file": rel, "rate": rate, "channels": channels})
            probed.append((f["pitch"], rel, rate, frames))
        instruments[name] = {"files": files}
        if "loop" in inst:
            _check_loop(name, inst["loop"], probed, inst.get("loop_past_end", []))
            instruments[name]["loop"] = inst["loop"]
    for name, inst in manifest["instruments"].items():
        if "standin" in inst:
            target = instruments[inst["standin"]]
            # standin_shift moves the borrowed roots, so a sample plays that many semitones away from where it sounds in its own instrument.
            shift = inst.get("standin_shift", 0)
            instruments[name] = {"files": [{**f, "pitch": f["pitch"] + shift} for f in target["files"]],
                                 **({"loop": target["loop"]} if "loop" in target else {})}
            instruments[name]["standin"] = inst["standin"]
        if "from" in inst:
            instruments[name]["from"] = inst["from"]
        if inst.get("pitched") is False:
            instruments[name]["pitched"] = False
        instruments[name].update({k: inst[k] for k in CATALOGUE_FIELDS if k in inst})
    instruments = {name: instruments[name] for name in manifest["instruments"]}
    index = {"version": 1, **{k: manifest[k] for k in ("source", "commit", "licence", "credit")}, "instruments": instruments}
    if manifest.get("sources"):
        # Each further library an instrument's `from` names, with its own licence and credit.
        index["sources"] = manifest["sources"]
    (out / "library.json").write_text(json.dumps(index, indent=1) + "\n")
    return index


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    roots = fetch(manifest, DEFAULT_CACHE)
    for old in LIBRARY.glob("*/"):
        shutil.rmtree(old)
    index = build(manifest, roots, LIBRARY)
    files = {f["file"] for i in index["instruments"].values() for f in i["files"]}
    print(f"{len(files)} samples for {len(index['instruments'])} instruments in {LIBRARY}", file=sys.stderr)


if __name__ == "__main__":
    main()
