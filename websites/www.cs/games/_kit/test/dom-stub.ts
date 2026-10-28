// A small DOM for Node tests that render Preact: a real tree, with parents,
// siblings, insert and remove, plus the handful of properties games read. Not
// a browser: no layout, no event bubbling; selectors are .class, #id or a tag.
// document.getElementById makes any id it is asked for, so a misspelled id
// finds a phantom element rather than nothing.
// Copyright (C) 2026 William Grim
// SPDX-License-Identifier: GPL-3.0-or-later
import assert from 'node:assert/strict';
import type { render } from 'preact';

/** A canvas context's stand-in: every property read, call and write is accepted and answers itself. */
export type Callable = { [key: string]: Callable } & (() => Callable);

export function makeCallable(): Callable {
  const fn = function (): Callable { return proxy; };
  const proxy: Callable = new Proxy(fn, {
    get: () => proxy,
    set: () => true,
    apply: () => proxy,
  }) as Callable;
  return proxy;
}

/** What a listener is handed: a bare event, or one `fire` made with the element as its target. */
export interface StubEvent {
  type?: string;
  currentTarget?: StubElement;
  target?: StubElement;
  preventDefault(): void;
  [extra: string]: unknown;
}
type Listener = (this: StubElement, ev: StubEvent) => void;

/** A text node, as a browser makes for a plain string child. */
export interface StubText {
  nodeType: 3;
  data: string;
  children: never[];
  parentNode: StubElement | null;
  textContent: string;
  readonly nextSibling: StubNode | null;
  remove(): void;
}
export type StubNode = StubElement | StubText;

/** The element `makeEl` builds: the properties games read, a tree, and listeners. */
export interface StubElement {
  id: string;
  _id: string;
  nodeType: 1;
  localName?: string;
  parentNode: StubElement | null;
  hidden: boolean;
  value: string;
  innerHTML: string;
  disabled: boolean;
  checked: boolean;
  style: Record<string, string>;
  className: string;
  scrollTop: number;
  scrollHeight: number;
  children: StubNode[];
  _text: string;
  _attrs: Record<string, string>;
  dataset: Record<string, string>;
  _l?: Record<string, Listener[]>;
  textContent: string;
  readonly childNodes: StubNode[];
  readonly parentElement: StubElement | null;
  readonly nextSibling: StubNode | null;
  readonly firstChild: StubNode | null;
  readonly offsetTop: number;
  readonly offsetHeight: number | undefined;
  readonly clientHeight: number | undefined;
  remove(): void;
  scrollIntoView(): void;
  querySelectorAll(sel: string): StubElement[];
  querySelector(sel: string): StubElement | null;
  _select(sel: string, first: boolean): StubElement[] | StubElement | null;
  append(...nodes: StubNode[]): StubElement;
  appendChild<T extends StubNode>(c: T): T;
  insertBefore<T extends StubNode>(c: T, ref: StubNode | null): T;
  removeChild<T extends StubNode>(c: T): T;
  addEventListener(t: string, f: Listener): void;
  dispatchEvent(ev: StubEvent): boolean;
  removeEventListener(t: string, f: Listener): void;
  setAttribute(k: string, v: unknown): void;
  getAttribute(k: string): string | undefined;
  removeAttribute(k: string): void;
  getBoundingClientRect(): { width: number; height: number };
  getContext(kind?: string): Callable;
  blur(): void;
  focus(): void;
  click(): void;
}

declare global {
  // What scrollIntoView, blur and focus leave behind, for a test to read.
  var __scrolledTo: StubElement | null | undefined;
  var __blurred: StubElement | null | undefined;
  var __focused: StubElement | null | undefined;
}

