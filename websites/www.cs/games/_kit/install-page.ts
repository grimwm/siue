// websites/www.cs/games/_kit/install-page.ts
// Built into each page game as dist/install.js. On the site's /play/<id>/
// page it fills the top bar's #play-install; on the game's own page it shows
// a corner bar, and only when the address asks (?install).
import { mountInstallBar } from './ui/install-bar.tsx';
import { asksInstall, browserInstallEnv, OUT_OF_SCOPE_PROMPTS } from './install.ts';

const asked = asksInstall(location.search);
const sitePage = document.getElementById('play-install');
if (sitePage) {
  mountInstallBar(sitePage, {
    title: sitePage.dataset.title ?? document.title,
    shareUrl: new URL('./', location.href).href,
    installPage: new URL(sitePage.dataset.gamePage ?? './', location.href).href,
    promptsHere: OUT_OF_SCOPE_PROMPTS,
    asked,
  }, browserInstallEnv());
} else if (asked) {
  // games/<id>/: its site page is ../../play/<id>/.
  const folder = new URL('./', location.href);
  const id = folder.pathname.split('/').filter(Boolean).pop() ?? '';
  const corner = document.createElement('div');
  corner.className = 'kit-install-corner';
  document.body.append(corner);
  mountInstallBar(corner, {
    title: document.title,
    shareUrl: new URL(`../../play/${id}/`, folder).href,
    installPage: null,
    promptsHere: true,
    asked,
  }, browserInstallEnv());
}
