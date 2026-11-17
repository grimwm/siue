### Task 4: KO-tier bot cap

**Files:**
- Modify: `websites/www.cs/main.js` — `spawnBot`, `launchWave`; replace `MAX_BOTS` uses

**Interfaces:**
- Consumes: `koScore`, `BOT_HARD_CAP`, `BOT_CAP_START`, `BOT_CAP_PER_KOS`
- Produces: `botCap()` → number

- [ ] **Step 1: Replace MAX_BOTS**

Remove or stop using `const MAX_BOTS = 4` for spawn limits.

```javascript
    function botCap() {
        return Math.min(BOT_HARD_CAP, BOT_CAP_START + Math.floor(koScore / BOT_CAP_PER_KOS));
    }
```

In `spawnBot`:

```javascript
        if (!isGameLive() || activeBots >= botCap()) return false;
```

In `launchWave`:

```javascript
        const room = botCap() - activeBots;
        if (room <= 0) return;
        const isWave = Math.random() < 0.55;
        const maxBatch = Math.min(room, Math.max(2, Math.min(4, Math.floor(botCap() / 3))));
        const count = isWave
            ? Math.min(room, 2 + Math.floor(Math.random() * Math.max(1, maxBatch - 1)))
            : 1;
```

Keep `MAX_WAVE` only if still useful; otherwise drop in favor of `maxBatch`.

- [ ] **Step 2: Verify + commit**

```bash
node --check websites/www.cs/main.js
rg "MAX_BOTS" websites/www.cs/main.js || true
git add websites/www.cs/main.js
git commit -m "$(cat <<'EOF'
Scale bot population with KO score up to desktop/mobile hard caps.

EOF
)"
```

---

