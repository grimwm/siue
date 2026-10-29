"""score.json, score.musicxml and per-lane MIDI, all written from one Piece so they cannot disagree."""
import re

import mido

from .cut import LOUDNESS  # the mix's target in score.json, and what render.py normalises the audio to
from .piece import Piece

TICKS = 480
SPECTRUM = {"file": "spectrogram.png", "low_hz": 20, "high_hz": 12000, "scale": "log"}
MOTIF_GAP_BEATS = 4  # a gap this long between a motif's notes starts a new span


def _s(piece: Piece, beats: float) -> float:
    return round(beats * piece.seconds_per_beat, 6)


def _motif_spans(piece: Piece, motif: str) -> list[dict]:
    spans = []
    for lane in piece.lanes:
        notes = [n for n in piece.clipped_notes() if n.motif == motif and n.lane == lane.id]
        current = None
        for n in notes:
            if current and n.beat - current[1] < MOTIF_GAP_BEATS:
                current[1] = max(current[1], n.beat + n.beats)
            else:
                current = [n.beat, n.beat + n.beats]
                spans.append((lane.id, current))
    return [{"lane": lane, "from": _s(piece, a), "to": _s(piece, b)} for lane, (a, b) in sorted(spans, key=lambda s: s[1][0])]


def score_json(piece: Piece, draft: int, made: str, changes: list[dict] | None = None, score_only: bool = False) -> dict:
    """The draft's score.json. A score-only draft lists no audio and no spectrogram: the workroom builds both from its sound and mix."""
    duration = round(piece.duration, 6)
    energy = [[_s(piece, b), v] for b, v in piece.energy if b < piece.beats]
    energy.append([duration, piece.energy[-1][1]])
    score = {
        "schema": 1,
        "kind": "music",
        "project": {"id": piece.project_id, "name": piece.project_name},
        "piece": {"id": piece.piece_id, "title": piece.title},
        "draft": draft,
        "made": made,
        "duration": duration,
        "bars": piece.bars,
        "tempo": [{"bar": 1, "bpm": piece.bpm, "beats": piece.beats_per_bar, "unit": 4}],
        "sections": [{"id": s.id, "name": s.name, "color": s.color, "from_bar": s.from_bar, "to_bar": s.to_bar} for s in piece.sections],
        "lanes": [{"id": l.id, "name": l.name, "family": l.family, "icon": l.family, "color": l.color,
                   "sound": {"instrument": l.instrument, "gain_db": l.gain_db, "attack": l.attack, "release": l.release}} for l in piece.lanes],
        "characters": [{"id": c.id, "name": c.name, "color": c.color} for c in piece.characters],
        "motifs": [{"id": m.id, "character": m.character, "spans": _motif_spans(piece, m.id)} for m in piece.motifs],
        "notes": [{"lane": n.lane, "start": _s(piece, n.beat), "length": _s(piece, n.beats), "pitch": n.pitch,
                   "velocity": n.velocity, "motif": n.motif} for n in piece.clipped_notes()],
        "energy": energy,
        "glossary": [{"term": t, "from": _s(piece, a), "to": _s(piece, b)} for t, a, b in piece.glossary],
        "mix": {"style": "lofi", "loudness": LOUDNESS},
        "audio": [{"file": "audio.webm", "type": "audio/webm; codecs=opus"}],
        "spectrogram": dict(SPECTRUM),
        "musicxml": "score.musicxml",
        "changes": changes or [],
    }
    if score_only:
        score["audio"] = []
        del score["spectrogram"]
    return score


def musicxml(piece: Piece) -> str:
    import music21

    score = music21.stream.Score()
    score.metadata = music21.metadata.Metadata(title=piece.title)
    for lane in piece.lanes:
        raw = music21.stream.Part()
        for n in piece.clipped_notes():
            if n.lane == lane.id:
                raw.insert(n.beat, music21.note.Note(n.pitch, quarterLength=n.beats))
        part = raw.chordify() if raw.notes else raw
        part.partName = lane.name
        part.insert(0, music21.meter.TimeSignature(f"{piece.beats_per_bar}/4"))
        if lane is piece.lanes[0]:
            part.insert(0, music21.tempo.MetronomeMark(number=piece.bpm))
        part.makeRests(fillGaps=True, refStreamOrTimeRange=(0, piece.beats), inPlace=True)
        score.insert(0, part.makeNotation())
    exporter = music21.musicxml.m21ToXml.GeneralObjectExporter(score)
    # The encoding date would change the file on every render, and music21 names the parts itself; each part
    # (in lane order) takes its lane's id, which the workroom's Sheet music view looks a lane up by.
    xml = re.sub(r"\s*<encoding-date>[^<]*</encoding-date>", "", exporter.parse().decode("utf-8"))
    names = re.findall(r'<score-part id="([^"]+)"', xml)
    if len(names) != len(piece.lanes):
        raise ValueError(f"the MusicXML has {len(names)} parts for {len(piece.lanes)} lanes")
    lane_of = dict(zip(names, (l.id for l in piece.lanes)))
    return re.sub(r'(<(?:score-part|part) id=")([^"]+)"', lambda m: f'{m.group(1)}{lane_of.get(m.group(2), m.group(2))}"', xml)


def midi_files(piece: Piece) -> dict[str, mido.MidiFile]:
    out = {}
    tempo = mido.bpm2tempo(piece.bpm)
    for lane in piece.lanes:
        events = []
        for n in piece.clipped_notes():
            if n.lane == lane.id:
                events.append((round(n.beat * TICKS), 1, mido.Message("note_on", note=n.pitch, velocity=n.velocity)))
                events.append((round((n.beat + n.beats) * TICKS), 0, mido.Message("note_off", note=n.pitch, velocity=0)))
        track = mido.MidiTrack([mido.MetaMessage("set_tempo", tempo=tempo, time=0)])
        now = 0
        for tick, _, msg in sorted(events, key=lambda e: (e[0], e[1])):
            track.append(msg.copy(time=tick - now))
            now = tick
        track.append(mido.MetaMessage("end_of_track", time=round(piece.beats * TICKS) - now))
        f = mido.MidiFile(ticks_per_beat=TICKS)
        f.tracks.append(track)
        out[lane.id] = f
    return out
