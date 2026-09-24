# 设计契约 · 大模型智算平台原型

本文件是产出本原型任何页面的**唯一施工规范**。动手前必须按顺序读完。

## 0. 产物性质

- 高保真静态 HTML 原型，**无构建、无外部依赖、无 CDN**。
- 双击 HTML 即可在浏览器打开（`file://` 直开）。因此只能用**普通脚本**，禁止 `type="module"`。
- 工作目录：`/Users/apps/算力:token平台/zhisuan-platform/`

## 1. 必读文件（按顺序）

| 文件 | 作用 |
|---|---|
| `assets/tokens.css` | 设计令牌，逐项来自《产品设计规划》V2.1 第 10.3 章 |
| `assets/app.css` | 外壳与全部组件样式 —— 类名清单的事实来源 |
| `assets/charts.js` | `DSH.icon()` 图标、`DSH.chart.*` SVG 图表 |
| `assets/app.js` | 外壳注入 + 交互模型 + 全局演示数据 `DEMO` |
| `apps-industry.html` | **发现语域样板**（低密度、能力叙述优先）——照此结构写 |
| `console-usage.html` | **处置语域样板**（高密度、数字与状态优先）——照此结构写 |
| `../大模型智算平台-产品设计规划.md` | 需求依据，读与你页面相关的章节 |

## 2. 设计铁律

1. **结构用墨，语义用色。** 主操作按钮一律 `.btn--primary`（墨黑实心，`--ink-900`）。
   颜色**只**表达语义，不做装饰：
   - `--compute` 青绿 = 算力 / 运行时 / 健康 / 节点
   - `--spend` 琥珀 = 消耗 / 计费 / 冻结 / 预估
   - `--quota` 靛蓝 = 额度 / 可用 / 授权 / 成功
   - `--risk` 朱红 = 超支 / 告警 / 故障 / 驳回
   - `--insight` 紫罗兰 = 分析 / 次要图表系列 / 洞察
   - `--brand` 青 `#0B6E7F` **仅**用于品牌标识、当前模块指示条、焦点环。**不得用于按钮或装饰。**
2. **禁止硬编码色值。** 只用 CSS 变量（`var(--spend)`）或现成类（`.chip--spend`）。
3. **数字必须用等宽数字类**：`.num-xl` / `.num-lg` / `.num-md` / `.num-sm` / `.num`（已含 `tabular-nums`）。
4. **图标只能用 `DSH.icon('名字')`**，禁止 emoji 当功能图标。可用名：
   `apps model compute console ops search bell grid list filter plus check chevron close receipt ledger bolt clock shield key user down`
5. **禁止引入**任何字体、JS 库、CSS 框架、构建工具、外链资源。
6. **语义色的承载物必须名副其实。** 带语义色的类只能装它语义范围内的信息：
   - `.objcard__cost` 用 `--spend` 琥珀着色 → **只能放消耗 / 计价文案**（`≈0.8k Token / 次`、`输入 ¥0.004 · 千Token`）。
     授权有效期、状态说明之类与消耗无关的事实，一律改用中性的 `.t-micro`，否则等于用"消耗色"表达无关信息。
   - 同理 `.capacity__fill` 只表达容量占用，`.chip--risk` 只表达风险。
7. **卡片上的「试用」必须是 `.costbtn`。** 只要一张卡提供「试用」动作，该动作就必须自带价格
   （`<a class="costbtn costbtn--sm" href="…"><span class="costbtn__label">试用</span><span class="costbtn__est">≈0.8k Token</span></a>`）。
   纯跳转型动作（「进入」「打开」「申请授权」）不受此约束，用普通 `.btn` 即可。
   这两条已写入审计脚本，违反会直接报错。

## 3. 外壳由 `app.js` 注入 —— 不要手写导航

页面只负责 `main.stage` 的内容（与可选的 `aside.filter`）。固定骨架：

```html
<body data-module="apps" data-page="A-01" data-title="应用中心"
      data-tabs="行业应用|智能体|平台产品" data-tab="0"
      data-search="搜索应用、能力、标签" data-sort="推荐|热度|更新时间" data-view="1"
      data-register="1" data-register-value="discovery">
<div class="shell" id="shell">
  <nav class="rail" id="rail" aria-label="模块导航"></nav>
  <div class="main">
    <header class="band" id="band"></header>
    <div class="mid">
      <aside class="filter" aria-label="筛选"> …本页筛选或二级导航… </aside>
      <main class="stage" id="stage"> …本页内容… </main>
    </div>
  </div>
  <aside class="ledger" id="ledger" aria-label="消耗上下文"></aside>
</div>
<template id="band-actions">…页面带右侧控件…</template>
<template id="band-ribbon">…告警带，最多 1 条…</template>
<template id="ledger-extra">…追加账板内容…</template>
<script src="assets/charts.js"></script>
<script src="assets/app.js"></script>
</body>
```

`body` 的 `data-*` 开关：

| 属性 | 取值 | 说明 |
|---|---|---|
| `data-module` | `apps` / `models` / `compute` / `console` / `ops` | 决定窄轨高亮项 |
| `data-page` | 如 `A-01` | 页面编号，来自规划第 4 章 |
| `data-title` | 字符串 | 页面带标题 |
| `data-tabs` / `data-tab` | `A|B|C` / 索引 | 类目 Tab（应用中心用） |
| `data-register` | `1` | 显示「发现 / 处置」语域切换 |
| `data-search` | 占位符文本 | 有值才显示搜索框 |
| `data-sort` | `推荐|热度|价格` | 有值才显示排序下拉 |
| `data-view` | `1` | 显示网格/列表视图切换 |
| `data-ledger-title` | 字符串 | 账板标题 |

