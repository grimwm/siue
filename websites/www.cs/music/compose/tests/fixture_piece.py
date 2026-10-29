"""A two-bar test piece: a held drone and a three-note motif, one note held past the end."""
from siue_compose.piece import Character, Lane, Motif, Note, Piece, Section


def piece(notes=None) -> Piece:
    return Piece(
        project_id="crete", project_name="Crete", piece_id="test-piece", title="Test piece",
        bpm=60, beats_per_bar=4, bars=2,
        lanes=[Lane("lyre", "Lyre", "harp", "#d4a72c", "harp"), Lane("drone", "Drone", "strings", "#4a5a6a", "cello")],
        sections=[Section("one", "One", "#334455", 1, 1), Section("two", "Two", "#445566", 2, 2)],
        characters=[Character("ariadne", "Ariadne", "#d4a72c")],
        motifs=[Motif("ariadne", "ariadne")],
        notes=notes if notes is not None else [
            Note("drone", 0, 8, 38, 50),
            Note("drone", 0, 8, 45, 45),
            Note("lyre", 1, 1, 62, 60, "ariadne"),
            Note("lyre", 2, 1.5, 65, 60, "ariadne"),
            Note("lyre", 4.5, 2, 69, 64, "ariadne"),
            Note("lyre", 7, 3, 74, 50),
        ],
        energy=[(0, 0.2), (4, 0.6)],
        glossary=[("drone", 0, 4), ("motif", 1, 6.5)],
    )
