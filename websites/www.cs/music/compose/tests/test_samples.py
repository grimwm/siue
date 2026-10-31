"""Samples are fetched once per file into the cache and kept only when their sha256 matches the manifest."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

import support  # noqa: F401
from siue_compose.samples import SampleError, fetch

GOOD = b"RIFF fake wave"


def manifest(data=GOOD):
    return {"source": "https://example.test/lib", "commit": "abc",
            "instruments": {"harp": {"files": [{"path": "Strings/Harp/a.wav", "sha256": hashlib.sha256(data).hexdigest(), "pitch": 57}]}}}


class FetchTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.cache = Path(tmp.name)
        self.urls = []

    def get(self, body):
        def get(url):
            self.urls.append(url)
            return body
        return get

    def test_fetches_and_verifies(self):
        folders = fetch(manifest(), self.cache, self.get(GOOD))
        self.assertEqual((folders["harp"] / "Strings/Harp/a.wav").read_bytes(), GOOD)
        self.assertEqual(self.urls, ["https://example.test/lib/abc/Strings/Harp/a.wav"])

    def test_cached_file_is_not_fetched_again(self):
        fetch(manifest(), self.cache, self.get(GOOD))
        fetch(manifest(), self.cache, self.get(GOOD))
        self.assertEqual(len(self.urls), 1)

    def test_bad_checksum_is_refused_and_removed(self):
        with self.assertRaises(SampleError):
            fetch(manifest(), self.cache, self.get(b"truncated"))
        self.assertEqual([p for p in self.cache.rglob("*") if p.is_file()], [])


if __name__ == "__main__":
    unittest.main()


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = """violin|Violin|strings|55-100|55-105|67|treble|0|41|Violin
viola|Viola|strings|48-88|48-93|60|alto|0|42|Viola
cello|Cello|strings|36-84|36-93|48|bass|0|43|Cello
bass|Double Bass|strings|28-67|24-72|36|bass|12|44|Contrabass
harp|Harp|strings|23-104|23-104|60|grand|0|47|Orchestral Harp
flute|Flute|woodwinds|60-96|59-101|72|treble|0|74|Flute
piccolo|Piccolo|woodwinds|74-105|74-108|84|treble|-12|73|Piccolo
oboe|Oboe|woodwinds|58-91|58-93|69|treble|0|69|Oboe
clarinet|Clarinet|woodwinds|50-91|50-94|62|treble|0|72|Clarinet
bassoon|Bassoon|woodwinds|34-76|34-81|48|bass|0|71|Bassoon
trumpet|Trumpet|brass|52-82|52-86|65|treble|0|57|Trumpet
horn|French Horn|brass|35-77|29-81|53|treble|0|61|French Horn
trombone|Trombone|brass|40-72|34-77|50|bass|0|58|Trombone
tuba|Tuba|brass|26-65|22-67|38|bass|0|59|Tuba
piano|Piano|keys|21-108|21-108|60|grand|0|1|Acoustic Grand Piano
organ|Organ|keys|24-96|12-96|60|grand|0|20|Church Organ
celesta|Celesta|keys|60-108|60-108|72|treble|-12|9|Celesta|glock
timpani|Timpani|pitched|38-57|36-60|45|bass|0|48|Timpani
glock|Glockenspiel|pitched|79-108|79-108|84|treble|-24|10|Glockenspiel
xylo|Xylophone|pitched|65-108|60-108|79|treble|-12|14|Xylophone
marimba|Marimba|pitched|36-96|36-96|60|grand|0|13|Marimba
vibes|Vibraphone|pitched|53-89|53-89|65|treble|0|12|Vibraphone|marimba
bells|Tubular Bells|pitched|60-77|60-79|67|treble|0|15|Tubular Bells
kit|Drum Kit|drums|-|-|-|percussion|0|1|Standard Kit
orch|Orchestral Percussion|drums|-|-|-|percussion|0|49|Orchestra Kit
choir|Choir (Aahs / Oohs)|voices|40-81|36-84|57|grand|0|53|Choir Aahs|organ"""
PIECES = {"kit": [[36, "Kick"], [38, "Snare"], [42, "Closed Hi-Hat"], [46, "Open Hi-Hat"], [45, "Low Tom"], [50, "High Tom"], [49, "Crash"],
                  [51, "Ride"]],
          "orch": [[35, "Bass Drum"], [57, "Cymbals"], [81, "Triangle"], [54, "Tambourine"]]}
# VSCO-2 CE itself has gaps of more than 4 semitones between these instruments' recorded roots.
SPARSE = {"flute", "piccolo", "oboe", "clarinet", "bassoon", "horn", "trombone", "tuba", "glock", "xylo", "marimba", "bells"}


class ManifestTest(unittest.TestCase):
    def setUp(self):
        self.instruments = json.loads((ROOT / "samples.json").read_text())["instruments"]

    def test_manifest_catalogue(self):
        span = lambda s: None if s == "-" else [int(x) for x in s.split("-")]
        rows = [line.split("|") for line in CATALOGUE.splitlines()]
        self.assertEqual(list(self.instruments), [r[0] for r in rows])
        for i, name, cat, rng, exp, home, clef, written, gm, gm_name, *standin in rows:
            e = self.instruments[i]
            want = {"name": name, "category": cat, "range": span(rng), "expert": span(exp), "home": None if home == "-" else int(home),
                    "clef": clef, "written": int(written), "gm": int(gm), "gm_name": gm_name, "pieces": PIECES.get(i)}
            self.assertEqual({k: e[k] for k in want}, want, i)
            self.assertEqual(e.get("standin"), standin[0] if standin else None, i)
            if standin:
                self.assertTrue(e["standin_note"], i)
                self.assertNotIn("files", e, i)

    def test_samples_lie_in_range(self):
        for i, e in self.instruments.items():
            if "standin" in e or e.get("pitched") is False:
                continue
            roots = sorted(f["pitch"] for f in e["files"])
            lo, hi = e["expert"]
            self.assertGreaterEqual(roots[0], lo - 3, i)
            self.assertLessEqual(roots[-1], hi + 3, i)
            if i not in SPARSE:
                self.assertLessEqual(max(b - a for a, b in zip(roots, roots[1:])), 4, i)

    def test_drum_pieces_have_one_file_each(self):
        for i in ("kit", "orch"):
            e = self.instruments[i]
            self.assertIs(e["pitched"], False)
            self.assertEqual(sorted(f["pitch"] for f in e["files"]), sorted(p for p, _ in e["pieces"]), i)

    def test_published_instruments_unchanged(self):
        published = json.loads((ROOT / "tests" / "fixtures" / "published-instruments.json").read_text())
        for i, want in published.items():
            self.assertEqual({k: self.instruments[i][k] for k in want}, want, i)
            self.assertEqual("loop" in self.instruments[i], "loop" in want, i)
