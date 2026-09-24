(() => {
  const IS_TECHNICAL_PAGE = document.body.classList.contains('technical-mode-page');
  const INTERPRETATION_LABEL = IS_TECHNICAL_PAGE ? '招标文件解读' : '标前解读';
  const INTERPRETATION_NAME = `技术要求解读_某高校高性能计算GPU集群建设项目_202603181423`;
  const REVIEW_INTERPRETATION_NAME = `标书要点_某高校高性能计算GPU集群建设项目_202603181423`;
  const REVIEW_INTERPRETATION_PREFIXES = ['标书要点_', '标书要点解读_'];
  const overviewDocument = typeof window !== 'undefined' ? window.tenderProjectOverview : null;
  const scoreStandard = typeof window !== 'undefined' ? window.tenderScoreStandard : null;
  let lastFocused = null;

  function getSourceFileName() {
    return document.querySelector('.upload-panel .upload-group .file-row .ellipsis')?.textContent?.trim()
      || document.querySelector('.upload-panel .upload-group .file-row')?.textContent?.trim()
      || '某高校高性能计算GPU集群建设项目.docx';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  function renderOutlineTable(rows) {
    if (!Array.isArray(rows) || !rows.length) return '';
    const body = rows.map((row, rowIndex) => `<tr>${row.map((cell) => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      return `<${tag}>${escapeHtml(cell).replace(/\n/g, '<br>')}</${tag}>`;
    }).join('')}</tr>`).join('');
    return `<div class="outline-doc-table-wrap"><table class="outline-doc-table"><tbody>${body}</tbody></table></div>`;
  }

  function renderOutlineOverviewBlock(block) {
    if (!block) return '';
    if (block.kind === 'heading') {
      const className = Number(block.level) >= 4 ? 'outline-overview-subsub' : 'outline-overview-sub';
      return `<p class="${className}">${escapeHtml(block.text)}</p>`;
    }
    if (block.kind === 'table') return renderOutlineTable(block.rows);
    if (block.kind === 'list' || block.kind === 'olist') {
      const tag = block.kind === 'olist' ? 'ol' : 'ul';
      return `<${tag}>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
    }
    if (block.kind === 'quote') return `<p class="outline-overview-note">${escapeHtml(block.text)}</p>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }

  function renderOutlineOverviewContent() {
    if (!overviewDocument?.groups?.length) return '';
    return overviewDocument.groups.map((group, index) => {
      const blocks = (group.blocks || []).map(renderOutlineOverviewBlock).join('');
      return `<details class="outline-overview-group"${index <= 1 ? ' open' : ''}><summary>${escapeHtml(group.heading)}</summary><div class="outline-overview-body">${blocks}</div></details>`;
    }).join('');
  }

  function renderOutlineScoreParas(paras) {
    return (paras || []).map((para) => `<p>${escapeHtml(para)}</p>`).join('');
  }

  function renderOutlineScoreContent() {
    if (!scoreStandard?.items?.length) return '';
    const items = scoreStandard.items.map((item) => {
      const paras = renderOutlineScoreParas(item.paras);
      if (item.kind === 'remark') {
        return `<article class="outline-score-item outline-score-note"><div><strong>${escapeHtml(item.title || '备注')}</strong></div>${paras}</article>`;
      }
      const title = [item.part, item.project].filter(Boolean).join(' · ');
      return `<article class="outline-score-item"><div><strong>${escapeHtml(title)}</strong><b>${escapeHtml(item.score || '')}</b></div>${paras}</article>`;
    }).join('');
    const total = scoreStandard.total?.value
      ? `<article class="outline-score-item outline-score-total"><div><strong>${escapeHtml(scoreStandard.total.label || '总分')}</strong><b>${escapeHtml(scoreStandard.total.value)}</b></div></article>`
      : '';
    const notes = scoreStandard.notes?.paras?.length
      ? `<article class="outline-score-item outline-score-note"><div><strong>${escapeHtml(scoreStandard.notes.title || '说明')}</strong></div>${renderOutlineScoreParas(scoreStandard.notes.paras)}</article>`
      : '';
    const policy = scoreStandard.policy?.rows?.length
      ? `<article class="outline-score-item outline-score-note"><div><strong>${escapeHtml(scoreStandard.policy.title || '政府采购政策')}</strong></div>${renderOutlineTable(scoreStandard.policy.rows)}</article>`
      : '';
    return items + total + notes + policy;
  }

  function isReviewInterpretation(fileName) {
    return REVIEW_INTERPRETATION_PREFIXES.some((prefix) => String(fileName).startsWith(prefix));
  }

  function getGeneratedInterpretationFiles() {
    const resultFiles = Array.from(document.querySelectorAll('#result-panel .record-row .record-copy strong, #result-panel .record-row strong'))
      .map((node) => node.textContent.trim())
      .filter((fileName) => fileName.startsWith('技术要求解读_') || isReviewInterpretation(fileName));
    const technicalFiles = resultFiles.filter((fileName) => fileName.startsWith('技术要求解读_'));
    const reviewFiles = resultFiles.filter((fileName) => isReviewInterpretation(fileName));
    return [...new Set([...(technicalFiles.length ? technicalFiles : [INTERPRETATION_NAME]), ...reviewFiles, REVIEW_INTERPRETATION_NAME])];
  }

  function buildInterpretationOptions(selectedValue = '') {
    return getGeneratedInterpretationFiles().map((fileName) => `
      <option value="${escapeHtml(fileName)}" data-source-kind="${isReviewInterpretation(fileName) ? 'review' : 'technical'}"${fileName === selectedValue ? ' selected' : ''}>${escapeHtml(fileName)}</option>`).join('');
  }

  function createModal() {
    let backdrop = document.querySelector('.outline-modal-backdrop');
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.className = 'outline-modal-backdrop';
    backdrop.hidden = true;
    const fileName = getSourceFileName();
    const interpretationFiles = getGeneratedInterpretationFiles();
    const defaultInterpretation = interpretationFiles.find((name) => name.startsWith('技术要求解读_')) || interpretationFiles[0] || '';
    backdrop.innerHTML = `
      <section class="outline-generation-modal" role="dialog" aria-modal="true" aria-labelledby="outlineModalTitle">
        <header class="outline-modal-header">
          <div class="outline-modal-title">
            <img src="./assets/figma/tool-outline-new.svg" alt="">
            <h2 id="outlineModalTitle">生成大纲</h2>
          </div>
          <div class="outline-modal-header-actions">
            <button class="outline-expand-button" type="button" aria-label="切换全屏显示" title="切换全屏显示">⛶</button>
            <button class="outline-close-button" type="button" aria-label="关闭生成大纲弹窗">×</button>
          </div>
        </header>

        <div class="outline-modal-scroll">
          <section class="outline-basic-section">
            <label class="outline-field-label">招标文件</label>
            <div class="outline-file-row">
              <img src="./assets/figma/word.svg" alt="Word文件">
              <span>${fileName}</span>
            </div>

            <div class="outline-page-setting">
              <div class="outline-setting-heading">
                <strong>页数设置</strong>
                <span>预计全文约 <b class="outline-page-summary">200</b> 页，约 <b class="outline-word-summary">12,000</b> 字</span>
              </div>
              <div class="outline-range-row">
                <div class="outline-range-wrap">
                  <div class="outline-range-track" aria-hidden="true">
                    <span></span>
                    <i></i><i></i><i></i><i></i><i></i><i></i>
                  </div>
                  <input class="outline-page-range" type="range" min="1" max="2000" step="1" value="200" aria-label="预计页数">
                  <div class="outline-range-labels"><span>1</span><span>400</span><span>800</span><span>1200</span><span>1600</span><span>2000</span></div>
                </div>
                <label class="outline-page-input-wrap">
                  <input class="outline-page-input" type="number" min="1" max="2000" value="200" aria-label="页数">
                  <span>页</span>
                </label>
              </div>
            </div>

            <div class="outline-level-setting">
              <strong>目录层级</strong>
              <div class="outline-stepper">
                <button class="outline-level-minus" type="button" aria-label="减少目录层级">−</button>
                <output class="outline-level-output">4</output>
                <button class="outline-level-plus" type="button" aria-label="增加目录层级">+</button>
              </div>
            </div>
          </section>

          <section class="outline-interpretation-section">
            <div class="outline-source-copy">
              <h3>${INTERPRETATION_LABEL}</h3>
              <p>大纲需依赖${INTERPRETATION_LABEL}生成，请选择项目中已生成解读文件或手动粘贴解读内容。</p>
            </div>
            <div class="outline-source-tabs" role="tablist" aria-label="解读依据类型">
              <button class="outline-source-tab active" type="button" data-mode="file" aria-selected="true">
                <img src="./assets/figma/record-gold.svg" alt="">选择已生成解读文件
              </button>
              <button class="outline-source-tab" type="button" data-mode="paste" aria-selected="false">
                <img src="./assets/figma/feedback-copy.svg" alt="">粘贴解读内容
              </button>
            </div>

            <div class="outline-source-control file-mode">
              <label><i>*</i>选择已生成招标解读文件</label>
              <select class="outline-interpretation-select" aria-label="选择已生成招标解读文件">
                <option value="">请选择招标解读文件</option>
                ${buildInterpretationOptions(defaultInterpretation)}
              </select>
            </div>
            <p class="outline-preview-label">解读结果</p>
            <div class="outline-preview-tabs" role="tablist" aria-label="解读结果类型">
              <button class="outline-preview-tab active" type="button" role="tab" data-preview-tab="overview" aria-selected="true"><i class="outline-required-mark" aria-hidden="true">*</i>项目概述</button>
              <button class="outline-preview-tab" type="button" role="tab" data-preview-tab="score" aria-selected="false"><i class="outline-required-mark" aria-hidden="true">*</i>评分项</button>
              <button class="outline-preview-tab" type="button" role="tab" data-preview-tab="response" aria-selected="false"><i class="outline-required-mark" aria-hidden="true">*</i>技术点对点应答</button>
            </div>
            <div class="outline-preview-panels">
              <section class="outline-preview-panel active" role="tabpanel" data-preview-panel="overview">
                <div class="outline-preview-content">
                  ${renderOutlineOverviewContent() || `
                  <p>项目概述：本项目范围为采购某高校高性能计算GPU集群建设项目，主要工作内容为采购人搭建供应链金融服务 SAAS 平台，提供在线开立应付账款电子债权凭证、凭证多级流转、凭证保理融资及保理资产证券化等服务。</p>
                  <p>资金落实情况 / 项目预算 / 分项预算：服务费率最高不超过年化 0.2%（融资额 × 服务费率）。</p>
                  <p>投标人责任 / 质量 / 进度 / 技术标准：平台开发商需编制明确的里程碑计划和工作计划，明确项目范围、进度、质量标准及调研安排，并提供完整的实施方法、阶段成果和保障措施。</p>
                  `}
                </div>
                <textarea class="outline-paste-input" data-paste-field="overview" aria-label="填写项目概述" placeholder="请输入项目概述"></textarea>
              </section>
              <section class="outline-preview-panel" role="tabpanel" data-preview-panel="score" hidden>
                <div class="outline-preview-content">
                  ${renderOutlineScoreContent() || `
                  <p>技术方案应完整覆盖总体架构、业务能力、系统集成、数据治理、安全体系和运维保障，方案应具有针对性与可实施性。</p>
                  <p>项目实施方案需明确项目组织、里程碑计划、质量控制、风险管理、上线试运行和培训安排。</p>
                  <p>供应商应提供同类供应链金融平台建设经验、专业实施团队及持续服务能力，并对关键技术指标作出明确响应。</p>
                  `}
                </div>
                <textarea class="outline-paste-input" data-paste-field="score" aria-label="填写评分项" placeholder="请输入评分项"></textarea>
              </section>
              <section class="outline-preview-panel" role="tabpanel" data-preview-panel="response" hidden>
                <div class="outline-preview-content">
                  ${typeof window.TechnicalResponseRequirements?.render === 'function' ? window.TechnicalResponseRequirements.render() : `
                  <div class="outline-response-item"><strong>平台总体架构</strong><span>采用微服务与容器化架构，明确业务层、服务层、数据层和基础设施层的职责及相互关系。</span></div>
                  <div class="outline-response-item"><strong>核心业务能力</strong><span>逐项响应电子债权凭证开立、多级流转、保理融资、资产证券化及全流程状态管理要求。</span></div>
                  <div class="outline-response-item"><strong>安全与合规</strong><span>围绕身份认证、权限控制、数据加密、操作审计、容灾备份及国产化适配给出实施方案。</span></div>
                  <div class="outline-response-item"><strong>实施与服务</strong><span>提供项目组织、里程碑计划、质量管理、风险控制、培训交付和持续运维保障措施。</span></div>
                  `}
                </div>
                <textarea class="outline-paste-input" data-paste-field="response" aria-label="填写技术点对点应答" placeholder="请输入技术点对点应答"></textarea>
              </section>
            </div>
          </section>

          <section class="outline-requirements-section">
            <label for="outlineExtraRequirements">其他生成要求</label>
            <div class="outline-requirements-input">
              <textarea id="outlineExtraRequirements" maxlength="300" placeholder="例如：重点展现供应链金融服务方案、风控体系与项目实施计划…"></textarea>
              <span><b>0</b>/300</span>
            </div>
          </section>
        </div>

        <footer class="outline-modal-footer">
          <button class="outline-cancel-button" type="button">取消</button>
          <button class="outline-save-button" type="button">立即生成大纲</button>
        </footer>
      </section>`;

    document.body.append(backdrop);
    bindModalEvents(backdrop);
    return backdrop;
  }

  function bindModalEvents(backdrop) {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('.outline-close-button, .outline-cancel-button')) closeModal();
    });

    backdrop.querySelector('.outline-expand-button').addEventListener('click', () => {
      backdrop.querySelector('.outline-generation-modal').classList.toggle('is-expanded');
    });

    backdrop.querySelectorAll('.outline-source-tab').forEach((button) => {
      button.addEventListener('click', () => switchSourceMode(backdrop, button.dataset.mode));
    });

    backdrop.querySelector('.outline-interpretation-select').addEventListener('change', () => {
      syncInterpretationSource(backdrop);
    });

    backdrop.querySelectorAll('.outline-preview-tab').forEach((button) => {
      button.addEventListener('click', () => switchPreviewTab(backdrop, button.dataset.previewTab));
    });

    const range = backdrop.querySelector('.outline-page-range');
    const number = backdrop.querySelector('.outline-page-input');
    range.addEventListener('input', () => setPageCount(backdrop, range.value));
    number.addEventListener('input', () => setPageCount(backdrop, number.value));
    number.addEventListener('blur', () => setPageCount(backdrop, number.value || 1));

    backdrop.querySelector('.outline-level-minus').addEventListener('click', () => changeLevel(backdrop, -1));
    backdrop.querySelector('.outline-level-plus').addEventListener('click', () => changeLevel(backdrop, 1));

    const requirements = backdrop.querySelector('#outlineExtraRequirements');
    requirements.addEventListener('input', () => {
      backdrop.querySelector('.outline-requirements-input span b').textContent = requirements.value.length;
    });

    backdrop.querySelector('.outline-save-button').addEventListener('click', () => submitOutline(backdrop));
  }

  function refreshInterpretationOptions(backdrop) {
    const select = backdrop.querySelector('.outline-interpretation-select');
    const files = getGeneratedInterpretationFiles();
    const previousValue = select.value;
    const selectedValue = files.includes(previousValue)
      ? previousValue
      : files.find((fileName) => fileName.startsWith('技术要求解读_')) || files[0] || '';
    select.innerHTML = `<option value="">请选择招标解读文件</option>${buildInterpretationOptions(selectedValue)}`;
    select.value = selectedValue;
    syncInterpretationSource(backdrop);
  }

  function syncInterpretationSource(backdrop) {
    const select = backdrop.querySelector('.outline-interpretation-select');
    const responsePanel = backdrop.querySelector('[data-preview-panel="response"]');
    const responseInput = responsePanel.querySelector('[data-paste-field="response"]');
    const isReviewSource = isReviewInterpretation(select.value);
    backdrop.querySelector('.outline-interpretation-section').classList.toggle('outline-review-source-active', isReviewSource);
    responsePanel.dataset.sourceKind = isReviewSource ? 'review' : 'technical';
    responseInput.required = isReviewSource;
    responseInput.setAttribute('aria-required', String(isReviewSource));
    responseInput.setAttribute('aria-label', isReviewSource ? '技术点对点应答（必填）' : '填写技术点对点应答');
    responseInput.placeholder = isReviewSource ? '请输入技术点对点应答（必填）' : '请输入技术点对点应答';
  }

  function switchSourceMode(backdrop, mode) {
    backdrop.querySelectorAll('.outline-source-tab').forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    backdrop.querySelector('.file-mode').hidden = mode !== 'file';
    backdrop.querySelector('.outline-interpretation-section').classList.toggle('paste-mode-active', mode === 'paste');
  }

  function switchPreviewTab(backdrop, tab) {
    backdrop.querySelectorAll('.outline-preview-tab').forEach((button) => {
      const active = button.dataset.previewTab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    backdrop.querySelectorAll('.outline-preview-panel').forEach((panel) => {
      const active = panel.dataset.previewPanel === tab;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  function setPageCount(backdrop, rawValue) {
    const value = Math.min(2000, Math.max(1, Number(rawValue) || 1));
    backdrop.querySelector('.outline-page-range').value = value;
    backdrop.querySelector('.outline-page-input').value = value;
    backdrop.querySelector('.outline-page-summary').textContent = value.toLocaleString('zh-CN');
    backdrop.querySelector('.outline-word-summary').textContent = (value * 60).toLocaleString('zh-CN');
    backdrop.querySelector('.outline-range-wrap').style.setProperty('--outline-range-progress', `${((value - 1) / 1999) * 100}%`);
  }

  function changeLevel(backdrop, delta) {
    const output = backdrop.querySelector('.outline-level-output');
    output.value = Math.min(7, Math.max(3, Number(output.value) + delta));
    output.textContent = output.value;
  }

  function openModal() {
    const backdrop = createModal();
    refreshInterpretationOptions(backdrop);
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    document.body.classList.add('outline-modal-open');
    requestAnimationFrame(() => backdrop.querySelector('.outline-close-button').focus());
  }

  function closeModal() {
    const backdrop = document.querySelector('.outline-modal-backdrop');
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    backdrop.querySelector('.outline-generation-modal').classList.remove('is-expanded');
    document.body.classList.remove('outline-modal-open');
    lastFocused?.focus?.();
  }

  function submitOutline(backdrop) {
    const fileMode = backdrop.querySelector('.outline-source-tab.active')?.dataset.mode === 'file';
    const interpretationSelect = backdrop.querySelector('.outline-interpretation-select');
    const interpretationFile = interpretationSelect.value;
    const reviewSource = fileMode && isReviewInterpretation(interpretationFile);
    const responseInput = backdrop.querySelector('[data-paste-field="response"]');
    if (fileMode && !interpretationFile) {
      showOutlineToast(`请选择${INTERPRETATION_LABEL}文件`);
      return;
    }
    if (reviewSource && !responseInput.value.trim()) {
      switchPreviewTab(backdrop, 'response');
      responseInput.focus();
      showOutlineToast('请填写技术点对点应答（必填）');
      return;
    }
    const pasteFields = Array.from(backdrop.querySelectorAll('[data-paste-field]'));
    if (!fileMode) {
      const emptyField = pasteFields.find((field) => !field.value.trim());
      if (emptyField) {
        switchPreviewTab(backdrop, emptyField.dataset.pasteField);
        emptyField.focus();
        showOutlineToast('请完整填写项目概述、评分项和技术点对点应答');
        return;
      }
    }

    const detail = {
      fileName: getSourceFileName(),
      pages: Number(backdrop.querySelector('.outline-page-input').value),
      level: Number(backdrop.querySelector('.outline-level-output').value),
      sourceMode: fileMode ? 'file' : 'paste',
      interpretationFile,
      interpretationSourceType: reviewSource ? 'review' : 'technical',
      pastedInterpretation: Object.fromEntries(pasteFields.map((field) => [field.dataset.pasteField, field.value.trim()])),
      requirements: backdrop.querySelector('#outlineExtraRequirements').value.trim()
    };
    closeModal();
    window.dispatchEvent(new CustomEvent('tender:outline-generated', { detail }));
    showOutlineToast('技术标投标大纲任务已创建');

    window.setTimeout(() => {
      const scroll = document.querySelector('#result-panel .result-scroll');
      const heading = document.querySelector('#result-panel .record-heading');
      if (scroll && heading) scroll.scrollTo({ top: Math.max(0, heading.offsetTop - 16), behavior: 'smooth' });
    }, 80);
  }

  function showOutlineToast(message) {
    let toast = document.querySelector('.outline-modal-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'outline-modal-toast';
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(showOutlineToast.timer);
    showOutlineToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 1800);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#result-panel .tool-grid button');
    if (!button) return;
    const label = button.textContent.replace(/\s+/g, '');
    if (!label.includes('02') || !label.includes('生成大纲')) return;
    openModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();
