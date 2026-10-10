/* Cylon Defense: the high-score client.
 *
 * Everything between the page and scores.php that is not drawing: the CSRF
 * token, the per-run token, the cached board, the board's size and blocked
 * initials, the qualifying rule, the score submission and what its replies
 * mean. It never touches the document; what it learns reaches the page as
 * return values (the board to render, the config the server sent, the problem
 * to show next to the initials).
 *
 * `fetch` comes in as an argument, so scores-test.js drives it with a fake
 * server. cylon.js builds the real client from the page's fetch and the
 * scores URL. */
/** A line saying when the board resets, from the server's config. */
export function weeklyResetText(config) {
    const day = config.weekStartsOn === 'sunday' ? 'Sunday' : 'Monday';
    const zone = config.timezone === 'America/Chicago' ? 'Central' : String(config.timezone || '');
    return `Play often — scores reset every ${day} at midnight ${zone}.`;
}
/** The board as list items. */
export function formatHighScoreRows(list) {
    if (!list.length) {
        return '<li class="cylon-hs-empty">No scores yet</li>';
    }
    return list.map((entry, i) => {
        const when = entry.at ? new Date(entry.at) : null;
        const date = when && !Number.isNaN(when.getTime())
            ? when.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
            : '';
        const initials = (entry.initials || 'AAA').toString().slice(0, 3).toUpperCase();
        const dateHtml = date
            ? `<span class="cylon-hs-date">${date}</span>`
            : '<span class="cylon-hs-date"></span>';
        return `<li><span class="cylon-hs-rank">#${i + 1}</span><strong class="cylon-hs-initials">${initials}</strong>${dateHtml}<span class="cylon-hs-score">${entry.score} KOs</span></li>`;
    }).join('');
}
function isRecord(v) {
    return typeof v === 'object' && v !== null;
}
export function createScoresClient(api, env) {
    const log = env.log ?? ((message, err) => console.error(message, err));
    let csrfToken = '';
    let runToken = '';
    let runIssueGen = 0;
    let runIssue = null;
    let limit = 10;
    const blocked = new Set();
    let cached = [];
    function headers(extra) {
        return { 'X-Cylon-CSRF': csrfToken, ...extra };
    }
    function applyConfig(config) {
        if (!isRecord(config))
            return;
        const maxScores = Number(config.maxScores);
        if (maxScores >= 1)
            limit = maxScores;
        if (Array.isArray(config.blockedInitials)) {
            blocked.clear();
            config.blockedInitials.forEach((item) => {
                const initials = String(item || '').toUpperCase();
                if (/^[A-Z]{3}$/.test(initials))
                    blocked.add(initials);
            });
        }
    }
    function takeBoard(data) {
        if (isRecord(data) && Array.isArray(data.scores))
            cached = data.scores;
    }
    async function load() {
        try {
            const res = await env.fetch(api, {
                cache: 'no-store',
                credentials: 'same-origin',
                headers: headers(),
            });
            if (!res.ok)
                throw new Error('bad status');
            const data = await res.json();
            if (!isRecord(data))
                throw new Error('bad body');
            if (typeof data.csrf === 'string' && data.csrf)
                csrfToken = data.csrf;
            applyConfig(data.config);
            cached = Array.isArray(data.scores) ? data.scores : [];
            return isRecord(data.config) ? data.config : null;
        }
        catch {
            return null;
        }
    }
    function startRun() {
        const gen = ++runIssueGen;
        runToken = '';
        runIssue = (async () => {
            try {
                if (!csrfToken)
                    await load();
                const res = await env.fetch(api, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: headers({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ op: 'start' }),
                    cache: 'no-store',
                });
                const data = await res.json().catch(() => null);
                if (gen !== runIssueGen)
                    return;
                if (res.ok && isRecord(data) && typeof data.run === 'string')
                    runToken = data.run;
            }
            catch (err) {
                log('Cylon run token failed', err);
            }
        })();
        return runIssue;
    }
    function qualifies(score, list = cached) {
        if (score < 1)
            return false;
        if (!list || list.length < limit)
            return true;
        let lowest = Infinity;
        for (const entry of list) {
            const s = Number(entry.score) || 0;
            if (s < lowest)
                lowest = s;
        }
        return score > lowest;
    }
    function isBlocked(initials) {
        return blocked.has((initials || '').toUpperCase());
    }
    async function submit(score, initials, hits) {
        if (!score || score < 1)
            return { saved: false, problem: null };
        const clean = (initials || 'AAA').toUpperCase().slice(0, 3).padEnd(3, 'A');
        if (isBlocked(clean))
            return { saved: false, problem: 'invalid-initials' };
        try {
            if (runIssue)
                await runIssue;
            if (!runToken)
                return { saved: false, problem: 'save-failed' };
            const res = await env.fetch(api, {
                method: 'POST',
                credentials: 'same-origin',
                headers: headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ op: 'score', score, hits, initials: clean, run: runToken }),
                cache: 'no-store',
            });
            let data = null;
            try {
                data = await res.json();
            }
            catch {
                data = null;
            }
            if (res.status === 400 && isRecord(data) && data.error === 'invalid initials') {
                takeBoard(data);
                return { saved: false, problem: 'invalid-initials' };
            }
            if (!res.ok) {
                takeBoard(data);
                return { saved: false, problem: 'save-failed' };
            }
            runToken = '';
            cached = isRecord(data) && Array.isArray(data.scores) ? data.scores : cached;
            return { saved: true, problem: null };
        }
        catch {
            return { saved: false, problem: null };
        }
    }
    return {
        board: () => cached,
        qualifies,
        isBlocked,
        load,
        startRun,
        submit,
    };
}
