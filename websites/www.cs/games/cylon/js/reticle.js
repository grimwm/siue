export function createReticle(d) {
    const { reticleEl, mouse, lastAim, game, settings, coarsePointer, IDLE_MS, isGameLive, isEyeDisoriented, setEyeTracking, audio, abilities, scrollX, scrollY } = d;
    function syncMousePageFromClient() {
        // Scroll does not fire pointermove; keep document aim coords fresh.
        mouse.pageX = mouse.clientX + scrollX();
        mouse.pageY = mouse.clientY + scrollY();
    }
    function paintReticle() {
        if (!reticleEl || reticleEl.hidden)
            return;
        reticleEl.style.transform = `translate(${mouse.clientX}px, ${mouse.clientY}px)`;
    }
    function setAim(clientX, clientY) {
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        mouse.clientX = Math.min(vw - 8, Math.max(8, clientX));
        mouse.clientY = Math.min(vh - 8, Math.max(8, clientY));
        syncMousePageFromClient();
        mouse.t = performance.now();
        paintReticle();
        lastAim.clientX = mouse.clientX;
        lastAim.clientY = mouse.clientY;
        lastAim.t = performance.now();
        if (isGameLive() && settings.eyeEnabled && !isEyeDisoriented()) {
            setEyeTracking(true);
            clearTimeout(game.idleTimer);
            game.idleTimer = setTimeout(() => setEyeTracking(false), IDLE_MS);
        }
    }
    function syncReticleVisibility() {
        if (!reticleEl)
            return;
        const show = isGameLive();
        reticleEl.hidden = !show;
        reticleEl.setAttribute('aria-hidden', show ? 'false' : 'true');
        // Desktop: follow the mouse without stealing clicks; mobile keeps drag
        reticleEl.classList.toggle('is-mouse-follow', show && !coarsePointer);
        if (show)
            paintReticle();
    }
    function resetReticleToCenter() {
        setAim(window.innerWidth / 2, window.innerHeight * 0.42);
    }
    function isUiAimBlocker(el) {
        if (!el || !el.closest)
            return false;
        return !!el.closest('.site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel');
    }
    function onPointerMove(e) {
        audio.prime();
        // Reticle finger is handled in bindReticle (per pointerId)
        if (game.reticlePointerId != null && e.pointerId === game.reticlePointerId)
            return;
        // Other touch fingers must not move aim (so a tap/attack finger is free)
        if (coarsePointer && e.pointerType === 'touch')
            return;
        // Don't drag aim (and seeking nukes) up into the nav when clicking Raptor / gear
        if (isUiAimBlocker(e.target))
            return;
        setAim(e.clientX, e.clientY);
    }
    function endReticleDrag(e) {
        if (game.reticlePointerId == null || (e && e.pointerId !== game.reticlePointerId))
            return;
        game.draggingReticle = false;
        game.reticlePointerId = null;
        reticleEl?.classList.remove('is-dragging');
    }
    function bindReticle() {
        if (!reticleEl || !coarsePointer)
            return;
        // No setPointerCapture — capturing the dodge finger blocks other fingers
        // from hitting Grenade / Raptor / bots on many mobile browsers.
        reticleEl.addEventListener('pointerdown', (e) => {
            if (!isGameLive())
                return;
            if (e.button != null && e.button !== 0)
                return;
            if (game.reticlePointerId != null)
                return; // already steering with another finger
            if (abilities.grenadeArmed())
                return; // window capture handler throws instead
            e.preventDefault();
            game.draggingReticle = true;
            game.reticlePointerId = e.pointerId;
            reticleEl.classList.add('is-dragging');
            setAim(e.clientX, e.clientY);
        });
        const onReticleMove = (e) => {
            if (game.reticlePointerId == null || e.pointerId !== game.reticlePointerId)
                return;
            e.preventDefault();
            setAim(e.clientX, e.clientY);
        };
        window.addEventListener('pointermove', onReticleMove, { passive: false });
        window.addEventListener('pointerup', endReticleDrag, true);
        window.addEventListener('pointercancel', endReticleDrag, true);
    }
    return { syncMousePageFromClient, paintReticle, syncReticleVisibility, resetReticleToCenter, onPointerMove, bindReticle };
}
