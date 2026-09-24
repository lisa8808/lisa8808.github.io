(() => {
  const app = document.getElementById('app');
  const config = window.__TENDER_BUSINESS_MODE_CONFIG__;

  if (!app || !config) return;

  let initialTabSynced = false;
  let initialPreciseModeSynced = false;
  let updateQueued = false;

  const getProjectName = () => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return hashParams.get('project')
      || new URLSearchParams(window.location.search).get('project')
      || config.projectName;
  };

  const syncBusinessProjectName = () => {
    const project = document.querySelector('.brand-project');
    const projectName = getProjectName();
    if (project && project.textContent.trim() !== projectName) {
      project.textContent = projectName;
    }
  };

  const getSourceFileName = () => {
    const sourceRow = document.querySelector(
      '#app .upload-panel .upload-group .file-row[aria-pressed="true"], #app .upload-panel .upload-group .file-row',
    );
    return sourceRow?.querySelector('.ellipsis')?.textContent?.trim()
      || sourceRow?.textContent?.trim()
      || '当前招标文件';
  };

  const getTenderCompanies = () => {
    const select = document.querySelector('#app .upload-panel .company-group select');
    if (!select) return [];
    return Array.from(select.options)
      .filter((option) => !option.disabled && (option.value || option.textContent.trim()))
      .map((option) => ({ id: option.value || option.textContent.trim(), name: option.textContent.trim() }));
  };

  const getSelectedTenderCompany = () => document
    .querySelector('#app .upload-panel .company-group select')?.value?.trim() || '';

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const companyOptions = (selectedId) => getTenderCompanies()
    .map(({ id, name }) => `<option value="${escapeHtml(id)}"${id === selectedId ? ' selected' : ''}>${escapeHtml(name)}</option>`)
    .join('');

  const createProcessingIcon = () => {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'processing-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="30 20"></circle>';
    return icon;
  };

  const createProcessingProgress = (statusText) => {
    const steps = ['解析招标文件', '识别商务要求', '匹配企业资料', '生成商务内容', '生成结果文件'];
    const status = document.createElement('small');
    status.textContent = `${statusText}（1/${steps.length}）`;

    const popover = document.createElement('span');
    popover.className = 'progress-popover';
    const heading = document.createElement('span');
    heading.className = 'progress-popover-title';
    const headingLabel = document.createElement('b');
    headingLabel.textContent = '处理进度';
    const headingCount = document.createElement('strong');
    headingCount.textContent = `1/${steps.length}`;
    heading.append(headingLabel, headingCount);
    popover.append(heading);

    steps.forEach((step, index) => {
      const row = document.createElement('span');
      row.className = `progress-step${index === 0 ? ' active' : ''}`;
      const marker = document.createElement('i');
      marker.textContent = index === 0 ? '·' : '';
      row.append(marker, document.createTextNode(step));
      popover.append(row);
    });

    return { status, popover };
  };

  const addOutlineProcessingRecord = (panel) => {
    const titleText = config.createOutlineTaskTitle(getSourceFileName());
    const hasExistingTask = Array.from(panel.querySelectorAll('[data-business-outline-task]'))
      .some((row) => row.dataset.businessOutlineTask === titleText);
    if (hasExistingTask) return;

    const resultList = panel.querySelector('.result-list') || (() => {
      const list = document.createElement('div');
      list.className = 'result-list';
      panel.querySelector('.record-heading')?.after(list);
      return list;
    })();
    panel.querySelector('.result-empty')?.remove();

    const row = document.createElement('div');
    row.className = 'processing-row business-outline-processing';
    row.dataset.businessOutlineTask = titleText;
    row.setAttribute('aria-live', 'polite');
    row.append(createProcessingIcon());

    const copy = document.createElement('span');
    copy.className = 'processing-copy';
    const title = document.createElement('strong');
    title.textContent = titleText;
    title.title = titleText;
    const { status, popover } = createProcessingProgress(config.outlineTaskStatus);
    copy.append(title, status, popover);
    row.append(copy);

    const moreButton = document.createElement('button');
    moreButton.className = 'more-button';
    moreButton.type = 'button';
    moreButton.setAttribute('aria-label', '任务更多操作');
    const moreIcon = document.createElement('img');
    moreIcon.src = './assets/figma/more.svg';
    moreIcon.alt = '';
    moreButton.append(moreIcon);
    row.append(moreButton);
    resultList.prepend(row);
  };

  const getGeneratedOutlineRecords = (panel) => {
    const seen = new Set();
    return Array.from(panel.querySelectorAll('.record-row'))
      .map((row) => {
        const rawTitle = row.querySelector('.record-copy strong, .record-main strong')?.textContent?.trim() || '';
        return { row, title: config.normalizeRecordText(rawTitle) };
      })
      .filter(({ row, title }) => {
        if (row.classList.contains('record-row') && !row.classList.contains('processing-row') && (title.startsWith('商务大纲_') || title.startsWith('商务标投标大纲_')) && !seen.has(title)) {
          seen.add(title);
          return true;
        }
        return false;
      });
  };

  const addBodyProcessingRecord = (panel) => {
    const titleText = config.createBodyTaskTitle(getSourceFileName());

    const resultList = panel.querySelector('.result-list') || (() => {
      const list = document.createElement('div');
      list.className = 'result-list';
      panel.querySelector('.record-heading')?.after(list);
      return list;
    })();
    panel.querySelector('.result-empty')?.remove();

    const row = document.createElement('div');
    row.className = 'processing-row business-body-processing';
    row.dataset.businessBodyTask = titleText;
    row.setAttribute('aria-live', 'polite');
    row.append(createProcessingIcon());

    const copy = document.createElement('span');
    copy.className = 'processing-copy';
    const title = document.createElement('strong');
    title.textContent = titleText;
    title.title = titleText;
    const { status, popover } = createProcessingProgress(config.bodyTaskStatus);
    copy.append(title, status, popover);
    row.append(copy);

    const moreButton = document.createElement('button');
    moreButton.className = 'more-button';
    moreButton.type = 'button';
    moreButton.setAttribute('aria-label', '任务更多操作');
    const moreIcon = document.createElement('img');
    moreIcon.src = './assets/figma/more.svg';
    moreIcon.alt = '';
    moreButton.append(moreIcon);
    row.append(moreButton);
    resultList.prepend(row);
  };

  window.addEventListener('business:generate-full-from-outline', () => {
    const panel = document.querySelector('#result-panel');
    if (panel) addBodyProcessingRecord(panel);
  });

  const closeOutlineConfigModal = (modal) => {
    if (!modal) return;
    modal.remove();
    document.documentElement.classList.remove('business-outline-config-open');
    document.body.classList.remove('business-outline-config-open');
    modal.__previousFocus?.focus?.({ preventScroll: true });
  };

  const confirmOutlineGeneration = (panel, modal) => {
    const requirements = modal.querySelector('[data-outline-config-requirements]')?.value.trim() || '';
    modal.dataset.outlineRequirements = requirements;
    closeOutlineConfigModal(modal);
    addOutlineProcessingRecord(panel);
  };

  const openOutlineConfigModal = (panel, trigger) => {
    const existing = document.querySelector('[data-business-outline-config]');
    if (existing) {
      existing.querySelector('[data-outline-config-confirm]')?.focus({ preventScroll: true });
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'business-outline-config-modal';
    modal.dataset.businessOutlineConfig = 'true';
    modal.innerHTML = `
      <section class="business-outline-config-dialog" role="dialog" aria-modal="true" aria-labelledby="business-outline-config-title">
        <header class="business-outline-config-header">
          <h2 id="business-outline-config-title">生成大纲</h2>
          <button class="business-outline-config-close" type="button" data-outline-config-close aria-label="关闭生成大纲">×</button>
        </header>
        <div class="business-outline-config-content">
          <div class="business-outline-config-source">
            <strong>招标文件：</strong>
            <span data-outline-config-source title=""></span>
          </div>
          <label class="business-outline-config-field" for="business-outline-config-requirements">
            <span>其他生成要求</span>
            <textarea id="business-outline-config-requirements" data-outline-config-requirements placeholder=""></textarea>
          </label>
          <p class="business-outline-config-hint">提示：将引用左侧勾选的参考文件生成结果</p>
        </div>
        <footer class="business-outline-config-footer">
          <button class="business-outline-config-cancel" type="button" data-outline-config-cancel>取消</button>
          <button class="business-outline-config-confirm" type="button" data-outline-config-confirm>生成大纲</button>
        </footer>
      </section>`;

    const sourceFile = getSourceFileName();
    const source = modal.querySelector('[data-outline-config-source]');
    source.textContent = sourceFile;
    source.title = sourceFile;
    modal.__previousFocus = trigger || document.activeElement;

    const close = () => closeOutlineConfigModal(modal);
    modal.querySelector('[data-outline-config-close]')?.addEventListener('click', close);
    modal.querySelector('[data-outline-config-cancel]')?.addEventListener('click', close);
    modal.querySelector('[data-outline-config-confirm]')?.addEventListener('click', () => {
      confirmOutlineGeneration(panel, modal);
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });

    document.body.append(modal);
    document.documentElement.classList.add('business-outline-config-open');
    document.body.classList.add('business-outline-config-open');
    modal.querySelector('[data-outline-config-confirm]')?.focus({ preventScroll: true });
  };

  const closeBodyConfigModal = (modal) => {
    if (!modal) return;
    modal.remove();
    document.documentElement.classList.remove('business-body-config-open');
    document.body.classList.remove('business-body-config-open');
    modal.__previousFocus?.focus?.({ preventScroll: true });
  };

  const submitBodyGeneration = (panel, modal) => {
    const selectedOutline = modal.querySelector('[data-body-config-outline]')?.value.trim() || '';
    const selectedCompany = modal.querySelector('[data-body-config-company]')?.value.trim() || '';
    const hint = modal.querySelector('[data-body-config-hint]');
    if (!selectedOutline || !selectedCompany) {
      if (hint) {
        hint.textContent = !selectedOutline
          ? '请选择一个已生成的大纲文件后继续'
          : '请选择投标企业后继续';
        hint.dataset.state = 'error';
      }
      modal.querySelector(selectedOutline ? '[data-body-config-company]' : '[data-body-config-outline]')
        ?.focus({ preventScroll: true });
      return;
    }

    modal.dataset.selectedOutline = selectedOutline;
    modal.dataset.selectedCompany = selectedCompany;
    closeBodyConfigModal(modal);
    addBodyProcessingRecord(panel);
  };

  const openBodyConfigModal = (panel, trigger) => {
    const existing = document.querySelector('[data-business-body-config]');
    if (existing) {
      existing.querySelector('[data-body-config-outline]')?.focus({ preventScroll: true });
      return;
    }

    const outlineRecords = getGeneratedOutlineRecords(panel);
    const modal = document.createElement('div');
    modal.className = 'business-body-config-modal';
    modal.dataset.businessBodyConfig = 'true';
    modal.innerHTML = `
      <section class="business-body-config-dialog" role="dialog" aria-modal="true" aria-labelledby="business-body-config-title">
        <header class="business-body-config-header">
          <h2 id="business-body-config-title">生成正文</h2>
          <button class="business-body-config-close" type="button" data-body-config-close aria-label="关闭生成正文">×</button>
        </header>
        <div class="business-body-config-content">
          <div class="business-body-config-source">
            <strong>招标文件：</strong>
            <span data-body-config-source title=""></span>
          </div>
          <section class="business-body-config-card" aria-labelledby="business-body-config-outline-title">
            <h3 id="business-body-config-outline-title">商务标大纲</h3>
            <p>正文需依赖大纲生成，请选择项目中已生成的大纲文件。</p>
            <label class="business-body-config-field" for="business-body-config-outline">
              <span><b aria-hidden="true">*</b>选择已生成大纲</span>
              <select id="business-body-config-outline" data-body-config-outline required ${outlineRecords.length ? '' : 'disabled'}>
                <option value="">请选择大纲文件</option>
                ${outlineRecords.map(({ title }) => `<option value="${title.replaceAll('"', '&quot;')}">${title}</option>`).join('')}
              </select>
            </label>
            <p class="business-body-config-hint" data-body-config-hint>${outlineRecords.length ? '请选择一个已生成的大纲文件后继续' : '暂未找到已生成的商务标大纲，请先完成大纲生成'}</p>
          </section>
          <section class="business-body-config-company-field">
            <label class="business-body-config-field" for="business-body-config-company">
              <span><b aria-hidden="true">*</b>选择投标企业</span>
              <select id="business-body-config-company" data-body-config-company required ${getTenderCompanies().length ? '' : 'disabled'}>
                <option value="">请选择投标企业</option>
                ${companyOptions(getSelectedTenderCompany())}
              </select>
            </label>
          </section>
        </div>
        <footer class="business-body-config-footer">
          <button class="business-body-config-cancel" type="button" data-body-config-cancel>取消</button>
          <button class="business-body-config-confirm" type="button" data-body-config-submit disabled>生成正文</button>
        </footer>
      </section>`;

    const sourceFile = getSourceFileName();
    const source = modal.querySelector('[data-body-config-source]');
    source.textContent = sourceFile;
    source.title = sourceFile;
    modal.__previousFocus = trigger || document.activeElement;

    const outlineSelect = modal.querySelector('[data-body-config-outline]');
    const companySelect = modal.querySelector('[data-body-config-company]');
    const submit = modal.querySelector('[data-body-config-submit]');
    const hint = modal.querySelector('[data-body-config-hint]');
    const syncSubmitState = () => {
      const selected = Boolean(outlineSelect?.value.trim() && companySelect?.value.trim());
      if (submit) submit.disabled = !selected;
      if (hint) {
        hint.hidden = selected;
        if (!selected) {
          hint.textContent = outlineRecords.length
            ? '请选择一个已生成的大纲文件后继续'
            : '暂未找到已生成的商务标大纲，请先完成大纲生成';
          delete hint.dataset.state;
        }
      }
    };
    outlineSelect?.addEventListener('change', syncSubmitState);
    companySelect?.addEventListener('change', syncSubmitState);

    const close = () => closeBodyConfigModal(modal);
    modal.querySelector('[data-body-config-close]')?.addEventListener('click', close);
    modal.querySelector('[data-body-config-cancel]')?.addEventListener('click', close);
    submit?.addEventListener('click', () => submitBodyGeneration(panel, modal));
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });

    document.body.append(modal);
    document.documentElement.classList.add('business-body-config-open');
    document.body.classList.add('business-body-config-open');
    outlineSelect?.focus({ preventScroll: true });
  };

  const closeQuickConfigModal = (modal) => {
    if (!modal) return;
    modal.remove();
    document.documentElement.classList.remove('business-body-config-open');
    document.body.classList.remove('business-body-config-open');
    modal.__previousFocus?.focus?.({ preventScroll: true });
  };

  const submitQuickGeneration = (panel, modal, trigger) => {
    const selectedCompany = modal.querySelector('[data-quick-config-company]')?.value.trim() || '';
    if (!selectedCompany) {
      modal.querySelector('[data-quick-config-company]')?.focus({ preventScroll: true });
      return;
    }

    modal.dataset.selectedCompany = selectedCompany;
    closeQuickConfigModal(modal);
    addBodyProcessingRecord(panel);
  };

  const openQuickConfigModal = (panel, trigger) => {
    const existing = document.querySelector('[data-business-quick-config]');
    if (existing) {
      existing.querySelector('[data-quick-config-company]')?.focus({ preventScroll: true });
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'business-body-config-modal';
    modal.dataset.businessQuickConfig = 'true';
    modal.innerHTML = `
      <section class="business-body-config-dialog" role="dialog" aria-modal="true" aria-labelledby="business-quick-config-title">
        <header class="business-body-config-header">
          <h2 id="business-quick-config-title">一键生成商务标</h2>
          <button class="business-body-config-close" type="button" data-quick-config-close aria-label="关闭一键生成商务标">×</button>
        </header>
        <div class="business-body-config-content">
          <div class="business-body-config-source">
            <strong>招标文件：</strong>
            <span title="${escapeHtml(getSourceFileName())}">${escapeHtml(getSourceFileName())}</span>
          </div>
          <section class="business-body-config-company-field">
            <label class="business-body-config-field" for="business-quick-config-company">
              <span><b aria-hidden="true">*</b>选择投标企业</span>
            <select id="business-quick-config-company" data-quick-config-company required ${getTenderCompanies().length ? '' : 'disabled'}>
              <option value="">请选择投标企业</option>
              ${companyOptions(getSelectedTenderCompany())}
            </select>
          </label>
          </section>
        </div>
        <footer class="business-body-config-footer">
          <button class="business-body-config-cancel" type="button" data-quick-config-cancel>取消</button>
          <button class="business-body-config-confirm" type="button" data-quick-config-submit disabled>开始生成</button>
        </footer>
      </section>`;

    modal.__previousFocus = trigger || document.activeElement;
    const companySelect = modal.querySelector('[data-quick-config-company]');
    const submit = modal.querySelector('[data-quick-config-submit]');
    const syncSubmitState = () => {
      const selected = Boolean(companySelect?.value.trim());
      if (submit) submit.disabled = !selected;
    };
    companySelect?.addEventListener('change', syncSubmitState);
    syncSubmitState();
    const close = () => closeQuickConfigModal(modal);
    modal.querySelector('[data-quick-config-close]')?.addEventListener('click', close);
    modal.querySelector('[data-quick-config-cancel]')?.addEventListener('click', close);
    modal.querySelector('[data-quick-config-submit]')?.addEventListener('click', () => submitQuickGeneration(panel, modal, trigger));
    modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });

    document.body.append(modal);
    document.documentElement.classList.add('business-body-config-open');
    document.body.classList.add('business-body-config-open');
    modal.querySelector('[data-quick-config-company]')?.focus({ preventScroll: true });
  };

  const bindOutlineGeneration = (panel) => {
    const preciseButtons = Array.from(panel.querySelectorAll('.result-mode .tool-grid > button'));
    const outlineButton = preciseButtons[1];
    if (!outlineButton || outlineButton.dataset.businessOutlineBound === 'true') return;

    outlineButton.dataset.businessOutlineBound = 'true';
    outlineButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openOutlineConfigModal(panel, outlineButton);
    }, true);
  };

  const bindBodyGeneration = (panel) => {
    const preciseButtons = Array.from(panel.querySelectorAll('.result-mode .tool-grid > button'));
    const bodyButton = preciseButtons[2];
    if (!bodyButton || bodyButton.dataset.businessBodyBound === 'true') return;

    bodyButton.dataset.businessBodyBound = 'true';
    bodyButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openBodyConfigModal(panel, bodyButton);
    }, true);
  };

  const bindQuickGeneration = (panel) => {
    const quickButton = panel.querySelector('.quick-mode .quick-action');
    if (!quickButton || quickButton.dataset.businessQuickBound === 'true') return;

    quickButton.dataset.businessQuickBound = 'true';
    quickButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openQuickConfigModal(panel, quickButton);
    }, true);
  };

  const setModeLabel = (button, mode) => {
    const label = button.querySelector('span');
    if (!label) return;

    const currentNumber = label.querySelector('b')?.textContent?.trim();
    const currentName = Array.from(label.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('')
      .trim();

    if (currentNumber === mode.number && currentName === mode.name) return;

    label.replaceChildren();
    const number = document.createElement('b');
    number.textContent = mode.number;
    label.append(number, document.createTextNode(` ${mode.name}`));
  };

  const setQuickModeLabel = (button) => {
    const icon = button.querySelector('img');
    const currentName = Array.from(button.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('')
      .trim();

    if (currentName === config.quickModeName) return;

    button.replaceChildren();
    if (icon) button.append(icon);
    button.append(document.createTextNode(config.quickModeName));
  };

  const normalizeIconPaths = () => {
    document.querySelectorAll('img').forEach((image) => {
      const source = image.getAttribute('src');
      const normalizedSource = config.normalizeIconPath(source || '');
      if (source && source !== normalizedSource) image.setAttribute('src', normalizedSource);
    });
  };

  const normalizeGeneratedRecords = (panel) => {
    panel.querySelectorAll('.record-row').forEach((row) => {
      const title = row.querySelector('strong');
      if (title && config.isUnsupportedCompletedRecord(title.textContent)) row.remove();
    });

    panel.querySelectorAll('.processing-row strong, .record-row strong').forEach((title) => {
      const row = title.closest('.processing-row, .record-row');
      const normalize = row?.classList.contains('processing-row')
        ? config.normalizeProcessingRecordText
        : config.normalizeRecordText;
      const normalizedText = normalize(title.textContent);
      const normalizedTitle = normalize(title.getAttribute('title') || '');

      if (title.textContent !== normalizedText) title.textContent = normalizedText;
      if (title.getAttribute('title') !== normalizedTitle) title.setAttribute('title', normalizedTitle);
    });
  };

  const removeTechnicalOnlyRecords = (panel) => {
    panel.querySelectorAll('.processing-row, .record-row').forEach((row) => {
      const title = row.querySelector('strong')?.textContent || '';
      if (config.isTechnicalOnlyRecord(title)) row.remove();
    });
  };

  const applyBusinessMode = () => {
    updateQueued = false;
    syncBusinessProjectName();
    const panel = document.querySelector('#result-panel');
    if (!panel) return;

    removeTechnicalOnlyRecords(panel);

    const resultTabs = Array.from(panel.querySelectorAll('.result-tab'));
    const businessTab = resultTabs.find((button) => button.textContent.trim() === '商务标');
    if (!initialTabSynced && businessTab) {
      initialTabSynced = true;
      resultTabs.forEach((button) => {
        const active = button === businessTab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });
    }

    const preciseButtons = Array.from(panel.querySelectorAll('.result-mode .tool-grid > button'));
    if (preciseButtons.length >= 3) {
      preciseButtons[0].hidden = true;
      preciseButtons[0].style.setProperty('display', 'none', 'important');
      setModeLabel(preciseButtons[1], config.preciseModes[0]);
      setModeLabel(preciseButtons[2], config.preciseModes[1]);
      bindOutlineGeneration(panel);
      bindBodyGeneration(panel);

      if (!initialPreciseModeSynced) {
        initialPreciseModeSynced = true;
        preciseButtons.forEach((button, index) => {
          const active = index === 1;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
      }
    }

    const quickButton = panel.querySelector('.quick-mode .quick-action');
    if (quickButton) {
      setQuickModeLabel(quickButton);
      bindQuickGeneration(panel);
    }
    normalizeGeneratedRecords(panel);
    normalizeIconPaths();
  };

  const scheduleUpdate = () => {
    if (updateQueued) return;
    updateQueued = true;
    window.requestAnimationFrame(applyBusinessMode);
  };

  scheduleUpdate();
  new MutationObserver(scheduleUpdate).observe(app, {
    childList: true,
    subtree: true,
  });
})();
