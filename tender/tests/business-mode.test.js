const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const demoRoot = path.join(__dirname, '..');
const pagePath = path.join(demoRoot, 'business-detail-active.html');
const configPath = path.join(demoRoot, 'assets', 'business-mode-config.js');

test('商务标页面加载独立的商务标模式覆盖脚本', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /assets\/business-mode-overrides\.js/);
});

test('商务标精准模式只有 01 生成大纲和 02 撰写全文', () => {
  const config = require(configPath);
  assert.deepEqual(config.preciseModes, [
    { number: '01', name: '生成大纲' },
    { number: '02', name: '撰写全文' },
  ]);
});

test('商务标快速模式使用一键生成商务标', () => {
  const config = require(configPath);
  assert.equal(config.quickModeName, '一键生成商务标');
});

test('商务标大纲和正文文件名包含招标文件名称及生成时间到分', () => {
  const config = require(configPath);
  const generatedAt = new Date(2026, 8, 10, 14, 35);

  assert.equal(config.formatGenerationMinute(generatedAt), '202609101435');
  assert.equal(
    config.createOutlineTaskTitle('某高校高性能计算GPU集群建设项目.docx', generatedAt),
    '商务大纲_某高校高性能计算GPU集群建设项目_202609101435',
  );
  assert.equal(
    config.createBodyTaskTitle('某高校高性能计算GPU集群建设项目.docx', generatedAt),
    '商务正文_某高校高性能计算GPU集群建设项目_202609101435',
  );
});

test('商务标顶部栏和结果弹窗使用统一项目名称', () => {
  const config = require(configPath);
  const modal = require(path.join(demoRoot, 'assets', 'business-outline-result-modal.js'));
  assert.equal(config.projectName, '某高校高性能计算GPU集群建设项目');
  assert.equal(modal.PROJECT_NAME, '某高校高性能计算GPU集群建设项目');
});

test('商务标生成记录中的旧技术标文件名统一转换为新商务大纲格式', () => {
  const config = require(configPath);
  assert.equal(
    config.normalizeRecordText('技术标投标大纲_某高校高性能计算GPU集群建设项目', new Date(2026, 8, 10, 14, 35)),
    '商务大纲_某高校高性能计算GPU集群建设项目_202609101435',
  );
  assert.equal(config.normalizeRecordText('一键生成技术标'), '一键生成商务标');
  assert.equal(config.normalizeRecordText('某高校高性能计算GPU集群建设项目.docx'), '某高校高性能计算GPU集群建设项目.docx');
});

test('商务标生成大纲入口先打开确认弹窗而不是直接创建任务', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-mode-overrides.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const bindStart = source.indexOf('const bindOutlineGeneration');
  const bindEnd = source.indexOf('const setModeLabel', bindStart);
  const bindBlock = source.slice(bindStart, bindEnd);
  assert.match(source, /business-outline-config-modal/);
  assert.match(source, /其他生成要求/);
  assert.match(source, /data-outline-config-confirm/);
  assert.match(bindBlock, /openOutlineConfigModal\(panel,\s*outlineButton\)/);
  assert.doesNotMatch(bindBlock, /addOutlineProcessingRecord\(panel\)/);
});

test('商务标只有确认生成大纲后才追加生成中记录', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-mode-overrides.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const confirmStart = source.indexOf('const confirmOutlineGeneration');
  const confirmEnd = source.indexOf('const openOutlineConfigModal', confirmStart);
  const confirmBlock = source.slice(confirmStart, confirmEnd);
  assert.match(confirmBlock, /addOutlineProcessingRecord\(panel\)/);
  assert.match(confirmBlock, /data-outline-config-requirements/);
});

test('商务标页面加载生成大纲确认弹窗样式', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /assets\/business-outline-config-modal\.css/);
});

test('商务标生成大纲弹窗遵循统一蓝白弹窗规范', () => {
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-config-modal.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /background:\s*rgba\(24, 32, 46, \.42\)/);
  assert.match(css, /width:\s*min\(720px, calc\(100vw - 48px\)\)/);
  assert.match(css, /border-radius:\s*12px/);
  assert.match(css, /flex:\s*0 0 62px/);
  assert.match(css, /border-bottom:\s*1px solid #e8edf4/);
  assert.match(css, /font-size:\s*18px/);
  assert.doesNotMatch(css, /width:\s*min\(1484px/);
  assert.doesNotMatch(css, /border-radius:\s*28px/);
});

test('商务标页面加载生成正文确认弹窗样式', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /assets\/business-body-config-modal\.css/);
});

test('点击商务标撰写全文入口先打开正文配置弹窗', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-mode-overrides.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const bindStart = source.indexOf('const bindBodyGeneration');
  const bindEnd = source.indexOf('const setModeLabel', bindStart);
  const bindBlock = source.slice(bindStart, bindEnd);
  assert.match(source, /business-body-config-modal/);
  assert.match(source, /选择已生成大纲/);
  assert.match(source, /data-body-config-submit/);
  assert.match(bindBlock, /preciseButtons\[2\]/);
  assert.match(bindBlock, /openBodyConfigModal\(panel/);
  assert.doesNotMatch(bindBlock, /addBodyProcessingRecord\(panel\)/);
});

test('商务标正文生成记录必须使用原标书名称', () => {
  const config = require(configPath);
  assert.equal(config.bodyTaskStatus, '正在处理');
  assert.equal(
    config.createBodyTaskTitle('某高校高性能计算GPU集群建设项目.docx', new Date(2026, 8, 10, 14, 35)),
    '商务正文_某高校高性能计算GPU集群建设项目_202609101435',
  );
});

test('商务标正文弹窗只读取结果区已生成的大纲文件', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-mode-overrides.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const recordsStart = source.indexOf('const getGeneratedOutlineRecords');
  const recordsEnd = source.indexOf('const addBodyProcessingRecord', recordsStart);
  const recordsBlock = source.slice(recordsStart, recordsEnd);
  assert.match(recordsBlock, /\.record-row/);
  assert.match(recordsBlock, /商务大纲_/);
  assert.match(recordsBlock, /!row\.classList\.contains\('processing-row'\)/);
});

test('商务标未选择大纲时不能提交，提交后才追加正文处理中记录', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-mode-overrides.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const submitStart = source.indexOf('const submitBodyGeneration');
  const submitEnd = source.indexOf('const openBodyConfigModal', submitStart);
  const submitBlock = source.slice(submitStart, submitEnd);
  assert.match(submitBlock, /selectedOutline/);
  assert.match(submitBlock, /addBodyProcessingRecord\(panel/);
  assert.match(submitBlock, /return/);
  assert.match(source, /data-body-config-outline/);
});

test('商务标每次有效生成正文提交都新增处理中记录', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );
  const bodyStart = source.indexOf('const addBodyProcessingRecord');
  const bodyEnd = source.indexOf('const closeOutlineConfigModal', bodyStart);
  const bodyBlock = source.slice(bodyStart, bodyEnd);

  assert.doesNotMatch(bodyBlock, /hasExistingTask/);
  assert.doesNotMatch(bodyBlock, /data\.businessBodyTask === titleText/);
});

test('商务标撰写全文必须同时选择已生成大纲和投标企业', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );
  const submitStart = source.indexOf('const submitBodyGeneration');
  const submitEnd = source.indexOf('const openBodyConfigModal', submitStart);
  const submitBlock = source.slice(submitStart, submitEnd);

  assert.match(source, /data-body-config-company/);
  assert.match(source, /选择投标企业/);
  assert.match(submitBlock, /selectedCompany/);
  assert.match(submitBlock, /!selectedOutline \|\| !selectedCompany/);
  assert.match(source, /Boolean\(outlineSelect\?\.value\.trim\(\) && companySelect\?\.value\.trim\(\)\)/);
});

test('商务标撰写全文弹窗选择完成后不显示已选大纲和企业摘要', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );

  assert.doesNotMatch(source, /已选择大纲：/);
  assert.doesNotMatch(source, /；企业：/);
});

test('商务标一键生成先弹出投标企业选择并确认后创建正文任务', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );
  const bindStart = source.indexOf('const bindQuickGeneration');
  const bindEnd = source.indexOf('const setModeLabel', bindStart);
  const bindBlock = source.slice(bindStart, bindEnd);

  assert.match(source, /data-business-quick-config/);
  assert.match(source, /data-quick-config-company/);
  assert.match(source, /一键生成商务标/);
  assert.match(bindBlock, /openQuickConfigModal\(panel, quickButton\)/);
  assert.match(source, /addBodyProcessingRecord\(panel\)/);
  assert.match(source, /const selected = Boolean\(companySelect\?\.value\.trim\(\)\)/);
  assert.doesNotMatch(source, /trigger\.dataset\.businessQuickBypass/);
});

test('商务标一键生成提交后在右侧新增商务正文生成中记录', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );
  const submitStart = source.indexOf('const submitQuickGeneration');
  const submitEnd = source.indexOf('const openQuickConfigModal', submitStart);
  const submitBlock = source.slice(submitStart, submitEnd);

  assert.match(submitBlock, /closeQuickConfigModal\(modal\)/);
  assert.match(submitBlock, /addBodyProcessingRecord\(panel\)/);
  assert.doesNotMatch(submitBlock, /trigger\.click\(\)/);
  assert.doesNotMatch(submitBlock, /businessQuickBypass/);
});

