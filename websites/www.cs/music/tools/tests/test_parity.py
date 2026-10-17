"""Passphrase normalisation matches the page's unlock.ts byte for byte."""
import codecs
import re
import unittest

from support import SITE
from siue_music.sealing import normalize_passphrase

STRIPPED_PY = " \t\n\r\f\v                 　﻿"


class PassphraseParityTest(unittest.TestCase):
    def test_the_stripped_set_is_the_one_in_unlock_ts(self):
        src = (SITE / "games" / "workroom" / "src" / "unlock.ts").read_text()
        literal = re.search(r"export const STRIPPED = '([^']*)'", src).group(1)
        ts_set = codecs.decode(literal, "unicode_escape")
        self.assertEqual(ts_set, STRIPPED_PY)

    def test_stripping(self):
        cases = {
            "  hello \n": b"hello",
            "﻿　secret　﻿": b"secret",
            "  x ": b"x",
            "\u0085x\u0085": "\u0085x\u0085".encode(),
            "​x​": "​x​".encode(),
            "a b": b"a b",
            "   ": b"",
            "café ": "café".encode(),
        }
        for given, want in cases.items():
            self.assertEqual(normalize_passphrase(given), want, repr(given))

    def test_nfc_happens_before_stripping_and_inside_is_kept(self):
        self.assertEqual(normalize_passphrase(" a b "), "a b".encode())


if __name__ == "__main__":
    unittest.main()
