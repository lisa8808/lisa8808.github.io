(() => {
  if (document.body?.classList?.contains('deviation-mode-page')) return;

  const CORE_FILE_HINT = '某高校高性能计算GPU集群建设项目';
  const CORE_PROJECT_HINT = '某高校';
  const MISSING_FILE_MESSAGE = '请检查是否在“招标资料”中已上传或勾选核心招标文件';
  const PROCESSING_CURRENT = 2;
  const PROCESSING_TOTAL = 8;
  const INTERPRETATION_STEPS = [
    '解析招标文件',
    '识别项目基础信息',
    '提取时间与递交约束',
    '提取投标人资格要求',
    '提取★号及不允许偏离项',
    '提取明确废标约束',
    '提取项目与评分信息',
    '生成标书要点解读结果',
  ];
  const ASSESSMENT_STEPS = [
    '读取招标文件',
    '加载企业主体资料',
    '核对时间与递交约束',
    '核对投标人资格要求',
    '核对★号及不允许偏离项',
    '核对明确废标约束',
    '汇总评估状态',
    '生成投标符合性自评结果',
  ];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
  const formatMinute = (date = new Date()) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  };
  const buildResultTitle = (label, sourceFile) => {
    const fileName = String(sourceFile || '核心招标文件').trim().replace(/\.[^.]+$/, '');
    return `${label}_${fileName}_${formatMinute()}`;
  };

  const getCoreSourceRow = () => Array.from(document.querySelectorAll(
    '#app .upload-panel .upload-group:not(.reference-group) .file-row',
  )).find((row) => {
    const fileName = row.querySelector('.ellipsis')?.textContent.trim() || '';
    return fileName.includes(CORE_FILE_HINT) && fileName.includes(CORE_PROJECT_HINT);
  });

  const showToast = (message) => {
    document.querySelector('[data-interpretation-precheck-toast]')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.interpretationPrecheckToast = 'true';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.append(toast);
    window.clearTimeout(window.__interpretationPrecheckToastTimer);
    window.__interpretationPrecheckToastTimer = window.setTimeout(() => toast.remove(), 2400);
  };

  const createProcessingIcon = () => {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'processing-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="30 20"></circle>';
    return icon;
  };

  const createProgressTrigger = (steps, current = PROCESSING_CURRENT) => {
    const trigger = document.createElement('span');
    trigger.className = 'progress-trigger';
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-label', `查看处理进度，当前第 ${current} 步，共 ${PROCESSING_TOTAL} 步`);

    const status = document.createElement('small');
    status.textContent = `正在处理（${current}/${PROCESSING_TOTAL}）`;

    const popover = document.createElement('span');
    popover.className = 'progress-popover';
    popover.setAttribute('role', 'tooltip');
    const heading = document.createElement('span');
    heading.className = 'progress-popover-title';
    const headingText = document.createElement('b');
    headingText.textContent = '处理进度';
    const headingCount = document.createElement('strong');
    headingCount.textContent = `${current}/${PROCESSING_TOTAL}`;
    heading.append(headingText, headingCount);
    popover.append(heading);

    steps.forEach((label, index) => {
      const stepNumber = index + 1;
      const step = document.createElement('span');
      step.className = `progress-step ${stepNumber < current ? 'done' : stepNumber === current ? 'current' : 'pending'}`;
      const marker = document.createElement('i');
      marker.textContent = stepNumber < current ? '✓' : '';
      const copy = document.createElement('span');
      copy.textContent = label;
      step.append(marker, copy);
      popover.append(step);
    });

    trigger.append(status, popover);
    return trigger;
  };

  const addProcessingRecord = (panel, { titleText, className, steps }) => {
    const resultList = panel.querySelector('.processing-list, .result-list')
      || panel.querySelector('.result-list');
    if (!resultList) return;

    const row = document.createElement('div');
    row.className = `processing-row ${className}`;
    row.dataset.prebidProgressEnhanced = 'true';
    row.setAttribute('aria-live', 'polite');

    const copy = document.createElement('span');
    copy.className = 'processing-copy';
    const title = document.createElement('strong');
    title.textContent = titleText;
    title.title = titleText;
    copy.append(title, createProgressTrigger(steps));

    const moreButton = document.createElement('button');
    moreButton.className = 'more-button';
    moreButton.type = 'button';
    moreButton.setAttribute('aria-label', '任务更多操作');
    const moreIcon = document.createElement('img');
    moreIcon.src = './assets/figma/more.svg';
    moreIcon.alt = '';
    moreButton.append(moreIcon);

    row.append(createProcessingIcon(), copy, moreButton);
    resultList.prepend(row);
  };

  const enhanceExistingProcessingRows = (panel) => {
    if (typeof panel.querySelectorAll !== 'function') return;
    Array.from(panel.querySelectorAll('.processing-row')).forEach((row) => {
      if (row.dataset.prebidProgressEnhanced === 'true') return;
      const title = row.querySelector('strong');
      const titleText = title?.textContent.trim() || '';
      const steps = (titleText.startsWith('标书要点解读_') || titleText.startsWith('标前解读_'))
        ? INTERPRETATION_STEPS
        : (titleText.startsWith('投标符合性自评_') || titleText.startsWith('投标自评_') || titleText.startsWith('标前评估_'))
          ? ASSESSMENT_STEPS
          : null;
      if (!steps) return;
      const copy = row.querySelector('.processing-copy');
      if (!copy || typeof copy.replaceChildren !== 'function') return;
      copy.replaceChildren(title, createProgressTrigger(steps));
      row.dataset.prebidProgressEnhanced = 'true';
    });
  };

  const watchProcessingRows = (panel) => {
    const resultList = panel.querySelector('.processing-list, .result-list')
      || panel.querySelector('.result-list');
    if (!resultList || resultList.dataset.prebidProgressWatching === 'true') return;
    resultList.dataset.prebidProgressWatching = 'true';
    const observer = new MutationObserver(() => enhanceExistingProcessingRows(panel));
    observer.observe(resultList, { childList: true, subtree: true, characterData: true });
  };

  const addInterpretationRecord = (panel, sourceRow) => {
    const rawFileName = sourceRow.querySelector('.ellipsis')?.textContent.trim() || '核心招标文件';
    const titleText = buildResultTitle('标书要点解读', rawFileName);
    addProcessingRecord(panel, {
      titleText,
      className: 'interpretation-processing',
      steps: INTERPRETATION_STEPS,
    });
  };

  const showAssessmentToast = (message) => {
    document.querySelector('[data-assessment-toast]')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.assessmentToast = 'true';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.append(toast);
    window.clearTimeout(window.__assessmentToastTimer);
    window.__assessmentToastTimer = window.setTimeout(() => toast.remove(), 2400);
  };

  const openAssessmentModal = (panel, options = {}) => {
    const skipInterpretation = options.skipInterpretation === true;
    const modalTitle = options.modalTitle || '投标符合性自评';
    const selectedCompany = options.selectedCompany || '';
    const submitLabel = options.submitLabel || '立即评估';
    const successMessage = options.successMessage
      || (modalTitle === '重新评估' ? '重新评估已开始生成' : '投标符合性自评已开始生成');
    const companies = [
      '四川华鲲振宇智能科技有限责任公司',
      '北京华鲲振宇智能科技有限责任公司',
    ];
    if (selectedCompany && !companies.includes(selectedCompany)) companies.unshift(selectedCompany);
    document.querySelector('[data-prebid-assessment-modal]')?.remove();
    const sourceRow = getCoreSourceRow();
    const sourceFile = sourceRow?.querySelector('.ellipsis')?.textContent.trim()
      || '某高校高性能计算GPU集群建设项目.docx';
    const files = Array.from(panel.querySelectorAll('.record-row strong'))
      .map((title) => title.textContent.trim())
      .filter((title) => title.startsWith('标书要点解读_') || title.startsWith('标前解读_'));
    const backdrop = document.createElement('div');
    backdrop.className = `prebid-assessment-backdrop${modalTitle === '重新评估' ? ' prebid-assessment-reassess-mode' : ''}`;
    backdrop.dataset.prebidAssessmentModal = 'true';
    backdrop.innerHTML = `
      <section class="prebid-assessment-modal" role="dialog" aria-modal="true" aria-labelledby="prebidAssessmentTitle">
        <header class="prebid-assessment-header">
          <h2 id="prebidAssessmentTitle">${escapeHtml(modalTitle)}</h2>
          <button class="prebid-assessment-close" type="button" aria-label="关闭${escapeHtml(modalTitle)}">×</button>
        </header>
        <div class="prebid-assessment-body">
          <p class="prebid-assessment-file-line"><strong>招标文件：</strong><span>${sourceFile}</span></p>
          ${skipInterpretation ? '' : `<section class="prebid-assessment-interpretation">
            <h3>标书要点解读</h3>
            <p>投标符合性自评需依赖标书要点解读生成，请选择项目中已生成的标书要点解读文件。</p>
            <label for="prebidInterpretationSelect"><b>*</b>选择已生成标书要点解读文件</label>
            <select id="prebidInterpretationSelect" data-assessment-interpretation>
              <option value="">请选择标书要点解读文件</option>
              ${files.map((file) => `<option value="${file.replace(/"/g, '&quot;')}">${file}</option>`).join('')}
            </select>
          </section>`}
          <label class="prebid-assessment-company" for="prebidCompanySelect"><b>*</b>选择评估企业主体</label>
          <select id="prebidCompanySelect" data-assessment-company>
            <option value="">请选择企业</option>
            ${companies.map((company) => `<option value="${escapeHtml(company)}" ${company === selectedCompany ? 'selected' : ''}>${escapeHtml(company)}</option>`).join('')}
          </select>
        </div>
        <footer class="prebid-assessment-footer">
          <button class="prebid-assessment-cancel" type="button">取消</button>
          <button class="prebid-assessment-submit" type="button">${escapeHtml(submitLabel)}</button>
        </footer>
      </section>`;
    document.body.append(backdrop);
    const close = () => backdrop.remove();
    backdrop.querySelector('.prebid-assessment-close').addEventListener('click', close);
    backdrop.querySelector('.prebid-assessment-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });
    backdrop.querySelector('.prebid-assessment-submit').addEventListener('click', () => {
      const interpretation = backdrop.querySelector('[data-assessment-interpretation]')?.value || '';
      const company = backdrop.querySelector('[data-assessment-company]').value;
      if (!company || (!skipInterpretation && !interpretation)) {
        showAssessmentToast(skipInterpretation ? '请选择评估企业主体' : '请选择标书要点解读文件和评估企业主体');
        return;
      }
      addProcessingRecord(panel, {
        titleText: buildResultTitle('投标符合性自评', sourceFile),
        className: 'assessment-processing',
        steps: ASSESSMENT_STEPS,
      });
      if (typeof options.onSubmit === 'function') options.onSubmit(company);
      close();
      showAssessmentToast(successMessage);
    });
  };

  if (typeof document.addEventListener === 'function') {
    document.addEventListener('open-prebid-assessment', (event) => {
      const panel = document.querySelector('#result-panel');
      if (!panel) return;
      openAssessmentModal(panel, {
        skipInterpretation: event.detail?.skipInterpretation === true,
        modalTitle: event.detail?.modalTitle,
        selectedCompany: event.detail?.selectedCompany,
        submitLabel: event.detail?.submitLabel,
        successMessage: event.detail?.successMessage,
        onSubmit: event.detail?.onSubmit,
      });
    });
  }

  // 对话区快捷指令与结果区之间的桥接：对话脚本只负责中间对话区，
  // 需要读取招标资料勾选状态、生成记录时统一走这里，避免直接操作结果区 DOM。
  const getProjectTenderFileName = () => {
    const sourceRow = getCoreSourceRow();
    return sourceRow?.querySelector('.ellipsis')?.textContent.trim()
      || '某高校高性能计算GPU集群建设项目.docx';
  };

  const listInterpretationFiles = () => {
    const panel = document.querySelector('#result-panel');
    if (!panel) return [];
    return Array.from(panel.querySelectorAll('.record-row strong'))
      .map((title) => title.textContent.trim())
      .filter((title) => title.startsWith('标书要点解读_') || title.startsWith('标前解读_'));
  };

  window.__prebidConversationBridge = {
    coreTenderAvailable() {
      const sourceRow = getCoreSourceRow();
      return Boolean(sourceRow && sourceRow.getAttribute('aria-pressed') === 'true');
    },
    projectTenderFileName: getProjectTenderFileName,
    interpretationFiles: listInterpretationFiles,
    createInterpretationTask() {
      const panel = document.querySelector('#result-panel');
      const sourceRow = getCoreSourceRow();
      if (!panel || !sourceRow) return false;
      addInterpretationRecord(panel, sourceRow);
      return true;
    },
    createAssessmentTask() {
      const panel = document.querySelector('#result-panel');
      if (!panel) return false;
      addProcessingRecord(panel, {
        titleText: buildResultTitle('投标符合性自评', getProjectTenderFileName()),
        className: 'assessment-processing',
        steps: ASSESSMENT_STEPS,
      });
      return true;
    },
  };

  const bindInterpretationAction = () => {
    const panel = document.querySelector('#result-panel');
    if (!panel) return false;
    const buttons = typeof panel.querySelectorAll === 'function'
      ? Array.from(panel.querySelectorAll('.result-mode .tool-grid > button'))
      : [];
    const button = buttons[0] || panel.querySelector('.result-mode .tool-grid > button');
    const assessmentButton = buttons[1];
    const quickButton = panel.querySelector('.quick-action');
    if (!button) return false;
    enhanceExistingProcessingRows(panel);
    watchProcessingRows(panel);

    if (button.dataset.interpretationActionBound !== 'true') {
      button.dataset.interpretationActionBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const sourceRow = getCoreSourceRow();
        if (!sourceRow || sourceRow.getAttribute('aria-pressed') !== 'true') {
          showToast(MISSING_FILE_MESSAGE);
          return;
        }
        addInterpretationRecord(panel, sourceRow);
      }, true);
    }
    if (assessmentButton && assessmentButton.dataset.assessmentActionBound !== 'true') {
      assessmentButton.dataset.assessmentActionBound = 'true';
      assessmentButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openAssessmentModal(panel, {
          modalTitle: '投标符合性自评',
          successMessage: '投标符合性自评已开始生成',
        });
      }, true);
    }
    if (quickButton && quickButton.dataset.quickAssessmentActionBound !== 'true') {
      quickButton.dataset.quickAssessmentActionBound = 'true';
      quickButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openAssessmentModal(panel, {
          skipInterpretation: true,
          modalTitle: '一键投标自评',
          successMessage: '一键投标自评已开始生成',
        });
      }, true);
    }
    return Boolean(quickButton);
  };

  if (!bindInterpretationAction()) {
    const observer = new MutationObserver(() => {
      if (bindInterpretationAction()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
