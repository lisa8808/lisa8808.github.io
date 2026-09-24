const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('标书撰写列表卡片默认进入标前评估详情页', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const source = fs.readFileSync(path.join(root, 'assets', 'list-card-entry.js'), 'utf8');
  const listBundle = fs.readFileSync(path.join(root, 'assets', 'list-D1LEEsXP.js'), 'utf8');
  const sharedHeader = fs.readFileSync(path.join(root, 'assets', 'shared-brand-header.js'), 'utf8');

  assert.match(html, /assets\/list-D1LEEsXP\.js\?v=20260909-prebid-entry/);
  assert.match(html, /assets\/list-card-entry\.js\?v=20260912-qa-earliest/);
  assert.match(html, /assets\/shared-brand-header\.js\?v=[^"]+/);
  assert.match(source, /DETAIL_PAGE\s*=\s*['"]\.\/interpretation-detail-active\.html['"]/);
  assert.match(source, /EMPTY_PAGE\s*=\s*['"]\.\/interpretation-detail-empty\.html['"]/);
  assert.match(source, /closest\('\.tender-card'\)/);
  assert.match(source, /closest\('\.tender-card-actions'\)/);
  assert.match(source, /searchParams\.set\('project', projectName\)/);
  assert.match(source, /dataset\.demoEmptyProject === 'true' \? EMPTY_PAGE : DETAIL_PAGE/);
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(
    listBundle,
    /function et\(e\)\{window\.location\.href=`\.\/interpretation-detail-active\.html\?project=\$\{encodeURIComponent\(e\.title\)\}`\}/,
    '列表自身的卡片点击处理也应直接进入标前评估页',
  );
  assert.match(
    sharedHeader,
    /else if \(existingCard\) \{\s*destination = '\.\/interpretation-detail-active\.html';\s*\}/,
    '最先执行的公共点击拦截也应进入标前评估页',
  );
});

test('标书撰写列表保留一个完整演示项目，其余项目进入只有上传入口的空白页', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const source = fs.readFileSync(path.join(root, 'assets', 'list-demo-project.js'), 'utf8');

  assert.match(html, /assets\/list-demo-project\.js/);
  assert.match(source, /'某高校高性能计算GPU集群建设项目'/);
  assert.match(source, /'市政务云信创服务器采购项目'/);
  assert.match(source, /'城市轨道交通智能运维平台建设项目'/);
  assert.match(source, /'三甲医院数据中心机房设备采购项目'/);
  assert.match(source, /'省级电网调度自动化系统改造项目'/);
  assert.match(source, /'智慧园区安防监控与门禁系统集成项目'/);
  assert.match(source, /empty: true/);
  assert.match(source, /EMPTY_PAGE\s*=\s*['"]\.\/interpretation-detail-empty\.html['"]/);
  assert.match(source, /querySelectorAll\('\.tender-card'\)/);
  assert.match(source, /window\.addEventListener\('click', activateProjectCard, true\)/);
  assert.match(source, /MutationObserver/);
  assert.doesNotMatch(source, /cards\.slice\(1\)/);

  // 卡片时间按“现在”往前推，并按时间倒序排（最新在最上面）
  assert.match(source, /const recentTime = \(minutes\) => formatDateTime\(new Date\(loadedAt - Math\.round\(minutes \* 60 \* 1000\)\)\)/);
  assert.match(source, /\.sort\(\(a, b\) => a\.minutesAgo - b\.minutesAgo\)/);
  assert.doesNotMatch(source, /'20\d\d-\d\d-\d\d \d\d:\d\d:\d\d'/);

  // 卡片时间左侧显示编辑人，样式与标书审查列表一致
  const css = fs.readFileSync(path.join(root, 'assets', 'list-unified.css'), 'utf8');
  assert.match(source, /PROJECT_OWNER\s*=\s*'易天行'/);
  assert.match(source, /tender-card-owner/);
  assert.match(css, /\.tender-card-owner\s*\{[^}]*position:\s*absolute;[^}]*display:\s*inline-flex;/s);
  assert.match(css, /\.tender-card-owner svg\s*\{[^}]*width:\s*14px;[^}]*height:\s*14px;/s);
});
