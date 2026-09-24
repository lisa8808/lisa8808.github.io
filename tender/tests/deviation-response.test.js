const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const demoRoot = path.resolve(__dirname, '..');
const configPath = path.join(demoRoot, 'assets', 'deviation-response-config.js');

test('技术标与商务标页面不再加载偏离响应入口和结果文件资源', () => {
  for (const fileName of ['technical-detail-active.html', 'business-detail-active.html']) {
    const html = fs.readFileSync(path.join(demoRoot, fileName), 'utf8');
    assert.doesNotMatch(html, /assets\/deviation-response-modal\.css/);
    assert.doesNotMatch(html, /assets\/deviation-response-config\.js/);
    assert.doesNotMatch(html, /assets\/deviation-response-modal\.js/);
  }
});

test('偏离响应配置按页面类型生成正确入口与结果文件名', () => {
  const config = require(configPath);
  const generatedAt = new Date(2026, 8, 10, 9, 7);
  assert.equal(config.getModeConfig('technical').actionLabel, '技术标偏离/响应');
  assert.equal(config.getModeConfig('business').actionLabel, '商务标偏离/响应');
  assert.equal(
    config.createStepRecordTitle('analysis', '某高校高性能计算GPU集群建设项目.docx', generatedAt),
    '响应解读_某高校高性能计算GPU集群建设项目_202609100907',
  );
  assert.equal(
    config.createStepRecordTitle('writing', '某高校高性能计算GPU集群建设项目.docx', generatedAt),
    '响应正文_某高校高性能计算GPU集群建设项目_202609100907',
  );
});

test('技术标与商务标分别保留需求规定的独立模块', () => {
  const config = require(configPath);
  const technicalModules = config.getModeConfig('technical').modules.map((item) => item.name);
  const businessModules = config.getModeConfig('business').modules.map((item) => item.name);

  assert.deepEqual(technicalModules, ['技术响应偏离表', '技术服务偏离表', '技术响应要求编写']);
  assert.deepEqual(businessModules, ['商务响应偏离表', '合同条款响应表', '商务响应要求编写']);
});

test('弹窗包含制式表格、非制式要求、风险和确认交互', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-modal.js'), 'utf8');
  assert.match(source, /制式表格填写/);
  assert.match(source, /响应要求编写/);
  assert.match(source, /招标文件未提供固定偏离\/响应表/);
  assert.match(source, /普通条款批量确认/);
  assert.match(source, /重点条款需逐条确认/);
  assert.match(source, /风险项/);
  assert.match(source, /导出响应文件/);
});

test('偏离响应页面加载专属功能入口脚本', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'deviation-detail-active.html'), 'utf8');
  assert.match(html, /assets\/deviation-mode-actions\.js/);
});

test('偏离响应页面显示两步精准模式和一键撰写入口', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');
  assert.match(source, /01<\/b> 偏离\/响应解读/);
  assert.match(source, /02<\/b> 偏离\/响应撰写/);
  assert.match(source, /一键撰写偏离\/响应/);
  assert.doesNotMatch(source, /标前解读分析|标前评估撰写/);
});

test('偏离响应入口按步骤创建对应命名的生成记录', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');
  assert.match(source, /createStepRecordTitle\(step, sourceFile\)/);
  assert.match(source, /bindAction\(preciseButtons\[0\], 'analysis'/);
  assert.match(source, /bindAction\(preciseButtons\[1\], 'writing'/);
  assert.match(source, /processing-row/);
  assert.match(source, /正在处理中/);
  assert.match(source, /addProcessingRecord/);
});

test('01 与 02 每次提交都新增带五步进度的处理中任务', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');

  assert.doesNotMatch(source, /该响应文件已在生成记录中/);
  assert.match(source, /const steps = step === 'analysis' \? ANALYSIS_STEPS : WRITING_STEPS/);
  assert.match(source, /正在处理中（/);
  assert.match(source, /progress-trigger/);
  assert.match(source, /progress-popover/);
  assert.match(source, /progress-step/);
  assert.match(source, /addProcessingRecord\(panel, 'writing', source\)/);
});