test('商务标大纲与正文生成中记录显示处理进度和步骤', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );
  const outlineStart = source.indexOf('const addOutlineProcessingRecord');
  const outlineEnd = source.indexOf('const getGeneratedOutlineRecords', outlineStart);
  const bodyStart = source.indexOf('const addBodyProcessingRecord');
  const bodyEnd = source.indexOf('const closeBodyConfigModal', bodyStart);

  assert.match(source, /const createProcessingProgress/);
  assert.match(source, /处理进度/);
  assert.match(source, /解析招标文件/);
  assert.match(source, /生成结果文件/);
  assert.match(source.slice(outlineStart, outlineEnd), /createProcessingProgress\(config\.outlineTaskStatus\)/);
  assert.match(source.slice(bodyStart, bodyEnd), /createProcessingProgress\(config\.bodyTaskStatus\)/);
});

test('商务大纲结果右上角依次显示重新生成大纲、下载、招标文件开关和立即生成全文', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-outline-result-modal.js'),
    'utf8',
  );
  const regenerate = source.indexOf('data-regenerate');
  const download = source.indexOf('data-outline-download', regenerate);
  const sourceToggle = source.indexOf('data-source-toggle', download);
  const generateBody = source.indexOf('data-generate-body', sourceToggle);

  assert.ok(regenerate >= 0);
  assert.ok(download > regenerate);
  assert.ok(sourceToggle > download);
  assert.ok(generateBody > sourceToggle);
  assert.match(source, /重新生成大纲/);
  assert.match(source, /立即生成全文/);
});

test('商务大纲重新生成必须填写要求并在确认后展示 Loading', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-outline-result-modal.js'),
    'utf8',
  );
  const css = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-outline-result-modal.css'),
    'utf8',
  );

  assert.match(source, /data-regenerate-prompt[^>]*required/);
  assert.match(source, /data-regenerate-error/);
  assert.match(source, /data-outline-regenerating/);
  assert.match(source, /is-regenerating/);
  assert.match(css, /\.outline-regenerating/);
  assert.match(css, /\.is-regenerating/);
});

test('商务大纲下载调用浏览器下载，立即生成全文创建商务正文记录', () => {
  const modalSource = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-outline-result-modal.js'),
    'utf8',
  );
  const modeSource = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );

  assert.match(modalSource, /new Blob/);
  assert.match(modalSource, /anchor\.download/);
  assert.match(modalSource, /business:generate-full-from-outline/);
  assert.match(modeSource, /business:generate-full-from-outline/);
  assert.match(modeSource, /addBodyProcessingRecord\(panel\)/);
});

test('商务标新增的生成中记录复用更多菜单及停止任务删除交互', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'technical-processing-task-actions.js'),
    'utf8',
  );
  const css = fs.readFileSync(
    path.join(demoRoot, 'assets', 'technical-processing-task-actions.css'),
    'utf8',
  );

  assert.match(html, /technical-processing-task-actions\.css/);
  assert.match(html, /technical-processing-task-actions\.js/);
  assert.match(source, /\.business-outline-processing/);
  assert.match(source, /\.business-body-processing/);
  assert.match(source, /停止任务并删除/);
  assert.match(source, /data-technical-task-confirm-delete/);
  assert.match(css, /\.business-outline-processing/);
  assert.match(css, /\.business-body-processing/);
});

test('商务标两个企业选择弹窗只显示选择投标企业字段', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );
  const css = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-body-config-modal.css'),
    'utf8',
  );
  assert.doesNotMatch(source, /请选择用于编写商务标的企业主体/);
  assert.doesNotMatch(source, /请选择用于生成商务标的企业主体/);
  assert.doesNotMatch(source, /<h3 id="business-body-config-company-title">投标企业<\/h3>/);
  assert.doesNotMatch(source, /<h3 id="business-quick-config-company-title">投标企业<\/h3>/);
  assert.doesNotMatch(source, /data-quick-config-hint/);
  assert.match(source, /<span><b aria-hidden="true">\*<\/b>选择投标企业<\/span>/);
  assert.match(css, /\.business-body-config-company-field \.business-body-config-field select\s*\{[^}]*width:\s*100%;/s);
});

test('商务标页面使用可正常挂载的详情资源', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /\.\/assets\/detail-active-dX2M24J1\.js/);
  assert.equal(fs.existsSync(path.join(demoRoot, 'assets', 'detail-active-dX2M24J1.js')), true);
});

test('商务标页面把稳定资源中的图标路径映射到当前 assets/figma', () => {
  const config = require(configPath);
  assert.equal(config.normalizeIconPath('./figma/tool-outline-new.svg'), './assets/figma/tool-outline-new.svg');
  assert.equal(config.normalizeIconPath('./assets/figma/more.svg'), './assets/figma/more.svg');
});

test('点击 01 生成大纲时使用原标书名称创建商务标 Loading 文件', () => {
  const config = require(configPath);
  assert.equal(config.outlineTaskStatus, '正在生成中');
  assert.equal(
    config.createOutlineTaskTitle('某高校高性能计算GPU集群建设项目.docx', new Date(2026, 8, 10, 14, 35)),
    '商务大纲_某高校高性能计算GPU集群建设项目_202609101435',
  );
});

test('标前评估空白页、技术标与商务标页面都加载页面切换入口脚本', () => {
  for (const fileName of ['interpretation-detail-empty.html', 'technical-detail-active.html', 'business-detail-active.html']) {
    const html = fs.readFileSync(path.join(demoRoot, fileName), 'utf8');
    assert.match(html, /assets\/mode-page-links\.js/);
  }
});

test('页面切换入口指向对应的 Active 页面', () => {
  const linksPath = path.join(demoRoot, 'assets', 'mode-page-links.js');
  const source = fs.readFileSync(linksPath, 'utf8');
  assert.match(source, /business-detail-active\.html/);
  assert.match(source, /technical-detail-active\.html/);
});

test('页面切换入口保留当前项目参数', () => {
  const linksPath = path.join(demoRoot, 'assets', 'mode-page-links.js');
  const source = fs.readFileSync(linksPath, 'utf8');
  assert.match(source, /targetUrl\.search = window\.location\.search/);
  assert.match(source, /targetUrl\.hash = window\.location\.hash/);
});

test('公共头部优先显示详情页项目名称', () => {
  const headerPath = path.join(demoRoot, 'assets', 'shared-brand-header.js');
  const source = fs.readFileSync(headerPath, 'utf8');
  assert.match(source, /project\.textContent = getProjectName\(\)/);
  assert.match(source, /hashParams\.get\('project'\)/);
  assert.match(source, /project-assistant-brand h1/);
  assert.match(source, /某高校高性能计算GPU集群建设项目/);
});

test('商务标覆盖逻辑保留当前项目名称', () => {
  const overridesPath = path.join(demoRoot, 'assets', 'business-mode-overrides.js');
  const source = fs.readFileSync(overridesPath, 'utf8');
  assert.match(source, /const getProjectName = \(\) =>/);
  assert.match(source, /projectName = getProjectName\(\)/);
});

test('技术标与标前评估空白页的问答记录使用单独脚本和样式', () => {
  for (const fileName of ['technical-detail-active.html', 'interpretation-detail-empty.html']) {
    const html = fs.readFileSync(path.join(demoRoot, fileName), 'utf8');
    assert.match(html, /assets\/qa-record\.css/);
    assert.match(html, /assets\/qa-record\.js/);
  }
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'qa-record.js'), 'utf8');
  assert.match(source, /问答记录_投标评分项梳理/);
  assert.match(source, /用户提问/);
  assert.match(source, /AI回复/);
  assert.match(source, /chat-message\.assistant \.save-note/);
  assert.match(source, /row\.classList\.contains\('qa-record-row'\)/);
  assert.doesNotMatch(source, /existing\?\.remove\(\)/);
  assert.match(source, /这个项目最应该重点响应哪些评分项/);
  assert.match(source, /建议重点响应项目开发技术方案/);
  assert.doesNotMatch(source, /isTechnicalBodyPlaceholder/);
  assert.match(source, /record-icon qa/);
});

test('商务标问答记录复用技术标弹窗资源', () => {
  const html = fs.readFileSync(path.join(demoRoot, 'business-detail-active.html'), 'utf8');
  assert.match(html, /assets\/qa-record\.css/);
  assert.match(html, /assets\/qa-record\.js/);
});

test('商务标保留商务标投标正文入口且问答记录使用技术标图标', () => {
  const overrides = fs.readFileSync(path.join(demoRoot, 'assets', 'business-mode-overrides.js'), 'utf8');
  const resultPanel = fs.readFileSync(path.join(demoRoot, 'assets', 'result-panel-figma.js'), 'utf8');
  assert.doesNotMatch(overrides, /技术标投标正文/);
  assert.match(resultPanel, /title\.includes\('投标大纲_'/);
  assert.match(resultPanel, /title\.includes\('投标正文_'/);
  assert.match(resultPanel, /row\?\.classList\.contains\('qa-record-row'\)/);
});

test('技术标保留技术标投标正文入口', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'qa-record.js'), 'utf8');
  assert.doesNotMatch(source, /title\.startsWith\('技术标投标正文_'\)/);
});

