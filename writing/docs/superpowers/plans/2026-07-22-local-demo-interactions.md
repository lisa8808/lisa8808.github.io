# 公文写作本地演示交互 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将静态公文写作页面升级为可离线演示、可刷新恢复的交互应用。

**Architecture:** 新建独立的纯状态模块，负责初始数据、持久化、文件、消息、记录与版本操作；`script.js` 只负责渲染和 DOM 事件。浏览器用 `localStorage` 保存状态，生成和改写内容由确定性本地模板产生。

**Tech Stack:** 原生 HTML、CSS、ES modules、Node 内建 `node:test`。

## Global Constraints

- 不接入真实后端、AI、上传或网络接口。
- 只接受 `.pdf`、`.doc`、`.docx` 文件，并且只保存文件元数据。
- 状态键固定为 `official-writing-demo-state-v1`。
- 禁用 PPT、思维导图、翻译写作；不得为它们添加事件处理器。
- 所有新增行为先以 `node --test` 验证失败，再实现。

---

### Task 1: 创建可测试的演示状态模块

**Files:**
- Create: `demo-state.js`
- Create: `tests/demo-state.test.js`

**Interfaces:**
- Produces: `createInitialState()`, `loadState(storage)`, `saveState(storage, state)`, `addFiles(state, group, files)`, `setSelection(state, group, id, selected)`, `setAllSelected(state, group, selected)`。
- Consumes: 标准 `Storage` 形状对象，包含 `getItem(key)`、`setItem(key, value)`。

- [ ] **Step 1: 写入失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { addFiles, createInitialState, loadState, setAllSelected } from '../demo-state.js';

