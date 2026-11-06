/* Cylon Defense: the name the top bar shows while no run is live, read from
 * the site the game runs on (README.md, "Host contract"). The first of these
 * that has text wins: the embed script's data-site-name, the host's own brand
 * element, <meta property="og:site_name">, <meta name="application-name">, the
 * part of the title after its last separator ("Post – Site"), the hostname
 * without "www.". DOM-free: the document, hostname and script are handed in. */

/** The part of an element the name is read from. */
export interface NameSource {
  readonly textContent: string | null;
  getAttribute(name: string): string | null;
}

/** The part of the document the name is read from. */
export interface SiteDoc {
  readonly title: string;
  querySelector(selectors: string): NameSource | null;
}

/** The host's brand elements, most specific first: the home page's, a navbar's, a WordPress theme's. */
export const BRAND_SELECTORS = ['#site-brand', '.navbar-brand', '.wp-block-site-title', '.site-title'] as const;
/** What sits between a page's own title and its site's name in a <title>. */
export const TITLE_SEPARATORS = [' – ', ' — ', ' | ', ' · ', ' - '] as const;
/** The longest name the bar shows; a longer one ends in an ellipsis. */
export const MAX_SITE_NAME = 40;
/** The name when the page offers none at all. */
export const FALLBACK_SITE_NAME = 'The CIC';

/** Whitespace collapsed and trimmed; '' for nothing. */
function clean(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

/** The text after the title's last separator, or '' when it has none. */
export function titleSiteName(title: string): string {
  let at = -1;
  let width = 0;
  for (const sep of TITLE_SEPARATORS) {
    const i = title.lastIndexOf(sep);
    if (i > at) { at = i; width = sep.length; }
  }
  return at < 0 ? '' : clean(title.slice(at + width));
}

/** The name capped at MAX_SITE_NAME characters, an ellipsis marking the cut. */
export function capSiteName(name: string): string {
  const chars = Array.from(name);
  return chars.length <= MAX_SITE_NAME ? name : `${chars.slice(0, MAX_SITE_NAME - 1).join('').trimEnd()}…`;
}

/** The site's name for the bar, never empty. */
export function siteName(doc: SiteDoc, hostname: string, script?: NameSource | null): string {
  const meta = (selector: string): string => clean(doc.querySelector(selector)?.getAttribute('content'));
  const candidates: Array<() => string> = [
    () => clean(script?.getAttribute('data-site-name')),
    () => {
      for (const selector of BRAND_SELECTORS) {
        const text = clean(doc.querySelector(selector)?.textContent);
        if (text) return text;
      }
      return '';
    },
    () => meta('meta[property="og:site_name"]'),
    () => meta('meta[name="application-name"]'),
    () => titleSiteName(doc.title),
    () => clean(hostname).replace(/^www\./i, ''),
  ];
  for (const candidate of candidates) {
    const name = candidate();
    if (name) return capSiteName(name);
  }
  return FALLBACK_SITE_NAME;
}
