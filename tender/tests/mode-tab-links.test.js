const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const demoRoot = path.join(__dirname, '..');

test('相关页面加载三模式切换 Tab', () => {
  for (const pageName of [
    'interpretation-detail-empty.html',
    'technical-detail-active.html',
    'business-detail-active.html',
    'interpretation-detail-active.html',
    'deviation-detail-active.html',
  ]) {
    const html = fs.readFileSync(path.join(demoRoot, pageName), 'utf8');
    assert.match(html, /assets\/mode-page-links\.js/);
    assert.match(html, /assets\/mode-tab-links\.js/);
  }

  const interpretationHtml = fs.readFileSync(
    path.join(demoRoot, 'interpretation-detail-active.html'),
    'utf8',
  );
  assert.match(interpretationHtml, /assets\/interpretation-mode-tabs\.js/);
});

test('模式切换脚本统一四个 Tab 并删除结果', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'mode-tab-links.js'),
    'utf8',
  );
  assert.match(source, /key: 'prebid', label: '标书研判'/);
  assert.match(source, /key: 'technical', label: '技术部分'/);
  assert.match(source, /key: 'business', label: '商务部分'/);
  assert.match(source, /key: 'deviation', label: '偏离响应'/);
  assert.match(source, /textContent\.trim\(\) === '结果'/);
  assert.match(source, /tabList\.append\(\.\.\.orderedTabs\)/);
});

test('四模式切换保留目标页及 URL 参数', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'mode-page-links.js'),
    'utf8',
  );
  assert.match(source, /标书研判:\s*'\.\/interpretation-detail-active\.html'/);
  assert.match(source, /技术部分:\s*'\.\/technical-detail-active\.html'/);
  assert.match(source, /商务部分:\s*'\.\/business-detail-active\.html'/);
  assert.match(source, /偏离响应:\s*'\.\/deviation-detail-active\.html'/);
  assert.match(source, /targetUrl\.search = window\.location\.search/);
  assert.match(source, /targetUrl\.hash = window\.location\.hash/);
});
