"""Tests for scripts/deploy-hash. Run: python3 -I scripts/test_deploy_hash.py"""
import os
import subprocess
import sys
import tempfile
import unittest

TOOL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "deploy-hash")


def run(*args):
    return subprocess.run([sys.executable, "-I", TOOL, *args], capture_output=True, text=True)


def digest(*args):
    r = run(*args)
    assert r.returncode == 0, r.stderr
    return r.stdout.strip()


class DeployHashTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = self.tmp.name
        self.tree = os.path.join(self.root, "tree")
        os.makedirs(os.path.join(self.tree, "games", "x"))
        self.write("index.html", "<h1>hi</h1>")
        self.write("games/x/a.js", "1")
        self.recipe = os.path.join(self.root, "deploy.sh")
        with open(self.recipe, "w") as f:
            f.write("echo deploy\n")

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, rel, text, mode=0o644):
        path = os.path.join(self.tree, rel)
        with open(path, "w") as f:
            f.write(text)
        os.chmod(path, mode)

    def test_prints_sha256_hex(self):
        h = digest(self.tree)
        self.assertRegex(h, r"^[0-9a-f]{64}$")

    def test_stable_for_same_content(self):
        self.assertEqual(digest(self.tree), digest(self.tree))

    def test_content_change_changes_hash(self):
        before = digest(self.tree)
        self.write("games/x/a.js", "2")
        self.assertNotEqual(before, digest(self.tree))

    def test_rename_changes_hash(self):
        before = digest(self.tree)
        os.rename(os.path.join(self.tree, "games/x/a.js"), os.path.join(self.tree, "games/x/b.js"))
        self.assertNotEqual(before, digest(self.tree))

    def test_mode_change_changes_hash(self):
        before = digest(self.tree)
        os.chmod(os.path.join(self.tree, "index.html"), 0o666)
        self.assertNotEqual(before, digest(self.tree))

    def test_new_file_changes_hash(self):
        before = digest(self.tree)
        self.write("new.css", "")
        self.assertNotEqual(before, digest(self.tree))

    def test_mtime_does_not_matter(self):
        before = digest(self.tree)
        os.utime(os.path.join(self.tree, "index.html"), (0, 0))
        self.assertEqual(before, digest(self.tree))

    def test_same_content_elsewhere_hashes_equal(self):
        other = os.path.join(self.root, "copy")
        subprocess.run(["cp", "-Rp", self.tree, other], check=True)
        self.assertEqual(digest(self.tree), digest(other))

    def test_extra_file_counts(self):
        before = digest(self.tree, "--extra", self.recipe)
        self.assertNotEqual(digest(self.tree), before)
        with open(self.recipe, "a") as f:
            f.write("echo changed\n")
        self.assertNotEqual(before, digest(self.tree, "--extra", self.recipe))

    def test_extra_file_location_does_not_matter(self):
        os.makedirs(os.path.join(self.root, "elsewhere"))
        moved = os.path.join(self.root, "elsewhere", "deploy.sh")
        subprocess.run(["cp", "-p", self.recipe, moved], check=True)
        self.assertEqual(digest(self.tree, "--extra", self.recipe),
                         digest(self.tree, "--extra", moved))

    def test_symlink_is_refused(self):
        os.symlink("index.html", os.path.join(self.tree, "link.html"))
        r = run(self.tree)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("symlink", r.stderr)

    def test_missing_tree_fails(self):
        r = run(os.path.join(self.root, "nope"))
        self.assertNotEqual(r.returncode, 0)

    def test_manifest_lists_files(self):
        r = run(self.tree, "--manifest")
        self.assertEqual(r.returncode, 0, r.stderr)
        lines = r.stdout.splitlines()
        self.assertEqual([l.split(" ", 2)[2] for l in lines], ["games/x/a.js", "index.html"])


if __name__ == "__main__":
    unittest.main()
