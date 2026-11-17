### Task 6: Help copy, cache-bust, deploy

**Files:**
- Modify: `websites/www.cs/index.html` — How to Play + settings hint + `?v=20261006ad`
- Deploy via `make deploy`

- [ ] **Step 1: Update help bullets** (desktop + mobile) to include:

- Occasional nukes and smaller missiles (missiles deal 2 hits).
- Cyan/pink seeking missiles chase you; orange ones aim where you just were.
- More drones appear as your KO count rises.
- The page looks ruined while Game On.

Update settings hint similarly (no “every 10 hits”).

- [ ] **Step 2: Cache-bust**

```html
<link href="custom.css?v=20261006ad" rel="stylesheet">
...
<script src="main.js?v=20261006ad"></script>
```

- [ ] **Step 3: Deploy**

```bash
cd websites/www.cs && node --check main.js && make deploy
```

- [ ] **Step 4: Manual checklist**

1. 10 hits → no nuke from hits  
2. Idle Game On → small missiles; later/rarer nukes  
3. Orange missile → recent aim lock; dodge blast  
4. Cyan/pink tracker → distinct + follows pip  
5. KOs raise bot density; mobile caps at 10  
6. No nukes checkbox in Options  
7. Game On fades desolate look; Game Off restores  
8. Pause freezes inbound schedules  

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Document Missile Command threats in How to Play and cache-bust assets.

EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Remove hit→nuke + HITS_PER_NUKE | 1 |
| Nukes always on / remove toggle | 1 |
| Dual ramping schedulers | 2 |
| lastAim ground lock + tracker % | 3 |
| +2 missile splash; distinct tracker look | 3 |
| Eye disorient blocks both | 2–3 |
| botCap 4 + KO/5; hard 30/10 | 4 |
| Desolate fade-in world ended | 5 |
| Help + deploy | 6 |
