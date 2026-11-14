# The games in their own repository

**Status: Not started — do when the owner asks; brainstorm first.** This is a later plan, not an implementation
plan: it records the goal, why, the open questions and a rough order of steps. The design and a test-first plan come
from a brainstorm when the work begins.

## Goal

Move the games out of `siue` into a repository of their own, which offers supported ways for other repositories to
pull the games in and deploy them. What moves:

- every game in `websites/www.cs/games/` (`crete`, *The Island of Crete*; `tankity`, *Operation Tankity*; `cylon`,
  *The CIC*), with its sources, tests, build and generated files;
- the shared kit, `websites/www.cs/games/_kit`;
- the play pages, `websites/www.cs/play/` (`play.css`, `play.js` and each game's page);
- the games hub (`websites/www.cs/games/hub.php` and what it draws on).

The consumers it serves from the start:

- **`siue`** (www.cs.siue.edu): the faculty site, which serves the games today.
- **`happy-stl/happystl`** (private): happystl.com's WordPress site. Today it embeds the games from www.cs in iframes,
  and its generated `/play/` pages are made through the WordPress REST API and synced every half hour.

## Why

- The games live on two sites, and the code for both lives in a repository named for one of them.
- happystl.com must not depend on the university server for the long term: today every game it shows is served from
  www.cs.siue.edu.
- Crete's shared Endless bank already runs on happystl.com, at `https://www.happystl.com/crete-bank/`, yet `siue`'s
  `.github/workflows/deploy.yml` deploys it. The bank's deploy belongs with the game, or with the site that hosts it.

## Open questions

1. **How consumers pull the games in.** Versioned release artifacts (a built tarball per tag, which a consumer pins
   and unpacks), a git submodule or subtree, or a package (npm, Composer). Each consumer needs the built files, the
   PHP endpoints and the generated pages, never the dev tooling.
2. **Where the bank's deploy lives.** In the games repository (it owns `bank/` and the trusted runner), or in
   `happystl` (it owns the host). The DreamHost credentials and `CRETE_BANK_VERIFIER_TOKEN` move with whichever.
3. **Where CI for the games runs.** The unit, PHPUnit and browser suites, and Crete's trusted runner
   (`.github/workflows/crete-verify.yml`), move to the games repository; each consumer keeps only a check that its
   pinned games build and load.
4. **Keeping git history.** `git filter-repo` on a fresh clone, keeping `websites/www.cs/games/`,
   `websites/www.cs/play/` and the docs that belong to the games, so blame and log stay useful.
5. **The music workroom.** `websites/www.cs/games/workroom` builds with the games' kit but is not a game: it stays in
   `siue`, which then pulls in the kit as a consumer too, or keeps a copy of the kit's build.
6. **Shared site pieces.** What the games take from the faculty site today (the stats beacon, the kit's PHP that the
   admin hub also uses, `site-game-pages.php`), and whether each moves, is copied, or becomes an interface the
   consumer provides.
7. **How happystl.com serves the games itself.** Its own copy of each game on its own host, in place of the iframes
   pointing at www.cs, and what that means for the half-hourly `/play/` sync.

## Rough steps

1. Brainstorm the design with the owner and settle the open questions; write the spec and a test-first plan.
2. Make the new repository from a `git filter-repo` copy of `siue`, keeping the games' history.
3. Give it its own CI: the unit, PHPUnit and browser suites, and the trusted runner.
4. Build the chosen distribution (release artifacts, submodule or package) and document how a consumer pins it.
5. Switch `siue` to consume the games that way; delete its copy; keep its deploy of www.cs working unchanged for
   players.
6. Switch `happystl` to serve the games from its own host, then its `/play/` pages to point there.
7. Move the bank's deploy to its new home and retire it from `siue`'s `deploy.yml`.
8. Update the READMEs, `AGENTS.md` and the roadmap of every repository involved.
