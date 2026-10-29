"""Samples are fetched once per file into the cache and kept only when their sha256 matches the manifest."""
import hashlib
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
