"""A cut of a draft: its stems mixed again with some lanes louder or quieter, mastered to its own loudness. A piece names
its cuts in its module's CUTS; `full`, every lane as composed, is every piece's."""
from dataclasses import dataclass, field

from .piece import Piece

LOUDNESS = -20.0  # LUFS, the drafts' own


class RenderError(Exception):
    pass


@dataclass(frozen=True)
class Cut:
    gains: dict[str, float] = field(default_factory=dict)  # dB added to a lane's own gain, by lane id
    loudness: float = LOUDNESS


FULL = Cut()


def cut_named(cuts: dict[str, Cut], name: str) -> Cut:
    if name == "full":
        return FULL
    if name not in cuts:
        raise RenderError(f"no cut {name!r}; the piece has: {', '.join(['full', *sorted(cuts)])}")
    return cuts[name]


def lane_gains(piece: Piece, cut: Cut) -> dict[str, float]:
    """Each lane's linear gain in this cut: its own gain_db plus the cut's change."""
    ids = {lane.id for lane in piece.lanes}
    unknown = sorted(set(cut.gains) - ids)
    if unknown:
        raise RenderError(f"the cut names lanes {piece.piece_id} does not have: {', '.join(unknown)}")
    return {lane.id: 10 ** ((lane.gain_db + cut.gains.get(lane.id, 0.0)) / 20) for lane in piece.lanes}
