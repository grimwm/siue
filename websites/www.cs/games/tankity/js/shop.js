import { TUNE, clamp } from './sim.js?v=b64eb535e1';
import { renderShop as drawShop } from './ui/shop.js?v=650582befc';
export function createShop(deps) {
    const { G, $, tables, net, sfx, me, keyCap, keyHint, say, advance, render, renderHUD, refreshNavHints, drawShellIcon, drawGearIcon, openPreview, nextRound, openLeaveVeil, netBuy, } = deps;
    function openShop() {
        advance('shopOpen');
        G.shopQty = 1;
        renderShop();
        const veil = $('shop-veil');
        if (veil)
            veil.hidden = false;
        refreshNavHints(); // only a shown list has a height to measure
        render();
        renderHUD();
    }
    function hideShop() {
        const veil = $('shop-veil');
        if (veil)
            veil.hidden = true;
    }
    /* The shop is a Preact component (src/ui/shop.tsx) drawn into #shop-veil. This
       builds what it shows from the game's state and wires its clicks back; the
       component keeps no state of its own. In a room the start button is the Ready
       toggle: pressed reads "Ready ✓", and a line under it counts who is ready and
       the time left before the shop closes on its own (rooms.php ROOM_SHOP_SECS). */
    function shopReadyView() {
        if (!net.on) {
            const label = `Start round ${G.round + 1}${keyCap('shop', 'next')}`;
            return { next: { label }, readyLine: null, sig: label };
        }
        const mine = net.readyNow();
        const voters = net.seats.filter(s => s.human && s.lives > 0);
        const ready = voters.filter(s => s.ready).length;
        const left = net.shopClockLeft();
        const clock = left === null ? '' : ` · shop closes in ${Math.floor(Math.ceil(left) / 60)}:${String(Math.ceil(left) % 60).padStart(2, '0')}`;
        const label = `${mine ? 'Ready ✓' : 'Ready'}${keyCap('shop', 'next')}`;
        const status = `${ready}/${voters.length} ready${clock}`;
        const marks = voters.map(s => `${String(s.name).toUpperCase()}${s.ready ? ' ✓' : ''}`).join('  ');
        return { next: { label, pressed: mine }, readyLine: `${status} · ${marks}`, sig: label + '|' + status + '|' + marks };
    }
    /* The start button and ready line as last drawn. The clocks call this every
       frame, so the shop redraws only when what it would show has changed. */
    let shopReadyShown = '';
    function renderShopReady() {
        if (G.phase === 'shop' && shopReadyView().sig !== shopReadyShown)
            renderShop();
    }
    function renderShop() {
        const veil = $('shop-veil');
        if (!veil || !G.ammo)
            return; // no match has dealt a hand yet
        G.shopSel = clamp(G.shopSel || 0, 0, tables.shop.length - 1);
        G.shopQty = clamp(G.shopQty || 1, 1, 9);
        const ready = shopReadyView();
        shopReadyShown = ready.sig;
        const qty = G.shopQty;
        const entries = [];
        let lastCat = '';
        let shellRowShown = false;
        tables.shop.forEach((it, idx) => {
            if (it.cat !== lastCat) {
                lastCat = it.cat;
                entries.push({ kind: 'cat', name: it.cat });
                // The Shell never needs buying, but it is part of the arsenal: it
                // heads the shells with no number and no Buy button.
                if (it.kind === 'ammo' && !shellRowShown) {
                    shellRowShown = true;
                    entries.push(shellShopRow());
                }
            }
            const locked = (it.minRound || 0) > G.round;
            const unit = packPrice(it);
            const total = unit * qty;
            const parts = shopName(it, unit);
            entries.push({
                kind: 'item',
                index: idx,
                name: parts.name,
                vals: `${parts.vals}${qty > 1 ? ` ×${qty} = $${total}` : ''}`,
                sub: shopSub(it),
                sub2: shopSub2(it, locked),
                icon: it.kind === 'ammo' ? { kind: 'ammo', w: it.w } : { kind: 'gear', g: it.g },
                selected: idx === G.shopSel,
                locked,
                disabled: locked || G.cash < total,
                qty,
                weapon: it.kind === 'ammo' ? it.w : undefined,
            });
        });
        drawShop(veil, {
            keyHint,
            title: G.round === 0 ? 'Pre-match shop' : 'Field shop',
            cash: G.round === 0
                ? `War chest: $${G.cash} · spend your stake before the first hill`
                : `War chest: $${G.cash} · armor ${me().hp}/${TUNE.playerArmor} · round ${G.round} cleared`,
            entries,
            next: ready.next,
            readyLine: ready.readyLine,
            inRoom: net.on,
            drawIcon: (canvas, icon) => (icon.kind === 'ammo' ? drawShellIcon(canvas, icon.w) : drawGearIcon(canvas, icon.g)),
            arsenalRev: tables.rev,
            onBuy: idx => buyItem(tables.shop[idx], G.shopQty),
            onPreview: openPreview,
            onNext: nextRound,
            onLeave: openLeaveVeil,
        });
        refreshNavHints();
    }
    /* Every row names the goods on one line and the numbers below it. */
    /* One pack price shared by the menu, the till, and the affordable count. */
    function packPrice(it) {
        return it.price || 0;
    }
    /* Packs of this row the chest can cover right now, capped at 9. */
    function maxPacks(it) {
        return Math.max(0, Math.min(9, Math.floor(G.cash / packPrice(it))));
    }
    /* A row's name, then its numbers (pack size, price, what you own, the bulk
       total) in their own colour. */
    function shopName(it, price) {
        if (it.kind === 'ammo') {
            const own = (G.ammo[it.w] || 0) > 0 ? ` (you own ${G.ammo[it.w]})` : '';
            return { name: tables.weapons[it.w].name, vals: `×${it.n} ($${price})${own}` };
        }
        return { name: it.label, vals: `($${price})` };
    }
    function shellShopRow() {
        return {
            kind: 'free',
            weapon: 'shell',
            name: tables.weapons.shell.name,
            vals: '∞ (free)',
            sub: shopSub({ kind: 'ammo', w: 'shell' }),
            sub2: 'Always loaded, never runs out.',
            icon: { kind: 'ammo', w: 'shell' },
        };
    }
    /* First stat line: what it does. Second stat line: the deal. Locked rows
    // keep their numbers so the NUKE shows its damage before round 4. */
    function shopSub(it) {
        if (it.kind === 'ammo') {
            const w = tables.weapons[it.w];
            const note = w.note ? `, ${w.note.charAt(0).toLowerCase() + w.note.slice(1).replace(/\.$/, '')}` : '';
            return `${w.dmg} damage, blast ${w.radius}${note}. Direct hits count double.`;
        }
        const g = tables.gear[it.g];
        return (g && g.note) || it.label;
    }
    function shopSub2(it, locked) {
        if (it.kind === 'ammo') {
            if (locked)
                return `Unlocks in round ${it.minRound}.`;
            return `Pack of ${it.n}. You own ${G.ammo[it.w] || 0}.`;
        }
        const maxArmor = TUNE.playerArmor + 25 * (G.plate || 0);
        switch (it.effect) {
            case 'repair': {
                const cur = G.tanks.length ? me().hp : TUNE.playerArmor;
                const banked = G.repairBank ? `, plus ${G.repairBank} banked for next round` : '';
                return `Your armor is at ${cur} of ${maxArmor}${banked}.`;
            }
            case 'fuel': {
                const fuel = G.tanks.length ? Math.round(me().fuel) : TUNE.fuel;
                const banked = G.fuelBank ? `, plus ${G.fuelBank} banked for next round` : '';
                return `Your tank holds ${fuel} fuel${banked}.`;
            }
            case 'plate':
                return `Max armor ${maxArmor}${G.plate ? ` (${G.plate} fitted)` : ''}, ready next round.`;
            case 'shield':
                return G.shield ? 'Shield is up for the next hit.' : 'No shield fitted.';
            case 'extralife':
                return `${G.lives} ${G.lives === 1 ? 'life' : 'lives'} banked (max ${TUNE.maxLives}).`;
            case 'jammer':
                return G.jammer > 0 ? `Jamming for ${G.jammer} more ${G.jammer === 1 ? 'round' : 'rounds'}.` : 'Drones aim straight at you.';
            case 'bunker':
                return G.bunker > 0 ? `Dug in for ${G.bunker} more ${G.bunker === 1 ? 'round' : 'rounds'}.` : 'No bunker dug.';
            case 'laststand':
                return G.laststand ? 'Wreck is rigged to blow.' : 'Wreck is just a wreck.';
            default:
                return it.label;
        }
    }
    function buyItem(it, qty) {
        qty = clamp(Math.floor(qty || 1), 1, 9);
        if (net.on) {
            netBuy(it, qty);
            return;
        }
        const total = packPrice(it) * qty;
        if ((it.minRound || 0) > G.round) {
            say(`That unlocks in round ${it.minRound}.`, 'info');
            return;
        }
        if (G.cash < total) {
            say(`That costs $${total}, and the chest holds $${G.cash}.`, 'info');
            return;
        }
        G.cash -= total;
        sfx.play('cash');
        const lots = qty > 1 ? `${qty} × ` : '';
        if (it.kind === 'ammo') {
            G.ammo[it.w] = (G.ammo[it.w] || 0) + it.n * qty;
            say(`Bought ${lots}${it.label}.`, 'good');
        }
        else {
            applyGear(it, qty, lots);
        }
        // After a buy the pack count only ever drops, down to what the chest
        // can still cover for the highlighted row.
        G.shopQty = Math.max(1, Math.min(G.shopQty, maxPacks(tables.shop[G.shopSel])));
        renderShop();
        renderHUD();
    }
    /* One-shot and banked gear, shared by every shelf row that is not ammo. */
    function applyGear(it, qty, lots) {
        const n = (it.n || 0) * qty;
        switch (it.effect) {
            case 'repair':
                G.repairBank += n;
                say(`Bought ${lots}${it.label}, banked for next round.`, 'good');
                break;
            case 'fuel':
                G.fuelBank += n;
                say(`Bought ${lots}${it.label}, banked for next round.`, 'good');
                break;
            case 'plate':
                G.plate += qty;
                say(`Bought ${lots}${it.label}, plated for next round.`, 'good');
                break;
            case 'shield':
                G.shield = true;
                say(`Bought ${it.label}. Next hit bounces off.`, 'good');
                break;
            case 'extralife':
                if (G.lives < TUNE.maxLives) {
                    G.lives += 1;
                    say(`Bought ${it.label}! (${G.lives}/${TUNE.maxLives} lives)`, 'good');
                }
                else {
                    G.score += 500;
                    say('Max lives already, so take +500 points instead!', 'good');
                }
                break;
            case 'jammer':
                G.jammer = Math.max(G.jammer, n);
                say(`Bought ${it.label}. Drones aim shaky for ${G.jammer} rounds.`, 'good');
                break;
            case 'bunker':
                G.bunker = Math.max(G.bunker, n);
                say(`Bought ${it.label}. Dug in for ${G.bunker} rounds.`, 'good');
                break;
            case 'laststand':
                G.laststand = true;
                say(`Bought ${it.label}. Go down glowing.`, 'good');
                break;
            default:
                say(`Bought ${lots}${it.label}.`, 'good');
        }
    }
    function shopSelect(dir) {
        G.shopSel = clamp(G.shopSel + dir, 0, tables.shop.length - 1);
        sfx.play('click');
        renderShop();
        return true;
    }
    /* Qty keys pick how many packs ride on every buy, capped at what the chest
    // can cover for that row. */
    function shopQtyUp() {
        const max = Math.max(1, maxPacks(tables.shop[G.shopSel]));
        if (G.shopQty < max) {
            G.shopQty++;
            sfx.play('click');
        }
        else
            sfx.play('thud');
        renderShop();
        return true;
    }
    function shopQtyDown() {
        if (G.shopQty > 1) {
            G.shopQty--;
            sfx.play('click');
        }
        renderShop();
        return true;
    }
    return {
        openShop, hideShop, renderShop, renderShopReady, buyItem, packPrice, maxPacks,
        shopSelect, shopQtyUp, shopQtyDown,
    };
}
