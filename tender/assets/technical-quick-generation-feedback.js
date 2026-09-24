(() => {
  const BODY_PREFIX = '技术正文_';
  const OUTLINE_PREFIX = '技术大纲_';
  const TOAST_TEXT = '为缩短等待时长，本次将优先生成技术标前三章。内容生成完毕后，您可预览文稿，按需生成完整文档。';
  const STEPS = ['解析大纲文件', '创建章节编写任务', '生成章节正文', '校验正文结构', '生成结果文件'];
  const OUTLINE_STEPS = ['读取解读结果', '提取技术要求', '组织目录结构', '校验目录层级', '生成结果文件'];
  let feedbackPending = false;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  const sourceName = () => {
    const node = document.querySelector('.upload-panel .upload-group .file-row .ellipsis');
    return (node?.textContent?.trim() || '某高校高性能计算GPU集群建设项目.docx').replace(/\.[^.]+$/, '');
  };

  const showToast = () => {
    document.querySelector('[data-technical-body-task-toast]')?.remove();
    const node = document.createElement('div');
    node.className = 'technical-body-task-toast';
    node.dataset.technicalBodyTaskToast = 'true';
    node.textContent = TOAST_TEXT;
    document.body.append(node);
    window.setTimeout(() => node.remove(), 5200);
  };

  const enhance = (row) => {
    if (!row || row.querySelector('.technical-body-progress-trigger')) return;
    const copy = row.querySelector('.processing-copy');
    if (!copy) return;
    const trigger = document.createElement('span');
    trigger.className = 'technical-body-progress-trigger progress-trigger';
    trigger.tabIndex = 0;
    trigger.setAttribute('aria-label', '查看处理进度');
    trigger.innerHTML = `<small>正在处理中（1/5）</small><span class="progress-popover"><span class="progress-popover-title"><b>处理进度</b><strong>1/5</strong></span>${STEPS.map((step, index) => `<span class="progress-step ${index === 0 ? 'active' : 'pending'}"><i></i>${step}</span>`).join('')}</span>`;
    copy.append(trigger);
  };

  const addOrEnhance = ({ forceNew = false } = {}) => {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return;
    const minute = window.TechnicalResultNaming?.formatMinute?.() || new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '');
    const title = `${BODY_PREFIX}${sourceName()}_${minute}`;
    const rows = Array.from(list.querySelectorAll('.processing-row'))
      .filter((item) => item.querySelector('strong')?.textContent?.trim().startsWith(BODY_PREFIX));
    rows.forEach(enhance);
    if (rows.length && !forceNew) return;
    const created = document.createElement('div');
    created.className = 'processing-row technical-body-processing';
    created.dataset.technicalBodyTask = `${title}-${Date.now()}`;
    created.innerHTML = `<img class="processing-icon" src="./assets/figma/record-refresh.svg" alt=""><span class="processing-copy"><strong title="${title}">${title}</strong></span><button class="more-button" type="button" aria-label="任务更多操作"><img src="./assets/figma/more.svg" alt=""></button>`;
    list.prepend(created);
    enhance(created);
  };

  const settle = ({ forceNew = false } = {}) => {
    addOrEnhance({ forceNew });
    showToast();
  };

  const addOutlineTask = () => {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return;
    const minute = window.TechnicalResultNaming?.formatMinute?.() || new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '');
    const title = `${OUTLINE_PREFIX}${sourceName()}_${minute}`;
    const row = document.createElement('div');
    row.className = 'processing-row technical-outline-processing';
    row.dataset.technicalOutlineTask = `${title}-${Date.now()}`;
    row.setAttribute('aria-live', 'polite');
    row.innerHTML = `<img class="processing-icon" src="./assets/figma/record-refresh.svg" alt=""><span class="processing-copy"><strong title="${escapeHtml(title)}">${escapeHtml(title)}</strong><span class="technical-body-progress-trigger progress-trigger" tabindex="0" aria-label="查看处理进度"><small>正在生成中（1/5）</small><span class="progress-popover"><span class="progress-popover-title"><b>处理进度</b><strong>1/5</strong></span>${OUTLINE_STEPS.map((step, index) => `<span class="progress-step ${index === 0 ? 'active' : 'pending'}"><i></i>${step}</span>`).join('')}</span></span></span><button class="more-button" type="button" aria-label="任务更多操作"><img src="./assets/figma/more.svg" alt=""></button>`;
    list.prepend(row);
  };

  window.addEventListener('technical:generate-full-from-outline', () => {
    settle({ forceNew: true });
  });

  window.addEventListener('technical:generate-outline-from-interpretation', addOutlineTask);

  const closeQuickConfirm = (modal) => {
    modal?.remove();
    document.documentElement.classList.remove('technical-quick-confirm-open');
    document.body.classList.remove('technical-quick-confirm-open');
  };

  const openQuickConfirm = (trigger) => {
    const existing = document.querySelector('[data-technical-quick-confirm]');
    if (existing) {
      existing.querySelector('[data-quick-confirm-confirm]')?.focus({ preventScroll: true });
      return;
    }

    const fileName = sourceName();
    const modal = document.createElement('div');
    modal.className = 'technical-quick-confirm-modal';
    modal.dataset.technicalQuickConfirm = 'true';
    modal.innerHTML = `
      <section class="technical-quick-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="technical-quick-confirm-title">
        <header class="technical-quick-confirm-header">
          <div class="technical-quick-confirm-title">
            <img src="./assets/figma/detail-magic.svg" alt="">
            <h2 id="technical-quick-confirm-title">一键生成技术标</h2>
          </div>
          <button class="technical-quick-confirm-close" type="button" data-quick-confirm-close aria-label="关闭一键生成技术标确认">×</button>
        </header>
        <div class="technical-quick-confirm-content">
          <div class="technical-quick-confirm-file"><span>招标文件</span><strong title="${escapeHtml(fileName)}">《${escapeHtml(fileName)}》</strong></div>
          <p>一键生成技术标将使用系统默认配置，依次执行文件解读、生成大纲和撰写全文三个步骤。全部流程耗时较长，建议您分步骤编写；若仍要继续，请确认本次操作。</p>
        </div>
        <footer class="technical-quick-confirm-footer">
          <button class="technical-quick-confirm-cancel" type="button" data-quick-confirm-cancel>取消</button>
          <button class="technical-quick-confirm-primary" type="button" data-quick-confirm-confirm>确认</button>
        </footer>
      </section>`;

    const close = () => closeQuickConfirm(modal);
    modal.querySelector('[data-quick-confirm-close]').addEventListener('click', close);
    modal.querySelector('[data-quick-confirm-cancel]').addEventListener('click', close);
    modal.querySelector('[data-quick-confirm-confirm]').addEventListener('click', () => {
      close();
      settle({ forceNew: true });
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });

    document.body.append(modal);
    document.documentElement.classList.add('technical-quick-confirm-open');
    document.body.classList.add('technical-quick-confirm-open');
    modal.querySelector('[data-quick-confirm-confirm]').focus({ preventScroll: true });
    trigger?.setAttribute('aria-expanded', 'true');
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button?.matches('#result-panel .quick-mode .quick-action')) return;

    // Keep the quick action out of the chat flow. It has its own confirmation dialog.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!feedbackPending) openQuickConfirm(button);
  }, true);
})();
