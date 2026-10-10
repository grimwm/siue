/*
 * The site's script, loaded by index.html as a classic <script> (compiled from
 * src/main.ts by tools/ts-build.mjs). It has no imports or exports on purpose:
 * the page's inline handlers call these functions as globals, and a game's
 * entry point reaches the site only through what the page hands it (see the
 * module script at the end of index.html).
 */

/** One card of the games list, as games.php returns it (see games/hub.php). */
interface HubGame {
    id: string;
    title: string;
    description: string;
    button: string;
    kicker?: string;
    screenshot?: string;
    /** The game's wrapper page: the card links to it. */
    href?: string;
    /** The link to share, when it is not href. */
    share?: string;
    /** For a game mounted in this page: the name of the global that starts it. */
    start?: string;
    /** The game's manifest, which installing from the page uses. */
    manifest?: string;
}

interface HubResponse {
    games?: HubGame[];
    errors?: Array<{ id: string; error: string }>;
}

/** Options for showing a panel: `url: false` leaves the address alone. */
interface PanelOptions {
    url?: boolean;
}

/**
 * Shows a panel matching the "nav-" id. All other panels with a "nav-" id prefix
 * are hidden.
 */
function showNavDiv(divId: string, opts: PanelOptions = {}): void {
    const divs = document.querySelectorAll("[id^='nav-']");
    divs.forEach(div => { div.classList.remove("is-active"); });
    const target = document.getElementById(`nav-${divId}`);
    if (target) {
        target.classList.add("is-active");
    }
    if (opts.url !== false) linkPanel(divId);
}

/** Open the games hub (cards come from loadGamesHub; Game Off/On also starts The CIC). */
function showGamesHub(opts: PanelOptions = {}): void {
    showNavDiv('games', opts);
}

/**
 * The page stays one page, but its address follows the panel: Home is the
 * bare site address, Contact and Games are #contact and #games, so a copied
 * address opens the same panel and Back/Forward step between panels. A
 * ?game= launch link is dropped once you navigate away from it.
 */
