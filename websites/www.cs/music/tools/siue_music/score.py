"""score.json validation: the same rules, order and path spellings as parseScore in games/workroom/src/score.ts."""
import json
import math
import re
from datetime import datetime
from pathlib import Path

ID_RE = re.compile(r"[a-z0-9][a-z0-9-]{0,47}")
COLOR_RE = re.compile(r"#[0-9a-f]{6}")
MADE_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z")
ANSWER_RE = re.compile(r"[0-9a-f]{32}")
KINDS = ("music", "sound")
MIX_STYLES = ("lofi",)
MIN_SOUND_SECONDS = 0.05
FAMILIES = ("strings", "brass", "woodwinds", "percussion", "choir", "keys", "synth", "harp", "bells",
            "impact", "whoosh", "ambience", "voice", "electronic", "foley", "ui")
UNITS = (1, 2, 4, 8, 16)
AUDIO_TYPES = {"audio.webm": "audio/webm; codecs=opus", "audio.m4a": "audio/mp4; codecs=mp4a.40.2"}
EPS = 1e-9
SCHEMAS = (1, 2)
SPEED_RATIOS = (0.5, 0.666667, 1, 1.5, 2)
LEVELS = (32, 48, 64, 80, 100, 120)
SWEEPS = ("off", "slow", "fast")
ROOMS = ("dry", "small_room", "concert_hall", "cathedral", "cave")
HARMONY_VOICES = ("third", "fifth", "octave_up", "octave_down")
VOICE_EFFECTS = ("vocoder", "autotune", "harmonizer", "pitch", "talkbox", "robot", "whisper")
MAX_VOICE_FX = 4
MAX_BEND_POINTS = 64


class _Fail(Exception):
    pass


def _fail(path: str, rule: str):
    raise _Fail(f"{path}: {rule}")


def glossary_ids(path: Path) -> frozenset[str]:
    """The term ids in glossary.json, the one glossary source the page and this tool share."""
    return frozenset(t["id"] for t in json.loads(Path(path).read_text(encoding="utf-8"))["terms"])


def library_ids(path: Path) -> frozenset[str]:
    """The instrument ids in library.json, the one sample library the renderer and this tool share."""
    return frozenset(json.loads(Path(path).read_text(encoding="utf-8"))["instruments"])


def _is_num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def _obj(v, path):
    return v if isinstance(v, dict) else _fail(path, "must be an object")


def _arr(v, path, minimum=0):
    if isinstance(v, list) and len(v) >= minimum:
        return v
    return _fail(path, f"must be a list of at least {minimum}" if minimum > 0 else "must be a list")


def _num(v, path):
    return v if _is_num(v) else _fail(path, "must be a number")


def _int(v, path, minimum, maximum=math.inf):
    n = _num(v, path)
    if float(n).is_integer() and minimum <= n <= maximum:
        return int(n)
    return _fail(path, f"must be a whole number of at least {minimum}" if maximum == math.inf
                 else f"must be a whole number from {minimum} to {maximum}")


def _text(v, path, maximum):
    return v if isinstance(v, str) and 1 <= len(v) <= maximum else _fail(path, f"must be 1 to {maximum} characters")


def _id(v, path):
    return v if isinstance(v, str) and ID_RE.fullmatch(v) else _fail(path, "must be lowercase letters, digits and hyphens (up to 48)")


def _color(v, path):
    return v if isinstance(v, str) and COLOR_RE.fullmatch(v) else _fail(path, "must be a colour like #1a2b3c")


def _one_of(v, path, allowed):
    return v if isinstance(v, str) and v in allowed else _fail(path, f"must be one of {', '.join(str(a) for a in allowed)}")


def _range(v, path, minimum, maximum):
    n = _num(v, path)
    return n if minimum <= n <= maximum else _fail(path, f"must be from {minimum} to {maximum}")


def _absent(o, key, path, why):
    if key in o and o[key] is not None:
        _fail(key if path == "" else f"{path}.{key}", why)


def _unique(items, path):
    seen = set()
    for i, it in enumerate(items):
        if it["id"] in seen:
            _fail(f"{path}[{i}].id", f"duplicates the id {it['id']}")
        seen.add(it["id"])


def _valid_time(s: str) -> bool:
    try:
        datetime.fromisoformat(s[:-1] + "+00:00")
        return True
    except ValueError:
        return False


def validate(obj: object, glossary_ids: frozenset[str], instrument_ids: frozenset[str] | None = None) -> list[str]:
    """The first broken rule as a one-item list naming its path (e.g. "sections[1].from_bar"); [] when the score is valid.

    instrument_ids is the library's instrument ids. Without them `sound.instrument` is checked only for the id format,
    as parseScore does before the page has the library."""
    if not isinstance(obj, dict):
        return ["score: must be an object"]
    if obj.get("schema") not in SCHEMAS or isinstance(obj.get("schema"), bool):
        return [f"schema: this draft uses score schema {obj.get('schema')}, which this tool does not know"]
    try:
        _build(obj, glossary_ids, instrument_ids)
    except _Fail as e:
        return [str(e)]
    return []


