const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const demoRoot = path.resolve(__dirname, '..');

test('技术标详情页加载独立正文配置弹窗', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'technical-detail-active.html'), 'utf8');
  assert.match(html, /assets\/technical-body-config-modal\.js(?:\?v=[^"]+)?/);
  assert.match(html, /assets\/technical-quick-generation-feedback\.js/);
  assert.match(html, /assets\/technical-body-config-modal\.css(?:\?v=[^"]+)?/);
  assert.match(html, /assets\/technical-interpretation-task\.js(?:\?v=[^"]+)?/);
});

test('点击技术标 01 技术要求解读只在结果区创建带步骤的 Loading 任务', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-interpretation-task.js'), 'utf8');
  assert.match(source, /#result-panel \.tool-grid button/);
  assert.match(source, /技术要求解读/);
  assert.match(source, /技术要求解读_/);
  assert.match(source, /正在处理中（1\/5）/);
  assert.match(source, /处理进度/);
  assert.match(source, /stopImmediatePropagation/);
  assert.doesNotMatch(source, /chat-input/);
  assert.doesNotMatch(source, /requestSubmit/);
});

test('内置引导问题识别建设项目文件并保留完整交互', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'technical-detail-active.html'), 'utf8');
  const detailSource = fs.readFileSync(path.join(demoRoot, 'assets', 'detail-active-dX2M24J1.js'), 'utf8');
  const cleanupSource = fs.readFileSync(path.join(demoRoot, 'assets', 'remove-chat-group.js'), 'utf8');
  const promptEntrySource = fs.readFileSync(path.join(demoRoot, 'assets', 'active-built-in-prompt-entries.js'), 'utf8');
  assert.match(html, /active-built-in-prompt-entries\.js/);
  assert.match(detailSource, /\/\(招标\|竞选文件\|建设项目\)\/\.test\(e\.name\)/);
  assert.match(detailSource, /activePromptOptions=\[`请输入您的问题\.\.\.`/);
  assert.match(detailSource, /activePromptText=Q\(\(\)=>`请输入您的问题\.\.\.`\)/);
  assert.match(detailSource, /activeSendText=Q\(\(\)=>E\.value\.trim\(\)\)/);
  assert.match(detailSource, /根据招标文件生成技术标大纲。/);
  assert.match(detailSource, /根据技术标大纲撰写投标正文。/);
  assert.match(cleanupSource, /if \(!mode\) return;/);
  assert.match(promptEntrySource, /data-active-built-in-prompt/);
  assert.match(promptEntrySource, /\[data-active-built-in-prompts\]/);
  assert.match(promptEntrySource, /latestAssistant\.after\(bar\)/);
  assert.match(promptEntrySource, /\.context-suggestions/);
  assert.match(promptEntrySource, /requestSubmit/);
});

test('生成大纲弹窗提交后增强结果区技术大纲 Loading 任务并显示步骤', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-interpretation-task.js'), 'utf8');
  assert.match(source, /tender:outline-generated/);
  assert.match(source, /技术标投标大纲_/);
  assert.match(source, /技术大纲_/);
  assert.match(source, /enhanceOutlineProcessingRow/);
  assert.match(source, /正在处理中（1\/5）/);
  assert.match(source, /data-outline-progress-step/);
  assert.match(source, /scheduleOutlineProgress/);
  assert.match(source, /if \(enhanced\) list\.prepend\(existing\)/);
});

test('技术标招标文件解读结果不再误用标前解读前缀', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-interpretation-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-interpretation-modal.css'), 'utf8');
  assert.match(source, /technical-mode-page/);
  assert.match(source, /RESULT_PREFIX = IS_TECHNICAL_PAGE \? '技术要求解读_' : '标书要点解读_'/);
  assert.match(source, /标书要点解读_/);
  assert.match(source, /interpretation-result-label">解读结果<\/p>/);
  assert.doesNotMatch(source, /interpretation-result-label"><i>\*<\/i>解读结果/);
  assert.match(source, /data-interpretation-tab="overview"[^>]*>项目概述<\/button>/);
  assert.match(source, /data-interpretation-tab="score"[^>]*>评分项<\/button>/);
  assert.match(source, /data-interpretation-tab="response"[^>]*>技术点对点应答<\/button>/);
  assert.match(source, /switchResultTab/);
  assert.match(source, /const OUTLINE_PREFIX = '技术大纲_'/);
  assert.match(source, /createOutlineProcessingRecord/);
  assert.match(source, /正在处理中（1\/5）/);
  assert.match(source, /updateOutlineProgress/);
  assert.match(source, /正在处理中（\$\{current\}\/\$\{total\}）/);
  assert.doesNotMatch(source, /chat-input input\[aria-label="提问内容"\]/);
  assert.doesNotMatch(source, /requestSubmit/);
  assert.doesNotMatch(source, /interpretation-modal-footer/);
  assert.doesNotMatch(source, /interpretation-save-button/);
  assert.doesNotMatch(source, /interpretation-cancel-button/);
  assert.match(css, /\.interpretation-result-tab\.active::after/);
});

test('技术标生成大纲弹窗按页面模式显示解读术语', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-outline-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-outline-modal.css'), 'utf8');
  assert.match(source, /technical-mode-page/);
  assert.match(source, /INTERPRETATION_LABEL = IS_TECHNICAL_PAGE \? '招标文件解读' : '标前解读'/);
  assert.match(source, /技术要求解读_某高校高性能计算GPU集群建设项目/);
  assert.match(source, /getSourceFileName/);
  assert.match(source, /class="outline-preview-label">解读结果<\/p>/);
  assert.match(source, /class="outline-required-mark"[^>]*>\*<\/i>项目概述/);
  assert.match(source, /class="outline-required-mark"[^>]*>\*<\/i>评分项/);
  assert.match(source, /class="outline-required-mark"[^>]*>\*<\/i>技术点对点应答/);
  assert.match(source, /data-paste-field="overview"/);
  assert.match(source, /data-paste-field="score"/);
  assert.match(source, /data-paste-field="response"/);
  assert.match(source, /paste-mode-active/);
  assert.match(source, /请完整填写项目概述、评分项和技术点对点应答/);
  assert.match(source, /switchPreviewTab/);
  assert.match(css, /\.outline-preview-tab\.active::after/);
  assert.match(css, /\.paste-mode-active \.outline-preview-label/);
  assert.match(css, /\.paste-mode-active \.outline-paste-input/);
});

test('生成大纲可选择技术要求解读或标书要点文件，并要求补充点对点应答', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-outline-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'tender-outline-modal.css'), 'utf8');
  assert.match(source, /标书要点_/);
  assert.match(source, /标书要点解读_/);
  assert.match(source, /getGeneratedInterpretationFiles/);
  assert.match(source, /data-source-kind/);
  assert.match(source, /syncInterpretationSource/);
  assert.match(source, /outline-review-source-active/);
  assert.match(source, /aria-required/);
  assert.match(source, /技术点对点应答（必填）/);
  assert.match(css, /\.outline-review-source-active \.outline-preview-panel\[data-preview-panel="response"\]/);
  assert.match(css, /\.outline-review-source-active[\s\S]*\.outline-required-mark/);
});

test('技术标撰写全文入口打开配置弹窗并生成正文记录', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-body-config-modal.js'), 'utf8');
  assert.match(source, /03/);
  assert.match(source, /撰写全文/);
  assert.match(source, /技术大纲_/);
  assert.match(source, /技术正文_/);
  assert.match(source, /选择已生成大纲/);
  assert.match(source, /粘贴大纲内容/);
  assert.match(source, /请输入大纲内容/);
  assert.match(source, /outlineMode/);
  assert.match(source, /technical:body-generated/);
  assert.match(source, /正在处理中（1\/5）/);
  assert.match(source, /为缩短等待时长，本次将优先生成技术标前三章/);
  assert.match(source, /list\.prepend\(row\)/);
  assert.doesNotMatch(source, /const existing = Array\.from\(list\.querySelectorAll\('\.processing-row'\)\)/);
});

