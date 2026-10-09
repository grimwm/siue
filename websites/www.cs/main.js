/**
 * Shows a panel matching the "nav-" id. All other panels with a "nav-" id prefix
 * are hidden.
 */
function showNavDiv(divId) {
    const divs = document.querySelectorAll("[id^='nav-']");
    divs.forEach(div => { div.classList.remove("is-active"); });
    const target = document.getElementById(`nav-${divId}`);
    if (target) {
        target.classList.add("is-active");
    }
}

/** Open the games hub (cards come from loadGamesHub; Game Off/On also starts The CIC). */
function showGamesHub() {
    showNavDiv('games');
}

/**
 * Fills the games hub with one card per games/<id>/metadata.yaml, as listed
 * by games.php. A card either links to the game's page (`href`) or calls a
 * page function that mounts the game in place (`start`).
 */
async function loadGamesHub() {
    const list = document.getElementById('games-hub-list');
    if (!list) return;
    const status = (text) => {
        const li = document.createElement('li');
        li.className = 'games-hub-status';
        li.textContent = text;
        list.replaceChildren(li);
    };

    let hub;
    try {
        const res = await fetch('games.php', { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`games.php answered ${res.status}`);
        hub = await res.json();
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
}

function gamesHubCard(game) {
    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    const card = el('li', 'games-hub-card');
    card.dataset.game = game.id;
    const head = el('div', 'games-hub-card-head');
    if (game.kicker) head.append(el('p', 'games-hub-card-kicker', game.kicker));
    head.append(el('h2', 'games-hub-card-title', game.title));
    card.append(head, el('p', 'games-hub-card-copy', game.description));

    let launch;
    if (game.href) {
        launch = el('a', 'games-enter-btn', game.button);
        launch.href = game.href;
    } else {
        launch = el('button', 'games-enter-btn', game.button);
        launch.type = 'button';
        launch.addEventListener('click', () => {
            const start = window[game.start];
            if (typeof start === 'function') start();
        });
    }
    card.append(launch);
    return card;
}

/**
 * Toggles between dark and light theme, persisting the choice in localStorage.
 * Disabled while the game is live (combat forces dark).
 */
function toggleTheme() {
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
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

/** Force dark during combat without overwriting the user's saved preference. */
function applyCombatTheme(on) {
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
function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;

    if (theme === 'dark') {
        icon.className = 'bi bi-sun';
    } else {
        icon.className = 'bi bi-moon';
    }
}