test('商务标结果区域排除标书要点解读记录', () => {
  const config = require(configPath);
  assert.equal(config.isTechnicalOnlyRecord('标书要点解读_某高校高性能计算GPU集群建设项目'), true);
  assert.equal(config.isTechnicalOnlyRecord('商务标投标大纲_某高校高性能计算GPU集群建设项目'), false);
});

test('商务标删除已完成的招标文件解读并把生成中记录改为商务大纲', () => {
  const config = require(configPath);
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-mode-overrides.js'),
    'utf8',
  );

  assert.equal(
    config.isUnsupportedCompletedRecord('招标文件解读_某高校高性能计算GPU集群建设项目'),
    true,
  );
  assert.equal(
    config.normalizeProcessingRecordText('招标文件解读_某高校高性能计算GPU集群建设项目', new Date(2026, 8, 10, 14, 35)),
    '商务大纲_某高校高性能计算GPU集群建设项目_202609101435',
  );
  assert.match(source, /row\.classList\.contains\('record-row'\)/);
  assert.match(source, /normalizeProcessingRecordText/);
  assert.match(source, /const normalizedTitle = normalize\(title\.getAttribute\('title'\)/);
});

test('商务标结果文件加载目录生成结果弹窗资源', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /assets\/business-outline-result-modal\.css/);
  assert.match(html, /assets\/business-outline-result-modal\.js/);
});

test('商务标目录弹窗包含参考页的核心入口与交互文案', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  for (const label of ['目录生成结果', '重新生成目录', '收起招标文件', '定位招标原文', '编写思路', '新增章节', '确认删除']) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /商务大纲_/);
  assert.match(source, /data-business-outline-modal/);
});

test('商务标目录标题下方显示目录生成范围说明', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(source, /class="directory-head-copy"/);
  assert.match(source, /目录将依据招标文件的封装要求和原目录顺序整理，覆盖投标文件全部部分（含技术标）；技术标仅保留目录，不编写正文。/);
  assert.match(css, /\.business-outline-modal \.directory-head-copy/);
  assert.match(css, /\.business-outline-modal \.directory-head-copy small/);
});

test('商务标重新生成目录弹窗使用指定生成要求文案', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  assert.match(source, /<label class="modal-label" for="regenerate-prompt">生成要求<\/label>/);
  assert.match(source, /placeholder="请输入生成要求，如:保持招标原目录不变，重点细化资质材料和同类项目业绩相关子目录。"/);
  assert.doesNotMatch(source, /生成要求（选填）/);
});

test('商务标目录定位只滚动右侧招标文件区域，不滚动外层页面', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  assert.doesNotMatch(source, /anchor\.scrollIntoView\(/);
  assert.match(source, /\[data-outline-workspace\] > \.source/);
  assert.match(source, /sourcePane\.scrollTo\(/);
});

test('商务标目录弹窗锁定外层滚动并隔离内部滚动边界', () => {
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /html\.business-outline-modal-open,\s*body\.business-outline-modal-open\s*\{\s*overflow:\s*hidden;/);
  assert.match(css, /\.business-outline-modal \.business-outline-page,\s*\.business-outline-modal \.page\s*\{[^}]*flex:\s*1 1 auto;[^}]*height:\s*auto;/s);
  assert.match(css, /\.business-outline-modal \.source\s*\{[^}]*overscroll-behavior:\s*contain/s);
});

test('商务标目录弹窗只保留中间拖拽列的单条分割线并对齐顶部栏高度', () => {
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.business-outline-modal \.topbar\s*\{[^}]*height:\s*58px\s*!important;[^}]*padding:\s*0 18px\s*!important;/s);
  assert.match(css, /\.business-outline-modal \.business-outline-page,\s*\.business-outline-modal \.page\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;/s);
  assert.match(css, /\.business-outline-modal \.workspace\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;/s);
  assert.match(css, /\.business-outline-modal \.left\s*\{[^}]*border-right:\s*0;/s);
  assert.match(css, /\.business-outline-modal \.source\s*\{[^}]*border-left:\s*0;/s);
  assert.match(css, /\.business-outline-modal \.outline-resizer\s*\{[^}]*background:\s*transparent;/s);
});

test('商务标目录结果页用唯一分割线并让工作区紧贴顶部栏', () => {
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(
    css,
    /\.business-outline-modal \.left,\s*\.business-outline-modal \.source,\s*\.business-outline-modal \.outline-resizer\s*\{[^}]*border:\s*0\s*!important;/s,
  );
  assert.match(
    css,
    /\.business-outline-modal \.business-outline-page\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s,
  );
  assert.match(
    css,
    /\.business-outline-modal \.business-outline-page\s*>\s*\.workspace\s*\{[^}]*flex:\s*1\s+1\s+auto;[^}]*height:\s*auto;/s,
  );
});

test('商务标大纲目录的用户新增节点不生成三点操作入口', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const outlineStart = source.indexOf('const outlineTemplate');
  const bodyStart = source.indexOf('<section class="page" data-page="body"', outlineStart);
  assert.doesNotMatch(source.slice(outlineStart, bodyStart), /data-menu-kind="user"/);
});

test('商务标正文编辑目录时用户新增节点显示三点操作入口', () => {
  const bodyTemplate = bodyPageMarkup();
  assert.match(bodyTemplate, /A项目合同[\s\S]*?class="dots"[\s\S]*?data-menu-kind="user"/);
  assert.match(bodyTemplate, /B项目合同[\s\S]*?class="dots"[\s\S]*?data-menu-kind="user"/);
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /<span class="count red" data-tip="未填写1项">1<\/span><span class="origin user">用户新增<\/span><button class="dots" type="button" data-menu-kind="user"/);
});

test('商务标正文空页面使用红色 1 表示待填写一项', () => {
  const bodyTemplate = bodyPageMarkup();
  assert.match(bodyTemplate, /B项目合同[\s\S]*?<span class="count red" data-tip="未填写1项">1<\/span>/);
  assert.doesNotMatch(bodyTemplate, /B项目合同[\s\S]*?empty-status/);
});

test('商务标正文目录所有节点都支持选中态并使用统一高亮样式', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(source, /queryAll\('\[data-body-directory\] \.node'\)\.forEach\(\(node\)/);
  assert.match(source, /queryAll\('\[data-body-directory\] \.node'\)\.forEach\(\(item\) => item\.classList\.toggle\('active', item === node\)\)/);
  assert.match(css, /\[data-body-directory\] \.node\.active \{[^}]*background: #f6f9ff;[^}]*box-shadow: inset 0 0 0 1px #1769e0/);
});

test('商务标正文左侧目录与中间正文之间保留竖向分割线', () => {
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.body-workspace\s*>\s*\.main\s*\{[^}]*border-left:\s*1px solid #dfe5ed;/);
});

test('商务标正文目录只显示当前目录自身的待填写数量', () => {
  const bodyTemplate = bodyPageMarkup();
  const chapterLabels = ['一、投标函及附件', '二、报价文件', '三、商务文件'];
  chapterLabels.forEach((label) => {
    assert.match(
      bodyTemplate,
      new RegExp(`<div class="node chapter[^"]*"[^>]*><span class="chapter-toggle"[^>]*>[^<]*</span><span class="label">${label}</span><span class="origin`),
      `章节节点「${label}」只作为标题，不累加子目录待填写数量`,
    );
  });
  assert.match(bodyTemplate, /body-content-view is-overview" data-body-panel="三、商务文件"/, '章节节点给出子目录概览');
  assert.match(bodyTemplate, /data-body-view="1、开标一览表"[\s\S]{0,120}?data-body-pending="7"[\s\S]*?class="count red" data-tip="未填写7项">7/);
  assert.match(bodyTemplate, /data-body-view="2、投标分项报价一览表"[\s\S]{0,140}?data-body-pending="53"/);
  assert.match(bodyTemplate, /<span class="label">资格自查表<\/span><span class="count red" data-tip="未填写11项">11<\/span>/);
  assert.match(bodyTemplate, /<span class="label">10-2 财务状况<\/span><span class="count red" data-tip="未填写6项">6<\/span>/);
});

test('用户新增目录点击删除后先打开二次确认弹窗', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const openDeleteStart = source.indexOf('const openDeleteDirectory');
  const openDeleteEnd = source.indexOf("deleteDirectory.addEventListener", openDeleteStart);
  const openDeleteBlock = source.slice(openDeleteStart, openDeleteEnd);
  assert.match(openDeleteBlock, /isUserDirectoryNode\(node\)/);
  assert.match(openDeleteBlock, /openDialog\('delete-directory'\)/);
  assert.match(source, /data-delete-directory-confirm/);
  assert.match(source, /closeDialog\('delete-directory'\)/);
});

test('切换到用户新增目录时保留右侧招标文件面板及其状态', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const selectStart = source.indexOf('const selectDirectoryNode');
  const bindStart = source.indexOf('const bindDirectoryNode', selectStart);
  const selectDirectoryNode = source.slice(selectStart, bindStart);
  assert.doesNotMatch(selectDirectoryNode, /classList\.toggle\('user-directory', userDirectory\)/);
  assert.doesNotMatch(selectDirectoryNode, /classList\.remove\('source-open', 'source-collapsed'\)/);
  assert.doesNotMatch(selectDirectoryNode, /syncSourceToggle\(false\)/);
});

