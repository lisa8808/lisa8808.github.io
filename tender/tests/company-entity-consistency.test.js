const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const COMPANIES = ['四川华鲲振宇智能科技有限责任公司', '北京华鲲振宇智能科技有限责任公司'];
const CODES = ['91510100MA67G71FX6', '91110113MA02MJWB42'];
const STALE_COMPANIES = [
  '陕西威泽佳环保有限公司',
  '武汉华源信息技术有限公司',
  '湖北融智数字科技有限公司',
  '华中智算科技有限公司',
  '四川华鲲企业服务有限公司',
];
const STALE_CODES = ['91510100MA6C8X3D2Q', '91510100MA7H9K6R5M', '91610136MA6BQ0XTC1'];

const selectorAssets = [
  'assets/business-company-selector.js',
  'assets/interpretation-company-selector.js',
  'assets/technical-company-selector.js',
  'assets/deviation-company-selector.js',
];

const bundledPages = [
  'assets/detail-active-dX2M24J1.js',
  'assets/detail-empty-Cq0yH3sO.js',
  'assets/list-D1LEEsXP.js',
  'assets/list-CptSKlCd.js',
  'assets/list-DIyIzhQX.js',
  'assets/list-bYYmukX3.js',
  'assets/company-management-DSN0yAMJ.js',
];

test('四个页面的投标企业选择器只映射企业信息管理中的两家企业', () => {
  for (const asset of selectorAssets) {
    const source = read(asset);
    for (const company of COMPANIES) assert.ok(source.includes(company), `${asset} 缺少 ${company}`);
    for (const code of CODES) assert.ok(source.includes(code), `${asset} 缺少 ${code}`);
    for (const stale of [...STALE_COMPANIES, ...STALE_CODES]) {
      assert.ok(!source.includes(stale), `${asset} 仍包含旧企业信息 ${stale}`);
    }
  }
});

test('左下角投标企业下拉只提供企业信息管理中的两家企业', () => {
  for (const asset of bundledPages) {
    const source = read(asset);
    const optionText = source.match(/`选择企业`,-1\),\w\(`option`,null,`([^`]+)`,-1\),\w\(`option`,null,`([^`]+)`,-1\)/);
    assert.ok(optionText, `${asset} 未找到投标企业下拉选项`);
    assert.deepEqual([optionText[1], optionText[2]], COMPANIES, `${asset} 投标企业下拉选项不正确`);
  }
});

test('标前评估配置弹窗、结果页与对话确认卡使用同一批企业主体', () => {
  const actions = read('assets/interpretation-mode-actions.js');
  const actionsList = actions.match(/const companies = \[([\s\S]*?)\];/);
  assert.ok(actionsList, '未找到评估企业主体列表');
  for (const company of COMPANIES) assert.ok(actionsList[1].includes(company), `评估企业主体缺少 ${company}`);
  for (const stale of STALE_COMPANIES) assert.ok(!actionsList[1].includes(stale), `评估企业主体仍包含 ${stale}`);

  const resultModal = read('assets/prebid-assessment-result-modal.js');
  assert.match(resultModal, new RegExp(`const DEFAULT_COMPANY = '${COMPANIES[0]}'`));
  assert.match(resultModal, new RegExp(`data-assessment-company-result>${COMPANIES[0]}<`));

  const conversation = read('assets/interpretation-conversation-demo.js');
  assert.ok(conversation.includes(`['评估企业主体', '${COMPANIES[0]}']`));
  assert.ok(conversation.includes(`<option>${COMPANIES[0]}</option><option>${COMPANIES[1]}</option>`));
});

test('企业信息管理详情页只保留企业信息管理中的两家企业档案', () => {
  const detailPages = read('assets/company-detail-pages.js');
  const profileNames = Array.from(detailPages.matchAll(/^\s{2}'([^']+)': \{$/gm)).map((match) => match[1]);
  assert.deepEqual(profileNames, COMPANIES);
  assert.ok(detailPages.includes(`|| '${COMPANIES[0]}'`), '详情页默认企业主体应为企业信息管理中的第一家企业');

  const management = read('assets/company-management-DSN0yAMJ.js');
  for (const company of COMPANIES) assert.ok(management.includes(company), `企业信息管理缺少 ${company}`);
  for (const code of CODES) assert.ok(management.includes(code), `企业信息管理缺少 ${code}`);

  const listAssets = ['assets/list-D1LEEsXP.js', 'assets/list-CptSKlCd.js', 'assets/list-bYYmukX3.js'];
  for (const asset of listAssets) {
    const source = read(asset);
    for (const company of COMPANIES) assert.ok(source.includes(company), `${asset} 企业信息列表缺少 ${company}`);
    for (const stale of [...STALE_COMPANIES, ...STALE_CODES]) {
      assert.ok(!source.includes(stale), `${asset} 企业信息列表仍包含 ${stale}`);
    }
  }
});

test('企业详情页与企业资料引用演示页不残留旧企业主体文案', () => {
  const pages = [
    'company-info.html',
    'company-personnel.html',
    'company-qualifications.html',
    'company-finance.html',
    'company-other.html',
    'company-performance.html',
    'company-reference-demo.html',
  ];
  for (const page of pages) {
    const source = read(page);
    for (const stale of [...STALE_COMPANIES, ...STALE_CODES]) {
      assert.ok(!source.includes(stale), `${page} 仍包含旧企业信息 ${stale}`);
    }
    assert.ok(source.includes(COMPANIES[0]), `${page} 未使用企业信息管理中的企业主体`);
  }
  const referenceDemo = read('assets/company-reference-demo.js');
  for (const stale of [...STALE_COMPANIES, ...STALE_CODES]) {
    assert.ok(!referenceDemo.includes(stale), `企业资料引用演示仍包含旧企业信息 ${stale}`);
  }
  assert.ok(referenceDemo.includes(COMPANIES[0]));
});

test('商务标结果弹窗中的投标企业与企业信息资料同样使用企业信息管理中的企业主体', () => {
  const asset = read('assets/business-outline-result-modal.js');
  assert.match(asset, new RegExp(`const ENTERPRISE = '${COMPANIES[0]}'`));
  assert.ok(asset.includes(`['企业名称', ENTERPRISE, '企业基本信息']`));
  assert.ok(asset.includes(`['统一社会信用代码', '${CODES[0]}', '企业基本信息']`));
  assert.ok(asset.includes(`['法定代表人', '魏靖', '企业基本信息']`));
  assert.ok(asset.includes(`投标企业：\${ENTERPRISE}`));
  for (const stale of ['武汉城市建设集团供应链金融服务有限公司', '武汉城建科技有限公司', '91420100MA4K2L7X8P']) {
    assert.ok(!asset.includes(stale), `商务标结果弹窗仍包含旧企业主体 ${stale}`);
  }
});
