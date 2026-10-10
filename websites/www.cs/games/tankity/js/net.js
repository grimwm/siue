/* ---------- timing ---------- */
/** Match polling, lobby polling, and the retry for the server's 150 ms act
 * spacing: a quick second click waits a beat and goes again. */
export const MATCH_POLL_MS = 1600;
export const LOBBY_POLL_MS = 2000;
export const RETRY_429_MS = 180;
export const RETRY_429_TRIES = 3;
/** The turn clock (rooms.php ROOM_TURN_SECS): its owner is alerted with 30
 * seconds left and everyone sees the last 10 counted down. */
export const CLOCK_WARN_S = 30;
export const CLOCK_SHOW_S = 10;
const STUMBLED = 'The room server stumbled. Solo hills still work.';
/* ---------- words and links ---------- */
/** Server lines are already human; these few technical ones get translated so
 * a game never quotes transport at the player. */
export function prettyRoomError(err) {
    const m = String((err && err.message) || err || '');
    if (/too fast/.test(m))
        return 'Easy on the trigger. Give it a beat and try again.';
    if (/bad seat token|bad csrf token|bad origin/.test(m))
        return 'Room session went stale. Leave the room and come back in.';
    return m || 'The room server did not answer properly. Solo hills still work.';
}
/** The invite link: the page the player is on (the caller picks it, the top
 * page when one on this host frames the game) with the room code attached. */
export function inviteUrl(code, page) {
    if (!code)
        return '';
    return (page.origin || '') + (page.pathname || '') + '?code=' + encodeURIComponent(code);
}
/* ---------- the replay queue ---------- */
/** The events that open a volley. */
export const VOLLEY_OPENERS = new Set(['fire', 'aifire', 'auto']);
export function isVolleyOpener(e) {
    return VOLLEY_OPENERS.has(e.t);
}
/** A hidden tab plays nothing (browsers stop its frames), so its replay queue
 * piles up. Catch up when the tab is hidden or more than one volley waits. */
export function shouldCatchUp(hidden, queue) {
    return hidden || queue.filter(isVolleyOpener).length > 1;
}
/** Skip all but the newest waiting volley (their log lines still post, and
 * the room state that follows carries the craters and armor). If the waiting
 * snapshot says it is already this seat's turn, skip them all and hand over
 * the controls at once. Null when there is nothing to skip. `volleyPlaying`
 * counts the volley on screen as one that waits. */