test('商务标目录与正文记录分别打开对应结果页', () => {
  const modal = require(path.join(demoRoot, 'assets', 'business-outline-result-modal.js'));
  assert.equal(modal.getRecordMode('商务大纲_某高校高性能计算GPU集群建设项目_202609101435'), 'outline');
  assert.equal(modal.getRecordMode('商务正文_某高校高性能计算GPU集群建设项目_202609101435'), 'body');
});

test('商务标正文记录打开时以正文页作为初始页面', () => {
  const modal = require(path.join(demoRoot, 'assets', 'business-outline-result-modal.js'));
  assert.equal(modal.getInitialPage('body'), 'body');
  assert.equal(modal.getInitialPage('outline'), 'outline');
});

test('商务标结果弹窗左上角显示对应的生成结果文件名', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  assert.match(source, /data-outline-title>\$\{bodyRecord \? '生成商务标正文' : recordTitle\}<\/div>/);
});

test('商务标正文弹窗使用生成商务标正文标题并提供两个 Tab', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const bodyStart = source.indexOf('<section class="page" data-page="body"');
  const bodyEnd = source.indexOf('<div class="menu"', bodyStart);
  const bodyTemplate = source.slice(bodyStart, bodyEnd);
  assert.match(source, /data-outline-title>\$\{bodyRecord \? '生成商务标正文' : recordTitle\}<\/div>/);
  assert.match(source, /data-body-tab="outline"[^>]*>目录及设置/);
  assert.match(source, /data-body-tab="body"[^>]*>正文编写/);
  assert.match(source, /data-body-tab/);
  assert.match(source, /bodyRecord \? '<div class="body-tabs"/);
});

test('商务标正文弹窗显示标书信息和填写进度', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const sharedStart = source.indexOf('const bodyShared =');
  const sharedEnd = source.indexOf(';', sharedStart);
  const sharedTemplate = source.slice(sharedStart, sharedEnd);
  assert.match(sharedTemplate, /标书名称/);
  assert.match(sharedTemplate, /招标文件/);
  assert.match(source, /const bodyModel = buildBodyModel\(directory, sourcePanel\)/);
  assert.match(source, /data-body-filled>\$\{bodyModel\.totals\.filled\}/);
  assert.match(source, /data-body-total>\$\{bodyModel\.totals\.total\}/);
  assert.match(source, /data-body-pending>\$\{bodyModel\.totals\.pending\}/);
  assert.match(source, /const bodyProgress =/);
  assert.match(source, /\$\{bodyProgress\}/);
});

test('商务标正文 Tab 和进度条使用统一选中与进度视觉规范', () => {
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.body-tab\.active::after\s*\{[^}]*background:\s*#1769e0;/);
  assert.match(css, /\.body-document-info\s*\{[^}]*border-bottom:\s*1px solid #e5e9ef;/);
  assert.match(css, /\.body-progress-track\s*\{[^}]*height:\s*6px;/);
  assert.match(css, /\.body-progress-bar\s*\{[^}]*background:\s*#1769e0;/);
});

test('商务标正文共享信息行按标书名称、招标文件、招标企业排序', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const sharedStart = source.indexOf('const bodyShared =');
  const sharedEnd = source.indexOf(';', sharedStart);
  const sharedTemplate = source.slice(sharedStart, sharedEnd);
  assert.match(sharedTemplate, /标书名称[\s\S]*?招标文件[\s\S]*?data-enterprise-entry/);
  assert.match(sharedTemplate, /<input id="body-record-title" data-body-record-title/);
  assert.doesNotMatch(source, /<span class="pen"/);
  assert.doesNotMatch(source, /data-edit-directory/);
  assert.doesNotMatch(source, /全文待填写/);
});

test('商务标正文招标企业位于信息行最右侧', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const sharedStart = source.indexOf('const bodyShared =');
  const sharedEnd = source.indexOf(';', sharedStart);
  const sharedTemplate = source.slice(sharedStart, sharedEnd);
  assert.match(sharedTemplate, /<div class="body-document-info">[\s\S]*data-enterprise-entry/);
  assert.match(css, /\.body-document-info > \.enterprise-entry\s*\{[^}]*position:\s*static;[^}]*margin-left:\s*auto;/);
});

test('商务标正文进度条和百分比与填写统计位于同一行', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const progressStart = source.indexOf('<div class="body-progress"');
  const progressEnd = source.indexOf('</div></div>\n        <div class="workspace body-workspace', progressStart);
  const progress = source.slice(progressStart, progressEnd);
  assert.match(progress, /data-body-pending/);
  assert.match(progress, /data-body-progress/);
  assert.match(progress, /body-progress-percent/);
});

