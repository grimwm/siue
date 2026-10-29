"""The music workroom's MCP server (siue-music mcp): the Workroom's tools over stdio, for an AI app on the owner's computer.
Built on the official MCP Python SDK (requirements-mcp.in, locked with hashes in requirements-mcp.txt)."""
import sys
from pathlib import Path
from typing import Any, Mapping

from mcp.server.mcpserver import Context, MCPServer
from mcp.server.mcpserver.exceptions import ToolError

from .api import ApiError
from .keys import KeyMismatch, KeysError, NotUploaded
from .op import OpError
from .paths import BadConfig, NotesInsideRepo
from .workroom import Workroom, WorkroomError

INSTRUCTIONS = """The SIUE music workroom: the owner listens to drafts of game music in the workroom page and leaves notes
(typed text, spoken notes, hums, reactions, drawn energy curves). These tools run on the owner's computer with the
owner's keys. Drafts live in the repository's music/pieces/<piece>/v<n>/ folders; a draft needs score.json,
score.musicxml (music only), audio.webm or audio.m4a, and spectrogram.png before it can be published.
A usual loop: wait_for_notes, then pick_up_notes, read what the owner said, make the next draft in music/pieces, then
publish_draft. delete_draft removes one published draft from the server (never the local files); it needs the
music-publish API key's drafts:delete permission. The AI cannot delete notes: the owner does that on the workroom pages."""

_REFUSALS = (WorkroomError, KeysError, KeyMismatch, NotUploaded, OpError, ApiError, NotesInsideRepo, BadConfig)


def _answer(call):
    try:
        return call()
    except _REFUSALS as e:
        raise ToolError(str(e)) from None


def build(room: Workroom) -> MCPServer:
    server = MCPServer("siue-music", title="SIUE music workroom", instructions=INSTRUCTIONS)

    @server.tool(structured_output=True)
    def list_pieces() -> dict[str, Any]:
        """The pieces and drafts: the drafts published on the server (newest first) and the local drafts in the
        repository's music/pieces folder with the files each has. Also the server's address."""
        return _answer(room.list_pieces)

    @server.tool(structured_output=True)
    def read_score(piece: str, version: int | None = None) -> dict[str, Any]:
        """A local draft's score.json (the newest draft of the piece when no version is given), its path, and what
        publishing would refuse in it ("problems", empty when it is valid)."""
        return _answer(lambda: room.read_score(piece, version))

    @server.tool(structured_output=True)
    def publish_draft(piece: str, version: int | None = None) -> dict[str, Any]:
        """Publishes a local draft (the newest when no version is given) to the workroom, exactly as make music-publish
        does: the same checks and refusals. A published version cannot be replaced; delete_draft removes one."""
        return _answer(lambda: room.publish_draft(piece, version))

    @server.tool(structured_output=True)
    def delete_draft(piece: str, version: int) -> dict[str, Any]:
        """Deletes one published draft (piece and version, both required) from the workroom, as make music-delete does.
        The local files in music/pieces stay. It needs the music-publish API key's drafts:delete permission; a key
        without it is refused with what to do."""
        return _answer(lambda: room.delete_draft(piece, version))

    @server.tool(structured_output=True)
    def pick_up_notes() -> dict[str, Any]:
        """Downloads the owner's waiting notes, opens them with the private notes key from 1Password, saves them in the
        notes folder outside the repository and only then marks each picked up, exactly as make music-pickup does.
        Answers each note: kind (text, speech, hum, react, energy), piece and draft, the span (from/to seconds,
        fromBar/toBar), lane, text, reaction, energy curve, a speech note's transcript, and the paths of its files
        (the recording, transcript.txt, a hum's motif.mid). A note that cannot be opened stays waiting, with the reason."""
        return _answer(room.pick_up_notes)

    @server.tool(structured_output=True)
    def read_notes(limit: int = 20, piece: str | None = None) -> dict[str, Any]:
        """The notes already picked up onto this computer, newest first, in the same shape pick_up_notes answers.
        piece="general" gives the notes written on the workroom's front page, tied to no piece."""
        return _answer(lambda: room.read_notes(limit, piece))

    @server.tool(structured_output=True)
    async def wait_for_notes(timeout_seconds: float, ctx: Context, poll_seconds: float | None = None) -> dict[str, Any]:
        """Waits for the owner's next notes: asks the server every poll_seconds (default from SIUE_MUSIC_POLL_SECONDS or
        music-config.json, 10; never under 2) and answers as soon as any note is waiting, or after timeout_seconds
        (at most 3600) with timed_out true. It only lists them: call pick_up_notes to read them. Pass a timeout
        shorter than your app's limit for one tool call."""
        async def progress(waited: float, total: float) -> None:
            await ctx.report_progress(waited, total, "No notes waiting yet")  # sent only when the app asked for progress

        try:
            return await room.wait_for_notes(timeout_seconds, poll_seconds, on_poll=progress)
        except _REFUSALS as e:
            raise ToolError(str(e)) from None

    return server


def run(env: Mapping[str, str]) -> int:
    # stdout is the protocol. While serving, the SDK points file descriptor 1 at stderr; writing every print through at
    # once keeps a stray line from waiting in Python's buffer until exit, when 1 is the protocol again.
    sys.stdout.reconfigure(write_through=True)
    build(Workroom(env, Path.home())).run("stdio")
    return 0