test('偏离响应处理中任务支持停止并删除及二次确认', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');

  assert.match(source, /result-menu task-menu deviation-task-menu/);
  assert.match(source, /data-deviation-stop-task/);
  assert.match(source, /openTaskDeleteConfirm/);
  assert.match(source, /confirm-backdrop deviation-task-confirm-backdrop/);
  assert.match(source, /role="alertdialog"/);
  assert.match(source, /停止并删除/);
  assert.match(source, /row\.remove\(\)/);
  assert.match(source, /任务已停止并删除/);
});

test('02 偏离响应撰写打开统一表单弹窗并要求选择响应解读与投标正文', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');
  const html = fs.readFileSync(path.join(demoRoot, 'deviation-detail-active.html'), 'utf8');
  assert.match(source, /偏离\/响应撰写/);
  assert.match(source, /响应解读/);
  assert.match(source, /商务标投标正文/);
  assert.match(source, /技术正文/);
  assert.match(source, /openWritingModal/);
  assert.match(source, /data-deviation-analysis/);
  assert.match(source, /data-deviation-bid-file/);
  assert.match(source, /data-bid-type="business"/);
  assert.match(source, /data-bid-type="technical"/);
  assert.doesNotMatch(source, /type="checkbox"[^>]*data-deviation-bid-file/);
  assert.match(source, /立即撰写/);
  assert.match(html, /deviation-response-writing-modal\.css/);
});

test('偏离响应撰写优先选择已生成正文并提供单一自行上传入口', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-writing-modal.css'), 'utf8');

  assert.match(source, /data-deviation-bid-mode="generated"/);
  assert.match(source, /data-deviation-bid-mode="upload"/);
  assert.match(source, /自行上传/);
  assert.match(source, /选择已生成投标正文/);
  assert.ok(
    source.indexOf('data-deviation-bid-mode="generated"') < source.indexOf('data-deviation-bid-mode="upload"'),
    '选择已生成投标正文应排在自行上传前面',
  );
  assert.match(source, /data-deviation-upload="bid-document"/);
  assert.doesNotMatch(source, /data-deviation-upload="business"/);
  assert.doesNotMatch(source, /data-deviation-upload="technical"/);
  assert.match(source, /商务部分/);
  assert.match(source, /技术部分/);
  assert.match(source, /accept="\.pdf,\.docx,\.doc"/);
  assert.doesNotMatch(source, /data-deviation-upload="bid-document"[^>]*multiple/);
  assert.doesNotMatch(source, /accept="[^"]*\.wps/);
  assert.match(source, /PDF、DOCX、DOC/);
  assert.match(source, /不超过200M/);
  assert.match(source, /仅支持上传1个文件/);
  assert.match(source, /data-deviation-source-panel/);
  assert.match(source, /setBidSourceMode/);
  assert.match(css, /deviation-writing-source-tabs/);
  assert.match(css, /deviation-writing-upload-card/);
  assert.match(css, /deviation-writing-generated-group/);
  assert.match(css, /data-deviation-source-panel="generated"\]:not\(\[hidden\]\)/);
});

test('自行上传限制单文件200M并在上传后显示文件与重新上传入口', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-writing-modal.css'), 'utf8');

  assert.match(source, /const MAX_BID_UPLOAD_BYTES = 200 \* 1024 \* 1024/);
  assert.match(source, /const SUPPORTED_BID_UPLOAD_EXTENSIONS = \['pdf', 'docx', 'doc'\]/);
  assert.match(source, /data-deviation-upload-empty/);
  assert.match(source, /data-deviation-upload-file/);
  assert.match(source, /data-deviation-upload-file-name/);
  assert.match(source, /data-deviation-upload-file-meta/);
  assert.match(source, /data-deviation-reupload/);
  assert.match(source, /投标正文仅支持 PDF、DOCX、DOC 格式/);
  assert.match(source, /投标正文大小不能超过 200M/);
  assert.match(source, /let uploadedBidFile = null/);
  assert.match(source, /uploadedBidFile = file/);
  assert.match(source, /const uploadedFiles = uploadedBidFile \? 1 : 0/);
  assert.match(css, /deviation-writing-upload-file/);
  assert.match(css, /deviation-writing-reupload/);
});

