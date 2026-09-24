const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const demoRoot = path.join(__dirname, '..');

test('标前评估详情页复用技术标内容并加载标前评估 Tab', () => {
  const technicalHtml = fs.readFileSync(path.join(demoRoot, 'technical-detail-active.html'), 'utf8')
    .replace(/\.\/assets\/result-panel-figma\.css\?v=[^"]+/, './assets/result-panel-figma.css')
    .replace(/\.\/assets\/tender-interpretation-modal\.css\?v=[^"]+/, './assets/tender-interpretation-modal.css')
    .replace(/\.\/assets\/tender-interpretation-modal\.js\?v=[^"]+/, './assets/tender-interpretation-modal.js')
    .replace(/\.\/assets\/tender-outline-modal\.js\?v=[^"]+/, './assets/tender-outline-modal.js')
    .replace(/\.\/assets\/tender-outline-modal\.css\?v=[^"]+/, './assets/tender-outline-modal.css')
    .replace('    <link rel="stylesheet" href="./assets/deviation-response-modal.css" />\n', '')
    .replace('    <script defer src="./assets/deviation-response-config.js"></script>\n', '')
    .replace(/    <script defer src="\.\/assets\/deviation-response-modal\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/technical-body-config-modal\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/technical-outline-result-modal\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/technical-body-result-modal\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-body-config-modal\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-outline-result-modal\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-body-result-modal\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-quick-generation-feedback\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/technical-processing-task-actions\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/technical-response-requirements\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/active-built-in-prompt-entries\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-processing-task-actions\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-interpretation-task\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-result-naming\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/generated-record-actions\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <script defer src="\.\/assets\/generated-record-actions\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/project-overview-doc\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/tender-score-doc\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/tender-source-doc\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-file-content\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/technical-response-requirements\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/active-built-in-prompt-entries\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace('    <link rel="stylesheet" href="./assets/technical-detail-tabs.css" />\n', '')
    .replace('    <script defer src="./assets/mode-tab-links.js"></script>\n', '');
  const interpretationHtml = fs.readFileSync(path.join(demoRoot, 'interpretation-detail-active.html'), 'utf8');

  assert.match(interpretationHtml, /class="interpretation-mode-page"/);
  assert.match(interpretationHtml, /assets\/interpretation-mode-tabs\.js/);
  assert.match(interpretationHtml, /assets\/interpretation-mode-actions\.js/);
  assert.match(interpretationHtml, /assets\/prebid-evaluation-modal\.css/);
  assert.match(interpretationHtml, /assets\/prebid-evaluation-modal\.js/);
  assert.match(interpretationHtml, /assets\/tender-source-doc\.js/);
  assert.match(interpretationHtml, /assets\/project-overview-doc\.js/);
  assert.match(interpretationHtml, /assets\/tender-score-doc\.js/);
  assert.match(interpretationHtml, /assets\/detail-active-dX2M24J1\.js/);

  const normalize = (html) => html
    .replace(/\.\/assets\/result-panel-figma\.css\?v=[^"]+/, './assets/result-panel-figma.css')
    .replace(/\.\/assets\/tender-interpretation-modal\.js\?v=[^"]+/, './assets/tender-interpretation-modal.js')
    .replace(/\.\/assets\/tender-outline-modal\.js\?v=[^"]+/, './assets/tender-outline-modal.js')
    .replace(/\.\/assets\/tender-outline-modal\.css\?v=[^"]+/, './assets/tender-outline-modal.css')
    .replaceAll('assets/interpretation-company-selector', 'assets/technical-company-selector')
    .replace(/    <script defer src="\.\/assets\/interpretation-mode-tabs\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/interpretation-mode-actions\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/interpretation-conversation-demo\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace('    <script defer src="./assets/mode-tab-links.js"></script>\n', '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/prebid-assessment-result-modal\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <script defer src="\.\/assets\/prebid-assessment-result-modal\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/prebid-evaluation-modal\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace(/    <script defer src="\.\/assets\/tender-source-doc\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/project-overview-doc\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/tender-score-doc\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace(/    <script defer src="\.\/assets\/prebid-evaluation-modal\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
    .replace('    <link rel="stylesheet" href="./assets/interpretation-detail-tabs.css" />\n', '')
    .replace(/    <link rel="stylesheet" href="\.\/assets\/interpretation-conversation-config\.css(?:\?v=[^"]+)?" \/>\n/, '')
    .replace('  <body class="interpretation-mode-page">', '  <body>');
  assert.equal(normalize(interpretationHtml), technicalHtml.replace('  <body class="technical-mode-page">', '  <body>'));
});

test('点击标书要点解读记录打开近全屏解读弹窗且不接管投标自评记录', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(source, /RESULT_PREFIX\s*=\s*['"]标书要点解读_['"]/);
  assert.match(source, /<h2 id="prebidEvaluationTitle">标书要点解读<\/h2>/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(source, />立即评估<\/button>/);
  assert.match(source, /项目基础信息/);
  assert.match(source, /时间与递交约束/);
  assert.match(source, /投标人资格要求/);
  assert.match(source, /★号及不允许偏离项/);
  assert.match(source, /明确废标约束/);
  assert.match(source, /项目与评分解析/);
  assert.match(source, /项目与评分解析[\s\S]*项目概述[\s\S]*评分项/);
  assert.doesNotMatch(source, /原文位置/);
  assert.doesNotMatch(source, /可以投|不能投|有条件可投/);
  assert.match(
    css,
    /\.prebid-evaluation-modal\s*\{[^}]*width:\s*min\(1440px, calc\(100vw - 32px\)\);[^}]*height:\s*calc\(100vh - 32px\);/s,
  );

  const customScriptIndex = fs.readFileSync(path.join(demoRoot, 'interpretation-detail-active.html'), 'utf8')
    .indexOf('prebid-evaluation-modal.js');
  const legacyScriptIndex = fs.readFileSync(path.join(demoRoot, 'interpretation-detail-active.html'), 'utf8')
    .indexOf('tender-interpretation-modal.js');
  assert.ok(customScriptIndex < legacyScriptIndex, '新弹窗应先注册点击事件，避免旧解读弹窗抢先打开');

  const deviationHtml = fs.readFileSync(path.join(demoRoot, 'deviation-detail-active.html'), 'utf8');
  assert.match(deviationHtml, /assets\/tender-source-doc\.js/);
  assert.match(deviationHtml, /assets\/prebid-evaluation-modal\.js/);
});

test('标前评估已生成记录打开独立结果弹窗并按第二阶段四模块评估', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-assessment-result-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-assessment-result-modal.css'), 'utf8');
  const html = fs.readFileSync(path.join(demoRoot, 'interpretation-detail-active.html'), 'utf8');

  assert.match(html, /prebid-assessment-result-modal\.css/);
  assert.match(html, /prebid-assessment-result-modal\.js/);
  assert.match(source, /const PREFIX = '投标符合性自评_'/);
  assert.match(source, /prebid-assessment-result-title|prebidAssessmentResultTitle/);
  assert.match(source, />投标符合性自评<\/h2>/);
  assert.match(source, /招标文件原文/);
  assert.match(source, /评估企业/);
  assert.match(source, /时间与递交约束/);
  assert.match(source, /投标人资格要求/);
  assert.match(source, /★号及不允许偏离项/);
  assert.match(source, /明确废标约束/);
  assert.match(source, /评估结果：/);
  assert.match(source, /竞争数量无法预判/);
  assert.match(source, /报价规则<\/strong><span class="assessment-status risk">风险提示/);
  assert.doesNotMatch(source, /暂不判断/);
  assert.match(source, /招标文件-某高校高性能计算GPU集群建设项目\.docx/);
  assert.match(source, /共 22 项/);
  assert.match(source, /window\.tenderSourceDocument/);
  assert.match(source, /window\.tenderProjectOverview/);
  assert.match(source, /window\.tenderScoreStandard/);
  for (const label of ['投标截止时间', '递交地点', '投标有效期', '文件份数', '独立法人', '财务制度', '信用查询', '14 项★技术指标', '管理服务器机箱高度', '报价不超限价', '缺项漏项', '虚假材料']) {
    assert.ok(source.includes(label), `评估模块缺少条目：${label}`);
  }
  assert.match(source, /const filterCounts = \{ timeline: \[4, 0, 1, 1, 2\]/);
  assert.match(source, /const bidDeadline = new Date\('2025-07-31T09:30:00\+08:00'\)/);
  assert.match(source, /const deadlineTone = deadlinePassed \? 'bad'/);
  assert.match(source, /class="assessment-basis"/);
  assert.match(source, /class="assessment-verdict\$\{deadlinePassed \? ' is-bad' : ' is-ok'\}"/);
  assert.match(source, /data-source="\$\{esc\(source\)\}"/);
  assert.doesNotMatch(source, /\$\{sourceHtml\}/);
  assert.match(source, /assessment-user-mark" \$\{manuallyMarked \? '' : 'hidden'\}/);
  assert.match(source, /item\.hidden = value !== 'all' && item\.dataset\.assessmentStatus !== value/);
  assert.match(css, /\.assessment-result-content \[data-assessment-status\]\[hidden\][\s\S]*?display:\s*none/);
  assert.match(css, /\.assessment-result-content \[data-assessment-non-status\]\[hidden\][\s\S]*?display:\s*none/);
  assert.match(source, /data-tooltip=/);
  assert.match(css, /\.assessment-user-mark\[hidden\]\s*\{\s*display:none;/);
  assert.match(css, /\.assessment-user-mark:hover::after/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(css, /grid-template-columns:minmax\(0, 58%\) minmax\(320px, 42%\)/);
  assert.match(css, /\.assessment-source-pane\s*\{[^}]*order:2/);
  assert.match(css, /\.assessment-result-pane\s*\{[^}]*order:1/);
  assert.match(css, /\.assessment-source-pane\s*\{[^}]*overflow:auto/);
});

test('标前评估结果顶部复用标前解读视觉层级并通过同一企业弹窗重新评估', () => {
  const resultSource = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-assessment-result-modal.js'), 'utf8');
  const actionSource = fs.readFileSync(path.join(demoRoot, 'assets', 'interpretation-mode-actions.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-assessment-result-modal.css'), 'utf8');

  assert.match(resultSource, /class="prebid-assessment-result-title"[\s\S]*tool-demand-new\.svg[\s\S]*>投标符合性自评<\/h2>/);
  assert.match(resultSource, /prebid-assessment-download[\s\S]*prebid-assessment-reassess[\s\S]*prebid-assessment-result-close/);
  assert.match(css, /\.prebid-assessment-result-modal\s*\{[^}]*grid-template-rows:\s*76px minmax\(0,1fr\)/s);
  assert.match(css, /\.prebid-assessment-reassess\s*\{[^}]*linear-gradient\(100deg, #1677ff 0%, #7b61ff 100%\)/s);
  assert.match(css, /\.prebid-assessment-download\s*\{[^}]*border:\s*1px solid #1769e0/s);
  assert.match(resultSource, /new CustomEvent\('open-prebid-assessment'/);
  assert.match(resultSource, /modalTitle:\s*'重新评估'/);
  assert.match(resultSource, /selectedCompany/);
  assert.match(resultSource, /const DEFAULT_COMPANY = '四川华鲲振宇智能科技有限责任公司'/);
  assert.match(resultSource, /const resolveCompany = \(title\)/);
  assert.match(resultSource, /resolveCompany\(title\)/);
  assert.doesNotMatch(resultSource, /prebid-reassess-dialog/);
  assert.match(actionSource, /const modalTitle = options\.modalTitle \|\| '投标符合性自评'/);
  assert.match(actionSource, /const selectedCompany = options\.selectedCompany \|\| ''/);
  assert.match(actionSource, /event\.detail\?\.selectedCompany/);
  assert.match(actionSource, /prebid-assessment-reassess-mode/);
  assert.match(css, /\.prebid-assessment-backdrop\.prebid-assessment-reassess-mode\s*\{[^}]*z-index:\s*1080/s);
});

test('重新评估确认后保持结果弹窗并显示加载状态直到模拟生成完成', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-assessment-result-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-assessment-result-modal.css'), 'utf8');
  const reassessHandler = source.match(/backdrop\.querySelector\('\.prebid-assessment-reassess'\)[\s\S]*?backdrop\.addEventListener\('click'/)?.[0] || '';

  assert.match(source, /data-assessment-reassessing hidden/);
  assert.match(source, /正在重新评估/);
  assert.match(source, /const beginReassessment = \(company\)/);
  assert.match(source, /setAttribute\('aria-busy', 'true'\)/);
  assert.match(source, /window\.setTimeout\(\(\) =>/);
  assert.match(source, /loading\.hidden = true/);
  assert.match(reassessHandler, /onSubmit:\s*beginReassessment/);
  assert.doesNotMatch(reassessHandler, /closeModal\(\)/);
  assert.match(css, /\.assessment-reassessing-overlay\s*\{[^}]*position:absolute;[^}]*z-index:6/s);
  assert.match(css, /@keyframes assessment-reassessing-spin/);
});

test('评估信息结果展示文档规定的全部字段分类', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const requiredLabels = [
    '项目名称', '项目编号', '项目标段', '采购类别', '项目包数', '资金来源', '采购预算', '最高限价',
    '建设目标', 'GPU 计算节点1', 'GPU 计算节点2', '计算卡1', '计算卡2', '管理服务器（含系统）',
    '800G IB 交换机', '200G IB 交换机', '万兆以太网交换机', '千兆以太网交换机', '存储服务器（含系统）',
    '交货地点', '交货期', '质保期', '付款方式', '售后响应', '验收要求', '项目模式', '运行要求',
    '招标文件获取', '澄清确认', '投标截止/开标', '递交地点', '投标有效期', '合同签订', '前置要求',
    '独立承担民事责任', '商业信誉和财务制度', '履约能力', '税收和社会保障资金', '无重大违法记录',
    '其他法定条件', '信用要求', '关联关系限制', '前期服务限制', '招标文件获取方式', '市场准入', '需提供资料',
    '★规则', '必须满足内容', '对应证明材料', '不满足后果', 'GPU计算节点1 · 处理器', '存储服务器 · 存储',
    '报价上限', '一览表效力', '金额大小写', '算术修正', '额外加配', '缺项漏项', '附加条件',
    '有效供应商要求', '数量不足后果',
    '项目背景与目标', '核心建设内容', '交付与履约', '▲重要技术指标', '#关键技术指标', '一般技术指标',
  ];

  for (const label of requiredLabels) assert.ok(source.includes(label), `缺少字段：${label}`);
});

test('★号模块按硬性要求展示条件、证明材料和不满足后果', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');

  assert.match(source, /带 ★ 条款均为实质性要求，只能无偏离或正偏离/);
  assert.match(source, /GPU计算节点1 · GPU卡[\s\S]*?必须满足内容[\s\S]*?对应证明材料[\s\S]*?不满足后果/);
  assert.match(source, /GPU计算节点2 · CPU[\s\S]*?产自中国境内；每颗主频≥2.6GHz/);
  assert.match(source, /存储服务器 · 存储[\s\S]*?≥14块≥15.36T NVMe数据盘/);
  assert.match(source, /不满足后果<\/b><span>负偏离无效，响应被拒绝。<\/span>/);
  assert.doesNotMatch(source, /文件装订|正本、副本|文件名称和格式/);
});

test('招标文件解读弹窗左侧模块单列展示并支持收起右侧招标原文件', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(source, /data-prebid-workspace/);
  assert.match(source, /data-prebid-source-toggle[^>]*aria-expanded="true"[^>]*>收起招标文件<\/button>/);
  assert.match(source, /data-prebid-source-panel/);
  assert.match(source, /data-prebid-source-close/);
  assert.match(source, /招标原文件/);
  assert.match(source, /招标文件-某高校高性能计算GPU集群建设项目/);
  assert.match(source, /classList\.toggle\('source-collapsed',\s*!open\)/);
  assert.match(source, /open \? '收起招标文件' : '查看招标文件'/);
  assert.match(css, /\.prebid-evaluation-grid\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(css, /\.prebid-evaluation-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 8px minmax\(360px, 42%\);/s);
  assert.match(css, /\.prebid-evaluation-workspace\.source-collapsed\s*\{[^}]*grid-template-columns:\s*1fr 0 0;/s);
  assert.match(css, /\.prebid-evaluation-results\s*\{[^}]*display:\s*flex;[^}]*overflow:\s*hidden;/s);
  assert.match(css, /\.prebid-evaluation-grid\s*\{[^}]*height:\s*0;[^}]*display:\s*block;[^}]*overflow-y:\s*auto;/s);
  assert.match(source, /resultsToolbar\?\.addEventListener\('wheel'/);
  assert.match(source, /resultsGrid\.scrollTop \+= event\.deltaY/);
});

test('评估信息模块使用 Tab 切换且默认展示项目基础信息', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(source, /class="prebid-evaluation-tabs"[^>]*role="tablist"/);
  assert.match(source, /data-prebid-tab="basic"[^>]*>项目基础信息<\/button>/);
  assert.match(source, /data-prebid-tab="score"[^>]*>项目与评分解析<\/button>/);
  assert.match(source, /data-prebid-panel="basic"[^>]*>/);
  assert.match(source, /data-prebid-panel="timeline" hidden/);
  assert.match(source, /const activateTab = \(target\)/);
  assert.match(source, /panel\.hidden = panel\.dataset\.prebidPanel !== target/);
  assert.match(source, /if \(resultsGrid\) resultsGrid\.scrollTop = 0/);
  assert.match(css, /\.prebid-evaluation-tabs\s*\{[^}]*display:\s*flex;/s);
  assert.match(css, /\.prebid-evaluation-tab\.is-active::after\s*\{[^}]*background:\s*#025dff;/s);
  assert.doesNotMatch(source, /<summary><img[^>]+><h3>项目基础信息<\/h3><\/summary>/);
  assert.doesNotMatch(source, /<summary><img[^>]+><h3>项目与评分解析<\/h3><\/summary>/);
  assert.doesNotMatch(source, /<details[^>]*>\s*<summary[^>]*>\s*(?:项目基础信息|时间与递交约束|投标人资格要求|★号及不允许偏离项|明确废标约束|项目与评分解析)/);
  assert.doesNotMatch(source, /<summary[^>]*>\s*(?:<img[^>]*>\s*)?<h3>/);
});

test('评估结果精简说明、调整时间顺序并隐藏页面来源', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.doesNotMatch(source, /已从招标文件原文提取关键投标条件/);
  assert.doesNotMatch(source, /<i>\*<\/i>评估信息提取结果/);
  assert.match(source, /招标文件获取[\s\S]{0,100}2025-07-10 至 2025-07-16/);
  assert.match(source, /投标截止\/开标[\s\S]{0,100}2025-07-31 09:30/);
  assert.match(css, /\.prebid-source\s*\{[^}]*display:\s*none;/s);
});

test('每条评估信息可以展开右侧面板并定位招标原文', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const docSource = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-source-doc.js'), 'utf8');

  assert.match(source, /data-source-target="basic"/);
  assert.match(source, /data-prebid-source-anchor="\$\{escapeHtml\(section\.anchor\)\}"/);
  for (const anchor of ['basic', 'timeline', 'qualification', 'mandatory', 'evaluation', 'score']) {
    assert.ok(docSource.includes(`"anchor":"${anchor}"`), `缺少定位锚点：${anchor}`);
  }
  assert.match(source, /定位招标原文/);
  assert.match(source, /querySelectorAll\('\.prebid-field, \.prebid-rule, \.prebid-score, \.prebid-requirement-group li'\)/);
  assert.match(source, /setSourceOpen\(true\)/);
  assert.match(source, /classList\.toggle\('is-located'/);
  assert.match(source, /sourcePane\.scrollTo\(\{ top: Math\.max\(0, top\), behavior: 'smooth' \}\)/);
});

test('招标原文件面板渲染招标文件脱敏稿全文并保留章节与表格', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const doc = require(path.join(demoRoot, 'assets', 'tender-source-doc.js'));
  const chapters = doc.sections.map((section) => section.chapter);

  assert.match(doc.fileName, /招标文件-某高校高性能计算GPU集群建设项目\.docx$/);
  for (const name of [
    '第一章 投标邀请',
    '第二章 供应商须知',
    '第三章 项目采购需求',
    '第四章 评标方法、步骤及标准',
    '第五章 合同主要条款',
    '第六章 投标文件格式',
  ]) {
    assert.ok(chapters.includes(name), `缺少章节：${name}`);
  }
  assert.ok(doc.sections.reduce((total, section) => total + section.blocks.length, 0) > 800);
  assert.ok(doc.sections.some((section) => section.blocks.some((block) => block.kind === 'table')));
  assert.ok(doc.sections.some((section) => section.blocks.some((block) => block.kind === 'image')));
  assert.ok(fs.existsSync(path.join(demoRoot, 'assets', 'tender-source-media', 'tender-source-image3.jpeg')));
  assert.match(source, /function renderSourcePaper/);
  assert.match(source, /hydrateSourcePaper\(backdrop\)/);
  assert.match(source, /class="prebid-original-image"/);
});

test('左侧各模块条目均映射到招标原文中的具体定位锚点', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const doc = require(path.join(demoRoot, 'assets', 'tender-source-doc.js'));
  const entries = [...source.matchAll(/'((?:basic|timeline|qualification|mandatory|evaluation|score):[^']+)':\s*'(t-[\w-]+)'/g)]
    .map((match) => ({ key: match[1], target: match[2] }));
  const anchorTokens = new Set();
  for (const section of doc.sections) {
    if (section.anchor) section.anchor.split(' ').forEach((token) => anchorTokens.add(token));
    for (const block of section.blocks) {
      if (block.anchor) block.anchor.split(' ').forEach((token) => anchorTokens.add(token));
      for (const tokens of Object.values(block.rowAnchors || {})) {
        tokens.split(' ').forEach((token) => anchorTokens.add(token));
      }
    }
  }

  assert.ok(entries.length >= 60, `映射条目过少：${entries.length}`);
  for (const moduleKey of ['basic', 'timeline', 'qualification', 'mandatory', 'evaluation', 'score']) {
    assert.ok(entries.some((entry) => entry.key.startsWith(`${moduleKey}:`)), `缺少模块映射：${moduleKey}`);
  }
  for (const entry of entries) {
    assert.ok(anchorTokens.has(entry.target), `${entry.key} 指向的锚点 ${entry.target} 不存在于招标原文`);
  }

  const docText = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-source-doc.js'), 'utf8');
  for (const target of ['t-get-file', 't-bid-time', 't-star-1-5', 't-eval-price', 't-validity', 't-score-important']) {
    assert.ok(docText.includes(target), `招标原文缺少锚点定义：${target}`);
  }
  assert.match(source, /function resolveLocateTarget/);
  assert.match(source, /resolveLocateTarget\(item, card\) \|\| card\.dataset\.sourceTarget/);
});

test('项目概述模块渲染项目概述提取全文并支持分组下拉查看', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');
  const overview = require(path.join(demoRoot, 'assets', 'project-overview-doc.js'));
  const headings = overview.groups.map((group) => group.heading);
  const subHeadings = overview.groups
    .flatMap((group) => group.blocks.filter((block) => block.kind === 'heading').map((block) => block.text));
  const plain = JSON.stringify(overview);

  assert.deepEqual(headings, ['提取说明', '一、项目基本信息', '二、招标范围与建设范围', '三、采购内容与技术实施内容', '四、提取边界说明']);
  for (const label of ['1.1 项目标识', '1.10 定标与合同授予', '2.1 招标范围', '2.8 标包工作范围', '3.1 采购货物清单', '3.2.7 存储服务器及存储系统（3 台）', '3.9 其他要求（评分相关内容）']) {
    assert.ok(subHeadings.includes(label), `缺少小节：${label}`);
  }
  for (const keyword of ['项目编号', '采购预算', '交钥匙', '验收范围', '提取边界说明', '采购货物清单', '13 台']) {
    assert.ok(plain.includes(keyword), `项目概述缺少内容：${keyword}`);
  }
  assert.ok(overview.groups.reduce((total, group) => total + group.blocks.length, 0) >= 80);
  assert.ok(overview.groups.some((group) => group.blocks.some((block) => block.kind === 'table')));
  assert.ok(overview.groups.some((group) => group.blocks.some((block) => block.kind === 'olist')));

  assert.match(source, /window\.tenderProjectOverview/);
  assert.match(source, /function renderOverviewGroups/);
  assert.match(source, /<details class="prebid-overview-group"/);
  assert.match(source, /hydrateOverviewPanel\(backdrop\)/);
  assert.match(css, /\.prebid-overview-group > summary\s*\{/s);
  assert.match(css, /\.prebid-overview-group\[open\] > summary::before\s*\{[^}]*rotate\(90deg\)/s);
});

test('评分项模块渲染招标文件附表3评分标准全文', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');
  const score = require(path.join(demoRoot, 'assets', 'tender-score-doc.js'));
  const parts = score.items.filter((item) => item.part).map((item) => item.part);
  const plain = JSON.stringify(score);

  assert.equal(score.title, '附表3：评分标准');
  assert.deepEqual(parts, ['报价得分', '类似业绩', '供货安装方案', '培训及售后服务方案', '产品技术响应']);
  assert.deepEqual(score.items.map((item) => item.score).filter(Boolean), ['35分', '2分', '4分', '6分', '53分']);
  assert.equal(score.total.value, '100分');
  assert.ok(score.notes.paras.length >= 5);
  assert.ok(score.policy.rows.length >= 4);
  for (const keyword of ['投标报价得分=(评标基准价D／投标报价V)×35', 'FP64', 'FP16', '每有一项负偏离扣3分', '评分区间']) {
    assert.ok(plain.includes(keyword), `评分标准缺少内容：${keyword}`);
  }
  assert.ok(score.items.some((item) => item.kind === 'remark'));

  assert.match(source, /window\.tenderScoreStandard/);
  assert.match(source, /function renderScoreStandard/);
  assert.match(source, /hydrateScorePanel\(backdrop\)/);
  assert.match(source, /body\.querySelectorAll\('\.prebid-score'\)\.forEach\(\(node\) => node\.remove\(\)\)/);
  assert.match(css, /\.prebid-score-table\s*\{/s);
  assert.match(css, /\.prebid-score-total\s*\{/s);
});

test('投标人资格要求按大类容纳多条独立要求', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');

  assert.match(source, /class="prebid-requirement-group"[\s\S]*?<h4>独立承担民事责任<\/h4>[\s\S]*?<li>[\s\S]*?<li>/);
  assert.match(source, /class="prebid-requirement-group"[\s\S]*?<h4>商业信誉和财务制度<\/h4>[\s\S]*?<li>[\s\S]*?<li>/);
  assert.match(source, /需提供资料：营业执照、法人证书、执业许可证/);
});

test('项目概述不提供定位且评分项只在标题后提供一次定位', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(source, /class="prebid-analysis-panel prebid-analysis-overview"[\s\S]*?<h4>项目概述<\/h4>/);
  assert.match(source, /class="prebid-score-heading"[\s\S]*?<h4>评分项<\/h4>[\s\S]*?data-score-locate[^>]*>定位招标原文<\/button>/);
  assert.match(source, /if \(card\.dataset\.sourceTarget === 'score'\) return;/);
  assert.match(source, /querySelector\('\[data-score-locate\]'\)\.addEventListener/);
  assert.match(css, /\.prebid-score-heading\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/s);
});

test('项目与评分解析的项目概述和评分项模块加高并各自支持纵向滚动', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(
    css,
    /\.prebid-analysis-panel\s*\{[^}]*display:\s*flex;[^}]*height:\s*clamp\(440px,\s*calc\(100vh - 280px\),\s*620px\);[^}]*flex-direction:\s*column;[^}]*overflow:\s*hidden;/s,
  );
  assert.match(
    css,
    /\.prebid-analysis-scroll\s*\{[^}]*overflow-y:\s*auto;[^}]*overscroll-behavior:\s*contain;[^}]*scrollbar-gutter:\s*stable;/s,
  );
  assert.match(source, /<h4>项目概述<\/h4><div class="prebid-analysis-scroll">/);
  assert.match(source, /data-score-locate[^>]*>定位招标原文<\/button>[\s\S]*?<\/div>\s*<div class="prebid-analysis-scroll"/);
  assert.match(source, /const body = panel\?\.querySelector\('\.prebid-analysis-scroll'\) \|\| panel;/);
});

test('时间约束第一行标题居左且蓝色时间居右', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(source, /prebid-rule-title prebid-timeline-title"><span>招标文件获取<\/span><b class="prebid-time">2025-07-10 至 2025-07-16<\/b>/);
  assert.match(source, /prebid-rule-title prebid-timeline-title"><span>澄清确认<\/span><b class="prebid-time">收到澄清文件后 24 小时内<\/b>/);
  assert.doesNotMatch(source, /招标文件获取 · <b class="prebid-time">/);
  assert.match(css, /\.prebid-time\s*\{[^}]*color:\s*#025dff;/s);
  assert.match(css, /\.prebid-timeline-rule\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*140px minmax\(0, 1fr\);/s);
  assert.match(css, /\.prebid-timeline-title\s*\{[^}]*display:\s*contents;/s);
});

test('有效供应商数量和报价规则按整块提供定位入口', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');

  assert.match(source, /prebid-subsection-title[^>]*>有效供应商数量<\/h4>[\s\S]*?data-evaluation-group-locate[^>]*>定位招标原文<\/button>/);
  assert.match(source, /prebid-subsection-title[^>]*>报价规则<\/h4>[\s\S]*?data-evaluation-group-locate[^>]*>定位招标原文<\/button>/);
  assert.match(source, /resolveLocateTarget\(button\.closest\('\[data-evaluation-group\]'\), card\)/);
  assert.doesNotMatch(source, /item\.closest\('\[data-evaluation-group\]'\)/);
  assert.match(source, /const items = \[\.\.\.card\.querySelectorAll\('\.prebid-field, \.prebid-rule, \.prebid-score, \.prebid-requirement-group li'\)\]/);
});

test('未勾选核心招标文件时点击 01 只显示提示', () => {
  const fixture = createActionFixture(false);

  runBrowserScript('interpretation-mode-actions.js', fixture.globals);
  fixture.click();

  assert.equal(fixture.resultList.children.length, 0);
  assert.equal(
    fixture.body.children.at(-1).textContent,
    '请检查是否在“招标资料”中已上传或勾选核心招标文件',
  );
});

test('勾选核心招标文件时点击 01 使用招标文件名和分钟时间生成标书要点解读记录', () => {
  const fixture = createActionFixture(true);

  runBrowserScript('interpretation-mode-actions.js', fixture.globals);
  fixture.click();

  assert.equal(fixture.body.children.length, 0);
  assert.equal(fixture.resultList.children.length, 1);
  const row = fixture.resultList.children[0];
  assert.equal(row.children[1].children[0].textContent, '标书要点解读_某高校高性能计算GPU集群建设项目_202609101430');
  const progress = row.children[1].children[1];
  assert.equal(progress.className, 'progress-trigger');
  assert.equal(progress.children[0].textContent, '正在处理（2/8）');
  assert.equal(progress.children[1].children.length, 9);
  assert.equal(progress.children[1].children[1].children[1].textContent, '解析招标文件');
  assert.equal(progress.children[1].children[2].children[1].textContent, '识别项目基础信息');
});

test('点击一键投标自评先打开企业确认弹窗而不是直接生成记录', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'interpretation-mode-actions.js'), 'utf8');
  const quickHandler = source.match(/if \(quickButton[\s\S]*?return Boolean\(quickButton\);/)?.[0] || '';

  assert.match(quickHandler, /openAssessmentModal\(panel,\s*\{/);
  assert.match(quickHandler, /skipInterpretation:\s*true/);
  assert.match(quickHandler, /modalTitle:\s*'一键投标自评'/);
  assert.doesNotMatch(quickHandler, /addProcessingRecord/);
  assert.match(source, /backdrop\.querySelector\('\.prebid-assessment-submit'\)[\s\S]*addProcessingRecord\(panel/);
});

test('原有标前处理中记录升级为八步悬停进度且问答记录保持不变', () => {
  const interpretationRow = createProcessingRow('标书要点解读_某高校高性能计算GPU集群建设项目');
  const assessmentRow = createProcessingRow('投标符合性自评_某高校高性能计算GPU集群建设项目_202609101430');
  const questionRow = createProcessingRow('问答记录生成中');
  const fixture = createActionFixture(true, [interpretationRow, assessmentRow, questionRow]);

  runBrowserScript('interpretation-mode-actions.js', fixture.globals);

  assert.equal(interpretationRow.copy.children[1].children[0].textContent, '正在处理（2/8）');
  assert.equal(interpretationRow.copy.children[1].children[1].children.length, 9);
  assert.equal(assessmentRow.copy.children[1].children[0].textContent, '正在处理（2/8）');
  assert.equal(assessmentRow.copy.children[1].children[1].children.length, 9);
  assert.equal(questionRow.copy.children[1].textContent, '正在生成中');
  assert.equal(questionRow.dataset.prebidProgressEnhanced, undefined);
});

test('八步处理进度使用紧凑行高以避免悬停浮层被结果面板裁切', () => {
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'result-panel-figma.css'), 'utf8');

  assert.match(
    css,
    /\.progress-popover \.progress-step\s*\{[^}]*min-height:\s*26px;[^}]*padding:\s*3px 7px;/s,
  );
});

test('标前评估页面保持四个 Tab 顺序并设为当前态', () => {
  const tabs = createModeTabs();
  const tabList = {
    querySelector: () => null,
    querySelectorAll(selector) {
      return selector === '.result-tab' ? tabs.slice() : [];
    },
    append(...orderedTabs) {
      tabs.splice(0, tabs.length, ...orderedTabs);
    },
  };
  const document = {
    body: { classList: { contains: (name) => name === 'interpretation-mode-page' } },
    querySelector(selector) {
      return selector === '#result-panel .result-tabs' ? tabList : null;
    },
    createElement() {
      return createTab('', false);
    },
    querySelectorAll() {
      return [];
    },
    documentElement: {},
  };
  class MutationObserver {
    observe() {}
    disconnect() {}
  }

  runBrowserScript('interpretation-mode-tabs.js', { document, MutationObserver });

  assert.deepEqual(tabs.map((tab) => tab.textContent), ['标书研判', '技术部分', '商务部分', '偏离响应']);
  assert.equal(tabs[0].classList.contains('active'), true);
  assert.equal(tabs[0].attributes.get('aria-selected'), 'true');
  assert.equal(tabs[1].classList.contains('active'), false);
  assert.equal(tabs[1].attributes.get('aria-selected'), 'false');
});

test('标前评估页面可以切换到其他三个模式并保留项目参数', () => {
  let clickHandler;
  const document = {
    body: { classList: { contains: (name) => name === 'interpretation-mode-page' } },
    addEventListener(type, handler) {
      if (type === 'click') clickHandler = handler;
    },
  };
  const window = {
    location: {
      href: 'https://example.test/interpretation-detail-active.html?project=某高校高性能计算GPU集群建设项目#result',
      search: '?project=某高校高性能计算GPU集群建设项目',
      hash: '#result',
    },
  };

  runBrowserScript('mode-page-links.js', { document, window, URL });

  clickHandler(createClickEvent('技术部分'));
  assert.equal(window.location.href, 'https://example.test/technical-detail-active.html?project=%E6%9F%90%E9%AB%98%E6%A0%A1%E9%AB%98%E6%80%A7%E8%83%BD%E8%AE%A1%E7%AE%97GPU%E9%9B%86%E7%BE%A4%E5%BB%BA%E8%AE%BE%E9%A1%B9%E7%9B%AE#result');

  window.location.href = 'https://example.test/interpretation-detail-active.html?project=某高校高性能计算GPU集群建设项目#result';
  clickHandler(createClickEvent('商务部分'));
  assert.equal(window.location.href, 'https://example.test/business-detail-active.html?project=%E6%9F%90%E9%AB%98%E6%A0%A1%E9%AB%98%E6%80%A7%E8%83%BD%E8%AE%A1%E7%AE%97GPU%E9%9B%86%E7%BE%A4%E5%BB%BA%E8%AE%BE%E9%A1%B9%E7%9B%AE#result');

  window.location.href = 'https://example.test/interpretation-detail-active.html?project=某高校高性能计算GPU集群建设项目#result';
  clickHandler(createClickEvent('偏离响应'));
  assert.equal(window.location.href, 'https://example.test/deviation-detail-active.html?project=%E6%9F%90%E9%AB%98%E6%A0%A1%E9%AB%98%E6%80%A7%E8%83%BD%E8%AE%A1%E7%AE%97GPU%E9%9B%86%E7%BE%A4%E5%BB%BA%E8%AE%BE%E9%A1%B9%E7%9B%AE#result');
});

test('标前评估页面显示两个精准入口和一键投标自评入口', () => {
  const tabs = [createTab('技术标', true), createTab('商务标', false)];
  const tabList = {
    querySelector: () => null,
    querySelectorAll: () => tabs.slice(),
    append(...orderedTabs) {
      tabs.splice(0, tabs.length, ...orderedTabs);
    },
  };
  const preciseButtons = [createModeButton(), createModeButton(), createModeButton()];
  const quickText = { nodeType: 3, textContent: '一键生成技术标' };
  const quickButton = { childNodes: [{ nodeType: 1 }, quickText] };
  const document = {
    querySelector(selector) {
      if (selector === '#result-panel .result-tabs') return tabList;
      if (selector === '#result-panel .quick-action') return quickButton;
      return null;
    },
    querySelectorAll(selector) {
      return selector === '#result-panel .result-mode .tool-grid > button'
        ? preciseButtons.filter((button) => !button.removed)
        : [];
    },
    createElement() {
      return createTab('', false);
    },
    documentElement: {},
  };
  class MutationObserver {
    observe() {}
    disconnect() {}
  }

  runBrowserScript('interpretation-mode-tabs.js', { document, MutationObserver });

  assert.equal(preciseButtons.filter((button) => !button.removed).length, 2);
  assert.equal(preciseButtons[0].span.innerHTML, '<b>01</b> 标书要点解读');
  assert.equal(preciseButtons[1].span.innerHTML, '<b>02</b> 投标符合性自评');
  assert.equal(quickText.textContent, '一键投标自评');
});

test('02 投标符合性自评打开文件与企业主体选择弹窗并按招标文件名和分钟时间命名', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'interpretation-mode-actions.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(source, /openAssessmentModal/);
  assert.match(source, /选择已生成标书要点解读文件/);
  assert.match(source, /选择评估企业主体/);
  assert.match(source, /投标符合性自评已开始生成/);
  assert.match(source, /modalTitle:\s*'投标符合性自评'/);
  assert.match(source, /successMessage:\s*'投标符合性自评已开始生成'/);
  assert.match(source, /titleText:\s*buildResultTitle\('投标符合性自评', sourceFile\)/);
  assert.match(css, /\.prebid-assessment-modal\s*\{/);
});

test('标书要点解读弹窗的立即评估叠加打开重新评估且只要求选择企业主体', () => {
  const evaluationSource = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.js'), 'utf8');
  const actionSource = fs.readFileSync(path.join(demoRoot, 'assets', 'interpretation-mode-actions.js'), 'utf8');
  const evaluationCss = fs.readFileSync(path.join(demoRoot, 'assets', 'prebid-evaluation-modal.css'), 'utf8');

  assert.match(evaluationSource, /open-prebid-assessment/);
  assert.match(evaluationSource, /skipInterpretation:\s*true/);
  assert.match(evaluationSource, /modalTitle:\s*'重新评估'/);
  assert.match(evaluationSource, /onSubmit:\s*closeModal/);
  const immediateAssessmentHandler = evaluationSource.match(/\.prebid-evaluation-action'\)\.addEventListener\('click',[\s\S]*?\n\s*\}\);/)?.[0] || '';
  assert.doesNotMatch(immediateAssessmentHandler, /closeModal\(\)/);
  assert.match(evaluationCss, /\.prebid-assessment-backdrop\.prebid-assessment-reassess-mode\s*\{[^}]*z-index:\s*1060;/s);
  assert.match(actionSource, /openAssessmentModal\s*=\s*\(panel,\s*options\s*=\s*\{\}\)/);
  assert.match(actionSource, /const skipInterpretation = options\.skipInterpretation === true/);
  assert.match(actionSource, /skipInterpretation\s*\?\s*''\s*:/);
  assert.match(actionSource, /if \(!company \|\| \(!skipInterpretation && !interpretation\)\)/);
  assert.match(actionSource, /addEventListener\('open-prebid-assessment'/);
});

test('标前评估页面的两个精准入口铺满并对齐一键评估按钮', () => {
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'result-panel-figma.css'), 'utf8');

  assert.match(
    css,
    /body\.interpretation-mode-page #result-panel \.result-mode \.tool-grid\s*\{[^}]*width:\s*calc\(100% - 5px\);[^}]*margin-left:\s*5px;[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s,
  );
  assert.match(
    css,
    /body\.interpretation-mode-page #result-panel \.result-mode \.tool-grid > button\s*\{[^}]*width:\s*100%;[^}]*min-width:\s*0;/s,
  );
});

test('标前评估页面只把技术标生成记录替换为标前评估记录', () => {
  const tabs = createModeTabs();
  const tabList = {
    querySelector: () => null,
    querySelectorAll: () => tabs.slice(),
    append(...orderedTabs) {
      tabs.splice(0, tabs.length, ...orderedTabs);
    },
  };
  const preciseButtons = [createModeButton(), createModeButton(), createModeButton()];
  const quickButton = { childNodes: [{ nodeType: 3, textContent: '一键生成技术标' }] };
  const resultList = {};
  const processingRows = [
    createRecordRow('招标文件解读_某高校高性能计算GPU集群建设项目'),
    createRecordRow('技术标投标正文_某高校高性能计算GPU集群建设项目'),
    createRecordRow('问答记录生成中'),
  ];
  const generatedRows = [
    createRecordRow('招标文件解读_某高校高性能计算GPU集群建设项目'),
    createRecordRow('技术标投标大纲_某高校高性能计算GPU集群建设项目'),
    createRecordRow('技术标投标正文_某高校高性能计算GPU集群建设项目'),
    createRecordRow('问答记录_投标评分项梳理'),
  ];
  const document = {
    body: { classList: { contains: (name) => name === 'interpretation-mode-page' } },
    querySelector(selector) {
      if (selector === '#result-panel .result-tabs') return tabList;
      if (selector === '#result-panel .quick-action') return quickButton;
      if (selector === '#result-panel .result-list') return resultList;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '#result-panel .result-mode .tool-grid > button') return preciseButtons;
      if (selector === '#result-panel .processing-row') return processingRows.filter((row) => !row.removed);
      if (selector === '#result-panel .record-row') return generatedRows.filter((row) => !row.removed);
      return [];
    },
    createElement() {
      return createTab('', false);
    },
    documentElement: {},
  };
  let recordObserverCallback;
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      if (target === resultList) recordObserverCallback = this.callback;
    }
    disconnect() {}
  }

  runBrowserScript('interpretation-mode-tabs.js', {
    document,
    MutationObserver,
    Date: class extends Date {
      constructor(...args) {
        super(...(args.length ? args : ['2026-09-10T14:30:00+08:00']));
      }
    },
  });

  assert.deepEqual(
    processingRows.filter((row) => !row.removed).map((row) => row.title.textContent),
    ['标书要点解读_某高校高性能计算GPU集群建设项目_202609101430', '投标符合性自评_某高校高性能计算GPU集群建设项目_202609101430', '问答记录生成中'],
  );
  assert.deepEqual(
    generatedRows.filter((row) => !row.removed).map((row) => row.title.textContent),
    ['标书要点解读_某高校高性能计算GPU集群建设项目_202609101430', '投标符合性自评_某高校高性能计算GPU集群建设项目_202609101430', '问答记录_投标评分项梳理'],
  );

  processingRows.push(createRecordRow('技术标投标大纲_某高校高性能计算GPU集群建设项目'));
  generatedRows.push(createRecordRow('技术标投标正文_某高校高性能计算GPU集群建设项目'));
  recordObserverCallback();

  assert.deepEqual(
    processingRows.filter((row) => !row.removed).map((row) => row.title.textContent),
    ['标书要点解读_某高校高性能计算GPU集群建设项目_202609101430', '投标符合性自评_某高校高性能计算GPU集群建设项目_202609101430', '问答记录生成中'],
  );
  assert.deepEqual(
    generatedRows.filter((row) => !row.removed).map((row) => row.title.textContent),
    ['标书要点解读_某高校高性能计算GPU集群建设项目_202609101430', '投标符合性自评_某高校高性能计算GPU集群建设项目_202609101430', '问答记录_投标评分项梳理'],
  );
});

function createTab(textContent, active) {
  const classes = new Set(active ? ['result-tab', 'active'] : ['result-tab']);
  return {
    textContent,
    type: '',
    role: '',
    dataset: {},
    attributes: new Map(),
    className: '',
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    },
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
  };
}

function createModeTabs() {
  return [
    ['prebid', '标前评估'],
    ['technical', '技术部分'],
    ['business', '商务部分'],
    ['deviation', '偏离响应'],
  ].map(([key, label], index) => {
    const tab = createTab(label, index === 1);
    tab.dataset.modeTab = key;
    return tab;
  });
}

function createModeButton() {
  const button = {
    removed: false,
    span: { innerHTML: '' },
    querySelector(selector) {
      return selector === 'span' ? this.span : null;
    },
    remove() {
      this.removed = true;
    },
  };
  return button;
}

function createRecordRow(textContent) {
  const title = { textContent, title: textContent };
  return {
    title,
    removed: false,
    querySelector(selector) {
      return selector === 'strong' || selector === '.record-main strong' ? title : null;
    },
    remove() {
      this.removed = true;
    },
  };
}

function createActionFixture(selected, processingRows = []) {
  const preciseButton = createElement('button');
  const quickButton = createElement('button');
  const resultList = createElement('div');
  const panel = createElement('section');
  panel.querySelector = (selector) => {
    if (selector === '.result-mode .tool-grid > button') return preciseButton;
    if (selector === '.quick-action') return quickButton;
    if (selector === '.result-list' || selector === '.processing-list, .result-list') return resultList;
    return null;
  };
  panel.querySelectorAll = (selector) => {
    if (selector === '.processing-row') return processingRows;
    return [];
  };
  const sourceName = '某高校高性能计算GPU集群建设项目.docx';
  const sourceRow = createElement('button');
  sourceRow.getAttribute = (name) => name === 'aria-pressed' ? String(selected) : null;
  sourceRow.querySelector = (selector) => selector === '.ellipsis' ? { textContent: sourceName } : null;
  const body = createElement('body');
  const document = {
    body,
    documentElement: {},
    querySelector: (selector) => selector === '#result-panel' ? panel : null,
    querySelectorAll: (selector) => selector.includes('.upload-group') ? [sourceRow] : [],
    createElement,
    createElementNS: (_namespace, tagName) => createElement(tagName),
  };
  class MutationObserver {
    observe() {}
    disconnect() {}
  }

  return {
    body,
    resultList,
    globals: {
      document,
      MutationObserver,
      Date: class extends Date {
        constructor(...args) {
          super(...(args.length ? args : ['2026-09-10T14:30:00+08:00']));
        }
      },
      window: { setTimeout: () => 1, clearTimeout() {} },
    },
    click() {
      preciseButton.listeners.click({
        preventDefault() {},
        stopPropagation() {},
        stopImmediatePropagation() {},
      });
    },
    quickClick() {
      quickButton.listeners.click({
        preventDefault() {},
        stopPropagation() {},
        stopImmediatePropagation() {},
      });
    },
  };
}

function createProcessingRow(titleText) {
  const row = createElement('div');
  const copy = createElement('span');
  const title = createElement('strong');
  const status = createElement('small');
  title.textContent = titleText;
  status.textContent = '正在生成中';
  copy.append(title, status);
  row.append(copy);
  row.copy = copy;
  row.querySelector = (selector) => {
    if (selector === 'strong') return title;
    if (selector === '.processing-copy') return copy;
    return null;
  };
  return row;
}

function createElement(tagName) {
  return {
    tagName,
    children: [],
    listeners: {},
    dataset: {},
    className: '',
    textContent: '',
    title: '',
    append(...children) {
      this.children.push(...children);
    },
    prepend(...children) {
      this.children.unshift(...children);
    },
    replaceChildren(...children) {
      this.children.splice(0, this.children.length, ...children);
    },
    setAttribute(name, value) {
      this[name] = value;
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    remove() {
      this.removed = true;
    },
  };
}

function createClickEvent(label) {
  const tab = { textContent: label };
  return {
    target: { closest: () => tab },
    preventDefault() {},
    stopPropagation() {},
    stopImmediatePropagation() {},
  };
}

function runBrowserScript(fileName, globals) {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', fileName), 'utf8');
  vm.runInNewContext(source, globals, { filename: fileName });
}
