// Converts a check() test file to node:test, for the typed-tests conversion.
// Single-use: it goes when that conversion ends.
//
//   node _kit/test/convert-check.ts [--rename] <files...>
//
// Each check(name, ok[, detail]) becomes an awaited top-level test, so the
// script's order and state are kept:
//   await test(name, () => { assert.ok(ok[, detail]); });
// The check import goes, node:test's test and node:assert/strict's assert come
// in when missing, and an import of the kit's dom-stub.mjs points at dom-stub.ts.
//
// With --rename, each x.test.mjs is moved to x.test.ts with git mv and every
// reference to it in the repository is rewritten, except under docs/superpowers/
// (plans and specs are history) and in dist/ (a rebuild writes those). Without
// it nothing is written: the converted file goes to stdout. Either way it prints
// `file: N checks rewritten, M references updated`, and refuses (exit 1, no
// file touched) a file that imports check but has no call to rewrite, has calls
// but no import, or has an argument list it cannot split.
//
// No AST: TypeScript 7 ships no stable JS API. A small lexer knows strings,
// template literals with nested ${}, comments and regex literals, and splits
// arguments only at depth-0 commas.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, posix, relative, resolve } from 'node:path';

class ConvertError extends Error {}

type Kind = 'ident' | 'punct' | 'string' | 'template' | 'regex' | 'number';

interface Token {
  kind: Kind;
  start: number;
  end: number;
  text: string;
}

// After one of these, `/` starts a regex literal rather than dividing.
const KEYWORDS_BEFORE_EXPRESSION = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);

function lineAt(src: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (src.charCodeAt(i) === 10) line++;
  return line;
}

class Lexer {
  src: string;
  file: string;

  constructor(src: string, file: string) {
    this.src = src;
    this.file = file;
  }

  fail(at: number, message: string): never {
    throw new ConvertError(`${this.file}:${lineAt(this.src, at)}: ${message}`);
  }

  /** Tokens from `i`; with `untilBrace`, stops at the `}` closing a template's `${` and returns its index. */
  tokens(i: number, untilBrace: boolean): { tokens: Token[]; end: number } {
    const { src } = this;
    const out: Token[] = [];
    let depth = 0;
    const push = (kind: Kind, start: number, end: number) => out.push({ kind, start, end, text: src.slice(start, end) });
    while (i < src.length) {
      const c = src[i]!;
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        const close = src.indexOf('*/', i + 2);
        if (close < 0) this.fail(i, 'unterminated comment');
        i = close + 2;
        continue;
      }
      if (c === "'" || c === '"') { const end = this.skipString(i); push('string', i, end); i = end; continue; }
      if (c === '`') { const end = this.skipTemplate(i); push('template', i, end); i = end; continue; }
      if (c === '/' && this.regexAllowed(out.at(-1))) { const end = this.skipRegex(i); push('regex', i, end); i = end; continue; }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i + 1;
        while (j < src.length && /[\w$]/.test(src[j]!)) j++;
        push('ident', i, j); i = j; continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i + 1;
        while (j < src.length && /[\w.]/.test(src[j]!)) j++;
        push('number', i, j); i = j; continue;
      }
      if (c === '=' && src[i + 1] === '>') { push('punct', i, i + 2); i += 2; continue; }
      if (untilBrace) {
        if (c === '{') depth++;
        if (c === '}' && depth-- === 0) return { tokens: out, end: i };
      }
      push('punct', i, i + 1);
      i++;
    }
    if (untilBrace) this.fail(i, 'unterminated ${ in a template literal');
    return { tokens: out, end: i };
  }

  regexAllowed(prev: Token | undefined): boolean {
    if (!prev) return true;
    if (prev.kind === 'ident') return KEYWORDS_BEFORE_EXPRESSION.has(prev.text);
    if (prev.kind === 'punct') return prev.text !== ')' && prev.text !== ']';
    return false; // after a number, string, template or regex: division
  }

  skipString(i: number): number {
    const { src } = this;
    const quote = src[i];
    for (let j = i + 1; j < src.length; j++) {
      if (src[j] === '\\') { j++; continue; }
      if (src[j] === quote) return j + 1;
      if (src[j] === '\n') break;
    }
    return this.fail(i, 'unterminated string');
  }

  skipTemplate(i: number): number {
    const { src } = this;
    for (let j = i + 1; j < src.length; j++) {
      if (src[j] === '\\') { j++; continue; }
      if (src[j] === '`') return j + 1;
      if (src[j] === '$' && src[j + 1] === '{') j = this.tokens(j + 2, true).end;
    }
    return this.fail(i, 'unterminated template literal');
  }

  skipRegex(i: number): number {
    const { src } = this;
    let inClass = false;
    for (let j = i + 1; j < src.length; j++) {
      const c = src[j];
      if (c === '\\') { j++; continue; }
      if (c === '\n') break;
      if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) {
        j++;
        while (j < src.length && /[a-z]/.test(src[j]!)) j++;
        return j;
      }
    }
    return this.fail(i, 'unterminated regex literal');
  }
}

