"""The anti-goals as checks: no tune statement repeated verbatim, no sharp transients, no bright highs."""
import unittest

import numpy as np

import support  # noqa: F401
from fixture_piece import piece
from siue_compose.checks import repetition, sharpness_of
from siue_compose.piece import Note

RATE = 48000


def tone(seconds=2.0, amp=0.3, attack=0.05):
    t = np.arange(int(seconds * RATE)) / RATE
    env = np.minimum(t / attack, 1.0)
    return (amp * env * np.sin(2 * np.pi * 220 * t)).astype(np.float32)


def statements(second_shift):
    first = [Note("lyre", 0, 1, 62, 60, "ariadne"), Note("lyre", 1, 1, 65, 60, "ariadne")]
    second = [Note("lyre", 16, 1, 62, 60, "ariadne"), Note("lyre", 17, 1, 65 + second_shift, 60, "ariadne")]
    p = piece(first + second)
    p.bars = 8
    return p


class RepetitionTest(unittest.TestCase):
    def test_identical_statements_fail(self):
        problems = repetition(statements(0), "ariadne")
        self.assertEqual(len(problems), 1)
        self.assertIn("bar 1", problems[0])
        self.assertIn("bar 5", problems[0])

    def test_varied_statements_pass(self):
        self.assertEqual(repetition(statements(2), "ariadne"), [])


class SharpnessTest(unittest.TestCase):
    def test_soft_tone_passes(self):
        self.assertEqual(sharpness_of(tone(), RATE), [])

    def test_click_in_quiet_audio_fails(self):
        quiet = tone(amp=0.01)
        quiet[RATE] = 0.5
        problems = sharpness_of(quiet, RATE)
        self.assertTrue(any("1.0" in p and "transient" in p for p in problems), problems)

    def test_loud_pluck_in_quiet_passage_fails(self):
        audio = tone(seconds=3.0, amp=0.005)
        t = np.arange(int(0.6 * RATE)) / RATE
        audio[2 * RATE: 2 * RATE + len(t)] += (0.5 * np.exp(-t / 0.1) * np.sin(2 * np.pi * 220 * t)).astype(np.float32)
        problems = sharpness_of(audio, RATE)
        self.assertTrue(any("2.0" in p and "transient" in p for p in problems), problems)

    def test_bright_noise_fails(self):
        noise = np.random.default_rng(1).normal(0, 0.1, 2 * RATE).astype(np.float32)
        self.assertTrue(any("8 kHz" in p for p in sharpness_of(noise, RATE)))

    def test_silence_passes(self):
        self.assertEqual(sharpness_of(np.zeros(RATE, dtype=np.float32), RATE), [])


if __name__ == "__main__":
    unittest.main()
