const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('点击新建标书撰写进入标前评估空白页', () => {
  assert.match(read('index.html'), /assets\/list-create-entry\.js/);

  let clickHandler;
  const document = {
    addEventListener(type, handler, capture) {
      if (type === 'click' && capture === true) clickHandler = handler;
    },
  };
  const window = { location: { href: 'https://example.test/index.html' } };
  const event = {
    target: {
      closest(selector) {
        return selector === '.create-button, .new-project-card' ? {} : null;
      },
    },
    preventDefault() {},
    stopPropagation() {},
    stopImmediatePropagation() {},
  };

  runBrowserScript('list-create-entry.js', { document, window });
  clickHandler(event);

  assert.equal(window.location.href, './interpretation-detail-empty.html');
});

test('旧技术标空白页地址兼容跳转到标前评估空白页并保留参数', () => {
  const html = read('technical-detail-empty.html');

  assert.match(html, /window\.location\.replace/);
  assert.match(html, /interpretation-detail-empty\.html/);
  assert.match(html, /window\.location\.search/);
  assert.match(html, /window\.location\.hash/);
});

test('标前评估空白页沿用原空白页主体并只加载独立模式资源', () => {
  const html = read('interpretation-detail-empty.html');

  assert.match(html, /assets\/detail-empty-Cq0yH3sO\.js/);
  assert.match(html, /assets\/interpretation-empty-mode\.js/);
  assert.match(html, /assets\/interpretation-empty-mode\.css/);
  assert.match(html, /class="interpretation-mode-page interpretation-empty-page"/);
  assert.doesNotMatch(html, /assets\/interpretation-mode-actions\.js/);
  assert.doesNotMatch(html, /assets\/interpretation-mode-tabs\.js/);
  assert.doesNotMatch(html, /assets\/deviation-response-modal\.(?:css|js)/);
  assert.doesNotMatch(html, /assets\/deviation-response-config\.js/);
});

test('新建标书撰写进入的空白页项目名显示为未命名项目', () => {
  const header = read('assets/shared-brand-header.js');
  assert.match(header, /path\.endsWith\('interpretation-detail-empty\.html'\) \|\| path\.endsWith\('technical-detail-empty\.html'\)/);
  assert.match(header, /return '未命名项目';/);

  const emptyBundle = read('assets/detail-empty-Cq0yH3sO.js');
  assert.ok(emptyBundle.includes('未命名项目'), '空白页默认项目名应为未命名项目');
  assert.ok(!emptyBundle.includes('未命名标书项目'), '空白页不应残留未命名标书项目');
});

test('标前评估空白页复用两个精准模式图标并禁用全部操作按钮', () => {
  const preciseButtons = [createModeButton(), createModeButton(), createModeButton()];
  const quickText = { nodeType: 3, textContent: '一键生成技术标' };
  const quickButton = createModeButton();
  quickButton.childNodes = [{ nodeType: 1 }, quickText];
  const deviationButton = createModeButton();
  const document = {
    querySelector(selector) {
      if (selector === '#result-panel .quick-action') return quickButton;
      if (selector === '#result-panel .deviation-response-action') return deviationButton;
      return null;
    },
    querySelectorAll(selector) {
      return selector === '#result-panel .result-mode .tool-grid > button'
        ? preciseButtons.filter((button) => !button.removed)
        : [];
    },
    documentElement: {},
  };
  class MutationObserver {
    observe() {}
    disconnect() {}
  }

  runBrowserScript('interpretation-empty-mode.js', { document, MutationObserver });

  assert.equal(preciseButtons.filter((button) => !button.removed).length, 2);
  assert.equal(preciseButtons[0].span.innerHTML, '<b>01</b> 标书要点解读');
  assert.equal(preciseButtons[1].span.innerHTML, '<b>02</b> 投标符合性自评');
  assert.equal(quickText.textContent, '一键投标自评');
  assert.equal(deviationButton.removed, true);
  for (const button of [preciseButtons[0], preciseButtons[1], quickButton]) {
    assert.equal(button.disabled, true);
    assert.equal(button.attributes.get('aria-disabled'), 'true');
  }
});

test('四个 Tab 仅在标前评估空白页与精准模式左侧对齐', () => {
  const css = read('assets/interpretation-empty-mode.css');

  assert.match(
    css,
    /body\.interpretation-empty-page #result-panel \.result-tabs\s*\{[^}]*margin-left:\s*0;/s,
  );
  assert.match(css, /body\.interpretation-empty-page #result-panel \.quick-action:disabled/);
});

test('标前评估空白页持续阻止旧偏离响应按钮重新进入操作区', () => {
  const preciseButtons = [createModeButton(), createModeButton()];
  const quickButton = createModeButton();
  quickButton.childNodes = [{ nodeType: 3, textContent: '一键生成技术标' }];
  const resultPanel = {};
  let delayedDeviationButton = null;
  let resultPanelObserver;
  const document = {
    querySelector(selector) {
      if (selector === '#result-panel') return resultPanel;
      if (selector === '#result-panel .quick-action') return quickButton;
      if (selector === '#result-panel .deviation-response-action') return delayedDeviationButton;
      return null;
    },
    querySelectorAll(selector) {
      return selector === '#result-panel .result-mode .tool-grid > button' ? preciseButtons : [];
    },
    documentElement: {},
  };
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      if (target === resultPanel) resultPanelObserver = this.callback;
    }
    disconnect() {}
  }

  runBrowserScript('interpretation-empty-mode.js', { document, MutationObserver });
  delayedDeviationButton = createModeButton();
  resultPanelObserver();

  assert.equal(delayedDeviationButton.removed, true);
});

function createModeButton() {
  return {
    removed: false,
    disabled: false,
    attributes: new Map(),
    span: { innerHTML: '' },
    childNodes: [],
    querySelector(selector) {
      return selector === 'span' ? this.span : null;
    },
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    remove() {
      this.removed = true;
    },
  };
}

function runBrowserScript(fileName, globals) {
  const source = read(path.join('assets', fileName));
  vm.runInNewContext(source, globals, { filename: fileName });
}
