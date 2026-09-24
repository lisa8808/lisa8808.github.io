const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const demoRoot = path.join(__dirname, '..');
const scriptPath = path.join(demoRoot, 'assets', 'generated-record-actions.js');
const cssPath = path.join(demoRoot, 'assets', 'generated-record-actions.css');

test('技术部分与商务部分加载成功文件更多菜单资源', () => {
  assert.equal(fs.existsSync(scriptPath), true, '应提供成功文件更多菜单脚本');
  assert.equal(fs.existsSync(cssPath), true, '应提供成功文件更多菜单样式');
  for (const page of ['technical-detail-active.html', 'business-detail-active.html']) {
    const html = fs.readFileSync(path.join(demoRoot, page), 'utf8');
    assert.match(html, /assets\/generated-record-actions\.css/);
    assert.match(html, /assets\/generated-record-actions\.js/);
  }
});

test('成功文件更多菜单按模块和文件类型提供操作', () => {
  assert.equal(fs.existsSync(scriptPath), true, '应提供成功文件更多菜单脚本');
  const actions = require(scriptPath);

  assert.deepEqual(actions.actionsForRecord('technical', '技术要求解读_测试项目_202609161200'), ['generate-outline', 'download', 'view-prompt-source']);
  assert.deepEqual(actions.actionsForRecord('technical', '技术大纲_测试项目_202609161201'), ['generate-body', 'download', 'view-prompt-source']);
  assert.deepEqual(actions.actionsForRecord('technical', '技术正文_测试项目_202609161202'), ['download', 'view-prompt-source']);
  assert.deepEqual(actions.actionsForRecord('business', '商务大纲_测试项目_202609161203'), ['generate-body', 'download', 'view-prompt-source']);
  assert.deepEqual(actions.actionsForRecord('business', '商务正文_测试项目_202609161204'), ['download', 'view-prompt-source']);
  assert.deepEqual(actions.actionsForRecord('business', '招标文件解读_测试项目_202609161205'), []);
});

test('成功文件更多菜单支持三点和右键并执行生成或浏览器下载', () => {
  assert.equal(fs.existsSync(scriptPath), true, '应提供成功文件更多菜单脚本');
  const source = fs.readFileSync(scriptPath, 'utf8');

  assert.match(source, /contextmenu/);
  assert.match(source, /\.more-button/);
  assert.match(source, /生成大纲/);
  assert.match(source, /生成正文/);
  assert.match(source, /new Blob/);
  assert.match(source, /anchor\.download/);
  assert.match(source, /technical:generate-outline-from-interpretation/);
  assert.match(source, /technical:generate-full-from-outline/);
  assert.match(source, /business:generate-full-from-outline/);
  assert.match(source, /查看提示和来源/);
  assert.match(source, /生成提示/);
  assert.match(source, /引用来源/);
  assert.match(source, /openPromptSourceModal/);
  assert.match(source, /data-prompt-source-modal/);
  assert.doesNotMatch(source, /纳入知识库/);
});

test('查看提示和来源弹窗提供统一的只读视觉层', () => {
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.match(css, /\.generated-prompt-source-backdrop/);
  assert.match(css, /\.generated-prompt-source-modal/);
  assert.match(css, /\.generated-prompt-source-section/);
});

test('技术解读生成大纲和商务大纲生成正文都会新增处理记录', () => {
  const technicalSource = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-quick-generation-feedback.js'), 'utf8');
  const businessSource = fs.readFileSync(path.join(demoRoot, 'assets', 'business-mode-overrides.js'), 'utf8');

  assert.match(technicalSource, /technical:generate-outline-from-interpretation/);
  assert.match(technicalSource, /technical-outline-processing/);
  assert.match(businessSource, /business:generate-full-from-outline/);
  assert.match(businessSource, /addBodyProcessingRecord\(panel\)/);
});
