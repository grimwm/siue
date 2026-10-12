import sys
out = sys.argv[1]
CSS = r"""
<style>
.tk { --bg:#05060f; --panel:#0c0f2e; --line:#3a3fb0; --gold:#ffc93c; --ink:#eef; --dim:#9aa3c7; font-family: system-ui, sans-serif; }
.tk .dev { margin:0 0 26px; }
.tk .dev h3 { margin:0 0 6px; font-size:14px; }
.tk .dev h3 small { color:#888; font-weight:500; }
.tk .clip { overflow:hidden; border-radius:14px; border:3px solid #333; background:var(--bg); }
/* the screen at its real CSS size; scaled only for display */
.tk .screen { container-type:inline-size; background:var(--bg); color:var(--ink); display:flex; flex-direction:column; gap:6px; padding:6px; box-sizing:border-box; transform-origin:top left; }
.tk .status { display:flex; align-items:center; gap:10px; background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:5px 8px; font-size:13px; white-space:nowrap; min-width:0; }
.tk .status .row { display:flex; align-items:center; gap:10px; min-width:0; }
.tk .k { color:var(--dim); font-size:.78em; letter-spacing:.06em; }
.tk .v { color:#7f7; font-weight:800; }
.tk .menu { display:inline-flex; align-items:center; gap:6px; height:26px; box-sizing:border-box; background:var(--gold); color:#111; font-weight:800; border-radius:6px; padding:0 9px; flex:none; }
.tk kbd { display:inline-flex; align-items:center; height:15px; padding:1px 5px 0; box-sizing:border-box; font:700 9px/1 system-ui; color:#eef0ff; background:#14183a; border:1px solid #3a3f78; border-bottom:2px solid #000; border-radius:4px; }
.tk .pill { display:inline-flex; align-items:center; gap:5px; background:#11163a; border:1px solid #5a63e0; border-radius:999px; padding:2px 9px; flex:none; }
.tk .pill.ammo { border-color:#ffb13c; } .tk .pill.ammo .v { color:#ffb13c; }
.tk .pill.armor { border-color:#7ddf64; }
.tk .pill.lives { border-color:#ff5c8a; } .tk .hearts { color:#ff5c8a; letter-spacing:1px; }
.tk .arrow { color:var(--gold); font-weight:900; letter-spacing:-2px; }
.tk .grow { flex:1; min-width:0; }
.tk .seg { display:inline-flex; align-items:stretch; border:1px solid var(--line); border-radius:8px; overflow:hidden; flex:none; }
.tk .seg > span { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; }
.tk .seg > span + span { border-left:1px solid var(--line); }
.tk .cash .v { color:#ffd75e; }
.tk .stat { flex:none; }
.tk .short { display:none; } .tk .lv-short { display:none; }
/* compact: short labels */
@container (max-width: 1100px) { .tk .status { font-size:12px; gap:7px; } .tk .status .row { gap:7px; } .tk .full { display:none; } .tk .short { display:inline; } .tk .menu .mword { display:inline; } }
@container (max-width: 860px) { .tk .status { font-size:11px; gap:6px; padding:4px 6px; } .tk .status .row { gap:6px; } .tk .pill { padding:1px 7px; } .tk .seg > span { padding:1px 6px; } .tk .lv-full { display:none; } .tk .lv-short { display:inline; } }
@container (max-width: 760px) { .tk .status { font-size:11px; gap:6px; padding:4px 6px; } .tk .status .row { gap:6px; } .tk .pill { padding:1px 7px; } .tk .seg > span { padding:1px 6px; } .tk .menu { height:24px; padding:0 7px; } .tk .nokey kbd { display:none; } }
/* portrait: two designed rows */
.tk .status.two { flex-direction:column; align-items:stretch; gap:4px; }
.tk .status.two .row { justify-content:space-between; }
/* battlefield */
.tk .scene { position:relative; flex:1; min-height:0; border-radius:8px; overflow:hidden; background:radial-gradient(circle at 85% 18%, #2a2d55 0 3%, transparent 9%), linear-gradient(#05060f 0 70%, #7a4a20 70%); }
.tk .scene::after { content:""; position:absolute; left:0; right:0; top:69%; height:3px; background:#2c2; }
.tk .toast { position:absolute; z-index:2; top:8px; left:50%; transform:translateX(-50%); font-size:11px; background:rgba(12,15,46,.88); border:1px solid var(--line); border-radius:7px; padding:3px 9px; white-space:nowrap; }
.tk .toast b { color:#ff0; }
/* deck */
.tk .deck { display:flex; align-items:flex-end; justify-content:space-between; gap:10px; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:8px; flex:none; }
.tk .grp { display:flex; flex-direction:column; align-items:center; gap:4px; }
.tk .gl { font-size:9px; letter-spacing:.12em; color:var(--dim); text-transform:uppercase; }
.tk .rowb { display:flex; gap:5px; }
.tk .btn { display:inline-flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; min-width:48px; height:58px; box-sizing:border-box; padding:3px 8px; border-radius:9px; border:1.5px solid var(--c,#667); background:#0a0d26; color:var(--ink); font-size:11px; font-weight:700; white-space:nowrap; }
.tk .btn .ic { font-size:14px; line-height:1; color:var(--c); }
.tk .btn.gold { background:var(--gold); border-color:var(--gold); color:#111; } .tk .btn.gold .ic { color:#111; }
.tk .aim { display:grid; grid-template-columns:repeat(3,auto); gap:4px; }
.tk .aim .btn { height:54px; }
.tk .fire { display:inline-flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; width:120px; height:58px; border-radius:12px; background:#e33; color:#fff; font-weight:900; font-size:16px; flex:none; }
.tk .touch .btn { height:46px; min-width:46px; font-size:10px; padding:2px 5px; }
.tk .touch .aim .btn { height:44px; min-width:46px; }
.tk .touch kbd { display:none; }
.tk .ov { position:absolute; z-index:3; }
.tk .lan .scene .btn.gold { background:rgba(255,201,60,.55); border-color:rgba(255,201,60,.9); color:#fff; text-shadow:0 0 2px #000,0 1px 2px #000; }
.tk .lan .scene .btn.gold .ic { color:#fff; }
.tk .lan .scene .btn { height:44px; }
.tk .unit { position:absolute; z-index:1; font-size:9px; font-weight:800; }
.tk .unit::after { content:""; display:block; margin:2px auto 0; width:16px; height:9px; border-radius:6px 6px 2px 2px; background:currentColor; }
</style>"""

