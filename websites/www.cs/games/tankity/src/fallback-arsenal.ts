/* The arsenal the page plays with until game.json arrives, and when it cannot
   (file:// play): the free Shell and the two hull gear rows, nothing more. They are
   copies of game.yaml's rows, and test/fallback-arsenal.test.ts fails when one
   drifts from game.json, so a change to those rows lands here in the same commit. */
import type { Gear, Weapon } from './sim.ts';

export const FALLBACK_ARSENAL: { ammo: Weapon[]; gear: Gear[] } = {
  ammo: [
    {key: 'shell', name: 'Shell', cat: 'Shells', dmg: 34, radius: 26, price: 0, pack: 0, minRound: 1, ai: true, aiRound: 1, effect: 'shot', speed: 1.0, drag: 1, note: 'Free, straight, honest.', gfx: {shell: '#ffe27a', trail: '#ffd75e', blast: ['#ffb13c', '#fff3c4'], painter: 'disc', shake: 0.3}}
  ],
  gear: [
    {key: 'repair', name: 'Repair +40 armor', cat: 'Hull and fuel', price: 120, n: 40, effect: 'repair', note: 'Restores up to 40 armor, never past max.'},
    {key: 'fuel', name: 'Fuel +60', cat: 'Hull and fuel', price: 60, n: 60, effect: 'fuel', note: 'Adds 60 driving fuel.'}
  ],
};
