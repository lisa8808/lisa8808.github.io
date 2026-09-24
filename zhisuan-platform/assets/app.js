/* ============================================================
   大模型智算平台 · 外壳注入与交互模型
   遵循《产品设计规划》V2.1 · 10.4 / 10.5 / 10.8
   ------------------------------------------------------------
   所有页面共用同一外壳，由本文件按 <body> 上的声明式属性注入，
   以保证「窄轨 + 页面带 + 主舞台 + 账板」在 18 个页面完全一致。

   <body data-module="apps" data-page="A-01" data-title="应用中心"
         data-tabs="行业应用|智能体|平台产品" data-tab="0"
         data-register="1" data-register-value="discovery"
         data-search="搜索应用、能力、标签" data-sort="推荐|热度|价格"
         data-view="1" data-ledger="1">
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- 全站统一的演示数据（保证各页数字自洽） ---------- */
  var DEMO = {
    tenant: '华鲲元启',
    project: '视觉检索平台',
    token: { quota: 12000000, used: 7420000, frozen: 186000 },
    cardhour: { quota: 5000, used: 2860, frozen: 42 },
    receipts: [
      { time: '14:32', name: '知识问答 · 会话结算', amt: 1180, est: 1240, unit: 'Token' },
      { time: '13:07', name: '视频检查 · 批任务结算', amt: 42600, est: 40000, unit: 'Token' },
      { time: '11:48', name: '推理实例 · 卡时结算', amt: 36.5, est: 40, unit: '卡时' }
    ]
  };
  DEMO.token.avail = DEMO.token.quota - DEMO.token.used - DEMO.token.frozen;
  DEMO.cardhour.avail = DEMO.cardhour.quota - DEMO.cardhour.used - DEMO.cardhour.frozen;
  DEMO.token.pct = DEMO.token.used / DEMO.token.quota;
  global.DEMO = DEMO;

  function pctOf(a, b) { return b ? a / b : 0; }
  function kJ(n) {
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
  }
  global.DSH.fmt = { kJ: kJ, num: function (n, d) { return Number(n).toFixed(d === undefined ? 1 : d); } };

  /* ---------- 模块定义 ---------- */
  var MODULES = [
    { key: 'home',    label: '工作台', icon: 'grid',    href: 'home.html' },
    { key: 'apps',    label: '应用中心', icon: 'apps',    href: 'apps-industry.html' },
    { key: 'models',  label: '模型服务', icon: 'model',   href: 'models.html' },
    { key: 'compute', label: '算力资源', icon: 'compute', href: 'compute-overview.html' },
    { key: 'console', label: '模型商城', icon: 'console', href: 'console-usage.html', deprecated: true },
    { key: 'user',    label: '用户中心', icon: 'user',    href: 'user-center.html', referenceNotice: true }
  ];

  var SUBNAV = {
    home: [
      { title: '概览', items: [
        { page: 'G-02', label: '工作台概览', href: 'home.html', icon: 'grid' }
      ] },
      { title: '快捷入口', items: [
        { label: '最近使用', href: 'home.html', icon: 'clock' },
        { label: '设计规范', href: 'design-system.html', page: 'D4', icon: 'ledger' }
      ] }
    ],
    apps: [
      { title: '应用发现', items: [
        { page: 'A-01', label: '行业应用', href: 'apps-industry.html', icon: 'apps' },
        { page: 'A-02', label: '智能体', href: 'apps-agents.html', icon: 'bolt' },
        { page: 'A-03', label: '平台产品', href: 'apps-products.html', icon: 'grid' }
      ] }
    ],
    models: [
      { title: '模型服务', items: [
        { page: 'M-01', label: '模型广场', href: 'models.html', icon: 'model' },
        { page: 'M-02', label: '模型详情', href: 'model-detail.html', icon: 'ledger' }
      ] },
      { title: '资产管理', items: [
        { label: '我的模型', href: 'models.html?register=operation', icon: 'shield' },
        { label: '服务实例', href: 'models.html?register=operation', icon: 'compute' }
      ] }
    ],
    compute: [
      { title: '算力资源', items: [
        { page: 'R-01', label: '资源看板', href: 'compute-overview.html', icon: 'compute' },
        { label: '我的实例', href: 'compute-overview.html#instances', icon: 'console' },
        { label: '调度任务', href: 'compute-overview.html#tasks', icon: 'clock' }
      ] },
      { title: '资源管理', items: [
        { label: '算力池', href: 'compute-overview.html#pools', icon: 'grid' },
        { label: '存储空间', href: 'compute-overview.html#storage', icon: 'ledger' }
      ] }
    ],
    console: [
      { title: '费用与用量', items: [
        { page: 'C-01', label: '用量概览', href: 'console-usage.html', icon: 'grid' },
        { page: 'C-02', label: '预算与配额', href: 'console-quota.html', icon: 'ledger' },
        { page: 'C-03', label: '消耗明细', href: 'console-consumption.html', icon: 'receipt' }
      ] },
      { title: '开发与治理', items: [
        { page: 'C-05', label: 'API 密钥', href: 'console-keys.html', icon: 'key' },
        { page: 'C-07', label: '调用日志', href: 'console-logs.html', icon: 'console' },
        { label: '告警中心', href: 'console-quota.html#alerts', icon: 'bell' }
      ] }
    ],
    user: [
      { title: '账号管理', items: [
        { page: 'U-01', label: '个人资料', href: 'user-center.html', icon: 'user' },
        { label: '安全设置', href: 'user-center.html#security', icon: 'shield' }
      ] },
      { title: '组织与权限', items: [
        { label: '组织成员', href: 'user-center.html#members', icon: 'apps' },
        { label: '角色权限', href: 'user-center.html#roles', icon: 'key' }
      ] }
    ]
  };

  var ATTR = function (n, d) { return document.body.dataset[n] !== undefined ? document.body.dataset[n] : d; };

  function primaryFor(cur, page) {
    if (page === 'G-02' || page === 'D4') return 'home';
    return cur;
  }

  /* ---------- 顶部一级导航 ---------- */
  function buildRail(cur, page) {
    var primary = primaryFor(cur, page);
    var h = '<a class="skip-link" href="#stage">跳到主要内容</a>' +
      '<a class="rail__brand" href="home.html" aria-label="元启saas首页">' +
      '<span class="rail__brand-mark">元</span><span class="rail__brand-name">元启saas</span></a>' +
      '<div class="rail__primary">';
    MODULES.forEach(function (m) {
      if (m.key === 'home' || m.key === 'models') return;
      var on = m.key === primary;
      h += '<a class="rail__item" href="' + m.href + '"' + (on ? ' aria-current="page"' : '') +
           (m.deprecated ? ' data-deprecated-route="model-market"' : '') +
           (m.referenceNotice ? ' data-user-center-reference' : '') +
           '>' + global.DSH.icon(m.icon) + '<span>' + m.label + '</span></a>';
    });
    h += '</div><div class="rail__spacer"></div>' +
      '<button class="rail__search" id="commandSearch" type="button" aria-label="打开全局搜索">' +
        global.DSH.icon('search') + '<span>搜索</span><kbd>⌘ K</kbd></button>' +
      '<div class="rail__divider"></div>' +
      '<button class="raingauge" id="railGauge" type="button" aria-label="项目额度水位，点击展开账板"></button>' +
      '<button class="rail__action" type="button" id="railReceipt" title="最近回执（⌥R）" aria-label="查看最近回执">' +
        global.DSH.icon('receipt') + '<span class="rail__badge">3</span></button>' +
      '<div class="rail__profile"><span class="rail__avatar">华</span>' +
        '<span class="rail__profile-copy"><b>' + DEMO.tenant + '</b><small>租户管理员</small></span>' +
        global.DSH.icon('chevron') + '</div>';
    return h;
  }

  /* ---------- 左侧二级导航 ---------- */
  function buildSubnav(cur, page) {
    var primary = primaryFor(cur, page);
    var mod = MODULES.filter(function (m) { return m.key === primary; })[0] || MODULES[0];
    var groups = SUBNAV[primary] || [];
    var h = '<aside class="subnav" id="subnav" aria-label="' + mod.label + '二级导航">' +
      '<div class="subnav__context"><span class="subnav__context-icon">' + global.DSH.icon(mod.icon) + '</span>' +
      '<div><span>当前模块</span><strong>' + mod.label + '</strong></div></div>';
    groups.forEach(function (group) {
      h += '<div class="subnav__group"><h2>' + group.title + '</h2>';
      group.items.forEach(function (item) {
        var on = item.page === page;
        h += '<a class="subnav__item" href="' + item.href + '"' + (on ? ' aria-current="page"' : '') + '>' +
          global.DSH.icon(item.icon) + '<span>' + item.label + '</span>' + (on ? '<i></i>' : '') + '</a>';
      });
      h += '</div>';
    });
    h += '<div class="subnav__spacer"></div><div class="subnav__help">' + global.DSH.icon('shield') +
      '<div><strong>企业服务在线</strong><span>安全运行 128 天</span></div></div></aside>';
    return h;
  }

  function buildModuleTabs(primary, page) {
    if (primary !== 'apps') return '';
    var items = [
      { page: 'A-01', label: '行业应用', href: 'apps-industry.html' },
      { page: 'A-02', label: '智能体', href: 'apps-agents.html' },
      { page: 'A-03', label: '平台产品', href: 'apps-products.html' }
    ];
    return '<nav class="module-tabs" aria-label="应用中心分类">' +
      items.map(function (item) {
        return '<a href="' + item.href + '"' + (item.page === page ? ' aria-current="page"' : '') + '>' +
          item.label + '</a>';
      }).join('') + '</nav>';
  }

  /* ---------- 页面带 ---------- */
  function buildBand() {
    var title = ATTR('title', '');
    var page = ATTR('page', '');
    var primary = primaryFor(ATTR('module', 'apps'), page);
    var mod = MODULES.filter(function (m) { return m.key === primary; })[0] || MODULES[0];
    var h = '<div class="band__title"><div>';
    h += '<div class="band__eyebrow">' + mod.label + '<span>/</span>' + page + '</div>';
    if (title) h += '<h1>' + title + '</h1>';
    h += '</div></div>';
    h += '<div class="band__spacer"></div>';

    if (ATTR('register', '0') === '1') {
      var rv = ATTR('register-value', 'discovery');
      h += '<div class="register" role="group" aria-label="语域切换">' +
        '<button data-register-btn="discovery" aria-pressed="' + (rv === 'discovery') + '">发现</button>' +
        '<button data-register-btn="operation" aria-pressed="' + (rv === 'operation') + '">处置</button></div>';
    }
    var search = ATTR('search', '');
    if (search) {
      h += '<label class="search">' + global.DSH.icon('search') +
        '<input class="input" type="search" placeholder="' + search + '" aria-label="搜索"></label>';
    }
    var sort = ATTR('sort', '');
    if (sort) {
      h += '<select class="select" aria-label="排序">' +
        sort.split('|').map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select>';
    }
    if (ATTR('view', '0') === '1') {
      h += '<div class="seg" role="group" aria-label="视图切换">' +
        '<button aria-pressed="true" title="卡片视图">' + global.DSH.icon('grid') + '</button>' +
        '<button aria-pressed="false" title="列表视图">' + global.DSH.icon('list') + '</button></div>';
    }
    var tpl = document.getElementById('band-actions');
    if (tpl) h += tpl.innerHTML;
    return h;
  }

  /* ---------- 账板 ---------- */
  function buildLedger() {
    var extra = document.getElementById('ledger-extra');
    var t = DEMO.token, ch = DEMO.cardhour;
    var h = '<div class="ledger__head"><h2>' + ATTR('ledger-title', '消耗上下文') + '</h2>' +
      '<button class="btn btn--sm btn--ghost" id="ledgerToggle" title="折叠账板（⌥L）">' +
      global.DSH.icon('close') + '</button></div>' +
      '<span class="ledger__spine">消 耗 上 下 文</span>' +
      '<div class="ledger__body">';

    h += '<div class="ledger__sec"><h3>当前项目</h3>' +
      '<select class="select w-full" aria-label="切换项目"><option>' + DEMO.project + '</option>' +
      '<option>合同审查</option><option>标书撰写</option></select></div>';

    h += '<div class="ledger__sec"><h3>Token 额度水位</h3>' +
      levelBar(t.used, t.frozen, t.avail, t.quota, 'Token') +
      '<div class="row mt-3" style="gap:var(--sp-2)">' +
      '<span class="num-lg">' + kJ(t.avail) + '</span><span class="t-micro">可用 / 共 ' + kJ(t.quota) + '</span></div></div>';

    h += '<div class="ledger__sec"><h3>双轨计量</h3><div class="dualgauge">' +
      gaugeRow('Token 已用', t.used, t.quota, 'spend') +
      gaugeRow('卡时 已用', ch.used, ch.quota, 'compute') +
      '</div>' +
      '<div class="t-micro mt-3">两轨单位不可换算，故并列呈现（10.1）</div></div>';

    h += '<div class="ledger__sec"><h3>本页计费动作</h3>' +
      '<div class="ticket"><div class="ticket__phases">' +
      '<div class="ticket__phase" data-state="done"><h4>预估</h4><div class="amt">1.24k</div></div>' +
      '<div class="ticket__phase" data-state="frozen"><h4>冻结中</h4><div class="amt">0.19k</div></div>' +
      '<div class="ticket__phase"><h4>已结算</h4><div class="amt">—</div></div>' +
      '</div><div class="ticket__foot"><span>预估来源：Token 银行费率接口</span></div></div></div>';

    if (extra) h += '<div class="ledger__sec">' + extra.innerHTML + '</div>';

    h += '<div class="ledger__sec"><h3>最近回执</h3><div class="col" style="gap:var(--sp-2)">' +
      DEMO.receipts.map(function (r) {
        var dev = (r.amt - r.est) / r.est * 100;
        var cls = Math.abs(dev) > 20 ? 'variance variance--over' : 'variance variance--under';
        return '<button class="row clickable" style="gap:var(--sp-2);background:none;border:0;padding:0;text-align:left;width:100%" data-receipt>' +
          '<span class="t-micro" style="width:34px">' + r.time + '</span>' +
          '<span class="t-meta" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + r.name + '</span>' +
          '<span class="' + cls + '">' + (dev >= 0 ? '+' : '') + dev.toFixed(1) + '%</span></button>';
      }).join('') + '</div>' +
      '<button class="btn btn--sm w-full mt-3" data-receipt>查看全部回执</button></div>';

    h += '</div>';
    return h;
  }
  function levelBar(used, frozen, avail, quota, unit) {
    var p = function (v) { return (v / quota * 100).toFixed(2) + '%'; };
    return '<div class="levelbar"><div class="levelbar__track">' +
      '<div class="levelbar__seg levelbar__seg--used" style="width:' + p(used) + '"></div>' +
      '<div class="levelbar__seg levelbar__seg--frozen" style="width:' + p(frozen) + '"></div>' +
      '<div class="levelbar__seg levelbar__seg--avail" style="width:' + p(avail) + '"></div>' +
      '</div><div class="levelbar__tick" style="left:80%"></div>' +
      '<div class="levelbar__tick levelbar__tick--limit" style="left:100%"></div>' +
      '<div class="levelbar__legend">' +
      '<span><i style="background:var(--ink-700)"></i>已用 ' + kJ(used) + '</span>' +
      '<span><i style="background:var(--spend)"></i>冻结 ' + kJ(frozen) + '</span>' +
      '<span><i style="background:var(--quota)"></i>可用 ' + kJ(avail) + '</span>' +
      '</div></div>';
  }
  function gaugeRow(label, v, q, kind) {
    var p = Math.min(v / q * 100, 100);
    return '<div class="dualgauge__row"><span class="dualgauge__name">' + label + '</span>' +
      '<div class="capacity"><div class="capacity__track"><div class="capacity__fill" style="width:' + p +
      '%;background:var(--' + kind + ')"></div></div></div>' +
      '<span class="dualgauge__val">' + kJ(v) + ' / ' + kJ(q) + '</span></div>';
  }

  /* ---------- 浮层：回执抽屉 + 命令面板 ---------- */
  function buildOverlays() {
    var r = DEMO.receipts[0];
    var dev = (r.amt - r.est) / r.est * 100;
    return '' +
      '<div class="drawer" id="receiptDrawer" data-open="false" role="dialog" aria-label="消耗回执">' +
        '<div class="drawer__head"><h2>消耗回执</h2>' +
        '<button class="btn btn--sm btn--ghost" data-close-receipt aria-label="关闭">' + global.DSH.icon('close') + '</button></div>' +
        '<div class="drawer__body">' +
          '<div class="ticket"><div class="ticket__phases">' +
            '<div class="ticket__phase" data-state="done"><h4>预估</h4><div class="amt">' + kJ(r.est) + '</div></div>' +
            '<div class="ticket__phase" data-state="done"><h4>冻结</h4><div class="amt">' + kJ(r.est) + '</div></div>' +
            '<div class="ticket__phase" data-state="settled"><h4>结算</h4><div class="amt">' + kJ(r.amt) + '</div></div>' +
          '</div><div class="ticket__foot"><span>偏差</span>' +
            '<span class="variance variance--under">低于预估 ' + Math.abs(dev).toFixed(1) + '%</span>' +
            '<span class="spacer"></span><span>已解冻返还 ' + kJ(r.est - r.amt) + '</span></div></div>' +
          '<dl class="kv">' +
            '<dt>时间</dt><dd class="num">2026-09-24 14:32:07</dd>' +
            '<dt>对象</dt><dd>知识问答 · 智能体会话</dd>' +
            '<dt>项目</dt><dd>' + DEMO.project + '</dd>' +
            '<dt>模型</dt><dd>Qwen3-32B-Instruct</dd>' +
            '<dt>trace_id</dt><dd class="num">tr_8f3a91c4e7</dd>' +
            '<dt>单价</dt><dd class="num">输入 0.004 / 输出 0.012 元·千Token</dd>' +
            '<dt>用量</dt><dd class="num">输入 21.4k · 输出 6.8k Token</dd>' +
            '<dt>结算</dt><dd class="num">' + kJ(r.amt) + ' Token</dd>' +
          '</dl>' +
          '<div class="card"><div class="card__head"><h3>工具调用链路</h3>' +
            '<span class="chip chip--compute"><i class="chip__dot"></i>4 节点 · 1 次重试</span></div>' +
            '<div class="card__body" id="receiptTrace"></div></div>' +
          '<button class="btn w-full">下钻到消耗明细</button>' +
        '</div></div>' +
      '<div class="veil" id="paletteVeil" data-open="false" role="dialog" aria-label="命令面板">' +
        '<div class="palette"><input class="palette__input" id="paletteInput" placeholder="搜索页面、对象或动作…" aria-label="命令面板输入">' +
        '<div class="palette__list" id="paletteList"></div></div></div>' +
      '<div class="veil notice-veil" id="deprecatedMarketVeil" data-open="false" role="dialog" aria-modal="true" aria-labelledby="deprecatedMarketTitle">' +
        '<section class="notice-modal">' +
          '<div class="notice-modal__head"><span class="notice-modal__icon">' + global.DSH.icon('shield') + '</span>' +
            '<div><span class="notice-modal__eyebrow">MODEL MARKETPLACE</span><h2 id="deprecatedMarketTitle">当前页面已作废</h2></div>' +
            '<button class="btn btn--icon btn--ghost" type="button" data-close-market aria-label="关闭提示">' + global.DSH.icon('close') + '</button></div>' +
          '<div class="notice-modal__body">' +
            '<p>模型商城旧版页面不再继续建设，后续方案按以下原则重新实现：</p>' +
            '<div class="notice-plan"><div><span>前端基线</span><strong>采用 GetAI 的界面与交互设计</strong></div>' +
              '<div><span>后端基线</span><strong>采用 NewAPI 的服务与接口设计</strong></div></div>' +
            '<div class="notice-rule"><b>裁剪原则</b><p>尽量裁剪非核心能力，只保留模型展示、渠道管理、Key 管理、额度与路由所需的最小闭环。</p></div>' +
            '<div class="notice-rule notice-rule--key"><b>关键设计约束</b><p>需要重点考虑渠道 Key 与用户 Key 的动态分发映射：根据用户、模型、渠道状态、额度与路由策略，动态选择可用渠道 Key，并保留映射关系和调用追溯。</p></div>' +
            '<div class="notice-flow" aria-label="Key 动态分发映射流程"><span>用户 Key</span><i>→</i><span>动态路由与映射</span><i>→</i><span>渠道 Key</span></div>' +
          '</div>' +
          '<div class="notice-modal__foot"><span>该入口暂不跳转至旧页面</span><button class="btn btn--primary" type="button" data-close-market>我知道了</button></div>' +
        '</section></div>' +
      '<div class="veil notice-veil" id="userCenterNoticeVeil" data-open="false" role="dialog" aria-modal="true" aria-labelledby="userCenterNoticeTitle">' +
        '<section class="notice-modal">' +
          '<div class="notice-modal__head"><span class="notice-modal__icon">' + global.DSH.icon('user') + '</span>' +
            '<div><span class="notice-modal__eyebrow">USER MANAGEMENT</span><h2 id="userCenterNoticeTitle">设计参考提示</h2></div>' +
            '<button class="btn btn--icon btn--ghost" type="button" data-close-user-notice aria-label="关闭提示">' + global.DSH.icon('close') + '</button></div>' +
          '<div class="notice-modal__body">' +
            '<p>用户中心的用户与成员管理，参考 NewAPI 的用户成员管理设计。</p>' +
          '</div>' +
          '<div class="notice-modal__foot"><span>该入口暂不跳转</span><button class="btn btn--primary" type="button" data-close-user-notice>我知道了</button></div>' +
        '</section></div>' +
      '<div class="minw-note"><div><div class="t-page">请使用更宽的窗口</div>' +
        '<p class="t-meta mt-2">本平台面向桌面端内部后台，最小支持宽度 1200px。</p></div></div>';
  }

  var PALETTE = [
    { t: '应用中心 · 行业应用', g: '页面', h: 'apps-industry.html' },
    { t: '应用中心 · 智能体', g: '页面', h: 'apps-agents.html' },
    { t: '应用交互工作台', g: '页面', h: 'app-console.html' },
    { t: '模型广场', g: '页面', h: 'models.html' },
    { t: '资源看板', g: '页面', h: 'compute-overview.html' },
    { t: '用量概览', g: '页面', h: 'console-usage.html' },
    { t: '预算与配额管理', g: '页面', h: 'console-quota.html' },
    { t: '消耗明细查询', g: '页面', h: 'console-consumption.html' },
    { t: '调用日志与审计', g: '页面', h: 'console-logs.html' },
    { t: '用户中心', g: '页面', h: 'user-center.html' },
    { t: '设计系统', g: '页面', h: 'design-system.html' },
    { t: 'Qwen3-32B-Instruct', g: '模型', h: 'model-detail.html' },
    { t: '视觉检索 · 视频检查智能体', g: '应用', h: 'app-detail.html' }
  ];

  /* ---------- 注入 ---------- */
  function inject() {
    var cur = ATTR('module', 'apps');
    var page = ATTR('page', '');
    var primary = primaryFor(cur, page);
    var shell = document.getElementById('shell');
    if (!shell) return;
    if (primary === 'models' || primary === 'apps') shell.classList.add('no-subnav');

    var rail = document.getElementById('rail');
    if (rail) {
      rail.innerHTML = buildRail(cur, page);
      if (primary !== 'models' && primary !== 'apps') rail.insertAdjacentHTML('afterend', buildSubnav(cur, page));
    }
    if (primary === 'console') {
      var duplicateConsoleNav = document.querySelector('.filter__group:first-child > h3');
      if (duplicateConsoleNav && duplicateConsoleNav.textContent.trim() === '控制中心') {
        duplicateConsoleNav.parentElement.remove();
      }
    }
    var band = document.getElementById('band');
    if (band) {
      band.innerHTML = buildBand();
      var moduleTabs = buildModuleTabs(primary, page);
      if (moduleTabs) band.insertAdjacentHTML('afterend', moduleTabs);
    }
    /* 告警带插槽：位于页面带下方，同屏最多 1 条（10.4.2） */
    var rib = document.getElementById('band-ribbon');
    if (rib && band && rib.innerHTML.trim()) band.insertAdjacentHTML('afterend', rib.innerHTML);
    var ledger = document.getElementById('ledger');
    if (ledger) ledger.innerHTML = buildLedger();

    document.body.insertAdjacentHTML('beforeend', buildOverlays());

    /* 额度水位环 */
    var g = document.getElementById('railGauge');
    if (g) {
      var st = DEMO.token.pct >= 1 ? 'empty' : DEMO.token.pct >= .9 ? 'warn' : DEMO.token.pct >= .6 ? 'watch' : 'ok';
      global.DSH.chart.ring(g, DEMO.token.pct, st);
      g.addEventListener('click', function () { toggleLedger(true); });
    }
    var rr = document.getElementById('railReceipt');
    if (rr) rr.addEventListener('click', function () { toggleReceipt(true); });
    var cs = document.getElementById('commandSearch');
    if (cs) cs.addEventListener('click', function () { togglePalette(true); });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-deprecated-route="model-market"]')) {
        e.preventDefault();
        toggleDeprecatedMarket(true);
      }
      if (e.target.closest('[data-close-market]')) toggleDeprecatedMarket(false);
      if (e.target.closest('[data-user-center-reference]')) {
        e.preventDefault();
        toggleUserCenterNotice(true);
      }
      if (e.target.closest('[data-close-user-notice]')) toggleUserCenterNotice(false);
    });
    var marketVeil = document.getElementById('deprecatedMarketVeil');
    if (marketVeil) marketVeil.addEventListener('click', function (e) {
      if (e.target === marketVeil) toggleDeprecatedMarket(false);
    });
    var userCenterNoticeVeil = document.getElementById('userCenterNoticeVeil');
    if (userCenterNoticeVeil) userCenterNoticeVeil.addEventListener('click', function (e) {
      if (e.target === userCenterNoticeVeil) toggleUserCenterNotice(false);
    });

    /* 折叠/展开账板（⌥L） */
    var lg = document.getElementById('ledgerToggle');
    if (lg) lg.addEventListener('click', function () { toggleLedger(false); });
    var ledgerEl = document.querySelector('.ledger');
    if (ledgerEl) ledgerEl.addEventListener('click', function (e) {
      if (shell.classList.contains('ledger-collapsed') && !e.target.closest('.ledger__head')) toggleLedger(true);
    });

    /* 回执抽屉 */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-receipt]')) { e.preventDefault(); toggleReceipt(true); }
      if (e.target.closest('[data-close-receipt]')) toggleReceipt(false);
    });

    /* 命令面板 */
    var veil = document.getElementById('paletteVeil');
    if (veil) {
      var input = document.getElementById('paletteInput');
      var list = document.getElementById('paletteList');
      function renderPalette(q) {
        var items = PALETTE.filter(function (p) { return !q || p.t.toLowerCase().indexOf(q.toLowerCase()) >= 0; });
        list.innerHTML = items.map(function (p, i) {
          return '<a class="palette__item" href="' + p.h + '" data-active="' + (i === 0) + '">' +
            '<span>' + p.t + '</span><span class="grp">' + p.g + '</span></a>';
        }).join('') || '<div class="palette__item"><span class="k">无匹配结果</span></div>';
      }
      renderPalette('');
      input.addEventListener('input', function () { renderPalette(input.value); });
      veil.addEventListener('click', function (e) { if (e.target === veil) togglePalette(false); });
    }

    /* 键盘优先（10.8 约定 7） */
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); togglePalette(true); }
      else if (e.altKey && e.key.toLowerCase() === 'l') { e.preventDefault(); toggleLedger(); }
      else if (e.altKey && e.key.toLowerCase() === 'r') { e.preventDefault(); toggleReceipt(true); }
      else if (e.key === 'Escape') { togglePalette(false); toggleReceipt(false); toggleDeprecatedMarket(false); toggleUserCenterNotice(false); }
    });

    /* 语域切换（写入 URL 参数，可分享） */
    Array.prototype.forEach.call(document.querySelectorAll('[data-register-btn]'), function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-register-btn]'), function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        var url = new URL(location.href);
        url.searchParams.set('register', b.dataset.registerBtn);
        history.replaceState(null, '', url);
        document.documentElement.dataset.register = b.dataset.registerBtn;
      });
    });

    /* 回执里的链路级联 */
    var rt = document.getElementById('receiptTrace');
    if (rt && global.DSH.chart.trace) {
      global.DSH.chart.trace(rt, {
        total: 4200,
        lanes: [
          { name: '规划推理 · Qwen3-32B', start: 0, dur: 820 },
          { name: '知识库检索 · RAG', start: 840, dur: 1180 },
          { name: '工具 · 视觉检测API', start: 1000, dur: 2400, state: 'slow' },
          { name: '工具 · 结构化抽取', start: 2100, dur: 760, state: 'fail' },
          { name: '汇总推理 · Qwen3-32B', start: 3450, dur: 700 }
        ]
      });
    }
  }

  /* 账板默认展开；折叠时收成 48px 竖条（⌥L / 头部关闭按钮切换） */
  function toggleLedger(expand) {
    var shell = document.getElementById('shell');
    if (!shell) return;
    if (expand === true) shell.classList.remove('ledger-collapsed');
    else if (expand === false) shell.classList.add('ledger-collapsed');
    else shell.classList.toggle('ledger-collapsed');
  }
  function toggleReceipt(open) {
    var d = document.getElementById('receiptDrawer');
    if (d) d.dataset.open = String(open);
  }
  function togglePalette(open) {
    var v = document.getElementById('paletteVeil');
    if (!v) return;
    v.dataset.open = String(open);
    if (open) setTimeout(function () { document.getElementById('paletteInput').focus(); }, 30);
  }
  function toggleDeprecatedMarket(open) {
    var v = document.getElementById('deprecatedMarketVeil');
    if (!v) return;
    v.dataset.open = String(open);
    if (open) setTimeout(function () {
      var close = v.querySelector('[data-close-market]');
      if (close) close.focus();
    }, 30);
  }
  function toggleUserCenterNotice(open) {
    var v = document.getElementById('userCenterNoticeVeil');
    if (!v) return;
    v.dataset.open = String(open);
    if (open) setTimeout(function () {
      var close = v.querySelector('[data-close-user-notice]');
      if (close) close.focus();
    }, 30);
  }
  global.DSH.ui = { toggleLedger: toggleLedger, toggleReceipt: toggleReceipt, togglePalette: togglePalette, toggleDeprecatedMarket: toggleDeprecatedMarket, toggleUserCenterNotice: toggleUserCenterNotice };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})(window);