def _build(r: dict, glossary: frozenset[str], instruments: frozenset[str] | None) -> None:
    schema = r["schema"]

    def v2(o, key, path):
        """A schema 2 field on a schema 1 score is refused, so a writer that uses one says schema 2."""
        if key not in o:
            return False
        if schema != 2:
            _fail(key if path == "" else f"{path}.{key}", "needs schema 2")
        return True

    kind = _one_of(r.get("kind"), "kind", KINDS)
    music = kind == "music"
    pr = _obj(r.get("project"), "project")
    _id(pr.get("id"), "project.id")
    _text(pr.get("name"), "project.name", 80)
    pi = _obj(r.get("piece"), "piece")
    _id(pi.get("id"), "piece.id")
    _text(pi.get("title"), "piece.title", 120)
    _int(r.get("draft"), "draft", 1)
    made = r.get("made")
    if not (isinstance(made, str) and MADE_RE.fullmatch(made) and _valid_time(made)):
        _fail("made", "must be an ISO 8601 UTC time ending in Z")
    duration = _num(r.get("duration"), "duration")
    if duration <= 0:
        _fail("duration", "must be above 0 seconds")
    if not music and duration < MIN_SOUND_SECONDS:
        _fail("duration", f"must be at least {MIN_SOUND_SECONDS} seconds for a sound piece")

    bars = None
    if music:
        bars = _int(r.get("bars"), "bars", 1)
        tempo = []
        for i, t in enumerate(_arr(r.get("tempo"), "tempo", 1)):
            p = f"tempo[{i}]"
            o = _obj(t, p)
            bpm = _num(o.get("bpm"), f"{p}.bpm")
            if bpm <= 0:
                _fail(f"{p}.bpm", "must be above 0")
            bar = _int(o.get("bar"), f"{p}.bar", 1, bars)
            beats = _int(o.get("beats"), f"{p}.beats", 1, 16)
            unit = o.get("unit")
            if isinstance(unit, bool) or not _is_num(unit) or unit not in UNITS:
                _fail(f"{p}.unit", "must be one of 1, 2, 4, 8, 16")
            tempo.append((bar, bpm, beats))
        steps = tempo
        for i, (bar, _, _) in enumerate(tempo):
            if (bar != 1) if i == 0 else (bar <= tempo[i - 1][0]):
                _fail(f"tempo[{i}].bar", "the first tempo must start at bar 1" if i == 0 else "bars must increase")
        last_bar_start = 0.0
        for i, (bar, bpm, beats) in enumerate(tempo):
            last_before = min(tempo[i + 1][0] - 1 if i + 1 < len(tempo) else bars, bars - 1)
            last_bar_start += max(0, last_before - bar + 1) * (beats * 60 / bpm)
        if last_bar_start >= duration - EPS:
            _fail("duration", f"must run past the start of the last bar ({last_bar_start} seconds)")
    else:
        _absent(r, "bars", "", "a sound piece has no bars")
        _absent(r, "tempo", "", "a sound piece has no tempo")
        _absent(r, "piece_tempo", "", "a sound piece has no tempo")
    if music and v2(r, "piece_tempo", ""):
        _tempo_line(r["piece_tempo"], bars, steps)

    _sections(r.get("sections"), music, bars, duration)
    lanes = []
    has_sound = []
    for i, l in enumerate(_arr(r.get("lanes"), "lanes", 1)):
        p = f"lanes[{i}]"
        o = _obj(l, p)
        lanes.append({"id": _id(o.get("id"), f"{p}.id")})
        _text(o.get("name"), f"{p}.name", 60)
        _one_of(o.get("family"), f"{p}.family", FAMILIES)
        _one_of(o.get("icon"), f"{p}.icon", FAMILIES)
        _color(o.get("color"), f"{p}.color")
        if o.get("sound") is not None:
            _sound(o["sound"], f"{p}.sound", instruments)
        has_sound.append(o.get("sound") is not None)
        if v2(o, "speed", p):
            _speed(o["speed"], f"{p}.speed")
        if v2(o, "dynamics", p):
            if not music:
                _fail(f"{p}.dynamics", "a sound piece has no bars for a loudness line")
            _dynamics(o["dynamics"], f"{p}.dynamics", bars)
        if v2(o, "fx", p):
            _fx(o["fx"], f"{p}.fx")
        lanes[-1]["voice"] = _voice(o["voice"], f"{p}.voice") if v2(o, "voice", p) else []
        lanes[-1]["vocal"] = v2(o, "vocal", p) and _vocal(o["vocal"], f"{p}.vocal", duration)
        sound = o.get("sound")
        is_vocal_sound = isinstance(sound, dict) and sound.get("instrument") == VOCAL_INSTRUMENT
        if is_vocal_sound != bool(lanes[-1]["vocal"]):
            if lanes[-1]["vocal"]:
                _fail(f"{p}.sound", f"a vocal track's sound is the instrument {VOCAL_INSTRUMENT}")
            _fail(f"{p}.sound.instrument", f"{VOCAL_INSTRUMENT} is only for a lane with a vocal track")
    _unique(lanes, "lanes")
    for i, lane in enumerate(lanes):
        for j, v in enumerate(lane["voice"]):
            if v["effect"] in ("vocoder", "talkbox") and (v["carrier"] == lane["id"] or not any(x["id"] == v["carrier"] for x in lanes)):
                _fail(f"lanes[{i}].voice[{j}].carrier", "must be the id of another lane")
    mix = r.get("mix")
    if mix is not None:
        mo = _obj(mix, "mix")
        _one_of(mo.get("style"), "mix.style", MIX_STYLES)
        _range(mo.get("loudness"), "mix.loudness", -30, -10)
        if v2(mo, "room", "mix"):
            ro = _obj(mo["room"], "mix.room")
            _one_of(ro.get("preset"), "mix.room.preset", ROOMS)
            _range(ro.get("amount"), "mix.room.amount", 0, 1)
        if v2(mo, "limiter", "mix"):
            lo = _obj(mo["limiter"], "mix.limiter")
            _bool(lo.get("on"), "mix.limiter.on")
            _range(lo.get("ceiling_db"), "mix.limiter.ceiling_db", -12, 0)
    renderable = mix is not None and all(has_sound)
    lane_ids = {l["id"] for l in lanes}
    if v2(r, "fx_clips", ""):
        if not music:
            _fail("fx_clips", "a sound piece has no bars for effects")
        _fx_clips(r["fx_clips"], bars, lane_ids)
    vocal_lanes = {l["id"] for l in lanes if l["vocal"]}

    characters = []
    for i, c in enumerate(_arr(r.get("characters"), "characters")):
        p = f"characters[{i}]"
        o = _obj(c, p)
        characters.append({"id": _id(o.get("id"), f"{p}.id")})
        _text(o.get("name"), f"{p}.name", 60)
        _color(o.get("color"), f"{p}.color")
    _unique(characters, "characters")
    character_ids = {c["id"] for c in characters}

    def within(start, end, path):
        if not (start >= 0 and start < end and end <= duration + EPS):
            _fail(path, f"must satisfy 0 <= from < to <= {duration}")

    motifs = []
    for i, m in enumerate(_arr(r.get("motifs"), "motifs")):
        p = f"motifs[{i}]"
        o = _obj(m, p)
        motifs.append({"id": _id(o.get("id"), f"{p}.id")})
        if not (isinstance(o.get("character"), str) and o["character"] in character_ids):
            _fail(f"{p}.character", "must be the id of one of the score's characters")
        for j, s in enumerate(_arr(o.get("spans"), f"{p}.spans")):
            q = f"{p}.spans[{j}]"
            so = _obj(s, q)
            if not (isinstance(so.get("lane"), str) and so["lane"] in lane_ids):
                _fail(f"{q}.lane", "must be the id of a lane")
            within(_num(so.get("from"), f"{q}.from"), _num(so.get("to"), f"{q}.to"), q)
    _unique(motifs, "motifs")
    motif_ids = {m["id"] for m in motifs}

    for i, n in enumerate(_arr(r.get("notes"), "notes")):
        p = f"notes[{i}]"
        o = _obj(n, p)
        if not (isinstance(o.get("lane"), str) and o["lane"] in lane_ids):
            _fail(f"{p}.lane", "must be the id of a lane")
        if o["lane"] in vocal_lanes:
            _fail(f"{p}.lane", "a vocal track holds takes, not notes")
        start, length = _num(o.get("start"), f"{p}.start"), _num(o.get("length"), f"{p}.length")
        if start < 0 or length <= 0 or start + length > duration + EPS:
            _fail(p, f"must start at 0 or later, have a length above 0 and end by {duration} seconds")
        _int(o.get("pitch"), f"{p}.pitch", 0, 127)
        _int(o.get("velocity"), f"{p}.velocity", 1, 127)
        mo = o.get("motif")
        if not (mo is None or (isinstance(mo, str) and mo in motif_ids)):
            _fail(f"{p}.motif", "must be a motif id or null")
        if v2(o, "bend", p):
            _bend(o["bend"], f"{p}.bend", length)

    energy = []
    for i, pt in enumerate(_arr(r.get("energy"), "energy", 2)):
        p = f"energy[{i}]"
        if not isinstance(pt, list) or len(pt) != 2:
            _fail(p, "must be a [seconds, value] pair")
        t, v = _num(pt[0], f"{p}[0]"), _num(pt[1], f"{p}[1]")
        if v < 0 or v > 1:
            _fail(p, "the value must be between 0 and 1")
        energy.append(t)
    for i, t in enumerate(energy):
        if i > 0 and t <= energy[i - 1]:
            _fail(f"energy[{i}]", "times must increase")
    if energy[0] != 0:
        _fail("energy[0]", "the first time must be 0")
    if abs(energy[-1] - duration) > EPS:
        _fail(f"energy[{len(energy) - 1}]", f"the last time must be the duration, {duration}")

    for i, g in enumerate(_arr(r.get("glossary"), "glossary")):
        p = f"glossary[{i}]"
        o = _obj(g, p)
        if not (isinstance(o.get("term"), str) and o["term"] in glossary):
            _fail(f"{p}.term", "must be an id in the glossary")
        start, end = _num(o.get("from"), f"{p}.from"), _num(o.get("to"), f"{p}.to")
        within(start, end, p)
        if end - start > 15 + EPS:
            _fail(p, "a clip is at most 15 seconds")

    for i, a in enumerate(_arr(r.get("audio"), "audio", 0 if renderable else 1)):
        p = f"audio[{i}]"
        o = _obj(a, p)
        f = _one_of(o.get("file"), f"{p}.file", ("audio.webm", "audio.m4a"))
        if o.get("type") != AUDIO_TYPES[f]:
            _fail(f"{p}.type", f"must be {AUDIO_TYPES[f]} for {f}")

    if r.get("spectrogram") is not None or not renderable:
        so = _obj(r.get("spectrogram"), "spectrogram")
        low, high = _num(so.get("low_hz"), "spectrogram.low_hz"), _num(so.get("high_hz"), "spectrogram.high_hz")
        if not low > 0:
            _fail("spectrogram.low_hz", "must be above 0")
        if not high > low:
            _fail("spectrogram.high_hz", "must be above low_hz")
        if so.get("file") != "spectrogram.png":
            _fail("spectrogram.file", "must be spectrogram.png")
        _one_of(so.get("scale"), "spectrogram.scale", ("log", "linear"))

    if r.get("musicxml") is not None:
        if r["musicxml"] != "score.musicxml":
            _fail("musicxml", "must be score.musicxml")
    elif music:
        _fail("musicxml", "a music piece requires score.musicxml")

    for i, c in enumerate(_arr(r.get("changes"), "changes")):
        p = f"changes[{i}]"
        o = _obj(c, p)
        if music:
            for k in ("from", "to"):
                _absent(o, k, p, "a music change names bars (from_bar, to_bar)")
            a = _int(o.get("from_bar"), f"{p}.from_bar", 1, bars)
            _int(o.get("to_bar"), f"{p}.to_bar", a, bars)
        else:
            for k in ("from_bar", "to_bar"):
                _absent(o, k, p, "a sound change names seconds (from, to)")
            a, b = _num(o.get("from"), f"{p}.from"), _num(o.get("to"), f"{p}.to")
            if not (a >= 0 and a < b):
                _fail(f"{p}.from", "must be 0 or later and before to")
            if b > duration + EPS:
                _fail(f"{p}.to", f"must be at most {duration}")
        lane = o.get("lane")
        if not (lane is None or (isinstance(lane, str) and lane in lane_ids)):
            _fail(f"{p}.lane", "must be a lane id or null")
        _text(o.get("text"), f"{p}.text", 500)
        for j, x in enumerate(_arr(o.get("answers"), f"{p}.answers")):
            if not (isinstance(x, str) and ANSWER_RE.fullmatch(x)):
                _fail(f"{p}.answers[{j}]", "must be a note id (32 hex digits)")


