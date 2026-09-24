const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const bundles = [
  'assets/detail-active-dX2M24J1.js',
  'assets/detail-empty-Cq0yH3sO.js',
  'assets/list-D1LEEsXP.js',
  'assets/list-CptSKlCd.js',
  'assets/list-DIyIzhQX.js',
  'assets/list-bYYmukX3.js',
  'assets/company-management-DSN0yAMJ.js',
];

test('各页面左上角招标资料只保留一份核心招标文件', () => {
  for (const asset of bundles) {
    const source = read(asset);
    assert.match(
      source,
      /let i=\[\{name:`某高校高性能计算GPU集群建设项目\.docx`,type:`file`\}\],/,
      `${asset} 的招标资料应只保留一份核心招标文件`,
    );
    assert.ok(!source.includes('技术需求及评分标准'), `${asset} 仍保留第二份招标文件`);
  }
});

test('演示对话与单一招标文件保持一致', () => {
  const source = read('assets/interpretation-conversation-demo.js');
  assert.match(source, /1 份核心招标文件/);
  assert.ok(!source.includes('技术需求及评分标准'), '对话中仍引用已移除的招标文件');
});

test('四类页面对话里的招标文件解读场景同样只保留一份招标文件', () => {
  for (const asset of bundles) {
    const source = read(asset);
    assert.match(
      source,
      /当前招标资料中识别到 1 份招标文件：《某高校高性能计算GPU集群建设项目\.docx》/,
      `${asset} 的对话应改为单一招标文件口径`,
    );
    assert.ok(!source.includes('某高校高性能计算GPU集群一期招标文件'), `${asset} 对话仍引用不存在的分期招标文件`);
    assert.ok(!source.includes('某高校高性能计算GPU集群二期招标文件'), `${asset} 对话仍引用不存在的分期招标文件`);
  }
});

test('标书撰写参考换成与高性能计算GPU集群项目匹配的三份参考文件', () => {
  const referenceFiles = [
    '高校高性能计算集群技术方案参考范本.docx',
    '数据中心设计规范GB50174-2017.pdf',
    '高校GPU算力集群建设项目实施案例.pdf',
  ];
  for (const asset of bundles) {
    const source = read(asset);
    for (const name of referenceFiles) {
      assert.ok(source.includes(name), `${asset} 缺少参考文件 ${name}`);
    }
    for (const stale of ['供应链金融服务平台技术方案参考范本', '金融科技项目技术标编制规范', '企业级供应链金融系统实施案例']) {
      assert.ok(!source.includes(stale), `${asset} 仍残留旧参考文件 ${stale}`);
    }
  }
});
