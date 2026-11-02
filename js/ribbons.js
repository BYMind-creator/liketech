/*
 * InterferenceRibbons — vanilla Canvas port
 * 參數與 <InterferenceRibbons /> (reactbits-starter/interference-ribbons-tw) 同名同義，
 * 之後改用 React 版時可直接沿用同一組設定。
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    colors: ['#6B3CFF', '#4dacff'],
    backgroundColor: '#0A0A0A',
    mode: 'auto',
    wires: 64,
    lineWidth: 1.6,
    ribbonWidth: 0.24,
    amplitude: 0.6,
    waveLength: 1,
    angle: 42,
    twist: 1.6,
    curl: 0.25,
    depth: 0.65,
    stripes: 2.2,
    colorFlow: 0.04,
    glow: 0.45,
    intensity: 1,
    speed: 0.7,
    spin: 0.35,
    interactive: true,
    hoverPulses: true,
    clickPulse: true,
    pulseSpeed: 1.1,
    pulseStrength: 1,
    hoverBoost: 1,
    paused: false
  };

  function hexToRgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, s) {
    return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
  }

  function InterferenceRibbons(canvas, options) {
    var o = Object.assign({}, DEFAULTS, options || {});
    var ctx = canvas.getContext('2d');
    var off = document.createElement('canvas');
    var octx = off.getContext('2d');
    var cols = o.colors.map(hexToRgb);
    var W = 1, H = 1, dpr = 1, t = 0, last = performance.now(), raf = 0;
    var alive = true, inView = true;
    var pulses = [];
    var m = { u: 0.5, cur: 0, target: 0, lastSpawn: 0 };
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var target = o.target || canvas.parentElement || canvas;
    var hasFilter = 'filter' in ctx;
    var cen = [], twA = [], hbA = [], dispA = [];

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      var cap = o.mode === 'auto' ? (W * H > 1.6e6 ? 1.25 : 2) : 2;
      dpr = Math.min(global.devicePixelRatio || 1, cap);
      canvas.width = off.width = Math.round(W * dpr);
      canvas.height = off.height = Math.round(H * dpr);
      if (o.paused || reduce) draw();
    }

    function geom() {
      var a = o.angle * Math.PI / 180;
      return {
        dx: Math.cos(a), dy: Math.sin(a),
        L: Math.hypot(W, H) * 1.12,
        S: Math.min(W, H) * 0.85 + Math.max(W, H) * 0.12,
        cx: W / 2, cy: H / 2
      };
    }
    function toU(x, y) {
      var g = geom();
      return ((x - g.cx) * g.dx + (y - g.cy) * g.dy) / g.L + 0.5;
    }
    function addPulse(u, dir, str) {
      if (pulses.length > 18) pulses.shift();
      pulses.push({ u: u, dir: dir, str: str, life: 1 });
    }
    function local(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      return { x: x, y: y, inside: x >= 0 && y >= 0 && x <= r.width && y <= r.height };
    }
    function onMove(e) {
      if (!o.interactive) return;
      var p = local(e);
      m.target = p.inside ? 1 : 0;
      if (!p.inside) return;
      var u = toU(p.x, p.y), now = performance.now();
      if (o.hoverPulses && now - m.lastSpawn > 150 && Math.abs(u - m.u) > 0.004) {
        addPulse(u, u > m.u ? 1 : -1, 0.55);
        m.lastSpawn = now;
      }
      m.u = u;
    }
    function onLeave() { m.target = 0; }
    function onDown(e) {
      if (!o.interactive || !o.clickPulse) return;
      var p = local(e);
      if (!p.inside) return;
      var u = toU(p.x, p.y);
      addPulse(u, 1, 1.6);
      addPulse(u, -1, 1.6);
    }

    function colorAt(u, r) {
      var s = 0.5 + 0.5 * Math.sin((u * o.stripes - t * o.colorFlow * 3) * Math.PI * 2 + r * Math.PI);
      var c = mix(cols[0], cols[1 % cols.length], s);
      var h = 0;
      for (var i = 0; i < pulses.length; i++) {
        var d = u - pulses[i].u;
        h += Math.exp(-d * d / 0.0016) * pulses[i].life * pulses[i].str;
      }
      var hb = o.hoverBoost * m.cur * Math.exp(-(u - m.u) * (u - m.u) / 0.006) * 0.3;
      var x = u * Math.PI * 2 * 1.6 / Math.max(0.05, o.waveLength);
      var tw = Math.cos(x * o.twist * 0.5 + t * o.spin * 2 + r * 2.1);
      var dep = 1 - o.depth * 0.8 * (1 - tw) / 2;
      c = mix(c, [255, 255, 255], Math.min(0.85, h * 0.45 + hb));
      var a = Math.min(1, o.intensity * dep * (0.72 + h * 0.5 + hb));
      return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')';
    }

    function draw() {
      var g = geom();
      var N = (o.mode === 'auto' && W < 720) ? 90 : 160;
      var R = 2, per = Math.max(2, Math.round(o.wires / R));
      var ts = t * o.speed, sp = t * o.spin * 2;
      var nx = -g.dy, ny = g.dx;
      var A = o.amplitude * g.S * 0.3, C = o.curl * g.S * 0.2, RW = o.ribbonWidth * g.S;
      var x0 = g.cx - g.dx * g.L / 2, y0 = g.cy - g.dy * g.L / 2;
      var x1 = g.cx + g.dx * g.L / 2, y1 = g.cy + g.dy * g.L / 2;
      var k, j, r, u, x;

      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.globalCompositeOperation = 'source-over';
      octx.globalAlpha = 1;
      octx.clearRect(0, 0, W, H);
      octx.globalCompositeOperation = 'lighter';
      octx.lineWidth = o.lineWidth;
      octx.lineCap = 'round';
      octx.lineJoin = 'round';

      for (r = 0; r < R; r++) {
        var ph = r * 2.1, sg = r ? -1 : 1;
        var grad = octx.createLinearGradient(x0, y0, x1, y1);
        for (var s = 0; s <= 24; s++) grad.addColorStop(s / 24, colorAt(s / 24, r));
        octx.strokeStyle = grad;

        for (k = 0; k <= N; k++) {
          u = k / N;
          x = u * Math.PI * 2 * 1.6 / Math.max(0.05, o.waveLength);
          cen[k] = Math.sin(x + ts * sg + ph) * A + Math.sin(x * 2.3 - ts * 0.6 + ph * 1.7) * C;
          twA[k] = x * o.twist * 0.5 + sp + ph;
          hbA[k] = 1 + o.hoverBoost * m.cur * 0.6 * Math.exp(-(u - m.u) * (u - m.u) / 0.01);
          var d = 0;
          for (var i = 0; i < pulses.length; i++) {
            var dd = u - pulses[i].u;
            d += Math.exp(-dd * dd / 0.004) * Math.cos(dd * 70) * pulses[i].str * pulses[i].life;
          }
          dispA[k] = d * g.S * 0.05 * o.pulseStrength * sg;
        }

        for (j = 0; j < per; j++) {
          var w = j / (per - 1) - 0.5;
          octx.globalAlpha = 0.35 + 0.65 * Math.pow(Math.abs(w) * 2, 1.6);
          octx.beginPath();
          for (k = 0; k <= N; k++) {
            u = k / N;
            var tw = Math.cos(twA[k] + w * 0.9);
            var v = cen[k] * hbA[k] + w * RW * (0.18 + 0.82 * tw) * hbA[k] + dispA[k];
            var px = g.cx + g.dx * (u - 0.5) * g.L + nx * v;
            var py = g.cy + g.dy * (u - 0.5) * g.L + ny * v;
            if (k) octx.lineTo(px, py); else octx.moveTo(px, py);
          }
          octx.stroke();
        }
      }
      octx.globalAlpha = 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      if (hasFilter) ctx.filter = 'none';
      if (o.backgroundColor && o.backgroundColor !== 'transparent') {
        ctx.fillStyle = o.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      ctx.globalCompositeOperation = 'lighter';
      if (o.glow > 0 && hasFilter) {
        ctx.filter = 'blur(' + (o.glow * 24 * dpr).toFixed(1) + 'px)';
        ctx.globalAlpha = Math.min(1, o.glow * 1.5);
        ctx.drawImage(off, 0, 0);
        ctx.filter = 'none';
      }
      ctx.globalAlpha = 1;
      ctx.drawImage(off, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(now) {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inView || document.hidden) return;
      if (!o.paused) t += dt * (reduce ? 0.2 : 1);
      for (var i = pulses.length - 1; i >= 0; i--) {
        var p = pulses[i];
        p.u += p.dir * dt * 0.32 * o.pulseSpeed;
        p.life -= dt * 0.55;
        if (p.life <= 0 || p.u < -0.2 || p.u > 1.2) pulses.splice(i, 1);
      }
      m.cur += (m.target - m.cur) * Math.min(1, dt * 5);
      draw();
    }

    var ro = new ResizeObserver(resize);
    ro.observe(canvas);
    var io = 'IntersectionObserver' in global ? new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
    }) : null;
    if (io) io.observe(canvas);
    target.addEventListener('pointermove', onMove, { passive: true });
    target.addEventListener('pointerleave', onLeave);
    target.addEventListener('pointerdown', onDown);
    resize();
    raf = requestAnimationFrame(loop);

    return {
      set: function (p) {
        Object.assign(o, p);
        if (p.colors) cols = o.colors.map(hexToRgb);
      },
      get options() { return Object.assign({}, o); },
      pulseAt: function (xFrac, yFrac, str) {
        var u = toU(xFrac * W, yFrac * H);
        addPulse(u, 1, str || 1.6);
        addPulse(u, -1, str || 1.6);
      },
      destroy: function () {
        alive = false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        if (io) io.disconnect();
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerleave', onLeave);
        target.removeEventListener('pointerdown', onDown);
      }
    };
  }

  InterferenceRibbons.defaults = DEFAULTS;
  global.InterferenceRibbons = InterferenceRibbons;
})(window);
