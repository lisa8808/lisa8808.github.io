(() => {
  'use strict';

  if (window.__TENDER_DEMO__) return;

  const prompts = [
    '根据招标文件生成技术标大纲。',
    '根据技术标大纲撰写投标正文。',
    '一键生成技术标。',
  ];

  function getPromptBar() {
    let bar = document.querySelector('[data-active-built-in-prompts]');
    if (bar) return bar;

    bar = document.createElement('div');
    bar.className = 'message-suggestions active-built-in-prompts';
    bar.dataset.activeBuiltInPrompts = 'true';
    bar.innerHTML = prompts.map((prompt) => `<button type="button" data-active-built-in-prompt="${prompt}">${prompt}</button>`).join('');
    return bar;
  }

  function hasPendingStateAfter(message) {
    let next = message?.nextElementSibling;
    while (next && !next.classList.contains('chat-message')) {
      if (next.matches('.config-waiting, .pending-confirm-card, .pending-confirm-actions')
        || next.querySelector('.config-waiting, .pending-confirm-card, .pending-confirm-actions')) return true;
      next = next.nextElementSibling;
    }
    return false;
  }

  function hasPendingConversationState(message) {
    return Boolean(message?.classList.contains('typing') || hasPendingStateAfter(message));
  }

  function syncPromptEntries() {
    const messages = document.querySelector('.chat-messages');
    if (!messages) return;
    const latestAssistant = Array.from(messages.querySelectorAll('.chat-message.assistant')).at(-1);
    if (!latestAssistant) return;

    const bar = getPromptBar();
    const pending = hasPendingConversationState(latestAssistant);
    bar.style.display = pending ? 'none' : '';
    if (!pending && latestAssistant.nextElementSibling !== bar) latestAssistant.after(bar);

    document.querySelectorAll('.message-suggestions:not([data-active-built-in-prompts])').forEach((container) => {
      if (!container.classList.contains('pending-confirm-actions')) container.style.display = 'none';
    });
    document.querySelectorAll('.context-suggestions').forEach((container) => {
      container.style.display = 'none';
    });

    document.querySelectorAll('.chat-message.assistant .message-actions').forEach((actions) => {
      const assistant = actions.closest('.chat-message.assistant');
      actions.style.display = hasPendingConversationState(assistant) ? 'none' : '';
    });
  }

  function sendPrompt(prompt) {
    const form = document.querySelector('.chat-input');
    const input = form?.querySelector('input[aria-label="提问内容"]');
    if (!form || !input || input.disabled) return;

    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (valueSetter) valueSetter.call(input, prompt);
    else input.value = prompt;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    window.setTimeout(() => {
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 30);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-active-built-in-prompt]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    sendPrompt(button.dataset.activeBuiltInPrompt);
  }, true);

  new MutationObserver(syncPromptEntries).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  syncPromptEntries();
})();
