import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addFiles,
  buildDownloadText,
  createInitialState,
  createRecord,
  loadState,
  restoreVersion,
  rewriteContent,
  saveState,
  setSelection,
  setAllSelected,
  updateRecord,
} from '../demo-state.js';

test('只添加合法且不重复的文档文件', () => {
  const state = createInitialState();
  const result = addFiles(state, 'sourceFiles', [
    { name: '通知.docx' },
    { name: '通知.docx' },
    { name: '图片.png' },
    { name: '制度.pdf' },
  ]);

  assert.deepEqual(result.added.map((file) => file.name), ['通知.docx', '制度.pdf']);
  assert.equal(result.rejected, 1);
});

test('分组全选会改变每一项选择状态', () => {
  const state = createInitialState();
  setAllSelected(state, 'knowledgeFiles', true);
  assert.ok(state.knowledgeFiles.every((file) => file.selected));
});

test('损坏的持久化数据回退至初始状态', () => {
  const storage = { getItem: () => '{bad json}', setItem() {} };
  assert.equal(loadState(storage).sourceFiles.length > 0, true);
});

test('生成记录会使用当前模式和提示语创建版本', () => {
  const state = createInitialState();
  state.activeTool = 'official';
  const record = createRecord(state, '制定培训细则');

  assert.equal(record.mode, 'official');
  assert.match(record.content, /培训/);
  assert.equal(record.versions.length, 1);
});

test('还原版本会恢复标题与正文', () => {
  const state = createInitialState();
  const record = createRecord(state, '培训通知');
  const original = record.versions[0];

  updateRecord(state, record.id, { title: '已修改标题', content: '已修改正文' });
  restoreVersion(state, record.id, original.id);

  assert.equal(record.title, original.title);
  assert.equal(record.content, original.content);
});

test('下载文本包含记录标题和正文', () => {
  assert.equal(buildDownloadText({ title: '培训通知', content: '正文内容' }), '培训通知\n\n正文内容');
});

test('全文缩写生成比原文短的演示文本', () => {
  const source = '这是用于测试缩写操作的较长正文内容。'.repeat(8);
  assert.ok(rewriteContent(source, 'shorten').length < source.length);
});

test('状态保存后可以重新加载生成记录与选择项', () => {
  let value = null;
  const storage = { getItem: () => value, setItem: (_, next) => { value = next; } };
  const state = createInitialState();
  const record = createRecord(state, '开展培训');
  setSelection(state, 'sourceFiles', state.sourceFiles[0].id, false);
  saveState(storage, state);
  const restored = loadState(storage);
  assert.equal(restored.records[0].id, record.id);
  assert.equal(restored.sourceFiles[0].selected, false);
});
