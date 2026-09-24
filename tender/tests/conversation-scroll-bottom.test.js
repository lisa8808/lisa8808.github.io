const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('标书撰写的对话详情页默认滚到对话最底部', () => {
  for (const page of [
    'interpretation-detail-active.html',
    'technical-detail-active.html',
    'business-detail-active.html',
    'deviation-detail-active.html',
  ]) {
    assert.match(read(page), /assets\/conversation-scroll-bottom\.js\?v=20260912-conversation-bottom/);
  }

  const source = read('assets/conversation-scroll-bottom.js');
  assert.match(source, /body\.scrollTop = body\.scrollHeight/);
  assert.match(source, /requestAnimationFrame\(scrollToBottom\)/);
  assert.match(source, /pointerdown/);
});

test('对话区渲染后自动滚到底部，用户操作后不再强制滚动', () => {
  const source = read('assets/conversation-scroll-bottom.js');
  const conversationBody = { scrollTop: 0, scrollHeight: 900 };
  const listeners = [];
  const context = {
    document: {
      documentElement: {},
      querySelectorAll: () => [conversationBody],
      addEventListener: (type, handler, options) => listeners.push({ type, handler, options }),
    },
    window: {
      addEventListener() {},
      setTimeout(callback) {
        callback();
        return 1;
      },
    },
    requestAnimationFrame(callback) {
      callback();
      return 1;
    },
    MutationObserver: class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {
        this.callback();
      }
      disconnect() {}
    },
  };

  vm.runInNewContext(source, context);
  assert.equal(conversationBody.scrollTop, 900);

  const pointerHandler = listeners.find((item) => item.type === 'pointerdown');
  conversationBody.scrollTop = 120;
  pointerHandler.handler();
  context.window.setTimeout(() => {});
  assert.equal(conversationBody.scrollTop, 120);
});
