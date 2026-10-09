/* The Island of Crete — a text-based chase (crete).
 * You move once per turn; the creature moves twice. Reach the exit alive.
 * Controls: arrows/WASD = move · arrows/WASD = repeat static patterns ·
 * Z/X/C = use item · N = new run.
 */
(() => {
  "use strict";

  /* ---------- seeded RNG (mulberry32 + string hash) ---------- */
  function hashSeed(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- tuning ---------- */
  const ROWS = 15;
  const COLS = 15;
  const MAX_HP = 20;
  const TOTAL_PAGES = 3;
  const BARRIER_COUNT = 2;
  const MISTAKE_BUDGET = 6;
  const BASH_RANGE = 1;
  const BASH_PUSH = 3;
  const BASH_COOLDOWN = 3;

  /* ---------- items: Z/X/C are far from WASD and 1-3 on purpose ---------- */
  const ITEMS = {
    shard: {
      key: "Z",
      name: "Mirror Shard",
      desc: "Freeze the creature for one full turn.",
    },
    snack: {
      key: "X",
      name: "Sugar Puffs",
      desc: "Heal. Potency is rolled per run.",
    },
    jammer: {
      key: "C",
      name: "Signal Jammer",
      desc: "Hurl the creature far away. A weapon of static.",
    },
  };

  /* ---------- sound: tiny Web Audio synth, no assets ---------- */
  let AC = null;
  let muted = false;
  function ensureAudio() {
    if (muted) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") void AC.resume();
    } catch (_) {
      /* headless harness or no audio: stay silent */
    }
  }
  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const t = AC.currentTime + (when || 0);
      const o = AC.createOscillator();
      const g = AC.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(AC.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (_) {
      /* silent */
    }
  }
  const SFX = {
    move() {
      tone(220, 0.05);
    },
    bump() {
      tone(90, 0.09, "sine", 0.06);
    },
    pickup() {
      tone(660, 0.06);
      tone(880, 0.08, "square", 0.04, 0.06);
    },
    page() {
      tone(523, 0.08, "sine");
      tone(659, 0.08, "sine", 0.04, 0.08);
      tone(784, 0.1, "sine", 0.04, 0.16);
    },
    open() {
      tone(330, 0.07);
      tone(495, 0.1, "square", 0.04, 0.07);
    },
    bash() {
      tone(140, 0.12, "sawtooth", 0.06);
      tone(90, 0.1, "sine", 0.06, 0.05);
    },
    hurt() {
      tone(300, 0.15, "sawtooth", 0.05);
      tone(190, 0.2, "sawtooth", 0.05, 0.1);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) =>
        tone(f, 0.12, "square", 0.04, i * 0.1),
      );
    },
    lose() {
      tone(160, 0.4, "sawtooth", 0.06);
      tone(110, 0.55, "sawtooth", 0.06, 0.2);
    },
    heart() {
      tone(70, 0.1, "sine", 0.07);
    },
  };

  /* ---------- state ---------- */
  const G = {
    seed: "",
    rng: null,
    walls: [],
    safe: new Set(),
    barriers: new Set(),
    pickups: new Map(),
    player: { r: 1, c: 1 },
    foe: { r: 1, c: 1 },
    exit: { r: ROWS - 2, c: COLS - 2 },
    hp: MAX_HP,
    turns: 0,
    pages: 0,
    score: 0,
    opened: 0,
    inv: { shard: 1, snack: 1, jammer: 1 },
    fuses: 0,
    snackHeal: 5,
    foeSpawnDist: 0,
    frozen: 0,
    bashCd: 0,
    dazed: 0,
    hint: null,
    hintTimer: 0,
    showRoute: false,
    auto: false,
    autoTimer: 0,
    over: false,
    won: false,
    deathCause: "",
  };

  const key = (r, c) => r + "," + c;
  const inBounds = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
  const DIRS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  /* ---------- maze generation (randomized DFS + loop openings) ---------- */
  function carveMaze(rng) {
    const walls = Array.from({ length: ROWS }, () => Array(COLS).fill(true));
    const stack = [[1, 1]];
    walls[1][1] = false;
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const opts = [];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr * 2,
          nc = c + dc * 2;
        if (
          nr > 0 &&
          nr < ROWS - 1 &&
          nc > 0 &&
          nc < COLS - 1 &&
          walls[nr][nc]
        ) {
          opts.push([nr, nc, r + dr, c + dc]);
        }
      }
      if (!opts.length) {
        stack.pop();
        continue;
      }
      const [nr, nc, br, bc] = opts[Math.floor(rng() * opts.length)];
      walls[br][bc] = false;
      walls[nr][nc] = false;
      stack.push([nr, nc]);
    }
    // Open loops so the chase has more than one line of escape.
    for (let i = 0; i < 16; i++) {
      const r = 1 + Math.floor(rng() * (ROWS - 2));
      const c = 1 + Math.floor(rng() * (COLS - 2));
      if (!walls[r][c]) continue;
      const horiz = !walls[r][c - 1] && !walls[r][c + 1];
      const vert = !walls[r - 1]?.[c] && !walls[r + 1]?.[c];
      if (horiz !== vert) walls[r][c] = false;
    }
    return walls;
  }

  function bfsDist(walls, t) {
    const dist = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
    if (walls[t.r][t.c]) return dist;
    const q = [[t.r, t.c]];
    dist[t.r][t.c] = 0;
    while (q.length) {
      const [r, c] = q.shift();
      for (const [dr, dc] of DIRS) {
        const nr = r + dr,
          nc = c + dc;
        if (inBounds(nr, nc) && !walls[nr][nc] && dist[nr][nc] === -1) {
          dist[nr][nc] = dist[r][c] + 1;
          q.push([nr, nc]);
        }
      }
    }
    return dist;
  }

  function bfsPath(walls, from, to) {
    const dist = bfsDist(walls, to);
    if (dist[from.r][from.c] === -1) return [];
    const path = [{ ...from }];
    let cur = { ...from };
    while (cur.r !== to.r || cur.c !== to.c) {
      const next = DIRS.map(([dr, dc]) => ({ r: cur.r + dr, c: cur.c + dc }))
        .filter(
          (p) =>
            inBounds(p.r, p.c) && !walls[p.r][p.c] && dist[p.r][p.c] !== -1,
        )
        .sort((a, b) => dist[a.r][a.c] - dist[b.r][b.c])[0];
      if (!next) return [];
      path.push(next);
      cur = next;
    }
    return path;
  }

  /* ---------- run setup: fresh maze, fresh stats, permadeath ---------- */
  function newRun(seedStr) {
    const seed =
      (seedStr || "").trim() ||
      "stefan-" + Math.floor(Math.random() * 9000 + 1000);
    const rng = mulberry32(hashSeed(seed));

    const start = { r: 1, c: 1 };
    const exit = { r: ROWS - 2, c: COLS - 2 };
    // Generate until the escape math works: optimal route length plus a spare
    // mistake budget must fit inside the creature's starting distance.
    // Deterministic per seed — attempts just advance the same rng stream.
    let best = null;
    for (let attempt = 0; attempt < 80; attempt++) {
      const cand = buildMaze(rng, start, exit);
      if (!best || cand.margin > best.margin) best = cand;
      if (cand.margin >= MISTAKE_BUDGET) {
        best = cand;
        break;
      }
    }
    const { walls, safe, barriers, pickups, foe, foeDist, optimal, margin } =
      best;

    function buildMaze(rng, start, exit) {
      const walls = carveMaze(rng);
      const path = bfsPath(walls, start, exit);

      // Two safe zones straddling the escape route, kept apart so both survive.
      const safe = new Set();
      let prev = null;
      for (const frac of [1 / 3, 2 / 3]) {
        let idx = Math.floor(path.length * frac);
        let spot = path[idx] || exit;
        while (
          prev &&
          idx < path.length - 2 &&
          Math.abs(spot.r - prev.r) + Math.abs(spot.c - prev.c) < 6
        ) {
          idx += 1;
          spot = path[idx];
        }
        prev = spot;
        for (const [dr, dc] of [
          [0, 0],
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const r = spot.r + dr,
            c = spot.c + dc;
          if (r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1) {
            walls[r][c] = false;
            safe.add(key(r, c));
          }
        }
      }
      safe.delete(key(start.r, start.c));
      safe.delete(key(exit.r, exit.c));

      const taken = new Set([
        key(start.r, start.c),
        key(exit.r, exit.c),
        ...safe,
      ]);

      // Fuse barriers sit on the escape route, spaced so they never bunch up.
      // A closed barrier is a real wall until a fuse opens it. Nothing pauses.
      const barriers = new Set();
      for (let i = 0; i < BARRIER_COUNT; i++) {
        let idx = Math.floor((path.length * (i + 1)) / (BARRIER_COUNT + 1));
        while (
          idx < path.length - 1 &&
          taken.has(key(path[idx].r, path[idx].c))
        )
          idx++;
        const cell = path[idx];
        if (!taken.has(key(cell.r, cell.c))) {
          barriers.add(key(cell.r, cell.c));
          walls[cell.r][cell.c] = true;
          taken.add(key(cell.r, cell.c));
        }
      }

      // Loot must be reachable without crossing a closed barrier, or fuses deadlock.
      const reach = bfsDist(walls, start);
      const open = [];
      for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
          const k = key(r, c);
          if (!walls[r][c] && reach[r][c] !== -1 && !taken.has(k))
            open.push({ r, c });
        }
      }
      const pickups = new Map();
      const loot = [
        "shard",
        "snack",
        "jammer",
        "page",
        "page",
        "page",
        "fuse",
        "fuse",
      ];
      for (const kind of loot) {
        if (!open.length) break;
        const spot = open.splice(Math.floor(rng() * open.length), 1)[0];
        pickups.set(key(spot.r, spot.c), kind);
        taken.add(key(spot.r, spot.c));
      }

      // The creature starts far: farthest from you, never camping the exit.
      // margin = spare turns = foe distance minus your optimal route. That is how
      // many wrong turns you can afford before escape becomes impossible.
      const dist = bfsDist(walls, start);
      const distExit = bfsDist(walls, exit);
      const openWalls = walls.map((row) => row.slice());
      for (const k of barriers) {
        const [br, bc] = k.split(",").map(Number);
        openWalls[br][bc] = false;
      }
      const optimal = bfsDist(openWalls, start)[exit.r][exit.c];
      const spots = [];
      for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
          if (!walls[r][c] && !taken.has(key(r, c)) && dist[r][c] !== -1)
            spots.push({ r, c });
        }
      }
      const farFromExit = spots.filter((p) => distExit[p.r][p.c] >= 10);
      const pool = farFromExit.length ? farFromExit : spots;
      let foe = null,
        foeDist = -1;
      for (const p of pool) {
        if (dist[p.r][p.c] > foeDist) {
          foeDist = dist[p.r][p.c];
          foe = p;
        }
      }
      if (!foe) foe = { ...exit };
      if (foeDist < 0) foeDist = 0;
      const margin = foeDist - optimal;
      return { walls, safe, barriers, pickups, foe, foeDist, optimal, margin };
    }

    Object.assign(G, {
      seed,
      rng,
      walls,
      safe,
      barriers,
      pickups,
      player: { ...start },
      foe,
      hp: MAX_HP,
      turns: 0,
      pages: 0,
      score: 0,
      opened: 0,
      optimal,
      budget: margin,
      inv: { shard: 1, snack: 1, jammer: 1 },
      fuses: 0,
      snackHeal: 4 + Math.floor(rng() * 3),
      foeSpawnDist: foeDist,
      frozen: 0,
      bashCd: 0,
      dazed: 0,
      hint: null,
      hintTimer: 0,
      showRoute: false,
      auto: false,
      autoTimer: 0,
      over: false,
      won: false,
      deathCause: "",
    });
  }

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const stageEl = () => $("stage");
  const logEl = () => $("log");

  function say(text, tone) {
    const li = document.createElement("li");
    if (tone) li.className = tone;
    li.textContent = text;
    const log = logEl();
    log.appendChild(li);
    while (log.children.length > 80) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
  }

  const LOOT_EMOJI = {
    shard: "🔮",
    snack: "🥣",
    jammer: "📻",
    page: "📄",
    fuse: "🔌",
  };

  function render() {
    const { walls, safe, barriers, pickups, player, foe, exit } = G;
    const stage = stageEl();
    stage.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    const route = new Set(
      G.showRoute ? goalPath().map((p) => key(p.r, p.c)) : [],
    );
    let html = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = key(r, c);
        let ch = walls[r][c] ? "⬛" : "";
        let cls = "cell";
        if (!walls[r][c] && r === exit.r && c === exit.c) {
          ch = "🚪";
          cls += " e";
        }
        if (safe.has(k)) {
          ch = "🛡️";
          cls += " s";
        }
        if (pickups.has(k)) {
          ch = LOOT_EMOJI[pickups.get(k)] || "🎁";
          cls += " i";
        }
        if (barriers.has(k)) {
          ch = "🚧";
          cls += " g";
        }
        if (r === foe.r && c === foe.c && !(r === player.r && c === player.c)) {
          ch = G.frozen > 0 ? "🥶" : "👹";
          cls += " c";
        }
        if (r === player.r && c === player.c) {
          ch = "🧑‍💻";
          cls += " p";
        }
        if (route.has(k)) cls += " rt";
        if (G.hint === k) cls += " hm";
        html += `<span class="${cls}">${ch}</span>`;
      }
    }
    stage.innerHTML = html;

    $("hud-hp").textContent = `${G.hp}/${MAX_HP}`;
    $("hud-turns").textContent = String(G.turns);
    $("hud-pages").textContent = `${G.pages}/${TOTAL_PAGES}`;
    $("hud-score").textContent = String(G.score);
    $("hud-fuses").textContent = String(G.fuses);
    $("hud-bash").textContent =
      G.bashCd > 0 ? `recharging (${G.bashCd})` : "ready (Space)";
    if (!G.over && G.turns > 0) {
      const d = bfsDist(walls, player)[foe.r][foe.c];
      if (d >= 0 && d <= 4) SFX.heart();
    }
    const d = bfsDist(walls, player)[foe.r][foe.c];
    $("hud-dist").textContent =
      G.frozen > 0
        ? `frozen solid (${G.frozen} turn${G.frozen === 1 ? "" : "s"})`
        : safe.has(key(player.r, player.c))
          ? "pacing outside your safe zone"
          : d < 0
            ? "lost in the static"
            : `${d} steps away — and it moves twice`;

    $("run-stats").textContent =
      `Seed ${G.seed} · optimal route ${G.optimal} moves · mistake budget ${G.budget} ` +
      `· Sugar Puffs heal ${G.snackHeal} · creature pace 2/turn, spawned ${G.foeSpawnDist} away`;

    const inv = $("inventory");
    inv.innerHTML = "";
    for (const kind of Object.keys(ITEMS)) {
      const def = ITEMS[kind];
      const li = document.createElement("li");
      const left = document.createElement("span");
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = `${LOOT_EMOJI[kind]} ${def.name} × ${G.inv[kind]} `;
      const k = document.createElement("kbd");
      k.textContent = def.key;
      name.appendChild(k);
      const desc = document.createElement("span");
      desc.className = "desc";
      const useNote =
        kind === "shard" ? " Move right after." : " Using it costs your turn.";
      desc.textContent =
        (kind === "snack" ? `Heal ${G.snackHeal} HP.` : def.desc) + useNote;
      left.appendChild(name);
      left.appendChild(desc);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = `Use (${def.key})`;
      btn.disabled = G.over || G.inv[kind] <= 0;
      btn.addEventListener("click", () => useItem(kind));
      li.appendChild(left);
      li.appendChild(btn);
      inv.appendChild(li);
    }
  }

  /* ---------- the chase: two creature steps per player turn ---------- */
  function foeStep() {
    const { walls, safe, player, foe } = G;
    if (foe.r === player.r && foe.c === player.c) return;
    const dist = bfsDist(walls, player);
    const options = DIRS.map(([dr, dc]) => ({
      r: foe.r + dr,
      c: foe.c + dc,
    })).filter(
      (p) => inBounds(p.r, p.c) && !walls[p.r][p.c] && !safe.has(key(p.r, p.c)),
    );
    if (!options.length) return;
    options.sort((a, b) => {
      const da = dist[a.r][a.c] === -1 ? 1e9 : dist[a.r][a.c];
      const db = dist[b.r][b.c] === -1 ? 1e9 : dist[b.r][b.c];
      return da - db;
    });
    const bestD = dist[options[0].r][options[0].c];
    const tied = options.filter((p) => dist[p.r][p.c] === bestD);
    const next = tied[Math.floor(G.rng() * tied.length)];
    foe.r = next.r;
    foe.c = next.c;
  }

  function creaturePhase(bonusSteps) {
    if (G.over) return;
    G.bashCd = Math.max(0, G.bashCd - 1);
    const slowed = G.dazed > 0;
    G.dazed = 0;
    if (G.frozen > 0) {
      G.frozen -= 1;
      say("The creature judders, trapped inside the mirror static.", "good");
      return;
    }
    const steps = (slowed ? 1 : 2) + (bonusSteps || 0);
    for (let i = 0; i < steps; i++) {
      foeStep();
      if (
        G.foe.r === G.player.r &&
        G.foe.c === G.player.c &&
        !G.safe.has(key(G.player.r, G.player.c))
      ) {
        die("It found you between the frames. The screen goes white.");
        return;
      }
    }
    // Its aura burns: ending a turn beside it costs HP, safe zone or not.
    if (Math.abs(G.foe.r - G.player.r) + Math.abs(G.foe.c - G.player.c) === 1) {
      say("Its proximity burns (−2 HP). Keep moving.", "bad");
      if (wound(2)) {
        render();
        return;
      }
    }
  }

  function die(cause) {
    stopAuto();
    if (G.hintTimer) clearTimeout(G.hintTimer);
    G.hint = null;
    G.over = true;
    G.won = false;
    G.deathCause = cause;
    SFX.lose();
    say(cause, "bad");
    showEnd(false);
  }

  function heal(n) {
    const before = G.hp;
    G.hp = Math.min(MAX_HP, G.hp + n);
    return G.hp - before;
  }

  function wound(n) {
    G.hp -= n;
    SFX.hurt();
    if (G.hp <= 0) {
      G.hp = 0;
      die("The static wore you down to nothing.");
      return true;
    }
    return false;
  }

  function grantItem() {
    const kinds = Object.keys(G.inv).filter((k) => G.inv[k] < 3);
    if (!kinds.length) {
      G.score += 25;
      say("Pockets full. Tuckersoft wires you 25 points instead.", "info");
      return;
    }
    const kind = kinds[Math.floor(G.rng() * kinds.length)];
    G.inv[kind] += 1;
    say(
      `Found: ${ITEMS[kind].name}. Press ${ITEMS[kind].key} or the Use button to spend it.`,
      "good",
    );
  }

  /* ---------- player actions ---------- */
  let autoPilot = false;
  function blockedMsg() {
    if (G.auto && !autoPilot) {
      say("Play-through is running — press T to take over.", "info");
      return true;
    }
    if (G.over) {
      say("Run over — press N for a new run.", "info");
      return true;
    }
    return false;
  }

  function tryMove(dr, dc) {
    if (blockedMsg()) return;
    const nr = G.player.r + dr,
      nc = G.player.c + dc;
    if (!inBounds(nr, nc) || G.walls[nr][nc]) {
      if (G.barriers.has(key(nr, nc))) {
        if (G.fuses > 0) {
          G.fuses -= 1;
          G.opened += 1;
          G.barriers.delete(key(nr, nc));
          G.walls[nr][nc] = false;
          G.score += 40;
          SFX.open();
          say("Key placed. The 🚧 barrier grinds open (+40). Run!", "good");
        } else {
          SFX.bump();
          say(
            "🚧 barrier. It wants a 🔌 fuse. Find one — the Labyrinth never waits.",
            "info",
          );
          return;
        }
      } else {
        SFX.bump();
        say("Wall. The Labyrinth declines. That step costs nothing.", "info");
        return;
      }
    }
    G.player.r = nr;
    G.player.c = nc;
    G.turns += 1;
    SFX.move();
    resolveTile();
    if (!G.over) creaturePhase(0);
    render();
  }

  function bash() {
    if (blockedMsg()) return;
    if (G.bashCd > 0) {
      say(`Bash is recharging (${G.bashCd} turns). Move instead.`, "info");
      return;
    }
    const dr = G.foe.r - G.player.r,
      dc = G.foe.c - G.player.c;
    if (Math.abs(dr) + Math.abs(dc) !== BASH_RANGE) {
      say(
        "Nothing in reach. Bash (Space) only lands on the adjacent creature.",
        "info",
      );
      return;
    }
    const stepR = Math.sign(dr),
      stepC = Math.sign(dc);
    let tr = G.foe.r,
      tc = G.foe.c;
    for (let i = 0; i < BASH_PUSH; i++) {
      const nr = tr + stepR,
        nc = tc + stepC;
      if (
        !inBounds(nr, nc) ||
        G.walls[nr][nc] ||
        G.safe.has(key(nr, nc)) ||
        (nr === G.player.r && nc === G.player.c)
      )
        break;
      tr = nr;
      tc = nc;
    }
    G.foe.r = tr;
    G.foe.c = tc;
    G.bashCd = BASH_COOLDOWN;
    G.dazed = 1;
    G.turns += 1;
    SFX.bash();
    say(
      "You slam the static with a CRT monitor. The 👹 reels backwards, dazed — it moves once, not twice.",
      "good",
    );
    creaturePhase(0);
    render();
  }

  function resolveTile() {
    const k = key(G.player.r, G.player.c);
    if (G.player.r === G.exit.r && G.player.c === G.exit.c) {
      G.over = true;
      G.won = true;
      stopAuto();
      SFX.win();
      showEnd(true);
      return;
    }
    if (G.safe.has(k)) {
      say(
        "Safe zone. The static cannot cross the blue lines. Breathe.",
        "good",
      );
    }
    if (G.pickups.has(k)) {
      const kind = G.pickups.get(k);
      G.pickups.delete(k);
      if (kind === "page") {
        G.pages += 1;
        G.score += 100;
        SFX.page();
        say(
          `Script page ${G.pages}/${TOTAL_PAGES} recovered (+100). The ending sharpens.`,
          "good",
        );
      } else if (kind === "fuse") {
        G.fuses += 1;
        G.score += 20;
        SFX.pickup();
        say(
          `🔌 fuse recovered (${G.fuses} held, +20). Barriers fear you.`,
          "good",
        );
      } else {
        G.inv[kind] = Math.min(3, G.inv[kind] + 1);
        SFX.pickup();
        say(
          `Picked up: ${ITEMS[kind].name}. Use it with ${ITEMS[kind].key}.`,
          "good",
        );
      }
    }
  }

  function useItem(kind) {
    if (blockedMsg()) return;
    if (G.inv[kind] <= 0) {
      say(`No ${ITEMS[kind].name} left. The maze keeps what it takes.`, "info");
      return;
    }
    if (kind === "snack" && G.hp >= MAX_HP) {
      say(
        "Already at full health. The Sugar Puffs stay in your pocket — no turn spent.",
        "info",
      );
      return;
    }
    if (kind === "jammer" && !farSpot(6)) {
      say(
        "Signal Jammer hisses. Nowhere far is left to throw it — no turn spent.",
        "info",
      );
      return;
    }
    G.inv[kind] -= 1;
    if (kind === "shard") {
      // Free action: freezing costs no turn, so you move while it stands still.
      G.frozen = 1;
      say(
        "Mirror Shard raised. The creature freezes solid — move, it skips its next turn.",
        "good",
      );
      render();
      return;
    }
    G.turns += 1;
    if (kind === "snack") {
      const got = heal(G.snackHeal);
      say(`Sugar Puffs (+${got} HP). Theseus types faster.`, "good");
      creaturePhase(0);
    } else if (kind === "jammer") {
      const spot = farSpot(6);
      G.foe.r = spot.r;
      G.foe.c = spot.c;
      say(
        "Signal Jammer screams. The creature is hurled deep into the static.",
        "good",
      );
      creaturePhase(0);
    }
    render();
  }

  function farSpot(minDist) {
    const dist = bfsDist(G.walls, G.player);
    const cands = [];
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        const k = key(r, c);
        if (!G.walls[r][c] && !G.safe.has(k) && dist[r][c] >= minDist)
          cands.push({ r, c });
      }
    }
    if (!cands.length) return null;
    return cands[Math.floor(G.rng() * cands.length)];
  }

  /* ---------- hint: one move in advance ---------- */
  function goalPath() {
    const p = bfsPath(G.walls, G.player, G.exit);
    if (p.length) return p;
    const d = bfsDist(G.walls, G.player);
    let target = null,
      bestD = 1e9;
    for (const [k, v] of G.pickups) {
      if (v !== "fuse") continue;
      const [r, c] = k.split(",").map(Number);
      if (d[r][c] !== -1 && d[r][c] < bestD) {
        bestD = d[r][c];
        target = { r, c };
      }
    }
    if (!target) return [];
    return bfsPath(G.walls, G.player, target);
  }

  const DIR_WORD = {
    "-1,0": "north ⬆️",
    "1,0": "south ⬇️",
    "0,-1": "west ⬅️",
    "0,1": "east ➡️",
  };

  function toggleMute() {
    muted = !muted;
    if (!muted) ensureAudio();
    if (typeof document !== "undefined") {
      try {
        document.getElementById("mute").textContent = muted
          ? "🔇 Muted (M)"
          : "🔊 Sound (M)";
      } catch (_) {}
    }
    say(muted ? "Sound off." : "Sound on.", "info");
  }

  function hint() {
    if (blockedMsg()) return;
    const p = goalPath();
    if (p.length < 2) {
      say("No route anywhere. You are the maze now.", "info");
      return;
    }
    const nx = p[1];
    G.hint = key(nx.r, nx.c);
    tone(980, 0.07, "sine", 0.04);
    say(
      `Hint: head ${DIR_WORD[nx.r - G.player.r + "," + (nx.c - G.player.c)]}. One move only — the rest is yours.`,
      "info",
    );
    render();
    if (G.hintTimer) clearTimeout(G.hintTimer);
    G.hintTimer = setTimeout(() => {
      G.hint = null;
      render();
    }, 1600);
  }

  /* ---------- answer: reveal the whole route ---------- */
  function toggleAnswer() {
    if (G.over) {
      say("Run over — press N for a new run.", "info");
      return;
    }
    G.showRoute = !G.showRoute;
    tone(G.showRoute ? 740 : 420, 0.08, "sine", 0.04);
    say(
      G.showRoute
        ? "Answer revealed: the green trail is the shortest way out."
        : "Answer hidden. Back to instinct.",
      "info",
    );
    render();
  }

  /* ---------- play-through: the game plays itself ---------- */
  function toggleAuto() {
    if (G.auto) {
      stopAuto("Play-through paused. Your run again.");
      return;
    }
    if (blockedMsg()) return;
    G.auto = true;
    say("▶ Play-through running. Press T to take over.", "info");
    render();
    G.autoTimer = setInterval(autoStep, 350);
  }

  function stopAuto(msg) {
    if (G.autoTimer) clearInterval(G.autoTimer);
    G.autoTimer = 0;
    G.auto = false;
    if (msg && !G.over) {
      say(msg, "info");
      render();
    }
  }

  function autoStep() {
    if (!G.auto || G.over) {
      stopAuto();
      return;
    }
    autoPilot = true;
    try {
      if (
        Math.abs(G.foe.r - G.player.r) + Math.abs(G.foe.c - G.player.c) === 1 &&
        G.bashCd === 0
      ) {
        bash();
        return;
      }
      const p = goalPath();
      if (p.length < 2) {
        stopAuto("Play-through is stuck. Your move.");
        return;
      }
      tryMove(p[1].r - G.player.r, p[1].c - G.player.c);
    } finally {
      autoPilot = false;
    }
  }

  /* ---------- endings ---------- */
  function showEnd(won) {
    let title, text;
    if (won && G.pages >= TOTAL_PAGES) {
      title = "True Ending: Shut Down the Maze";
      text =
        "Every page recovered, every choice owned. Theseus ships the game, " +
        "and the creature starves outside the safe zones. Five stars in Whitehead’s review.";
    } else if (won && G.pages > 0) {
      title = "Lesser Escape: Out, But Thin";
      text =
        `You reached the exit with ${G.pages}/${TOTAL_PAGES} pages. The game ships with bugs, ` +
        "and something still rustles in the code. It works — barely.";
    } else if (won) {
      title = "Bare Survival: The Hallway Ending";
      text =
        "You escaped with no pages and no proof. Nobody believes the maze was real. " +
        "The creature waits for your sequel.";
    } else {
      title = "Taken: The PAX Ending";
      text = G.deathCause || "The creature reached you.";
    }
    $("end-kicker").textContent = won
      ? "You escaped"
      : "Run over — permadeath, no continues";
    $("end-title").textContent = title;
    $("end-text").textContent = text;
    $("end-score").textContent =
      `Score ${G.score} · ${G.turns} turns · pages ${G.pages}/${TOTAL_PAGES} · ` +
      `barriers opened ${G.opened} · seed ${G.seed}`;
    $("end-veil").hidden = false;
    render();
    const again = $("again");
    if (again) again.focus();
  }

  function hideEnd() {
    $("end-veil").hidden = true;
  }

  function restart(seedStr) {
    hideEnd();
    stopAuto();
    if (G.hintTimer) clearTimeout(G.hintTimer);
    newRun(seedStr);
    logEl().innerHTML = "";
    say(
      `Seed ${G.seed}. Theseus boots the maze. The exit 🚪 glows in the dark.`,
      "info",
    );
    say(
      `Shortest escape is ${G.optimal} moves. You can afford ${G.budget} wrong turns — then it has you.`,
      "info",
    );
    say(
      "Two 🛡️ safe zones wait on the escape route. The 👹 already moves twice to your once.",
      "info",
    );
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("seed", G.seed);
      window.history.replaceState(null, "", url);
    } catch (_) {
      /* file:// or sandbox: seed box still shows it */
    }
    $("seed-input").value = G.seed;
    $("seed-input").blur();
    render();
  }

  /* ---------- input: moves, items, bash, and guides never share a key ---------- */
  const MOVES = {
    arrowup: [-1, 0],
    w: [-1, 0],
    arrowdown: [1, 0],
    s: [1, 0],
    arrowleft: [0, -1],
    a: [0, -1],
    arrowright: [0, 1],
    d: [0, 1],
  };
  const ITEM_KEYS = { z: "shard", x: "snack", c: "jammer" };

  document.addEventListener("keydown", (ev) => {
    if (
      ev.target &&
      (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA")
    )
      return;
    ensureAudio();
    const k = ev.key.toLowerCase();
    if (k === "n") {
      ev.preventDefault();
      restart($("seed-input").value);
      return;
    }
    if (k === "m") {
      toggleMute();
      return;
    }
    if (k === "t") {
      ev.preventDefault();
      toggleAuto();
      return;
    }
    if (k === "v") {
      toggleAnswer();
      return;
    }
    if (k === "h") {
      hint();
      return;
    }
    if (G.over || G.auto) return;
    if (k === " " || k === "spacebar") {
      if (ev.target && ev.target.tagName === "BUTTON") return;
      ev.preventDefault();
      bash();
      return;
    }
    if (MOVES[k]) {
      ev.preventDefault();
      const [dr, dc] = MOVES[k];
      tryMove(dr, dc);
      return;
    }
    if (ITEM_KEYS[k]) {
      ev.preventDefault();
      useItem(ITEM_KEYS[k]);
    }
  });

  document.addEventListener("pointerdown", ensureAudio);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-move]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = btn.getAttribute("data-move");
        if (!dir || G.auto) return;
        const delta = {
          up: [-1, 0],
          down: [1, 0],
          left: [0, -1],
          right: [0, 1],
        }[dir];
        if (delta) tryMove(delta[0], delta[1]);
      });
    });
    $("seed-form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      restart($("seed-input").value);
    });
    $("again").addEventListener("click", () => restart($("seed-input").value));
    $("random-run").addEventListener("click", () => {
      ensureAudio();
      restart("");
    });
    $("mute").addEventListener("click", () => {
      ensureAudio();
      toggleMute();
    });
    $("btn-hint").addEventListener("click", () => {
      ensureAudio();
      hint();
    });
    $("btn-answer").addEventListener("click", () => {
      ensureAudio();
      toggleAnswer();
    });
    $("btn-auto").addEventListener("click", () => {
      ensureAudio();
      toggleAuto();
    });
    $("btn-bash").addEventListener("click", () => {
      ensureAudio();
      bash();
    });
    let seed = "";
    try {
      seed = new URL(window.location.href).searchParams.get("seed") || "";
    } catch (_) {
      /* ignore */
    }
    restart(seed);
  });

  /* Test hook for automated checks: drives the real game logic, no copy. */
  if (typeof window !== "undefined") {
    try {
      window.__mazeTest = {
        G,
        newRun,
        tryMove,
        useItem,
        bash,
        hint,
        toggleAnswer,
        toggleAuto,
        stopAuto,
        autoStep,
        goalPath,
        toggleMute,
        foeStep,
        creaturePhase,
        bfsDist,
        bfsPath,
        key,
        ROWS,
        COLS,
      };
    } catch (_) {
      /* non-DOM harness: ignore */
    }
  }
})();
