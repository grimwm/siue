/* Operation Tankity: keyboard and touch input.
 *
 * Input maps physical keys and touches to named commands; main.ts registers
 * what each command does right now. The names are the actions of game.json's
 * `keys` section (barrelLeft, fire, guns, lineDown, ...), so a rebinding in
 * game.yaml changes which key reaches a command and nothing here. A handler
 * returns true when it used the key (the browser's default is then
 * suppressed), 'quiet' when it used the key but the default should stand, and
 * nothing when the command does not apply in the current context, which lets
 * the key fall through to the next candidate.
 *
 * What lives here: the key table (tokens, Shift+ and Ctrl+ chords, the frozen
 * fallback), the lookup, the order a keydown is offered to the commands, the
 * held keys and the rate-based arm movement, the on-screen hold buttons, and
 * dropping held keys when the window loses focus. What does not: what a
 * command does, and which panel is open.
 *
 * Nothing here reaches for the page: events and targets are the small
 * structural shapes below, which a browser's KeyboardEvent, Window and button
 * satisfy, so this module compiles in the DOM-free program and test/input.test.ts
 * drives it with plain objects and a fake clock. */
import { powerScale } from './field.ts';
import { ROOM_W } from './sim.ts';

/* ---------- the key table ---------- */

export type KeyContext = 'aim' | 'shop' | 'global' | 'scroll';
/** game.json's `keys` section: per context, each action's tokens in label order. */
export type KeyDefs = Readonly<Record<KeyContext, Readonly<Record<string, readonly string[]>>>>;

/** The actions that can be held down: the barrel, the power and the drive. */
export type HoldCommand = 'barrelLeft' | 'barrelRight' | 'powerUp' | 'powerDown' | 'driveLeft' | 'driveRight';
type ShopCommand = 'selUp' | 'selDown' | 'qtyUp' | 'qtyDown' | 'buyRow' | 'buy' | 'preview' | 'close' | 'next';
type GlobalCommand =
  | 'music' | 'sound' | 'log' | 'help' | 'report' | 'random' | 'rooms' | 'new'
  | 'guns' | 'gunStock' | 'nextTrack' | 'tutorial' | 'battlePreview' | 'fullscreen' | 'fire' | 'back';
type ScrollCommand = 'lineDown' | 'lineUp' | 'pageDown' | 'pageUp' | 'halfDown' | 'halfUp';
/** Keys no one rebinds: how a grid (the gun picker) is walked and loaded. */
type GridCommand = 'gridLeft' | 'gridRight' | 'gridUp' | 'gridDown' | 'confirm' | 'digit';
export type Command = ShopCommand | GlobalCommand | ScrollCommand | GridCommand;

/** Frozen copy of game.yaml's keys section, in force until game.json loads (or when it cannot). */
export const FALLBACK_KEYS: KeyDefs = Object.freeze({
  aim: Object.freeze({
    barrelLeft: ['ArrowLeft', 'Left'],
    barrelRight: ['ArrowRight', 'Right'],
    powerUp: ['ArrowUp', 'Up'],
    powerDown: ['ArrowDown', 'Down'],
    driveLeft: ['Shift+ArrowLeft', 'Shift+Left'],
    driveRight: ['Shift+ArrowRight', 'Shift+Right'],
  }),
  shop: Object.freeze({
    selUp: ['ArrowUp', 'Up'],
    selDown: ['ArrowDown', 'Down'],
    qtyUp: ['ArrowRight', 'Right'],
    qtyDown: ['ArrowLeft', 'Left'],
    buyRow: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    buy: ['b', 'Enter'],
    preview: ['v', 'p'],
    close: ['q'],
    next: ['n'],
  }),
  global: Object.freeze({
    music: ['m'], nextTrack: ['BracketRight', ']'], sound: ['e'], log: ['l'], help: ['h'],
    report: ['r'], random: ['t'], rooms: ['o'], new: ['n'], guns: ['g'], gunStock: ['i'], tutorial: ['u'],
    battlePreview: ['v'], fullscreen: ['f'],
    fire: ['Space', ' ', 'ControlLeft', 'ControlRight', 'Control'],
    back: ['q'],
  }),
  scroll: Object.freeze({
    lineDown: ['j'], lineUp: ['k'],
    pageDown: ['PageDown'], pageUp: ['PageUp'], halfDown: ['Shift+KeyJ'], halfUp: ['Shift+KeyK'],
  }),
});

/** token -> action, per context. */
export type Keymap = Readonly<Record<string, Readonly<Record<string, string>>>>;