interface Call {
  start: number;
  end: number;
  args: string[];
  line: number;
}

const CLOSE: Record<string, string> = { '(': ')', '[': ']', '{': '}' };

/** The check(...) calls in `src`: not member calls, not declarations, not inside strings, comments or templates. */
function findChecks(src: string, file: string): Call[] {
  const lexer = new Lexer(src, file);
  const tokens = lexer.tokens(0, false).tokens;
  const calls: Call[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    const prev = tokens[i - 1];
    if (t.kind !== 'ident' || t.text !== 'check' || tokens[i + 1]?.text !== '(') continue;
    if (prev && (prev.text === '.' || prev.text === 'function')) continue;
    const open = tokens[i + 1]!;
    const stack: string[] = [];
    const args: string[] = [];
    let argStart = open.end;
    let j = i + 2;
    for (; j < tokens.length; j++) {
      const u = tokens[j]!;
      if (u.kind !== 'punct') continue;
      if (u.text in CLOSE) stack.push(CLOSE[u.text]!);
      else if (u.text === ')' && !stack.length) break;
      else if (u.text === ')' || u.text === ']' || u.text === '}') {
        if (stack.pop() !== u.text) lexer.fail(u.start, `unbalanced ${u.text} in the check() call at line ${lineAt(src, t.start)}`);
      } else if (u.text === ',' && !stack.length) {
        args.push(src.slice(argStart, u.start).trim());
        argStart = u.end;
      }
    }
    const close = tokens[j];
    if (!close) return lexer.fail(t.start, 'unbalanced argument list: the check() call never closes');
    const last = src.slice(argStart, close.start).trim();
    if (last) args.push(last); // an empty last argument is a trailing comma
    calls.push({ start: t.start, end: close.end, args, line: lineAt(src, t.start) });
    i = j;
  }
  return calls;
}

