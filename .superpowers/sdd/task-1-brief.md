### Task 1: Remove nukes toggle + hit-triggered nukes

**Files:**
- Modify: `websites/www.cs/main.js` (settings, `registerHit`, `launchNuke`)
- Modify: `websites/www.cs/index.html` (Options checkbox + hint text)

**Interfaces:**
- Consumes: existing `launchNuke`, `registerHit`
- Produces: no `settings.nukesEnabled`; `registerHit` never calls `launchNuke`; `launchNuke` no longer checks `nukesEnabled`

- [ ] **Step 1: Remove setting and UI**

In `main.js` defaults, delete `nukesEnabled: true`.

In settings sync, delete:

```javascript
        const nukes = settingsRoot.querySelector('[data-setting="nukesEnabled"]');
        // ...
        if (nukes) nukes.checked = settings.nukesEnabled;
```

(and any change-handler branch for `nukesEnabled` if present).

In `index.html`, remove the nukes checkbox label entirely. Update the settings hint from “Survive until 30 hits or a nuke lands on you…” to mention occasional nukes/missiles (full help copy in Task 5 can refine).

- [ ] **Step 2: Strip hit→nuke and nukesEnabled guards**

In `registerHit`, remove the block:

```javascript
        if (
            !isEyeDisoriented()
            && settings.nukesEnabled
            && hitCount > 0
            && hitCount % HITS_PER_NUKE === 0
            && hitCount < MAX_HITS
        ) {
            launchNuke();
        }
```

Delete unused `const HITS_PER_NUKE = 10;`.

In `launchNuke`, change the guard from:

```javascript
        if (!isGameLive() || !settings.nukesEnabled || isEyeDisoriented() || nukeInFlight) return;
```

to:

```javascript
        if (!isGameLive() || isEyeDisoriented() || nukeInFlight) return;
```

- [ ] **Step 3: Verify**

Run: `node --check websites/www.cs/main.js`  
Expected: exit 0  
Run: `rg "nukesEnabled|HITS_PER_NUKE" websites/www.cs`  
Expected: no matches

- [ ] **Step 4: Commit**

```bash
git add websites/www.cs/main.js websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Remove hit-triggered nukes and the nukesEnabled options toggle.

EOF
)"
```

---