test('已生成技术标大纲记录打开独立结果工作台', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'technical-detail-active.html'), 'utf8');
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-outline-result-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-outline-result-modal.css'), 'utf8');
  assert.match(html, /technical-outline-result-modal\.css/);
  assert.match(html, /technical-outline-result-modal\.js/);
  assert.match(source, /const PREFIX = '技术大纲_'/);
  assert.match(source, /#result-panel \.record-row \.record-main/);
  assert.match(source, /data-regenerate[^>]*>[\s\S]*重新生成/);
  assert.match(source, /data-outline-download[^>]*>[\s\S]*下载/);
  assert.match(source, /data-generate-body[^>]*>立即生成全文/);
  assert.match(source, /technical:generate-full-from-outline/);
  assert.match(source, /招标文件[\s\S]*评分点[\s\S]*项目概述/);
  assert.match(source, /调整目录层级/);
  assert.match(source, /data-outline-command-chip/);
  assert.match(source, /enterLevelMode/);
  assert.match(source, /exitLevelMode/);
  assert.match(source, /openChapterDialog/);
  assert.match(source, /编写思路[\s\S]*重新生成本章节/);
  assert.match(source, /新增下一章节[\s\S]*生成并新增/);
  assert.match(source, /删除章节[\s\S]*确定删除该章节吗/);
  assert.match(source, /data-dialog-chapter-title/);
  assert.match(source, /data-dialog-writing-idea/);
  assert.match(source, /insertAdjacentElement\('afterend'/);
  assert.match(source, /chapter\.remove\(\)/);
  assert.match(source, /modal\.__startOutlineLoading\?\./);
  assert.match(source, /URL\.createObjectURL/);
  assert.match(css, /\.technical-outline-actions \.secondary[\s\S]*linear-gradient\(100deg, #1677ff 0%, #7b61ff 100%\)/);
  assert.doesNotMatch(source, /下载已开始，请在浏览器下载区域查看/);
  assert.match(source, /技术标目录/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(css, /grid-template-columns:\s*minmax\(700px, 1fr\) 342px/);
  assert.match(css, /\.technical-outline-command-chip/);
  assert.match(css, /\.technical-outline-dialog-backdrop/);
  assert.match(css, /\.technical-outline-dialog\.is-delete/);
  assert.match(css, /\.technical-outline-dialog-primary:disabled/);
  assert.match(css, /\.technical-outline-actions \.regenerate/);
  assert.match(css, /\.technical-outline-actions \.primary/);
  assert.match(css, /justify-content:\s*center;\s*width:\s*116px/);
  assert.match(css, /data-dialog-writing-idea\]\s*\{[^}]*font-size:\s*18px/s);
  assert.match(css, /technical-outline-prompt textarea\s*\{[^}]*pointer-events:\s*auto/s);
});

test('技术大纲立即生成全文会新增正文 Loading 记录并显示提示', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-quick-generation-feedback.js'), 'utf8');
  assert.match(source, /technical:generate-full-from-outline/);
  assert.match(source, /forceNew/);
  assert.match(source, /技术正文_/);
  assert.match(source, /为缩短等待时长，本次将优先生成技术标前三章/);
});

test('一键生成技术标先打开独立确认弹窗，确认后只创建正文 Loading 记录', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-quick-generation-feedback.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-body-config-modal.css'), 'utf8');
  assert.match(source, /#result-panel \.quick-mode \.quick-action/);
  assert.match(source, /technical-quick-confirm-modal/);
  assert.match(source, /data-quick-confirm-confirm/);
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(source, /settle\(\{ forceNew: true \}\)/);
  assert.match(source, /一键生成技术标将使用系统默认配置/);
  assert.match(css, /\.technical-quick-confirm-dialog/);
  assert.match(css, /\.technical-quick-confirm-primary/);
});

test('新增 Loading 记录支持停止任务并删除及二次确认', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'technical-detail-active.html'), 'utf8');
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-processing-task-actions.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-processing-task-actions.css'), 'utf8');
  assert.match(html, /technical-processing-task-actions\.css/);
  assert.match(html, /technical-processing-task-actions\.js/);
  assert.match(source, /technical-interpretation-processing/);
  assert.match(source, /technical-outline-processing/);
  assert.match(source, /technical-body-processing/);
  assert.match(source, /停止任务并删除/);
  assert.match(source, /是否取消并删除正在生成的/);
  assert.match(source, /data-technical-task-confirm-delete/);
  assert.match(source, /row\.remove\(\)/);
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(css, /technical-task-menu/);
  assert.match(css, /technical-task-confirm-backdrop/);
});

