/*
 * LikeTech 服務展示模組（vanilla 版）
 * web → CardSwap、system → MagicBento、app → 3D 手機展示、
 * ai → CircularGallery、xr → GridScan、print → 逐層列印
 * 每個模組回傳 { start(), stop() }，切換分頁時只跑目前那一個。
 */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const D = (window.WeavexDemos = {});

  /* ───────────────────────── 1. CardSwap（網頁開發） ───────────────────────── */
  D.web = function (root) {
    const MOCKS = [
      { title: '敏實科技大學', tag: '大學官網 · AI 虛擬導覽員', html: '<img class="mk-shot" src="assets/img/web/web-minth.jpg" alt="敏實科技大學 網站首頁" draggable="false">' },
      { title: '勞飢法', tag: '午餐集單平台', html: '<img class="mk-shot" src="assets/img/web/web-lunch.jpg" alt="勞飢法 網站首頁" draggable="false">' },
      { title: '龍騰報名系統', tag: '競賽報名後台', html: '<img class="mk-shot" src="assets/img/web/web-lungteng.jpg" alt="龍騰報名系統 後台入圍名單" draggable="false">' },
      { title: '耘富科技', tag: '半導體設備企業官網', html: '<img class="mk-shot" src="assets/img/web/web-advanflo.jpg" alt="耘富科技 網站首頁" draggable="false">' },
      { title: '台灣碳業能源', tag: '碳管理顧問官網', html: '<img class="mk-shot" src="assets/img/web/web-carbon.jpg" alt="台灣碳業能源 網站首頁" draggable="false">' },
      { title: 'DR.AI 冰櫃醫生', tag: 'IoT 溫控品牌官網', html: '<img class="mk-shot" src="assets/img/web/web-drai.jpg" alt="DR.AI 冰櫃醫生 網站首頁" draggable="false">' },
      { title: '珠寶商情', tag: '產業媒體入口網站', html: '<img class="mk-shot" src="assets/img/web/web-jewelry.jpg" alt="珠寶商情 網站首頁" draggable="false">' },
      { title: '麻津家', tag: '食品電商網站', html: '<img class="mk-shot" src="assets/img/web/web-majinchia.jpg" alt="麻津家 網站首頁" draggable="false">' },
      { title: '翔巧廣告設計', tag: '展場與廣告設計官網', html: '<img class="mk-shot" src="assets/img/web/web-xiangqiao.jpg" alt="翔巧廣告設計 網站首頁" draggable="false">' },
      { title: '台灣燈塔', tag: '政府機關主題網站', html:
        '<div class="mk mk-light"><div class="mk-nav"><b>台灣燈塔</b><span>燈塔導覽</span><span>開放資訊</span><span>燈塔故事</span></div><div class="mk-hero"><div><small>交通部航港局</small><h4>守護海上的<br>每一道光</h4><span class="mk-btn">探索燈塔</span></div><div class="mk-tower"><span class="beam"></span><i class="top"></i><i class="body"></i></div></div><div class="mk-sea"></div></div>' },
      { title: '松興生命禮儀', tag: '服務業品牌官網', html: '<img class="mk-shot" src="assets/img/web/web-songxing.jpg" alt="松興生命禮儀 網站首頁" draggable="false">' }
    ];
    const s = { width: 560, height: 360, dx: 58, dy: 64, dz: 90, skew: 6, visible: 4, delay: 3600, autoplay: true, pauseOnHover: true, draggable: true, speed: 1, bounce: 0.35, parallax: 0.5, hoverSpread: 0.12, dim: 0.5 };
    if ((root.clientWidth || window.innerWidth) < 640) Object.assign(s, { width: 480, height: 320, dx: 20, dy: 26, dz: 60, visible: 3 });
    const PERSPECTIVE = 900, TAU = Math.PI * 2, STEP = 1 / 240, PAD = 32, AXES = ['x', 'y', 'z', 'r', 'p'], DOWN = { x: 0, y: 1 };
    const count = MOCKS.length;
    s.visible = clamp(s.visible, 1, count);

    const slope = Math.tan((s.skew * Math.PI) / 180), sp = 1 + s.hoverSpread;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < s.visible; i++) {
      const sc = PERSPECTIVE / (PERSPECTIVE + i * s.dz);
      for (const u of [-s.width / 2, s.width / 2]) for (const v of [-s.height / 2, s.height / 2]) {
        const x = (i * s.dx * sp + u) * sc, y = (-i * s.dy * sp + v + u * slope) * sc;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
    s.bounds = { width: Math.ceil(maxX - minX + PAD * 2), height: Math.ceil(maxY - minY + PAD * 2), originX: PAD - minX, originY: PAD - minY };

    root.classList.add('card-swap');
    root.tabIndex = 0;
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', '網頁作品，可用方向鍵切換');
    const rs = root.style;
    rs.setProperty('--swap-w', s.width + 'px'); rs.setProperty('--swap-h', s.height + 'px');
    rs.setProperty('--swap-ox', s.bounds.originX + 'px'); rs.setProperty('--swap-oy', s.bounds.originY + 'px');
    rs.setProperty('--swap-stage-w', s.bounds.width + 'px'); rs.setProperty('--swap-stage-h', s.bounds.height + 'px');
    const stage = el('div', 'card-swap-stage');
    root.appendChild(stage);

    const deck = MOCKS.map((m, index) => {
      const slot = el('div', 'card-swap-slot');
      slot.dataset.swapIndex = index;
      slot.innerHTML = '<div class="cs-card"><div class="cs-head"><span class="cs-dots"><i></i><i></i><i></i></span><span class="cs-title">' + m.title + '<small>' + m.tag + '</small></span></div><div class="cs-media">' + m.html + '</div><span class="cs-rim"></span></div>';
      const shade = el('span', 'card-swap-shade');
      slot.appendChild(shade);
      stage.appendChild(slot);
      return { el: slot, shade, index, pos: index, from: index, hold: 0, nudge: 0, phase: 'rest', dir: { x: 0, y: 1 }, tilt: 0, top: 0, under: false, x: 0, y: 0, z: 0, r: 0, p: 0, v: { x: 0, y: 0, z: 0, r: 0, p: 0 } };
    });
    const state = { order: deck.map(c => c.index), raf: 0, last: 0, timer: 0, queue: [], layers: 0, scale: 1, hovered: false, overCard: false, drag: null, spread: 0, spreadV: 0, px: 0, py: 0, pvx: 0, pvy: 0, tx: 0, ty: 0, dragged: false, running: false };

    const slot = pos => { const q = Math.min(pos, s.visible), f = 1 + state.spread; return { x: q * s.dx * f, y: -q * s.dy * f, z: -q * s.dz, r: 0, p: q }; };
    const clearance = dir => Math.abs(dir.x) * s.width + Math.abs(dir.y) * s.height + 12;
    const targetOf = (card, time) => {
      if (card.phase === 'exit') { const b = slot(0), reach = clearance(card.dir) * 1.3; return { x: b.x + card.dir.x * reach, y: b.y + card.dir.y * reach, z: b.z, r: card.tilt, p: 0 }; }
      if (card.phase === 'enter') { const b = slot(0); return { x: b.x, y: b.y + clearance(DOWN) * 1.3, z: b.z, r: 0, p: card.p }; }
      return slot(Math.max(0, (time < card.hold ? card.from : card.pos) + card.nudge));
    };
    const layerOf = c => (c.top ? 1000 + c.top : c.under ? 1 : 10 + (count - c.pos) * 2);
    const write = card => {
      const e = card.el;
      e.style.transform = 'translate3d(' + card.x.toFixed(2) + 'px,' + card.y.toFixed(2) + 'px,' + card.z.toFixed(2) + 'px) rotate(' + card.r.toFixed(3) + 'deg) skewY(' + s.skew + 'deg)';
      e.style.zIndex = String(layerOf(card));
      const fade = clamp(s.visible - card.p, 0, 1);
      e.style.opacity = fade < 1 ? fade.toFixed(3) : '';
      e.style.visibility = fade <= 0.001 ? 'hidden' : '';
      card.shade.style.opacity = (s.dim * 0.62 * clamp(card.p / Math.max(1, s.visible - 1), 0, 1)).toFixed(3);
      e.style.cursor = card.phase === 'drag' ? 'grabbing' : card.pos > 0 ? 'pointer' : 'grab';
      if (card.pos === 0) e.setAttribute('data-front', ''); else e.removeAttribute('data-front');
    };
    const writeStage = () => { stage.style.perspectiveOrigin = (s.bounds.originX + state.px).toFixed(2) + 'px ' + (s.bounds.originY + state.py).toFixed(2) + 'px'; };
    const integrate = (card, target, omega, zeta, dt) => {
      const k = omega * omega, d = 2 * zeta * omega, steps = Math.max(1, Math.ceil(dt / STEP)), hh = dt / steps;
      for (let i = 0; i < steps; i++) for (const a of AXES) { const vel = card.v[a] + (k * (target[a] - card[a]) - d * card.v[a]) * hh; card.v[a] = vel; card[a] += vel * hh; }
    };
    const scalar = (x, v, target, omega, zeta, dt) => {
      const k = omega * omega, d = 2 * zeta * omega, steps = Math.max(1, Math.ceil(dt / STEP)), hh = dt / steps;
      for (let i = 0; i < steps; i++) { v += (k * (target - x) - d * v) * hh; x += v * hh; }
      return [x, v];
    };
    const frame = time => {
      state.raf = 0;
      const dt = state.last ? Math.min(0.05, (time - state.last) / 1000) : 1 / 60;
      state.last = time;
      const restOmega = TAU * 1.7 * s.speed, restZeta = reduce ? 1 : 1 - 0.72 * s.bounce, exitOmega = TAU * 1.9 * s.speed;
      let busy = false;
      const spreadTarget = state.hovered && !reduce ? s.hoverSpread : 0;
      [state.spread, state.spreadV] = scalar(state.spread, state.spreadV, spreadTarget, TAU * 1.4, 0.9, dt);
      [state.px, state.pvx] = scalar(state.px, state.pvx, reduce ? 0 : state.tx, TAU * 1.1, 1, dt);
      [state.py, state.pvy] = scalar(state.py, state.pvy, reduce ? 0 : state.ty, TAU * 1.1, 1, dt);
      if (Math.abs(state.spread - spreadTarget) > 5e-4 || Math.abs(state.spreadV) > 5e-4 || Math.abs(state.px - state.tx) > 0.05 || Math.abs(state.py - state.ty) > 0.05 || Math.abs(state.pvx) + Math.abs(state.pvy) > 0.05) busy = true;
      writeStage();
      for (const card of deck) {
        if (card.phase === 'drag') { busy = true; write(card); continue; }
        const target = targetOf(card, time), moving = card.phase === 'exit' || card.phase === 'enter';
        integrate(card, target, moving ? exitOmega : restOmega, moving ? 1 : restZeta, dt);
        if (card.phase === 'exit') {
          const b = slot(0);
          if ((card.x - b.x) * card.dir.x + (card.y - b.y) * card.dir.y >= clearance(card.dir)) { card.phase = 'rest'; card.top = 0; card.hold = 0; }
        } else if (card.phase === 'enter') {
          const b = slot(0);
          if (card.y - b.y >= clearance(DOWN)) { card.phase = 'rest'; card.under = false; card.hold = 0; }
        }
        if (card.hold > time || card.phase !== 'rest') busy = true;
        for (const a of AXES) { const lim = a === 'p' ? 0.001 : 0.02; if (Math.abs(target[a] - card[a]) > lim || Math.abs(card.v[a]) > lim) busy = true; }
        write(card);
      }
      if (busy) state.raf = requestAnimationFrame(frame);
      else { state.last = 0; for (const c of deck) if (c.top && c.phase === 'rest') c.top = 0; }
    };
    const wake = () => { if (!state.raf) state.raf = requestAnimationFrame(frame); };
    const paused = () => !state.running || !s.autoplay || (s.pauseOnHover && state.overCard) || state.drag || document.visibilityState === 'hidden';
    const schedule = () => { clearTimeout(state.timer); state.timer = 0; if (paused()) return; state.timer = setTimeout(() => { state.timer = 0; shift(1); }, s.delay); };
    const settleOrder = (time, stagger) => state.order.forEach((index, position) => { const c = deck[index]; if (c.pos === position) return; c.from = c.pos; c.pos = position; c.hold = time + position * stagger; });
    const shift = (direction, o = {}) => {
      const time = performance.now(), stagger = 50 / s.speed;
      if (direction > 0) {
        const front = deck[state.order[0]];
        state.order = state.order.slice(1).concat(front.index);
        settleOrder(time, stagger);
        front.phase = 'exit'; front.dir = o.dir || DOWN; front.tilt = o.tilt || 0; front.top = ++state.layers; front.under = false; front.nudge = 0; front.hold = 0;
        if (o.velocity) { front.v.x = o.velocity.x; front.v.y = o.velocity.y; }
      } else {
        const back = deck[state.order[count - 1]];
        state.order = [back.index].concat(state.order.slice(0, count - 1));
        settleOrder(time, stagger);
        back.phase = 'enter'; back.top = 0; back.under = true; back.nudge = 0; back.hold = 0;
      }
      deck.forEach(c => { if (c.phase === 'rest') c.nudge = 0; });
      wake(); schedule();
    };
    const goTo = position => { state.queue.forEach(clearTimeout); state.queue = []; for (let i = 0; i < position; i++) state.queue.push(setTimeout(() => shift(1), i * 110 / s.speed)); };
    const fit = () => {
      const w = root.clientWidth, hgt = root.clientHeight;
      state.scale = Math.max(0.2, Math.min(1.25, w / s.bounds.width, hgt > 0 ? hgt / s.bounds.height : 1));
      stage.style.transform = 'translate(-50%,-50%) scale(' + state.scale.toFixed(4) + ')';
    };
    const local = e => { const b = root.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top, w: b.width, h: b.height }; };
    root.addEventListener('pointermove', e => {
      if (e.pointerType !== 'touch') {
        const p = local(e);
        state.tx = clamp((p.x / Math.max(1, p.w)) * 2 - 1, -1, 1) * s.parallax * 0.35 * s.bounds.width;
        state.ty = clamp((p.y / Math.max(1, p.h)) * 2 - 1, -1, 1) * s.parallax * 0.35 * s.bounds.height;
        state.hovered = true;
        const over = !!(e.target.closest && e.target.closest('[data-swap-index]'));
        if (over !== state.overCard) { state.overCard = over; schedule(); }
        wake();
      }
      const drag = state.drag;
      if (!drag || drag.id !== e.pointerId) return;
      const dx = (e.clientX - drag.startX) / state.scale, dy = (e.clientY - drag.startY) / state.scale;
      if (!drag.active) {
        if (Math.hypot(dx, dy) < 5) return;
        drag.active = true; state.dragged = true;
        const c = deck[drag.index]; c.phase = 'drag'; c.v = { x: 0, y: 0, z: 0, r: 0, p: 0 };
        root.setPointerCapture && root.setPointerCapture(e.pointerId);
      }
      const c = deck[drag.index], b = slot(0);
      c.x = b.x + dx; c.y = b.y + dy; c.z = b.z; c.r = clamp(dx * 0.035, -9, 9); c.p = 0;
      const t = performance.now();
      drag.samples.push({ x: c.x, y: c.y, t });
      while (drag.samples.length > 2 && t - drag.samples[0].t > 90) drag.samples.shift();
      const next = deck[state.order[1]];
      if (next && next.phase === 'rest') next.nudge = -0.22 * clamp(Math.hypot(dx, dy) / (Math.min(s.width, s.height) * 0.3), 0, 1);
      wake();
    });
    root.addEventListener('pointerleave', e => {
      if (e.pointerType === 'touch' || (state.drag && state.drag.active)) return;
      state.hovered = false; state.overCard = false; state.tx = 0; state.ty = 0; schedule(); wake();
    });
    root.addEventListener('pointerdown', e => {
      state.dragged = false;
      if (e.button > 0) return;
      const t = e.target.closest && e.target.closest('[data-swap-index]');
      if (!t) return;
      const index = Number(t.dataset.swapIndex);
      if (index !== state.order[0] || deck[index].phase !== 'rest') return;
      state.drag = { id: e.pointerId, index, startX: e.clientX, startY: e.clientY, active: false, samples: [] };
      schedule();
    });
    const onUp = e => {
      const drag = state.drag;
      if (!drag || drag.id !== e.pointerId) return;
      state.drag = null;
      if (!drag.active) { schedule(); return; }
      root.releasePointerCapture && root.releasePointerCapture(e.pointerId);
      const c = deck[drag.index], b = slot(0), f = drag.samples[0], l = drag.samples[drag.samples.length - 1];
      const span = f && l ? Math.max(0.016, (l.t - f.t) / 1000) : 1;
      const vel = f && l && l !== f ? { x: (l.x - f.x) / span, y: (l.y - f.y) / span } : { x: 0, y: 0 };
      const off = { x: c.x - b.x, y: c.y - b.y };
      const next = deck[state.order[1]];
      if (next) next.nudge = 0;
      c.phase = 'rest';
      if (e.type !== 'pointercancel' && (Math.hypot(off.x, off.y) > Math.min(s.width, s.height) * 0.3 || Math.hypot(vel.x, vel.y) > 700)) {
        const aim = { x: off.x + vel.x * 0.12, y: off.y + vel.y * 0.12 }, len = Math.hypot(aim.x, aim.y) || 1;
        shift(1, { dir: { x: aim.x / len, y: aim.y / len }, tilt: c.r, velocity: vel });
      } else { c.v.x = vel.x; c.v.y = vel.y; wake(); schedule(); }
    };
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('click', e => {
      if (state.dragged) { state.dragged = false; return; }
      const t = e.target.closest && e.target.closest('[data-swap-index]');
      if (!t) return;
      const pos = state.order.indexOf(Number(t.dataset.swapIndex));
      if (pos > 0) goTo(pos);
    });
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); shift(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); shift(-1); }
    });
    document.addEventListener('visibilitychange', schedule);
    new ResizeObserver(fit).observe(root);

    const now = performance.now();
    if (!reduce) deck.forEach(c => { c.from = 0; c.hold = now + c.pos * 70; });
    else deck.forEach(c => Object.assign(c, slot(c.pos)));
    fit(); writeStage(); deck.forEach(write);

    return {
      start() { state.running = true; fit(); wake(); schedule(); },
      stop() { state.running = false; clearTimeout(state.timer); state.queue.forEach(clearTimeout); }
    };
  };

  /* ───────────────────────── 2. MagicBento（系統開發） ───────────────────────── */
  const CHART = [3.1, 3.8, 3.5, 4.9, 4.4, 5.8, 5.3, 6.9, 6.5, 8.2, 9.4, 12.4];
  function curve(values, width, height) {
    const top = 6, bottom = 2, low = Math.min.apply(null, values) * 0.7, high = Math.max.apply(null, values);
    const pts = values.map((v, i) => [(i / (values.length - 1)) * width, top + (1 - (v - low) / (high - low)) * (height - top - bottom)]);
    const n = pts.length, sl = [];
    for (let i = 0; i < n - 1; i++) sl.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
    const tg = pts.map((_, i) => (i === 0 ? sl[0] : i === n - 1 ? sl[n - 2] : sl[i - 1] * sl[i] > 0 ? (sl[i - 1] + sl[i]) / 2 : 0));
    for (let i = 0; i < n - 1; i++) {
      if (sl[i] === 0) { tg[i] = 0; tg[i + 1] = 0; continue; }
      const a = tg[i] / sl[i], b = tg[i + 1] / sl[i], L = a * a + b * b;
      if (L > 9) { const k = 3 / Math.sqrt(L); tg[i] = k * a * sl[i]; tg[i + 1] = k * b * sl[i]; }
    }
    let line = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
    const samples = [];
    for (let i = 0; i < n - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], t3 = (x1 - x0) / 3;
      const c1 = [x0 + t3, y0 + tg[i] * t3], c2 = [x1 - t3, y1 - tg[i + 1] * t3];
      line += ' C' + c1[0].toFixed(2) + ',' + c1[1].toFixed(2) + ' ' + c2[0].toFixed(2) + ',' + c2[1].toFixed(2) + ' ' + x1.toFixed(2) + ',' + y1.toFixed(2);
      for (let st = 0; st < 12; st++) {
        const t = st / 12, u = 1 - t;
        samples.push([u * u * u * x0 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * x1, u * u * u * y0 + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * y1]);
      }
    }
    samples.push(pts[n - 1]);
    return { line, area: line + ' L' + width.toFixed(2) + ',' + height.toFixed(2) + ' L0,' + height.toFixed(2) + ' Z', samples };
  }
  function sampleAt(samples, x) {
    let i = 1;
    while (i < samples.length - 1 && samples[i][0] < x) i++;
    const [x0, y0] = samples[i - 1], [x1, y1] = samples[i], t = x1 === x0 ? 0 : clamp((x - x0) / (x1 - x0), 0, 1);
    return y0 + (y1 - y0) * t;
  }
  const CHECK = '<svg viewBox="0 0 12 12" width="10" height="10"><path d="M2.5 6.2l2.3 2.3 4.7-4.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ARROW = '<svg width="16" height="18" viewBox="0 0 16 18"><path d="M2.2 1.6 13.4 9.9c.5.4.3 1.2-.4 1.3l-4.6.6-2.2 4.2c-.3.6-1.2.5-1.4-.1L1.2 2.4c-.2-.6.5-1.1 1-.8Z" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  const BENTO_VISUAL = {
    analytics: () => '<div class="mb-chart"><div class="mb-fig"><b class="mb-val">12.4M</b><span class="mb-note">+18%</span></div><div class="mb-plot"><svg aria-hidden="true"></svg><span class="mb-scrub"><span class="mb-scrub-dot"></span></span></div></div>',
    dashboard: () => '<div class="mb-bars"><div class="mb-fig"><b>318 件</b><span class="mb-note">本週工單</span></div><div class="mb-bars-plot">' + [42, 58, 49, 71, 63, 88, 76].map((v, i) => '<span class="mb-bar' + (v === 88 ? ' peak' : '') + '" style="--h:' + v / 100 + ';--i:' + i + '"></span>').join('') + '</div></div>',
    approval: () => '<div class="mb-doc mb-well"><span class="mb-doc-title">採購申請單 #PO-2611</span><div class="mb-lines"><span style="--w:92%"></span><span style="--w:78%"></span><span style="--w:86%"></span><span style="--w:44%"></span><span class="gap" style="--w:88%"></span><span style="--w:70%"><span class="mb-sel"><span class="mb-caret"></span></span></span><span style="--w:82%"></span></div><span class="mb-stamp">核准</span>' +
      '<span class="mb-cur a" style="--x:58%;--y:52%">' + ARROW + '<em>主管 Amy</em></span><span class="mb-cur b" style="--x:30%;--y:24%">' + ARROW + '<em>採購 小林</em></span></div>',
    automation: () => '<div class="mb-flow"><div class="mb-trigger mb-tile"><span class="mb-glyph">!</span><span><b>新報修單</b><small>#A1029 · 二廠冷卻水塔</small></span></div><ol class="mb-steps mb-well"><span class="mb-rail"><span class="mb-rail-fill"></span></span>' +
      [['收單', '0.4s'], ['AI 分類', '1.2s'], ['派給技師', '0.8s'], ['推播通知', '0.3s']].map((st, i) => '<li style="--i:' + i + '"><span class="mb-status"><span class="pend"></span><span class="spin"></span><span class="done">' + CHECK + '</span></span>' + st[0] + '<small>' + st[1] + '</small></li>').join('') + '</ol></div>',
    integration: () => {
      const nodes = [['ERP', '17%', '24%'], ['CRM', '83%', '24%'], ['LINE', '17%', '78%'], ['Excel', '83%', '78%']];
      return '<div class="mb-hub"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + nodes.map(n => '<line x1="' + parseFloat(n[1]) + '" y1="' + parseFloat(n[2]) + '" x2="50" y2="51" pathLength="1"/>').join('') + '</svg>' +
        nodes.map((n, i) => '<span class="mb-packet" style="--x:' + n[1] + ';--y:' + n[2] + ';--i:' + i + '"></span>').join('') +
        nodes.map((n, i) => '<span class="mb-node mb-tile" style="--x:' + n[1] + ';--y:' + n[2] + ';--i:' + (i + 1) + '">' + n[0] + '</span>').join('') +
        '<span class="mb-node mb-tile core" style="--x:50%;--y:51%;--i:0">W</span></div>';
    },
    security: () => '<div class="mb-shield">' + ['SSO 單一登入', '雙因素驗證', '操作稽核'].map((t, i) => '<div class="mb-setting mb-tile"><span>' + t + '</span><span class="mb-switch" style="--i:' + i + '"></span></div>').join('') + '</div>'
  };
  D.system = function (root) {
    const ITEMS = [
      { label: '報表分析', title: '月營收報表', desc: '滑過圖表看每月數字', v: 'analytics', c: 1, r: 1 },
      { label: '儀表板', title: '每週工單量', desc: '尖峰與瓶頸一眼看出', v: 'dashboard', c: 1, r: 1 },
      { label: '線上簽核', title: '多人同時審閱與核准', desc: '取代紙本與 Email 往返', v: 'approval', c: 2, r: 2 },
      { label: '流程自動化', title: '報修自動派工', desc: 'AI 分類後指派最近的技師', v: 'automation', c: 2, r: 2 },
      { label: '系統串接', title: 'API 整合', desc: '既有系統串成一條線', v: 'integration', c: 1, r: 1 },
      { label: '資訊安全', title: '權限與稽核', desc: 'SSO、2FA 與操作紀錄', v: 'security', c: 1, r: 1 }
    ];
    root.classList.add('mbento');
    root.dataset.motion = reduce ? '' : 'on';
    const cards = ITEMS.map(it => {
      const cell = el('div', 'mb-cell');
      cell.style.gridColumn = 'span ' + it.c;
      cell.style.gridRow = 'span ' + it.r;
      cell.innerHTML = '<div class="mb-card" tabindex="0" role="button" aria-label="' + it.title + '"><span class="mb-light"></span><div class="mb-content"><div class="mb-label">' + it.label + '</div><div class="mb-visual" aria-hidden="true">' + BENTO_VISUAL[it.v]() + '</div><div class="mb-text"><h4>' + it.title + '</h4><p>' + it.desc + '</p></div></div><span class="mb-rim"></span><span class="mb-border"></span></div>';
      root.appendChild(cell);
      return cell.firstChild;
    });

    // analytics curve
    const chart = root.querySelector('.mb-chart'), plot = chart.querySelector('.mb-plot'), svg = plot.querySelector('svg');
    const scrub = plot.querySelector('.mb-scrub'), dot = plot.querySelector('.mb-scrub-dot'), val = chart.querySelector('.mb-val'), note = chart.querySelector('.mb-note');
    let shape = null;
    const drawCurve = () => {
      const w = plot.clientWidth, hgt = plot.clientHeight;
      if (w < 5 || hgt < 5) return;
      shape = curve(CHART, w, hgt);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + hgt);
      svg.innerHTML = '<path class="area" d="' + shape.area + '"/><path class="line" d="' + shape.line + '" pathLength="1"/>';
    };
    new ResizeObserver(drawCurve).observe(plot);
    chart.addEventListener('pointermove', e => {
      if (!shape) return;
      const r = plot.getBoundingClientRect(), x = clamp(e.clientX - r.left, 0, r.width);
      const pos = (x / Math.max(1, r.width)) * (CHART.length - 1), i = Math.floor(pos), n = Math.min(CHART.length - 1, i + 1);
      chart.dataset.scrub = '';
      scrub.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
      dot.style.transform = 'translateY(' + sampleAt(shape.samples, x).toFixed(1) + 'px)';
      val.textContent = (CHART[i] + (CHART[n] - CHART[i]) * (pos - i)).toFixed(1) + 'M';
      note.textContent = (Math.round(pos) + 1) + ' 月';
    });
    chart.addEventListener('pointerleave', () => { delete chart.dataset.scrub; val.textContent = '12.4M'; note.textContent = '+18%'; });

    // spotlight + border glow + click wave
    const pointer = { x: -1e5, y: -1e5, inside: false };
    const wave = { x: 0, y: 0, t: -1, dur: 1.1, reach: 800 };
    let raf = 0, last = 0, near = 0, running = false;
    const frame = now => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const b = root.getBoundingClientRect();
      const target = pointer.inside && pointer.x > b.left - 150 && pointer.x < b.right + 150 && pointer.y > b.top - 150 && pointer.y < b.bottom + 150 ? 1 : 0;
      near += (target - near) * (1 - Math.exp(-dt / (target > near ? 0.12 : 0.4)));
      let busy = Math.abs(target - near) > 0.002;
      let wr = 0, wa = 0;
      if (wave.t >= 0) {
        wave.t += dt;
        const p = Math.min(1, wave.t / wave.dur);
        wr = wave.reach * (1 - Math.pow(1 - p, 2.2)); wa = Math.pow(1 - p, 1.3);
        if (p >= 1) { wave.t = -1; wa = 0; } else busy = true;
      }
      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        const px = pointer.x - r.left, py = pointer.y - r.top;
        const inside = pointer.inside && px >= 0 && py >= 0 && px <= r.width && py <= r.height;
        card.classList.toggle('hot', inside);
        const st = card.style;
        st.setProperty('--x', px.toFixed(1) + 'px'); st.setProperty('--y', py.toFixed(1) + 'px');
        st.setProperty('--near', near.toFixed(3));
        st.setProperty('--wx', (wave.x - r.left).toFixed(1) + 'px'); st.setProperty('--wy', (wave.y - r.top).toFixed(1) + 'px');
        st.setProperty('--wr', wr.toFixed(1) + 'px'); st.setProperty('--wa', wa.toFixed(3));
      });
      if (busy && running) raf = requestAnimationFrame(frame);
    };
    const wake = () => { if (!raf && running) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    root.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.inside = true; wake(); });
    root.addEventListener('pointerleave', () => { pointer.inside = false; wake(); });
    const replay = card => {
      if (reduce || !card.getAnimations) return;
      card.getAnimations({ subtree: true }).forEach(a => {
        const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
        if (!t || t.iterations === Infinity) return;
        a.currentTime = 0; a.play();
      });
    };
    const fire = (card, x, y) => {
      if (reduce) return;
      const b = root.getBoundingClientRect();
      wave.x = x; wave.y = y; wave.t = 0; wave.dur = 1.1;
      wave.reach = Math.max(Math.hypot(x - b.left, y - b.top), Math.hypot(x - b.right, y - b.top), Math.hypot(x - b.left, y - b.bottom), Math.hypot(x - b.right, y - b.bottom)) + 140;
      replay(card); wake();
    };
    cards.forEach(card => {
      card.addEventListener('click', e => fire(card, e.clientX, e.clientY));
      card.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        const r = card.getBoundingClientRect();
        fire(card, r.left + r.width / 2, r.top + r.height / 2);
      });
    });
    let entered = false;
    return {
      start() {
        running = true;
        if (!entered) {
          entered = true;
          root.querySelectorAll('.mb-cell').forEach((c, i) => { c.style.setProperty('--d', i * 80 + 'ms'); c.dataset.state = 'in'; });
          setTimeout(() => { const b = root.getBoundingClientRect(); fire(cards[0], b.left, b.top); }, 300);
        }
        drawCurve(); wake();
      },
      stop() { running = false; }
    };
  };

  /* ───────────────────────── 3. 3D 手機展示（App 開發） ───────────────────────── */
  const APPS = [
    { name: '敬請期待', sub: '', src: 'assets/video/app-soon', accent: '#c0394b', ch: [], dark: true },
    { name: 'BY My Roster', sub: 'AI 智慧排班 ∙ 一鍵排班', src: 'assets/video/app-roster2', accent: '#3b82f6', ch: [['行事曆', 0], ['排班', 4], ['報表', 10], ['班次', 25]] },
    { name: 'BY My Question', sub: '刷題工具 ∙ 學習成效', src: 'assets/video/app-question', accent: '#16a34a', ch: [['首頁', 0], ['題庫', 7], ['作答', 10], ['成效', 12]] }
  ];
  D.app = function (root) {
    root.classList.add('apps');
    root.innerHTML = '<div class="apps-stage"><div class="apps-rig"></div><div class="apps-floor"></div></div><div class="apps-ctl" role="group" aria-label="展示方式"><button type="button" data-l="row" class="on">並列</button><button type="button" data-l="arc">環繞</button><button type="button" data-l="focus">聚焦</button></div>';
    const rig = root.querySelector('.apps-rig');
    const phones = APPS.map((a, i) => {
      const p = el('div', 'phone' + (a.dark ? ' dark' : ''));
      p.style.setProperty('--a', a.accent);
      p.innerHTML = '<div class="ph-cap"><b>' + a.name + '</b>' + (a.sub ? '<small>' + a.sub + '</small>' : '') + '</div><div class="ph-body"><div class="ph-screen"><div class="ph-status"><b>9:41</b><span class="sig"><i></i><i></i><i></i></span><span class="bat"></span></div>' +
        '<video muted loop playsinline preload="metadata" poster="' + a.src + '.jpg" src="' + a.src + '.mp4" aria-label="' + (a.sub ? a.name + ' ' + a.sub : '即將推出的 App') + ' 操作畫面"></video><span class="ph-pause" aria-hidden="true">❚❚</span></div><div class="ph-island"></div><div class="ph-glare"></div></div>' +
        '<span class="ph-key k1"></span><span class="ph-key k2"></span><span class="ph-key k3"></span>' + (a.ch.length ? '<div class="ph-ch" role="group" aria-label="' + a.name + ' 畫面">' +
        a.ch.map((c, k) => '<button type="button" data-t="' + c[1] + '"' + (k ? '' : ' class="on"') + '>' + c[0] + '</button>').join('') + '</div>' : '');
      rig.appendChild(p);
      const v = p.querySelector('video'), btns = [].slice.call(p.querySelectorAll('.ph-ch button'));
      v.addEventListener('timeupdate', () => {
        let k = 0; a.ch.forEach((c, j) => { if (v.currentTime + 0.05 >= c[1]) k = j; });
        btns.forEach((b, j) => b.classList.toggle('on', j === k));
      });
      btns.forEach(b => b.addEventListener('click', e => {
        e.stopPropagation();
        v.currentTime = +b.dataset.t; p.classList.remove('paused');
        if (running) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
        if (layout === 'focus') setLayout('focus', i);
      }));
      p.querySelector('.ph-screen').addEventListener('click', e => {
        if (layout === 'focus' && focus !== i) return;
        e.stopPropagation();
        if (v.paused) { p.classList.remove('paused'); const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
        else { v.pause(); p.classList.add('paused'); }
      });
      p.addEventListener('click', () => { if (layout !== 'focus' || focus !== i) setLayout('focus', i); });
      return { el: p, v, x: 0, z: 0, ry: 0 };
    });
    let layout = 'row', focus = 1, running = false, raf = 0, last = 0, t = 0;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0, held: false };
    const btns = root.querySelectorAll('.apps-ctl button');
    const setLayout = (l, f) => {
      layout = l; if (f != null) focus = f;
      btns.forEach(b => b.classList.toggle('on', b.dataset.l === l));
    };
    btns.forEach(b => b.addEventListener('click', () => setLayout(b.dataset.l)));
    const targetFor = i => {
      if (layout === 'row') return { x: (i - 1) * 300, z: 0, ry: 0 };
      if (layout === 'arc') return { x: (i - 1) * 262, z: i === 1 ? 90 : -40, ry: (i - 1) * -30 };
      let d = i - focus; if (d > 1) d -= 3; if (d < -1) d += 3;
      return { x: d * 222, z: d === 0 ? 150 : -140, ry: d * -38 };
    };
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      tilt.held = true;
    });
    root.addEventListener('pointerleave', () => { tilt.held = false; });
    const fit = () => {
      const w = root.clientWidth, hgt = root.clientHeight - 60;
      root.style.setProperty('--fit', Math.max(0.42, Math.min(1, w / 960, hgt / 640)).toFixed(3));
    };
    new ResizeObserver(fit).observe(root);
    const frame = now => {
      raf = 0;
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; t += dt;
      const ax = tilt.held ? tilt.tx * 0.6 : (reduce ? 0 : Math.sin(t * 0.35) * 0.3);
      const ay = tilt.held ? tilt.ty * 0.6 : (reduce ? 0 : Math.sin(t * 0.27 + 1) * 0.2);
      const k = 1 - Math.exp(-dt / 0.18);
      tilt.x += (ax - tilt.x) * k; tilt.y += (ay - tilt.y) * k;
      rig.style.transform = 'rotateX(' + (6 - tilt.y * 7).toFixed(2) + 'deg) rotateY(' + (tilt.x * 18).toFixed(2) + 'deg)';
      phones.forEach((p, i) => {
        const g = targetFor(i), kk = 1 - Math.exp(-dt / 0.22);
        p.x += (g.x - p.x) * kk; p.z += (g.z - p.z) * kk; p.ry += (g.ry - p.ry) * kk;
        const bob = reduce ? 0 : Math.sin(t * 1.1 + i * 2) * 5;
        p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + bob.toFixed(1) + 'px,' + p.z.toFixed(1) + 'px) rotateY(' + p.ry.toFixed(2) + 'deg)';
        p.el.classList.toggle('dim', layout === 'focus' && i !== focus);
      });
      raf = requestAnimationFrame(frame);
    };
    return {
      start() {
        running = true; fit(); last = performance.now(); if (!raf) raf = requestAnimationFrame(frame);
        phones.forEach(p => { if (!p.el.classList.contains('paused')) { const pr = p.v.play(); if (pr && pr.catch) pr.catch(() => {}); } });
      },
      stop() { running = false; phones.forEach(p => p.v.pause()); }
    };
  };

  /* ───────────────────────── 4. CircularGallery（AI 顧問） ───────────────────────── */
  // 排班最佳化：出勤月曆 + 每日人力覆蓋（純 HTML/CSS 繪製）
  const SCHED_ART = (() => {
    const SH = ['休', 'D', 'E', 'N'], wk = ['日', '一', '二', '三', '四', '五', '六'];
    let cal = '<div class="gs-panel gs-cal"><b class="gs-t">出勤月曆</b><div class="gs-grid">' + wk.map(w => '<em>' + w + '</em>').join('');
    for (let d = 1; d <= 30; d++) { const k = SH[(d - 1) % 4]; cal += '<i class="s-' + (k === '休' ? 'off' : k) + '"><small>' + d + '</small>' + k + '</i>'; }
    cal += '</div></div>';
    const DAYS = [[2,2,2],[2,1,2],[1,2,2],[0,2,1],[1,2,2],[2,1,2],[1,0,2],[1,2,2],[1,1,2],[2,1,2],[1,2,2],[0,2,2],[1,1,2],[1,0,3],[2,1,2],[0,2,2],[0,2,2],[1,2,2],[2,1,2],[1,2,2],[0,2,2],[1,0,2],[2,2,2],[0,2,2],[0,2,2],[1,1,2],[2,1,2],[1,2,2],[0,2,0],[1,2,2]];
    let cov = '<div class="gs-panel gs-cov"><b class="gs-t">每日人力覆蓋<small>各班已排人數 · 虛線為每日需求</small></b><div class="gs-chart"><span class="gs-need"><em>需求 6</em></span>';
    cov += DAYS.map(([d, e, n]) => '<i style="--d:' + d + ';--e:' + e + ';--n:' + n + '"><u class="n"></u><u class="e"></u><u class="d"></u></i>').join('');
    cov += '</div><div class="gs-leg"><span class="d">早班</span><span class="e">中班</span><span class="n">晚班</span></div></div>';
    return '<div class="ga-sched">' + cal + cov + '</div>';
  })();
  const AI_ITEMS = [
    { t: 'AI 顧問', tag: 'Consult', bg: ['#3a2410', '#f39b4a'], d: '到校與企業開設 AI 導入工作坊與教師研習，從工具實作到教學應用一起陪跑。',
      out: ['逢甲大學', '敏實科大', '中信科大', '花崗中學'], art: '<div class="ga-photo"><img src="assets/img/consult/consult-1.jpg" alt="AI 導入工作坊" draggable="false"><img src="assets/img/consult/consult-2.jpg" alt="" draggable="false"></div><div class="ga-schools"><b>合作學校</b><span>逢甲大學</span><span>敏實科大</span><span>中信科大</span><span>花崗中學</span></div>' },
    { t: '知識庫問答', tag: 'RAG', bg: ['#2a1a6e', '#6B3CFF'], d: '員工直接用自然語言問規章與 SOP，答案附上出處頁碼，資料外的不回答。',
      out: ['人資詢問量下降', '新人到職自學'], art: '<div class="ga-chat"><p class="q">請假超過 3 天要誰簽核？</p><p class="a">需部門主管與人資共同簽核。<i>來源：人事規章 p.4</i></p></div>' },
    { t: '文件 OCR 自動填表', tag: 'OCR', bg: ['#0f2f4f', '#4dacff'], d: '掃描發票、報價單與申請書，自動辨識欄位並填入系統，人只需要確認。',
      out: ['登打時間大幅縮短', '欄位錯誤自動標示'], art: '<div class="ga-doc"><i></i><i></i><i class="hl"></i><i></i><i class="hl s"></i><i></i><span class="scan"></span><div class="tags"><b>統編 ✓</b><b>金額 ✓</b></div></div>' },
    { t: '會議紀錄摘要', tag: 'Speech', bg: ['#3b1d4a', '#c86bff'], d: '錄音上傳後自動轉文字，整理出決議、待辦與負責人。',
      out: ['會後 5 分鐘出紀錄', '待辦自動指派'], art: '<div class="ga-wave">' + Array.from({ length: 28 }, (_, i) => '<i style="--h:' + (0.25 + Math.abs(Math.sin(i * 1.7)) * 0.75).toFixed(2) + '"></i>').join('') + '</div><ul class="ga-list"><li><b>決議</b>Q1 上線 App</li><li><b>待辦</b>小林 · 規格書</li></ul>' },
    { t: '客服 Agent', tag: 'Agent', bg: ['#0d3b33', '#2fd4a3'], d: '串接 LINE 與官網，回答常見問題、查訂單，必要時轉真人。',
      out: ['24 小時回覆', '真人只處理例外'], art: '<div class="ga-agent"><img class="ag-av" src="assets/img/ai/agent-cs.webp" alt="AI 客服虛擬人物" draggable="false"><div class="ga-chat"><p class="u">我的訂單到哪了？</p><p class="a">訂單 #8821 已出貨，預計明天送達。</p><p class="u">好，謝謝</p></div></div>' },
    { t: '報價助理', tag: 'LLM', bg: ['#3f2a0c', '#ffb347'], d: '業務輸入需求，AI 依歷史報價與工時表產出初版報價單。',
      out: ['報價從半天到半小時', '價格邏輯一致'], art: '<div class="ga-table"><p><span>前端開發</span><b>12 人日</b></p><p><span>後台系統</span><b>18 人日</b></p><p><span>測試部署</span><b>6 人日</b></p><p class="tot"><span>合計</span><b>36 人日</b></p></div>' },
    { t: '影像瑕疵檢測', tag: 'Vision', bg: ['#1a2333', '#7d8cff'], d: '產線相機即時判斷刮痕、凹陷與異物，自動剔除並記錄。',
      out: ['檢出率穩定', '品管人力釋放'], art: '<div class="ga-vision"><span class="bx" style="left:18%;top:22%;width:30%;height:26%"><i>刮痕 0.94</i></span><span class="bx ok" style="left:56%;top:56%;width:28%;height:24%"><i>正常 0.98</i></span></div>' },
    { t: '輿情監測', tag: 'NLP', bg: ['#3d1420', '#ff6b8a'], d: '每天掃描新聞與社群，負面訊息即時通知，附摘要與來源。',
      out: ['即時預警', '週報自動產出'], art: '<ul class="ga-news"><li><span>產品評價上升</span><i class="g" style="--w:72%"></i></li><li><span>客訴討論增加</span><i class="r" style="--w:46%"></i></li><li><span>新品話題</span><i class="g" style="--w:58%"></i></li></ul>' },
    { t: '排班最佳化', tag: 'Optimize', bg: ['#14304a', '#4dacff'], d: '考量勞基法、人力與偏好，自動排出合規班表，可手動微調。',
      out: ['排班時間減少', '違規自動檢查'], art: SCHED_ART }
  ];
  D.ai = function (root) {
    root.classList.add('cg');
    root.innerHTML = '<div class="cg-track"></div><div class="cg-detail" hidden><button type="button" class="cg-close" aria-label="關閉">×</button><div class="cg-art"></div><div class="cg-info"><span class="cg-tag"></span><h4></h4><p></p><ul></ul></div></div><div class="cg-nav"><button type="button" class="prev" aria-label="上一個">←</button><button type="button" class="next" aria-label="下一個">→</button></div>';
    root.tabIndex = 0;
    root.setAttribute('aria-label', 'AI 應用情境，可用方向鍵瀏覽');
    const track = root.querySelector('.cg-track'), detail = root.querySelector('.cg-detail');
    const N = AI_ITEMS.length;
    const cards = AI_ITEMS.map((it, i) => {
      const c = el('div', 'cg-card');
      c.innerHTML = '<div class="cg-face" style="--b1:' + it.bg[0] + ';--b2:' + it.bg[1] + '"><span class="cg-chip">' + it.tag + '</span>' + it.art + '</div><span class="cg-label">' + it.t + '</span>';
      track.appendChild(c);
      return c;
    });
    const st = { scroll: 0, target: 0, vel: 0, spacing: 300, cw: 230, ch: 300, active: 0, hover: -1, drag: null, lastInput: 0, open: false, intro: reduce ? 1 : 0 };
    let W = 1, H = 1, running = false, raf = 0, last = 0, snapT = 0;
    const measure = () => {
      W = Math.max(1, root.clientWidth); H = Math.max(1, root.clientHeight);
      const ch = Math.min(H * 0.6, 420), cw = ch * 0.78, sc = Math.min(1, (W * 0.82) / cw);
      const before = st.spacing;
      st.ch = ch * sc; st.cw = cw * sc; st.spacing = st.cw * 1.26;
      if (before > 1 && before !== st.spacing) { st.scroll = (st.scroll / before) * st.spacing; st.target = (st.target / before) * st.spacing; }
      root.style.setProperty('--cw', st.cw.toFixed(1) + 'px'); root.style.setProperty('--ch', st.ch.toFixed(1) + 'px');
    };
    new ResizeObserver(measure).observe(root);
    const arc = x => {
      const depth = (3 * H) / 16.57, half = Math.max(W, H * 1.9) / 2, R = (half * half + depth * depth) / (2 * depth);
      const reach = Math.min(Math.abs(x), half, R * 0.999);
      return { y: R - Math.sqrt(R * R - reach * reach), a: Math.sign(x) * Math.asin(reach / R) };
    };
    const wrapI = v => ((v % N) + N) % N;
    const setSlot = slot => { st.target = slot * st.spacing; st.lastInput = performance.now(); };
    const nearest = () => Math.round(st.target / st.spacing);
    const openItem = idx => {
      const it = AI_ITEMS[idx];
      detail.querySelector('.cg-art').innerHTML = '<div class="cg-face big" style="--b1:' + it.bg[0] + ';--b2:' + it.bg[1] + '"><span class="cg-chip">' + it.tag + '</span>' + it.art + '</div>';
      detail.querySelector('.cg-tag').textContent = it.tag;
      detail.querySelector('.cg-info h4').textContent = it.t;
      detail.querySelector('.cg-info p').textContent = it.d;
      detail.querySelector('.cg-info ul').innerHTML = it.out.map(o => '<li>' + o + '</li>').join('');
      detail.hidden = false; st.open = true; root.classList.add('open');
    };
    const close = () => { detail.hidden = true; st.open = false; root.classList.remove('open'); };
    detail.querySelector('.cg-close').addEventListener('click', close);
    detail.addEventListener('click', e => { if (e.target === detail) close(); });
    root.querySelector('.prev').addEventListener('click', () => setSlot(nearest() - 1));
    root.querySelector('.next').addEventListener('click', () => setSlot(nearest() + 1));
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape' && st.open) { close(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); setSlot(nearest() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setSlot(nearest() - 1); }
      if (e.key === 'Enter' && !st.open) openItem(wrapI(nearest()));
    });
    const slotOf = (cardIdx) => { const base = nearest(), off = wrapI(cardIdx - base); return base + (off > N / 2 ? off - N : off); };
    track.addEventListener('pointerdown', e => {
      if (e.button !== 0 || st.open) return;
      st.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, start: st.target, moved: false, samples: [], card: e.target.closest('.cg-card') };
      st.lastInput = performance.now();
    });
    track.addEventListener('pointermove', e => {
      const d = st.drag;
      if (d && d.id === e.pointerId) {
        const dx = e.clientX - d.x0;
        if (!d.moved && Math.abs(dx) > 6) { d.moved = true; track.setPointerCapture && track.setPointerCapture(e.pointerId); root.dataset.dragging = ''; }
        if (d.moved) { st.target = d.start - dx; d.samples.push({ x: e.clientX, t: performance.now() }); if (d.samples.length > 6) d.samples.shift(); st.lastInput = performance.now(); }
        return;
      }
      const c = e.target.closest('.cg-card');
      st.hover = c ? cards.indexOf(c) : -1;
    });
    track.addEventListener('pointerleave', () => { st.hover = -1; });
    const up = e => {
      const d = st.drag;
      if (!d || d.id !== e.pointerId) return;
      st.drag = null; delete root.dataset.dragging;
      if (d.moved) {
        if (d.samples.length > 1) { const a = d.samples[0], b = d.samples[d.samples.length - 1]; st.target -= ((b.x - a.x) / Math.max(b.t - a.t, 16)) * 1000 * 0.18; }
        setSlot(Math.round(st.target / st.spacing));
        return;
      }
      if (d.card) {
        const i = cards.indexOf(d.card), slot = slotOf(i);
        if (slot === nearest() && Math.abs(st.scroll - st.target) < st.spacing * 0.3) openItem(i);
        else setSlot(slot);
      }
    };
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    root.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      st.target += e.deltaX; st.lastInput = performance.now();
      clearTimeout(snapT); snapT = setTimeout(() => setSlot(nearest()), 140);
    }, { passive: false });
    const frame = now => {
      raf = 0;
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      const idle = now - st.lastInput > 2200;
      if (!reduce && !st.drag && !st.open && st.hover < 0 && idle) st.target += 0.35 * st.spacing * 0.25 * dt;
      if (st.intro < 1) st.intro = Math.min(1, st.intro + dt / 1.4);
      st.scroll += (st.target - st.scroll) * (reduce ? 1 : 1 - Math.pow(1 - 0.06, dt * 60));
      const total = N * st.spacing, ie = 1 - Math.pow(1 - st.intro, 3), sc = st.scroll + (1 - ie) * st.spacing * 1.6;
      cards.forEach((c, i) => {
        const raw = i * st.spacing - sc;
        const x = ((((raw + total / 2) % total) + total) % total) - total / 2;
        const g = arc(x), hv = st.hover === i ? 1.04 : 1;
        const fade = clamp(1 - (Math.abs(x) - W * 0.38) / (W * 0.16), 0, 1);
        c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + g.y.toFixed(1) + 'px) rotate(' + g.a.toFixed(4) + 'rad) scale(' + hv + ')';
        c.style.opacity = (fade * clamp(st.intro * 2.2 - Math.abs(x) / st.spacing * 0.22, 0, 1)).toFixed(3);
        c.classList.toggle('center', Math.abs(x) < st.spacing * 0.4);
      });
      raf = requestAnimationFrame(frame);
    };
    return {
      start() { running = true; measure(); last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); },
      stop() { running = false; }
    };
  };

  /* ───────────────────────── AI 顧問：照片輪播 ───────────────────────── */
  const CONSULT = [
    { img: 'assets/img/consult/consult-1.jpg', title: '生成式 AI 導入工作坊', schools: ['合作學校 A（示意）', '合作學校 B（示意）'] },
    { img: 'assets/img/consult/consult-2.jpg', title: 'AI 教學應用研習', schools: ['合作學校 C（示意）', '合作學校 D（示意）', '合作學校 E（示意）'] }
  ];
  D.consult = function (root) {
    const DUR = 5;
    root.classList.add('consult');
    root.style.setProperty('--dur', DUR + 's');
    root.innerHTML = '<div class="cs-frame">' + CONSULT.map((c, i) => '<div class="cs-slide' + (i ? '' : ' on') + '"><img src="' + c.img + '" alt="' + c.title + '" draggable="false"></div>').join('') +
      '<span class="cs-count"><b>01</b> / ' + String(CONSULT.length).padStart(2, '0') + '</span><div class="cs-nav"><button type="button" class="prev" aria-label="上一張">←</button><button type="button" class="next" aria-label="下一張">→</button></div></div>' +
      '<div class="cs-cap"><span class="k">PARTNER SCHOOLS</span><div class="cs-body"><h4></h4></div><div class="cs-schools"></div><div class="cs-dots">' + CONSULT.map((c, i) => '<button type="button" aria-label="第 ' + (i + 1) + ' 張"><i></i></button>').join('') + '</div></div>';
    const slides = root.querySelectorAll('.cs-slide'), dots = [].slice.call(root.querySelectorAll('.cs-dots button')), h4 = root.querySelector('.cs-cap h4'), sc = root.querySelector('.cs-schools'), cnt = root.querySelector('.cs-count b');
    let i = 0, timer = 0, running = false, hover = false;
    const go = n => {
      i = (n + CONSULT.length) % CONSULT.length;
      slides.forEach((sl, k) => sl.classList.toggle('on', k === i));
      dots.forEach((d, k) => { d.classList.remove('on', 'done'); if (k < i) d.classList.add('done'); });
      void root.offsetWidth; dots[i].classList.add('on');
      h4.textContent = CONSULT[i].title; cnt.textContent = String(i + 1).padStart(2, '0');
      sc.innerHTML = CONSULT[i].schools.map(x => '<span>' + x + '</span>').join('');
      [h4, sc].forEach(e => { e.classList.remove('fade'); void e.offsetWidth; e.classList.add('fade'); });
      schedule();
    };
    const schedule = () => { clearTimeout(timer); if (running && !hover && !reduce) timer = setTimeout(() => go(i + 1), DUR * 1000); };
    root.querySelector('.prev').addEventListener('click', () => go(i - 1));
    root.querySelector('.next').addEventListener('click', () => go(i + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    const frame = root.querySelector('.cs-frame');
    frame.addEventListener('pointerenter', () => { hover = true; clearTimeout(timer); dots[i].style.setProperty('animation-play-state', 'paused'); dots[i].querySelector('i').style.animationPlayState = 'paused'; });
    frame.addEventListener('pointerleave', () => { hover = false; dots[i].querySelector('i').style.animationPlayState = ''; go(i); });
    let sx = null;
    frame.addEventListener('pointerdown', e => { sx = e.clientX; });
    frame.addEventListener('pointerup', e => { if (sx != null && Math.abs(e.clientX - sx) > 40) go(i + (e.clientX < sx ? 1 : -1)); sx = null; });
    go(0);
    return { start() { running = true; go(i); }, stop() { running = false; clearTimeout(timer); } };
  };

  /* ───────────────────────── 5. GridScan（虛擬實境） ───────────────────────── */
  const GS_VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
  const GS_ROOM = `#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uPixel;
uniform vec3 uEye;
uniform float uDepth;
uniform vec3 uCell;
uniform float uThick;
uniform float uDot;
uniform int uStyle;
uniform vec3 uLineColor;
uniform vec3 uScanColor;
uniform vec3 uCoreColor;
uniform float uFade;
uniform float uScanZ;
uniform float uScanDir;
uniform float uScanAlpha;
uniform float uScanWidth;
uniform float uTrail;
uniform float uReveal;
uniform float uPoints;
uniform float uReflect;
uniform float uHaze;
uniform float uShade;
uniform float uLight;
uniform vec4 uPing[4];
uniform float uPingAlpha[4];
uniform vec4 uHover;
uniform float uTime;
in vec2 vUv;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outGlow;
struct Light { float grid; float fade; float core; float trail; float spill; float ping; float wake; float reveal; };
float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 hash2(vec2 p) { vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
float lines(float across, float along, float period, float dash, float fa, float fb) {
  float u = across / period;
  float du = fa / period;
  float d = abs(fract(u + 0.5) - 0.5) / max(du, 1e-5);
  float dense = smoothstep(0.1, 0.4, du);
  if (uStyle == 2) {
    float c = along / dash * 5.0;
    float dc = fb / dash * 5.0;
    float e = abs(fract(c + 0.5) - 0.5) / max(dc, 1e-5);
    float cov = clamp(uThick + 1.0 - length(vec2(d, e)), 0.0, 1.0);
    float mean = min(1.0, 3.1416 * (uThick + 0.5) * (uThick + 0.5) * du * dc);
    return mix(cov, mean, max(dense, smoothstep(0.1, 0.4, dc)));
  }
  float cov = clamp(uThick + 0.5 - d, 0.0, 1.0);
  float mean = min(1.0, 2.0 * uThick * du);
  if (uStyle == 1) {
    float c = along / dash * 4.0;
    float dc = fb / dash * 4.0;
    float e = abs(fract(c + 0.5) - 0.5);
    float m = clamp((0.25 - e) / max(dc, 1e-5) + 0.5, 0.0, 1.0);
    cov *= mix(m, 0.5, smoothstep(0.1, 0.4, dc));
    mean *= 0.5;
  }
  return mix(cov, mean, dense);
}
float depthFade(float z) { float n = clamp(z / uDepth, 0.0, 1.0); return mix(1.0, (exp(-3.0 * n) - 0.0497871) / 0.9502129, uFade); }
vec3 project(vec3 eye, vec3 o, int face, float plane) {
  vec3 d = o - eye;
  float t = face == 0 ? (plane - o.x) / d.x : (face == 1 ? (plane - o.y) / d.y : (plane - o.z) / d.z);
  return o + d * t;
}
void trace(vec3 o, vec3 d, out int face, out float plane, out vec3 h) {
  float sx = d.x > 0.0 ? 0.5 * uAspect : -0.5 * uAspect;
  float sy = d.y > 0.0 ? 0.5 : -0.5;
  float tx = abs(d.x) > 1e-6 ? (sx - o.x) / d.x : 1e9;
  float ty = abs(d.y) > 1e-6 ? (sy - o.y) / d.y : 1e9;
  float t = (uDepth - o.z) / d.z;
  face = 2; plane = uDepth;
  if (tx < t) { face = 0; plane = sx; t = tx; }
  if (ty < t) { face = 1; plane = sy; t = ty; }
  h = o + d * t;
}
vec2 faceUv(vec3 h, int face) {
  if (face == 0) return vec2(h.z, h.y + 0.5);
  if (face == 1) return vec2(h.x + 0.5 * uAspect, h.z);
  return vec2(h.x + 0.5 * uAspect, h.y + 0.5);
}
Light illuminate(vec3 h, int face, vec2 uv, vec2 foot, float blur) {
  Light l;
  vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);
  vec2 f = foot * blur;
  float minor = max(lines(uv.x, uv.y, cell.x, cell.y, f.x, f.y), lines(uv.y, uv.x, cell.y, cell.x, f.y, f.x));
  float major = max(lines(uv.x, uv.y, cell.x * 4.0, cell.y, f.x, f.y), lines(uv.y, uv.x, cell.y * 4.0, cell.x, f.y, f.x));
  l.grid = max(minor * 0.75, major) / blur;
  float z = h.z;
  l.fade = depthFade(z);
  l.reveal = smoothstep(uReveal, uReveal - 0.2, z);
  float zFoot = face == 0 ? f.x : (face == 1 ? f.y : 0.0);
  float width = max(uScanWidth, zFoot * 1.1);
  float dz = z - uScanZ;
  l.core = exp(-dz * dz / (width * width)) * (face == 2 ? 0.45 : 1.0) * uScanAlpha;
  float behind = -dz * uScanDir;
  l.trail = exp(-max(behind, 0.0) / uTrail) * smoothstep(-width, width * 0.5, behind) * uScanAlpha;
  l.spill = exp(-dz * dz / 0.05) * uScanAlpha;
  l.ping = 0.0; l.wake = 0.0;
  for (int i = 0; i < 4; i++) {
    float alpha = uPingAlpha[i];
    if (alpha <= 0.0) continue;
    float dist = length(h - uPing[i].xyz) - uPing[i].w;
    l.ping += exp(-dist * dist / 0.0012) * alpha;
    l.wake += exp(min(dist, 0.0) / 0.22) * smoothstep(0.03, -0.03, dist) * alpha;
  }
  return l;
}
void over(inout vec4 acc, vec3 color, float alpha) { alpha = clamp(alpha, 0.0, 1.0); acc = vec4(color * alpha, alpha) + acc * (1.0 - alpha); }
void paint(inout vec4 color, inout float energy, Light l, float gain, float lift, float hover) {
  float base = l.grid * l.fade * l.reveal * lift;
  float far = l.fade * l.reveal * gain;
  float lit = l.grid * (l.core * 1.2 + l.trail * 0.75 + l.ping * 1.4 + l.wake * 0.5 + hover * 0.5) * far;
  float sheen = (l.core * 0.14 + l.spill * 0.05 + l.trail * 0.03 + l.ping * 0.2 + l.wake * 0.04) * far;
  float laser = (l.core + l.ping * 0.35) * far;
  over(color, uLineColor, base);
  over(color, uScanColor, sheen);
  over(color, uScanColor, lit);
  over(color, uCoreColor, laser * 0.9);
  energy += laser * 0.9 + lit * 0.5;
}
void main() {
  vec3 p = vec3((vUv.x - 0.5) * uAspect, vUv.y - 0.5, 0.0);
  vec3 d = p - uEye;
  int face; float plane; vec3 h;
  trace(p, d, face, plane, h);
  vec3 hx = project(uEye, p + vec3(uPixel, 0.0, 0.0), face, plane);
  vec3 hy = project(uEye, p + vec3(0.0, uPixel, 0.0), face, plane);
  vec2 uv = faceUv(h, face);
  vec2 ux = faceUv(hx, face) - uv;
  vec2 uy = faceUv(hy, face) - uv;
  vec2 foot = vec2(length(vec2(ux.x, uy.x)), length(vec2(ux.y, uy.y)));
  Light l = illuminate(h, face, uv, foot, 1.0);
  vec4 color = vec4(0.0);
  float energy = 0.0;
  if (uShade > 0.0) {
    vec2 gaps = face == 0 ? vec2(0.5 - abs(h.y), uDepth - h.z) : (face == 1 ? vec2(0.5 * uAspect - abs(h.x), uDepth - h.z) : vec2(0.5 * uAspect - abs(h.x), 0.5 - abs(h.y)));
    vec2 crease = 1.0 - exp(-max(gaps, 0.0) / 0.16);
    float occlusion = crease.x * crease.y;
    float lamp = 1.0 / (1.0 + h.z * h.z * 0.9);
    float tilt = face == 1 ? (plane < 0.0 ? 1.1 : 0.85) : (face == 2 ? 0.8 : 1.0);
    float glowSpill = (l.spill * 0.5 + l.trail * 0.12) * l.reveal * l.fade;
    if (uLight > 0.5) {
      float shadow = (1.0 - lamp * tilt) * 0.09 + (1.0 - occlusion) * 0.2;
      over(color, vec3(0.0), shadow * uShade * l.reveal * l.fade);
    } else {
      over(color, vec3(1.0), lamp * tilt * occlusion * 0.11 * uShade * l.reveal * l.fade);
    }
    over(color, uScanColor, glowSpill * uShade * occlusion * 0.35);
  }
  if (face == 1 && plane < 0.0 && uReflect > 0.0) {
    vec3 mirror = vec3(uEye.x, -1.0 - uEye.y, uEye.z);
    vec3 r = h - mirror;
    int face2; float plane2; vec3 h2;
    trace(h, r, face2, plane2, h2);
    vec2 uv2 = faceUv(h2, face2);
    vec2 ux2 = faceUv(project(mirror, hx, face2, plane2), face2) - uv2;
    vec2 uy2 = faceUv(project(mirror, hy, face2, plane2), face2) - uv2;
    vec2 foot2 = vec2(length(vec2(ux2.x, uy2.x)), length(vec2(ux2.y, uy2.y)));
    float travel = length(h2 - h);
    Light m = illuminate(h2, face2, uv2, foot2, 1.0 + travel * 4.0);
    m.reveal *= l.reveal;
    float grazing = 1.0 - normalize(r).y;
    float gain = (0.3 + 0.7 * grazing * grazing * grazing * grazing) * uReflect * exp(-travel * 1.1) * (uLight > 0.5 ? 0.6 : 1.0);
    float reflected = 0.0;
    paint(color, reflected, m, gain, 0.0, 0.0);
    energy += reflected * 0.6;
  }
  vec3 near = h - uHover.xyz;
  float hover = exp(-dot(near, near) / 0.08) * uHover.w;
  paint(color, energy, l, 1.0, 1.0, hover);
  if (uPoints > 0.5) {
    vec2 cell = face == 0 ? uCell.zy : (face == 1 ? uCell.xz : uCell.xy);
    vec2 spacing = cell / 2.5;
    vec2 q = uv / spacing;
    vec2 id = floor(q);
    vec2 seed = id + vec2(float(face) * 13.7 + plane * 5.3, float(face) * 3.1);
    vec2 delta = (q - id - (0.2 + 0.6 * hash2(seed))) * spacing;
    float det = ux.x * uy.y - ux.y * uy.x;
    vec2 s = vec2(delta.x * uy.y - delta.y * uy.x, ux.x * delta.y - ux.y * delta.x) / det;
    float radius = uDot * mix(1.0, 0.55, clamp(h.z / uDepth, 0.0, 1.0));
    float spot = clamp(radius + 0.5 - length(s), 0.0, 1.0);
    float gap = min(spacing.x / foot.x, spacing.y / foot.y);
    float r = hash(seed + 7.7);
    float flicker = 0.75 + 0.25 * sin(uTime * (3.0 + r * 5.0) + r * 40.0);
    float dots = spot * smoothstep(5.0, 10.0, gap) * smoothstep(0.25, 0.6, r) * (0.3 + 0.7 * r * r) * flicker;
    float hot = l.core * 2.5 + l.ping * 1.6;
    float warm = l.trail * l.trail * 1.3 + l.wake * 0.6 + hover * 1.3;
    float spark = dots * (hot + warm) * l.fade * l.reveal;
    over(color, mix(uScanColor, uCoreColor, clamp(hot / max(hot + warm, 1e-4), 0.0, 1.0)), spark);
    energy += spark * 0.9;
  }
  if (uHaze > 0.0 && uScanAlpha > 0.0 && uScanZ > 0.0 && h.z > uScanZ) {
    vec3 c = p + d * (uScanZ / d.z);
    float grain = hash(floor(c.xy * 180.0) + floor(uTime * 24.0) * 7.0);
    float edge = min(0.5 * uAspect - abs(c.x), 0.5 - abs(c.y));
    float rim = exp(-edge / 0.06);
    float veil = uHaze * uScanAlpha * (0.45 + 0.9 * grain) * (0.55 + rim * 1.6);
    over(color, uScanColor, veil * depthFade(uScanZ) * l.reveal);
  }
  energy = clamp(energy, 0.0, 1.0);
  outColor = color;
  outGlow = vec4(uScanColor * energy, energy);
}`;
  const GS_DOWN = `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 o = uTexel;
  outColor = 0.25 * (texture(uSource, vUv + vec2(-o.x, -o.y)) + texture(uSource, vUv + vec2(o.x, -o.y)) + texture(uSource, vUv + vec2(-o.x, o.y)) + texture(uSource, vUv + vec2(o.x, o.y)));
}`;
  const GS_BLUR = `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uStep;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 sum = texture(uSource, vUv) * 0.1964825501511404;
  sum += (texture(uSource, vUv + uStep * 1.411764705882353) + texture(uSource, vUv - uStep * 1.411764705882353)) * 0.2969069646728344;
  sum += (texture(uSource, vUv + uStep * 3.2941176470588234) + texture(uSource, vUv - uStep * 3.2941176470588234)) * 0.09447039785044732;
  sum += (texture(uSource, vUv + uStep * 5.176470588235294) + texture(uSource, vUv - uStep * 5.176470588235294)) * 0.010381362401148057;
  outColor = sum;
}`;
  const GS_COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uGlow;
in vec2 vUv;
out vec4 outColor;
float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main() {
  vec4 scene = texture(uScene, vUv);
  vec4 bloom = texture(uBloom, vUv) * uGlow;
  bloom.a = min(bloom.a, 1.0);
  bloom.rgb = min(bloom.rgb, vec3(bloom.a));
  vec4 color = scene + bloom * (1.0 - scene.a);
  float noise = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  color.a = clamp(color.a + noise, 0.0, 1.0);
  color.rgb = clamp(color.rgb + noise, vec3(0.0), vec3(color.a));
  outColor = color;
}`;
  D.xr = function (root, opts) {
    const s = Object.assign({ linesColor: '#4a4364', scanColor: '#4dacff', cells: 8, thickness: 1, style: 0, depth: 2.4, depthFade: 0.55, parallax: 1, points: true, reflection: 0.35, shading: 0.7, direction: 'forward', duration: 2.4, delay: 1.6, scanWidth: 1, trail: 0.5, glow: 0.6, autoScan: true, interactive: true, clickEffect: 'ping', intro: true }, opts || {});
    root.classList.add('grid-scan');
    const canvas = el('canvas', 'grid-scan-canvas');
    canvas.setAttribute('aria-hidden', 'true');
    root.appendChild(canvas);
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    const noop = { start() {}, stop() {}, sweep() {} };
    if (!gl) { root.appendChild(el('p', 'grid-scan-fallback', '這個瀏覽器不支援 WebGL2，無法顯示空間掃描效果。')); return noop; }
    const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh; console.warn(gl.getShaderInfoLog(sh)); gl.deleteShader(sh); return null; };
    const link = frag => {
      const v = compile(gl.VERTEX_SHADER, GS_VERTEX), f = compile(gl.FRAGMENT_SHADER, frag), p = gl.createProgram();
      if (!v || !f) return null;
      gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p); gl.deleteShader(v); gl.deleteShader(f);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { gl.deleteProgram(p); return null; }
      const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); if (!info) continue; const nm = info.name.replace(/\[0\]$/, ''); u[nm] = gl.getUniformLocation(p, nm); }
      return { program: p, uniforms: u };
    };
    const room = link(GS_ROOM), down = link(GS_DOWN), blur = link(GS_BLUR), comp = link(GS_COMPOSITE);
    if (!room || !down || !blur || !comp) { root.appendChild(el('p', 'grid-scan-fallback', '空間掃描效果載入失敗。')); return noop; }
    const vao = gl.createVertexArray();
    const target = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return { texture: t, width: 0, height: 0 }; };
    const sizeT = (t, w, hh) => { if (t.width === w && t.height === hh) return; t.width = w; t.height = hh; gl.bindTexture(gl.TEXTURE_2D, t.texture); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, hh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); };
    const scene = target(), light = target(), bloomA = target(), bloomB = target();
    const sceneBuf = gl.createFramebuffer(), bufA = gl.createFramebuffer(), bufB = gl.createFramebuffer();
    const hexRgb = hx => { const n = parseInt(hx.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
    const lineRgb = hexRgb(s.linesColor), scanRgb = hexRgb(s.scanColor), coreRgb = scanRgb.map(c => c + (1 - c) * 0.65);
    const view = { width: 1, height: 1, ratio: 1 };
    const EYE = 1.25;
    const eye = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: EYE, vf: 0, tf: EYE };
    const pointer = { x: 0, y: 0, inside: false };
    const look = { x: 0, y: 0, held: false };
    const hover = { x: 0, y: 0, z: 0, strength: 0, ready: false };
    const scan = { z: 0, dir: 1, alpha: 0, start: 0, sweeps: 0, waiting: false };
    const pings = [], pingData = new Float32Array(16), pingAlpha = new Float32Array(4);
    let time = 0, introClock = s.intro && !reduce ? 0 : 1, raf = 0, last = 0, running = false;
    const roomSize = () => { const aspect = view.width / view.height, cy = 1 / Math.round(s.cells), cx = aspect / Math.max(1, Math.round(aspect / cy)); return { aspect, cx, cy, roomDepth: Math.max(cy, Math.round(s.depth / cy) * cy) }; };
    const castRay = (u, v) => {
      const { aspect, roomDepth } = roomSize(), px = (u - 0.5) * aspect, py = v - 0.5, dx = px - eye.x, dy = py - eye.y, dz = eye.f;
      const sx = dx > 0 ? 0.5 * aspect : -0.5 * aspect, sy = dy > 0 ? 0.5 : -0.5;
      let t = roomDepth / dz;
      if (Math.abs(dx) > 1e-6) t = Math.min(t, (sx - px) / dx);
      if (Math.abs(dy) > 1e-6) t = Math.min(t, (sy - py) / dy);
      return { x: px + dx * t, y: py + dy * t, z: dz * t };
    };
    const startSweep = () => { scan.dir = s.direction === 'backward' || (s.direction === 'pingpong' && scan.sweeps % 2 === 1) ? -1 : 1; scan.start = time; scan.waiting = false; scan.sweeps += 1; };
    const updateScan = roomDepth => {
      if (introClock < 1) { const k = introClock; scan.dir = 1; scan.z = k * (roomDepth + 0.4) - 0.2; scan.alpha = Math.min(1, k * 6) * (1 - Math.max(0, k - 0.85) / 0.15); return; }
      if (scan.sweeps === 0 && !scan.waiting) { scan.waiting = true; scan.start = time; scan.alpha = 0; }
      if (scan.waiting) { scan.alpha = 0; if (s.autoScan && !reduce && time - scan.start >= s.delay) startSweep(); return; }
      const k = (time - scan.start) / s.duration;
      if (k >= 1) { scan.waiting = true; scan.start = time; scan.alpha = 0; return; }
      const travel = k * (roomDepth + 0.3) - 0.15;
      scan.z = scan.dir > 0 ? travel : roomDepth - travel;
      scan.alpha = Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.12);
    };
    const updateEye = dt => {
      const steps = Math.max(1, Math.ceil(dt / (1 / 120))), hh = dt / steps;
      for (let i = 0; i < steps; i++) {
        eye.vx += ((eye.tx - eye.x) * 42 - eye.vx * 11) * hh; eye.vy += ((eye.ty - eye.y) * 42 - eye.vy * 11) * hh; eye.vf += ((eye.tf - eye.f) * 42 - eye.vf * 11) * hh;
        eye.x += eye.vx * hh; eye.y += eye.vy * hh; eye.f += eye.vf * hh;
      }
    };
    const aimEye = () => {
      const aspect = view.width / view.height, drift = reduce ? 0 : 1;
      const nx = look.held ? look.x : (Math.sin(time * 0.21) * 0.2 + Math.sin(time * 0.083 + 1.3) * 0.12) * drift;
      const ny = look.held ? look.y : Math.sin(time * 0.17 + 2.1) * 0.16 * drift;
      eye.tx = nx * s.parallax * 0.22 * aspect; eye.ty = ny * s.parallax * 0.22;
    };
    const draw = () => {
      const { aspect, cx, cy, roomDepth } = roomSize(), ru = room.uniforms;
      gl.bindVertexArray(vao); gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuf);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(room.program);
      gl.uniform1f(ru.uAspect, aspect); gl.uniform1f(ru.uPixel, 1 / canvas.height);
      gl.uniform3f(ru.uEye, eye.x, eye.y, -eye.f); gl.uniform1f(ru.uDepth, roomDepth); gl.uniform3f(ru.uCell, cx, cy, cy);
      gl.uniform1f(ru.uThick, s.thickness * view.ratio * 0.5); gl.uniform1f(ru.uDot, 1.8 * view.ratio); gl.uniform1i(ru.uStyle, s.style);
      gl.uniform3fv(ru.uLineColor, lineRgb); gl.uniform3fv(ru.uScanColor, scanRgb); gl.uniform3fv(ru.uCoreColor, coreRgb);
      gl.uniform1f(ru.uFade, s.depthFade); gl.uniform1f(ru.uScanZ, scan.z); gl.uniform1f(ru.uScanDir, scan.dir); gl.uniform1f(ru.uScanAlpha, scan.alpha);
      gl.uniform1f(ru.uScanWidth, 0.006 * s.scanWidth); gl.uniform1f(ru.uTrail, 0.04 + s.trail * 1.1);
      gl.uniform1f(ru.uReveal, introClock < 1 ? scan.z + 0.05 : 1e4); gl.uniform1f(ru.uPoints, s.points ? 1 : 0);
      gl.uniform1f(ru.uReflect, s.reflection); gl.uniform1f(ru.uHaze, 0.05); gl.uniform1f(ru.uShade, s.shading); gl.uniform1f(ru.uLight, 0);
      gl.uniform4fv(ru.uPing, pingData); gl.uniform1fv(ru.uPingAlpha, pingAlpha);
      gl.uniform4f(ru.uHover, hover.x, hover.y, hover.z, hover.strength); gl.uniform1f(ru.uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const glowing = s.glow > 0;
      if (glowing) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, bufA); gl.viewport(0, 0, bloomA.width, bloomA.height);
        gl.useProgram(down.program); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, light.texture);
        gl.uniform1i(down.uniforms.uSource, 0); gl.uniform2f(down.uniforms.uTexel, 1 / light.width, 1 / light.height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        const spread = (2.2 * view.ratio) / 2;
        gl.useProgram(blur.program); gl.uniform1i(blur.uniforms.uSource, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, bufB); gl.bindTexture(gl.TEXTURE_2D, bloomA.texture); gl.uniform2f(blur.uniforms.uStep, spread / bloomA.width, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, bufA); gl.bindTexture(gl.TEXTURE_2D, bloomB.texture); gl.uniform2f(blur.uniforms.uStep, 0, spread / bloomA.height); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(comp.program);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, scene.texture); gl.uniform1i(comp.uniforms.uScene, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bloomA.texture); gl.uniform1i(comp.uniforms.uBloom, 1);
      gl.uniform1f(comp.uniforms.uGlow, glowing ? s.glow * 1.6 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.activeTexture(gl.TEXTURE0);
    };
    const resize = () => {
      view.width = Math.max(1, root.clientWidth); view.height = Math.max(1, root.clientHeight); view.ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(view.width * view.ratio)); canvas.height = Math.max(1, Math.round(view.height * view.ratio));
      sizeT(scene, canvas.width, canvas.height); sizeT(light, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBuf);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, scene.texture, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, light.texture, 0);
      const bw = Math.max(1, Math.round(canvas.width / 4)), bh = Math.max(1, Math.round(canvas.height / 4));
      sizeT(bloomA, bw, bh); sizeT(bloomB, bw, bh);
      gl.bindFramebuffer(gl.FRAMEBUFFER, bufA); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomA.texture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, bufB); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomB.texture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (root.clientWidth > 1) draw();
    };
    const frame = now => {
      raf = 0;
      if (!running) return;
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;
      last = now; time += dt;
      if (introClock < 1) introClock = Math.min(1, introClock + dt / 2.2);
      updateScan(roomSize().roomDepth); aimEye(); updateEye(dt);
      const aim = s.interactive && pointer.inside && !reduce ? 1 : 0;
      if (aim) {
        const tgt = castRay(pointer.x, pointer.y);
        if (!hover.ready) Object.assign(hover, tgt, { ready: true });
        const f = 1 - Math.exp(-dt / 0.08);
        hover.x += (tgt.x - hover.x) * f; hover.y += (tgt.y - hover.y) * f; hover.z += (tgt.z - hover.z) * f;
      }
      hover.strength += (aim - hover.strength) * (1 - Math.exp(-dt / 0.25));
      if (!aim && hover.strength < 0.01) hover.ready = false;
      for (let i = pings.length - 1; i >= 0; i--) { pings[i].age += dt; if (pings[i].age > 2.4) pings.splice(i, 1); }
      for (let i = 0; i < 4; i++) {
        const p = pings[i];
        if (!p) { pingAlpha[i] = 0; continue; }
        const k = p.age / 2.4;
        pingData.set([p.x, p.y, p.z, p.age * 1.15], i * 4);
        pingAlpha[i] = Math.min(1, p.age / 0.05) * (1 - k) * (1 - k);
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    const locate = e => { const r = root.getBoundingClientRect(), u = (e.clientX - r.left) / Math.max(1, r.width), v = 1 - (e.clientY - r.top) / Math.max(1, r.height); return { u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 }; };
    root.addEventListener('pointermove', e => {
      const { u, v, inside } = locate(e);
      pointer.x = u; pointer.y = v; pointer.inside = inside;
      if (inside && s.interactive && !reduce) { look.x = clamp(u * 2 - 1, -1, 1); look.y = clamp(v * 2 - 1, -1, 1); look.held = true; }
    });
    root.addEventListener('pointerleave', () => { pointer.inside = false; look.held = false; });
    root.addEventListener('pointerdown', e => {
      if (e.target.closest('button, a, .xr-partner')) return;
      const { u, v, inside } = locate(e);
      if (!inside || reduce) return;
      pings.unshift(Object.assign(castRay(u, v), { age: 0 }));
      if (pings.length > 4) pings.pop();
    });
    new ResizeObserver(resize).observe(root);
    return {
      start() { running = true; resize(); last = 0; if (!raf) raf = requestAnimationFrame(frame); },
      stop() { running = false; },
      sweep() { if (introClock >= 1) startSweep(); }
    };
  };

  /* ───────────────────────── 6. 逐層列印（3D 列印） ───────────────────────── */
  const ell = (a, rx, ry) => 1 / Math.sqrt(Math.pow(Math.cos(a) / rx, 2) + Math.pow(Math.sin(a) / ry, 2));
  // 依弧長把封閉折線重取樣成 n 點
  const resample = (src, n) => {
    const P = src.concat([src[0]]), seg = [];
    let tot = 0;
    for (let i = 0; i < P.length - 1; i++) { const d = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); seg.push(d); tot += d; }
    const out = []; let j = 0, acc = 0;
    for (let k = 0; k < n; k++) {
      const want = (k / n) * tot;
      while (j < seg.length - 1 && acc + seg[j] < want) { acc += seg[j]; j++; }
      const u = seg[j] ? (want - acc) / seg[j] : 0;
      out.push([P[j][0] + (P[j + 1][0] - P[j][0]) * u, P[j][1] + (P[j + 1][1] - P[j][1]) * u]);
    }
    return out;
  };
  const rrect = (cx, cy, hx, hy, rad, n) => { // 圓角矩形
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const e = 8, d = Math.pow(Math.pow(Math.abs(c), e) + Math.pow(Math.abs(s), e), -1 / e);
      pts.push([cx + c * d * hx, cy + s * d * hy]);
    }
    return pts;
  };
  const hull = (s, n) => { // Benchy 船體平面：尖船頭 + 平船尾
    const L = 0.56 + 0.32 * s, Wd = 0.2 + 0.15 * s, pts = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
      const x = Math.max(L * c, -0.78 * L), taper = c > 0 ? 1 - 0.78 * Math.pow(c, 3) : 1;
      pts.push([x + 0.06, Wd * sn * taper]);
    }
    return pts;
  };
  // Q 版坐姿小龍：每層由多個「島」組成（腳、尾巴、身體、翅膀、頭、角）
  const oval = (cx, cy, rx, ry, n) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const band = (path, w0, w1, n) => { // 沿路徑生成粗細漸變的帶狀多邊形
    const L = [], R = [], m = path.length - 1;
    path.forEach((p, i) => {
      const q = path[Math.min(m, i + 1)], o = path[Math.max(0, i - 1)];
      let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      const w = w0 + (w1 - w0) * (i / m);
      L.push([p[0] - ty * w, p[1] + tx * w]); R.push([p[0] + ty * w, p[1] - tx * w]);
    });
    return resample(L.concat(R.reverse()), n);
  };
  // 可動小龍（平躺一體列印的關節龍）：與成品圖同一條 S 形脊椎
  const flexiDragon = (() => {
    const K = 170, M = 26, sp = [];
    for (let i = 0; i < M; i++) { const u = i / (M - 1); sp.push([(40 + 300 * u - 200) / K, (230 - 110 * u + 38 * Math.sin(u * Math.PI * 2.2) - 165) / K]); }
    const rect = (cx, cy, ang, hw, hh, n) => { const c = Math.cos(ang), s = Math.sin(ang); return rrect(0, 0, hw, hh, 0, n).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]); };
    const segs = [];
    for (let i = 0; i < M - 3; i++) {
      const u = i / (M - 1), [x, y] = sp[i], [nx, ny] = sp[i + 1];
      const w = (u < 0.8 ? 6 + 26 * Math.min(1, u / 0.55) : 32 - 30 * (u - 0.8)) / K, h = (12 + 6 * Math.min(1, u / 0.5)) / K;
      segs.push({ x, y, a: Math.atan2(ny - y, nx - x), hw: h * 0.75, hh: w / 2 });
    }
    const iw = Math.round(0.62 * (M - 1)), [wx, wy] = sp[iw];
    let tx = sp[iw + 1][0] - sp[iw - 1][0], ty = sp[iw + 1][1] - sp[iw - 1][1]; const l = Math.hypot(tx, ty); tx /= l; ty /= l;
    const wing = (sd, sc) => [[12, 10], [10, 118], [-14, 100], [-30, 96], [-46, 86], [-60, 74], [-70, 58], [-78, 44], [-60, 12]]
      .map(([al, o]) => [wx + (tx * al - ty * o * sd * sc) / K, wy + (ty * al + tx * o * sd * sc) / K]);
    const W1 = resample(wing(1, 1), 60), W2 = resample(wing(-1, 0.85), 60);
    const [hx, hy] = sp[M - 3], [ex, ey] = sp[M - 1], ha = Math.atan2(ey - hy, ex - hx);
    const HEAD = [[-12, -20], [10, -24], [34, -12], [52, -6], [58, 0], [52, 6], [34, 12], [10, 24], [-12, 20], [-18, 0]];
    const head = resample(HEAD.map(([x, y]) => [hx + (x * Math.cos(ha) - y * Math.sin(ha)) / K, hy + (x * Math.sin(ha) + y * Math.cos(ha)) / K]), 48);
    return t => {
      const out = [];
      if (t < 0.3) out.push(W2, W1);
      const k = t > 0.7 ? 1 - (t - 0.7) * 1.2 : 1;
      segs.forEach(g => out.push(rect(g.x, g.y, g.a, g.hw * k, g.hh * k, 20)));
      out.push(t > 0.7 ? head.map(([x, y]) => [hx + (x - hx) * k, hy + (y - hy) * k]) : head);
      return out;
    };
  })();
  const dragonLayer = (t, n) => {
    const out = [];
    if (t < 0.1) [-1, 1].forEach(sd => out.push(oval(0.16, sd * 0.2, 0.15, 0.1, n)));                     // 腳
    if (t < 0.24) {                                                                                          // 捲尾
      const lift = t / 0.24, path = [];
      for (let i = 0; i <= 24; i++) { const u = i / 24, ang = Math.PI * (0.05 + 1.25 * u); path.push([-0.28 - 0.42 * Math.sin(ang * 0.8) * (1 - 0.35 * u) - 0.05 * lift, 0.36 * (1 - Math.cos(ang * 0.8)) * (1 - 0.3 * u)]); }
      out.push(band(path.slice(0, 25 - Math.round(lift * 10)), 0.13, 0.035, n));
    }
    if (t >= 0.04 && t < 0.56) { const u = (t - 0.04) / 0.52, g = 0.62 + 0.38 * Math.sin(Math.min(1, u * 1.6) * Math.PI / 2) - 0.32 * Math.max(0, u - 0.55) / 0.45; out.push(oval(-0.02 * u, 0, 0.38 * g, 0.31 * g, n)); } // 身體
    if (t >= 0.36 && t < 0.64) [-1, 1].forEach(sd => { const u = (t - 0.36) / 0.28; out.push(oval(-0.1 - 0.28 * u, sd * (0.3 + 0.5 * u), 0.15 - 0.05 * u, 0.045, n)); }); // 翅膀
    if (t >= 0.5 && t < 0.64) { const u = (t - 0.5) / 0.14; out.push(oval(0.02 + 0.14 * u, 0, 0.17, 0.15, n)); }   // 脖子
    if (t >= 0.6 && t < 0.88) { const u = (t - 0.6) / 0.28, g = 0.45 + 0.55 * Math.sqrt(Math.sin(Math.PI * Math.min(1, u * 1.05))); out.push(oval(0.26 + 0.06 * Math.sin(u * Math.PI), 0, 0.34 * g, 0.27 * g, n)); } // 大頭
    if (t >= 0.84) [-1, 1].forEach(sd => { const u = (t - 0.84) / 0.16; out.push(oval(0.14 - 0.14 * u, sd * (0.13 + 0.05 * u), 0.055 * (1 - 0.6 * u), 0.05 * (1 - 0.6 * u), n)); }); // 角
    return out;
  };
  const MODELS = {
    ball: { name: '鏤空籃球', photo: 'assets/img/print/print-ball.svg', note: '晶格結構 · 一體成型', layers: 84, h: 1.0, pts: 96,
      r: (a, t) => { const y = 2 * t - 1, base = 0.6 * Math.sqrt(Math.max(0.02, 1 - y * y)); return base * (1 + 0.035 * Math.sin(a * 18) * Math.sin(t * 40)); } },
    boat: { name: '測試小船', photo: 'assets/img/print/print-boat.svg', note: 'Benchy 精度測試件', layers: 90, h: 0.72, pts: 120,
      shape: (t, n) => t < 0.36 ? hull(Math.pow(t / 0.36, 0.6), n)          // 船體由窄到寬
        : t < 0.4 ? hull(1, n)                                               // 甲板
        : t < 0.7 ? rrect(-0.16, 0, 0.28, 0.22, 0, n)                        // 船艙
        : t < 0.75 ? rrect(-0.16, 0, 0.36, 0.28, 0, n)                       // 屋頂外伸
        : Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [-0.04 + Math.cos(a) * 0.1, Math.sin(a) * 0.1]; }) }, // 煙囪
    dragon: { name: '可動小龍', photo: 'assets/img/print/print-dragon.svg', note: '關節可動 · 免組裝', layers: 34, h: 0.16, pts: 64, tilt: 0.78,
      loops: t => flexiDragon(t) }
  };
  D.print = function (root) {
    root.classList.add('printer');
    root.innerHTML = '<canvas aria-hidden="true"></canvas><div class="pr-show" aria-live="polite"><div class="ph"><img alt=""></div><span class="sh"></span><b></b><small></small></div><div class="pr-hud"><span>LAYER <b class="pr-l">0</b> / <b class="pr-n">0</b></span><span>0.2 mm · PLA</span><span class="pr-state">列印中</span></div><div class="pr-ctl" role="group" aria-label="選擇模型">' +
      Object.keys(MODELS).map((k, i) => '<button type="button" data-m="' + k + '"' + (i ? '' : ' class="on"') + '>' + MODELS[k].name + '</button>').join('') + '<button type="button" class="restart">重新列印</button></div>';
    const cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
    const lEl = root.querySelector('.pr-l'), nEl = root.querySelector('.pr-n'), sEl = root.querySelector('.pr-state');
    const show = root.querySelector('.pr-show'), showImg = show.querySelector('img'), showB = show.querySelector('b'), showS = show.querySelector('small');
    Object.keys(MODELS).forEach(k => { const im = new Image(); im.src = MODELS[k].photo; });
    const SHOW_FOR = 4;
    let model = MODELS.ball, progress = 0, rot = 0.5, rotV = 0, running = false, raf = 0, last = 0, hold = 0, W = 1, H = 1, dpr = 1;
    let dragging = null;
    const shapeCache = new Map();
    const setModel = k => {
      model = MODELS[k]; progress = 0; hold = 0; shapeCache.clear();
      show.classList.remove('on'); root.classList.remove('showing');
      showImg.src = model.photo; showImg.alt = model.name + ' 3D 列印成品'; showB.textContent = model.name; showS.textContent = model.note;
      root.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === k));
      nEl.textContent = model.layers;
    };
    root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => setModel(b.dataset.m)));
    root.querySelector('.restart').addEventListener('click', () => { progress = 0; hold = 0; show.classList.remove('on'); root.classList.remove('showing'); });
    cv.addEventListener('pointerdown', e => { dragging = { x: e.clientX, r: rot }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (dragging) { const nr = dragging.r + (e.clientX - dragging.x) * 0.01; rotV = (nr - rot) * 30; rot = nr; } });
    const endDrag = () => { dragging = null; };
    cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
    const resize = () => { const r = root.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; };
    new ResizeObserver(resize).observe(root);
    const lerpC = (a, b, t) => 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
    const C0 = [107, 60, 255], C1 = [77, 172, 255];
    // 每層 = 一或多個封閉輪廓（島）
    const loopsAt = t => {
      let P = shapeCache.get(t);
      if (P) return P;
      const n = model.pts;
      if (model.loops) P = model.loops(t, n);
      else if (model.shape) P = [model.shape(t, n)];
      else P = [Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2, r = model.r(a, t); return [Math.cos(a) * r, Math.sin(a) * r]; })];
      shapeCache.set(t, P);
      return P;
    };
    const partialLoop = (pts, f) => { // 取輪廓前 f 比例（含收尾點）
      const n = pts.length, out = [], whole = Math.floor(n * f);
      for (let k = 0; k <= Math.min(whole, n); k++) out.push(pts[k % n]);
      const rem = n * f - whole;
      if (rem > 0 && whole < n) { const a = pts[whole], c = pts[(whole + 1) % n]; out.push([a[0] + (c[0] - a[0]) * rem, a[1] + (c[1] - a[1]) * rem]); }
      return out;
    };
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const S = Math.min(W * 0.32, H * 0.36), cx = W / 2, base = H * (model.tilt ? 0.66 : 0.78), tilt = model.tilt || 0.42, zH = S * 1.25;
      const proj = (x, y, z) => { const c = Math.cos(rot), s = Math.sin(rot), xr = x * c - y * s, yr = x * s + y * c; return [cx + xr * S, base + yr * S * tilt - z * zH]; };
      // build plate
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        ctx.strokeStyle = i === 0 ? 'rgba(77,172,255,.28)' : 'rgba(140,130,180,.13)';
        let a = proj(i * 0.2, -1, 0), b = proj(i * 0.2, 1, 0);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        a = proj(-1, i * 0.2, 0); b = proj(1, i * 0.2, 0);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      const total = model.layers, done = Math.floor(progress), frac = progress - done;
      let nozzle = null;
      let lastTop = null;
      for (let L = 0; L <= Math.min(done, total - 1); L++) {
        const t = L / (total - 1), z = t * model.h, partial = L === done ? frac : 1;
        if (partial <= 0) continue;
        const loops = loopsAt(t), m = loops.length;
        ctx.strokeStyle = lerpC(C0, C1, t);
        ctx.globalAlpha = partial >= 1 ? 0.55 + 0.45 * (L / total) : 1;
        ctx.lineWidth = partial >= 1 ? 1.1 : 2;
        for (let j = 0; j < m; j++) {
          const f = Math.max(0, Math.min(1, partial * m - j));
          if (f <= 0) break;
          const pts = (f >= 1 ? loops[j].concat([loops[j][0]]) : partialLoop(loops[j], f)).map(p => proj(p[0], p[1], z));
          ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          if (f >= 1) { ctx.closePath(); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(16,14,24,.92)'; ctx.fill(); ctx.globalAlpha = partial >= 1 ? 0.55 + 0.45 * (L / total) : 1; }
          ctx.stroke();
          if (L === done) nozzle = pts[pts.length - 1];
        }
        ctx.globalAlpha = 1;
        lastTop = loops;
      }
      if (!nozzle && done >= total && lastTop && lastTop.length) { const p = lastTop[lastTop.length - 1][0]; nozzle = proj(p[0], p[1], model.h + 0.08); }
      if (nozzle) {
        const [nx, ny] = nozzle;
        if (done < total) {
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 22);
          g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.2, 'rgba(77,172,255,.5)'); g.addColorStop(1, 'rgba(77,172,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 22, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#d9d6e8';
        ctx.beginPath(); ctx.moveTo(nx - 4, ny - 8); ctx.lineTo(nx + 4, ny - 8); ctx.lineTo(nx + 1.5, ny - 1); ctx.lineTo(nx - 1.5, ny - 1); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2b2838'; ctx.strokeStyle = '#4a4560'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(nx - 22, ny - 40, 44, 32, 6) : ctx.rect(nx - 22, ny - 40, 44, 32); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4dacff'; ctx.fillRect(nx - 14, ny - 30, 6, 3);
        ctx.strokeStyle = 'rgba(140,130,180,.35)'; ctx.beginPath(); ctx.moveTo(0, ny - 30); ctx.lineTo(nx - 22, ny - 30); ctx.moveTo(nx + 22, ny - 30); ctx.lineTo(W, ny - 30); ctx.stroke();
      }
      lEl.textContent = Math.min(total, done + (frac > 0 ? 1 : 0));
      sEl.textContent = done >= total ? '列印完成 · 成品展示' : '列印中';
    };
    const frame = now => {
      raf = 0;
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      if (!dragging) { rotV *= Math.pow(0.04, dt); rot += (reduce ? 0 : 0.12) * dt + rotV * dt; }
      if (progress < model.layers) progress = Math.min(model.layers, progress + dt * (reduce ? 60 : model.layers / 9));
      else {
        hold += dt;
        if (hold > 0.5 && !show.classList.contains('on')) { show.classList.add('on'); root.classList.add('showing'); }
        if (hold > 0.5 + SHOW_FOR + 0.6) { const ks = Object.keys(MODELS), next = ks[(ks.indexOf(Object.keys(MODELS).find(k => MODELS[k] === model)) + 1) % ks.length]; setModel(next); }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    setModel('ball');
    return {
      start() { running = true; resize(); last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); },
      stop() { running = false; }
    };
  };
})();
