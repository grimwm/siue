"""The studio MCP server (siue-music mcp): a person's AI app starts it on their computer over stdio, with the studio's
address and an AI key. Built on the official MCP Python SDK. Every tool works only in the studio of that AI key and only
as far as its permissions reach (the server enforces both from the key); no tool deletes a note."""
import sys
import threading
from pathlib import Path
from typing import Any, Mapping

from mcp.server.mcpserver import Context, MCPServer
from mcp.server.mcpserver.exceptions import ToolError

from .studio import Studio, StudioError

INSTRUCTIONS = """siue-music: the person's private SIUE music studio. The person listens to drafts of their pieces in the studio's
web page and sends notes (typed text, spoken notes, hums, reactions, drawn energy curves); you make the drafts.
A draft is one score.json (schema 1): the page builds its sound, sheet music and sound picture from it.

First call studio_status. When it says "Not paired yet", tell the person the pairing code it gives and where to type it.
When the person asks for their siue-music pairing code, call studio_status and give them the code.

A usual loop: wait_for_notes, then read_new_notes; read what the person said (and listen to any recording it saved);
read_score the draft the note is about; list_instruments for the instruments a lane may use; publish_draft the next version (draft number one higher); then
mark_notes_picked_up with the ids you acted on. delete_draft and delete_piece remove drafts when the person asks.
You cannot delete notes: the person does that in the studio. Notes sent before this AI was paired cannot be opened here."""


def _answer(call):
    try:
        return call()
    except StudioError as e:
        raise ToolError(str(e)) from None


def build(studio: Studio) -> MCPServer:
    server = MCPServer("siue-music", title="SIUE music studio", instructions=INSTRUCTIONS)

    @server.tool(structured_output=True)
    def studio_status() -> dict[str, Any]:
        """Whether this AI is connected to the person's studio: the studio's address, the AI key's label and permissions,
        the pairing code and whether the person has paired it, and the next step to tell the person."""
        return _answer(studio.status)

    @server.tool(structured_output=True)
    def list_pieces() -> dict[str, Any]:
        """The pieces in the studio with their project, kind and published draft versions (newest first)."""
        return _answer(studio.list_pieces)

    @server.tool(structured_output=True)
    def read_score(piece: str, version: int | None = None) -> dict[str, Any]:
        """One draft's score.json (the newest draft of the piece when no version is given), and its page in the studio."""
        return _answer(lambda: studio.read_score(piece, version))

    @server.tool(structured_output=True)
    def list_instruments() -> dict[str, Any]:
        """The instruments a lane's sound.instrument may name, in the studio's picker order, with each one's name, category,
        normal range and expert range (inclusive MIDI pitches), clef, written transposition and General MIDI program. Choose
        lane instruments from this list. A drum instrument (pieces set) has no high or low notes: use only its pieces'
        pitches, one per drum. Notes outside expert are allowed but no person can play them. `written` is the semitones
        between how the part sounds and how it is notated (Double Bass is written an octave up); scores hold sounding pitch.
        A standin_note says another instrument's samples play for now; name the real instrument anyway."""
        return _answer(studio.list_instruments)

    @server.tool(structured_output=True)
    def publish_draft(score: dict[str, Any]) -> dict[str, Any]:
        """Publishes a score.json (schema 1) as draft score.draft of piece score.piece.id. It is checked first as the page
        checks it (every lane needs a sound whose instrument list_instruments gives, and a mix); a published version is never
        replaced, so publish the next number. The draft appears in the studio at once; the answer gives its page."""
        return _answer(lambda: studio.publish_draft(score))

    @server.tool(structured_output=True)
    def delete_draft(piece: str, version: int) -> dict[str, Any]:
        """Deletes one draft (piece and version, both required) from the studio. Only when the person asks for it."""
        return _answer(lambda: studio.delete_draft(piece, version))

    @server.tool(structured_output=True)
    def delete_piece(piece: str) -> dict[str, Any]:
        """Deletes a piece: every draft of it. Only when the person asks for it."""
        return _answer(lambda: studio.delete_piece(piece))

    @server.tool(structured_output=True)
    def read_new_notes(limit: int = 20) -> dict[str, Any]:
        """The person's waiting notes, downloaded and opened on this computer with its own sealing key, and saved in the
        notes folder: each note's kind (text, speech, hum, react, energy), piece and draft, the span (from/to seconds,
        fromBar/toBar), lane, text, reaction, energy curve, a speech note's transcript, and the paths of its files (the
        recording, transcript.txt, a hum's motif.mid). Nothing is marked picked up: call mark_notes_picked_up after."""
        return _answer(lambda: studio.read_new_notes(limit))

    @server.tool(structured_output=True)
    def mark_notes_picked_up(note_ids: list[str]) -> dict[str, Any]:
        """Marks notes picked up (the ids read_new_notes gave), so the studio shows them as answered and they stop waiting."""
        return _answer(lambda: studio.mark_picked_up(note_ids))

    @server.tool(structured_output=True)
    async def wait_for_notes(timeout_seconds: float, ctx: Context, poll_seconds: float | None = None) -> dict[str, Any]:
        """Waits for the person's next note: asks the studio every poll_seconds (default 10; never under 2) and answers as
        soon as a note waits that this computer has not opened yet, or after timeout_seconds (at most 3600) with timed_out
        true. It only lists them: call read_new_notes to open them. Pass a timeout shorter than your app's limit for one call."""
        async def progress(waited: float, total: float) -> None:
            await ctx.report_progress(waited, total, "No new notes yet")

        try:
            return await studio.wait_for_notes(timeout_seconds, poll_seconds, on_poll=progress)
        except StudioError as e:
            raise ToolError(str(e)) from None

    return server


def run(env: Mapping[str, str]) -> int:
    sys.stdout.reconfigure(write_through=True)  # stdout is the protocol; see mcp_server.run
    studio = Studio(env, Path.home())
    try:
        print(f"siue-music: this computer's pairing code is {studio.pairing_code()}", file=sys.stderr)
    except StudioError as e:
        print(f"siue-music: {e}", file=sys.stderr)
    threading.Thread(target=studio.register_quietly, daemon=True).start()
    build(studio).run("stdio")
    return 0
