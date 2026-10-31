"""The published wheel: built twice it is the same bytes; its SHA-256 is the one music/dist/release.json names (a change to
the tool or the glossary without a new version fails here, before the deploy refuses it); it holds the package, the
glossary and the metadata with the console script, and nothing of the tests, the repository or a key."""
import contextlib
import hashlib
import importlib.machinery
import importlib.util
import io
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from support import TOOLS

SITE = TOOLS.parents[1]
_loader = importlib.machinery.SourceFileLoader("build_wheel", str(TOOLS / "build-wheel"))
build_wheel = importlib.util.module_from_spec(importlib.util.spec_from_loader("build_wheel", _loader))
_loader.exec_module(build_wheel)


class WheelTest(unittest.TestCase):
    def setUp(self):
        self.version = build_wheel.version()
        self.data = build_wheel.build(self.version)

    def test_two_builds_are_the_same_bytes(self):
        self.assertEqual(build_wheel.build(self.version), self.data)

    def test_release_json_names_this_wheel(self):
        release = json.loads((SITE / "music" / "dist" / "release.json").read_text())
        self.assertEqual(release, {"version": self.version, "file": f"siue_music-{self.version}-py3-none-any.whl",
                                   "sha256": hashlib.sha256(self.data).hexdigest()},
                         "the tool or the glossary changed: raise __version__ in siue_music/__init__.py, run "
                         "music/tools/build-wheel --record, and commit music/dist/release.json")

    def test_it_holds_the_package_the_glossary_and_the_metadata(self):
        z = zipfile.ZipFile(io.BytesIO(self.data))
        names = z.namelist()
        info = f"siue_music-{self.version}.dist-info"
        self.assertEqual(names[-1], f"{info}/RECORD")
        self.assertIn("siue_music/studio_mcp.py", names)
        self.assertIn("siue_music/data/glossary.json", names)
        self.assertFalse([n for n in names if not (n.startswith("siue_music/") or n.startswith(info + "/"))])
        self.assertFalse([n for n in names if "__pycache__" in n or "/tests/" in n or n.endswith(".pyc")])
        meta = z.read(f"{info}/METADATA").decode()
        self.assertIn(f"Version: {self.version}\n", meta)
        self.assertIn("Requires-Dist: mcp==2.3.0\n", meta)
        self.assertIn("Requires-Python: >=3.10\n", meta)
        self.assertEqual(z.read(f"{info}/entry_points.txt"), b"[console_scripts]\nsiue-music = siue_music.cli:entry\n")
        self.assertIn(b"Tag: py3-none-any", z.read(f"{info}/WHEEL"))
        self.assertTrue(all(i.compress_type == zipfile.ZIP_STORED and i.date_time == (1980, 1, 1, 0, 0, 0) for i in z.infolist()))
        self.assertEqual(z.read("siue_music/data/glossary.json"), (SITE / "games" / "workroom" / "src" / "glossary.json").read_bytes())
        pyproject = (TOOLS / "pyproject.toml").read_text()
        for req in build_wheel.REQUIRES:
            self.assertIn(f'"{req}"', pyproject, "build-wheel and pyproject.toml name the same dependencies")

    def test_the_command_writes_the_wheel_where_it_is_told(self):
        with tempfile.TemporaryDirectory() as d:
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(build_wheel.main(["--out", d]), 0)
            self.assertEqual((Path(d) / f"siue_music-{self.version}-py3-none-any.whl").read_bytes(), self.data)
