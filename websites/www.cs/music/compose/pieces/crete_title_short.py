"""Crete: title theme (short). Ariadne's tune on a lyre (harp) in D Dorian with a Phrygian turn, over the
labyrinth's drone, with a slow organ swell; 62 BPM. A one-minute version: the tune once, one swell, then the drone
alone, returning to the start. It was the title theme's first draft; the full theme (crete_title.py) shares its
tune, chords and instruments."""
from siue_compose.piece import Character, Lane, Motif, Note, Piece, Section

BPM = 62
BAR = 4

LANES = [
    Lane("lyre", "Lyre", "harp", "#d4a72c", "harp", gain_db=6.0, attack=0.02, release=2.5),
    Lane("organ", "Organ", "keys", "#8a7fb0", "organ", gain_db=0.0, attack=3.0, release=4.5),
    Lane("drone", "Drone (cellos)", "strings", "#5a6b7a", "cello", gain_db=-12.0, attack=2.0, release=3.5),
    Lane("deep", "Deep drone (bass)", "strings", "#3d4652", "bass", gain_db=3.0, attack=2.5, release=3.5),
]

# Ariadne's tune: eight bars, (beat in the tune, beats, pitch). The bar 11 turn through E flat is the Phrygian colour.
TUNE = [
    (0, 2, 69), (2, 1, 74), (3, 1, 72),
    (4, 3, 69), (7, 1, 67),
    (8, 1.5, 65), (9.5, 0.5, 67), (10, 1, 69), (11, 1, 64),
    (12, 4, 62),
    (16, 2, 69), (18, 1, 74), (19, 1, 76),
    (20, 2, 77), (22, 1, 76), (23, 1, 74),
    (24, 1, 72), (25, 1, 69), (26, 1, 67), (27, 1, 63),
    (28, 4, 62),
]

# The lyre's own accompaniment under the tune: one chord a bar (or two), plucked low and soft, root-fifth-tenth.
CHORDS = [
    (0, 4, (38, 45, 53)),  # D minor
    (4, 4, (36, 43, 52)),  # C
    (8, 4, (41, 48, 57)),  # F
    (12, 4, (38, 45, 53)),  # D minor
    (16, 4, (38, 45, 53)),
    (20, 4, (41, 48, 57)),
    (24, 2, (36, 43, 52)),
    (26, 2, (39, 46, 55)),  # E flat: the Phrygian turn
    (28, 4, (38, 45, 50)),
]


def _bar(n: int) -> float:
    return (n - 1) * BAR


def _tune(start: float) -> list[Note]:
    return [Note("lyre", start + b, d, p, 58 + (6 if p >= 74 else 0), "ariadne") for b, d, p in TUNE]


def _accompaniment(start: float) -> list[Note]:
    out = []
    for b, d, (root, fifth, tenth) in CHORDS:
        out += [Note("lyre", start + b, d, root, 40), Note("lyre", start + b + 1, d - 1, fifth, 34)]
        if d >= 4:
            out.append(Note("lyre", start + b + 2, d - 2, tenth, 32))
    return out


def _drone(beats: float) -> list[Note]:
    """D and A held through the whole piece, re-bowed every four bars; the release and the soft attack crossfade the bows."""
    out = []
    t = 0.0
    while t < beats:
        length = min(BAR * 4 + 2, beats - t)
        out += [Note("drone", t, length, 50, 46), Note("drone", t, length, 57, 40), Note("deep", t, length, 38, 50)]
        t += BAR * 4
    return out


def _organ() -> list[Note]:
    """A breath at the start, then one swell under the second half of the tune: voices enter one by one,
    pass through the E flat chord with the tune, peak on D minor in bar 12 and fall away by bar 14."""
    s = _bar(9)
    return [
        Note("organ", 4, 12, 50, 34), Note("organ", 6, 10, 57, 30),
        Note("organ", s, 24, 50, 46),
        Note("organ", s, 10, 57, 42), Note("organ", s + 10, 2, 58, 46), Note("organ", s + 12, 12, 57, 52),
        Note("organ", s + 4, 20, 62, 48),
        Note("organ", s + 6, 4, 65, 48), Note("organ", s + 10, 2, 63, 52), Note("organ", s + 10, 2, 55, 46),
        Note("organ", s + 12, 10, 65, 60), Note("organ", s + 12, 10, 69, 62),
        Note("organ", s + 14, 6, 74, 56),
    ]


def _echo() -> list[Note]:
    """In the quiet end, a fragment of the tune, lower and slower, leading back to the start."""
    s = _bar(14)
    return [Note("lyre", s, 2, 69, 44, "ariadne"), Note("lyre", s + 2, 2, 67, 40, "ariadne"),
            Note("lyre", s + 4, 6, 62, 38, "ariadne")]


def sketch(piece_id: str, title: str) -> Piece:
    """The one-minute version under the given id and title (the title theme's draft 1 is this same music)."""
    bars = 16
    beats = bars * BAR
    notes = _drone(beats) + _organ() + _tune(_bar(5)) + _accompaniment(_bar(5)) + _echo()
    notes += [Note("lyre", _bar(3), 4, 50, 34), Note("lyre", _bar(4), 4, 45, 32)]
    return Piece(
        project_id="crete", project_name="Crete", piece_id=piece_id, title=title,
        bpm=BPM, beats_per_bar=BAR, bars=bars,
        lanes=LANES,
        sections=[
            Section("wakes", "The island wakes", "#2d4a5a", 1, 4),
            Section("tune", "Ariadne's tune", "#8a6d1f", 5, 12),
            Section("breathes", "The labyrinth breathes", "#3a3550", 13, 16),
        ],
        characters=[Character("ariadne", "Ariadne", "#d4a72c")],
        motifs=[Motif("ariadne", "ariadne")],
        notes=notes,
        energy=[(0, 0.15), (_bar(5), 0.3), (_bar(9), 0.45), (_bar(12), 0.8), (_bar(14), 0.55), (_bar(15), 0.25), (_bar(16), 0.15)],
        glossary=[("drone", 0, 10), ("motif", _bar(5), _bar(5) + 15), ("swell", _bar(9), _bar(9) + 15),
                  ("phrygian", _bar(11), _bar(13))],
    )


CHANGES = {
    2: [
        {"from_bar": 1, "to_bar": 16, "lane": None, "answers": [],
         "text": "Same music as draft 1; the sheet music now shows."},
    ],
}


def compose(draft: int) -> Piece:
    return sketch("crete-title-short", "Crete: title theme (short)")
