/* The Island of Crete: where the shared bank keeps its levels (`make crete-bank-where`), read only. One
 * `trusted-where` post (endless-bank.php, bank/Place.php) answers which folder the bank uses (`override`, `data` or
 * `vartmp`) or why it refuses one; each candidate folder's owner, mode and times, its born.json (when a new, empty bank
 * began there) and each grade's stores; PHP's user and groups; when the host booted; when PHP's server (php-fpm's
 * master) started; and what is mounted on /tmp and /var/tmp as PHP sees them. This prints it, with a few lines on
 * what it means, or the whole answer as JSON with --json.
 *
 * Over HTTPS only; the CRETE_BANK_VERIFIER_TOKEN secret goes in the X-Crete-Verifier header and is never printed.
 * Exits 0 with an answer, 1 when the bank gave none it could read, 2 on bad options.
 *
 *   CRETE_BANK_VERIFIER_TOKEN=… node tools/where-bank.ts [--json] [--url <endpoint>] */
import { pathToFileURL } from 'node:url';
import { safeUrl } from './generate-bank.ts';
import { BANK_URL } from './verify-bank.ts';
import { answeredLine, trustedPoster } from './bank-post.ts';
import type { Answer } from './bank-post.ts';

export const KINDS = ['override', 'data', 'vartmp'] as const;
export type Kind = typeof KINDS[number];
export const LISTS = ['served', 'pending', 'retired'] as const;

