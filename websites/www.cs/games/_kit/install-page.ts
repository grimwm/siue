// websites/www.cs/games/_kit/install-page.ts
// Built into each page game as dist/install.js. On the site's /play/<id>/
// page it fills the top bar's #play-install; on the game's own page it shows
// a corner bar, and only when the address asks (?install).
import { mountInstallBar } from './ui/install-bar.tsx';
import { asksInstall, browserInstallEnv, OUT_OF_SCOPE_PROMPTS, versionedShareUrl, versionOf } from './install.ts';

const asked = asksInstall(location.search);
const sitePage = document.getElementById('play-install');
if (sitePage) {
  mountInstallBar(sitePage, {
    title: sitePage.dataset.title ?? document.title,
    // The site page names the game's version (the hash its own page loads dist/main.js with).
    shareUrl: versionedShareUrl(new URL('./', location.href).href, sitePage.dataset.version),
    installPage: new URL(sitePage.dataset.gamePage ?? './', location.href).href,
    promptsHere: OUT_OF_SCOPE_PROMPTS,
    asked,
  }, browserInstallEnv());
} else if (asked) {
  // games/<id>/: its site page is ../../play/<id>/.
  const folder = new URL('./', location.href);
  const id = folder.pathname.split('/').filter(Boolean).pop() ?? '';
  const entry = document.querySelector<HTMLScriptElement>('script[type="module"][src*="dist/main.js"]');
  const corner = document.createElement('div');
  corner.className = 'kit-install-corner';
  document.body.append(corner);
  mountInstallBar(corner, {
    title: document.title,
    shareUrl: versionedShareUrl(new URL(`../../play/${id}/`, folder).href, versionOf(entry?.src ?? '')),
    installPage: null,
    promptsHere: true,
    asked,
  }, browserInstallEnv());
}