test('商务标正文弹窗只保留下载，大纲弹窗提供四项结果操作', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.js'), 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(source, /\$\{bodyRecord \? '' : '<button class="action" type="button" data-source-toggle>收起招标文件<\/button>'\}/);
  const bodyTopbar = topbarMarkup(renderOutlineModal('商务正文_测试项目_202609111418', 'body'));
  assert.match(bodyTopbar, /data-outline-download>下载</);
  assert.doesNotMatch(bodyTopbar, /data-source-toggle/);
  assert.doesNotMatch(bodyTopbar, /data-generate-body|data-regenerate/);
  assert.doesNotMatch(bodyTopbar, /查看招标文件|收起招标文件/);
  const outlineTopbar = topbarMarkup(renderOutlineModal());
  assert.match(outlineTopbar, /data-regenerate>重新生成大纲</);
  assert.match(outlineTopbar, /data-outline-download>下载</);
  assert.match(outlineTopbar, /data-source-toggle>收起招标文件</, '大纲弹窗仍保留收起招标文件');
  assert.match(outlineTopbar, /data-generate-body>立即生成全文</);
  assert.doesNotMatch(css, /body-active[^\{]*> \.shell > \.topbar\s*\{\s*display:\s*none/);
  assert.doesNotMatch(source, /class="action outline-only-action"/);
});

test('正文弹窗仍可用定位招标原文打开招标文件面板', () => {
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /query\('\[data-body-locate\]'\)\.addEventListener\('click', \(\) => \{[\s\S]*?syncBodySource\(\);[\s\S]*?setBodySource\(true\);/, '定位招标原文时才刷新摘录');
  assert.match(source, /const syncBodySource = \(\) => \{[\s\S]*?query\('\[data-body-directory\] \.node\.active'\)/, '摘录取当前选中目录');
  const directoryClick = source.slice(
    source.indexOf("queryAll('[data-body-directory] .node').forEach((node)"),
    source.indexOf("queryAll('[data-editor-toolbar] button[data-command]')"),
  );
  assert.doesNotMatch(directoryClick, /data-body-source-(section|title|text)/, '切换目录不再改动招标原文摘录');
  assert.match(source, /data-body-source-close/);
  const body = bodyPageMarkup();
  assert.match(body, /data-body-locate>定位招标原文</);
  assert.match(body, /<div class="workspace body-workspace source-hidden" data-body-workspace>/);
});

test('商务标正文编写进度只渲染在正文 Tab，目录及设置不包含进度条', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.js'), 'utf8');
  const outlineStart = source.indexOf('<section class="business-outline-page" data-page="outline">');
  const outlineEnd = source.indexOf('<section class="page" data-page="body"', outlineStart);
  const bodyStart = source.indexOf('<section class="page" data-page="body"');
  const bodyEnd = source.indexOf('<div class="menu"', bodyStart);
  assert.doesNotMatch(source.slice(outlineStart, outlineEnd), /body-progress|data-body-progress/);
  assert.match(source.slice(bodyStart, bodyEnd), /\$\{bodyProgress\}/);
});

test('商务标正文编辑区支持使用斜杠打开企业资料引用弹窗', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
  const cssPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.css');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  assert.match(source, /data-reference-modal/);
  assert.match(source, /data-reference-search/);
  ['企业信息', '企业资质', '企业业绩', '人员管理', '财务信息', '其他企业资料'].forEach((label) => {
    assert.ok(html.includes(`data-reference-tab="${label}"`), `引用弹窗包含「${label}」分类`);
  });
  assert.equal([...html.matchAll(/data-reference-tab="/g)].length, 6);
  assert.match(source, /event\.key !== '\/'/);
  assert.match(source, /openReference\(editor\)/);
  assert.match(source, /document\.execCommand\('insertText'/);
  assert.match(css, /\.reference-modal\s*\{/);
  assert.match(css, /\.reference-tabs\s*\{/);
  assert.match(css, /\.reference-item\s*\{/);
});

test('斜杠引用弹窗的人员管理与其他企业资料分类带数据', () => {
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /const REFERENCE_CATEGORIES = \['企业信息', '企业资质', '企业业绩', '人员管理', '财务信息', '其他企业资料'\]/);
  assert.match(source, /人员管理: \[\n\s+\['项目经理', '张明 · 项目交付部', '项目人员'\]/);
  assert.match(source, /其他企业资料: \[\n\s+\['原厂授权说明'/);
  assert.match(source, /const REFERENCE_ICONS = \{ 企业信息: '企', 企业资质: '资', 企业业绩: '业', 人员管理: '人', 财务信息: '财', 其他企业资料: '其' \}/);
  assert.match(source, /referenceData\[referenceCategory\] \|\| \[\]/, '未知分类不会导致引用弹窗报错');
});

test('商务标正文待填写字段输入后切换为已填写状态，清空后恢复待填写状态', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.js'), 'utf8');
  assert.match(source, /syncBodyFieldStatus/);
  assert.match(source, /field\.classList\.toggle\('missing', blank\)/);
  assert.match(source, /field\.classList\.toggle\('filled', !blank\)/);
  assert.match(source, /data-body-missing.*textContent/);
  assert.match(source, /data-confirm-missing.*textContent/);
  assert.match(source, /range\.selectNodeContents\(editor\)/);
});

test('左下角投标企业选择使用单一待确认值并支持名称或信用代码搜索', () => {
  const config = require(configPath);
  const companies = [
    { id: 'a', name: '北京建工集团有限责任公司', code: '91110000100010980X' },
    { id: 'b', name: '中铁建设集团有限公司', code: '9111000010001098AX' },
  ];
  assert.equal(typeof config.filterTenderCompanies, 'function');
  assert.equal(typeof config.resolveTenderCompany, 'function');
  assert.deepEqual(config.filterTenderCompanies(companies, '建工'), [companies[0]]);
  assert.deepEqual(config.filterTenderCompanies(companies, '1098ax'), [companies[1]]);
  assert.equal(config.resolveTenderCompany(companies, 'b'), companies[1]);
  assert.equal(config.resolveTenderCompany(companies, 'missing'), null);
});

const outlineModalPath = path.join(demoRoot, 'assets', 'business-outline-result-modal.js');
const sourceDocPath = path.join(demoRoot, 'assets', 'tender-source-doc.js');
const outlineExportMarker = 'module.exports = { BODY_PREFIX, OUTLINE_PREFIX, PROJECT_NAME, getInitialPage, getRecordMode, normalizeTitle };';

const renderOutlineModal = (title = '商务大纲_公开竞选文件-武汉城建集团供应链金融服务平台项目一期_202609111418', mode = 'outline') => {
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.ok(source.includes(outlineExportMarker), '商务标大纲弹窗保留原有导出语句');
  const patched = source.replace(outlineExportMarker, `${outlineExportMarker} module.exports.__debug = { outlineTemplate };`);
  const moduleShim = { exports: {} };
  new Function('window', 'module', 'document', 'URL', patched)(
    {
      tenderSourceDocument: require(sourceDocPath),
      tenderBusinessBodyContent: require(path.join(demoRoot, 'assets', 'business-body-content.js')),
    },
    moduleShim,
    undefined,
    undefined,
  );
  return moduleShim.exports.__debug.outlineTemplate(title, mode);
};

const bodyPageMarkup = (html = renderOutlineModal('商务正文_测试项目_202609111418', 'body')) => {
  const start = html.indexOf('<section class="page" data-page="body"');
  assert.ok(start > 0, '正文页已渲染');
  const end = html.indexOf('<div class="menu"', start);
  return html.slice(start, end);
};

const topbarMarkup = (html) => {
  const start = html.indexOf('<div class="topbar">');
  assert.ok(start > 0, '顶部栏已渲染');
  return html.slice(start, html.indexOf('data-outline-close', start) + 160);
};

test('商务标大纲目录按 05-商务标大纲 的结构渲染', () => {
  const html = renderOutlineModal();
  const outlineMarkup = html.slice(0, html.indexOf('<section class="page" data-page="body"'));
  const labels = [
    '封面',
    '资格自查表',
    '一、投标函及附件',
    '1、投标函',
    '二、报价文件',
    '2、投标分项报价一览表',
    '三、商务文件',
    '9、相关业绩情况一览表',
    '10、信誉、财务状况证明文件',
    '10-1 信誉证明文件',
    '10-2 财务状况',
    '11、商务响应/偏离表',
    '14、其它',
    '四、技术文件',
  ];
  labels.forEach((label) => {
    assert.ok(outlineMarkup.includes(`<span class="label">${label}</span>`), `大纲目录包含「${label}」`);
  });
  assert.equal([...outlineMarkup.matchAll(/data-directory-view="/g)].length, 31);
  assert.ok(!outlineMarkup.includes('<span class="label">评标导航表</span>'));
  assert.ok(!outlineMarkup.includes('<span class="label">附：投标文件目录</span>'));
  assert.ok(!outlineMarkup.includes('<span class="label">1、货物技术规格书</span>'), '技术文件不再展开子目录');
  assert.ok(outlineMarkup.includes('<span class="origin original">招标原目录</span>'));
  assert.ok(outlineMarkup.includes('<span class="origin user">用户新增</span>'));
  assert.ok(!/第一章 供应商综合情况|第二章 售后方案/.test(outlineMarkup), '大纲目录已替换旧的示例目录');
});

test('商务标大纲每个招标原目录节点都能定位到招标原文', () => {
  const html = renderOutlineModal();
  const anchors = [...html.matchAll(/data-source-anchor="([^"]+)"/g)].map((match) => match[1]);
  const nodes = [...html.matchAll(/data-directory-view="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(nodes.length > 0);
  nodes.filter((node) => !node.startsWith('user')).forEach((node) => {
    assert.ok(anchors.includes(node), `${node} 存在对应的招标原文锚点`);
  });
  assert.ok(
    html.includes('data-source-anchor="doc-11-193" data-source-section="9、相关业绩情况一览表"'),
    '投标文件格式章节按小节切分锚点',
  );
  assert.ok(nodes.includes('user-a') && nodes.includes('user-b'), '用户新增目录节点仍然保留');
});

test('商务标大纲招标文件面板与技术标读取同一份招标原文', () => {
  const pageHtml = fs.readFileSync(pagePath, 'utf8');
  assert.match(pageHtml, /assets\/tender-source-doc\.js/);
  const doc = require(sourceDocPath);
  const html = renderOutlineModal();
  assert.ok(doc.sections.length > 0);
  doc.sections.forEach((section) => {
    assert.ok(html.includes(section.chapter), `招标原文包含章节「${section.chapter}」`);
  });
  assert.ok(html.includes('某双一流高校政府采购'), '招标原文正文内容已渲染');
  assert.ok(html.includes('source-doc-table'), '招标原文表格已渲染');
  assert.ok(!html.includes('2.3 商务文件格式'), '不再使用旧的摘录式招标文件内容');
});

test('商务标大纲保留用户新增目录节点且不改变原有生成逻辑', () => {
  const html = renderOutlineModal();
  const outlineMarkup = html.slice(0, html.indexOf('<section class="page" data-page="body"'));
  assert.ok(outlineMarkup.includes('data-directory-view="user-a"'));
  assert.ok(outlineMarkup.includes('data-directory-view="user-b"'));
  assert.ok(!outlineMarkup.includes('data-menu-kind="user"'));
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /queryAll\('\[data-directory-view\]'\)\.forEach\(bindDirectoryNode\)/);
  assert.match(source, /activeOutlineNode\?\.dataset\.writingBasis \|\| activeOutlineTarget/);
});

test('商务标正文左侧目录与大纲目录保持一致', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const outlineStart = html.indexOf('<section class="business-outline-page" data-page="outline">');
  const bodyStart = html.indexOf('<section class="page" data-page="body"');
  const outlineLabels = [...html.slice(outlineStart, bodyStart).matchAll(/<span class="label">([^<]+)<\/span>/g)].map((match) => match[1]);
  const bodyLabels = [...bodyPageMarkup(html).matchAll(/<span class="label">([^<]+)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(bodyLabels, outlineLabels);
  assert.equal(bodyLabels.length, 31);
  assert.ok(bodyLabels.includes('资格自查表'));
  assert.ok(bodyLabels.includes('2、投标分项报价一览表'));
  assert.ok(bodyLabels.includes('四、技术文件'));
  assert.ok(!bodyLabels.includes('1、货物技术规格书'), '技术文件不展开子目录');
});

test('商务标正文内容取自脱敏投标文件并挂在对应目录节点上', () => {
  const source = fs.readFileSync(path.join(demoRoot, 'assets', 'business-body-content.js'), 'utf8');
  ['投标-投标函及附件-脱敏.docx', '投标-报价文件-脱敏.docx', '投标-资格自查表-脱敏.docx', '投标-商务文件-脱敏.docx'].forEach((file) => {
    assert.ok(source.includes(file), `内容数据来自 ${file}`);
  });
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const body = bodyPageMarkup(html);
  ['封面', '资格自查表', '1、投标函', '1、开标一览表', '1、供应商基本情况表', '9、相关业绩情况一览表', '11、商务响应/偏离表'].forEach((label) => {
    assert.ok(body.includes(`data-body-panel="${label}"`), `${label} 有对应的正文面板`);
  });
  assert.match(body, /四川华鲲振宇智能科技有限责任公司/, '正文内容为真实投标文件内容');
  assert.match(body, /近三年的实际情况/);
  assert.match(body, /核心产品制造商名称及产地/);
  const panels = [...body.matchAll(/data-body-panel="/g)].length;
  const directoryNodes = [...body.matchAll(/data-body-view="/g)].length;
  assert.equal(panels, 31);
  assert.equal(panels, directoryNodes, '每个目录节点都有对应正文面板');
  ['A项目合同', 'B项目合同'].forEach((label) => {
    assert.ok(body.includes(`data-body-panel="${label}"`), `${label} 也有正文面板`);
  });
});

test('商务标正文知识表格单元格可编辑并区分已填写与待填写', () => {
  const body = bodyPageMarkup();
  assert.match(body, /<table class="doc-table kv-table">/, '两列知识表格使用键值布局');
  assert.match(body, /<td class="key">供应商名称<\/td>/);
  assert.match(body, /<td class="filled" contenteditable="true">四川华鲲振宇智能科技有限责任公司<\/td>/);
  assert.match(body, /<td class="missing" contenteditable="true">请输入<\/td>/, '空白单元格用请输入占位并可编辑');
  assert.match(body, /data-body-source-section="第六章 投标文件格式"/, '正文章节关联招标原文位置');
});

test('资格自查表按原文保留纵向合并，只把对应页码算作待填写', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const panelStart = html.indexOf('data-body-panel="资格自查表"');
  const panel = html.slice(panelStart, html.indexOf('</section>', panelStart));
  const table = panel.slice(panel.indexOf('<table'), panel.indexOf('</table>') + '</table>'.length);
  assert.match(table, /<td class="key">序号<\/td><td class="key" colspan="2">资格要求<\/td><td class="key">须提供的资料<\/td><td class="key">对应页码<\/td>/, '表头结构保持原文');
  assert.match(table, /<td class="key" rowspan="6"><\/td>/, '序号列按原文纵向合并');
  assert.match(table, /<td class="key" rowspan="6">“申请人的资格要求”第（一）款的规定<\/td>/, '资格要求按原文纵向合并');
  assert.match(table, /<td class="key" rowspan="5">“申请人的资格要求”第3款的规定<\/td>/);
  assert.equal([...table.matchAll(/rowspan="/g)].length, 5, '纵向合并单元格数量与原文一致');
  assert.equal([...table.matchAll(/class="missing" contenteditable="true">请输入<\/td>/g)].length, 11, '待填写只有对应页码一列');
  assert.doesNotMatch(table, /class="missing"[^>]*>请输入<\/td><td[^>]*>请输入/, '序号与资格要求不再计入待填写');
  const data = fs.readFileSync(path.join(demoRoot, 'assets', 'business-body-content.js'), 'utf8');
  assert.match(data, /"rowspan": 6/);
  assert.match(data, /"rowspan": 5/);
});

test('投标分项报价一览表与原文一致，序号列属于模板编号', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const panelStart = html.indexOf('data-body-panel="2、投标分项报价一览表"');
  const panel = html.slice(panelStart, html.indexOf('</section>', panelStart));
  const table = panel.slice(panel.indexOf('<table'), panel.indexOf('</table>') + '</table>'.length);
  assert.equal([...table.matchAll(/<tr>/g)].length, 9, '原文 7 个编号行 + 合计价行');
  assert.equal([...table.matchAll(/<td class="key">[1-7]<\/td>/g)].length, 7, '1-7 是模板行号，不可编辑');
  assert.match(table, /<td class="key">1<\/td><td class="missing" contenteditable="true">请输入<\/td>/);
  assert.match(table, /<td class="key" colspan="7">合计价：<\/td><td class="missing" contenteditable="true" colspan="2">请输入<\/td>/, '合计价行按原文合并');
  assert.equal([...table.matchAll(/class="missing"/g)].length, 53, '价格列在原文档中为空，仍按空单元格计数');
  assert.match(table, /设备和标准附件/, '原文的 4-7 行名称保留');
});

test('商务标正文编辑器工具栏按 Figma 规范使用图标按钮', () => {
  const body = bodyPageMarkup();
  assert.match(body, /<div class="body-panel-head">[\s\S]*?class="preview-meta"[\s\S]*?<div class="editor-toolbar" data-editor-toolbar role="toolbar" aria-label="正文编辑工具栏">/);
  assert.match(body, /<img src="\.\/assets\/figma\/detail-undo\.svg" alt="">撤销/);
  assert.match(body, /<img src="\.\/assets\/figma\/detail-redo\.svg" alt="">恢复/);
  assert.match(body, /data-command="bold"[^>]*><svg[\s\S]*?<\/svg>加粗/);
  assert.match(body, /data-command="justifyCenter"[^>]*>[\s\S]*?居中/);
  assert.match(body, /class="editor-toolbar-divider"/);
  assert.doesNotMatch(body, /data-command="undo"[^>]*>↶/, '不再使用字符图标');
  assert.doesNotMatch(body, /data-command="bold"[^>]*><b>B<\/b>/, '不再使用字符图标');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(css, /\.business-outline-modal \.editor-toolbar button \{[^}]*border-radius: 4px;[^}]*color: #4e5969;/s);
  assert.match(css, /\.business-outline-modal \.editor-toolbar button:hover,\s*\.business-outline-modal \.editor-toolbar button:focus-visible \{[^}]*background: #eef3fb;[^}]*color: #1769e0;/s);
  assert.match(css, /\.business-outline-modal \.editor-toolbar svg \{[^}]*stroke: currentColor;/s);
  assert.match(css, /\.business-outline-modal \.body-panel-head \{[^}]*position: sticky;[^}]*background: #fff;/s);
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /const command = button\.dataset\.command;/, '按钮读取自身命令');
  assert.match(source, /document\.execCommand\(command, false, null\)/, '格式命令仍通过 execCommand 生效');
  assert.match(source, /applyHistory\(panel, undoing \? -1 : 1\)/, '撤销恢复走面板历史');
  assert.match(source, /flashFeedback\(undoing \? '正在撤销…' : '正在恢复…'\)/, '撤销恢复只给一次处理中反馈');
});

test('正文格式工具作用于当前选区并给出状态与提示', () => {
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(source, /const selectionInPanel = \(panel\) => \{/, '先判断选区是否落在当前面板');
  assert.match(source, /if \(!editable\) \{[\s\S]*?flashFeedback\('正在处理…'\)/, '没有选区时也只提示处理中');
  assert.match(source, /active = document\.queryCommandState\(command\)/, '按选区状态回显按钮');
  assert.match(source, /button\.classList\.toggle\('is-active', active\)/);
  assert.match(css, /\.editor-toolbar button\.is-active \{ background: #e2ecff; color: #1769e0; \}/);
  assert.match(source, /const applyHistory = \(panel, step\) => \{/, '撤销恢复使用面板级历史记录');
  assert.match(source, /const scheduleHistory = \(panel\) => \{/, '输入后记录历史');
  assert.match(source, /documentNode\.innerHTML = record\.stack\[next\]/);
  assert.match(source, /const flashFeedback = \(processing, delay = 560\) => \{/, '只保留一次处理中反馈');
  assert.match(source, /toast\.classList\.remove\('open'\);[\s\S]{0,80}?toast\.classList\.remove\('is-processing'\);/, 'Loading 结束后自动收起');
  assert.doesNotMatch(source, /flashFeedback\('正在处理…', '未选中内容/, '不再弹第二条文案');
  assert.doesNotMatch(source, /FORMAT_LABELS/, '不再拼结果文案');
  assert.match(source, /正在加载企业资料…/, '斜杠引用弹窗有加载态');
  assert.match(source, /toast\.classList\.toggle\('is-hint', !options\.retry && !options\.processing\)/, '提示类消息使用轻提示样式');
  assert.match(css, /\.toast\.is-processing::before \{[^}]*animation: business-outline-spin/s, '处理中提示带转圈');
  assert.match(css, /\.reference-loading \{[^}]*color: #7b8798;/);
  assert.match(css, /\.toast\.is-hint \{ border-color: #b9cdf3; background: #f3f7ff; color: #1c4ea8; \}/);
  assert.match(css, /\.business-outline-modal \.toast \{[^}]*bottom: 28px;[^}]*width: max-content;[^}]*max-width: min\(520px, calc\(100% - 48px\)\);/s, '提示框按内容自适应宽度并限宽');
});

test('正文预览按原文还原层级、字号、对齐与首行缩进', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const panel = (name) => {
    const start = html.indexOf(`data-body-panel="${name}"`);
    assert.ok(start > 0, `${name} 面板已渲染`);
    return html.slice(start, html.indexOf('</section>', start));
  };
  const cover = panel('封面');
  assert.match(cover, /<p class="doc-paragraph is-center is-bold" data-size="22">某双一流高校政府采购<\/p>/, '封面单位名 22pt 居中加粗');
  assert.match(cover, /<p class="doc-paragraph is-center" data-size="28">投标文件<\/p>/, '封面标题 28pt 居中');
  const promise = panel('2、资格条件承诺书（《中华人民共和国政府采购法》第二十二条）');
  assert.match(promise, /<p class="doc-paragraph" data-size="12" data-indent="2">我方承诺完全满足招标文件对投标人的资格要求：<\/p>/, '正文 12pt 且首行缩进两字');
  const others = panel('14、其它');
  assert.match(others, /<h4 class="doc-heading doc-heading-3 level-3 is-bold" data-size="14">1\.14\.1 具有良好的商业信誉和健全的财务会计制度<\/h4>/, '子标题带原文编号与字号');
  assert.match(others, /<p class="doc-paragraph is-center is-bold" data-size="12">声明书<\/p>/, '居中加粗的标题保留');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(css, /\.business-outline-modal \.document \.doc-paragraph \{[^}]*font-size: 12pt;/s);
  assert.match(css, /\.business-outline-modal \.document \[data-indent="2"\] \{ text-indent: 2em; \}/);
  assert.match(css, /\.business-outline-modal \.document \[data-size="28"\] \{ font-size: 28pt; \}/);
});

test('正文弹窗每个目录节点点击后都有对应正文面板', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const body = bodyPageMarkup(html);
  const nodes = [...body.matchAll(/data-body-view="([^"]+)"/g)].map((match) => match[1]);
  const panels = [...body.matchAll(/data-body-panel="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(panels, nodes, '目录顺序与正文面板一一对应');
  const panel = (name) => {
    const start = body.indexOf(`data-body-panel="${name}"`);
    assert.ok(start > 0, `${name} 面板已渲染`);
    return body.slice(start, body.indexOf('</section>', start));
  };
  const contractA = panel('A项目合同');
  assert.match(contractA, /<td class="key">合同名称<\/td><td class="filled" contenteditable="true">A项目服务器采购合同<\/td>/);
  assert.doesNotMatch(contractA, /class="missing"/, 'A项目合同已填写完');
  const contractB = panel('B项目合同');
  assert.equal([...contractB.matchAll(/class="missing"/g)].length, 1, 'B项目合同 1 项待填写');
  assert.match(contractB, /<td class="key">证明材料<\/td><td class="missing" contenteditable="true">请输入<\/td>/);
  const chapter = panel('三、商务文件');
  assert.match(chapter, /本章节包含 14 个子目录/);
  assert.equal([...chapter.matchAll(/doc-chapter-item/g)].length, 14);
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /queryAll\('\[data-body-panel\]'\)\.forEach\(\(panel\) => panel\.classList\.toggle\('active', panel\.dataset\.bodyPanel === target\)\)/);
});

test('封面整页居中，表格前的项目名称与项目编号抬头行居中', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const panel = (name) => {
    const start = html.indexOf(`data-body-panel="${name}"`);
    assert.ok(start > 0, `${name} 面板已渲染`);
    return html.slice(start, html.indexOf('</section>', start));
  };
  const cover = panel('封面');
  const coverLines = [...cover.matchAll(/<p class="([^"]*)" data-size="(\d+)"[^>]*>([^<]*)<\/p>/g)]
    .map((match) => ({ className: match[1], text: match[3] }));
  assert.equal(coverLines.length, 8, '封面 8 行都在');
  coverLines.forEach((line) => assert.match(line.className, /is-center/, `封面「${line.text}」居中`));
  const form = panel('1、供应商基本情况表');
  assert.match(form, /<p class="doc-paragraph is-center" data-size="12">项目名称：某高校高性能计算GPU集群建设项目<\/p>/);
  assert.match(form, /<p class="doc-paragraph is-center" data-size="12">项目编号：ZKQ2025-XXXX-XXXX（H）<\/p>/);
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /const bodyMain = query\('\[data-body-workspace\] > \.main'\);[\s\S]*?bodyMain\.scrollTop = 0;/, '切换目录时正文滚动位置复位');
});

test('切换目录时章节标题、面板标题与正文内容始终同步', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const body = bodyPageMarkup(html);
  const nodeLabels = [...body.matchAll(/data-body-view="([^"]+)"/g)].map((match) => match[1]);
  const panelKeys = [...body.matchAll(/data-body-panel="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(panelKeys, nodeLabels, '目录与面板一一对应');
  nodeLabels.forEach((label) => {
    const start = body.indexOf(`data-body-panel="${label}"`);
    const panel = body.slice(start, body.indexOf('</section>', start));
    assert.ok(panel.includes(`<strong>${label}</strong>`), `面板「${label}」的标题与目录名一致`);
  });
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /class="current" data-body-current title="\$\{recordTitle\}">\$\{recordTitle\}<\/div>/, '顶部标题固定显示标书名称');
  assert.match(source, /breadcrumb\.textContent = node\.dataset\.bodyPath \? `\$\{node\.dataset\.bodyPath\} \/ \$\{label\}` : label;/, '当前所在目录放在面包屑行');
  assert.doesNotMatch(source, /query\('\[data-body-current\]'\)\.textContent = node/, '顶部标题不再跟随目录切换');
  assert.match(source, /const bodyMain = query\('\[data-body-workspace\] > \.main'\);/, '切换时同步正文滚动');
});

test('封面按真实封面排版，标题区与信息区、签署区之间留空行', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const start = html.indexOf('data-body-panel="封面"');
  const panel = html.slice(start, html.indexOf('</section>', start));
  assert.match(panel, /<div class="document" data-cover="true">/, '封面使用封面版式');
  assert.match(panel, /（正本\/副本）<\/p><div class="doc-cover-gap is-lead" aria-hidden="true"><\/div><p class="doc-paragraph is-center" data-size="16">项目编号/, '副本行与信息区之间留空行');
  assert.match(panel, /投标内容：商务标<\/p><div class="doc-cover-gap is-middle" aria-hidden="true"><\/div><p class="doc-paragraph is-center" data-size="16">供应商名称/, '信息区与签署区之间留空行');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(css, /\.document\[data-cover\] \{[^}]*display: flex;[^}]*min-height: 660px;/s);
  assert.match(css, /\.doc-cover-gap\.is-lead \{ height: 104px; \}/);
  assert.match(css, /\.doc-cover-gap\.is-middle \{ height: 72px; \}/);
  assert.match(css, /\.document\[data-cover\] \.doc-paragraph:nth-child\(2\) \{[^}]*letter-spacing: 8px;/s);
});

test('全文供应商名称与右上角投标企业统一主体', () => {
  const data = require(path.join(demoRoot, 'assets', 'business-body-content.js'));
  const raw = fs.readFileSync(path.join(demoRoot, 'assets', 'business-body-content.js'), 'utf8');
  assert.equal(data.supplierName, '四川华鲲振宇智能科技有限责任公司');
  assert.doesNotMatch(raw, /某数字科技有限公司/, '正文里不再出现脱敏的旧主体名');
  ['封面', '2、法定代表人身份证明', '1、供应商基本情况表', '6、中小企业声明函', '11、商务响应/偏离表'].forEach((label) => {
    assert.ok(JSON.stringify(data.nodes[label]).includes(data.supplierName), `${label} 使用统一主体名`);
  });
  const performance = JSON.stringify(data.nodes['9、相关业绩情况一览表']);
  assert.ok(performance.includes('某科技有限公司') && performance.includes('某网络科技公司'), '业绩里的甲方名称保持原样');
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  assert.doesNotMatch(html, /某数字科技有限公司/);
  assert.ok(html.includes('投标企业：四川华鲲振宇智能科技有限责任公司'), '顶部投标企业与正文主体一致');
  assert.ok(html.includes('供应商名称：四川华鲲振宇智能科技有限责任公司'), '封面供应商名称一致');
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(source, /const ENTERPRISE = '四川华鲲振宇智能科技有限责任公司'/, '弹窗里的投标企业与内容主体同名');
});

test('正文区顶部显示居中的章节大标题并带目录编号', () => {
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  const body = bodyPageMarkup(html);
  const panels = [...body.matchAll(/data-body-panel="([^"]+)"/g)].map((match) => match[1]);
  const panel = (name) => {
    const start = body.indexOf(`data-body-panel="${name}"`);
    assert.ok(start > 0, `${name} 面板已渲染`);
    return body.slice(start, body.indexOf('</section>', start));
  };
  assert.equal([...body.matchAll(/<h2 class="doc-title">/g)].length, panels.length - 1, '除封面外每个面板都有大标题');
  assert.doesNotMatch(panel('封面'), /doc-title/, '封面本身就是标题页，不再重复显示标题');
  ['资格自查表', '1、投标函', '三、商务文件', '14、其它', 'A项目合同'].forEach((label) => {
    assert.ok(panel(label).includes(`<h2 class="doc-title">${label}</h2>`), `${label} 的正文标题带编号`);
  });
  assert.doesNotMatch(panel('资格自查表'), /<h2 class="doc-title">资格自查表<\/h2>\s*<h[2-5]/, '正文里不再重复同名小节标题');
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(css, /\.business-outline-modal \.document \.doc-title \{[^}]*font-size: 17pt;[^}]*font-weight: 700;[^}]*text-align: center;/s);
});

test('切换目录时左侧目录列表不会因选中态跳动', () => {
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  const source = fs.readFileSync(outlineModalPath, 'utf8');
  assert.match(css, /\[data-outline-workspace\] \.node\.active \{[^}]*min-height: 35px;[^}]*margin: 0;[^}]*padding: 5px 6px;/s, '选中态不改变行高与间距');
  assert.doesNotMatch(css, /min-height: 112px/, '不再把选中行撑高');
  assert.match(css, /\.business-outline-modal \.node \{ display: flex; flex-wrap: wrap;/, '目录节点允许操作条换行');
  assert.match(css, /\.business-outline-modal \.node-selection-tools \{[^}]*flex: 1 0 100%;/s, '操作条占满一行跟在目录名下面');
  assert.doesNotMatch(css, /\.node-selection-tools \{[^}]*position: sticky;/s, '操作条不再固定在目录列底部');
  assert.match(css, /\.node-tool-popover \{[^}]*top: calc\(100% \+ 8px\);/s, '操作条弹层向下展开');
  assert.match(source, /node\.appendChild\(selectionTools\)/, '操作条挂在选中的目录节点里');
  assert.doesNotMatch(source, /\(outlineDirectoryPanel \|\| node\)\.appendChild\(selectionTools\);/);
});

test('其他资质文件直接展示企业信息里维护的资料图', () => {
  const data = require(path.join(demoRoot, 'assets', 'business-body-content.js'));
  const map = Object.fromEntries(data.nodes['3、其他资质文件'].map((item) => [item.name, item.image || '']));
  assert.equal(map['营业执照'], './assets/company-document-license.png');
  assert.equal(map['财务审计报告'], './assets/company-document-finance-audit-2024.png');
  assert.equal(map['依法缴纳税收的证明'], './assets/company-document-tax-payment-2024.png');
  assert.equal(
    data.nodes['10-1 信誉证明文件'].find((item) => item.name === '3A信用证书').image,
    './assets/company-document-credit-3a.png',
  );
  Object.values(map).filter(Boolean).forEach((src) => {
    assert.ok(fs.existsSync(path.join(demoRoot, src)), `${src} 图片存在`);
  });
  const gallery = fs.readFileSync(path.join(demoRoot, 'assets', 'company-document-gallery.js'), 'utf8');
  Object.values(map).filter(Boolean).forEach((src) => {
    assert.ok(gallery.includes(src.replace('./assets/', '')), `企业资料图库包含 ${src}`);
  });
  const html = renderOutlineModal('商务正文_测试项目_202609111418', 'body');
  assert.match(html, /<img class="material-image" src="\.\/assets\/company-document-license\.png" alt="营业执照" loading="lazy">/);
  assert.match(html, /<img class="material-image" src="\.\/assets\/company-document-credit-3a\.png" alt="3A信用证书" loading="lazy">/);
  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-outline-result-modal.css'), 'utf8');
  assert.match(css, /\.business-outline-modal \.material-image \{[^}]*width: min\(640px, 100%\);/s);
});

test('商务标对话区造数只更新对话内容与输入框指令', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-conversation-demo.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  assert.match(source, /商务大纲_/, '生成大纲结果文件用商务大纲命名');
  assert.match(source, /商务正文_/, '生成正文结果文件用商务正文命名');
  assert.match(source, /帮我生成商务标大纲。/);
  assert.match(source, /撰写商务标全文。/);
  assert.match(source, /已确认商务标大纲配置/);
  assert.match(source, /已确认商务标正文配置/);
  assert.match(source, /四川华鲲振宇智能科技有限责任公司/, '对话里的投标企业用统一主体');
  assert.match(source, /const PROMPTS = \['根据招标文件生成商务标大纲。', '根据商务大纲撰写商务标全文。', '一键生成商务标。'\]/, '对话底部三条引导指令');
  assert.match(source, /list\.lastElementChild !== bar[\s\S]*?list\.append\(bar\)/, '引导指令固定在对话最下边');
  assert.match(source, /removeWelcomeSuggestions/, '项目介绍卡片下的推荐问题去掉');
  assert.match(source, /prefix: '今天上海天气怎么样？', remove: true/, '去掉天气问答');
  assert.match(source, /prefix: '看起来您想了解上海的天气', remove: true/);
  assert.match(source, /PLACEHOLDER_MAP/, '输入框轮播提示改成商务标');
  assert.doesNotMatch(source, /招标文件解读_/, '商务标对话不再出现招标文件解读结果');
  assert.match(source, /const tender = getTenderName\(\);/, '文件名称实时取页面数据');
  assert.match(source, /#app \.upload-panel \.upload-group \.file-row/, '招标文件名称来自页面上的招标资料');
  assert.doesNotMatch(source, /武汉城建|公开竞选文件/, '不再写死项目或文件名');
  const selectors = [...source.matchAll(/querySelector(?:All)?\('([^']+)'\)/g)].map((match) => match[1]);
  selectors.forEach((selector) => {
    assert.match(selector, /chat-|message-|config-record|config-waiting|business-built-in-prompts|upload-panel|ellipsis|#app|aria-label|welcome|context-suggestions|project-context|bid-config|outline-config|outline-dependency|outline-step/, `${selector} 只在对话区范围内`);
  });
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /assets\/business-conversation-demo\.js/);
  ['technical-detail-active.html', 'deviation-detail-active.html', 'interpretation-detail-active.html'].forEach((file) => {
    const page = fs.readFileSync(path.join(demoRoot, file), 'utf8');
    assert.doesNotMatch(page, /business-conversation-demo\.js/, `${file} 不受影响`);
  });
});

test('商务标对话区的大纲配置面板改成单步要素确认', () => {
  const scriptPath = path.join(demoRoot, 'assets', 'business-conversation-demo.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  assert.match(source, /const OUTLINE_PANEL_TITLE = '商务标生成大纲要素确认'/);
  assert.match(source, /const patchOutlineConfigPanel = \(\) => \{/, '对话区里的大纲面板有独立补丁');
  assert.match(source, /heading\.textContent\.trim\(\) !== OUTLINE_PANEL_TITLE[\s\S]*?heading\.textContent = OUTLINE_PANEL_TITLE/, '标题改成商务标生成大纲要素确认');
  assert.match(source, /dependencySelect\.dispatchEvent\(new Event\('change'/, '直接满足依赖后进入生成要求这一步');
  assert.match(source, /footerButton\.textContent = '生成大纲'/, '确认按钮为单步生成大纲');
  assert.match(source, /const hasPendingConfigRound = \(\) =>/, '配置这一轮未完成时隐藏引导指令');
  assert.match(source, /bar\.style\.display = pending \? 'none' : ''/, '三条引导问题等确认轮次结束再出现');

  const cssPath = path.join(demoRoot, 'assets', 'business-conversation-config.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.match(css, /\.bid-config-panel \.bid-config-nav > button\[aria-label="上一步"\][\s\S]*?display: none !important;/, '隐藏步骤切换');
  assert.match(css, /\.bid-config-panel\[data-business-config="outline"\] \.outline-dependency,/, '只在商务标大纲面板隐藏解读依赖');
  assert.match(css, /\.outline-step-two \.page-setting-heading,[\s\S]*?\.outline-step-two \.depth-setting \{[^}]*display: none !important;/s, '隐藏页数与目录层级');
  assert.match(css, /content: "招标文件：" attr\(data-business-source\)/, '保留招标文件要素');
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /assets\/business-conversation-config\.css/);
  ['technical-detail-active.html', 'deviation-detail-active.html'].forEach((file) => {
    const page = fs.readFileSync(path.join(demoRoot, file), 'utf8');
    assert.doesNotMatch(page, /business-conversation-config\.css/, `${file} 不受影响`);
  });
});

test('商务标对话区的正文配置面板参照 02 撰写全文弹窗替换要素', () => {
  const source = fs.readFileSync(
    path.join(demoRoot, 'assets', 'business-conversation-demo.js'),
    'utf8',
  );
  assert.match(source, /const BODY_PANEL_TITLE = '商务标生成正文要素确认'/);
  assert.match(source, /const BODY_OUTLINE_DESC = '正文需依赖大纲生成，请选择项目中已生成的大纲文件。'/);
  assert.match(source, /const patchBodyConfigPanel = \(panel\) => \{/, '对话区里的正文面板有独立补丁');
  assert.match(source, /heading\.textContent\.trim\(\) !== BODY_PANEL_TITLE[\s\S]*?heading\.textContent = BODY_PANEL_TITLE/, '标题改成商务标生成正文要素确认');
  assert.match(source, /cardTitle\.textContent\.trim\(\) !== '商务标大纲'[\s\S]*?cardTitle\.textContent = '商务标大纲'/, '大纲卡片标题改成商务标大纲');
  assert.match(source, /label\.replace\('技术标投标大纲_', '商务大纲_'\)/, '大纲选项改成商务大纲命名');
  assert.match(source, /field\.innerHTML = `<span><b aria-hidden="true">\*<\/b>选择投标企业<\/span>`/, '补上选择投标企业要素');
  assert.match(source, /footerButton\.textContent = '生成正文'/, '确认按钮为生成正文');
  assert.match(source, /if \(!select \|\| select\.value\) return;[\s\S]*?stopImmediatePropagation\(\)/, '未选投标企业时不能生成');
  assert.match(source, /const mode = panel\.querySelector\('\.outline-dependency h3'\) \? 'body' : 'outline'/, '区分大纲与正文两种面板');

  const css = fs.readFileSync(path.join(demoRoot, 'assets', 'business-conversation-config.css'), 'utf8');
  assert.match(css, /\.bid-config-panel\[data-business-config="body"\] \.outline-source-switch \{[^}]*display: none !important;/s, '正文面板不再显示粘贴大纲入口');
  assert.match(css, /\.bid-config-panel\[data-business-config="body"\] \.business-chat-requirement-hint \{[^}]*color: #e5484d;/s, '缺少要素的提示有独立样式');
  assert.match(css, /\.bid-config-panel\[data-business-config="body"\] \.outline-dependency \{[^}]*display: block;/s, '正文面板的商务标大纲卡片保持可见');
});
