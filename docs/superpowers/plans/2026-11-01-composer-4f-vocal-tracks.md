# Composer 4f: Vocal Tracks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record a voice over the piece in the editor, keep every take on the device first, save chosen takes to the
studio as Perfect (FLAC) or Good To The Ear (Opus), and hear every Sound and Voice Effect on them on playback.

**Architecture:** A vocal part is a lane whose sound is the reserved instrument `vocal` and whose `vocal` field holds
its takes and clips, in seconds. Takes are recorded as 16-bit mono PCM into IndexedDB. On Save To Studio the page
encodes each new take both ways (its own FLAC encoder; WebCodecs Opus muxed into Ogg, or MediaRecorder Opus), shows
both sizes, and sends the chosen bytes with `score.json` in one SIUED1 bundle. The server parses each take's container
itself (FLAC frames with their CRCs, Ogg pages with their CRCs and Opus packet TOCs, WebM SimpleBlocks), takes the
duration from the frames, stores each take once per account as `vocal-<sha256>.<ext>`, and deletes a take in the same
step as the change that leaves no draft naming it. The renderer decodes takes and plays clips into the lane, then runs
the lane's Voice Effects and Sound panel as for any part.

**Tech Stack:** TypeScript 7, Preact, Web Audio, WebCodecs AudioEncoder, IndexedDB, node:test; PHP 8.4 with PHPUnit;
Python 3 (siue_music) with pytest; Playwright (`make music-e2e`).

**Spec:** `docs/superpowers/specs/2026-10-31-composer-editor-design.md` (Vocal Tracks, Voice Effects, The score,
Phases 4f).

## Global Constraints

- Title Case for buttons, menus, tabs and headings; sentences in sentence case.
- The page never scrolls or jumps while a key or note is held (`scrollpin.ts`).
- Phone (about 400 px) and desktop.
- The raw voice is never altered: effects are score settings applied on playback.
- The microphone is asked for only when Record A Vocal is tapped, and let go on Stop.
- Nothing uploads until Save To Studio; unsaved takes say "Only On This Device" and survive a reload.
- Perfect: FLAC, mono, 16-bit, the context's rate (44.1 or 48 kHz). Good To The Ear: Opus mono 96 kbps, Ogg (WebCodecs)
  or WebM/Ogg (MediaRecorder).
- Limits: 25 MB per non-named account (`Limits`); the shared total `max_shared_mb` defaults to 20480; uploads are
  refused while `disk_free_space` would drop below `min_free_disk_mb` (default 51200); the admin view warns at 80%.
- A take is at most 15 minutes and decodes to at most `max_take_decoded_mb` (default 200) of 16-bit PCM.
- Schema 1 scores load and save unchanged; a vocal lane makes a score schema 2.

## The score

```
lane.sound = { instrument: "vocal", gain_db, attack: 0, release: 0 }   // only on a lane with `vocal`
lane.vocal = {
  takes: [{ file: "vocal-<64 hex>.flac|.ogg|.webm", seconds }],         // 1–32, unique files
  clips: [{ take, at, from, to, gain_db, fade_in, fade_out }]           // 0–64; take names a file in takes
}
```

`at` is the clip's start in the piece (seconds ≥ 0); `from` < `to` ≤ the take's `seconds` are the part of the take
heard; `gain_db` −24 to 12; fades 0 to 10 seconds and together no longer than the clip. A vocal lane holds no notes.
In the page, a take not yet saved is named `local-<uuid>` and is never sent.

## Tasks

1. **FLAC encoder** — `src/compose/flac.ts`: `encodeFlac(pcm: Int16Array, rate): Uint8Array` (STREAMINFO with MD5,
   4096-sample blocks, fixed predictors 0–4 picked per block, Rice partitions, CRC-8/16) and a test-only decoder for the
   same subset. Tests: round trip is bit-exact on silence, a sine, noise and a speech-like signal; smaller than the PCM.
