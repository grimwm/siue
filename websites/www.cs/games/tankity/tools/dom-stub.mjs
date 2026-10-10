// A small DOM for the Node tests (smoke-test.js, ui-test.js): a real tree, with
// parents, siblings, insert and remove, because the Preact overlays render into
// it, plus the handful of properties game.js reads. Not a browser: no layout, no
// events beyond click(), no selectors beyond .class and #id. It lives in tools/
// so it never ships (it is test support, not part of the game).
// Copyright (C) 2026 William Grim
// SPDX-License-Identifier: GPL-3.0-or-later

export function makeCallable() {
  const fn = function () { return proxy; };
  const proxy = new Proxy(fn, {
    get: () => proxy,
    set: () => true,
    apply: () => proxy,
  });
  return proxy;
}

/** Elements by id: what document.getElementById answers, made on first ask. */
export const els = {};
function detach(node) {
  if (node.parentNode) node.parentNode.removeChild(node);
}
function siblingOf(node, step) {
  const kin = node.parentNode ? node.parentNode.children : [];
  return kin[kin.indexOf(node) + step] || null;
}
export function makeText(data) {
  return {
    nodeType: 3, data: String(data), children: [], parentNode: null,
    get textContent() { return this.data; },
    set textContent(v) { this.data = String(v); },
    get nextSibling() { return siblingOf(this, 1); },
    remove() { detach(this); },
  };
}
// `children` holds every child node, text included (the stub's long-standing
// reading); a plain `textContent = ...` is one text child, as in a browser.
export function makeEl(id) {
  const el = {
    id, nodeType: 1, parentNode: null, hidden: true, value: '', innerHTML: '',
    disabled: false, style: {}, className: '', scrollTop: 0, scrollHeight: 0,
    children: [], _text: '', _attrs: {},
    get textContent() { return this.children.length ? this.children.map(c => c.textContent).join('') : this._text; },
    set textContent(v) { for (const c of this.children) c.parentNode = null; this.children = []; this._text = String(v); },
    get childNodes() { return this.children; },
    get nextSibling() { return siblingOf(this, 1); },
    remove() { detach(this); },
    scrollIntoView() { globalThis.__scrolledTo = this; },
    querySelector(sel) {
      const want = sel.startsWith('.') ? sel.slice(1) : null;
      const wid = sel.startsWith('#') ? sel.slice(1) : null;
      const walk = (node) => {
        for (const c of node.children || []) {
          if (!c || typeof c !== 'object') continue;
          if ((want && String(c.className || '').split(' ').includes(want)) || (wid && c.id === wid)) return c;
          const d = walk(c);
          if (d) return d;
        }
        return null;
      };
      return walk(this);
    },
    append(...nodes) { for (const n of nodes) this.appendChild(n); return this; },
    get firstChild() { return this.children[0] || null; },
    appendChild(c) { return this.insertBefore(c, null); },
    insertBefore(c, ref) {
      detach(c);
      c.parentNode = this;
      const at = ref ? this.children.indexOf(ref) : -1;
      if (at < 0) this.children.push(c); else this.children.splice(at, 0, c);
      return c;
    },
    removeChild(c) { this.children.splice(this.children.indexOf(c), 1); c.parentNode = null; return c; },
    addEventListener(t, f) { (this._l = this._l || {})[t] = ((this._l)[t] || []).concat(f); },
    removeEventListener(t, f) { (this._l = this._l || {})[t] = ((this._l)[t] || []).filter(g => g !== f); },
    setAttribute(k, v) { if (k === 'class') this.className = String(v); else this._attrs[k] = String(v); },
    getAttribute(k) { return k === 'class' ? this.className : this._attrs[k]; },
    removeAttribute(k) { if (k === 'class') this.className = ''; else delete this._attrs[k]; },
    getBoundingClientRect: () => ({ width: 720, height: 460 }),
    getContext: () => makeCallable(),
    blur: () => {},
  };
  el._id = id;
  return el;
}
// An element made through createElementNS is Preact's: giving it an id makes
// document.getElementById find it, as the page would.
function makeRenderedEl(tag) {
  const el = makeEl('');
  el.localName = tag;
  el.hidden = false;
  Object.defineProperty(el, 'id', {
    get() { return this._id; },
    set(v) { this._id = String(v); els[this._id] = this; },
  });
  return el;
}
/** Fires an element's click listeners, as a browser would (`this` is the element). */
export function click(el) {
  for (const f of ((el._l || {}).click || [])) f.call(el, { currentTarget: el, preventDefault: () => {} });
}
export const document = {
  readyState: 'complete',
  getElementById: id => (els[id] = els[id] || makeEl(id)),
  createElement: tag => makeEl(tag),
  createElementNS: (ns, tag) => makeRenderedEl(tag),
  createTextNode: t => makeText(t),
  querySelectorAll: () => [],
  addEventListener: () => {},
};