test('只添加合法且不重复的文档文件', () => {
  const state = createInitialState();
  const result = addFiles(state, 'sourceFiles', [
    { name: '通知.docx' }, { name: '通知.docx' }, { name: '图片.png' }, { name: '制度.pdf' },
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
```

- [ ] **Step 2: 验证测试失败**

Run: `node --test tests/demo-state.test.js`

Expected: FAIL，提示 `demo-state.js` 尚不存在。

- [ ] **Step 3: 实现最小状态 API**

```js
export const STORAGE_KEY = 'official-writing-demo-state-v1';
const allowedExtensions = new Set(['pdf', 'doc', 'docx']);
const extensionOf = (name) => name.split('.').pop().toLowerCase();

export function createInitialState() { /* 返回规格定义的完整初始 state */ }
export function loadState(storage) { /* JSON 解析失败时 return createInitialState() */ }
export function saveState(storage, state) { storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
export function addFiles(state, group, files) { /* 扩展名验证、组内名称去重、返回 { added, rejected } */ }
export function setSelection(state, group, id, selected) { /* 更新匹配项 */ }
export function setAllSelected(state, group, selected) { /* 更新整个组 */ }
```

- [ ] **Step 4: 验证通过**

Run: `node --test tests/demo-state.test.js`

Expected: PASS，3 个测试全部通过。

- [ ] **Step 5: 提交**

当前工作目录非 Git 仓库；记录该限制，不执行提交。

### Task 2: 添加生成记录与版本状态操作

**Files:**
- Modify: `demo-state.js`
- Modify: `tests/demo-state.test.js`

**Interfaces:**
- Consumes: `addMessage(state, role, content)`, `createRecord(state, prompt)`, `updateRecord(state, id, changes)`, `restoreVersion(state, recordId, versionId)`。
- Produces: 每条记录带 `id`、`title`、`mode`、`content`、`createdAt`、`versions`，每次修改追加不可变版本快照。

- [ ] **Step 1: 写入失败测试**

```js
import { createRecord, restoreVersion, updateRecord } from '../demo-state.js';

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
```

- [ ] **Step 2: 验证测试失败**

Run: `node --test tests/demo-state.test.js`

Expected: FAIL，缺少导出的记录函数。

- [ ] **Step 3: 实现本地模板与版本快照**

```js
export function createRecord(state, prompt) {
  const official = state.activeTool === 'official';
  const title = official ? `关于${prompt.slice(0, 18)}的通知` : prompt.slice(0, 24);
  const content = official ? buildOfficialDraft(prompt) : buildGeneralDraft(prompt);
  const record = { id: crypto.randomUUID(), title, mode: state.activeTool, content,
    createdAt: new Date().toISOString(), versions: [] };
  record.versions.push(snapshot(record));
  state.records.unshift(record); state.activeRecordId = record.id;
  return record;
}
export function updateRecord(state, id, changes) { /* 合并 changes 后 push snapshot */ }
export function restoreVersion(state, recordId, versionId) { /* 复制目标快照字段后 push 新快照 */ }
```

- [ ] **Step 4: 验证通过**

Run: `node --test tests/demo-state.test.js`

Expected: PASS。

- [ ] **Step 5: 提交**

当前工作目录非 Git 仓库；不执行提交。

### Task 3: 为动态页面添加语义挂钩与样式

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `data-group`、`data-role`、`data-action` DOM 属性。
- Produces: 隐藏文件输入、动态文件/消息/记录容器、加载与拖入状态样式。

- [ ] **Step 1: 写入结构检查测试**

```js
import { readFile } from 'node:fs/promises';
test('页面包含动态渲染挂钩和文件选择器', async () => {
  const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(page, /id="source-file-input"/);
  assert.match(page, /data-role="source-file-list"/);
  assert.match(page, /data-role="message-list"/);
  assert.match(page, /data-role="record-list"/);
});
```

- [ ] **Step 2: 验证失败**

Run: `node --test tests/demo-state.test.js`

Expected: FAIL，缺少页面挂钩。

- [ ] **Step 3: 修改 HTML/CSS**

将两组硬编码文件列表替换为带 `data-role` 的空容器；为上传和添加知识库各增加一个 `accept=".pdf,.doc,.docx"` 的隐藏 input。为聊天消息和记录容器添加 `data-role`，为结果栏折叠、下载、清空文本、历史版本、个人菜单标上唯一 `data-action`。追加以下核心样式：

```css
.upload-box.is-dragover { border-color: var(--primary); background: var(--primary-soft); }
.upload-box.is-loading, .send-button.is-loading { opacity: .65; pointer-events: none; }
.empty-state { padding: var(--space-4); color: var(--subtle); text-align: center; }
.panel.is-collapsed { width: 52px; min-width: 52px; overflow: hidden; }
```

- [ ] **Step 4: 验证通过**

Run: `node --test tests/demo-state.test.js`

Expected: PASS。

- [ ] **Step 5: 提交**

当前工作目录非 Git 仓库；不执行提交。

### Task 4: 重写 DOM 控制器并完成主要演示流程

**Files:**
- Modify: `script.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `demo-state.js` 的所有导出及页面 `data-*` 挂钩。
- Produces: `renderApp()`、`renderFiles(group)`、`renderMessages()`、`renderRecords()`、`openRecord(id)`、`persist()`。

- [ ] **Step 1: 写入失败测试**

```js
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
```

- [ ] **Step 2: 验证失败**

Run: `node --test tests/demo-state.test.js`

Expected: FAIL，持久化尚未覆盖记录数据或状态不完整。

- [ ] **Step 3: 实现控制器**

将 `script.js` 改为模块脚本，导入状态 API。以事件委托绑定动态列表：文件行选中/删除、分组全选、上传点击/拖拽、纳入知识库、工具切换、发送消息、保存笔记、记录打开和更多菜单。每次状态改变都按 `mutate → persist → render` 顺序处理。生成时先渲染临时加载记录，`setTimeout` 700ms 后调用 `createRecord` 并插入助手答复。对空消息或无选中来源显示具体 Toast。

- [ ] **Step 4: 验证通过**

Run: `node --test tests/demo-state.test.js`

Expected: PASS，且重新加载的数据保持一致。

- [ ] **Step 5: 提交**

当前工作目录非 Git 仓库；不执行提交。

### Task 5: 完成编辑器、版本、下载与辅助操作

**Files:**
- Modify: `script.js`
- Modify: `tests/demo-state.test.js`

**Interfaces:**
- Consumes: 当前 `activeRecordId` 和 `updateRecord`、`restoreVersion`。
- Produces: `downloadText(record)`、`applyRewrite(record, action, instruction)`、`saveCurrentVersion()`。

- [ ] **Step 1: 写入失败测试**

```js
import { buildDownloadText, rewriteContent } from '../demo-state.js';
test('下载文本包含记录标题和正文', () => {
  assert.equal(buildDownloadText({ title: '培训通知', content: '正文内容' }), '培训通知\n\n正文内容');
});
test('全文缩写生成比原文短的演示文本', () => {
  const source = '这是用于测试缩写操作的较长正文内容。'.repeat(8);
  assert.ok(rewriteContent(source, 'shorten').length < source.length);
});
```

- [ ] **Step 2: 验证失败**

Run: `node --test tests/demo-state.test.js`

Expected: FAIL，缺少下载和改写函数。

- [ ] **Step 3: 实现编辑与下载操作**

在状态模块中实现 `buildDownloadText` 和四种 `rewriteContent` 分支（expand、shorten、rewrite、continue）。在控制器中将标题点击改为内联编辑或现有 prompt；正文 `input` 事件防抖保存；改写按钮和提交修改要求调用 `updateRecord`；版本列表渲染后支持选择、还原和更多菜单。下载操作使用：

```js
const blob = new Blob([buildDownloadText(record)], { type: 'text/plain;charset=utf-8' });
const url = URL.createObjectURL(blob);
const link = Object.assign(document.createElement('a'), { href: url, download: `${record.title}.txt` });
link.click();
URL.revokeObjectURL(url);
```

清空文本应先 `window.confirm`，复制失败时显示“浏览器不允许自动复制，请手动复制”。结果栏收起、目录锚点、个人菜单都应有实际可见结果。

- [ ] **Step 4: 验证通过**

Run: `node --test tests/demo-state.test.js`

Expected: PASS。

- [ ] **Step 5: 提交**

当前工作目录非 Git 仓库；不执行提交。

### Task 6: 端到端手工验收与收尾

**Files:**
- Modify: `README.md`（仅在不存在说明时创建）

**Interfaces:**
- Consumes: 本地静态服务器 `python -m http.server 8080 --bind 127.0.0.1`。
- Produces: 可复现的运行、演示和测试说明。

- [ ] **Step 1: 运行所有自动化测试**

Run: `node --test tests/demo-state.test.js`

Expected: PASS，0 failures。

- [ ] **Step 2: 启动并手工检查页面**

Run: `python -m http.server 8080 --bind 127.0.0.1`

浏览 `http://127.0.0.1:8080/`，依次测试：添加合法/非法文件、全选、纳入知识库、发送问题、打开记录、编辑正文、执行缩写、还原版本、下载、刷新恢复。

- [ ] **Step 3: 写入使用说明**

在 `README.md` 写明运行命令、测试命令、本地演示范围和不接真实后端的限制。

- [ ] **Step 4: 最终验证**

Run: `node --test tests/demo-state.test.js`

Expected: PASS。

- [ ] **Step 5: 提交**

当前工作目录非 Git 仓库；不执行提交。
