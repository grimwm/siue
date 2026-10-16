/* The arsenal the page plays with until game.json arrives, and when it cannot
   (file:// play): the free Shell, a few classic guns, and the two hull gear rows. They are
   copies of game.yaml's rows, and test/fallback-arsenal.test.ts fails when one
   drifts from game.json, so a change to those rows lands here in the same commit. The
   drone personalities ride along the same way. */
import type { Gear, Personality, Weapon } from './sim.ts';

export const FALLBACK_ARSENAL: { ammo: Weapon[]; gear: Gear[] } = {
  ammo: [
    {key: 'shell', name: 'Shell', cat: 'Shells', dmg: 34, radius: 26, price: 0, pack: 0, ai: true, effect: 'shot', speed: 1.0, drag: 1, note: 'Free, straight, honest.', gfx: {shell: '#ffe27a', trail: '#ffd75e', blast: ['#ffb13c', '#fff3c4'], painter: 'disc', shake: 0.3}},
    {"key": "buck", "name": "Buckshot", "cat": "Shells", "dmg": 17, "radius": 20, "price": 140, "pack": 2, "start": 1, "ai": true, "effect": "pellets", "pellets": 3, "spread": 0.1, "speed": 1.0, "drag": 2.4, "shortRange": true, "note": "Three pellets, forgiving aim.", "gfx": {"shell": "#ffd166", "trail": "#ffb13c", "blast": ["#ffb13c", "#fff3c4"], "painter": "disc", "shake": 0.3}},
    {"key": "mortar", "name": "Mortar", "cat": "Shells", "dmg": 48, "radius": 42, "price": 200, "pack": 2, "ai": true, "effect": "shot", "speed": 1.0, "drag": 0.8, "note": "Big crater, slow shell.", "gfx": {"shell": "#ff9f43", "trail": "#ff7b39", "blast": ["#ff7b39", "#ffe27a"], "painter": "disc", "shake": 0.5}},
    {"key": "needle", "name": "Needle", "cat": "Shells", "line": "trick", "dmg": 110, "radius": 8, "price": 120, "pack": 1, "ai": true, "effect": "shot", "speed": 1.3, "drag": 0.4, "note": "Tiny blast, brutal direct hit.", "gfx": {"shell": "#ffffff", "trail": "#caf0f8", "blast": ["#ffffff", "#9fd8ff"], "painter": "beam", "shake": 0.3}},
    {"key": "nuke", "name": "NUKE", "cat": "Nukes", "dmg": 120, "radius": 70, "price": 500, "pack": 1, "ai": false, "effect": "shot", "speed": 1.0, "drag": 0.55, "missile": true, "missileSpeed": [84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 84.89615380260602, 89.18568892089297, 93.30615300108093, 97.28133434215579, 101.1269090183896, 104.86047580647664, 108.49219952582189, 112.03204192348949, 115.48874774227897, 118.86979119831722, 122.18357943933825, 125.43364484992253, 128.62450222246025, 131.76274045605624, 134.85105978867523, 137.89278927490614, 140.89218862563484, 143.85129672562925, 146.77241636297822, 149.65988575946994, 152.51345693895473, 155.3359255463829, 158.1308410075735, 160.89793358396037, 163.63897668205482, 166.35558887840943, 169.04950911239666, 171.72260334158182, 174.3751395699246, 177.00828806166555, 179.62313145801545, 182.22067373686968, 184.80184806571287, 187.36752368924044, 189.9185120476568, 192.45557215831013, 194.97941542759236, 197.49070988584663, 199.99008400858202, 202.47822184403503, 204.95644106533746, 207.42451191696546, 209.8829294984307, 212.3321635905222, 214.7726606040169, 217.204845379606, 219.63028676724662, 222.04858956334192, 224.4597981781726, 226.8642623200185, 229.2629076736057, 231.65669976880508, 234.0447563259704, 236.4273715858917, 238.80604661460438, 241.18066928685494, 243.55070309756684, 245.91703824098204, 248.28085033394473, 250.64083201661106, 252.9978149057797, 255.35315304688538, 257.7053421986193, 260.05564462468556, 262.4046090558704, 264.75104230427405, 267.0970718030594, 269.44156646904503, 271.7846593407421, 274.1280365463763, 276.46980131915825, 278.81221594157523, 281.15397119579484, 283.4957681422611, 285.83822729108306, 288.1802669844774, 290.52410706513456, 292.86743662352364, 295.21307120539404, 297.55871006208963, 299.90651121463543, 302.25506308164313, 304.60575619334577, 306.9577997070837, 309.3120788564147, 311.66817008164344, 314.0267009329136, 316.3873756053863, 318.75079801065567, 321.11657353300416, 323.4855038654541], "note": "Levels whole hillsides.", "gfx": {"shell": "#ff6b6b", "trail": "#ff6b6b", "blast": ["#ff6b6b", "#fff3c4"], "painter": "disc", "shake": 0.9, "linger": 0.8}}
  ],
  gear: [
    {key: 'repair', name: 'Repair +40 armor', cat: 'Hull and fuel', price: 120, n: 40, effect: 'repair', note: 'Restores up to 40 armor, never past max.'},
    {key: 'fuel', name: 'Fuel +60', cat: 'Hull and fuel', price: 60, n: 60, effect: 'fuel', note: 'Adds 60 driving fuel.'}
  ],
};

export const FALLBACK_DRONES: { personalities: Personality[] } = {
  personalities: [
    {key: 'saver', name: 'Saver', reserve: 0.5, defense: 0.1, pick: 'big', maxBuys: 3},
    {key: 'scrapper', name: 'Scrapper', reserve: 0, defense: 0.1, pick: 'value', maxBuys: 8},
    {key: 'turtle', name: 'Turtle', reserve: 0.1, defense: 0.6, pick: 'value', maxBuys: 6},
    {key: 'gambler', name: 'Gambler', reserve: 0, defense: 0.15, pick: 'random', maxBuys: 6},
    {key: 'sniper', name: 'Sniper', reserve: 0.2, defense: 0.15, pick: 'precise', maxBuys: 4},
    {key: 'shapeshifter', name: 'Shapeshifter', shift: 0.35}
  ],
};
