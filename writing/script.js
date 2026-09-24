(function () {
  const {
    appendDisplayFiles,
    demoKnowledgeFiles,
    demoRecords,
    demoSourceFiles,
    extractOutline,
    formatSelectedSources,
    planConversation,
    renderMarkdown,
  } = globalThis.DemoContent;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const modal = $('.document-modal');
  const toast = $('.toast');
  const sourceFiles = demoSourceFiles.map((file) => ({ ...file }));
  const knowledgeFiles = demoKnowledgeFiles.map((file) => ({ ...file }));
  let toastTimer;
  let activeRecord = null;
  let activeVersion = null;
  let activeWritingMode = 'general';
  let resultCollapsed = false;
  let historyExpanded = false;

  function showToast(message) {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
  }

  function fileIcon(type) {
    return type === 'pdf' ? './assets/pdf.svg' : './assets/document.svg';
  }

  function fileAlt(type) {
    return type === 'pdf' ? 'PDF 文档' : 'Word 文档';
  }

  function renderFileGroup(group, files) {
    const list = $(`[data-file-group="${group}"]`);
    if (!list) return;
    list.innerHTML = files.map((file, index) => `
      <label class="file-row${file.selected ? ' selected' : ''}">
        <img class="file-type-icon" src="${fileIcon(file.type)}" alt="${fileAlt(file.type)}" />
        <span title="${file.name}">${file.name}</span>
        <input type="checkbox" data-file-group="${group}" data-file-index="${index}"${file.selected ? ' checked' : ''} />
      </label>
    `).join('');
  }

  function updateSelectionSummary() {
    const selectedSources = sourceFiles.filter((file) => file.selected).length;
    const selectedKnowledge = knowledgeFiles.filter((file) => file.selected).length;
    const sourceCount = $('[data-source-count]');
    const knowledgeCount = $('[data-knowledge-count]');
    const selectedCount = $('[data-selected-count]');
    if (sourceCount) sourceCount.textContent = selectedSources;
    if (knowledgeCount) knowledgeCount.textContent = selectedKnowledge;
    if (selectedCount) selectedCount.textContent = formatSelectedSources(selectedSources, selectedKnowledge);

    [['source', sourceFiles], ['knowledge', knowledgeFiles]].forEach(([group, files]) => {
      const selectAll = $(`[data-select-all="${group}"]`);
      if (!selectAll) return;
      const selected = files.filter((file) => file.selected).length;
      selectAll.checked = selected === files.length;
      selectAll.indeterminate = selected > 0 && selected < files.length;
    });
  }

  function bindSourceSelection() {
    $('.source-panel')?.addEventListener('change', (event) => {
      const checkbox = event.target;
      if (!(checkbox instanceof HTMLInputElement)) return;

      if (checkbox.matches('[data-file-group][data-file-index]')) {
        const files = checkbox.dataset.fileGroup === 'source' ? sourceFiles : knowledgeFiles;
        const file = files[Number(checkbox.dataset.fileIndex)];
        if (!file) return;
        file.selected = checkbox.checked;
        checkbox.closest('.file-row')?.classList.toggle('selected', checkbox.checked);
        updateSelectionSummary();
        return;
      }

      if (checkbox.matches('[data-select-all]')) {
        const group = checkbox.dataset.selectAll;
        const files = group === 'source' ? sourceFiles : knowledgeFiles;
        files.forEach((file) => { file.selected = checkbox.checked; });
        renderFileGroup(group, files);
        updateSelectionSummary();
      }
    });
  }

  function bindLocalFilePickers() {
    const createPicker = (group, files, trigger) => {
      if (!trigger) return;
      const picker = document.createElement('input');
      picker.type = 'file';
      picker.multiple = true;
      picker.accept = '.pdf,.doc,.docx';
      picker.hidden = true;
      picker.dataset.localPicker = group;
      document.body.appendChild(picker);

      trigger.addEventListener('click', () => picker.click());
      picker.addEventListener('change', () => {
        const result = appendDisplayFiles(files, [...picker.files]);
        renderFileGroup(group, files);
        updateSelectionSummary();
        if (result.added) {
          const rejectedHint = result.rejected ? `，另有 ${result.rejected} 个不支持的文件已忽略` : '';
          showToast(`已将 ${result.added} 个文件名添加到列表${rejectedHint}`);
        } else if (result.rejected) {
          showToast('请选择 PDF、DOC 或 DOCX 文件');
        } else {
          showToast('所选文件已在列表中');
        }
        picker.value = '';
      });
    };

    createPicker('source', sourceFiles, $('.source-scroll > .upload-box'));
    $('.knowledge-upload')?.addEventListener('click', () => showToast('无相关权限'));
  }

  function renderConversation() {
    const title = $('[data-conversation-title]');
    const summary = $('[data-conversation-summary]');
    const prompt = $('[data-conversation-prompt]');
    const response = $('[data-conversation-response]');
    if (title) title.textContent = planConversation.title;
    if (summary) summary.textContent = planConversation.summary;
    if (prompt) prompt.textContent = planConversation.prompt;
    if (response) response.textContent = planConversation.response;
    planConversation.suggestions.forEach((text, index) => {
      const item = $(`[data-conversation-suggestion="${index}"]`);
      if (item) item.textContent = text;
    });
    planConversation.followups.forEach((text, index) => {
      const item = $(`[data-conversation-followup="${index}"]`);
      if (item) item.textContent = text;
    });
  }

  function renderRecords() {
    const list = $('[data-record-list]');
    if (!list) return;
    const records = demoRecords.filter((record) => record.mode === activeWritingMode);
    list.innerHTML = records.map((record, index) => `
      <article class="record-item${index === 0 ? ' featured' : ''}${record.mode === 'official' ? ' official-record' : ''}">
        <img class="record-mode-icon" src="./assets/${record.mode === 'official' ? 'official-writing' : 'general-writing'}.svg" alt="" />
        <button class="record-open" type="button" data-record-id="${record.id}"><strong>${record.title}</strong><small>${record.createdAt}</small></button>
        <button class="record-more" type="button" aria-label="更多操作"><iconify-icon icon="tabler:dots-vertical" width="20" height="20"></iconify-icon></button>
      </article>
    `).join('');
  }

  function renderOutline(record, version) {
    const outline = $('[data-document-outline]');
    if (!outline) return;
    outline.innerHTML = extractOutline(version.markdown, record.id).map((item) => item.level === 2
      ? `<button type="button" data-outline-target="${item.id}"><iconify-icon icon="tabler:chevron-right" width="15" height="15"></iconify-icon><span>${item.label}</span></button>`
      : `<a href="#${item.id}" data-outline-target="${item.id}">${item.label}</a>`).join('');
  }

  function renderHistory(record, selectedVersionId) {
    const history = $('[data-history-list]');
    if (!history) return;
    history.innerHTML = record.versions.map((version, index) => `
      <article class="history-item${version.id === selectedVersionId ? ' selected' : ''}">
        <span class="version-dot"></span>
        <button type="button" data-version-id="${version.id}"><strong>${version.title}</strong><small>${version.createdAt}</small></button>
        <button class="history-more" type="button" aria-label="版本更多操作"><iconify-icon icon="tabler:dots-vertical" width="20" height="20"></iconify-icon></button>
      </article>`).join('');
  }

  function showDocumentVersion(record, version) {
    const title = $('#document-title');
    const content = $('[data-document-content]');
    activeRecord = record;
    activeVersion = version;
    if (title) title.textContent = `标题：${version.title}`;
    if (content) {
      content.innerHTML = renderMarkdown(version.markdown, record.id);
      content.scrollTop = 0;
    }
    renderOutline(record, version);
    renderHistory(record, version.id);
  }

  function setHistoryExpanded(expanded) {
    const shell = $('.modal-shell');
    const toggle = $('[data-history-toggle]');
    historyExpanded = Boolean(expanded);
    shell?.classList.toggle('history-expanded', historyExpanded);
    toggle?.classList.toggle('active', historyExpanded);
    toggle?.setAttribute('aria-expanded', String(historyExpanded));
  }

  function openDocument(recordId) {
    const record = demoRecords.find((item) => item.id === recordId);
    if (!record || !modal) return;
    setHistoryExpanded(false);
    showDocumentVersion(record, record.versions[0]);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeDocument() {
    if (!modal) return;
    modal.hidden = true;
    setHistoryExpanded(false);
    document.body.style.overflow = '';
  }

  renderFileGroup('source', sourceFiles);
  renderFileGroup('knowledge', knowledgeFiles);
  renderConversation();
  renderRecords();
  bindSourceSelection();
  bindLocalFilePickers();
  updateSelectionSummary();

  $('[data-record-list]')?.addEventListener('click', (event) => {
    const openButton = event.target.closest('.record-open');
    if (openButton) return openDocument(openButton.dataset.recordId);
    if (event.target.closest('.record-more')) showToast('该演示操作已响应');
  });

  $('[data-document-outline]')?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-outline-target]');
    if (!item) return;
    event.preventDefault();
    const content = $('[data-document-content]');
    const target = document.getElementById(item.dataset.outlineTarget);
    if (!content || !target) return;
    content.scrollTo({ top: Math.max(0, target.offsetTop - 18), behavior: 'smooth' });
  });

  $('[data-history-list]')?.addEventListener('click', (event) => {
    if (event.target.closest('.history-more')) {
      showToast('该演示操作已响应');
      return;
    }
    const versionButton = event.target.closest('[data-version-id]');
    if (!versionButton || !activeRecord) return;
    const version = activeRecord.versions.find((item) => item.id === versionButton.dataset.versionId);
    if (version) showDocumentVersion(activeRecord, version);
  });

  $('[data-history-toggle]')?.addEventListener('click', () => setHistoryExpanded(!historyExpanded));

  $('.close-modal')?.addEventListener('click', closeDocument);
  $('.back-to-write')?.addEventListener('click', () => setHistoryExpanded(false));
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeDocument();
  });

  $$('.tool-grid button:not(:disabled)').forEach((button) => button.addEventListener('click', () => {
    $$('.tool-grid button:not(:disabled)').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (button.dataset.mode) {
      activeWritingMode = button.dataset.mode;
      renderRecords();
    }
  }));

  const resultToggle = $('[data-result-toggle]');
  resultToggle?.addEventListener('click', () => {
    const workspace = $('.workspace');
    if (!workspace) return;
    resultCollapsed = !resultCollapsed;
    workspace.classList.toggle('result-collapsed', resultCollapsed);
    resultToggle.setAttribute('aria-label', resultCollapsed ? '展开结果栏' : '收起结果栏');
    resultToggle.setAttribute('aria-expanded', String(!resultCollapsed));
  });

  $$('.suggestions button').forEach((button) => button.addEventListener('click', () => {
    const text = button.querySelector('span')?.textContent?.trim();
    const field = $('.composer textarea');
    if (field && text) {
      field.value = text;
      field.focus();
    }
  }));

  $('.composer')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const field = $('.composer textarea');
    if (!field?.value.trim()) return showToast('请输入文案后再发送');
    showToast('演示模式：已收到您的写作需求');
    field.value = '';
  });

  $$('.copy-answer, .copy-all').forEach((button) => button.addEventListener('click', async () => {
    const content = button.closest('.chat-intro, .assistant-answer')?.innerText || $('[data-document-content]')?.innerText || '';
    try { await navigator.clipboard.writeText(content); showToast('内容已复制'); }
    catch { showToast('浏览器不允许自动复制，请手动复制'); }
  }));

  $$('.save-note, .action-feedback, .soft-button').forEach((button) => {
    button.addEventListener('click', () => showToast('该演示操作已响应'));
  });

  $('.download-document')?.addEventListener('click', () => {
    if (!activeRecord || !activeVersion) return showToast('请先打开一条生成记录');
    const content = $('[data-document-content]')?.innerText || activeVersion.markdown;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeTitle = activeVersion.title.replace(/[\\/:*?"<>|]/g, '_');
    anchor.href = url;
    anchor.download = `${safeTitle}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('已下载到本地');
  });

  $$('.editor-toolbar button').forEach((button) => button.addEventListener('click', () => {
    button.classList.toggle('active');
  }));

  const navButton = $('.mobile-nav-button');
  const sections = $('.mobile-sections');
  navButton?.addEventListener('click', () => {
    const open = sections?.hidden;
    if (!sections) return;
    sections.hidden = !open;
    navButton.setAttribute('aria-expanded', String(open));
  });
  $$('.mobile-sections button').forEach((button) => button.addEventListener('click', () => {
    document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (sections) sections.hidden = true;
    navButton?.setAttribute('aria-expanded', 'false');
  }));
}());
