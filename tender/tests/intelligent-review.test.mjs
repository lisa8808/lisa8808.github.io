import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');

test('intelligent review keeps the existing list shell and responsive grid', () => {
  const html = read('intelligent-review.html');
  const css = read('assets/intelligent-review.css');

  assert.match(html, /class="topbar"/);
  assert.match(html, /class="primary-tabs"/);
  assert.match(html, /data-module="标书撰写"/);
  assert.match(html, /data-module="企业信息"/);
  assert.match(css, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test('review cards use the compact company-information card scale', () => {
  const css = read('assets/intelligent-review.css');

  assert.match(css, /\.review-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.new-review-card,\s*\.review-card\s*\{[^}]*height:\s*var\(--list-card-height\)[^}]*border-radius:\s*16px/s);
  assert.match(css, /\.new-review-card\s*\{[^}]*border:\s*2px dashed/s);
  assert.match(css, /\.review-grid\.list-view \.review-card\s*\{[^}]*height:\s*var\(--list-row-height\)/s);
  assert.doesNotMatch(css, /height:\s*210px/);
});

test('new review card only shows the icon and action name', () => {
  const html = read('intelligent-review.html');

  assert.match(html, /<strong>新建标书审查<\/strong>/);
  assert.doesNotMatch(html, /上传招标文件与投标文件，快速定位风险/);
});

test('created project cards expose independent edit and delete actions', () => {
  const html = read('intelligent-review.html');

  assert.match(html, /data-edit-review/);
  assert.match(html, /data-delete-review/);
  assert.doesNotMatch(html, /class="result-button"/);
});

test('new review actions navigate to the integrated new-review page', () => {
  const html = read('intelligent-review.html');

  assert.equal(fs.existsSync(new URL('intelligent-review-new.html', root)), true);
  assert.match(html, /data-create-review/);
});

test('project cards navigate to the integrated detail page with project context', () => {
  const html = read('intelligent-review.html');

  assert.equal(fs.existsSync(new URL('intelligent-review-detail.html', root)), true);
  assert.match(html, /data-review-project/);
});

test('version 3 list shows the GPU cluster project first, then the AI compute project, each routing to its own detail page', () => {
  const html = read('intelligent-review.html');
  const cards = [...html.matchAll(/<article class="review-card"[^>]*data-href="([^"]+)"[^>]*data-title="([^"]+)"/g)]
    .map((match) => ({ href: match[1], title: match[2] }));

  assert.deepEqual(cards.slice(0, 2), [
    {
      href: './intelligent-review-gpu.html?preset=real',
      title: '某高校高性能计算GPU集群建设项目',
    },
    {
      href: './intelligent-review-detail.html?preset=real',
      title: '某单位大语言模型AI算力基础设施建设项目',
    },
  ]);
  assert.equal(fs.existsSync(new URL('intelligent-review-gpu.html', root)), true);
});

test('version 3 preset detail pages load the matching full-document project datasets', () => {
  const nsbd = read('intelligent-review-detail.html');
  const gpu = read('intelligent-review-gpu.html');

  assert.match(nsbd, /real-project-documents-nsbd\.js/);
  assert.match(nsbd, /real-project-data\.js/);
  assert.match(gpu, /real-project-documents-gpu\.js/);
  assert.match(gpu, /real-project-data-gpu\.js/);
});

test('preset project status is isolated so visiting one detail page cannot overwrite another card', () => {
  const context = {
    window: {
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
  };
  vm.runInNewContext(read('assets/review2-store.js'), context);

  const first = context.window.Review2Store.presetStatusKey('某单位大语言模型AI算力基础设施建设项目');
  const second = context.window.Review2Store.presetStatusKey('某高校高性能计算GPU集群建设项目');
  assert.notEqual(first, second);
  assert.equal(first, context.window.Review2Store.presetStatusKey('某单位大语言模型AI算力基础设施建设项目'));
});

test('version 3 review workspace shows upload limits and the three quick actions', () => {
  for (const page of ['intelligent-review-new.html', 'intelligent-review-detail.html', 'intelligent-review-gpu.html']) {
    const html = read(page);

    assert.match(html, /单文件≤200M/);
    assert.match(html, /class="result-rail"/);
    assert.match(html, /data-task="extractAll"/);
    assert.match(html, /data-task="retrieve"/);
    assert.match(html, /id="quickRailButton"/);
  }
});

test('review uploads enforce the same 200M per-file limit shown in the copy', () => {
  const script = read('assets/review-upload.js');

  assert.match(script, /const maxFileSize = 200 \* 1024 \* 1024;/);
  assert.match(script, /招标文件大小不能超过 200M/);
  assert.match(script, /投标文件大小不能超过 200M/);
  assert.doesNotMatch(script, /50 \* 1024 \* 1024/);
});

test('下载投标风险批注 exports a real file instead of showing a demo toast', () => {
  const script = read('assets/review-upload.js');

  assert.match(script, /downloadButton\.addEventListener\("click", \(\) => downloadRiskAnnotation\(key\)\)/);
  assert.match(script, /function downloadRiskAnnotation\(key\)/);
  assert.match(script, /Packer\.toBlob\(buildRiskAnnotationDoc\(/);
  assert.match(script, /downloadBlob\(blob, title \+ "\.docx"\)/);
  assert.match(script, /downloadBlob\(new Blob\(\[html\]/);
  assert.doesNotMatch(script, /showToast\("已下载到本地"\)/);
  assert.doesNotMatch(script, /当前原型中下载为演示提示/);
});

test('integrated review pages only reference assets present in demo-tender', () => {
  for (const page of ['intelligent-review-new.html', 'intelligent-review-detail.html', 'intelligent-review-gpu.html']) {
    assert.equal(fs.existsSync(new URL(page, root)), true, `${page} should exist`);
    const html = read(page);
    const references = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?]+)(?:\?[^"#]*)?"/g)]
      .map((match) => match[1]);

    assert.ok(references.length > 0, `${page} should load local assets`);
    for (const reference of references) {
      assert.equal(
        fs.existsSync(new URL(reference, root)),
        true,
        `${page} references missing asset ${reference}`,
      );
    }
  }
});
