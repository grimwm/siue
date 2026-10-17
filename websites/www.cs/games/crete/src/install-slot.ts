/* The Island of Crete: the kit's Install and Share bar, mounted into the title card. On the site's /play/ page the
 * game runs in a frame, where the bar draws nothing (the page's own top bar is the bar); on a page opened with
 * ?install the kit's corner bar is the one, so the slot stays empty. DOM lib program. */
import { mountInstallBar } from "../../_kit/ui/install-bar.tsx";
import { asksInstall, browserInstallEnv } from "../../_kit/install.ts";

export function mountTitleInstall(win: Window, slot: Element | null): void {
  if (!slot || asksInstall(win.location.search)) return;
  // games/<id>/ is shared as its site page, ../../play/<id>/.
  const folder = new URL("./", win.location.href);
  const id = folder.pathname.split("/").filter(Boolean).pop() ?? "";
  mountInstallBar(slot, {
    title: win.document.title,
    shareUrl: new URL(`../../play/${id}/`, folder).href,
    installPage: null,
    promptsHere: true,
    asked: false,
  }, browserInstallEnv());
}