def _bool(v, path):
    return v if isinstance(v, bool) else _fail(path, "must be true or false")


def tempo_line_bpm(marks, bar):
    """The tempo line's BPM in bar `bar`: a ramp moves linearly by bar toward the next mark, rounded to 0.01 BPM."""
    i = 0
    while i + 1 < len(marks) and marks[i + 1]["bar"] <= bar:
        i += 1
    m = marks[i]
    if m["shape"] == "steady" or i + 1 == len(marks):
        return m["bpm"]
    n = marks[i + 1]
    return math.floor((m["bpm"] + (n["bpm"] - m["bpm"]) * (bar - m["bar"]) / (n["bar"] - m["bar"])) * 100 + 0.5) / 100


def _marks(v, path, bars, value, key, shapes, up, down):
    """Marks in bar order from bar 1, each with a value and a shape; a moving shape needs the next mark to move that way, the last holds."""
    out = []
    for i, m in enumerate(_arr(v, path, 1)):
        p = f"{path}[{i}]"
        o = _obj(m, p)
        out.append({"bar": _int(o.get("bar"), f"{p}.bar", 1, bars), key: value(o.get(key), f"{p}.{key}"),
                    "shape": _one_of(o.get("shape"), f"{p}.shape", shapes)})
    for i, m in enumerate(out):
        nxt = out[i + 1] if i + 1 < len(out) else None
        if (m["bar"] != 1) if i == 0 else (m["bar"] <= out[i - 1]["bar"]):
            _fail(f"{path}[{i}].bar", "the first mark must be at bar 1" if i == 0 else "bars must increase")
        if nxt is None and m["shape"] != shapes[0]:
            _fail(f"{path}[{i}].shape", f"the last mark must be {shapes[0]}")
        if nxt is not None and m["shape"] == up and not nxt[key] > m[key]:
            _fail(f"{path}[{i}].shape", f"{up} needs the next mark above it")
        if nxt is not None and m["shape"] == down and not nxt[key] < m[key]:
            _fail(f"{path}[{i}].shape", f"{down} needs the next mark below it")
    return out


