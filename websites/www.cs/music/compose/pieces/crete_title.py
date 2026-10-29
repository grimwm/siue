"""Crete: title theme. Ariadne's tune in D Dorian with a Phrygian turn, over the labyrinth's drone; 62 BPM, 56 bars
(about 3.6 minutes) that loop. The tune comes four times and never the same way: on the lyre, in the cellos under a
lyre ostinato, on the organ with the horn answering at the swell's peak (the turn lands on D major), and as a slow,
high fragment as it fades. Draft 1 was the one-minute sketch, now its own piece (crete_title_short.py)."""
from siue_compose.cut import Cut
from siue_compose.piece import Character, Lane, Motif, Note, Piece, Section

from pieces.crete_title_short import BAR, BPM, CHORDS, TUNE, sketch

BARS = 56

LANES = [
    Lane("lyre", "Lyre", "harp", "#d4a72c", "harp", gain_db=6.0, attack=0.02, release=2.5),
    Lane("cellos", "Cellos (tune)", "strings", "#7a8f6a", "cello", gain_db=5.0, attack=0.35, release=2.5),
    Lane("organ-tune", "Organ (tune)", "keys", "#b0a6d6", "organ", gain_db=10.0, attack=0.3, release=3.0),
    Lane("organ", "Organ", "keys", "#8a7fb0", "organ", gain_db=0.0, attack=2.0, release=4.5),
    Lane("horn", "Horn (far)", "brass", "#a0603a", "horn", gain_db=4.0, attack=1.2, release=3.0),
    Lane("drone", "Drone (cellos)", "strings", "#5a6b7a", "cello", gain_db=-12.0, attack=2.0, release=3.5),
    Lane("deep", "Deep drone (bass)", "strings", "#3d4652", "bass", gain_db=3.0, attack=2.5, release=3.5),
]

# The second statement's harmony: one chord a bar (two in bar 7), each as its chord tones from the root up.
B_CHORDS = [
    (0, 4, (50, 53, 57)),  # D minor
    (4, 4, (57, 60, 64)),  # A minor
    (8, 4, (55, 59, 62)),  # G major (the Dorian colour)
    (12, 4, (50, 53, 57)),
    (16, 4, (53, 57, 60)),  # F major
    (20, 4, (48, 52, 55)),  # C major
    (24, 2, (57, 60, 64)),
    (26, 2, (51, 55, 58)),  # E flat: the Phrygian turn
    (28, 4, (50, 53, 57)),
]


def b(n: int) -> float:
    return (n - 1) * BAR


def tune(lane: str, start: float, shift: int = 0, velocity: int = 58) -> list[Note]:
    return [Note(lane, start + t, d, p + shift, velocity + (6 if p >= 74 else 0), "ariadne") for t, d, p in TUNE]


def plucked_chords(start: float) -> list[Note]:
    """The first statement's accompaniment: each chord plucked low and soft, root, fifth, tenth."""
    out = []
    for t, d, (root, fifth, tenth) in CHORDS:
        out += [Note("lyre", start + t, d, root, 40), Note("lyre", start + t + 1, d - 1, fifth, 34)]
        if d >= 4:
            out.append(Note("lyre", start + t + 2, d - 2, tenth, 32))
    return out


def ostinato(start: float, chords, velocity: int = 34, rise: int = 0) -> list[Note]:
    """The lyre picking each chord in eighths an octave above its root (root, fifth, octave, tenth, back down), above
    the tune; `rise` adds to the velocity across the span, a crescendo."""
    out = []
    span = max(t + d for t, d, _ in chords)
    for t, d, (root, third, fifth) in chords:
        pattern = [root, fifth, root + 12, third + 12, fifth + 12, third + 12, root + 12, fifth]
        for i in range(int(d * 2)):
            at = t + i / 2
            out.append(Note("lyre", start + at, 0.5, pattern[i % 8] + 12, velocity + round(rise * at / span) + (4 if i % 4 == 0 else 0)))
    return out


