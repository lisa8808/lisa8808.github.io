const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pages = [
  ['标前评估', 'interpretation-detail-active.html', 'interpretation-company-selector'],
  ['技术部分', 'technical-detail-active.html', 'technical-company-selector'],
  ['偏离响应', 'deviation-detail-active.html', 'deviation-company-selector'],
];

test('三个页面分别加载自己维护的投标企业选择器资源', () => {
  for (const [label, page, asset] of pages) {
    const html = read(page);
    assert.match(html, new RegExp(`assets/${asset}\\.css`), `${label}缺少独立样式`);
    assert.match(html, new RegExp(`assets/${asset}\\.js`), `${label}缺少独立脚本`);
    assert.doesNotMatch(html, /assets\/business-company-selector\.(?:css|js)/, `${label}不应借用商务部分资源`);
  }
});

test('三个独立选择器与商务部分保持相同弹窗、确认写回和企业管理跳转逻辑', () => {
  const requiredSourcePatterns = [
    /选择投标企业/,
    /搜索企业名称或统一社会信用代码/,
    /href="\.\/company-create\.html"/,
    /pendingId = option\.dataset\.companyId/,
    /select\.dispatchEvent\(new Event\('input'/,
    /select\.dispatchEvent\(new Event\('change'/,
    /if \(event\.key === 'Escape'/,
  ];

  for (const [label, , asset] of pages) {
    const source = read(`assets/${asset}.js`);
    for (const pattern of requiredSourcePatterns) {
      assert.match(source, pattern, `${label}交互缺少 ${pattern}`);
    }
  }
});

test('三个页面的独立样式保持与商务部分一致的弹窗尺寸和状态样式', () => {
  const requiredCssPatterns = [
    /\.business-company-mask\s*\{/,
    /width:\s*min\(560px, calc\(100vw - 40px\)\)/,
    /max-height:\s*min\(720px, calc\(100vh - 40px\)\)/,
    /\.business-company-option\.selected/,
    /\.business-company-confirm:disabled/,
  ];

  for (const [label, , asset] of pages) {
    const css = read(`assets/${asset}.css`);
    for (const pattern of requiredCssPatterns) {
      assert.match(css, pattern, `${label}样式缺少 ${pattern}`);
    }
  }
});