def _tempo_line(v, bars, steps) -> None:
    marks = _marks(v, "piece_tempo", bars, lambda x, p: _range(x, p, 20, 400), "bpm", ("steady", "speed_up", "slow_down"), "speed_up", "slow_down")
    for bar in range(1, bars + 1):
        want = tempo_line_bpm(marks, bar)
        bpm = steps[0][1]
        for b, x, _ in steps:
            if b <= bar:
                bpm = x
        if abs(bpm - want) > 0.005:
            _fail("tempo", f"must be {want} BPM in bar {bar}, as piece_tempo says")


def _level(x, p):
    return x if _is_num(x) and x in LEVELS else _fail(p, f"must be one of {', '.join(str(l) for l in LEVELS)}")


def _dynamics(v, path, bars) -> None:
    _marks(v, path, bars, _level, "level", ("steady", "louder", "softer"), "louder", "softer")


def _speed(v, path) -> None:
    if v == "follow":
        return
    if not isinstance(v, dict):
        _fail(path, 'must be "follow", {ratio} or {bpm}')
    if "ratio" in v and "bpm" not in v:
        r = _num(v["ratio"], f"{path}.ratio")
        if not any(abs(x - r) < 1e-6 for x in SPEED_RATIOS):
            _fail(f"{path}.ratio", f"must be one of {', '.join(str(x) for x in SPEED_RATIOS)}")
    elif "bpm" in v and "ratio" not in v:
        _range(v["bpm"], f"{path}.bpm", 20, 400)
    else:
        _fail(path, 'must be "follow", {ratio} or {bpm}')


