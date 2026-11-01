# Agents

The starting point for any coding agent working in this repository: Claude Code, Codex, Cursor or any other.

- **What comes next:** [docs/superpowers/roadmap.md](docs/superpowers/roadmap.md), in order, with the spec or plan each step starts from. Designs live in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.
- **Crete levels:** the rules any new or changed level must keep (the difficulty gate, the ramp, the gentler band for hidden walls, teaching first, real quotes) are in [the Crete README's "Rules for new levels"](websites/www.cs/games/crete/README.md#rules-for-new-levels), and `test/difficulty.test.ts` enforces them.
- **Each site and game** has its own README: start from [README.md](README.md).
- **Branches:** the main checkout stays on `main`; work happens on a branch in its own git worktree, run with its own compose project (`COMPOSE="docker compose -p <name> -f compose.yaml" make up` from the site's folder) so it never takes another checkout's containers or ports.
- **Deploy:** merging to `main` deploys www.cs automatically (`.github/workflows/deploy.yml`, main's tip only). Never run `make deploy` by hand, and never retry or poll SSH or sftp to www.cs.siue.edu: repeated logins get the address banned. If a deploy fails, ask before trying again.
- **Words on screen:** buttons, menus, tabs and headings are in Title Case ("New Game"); sentences stay in sentence case. The website never mentions make, this repository or password managers.
- **Docs describe the current state**, not its history.
- **No secrets:** the repository is public.
