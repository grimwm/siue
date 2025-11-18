/**
 * Shows a div matching the "nav-" id. All other divs with a "nav-" id prefix
 * will be hidden.
 */
function showNavDiv(divId, display = "block") {
    const divs = document.querySelectorAll("div[id^='nav-']");
    divs.forEach(div => { div.style.display = "none"; });
    document.getElementById(`nav-${divId}`).style.display = display;
}

/**
 * Toggles between dark and light theme, persisting the choice in localStorage.
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
}

/**
 * Initializes the theme from localStorage or defaults to dark.
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;
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
        // Sun icon for dark mode (clicking will switch to light)
        icon.className = 'bi bi-sun';
    } else {
        // Moon icon for light mode (clicking will switch to dark)
        icon.className = 'bi bi-moon';
    }
}
