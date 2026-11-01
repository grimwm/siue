#!/usr/bin/env python3
"""Writes gm-band.mid, a General MIDI file for the importer's tests, byte by byte with no MIDI library (so it is not
made by the workroom's own writer). Format 1 at 96 ticks to the quarter, 100 BPM in 3/4:
- track 0: the title, the tempo and the time signature;
- "Piano" on channel 1 (program 1): C4 E4 G4 as a quarter-note chord, then D4 for a half, ended by note-offs;
- "Bass" on channel 2 (program 33): C2 for a whole 3/4 bar and G1 for a dotted quarter, in running status with
  note-on velocity 0 as the note-off, and one pitch-wheel move;
- "Drums" on channel 10: kick on beats 1 and 3, snare on 2, closed hi-hat in eighths for the first two beats.
Run it from this folder: python3 make-gm-band.py"""
import struct

TPQ = 96


def vlq(n: int) -> bytes:
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append(0x80 | (n & 0x7F))
        n >>= 7
    return bytes(reversed(out))


def track(events: list[tuple[int, bytes]]) -> bytes:
    """events: (absolute tick, raw bytes), in order."""
    body, now = b"", 0
    for tick, raw in events:
        body += vlq(tick - now) + raw
        now = tick
    body += vlq(0) + b"\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(body)) + body


def name(text: str) -> bytes:
    return b"\xff\x03" + vlq(len(text)) + text.encode()


def notes(ch: int, spec: list[tuple[int, int, int, int]]) -> list[tuple[int, bytes]]:
    """spec: (start tick, length ticks, pitch, velocity) with note-on / note-off (0x80)."""
    ev = []
    for start, length, pitch, vel in spec:
        ev.append((start, 1, bytes([0x90 | ch, pitch, vel])))
        ev.append((start + length, 0, bytes([0x80 | ch, pitch, 64])))
    return [(t, raw) for t, _, raw in sorted(ev, key=lambda e: (e[0], e[1]))]


conductor = track([(0, name("GM Band")), (0, b"\xff\x51\x03" + (600000).to_bytes(3, "big")), (0, b"\xff\x58\x04\x03\x02\x18\x08")])
piano = track([(0, name("Piano")), (0, b"\xc0\x00")] + notes(0, [(0, 96, 60, 90), (0, 96, 64, 80), (0, 96, 67, 70), (96, 192, 62, 100)]))
# Bass in running status: one 0x91 status byte, then pairs; velocity 0 ends a note.
bass = track([
    (0, name("Bass")), (0, b"\xc1\x20"),
    (0, b"\x91\x24\x64"),           # C2 on
    (100, b"\xe1\x00\x50"),         # a pitch-wheel move (its own status)
    (288, b"\x91\x24\x00"),         # C2 off (velocity 0), status given again after the bend
    (288, b"\x1f\x5a"),             # G1 on, running status
    (432, b"\x1f\x00"),             # G1 off, running status
])
drums = track([(0, name("Drums"))] + notes(9, [(0, 24, 36, 110), (192, 24, 36, 110), (96, 24, 38, 100)] + [(t, 24, 42, 70) for t in (0, 48, 96, 144)]))
header = b"MThd" + struct.pack(">IHHH", 6, 1, 4, TPQ)
with open("gm-band.mid", "wb") as f:
    f.write(header + conductor + piano + bass + drums)
