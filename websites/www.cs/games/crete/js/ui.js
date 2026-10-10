const LOOT_EMOJI = {
    shard: "🔮",
    snack: "🥣",
    jammer: "📻",
    page: "📄",
    fuse: "🔌",
};
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
const PAD_MOVES = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
};
const ITEM_KEYS = { z: "shard", x: "snack", c: "jammer" };
const $ = (id) => document.getElementById(id);
const seedBox = () => $("seed-input");
export function createUi(deps) {
    const { ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS, key } = deps;
    function say(text, tone) {
        const li = document.createElement("li");
        if (tone)
            li.className = tone;
        li.textContent = text;
        const log = $("log");
        log.appendChild(li);
        while (log.children.length > 80)
            log.removeChild(log.firstChild);
        log.scrollTop = log.scrollHeight;
    }
    function render(game) {
        const G = game.G;
        const { walls, safe, barriers, pickups, player, foe, exit } = G;
        const stage = $("stage");
        stage.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        const route = new Set(G.showRoute ? game.goalPath().map((p) => key(p.r, p.c)) : []);
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
                if (route.has(k))
                    cls += " rt";
                if (G.hint === k)
                    cls += " hm";
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
        const d = game.foeDistance();
        if (!G.over && G.turns > 0) {
            if (d >= 0 && d <= 4)
                deps.heart();
        }
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
            const useNote = kind === "shard" ? " Move right after." : " Using it costs your turn.";
            desc.textContent =
                (kind === "snack" ? `Heal ${G.snackHeal} HP.` : def.desc) + useNote;
            left.appendChild(name);
            left.appendChild(desc);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = `Use (${def.key})`;
            btn.disabled = G.over || G.inv[kind] <= 0;
            btn.addEventListener("click", () => game.useItem(kind));
            li.appendChild(left);
            li.appendChild(btn);
            inv.appendChild(li);
        }
    }
    /* ---------- endings ---------- */
    function showEnd(game, won) {
        const G = game.G;
        let title, text;
        if (won && G.pages >= TOTAL_PAGES) {
            title = "True Ending: Shut Down the Maze";
            text =
                "Every page recovered, every choice owned. Theseus ships the game, " +
                    "and the creature starves outside the safe zones. Five stars in Whitehead’s review.";
        }
        else if (won && G.pages > 0) {
            title = "Lesser Escape: Out, But Thin";
            text =
                `You reached the exit with ${G.pages}/${TOTAL_PAGES} pages. The game ships with bugs, ` +
                    "and something still rustles in the code. It works — barely.";
        }
        else if (won) {
            title = "Bare Survival: The Hallway Ending";
            text =
                "You escaped with no pages and no proof. Nobody believes the maze was real. " +
                    "The creature waits for your sequel.";
        }
        else {
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
        render(game);
        const again = document.getElementById("again");
        if (again)
            again.focus();
    }
    function hideEnd() {
        $("end-veil").hidden = true;
    }
    function showSeed(seed) {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set("seed", seed);
            window.history.replaceState(null, "", url);
        }
        catch (_) {
            /* file:// or sandbox: seed box still shows it */
        }
        seedBox().value = seed;
        seedBox().blur();
    }
    function setMuteLabel(muted) {
        $("mute").textContent = muted ? "🔇 Muted (M)" : "🔊 Sound (M)";
    }
    /* ---------- input: moves, items, bash, and guides never share a key ---------- */
    function bindControls({ game, restart, toggleMute, wake }) {
        const G = game.G;
        document.addEventListener("keydown", (ev) => {
            const tag = ev.target?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA")
                return;
            wake();
            const k = ev.key.toLowerCase();
            if (k === "n") {
                ev.preventDefault();
                restart(seedBox().value);
                return;
            }
            if (k === "m") {
                toggleMute();
                return;
            }
            if (k === "t") {
                ev.preventDefault();
                game.toggleAuto();
                return;
            }
            if (k === "v") {
                game.toggleAnswer();
                return;
            }
            if (k === "h") {
                game.hint();
                return;
            }
            if (G.over || G.auto)
                return;
            if (k === " " || k === "spacebar") {
                if (tag === "BUTTON")
                    return;
                ev.preventDefault();
                game.bash();
                return;
            }
            const move = MOVES[k];
            if (move) {
                ev.preventDefault();
                game.tryMove(move[0], move[1]);
                return;
            }
            const item = ITEM_KEYS[k];
            if (item) {
                ev.preventDefault();
                game.useItem(item);
            }
        });
        document.addEventListener("pointerdown", wake);
        document.querySelectorAll("[data-move]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const dir = btn.getAttribute("data-move");
                if (!dir || G.auto)
                    return;
                const delta = PAD_MOVES[dir];
                if (delta)
                    game.tryMove(delta[0], delta[1]);
            });
        });
        $("seed-form").addEventListener("submit", (ev) => {
            ev.preventDefault();
            restart(seedBox().value);
        });
        $("again").addEventListener("click", () => restart(seedBox().value));
        $("random-run").addEventListener("click", () => {
            wake();
            restart("");
        });
        $("mute").addEventListener("click", () => {
            wake();
            toggleMute();
        });
        $("btn-hint").addEventListener("click", () => {
            wake();
            game.hint();
        });
        $("btn-answer").addEventListener("click", () => {
            wake();
            game.toggleAnswer();
        });
        $("btn-auto").addEventListener("click", () => {
            wake();
            game.toggleAuto();
        });
        $("btn-bash").addEventListener("click", () => {
            wake();
            game.bash();
        });
    }
    return {
        say, render, showEnd, hideEnd, showSeed, setMuteLabel, bindControls,
        clearLog: () => { $("log").innerHTML = ""; },
    };
}
