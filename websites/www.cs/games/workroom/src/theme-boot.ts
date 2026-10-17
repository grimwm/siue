// dist/theme.js, the first script in the page head (a classic script, so it
// runs before the first paint): sets data-theme from the remembered choice.
// main.ts runs the live switch.
import { browserThemePorts } from './browser.ts';
import { applyTheme } from './theme.ts';

applyTheme(browserThemePorts());