/** One store file as the bank reports it; null when it is missing. */
export interface Store { bytes: number; mtime: number; count: number | null; oldest?: number | null; newest?: number | null; error?: string }
export type Grades = Record<string, Record<typeof LISTS[number], Store | null>>;
export interface Folder {
  path: string; exists: boolean; link: boolean; writable: boolean; mode: string | null; uid: number | null; gid: number | null;
  parentGid: number | null; ctime: number | null; mtime: number | null; holdsBank: boolean;
  born: { at: number; kind: string } | null; grades: Grades | null;
}
export interface Where {
  kind: Kind | null; dir: string | null; refused: string | null; ctime: number | null; mtime: number | null;
  grades: Grades | null; dataWritable: boolean; folders: Partial<Record<Kind, Folder>>;
  php: { uid: number; gid: number; groups: number[] | null; sapi: string };
  bootTime: number | null; server: { pid: number; name: string; startedAt: number | null } | null;
  tmpMounts: { mount: string; root: string }[] | null; now: number;
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** The bank's answer when it has the shape of a trusted-where report, else null. */
export function whereOf(body: unknown): Where | null {
  if (!isObj(body)) return null;
  const kindOk = body.kind === null || KINDS.includes(body.kind as Kind);
  const ok = kindOk && (body.dir === null || typeof body.dir === 'string') && (body.refused === null || typeof body.refused === 'string')
    && typeof body.dataWritable === 'boolean' && isObj(body.folders) && isObj(body.php) && typeof body.now === 'number'
    && (body.kind === null) === (body.refused !== null);
  return ok ? body as unknown as Where : null;
}

/** A time in seconds as UTC to the second, or "unknown". */
export const utc = (s: number | null | undefined) => typeof s === 'number' ? new Date(s * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z') : 'unknown';

const mb = (bytes: number) => bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

function storeText(list: string, s: Store | null): string {
  if (!s) return `${list} none`;
  if (s.count === null) return `${list} ${s.error ?? 'unreadable'} (${mb(s.bytes)}, written ${utc(s.mtime)})`;
  const span = s.oldest != null ? `, levels in ${utc(s.oldest)} to ${utc(s.newest)}` : '';
  return `${list} ${s.count} (${mb(s.bytes)}, written ${utc(s.mtime)}${span})`;
}

function folderLines(name: string, f: Folder): string[] {
  if (!f.exists) return [`${name} ${f.path}: missing`];
  const owner = `mode ${f.mode}, uid ${f.uid}, gid ${f.gid} (its parent's gid ${f.parentGid ?? 'unknown'})`;
  const lines = [
    `${name} ${f.path}: ${f.link ? 'a symbolic link, ' : ''}${owner}; PHP can write it: ${f.writable ? 'yes' : 'no'}; holds a bank: ${f.holdsBank ? 'yes' : 'no'}`,
    `  changed ${utc(f.ctime)}, modified ${utc(f.mtime)}${f.born ? `; the bank first used it, empty, ${utc(f.born.at)} (as ${f.born.kind})` : ''}`,
  ];
  for (const [grade, lists] of Object.entries(f.grades ?? {})) {
    if (LISTS.some(l => lists[l])) lines.push(`  ${grade.padEnd(6)} ${LISTS.map(l => storeText(l, lists[l])).join('; ')}`);
  }
  return lines;
}

const privateTmp = (w: Where) => (w.tmpMounts ?? []).some(m => m.mount === '/var/tmp' && /systemd-private-/.test(m.root));

/** What the report means, in a few lines: where the bank lives, whether that survives a php-fpm restart, and why
 *  data/ is not used when it is not. */
export function readings(w: Where): string[] {
  const out: string[] = [];
  const data = w.folders.data;
  const vartmp = w.folders.vartmp;
  if (w.refused) out.push(`The bank refuses to start: ${w.refused}`);
  if (w.kind === 'vartmp') {
    out.push(privateTmp(w)
      ? 'The bank lives in php-fpm\'s private /var/tmp (systemd PrivateTmp): every php-fpm restart or reboot empties it.'
      : 'The bank lives in /var/tmp, which the host may clear (a reboot or systemd-tmpfiles).');
  }
  if (w.kind === 'data') out.push('The bank lives in data/, which deploys never touch: it survives restarts and reboots.');
  if (data?.exists && !w.dataWritable) {
    const groups = w.php.groups ?? [w.php.gid];
    out.push(`PHP cannot write data/: its group is ${data.gid}${data.gid !== null && !groups.includes(data.gid) ? ', which PHP is not in' : ''} (PHP runs as uid ${w.php.uid}, groups ${groups.join(', ')}; data/'s parent has gid ${data.parentGid ?? 'unknown'}).`);
  }
  const born = (w.kind ? w.folders[w.kind] : vartmp)?.born?.at;
  const restarts: [string, number | null | undefined][] = [[`${w.server?.name || 'PHP\'s server'} started`, w.server?.startedAt], ['the host booted', w.bootTime]];
  for (const [what, at] of restarts) {
    if (typeof at === 'number' && typeof born === 'number' && born >= at && born - at < 6 * 3600) {
      out.push(`The bank began ${Math.round((born - at) / 60)} min after ${what} (${utc(at)}).`);
    }
  }
  return out;
}

/** The report as lines to print. */
export function whereLines(w: Where): string[] {
  const lines = [w.kind ? `The bank's folder: ${w.kind} ${w.dir}` : 'The bank has no folder: it refuses to start'];
  for (const kind of KINDS) {
    const f = w.folders[kind];
    if (f) lines.push(...folderLines(kind === 'data' ? 'data/' : kind === 'vartmp' ? '/var/tmp folder' : 'override', f));
  }
  const mounts = w.tmpMounts === null ? 'unknown' : w.tmpMounts.length ? w.tmpMounts.map(m => `${m.mount} from ${m.root}`).join('; ') : 'the host\'s own';
  lines.push(
    `PHP: uid ${w.php.uid}, gid ${w.php.gid}, groups ${w.php.groups?.join(', ') ?? 'unknown'} (${w.php.sapi})`,
    `Host booted: ${utc(w.bootTime)}`,
    `PHP's server: ${w.server ? `${w.server.name || 'unknown'} (pid ${w.server.pid}) started ${utc(w.server.startedAt)}` : 'unknown'}`,
    `/tmp and /var/tmp as PHP sees them: ${mounts}`,
    `The bank's clock: ${utc(w.now)}`,
  );
  const r = readings(w);
  if (r.length) lines.push('', ...r);
  return lines;
}

/** One trusted-where post: the report, or why there is none. */
export async function askWhere(post: (body: Record<string, unknown>, what: string) => Promise<Answer>, token: string): Promise<Where | string> {
  const r = await post({ op: 'trusted-where' }, 'trusted-where');
  if (r.status === 0) return 'the bank did not answer';
  const w = r.status === 200 ? whereOf(r.body) : null;
  return w ?? answeredLine('trusted-where', r, token);
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fail = (why: string, code: number): never => { console.error(`where-bank: ${why}`); process.exit(code); };
  const url = safeUrl(arg('url') ?? BANK_URL) ?? fail('the bank\'s URL must be HTTPS', 2);
  const token = process.env.CRETE_BANK_VERIFIER_TOKEN || fail('no CRETE_BANK_VERIFIER_TOKEN', 1);
  const w = await askWhere(trustedPoster(url, token, line => console.error(`where-bank: ${line}`)), token);
  if (typeof w === 'string') fail(w, 1);
  console.log(process.argv.includes('--json') ? JSON.stringify(w, null, 2) : whereLines(w as Where).join('\n'));
}