def _bend(v, path, length) -> None:
    pts = _arr(v, path, 2)
    if len(pts) > MAX_BEND_POINTS:
        _fail(path, f"must have at most {MAX_BEND_POINTS} points")
    times = []
    for i, pt in enumerate(pts):
        p = f"{path}[{i}]"
        if not isinstance(pt, list) or len(pt) != 2:
            _fail(p, "must be a [seconds, cents] pair")
        times.append(_num(pt[0], f"{p}[0]"))
        _range(pt[1], f"{p}[1]", -1200, 1200)
    for i, t in enumerate(times):
        if (t != 0) if i == 0 else (t <= times[i - 1]):
            _fail(f"{path}[{i}][0]", "the first time must be 0" if i == 0 else "times must increase")
        if t > length + EPS:
            _fail(f"{path}[{i}][0]", f"must be within the note ({length} seconds)")


def _settings(v, path, rules):
    """An object of only the keys listed; each present one checked by its own rule."""
    o = _obj(v, path)
    out = {}
    for k in o:
        if k not in rules:
            _fail(f"{path}.{k}", f"is not a setting ({', '.join(rules)})")
        out[k] = rules[k](o[k], f"{path}.{k}")
    return out


def _span(lo, hi):
    return lambda x, p: _range(x, p, lo, hi)


def _whole(lo, hi):
    return lambda x, p: _int(x, p, lo, hi)


def _fx(v, path) -> None:
    _settings(v, path, {
        "volume_db": _span(-60, 12), "pan": _span(-1, 1),
        "eq": lambda x, p: _settings(x, p, {"bass": _span(-12, 12), "middle": _span(-12, 12), "treble": _span(-12, 12)}),
        "echo": lambda x, p: _settings(x, p, {"amount": _span(0, 1), "repeats": _whole(1, 8), "beats": _span(0.25, 2)}),
        "shimmer": _span(0, 1), "warmth": _span(0, 1),
        "brightness": lambda x, p: _settings(x, p, {"cutoff": _span(0, 1), "sweep": lambda y, q: _one_of(y, q, SWEEPS)}),
        "even_out": _span(0, 1), "room": _span(0, 1), "mute": _bool, "solo": _bool,
    })


def _harmony(x, q):
    vs = [_one_of(y, f"{q}[{j}]", HARMONY_VOICES) for j, y in enumerate(_arr(x, q, 1))]
    if len(vs) > 3 or len(set(vs)) != len(vs):
        _fail(q, "must be 1 to 3 different voices")
    return vs


VOICE_RULES = {
    "vocoder": {"carrier": _id, "bands": _whole(8, 32)},
    "autotune": {"strength": _span(0, 1), "retune_ms": _span(0, 400)},
    "harmonizer": {"voices": _harmony, "mix": _span(0, 1)},
    "pitch": {"semitones": _span(-12, 12), "formant": _span(-12, 12)},
    "talkbox": {"carrier": _id, "mix": _span(0, 1)},
    "robot": {"mix": _span(0, 1)},
    "whisper": {"mix": _span(0, 1)},
}


def _voice(v, path):
    items = _arr(v, path)
    if len(items) > MAX_VOICE_FX:
        _fail(path, f"must have at most {MAX_VOICE_FX} effects")
    out = []
    for i, e in enumerate(items):
        p = f"{path}[{i}]"
        o = _obj(e, p)
        effect = _one_of(o.get("effect"), f"{p}.effect", VOICE_EFFECTS)
        rest = {k: x for k, x in o.items() if k != "effect"}
        got = _settings(rest, p, VOICE_RULES[effect])
        for k in VOICE_RULES[effect]:
            if k not in got:
                _fail(f"{p}.{k}", f"is needed for {effect}")
        out.append({"effect": effect, **got})
    return out


FX_CLIP_EFFECTS = (
    "scratch", "spinback", "tape_stop", "tape_start", "vinyl",
    "riser", "snare_roll", "filter_sweep", "impact", "sidechain",
    "stutter", "trance_gate", "wobble", "tremolo", "auto_pan",
    "bitcrusher", "ring_mod", "phaser", "flanger", "auto_wah", "rotary",
    "echo_out", "ping_pong", "reverse", "reverse_reverb", "granular_freeze", "wide_8d", "doppler",
    "filter", "pitch_shift", "harmonizer", "vocoder", "autotune",
    "crossfader", "hot_cue", "looper",
)
MAX_FX_CLIPS = 256
MAX_FX_POINTS = 512
MIN_CLIP_BARS = 1 / 64
# How many values each recorded move's point carries after its bar, and their range, by effect.
FX_POINT_VALUES = {
    "scratch": (1, -8, 8), "crossfader": (1, 0, 1),
    "wobble": (2, 0, 1), "bitcrusher": (2, 0, 1), "flanger": (2, 0, 1), "ping_pong": (2, 0, 1), "filter": (2, 0, 1),
}
WHOLE_PIECE_EFFECTS = ("crossfader", "looper")