2. **Opus in Ogg** — `src/compose/ogg.ts`: `muxOggOpus(packets, rate, preSkip)`, CRC-32, `opusPacketSamples(toc)`;
   `src/compose/opus.ts`: `encodeOpus(pcm, rate, ports)` through WebCodecs AudioEncoder or MediaRecorder; `null` where
   neither exists. Tests: page CRCs, granule positions, TOC sample counts, the fallback choice.
3. **Schema** — `score.ts` parse, `siue_music/score.py`, `ScoreRules.php`: vocal lanes, references, ranges; the
   instrument `vocal` only with `vocal`, notes refused on a vocal lane, `local-` names refused. Shared vectors file.
4. **Document and edits** — `doc.ts` Part.vocal round trip; `src/compose/vocal.ts`: `addTake`, `addClip`, `moveClip`,
   `trimClip`, `splitClip`, `setClipGain`, `setClipFades`, `pickTake`, `removeClip`, `renameTake`. Tests per edit,
   Undo through `history.ts`.
5. **Renderer** — `engine.ts`: vocal lanes render their clips (fades, gain, trim) from `deps.take(file)`, always on the
   own-lane road so Voice Effects and Sound apply; a vocal lane can be a Vocoder's voice with another part as carrier.
   Tests: a clip lands at `at`, trims and fades, Auto-Tune changes it, Vocoder uses it as the modulator.
6. **On this device** — `src/compose/takes.ts`: IndexedDB store of takes (PCM, rate, seconds, piece, saved file);
   `src/compose/vocalrec.ts`: recording through a ScriptProcessor after a one-bar count-in, with the piece playing,
   latency-corrected. Tests with a fake IDB and fake context.
7. **Save To Studio** — `src/compose/vocalsave.ts`: `sizesFor(take)` (encodes both ways, exact bytes, space and
   minutes left), `bundleFor(doc, choices)` (renames `local-` takes to `vocal-<sha256>.<ext>`, adds their bytes).
   `save.ts` sends them. Studio default quality kept in the studio's settings (Task 9).
8. **The page** — `src/ui/compose/VocalPanel.tsx`: Record A Vocal, takes (Only On This Device / In Your Studio),
   clips with Start, Trim, Split At Playhead, Volume, Fade In, Fade Out, Take; the Save To Studio chooser; Convert To
   Good To The Ear with its warning. Wired into `Composer.tsx` and `mount.ts`.
9. **Server** — `DraftCheck` (bundle of up to 33 files, vocal names), `TakeCheck.php` (FLAC, Ogg Opus, WebM Opus
   parsers), `Store` (takes per account, refcounted deletes in the same transaction, quotas with the shared total and
   the disk floor), `Limits` (25 MB, takes allowed for score-only accounts), `People` (`min_free_disk_mb`,
   `max_take_decoded_mb`, new `max_shared_mb` default), `take.php` (download, own account only), `convert-take.php`,
   studio page space and minutes, admin warning at 80%, the vocal quality setting. PHPUnit, including wrong magic,
   oversize, lying duration headers and another account's take.
10. **Export and the AI** — Export With Vocals (.zip: score.musicxml, vocals.json, the takes as saved);
    `studio_mcp.py` `list_vocal_takes` from drafts' scores. Tests.
11. **E2e** — `tests/e2e/compose.local.ts`: a fake microphone records a take; Only On This Device survives a reload;
    the size chooser shows both sizes; saving each way; quota refusal; Convert. Phone check that holding a key never
    scrolls.

## Review Focus

- A take recorded while the piece plays lines up with it (output and input latency are subtracted).
- A save refused for space keeps every local take and the edits.
- Deleting drafts, a piece, or starting over deletes takes no draft names any more, and never one still named.
- A header that claims a short duration over long audio is refused by the frame count.
- Reloading mid-take keeps what was recorded up to the last stored chunk.
