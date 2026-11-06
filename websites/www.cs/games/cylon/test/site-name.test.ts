// The bar's name while no run is live (src/site-name.ts): read from the site the
// game runs on, in a fixed order, never empty. Fake documents stand in for the page.
import { capSiteName, FALLBACK_SITE_NAME, MAX_SITE_NAME, siteName, titleSiteName } from '../src/site-name.ts';
import type { NameSource, SiteDoc } from '../src/site-name.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const el = (text: string | null, attrs: Record<string, string> = {}): NameSource => ({
  textContent: text,
  getAttribute: (name) => attrs[name] ?? null,
});

/** A document holding the given elements by selector, and a title. */
function page(title: string, els: Record<string, NameSource> = {}): SiteDoc & { asked: string[] } {
  const asked: string[] = [];
  return { title, asked, querySelector: (s) => { asked.push(s); return els[s] ?? null; } };
}

const everything = (): Record<string, NameSource> => ({
  '#site-brand': el('Home Brand'),
  '.navbar-brand': el('Navbar Brand'),
  '.wp-block-site-title': el('Block Title'),
  '.site-title': el('Theme Title'),
  'meta[property="og:site_name"]': el(null, { content: 'OG Name' }),
  'meta[name="application-name"]': el(null, { content: 'App Name' }),
});

test('the embed script tag\'s data-site-name comes first', () => {
  const doc = page('Post – Title Site', everything());
  assert.equal(siteName(doc, 'www.example.com', el(null, { 'data-site-name': '  Happy STL ' })), 'Happy STL');
});

test('then the host\'s own brand element, #site-brand before a navbar\'s and a theme\'s', () => {
  const els = everything();
  assert.equal(siteName(page('Post – Title Site', els), 'www.example.com', el(null)), 'Home Brand');
  delete els['#site-brand'];
  assert.equal(siteName(page('x', els), 'example.com'), 'Navbar Brand');
  delete els['.navbar-brand'];
  assert.equal(siteName(page('x', els), 'example.com'), 'Block Title');
  delete els['.wp-block-site-title'];
  assert.equal(siteName(page('x', els), 'example.com'), 'Theme Title');
});

test('a brand element\'s whitespace collapses, and an empty one is passed over', () => {
  const doc = page('x', { '#site-brand': el('  \n '), '.site-title': el('\n  Happy\n   St. Louis  ') });
  assert.equal(siteName(doc, 'example.com'), 'Happy St. Louis');
});

test('then og:site_name, then application-name', () => {
  const els = everything();
  for (const s of ['#site-brand', '.navbar-brand', '.wp-block-site-title', '.site-title']) delete els[s];
  assert.equal(siteName(page('Post – Title Site', els), 'example.com'), 'OG Name');
  els['meta[property="og:site_name"]'] = el(null, { content: ' ' });
  assert.equal(siteName(page('Post – Title Site', els), 'example.com'), 'App Name');
});

test('then the title after its last separator', () => {
  assert.equal(siteName(page('Hello from the blog – Happy St. Louis'), 'example.com'), 'Happy St. Louis');
  assert.equal(siteName(page('A – B — Site'), 'example.com'), 'Site');
  assert.equal(titleSiteName('Post | Section | Site'), 'Site');
  assert.equal(titleSiteName('Post · Site'), 'Site');
  assert.equal(titleSiteName('Post — Site'), 'Site');
  assert.equal(titleSiteName('The CIC: A Game That Takes Over This Page - Happiness Enterprises'), 'Happiness Enterprises');
  assert.equal(titleSiteName('Post – Site | Network'), 'Network');
  assert.equal(titleSiteName('Self-Titled'), '', 'an unspaced hyphen is no separator');
  assert.equal(titleSiteName('Just a title'), '');
  assert.equal(titleSiteName('Post – '), '');
});

test('then the hostname without www., and the game\'s own name when there is none', () => {
  assert.equal(siteName(page('Just a title'), 'www.happystl.com'), 'happystl.com');
  assert.equal(siteName(page(''), 'blog.example.org'), 'blog.example.org');
  assert.equal(siteName(page('Post – '), ''), FALLBACK_SITE_NAME);
});

test('a long name is capped with an ellipsis', () => {
  const long = 'The Extraordinarily Long Name of a Personal Weblog';
  const capped = siteName(page('x', { '#site-brand': el(long) }), 'example.com');
  assert.equal(Array.from(capped).length <= MAX_SITE_NAME, true);
  assert.equal(capped.endsWith('…'), true);
  assert.equal(capped, 'The Extraordinarily Long Name of a Pers…');
  assert.equal(capSiteName('x'.repeat(MAX_SITE_NAME)), 'x'.repeat(MAX_SITE_NAME));
});

test('the order is read lazily: the first name found stops the search', () => {
  const doc = page('x', { '#site-brand': el('Home Brand') });
  siteName(doc, 'example.com');
  assert.deepEqual(doc.asked, ['#site-brand']);
});

test('the faculty page keeps what its own markup says', () => {
  const doc = page('William Grim — Computer Science, SIUE', { '#site-brand': el('William Grim') });
  assert.equal(siteName(doc, 'www.cs.siue.edu'), 'William Grim');
});
