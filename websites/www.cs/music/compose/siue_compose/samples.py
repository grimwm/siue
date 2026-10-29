"""Sample libraries: each file named in samples.json is fetched once into the cache and kept only when its sha256 matches."""
import hashlib
import os
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

DEFAULT_CACHE = Path(os.environ.get("SIUE_MUSIC_CACHE", Path.home() / ".cache" / "siue-music")) / "samples"


class SampleError(Exception):
    pass


def _download(url: str) -> bytes:
    with urlopen(url, timeout=60) as r:
        return r.read()


def fetch(manifest: dict, cache: Path = DEFAULT_CACHE, get=_download) -> dict[str, Path]:
    """Every instrument's files, verified, under one folder per library commit; instrument id -> that folder."""
    root = Path(cache) / manifest["commit"]
    for inst in manifest["instruments"].values():
        for f in inst["files"]:
            path = root / f["path"]
            if path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == f["sha256"]:
                continue
            url = f"{manifest['source']}/{manifest['commit']}/{quote(f['path'])}"
            data = get(url)
            if hashlib.sha256(data).hexdigest() != f["sha256"]:
                raise SampleError(f"{f['path']}: the download does not match its sha256 in samples.json")
            path.parent.mkdir(parents=True, exist_ok=True)
            part = path.with_name(path.name + ".part")
            part.write_bytes(data)
            part.replace(path)
    return {name: root for name in manifest["instruments"]}
