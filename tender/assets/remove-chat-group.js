(() => {
  const app = document.getElementById('app');
  const targetText = '一键生成技术标。';
  const mode = window.__TENDER_DEMO__;
  const modeQuestion = mode === 'outline'
    ? '根据招标文件生成技术标大纲。'
    : mode === 'body'
      ? '根据技术标大纲撰写投标正文。'
      : '';

  if (!app) return;
  if (!mode) return;

  const removeOneClickGroup = () => {
    app.querySelectorAll('.chat-message.user').forEach((userMessage) => {
      if (userMessage.textContent.trim() !== targetText) return;

      const assistantMessage = userMessage.nextElementSibling;

      if (assistantMessage?.classList.contains('chat-message') && assistantMessage.classList.contains('assistant')) {
        assistantMessage.remove();
      }

      userMessage.remove();
    });
  };

  const moveModeQuestionToBottom = () => {
    if (!modeQuestion) return;

    const messages = app.querySelector('.conversation-body .chat-messages') || app.querySelector('.chat-messages');
    if (!messages) return;

    const userMessage = Array.from(messages.querySelectorAll('.chat-message.user'))
      .find((message) => message.textContent.trim() === modeQuestion);
    const assistantMessage = userMessage?.nextElementSibling;

    if (!userMessage || !assistantMessage?.classList.contains('chat-message') || !assistantMessage.classList.contains('assistant')) return;
    if (messages.lastElementChild === assistantMessage) return;

    messages.append(userMessage, assistantMessage);
    requestAnimationFrame(() => {
      const body = app.querySelector('.conversation-body');
      if (body) body.scrollTop = body.scrollHeight;
    });
  };

  const syncConversation = () => {
    removeOneClickGroup();
    moveModeQuestionToBottom();
  };

  syncConversation();
  new MutationObserver(syncConversation).observe(app, {
    childList: true,
    subtree: true,
  });
})();