const CHECK_IMPORT = /^[ \t]*import\s*\{\s*check\s*\}\s*from\s*(['"])[^'"\n]*\/check\.ts\1;?[ \t]*\r?\n?/gm;
const NODE_TEST_IMPORT = /^import\s*\{([^}]*)\}\s*from\s*(['"])node:test\2/m;
const ASSERT_IMPORT = /^import\s+(?:\*\s+as\s+)?assert\b[^;\n]*from\s*(['"])node:assert(?:\/strict)?\1/m;
// A check of the file's own (camera.test.mjs has one): not the bridge's, so left alone.
const LOCAL_CHECK = /\b(?:function\s+check\s*\(|(?:const|let|var)\s+check\s*=)/;
const RELATIVE_DOM_STUB = /(['"])(\.{1,2}\/[^'"\n]*)dom-stub\.mjs\1/g;

/** Converts one file's text; `file` is its path, used for messages and to resolve its dom-stub import. */
export function convertSource(src: string, file: string): { text: string; checks: number; refs: number } {
  const imports = [...src.matchAll(CHECK_IMPORT)];
  const found = findChecks(src, file);
  if (imports.length > 1) throw new ConvertError(`${file}: imports check ${imports.length} times`);
  if (imports.length && !found.length) throw new ConvertError(`${file}: imports check but has no check() call to rewrite`);
  if (found.length && !imports.length && !LOCAL_CHECK.test(src)) throw new ConvertError(`${file}: ${found.length} check() calls but no import of _kit/test/check.ts`);
  const calls = imports.length ? found : [];
  for (const call of calls) {
    if (call.args.length < 2 || call.args.length > 3 || call.args.some(a => !a)) throw new ConvertError(`${file}:${call.line}: check() takes (name, ok[, detail]); this call has ${call.args.length} arguments`);
  }

  let text = src;
  for (const call of [...calls].reverse()) {
    const [name, ok, detail] = call.args;
    text = `${text.slice(0, call.start)}await test(${name}, () => { assert.ok(${ok}${detail === undefined ? '' : `, ${detail}`}); })${text.slice(call.end)}`;
  }
  if (calls.length) {
    const added: string[] = [];
    const nodeTest = NODE_TEST_IMPORT.exec(text);
    if (!nodeTest) added.push("import { test } from 'node:test';\n");
    else {
      const names = nodeTest[1]!.split(',').map(s => s.trim()).filter(Boolean);
      if (!names.includes('test')) {
        const merged = nodeTest[0].replace(/\{[^}]*\}/, `{ ${[...names, 'test'].join(', ')} }`);
        text = text.slice(0, nodeTest.index) + merged + text.slice(nodeTest.index + nodeTest[0].length);
      }
    }
    if (!ASSERT_IMPORT.test(text)) added.push("import assert from 'node:assert/strict';\n");
    text = text.replace(CHECK_IMPORT, () => added.join(''));
  }
  let refs = 0;
  text = text.replace(RELATIVE_DOM_STUB, (whole: string, quote: string, dir: string) => {
    if (!posix.join(posix.dirname(file), dir, 'dom-stub.mjs').endsWith('_kit/test/dom-stub.mjs')) return whole;
    refs++;
    return `${quote}${dir}dom-stub.ts${quote}`;
  });
  return { text, checks: calls.length, refs };
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The folder a bare file name or a path without its game folder is taken to be inside: the game's own folder. */
function gameFolder(path: string): string {
  const m = /^(.*?games\/[^/]+\/)/.exec(path);
  return m ? m[1]! : `${posix.dirname(path)}/`;
}

/**
 * Rewrites references in `text` (the file at repository path `from`) to each
 * renamed repository path. A reference is a path-like run ending in the old
 * file name. `./x` and `../x` resolve from `from`'s folder. Any other run must
 * be a trailing part of the old path, and `from` must sit inside the folder that
 * part leaves off (for a bare name, the game's folder): `test/x.test.mjs` in
 * crete/ is never tankity's.
 */
export function rewriteRefs(text: string, from: string, renames: Map<string, string>): { text: string; refs: number } {
  let refs = 0;
  for (const [oldPath, newPath] of renames) {
    const oldName = posix.basename(oldPath);
    const newName = posix.basename(newPath);
    // Not followed by more name (x.test.mjs.bak); a sentence's full stop is fine.
    const pattern = new RegExp(`[\\w./-]*${escape(oldName)}(?![\\w-]|\\.\\w)`, 'g');
    text = text.replace(pattern, (ref: string) => {
      const path = ref;
      let hit: boolean;
      if (path.startsWith('./') || path.startsWith('../')) hit = posix.join(posix.dirname(from), path) === oldPath;
      else if (path === oldPath) hit = true;
      else if (oldPath.endsWith(`/${path}`)) {
        const anchor = path.includes('/') ? oldPath.slice(0, oldPath.length - path.length) : gameFolder(oldPath);
        hit = from.startsWith(anchor);
      } else hit = false;
      if (!hit) return ref;
      refs++;
      return ref.slice(0, ref.length - oldName.length) + newName;
    });
  }
  return { text, refs };
}

function git(root: string, args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** Tracked text files that mention any renamed file's name, outside docs/superpowers/ and dist/. */
function candidates(root: string, names: string[]): string[] {
  const args = ['grep', '-l', '-I', '-F', ...names.flatMap(n => ['-e', n]), '--', '.', ':(exclude)docs/superpowers/**', ':(exclude)**/dist/**'];
  try {
    return git(root, args).split('\n').filter(Boolean);
  } catch (e) {
    // git grep exits 1 when nothing matches; anything else is a real failure.
    if (e instanceof Error && 'status' in e && e.status === 1) return [];
    throw e;
  }
}

function main(argv: string[]): void {
  const rename = argv.includes('--rename');
  const files = argv.filter(a => a !== '--rename');
  if (!files.length || files.some(f => f.startsWith('--'))) throw new ConvertError('usage: convert-check.ts [--rename] <files...>');
  const root = git(process.cwd(), ['rev-parse', '--show-toplevel']).trim();
  const repoPath = (f: string) => relative(root, resolve(f)).split('\\').join('/');

  const renames = new Map<string, string>();
  for (const f of files) {
    if (!f.endsWith('.mjs')) throw new ConvertError(`${f}: not an .mjs file`);
    const target = f.replace(/\.mjs$/, '.ts');
    if (existsSync(target)) throw new ConvertError(`${target}: already exists`);
    renames.set(repoPath(f), repoPath(target));
  }
  // Convert everything first, so a refusal leaves every file as it was.
  const converted = files.map(f => {
    const from = repoPath(f);
    const c = convertSource(readFileSync(f, 'utf8'), f);
    const r = rewriteRefs(c.text, from, renames);
    return { file: f, from, text: r.text, checks: c.checks, refs: c.refs + r.refs };
  });
  const refsByFile = new Map(converted.map(c => [c.from, c.refs]));
  const others: { path: string; text: string }[] = [];
  for (const path of candidates(root, [...renames.keys()].map(p => posix.basename(p)))) {
    if (renames.has(path)) continue;
    const before = readFileSync(join(root, path), 'utf8');
    for (const [oldPath, newPath] of renames) {
      const one = rewriteRefs(before, path, new Map([[oldPath, newPath]]));
      if (one.refs) refsByFile.set(oldPath, (refsByFile.get(oldPath) ?? 0) + one.refs);
    }
    const after = rewriteRefs(before, path, renames);
    if (after.refs) others.push({ path, text: after.text });
  }
  for (const c of converted) {
    const target = c.file.replace(/\.mjs$/, '.ts');
    const summary = `${target}: ${c.checks} checks rewritten, ${refsByFile.get(c.from)} references updated`;
    if (rename) {
      git(root, ['mv', c.from, renames.get(c.from)!]);
      writeFileSync(target, c.text);
      console.log(summary);
    } else {
      if (files.length > 1) process.stdout.write(`// ${basename(target)}\n`);
      process.stdout.write(c.text);
      console.error(summary);
    }
  }
  if (rename) for (const o of others) writeFileSync(join(root, o.path), o.text);
  const sources = others.filter(o => /\/src\//.test(o.path)).map(o => o.path);
  if (sources.length) console.error(`src/ comments changed (${sources.join(', ')}): rebuild the game and commit its dist/*.map`);
}

if (import.meta.main) {
  try {
    main(process.argv.slice(2));
  } catch (e) {
    console.error(e instanceof ConvertError ? `convert-check: ${e.message}` : e);
    process.exitCode = 1;
  }
}
