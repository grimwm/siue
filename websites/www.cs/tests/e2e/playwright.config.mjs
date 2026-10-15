// Runs against E2E_BASE_URL (the site root, ending in /): local docker from
// `make url`, or https://www.cs.siue.edu/~wgrim/. Never starts a server.
import { defineConfig } from '@playwright/test';

const base = process.env.E2E_BASE_URL;
if (!base) throw new Error('Set E2E_BASE_URL to the site root, e.g. E2E_BASE_URL=$(make -C ../.. url)');

export default defineConfig({
  testDir: '.',
  timeout: 120_000,
  workers: 1, // room tests share one server's room cap and throttles
  // A shared CI runner stalls frames now and then; a spec that fails once
  // and passes on retry shows up as flaky in the report, not as a red build.
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: {
    baseURL: base.endsWith('/') ? base : base + '/',
    viewport: { width: 1280, height: 860 },
    screenshot: 'only-on-failure',
  },
  // Chrome runs everything. E2E_WEBKIT=1 adds WebKit for the specs that judge
  // drawing across engines (needs `npx playwright install webkit`; CI installs Chrome only).
  projects: [
    {
      name: 'chrome',
      // Never audible, never autoplaying: an orphaned browser must not play music.
      use: { channel: 'chrome', launchOptions: { args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] } },
    },
    ...(process.env.E2E_WEBKIT ? [{ name: 'webkit', use: { browserName: 'webkit' }, testMatch: ['tankity-sky-camera.spec.mjs'] }] : []),
  ],
});
