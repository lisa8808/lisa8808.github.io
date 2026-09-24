import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');

const GALLERY_PAGE = './gallery-management.html';
const PACKAGE_GALLERY = '../DEMO/demo-tender/gallery-management.html';

function loadHeader(source, href) {
  const listeners = [];
  const location = { href, pathname: new URL(href).pathname };
  const context = {
    document: {
      addEventListener: (type, handler, capture) => listeners.push({ type, handler, capture }),
      querySelector: () => null,
      documentElement: {},
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    URL,
    console,
  };
  context.window = { location, document: context.document };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  return { listeners, location };
}

function element({ text = '', classes = [], dataset = {}, tag = 'button' } = {}) {
  const node = {
    textContent: text,
    dataset: { ...dataset },
    tagName: tag.toUpperCase(),
    classes,
  };
  node.closest = (selector) => {
    const matched = selector.split(',').some((raw) => {
      const token = raw.trim();
      if (token === '[data-module]') return Object.prototype.hasOwnProperty.call(node.dataset, 'module');
      if (token === '.primary-tab') return node.classes.includes('primary-tab');
      if (token === '.primary-tabs') return node.classes.includes('primary-tabs');
      if (token === '.list-toolbar') return node.classes.includes('list-toolbar');
      if (token === 'button') return node.tagName === 'BUTTON';
      if (token === 'a') return node.tagName === 'A';
      return false;
    });
    return matched ? node : null;
  };
  return node;
}

function click(listeners, target) {
  const entry = listeners.find((item) => item.type === 'click' && item.capture);
  assert.ok(entry, '公共头部脚本应在捕获阶段监听模块点击');

  const event = {
    target,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    },
    stopImmediatePropagation() {
      this.immediateStopped = true;
    },
  };
  entry.handler(event);
  return event;
}

test('列表页点击“图库管理”进入图库管理工作台', () => {
  const source = read('assets/shared-brand-header.js');
  const { listeners, location } = loadHeader(source, 'file:///demo/index.html');
  const tab = element({ text: '图库管理', classes: ['primary-tab'], dataset: { module: '图库管理' } });

  const event = click(listeners, tab);

  assert.equal(location.href, GALLERY_PAGE);
  assert.equal(event.defaultPrevented, true);
  assert.equal(event.propagationStopped, true);
  assert.equal(event.immediateStopped, true);
});

test('没有 data-module 的模块按钮同样可以跳转', () => {
  const source = read('assets/shared-brand-header.js');
  const { listeners, location } = loadHeader(source, 'file:///demo/intelligent-review.html');
  const tab = element({ text: '  图库管理  ', classes: ['primary-tabs'] });

  click(listeners, tab);

  assert.equal(location.href, GALLERY_PAGE);
});

test('已经在图库管理页时不会重复跳转', () => {
  const source = read('assets/shared-brand-header.js');
  const { listeners, location } = loadHeader(source, 'file:///demo/gallery-management.html');
  const tab = element({ text: '图库管理', classes: ['primary-tab'] });

  const event = click(listeners, tab);

  assert.equal(location.href, 'file:///demo/gallery-management.html');
  assert.equal(event.defaultPrevented, undefined);
});

test('模块名以外的点击不会被拦截', () => {
  const source = read('assets/shared-brand-header.js');
  const { listeners, location } = loadHeader(source, 'file:///demo/index.html');

  click(listeners, element({ text: '某高校高性能计算GPU集群建设项目', classes: ['tender-card-title'], tag: 'p' }));
  click(listeners, element({ text: '搜索项目', classes: ['list-toolbar'] }));

  assert.equal(location.href, 'file:///demo/index.html');
});

const siblingPackages = new URL('../智能审查demo版本3/', root);
const galleryPackage = new URL('../../图库管理demo/', root);
const hasSiblingPackages = fs.existsSync(siblingPackages) && fs.existsSync(galleryPackage);

test('独立 demo 包中的“图库管理”指回工作台页', { skip: !hasSiblingPackages }, () => {
  const reviewHeader = read('../智能审查demo版本3/assets/shared-brand-header.js');
  const reviewModule = read('../智能审查demo版本3/assets/intelligent-review.mjs');
  const galleryHeader = read('../../图库管理demo/assets/shared-brand-header.js');
  const galleryModule = read('../../图库管理demo/assets/gallery-management.mjs');

  assert.match(reviewHeader, /'图库管理': '\.\.\/demo-tender\/gallery-management\.html'/);
  assert.match(reviewModule, /\['图库管理', '\.\.\/demo-tender\/gallery-management\.html'\]/);
  assert.match(galleryHeader, /'图库管理': '\.\.\/DEMO\/demo-tender\/gallery-management\.html'/);
  assert.match(galleryModule, /\['图库管理', '\.\.\/DEMO\/demo-tender\/gallery-management\.html'\]/);
});

test('独立 demo 包点击“图库管理”会跳到工作台页而不是本包的旧列表页', { skip: !hasSiblingPackages }, () => {
  const source = read('../../图库管理demo/assets/shared-brand-header.js');
  const href = 'file:///interaction/%E5%9B%BE%E5%BA%93%E7%AE%A1%E7%90%86demo/gallery-management.html';
  const { listeners, location } = loadHeader(source, href);
  const tab = element({ text: '图库管理', classes: ['primary-tab', 'primary-tabs'] });

  click(listeners, tab);

  assert.equal(location.href, PACKAGE_GALLERY);
});

test('图库管理工作台自带图库详情资源，服务根目录换到 demo-tender 也能加载', () => {
  const source = read('assets/gallery-management.mjs');

  assert.match(source, /\.\/gallery-demo\/gallery-detail\.html/);
  assert.doesNotMatch(source, /\.\.\/\.\.\/图库管理demo/);
  assert.equal(fs.existsSync(new URL('gallery-demo/gallery-detail.html', root)), true);
  assert.equal(fs.existsSync(new URL('gallery-demo/assets/gallery/01-server-rack.svg', root)), true);
  assert.match(read('gallery-demo/gallery-detail.html'), /assets\/gallery\/01-server-rack\.svg/);
});

test('自带图库详情页里的本地图片和返回路径都指向真实文件', () => {
  const detailUrl = new URL('gallery-demo/gallery-detail.html', root);
  const source = read('gallery-demo/gallery-detail.html');

  const references = [...source.matchAll(/(?:src|href)="([^"]+)"|url\((['"])([^)'"]+)\2\)/g)]
    .map((match) => match[1] ?? match[3])
    .filter((reference) => reference && !/^(?:https?:|data:|mailto:|#|[+`'$])/.test(reference));

  const missing = [...new Set(references)]
    .map((reference) => reference.replace(/[?#].*$/, ''))
    .filter((reference) => !fs.existsSync(new URL(reference, detailUrl)));

  assert.deepEqual(missing, []);
  assert.match(source, /backBtn"\)\.onclick=function\(\)\{window\.location\.href="\.\.\/gallery-management\.html"/);
});
