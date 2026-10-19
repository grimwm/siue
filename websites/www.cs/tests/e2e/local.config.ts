// Checks that need a local-only docker override (make music-e2e). The main
// config's testDir is this folder; these files end in .local.ts, which its
// default test match never picks up, and select.ts sees no spec. Chrome gets a
// fake microphone, already allowed, so the workroom's recordings run headless.
import { defineConfig } from '@playwright/test';
import base from './playwright.config.ts';

const chrome = base.projects?.[0];
const args = [...(chrome?.use?.launchOptions?.args ?? []), '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'];

export default defineConfig({
  ...base,
  testMatch: ['*.local.ts'],
  projects: chrome ? [{ ...chrome, use: { ...chrome.use, permissions: ['microphone'], launchOptions: { ...chrome.use?.launchOptions, args } } }] : [],
});
