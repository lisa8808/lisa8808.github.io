(() => {
  if (!document.body.classList.contains('technical-mode-page')) return;

  const PREFIX = '技术要求解读_';
  const STEPS = ['解析招标文件', '提取技术要求', '梳理评分要点', '生成解读结果', '生成结果文件'];
  const OUTLINE_PREFIX = '技术大纲_';
  const OUTLINE_LEGACY_PREFIX = '技术标投标大纲_';
  const OUTLINE_STEPS = ['解析招标文件', '提取技术要求', '生成目录结构', '校验大纲结构', '生成结果文件'];
  const INITIAL_PROGRESS_LABEL = '正在处理中（1/5）';

  const formatMinute = (date = new Date()) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  };

  const sourceName = () => {
    const checked = document.querySelector('.upload-group .file-row[aria-pressed="true"] .ellipsis');
    const firstTender = document.querySelector('.upload-group .file-row .ellipsis');
    return (checked?.textContent?.trim() || firstTender?.textContent?.trim() || '某高校高性能计算GPU集群建设项目.docx')
      .replace(/\.(docx?|pdf)$/i, '');
  };

  const formatTitle = (prefix, fileName) => {
    const baseName = String(fileName || sourceName()).trim().replace(/\.(docx?|pdf)$/i, '');
    return `${prefix}${baseName}_${window.TechnicalResultNaming?.formatMinute?.() || formatMinute()}`;
  };

  const updateProgress = (row, current, total = STEPS.length) => {
    if (!row.isConnected) return;
    const status = row.querySelector('[data-interpretation-progress-status]');
    const count = row.querySelector('[data-interpretation-progress-count]');
    if (!status || !count) return;
    status.textContent = `正在处理中（${current}/${total}）`;
    count.textContent = `${current}/${total}`;
    row.querySelectorAll('[data-interpretation-progress-step]').forEach((step, index) => {
      step.classList.toggle('done', index < current - 1);
      step.classList.toggle('active', index === current - 1);
      step.classList.toggle('pending', index > current - 1);
    });
  };

  const scheduleProgress = (row) => {
    [2, 3].forEach((current, index) => {
      window.setTimeout(() => updateProgress(row, current), (index + 1) * 1600);
    });
  };

  const setOutlineProgress = (row, current, total = OUTLINE_STEPS.length) => {
    if (!row.isConnected) return;
    const status = row.querySelector('[data-outline-progress-status]');
    const count = row.querySelector('[data-outline-progress-count]');
    if (!status || !count) return;
    status.textContent = `正在处理中（${current}/${total}）`;
    count.textContent = `${current}/${total}`;
    row.querySelectorAll('[data-outline-progress-step]').forEach((step, index) => {
      step.classList.toggle('done', index < current - 1);
      step.classList.toggle('active', index === current - 1);
      step.classList.toggle('pending', index > current - 1);
    });
  };

  const scheduleOutlineProgress = (row) => {
    [2, 3].forEach((current, index) => {
      window.setTimeout(() => setOutlineProgress(row, current), (index + 1) * 1600);
    });
  };

  const createProgressTrigger = (steps, statusAttribute, countAttribute, stepAttribute) => {
    const progress = document.createElement('span');
    progress.className = 'progress-trigger';
    progress.tabIndex = 0;
    progress.setAttribute('aria-label', '查看处理进度');
    progress.innerHTML = `<small ${statusAttribute}>${INITIAL_PROGRESS_LABEL}</small><span class="progress-popover"><span class="progress-popover-title"><b>处理进度</b><strong ${countAttribute}>1/5</strong></span>${steps.map((step, index) => `<span class="progress-step ${index === 0 ? 'active' : 'pending'}" ${stepAttribute}><i></i>${step}</span>`).join('')}</span>`;
    return progress;
  };

  const createProcessingRecord = () => {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return false;

    const title = formatTitle(PREFIX);
    const row = document.createElement('div');
    row.className = 'processing-row technical-interpretation-processing';
    row.dataset.technicalInterpretationTask = `${title}-${Date.now()}`;

    const icon = document.createElement('img');
    icon.className = 'processing-icon';
    icon.src = './assets/figma/record-refresh.svg';
    icon.alt = '';

    const copy = document.createElement('span');
    copy.className = 'processing-copy';
    const heading = document.createElement('strong');
    heading.textContent = title;
    heading.title = title;
    copy.append(heading, createProgressTrigger(STEPS, 'data-interpretation-progress-status', 'data-interpretation-progress-count', 'data-interpretation-progress-step'));

    const more = document.createElement('button');
    more.className = 'more-button';
    more.type = 'button';
    more.setAttribute('aria-label', '任务更多操作');
    more.innerHTML = '<img src="./assets/figma/more.svg" alt="">';

    row.append(icon, copy, more);
    list.prepend(row);
    scheduleProgress(row);
    return true;
  };

  const getOutlineRowTitle = (row) => row.querySelector('.processing-copy strong')?.textContent?.trim() || '';

  const findOutlineProcessingRow = (list) => Array.from(list.querySelectorAll('.processing-row')).find((row) => {
    const title = getOutlineRowTitle(row);
    return title.startsWith(OUTLINE_PREFIX) || title.startsWith(OUTLINE_LEGACY_PREFIX);
  });

  const enhanceOutlineProcessingRow = (row, fileName) => {
    const copy = row.querySelector('.processing-copy');
    if (!copy) return false;

    const heading = copy.querySelector('strong');
    if (!heading) return false;

    const currentTitle = heading.textContent.trim();
    const hasGeneratedTime = /_\d{12}$/.test(currentTitle);
    const title = currentTitle.startsWith(OUTLINE_LEGACY_PREFIX)
      ? `${OUTLINE_PREFIX}${currentTitle.slice(OUTLINE_LEGACY_PREFIX.length)}`
      : currentTitle.startsWith(OUTLINE_PREFIX) && hasGeneratedTime
        ? currentTitle
        : formatTitle(OUTLINE_PREFIX, fileName);
    heading.textContent = title;
    heading.title = title;

    copy.querySelectorAll('.progress-trigger, small, .progress-popover').forEach((node) => node.remove());
    copy.append(createProgressTrigger(OUTLINE_STEPS, 'data-outline-progress-status', 'data-outline-progress-count', 'data-outline-progress-step'));
    row.classList.add('technical-outline-processing');
    row.dataset.technicalOutlineTask = `${title}-${Date.now()}`;
    scheduleOutlineProgress(row);
    return true;
  };

  const createOutlineProcessingRecord = (fileName) => {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return false;

    const title = formatTitle(OUTLINE_PREFIX, fileName);
    const row = document.createElement('div');
    row.className = 'processing-row technical-outline-processing';
    row.dataset.technicalOutlineTask = `${title}-${Date.now()}`;

    const icon = document.createElement('img');
    icon.className = 'processing-icon';
    icon.src = './assets/figma/record-refresh.svg';
    icon.alt = '';

    const copy = document.createElement('span');
    copy.className = 'processing-copy';
    const heading = document.createElement('strong');
    heading.textContent = title;
    heading.title = title;
    copy.append(heading, createProgressTrigger(OUTLINE_STEPS, 'data-outline-progress-status', 'data-outline-progress-count', 'data-outline-progress-step'));

    const more = document.createElement('button');
    more.className = 'more-button';
    more.type = 'button';
    more.setAttribute('aria-label', '任务更多操作');
    more.innerHTML = '<img src="./assets/figma/more.svg" alt="">';

    row.append(icon, copy, more);
    list.prepend(row);
    scheduleOutlineProgress(row);
    return true;
  };

  const enhanceOrCreateOutlineRecord = (fileName) => {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return false;
    const existing = findOutlineProcessingRow(list);
    if (!existing) return createOutlineProcessingRecord(fileName);
    const enhanced = enhanceOutlineProcessingRow(existing, fileName);
    if (enhanced) list.prepend(existing);
    return enhanced;
  };

  window.addEventListener('tender:outline-generated', (event) => {
    const fileName = event.detail?.fileName || sourceName();
    window.setTimeout(() => enhanceOrCreateOutlineRecord(fileName), 0);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('#result-panel .tool-grid button');
    if (!button || !/^01\s*技术要求解读/.test(button.textContent.replace(/\s+/g, ''))) return;
    if (!createProcessingRecord()) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);
})();