function linkPanel(divId: string): void {
    const url = new URL(location.href);
    url.searchParams.delete('game');
    url.hash = divId === 'main' ? '' : divId;
    const want = url.href.replace(/#$/, '');
    if (want !== location.href) history.pushState({ panel: divId }, '', want);
}

/** #contact and #games open those panels; no hash is Home. */
function openLinkedPanel(): void {
    const panel = location.hash.slice(1);
    if (panel === 'games') showGamesHub({ url: false });
    else if (panel === 'contact') showNavDiv('contact', { url: false });
    else if (!new URLSearchParams(location.search).get('game')) showNavDiv('main', { url: false });
}
window.addEventListener('hashchange', openLinkedPanel);
window.addEventListener('popstate', openLinkedPanel);
document.addEventListener('DOMContentLoaded', openLinkedPanel);

/**
 * Fills the games hub with one card per games/<id>/metadata.yaml, as listed
 * by games.php. A card either links to the game's wrapper page (`href`, the
 * site navbar over the game) or calls a
 * page function that mounts the game in place (`start`).
 */
async function loadGamesHub(): Promise<void> {
    const list = document.getElementById('games-hub-list');
    if (!list) return;
    const status = (text: string): void => {
        const li = document.createElement('li');
        li.className = 'games-hub-status';
        li.textContent = text;
        list.replaceChildren(li);
    };

    let hub: HubResponse;
    try {
        const res = await fetch('games.php', { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`games.php answered ${res.status}`);
        hub = await res.json() as HubResponse;
    } catch (err) {
        console.warn('Games hub:', err);
        status('The games list could not load right now. Try again in a moment.');
        return;
    }
    (hub.errors || []).forEach(e => console.warn(`Games hub: games/${e.id}: ${e.error}`));

    const games = hub.games || [];
    if (games.length === 0) {
        status('No games are installed yet.');
        return;
    }
    list.replaceChildren(...games.map(gamesHubCard));
    openLinkedGame(games);
}

/** The link to share for a game: its own page, or ?game=<id> for games that
 * run inside this page. */
function gameShareUrl(game: HubGame): string {
    if (game.share) return new URL(game.share, location.href).href;
    if (game.href) return new URL(game.href, location.href).href;
    const url = new URL(location.href);
    url.search = `?game=${encodeURIComponent(game.id)}`;
    url.hash = '';
    return url.href;
}

/** ?game=<id> opens that game straight away. */
function openLinkedGame(games: HubGame[]): void {
    const id = new URLSearchParams(location.search).get('game');
    const game = id ? games.find(g => g.id === id) : undefined;
    if (!game) return;
    if (game.href) {
        location.replace(game.href);
        return;
    }
    showGamesHub({ url: false });
    // Installing from here installs this game, not the whole site.
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (link && game.manifest) link.href = game.manifest;
    callGlobal(game.start);
}

/** Calls the page-level function a game named as its `start`, if there is one. */
function callGlobal(name: string | undefined): void {
    const fn = name ? (window as unknown as Record<string, unknown>)[name] : undefined;
    if (typeof fn === 'function') fn();
}

async function copyGameLink(button: HTMLElement, game: HubGame): Promise<void> {
    const url = gameShareUrl(game);
    const label = button.textContent;
    try {
        await navigator.clipboard.writeText(url);
        button.textContent = 'Link copied';
    } catch (err) {
        // No clipboard access (an http page or a denied permission): show
        // the link so it can be copied by hand.
        window.prompt('Copy this link:', url);
    }
    setTimeout(() => { button.textContent = label; }, 1600);
}

function gamesHubCard(game: HubGame): HTMLLIElement {
    const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] => {
        const node = document.createElement(tag);
        node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const card = el('li', 'games-hub-card');
    card.dataset.game = game.id;
    if (game.screenshot) {
        const shot = el('img', 'games-hub-card-shot');
        shot.src = game.screenshot;
        shot.alt = `${game.title} in play`;
        shot.loading = 'lazy';
        shot.width = 800;
        shot.height = 450;
        card.append(shot);
    }
    const head = el('div', 'games-hub-card-head');
    if (game.kicker) head.append(el('p', 'games-hub-card-kicker', game.kicker));
    head.append(el('h2', 'games-hub-card-title', game.title));
    card.append(head, el('p', 'games-hub-card-copy', game.description));

    let launch: HTMLAnchorElement | HTMLButtonElement;
    if (game.href) {
        launch = el('a', 'games-enter-btn', game.button);
        launch.href = game.href;
    } else {
        launch = el('button', 'games-enter-btn', game.button);
        launch.type = 'button';
        launch.addEventListener('click', () => callGlobal(game.start));
    }
    const share = el('button', 'games-share-btn', 'Copy link');
    share.type = 'button';
    share.title = gameShareUrl(game);
    share.addEventListener('click', () => copyGameLink(share, game));
    const actions = el('div', 'games-hub-card-actions');
    actions.append(launch, share);
    card.append(actions);
    return card;
}

/**
 * Toggles between dark and light theme, persisting the choice in localStorage.
 * Disabled while the game is live (combat forces dark).
 */
function toggleTheme(): void {
    if (document.body.classList.contains('cylon-game-live')) return;

    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcon(newTheme);
}

/**
 * Initializes the theme from localStorage or defaults to dark.
 * Game mode always starts off on load, so the saved preference is restored.
 */
function initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

/** Force dark during combat without overwriting the user's saved preference. */
function applyCombatTheme(on: boolean): void {
    const html = document.documentElement;
    if (on) {
        html.setAttribute('data-bs-theme', 'dark');
        updateThemeIcon('dark');
        return;
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * Updates the theme icon based on the current theme.
 */
function updateThemeIcon(theme: string): void {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;

    if (theme === 'dark') {
        icon.className = 'bi bi-sun';
    } else {
        icon.className = 'bi bi-moon';
    }
}