def _choice(allowed):
    return lambda x, p: _one_of(x, p, allowed)


def _number_of(allowed):
    def rule(x, p):
        if _is_num(x) and x in allowed:
            return x
        return _fail(p, f"must be one of {', '.join(str(a) for a in allowed)}")
    return rule


def _lane_list(x, p):
    ids = [_id(y, f"{p}[{j}]") for j, y in enumerate(_arr(x, p, 1))]
    if len(set(ids)) != len(ids):
        _fail(p, "must name each lane once")
    return ids


def _looper_bars(x, p):
    bs = [_int(y, f"{p}[{j}]", 1) for j, y in enumerate(_arr(x, p, 1))]
    if len(bs) > 4:
        _fail(p, "must be 1 to 4 bars")
    return bs


_TIME3 = ("fast", "medium", "slow")
# Each effect's settings and their rules, and the settings a clip of it must give (score.ts FX_CLIP_RULES).
FX_CLIP_RULES = {
    "scratch": ({"style": _choice(("baby", "chirp", "transformer"))}, ()),
    "spinback": ({"throw": _choice(("gentle", "hard"))}, ()),
    "tape_stop": ({"time": _choice(_TIME3)}, ()),
    "tape_start": ({"time": _choice(_TIME3)}, ()),
    "vinyl": ({"age": _span(0.2, 1)}, ()),
    "riser": ({"climb": _whole(1, 3)}, ()),
    "snare_roll": ({"level": _span(0.3, 1)}, ()),
    "filter_sweep": ({"mode": _choice(("highpass_up", "lowpass_down"))}, ()),
    "impact": ({"kind": _choice(("impact", "downlifter"))}, ()),
    "sidechain": ({"depth": _span(0, 1)}, ()),
    "stutter": ({"slice": _number_of((0, 4, 8, 16, 32))}, ()),
    "trance_gate": ({"pattern": _choice(("classic", "offbeat", "choppy"))}, ()),
    "wobble": ({"rate": _whole(1, 8), "depth": _span(0, 1)}, ()),
    "tremolo": ({"rate": _number_of((4, 8, 12))}, ()),
    "auto_pan": ({"speed": _choice(("bar", "half_bar", "beat"))}, ()),
    "bitcrusher": ({"crunch": _span(0.1, 1)}, ()),
    "ring_mod": ({"tone": _span(60, 1500)}, ()),
    "phaser": ({"speed": _choice(("slow", "medium", "fast"))}, ()),
    "flanger": ({"speed": _choice(("slow", "jet", "fast"))}, ()),
    "auto_wah": ({"sensitivity": _span(0, 1)}, ()),
    "rotary": ({"speed": _choice(("slow", "fast"))}, ()),
    "echo_out": ({"time": _choice(("dotted_eighth", "quarter", "half"))}, ()),
    "ping_pong": ({"time": _choice(("eighth", "dotted_eighth", "quarter"))}, ()),
    "reverse": ({"length": _choice(("beat", "two_beats", "bar"))}, ()),
    "reverse_reverb": ({"swell": _choice(("short", "long"))}, ()),
    "granular_freeze": ({"mode": _choice(("freeze", "stretch"))}, ()),
    "wide_8d": ({"circle": _choice(("four_bars", "two_bars", "bar"))}, ()),
    "doppler": ({}, ()),
    "filter": ({"cutoff": _span(0, 1), "resonance": _span(0, 1)}, ()),
    "pitch_shift": ({"semitones": _span(-12, 12), "formant": _span(-12, 12)}, ()),
    "harmonizer": ({"voices": _harmony, "mix": _span(0, 1)}, ()),
    "vocoder": ({"carrier": _id, "bands": _whole(8, 32)}, ("carrier",)),
    "autotune": ({"strength": _span(0, 1), "retune_ms": _span(0, 400)}, ()),
    "crossfader": ({"a": _lane_list, "b": _lane_list}, ("a", "b")),
    "hot_cue": ({"cue_bar": _span(1, 100000)}, ("cue_bar",)),
    "looper": ({"bars": _looper_bars, "mute_deck": _bool}, ("bars",)),
}
CLIP_KEYS = ("effect", "lane", "from_bar", "to_bar", "settings", "points")


def _bar_pos(x):
    return round(x * 1000) / 1000


