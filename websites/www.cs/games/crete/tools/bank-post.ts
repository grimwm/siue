/* The Island of Crete: one trusted post to the shared bank (endless-bank.php), as tools/generate-bank.ts and
 * tools/upload-bank.ts make it, and what they do when the bank fails. A post that gets no answer (a timeout or a
 * network failure) is logged with its op, how long it waited and why; one the bank answers with a status the tool
 * cannot use is logged with the status and the start of the body, never the token. A post that may fare better later
 * (`transient`, or a 200 the tool cannot read) is tried again after backoffMs, doubling from
 * RETRY_BASE_MS to RETRY_MAX_MS with jitter; a run stops for a failing bank only once HALT_ERRORS tries in a row have
 * failed over HALT_MS or more (Failures), so a bank that stops answering for a few minutes costs a run nothing. */
import { TOKEN_HEADER } from './verify-bank.ts';

/** The first wait before a failed post is tried again; each try after doubles it, to RETRY_MAX_MS. */
export const RETRY_BASE_MS = 5_000;
export const RETRY_MAX_MS = 5 * 60_000;
/** A run stops for a failing bank only once at least HALT_ERRORS tries in a row have failed over HALT_MS or more. */
export const HALT_ERRORS = 5;
export const HALT_MS = 15 * 60_000;
/** How long a post waits for the bank's answer. */
export const POST_TIMEOUT_MS = 60_000;

/** The wait before try `attempt + 2` (0 for the first retry): RETRY_BASE_MS doubled per try, at most RETRY_MAX_MS,
 *  less a random part of its half (`random` in [0, 1)), so runners that failed together do not retry together. */
export function backoffMs(attempt: number, random: () => number): number {
  const top = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** attempt);
  return Math.round(top / 2 + (top / 2) * random());
}

/** At most `max` characters of a response body on one line, any copy of `secret` blanked out. */
export function excerpt(text: string, secret: string, max = 160): string {
  const one = (secret ? text.split(secret).join('…') : text).replace(/\s+/g, ' ').trim();
  return one.length > max ? `${one.slice(0, max)}…` : one;
}

/** A post that got no answer, in a few words: the error's name, message and its cause's code. */
export function noAnswer(e: unknown): string {
  if (!(e instanceof Error)) return String(e);
  const code = (e.cause as { code?: unknown } | undefined)?.code;
  return `${e.name}: ${e.message}${typeof code === 'string' ? ` (${code})` : ''}`;
}

/** A status worth trying again: every one but the bank's own answers about this post (200, 400, 403, 409 and 429).
 *  That takes in no answer (0), a 5xx or 408, and a 401 or 404, which a deploy replacing the endpoint or the token's
 *  hash can give for a moment; one that lasts stops the run once failures persist. */
export const transient = (status: number) => ![200, 400, 403, 409, 429].includes(status);

/** The failed tries in a row, across every post of a run, and since when: `failed` gives the reason to stop once
 *  they persist (HALT_ERRORS tries over HALT_MS), else null; `answered` ends the run of failures. */
export class Failures {
  private n = 0;
  private since = 0;
  private readonly now: () => number;
  constructor(now: () => number) { this.now = now; }
  failed(): string | null {
    if (!this.n++) this.since = this.now();
    const ms = this.now() - this.since;
    return this.n >= HALT_ERRORS && ms >= HALT_MS ? `the bank has failed ${this.n} tries in a row over ${Math.round(ms / 60_000)} min (each logged above)` : null;
  }
  answered(): void { this.n = 0; }
}

/** A trusted post's answer: the status (0 when none came), the body as JSON (null when it is not) and as text. */
export interface Answer { status: number; body: unknown; text: string }

/** Posts trusted ops to `url` with `token` in its header; a post that gets no answer is logged and answers status 0. */
export function trustedPoster(url: string, token: string, log: (line: string) => void, fetcher: typeof fetch = fetch) {
  return async (body: Record<string, unknown>, what: string): Promise<Answer> => {
    const started = Date.now();
    try {
      const res = await fetcher(url, {
        method: 'POST', signal: AbortSignal.timeout(POST_TIMEOUT_MS),
        headers: { 'Content-Type': 'application/json', [TOKEN_HEADER]: token },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json: unknown = null;
      try { json = JSON.parse(text); } catch { /* not JSON: the caller says so */ }
      return { status: res.status, body: json, text };
    } catch (e) {
      log(`${what}: no answer after ${((Date.now() - started) / 1000).toFixed(1)} s (${noAnswer(e)})`);
      return { status: 0, body: null, text: '' };
    }
  };
}

/** An answer the tool cannot use, as a log line: the op, the status and the start of the body. */
export const answeredLine = (what: string, r: Answer, token: string) => `${what}: the bank answered ${r.status}: ${excerpt(r.text, token) || '(empty)'}`;
