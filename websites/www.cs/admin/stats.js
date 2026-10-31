// The Visitors dashboard's charts, drawn as SVG from the page's JSON block (#stats-data). Colors come from
// stats.css classes (s1..s6, q0..q7), so the theme lives in one place. Every value a tooltip shows is also in
// the table beneath its chart; tooltips follow the pointer, a tap, or keyboard focus (arrow keys move).
// Long ranges come by week or by month (R.bucket); each date is then the first day of its week or month.
(function () {
  'use strict';
  var node = document.getElementById('stats-data');
  if (!node) {
    return;
  }
  var DATA = JSON.parse(node.textContent);
  var R = DATA.report;
  var LABELS = DATA.labels;
  var PAGES = Object.keys(LABELS);
  var NS = 'http://www.w3.org/2000/svg';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var BUCKET = R.bucket || 'day';
  var UNIT = { day: 'day', week: 'week', month: 'month' }[BUCKET];
  var YEARS = R.from.slice(0, 4) !== R.to.slice(0, 4);

  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) {
      e.setAttribute(k, String(attrs[k]));
    }
    if (parent) {
      parent.appendChild(e);
    }
    return e;
  }
  function html(tag, cls, text, parent) {
    var e = document.createElement(tag);
    if (cls) {
      e.className = cls;
    }
    if (text !== undefined && text !== null) {
      e.textContent = text;
    }
    if (parent) {
      parent.appendChild(e);
    }
    return e;
  }
  function num(n) {
    if (n === null || n === undefined) {
      return '–';
    }
    var a = Math.abs(n);
    if (a >= 1e6) {
      return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
    }
    if (a >= 1e4) {
      return (n / 1e3).toFixed(0) + 'K';
    }
    if (a >= 1e3) {
      return (n / 1e3).toFixed(1) + 'K';
    }
    return Math.round(n * 10) / 10 + '';
  }
  function full(n) {
    if (n === null || n === undefined) {
      return '–';
    }
    return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  function pct(f) {
    return f === null || f === undefined ? '–' : Math.round(f * 1000) / 10 + '%';
  }
  function day(d) {
    var p = d.split('-');
    return MONTHS[+p[1] - 1] + ' ' + +p[2];
  }
  /** An axis label for a date: its day, its week's first day, or its month; the year when the range spans two. */
  function tick(d) {
    var p = d.split('-');
    if (BUCKET === 'month') {
      return MONTHS[+p[1] - 1] + (YEARS ? ' ' + p[0] : '');
    }
    return day(d) + (YEARS && BUCKET === 'week' ? ' ’' + p[0].slice(2) : '');
  }
  /** A tooltip title for a date. */
  function when(d) {
    var p = d.split('-');
    if (BUCKET === 'month') {
      return MONTHS[+p[1] - 1] + ' ' + p[0];
    }
    return BUCKET === 'week' ? 'Week of ' + day(d) + ', ' + p[0] : day(d);
  }
  function niceMax(max) {
    if (!(max > 0)) {
      return 4;
    }
    var exp = Math.pow(10, Math.floor(Math.log10(max)));
    var steps = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < steps.length; i++) {
      if (steps[i] * exp * 4 >= max) {
        return steps[i] * exp * 4;
      }
    }
    return 40 * exp;
  }
  function maxOf(lists) {
    var m = 0;
    lists.forEach(function (l) {
      l.forEach(function (v) {
        if (v !== null && v > m) {
          m = v;
        }
      });
    });
    return m;
  }

  // One tooltip for the page.
  var tip = html('div', 'tip', null, document.body);
  tip.hidden = true;
  tip.setAttribute('aria-hidden', 'true');
  var tipOwner = null;
  function showTip(owner, title, rows, x, y) {
    tipOwner = owner;
    tip.textContent = '';
    html('div', 't', title, tip);
    rows.forEach(function (r) {
      var row = html('div', 'r', null, tip);
      if (r.cls) {
        html('span', 'lk ' + r.cls, null, row);
      }
      html('span', 'v', r.value, row);
      html('span', 'k', r.label, row);
    });
    tip.hidden = false;
    var w = tip.offsetWidth;
    var h = tip.offsetHeight;
    var left = Math.min(Math.max(8, x + 14), window.innerWidth - w - 8);
    var top = y - h - 14 < 8 ? y + 18 : y - h - 14;
    tip.style.left = left + 'px';
    tip.style.top = Math.min(top, window.innerHeight - h - 8) + 'px';
  }
  function hideTip(owner) {
    if (!owner || owner === tipOwner) {
      tip.hidden = true;
      tipOwner = null;
    }
  }
  document.addEventListener('pointerdown', function (e) {
    if (tipOwner && !tipOwner.contains(e.target)) {
      hideTip();
    }
  });
  window.addEventListener('scroll', function () {
    hideTip();
  }, { passive: true });

  /** Pointer, tap and focus all lead to show(i, x, y) on target; keys step i through [0, n). */
  function hover(target, n, show, onLeave) {
    var at = -1;
    function point(e) {
      var i = show(e.clientX, e.clientY, null);
      at = i;
    }
    target.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse') {
        point(e);
      }
    });
    target.addEventListener('pointerdown', point);
    target.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') {
        hideTip(target);
        onLeave();
      }
    });
    target.addEventListener('focus', function () {
      at = at < 0 ? n - 1 : at;
      show(null, null, at);
    });
    target.addEventListener('blur', function () {
      hideTip(target);
      onLeave();
    });
    target.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        at = Math.max(0, at - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        at = Math.min(n - 1, at + 1);
      } else if (e.key === 'Escape') {
        hideTip(target);
        onLeave();
        return;
      } else {
        return;
      }
      e.preventDefault();
      show(null, null, at);
    });
  }

  function legend(el, series, kind, onToggle) {
    var box = html('div', 'legend', null, el);
    series.forEach(function (s) {
      var item = html(onToggle ? 'button' : 'span', onToggle ? '' : 'item', null, box);
      if (onToggle) {
        item.type = 'button';
        item.setAttribute('aria-pressed', s.hidden ? 'false' : 'true');
        item.addEventListener('click', function () {
          s.hidden = !s.hidden;
          item.setAttribute('aria-pressed', s.hidden ? 'false' : 'true');
          onToggle();
        });
      }
      html('span', 'swatch ' + (kind === 'line' ? 'ln ' : '') + s.cls, null, item);
      html('span', '', s.label, item);
    });
  }

  /** A rectangle with 4px rounded corners on its data end only: 'up' (columns) or 'right' (bars). */
  function barPath(x, y, w, h, end) {
    var r = Math.min(4, end === 'up' ? w / 2 : h / 2, end === 'up' ? h : w);
    if (w <= 0 || h <= 0) {
      return '';
    }
    if (end === 'up') {
      return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y
        + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
    }
    return 'M' + x + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r)
      + 'V' + (y + h - r) + 'Q' + (x + w) + ',' + (y + h) + ' ' + (x + w - r) + ',' + (y + h) + 'H' + x + 'Z';
  }

  function yAxis(g, W, m, H, top, fmt) {
    for (var i = 0; i <= 4; i++) {
      var v = top * i / 4;
      var y = m.t + (H - m.t - m.b) * (1 - i / 4);
      svg('line', { class: i === 0 ? 'baseline' : 'gridline', x1: m.l, x2: W - m.r, y1: Math.round(y) + 0.5, y2: Math.round(y) + 0.5 }, g);
      svg('text', { x: m.l - 6, y: y + 4, 'text-anchor': 'end' }, g).textContent = fmt(v);
    }
  }
  function xLabels(g, dates, xOf, y, width) {
    var every = Math.max(1, Math.ceil(dates.length / Math.max(2, Math.floor(width / 90))));
    dates.forEach(function (d, i) {
      if (i % every === 0 || i === dates.length - 1) {
        if (i !== dates.length - 1 && dates.length - 1 - i < every * 0.6) {
          return;
        }
        svg('text', { x: xOf(i), y: y, 'text-anchor': i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle' }, g).textContent = tick(d);
      }
    });
  }

  /** Lines over days, one per series, with a crosshair tooltip; opts.toggle lets the legend hide a line. */
  function lineChart(el, opts) {
    var series = opts.series;
    var fmt = opts.fmt || num;
    function draw() {
      el.textContent = '';
      if (series.length > 1) {
        legend(el, series, 'line', opts.toggle ? draw : null);
      }
      var W = Math.max(280, el.clientWidth);
      var H = W < 480 ? 190 : 230;
      var shown = series.filter(function (s) { return !s.hidden; });
      var labels = shown.length > 1 && shown.length <= 4 && W >= 560;
      var m = { l: 40, r: labels ? 96 : 12, t: 10, b: 24 };
      var n = opts.dates.length;
      var top = opts.cap ? Math.min(opts.cap, niceMax(maxOf(shown.map(function (s) { return s.values; })))) : niceMax(maxOf(shown.map(function (s) { return s.values; })));
      var root = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.title + ' chart; the numbers are in the table below' }, el);
      var g = svg('g', {}, root);
      yAxis(g, W, m, H, top, fmt);
      function xOf(i) {
        return n === 1 ? (m.l + W - m.r) / 2 : m.l + (W - m.l - m.r) * i / (n - 1);
      }
      function yOf(v) {
        return m.t + (H - m.t - m.b) * (1 - v / top);
      }
      xLabels(g, opts.dates, xOf, H - 6, W - m.l - m.r);
      var ends = [];
      shown.forEach(function (s) {
        var d = '';
        var started = false;
        var last = -1;
        s.values.forEach(function (v, i) {
          if (v === null) {
            started = false;
            return;
          }
          d += (started ? 'L' : 'M') + xOf(i).toFixed(1) + ',' + yOf(v).toFixed(1);
          started = true;
          last = i;
        });
        if (shown.length === 1 && d) {
          var first = s.values.findIndex(function (v) { return v !== null; });
          svg('path', { class: 'wash ' + s.cls, d: d + 'L' + xOf(last).toFixed(1) + ',' + yOf(0) + 'L' + xOf(first).toFixed(1) + ',' + yOf(0) + 'Z' }, g);
        }
        svg('path', { class: 'line ' + s.cls, d: d }, g);
        if (last >= 0) {
          svg('circle', { class: 'dot ' + s.cls, cx: xOf(last), cy: yOf(s.values[last]), r: 4 }, g);
          ends.push({ s: s, y: yOf(s.values[last]), x: xOf(last) });
        }
      });
      if (labels) {
        ends.sort(function (a, b) { return a.y - b.y; });
        // Direct labels only where every line ends on the last day and the labels stand clear of each other.
        var apart = ends.length === shown.length && ends.every(function (e, i) { return e.x === xOf(n - 1) && (i === 0 || e.y - ends[i - 1].y >= 13); });
        if (apart) {
          ends.forEach(function (e) {
            svg('text', { class: 'lab', x: e.x + 8, y: e.y + 4 }, g).textContent = e.s.label;
          });
        }
      }
      var cross = svg('line', { class: 'cross', y1: m.t, y2: H - m.b, x1: 0, x2: 0, visibility: 'hidden' }, g);
      var marks = svg('g', {}, g);
      var hit = svg('rect', { class: 'hit', x: m.l, y: m.t, width: Math.max(1, W - m.l - m.r), height: H - m.t - m.b, tabindex: 0, 'aria-label': opts.title + ': use the arrow keys to read each ' + UNIT }, root);
      hover(hit, n, function (cx, cy, at) {
        var box = root.getBoundingClientRect();
        var i = at !== null ? at : Math.round((cx - box.left - m.l) / Math.max(1, (W - m.l - m.r)) * (n - 1));
        i = Math.max(0, Math.min(n - 1, n === 1 ? 0 : i));
        cross.setAttribute('x1', xOf(i));
        cross.setAttribute('x2', xOf(i));
        cross.setAttribute('visibility', 'visible');
        marks.textContent = '';
        shown.forEach(function (s) {
          if (s.values[i] !== null) {
            svg('circle', { class: 'dot ' + s.cls, cx: xOf(i), cy: yOf(s.values[i]), r: 4 }, marks);
          }
        });
        var rows = shown.map(function (s) { return { cls: s.cls, value: s.values[i] === null ? 'not yet' : fmt(s.values[i], true), label: s.label }; });
        showTip(hit, (opts.titleOf || when)(opts.dates[i]), rows, cx !== null ? cx : box.left + xOf(i), cy !== null ? cy : box.top + m.t);
        return i;
      }, function () {
        cross.setAttribute('visibility', 'hidden');
        marks.textContent = '';
      });
    }
    watch(el, draw);
  }

  /** Stacked daily columns: stacks bottom to top, 2px surface gaps, the top segment rounded. */
  function stackChart(el, opts) {
    function draw() {
      el.textContent = '';
      legend(el, opts.stacks, 'box', null);
      var W = Math.max(280, el.clientWidth);
      var H = W < 480 ? 190 : 230;
      var m = { l: 40, r: 12, t: 10, b: 24 };
      var n = opts.dates.length;
      var totals = opts.dates.map(function (_, i) {
        return opts.stacks.reduce(function (t, s) { return t + s.values[i]; }, 0);
      });
      var top = niceMax(Math.max.apply(null, totals.concat([0])));
      var root = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.title + ' chart; the numbers are in the table below' }, el);
      var g = svg('g', {}, root);
      yAxis(g, W, m, H, top, num);
      var step = (W - m.l - m.r) / n;
      var bw = Math.max(2, Math.min(24, step - 2));
      function xOf(i) {
        return m.l + step * i + step / 2;
      }
      function hOf(v) {
        return (H - m.t - m.b) * v / top;
      }
      xLabels(g, opts.dates, xOf, H - 6, W - m.l - m.r);
      var cols = [];
      opts.dates.forEach(function (_, i) {
        var col = svg('g', {}, g);
        var y = H - m.b;
        var drawn = opts.stacks.filter(function (s) { return s.values[i] > 0; });
        drawn.forEach(function (s, k) {
          var h = hOf(s.values[i]);
          var gap = k < drawn.length - 1 ? 2 : 0;
          var isTop = k === drawn.length - 1;
          var hh = Math.max(1, h - gap);
          svg('path', { class: 'bar ' + s.cls, d: isTop ? barPath(xOf(i) - bw / 2, y - h, bw, hh, 'up') : 'M' + (xOf(i) - bw / 2) + ',' + (y - hh) + 'h' + bw + 'v' + hh + 'h' + -bw + 'Z' }, col);
          y -= h;
        });
        cols.push(col);
      });
      var hit = svg('rect', { class: 'hit', x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, tabindex: 0, 'aria-label': opts.title + ': use the arrow keys to read each ' + UNIT }, root);
      var lifted = null;
      hover(hit, n, function (cx, cy, at) {
        var box = root.getBoundingClientRect();
        var i = at !== null ? at : Math.floor((cx - box.left - m.l) / step);
        i = Math.max(0, Math.min(n - 1, i));
        if (lifted) {
          lifted.classList.remove('lift');
        }
        lifted = cols[i];
        lifted.classList.add('lift');
        var rows = opts.stacks.slice().reverse().map(function (s) { return { cls: s.cls, value: full(s.values[i]), label: s.label }; });
        rows.push({ value: full(totals[i]), label: 'in all' });
        showTip(hit, when(opts.dates[i]), rows, cx !== null ? cx : box.left + xOf(i), cy !== null ? cy : box.top + m.t);
        return i;
      }, function () {
        if (lifted) {
          lifted.classList.remove('lift');
        }
        lifted = null;
      });
    }
    watch(el, draw);
  }

  /** Horizontal bars: one group per row, one bar per series, the value at each tip. */
  function barChart(el, opts) {
    var series = opts.series;
    function draw() {
      el.textContent = '';
      if (!opts.rows.length) {
        return;
      }
      if (series.length > 1) {
        legend(el, series, 'box', null);
      }
      var W = Math.max(260, el.clientWidth);
      var labW = Math.min(130, Math.max(70, W * 0.28));
      var thick = series.length === 1 ? 18 : 11;
      var rowH = series.length * (thick + 2) + 10;
      var H = opts.rows.length * rowH + 4;
      var m = { l: labW + 8, r: 64 };
      var top = maxOf(opts.rows.map(function (r) { return r.values; })) || 1;
      var root = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.title + ' chart; the numbers are in the table below' }, el);
      var g = svg('g', {}, root);
      svg('line', { class: 'baseline', x1: m.l + 0.5, x2: m.l + 0.5, y1: 0, y2: H }, g);
      var groups = [];
      opts.rows.forEach(function (row, i) {
        var y0 = i * rowH + 5;
        var grp = svg('g', {}, g);
        svg('text', { class: 'lab', x: labW, y: y0 + (rowH - 10) / 2 + 4, 'text-anchor': 'end' }, grp).textContent = row.label;
        series.forEach(function (s, k) {
          var w = (W - m.l - m.r) * row.values[k] / top;
          var y = y0 + k * (thick + 2);
          if (row.values[k] > 0) {
            svg('path', { class: 'bar ' + s.cls, d: barPath(m.l + 1, y, Math.max(2, w), thick, 'right') }, grp);
          }
          svg('text', { class: 'val', x: m.l + 1 + Math.max(2, w) + 6, y: y + thick / 2 + 4 }, grp).textContent = opts.valueText ? opts.valueText(row, k) : num(row.values[k]);
        });
        groups.push(grp);
      });
      var hit = svg('rect', { class: 'hit', x: 0, y: 0, width: W, height: H, tabindex: 0, 'aria-label': opts.title + ': use the arrow keys to read each row' }, root);
      var lifted = null;
      hover(hit, opts.rows.length, function (cx, cy, at) {
        var box = root.getBoundingClientRect();
        var i = at !== null ? at : Math.floor((cy - box.top) / rowH);
        i = Math.max(0, Math.min(opts.rows.length - 1, i));
        if (lifted) {
          lifted.classList.remove('lift');
        }
        lifted = groups[i];
        lifted.classList.add('lift');
        var row = opts.rows[i];
        showTip(hit, row.label, opts.tipRows ? opts.tipRows(row) : series.map(function (s, k) { return { cls: s.cls, value: full(row.values[k]), label: s.label }; }),
          cx !== null ? cx : box.left + m.l, cy !== null ? cy : box.top + i * rowH);
        return i;
      }, function () {
        if (lifted) {
          lifted.classList.remove('lift');
        }
        lifted = null;
      });
    }
    watch(el, draw);
  }

  /** Weekday by hour, one cell each, in the sequential blue ramp. */
  function heatChart(el, heat) {
    var max = maxOf(heat);
    function q(v) {
      return v <= 0 ? 0 : Math.max(1, Math.ceil(v / max * 7));
    }
    function draw() {
      el.textContent = '';
      var W = Math.max(280, el.clientWidth);
      var lab = 34;
      var gap = 2;
      var cw = (W - lab) / 24;
      var ch = Math.max(14, Math.min(26, cw));
      var H = ch * 7 + 18;
      var root = svg('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Visits by weekday and hour; the numbers are in the table below' }, el);
      var g = svg('g', {}, root);
      var cells = [];
      for (var w = 0; w < 7; w++) {
        svg('text', { class: 'lab', x: 0, y: w * ch + ch / 2 + 4 }, g).textContent = WEEK[w];
        for (var h = 0; h < 24; h++) {
          cells.push(svg('rect', { class: 'cell q' + q(heat[w][h]), x: lab + h * cw, y: w * ch, width: Math.max(1, cw - gap), height: ch - gap, rx: 2 }, g));
        }
      }
      [0, 6, 12, 18].forEach(function (h) {
        svg('text', { x: lab + h * cw, y: H - 4 }, g).textContent = ['12 am', '6 am', '12 pm', '6 pm'][h / 6];
      });
      var hit = svg('rect', { class: 'hit', x: lab, y: 0, width: W - lab, height: ch * 7, tabindex: 0, 'aria-label': 'Visits by weekday and hour: use the arrow keys to read each hour' }, root);
      var lifted = null;
      hover(hit, 168, function (cx, cy, at) {
        var box = root.getBoundingClientRect();
        var i = at !== null ? at : Math.max(0, Math.min(6, Math.floor((cy - box.top) / ch))) * 24 + Math.max(0, Math.min(23, Math.floor((cx - box.left - lab) / cw)));
        var wd = Math.floor(i / 24);
        var hr = i % 24;
        if (lifted) {
          lifted.classList.remove('lift');
        }
        lifted = cells[i];
        lifted.classList.add('lift');
        var v = heat[wd][hr];
        showTip(hit, WEEK[wd] + ' ' + hour(hr) + '–' + hour((hr + 1) % 24), [{ value: full(v), label: v === 1 ? 'page view' : 'page views' }],
          cx !== null ? cx : box.left + lab + hr * cw, cy !== null ? cy : box.top + wd * ch);
        return i;
      }, function () {
        if (lifted) {
          lifted.classList.remove('lift');
        }
        lifted = null;
      });
      var ramp = html('div', 'ramp', null, el);
      html('span', '', 'Fewer', ramp);
      for (var k = 0; k <= 7; k++) {
        html('i', 'q' + k, null, ramp);
      }
      html('span', '', 'More (most: ' + full(max) + ')', ramp);
    }
    watch(el, draw);
  }
  function hour(h) {
    return (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? ' am' : ' pm');
  }

  function spark(el, values, cls) {
    el.textContent = '';
    var W = 120;
    var H = 32;
    var top = Math.max.apply(null, values.concat([0])) || 1;
    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', focusable: 'false' }, el);
    var n = values.length;
    var d = values.map(function (v, i) {
      return (i ? 'L' : 'M') + (n === 1 ? W / 2 : W * i / (n - 1)).toFixed(1) + ',' + (H - 2 - (H - 4) * v / top).toFixed(1);
    }).join('');
    svg('path', { class: 'wash ' + cls, d: d + 'L' + W + ',' + H + 'L0,' + H + 'Z' }, root);
    svg('path', { class: 'line ' + cls, d: d, 'vector-effect': 'non-scaling-stroke' }, root);
  }

  /** Draws now and again whenever the element's width changes. */
  function watch(el, draw) {
    var width = -1;
    function maybe() {
      var w = el.clientWidth;
      if (w !== width) {
        width = w;
        hideTip();
        draw();
      }
    }
    maybe();
    if (typeof ResizeObserver === 'function') {
      var queued = false;
      new ResizeObserver(function () {
        if (!queued) {
          queued = true;
          requestAnimationFrame(function () {
            queued = false;
            maybe();
          });
        }
      }).observe(el);
    }
  }

  var S = R.series;
  var plots = {
    byPage: function (el) {
      lineChart(el, {
        title: 'Daily visitors by page', dates: R.dates, toggle: true, fmt: num,
        series: PAGES.map(function (p, i) { return { label: LABELS[p], cls: 's' + (i % 6 + 1), values: R.byPage[p] }; }),
      });
    },
    daily: function (el) {
      lineChart(el, { title: 'Visitors and visits', dates: R.dates, toggle: true, series: [
        { label: 'Visitors', cls: 's1', values: S.dau },
        { label: 'Visits', cls: 's2', values: S.visits },
      ] });
    },
    active: function (el) {
      lineChart(el, { title: 'Active visitors', dates: R.dates, toggle: true, series: [
        { label: 'DAU', cls: 's1', values: S.dau },
        { label: 'WAU', cls: 's2', values: S.wau },
        { label: 'MAU', cls: 's3', values: S.mau },
      ] });
    },
    newret: function (el) {
      stackChart(el, { title: 'New and returning visitors', dates: R.dates, stacks: [
        { label: 'New', cls: 's1', values: S['new'] },
        { label: 'Returning', cls: 's2', values: S.returning },
      ] });
    },
    retention: function (el) {
      var c = R.retention.cohorts;
      // Each rate over the new visitors whose day 1 (or day 7) has passed.
      var rate = function (k) {
        var of = k === 'd1' ? 'size1' : 'size7';
        return c.map(function (x) { return x[k] === null || !x[of] ? null : x[k] / x[of]; });
      };
      lineChart(el, {
        title: 'Coming back', dates: c.map(function (x) { return x.day; }), cap: 1,
        fmt: function (v) { return pct(v); },
        titleOf: function (d) {
          var x = c.filter(function (y) { return y.day === d; })[0];
          var on = BUCKET === 'day' ? 'New on ' + day(d) : BUCKET === 'week' ? 'New in the week of ' + day(d) : 'New in ' + when(d);
          return on + ' (' + full(x.size) + ')';
        },
        series: [{ label: 'Back next day', cls: 's1', values: rate('d1') }, { label: 'Back within 7 days', cls: 's2', values: rate('d7') }],
      });
    },
    funnel: function (el) {
      var first = R.funnel.length ? R.funnel[0].start : 0;
      barChart(el, {
        title: 'Level funnel', series: [{ label: 'Started', cls: 's1' }, { label: 'Won', cls: 's2' }],
        rows: R.funnel.map(function (f) { return { label: f.level, values: [f.start, f.win] }; }),
        tipRows: function (row) {
          return [
            { cls: 's1', value: full(row.values[0]), label: 'started' + (first ? ' (' + pct(row.values[0] / first) + ' of level ' + R.funnel[0].level + ')' : '') },
            { cls: 's2', value: full(row.values[1]), label: 'won' + (row.values[0] ? ' (' + pct(row.values[1] / row.values[0]) + ' of starters)' : '') },
          ];
        },
      });
    },
    events: function (el) {
      var names = Object.keys(R.events).sort(function (a, b) { return R.events[b] - R.events[a]; });
      barChart(el, { title: 'Game events', series: [{ label: 'Times', cls: 's1' }], rows: names.map(function (k) { return { label: k, values: [R.events[k]] }; }) });
    },
    referrers: function (el) {
      shares(el, 'Where visits come from', R.referrers, { facebook: 'Facebook', discord: 'Discord', search: 'Search', site: 'This site', direct: 'Direct', other: 'Other' });
    },
    devices: function (el) {
      shares(el, 'Devices', R.devices, { phone: 'Phone', tablet: 'Tablet', desktop: 'Desktop' });
    },
    heat: function (el) {
      heatChart(el, R.heat);
    },
  };
  function shares(el, title, counts, names) {
    var total = Object.keys(counts).reduce(function (t, k) { return t + counts[k]; }, 0);
    if (!total) {
      return;
    }
    barChart(el, {
      title: title, series: [{ label: 'Visits', cls: 's1' }],
      rows: Object.keys(counts).map(function (k) { return { label: names[k] || k, values: [counts[k]] }; }),
      valueText: function (row) { return num(row.values[0]) + ' · ' + pct(row.values[0] / total); },
      tipRows: function (row) { return [{ cls: 's1', value: full(row.values[0]), label: 'visits, ' + pct(row.values[0] / total) }]; },
    });
  }

  // The years choice shows its range as soon as one is picked; its button is for browsers without this script.
  Array.prototype.forEach.call(document.querySelectorAll('form.years'), function (form) {
    var pick = form.querySelector('select');
    var go = form.querySelector('button');
    if (pick && go) {
      go.hidden = true;
      pick.addEventListener('change', function () {
        if (pick.value) {
          form.submit();
        }
      });
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-chart]'), function (el) {
    var make = plots[el.getAttribute('data-chart')];
    if (make) {
      make(el);
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-spark]'), function (el) {
    var k = R.kpis[el.getAttribute('data-spark')];
    if (k) {
      spark(el, k.spark, 's1');
    }
  });
})();
