const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('相关详情页都加载三模式 Tab 与跳转脚本', () => {
  for (const page of [
    'interpretation-detail-empty.html',
    'technical-detail-active.html',
    'business-detail-active.html',
    'interpretation-detail-active.html',
    'deviation-detail-active.html',
  ]) {
    const html = read(page);
    assert.match(html, /assets\/mode-tab-links\.js/);
    assert.match(html, /assets\/mode-page-links\.js/);
  }
});

test('四个 Active 详情页分别使用页面专属样式将 Tab 与精准模式左对齐', () => {
  const pages = [
    ['interpretation-detail-active.html', 'interpretation-detail-tabs.css', 'interpretation-mode-page'],
    ['technical-detail-active.html', 'technical-detail-tabs.css', 'technical-mode-page'],
    ['business-detail-active.html', 'business-detail-tabs.css', 'business-mode-page'],
    ['deviation-detail-active.html', 'deviation-detail-tabs.css', 'deviation-mode-page'],
  ];

  for (const [page, stylesheet, bodyClass] of pages) {
    const html = read(page);
    const css = read(`assets/${stylesheet}`);
    assert.match(html, new RegExp(`assets/${stylesheet.replace('.', '\\.')}`));
    assert.match(html, new RegExp(`class="[^"]*${bodyClass}[^"]*"`));
    assert.match(css, new RegExp(`body\\.${bodyClass} #result-panel \\.result-tabs\\s*\\{[^}]*margin-left:\\s*0;`, 's'));
  }
});

test('Tab 统一为标书研判、技术部分、商务部分和偏离响应，并删除结果标题', () => {
  const source = read('assets/mode-tab-links.js');

  assert.match(source, /label:\s*'标书研判'/);
  assert.match(source, /label:\s*'技术部分'/);
  assert.match(source, /label:\s*'商务部分'/);
  assert.match(source, /label:\s*'偏离响应'/);
  assert.match(source, /textContent\.trim\(\) === '结果'/);
  assert.match(source, /tab\.remove\(\)/);
  assert.match(source, /resultHeaderTitle\?\.remove\(\)/);
});

test('四个 Tab 跳转到各自 HTML 并保留项目参数', () => {
  const source = read('assets/mode-page-links.js');

  assert.match(source, /标书研判:\s*'\.\/interpretation-detail-active\.html'/);
  assert.match(source, /技术部分:\s*'\.\/technical-detail-active\.html'/);
  assert.match(source, /商务部分:\s*'\.\/business-detail-active\.html'/);
  assert.match(source, /偏离响应:\s*'\.\/deviation-detail-active\.html'/);
  assert.match(source, /targetUrl\.search = window\.location\.search/);
  assert.match(source, /targetUrl\.hash = window\.location\.hash/);
});

test('偏离响应页面完整复用标前评估页内容，只保留页面模式标识与专属 Tab 样式差异', () => {
  const interpretation = read('interpretation-detail-active.html');
  const deviation = read('deviation-detail-active.html');
  const normalizedDeviation = deviation.replace(
    '<body class="interpretation-mode-page deviation-mode-page">',
    '<body class="interpretation-mode-page">',
  )
    .replace('assets/deviation-detail-tabs.css', 'assets/interpretation-detail-tabs.css')
    .replaceAll('assets/deviation-company-selector', 'assets/interpretation-company-selector')
    .replace('    <link rel="stylesheet" href="./assets/deviation-response-writing-modal.css" />\n', '')
    .replace('    <link rel="stylesheet" href="./assets/business-outline-result-modal.css" />\n', '')
    .replace('    <link rel="stylesheet" href="./assets/deviation-response-analysis-modal.css" />\n', '')
    .replace('    <script defer src="./assets/deviation-response-config.js"></script>\n', '')
    .replace('    <script defer src="./assets/deviation-response-analysis-modal.js"></script>\n', '')
    .replace('    <script defer src="./assets/deviation-mode-actions.js"></script>\n', '');

  assert.equal(
    normalizedDeviation,
    interpretation
      .replace(/    <script defer src="\.\/assets\/interpretation-conversation-demo\.js(?:\?v=[^"]+)?"><\/script>\n/, '')
      .replace(/    <link rel="stylesheet" href="\.\/assets\/interpretation-conversation-config\.css(?:\?v=[^"]+)?" \/>\n/, ''),
  );
});
