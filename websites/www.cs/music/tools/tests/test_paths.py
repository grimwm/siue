"""Opened notes live outside the repository, in the platform's data folder."""
import tempfile
import unittest
from pathlib import Path

from support import SITE
from siue_music.paths import NotesInsideRepo, api_base, check_outside, config_dir, notes_dir, public_key_ts_path, public_keys_path


class PathsTest(unittest.TestCase):
    def test_platform_folders(self):
        home = Path("/Users/me")
        self.assertEqual(notes_dir("darwin", {}, home), home / "Library" / "Application Support" / "siue-music" / "notes")
        self.assertEqual(notes_dir("linux", {}, Path("/home/me")), Path("/home/me/.local/share/siue-music/notes"))
        self.assertEqual(notes_dir("linux", {"XDG_DATA_HOME": "/data"}, home), Path("/data/siue-music/notes"))
        self.assertEqual(notes_dir("win32", {"APPDATA": "C:/AppData"}, home), Path("C:/AppData/siue-music/notes"))
        self.assertEqual(notes_dir("darwin", {"SIUE_MUSIC_NOTES_DIR": "/elsewhere"}, home), Path("/elsewhere"))

    def test_every_location_comes_from_the_env_it_is_given(self):
        home = Path("/Users/me")
        self.assertEqual(public_keys_path({}), SITE / "music" / "keys" / "public.json")
        self.assertEqual(public_keys_path({"SIUE_MUSIC_PUBLIC_KEYS": "/x/p.json"}), Path("/x/p.json"))
        self.assertEqual(public_key_ts_path({}), SITE / "games" / "workroom" / "src" / "public-key.ts")
        self.assertEqual(public_key_ts_path({"SIUE_MUSIC_PUBLIC_KEY_TS": "/x/k.ts"}), Path("/x/k.ts"))
        self.assertEqual(config_dir({}, home), home / ".config" / "siue")
        self.assertEqual(config_dir({"SIUE_CONFIG_DIR": "/c"}, home), Path("/c"))
        self.assertEqual(api_base({}), "https://www.cs.siue.edu/~wgrim/music/")
        self.assertEqual(api_base({"SIUE_MUSIC_BASE": "http://localhost:5555/music/"}), "http://localhost:5555/music/")

    def test_inside_the_repository_is_refused(self):
        repo = SITE.parents[1]
        with self.assertRaises(NotesInsideRepo):
            check_outside(repo / "notes", repo)
        with tempfile.TemporaryDirectory() as d:
            check_outside(Path(d), repo)

    def test_a_differently_cased_spelling_of_the_repository_is_refused(self):
        repo = SITE.parents[1]
        swapped = Path(str(repo).swapcase())
        if swapped == repo or not swapped.exists():
            self.skipTest("this filesystem is case-sensitive")
        with self.assertRaises(NotesInsideRepo):
            check_outside(swapped / "notes", repo)


if __name__ == "__main__":
    unittest.main()