**不需要账板**的页面（如登录页、错误页）：把 `<aside class="ledger">` 整段去掉，并给 `.shell` 加 `no-ledger` 类。

## 4. 交互模型（规划 10.8，七条强制约定，必须在页面上体现）

| # | 约定 | 页面上的做法 |
|---|---|---|
| 1 | **预估前置** | 计费型主操作用 `.costbtn`，右侧内联预估：`<button class="costbtn"><span class="costbtn__label">开始试用</span><span class="costbtn__est">≈1.2k Token</span></button>`；提交型表单另配 `.preview` 预估卡 |
| 2 | **冻结可见** | 用 `.ticket` 三段票据，冻结量与已用量**分列**，不合并 |
| 3 | **结算回执** | 结算态票据带 `.variance` 偏差签；超 ±20% 用 `.variance--over` |
| 4 | **撤销窗口** | 长流程用 `.strip` 阶段条，并在 `.strip__meta` 写明可撤销 / 预计等待 |
| 5 | **数字是一扇门** | 任何消耗数字加 `data-receipt` 属性即可点开回执（`app.js` 已全局绑定），数字用 `<button>` 承载 |
| 6 | **不可用也是信息** | 额度 / 配额 / 授权不足时**禁止单纯置灰**：`.costbtn[data-state="short"]` 显示缺口，或按钮转风险色并写明原因与出路 |
| 7 | **键盘优先** | `⌘K` 命令面板、`⌥L` 账板、`⌥R` 回执已全局可用；表格 / 矩阵须可键盘操作 |

## 5. 可用组件类（完整清单见 `app.css`）

- **外壳**：`.shell` `.rail` `.band` `.mid` `.filter` `.stage` `.ledger`
- **页面带**：`.tabs` `.register` `.search` `.select` `.seg` `.btn`
- **筛选列**：`.filter__group` `.filter__opt` `.filter__nav` `.selected-bar`
- **容器**：`.card` `.card__head` `.card__body` `.card__foot` `.kpi` `.grid--2/3/4` `.row` `.col` `.spacer` `.divider`
- **排版**：`.t-page` `.t-section` `.t-body` `.t-meta` `.t-micro` `.t-mono` `.num-xl/lg/md/sm` `.num` `.t-strong`
- **状态**：`.chip--compute/spend/quota/risk/insight/neutral` `.chip__dot` `.tag` `.variance` `.variance--over/under`
- **账本族**：`.costbtn` `.ticket` `.ticket__phase[data-state=done|frozen|settled]` `.levelbar` `.levelbar__seg--used/frozen/avail` `.levelbar__tick` `.dualgauge` `.preview` `.kv`
- **状态族**：`.strip` `.strip__step[data-state=done|active|error]` `.strip__line` `.strip__meta` `.ribbon--spend/risk/compute`
- **资源族**：`.nodegrid` `.nodecell[data-state=free|busy|warn|fault|isolated]` `.capacity` `.capacity__fill[data-state=warn|full]` `.trace` `.matrix`
- **数据**：`.dg-wrap` `.dg-scroll` `.dg` `.dg--compact` `.dg-primary` `.dg-actions`（`th.num`/`td.num` 右对齐）
- **对象卡**：`.objgrid` `.objcard` `.objcard__top/icon/name/sub/desc/tags/foot/cost`
- **空态**：`.empty` `.empty__art`
- **浮层**：`.drawer` `.veil` `.palette`（由 `app.js` 注入，无需手写）

## 6. 图表

用 `DSH.chart.*` 渲染进一个**固定高度**的容器：

```html
<div id="chart" style="height:180px"></div>
<script>
  DSH.chart.dualScale(document.getElementById('chart'), {
    labels: [...], token: [...], cardhour: [...], tokenLimit: 1000
  });
</script>
```

可用：`DSH.chart.bars`（堆叠柱 + 均值参考线）、`DSH.chart.dualScale`（Token 柱 + 卡时线双轴）、`DSH.chart.sparkline`、`DSH.chart.nodeGrid(el, pools)`、`DSH.chart.trace(el, {total, lanes})`。

可视化规范（规划 10.6）：Token 与卡时**禁止折算到同一轴**；容量图必带均值参考线与阈值刻线；空数据明确画“无数据”而非零线；异常点加标记符而非只换颜色。

## 7. 演示数据必须自洽

`app.js` 导出了全局 `DEMO`，各页数字必须与之一致：

| 项 | 值 |
|---|---|
| 租户 / 项目 | 华鲲元启 / 视觉检索平台 |
| Token | 总额度 12,000,000 · 已用 7,420,000（61.8%）· 冻结 186,000 · 可用 4,390,000 |
| 卡时 | 总额度 5,000 · 已用 2,860（57.2%）· 冻结 42 · 可用 2,098 |
| 数值写法 | 4.39M / 186.0k / 2 098.0 / 61.8% |

金额、模型名、应用名请与样板页保持一致（Qwen3-32B-Instruct、DeepSeek-V3、InternVL2-26B、BGE-M3；写作助手、法务合同审查、视频检查、知识问答…）。

## 8. 完工验收（必做）

```bash
cd /Users/apps/算力:token平台 && node .tools/audit.mjs <你产出的页面文件名...>
```

审计会检查：JS 错误、横向溢出、元素越界、结构缺失（窄轨 / 页面带 / 主舞台 / 回执抽屉 / 命令面板 / 额度水位环）、14 项令牌跨页一致性、窄轨 64px、页面带 52px、主舞台 ≥880px、文本对比度。

**必须迭代到输出「问题 0 个」。** 不要靠肉眼判断，以审计结果为准。