def stat(full, short, val, cls=''):
    return f'<span class="stat {cls}"><span class="k"><span class="full">{full}</span><span class="short">{short}</span></span> <span class="v">{val}</span></span>'
def menu(key=True):
    return ('<span class="menu"><svg width="14" height="14" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 7h18M4 13h18M4 19h18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span class="mword">Menu</span>'
            + ('<kbd>Esc</kbd>' if key else '') + '</span>')
AMMO = '<span class="pill ammo"><span class="k">AMMO</span> <span class="v">∞</span></span>'
ARMOR = '<span class="pill armor"><span class="k"><span class="full">ARMOR</span><span class="short">ARM</span></span> <span class="v">100</span></span>'
LIVES = '<span class="pill lives" aria-label="5 lives"><span class="hearts">♥</span> <span class="v" style="color:#ff5c8a">5</span></span>'
WIND = '<span class="pill"><span class="k">WIND</span> <span class="arrow">➜➜➜</span><span class="v">7</span></span>'
def badge(room):
    if room:
        return '<span class="seg"><span><span class="k">ROOM</span> <span class="v">ABCD</span></span><span><span class="k">YOU</span> <span class="v">P2</span></span><span><span class="k"><span class="full">ROUND</span><span class="short">RND</span></span> <span class="v">13</span></span></span>'
    return '<span class="seg"><span class="cash"><span class="v">$12,450</span></span><span><span class="k"><span class="full">ROUND</span><span class="short">RND</span></span> <span class="v">13</span></span><span><span class="v">98,760</span> <span class="k">PTS</span></span></span>'
def aimstats():
    return stat('ANGLE','ANG','162°') + stat('POWER','PWR','100') + stat('FUEL','FUEL','100')

def status_one(room, key=True):
    return f'<div class="status{"" if key else " nokey"}">{menu(key)}{aimstats()}{AMMO}{ARMOR}{LIVES}{WIND}<span class="grow"></span>{badge(room)}</div>'
def status_two(room):
    return (f'<div class="status two nokey"><div class="row">{menu(False)}{aimstats()}</div>'
            f'<div class="row">{AMMO}{ARMOR}{LIVES}{WIND}</div>'
            f'<div class="row">{badge(room).replace("class=\"seg\"", "class=\"seg\" style=\"flex:1;justify-content:space-around\"")}</div></div>')

def scene(extra='', toast='Must be the wind. Definitely the wind.'):
    return (f'<div class="scene"><span class="toast"><b>TANK</b> {toast}</span>'
            '<span class="unit" style="left:10%;top:58%;color:#fc3">TANK</span><span class="unit" style="left:56%;top:50%;color:#3dd">WRAITH</span>'
            '<span class="unit" style="left:84%;top:58%;color:#e3e">SPOTTER</span>' + extra + '</div>')
def b(label, ic, c, key=None, gold=False):
    k = f'<kbd>{key}</kbd>' if key else ''
    return f'<span class="btn{" gold" if gold else ""}" style="--c:{c}"><span class="ic">{ic}</span>{label}{k}</span>'
def aim(keys=True, words=('power','barrel')):
    p, br = words
    return ('<div class="aim"><span></span>' + b(p,'▲','#111','↑' if keys else None,True) + '<span></span>'
            + b(br,'◀','#111','←' if keys else None,True) + b(p,'▼','#111','↓' if keys else None,True) + b(br,'▶','#111','→' if keys else None,True) + '</div>')
