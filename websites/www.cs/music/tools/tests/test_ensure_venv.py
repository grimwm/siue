"""music/tools/ensure-venv: builds the virtualenv when it is missing or broken and leaves a working one alone."""
import os
import stat
import subprocess
import tempfile
import unittest
from pathlib import Path

from support import TOOLS

SCRIPT = TOOLS / "ensure-venv"
FAKE_BASE = """#!/bin/sh
echo "base $*" >> "$LOG"
[ "$1" = "-m" ] && [ "$2" = "venv" ] || exit 2
mkdir -p "$3/bin"
printf '#!/bin/sh\\necho "venv-python $*" >> "$LOG"\\n[ -z "$BROKEN" ] || exit 1\\ncase "$*" in *"import $MISSING"*) [ -z "$MISSING" ] ;; esac\\n' > "$3/bin/python"
printf '#!/bin/sh\\necho "pip $*" >> "$LOG"\\n' > "$3/bin/pip"
chmod +x "$3/bin/python" "$3/bin/pip"
"""


class EnsureVenvTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = Path(tmp.name)
        self.log = self.dir / "log"
        self.base = self.dir / "base-python"
        self.base.write_text(FAKE_BASE)
        self.base.chmod(self.base.stat().st_mode | stat.S_IXUSR)
        self.venv = self.dir / "venv"
        (self.dir / "requirements.txt").write_text("cryptography\n")

    def ensure(self, *module, **env):
        return subprocess.run([str(SCRIPT), str(self.venv), str(self.dir / "requirements.txt"), *module], capture_output=True, text=True,
                              env={**os.environ, "LOG": str(self.log), "SIUE_MUSIC_PYTHON": str(self.base), **env})

    def lines(self):
        return self.log.read_text().splitlines() if self.log.exists() else []

    def test_a_missing_venv_is_built_and_filled(self):
        self.assertEqual(self.ensure().returncode, 0)
        self.assertTrue(any(line.startswith("base -m venv") for line in self.lines()))
        self.assertTrue(any(line.startswith("pip install --quiet --require-hashes -r") for line in self.lines()))

    def test_a_working_venv_is_left_alone(self):
        self.ensure()
        self.log.unlink()
        self.assertEqual(self.ensure().returncode, 0)
        self.assertEqual([line for line in self.lines() if not line.startswith("venv-python")], [])

    def test_a_venv_that_cannot_import_cryptography_is_built_again(self):
        self.ensure()
        self.log.unlink()
        # the rebuilt python works again, so BROKEN applies only to the first check
        (self.venv / "bin" / "python").write_text('#!/bin/sh\necho "venv-python $*" >> "$LOG"\nexit 1\n')
        self.assertEqual(self.ensure().returncode, 0)
        self.assertTrue(any(line.startswith("base -m venv") for line in self.lines()))
        self.assertTrue(any(line.startswith("pip install") for line in self.lines()))

    def test_a_working_venv_without_the_named_module_is_filled_not_rebuilt(self):
        self.ensure()
        self.log.unlink()
        self.assertEqual(self.ensure("mcp", MISSING="mcp").returncode, 0)
        self.assertFalse(any(line.startswith("base -m venv") for line in self.lines()))
        self.assertTrue(any(line.startswith("pip install --quiet --require-hashes -r") for line in self.lines()))

    def test_a_working_venv_that_has_the_named_module_is_left_alone(self):
        self.ensure()
        self.log.unlink()
        self.assertEqual(self.ensure("mcp").returncode, 0)
        self.assertEqual([line for line in self.lines() if not line.startswith("venv-python")], [])


if __name__ == "__main__":
    unittest.main()