def _fx_clips(v, bars, lane_ids) -> None:
    """DJ & Effects' clips: each over bars inside the piece, on a lane or the whole piece, with its own settings and moves."""
    items = _arr(v, "fx_clips")
    if len(items) > MAX_FX_CLIPS:
        _fail("fx_clips", f"must have at most {MAX_FX_CLIPS} clips")
    for i, c in enumerate(items):
        p = f"fx_clips[{i}]"
        o = _obj(c, p)
        for k in o:
            if k not in CLIP_KEYS:
                _fail(f"{p}.{k}", "is not part of an effect clip (effect, lane, from_bar, to_bar, settings, points)")
        effect = _one_of(o.get("effect"), f"{p}.effect", FX_CLIP_EFFECTS)
        lane = o.get("lane", "__missing__")
        if lane is not None and not (isinstance(lane, str) and lane in lane_ids):
            _fail(f"{p}.lane", "must be a lane id or null")
        if lane is not None and effect in WHOLE_PIECE_EFFECTS:
            _fail(f"{p}.lane", f"{effect} works on the whole piece: lane must be null")
        start = _range(o.get("from_bar"), f"{p}.from_bar", 1, bars + 1)
        end = _range(o.get("to_bar"), f"{p}.to_bar", 1, bars + 1)
        if _bar_pos(start) != start:
            _fail(f"{p}.from_bar", "must be a bar position to 1/1000 of a bar")
        if _bar_pos(end) != end:
            _fail(f"{p}.to_bar", "must be a bar position to 1/1000 of a bar")
        if end - start < MIN_CLIP_BARS - 1e-9:
            _fail(f"{p}.to_bar", "must be at least 1/64 of a bar after from_bar")
        rules, needed = FX_CLIP_RULES[effect]
        st = _settings(o["settings"], f"{p}.settings", rules) if "settings" in o else {}
        for k in needed:
            if k not in st:
                _fail(f"{p}.settings.{k}", f"is needed for {effect}")
        if effect == "vocoder" and (st["carrier"] == lane or st["carrier"] not in lane_ids):
            _fail(f"{p}.settings.carrier", "must be the id of another lane")
        if effect == "crossfader":
            for x in st["a"] + st["b"]:
                if x not in lane_ids:
                    _fail(f"{p}.settings.{'a' if x in st['a'] else 'b'}", "must name lanes of the piece")
            if set(st["a"]) & set(st["b"]):
                _fail(f"{p}.settings.b", "must not share a lane with a")
        if effect == "hot_cue" and st["cue_bar"] >= bars + 1:
            _fail(f"{p}.settings.cue_bar", f"must be before the end (bar {bars + 1})")
        if effect == "looper":
            for j, b in enumerate(st["bars"]):
                if b > bars:
                    _fail(f"{p}.settings.bars[{j}]", f"must be a bar of the piece (1 to {bars})")
        if "points" in o:
            if effect not in FX_POINT_VALUES:
                _fail(f"{p}.points", f"{effect} records no moves")
            n, lo, hi = FX_POINT_VALUES[effect]
            pts = _arr(o["points"], f"{p}.points", 2)
            if len(pts) > MAX_FX_POINTS:
                _fail(f"{p}.points", f"must have at most {MAX_FX_POINTS} points")
            prev = None
            for j, pt in enumerate(pts):
                q = f"{p}.points[{j}]"
                if not isinstance(pt, list) or len(pt) != n + 1:
                    _fail(q, "must be [bar, value]" if n == 1 else "must be [bar, x, y]")
                b = _range(pt[0], f"{q}[0]", start, end)
                for k, x in enumerate(pt[1:]):
                    _range(x, f"{q}[{k + 1}]", lo, hi)
                if prev is not None and b < prev:
                    _fail(f"{q}[0]", "bars must not go back")
                prev = b


def bar_seconds(tempo, bar):
    """Seconds from the start of the piece at bar position `bar` (12.5 is halfway through bar 12), through every tempo change."""
    sec = 0.0
    for i, t in enumerate(tempo):
        nxt = tempo[i + 1]["bar"] if i + 1 < len(tempo) else math.inf
        if bar <= t["bar"]:
            break
        sec += (min(bar, nxt) - t["bar"]) * t["beats"] * 60 / t["bpm"]
    # Halves round up, as JavaScript's Math.round does, so the page and the tool agree.
    return math.floor(sec * 1e6 + 0.5) / 1e6


def _bar_starts(tempo, bars):
    """Seconds at which each bar (1 to bars + 1) starts, by the step tempo list."""
    starts, t, at = {1: 0.0}, 0.0, tempo[0]
    for b in range(1, bars + 1):
        for x in tempo:
            if x["bar"] <= b:
                at = x
        t += at["beats"] * 60 / at["bpm"]
        starts[b + 1] = t
    return starts


def level_at(score, lane, seconds):
    """A lane's loudness level at `seconds`: a steady mark holds; Get Louder and Get Softer move linearly in seconds
    from the mark's bar start to the next mark's. None when the lane has no line. Matches levelAt in render/plan.ts."""
    marks = lane.get("dynamics")
    if not marks:
        return None
    last = max(m["bar"] for m in marks)
    starts = _bar_starts(score["tempo"], max(score["bars"], last))
    i = 0
    while i + 1 < len(marks) and starts[marks[i + 1]["bar"]] <= seconds + 1e-9:
        i += 1
    m = marks[i]
    if m["shape"] == "steady" or i + 1 == len(marks):
        return m["level"]
    n = marks[i + 1]
    a, b = starts[m["bar"]], starts[n["bar"]]
    return m["level"] + (n["level"] - m["level"]) * (seconds - a) / (b - a)


def effective_velocity(velocity, level):
    """A note's velocity scaled by its lane's loudness level (Fairly Loud, 80, leaves it as it is), held to 1..127."""
    if level is None:
        return velocity
    return max(1, min(127, math.floor(velocity * level / 80 + 0.5)))


def bend_rate(bend, t):
    """The playback-rate multiplier a bend gives `t` seconds into its note: linear in cents between points, held past the ends."""
    if not bend:
        return 1.0
    if t <= bend[0][0]:
        c = bend[0][1]
    elif t >= bend[-1][0]:
        c = bend[-1][1]
    else:
        c = bend[-1][1]
        for (t0, c0), (t1, c1) in zip(bend, bend[1:]):
            if t0 <= t <= t1:
                c = c0 + (c1 - c0) * (t - t0) / (t1 - t0)
                break
    return 2 ** (c / 1200)