export function buildKeymap(defs: KeyDefs): Keymap {
  const rev: Record<string, Record<string, string>> = {};
  for (const ctx of Object.keys(defs) as KeyContext[]) {
    const table: Record<string, string> = {};
    rev[ctx] = table;
    for (const [action, tokens] of Object.entries(defs[ctx])) {
      for (const t of tokens) table[t] = action;
    }
  }
  return rev;
}

/** The part of a keyboard event the mapping reads. */
export interface KeyLike {
  key?: string;
  code?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  repeat?: boolean;
  isTrusted?: boolean;
  isComposing?: boolean;
  target?: { tagName?: string; readOnly?: boolean; type?: string; click?(): void } | null;
  preventDefault(): void;
}

/** The action a key event names in one context, or null. Modifier tokens
 * (Ctrl+X, Shift+X) win while that modifier is held; then the physical code,
 * then the printed key (either case). */
export function lookupKey(map: Keymap, ctx: string, e: Pick<KeyLike, 'key' | 'code' | 'ctrlKey' | 'shiftKey'>): string | null {
  const m = map[ctx];
  if (!m) return null;
  const key = e.key;
  for (const [held, mod] of [[e.ctrlKey, 'Ctrl+'], [e.shiftKey, 'Shift+']] as const) {
    if (!held) continue;
    const c = (e.code && m[mod + e.code]) || (key && (m[mod + key] || m[mod + key.toLowerCase()]));
    if (c) return c;
  }
  if (e.code && m[e.code]) return m[e.code] ?? null;
  if (key) {
    const hit = m[key] || m[key.toLowerCase()];
    if (hit) return hit;
  }
  return null;
}

/** One token in, one printable cap out: arrows show as ← ↑ → ↓, codes shed their Key/Digit prefix, lone letters go uppercase, chords join with +. */
export function keycap(token: string): string {
  const glyph: Record<string, string> = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Up: '↑', Down: '↓', Left: '←', Right: '→',
  };
  const g = glyph[token];
  if (g) return g;
  if (token === ' ' || token === 'Space') return 'Space';
  if (/^Ctrl\+/.test(token)) return 'Ctrl+' + keycap(token.slice(5));
  if (/^Shift\+/.test(token)) return 'Shift+' + keycap(token.slice(6));
  if (/^(ControlLeft|ControlRight|Control)$/.test(token)) return 'Ctrl';
  if (token === 'Enter') return 'Enter';
  if (token === 'PageUp') return 'PgUp';
  if (token === 'PageDown') return 'PgDn';
  if (token === 'Shift') return 'Shift';
  if (token === 'BracketRight') return ']';
  if (token === 'BracketLeft') return '[';
  const code = /^(Key|Digit)(.+)$/.exec(token);
  if (code) return (code[2] ?? '').toUpperCase();
  return String(token).toUpperCase();
}

/** True when the table has the four contexts a game.json must supply. */
export function isKeyDefs(def: unknown): def is KeyDefs {
  const d = def as Partial<Record<KeyContext, unknown>> | null | undefined;
  return !!d && !!d.aim && !!d.shop && !!d.global && !!d.scroll;
}

/** Phones and tablets: a device whose primary pointer is coarse. A stylus (the
 * S Pen) makes `any-pointer: fine` match too, so only the primary pointer
 * counts. Touch devices get no key hints and bind no keys until a real
 * keyboard key is pressed (see physicalKey). */
export function touchOnly(matchMedia: ((query: string) => { matches: boolean }) | undefined): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
}

/** A keydown from a physical keyboard: real (trusted), not an on-screen
 * keyboard's placeholder ('Unidentified', 'Process') and not composing text. */
export function physicalKey(e: Pick<KeyLike, 'key' | 'isTrusted' | 'isComposing'>): boolean {
  return e.isTrusted === true && !e.isComposing && e.key !== undefined && e.key !== 'Unidentified' && e.key !== 'Process';
}

/* ---------- held keys and the arm ---------- */

/** The keys and buttons currently down. Auto-repeat keydowns press again, which is a no-op. */
export class Held {
  private readonly down = new Set<HoldCommand>();
  press(cmd: HoldCommand): void { this.down.add(cmd); }
  release(cmd: HoldCommand): void { this.down.delete(cmd); }
  clear(): void { this.down.clear(); }
  has(cmd: HoldCommand): boolean { return this.down.has(cmd); }
  /** -1, 0 or 1 from a pair of opposed commands (both down cancel out). */
  axis(negative: HoldCommand, positive: HoldCommand): -1 | 0 | 1 {
    return ((this.has(positive) ? 1 : 0) - (this.has(negative) ? 1 : 0)) as -1 | 0 | 1;
  }
  /** Any of the four commands that move the barrel or the power. */
  aiming(): boolean {
    return this.has('barrelLeft') || this.has('barrelRight') || this.has('powerUp') || this.has('powerDown');
  }
}