/** Elements by id: what document.getElementById answers, made on first ask. */
export const els: Record<string, StubElement> = {};
function detach(node: StubNode): void {
  if (node.parentNode) node.parentNode.removeChild(node);
}
function siblingOf(node: StubNode, step: number): StubNode | null {
  const kin = node.parentNode ? node.parentNode.children : [];
  return kin[kin.indexOf(node) + step] ?? null;
}
// node:assert prints a failing value with its getters, 1000 levels deep, and
// stops only at an ancestor it is already inside. A node whose parent and
// sibling links were enumerable would print every path through the tree, which
// grows past the machine's memory on a rendered page; so the links upward and
// sideways stay readable but hidden, and a node prints as its own subtree.
function hideLinks<T extends StubNode>(node: T, keys: readonly string[]): T {
  for (const key of keys) Object.defineProperty(node, key, { enumerable: false });
  return node;
}
export function makeText(data: unknown): StubText {
  return hideLinks({
    nodeType: 3, data: String(data), children: [], parentNode: null as StubElement | null,
    get textContent() { return this.data; },
    set textContent(v: string) { this.data = String(v); },
    get nextSibling() { return siblingOf(this, 1); },
    remove() { detach(this); },
  } as StubText, ['parentNode', 'nextSibling']);
}
// `children` holds every child node, text included (the stub's long-standing
// reading); a plain `textContent = ...` is one text child, as in a browser.
export function makeEl(id: string): StubElement {
  const el: StubElement = {
    id, nodeType: 1, parentNode: null as StubElement | null, hidden: true, value: '', innerHTML: '',
    disabled: false, checked: false, style: {}, className: '', scrollTop: 0, scrollHeight: 0,
    children: [], _text: '', _attrs: {}, dataset: {}, _id: id,
    get textContent() { return this.children.length ? this.children.map(c => c.textContent).join('') : this._text; },
    set textContent(v: string) { for (const c of this.children) c.parentNode = null; this.children = []; this._text = String(v); },
    get childNodes() { return this.children; },
    get parentElement() { return this.parentNode; },
    get nextSibling() { return siblingOf(this, 1); },
    remove() { detach(this); },
    scrollIntoView() { globalThis.__scrolledTo = this; },
    // A fixed layout: rows of a #shop-list are 100 tall, stacked, in a 300 tall list.
    get offsetTop() { return this.parentNode && this.parentNode.id === 'shop-list' ? this.parentNode.children.indexOf(this) * 100 : 0; },
    get offsetHeight() { return this.parentNode && this.parentNode.id === 'shop-list' ? 100 : undefined; },
    get clientHeight() { return this.id === 'shop-list' ? 300 : undefined; },
    querySelectorAll(sel: string) { return this._select(sel, false) as StubElement[]; },
    querySelector(sel: string) { return this._select(sel, true) as StubElement | null; },
    _select(sel: string, first: boolean) {
      const want = sel.startsWith('.') ? sel.slice(1) : null;
      const wid = sel.startsWith('#') ? sel.slice(1) : null;
      const tag = !want && !wid ? sel : null;
      const found: StubElement[] = [];
      const walk = (node: StubNode): boolean => {
        for (const c of node.children || []) {
          if (!c || typeof c !== 'object' || c.nodeType !== 1) continue;
          if ((want && String(c.className || '').split(' ').includes(want)) || (wid && c.id === wid) || (tag && c.localName === tag)) {
            found.push(c);
            if (first) return true;
          }
          if (walk(c)) return true;
        }
        return false;
      };
      walk(this);
      return first ? found[0] ?? null : found;
    },
    append(...nodes: StubNode[]) { for (const n of nodes) this.appendChild(n); return this; },
    get firstChild() { return this.children[0] || null; },
    appendChild<T extends StubNode>(c: T): T { return this.insertBefore(c, null); },
    insertBefore<T extends StubNode>(c: T, ref: StubNode | null): T {
      detach(c);
      c.parentNode = this;
      const at = ref ? this.children.indexOf(ref) : -1;
      if (at < 0) this.children.push(c); else this.children.splice(at, 0, c);
      return c;
    },
    removeChild<T extends StubNode>(c: T): T { this.children.splice(this.children.indexOf(c), 1); c.parentNode = null; return c; },
    addEventListener(t: string, f: Listener) { const l = (this._l = this._l || {}); l[t] = (l[t] || []).concat(f); },
    dispatchEvent(ev: StubEvent) { for (const f of ((this._l || {})[ev.type ?? ''] || [])) f.call(this, ev); return true; },
    removeEventListener(t: string, f: Listener) { const l = (this._l = this._l || {}); l[t] = (l[t] || []).filter(g => g !== f); },
    setAttribute(k: string, v: unknown) { if (k === 'class') this.className = String(v); else this._attrs[k] = String(v); },
    getAttribute(k: string) { return k === 'class' ? this.className : this._attrs[k]; },
    removeAttribute(k: string) { if (k === 'class') this.className = ''; else delete this._attrs[k]; },
    getBoundingClientRect: () => ({ width: 720, height: 460 }),
    getContext: () => makeCallable(),
    click() { click(this); },
    blur() { globalThis.__blurred = this; if (document.activeElement === this) document.activeElement = null; },
    focus() { globalThis.__focused = this; document.activeElement = this; },
  };
  return hideLinks(el, ['parentNode', 'parentElement', 'nextSibling', 'firstChild', 'childNodes']);
}
// An element made through createElementNS is Preact's: giving it an id makes
// document.getElementById find it, as the page would.
function makeRenderedEl(tag: string): StubElement {
  const el = makeEl('');
  el.localName = tag;
  el.hidden = false;
  Object.defineProperty(el, 'id', {
    get(this: StubElement) { return this._id; },
    set(this: StubElement, v: unknown) { this._id = String(v); els[this._id] = this; },
  });
  return el;
}
/** Fires an element's click listeners, as a browser would (`this` is the element). */
export function click(el: StubElement): void {
  for (const f of ((el._l || {}).click || [])) f.call(el, { currentTarget: el, preventDefault: () => {} });
}
/** Fires an element's listeners for any event type (scroll, change, ...). */
export function fire(el: StubElement, type: string, extra: Record<string, unknown> = {}): void {
  for (const f of ((el._l || {})[type] || [])) f.call(el, { currentTarget: el, target: el, preventDefault: () => {}, ...extra });
}
/** Sends a form's submit listeners, as a browser would. */
export function submit(el: StubElement): void {
  for (const f of ((el._l || {}).submit || [])) f.call(el, { currentTarget: el, preventDefault: () => {} });
}
type DocListener = (ev: DocEvent) => void;
const docListeners: Record<string, DocListener[]> = {};