VOCAL_INSTRUMENT = "vocal"
TAKE_RE = re.compile(r"vocal-[0-9a-f]{64}\.(flac|ogg|webm)")
MAX_TAKES = 32
MAX_CLIPS = 64
MAX_TAKE_SECONDS = 900


def _vocal(v, path, duration) -> bool:
    """A Vocal Track: 1 to 32 saved takes and up to 64 clips, each inside its take and the piece (the page's vocalOf)."""
    o = _obj(v, path)
    for k in o:
        if k not in ("takes", "clips"):
            _fail(f"{path}.{k}", "is not part of a vocal track (takes, clips)")
    takes = {}
    for i, t in enumerate(_arr(o.get("takes"), f"{path}.takes", 1)):
        p = f"{path}.takes[{i}]"
        to = _obj(t, p)
        f = to.get("file")
        if not (isinstance(f, str) and TAKE_RE.fullmatch(f)):
            _fail(f"{p}.file", "must be a saved take, vocal-<sha256>.flac, .ogg or .webm")
        seconds = _range(to.get("seconds"), f"{p}.seconds", 0.01, MAX_TAKE_SECONDS)
        if f in takes:
            _fail(f"{path}.takes", "must name each take once")
        takes[f] = seconds
    if len(takes) > MAX_TAKES:
        _fail(f"{path}.takes", f"must have at most {MAX_TAKES} takes")
    clips = _arr(o.get("clips"), f"{path}.clips")
    for i, c in enumerate(clips):
        p = f"{path}.clips[{i}]"
        co = _obj(c, p)
        if co.get("take") not in takes:
            _fail(f"{p}.take", "must be one of the track's takes")
        seconds = takes[co["take"]]
        at = _range(co.get("at"), f"{p}.at", 0, duration)
        start = _range(co.get("from"), f"{p}.from", 0, seconds)
        end = _range(co.get("to"), f"{p}.to", 0, seconds)
        _range(co.get("gain_db"), f"{p}.gain_db", -24, 12)
        fade_in = _range(co.get("fade_in"), f"{p}.fade_in", 0, 10)
        fade_out = _range(co.get("fade_out"), f"{p}.fade_out", 0, 10)
        if end - start < 0.01:
            _fail(f"{p}.to", "must be after from")
        if at + end - start > duration + EPS:
            _fail(p, f"must end by the end of the piece ({duration} seconds)")
        if fade_in + fade_out > end - start + EPS:
            _fail(p, "its fades must fit in the clip")
    if len(clips) > MAX_CLIPS:
        _fail(f"{path}.clips", f"must have at most {MAX_CLIPS} clips")
    return True


def _sound(v, path, instruments) -> None:
    o = _obj(v, path)
    instrument = _id(o.get("instrument"), f"{path}.instrument")
    if instruments is not None and instrument != VOCAL_INSTRUMENT and instrument not in instruments:
        _fail(f"{path}.instrument", "must be an instrument id in the sample library")
    _range(o.get("gain_db"), f"{path}.gain_db", -40, 20)
    _range(o.get("attack"), f"{path}.attack", 0, 10)
    _range(o.get("release"), f"{path}.release", 0, 20)


def _sections(v, music, bars, duration) -> None:
    out = []
    for i, s in enumerate(_arr(v, "sections", 1 if music else 0)):
        p = f"sections[{i}]"
        o = _obj(s, p)
        item = {"id": _id(o.get("id"), f"{p}.id")}
        _text(o.get("name"), f"{p}.name", 60)
        _color(o.get("color"), f"{p}.color")
        if music:
            for k in ("from", "to"):
                _absent(o, k, p, "a music section spans bars (from_bar, to_bar)")
            item["a"], item["b"] = _int(o.get("from_bar"), f"{p}.from_bar", 1), _int(o.get("to_bar"), f"{p}.to_bar", 1)
        else:
            for k in ("from_bar", "to_bar"):
                _absent(o, k, p, "a sound section is a moment in seconds (from, to)")
            item["a"], item["b"] = _num(o.get("from"), f"{p}.from"), _num(o.get("to"), f"{p}.to")
        out.append(item)
    _unique(out, "sections")
    for i, s in enumerate(out):
        prev = out[i - 1] if i > 0 else None
        a, b = s["a"], s["b"]
        if music:
            want = prev["b"] + 1 if prev else 1
            if a != want:
                _fail(f"sections[{i}].from_bar", f"must start at bar {want}, one after the previous section" if prev else "the first section must start at bar 1")
            if b < a:
                _fail(f"sections[{i}].to_bar", "must not be before from_bar")
            if i == len(out) - 1 and b != bars:
                _fail(f"sections[{i}].to_bar", f"the last section must end at bar {bars}")
        else:
            if a < 0 or (prev and a < prev["b"] - EPS):
                _fail(f"sections[{i}].from", "must not start before the previous moment ends" if prev else "must be 0 or later")
            if not a < b:
                _fail(f"sections[{i}].to", "must be after from")
            if b > duration + EPS:
                _fail(f"sections[{i}].to", f"must be at most {duration}")
