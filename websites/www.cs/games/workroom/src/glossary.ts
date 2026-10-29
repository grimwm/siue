// The glossary: plain-words definitions of the musical and sound-design terms a
// score's `glossary` and a change's text can point at. glossary.json is its one
// source; the Python tool reads the same file. A term whose word is also an
// everyday word ("rest", "tie", "staff") lists in `match` the only phrases that
// link in free text (none, for `[]`); the reading lesson links it by id.
import data from './glossary.json' with { type: 'json' };
import type { Score } from './score.ts';

export interface Term { id: string; word: string; lines: [string, string] }

export const GLOSSARY: readonly Term[] = data.terms.map(t => ({ id: t.id, word: t.word, lines: [t.lines[0]!, t.lines[1]!] }));

const BY_ID = new Map(GLOSSARY.map(t => [t.id, t]));

export function term(id: string): Term | undefined {
  return BY_ID.get(id);
}

/** The glossary uses in a score, in order of first appearance, with their definitions. */
export function termsIn(score: Score): { term: Term; from: number; to: number }[] {
  const out: { term: Term; from: number; to: number }[] = [];
  for (const u of score.glossary) {
    const t = BY_ID.get(u.term);
    if (t) out.push({ term: t, from: u.from, to: u.to });
  }
  return out;
}

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The phrases that link to each term in free text: its `match` list when it has one, else its word. */
const PHRASES = data.terms.flatMap(t => ((t as { match?: string[] }).match ?? [t.word]).map(phrase => ({ phrase: phrase.toLowerCase(), term: BY_ID.get(t.id)! })));
// Longest phrases first, so a phrase wins over a word inside it; whole words only (a hyphen or letter next to a match disqualifies it).
const WORDS = PHRASES.map(p => ({ term: p.term, phrase: p.phrase, source: escape(p.phrase).replace(/ /g, '\\s+') })).sort((a, b) => b.phrase.length - a.phrase.length);
const BY_WORD = new Map(PHRASES.map(p => [p.phrase, p.term]));
const PATTERN = new RegExp(`(?<![\\p{L}\\p{N}-])(?:${WORDS.map(w => w.source).join('|')})(?![\\p{L}\\p{N}-])`, 'giu');

/** Splits text into plain runs and glossary words (whole words or whole phrases such as "reverb tail", case-insensitive, first match wins); an everyday word links only through its term's `match` phrases. */
export function splitTerms(text: string): ({ text: string } | { term: Term; text: string })[] {
  const parts: ({ text: string } | { term: Term; text: string })[] = [];
  let at = 0;
  for (const m of text.matchAll(PATTERN)) {
    const t = BY_WORD.get(m[0].toLowerCase().replace(/\s+/g, ' '));
    if (!t) continue;
    if (m.index > at) parts.push({ text: text.slice(at, m.index) });
    parts.push({ term: t, text: m[0] });
    at = m.index + m[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at) });
  return parts;
}
