// Checks that need a local-only docker override (make music-e2e). The main
// config's testDir is this folder; these files end in .local.ts, which its
// default test match never picks up, and select.ts sees no spec.
import { defineConfig } from '@playwright/test';
import base from './playwright.config.ts';

export default defineConfig({ ...base, testMatch: ['*.local.ts'], projects: base.projects?.slice(0, 1) ?? [] });
