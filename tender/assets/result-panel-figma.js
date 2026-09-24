(() => {
  const app = document.getElementById('app');
  if (!app) return;

  let panel = null;
  let timelineFrame = 0;
  let orderSeq = 1;

  const asset = (name) => `./assets/figma/${name}`;

  function resultScope() {
    if (document.body.classList.contains('business-mode-page')) return 'business';
    if (document.body.classList.contains('technical-mode-page')) return 'technical';
    if (document.body.classList.contains('interpretation-mode-page')) return 'prebid';
    return '';
  }

  function syncProjectTimeline() {
    const projectTime = window.ProjectCreatedTime;
    if (!projectTime) return;

    const scope = resultScope();
    const signature = panel.querySelectorAll('.record-row:not(.processing-row)').length
      + ':'
      + Array.from(panel.querySelectorAll('.record-row:not(.processing-row)')).map((row) => {
        const title = row.querySelector('.record-copy strong')?.textContent?.trim() || '';
        const detail = row.querySelector('.record-copy small')?.textContent?.trim() || '';
        return `${title}:${detail}`;
      }).join('|');
    if (panel.dataset.projectTimelineSignature === signature) return;
    panel.dataset.projectTimelineSignature = signature;

    const groups = new Map();
    panel.querySelectorAll('.record-row:not(.processing-row)').forEach((row) => {
      const parent = row.parentElement;
      if (!parent) return;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(row);
    });

    groups.forEach((rows, parent) => {
      const projectName = new URLSearchParams(window.location.search).get('project');
      // 这个排序由 MutationObserver 反复触发，排序依据必须完全独立于当前 DOM 顺序，
      // 否则同名同步骤的记录会来回换位，表现为结果列表不断“跳”。
      // 序号只在首次见到该行时分配一次，之后永不回写，保证每轮排序结果完全一致。
      const seqFor = (row) => {
        const stamped = row.dataset.projectTimelineSeq;
        if (stamped && Number.isFinite(Number(stamped))) return Number(stamped);
        const next = orderSeq;
        row.dataset.projectTimelineSeq = String(next);
        orderSeq += 1;
        return next;
      };

      const ordered = rows.map((row) => {
        const title = row.querySelector('.record-copy strong')?.textContent?.trim() || '';
        const seq = seqFor(row);
        const knownStep = projectTime.stepForTitle(title, scope);
        // 未识别的记录不能拿 DOM 下标当顺序（下标每轮都会变），改用一次性序号兜底
        const step = knownStep == null ? seq : knownStep;
        const displayOrder = title.includes('问答记录') ? -1 : step;
        const detail = row.querySelector('.record-copy small');
        const nextDetail = projectTime.resultText(projectName, knownStep == null ? 0 : step);

        row.dataset.projectTimelineStep = String(knownStep == null ? '' : step);
        if (detail && detail.textContent !== nextDetail) detail.textContent = nextDetail;
        return { row, seq, displayOrder };
      });

      ordered.sort((left, right) =>
        right.displayOrder - left.displayOrder
        || left.seq - right.seq);
      const changed = ordered.some((item, index) => item.row !== rows[index]);
      if (!changed) return;

      const fragment = document.createDocumentFragment();
      ordered.forEach((item) => fragment.append(item.row));
      parent.append(fragment);
    });
  }

  function scheduleProjectTimeline() {
    if (timelineFrame) return;
    const run = () => {
      timelineFrame = 0;
      syncProjectTimeline();
    };
    timelineFrame = window.requestAnimationFrame ? window.requestAnimationFrame(run) : window.setTimeout(run, 0);
  }

  function replaceInlineIcon(selector, file, className) {
    panel.querySelectorAll(selector).forEach((node) => {
      if (node.tagName === 'IMG') return;
      const image = document.createElement('img');
      image.className = className;
      image.src = asset(file);
      image.alt = '';
      node.replaceWith(image);
    });
  }

  function syncProgressHover() {
    panel.querySelectorAll('.processing-row').forEach((row) => {
      const copy = row.querySelector('.processing-copy');
      if (!copy || copy.querySelector('.progress-trigger')) return;

      const status = Array.from(copy.children).find((child) => child.matches('small'));
      const popover = Array.from(copy.children).find((child) => child.matches('.progress-popover'));
      if (!status || !popover) return;

      const trigger = document.createElement('span');
      trigger.className = 'progress-trigger';
      trigger.tabIndex = 0;
      trigger.setAttribute('aria-label', '查看处理进度');
      trigger.append(status, popover);
      copy.append(trigger);
    });
  }

  function syncFigmaIcons() {
    syncProgressHover();
    replaceInlineIcon('.processing-row > svg', 'record-refresh.svg', 'processing-icon');
    replaceInlineIcon('.quick-action > svg', 'detail-magic.svg', 'quick-action-icon');

    panel.querySelectorAll('.more-button img').forEach((image) => {
      const target = asset('more.svg');
      if (image.getAttribute('src') !== target) image.src = target;
    });

    panel.querySelectorAll('.record-row .record-icon').forEach((icon) => {
      const row = icon.closest('.record-row');
      const title = row?.querySelector('.record-copy strong')?.textContent?.trim() || '';
      const type = row?.classList.contains('qa-record-row') || title.startsWith('问答记录_')
        ? 'business'
        : title.includes('投标大纲_') || title.startsWith('技术大纲_') || title.startsWith('商务大纲_')
          ? 'tech'
          : title.includes('投标正文_') || title.startsWith('技术正文_') || title.startsWith('商务正文_')
            ? 'business'
            : 'review';
      const iconClass = `record-icon ${type}`;
      if (icon.className !== iconClass) icon.className = iconClass;

      const image = icon.querySelector('img');
      if (!image) return;
      const file = type === 'tech' ? 'record-tech.svg' : type === 'business' ? 'record-book.svg' : 'record-gold.svg';
      const target = asset(file);
      if (image.getAttribute('src') !== target) image.src = target;
    });

    const heading = panel.querySelector('.record-heading');
    if (heading && heading.textContent !== '生成记录') heading.textContent = '生成记录';

    scheduleProjectTimeline();
  }

  const attachPanel = (nextPanel) => {
    if (!nextPanel || nextPanel === panel) return;

    panel = nextPanel;
    syncFigmaIcons();
    new MutationObserver(syncFigmaIcons).observe(panel, { childList: true, subtree: true });
  };

  const syncPanel = () => attachPanel(document.getElementById('result-panel'));

  syncPanel();
  new MutationObserver(syncPanel).observe(app, { childList: true, subtree: true });
})();
