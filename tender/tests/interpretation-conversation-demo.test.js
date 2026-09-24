const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('标书研判中间对话区加载独立演示数据脚本', () => {
  const html = fs.readFileSync(path.join(root, 'interpretation-detail-active.html'), 'utf8');
  const source = fs.readFileSync(path.join(root, 'assets', 'interpretation-conversation-demo.js'), 'utf8');

  assert.match(html, /assets\/interpretation-conversation-demo\.js/);
  assert.match(source, /某高校高性能计算GPU集群建设项目/);
  assert.match(source, /标书要点解读/);
  assert.match(source, /投标符合性自评/);
  assert.match(source, /等待用户确认 · 正在确认【评估企业主体】/);
  assert.match(source, /1 份核心招标文件/);
  assert.match(source, /querySelector\('\.conversation-body'\)/);
  assert.doesNotMatch(source, /#result-panel|\.upload-panel/);
});

test('标书研判对话快捷指令覆盖要点解读和符合性自评场景', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'interpretation-conversation-demo.js'), 'utf8');

  assert.match(source, /帮我做标书要点解读/);
  assert.match(source, /帮我做投标符合性自评/);
  assert.match(source, /开展投标符合性自评/);
  assert.match(source, /选择评估企业主体/);
  assert.match(source, /pending-confirm-card/);
  assert.match(source, /pending-confirm-actions/);
  assert.match(source, /评估范围/);
  assert.match(source, /config-waiting/);
  assert.match(source, /用户确认/);
  assert.match(source, /确认并开始投标符合性自评/);
});

test('对话区追问问题点击后按对话主逻辑给确认项或配置弹窗', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'interpretation-conversation-demo.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'assets', 'interpretation-conversation-config.css'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'interpretation-detail-active.html'), 'utf8');

  // 追问问题点击：点击后走对话确认项（标书要点解读）或对话配置弹窗（投标符合性自评）
  assert.match(source, /message-suggestions:not\(\.pending-confirm-actions\)/);
  assert.match(source, /createConfirmActions/);
  assert.match(source, /settleCard/);
  assert.match(source, /conversation-config-panel/);
  assert.match(source, /标书要点解读确认/);
  assert.match(source, /投标符合性自评配置确认/);
  assert.match(source, /已确认标书要点解读配置/);
  assert.match(source, /已确认投标符合性自评配置/);
  assert.match(source, /配置已取消，此任务已取消/);
  assert.match(source, /data-prebid-config-interpretation/);
  assert.match(source, /data-prebid-config-company/);

  // 对话区不直接操作结果区与招标资料区，统一走桥接
  assert.match(source, /__prebidConversationBridge/);
  assert.doesNotMatch(source, /#result-panel|\.upload-panel/);

  assert.match(html, /assets\/interpretation-conversation-config\.css/);
  assert.match(css, /\.conversation-body\.prebid-config-open/);
});

test('标书研判结果区提供对话指令桥接，用于读取勾选状态与创建任务', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'interpretation-mode-actions.js'), 'utf8');

  assert.match(source, /window\.__prebidConversationBridge = \{/);
  assert.match(source, /coreTenderAvailable\(\)/);
  assert.match(source, /projectTenderFileName: getProjectTenderFileName/);
  assert.match(source, /interpretationFiles: listInterpretationFiles/);
  assert.match(source, /createInterpretationTask\(\)/);
  assert.match(source, /createAssessmentTask\(\)/);
});
