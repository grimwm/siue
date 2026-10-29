"""The tool's virtualenv installs only locked, hashed packages: each requirements*.txt that ensure-venv installs is the
compiled lock of its .in file, every package in it is pinned with ==, and every pin carries sha256 hashes."""
import re
import unittest

from support import TOOLS

LOCKS = {"requirements.txt": "requirements.in", "requirements-mcp.txt": "requirements-mcp.in"}


def pins(path):
    """name -> (version, hash count) for each requirement in a pip-compile style lock (continuation lines joined)."""
    text = re.sub(r"\\\n\s*", " ", path.read_text())
    out = {}
    for line in text.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line:
            continue
        m = re.match(r"([A-Za-z0-9_.\-\[\]]+)==([^\s;]+)", line)
        if m is None:
            raise AssertionError(f"{path.name}: not an exact pin: {line}")
        out[m.group(1).lower().split("[")[0]] = (m.group(2), len(re.findall(r"--hash=sha256:[0-9a-f]{64}", line)))
    return out


class LocksTest(unittest.TestCase):
    def test_every_package_is_pinned_with_hashes(self):
        for lock in LOCKS:
            found = pins(TOOLS / lock)
            self.assertTrue(found, lock)
            for name, (_version, hashes) in found.items():
                self.assertGreater(hashes, 0, f"{lock}: {name} has no hash")

    def test_each_lock_has_its_input_file_and_its_top_level_packages(self):
        for lock, source in LOCKS.items():
            self.assertTrue((TOOLS / source).is_file(), source)
            self.assertIn(source, (TOOLS / lock).read_text(), f"{lock} names the file it was compiled from")
        self.assertIn("cryptography", pins(TOOLS / "requirements.txt"))
        mcp = pins(TOOLS / "requirements-mcp.txt")
        self.assertEqual(mcp["mcp"][0], "2.3.0")
        self.assertEqual(mcp["cryptography"], pins(TOOLS / "requirements.txt")["cryptography"], "the same cryptography in both")

    def test_ensure_venv_requires_hashes(self):
        self.assertIn("--require-hashes", (TOOLS / "ensure-venv").read_text())


if __name__ == "__main__":
    unittest.main()