/** How fast a held key moves the arm, per second. */
export const ARM_RATE = Object.freeze({ barrelDegrees: 42, power: 45 });
export const ARM_LIMITS = Object.freeze({ angleMin: 10, angleMax: 170, powerMin: 10, powerMax: 100 });

export interface ArmStep {
  angle: number;
  power: number;
  /** A barrel or power key is down and does something (opposed keys cancel). */
  adjusting: boolean;
  /** None of the four barrel and power keys is down. */
  idle: boolean;
  /** The angle was outside the limits (the loaded gun changed) and was brought inside them. */
  clamped: boolean;
}

/** One frame of held-key arm movement. `facing` is +1 or -1, the way the tank looks; `w` is the match's field width, which scales the power step;
 *  `lim` the loaded gun's angle limits (sim.ts aimLimits; 10..170 when left out), which the angle is always kept inside. */
export function stepArm(held: Held, dt: number, arm: { angle: number; power: number }, facing: number, w = ROOM_W,
  lim: { min: number; max: number } = { min: ARM_LIMITS.angleMin, max: ARM_LIMITS.angleMax }): ArmStep {
  const { powerMin, powerMax } = ARM_LIMITS;
  const angleMin = lim.min, angleMax = lim.max;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  let { angle, power } = arm;
  const clamped = angle < angleMin || angle > angleMax;
  angle = clamp(angle, angleMin, angleMax);
  const powerRate = ARM_RATE.power * powerScale(w);
  const swing = held.axis('barrelRight', 'barrelLeft');
  if (swing) angle = clamp(angle + swing * facing * ARM_RATE.barrelDegrees * dt, angleMin, angleMax);
  if (held.has('powerUp')) power = clamp(power + powerRate * dt, powerMin, powerMax);
  if (held.has('powerDown')) power = clamp(power - powerRate * dt, powerMin, powerMax);
  return {
    angle, power,
    adjusting: swing !== 0 || held.has('powerUp') || held.has('powerDown'),
    idle: !held.aiming(),
    clamped,
  };
}

/* ---------- commands ---------- */

/** What a handler is told about the key press. */
export interface Press {
  /** The printed key; for `digit`, '1' to '9'. */
  key: string;
  /** An auto-repeat keydown. */
  repeat: boolean;
}
/** true: used the key, suppress the default. 'quiet': used it, leave the default.
 * Nothing: not applicable here, so offer the key to the next candidate. */
export type Outcome = boolean | 'quiet' | void;
export type CommandTable = Partial<Record<Command, (press: Press) => Outcome>>;

/** What input needs to ask the game while it routes a key. */
export interface InputContext {
  /** Whether shop commands are live right now (the shop is up, no auto-repeat). */
  shopLive?(press: Press): boolean;
  /** A question holds every key but Q (the back key); modalBack answers it. */
  modalOpen?(): boolean;
  modalBack?(): void;
  /** The title card is up: the aim keys rest, and Space presses the card's focused button. */
  cardOpen?(): boolean;
  /** True when `target` is a control inside a card or overlay that is up (the
   *  shop, the end card, a menu, ...): Space and Enter press it instead of
   *  firing. A focused button elsewhere (the HUD, under the radio log or the
   *  coach) and a key with no focused button fall through as usual. */
  overlayOpen?(target: unknown): boolean;
  /** Something held or pressed started play (the page unlocks audio). */
  onHold?(cmd: HoldCommand): void;
}

const GRID_KEYS: Readonly<Record<string, GridCommand>> = {
  ArrowLeft: 'gridLeft', ArrowRight: 'gridRight', ArrowUp: 'gridUp', ArrowDown: 'gridDown', Enter: 'confirm', ' ': 'confirm',
};

/** The grid command a key names (not rebindable), or null. */
export function gridCommand(key: string | undefined): GridCommand | null {
  if (!key) return null;
  if (/^[1-9]$/.test(key)) return 'digit';
  return GRID_KEYS[key] ?? null;
}