export function planCatchUp(queue, volleyPlaying, waiting, seat) {
    const openers = [];
    queue.forEach((e, i) => { if (isVolleyOpener(e))
        openers.push(i); });
    const myTurnNext = !!(waiting && waiting.phase === 'play' && waiting.turn === seat);
    const keep = myTurnNext ? 0 : 1;
    if (openers.length + (volleyPlaying ? 1 : 0) <= keep)
        return null;
    const last = openers[openers.length - 1];
    const cut = keep && last !== undefined ? last : queue.length;
    return { cut, fastNext: keep > 0 && queue.length - cut > 0 };
}
export class RoomClient {
    /** The session: filled by host/join, cleared by leave. */
    code = '';
    seat = -1;
    token = '';
    csrf = '';
    /** The seq of the newest event seen. */
    since = 0;
    /** In a running match (polling, acting) rather than the lobby. */
    on = false;
    /** The first snapshot of the match has been taken. */
    synced = false;
    seats = [];
    /** The hills: the picked map's id (null for random), its name, the catalog. */
    map = null;
    mapName = 'Random hills';
    maps = [];
    /** The Ready state the player last asked for while a request is out. */
    readyWant = null;
    readySending = false;
    busy = false;
    menuSent = false;
    pollId = 0;
    lobbyId = 0;
    turnLeft = null;
    turnLeftAt = 0;
    shopLeft = null;
    shopLeftAt = 0;
    clockWarned = false;
    env;
    handlers;
    constructor(env, handlers) {
        this.env = env;
        this.handlers = handlers;
    }
    /* ---- transport ---- */
    /** One fetcher for every room call, so transport trouble always arrives in
     * human words: unreachable, a page where game data should be (PHP not
     * running), or a stumble. Server JSON errors pass through untouched. */
    async fetchJson(url, init) {
        let res;
        try {
            res = await this.env.fetch(url, init);
        }
        catch (err) {
            throw this.down('Could not reach the room server. Solo hills still work.');
        }
        const data = (await res.json().catch(() => null));
        if (!data) {
            throw this.down(res.ok
                ? 'The room server answered with a page instead of game data, so the PHP service is probably not running there. Solo hills still work.'
                : STUMBLED);
        }
        return { res, data };
    }
    down(message) {
        const e = new Error(message);
        e.roomDown = true;
        this.handlers.onReachable(false);
        return e;
    }
    /** POST one action, typed by protocol.ts. The seat's code, token and csrf
     * ride on every call. The server spaces one seat's acts 150 ms apart, so a
     * 429 waits a beat and goes again, up to three times. Throws the server's
     * line on an error reply. */
    async post(action, payload) {
        const send = () => this.fetchJson('rooms.php?action=' + encodeURIComponent(action), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrf || '' },
            body: JSON.stringify(Object.assign({ code: this.code, token: this.token, csrf: this.csrf }, payload || {})),
        });
        let { res, data } = await send();
        for (let tries = 0; res.status === 429 && tries < RETRY_429_TRIES; tries++) {
            await new Promise(r => this.env.setTimeout(r, RETRY_429_MS));
            ({ res, data } = await send());
        }
        if (!res.ok || !data.ok)
            throw new Error(String(data.error || STUMBLED));
        this.handlers.onReachable(true);
        return data;
    }
    /** The room as this seat sees it (events newer than the cursor). */
    async getState() {
        const q = 'action=state&code=' + encodeURIComponent(this.code) +
            '&token=' + encodeURIComponent(this.token) + '&since=' + this.since;
        const { res, data } = await this.fetchJson('rooms.php?' + q, { headers: { Accept: 'application/json' } });
        if (!res.ok || !data.ok)
            throw new Error(String(data.error || STUMBLED));
        this.handlers.onReachable(true);
        return data.room;
    }
    /** Fills `maps` for the hills picker; an unreachable server leaves it as is. */
    async loadMaps() {
        try {
            const { data } = await this.fetchJson('rooms.php?action=maps', { headers: { Accept: 'application/json' } });
            const reply = data;
            if (reply.ok && Array.isArray(reply.maps))
                this.maps = reply.maps;
            if (reply.ok)
                this.handlers.onReachable(true);
        }
        catch (_) { /* the picker stays on random hills */ }
    }
    /** The lobby shelf's health check; null when the server is unreachable. */
    async ping() {
        try {
            const { data } = await this.fetchJson('rooms.php?action=ping', { headers: { Accept: 'application/json' } });
            this.handlers.onReachable(true);
            return data;
        }
        catch (_) {
            return null;
        }
    }
    /* ---- joining and leaving ---- */
    /** Hosts a room: forgets any earlier session, creates, takes the seat. */
    async host(initials, map, body) {
        this.forget();
        this.map = null;
        this.mapName = 'Random hills';
        const data = await this.post('create', { initials, map, body });
        this.code = data.code;
        this.seat = data.seat;
        this.token = data.token;
        this.csrf = data.csrf;
    }
    /** Joins a room by its code. */
    async join(code, initials, body) {
        this.forget();
        this.code = String(code || '').trim().toUpperCase();
        const data = await this.post('join', { code: this.code, initials, body });
        this.code = data.code;
        this.seat = data.seat;
        this.token = data.token;
        this.csrf = data.csrf;
    }
    forget() {
        this.code = '';
        this.token = '';
        this.csrf = '';
        this.seat = -1;
        this.since = 0;
        this.seats = [];
    }
    /** Tells the server this seat is gone, so an emptied room frees its slot at
     * once instead of after the idle window. Best effort; sendBeacon survives a
     * closing tab. */
    sendLeave() {
        if (!this.code || !this.token)
            return;
        const body = JSON.stringify({ code: this.code, token: this.token, csrf: this.csrf });
        const url = 'rooms.php?action=leave';
        try {
            if (this.env.beacon(url, body))
                return;
        }
        catch (_) { /* fall through to fetch */ }
        try {
            void Promise.resolve(this.env.fetch(url, {
                method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body,
            })).catch(() => { });
        }
        catch (_) { /* the idle sweep closes it anyway */ }
    }
    /** Leaves: tells the server, stops both polls, and clears the session. */
    leave() {
        this.sendLeave();
        this.stopPolling();
        this.stopLobbyWatch();
        this.on = false;
        this.code = '';
        this.seat = -1;
        this.token = '';
        this.csrf = '';
        this.since = 0;
        this.seats = [];
        this.synced = false;
    }
    /* ---- polling ---- */
    /** A match begins: the cursor and the sync start over, and the match poll
     * runs until stopPolling. */
    beginMatch(since = 0) {
        this.on = true;
        this.since = since;
        this.synced = false;
        this.stopLobbyWatch();
        this.stopPolling();
        this.pollId = this.env.setInterval(() => { void this.refresh(); }, MATCH_POLL_MS);
    }
    stopPolling() {
        if (this.pollId) {
            this.env.clearInterval(this.pollId);
            this.pollId = 0;
        }
    }
    /** One match poll: fetch the room and apply it. A failed poll is retried by
     * the next one. */
    async refresh() {
        if (!this.on)
            return;
        try {
            this.apply(await this.getState());
        }
        catch (_) { /* the next poll retries; the hills wait */ }
    }
    /** Watches a lobby: every 2 s fetches the room for `onRoom`, until the
     * match starts, the session ends, or `visible` says the lobby is closed.
     * An error in a tick (the host wandered off) just waits for the next. */
    watchLobby(visible, onRoom) {
        this.stopLobbyWatch();
        this.lobbyId = this.env.setInterval(() => {
            if (!this.code || this.on || !visible()) {
                this.stopLobbyWatch();
                return;
            }
            void (async () => {
                try {
                    onRoom(await this.getState());
                }
                catch (_) { /* keep listening */ }
            })();
        }, LOBBY_POLL_MS);
    }
    stopLobbyWatch() {
        if (this.lobbyId) {
            this.env.clearInterval(this.lobbyId);
            this.lobbyId = 0;
        }
    }
    /** Counts a snapshot's events past the cursor and hands both to the page.
     * Ignored with no session. */
    apply(room) {
        if (!room || !this.code)
            return;
        const fresh = (room.events || []).filter(e => (e.seq || 0) > this.since);
        for (const e of fresh)
            this.since = Math.max(this.since, e.seq || 0);
        const first = !this.synced;
        this.synced = true;
        this.handlers.onSnapshot(room, fresh, first);
    }
    /* ---- acts ---- */
    /** An act that waits for its answer, one at a time (firing). The reply is
     * applied; a failure rejects, and a second call while one is out is
     * dropped. */
    async act(body) {
        if (this.busy)
            return;
        this.busy = true;
        try {
            this.apply((await this.post('act', body)).room);
        }
        finally {
            this.busy = false;
        }
    }
    /** An act that does not wait (aim, drive, weapon): the reply is applied,
     * a failure is dropped. */
    sendQuiet(body) {
        this.post('act', body).then(d => this.apply(d.room)).catch(() => { });
    }
    /** Tells the room this player is in a menu (or out of it), once per change,
     * so the others see why the battle waits on them. */
    setMenu(open) {
        if (open === this.menuSent || !this.code)
            return;
        this.menuSent = open;
        this.post('act', { kind: 'menu', open }).then(d => this.apply(d.room)).catch(() => { this.menuSent = !open; });
    }
    /** The unit look changes any time; in a match the answer is applied. */
    sendBody(body) {
        if (!this.code)
            return;
        this.post('body', { body }).then(d => { if (this.on)
            this.apply(d.room); }).catch(() => { });
    }
    /** Buys from the shop. The reply is returned, not applied: the page shows
     * its confirmation first and then applies it. */
    buy(item, qty) {
        return this.post('buy', { item, qty });
    }
    /* ---- Ready ---- */
    /** Whether this seat counts as ready: what the player last asked for while
     * a request is out, otherwise what the room says. */
    readyNow() {
        if (this.readyWant !== null)
            return this.readyWant;
        const me = this.seats[this.seat];
        return !!(me && me.ready);
    }
    /** The shop button toggles Ready. The wire carries the wanted state, not a
     * flip, and requests go one at a time in the order of the clicks, so a
     * duplicate or a slow reply can never invert it. If the last player has
     * readied by the time an unready lands, the server has already started the
     * round and answers with that, quietly. */
    setReady(want) {
        this.readyWant = typeof want === 'boolean' ? want : !this.readyNow();
        this.handlers.onReadyChange();
        void this.sendReady();
    }
    async sendReady() {
        if (this.readySending)
            return;
        this.readySending = true;
        try {
            while (this.readyWant !== null) {
                const want = this.readyWant;
                const d = await this.post('ready', { ready: want });
                if (this.readyWant === want)
                    this.readyWant = null;
                this.apply(d.room);
            }
        }
        catch (err) {
            this.readyWant = null;
            this.handlers.onError(err);
            void this.refresh();
        }
        this.readySending = false;
        this.handlers.onReadyChange();
    }
    /** Outside the shop nobody is waiting on a wish. */
    dropReadyWish() { this.readyWant = null; }
    /* ---- clocks ---- */
    /** Arms the clocks from a snapshot: seconds left as of now, counted down
     * locally. A turn clock that jumps up is a new turn, which re-arms the
     * 30-second alert. */
    armClocks(room) {
        const prevLeft = this.turnClockLeft();
        this.turnLeft = typeof room.turnLeft === 'number' ? room.turnLeft : null;
        this.turnLeftAt = this.env.now();
        if (this.turnLeft === null || prevLeft === null || this.turnLeft > prevLeft + 5)
            this.clockWarned = false;
        this.shopLeft = typeof room.shopLeft === 'number' ? room.shopLeft : null;
        this.shopLeftAt = this.env.now();
    }
    turnClockLeft() {
        if (!this.on || typeof this.turnLeft !== 'number')
            return null;
        return Math.max(0, this.turnLeft - (this.env.now() - this.turnLeftAt) / 1000);
    }
    shopClockLeft() {
        if (!this.on || typeof this.shopLeft !== 'number')
            return null;
        return Math.max(0, this.shopLeft - (this.env.now() - this.shopLeftAt) / 1000);
    }
    /** True once per turn, when the clock first reads 30 seconds or less. */
    clockWarnDue() {
        const left = this.turnClockLeft();
        if (left === null || this.clockWarned || left > CLOCK_WARN_S || left <= 0)
            return false;
        this.clockWarned = true;
        return true;
    }
}
