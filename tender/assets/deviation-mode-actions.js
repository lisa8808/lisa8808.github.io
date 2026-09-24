(() => {
  if (!document.body.classList.contains('deviation-mode-page')) return;

  let updateQueued = false;
  const ANALYSIS_STEPS = [
    '读取招标文件',
    '识别技术与商务条款',
    '比对响应要求与投标方案',
    '标记偏离及风险项',
    '生成响应解读结果',
  ];
  const WRITING_STEPS = [
    '读取偏离与响应解读',
    '整理响应条款',
    '生成响应正文结构',
    '完善响应内容',
    '生成响应正文结果',
  ];
  const MAX_BID_UPLOAD_BYTES = 200 * 1024 * 1024;
  const SUPPORTED_BID_UPLOAD_EXTENSIONS = ['pdf', 'docx', 'doc'];
  const formatFileSize = (bytes) => {
    const megabytes = bytes / (1024 * 1024);
    if (megabytes < 1) return '<1 MB';
    return `${megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`;
  };
  const formatMinute = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  };

  const getConfig = () => window.__TENDER_DEVIATION_RESPONSE_CONFIG__ || {
    createStepRecordTitle: (step, fileName, generatedAt = new Date()) => {
      const prefix = step === 'analysis' ? '响应解读' : '响应正文';
      return `${prefix}_${String(fileName || '当前招标文件').replace(/\.[^.]+$/, '')}_${formatMinute(generatedAt)}`;
    },
  };

  const getCoreSourceRow = () => Array.from(document.querySelectorAll(
    '#app .upload-panel .upload-group:not(.reference-group) .file-row',
  )).find((row) => row.querySelector('.ellipsis')?.textContent.includes('某高校高性能计算GPU集群建设项目'));

  const showToast = (message) => {
    document.querySelector('[data-deviation-toast]')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.deviationToast = 'true';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.append(toast);
    window.clearTimeout(window.__deviationToastTimer);
    window.__deviationToastTimer = window.setTimeout(() => toast.remove(), 2400);
  };

  const createProcessingIcon = () => {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('processing-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="30 20"></circle>';
    return icon;
  };

  const createMoreButton = () => {
    const button = document.createElement('button');
    button.className = 'more-button';
    button.type = 'button';
    button.setAttribute('aria-label', '任务更多操作');
    const icon = document.createElement('img');
    icon.src = './assets/figma/more.svg';
    icon.alt = '';
    button.append(icon);
    return button;
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  const closeTaskMenus = (except = null) => {
    document.querySelectorAll('#result-panel .deviation-task-menu').forEach((menu) => {
      if (menu === except) return;
      menu.hidden = true;
      menu.closest('.processing-row')?.querySelector('.more-button')?.setAttribute('aria-expanded', 'false');
    });
  };

  const closeTaskDeleteConfirm = (backdrop) => {
    backdrop?.remove();
    document.documentElement.classList.remove('deviation-task-confirm-open');
    document.body.classList.remove('deviation-task-confirm-open');
  };

  const openTaskDeleteConfirm = (row) => {
    document.querySelector('[data-deviation-task-confirm]')?.remove();
    const title = row.querySelector('.processing-copy > strong')?.textContent.trim() || '当前任务';
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop deviation-task-confirm-backdrop';
    backdrop.dataset.deviationTaskConfirm = 'true';
    backdrop.innerHTML = `
      <section class="confirm-modal deviation-task-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="deviationTaskConfirmTitle">
        <h2 id="deviationTaskConfirmTitle">停止并删除</h2>
        <p>是否停止并删除正在处理的“${escapeHtml(title)}”？删除后无法恢复。</p>
        <footer>
          <button class="secondary-button" type="button" data-deviation-task-cancel>取消</button>
          <button class="danger-button" type="button" data-deviation-task-confirm-delete>停止并删除</button>
        </footer>
      </section>`;
    const close = () => closeTaskDeleteConfirm(backdrop);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });
    backdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    backdrop.querySelector('[data-deviation-task-cancel]').addEventListener('click', close);
    backdrop.querySelector('[data-deviation-task-confirm-delete]').addEventListener('click', () => {
      row.remove();
      close();
      showToast('任务已停止并删除');
    });
    closeTaskMenus();
    document.body.append(backdrop);
    document.documentElement.classList.add('deviation-task-confirm-open');
    document.body.classList.add('deviation-task-confirm-open');
    backdrop.querySelector('[data-deviation-task-cancel]').focus({ preventScroll: true });
  };

  const normalizeExistingRecordTitles = (panel) => {
    panel.querySelectorAll('.processing-row strong, .record-row strong').forEach((title) => {
      const text = title.textContent.trim();
      const normalized = (text.startsWith('标书要点解读_') || text.startsWith('标前解读_'))
        ? `响应解读_${text.slice(text.indexOf('_') + 1)}`
        : (text.startsWith('投标符合性自评_') || text.startsWith('投标自评_') || text.startsWith('标前评估_'))
          ? `响应正文_${text.slice(text.indexOf('_') + 1)}`
          : text;
      if (normalized !== text) {
        title.textContent = normalized;
        title.title = normalized;
      }
    });
  };

  const addProcessingRecord = (panel, step, sourceFile) => {
    const resultList = panel.querySelector('.processing-list, .result-list');
    if (!resultList) return;
    const titleText = getConfig().createStepRecordTitle(step, sourceFile);
    const steps = step === 'analysis' ? ANALYSIS_STEPS : WRITING_STEPS;
    const current = Math.min(3, steps.length);

    const row = document.createElement('article');
    row.className = `processing-row deviation-${step}-processing`;
    row.setAttribute('aria-live', 'polite');
    const copy = document.createElement('div');
    copy.className = 'processing-copy';
    const title = document.createElement('strong');
    title.textContent = titleText;
    title.title = titleText;
    const status = document.createElement('small');
    status.textContent = `正在处理中（${current}/${steps.length}）`;
    const progressTrigger = document.createElement('span');
    progressTrigger.className = 'progress-trigger';
    progressTrigger.tabIndex = 0;
    progressTrigger.setAttribute('aria-label', '查看处理进度');
    const progressPopover = document.createElement('span');
    progressPopover.className = 'progress-popover';
    progressPopover.setAttribute('role', 'tooltip');
    progressPopover.innerHTML = `<span class="progress-popover-title"><b>处理进度</b><strong>${current}/${steps.length}</strong></span>`;
    steps.forEach((stepName, index) => {
      const progressStep = document.createElement('span');
      const state = index < current - 1 ? 'done' : index === current - 1 ? 'active' : 'pending';
      progressStep.className = `progress-step ${state}`;
      progressStep.innerHTML = `<i>${state === 'done' ? '✓' : ''}</i>${stepName}`;
      progressPopover.append(progressStep);
    });
    progressTrigger.append(status, progressPopover);
    copy.append(title, progressTrigger);

    const moreButton = createMoreButton();
    moreButton.setAttribute('aria-expanded', 'false');
    moreButton.setAttribute('aria-haspopup', 'menu');
    const taskMenu = document.createElement('div');
    taskMenu.className = 'result-menu task-menu deviation-task-menu';
    taskMenu.hidden = true;
    taskMenu.setAttribute('role', 'menu');
    taskMenu.innerHTML = '<button type="button" role="menuitem" data-deviation-stop-task>停止并删除</button>';
    moreButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const shouldOpen = taskMenu.hidden;
      closeTaskMenus(taskMenu);
      taskMenu.hidden = !shouldOpen;
      moreButton.setAttribute('aria-expanded', String(shouldOpen));
    });
    taskMenu.querySelector('[data-deviation-stop-task]').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openTaskDeleteConfirm(row);
    });

    row.append(createProcessingIcon(), copy, moreButton, taskMenu);
    resultList.prepend(row);
  };

  const startStep = (step, panel) => {
    const sourceRow = getCoreSourceRow();
    if (!sourceRow || sourceRow.getAttribute('aria-pressed') !== 'true') {
      showToast('请先在“招标资料”中选择核心招标文件');
      return;
    }
    const sourceFile = sourceRow.querySelector('.ellipsis')?.textContent.trim() || '当前招标文件';
    addProcessingRecord(panel, step, sourceFile);
  };

  const openWritingModal = (panel, { quickMode = false } = {}) => {
    document.querySelector('[data-deviation-writing-modal]')?.remove();
    const sourceFile = getCoreSourceRow()?.querySelector('.ellipsis')?.textContent.trim()
      || '某高校高性能计算GPU集群建设项目.docx';
    const analysisFiles = Array.from(panel.querySelectorAll('.record-row strong'))
      .map((title) => title.textContent.trim())
      .filter((title) => title.startsWith('响应解读_'));
    const bidFiles = Array.from(panel.querySelectorAll('.record-row strong'))
      .map((title) => title.textContent.trim())
      .filter((title) => title.startsWith('技术正文_') || title.startsWith('商务正文_') || title.startsWith('商务标投标正文_'));
    const sourceStem = sourceFile.replace(/\.[^.]+$/, '');
    const technicalBidFiles = bidFiles.filter((file) => file.startsWith('技术正文_'));
    const businessBidFiles = bidFiles.filter((file) => file.startsWith('商务正文_') || file.startsWith('商务标投标正文_'));
    const availableTechnicalFiles = technicalBidFiles.length ? technicalBidFiles : [`技术正文_${sourceStem}`];
    const availableBusinessFiles = businessBidFiles.length ? businessBidFiles : [`商务正文_${sourceStem}`];
    const modalTitle = quickMode ? '一键撰写偏离响应' : '偏离/响应撰写';
    const analysisFieldMarkup = `
      <section class="deviation-writing-field">
        <label for="deviationAnalysisSelect"><b>*</b>响应解读</label>
        <select id="deviationAnalysisSelect" data-deviation-analysis>
          <option value="">请选择响应解读文件</option>
          ${analysisFiles.map((file) => `<option value="${file.replace(/"/g, '&quot;')}">${file}</option>`).join('')}
        </select>
        ${analysisFiles.length ? '' : '<p class="deviation-writing-empty">暂无已生成的响应解读文件，请先完成 01 偏离/响应解读。</p>'}
      </section>`;
    const createBidFileOptions = (files) => files
      .map((file) => `<option value="${file.replace(/"/g, '&quot;')}">${file}</option>`)
      .join('');

    const backdrop = document.createElement('div');
    backdrop.className = 'deviation-writing-backdrop';
    backdrop.dataset.deviationWritingModal = 'true';
    backdrop.innerHTML = `
      <section class="deviation-writing-modal" role="dialog" aria-modal="true" aria-labelledby="deviationWritingTitle">
        <header class="deviation-writing-header">
          <div class="deviation-writing-title">
            <img src="./assets/figma/tool-demand-new.svg" alt="">
            <h2 id="deviationWritingTitle">${modalTitle}</h2>
          </div>
          <button class="deviation-writing-close" type="button" aria-label="关闭偏离/响应撰写弹窗">×</button>
        </header>
        <div class="deviation-writing-body">
          <section class="deviation-writing-field">
            <label>招标文件</label>
            <div class="deviation-writing-file">
              <img src="./assets/figma/word.svg" alt="Word文件">
              <span>${sourceFile}</span>
            </div>
          </section>
          ${quickMode ? '' : analysisFieldMarkup}
          <section class="deviation-writing-field deviation-writing-source-field">
            <label><b>*</b>投标正文资料 <small>至少提供一份商务部分或技术部分</small></label>
            <div class="deviation-writing-source-tabs" role="tablist" aria-label="投标正文资料来源">
              <button class="active" type="button" role="tab" aria-selected="true" data-deviation-bid-mode="generated">选择已生成投标正文</button>
              <button type="button" role="tab" aria-selected="false" data-deviation-bid-mode="upload">自行上传</button>
            </div>
            <div class="deviation-writing-source-panel" data-deviation-source-panel="generated">
              <section class="deviation-writing-generated-group">
                <label class="deviation-writing-group-head" for="deviation-business-bid-file"><strong>商务部分</strong><small>选填</small></label>
                <select id="deviation-business-bid-file" data-deviation-bid-file data-bid-type="business">
                  <option value="">请选择已生成的商务部分投标正文</option>
                  ${createBidFileOptions(availableBusinessFiles)}
                </select>
              </section>
              <section class="deviation-writing-generated-group">
                <label class="deviation-writing-group-head" for="deviation-technical-bid-file"><strong>技术部分</strong><small>选填</small></label>
                <select id="deviation-technical-bid-file" data-deviation-bid-file data-bid-type="technical">
                  <option value="">请选择已生成的技术部分投标正文</option>
                  ${createBidFileOptions(availableTechnicalFiles)}
                </select>
              </section>
            </div>
            <div class="deviation-writing-source-panel" data-deviation-source-panel="upload" hidden>
              <div class="deviation-writing-upload-box">
                <input class="deviation-writing-upload-input" id="deviationBidDocumentUpload" type="file" accept=".pdf,.docx,.doc" data-deviation-upload="bid-document">
                <label class="deviation-writing-upload-card deviation-writing-upload-card-single" for="deviationBidDocumentUpload" data-deviation-upload-empty>
                  <span class="deviation-writing-upload-icon">＋</span>
                  <strong>上传投标正文</strong>
                  <span>点击选择文件</span>
                  <small>支持 PDF、DOCX、DOC，单个文件不超过200M，仅支持上传1个文件</small>
                </label>
                <article class="deviation-writing-upload-file" data-deviation-upload-file hidden>
                  <img src="./assets/figma/word.svg" alt="" data-deviation-upload-file-icon>
                  <span class="deviation-writing-upload-file-copy">
                    <strong data-deviation-upload-file-name></strong>
                    <small data-deviation-upload-file-meta></small>
                  </span>
                  <button class="deviation-writing-reupload" type="button" data-deviation-reupload>重新上传</button>
                </article>
              </div>
            </div>
          </section>
        </div>
        <footer class="deviation-writing-footer">
          <button class="deviation-writing-cancel" type="button">取消</button>
          <button class="deviation-writing-submit" type="button">立即撰写</button>
        </footer>
      </section>`;
    document.body.append(backdrop);

    const close = () => backdrop.remove();
    backdrop.querySelector('.deviation-writing-close').addEventListener('click', close);
    backdrop.querySelector('.deviation-writing-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });
    let activeBidMode = 'generated';
    const setBidSourceMode = (mode) => {
      activeBidMode = mode;
      backdrop.querySelectorAll('[data-deviation-bid-mode]').forEach((button) => {
        const active = button.dataset.deviationBidMode === mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });
      backdrop.querySelectorAll('[data-deviation-source-panel]').forEach((sourcePanel) => {
        sourcePanel.hidden = sourcePanel.dataset.deviationSourcePanel !== mode;
      });
    };
    backdrop.querySelectorAll('[data-deviation-bid-mode]').forEach((button) => {
      button.addEventListener('click', () => setBidSourceMode(button.dataset.deviationBidMode));
    });
    let uploadedBidFile = null;
    backdrop.querySelectorAll('[data-deviation-upload]').forEach((input) => {
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!SUPPORTED_BID_UPLOAD_EXTENSIONS.includes(extension)) {
          input.value = '';
          showToast('投标正文仅支持 PDF、DOCX、DOC 格式');
          return;
        }
        if (file.size > MAX_BID_UPLOAD_BYTES) {
          input.value = '';
          showToast('投标正文大小不能超过 200M');
          return;
        }
        uploadedBidFile = file;
        const emptyState = backdrop.querySelector('[data-deviation-upload-empty]');
        const fileState = backdrop.querySelector('[data-deviation-upload-file]');
        emptyState.hidden = true;
        fileState.hidden = false;
        fileState.querySelector('[data-deviation-upload-file-name]').textContent = file.name;
        fileState.querySelector('[data-deviation-upload-file-meta]').textContent = `${extension.toUpperCase()} · ${formatFileSize(file.size)}`;
        fileState.querySelector('[data-deviation-upload-file-icon]').src = extension === 'pdf'
          ? './assets/figma/pdf-file.svg'
          : './assets/figma/word.svg';
      });
    });
    backdrop.querySelector('[data-deviation-reupload]').addEventListener('click', () => {
      const input = backdrop.querySelector('[data-deviation-upload]');
      input.value = '';
      input.click();
    });
    backdrop.querySelector('.deviation-writing-submit').addEventListener('click', () => {
      const analysis = backdrop.querySelector('[data-deviation-analysis]')?.value || '';
      const selectedBidFiles = Array.from(backdrop.querySelectorAll('[data-deviation-bid-file]'))
        .filter((select) => select.value);
      const uploadedFiles = uploadedBidFile ? 1 : 0;
      const hasBidSource = activeBidMode === 'upload' ? uploadedFiles > 0 : selectedBidFiles.length > 0;
      const analysisValid = quickMode || Boolean(analysis);
      if (!analysisValid || !hasBidSource) {
        const sourceMessage = activeBidMode === 'upload'
          ? '请上传一份投标正文'
          : '请至少选择一份商务部分或技术部分投标正文';
        showToast(analysisValid ? sourceMessage : `请选择响应解读文件，并${sourceMessage}`);
        return;
      }
      const source = getCoreSourceRow()?.querySelector('.ellipsis')?.textContent.trim() || sourceFile;
      addProcessingRecord(panel, 'writing', source);
      close();
    });
    backdrop.querySelector('.deviation-writing-close').focus();
  };

  const setModeLabel = (button, markup) => {
    const text = button?.querySelector('span');
    if (!text || text.innerHTML === markup) return;
    text.innerHTML = markup;
  };

  const setQuickLabel = (button) => {
    if (!button) return;
    const textNode = Array.from(button.childNodes)
      .find((node) => node.nodeType === 3 && node.textContent.trim());
    if (textNode && textNode.textContent !== '一键撰写偏离/响应') {
      textNode.textContent = '一键撰写偏离/响应';
    }
  };

  const enhanceActions = () => {
    const preciseButtons = Array.from(
      document.querySelectorAll('#result-panel .result-mode .tool-grid > button'),
    );
    const quickButton = document.querySelector('#result-panel .quick-action');
    if (preciseButtons.length < 2 || !quickButton) return false;

    setModeLabel(preciseButtons[0], '<b>01</b> 偏离/响应解读');
    setModeLabel(preciseButtons[1], '<b>02</b> 偏离/响应撰写');
    preciseButtons.slice(2).forEach((button) => button.remove());
    setQuickLabel(quickButton);
    normalizeExistingRecordTitles(document.querySelector('#result-panel'));
    bindAction(preciseButtons[0], 'analysis', 'deviationAnalysisActionBound');
    bindAction(preciseButtons[1], 'writing', 'deviationWritingActionBound');
    bindAction(quickButton, 'writing', 'deviationQuickActionBound', true);
    return true;
  };

  const bindAction = (button, step, marker, quickMode = false) => {
    if (!button || button.dataset[marker] === 'true') return;
    button.dataset[marker] = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const panel = document.querySelector('#result-panel');
      if (panel) {
        if (step === 'writing') {
          if (quickMode) openWritingModal(panel, { quickMode: true });
          else openWritingModal(panel);
        }
        else startStep(step, panel);
      }
    }, true);
  };

  const scheduleUpdate = () => {
    if (updateQueued) return;
    updateQueued = true;
    window.requestAnimationFrame(() => {
      updateQueued = false;
      enhanceActions();
    });
  };

  document.addEventListener('click', (event) => {
    if (!event.target.closest?.('.deviation-task-menu, .deviation-analysis-processing .more-button, .deviation-writing-processing .more-button')) {
      closeTaskMenus();
    }
  });

  scheduleUpdate();
  new MutationObserver(scheduleUpdate).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