WEAP_D = '<span class="btn" style="--c:#ffb13c"><span class="ic" style="font-size:12px;font-weight:800">🔘 Shell</span>34 dmg · M<kbd>G</kbd></span>'
def deck_desktop():
    return ('<div class="deck">'
      f'<div class="grp"><span class="gl">Aim</span>{aim()}</div>'
      '<div class="grp"><span class="gl">Drive (uses fuel)</span><div class="rowb">' + b('Left','⇠','#7ddf64','Shift ←') + b('Right','⇢','#7ddf64','Shift →') + '</div></div>'
      '<div class="grp"><span class="gl">More</span><div class="rowb">' + b('Radio','📻','#6fe4ff','L') + b('Next song','♫','#ff7ad9',']') + b('Help','?','#8f8fff','H') + '</div></div>'
      f'<div class="grp"><span class="gl">Weapon</span>{WEAP_D}</div>'
      '<span class="fire">FIRE<kbd>Space</kbd></span></div>')
def deck_portrait():
    return ('<div class="deck touch" style="flex-wrap:wrap;align-items:stretch;gap:6px">'
      + aim(False, ('pwr','barrel')) +
      '<div style="display:flex;flex-direction:column;gap:4px;flex:1;max-width:110px"><span class="btn" style="--c:#ffb13c;height:44px;width:100%"><span class="ic" style="font-size:12px;font-weight:800">🔘 Shell</span></span>'
      '<span class="fire" style="width:100%;height:auto;flex:1">FIRE</span></div>'
      '<div class="rowb" style="width:100%;justify-content:space-between">' + b('Drive','⇠','#7ddf64') + b('Drive','⇢','#7ddf64') + b('Radio','📻','#6fe4ff') + b('Help','?','#8f8fff') + '</div></div>')
def landscape_controls():
    return ('<div class="ov touch" style="left:6px;bottom:6px">' + aim(False, ('pwr','barrel')) + '</div>'
      '<div class="ov touch rowb" style="left:50%;transform:translateX(-50%);bottom:6px">' + b('Drive','⇠','#7ddf64') + b('Drive','⇢','#7ddf64') + '</div>'
      '<div class="ov touch" style="right:6px;bottom:6px;display:flex;flex-direction:column;gap:8px;width:96px">'
      '<span class="btn" style="--c:#ffb13c;height:36px;width:100%"><span class="ic" style="font-size:12px;font-weight:800">🔘 Shell</span></span>'
      '<span class="fire" style="width:100%;height:46px">FIRE</span></div>')

DEVICES = [
  ('Desktop', 1280, 720, 'desk', False),
  ('Laptop, small window', 1024, 640, 'desk', False),
  ('Tablet, landscape', 1180, 820, 'desk', False),
  ('Tablet, portrait', 820, 1180, 'desk', False),
  ('iPhone 15, portrait', 393, 852, 'por', False),
  ('Small Android, portrait', 360, 740, 'por', False),
  ('iPhone 15, landscape', 852, 393, 'lan', False),
  ('Small Android, landscape', 740, 360, 'lan', False),
]
html = [CSS, '<h2>Every device at its real size: worst-case numbers, solo and room</h2>',
        '<p class="subtitle">Each screen is rendered at its true CSS width and only scaled down for this page. The bars carry the widest values the game can show (angle 162°, power 100, $12,450, round 13, 98,760 pts), so anything that fits here fits in play. Armor and lives are separate pills. The check under each device is measured in the browser, not eyeballed.</p>',
        '<div class="tk">']
for i,(name,w,h,kind,_) in enumerate(DEVICES):
    for room in (False, True):
        tag = 'room' if room else 'solo'
        if kind == 'desk':
            body = (status_one(room) if w >= 900 else status_one(room, key=True)) + scene() + deck_desktop()
            # tablets are touch: no key chips
            if 'Tablet' in name:
                body = status_one(room, key=False) + scene() + deck_desktop().replace('<div class="deck">','<div class="deck touch">')
        elif kind == 'por':
            body = status_two(room) + scene(toast='Must be the wind.') + deck_portrait()
        else:
            body = status_one(room, key=False) + scene(landscape_controls(), toast='Must be the wind.')
        scale = min(1.0, 980 / w)
        html.append(f'<div class="dev" data-dev="{name} · {tag}"><h3>{name} <small>{w}×{h} · {tag}</small> <span class="chk" style="font-size:12px"></span></h3>'
                    f'<div class="clip" style="width:{w*scale+6:.0f}px;height:{h*scale+6:.0f}px">'
                    f'<div class="screen {kind}" style="width:{w}px;height:{h}px;transform:scale({scale:.4f})">{body}</div></div></div>')
html.append('</div>')
open(out,'w').write('\n'.join(html))