def drone(beats: float) -> list[Note]:
    """D and A held through the whole piece, re-bowed every four bars; the release and the soft attack crossfade the bows."""
    out = []
    t = 0.0
    while t < beats:
        length = min(BAR * 4, beats - t)
        out += [Note("drone", t, length, 50, 46), Note("drone", t, length, 57, 40), Note("deep", t, length, 38, 50)]
        t += BAR * 4
    return out


def wakes() -> list[Note]:
    return [Note("organ", b(2), 14, 50, 32), Note("organ", b(2) + 2, 12, 57, 28),
            Note("lyre", b(4), 4, 50, 34), Note("lyre", b(5), 4, 45, 32), Note("lyre", b(6), 4, 50, 30)]


def wind() -> list[Note]:
    """Between the first two statements: a soft organ chord, a far horn calling the tune's first notes, and a high lyre echo."""
    return [Note("organ", b(15), 16, 50, 34), Note("organ", b(15), 16, 57, 32), Note("organ", b(15) + 2, 14, 65, 30),
            Note("horn", b(16), 2, 57, 44, "ariadne"), Note("horn", b(16) + 2, 6, 62, 46, "ariadne"),
            Note("lyre", b(17) + 2, 1, 81, 34, "ariadne"), Note("lyre", b(17) + 3, 1, 79, 32, "ariadne"),
            Note("lyre", b(18), 4, 74, 32, "ariadne")]


def deep_statement() -> list[Note]:
    """The second statement: the tune an octave down in the cellos, the lyre's ostinato above it, the organ only at the turn."""
    s = b(19)
    return (tune("cellos", s, -12, 60) + ostinato(s, B_CHORDS)
            + [Note("organ", s + 24, 2, 57, 36), Note("organ", s + 24, 2, 60, 34),
               Note("organ", s + 26, 2, 58, 38), Note("organ", s + 26, 2, 63, 36), Note("organ", s + 28, 6, 62, 32)])


def rises() -> list[Note]:
    """Four bars on D minor: the organ's voices enter one by one, the ostinato grows louder, the horn holds an A."""
    s = b(27)
    return ([Note("organ", s, 16, 50, 44), Note("organ", s + 4, 12, 57, 46), Note("organ", s + 8, 8, 62, 50),
             Note("organ", s + 10, 6, 65, 52), Note("organ", s + 12, 4, 69, 56),
             Note("horn", s + 8, 8, 57, 50)]
            + ostinato(s, [(t, 4, (50, 53, 57)) for t in range(0, 16, 4)], 32, 22))


def awe() -> list[Note]:
    """The third statement and the peak: the organ takes the tune, the lyre doubles it an octave up, the full organ
    changes chord with it, the horn answers, and the turn lands on D major."""
    s = b(31)
    pads = []
    for t, d, chord in CHORDS[:-1]:
        pads += [Note("organ", s + t, d, p, 58) for p in (chord[0] + 12, chord[1] + 12, chord[2] + 12)]
    pads += [Note("organ", s + 28, 12, p, 64) for p in (50, 57, 62, 66, 69)]  # D major, held into the release
    pads.append(Note("organ", s, 28, 38, 54))  # the pedal under it all
    horn = [Note("horn", s, 8, 62, 52), Note("horn", s + 8, 4, 60, 52), Note("horn", s + 12, 4, 57, 52),
            Note("horn", s + 16, 8, 62, 58), Note("horn", s + 24, 2, 60, 56), Note("horn", s + 26, 2, 63, 58),
            Note("horn", s + 28, 8, 66, 60)]
    return tune("organ-tune", s, 0, 66) + tune("lyre", s, 12, 40) + pads + horn


def after() -> list[Note]:
    """As the organ fades: the tune's first phrase, slow and high on the lyre, and the horn's last call far away."""
    s = b(41)
    return ([Note("lyre", s, 4, 81, 36, "ariadne"), Note("lyre", s + 4, 2, 86, 34, "ariadne"),
             Note("lyre", s + 6, 2, 84, 32, "ariadne"), Note("lyre", s + 8, 6, 81, 32, "ariadne"),
             Note("lyre", s + 14, 2, 79, 30, "ariadne")]
            + [Note("organ", s, 16, p, 34) for p in (50, 57, 65)]
            + [Note("horn", b(42), 4, 57, 36), Note("horn", b(43), 8, 62, 34)])


