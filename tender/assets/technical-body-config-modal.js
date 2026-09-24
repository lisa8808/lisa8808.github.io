(() => {
  const OUTLINE_PREFIX = '技术大纲_';
  const BODY_PREFIX = '技术正文_';

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  function getSourceFileName() {
    return document.querySelector('.upload-panel .upload-group .file-row .ellipsis')?.textContent?.trim()
      || document.querySelector('.upload-panel .upload-group .file-row')?.textContent?.trim()
      || '某高校高性能计算GPU集群建设项目.docx';
  }

  function getOutlineRecords() {
    return Array.from(document.querySelectorAll('#result-panel .record-row strong'))
      .map((node) => node.textContent.trim())
      .filter((title) => title.startsWith(OUTLINE_PREFIX));
  }

  function closeModal(modal) {
    const previousFocus = modal.__previousFocus;
    modal.remove();
    document.documentElement.classList.remove('technical-body-config-open');
    document.body.classList.remove('technical-body-config-open');
    previousFocus?.focus?.({ preventScroll: true });
  }

  function addProcessingRecord(fileName) {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return;

    const baseName = fileName.replace(/\.[^.]+$/, '');
    const minute = window.TechnicalResultNaming?.formatMinute?.() || new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '');
    const title = `${BODY_PREFIX}${baseName}_${minute}`;
    const row = document.createElement('div');
    row.className = 'processing-row technical-body-processing';
    row.dataset.technicalBodyToastShown = 'true';
    row.dataset.technicalBodyTask = title;
    row.innerHTML = `
      <img class="processing-icon" src="./assets/figma/record-refresh.svg" alt="">
      <span class="processing-copy"><strong title="${title}">${title}</strong></span>
      <button class="more-button" type="button" aria-label="任务更多操作"><img src="./assets/figma/more.svg" alt=""></button>`;
    addProgressTrigger(row);
    list.prepend(row);
  }

  function addProgressTrigger(row) {
    const copy = row.querySelector('.processing-copy');
    if (!copy || copy.querySelector('.technical-body-progress-trigger')) return;
    const steps = ['解析大纲文件', '创建章节编写任务', '生成章节正文', '校验正文结构', '生成结果文件'];
    copy.querySelector(':scope > small')?.remove();
    const trigger = document.createElement('span');
    trigger.className = 'technical-body-progress-trigger progress-trigger';
    trigger.tabIndex = 0;
    trigger.setAttribute('aria-label', '查看处理进度');
    trigger.innerHTML = `<small>正在处理中（1/5）</small><span class="progress-popover"><span class="progress-popover-title"><b>处理进度</b><strong>1/5</strong></span>${steps.map((step, index) => `<span class="progress-step ${index === 0 ? 'active' : 'pending'}"><i></i>${step}</span>`).join('')}</span>`;
    copy.append(trigger);
  }

  function showTaskToast() {
    document.querySelector('[data-technical-body-task-toast]')?.remove();
    const toast = document.createElement('div');
    toast.className = 'technical-body-task-toast';
    toast.dataset.technicalBodyTaskToast = 'true';
    toast.textContent = '为缩短等待时长，本次将优先生成技术标前三章。内容生成完毕后，您可预览文稿，按需生成完整文档。';
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 5200);
  }

  function openModal(trigger) {
    const existing = document.querySelector('[data-technical-body-config]');
    if (existing) {
      existing.querySelector('[data-body-config-outline]')?.focus({ preventScroll: true });
      return;
    }

    const outlines = getOutlineRecords();
    const fileName = getSourceFileName();
    const modal = document.createElement('div');
    modal.className = 'technical-body-config-modal';
    modal.dataset.technicalBodyConfig = 'true';
    modal.__previousFocus = trigger;
    modal.innerHTML = `
      <section class="technical-body-config-dialog" role="dialog" aria-modal="true" aria-labelledby="technical-body-config-title">
        <header class="technical-body-config-header">
          <div class="technical-body-config-title">
            <img src="./assets/figma/tool-write-new.svg" alt="">
            <h2 id="technical-body-config-title">生成正文</h2>
          </div>
          <button class="technical-body-config-close" type="button" data-body-config-close aria-label="关闭生成正文">×</button>
        </header>
        <div class="technical-body-config-content">
          <section class="technical-body-config-source" aria-labelledby="technical-body-source-title">
            <h3 id="technical-body-source-title">招标文件</h3>
            <div class="technical-body-source-file">
              <img src="./assets/figma/word.svg" alt="">
              <span title="${escapeHtml(fileName)}">${escapeHtml(fileName)}</span>
            </div>
          </section>
          <section class="technical-body-config-outline" aria-labelledby="technical-body-outline-title">
            <h3 id="technical-body-outline-title">技术标大纲</h3>
            <p>正文需依赖大纲生成，请选择项目中已生成大纲文件或手动粘贴大纲内容。</p>
            <div class="technical-body-mode-tabs" role="tablist" aria-label="大纲提供方式">
              <button class="is-active" type="button" role="tab" aria-selected="true" data-body-mode="select">
                <img src="./assets/figma/record-book.svg" alt="">选择已生成大纲
              </button>
              <button type="button" role="tab" aria-selected="false" data-body-mode="paste">
                <img src="./assets/figma/feedback-copy.svg" alt="">粘贴大纲内容
              </button>
            </div>
            <div class="technical-body-mode-panel" data-body-panel="select">
              <label for="technical-body-outline"><b aria-hidden="true">*</b>选择已生成大纲</label>
              <select id="technical-body-outline" data-body-config-outline ${outlines.length ? '' : 'disabled'}>
                <option value="">请选择大纲文件</option>
                ${outlines.map((title) => `<option value="${escapeHtml(title)}">${escapeHtml(title)}</option>`).join('')}
              </select>
              <p class="technical-body-config-hint" data-body-config-hint>${outlines.length ? '' : '暂未找到已生成的技术标大纲，请先完成大纲生成'}</p>
            </div>
            <div class="technical-body-mode-panel" data-body-panel="paste" hidden>
              <label for="technical-body-outline-content"><b aria-hidden="true">*</b>填写技术标大纲</label>
              <textarea id="technical-body-outline-content" data-body-config-content placeholder="请输入大纲内容"></textarea>
            </div>
          </section>
        </div>
        <footer class="technical-body-config-footer">
          <button class="technical-body-config-cancel" type="button" data-body-config-cancel>取消</button>
          <button class="technical-body-config-confirm" type="button" data-body-config-submit disabled>生成正文</button>
        </footer>
      </section>`;

    const select = modal.querySelector('[data-body-config-outline]');
    const textarea = modal.querySelector('[data-body-config-content]');
    const submit = modal.querySelector('[data-body-config-submit]');
    let mode = 'select';
    const updateSubmit = () => {
      submit.disabled = mode === 'select' ? !select?.value : !textarea?.value.trim();
    };
    modal.querySelectorAll('[data-body-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        mode = button.dataset.bodyMode;
        modal.querySelectorAll('[data-body-mode]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
        });
        modal.querySelectorAll('[data-body-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.bodyPanel !== mode;
        });
        updateSubmit();
        (mode === 'select' ? select : textarea)?.focus({ preventScroll: true });
      });
    });
    select?.addEventListener('change', updateSubmit);
    textarea?.addEventListener('input', updateSubmit);

    const close = () => closeModal(modal);
    modal.querySelector('[data-body-config-close]').addEventListener('click', close);
    modal.querySelector('[data-body-config-cancel]').addEventListener('click', close);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    submit.addEventListener('click', () => {
      const outlineValue = mode === 'select' ? select.value : textarea.value.trim();
      if (!outlineValue) return;
      close();
      addProcessingRecord(fileName);
      showTaskToast();
      window.dispatchEvent(new CustomEvent('technical:body-generated', {
        detail: { fileName, outlineName: outlineValue, outlineMode: mode }
      }));
    });

    document.body.append(modal);
    document.documentElement.classList.add('technical-body-config-open');
    document.body.classList.add('technical-body-config-open');
    select?.focus({ preventScroll: true });
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#result-panel .tool-grid button');
    if (!button) return;
    const label = button.textContent.replace(/\s+/g, '');
    if (!label.includes('03') || !label.includes('撰写全文')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openModal(button);
  }, true);
})();