/** Typing in a box is typing, not playing: initials and seeds keep every key. */
export function isTyping(target: { tagName?: string } | null | undefined): boolean {
  const tag = (target && target.tagName) || '';
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/* ---------- the environment ---------- */

/** A window: where the key and blur listeners go. */
export interface KeyTarget {
  addEventListener(type: 'keydown' | 'keyup', fn: (e: KeyLike) => void): void;
  addEventListener(type: 'blur', fn: () => void): void;
}
/** An on-screen hold button (the arm pad, the drive pad). */
export interface HoldButton {
  addEventListener(type: 'pointerdown', fn: (ev: { preventDefault(): void }) => void): void;
  addEventListener(type: 'pointerup' | 'pointerleave', fn: () => void): void;
  addEventListener(type: 'click', fn: (ev: { currentTarget: { blur?(): void } | null }) => void): void;
}

export interface Input {
  readonly held: Held;
  /** Replace the key table; false (and nothing changes) when it lacks a context. */
  setKeys(defs: unknown): boolean;
  keys(): KeyDefs;
  /** The action a key event names in one context. */
  lookup(ctx: string, e: Pick<KeyLike, 'key' | 'code' | 'ctrlKey' | 'shiftKey'>): string | null;
  /** The shown key for an action: the nth token its context lists, as a cap. */
  hint(ctx: string, action: string, idx?: number): string;
  /** Say what each command does; later calls replace the same commands. */
  register(table: CommandTable, context?: InputContext): void;
  /** Route one keydown / keyup. Bound to a window by `bind`; exported for the tests. */
  keydown(e: KeyLike): void;
  keyup(e: KeyLike): void;
  /** Listen on a window: keys (not on touch screens) and the blur that drops held keys. */
  bind(win: KeyTarget): void;
  /** Make a button hold a command for as long as the pointer is down on it. */
  bindHold(btn: HoldButton, cmd: HoldCommand): void;
}

export function createInput(opts: { touch: boolean; onKeyboard?: () => void }): Input {
  /** True until a physical key is pressed on a touch device. */
  let touch = opts.touch;
  let defs: KeyDefs = FALLBACK_KEYS;
  let map = buildKeymap(defs);
  const held = new Held();
  const commands: CommandTable = {};
  let ctx: InputContext = {};

  const lookup = (c: string, e: Pick<KeyLike, 'key' | 'code' | 'ctrlKey' | 'shiftKey'>) => lookupKey(map, c, e);

  /** Offer the press to one command. Returns whether the key is now spent. */
  function offer(e: KeyLike, cmd: string | null, press: Press): boolean {
    if (!cmd) return false;
    const fn = commands[cmd as Command];
    if (!fn) return false;
    const out = fn(press);
    if (out === true) { e.preventDefault(); return true; }
    return out === 'quiet';
  }

  /* Aim keys physically down, so Shift arriving mid-hold can turn them into
     drives at once instead of waiting for an auto-repeat that some platforms
     stop sending when a second key goes down. */
  const aimDown = new Map<string, { key?: string; code?: string; ctrlKey?: boolean }>();

  function keydown(e: KeyLike): void {
    // An editable box keeps every key, Q included: initials and codes may have
    // a Q. A read-only field (the invite link) or a slider (the turn time)
    // types nothing, so Q still goes back from it and every other key, the
    // slider's arrows included, stays the field's. Esc is bound to nothing,
    // so it never reaches a command below.
    if (isTyping(e.target)) {
      const t = e.target;
      const readOnly = !!t && t.tagName === 'INPUT' && (!!t.readOnly || t.type === 'range');
      if (!readOnly || lookup('global', e) !== 'back') return;
    }
    // Only plain Q is back: Cmd+Q quits the browser, and Ctrl+Q and Alt+Q are
    // shortcuts too. They fall to the browser untouched.
    if ((e.ctrlKey || e.altKey || e.metaKey) && (lookup('global', e) === 'back' || lookup('shop', e) === 'close')) return;
    if (e.key === 'Shift') {
      for (const k of aimDown.values()) {
        const act = lookup('aim', { ...k, shiftKey: true }) as HoldCommand | null;
        const plain = lookup('aim', { ...k, shiftKey: false }) as HoldCommand | null;
        if (act && plain && act !== plain) { held.release(plain); held.press(act); }
      }
    }
    const press: Press = { key: e.key || '', repeat: !!e.repeat };
    const global = lookup('global', e);
    if (ctx.modalOpen && ctx.modalOpen()) {
      if (global === 'back') { e.preventDefault(); if (ctx.modalBack && !press.repeat) ctx.modalBack(); }
      return;
    }
    // Panel scrolling runs before every other binding so an open panel keeps
    // its keys even where letters already work (shop buys, driving). With no
    // panel open the handlers decline and the keys fall through untouched.
    // Arrows are never scroll keys: they keep their aim and shop jobs.
    if (offer(e, lookup('scroll', e), press)) return;
    const grid = gridCommand(e.key);
    if (grid && offer(e, grid, { ...press, key: e.key || '' })) return;
    // Over a card or overlay, Space and Enter press the focused button, the way
    // a page's buttons work; the button's own activation is cancelled so it
    // presses once. Ctrl never does: it begins browser shortcuts.
    const target = e.target;
    if ((e.key === ' ' || e.key === 'Enter') && !e.ctrlKey && target && target.tagName === 'BUTTON' && target.click
      && ((ctx.cardOpen && ctx.cardOpen()) || (ctx.overlayOpen && ctx.overlayOpen(target)))) {
      e.preventDefault();
      if (!press.repeat) target.click();
      return;
    }
    // The shop answers to its own keys; everything else falls through.
    if (ctx.shopLive && ctx.shopLive(press) && offer(e, lookup('shop', e), press)) return;
    if (global === 'back') {
      // Holding Q is one back, not a menu that opens and shuts with the key repeat.
      e.preventDefault();
      const fn = commands.back;
      if (fn && !press.repeat) fn(press);
      return;
    }
    const act = lookup('aim', e) as HoldCommand | null;
    if (act && ctx.cardOpen && ctx.cardOpen()) return;
    if (act) {
      // Shift pressed or let go mid-hold turns a barrel key into a drive key
      // (or back): only the action the chord names now stays down.
      const other = lookup('aim', { key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey: !e.shiftKey }) as HoldCommand | null;
      if (other && other !== act) held.release(other);
      aimDown.set(e.code || e.key || '', { key: e.key, code: e.code, ctrlKey: e.ctrlKey });
      held.press(act);
      e.preventDefault();
      if (ctx.onHold) ctx.onHold(act);
      return;
    }
    // Fire stays a special tap with its own repeat guard, but its keys come
    // from the same table as everything else.
    if (global === 'fire') {
      e.preventDefault();
      const fn = commands.fire;
      if (fn && !press.repeat) fn(press);
      return;
    }
    if (press.repeat) return;
    const fn = global ? commands[global as Command] : undefined;
    if (fn) fn(press);
  }

  function keyup(e: KeyLike): void {
    if (isTyping(e.target)) return;
    aimDown.delete(e.code || e.key || '');
    // A chord comes apart in either order: an arrow lets go of whatever it
    // held with or without Shift, and the last Shift up turns every Shift+ hold
    // back into the plain hold of the arrow still down.
    for (const shiftKey of [false, true]) {
      const act = lookup('aim', { key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey }) as HoldCommand | null;
      if (act) held.release(act);
    }
    if (e.key === 'Shift' && !e.shiftKey) {
      for (const [action, tokens] of Object.entries(defs.aim)) {
        if (tokens.some(t => t.startsWith('Shift+'))) held.release(action as HoldCommand);
      }
      for (const k of aimDown.values()) {
        const plain = lookup('aim', { ...k, shiftKey: false }) as HoldCommand | null;
        if (plain) held.press(plain);
      }
    }
  }

  return {
    held,
    setKeys(next) {
      if (!isKeyDefs(next)) return false;
      defs = next;
      map = buildKeymap(next);
      return true;
    },
    keys: () => defs,
    lookup,
    hint(c, action, idx) {
      const tokens = (defs[c as KeyContext] && defs[c as KeyContext][action]) || [];
      const t = tokens[idx || 0];
      return t === undefined ? '' : keycap(t);
    },
    register(table, context) {
      Object.assign(commands, table);
      if (context) ctx = { ...ctx, ...context };
    },
    keydown,
    keyup,
    bind(win) {
      // A touch device routes no keys until a real keyboard key arrives (a
      // keyboard case on a tablet); that first key only turns the keys on.
      win.addEventListener('keydown', e => {
        if (touch) {
          if (!physicalKey(e)) return;
          touch = false;
          opts.onKeyboard?.();
          return;
        }
        keydown(e);
      });
      win.addEventListener('keyup', e => { if (!touch) keyup(e); });
      // Turn-based play never needs a blur pause (that only stranded players on
      // a seemingly frozen screen). Just drop held keys so the barrel stops.
      win.addEventListener('blur', () => { held.clear(); aimDown.clear(); });
    },
    bindHold(btn, cmd) {
      btn.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        held.press(cmd);
        if (ctx.onHold) ctx.onHold(cmd);
      });
      btn.addEventListener('pointerup', () => held.release(cmd));
      btn.addEventListener('pointerleave', () => held.release(cmd));
      btn.addEventListener('click', ev => { if (ev.currentTarget && ev.currentTarget.blur) ev.currentTarget.blur(); });
    },
  };
}
