import test from 'node:test';
import assert from 'node:assert/strict';
await import('../demo-content.js');

const {
  demoKnowledgeFiles,
  demoRecords,
  demoSourceFiles,
  appendDisplayFiles,
  extractOutline,
  formatSelectedSources,
  renderMarkdown,
} = globalThis.DemoContent;

const expectedRecordTitles = [
  '企业智能办公AI平台实施方案',
  '企业智能办公AI平台技术服务合同',
  '企业智能办公AI应用培训通知',
  '智能体应用实践思考',
  '企业知识库建设与运营指引',
  '2026上半年数字化办公工作总结',
  '2026年度信息系统安全检查通知',
  '生成式AI应用数据安全管理规范',
  '智能办公平台试运行问题分析',
  '智能办公平台试点推进会纪要',
];

test('三条示范记录按实施方案、技术服务合同、培训通知排序', () => {
  assert.deepEqual(demoRecords.slice(0, 3).map((record) => record.id), ['plan', 'contract', 'notice']);
  assert.match(demoRecords[0].title, /实施方案/);
  assert.match(demoRecords[1].title, /技术服务合同/);
  assert.match(demoRecords[2].title, /通知/);
});

test('三条主记录后保留经过整理的旧历史记录', () => {
  assert.equal(demoRecords.length >= 8, true);
  assert.deepEqual(demoRecords.slice(0, 3).map((record) => record.id), ['plan', 'contract', 'notice']);
  assert.match(demoRecords[3].title, /智能体|知识库|数字化办公/);
});

test('十条记录、正文一级标题和历史版本使用统一简称', () => {
  assert.deepEqual(demoRecords.map((record) => record.title), expectedRecordTitles);
  demoRecords.forEach((record) => {
    assert.equal(record.markdown.match(/^# (.+)$/m)?.[1], record.title);
    record.versions.forEach((version) => {
      assert.equal(version.title, record.title);
      assert.equal(version.markdown.match(/^# (.+)$/m)?.[1], record.title);
    });
  });
});

test('三个主场景各有至少三个内容不同的历史版本', () => {
  demoRecords.slice(0, 3).forEach((record) => {
    assert.equal(record.versions.length >= 3, true);
    assert.equal(new Set(record.versions.map((version) => version.markdown)).size, record.versions.length);
  });
});

test('七条恢复记录具有完整标题层级和三个历史版本', () => {
  demoRecords.slice(3).forEach((record) => {
    assert.equal(record.versions.length, 3, `${record.id} 历史版本不足`);
    assert.equal((record.markdown.match(/^## /gm) || []).length >= 4, true, `${record.id} 二级标题不足`);
    assert.equal((record.markdown.match(/^### /gm) || []).length >= 2, true, `${record.id} 三级标题不足`);
    assert.equal(record.markdown.length >= 1600, true, `${record.id} 正文不够完整`);
    assert.equal(new Set(record.versions.map((version) => version.markdown)).size, 3, `${record.id} 版本内容未形成差异`);
  });
});

test('实施方案来源材料默认选中四份源文件和一个知识库', () => {
  assert.equal(demoSourceFiles.filter((file) => file.selected).length, 4);
  assert.equal(demoKnowledgeFiles.filter((file) => file.selected).length, 1);
  assert.equal(formatSelectedSources(4, 1), '已选 4 个来源文件、1 个知识库');
  assert.equal(formatSelectedSources(0, 0), '暂未选择来源材料');
});

test('正文目录与渲染后的标题使用相同定位标识', () => {
  const markdown = '# 示例标题\n\n## 一、项目背景\n\n正文。\n\n### （一）现状\n\n说明。';
  const outline = extractOutline(markdown, 'demo');
  const html = renderMarkdown(markdown, 'demo');

  assert.deepEqual(outline, [
    { level: 2, label: '一、项目背景', id: 'demo-section-1' },
    { level: 3, label: '（一）现状', id: 'demo-section-2' },
  ]);
  assert.match(html, /<h2 id="demo-section-1">一、项目背景<\/h2>/);
  assert.match(html, /<h3 id="demo-section-2">（一）现状<\/h3>/);
});

test('Markdown 表格被渲染为可读的 HTML 表格', () => {
  const markdown = '| 阶段 | 时间 |\n| --- | --- |\n| 调研 | 第1个月 |';
  const html = renderMarkdown(markdown, 'table');
  assert.match(html, /<table>/);
  assert.match(html, /<th>阶段<\/th>/);
  assert.match(html, /<td>第1个月<\/td>/);
});

test('本地选择文件只追加支持格式且不重复的文件名', () => {
  const files = [{ name: '已有材料.docx', type: 'docx', selected: false }];
  const result = appendDisplayFiles(files, [
    { name: '新增材料.pdf' },
    { name: '已有材料.docx' },
    { name: '图片.png' },
  ]);

  assert.equal(result.added, 1);
  assert.equal(result.rejected, 1);
  assert.deepEqual(files.map((file) => file.name), ['已有材料.docx', '新增材料.pdf']);
  assert.equal(files[1].selected, true);
});