test('精准与一键撰写选择已生成正文时商务和技术至少选择一项', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');

  assert.match(source, /const hasBidSource = activeBidMode === 'upload' \? uploadedFiles > 0 : selectedBidFiles\.length > 0/);
  assert.match(source, /请至少选择一份商务部分或技术部分投标正文/);
  assert.match(source, /openWritingModal\(panel, \{ quickMode: true \}\)/);
});

test('一键撰写使用独立标题并隐藏响应解读字段', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');

  assert.match(source, /openWritingModal\(panel, \{ quickMode: true \}\)/);
  assert.match(source, /quickMode \? '一键撰写偏离响应' : '偏离\/响应撰写'/);
  assert.match(source, /quickMode \? '' : analysisFieldMarkup/);
  assert.match(source, /const analysisValid = quickMode \|\| Boolean\(analysis\)/);
  assert.match(source, /bindAction\(quickButton, 'writing', 'deviationQuickActionBound', true\)/);
});

test('偏离响应页统一改写旧生成记录前缀并保持任务持续转圈', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-mode-actions.js'), 'utf8');
  assert.match(source, /标书要点解读_/);
  assert.match(source, /响应解读_/);
  assert.match(source, /投标自评_/);
  assert.match(source, /响应正文_/);
  assert.match(source, /normalizeExistingRecordTitles/);
  assert.match(source, /正在处理中/);
  assert.doesNotMatch(source, /setTimeout\(\(\) => completeRecord/);
  assert.doesNotMatch(source, /status\.textContent = '已生成'/);
});

test('响应解读记录打开框架提取结果弹窗', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-analysis-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-analysis-modal.css'), 'utf8');
  const html = fs.readFileSync(path.join(demoRoot, 'deviation-detail-active.html'), 'utf8');
  assert.match(source, /响应解读_/);
  assert.match(source, /框架提取/);
  assert.match(source, /提取目录/);
  assert.match(source, /制式表格/);
  assert.match(source, /data-analysis-module/);
  assert.match(source, /getModeConfig\('technical'\)/);
  assert.match(source, /getModeConfig\('business'\)/);
  assert.match(source, /record-row|processing-row/);
  assert.match(source, /if \(main\.matches\('\.processing-row'\)\) return;/);
  assert.match(css, /grid-template-columns/);
  assert.match(css, /business-outline/);
  assert.match(html, /deviation-response-analysis-modal\.css/);
  assert.match(html, /deviation-response-analysis-modal\.js/);
  assert.match(html, /business-outline-result-modal\.css/);
  assert.ok(
    html.indexOf('business-outline-result-modal.css') < html.indexOf('deviation-response-analysis-modal.css'),
    '响应解读弹窗应先加载商务标大纲基础样式，再加载专属覆盖样式',
  );
});

test('响应解读弹窗仅展示抽取框架并将评分索引置顶', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-analysis-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-analysis-modal.css'), 'utf8');

  assert.match(source, /name: '评分索引'/);
  assert.match(source, /const modules = \[scoreIndexModule, /);
  assert.match(source, /响应内容/);
  assert.match(source, /对应页码/);
  assert.match(source, /analysis-empty-cell/);
  assert.match(source, /const isWriting = resultType === 'writing'/);
  assert.match(source, /: '<td class="analysis-empty-cell" aria-label="待撰写响应内容"><\/td>/);
  assert.match(source, /当前为框架抽取结果，响应内容及偏离选项将在“偏离\/响应撰写”中填写/);
  assert.match(css, /\.analysis-empty-cell/);
});

test('响应正文记录复用分析结果弹窗并展示已填写内容', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-analysis-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'deviation-response-analysis-modal.css'), 'utf8');

  assert.match(source, /响应正文_/);
  assert.match(source, /撰写结果/);
  assert.match(source, /resultType === 'writing'/);
  assert.match(source, /escapeHtml\(row\.response\)/);
  assert.match(source, /escapeHtml\(row\.deviation\)/);
  assert.match(source, /对应响应内容/);
  assert.match(source, /文件来源/);
  assert.match(source, /对应页码/);
  assert.match(source, /对应页码按要求保留为空/);
  assert.match(source, /if \(main\.matches\('\.processing-row'\)\) return;/);
  assert.match(css, /\.analysis-response-cell/);
  assert.match(css, /\.analysis-tag/);
});
