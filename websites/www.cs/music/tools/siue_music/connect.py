"""What `make music-mcp-setup` prints: the commands that connect an AI app to this checkout's MCP server."""
import json
import shlex
from pathlib import Path

DEFAULT_VAULT = "SIUE"
_DESKTOP_CONFIG = {
    "darwin": "~/Library/Application Support/Claude/claude_desktop_config.json",
    "win32": "%APPDATA%\\Claude\\claude_desktop_config.json",
}


def server_env(base: str, op: str | None, vault: str | None) -> dict[str, str]:
    """The environment the AI app starts the server with: the workroom's address, the 1Password CLI by its full path
    (an app started from the dock does not see the shell's PATH) and the vault when it is not the default."""
    env = {"SIUE_MUSIC_BASE": base}
    if op:
        env["SIUE_OP"] = op
    if vault and vault != DEFAULT_VAULT:
        env["OP_VAULT"] = vault
    return env


def connect_text(python: Path, tool: Path, base: str, op: str | None, vault: str | None, config: Path, platform: str) -> str:
    env = server_env(base, op, vault)
    claude = ["claude", "mcp", "add", "--scope", "user"]
    for name, value in env.items():
        claude += ["--env", f"{name}={value}"]
    claude += ["siue-music", "--", str(python), str(tool), "mcp"]
    desktop = {"mcpServers": {"siue-music": {"command": str(python), "args": [str(tool), "mcp"], "env": env}}}
    desktop_file = _DESKTOP_CONFIG.get(platform, _DESKTOP_CONFIG["darwin"] + " (macOS) or " + _DESKTOP_CONFIG["win32"] + " (Windows)")
    lines = [
        "The music workroom's MCP server is ready. Connect your AI app with one of these.",
        "",
        "Claude Code (run once, in any folder):",
        "",
        "  " + shlex.join(claude),
        "",
        f"Claude Desktop: add this to {desktop_file} (merge it into \"mcpServers\" if the file has one), then restart the app:",
        "",
        *("  " + line for line in json.dumps(desktop, indent=2).splitlines()),
        "",
        "Any other MCP app: start the same command over stdio with the same environment.",
        "",
        f"The server address is SIUE_MUSIC_BASE above: {base}",
        "To move to another server, change it there, or leave SIUE_MUSIC_BASE out and put",
        f"{{\"base\": \"https://.../music/\"}} in {config}.",
    ]
    if not op:
        lines += ["", "The 1Password CLI (op) was not found on this PATH: install it and sign in, then run make music-mcp-setup again."]
    lines += ["", "The AI can list and read drafts, publish and delete published drafts, and wait for, pick up and read notes.",
              "Deleting needs the music-publish key's drafts:delete permission, which publish keys have. It cannot delete notes."]
    return "\n".join(lines) + "\n"
