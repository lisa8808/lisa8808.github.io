(() => {
  const IS_TECHNICAL_PAGE = document.body.classList.contains('technical-mode-page');
  const RESULT_PREFIX = IS_TECHNICAL_PAGE ? '技术要求解读_' : '标书要点解读_';
  const OUTLINE_PREFIX = '技术大纲_';
  const MODAL_TITLE = IS_TECHNICAL_PAGE ? '技术要求解读' : '标前解读';
  const DEFAULT_FILE = '某高校高性能计算GPU集群建设项目.docx';
  const OUTLINE_STEPS = ['读取技术要求解读', '提取技术章节', '生成目录结构', '校验大纲结构', '生成结果文件'];
  const overviewDocument = typeof window !== 'undefined' ? window.tenderProjectOverview : null;
  const scoreStandard = typeof window !== 'undefined' ? window.tenderScoreStandard : null;
  let lastFocused = null;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));

  function renderDocTable(rows) {
    if (!Array.isArray(rows) || !rows.length) return '';
    const body = rows.map((row, rowIndex) => `<tr>${row.map((cell) => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      return `<${tag}>${escapeHtml(cell).replace(/\n/g, '<br>')}</${tag}>`;
    }).join('')}</tr>`).join('');
    return `<div class="interpretation-doc-table-wrap"><table class="interpretation-doc-table"><tbody>${body}</tbody></table></div>`;
  }

  function renderOverviewBlock(block) {
    if (!block) return '';
    if (block.kind === 'heading') {
      const className = Number(block.level) >= 4 ? 'interpretation-overview-subsub' : 'interpretation-overview-sub';
      return `<p class="${className}">${escapeHtml(block.text)}</p>`;
    }
    if (block.kind === 'table') return renderDocTable(block.rows);
    if (block.kind === 'list' || block.kind === 'olist') {
      const tag = block.kind === 'olist' ? 'ol' : 'ul';
      return `<${tag}>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
    }
    if (block.kind === 'quote') return `<p class="interpretation-overview-note">${escapeHtml(block.text)}</p>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }

  function renderOverviewContent() {
    if (!IS_TECHNICAL_PAGE || !overviewDocument?.groups?.length) return '';
    return overviewDocument.groups.map((group, index) => {
      const blocks = (group.blocks || []).map(renderOverviewBlock).join('');
      return `<details class="interpretation-overview-group"${index <= 1 ? ' open' : ''}><summary>${escapeHtml(group.heading)}</summary><div class="interpretation-overview-body">${blocks}</div></details>`;
    }).join('');
  }

  function renderScoreParas(paras) {
    return (paras || []).map((para) => `<p>${escapeHtml(para)}</p>`).join('');
  }

  function renderScoreContent() {
    if (!IS_TECHNICAL_PAGE || !scoreStandard?.items?.length) return '';
    const items = scoreStandard.items.map((item) => {
      const paras = renderScoreParas(item.paras);
      if (item.kind === 'remark') {
        return `<article class="interpretation-score-item interpretation-score-note"><div><strong>${escapeHtml(item.title || '备注')}</strong></div>${paras}</article>`;
      }
      const title = [item.part, item.project].filter(Boolean).join(' · ');
      return `<article class="interpretation-score-item"><div><strong>${escapeHtml(title)}</strong><b>${escapeHtml(item.score || '')}</b></div>${paras}</article>`;
    }).join('');
    const total = scoreStandard.total?.value
      ? `<article class="interpretation-score-item interpretation-score-total"><div><strong>${escapeHtml(scoreStandard.total.label || '总分')}</strong><b>${escapeHtml(scoreStandard.total.value)}</b></div></article>`
      : '';
    const notes = scoreStandard.notes?.paras?.length
      ? `<article class="interpretation-score-item interpretation-score-note"><div><strong>${escapeHtml(scoreStandard.notes.title || '说明')}</strong></div>${renderScoreParas(scoreStandard.notes.paras)}</article>`
      : '';
    const policy = scoreStandard.policy?.rows?.length
      ? `<article class="interpretation-score-item interpretation-score-note"><div><strong>${escapeHtml(scoreStandard.policy.title || '政府采购政策')}</strong></div>${renderDocTable(scoreStandard.policy.rows)}</article>`
      : '';
    return items + total + notes + policy;
  }

  function getModal() {
    let backdrop = document.querySelector('.interpretation-modal-backdrop');
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.className = 'interpretation-modal-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="interpretation-modal" role="dialog" aria-modal="true" aria-labelledby="interpretationModalTitle">
        <header class="interpretation-modal-header">
          <div class="interpretation-modal-title">
            <img src="./assets/figma/tool-demand-new.svg" alt="">
            <h2 id="interpretationModalTitle">${MODAL_TITLE}</h2>
          </div>
          <div class="interpretation-modal-header-actions">
            <button class="interpretation-outline-button" type="button">立即生成大纲</button>
            <button class="interpretation-close-button" type="button" aria-label="关闭${MODAL_TITLE}弹窗">×</button>
          </div>
        </header>

        <div class="interpretation-modal-body">
          <p class="interpretation-section-label">招标文件</p>
          <div class="interpretation-file-row">
            <img src="./assets/figma/word.svg" alt="Word文件">
            <span class="interpretation-file-name"></span>
          </div>

          <p class="interpretation-section-label interpretation-result-label">解读结果</p>
          <div class="interpretation-result-tabs" role="tablist" aria-label="解读结果类型">
            <button class="interpretation-result-tab active" type="button" role="tab" data-interpretation-tab="overview" aria-selected="true">项目概述</button>
            <button class="interpretation-result-tab" type="button" role="tab" data-interpretation-tab="score" aria-selected="false">评分项</button>
            <button class="interpretation-result-tab" type="button" role="tab" data-interpretation-tab="response" aria-selected="false">技术点对点应答</button>
          </div>
          <div class="interpretation-result-panels">
            <section class="interpretation-result-panel active" role="tabpanel" data-interpretation-panel="overview">
              <div class="interpretation-result-scroll">
                ${renderOverviewContent() || `
                <h4>一、项目背景</h4>
                <p>武汉城建集团拟建设供应链金融服务平台，通过数字化技术整合集团上下游企业、金融机构及业务系统，为供应商提供便捷、安全的综合金融服务。</p>
                <h4>二、建设目标</h4>
                <p>搭建统一的供应链金融服务平台，实现业务申请、资产管理、融资服务、风险控制和运营分析的线上化，提升集团供应链协同效率与金融服务能力。</p>
                <h4>三、建设内容</h4>
                <p>本项目主要包含平台基础能力、供应链金融业务管理、企业及产品管理、风控管理、数据分析、运营管理以及与集团现有系统的集成建设。</p>
                <h4>四、实施要求</h4>
                <p>供应商应完成需求调研、方案设计、系统开发、部署实施、联调测试、上线试运行、培训和运维保障，并确保项目满足安全合规及国产化适配要求。</p>
                `}
              </div>
            </section>

            <section class="interpretation-result-panel" role="tabpanel" data-interpretation-panel="score" hidden>
              <div class="interpretation-result-scroll">
                ${renderScoreContent() || `
                <article class="interpretation-score-item">
                  <div><strong>技术方案完整性</strong><b>20分</b></div>
                  <p>结合项目需求提供总体架构、业务架构、数据架构和技术架构，方案完整、可行且具有针对性。</p>
                </article>
                <article class="interpretation-score-item">
                  <div><strong>项目实施方案</strong><b>15分</b></div>
                  <p>实施计划、人员组织、进度控制、质量保障和风险管理措施清晰合理。</p>
                </article>
                <article class="interpretation-score-item">
                  <div><strong>系统安全设计</strong><b>15分</b></div>
                  <p>充分说明身份认证、权限管理、数据安全、审计追踪和系统容灾等设计。</p>
                </article>
                <article class="interpretation-score-item">
                  <div><strong>产品能力与案例</strong><b>10分</b></div>
                  <p>具备成熟的平台产品能力，并提供与本项目相近的供应链金融建设案例。</p>
                </article>
                <article class="interpretation-score-item">
                  <div><strong>售后服务保障</strong><b>10分</b></div>
                  <p>服务响应、运维团队、故障处理和持续优化机制满足招标要求。</p>
                </article>
                `}
              </div>
            </section>

            <section class="interpretation-result-panel" role="tabpanel" data-interpretation-panel="response" hidden>
              <div class="interpretation-result-scroll">
                ${typeof window.TechnicalResponseRequirements?.render === 'function' ? window.TechnicalResponseRequirements.render() : `
                <article class="interpretation-response-item">
                  <strong>平台总体架构</strong>
                  <p>针对招标文件提出的平台建设要求，技术方案采用微服务与容器化架构，完整说明业务层、服务层、数据层和基础设施层的功能边界及协作关系。</p>
                </article>
                <article class="interpretation-response-item">
                  <strong>核心业务能力</strong>
                  <p>逐项响应电子债权凭证开立、多级流转、保理融资、资产证券化以及业务全流程状态管理要求，并明确关键流程和实现方式。</p>
                </article>
                <article class="interpretation-response-item">
                  <strong>安全与合规</strong>
                  <p>围绕身份认证、权限控制、数据加密、操作审计、容灾备份与国产化适配形成对应技术措施，确保满足安全合规要求。</p>
                </article>
                <article class="interpretation-response-item">
                  <strong>实施与服务</strong>
                  <p>对应招标文件中的交付要求，提供项目组织、里程碑计划、质量管理、风险控制、培训交付和持续运维保障方案。</p>
                </article>
                `}
              </div>
            </section>
          </div>
        </div>
      </section>`;

    document.body.append(backdrop);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('.interpretation-close-button')) {
        closeModal();
      }
    });
    backdrop.querySelectorAll('[data-interpretation-tab]').forEach((button) => {
      button.addEventListener('click', () => switchResultTab(backdrop, button.dataset.interpretationTab));
    });
    backdrop.querySelector('.interpretation-outline-button').addEventListener('click', startOutlineFlow);
    return backdrop;
  }

  function switchResultTab(backdrop, tab) {
    backdrop.querySelectorAll('[data-interpretation-tab]').forEach((button) => {
      const active = button.dataset.interpretationTab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    backdrop.querySelectorAll('[data-interpretation-panel]').forEach((panel) => {
      const active = panel.dataset.interpretationPanel === tab;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  function normalizeFileName(resultTitle) {
    const raw = resultTitle.slice(RESULT_PREFIX.length).trim().replace(/_\d{12}$/, '');
    if (!raw) return DEFAULT_FILE;
    return /\.(docx?|pdf)$/i.test(raw) ? raw : `${raw}.docx`;
  }

  function openModal(resultTitle) {
    const backdrop = getModal();
    lastFocused = document.activeElement;
    backdrop.querySelector('.interpretation-file-name').textContent = normalizeFileName(resultTitle);
    backdrop.hidden = false;
    document.body.classList.add('interpretation-modal-open');
    requestAnimationFrame(() => backdrop.querySelector('.interpretation-close-button').focus());
  }

  function closeModal() {
    const backdrop = document.querySelector('.interpretation-modal-backdrop');
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.classList.remove('interpretation-modal-open');
    lastFocused?.focus?.();
  }

  function formatMinute(date = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  }

  function updateOutlineProgress(row, current, total = OUTLINE_STEPS.length) {
    if (!row?.isConnected) return;
    const status = row.querySelector('[data-outline-progress-status]');
    const count = row.querySelector('[data-outline-progress-count]');
    if (status) status.textContent = `正在处理中（${current}/${total}）`;
    if (count) count.textContent = `${current}/${total}`;
    row.querySelectorAll('[data-outline-progress-step]').forEach((step, index) => {
      step.classList.toggle('completed', index < current - 1);
      step.classList.toggle('active', index === current - 1);
      step.classList.toggle('pending', index > current - 1);
    });
  }

  function scheduleOutlineProgress(row) {
    [2, 3].forEach((current, index) => {
      window.setTimeout(() => updateOutlineProgress(row, current), (index + 1) * 1600);
    });
  }

  function createOutlineProcessingRecord(fileName) {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return false;

    const baseName = fileName.replace(/\.(docx?|pdf)$/i, '');
    const minute = window.TechnicalResultNaming?.formatMinute?.() || formatMinute();
    const title = `${OUTLINE_PREFIX}${baseName}_${minute}`;
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
    const progress = document.createElement('span');
    progress.className = 'progress-trigger';
    progress.tabIndex = 0;
    progress.setAttribute('aria-label', '查看处理进度');
    progress.innerHTML = `<small data-outline-progress-status>正在处理中（1/5）</small><span class="progress-popover"><span class="progress-popover-title"><b>处理进度</b><strong data-outline-progress-count>1/5</strong></span>${OUTLINE_STEPS.map((step, index) => `<span class="progress-step ${index === 0 ? 'active' : 'pending'}" data-outline-progress-step><i></i>${step}</span>`).join('')}</span>`;
    copy.append(heading, progress);

    const more = document.createElement('button');
    more.className = 'more-button';
    more.type = 'button';
    more.setAttribute('aria-label', '任务更多操作');
    more.innerHTML = '<img src="./assets/figma/more.svg" alt="">';

    row.append(icon, copy, more);
    list.prepend(row);
    scheduleOutlineProgress(row);
    return true;
  }

  function startOutlineFlow() {
    const backdrop = document.querySelector('.interpretation-modal-backdrop');
    const fileName = backdrop?.querySelector('.interpretation-file-name')?.textContent?.trim() || DEFAULT_FILE;
    if (!IS_TECHNICAL_PAGE || !createOutlineProcessingRecord(fileName)) {
      showToast('当前无法创建技术大纲任务');
      return;
    }
    closeModal();
  }

  function showToast(message) {
    let toast = document.querySelector('.interpretation-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'interpretation-toast';
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 1800);
  }

  document.addEventListener('click', (event) => {
    const resultButton = event.target.closest('#result-panel .record-row .record-main');
    if (!resultButton) return;
    const title = resultButton.querySelector('strong')?.textContent?.trim() || '';
    if (!title.startsWith(RESULT_PREFIX)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openModal(title);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();
