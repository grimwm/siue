// Shared by the music checks that run against their own docker project (make
// music-e2e, *.local.ts): signing in through the mail the PHP container
// captures (compose.admin-local.yaml), and the draft bundle the API takes.
import { expect, type Page } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const SITE = join(import.meta.dirname, '..', '..');

// Both realms' mail is captured inside the PHP container (compose.admin-local.yaml), as in tests/admin-smoke.sh.
export function inPhp(command: string): string {
  const compose = (process.env.MUSIC_E2E_COMPOSE ?? '').split(' ').filter(Boolean);
  const run = spawnSync('docker', ['compose', ...compose, '-p', process.env.MUSIC_E2E_PROJECT!, 'exec', '-T', 'www-cs-php', 'sh', '-c', command], { encoding: 'utf8', cwd: SITE });
  if (run.error || run.signal) throw new Error(`docker compose exec failed: ${run.error?.message ?? run.signal}`);
  if (run.status !== 0) throw new Error(`docker compose exec exited ${run.status}: ${run.stderr}`);
  return run.stdout;
}
// An empty mail directory is the expected start: the glob matches nothing and the listing ends in `true`.
export const mailFiles = (): string[] => inPhp(`ls ${process.env.MUSIC_E2E_MAIL_DIR}/*.eml 2>/dev/null || true`).split('\n').filter(Boolean);

/** The token of the first link to `page` (verify.php, confirm.php) in `folder` in a mail not in `known`, once one is captured. */
export async function mailedToken(known: ReadonlySet<string>, folder: 'music' | 'admin', page: string): Promise<string> {
  let token = '';
  const link = new RegExp(`/${folder}/${page.replace('.', '\\.')}\\?token=([0-9a-f]{64})`);
  await expect.poll(() => {
    const fresh = mailFiles().filter(f => !known.has(f));
    for (const f of fresh) {
      // The mail is quoted-printable: undo its soft line breaks and =XX escapes before reading the link.
      const text = inPhp(`cat ${f}`).replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
      const m = text.match(link);
      if (m) { token = m[1]!; break; }
    }
    return token;
  }, { timeout: 20_000 }).not.toBe('');
  return token;
}

/** Signs `email` in to one realm's folder (music/ for the studio, admin/ for the hub) through the captured mail. */
export async function signInAt(page: Page, base: string, folder: 'music' | 'admin', email: string): Promise<void> {
  const known = new Set(mailFiles());
  await page.goto(`${base}${folder}/login.php`);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Email me a link' }).click();
  const token = await mailedToken(known, folder, 'verify.php');
  // The mailed link names http://localhost/ with no port. Opened in the browser that asked for it, it signs in at once.
  await page.goto(`${base}${folder}/verify.php?token=${token}`);
  await expect(page).toHaveURL(new RegExp(`${folder}/(index\\.php)?$`));
}

/** The SIUED1 bundle (Formats): "SIUED1", a file count, then per file a name length, the name, a uint32 size and the bytes. */
export function draftBundle(files: Record<string, Buffer>): Buffer {
  const parts: Buffer[] = [Buffer.from('SIUED1'), Buffer.from([Object.keys(files).length])];
  for (const [name, bytes] of Object.entries(files)) {
    const size = Buffer.alloc(4);
    size.writeUInt32BE(bytes.length);
    parts.push(Buffer.from([name.length]), Buffer.from(name), size, bytes);
  }
  return Buffer.concat(parts);
}
