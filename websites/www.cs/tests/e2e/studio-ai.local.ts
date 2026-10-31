// A studio's own AI, connected the way Connect Your AI tells a person to, in a real browser against local docker
// (make music-e2e): a student makes a notes key and an AI key; the siue-music wheel the site serves is downloaded,
// checked against the SHA-256 the page shows and installed into a fresh virtualenv outside the repository; its MCP
// server starts over stdio and gives the pairing code; a wrong code is refused on Your studio and the right one
// pairs; a note typed in the browser reaches the AI, which waits for it, opens it on its own and marks it picked up;
// the AI publishes a draft that the page lists; revoking the key stops the AI with what to do.
import { expect, test } from '@playwright/test';
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { signInAt } from './music-mail.ts';

const SITE = join(import.meta.dirname, '..', '..');
const TOOLS = join(SITE, 'music', 'tools');
const SCORE = JSON.parse(readFileSync(join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft-score', 'score.json'), 'utf8')) as Record<string, unknown>;
const STUDENT = 'student3@siue.edu';
const PASSPHRASE = 'a long passphrase for the AI test';
const NOTE = 'the strings could enter at bar five';
const GUIDE_VIEWS = ['story', 'roll', 'sound', 'sheet', 'energy'] as const;

/** An MCP client over the server's stdin and stdout, one JSON-RPC line each way. */
class Mcp {
  private buffer = '';
  private waiting = new Map<number, (m: Record<string, unknown>) => void>();
  private id = 0;
  readonly stderr: string[] = [];
  readonly stdout: string[] = [];
  private proc: ChildProcessWithoutNullStreams;
  constructor(proc: ChildProcessWithoutNullStreams) {
    this.proc = proc;
    proc.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      this.buffer += chunk;
      for (let at = this.buffer.indexOf('\n'); at >= 0; at = this.buffer.indexOf('\n')) {
        const line = this.buffer.slice(0, at);
        this.buffer = this.buffer.slice(at + 1);
        this.stdout.push(line);
        const m = JSON.parse(line) as Record<string, unknown>;
        if (typeof m['id'] === 'number') this.waiting.get(m['id'])?.(m);
      }
    });
    proc.stderr.setEncoding('utf8').on('data', (chunk: string) => { this.stderr.push(chunk); });
  }
  request(method: string, params?: unknown, ms = 90_000): Promise<Record<string, unknown>> {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`no answer to ${method}; stderr: ${this.stderr.join('').slice(-2000)}`)), ms);
      this.waiting.set(id, m => { clearTimeout(timer); if (m['error']) reject(new Error(JSON.stringify(m['error']))); else resolve(m['result'] as Record<string, unknown>); });
      this.proc.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, ...(params === undefined ? {} : { params }) })}\n`);
    });
  }
  async initialize(): Promise<Record<string, unknown>> {
    const r = await this.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'studio-ai e2e', version: '1' } });
    this.proc.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
    return r;
  }
  /** A tool's structured answer, or { refused: its words }. */
  async call(name: string, args: Record<string, unknown> = {}, ms?: number): Promise<Record<string, unknown>> {
    const r = await this.request('tools/call', { name, arguments: args }, ms);
    if (r['isError']) return { refused: (r['content'] as { text: string }[])[0]!.text };
    return r['structuredContent'] as Record<string, unknown>;
  }
  close(): void { this.proc.stdin.end(); this.proc.kill(); }
}

test.describe.configure({ mode: 'serial' });

test("a student's own AI connects through the published wheel, pairs, and reads a note sent in the browser", async ({ browser, request, baseURL }) => {
  test.setTimeout(480_000);
  const base = baseURL!;
  const work = mkdtempSync(join(tmpdir(), 'studio-ai-'));
  const context = await browser.newContext();
  await context.addInitScript((views: readonly string[]) => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } }, GUIDE_VIEWS);
  let mcp: Mcp | null = null;
  try {
    const page = await context.newPage();
    await signInAt(page, base, 'music', STUDENT);
    const makeKey = page.locator('[data-make-key]');
    await makeKey.getByLabel('Passphrase', { exact: true }).fill(PASSPHRASE);
    await makeKey.getByLabel('The same passphrase again').fill(PASSPHRASE);
    await makeKey.getByRole('button', { name: 'Make my notes key' }).click();
    await expect(makeKey).toHaveCount(0, { timeout: 60_000 });

    // The front page's Connect Your AI: four steps, and the wheel and its SHA-256.
    const connect = page.locator('[data-connect-ai]');
    await expect(connect.locator('h3')).toHaveText(['Install uv', 'Make An AI Key', 'Add siue-music To Your AI App', 'Type The Pairing Code']);
    const release = JSON.parse(readFileSync(join(SITE, 'music', 'dist', 'release.json'), 'utf8')) as { file: string; sha256: string };
    await expect(connect.locator('[data-connect-app="Claude Code"] code')).toContainText(`uvx --from http://localhost/music/dist/${release.file} siue-music mcp`);
    await expect(connect).toContainText(`SHA-256 ${release.sha256}`);

    // Your studio: an AI key that reads notes and publishes drafts. The new-key panel has the commands with the key in them.
    await page.goto(`${base}music/studio.php`);
    await page.getByLabel('Label').fill('my own AI');
    for (const words of ['read notes', 'publish drafts']) await page.getByLabel(words).check();
    await page.getByRole('button', { name: 'Make key' }).click();
    const key = (await page.locator('code.secret').textContent())!.trim();
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    await expect(page.locator('.connect-commands')).toContainText(`SIUE_MUSIC_AI_KEY=${key} -- uvx --from http://localhost/music/dist/${release.file} siue-music mcp`);

    // The wheel as the site serves it, checked against the SHA-256 the page showed, installed into a fresh virtualenv.
    const served = await request.get(`${base}music/dist/${release.file}`);
    expect(served.status()).toBe(200);
    const wheel = Buffer.from(await served.body());
    expect(createHash('sha256').update(wheel).digest('hex')).toBe(release.sha256);
    writeFileSync(join(work, release.file), wheel);
    const python = process.env.MUSIC_PY_BASE ?? 'python3';
    const sh = (cmd: string, args: string[]): void => {
      const r = spawnSync(cmd, args, { cwd: work, encoding: 'utf8', timeout: 300_000 });
      if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}: ${r.stderr || r.error}`);
    };
    sh(python, ['-m', 'venv', join(work, 'venv')]);
    sh(join(work, 'venv', 'bin', 'pip'), ['install', '--quiet', '--require-hashes', '-r', join(TOOLS, 'requirements-mcp.txt')]);
    sh(join(work, 'venv', 'bin', 'pip'), ['install', '--quiet', '--no-deps', join(work, release.file)]);

    // The AI app starts it, from a folder outside the repository, with only the studio's address and the key.
    const env: Record<string, string> = { PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: work, SIUE_MUSIC_BASE: `${base}music/`, SIUE_MUSIC_AI_KEY: key,
      SIUE_MUSIC_CONFIG_DIR: join(work, 'config'), SIUE_MUSIC_NOTES_DIR: join(work, 'notes'), SIUE_MUSIC_POLL_SECONDS: '2' };
    mcp = new Mcp(spawn(join(work, 'venv', 'bin', 'siue-music'), ['mcp'], { cwd: work, env }));
    const init = await mcp.initialize();
    expect((init['serverInfo'] as { name: string }).name).toBe('siue-music');
    const before = await mcp.call('studio_status');
    expect(before['connected']).toBe(true);
    expect(before['paired']).toBe(false);
    const code = before['pairing_code'] as string;
    expect(code).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    expect(String((await mcp.call('read_new_notes'))['refused'])).toContain(code);

    // Your studio: a wrong code is refused and pairs nothing; the right one pairs.
    await page.goto(`${base}music/studio.php`);
    const row = page.locator('.studio-keys li', { hasText: 'my own AI' });
    const form = row.locator('[data-pair-form]');
    await form.getByLabel('Pairing Code').fill('AAAA-AAAA-AAAA');
    await form.getByLabel('Passphrase').fill(PASSPHRASE);
    await form.getByRole('button', { name: 'Pair' }).click();
    await expect(form.getByRole('alert')).toHaveText("That is not this key's pairing code. Check the code your AI shows and try again.");
    expect((await mcp.call('studio_status'))['paired']).toBe(false);
    await form.getByLabel('Pairing Code').fill(code.toLowerCase());
    await form.getByLabel('Passphrase').fill(PASSPHRASE);
    await form.getByRole('button', { name: 'Pair' }).click();
    await expect(page).toHaveURL(/studio\.php\?paired=1$/, { timeout: 60_000 });
    await expect(row.locator('[data-pairing="paired"]')).toBeVisible();
    expect((await mcp.call('studio_status'))['paired']).toBe(true);

    // A note typed in the browser (unlocked again: the keyring changed) reaches the AI while it waits.
    await page.goto(`${base}music/`);
    const unlock = page.locator('[data-unlock]');
    await unlock.getByLabel('Passphrase').fill(PASSPHRASE);
    await unlock.getByRole('button', { name: 'Unlock notes' }).click();
    const waited = mcp.call('wait_for_notes', { timeout_seconds: 120, poll_seconds: 2 }, 150_000);
    await page.getByLabel('A general note, on no piece in particular').fill(NOTE);
    await page.getByRole('button', { name: 'Send note' }).click();
    await expect(page.locator('[data-general-status]')).toHaveText('Sent. It is waiting for pickup.');
    const arrived = await waited;
    expect(arrived['timed_out']).toBe(false);
    const read = await mcp.call('read_new_notes');
    const notes = read['notes'] as { id: string; text: string; general: boolean }[];
    expect(notes.map(n => [n.text, n.general])).toEqual([[NOTE, true]]);
    expect((await mcp.call('mark_notes_picked_up', { note_ids: [notes[0]!.id] }))['marked']).toEqual([notes[0]!.id]);
    await page.reload();
    await expect(page.locator('.waiting-total')).toHaveText('0 notes waiting for pickup');

    // The AI publishes a draft; the page lists it.
    const published = await mcp.call('publish_draft', { score: { ...SCORE, piece: { ...(SCORE['piece'] as object), id: 'ai-piece' }, draft: 1 } });
    expect(published['published']).toBe(true);
    await page.goto(`${base}music/`);
    await expect(page.locator('a[href="piece.php?id=ai-piece"]')).toBeVisible();

    // Revoking the key on Your studio stops the AI, which says what to do.
    await page.goto(`${base}music/studio.php`);
    await row.getByRole('button', { name: 'Revoke' }).click();
    await expect(row).toContainText('Revoked');
    expect(String((await mcp.call('list_pieces'))['refused'])).toContain('revoked or mistyped');
    expect(String((await mcp.call('studio_status'))['next'])).toContain('Make a new AI key on Your studio');

    // stdout carried only protocol, and nothing the server or the AI said carries the key.
    for (const line of mcp.stdout) expect((JSON.parse(line) as { jsonrpc: string }).jsonrpc).toBe('2.0');
    expect(mcp.stdout.join('\n') + mcp.stderr.join('')).not.toContain(key);
  } finally {
    mcp?.close();
    await context.close();
    rmSync(work, { recursive: true, force: true });
  }
});