def breathes() -> list[Note]:
    """The labyrinth alone: the drone, one soft organ breath and two low lyre notes, quiet enough to loop to the start."""
    return [Note("organ", b(47), 20, 50, 30), Note("organ", b(47) + 2, 18, 57, 28),
            Note("lyre", b(49), 6, 50, 30), Note("lyre", b(53), 6, 45, 28)]


def full() -> Piece:
    beats = BARS * BAR
    notes = (drone(beats) + wakes() + tune("lyre", b(7)) + plucked_chords(b(7)) + wind() + deep_statement()
             + rises() + awe() + after() + breathes())
    return Piece(
        project_id="crete", project_name="Crete", piece_id="crete-title", title="Crete: title theme",
        bpm=BPM, beats_per_bar=BAR, bars=BARS,
        lanes=LANES,
        sections=[
            Section("wakes", "The island wakes", "#2d4a5a", 1, 6),
            Section("tune", "Ariadne's tune", "#8a6d1f", 7, 14),
            Section("wind", "Sea wind", "#35505a", 15, 18),
            Section("deep", "The tune in the deep", "#4f5d3f", 19, 26),
            Section("rises", "The labyrinth rises", "#4a3f6a", 27, 30),
            Section("awe", "Awe", "#7a5a9a", 31, 38),
            Section("after", "After the light", "#4d4566", 39, 44),
            Section("breathes", "The labyrinth breathes", "#3a3550", 45, 56),
        ],
        characters=[Character("ariadne", "Ariadne", "#d4a72c")],
        motifs=[Motif("ariadne", "ariadne")],
        notes=notes,
        energy=[(0, 0.12), (b(7), 0.3), (b(15), 0.25), (b(19), 0.4), (b(27), 0.5), (b(31), 0.75), (b(35), 0.95),
                (b(39), 0.6), (b(45), 0.25), (b(52), 0.12)],
        glossary=[("drone", 0, 10), ("motif", b(7), b(7) + 14), ("orchestration", b(19), b(19) + 12),
                  ("ostinato", b(21), b(21) + 12), ("crescendo", b(27), b(27) + 14), ("swell", b(28), b(28) + 14),
                  ("theme", b(31), b(31) + 14), ("phrygian", b(37), b(38)), ("cadence", b(37), b(39) + 4),
                  ("pedal-point", b(45), b(45) + 12)],
    )


CHANGES = {
    2: [
        {"from_bar": 1, "to_bar": 56, "lane": None, "answers": [],
         "text": "The full theme: about 3½ minutes, the tune four times and never the same way twice. "
                 "Draft 1 lives on as its own piece, Crete: title theme (short)."},
        {"from_bar": 15, "to_bar": 18, "lane": "horn", "answers": [],
         "text": "Between the first two statements a far horn calls the tune's first notes."},
        {"from_bar": 19, "to_bar": 26, "lane": "cellos", "answers": [],
         "text": "The tune moves down into the cellos, with the lyre picking an ostinato above it."},
        {"from_bar": 31, "to_bar": 38, "lane": "organ-tune", "answers": [],
         "text": "The peak: the organ takes the tune, the horn answers, and the turn lands on a D major chord."},
    ],
    3: [
        {"from_bar": 1, "to_bar": 56, "lane": None, "answers": [],
         "text": "Same music as draft 2; the sheet music now shows."},
    ],
    4: [
        {"from_bar": 1, "to_bar": 56, "lane": None, "answers": [],
         "text": "Built in your browser from the score; it should sound the same as draft 3."},
    ],
}

# The game's story pages: the lyre and the drones as they are, the organ held well back, the horn and the cellos' tune
# a little; quieter than the title card.
CUTS = {
    "story": Cut({"organ": -15.0, "organ-tune": -12.0, "horn": -6.0, "cellos": -3.0}, loudness=-24.0),
}

# Drafts sent as their score alone: the workroom builds their sound from the shared sample library.
SCORE_ONLY = {4}


def compose(draft: int) -> Piece:
    return sketch("crete-title", "Crete: title theme") if draft == 1 else full()
