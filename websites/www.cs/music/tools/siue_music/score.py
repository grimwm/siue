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
MIN_SOUND_SECONDS = 0.05
FAMILIES = ("strings", "brass", "woodwinds", "percussion", "choir", "keys", "synth", "harp", "bells",
            "impact", "whoosh", "ambience", "voice", "electronic", "foley", "ui")
UNITS = (1, 2, 4, 8, 16)
AUDIO_TYPES = {"audio.webm": "audio/webm; codecs=opus", "audio.m4a": "audio/mp4; codecs=mp4a.40.2"}
EPS = 1e-9


class _Fail(Exception):
    pass


def _fail(path: str, rule: str):
    raise _Fail(f"{path}: {rule}")


def glossary_ids(path: Path) -> frozenset[str]:
    """The term ids in glossary.json, the one glossary source the page and this tool share."""
    return frozenset(t["id"] for t in json.loads(Path(path).read_text(encoding="utf-8"))["terms"])


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


def validate(obj: object, glossary_ids: frozenset[str]) -> list[str]:
    """The first broken rule as a one-item list naming its path (e.g. "sections[1].from_bar"); [] when the score is valid."""
    if not isinstance(obj, dict):
        return ["score: must be an object"]
    if obj.get("schema") != 1 or isinstance(obj.get("schema"), bool):
        return [f"schema: this draft uses score schema {obj.get('schema')}, which this tool does not know"]
    try:
        _build(obj, glossary_ids)
    except _Fail as e:
        return [str(e)]
    return []


def _build(r: dict, glossary: frozenset[str]) -> None:
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

    _sections(r.get("sections"), music, bars, duration)
    lanes = []
    for i, l in enumerate(_arr(r.get("lanes"), "lanes", 1)):
        p = f"lanes[{i}]"
        o = _obj(l, p)
        lanes.append({"id": _id(o.get("id"), f"{p}.id")})
        _text(o.get("name"), f"{p}.name", 60)
        _one_of(o.get("family"), f"{p}.family", FAMILIES)
        _one_of(o.get("icon"), f"{p}.icon", FAMILIES)
        _color(o.get("color"), f"{p}.color")
    _unique(lanes, "lanes")
    lane_ids = {l["id"] for l in lanes}

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
        start, length = _num(o.get("start"), f"{p}.start"), _num(o.get("length"), f"{p}.length")
        if start < 0 or length <= 0 or start + length > duration + EPS:
            _fail(p, f"must start at 0 or later, have a length above 0 and end by {duration} seconds")
        _int(o.get("pitch"), f"{p}.pitch", 0, 127)
        _int(o.get("velocity"), f"{p}.velocity", 1, 127)
        mo = o.get("motif")
        if not (mo is None or (isinstance(mo, str) and mo in motif_ids)):
            _fail(f"{p}.motif", "must be a motif id or null")

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

    for i, a in enumerate(_arr(r.get("audio"), "audio", 1)):
        p = f"audio[{i}]"
        o = _obj(a, p)
        f = _one_of(o.get("file"), f"{p}.file", ("audio.webm", "audio.m4a"))
        if o.get("type") != AUDIO_TYPES[f]:
            _fail(f"{p}.type", f"must be {AUDIO_TYPES[f]} for {f}")

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