/** The `document` the stub offers, and the two fullscreen members a test may set and delete. */
export interface StubDocument {
  readyState: string;
  activeElement: StubElement | null;
  body: StubElement;
  fullscreenElement?: StubElement;
  exitFullscreen?: () => Promise<void>;
  getElementById(id: string): StubElement;
  createElement(tag: string): StubElement;
  createElementNS(ns: string, tag: string): StubElement;
  createTextNode(t: unknown): StubText;
  querySelectorAll(sel?: string): StubElement[];
  addEventListener(t: string, f: DocListener): void;
  removeEventListener(t: string, f: DocListener): void;
}
export const document: StubDocument = {
  readyState: 'complete',
  activeElement: null,
  body: makeEl('body'),
  getElementById: id => (els[id] = els[id] || makeEl(id)),
  createElement: tag => makeEl(tag),
  createElementNS: (_ns, tag) => makeRenderedEl(tag),
  createTextNode: t => makeText(t),
  querySelectorAll: () => [],
  addEventListener(t, f) { (docListeners[t] = docListeners[t] || []).push(f); },
  removeEventListener(t, f) { docListeners[t] = (docListeners[t] || []).filter(g => g !== f); },
};
/** What a document listener is handed: the event, and whether a listener prevented or stopped it. */
export interface DocEvent {
  type: string;
  prevented: boolean;
  stopped: boolean;
  preventDefault(): void;
  stopPropagation(): void;
  [extra: string]: unknown;
}
/** Calls the document's listeners for an event type, as a key press would,
 *  and returns the event so a test can read what the listeners did to it. */
export function fireDocument(type: string, extra: Record<string, unknown> = {}): DocEvent {
  const ev: DocEvent = { type, prevented: false, stopped: false, ...extra, preventDefault: () => { ev.prevented = true; }, stopPropagation: () => { ev.stopped = true; } };
  for (const f of docListeners[type] || []) f(ev);
  return ev;
}

// What a test needs to hand the stub to code typed for the real DOM. The stub
// is not a DOM (see the top of this file), so each crossing is one cast, made
// here and nowhere else.

/** Makes the stub the page's `document`. */
export function installDocument(): void {
  globalThis.document = document as unknown as Document;
}

/** Preact's `render` takes its container as a real DOM node. */
export type RenderTarget = Parameters<typeof render>[1];
export function renderTarget(el: StubElement): RenderTarget {
  return el as unknown as RenderTarget;
}

/** A stub element as the DOM `Element` that code under test is handed. */
export function asElement(el: StubElement): Element {
  return el as unknown as Element;
}

/** A node the test knows is an element (not text); it fails, naming the node, when it is not. */
export function elementOf(node: StubNode | null | undefined): StubElement {
  assert.ok(node && node.nodeType === 1, 'expected an element node');
  return node;
}

/** The i-th child, which the test knows is an element. */
export function childEl(el: StubElement, i = 0): StubElement {
  return elementOf(el.children[i]);
}

/** Every element under `el`, depth first. */
export function walk(el: StubElement, out: StubElement[] = []): StubElement[] {
  for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); }
  return out;
}

/** The element under `el` with that id, or undefined. */
export function maybeById(el: StubElement, id: string): StubElement | undefined {
  return walk(el).find(n => n.id === id);
}

/** The element under `el` with that id, which the test knows is there; it fails, naming the id, when it is not. */
export function byId(el: StubElement, id: string): StubElement {
  const found = maybeById(el, id);
  assert.ok(found, `no #${id}`);
  return found;
}
