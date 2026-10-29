"""One Piece gives score.json, MusicXML and per-lane MIDI that agree with each other and with the workroom's validator."""
import unittest

import support
from fixture_piece import piece
from siue_compose.export import midi_files, musicxml, score_json
from siue_music.score import glossary_ids, validate

MADE = "2026-10-28T12:00:00Z"


class ExportTest(unittest.TestCase):
    def test_score_validates(self):
        self.assertEqual(validate(score_json(piece(), 1, MADE), glossary_ids(support.GLOSSARY_JSON)), [])

    def test_seconds_follow_the_tempo(self):
        s = score_json(piece(), 1, MADE)
        self.assertEqual(s["duration"], 8.0)
        self.assertEqual(s["bars"], 2)
        self.assertEqual(s["tempo"], [{"bar": 1, "bpm": 60, "beats": 4, "unit": 4}])
        lyre = [n for n in s["notes"] if n["lane"] == "lyre"]
        self.assertEqual((lyre[1]["start"], lyre[1]["length"], lyre[1]["pitch"]), (2.0, 1.5, 65))
        self.assertEqual(s["energy"][-1], [8.0, 0.6])

    def test_note_past_the_end_is_clipped(self):
        last = [n for n in score_json(piece(), 1, MADE)["notes"] if n["pitch"] == 74][0]
        self.assertEqual((last["start"], last["length"]), (7.0, 1.0))

    def test_motif_spans_cover_its_notes(self):
        m = score_json(piece(), 1, MADE)["motifs"][0]
        self.assertEqual((m["id"], m["character"]), ("ariadne", "ariadne"))
        self.assertEqual(m["spans"], [{"lane": "lyre", "from": 1.0, "to": 6.5}])

    def test_export_is_deterministic(self):
        self.assertEqual(score_json(piece(), 1, MADE), score_json(piece(), 1, MADE))
        self.assertEqual(musicxml(piece()), musicxml(piece()))

    def test_musicxml_round_trips_pitches_and_onsets(self):
        import music21
        parsed = music21.converter.parseData(musicxml(piece()), format="musicxml")
        got = set()
        for part in parsed.parts:
            for n in part.recurse().notes:
                if n.tie is not None and n.tie.type in ("stop", "continue"):
                    continue
                for p in (n.pitches if n.isChord else [n.pitch]):
                    got.add((float(n.getOffsetInHierarchy(parsed)), p.midi))
        want = {(float(n.beat), n.pitch) for n in piece().notes}
        self.assertEqual(got, want)

    def test_midi_has_every_note(self):
        files = midi_files(piece())
        self.assertEqual(sorted(files), ["drone", "lyre"])
        ons = [m for t in files["lyre"].tracks for m in t if m.type == "note_on" and m.velocity > 0]
        self.assertEqual([m.note for m in ons], [62, 65, 69, 74])
        self.assertEqual(files["lyre"].ticks_per_beat, 480)


if __name__ == "__main__":
    unittest.main()
