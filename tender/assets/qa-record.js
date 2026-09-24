(() => {
  const RECORD_TITLE = '问答记录_投标评分项梳理';
  const samplePairs = [
    {
      question: '这个项目最应该重点响应哪些评分项？',
      answer: '建议重点响应项目开发技术方案、项目实施方案、系统安全设计和服务保障。编写时要逐项对应评分标准，突出方案的完整性、科学性、可行性，以及项目实施计划、质量保障和风险应对措施。',
    },
  ];
  const savedPairs = new Map();
  let modal = null;

  const getMessageText = (message) => {
    const textNode = Array.from(message?.children || []).find((child) => child.matches('span'));
    return textNode?.textContent?.trim() || '';
  };

  const getPair = (assistantMessage) => {
    let previous = assistantMessage?.previousElementSibling;
    while (previous && !previous.matches('.chat-message.user')) previous = previous.previousElementSibling;
    return {
      question: getMessageText(previous),
      answer: getMessageText(assistantMessage),
    };
  };

  const getRecordDate = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('qa-record-modal-open');
  };

  const openModal = () => {
    if (!modal) return;
    const body = modal.querySelector('.qa-record-modal-body');
    body.replaceChildren();
    const pairs = savedPairs.size ? savedPairs.values() : samplePairs;
    for (const { question, answer } of pairs) {
      const pair = document.createElement('article');
      pair.className = 'qa-record-pair';
      for (const [label, text] of [['用户提问', question], ['AI回复', answer]]) {
        const labelNode = document.createElement('span');
        labelNode.className = 'qa-record-label';
        labelNode.textContent = label;
        const textNode = document.createElement('p');
        textNode.className = 'qa-record-text';
        textNode.textContent = text;
        pair.append(labelNode, textNode);
      }
      body.append(pair);
    }
    modal.hidden = false;
    document.body.classList.add('qa-record-modal-open');
  };

  const getModal = () => {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'qa-record-modal-backdrop';
    modal.hidden = true;
    modal.innerHTML = `
      <section class="qa-record-modal" role="dialog" aria-modal="true" aria-labelledby="qaRecordModalTitle">
        <header class="qa-record-modal-header">
          <h2 id="qaRecordModalTitle">${RECORD_TITLE}</h2>
          <button class="qa-record-modal-close" type="button" aria-label="关闭问答记录">×</button>
        </header>
        <div class="qa-record-modal-body"></div>
        <footer class="qa-record-modal-footer"><button type="button">关闭</button></footer>
      </section>`;
    document.body.append(modal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.closest('.qa-record-modal-close, .qa-record-modal-footer button')) closeModal();
    });
    return modal;
  };

  const syncRecord = () => {
    const resultList = document.querySelector('#result-panel .result-list');
    if (!resultList) return;

    resultList.querySelectorAll('.record-row').forEach((row) => {
      const title = row.querySelector('strong')?.textContent?.trim() || '';
      if (row.classList.contains('qa-record-row')) return;
      const isLegacyQaRecord = title.startsWith('问答记录_') && !title.startsWith(RECORD_TITLE);
      if (isLegacyQaRecord) row.remove();
    });

    const existing = resultList.querySelector('.qa-record-row');
    if (existing) return;

    const row = document.createElement('div');
    row.className = 'record-row qa-record-row';
    row.innerHTML = `
      <button class="record-main" type="button">
        <span class="record-icon qa"><img src="./assets/figma/record-book.svg" alt=""></span>
        <span class="record-copy"><strong title="${RECORD_TITLE}">${RECORD_TITLE}</strong><small>${getRecordDate()}</small></span>
      </button>
      <button class="more-button" type="button" aria-label="文件更多操作"><img src="./assets/figma/more.svg" alt=""></button>`;
    row.querySelector('.record-main').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openModal();
    });
    resultList.append(row);
  };

  document.addEventListener('click', (event) => {
    const saveButton = event.target.closest('#app .chat-message.assistant .save-note');
    if (!saveButton) return;
    const assistantMessage = saveButton.closest('.chat-message.assistant');
    const pair = getPair(assistantMessage);
    if (!pair.question || !pair.answer) return;
    const key = `${pair.question}\u0000${pair.answer}`;
    window.setTimeout(() => {
      if (saveButton.classList.contains('active')) savedPairs.set(key, pair);
      else savedPairs.delete(key);
      syncRecord();
    }, 0);
  });

  getModal();
  syncRecord();
  new MutationObserver(syncRecord).observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();
