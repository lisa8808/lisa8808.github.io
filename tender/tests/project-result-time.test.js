const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function loadProjectTime(search) {
  const source = read('assets/project-created-time.js');
  const storage = {};
  const context = {
    Date,
    URLSearchParams,
    window: {
      location: { search, hash: '' },
      localStorage: {
        getItem: (key) => storage[key] || null,
        setItem: (key, value) => { storage[key] = value; },
      },
    },
  };
  vm.runInNewContext(source, context);
  return context.window.ProjectCreatedTime;
}

test('项目创建时间从列表卡片链接进入详情后保持一致', () => {
  const projectTime = loadProjectTime(
    '?project=%E6%9F%90%E9%AB%98%E6%A0%A1%E9%AB%98%E6%80%A7%E8%83%BD%E8%AE%A1%E7%AE%97GPU%E9%9B%86%E7%BE%A4%E5%BB%BA%E8%AE%BE%E9%A1%B9%E7%9B%AE&createdAt=2026-09-12%2000%3A11%3A58',
  );
  const project = '某高校高性能计算GPU集群建设项目';

  assert.equal(projectTime.formatCard(projectTime.resolve({ project })), '2026-09-12 00:11:58');
  assert.equal(projectTime.resultText(project, 1), '2026年9月12日 00:12:58');
  assert.equal(projectTime.resultText(project, 2), '2026年9月12日 00:13:58');
});

test('标书研判、技术部分和商务部分按生成步骤定义先后顺序', () => {
  const projectTime = loadProjectTime('?project=demo&createdAt=2026-09-12%2000%3A11%3A58');

  assert.equal(projectTime.stepForTitle('标书要点解读_项目', 'prebid'), 1);
  assert.equal(projectTime.stepForTitle('投标符合性自评_项目', 'prebid'), 2);
  assert.ok(
    projectTime.resultDate('demo', 1) < projectTime.resultDate('demo', 2),
    '标书要点解读时间应早于投标符合性自评',
  );

  assert.equal(projectTime.stepForTitle('技术要求解读_项目', 'technical'), 1);
  assert.equal(projectTime.stepForTitle('技术大纲_项目', 'technical'), 2);
  assert.equal(projectTime.stepForTitle('技术正文_项目', 'technical'), 3);

  assert.equal(projectTime.stepForTitle('商务大纲_项目', 'business'), 1);
  assert.equal(projectTime.stepForTitle('商务正文_项目', 'business'), 2);
});

test('标书审核按审查项清单、审查报告、问答记录顺序生成并让新结果排在上方', () => {
  const projectTime = loadProjectTime('?project=demo&createdAt=2026-09-12%2000%3A11%3A58');
  const steps = [
    projectTime.stepForTitle('审查项清单_项目', 'review'),
    projectTime.stepForTitle('投标文件审查报告_项目', 'review'),
    projectTime.stepForTitle('投标文件审查报告_项目_版本1', 'review'),
    projectTime.stepForTitle('问答记录_项目审查要点', 'review'),
  ];

  assert.deepEqual(steps, [1, 2, 3, 0]);
  assert.equal(projectTime.resultText('demo', 0), '2026年9月12日 00:11:58');
  assert.ok(projectTime.resultDate('demo', 0) < projectTime.resultDate('demo', 1));
});

test('所有对话详情页加载项目时间桥接和排序后的结果面板', () => {
  for (const page of [
    'interpretation-detail-active.html',
    'technical-detail-active.html',
    'business-detail-active.html',
    'deviation-detail-active.html',
    'intelligent-review-detail.html',
    'intelligent-review-new.html',
    'intelligent-review-gpu.html',
  ]) {
    const html = read(page);
    assert.match(html, /assets\/project-created-time\.js\?v=20260912-qa-earliest/, `${page} 缺少项目时间桥接脚本`);
  }

  for (const page of [
    'interpretation-detail-active.html',
    'technical-detail-active.html',
    'business-detail-active.html',
    'deviation-detail-active.html',
  ]) {
    assert.match(read(page), /assets\/result-panel-figma\.js\?v=/, `${page} 未使用排序后的结果面板`);
  }
});

test('列表卡片把创建时间写入链接并在详情结果中按时间倒序展示', () => {
  const listDemo = read('assets/list-demo-project.js');
  const listEntry = read('assets/list-card-entry.js');
  const resultPanel = read('assets/result-panel-figma.js');
  const reviewUpload = read('assets/review-upload.js');
  const reviewList = read('assets/intelligent-review.mjs');

  assert.match(listDemo, /dataset\.projectCreatedAt = project\.date/);
  assert.match(listDemo, /searchParams\.set\('createdAt', card\.dataset\.projectCreatedAt\)/);
  assert.match(listEntry, /searchParams\.set\('createdAt', card\.dataset\.projectCreatedAt\)/);
  assert.match(reviewList, /target\.searchParams\.set\('createdAt', projectTime\.formatCard\(createdAt\)\)/);

  assert.match(resultPanel, /right\.displayOrder - left\.displayOrder/);
  assert.match(resultPanel, /title\.includes\('问答记录'\) \? -1 : step/);
  assert.match(resultPanel, /projectTime\.resultText\(projectName, /);
  assert.match(reviewUpload, /right\.projectDisplayOrder - left\.projectDisplayOrder/);
  assert.match(reviewUpload, /projectDisplayOrder/);
  assert.match(reviewUpload, /item\.detail = projectTime\.resultText\(projectName, step\)/);
});
