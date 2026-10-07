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

/** Open the games hub (The CIC lives there; Game Off/On also starts a run). */
function showGamesHub() {
    showNavDiv('games');
}

/** Start The CIC from the hub (same as flipping Game On). */
function enterTheCic() {
    if (typeof window.cylonStartGame === 'function') {
        window.cylonStartGame();
    }
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