test('已生成技术标正文记录打开正文结果工作台并支持双 Tab', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'technical-detail-active.html'), 'utf8');
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-body-result-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-body-result-modal.css'), 'utf8');
  assert.match(html, /technical-body-result-modal\.css/);
  assert.match(html, /technical-body-result-modal\.js/);
  assert.match(html, /technical-file-content\.js/);
  assert.match(source, /const PREFIX = '技术正文_'/);
  assert.match(source, /window\.technicalFileContent/);
  assert.match(source, /renderEditorSections/);
  assert.match(source, /data-node-id/);
  assert.match(source, /正文编写/);
  assert.match(source, /目录及设置/);
  assert.match(source, /data-result-tab/);
  assert.match(source, /data-generate-all[^>]*>[\s\S]*重新编写/);
  assert.match(source, /openRewriteDialog/);
  assert.match(source, /重新编写需求/);
  assert.match(source, /data-rewrite-submit/);
  assert.match(source, /technical-body-rewrite-loading/);
  assert.match(source, /正在重新编写/);
  assert.doesNotMatch(source, /一键扩写/);
  assert.match(source, /data-outline-generate/);
  assert.match(source, /renderOutlineSettings/);
  assert.match(source, /outline-settings-row/);
  assert.match(source, /addProcessingRecord/);
  assert.match(source, /正在处理中（1\/5）/);
  assert.match(source, /为缩短等待时长，本次将优先生成技术标前三章/);
  assert.match(source, /精准编写/);
  assert.match(source, /插入表格/);
  assert.match(source, /data-selection-tools/);
  assert.match(source, /data-outline-action="查看正文" data-tooltip="查看正文"/);
  assert.match(source, /data-outline-action="章节设置" data-tooltip="章节设置"/);
  assert.match(source, /data-outline-action="新增子章节" data-tooltip="新增子章节"/);
  assert.match(source, /data-outline-action="一键编写" data-tooltip="一键编写"/);
  assert.match(source, /data-outline-action="删除章节" data-tooltip="删除章节"/);
  assert.match(source, /outline-preview-glyph/);
  assert.match(source, /event\.stopImmediatePropagation\(\)/);
  assert.match(css, /grid-template-columns: 248px minmax\(0, 1fr\)/);
  assert.match(css, /outline-actions button\[data-tooltip\]:hover::after/);
});

