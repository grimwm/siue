// Runs against E2E_BASE_URL (the site root, ending in /): local docker from
// `make url`, or https://www.cs.siue.edu/~wgrim/. Never starts a server.
import { defineConfig } from '@playwright/test';

const base = process.env.E2E_BASE_URL;
if (!base) throw new Error('Set E2E_BASE_URL to the site root, e.g. E2E_BASE_URL=$(make -C ../.. url)');

export default defineConfig({
  testDir: '.',
  timeout: 120_000,
  workers: 1, // room tests share one server's room cap and throttles
  reporter: [['list']],
  use: {
    baseURL: base.endsWith('/') ? base : base + '/',
    channel: 'chrome',
    viewport: { width: 1280, height: 860 },
    screenshot: 'only-on-failure',
  },
});
