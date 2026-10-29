"""A piece as one object: lanes, sections, characters, motifs and notes (times in beats). Every export is written from it."""
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Lane:
    id: str
    name: str
    family: str  # one of the workroom's lane families (siue_music.score.FAMILIES)
    color: str
    instrument: str  # an instrument id in samples.json
    gain_db: float = 0.0
    attack: float = 0.05  # seconds; soft by default
    release: float = 1.5


@dataclass(frozen=True)
class Note:
    lane: str
    beat: float
    beats: float
    pitch: int
    velocity: int
    motif: str | None = None


@dataclass(frozen=True)
class Section:
    id: str
    name: str
    color: str
    from_bar: int
    to_bar: int


@dataclass(frozen=True)
class Character:
    id: str
    name: str
    color: str


@dataclass(frozen=True)
class Motif:
    id: str
    character: str


@dataclass
class Piece:
    project_id: str
    project_name: str
    piece_id: str
    title: str
    bpm: float
    beats_per_bar: int
    bars: int
    lanes: list[Lane]
    sections: list[Section]
    characters: list[Character]
    motifs: list[Motif]
    notes: list[Note]
    energy: list[tuple[float, float]]  # (beat, 0..1); the last point is held to the end
    glossary: list[tuple[str, float, float]] = field(default_factory=list)  # (term, from beat, to beat)

    @property
    def beats(self) -> float:
        return self.bars * self.beats_per_bar

    @property
    def seconds_per_beat(self) -> float:
        return 60 / self.bpm

    @property
    def duration(self) -> float:
        return self.beats * self.seconds_per_beat

    def clipped_notes(self) -> list[Note]:
        """The notes that start before the end, in time order, each cut to end by the end and, because MIDI cannot
        tell two notes of one pitch apart, by the start of the next note of its pitch in its lane."""
        out = sorted((n for n in self.notes if n.beat < self.beats), key=lambda n: (n.beat, n.lane, n.pitch))
        cut = []
        for i, n in enumerate(out):
            end = min(n.beat + n.beats, self.beats)
            later = [m.beat for m in out[i + 1:] if m.lane == n.lane and m.pitch == n.pitch and m.beat > n.beat]
            if later:
                end = min(end, later[0])
            cut.append(Note(n.lane, n.beat, end - n.beat, n.pitch, n.velocity, n.motif))
        return cut
