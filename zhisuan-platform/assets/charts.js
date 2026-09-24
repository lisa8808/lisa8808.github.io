/* ============================================================
   大模型智算平台 · 图表与图标（SVG 自绘，无第三方依赖）
   遵循《产品设计规划》V2.1 · 10.6 数据可视化规范
   - 语义色恒定：算力=青绿 消耗=琥珀 额度=靛蓝 风险=朱红 洞察=紫罗兰
   - Token 与卡时双轴并列，禁止折算
   - 容量类图表必带均值参考线与阈值刻线
   - 异常不靠颜色区分，加标记符
   ============================================================ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function tok(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function C() {
    return {
      ink900: tok('--ink-900'), ink700: tok('--ink-700'), ink500: tok('--ink-500'),
      ink400: tok('--ink-400'), ink300: tok('--ink-300'),
      line: tok('--line'), lineSoft: tok('--line-soft'), sunken: tok('--surface-sunken'),
      surface: tok('--surface'),
      compute: tok('--compute'), computeSoft: tok('--compute-soft'),
      spend: tok('--spend'), spendSoft: tok('--spend-soft'),
      quota: tok('--quota'), quotaSoft: tok('--quota-soft'),
      risk: tok('--risk'), riskSoft: tok('--risk-soft'),
      insight: tok('--insight'), insightSoft: tok('--insight-soft')
    };
  }

  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    return n;
  }
  function txt(x, y, s, o) {
    o = o || {};
    var t = svgEl('text', {
      x: x, y: y, fill: o.fill || C().ink400,
      'font-size': o.size || 10, 'font-weight': o.weight || 400,
      'text-anchor': o.anchor || 'start',
      'font-family': o.mono === false ? 'inherit' : 'var(--font-num)'
    });
    t.textContent = s;
    return t;
  }
  function fmt(n, d) {
    d = d === undefined ? 1 : d;
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(d) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(d) + 'k';
    return String(Math.round(n * 10) / 10);
  }

  /* 自适应挂载：按容器实际像素渲染，尺寸变化时重绘 */
  function mount(el, render) {
    function draw() {
      var w = el.clientWidth || 640;
      var h = el.clientHeight || 180;
      if (w < 40) return;
      el.textContent = '';
      var s = svgEl('svg', { class: 'chart', width: w, height: h, viewBox: '0 0 ' + w + ' ' + h });
      render(s, w, h);
      el.appendChild(s);
    }
    draw();
    if (global.ResizeObserver) {
      var t = null;
      new ResizeObserver(function () {
        clearTimeout(t); t = setTimeout(draw, 90);
      }).observe(el);
    }
  }

  /* ---------- 迷你趋势线 ---------- */
  function sparkline(el, values, opts) {
    opts = opts || {};
    mount(el, function (s, w, h) {
      var c = C(), col = opts.color || c.compute;
      var pad = 3, min = Math.min.apply(null, values), max = Math.max.apply(null, values);
      var span = (max - min) || 1;
      var pts = values.map(function (v, i) {
        var x = pad + i * (w - pad * 2) / (values.length - 1 || 1);
        var y = h - pad - (v - min) / span * (h - pad * 2);
        return [x, y];
      });
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      if (opts.fill !== false) {
        s.appendChild(svgEl('path', {
          d: d + 'L' + pts[pts.length - 1][0] + ' ' + h + 'L' + pts[0][0] + ' ' + h + 'Z',
          fill: col, opacity: .1
        }));
      }
      s.appendChild(svgEl('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
    });
  }

  /* ---------- 柱状 / 堆叠柱（构成分析） ---------- */
  function bars(el, cfg) {
    mount(el, function (s, w, h) {
      var c = C();
      var labels = cfg.labels, series = cfg.series;
      var padL = 40, padR = 12, padT = 14, padB = 22;
      var iw = w - padL - padR, ih = h - padT - padB;
      var totals = labels.map(function (_, i) {
        return series.reduce(function (a, se) { return a + se.values[i]; }, 0);
      });
      var max = cfg.max || Math.max.apply(null, totals) * 1.15 || 1;

      [0, .25, .5, .75, 1].forEach(function (f) {
        var y = padT + ih - f * ih;
        s.appendChild(svgEl('line', { x1: padL, y1: y, x2: w - padR, y2: y, stroke: c.lineSoft }));
        s.appendChild(txt(padL - 6, y + 3, fmt(max * f, 0), { anchor: 'end' }));
      });

      var step = iw / labels.length, bw = Math.min(cfg.barWidth || 26, step * .6);

      /* 均值参考线 */
      if (cfg.mean !== false) {
        var avg = totals.reduce(function (a, b) { return a + b; }, 0) / totals.length;
        var my = padT + ih - (avg / max) * ih;
        s.appendChild(svgEl('line', {
          x1: padL, y1: my, x2: w - padR, y2: my,
          stroke: c.ink400, 'stroke-width': 1, 'stroke-dasharray': '4 3'
        }));
        s.appendChild(txt(w - padR, my - 4, '均值 ' + fmt(avg), { anchor: 'end', fill: c.ink400 }));
      }

      labels.forEach(function (lb, i) {
        var cx = padL + step * i + step / 2;
        var acc = 0;
        series.forEach(function (se) {
          var v = se.values[i];
          var bh = (v / max) * ih;
          var y = padT + ih - acc - bh;
          s.appendChild(svgEl('rect', {
            x: cx - bw / 2, y: y, width: bw, height: Math.max(bh, 0),
            fill: se.color || c.compute, rx: 2
          }));
          acc += bh;
        });
        s.appendChild(txt(cx, padT + ih - acc - 4, fmt(totals[i], 0), { anchor: 'middle', fill: c.ink500, size: 9 }));
        s.appendChild(txt(cx, h - 6, lb, { anchor: 'middle', mono: false, size: 10 }));
      });
    });
  }

  /* ---------- 双轨图：Token 柱 + 卡时线（双轴并列） ---------- */
  function dualScale(el, cfg) {
    mount(el, function (s, w, h) {
      var c = C();
      var labels = cfg.labels, token = cfg.token, card = cfg.cardhour;
      var padL = 44, padR = 44, padT = 16, padB = 22;
      var iw = w - padL - padR, ih = h - padT - padB;
      var tMax = Math.max.apply(null, token) * 1.2 || 1;
      var cMax = Math.max.apply(null, card) * 1.3 || 1;

      [0, .5, 1].forEach(function (f) {
        var y = padT + ih - f * ih;
        s.appendChild(svgEl('line', { x1: padL, y1: y, x2: w - padR, y2: y, stroke: c.lineSoft }));
        s.appendChild(txt(padL - 6, y + 3, fmt(tMax * f, 0), { anchor: 'end', fill: c.spend }));
        s.appendChild(txt(w - padR + 6, y + 3, fmt(cMax * f, 0), { anchor: 'start', fill: c.compute }));
      });

      var step = iw / labels.length, bw = Math.min(22, step * .46);

      /* 阈值刻线 */
      if (cfg.tokenLimit) {
        var ly = padT + ih - (cfg.tokenLimit / tMax) * ih;
        s.appendChild(svgEl('line', {
          x1: padL, y1: ly, x2: w - padR, y2: ly,
          stroke: c.risk, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: .8
        }));
        s.appendChild(txt(padL + 4, ly - 4, '预警线 ' + fmt(cfg.tokenLimit, 0), { fill: c.risk, size: 9 }));
      }

      var pts = [];
      labels.forEach(function (lb, i) {
        var cx = padL + step * i + step / 2;
        var bh = (token[i] / tMax) * ih;
        s.appendChild(svgEl('rect', {
          x: cx - bw / 2, y: padT + ih - bh, width: bw, height: Math.max(bh, 0),
          fill: c.spend, rx: 2, opacity: .9
        }));
        var cy = padT + ih - (card[i] / cMax) * ih;
        pts.push([cx, cy]);
        s.appendChild(txt(cx, h - 6, lb, { anchor: 'middle', mono: false, size: 10 }));
      });

      s.appendChild(svgEl('path', {
        d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' '),
        fill: 'none', stroke: c.compute, 'stroke-width': 2, 'stroke-linejoin': 'round'
      }));
      pts.forEach(function (p) {
        s.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 2.5, fill: c.surface, stroke: c.compute, 'stroke-width': 2 }));
      });
    });
  }

  /* ---------- 额度水位环（RailGauge） ---------- */
  function ring(el, pct, state) {
    var s = svgEl('svg', { viewBox: '0 0 44 44' });
    var r = 18, len = 2 * Math.PI * r;
    s.appendChild(svgEl('circle', { class: 'raingauge__track', cx: 22, cy: 22, r: r, fill: 'none', 'stroke-width': 4 }));
    var v = svgEl('circle', {
      class: 'raingauge__value', cx: 22, cy: 22, r: r, fill: 'none', 'stroke-width': 4,
      'stroke-dasharray': len, 'stroke-dashoffset': len * (1 - Math.min(pct, 1))
    });
    s.appendChild(v);
    el.textContent = '';
    el.appendChild(s);
    var lab = document.createElement('span');
    lab.className = 'raingauge__label';
    lab.textContent = Math.round(pct * 100) + '%';
    el.appendChild(lab);
    el.dataset.state = state;
  }

  /* ---------- 节点热格（集群健康一眼可扫） ---------- */
  function nodeGrid(el, pools) {
    el.textContent = '';
    pools.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'nodegrid__pool';
      if (p.cardView) {
        var counts = { free: 0, busy: 0, warn: 0, fault: 0, isolated: 0 };
        p.cards.forEach(function (st) { counts[st] = (counts[st] || 0) + 1; });
        var used = counts.busy + counts.warn;
        var pct = Math.round(used / p.cards.length * 100);
        var parts = (p.name || '').split(' · ');
        var vendor = parts[1] || '';
        var cardTotal = parts[2] || (p.cards.length + ' 卡');
        var zone = parts[3] || '';
        var head = document.createElement('div');
        head.className = 'resource-card__head';
        head.innerHTML = '<span class="resource-card__icon">' + (vendor.indexOf('NVIDIA') >= 0 ? 'N' : '昇') + '</span>' +
          '<div class="resource-card__title"><div class="nodegrid__pool-name"></div>' +
          '<div class="resource-card__spec">' + vendor + (zone ? ' · ' + zone : '') + '</div></div>' +
          '<span class="resource-card__total">' + cardTotal + '</span>';
        head.querySelector('.nodegrid__pool-name').textContent = parts[0] || p.name;
        row.appendChild(head);

        var stats = document.createElement('div');
        stats.className = 'resource-card__stats';
        stats.innerHTML = '<div class="resource-card__stat"><b>' + counts.free + '</b><span>空闲</span></div>' +
          '<div class="resource-card__stat"><b>' + counts.busy + '</b><span>占用中</span></div>' +
          '<div class="resource-card__stat resource-card__stat--warn"><b>' + counts.warn + '</b><span>高负载</span></div>' +
          '<div class="resource-card__stat resource-card__stat--risk"><b>' + (counts.fault + counts.isolated) + '</b><span>异常 / 隔离</span></div>';
        row.appendChild(stats);

        var util = document.createElement('div');
        util.className = 'resource-card__util';
        util.innerHTML = '<div class="resource-card__util-track"><div class="resource-card__util-fill" style="width:' + pct + '%"></div></div>' +
          '<span>利用率 ' + pct + '%</span>';
        row.appendChild(util);
      }

      var nm = document.createElement('div');
      nm.className = 'nodegrid__pool-name';
      nm.textContent = p.name;
      var cells = document.createElement('div');
      cells.className = 'nodegrid__cells';
      p.cards.forEach(function (st, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'nodecell';
        b.dataset.state = st;
        b.title = (p.name || '') + ' · 卡位 ' + (i + 1) + ' · ' + ({
          free: '空闲', busy: '占用中', warn: '高负载', fault: '故障', isolated: '已隔离'
        }[st] || st);
        cells.appendChild(b);
      });
      if (p.cardView) {
        nm.setAttribute('aria-hidden', 'true');
        nm.style.display = 'none';
      }
      row.appendChild(nm);
      row.appendChild(cells);
      el.appendChild(row);
    });
  }

  /* ---------- 链路级联（时间瀑布 + 并发泳道） ---------- */
  function trace(el, cfg) {
    el.textContent = '';
    var wrap = document.createElement('div');
    wrap.className = 'trace';
    var total = cfg.total || Math.max.apply(null, cfg.lanes.map(function (l) { return l.start + l.dur; }));
    cfg.lanes.forEach(function (l) {
      var lane = document.createElement('div');
      lane.className = 'trace__lane';
      var nm = document.createElement('div');
      nm.className = 'trace__name';
      nm.textContent = l.name;
      var tr = document.createElement('div');
      tr.className = 'trace__track';
      var bar = document.createElement('div');
      bar.className = 'trace__bar';
      bar.dataset.state = l.state || 'ok';
      bar.style.left = (l.start / total * 100) + '%';
      bar.style.width = Math.max(l.dur / total * 100, 2) + '%';
      var sp = document.createElement('span');
      sp.textContent = l.dur + 'ms';
      bar.appendChild(sp);
      tr.appendChild(bar);
      lane.appendChild(nm);
      lane.appendChild(tr);
      wrap.appendChild(lane);
    });
    var ax = document.createElement('div');
    ax.className = 'trace__axis';
    [0, Math.round(total / 2), total].forEach(function (v) {
      var e = document.createElement('span'); e.textContent = v + 'ms'; ax.appendChild(e);
    });
    wrap.appendChild(ax);
    el.appendChild(wrap);
  }

  /* ---------- 图标集（几何描边，无 emoji） ---------- */
  var P = {
    apps: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    model: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
    compute: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01M12 7h4M12 17h4',
    console: 'M4 5h16v14H4zM4 9h16M9 13l2.5 2.5L16 11',
    ops: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1',
    search: 'M11 4a7 7 0 105.3 11.6L20 19M11 4a7 7 0 015.3 11.6',
    bell: 'M6 10a6 6 0 1112 0v4l1.5 2.5h-15L6 14zM10 19a2 2 0 004 0',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    list: 'M4 6h16M4 12h16M4 18h16',
    filter: 'M4 5h16l-6 7v6l-4 2v-8z',
    plus: 'M12 5v14M5 12h14',
    check: 'M5 12.5l4.5 4.5L19 7',
    chevron: 'M9 6l6 6-6 6',
    close: 'M6 6l12 12M18 6L6 18',
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
    ledger: 'M5 4h14v16H5zM9 4v16M12 8h4M12 12h4',
    bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
    clock: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    key: 'M15 4a5 5 0 11-4.6 7L4 17.4V20h3v-2h2v-2h2l1.4-1.4A5 5 0 0115 4zM16.5 7.5h.01',
    user: 'M12 4a4 4 0 100 8 4 4 0 000-8zM4 21a8 8 0 0116 0',
    down: 'M12 5v12M6 13l6 6 6-6'
  };
  function icon(name, size) {
    var d = P[name] || P.apps;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round"' + (size ? ' width="' + size + '" height="' + size + '"' : '') +
      ' aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  global.DSH = global.DSH || {};
  global.DSH.chart = {
    sparkline: sparkline, bars: bars, dualScale: dualScale,
    ring: ring, nodeGrid: nodeGrid, trace: trace, mount: mount
  };
  global.DSH.icon = icon;
})(window);
