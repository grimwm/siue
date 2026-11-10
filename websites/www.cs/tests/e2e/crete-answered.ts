// Crete can ask once, on the title card's first New Game or Endless, whether the device may help build Endless levels
// (only while src/settings.ts HELP_BUILD is on). Every spec but the ones about that question starts with it answered
// (No Thanks), so the card would never stand in its way: the config gives it to the page fixture's context, and a spec
// that makes its own context passes it there.
const base = process.env.E2E_BASE_URL;

export function helpAnswered(): { cookies: []; origins: { origin: string; localStorage: { name: string; value: string }[] }[] } {
  return { cookies: [], origins: base ? [{ origin: new URL(base).origin, localStorage: [{ name: 'crete-help-build', value: 'off' }] }] : [] };
}
