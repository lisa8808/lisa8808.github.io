import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');

test('company detail navigation includes personnel management', () => {
  const html = read('company-info.html');
  assert.match(read('assets/company-detail-pages.js'), /人员管理/);
  assert.match(read('assets/company-detail-pages.js'), /personnel: '\.\/company-personnel\.html'/);
});

test('personnel page separates identity education documents from repeatable certificates', () => {
  const script = read('assets/company-personnel.js');
  assert.match(script, /身份证复印件正面/);
  assert.match(script, /毕业证书扫描件/);
  assert.match(script, /资格证书/);
  assert.match(script, /新增证书/);
});

test('personnel behavior derives age and work years and supports custom certificates', () => {
  const script = read('assets/company-personnel.js');
  assert.match(script, /calculateAge/);
  assert.match(script, /calculateWorkYears/);
  assert.match(script, /certificateName/);
  assert.match(script, /addCertificate/);
});

test('company records expose the agreed maintenance semantics', () => {
  const script = read('assets/company-detail-pages.js');
  assert.match(script, /停用/);
  assert.match(script, /待核验/);
  assert.match(script, /所属年度或期间/);
  assert.match(script, /项目类型\/行业/);
  assert.match(script, /验收证明附件/);
});