test('技术标正文工作台支持精准编写和下载本章独立配置弹窗', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-body-result-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-body-result-modal.css'), 'utf8');
  assert.match(source, /openPreciseDialog/);
  assert.match(source, /章节篇幅设置（段数即下级章节节点）/);
  assert.match(source, /章节方向/);
  assert.match(source, /data-precise-segments/);
  assert.match(source, /data-add-segment/);
  assert.match(source, /openChapterDownloadDialog/);
  assert.match(source, /页面设置/);
  assert.match(source, /标题层级/);
  assert.match(source, /标题样式/);
  assert.match(source, /正文设置/);
  assert.match(source, /编号设置/);
  assert.match(source, /data-level-mode/);
  assert.match(source, /data-download-confirm/);
  assert.match(css, /\.technical-body-precise-dialog\s*\{/);
  assert.match(css, /\.technical-body-download-dialog\s*\{/);
  assert.match(css, /\.technical-body-dialog-backdrop\s*\{/);
});

test('技术标结果区统一功能名称、文件前缀和分钟时间戳', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'technical-detail-active.html'), 'utf8');
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'technical-result-naming.js'), 'utf8');
  assert.match(html, /technical-result-naming\.js/);
  assert.match(source, /\['招标文件解读_', '技术要求解读_'\]/);
  assert.match(source, /\['技术标投标大纲_', '技术大纲_'\]/);
  assert.match(source, /\['技术标投标正文_', '技术正文_'\]/);
  assert.match(source, /_\\d\{12\}\$/);
  assert.match(source, /文件解读', '技术要求解读/);
  assert.match(source, /technical-tool-card-top/);
  assert.match(source, /technical-tool-card-label/);
});
