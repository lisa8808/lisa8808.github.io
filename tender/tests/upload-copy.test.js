const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const expectedCopy = '点击/拖拽/粘贴文件到此处，支持pdf、docx、doc，大小不超过200M，上传上限20个';

test('四类详情页分别声明左上角上传提示文案', () => {
  const pages = [
    'interpretation-detail-empty.html',
    'interpretation-detail-active.html',
    'technical-detail-active.html',
    'business-detail-active.html',
    'deviation-detail-active.html',
  ];

  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, new RegExp(`data-upload-copy="${expectedCopy}"`), page);
  }
});

test('上传提示脚本只处理当前页面声明的文案', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'detail-upload-copy.js'), 'utf8');

  assert.match(source, /document\.documentElement\?\.dataset\.uploadCopy/);
  assert.match(source, /if \(!app \|\| !copy\) return/);
  assert.doesNotMatch(source, /xxM/);
});
