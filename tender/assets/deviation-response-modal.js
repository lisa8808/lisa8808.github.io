(() => {
  const app = document.getElementById('app');
  const api = window.__TENDER_DEVIATION_RESPONSE_CONFIG__;
  if (!app || !api) return;

  const mode = document.body.classList.contains('business-mode-page') ? 'business' : 'technical';
  const modeConfig = api.getModeConfig(mode);
  let activeModal = null;
  let syncQueued = false;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const getSourceFileName = () => {
    const row = document.querySelector(
      '#app .upload-panel .upload-group .file-row[aria-pressed="true"], #app .upload-panel .upload-group .file-row',
    );
    return row?.querySelector('.ellipsis')?.textContent?.trim()
      || row?.textContent?.trim()
      || '某高校高性能计算GPU集群建设项目.docx';
  };

  const getResultList = (panel) => {
    const existing = panel.querySelector('.result-list');
    if (existing) return existing;
    const list = document.createElement('div');
    list.className = 'result-list';
    panel.querySelector('.record-heading')?.after(list);
    return list;
  };

  const showToast = (modal, message) => {
    const toast = modal.querySelector('[data-deviation-toast]');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toast.__timer);
    toast.__timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const buildRows = (module) => module.rows.map((row) => `
    <tr data-deviation-row data-confirmed="${row.confirmed}" data-risk="${Boolean(row.risk)}" data-important="${row.important}">
      <td class="deviation-response-index">${escapeHtml(row.id)}</td>
      <td>${row.important ? '<span class="deviation-response-star">★</span>' : ''}${escapeHtml(row.requirement)}</td>
      <td><textarea class="deviation-response-editor" aria-label="${escapeHtml(row.id)} 响应内容">${escapeHtml(row.response)}</textarea></td>
      <td>
        <select class="deviation-response-select" aria-label="${escapeHtml(row.id)} 偏离情况">
          ${['完全响应', '无偏离', '正偏离', '负偏离'].map((option) => `<option${option === row.deviation ? ' selected' : ''}>${option}</option>`).join('')}
        </select>
      </td>
      <td><span class="deviation-response-tag">${escapeHtml(row.category)}</span></td>
      <td><button class="deviation-response-confirm${row.confirmed ? ' confirmed' : ''}" type="button" data-row-confirm>${row.confirmed ? '已确认' : '确认'}</button></td>
    </tr>
  `).join('');

  const buildRisks = (module) => {
    const risks = module.rows.filter((row) => row.risk);
    if (!risks.length) return '<div class="deviation-response-risk-empty">当前模块暂未发现风险项</div>';
    return risks.map((row) => `
      <article class="deviation-response-risk-card" data-risk-card="${escapeHtml(row.id)}">
        <strong>${escapeHtml(row.id)} · 风险项</strong>
        <p>${escapeHtml(row.risk)}</p>
      </article>
    `).join('');
  };

  const modalTemplate = (sourceName) => {
    const firstModule = modeConfig.modules[0];
    const total = firstModule.rows.length;
    const confirmed = firstModule.rows.filter((row) => row.confirmed).length;
    const risks = firstModule.rows.filter((row) => row.risk).length;
    return `
      <section class="deviation-response-dialog" role="dialog" aria-modal="true" aria-labelledby="deviation-response-title">
        <header class="deviation-response-header">
          <div class="deviation-response-title">
            <span class="deviation-response-title-icon" aria-hidden="true">≋</span>
            <div><h2 id="deviation-response-title">${escapeHtml(modeConfig.actionLabel)}</h2><p title="${escapeHtml(sourceName)}">招标文件：${escapeHtml(sourceName)}</p></div>
          </div>
          <div class="deviation-response-header-actions">
            <button class="deviation-response-secondary" type="button" data-deviation-save>保存草稿</button>
            <button class="deviation-response-primary" type="button" data-deviation-export-top>导出响应文件</button>
            <button class="deviation-response-close" type="button" aria-label="关闭" data-deviation-close>×</button>
          </div>
        </header>
        <div class="deviation-response-summary">
          <div class="deviation-response-detection">
            <span class="deviation-response-pill" data-detection-pill>制式表格填写</span>
            <b data-current-table>${escapeHtml(firstModule.name)}</b>
            <span data-detection-copy>已保留原表名称、字段顺序和偏离选项</span>
          </div>
          <div class="deviation-response-summary-note"><span>${escapeHtml(modeConfig.focusText)}</span><strong><span data-risk-count>${risks}</span> 个风险项</strong></div>
        </div>
        <div class="deviation-response-layout">
          <aside class="deviation-response-sidebar">
            <h3>识别结果</h3>
            ${modeConfig.modules.map((module, index) => `
              <button class="deviation-response-module${index === 0 ? ' active' : ''}" type="button" data-module-index="${index}">
                <span>${escapeHtml(module.name)}</span><small>${module.count}</small>
              </button>
            `).join('')}
            <div class="deviation-response-rule">普通条款可批量确认；★条款、实质性条款、具体参数及负偏离条款必须逐条确认。</div>
          </aside>
          <main class="deviation-response-main" data-deviation-main>
            <div class="deviation-response-toolbar">
              <div class="deviation-response-filter" role="group" aria-label="条款筛选">
                <button class="active" type="button" data-filter="all">全部条款</button>
                <button type="button" data-filter="risk">风险项</button>
                <button type="button" data-filter="unconfirmed">待确认</button>
              </div>
              <div class="deviation-response-tools">
                <input class="deviation-response-search" type="search" placeholder="搜索条款或响应内容" aria-label="搜索条款或响应内容" data-deviation-search />
                <button class="deviation-response-secondary" type="button" data-batch-confirm>普通条款批量确认</button>
              </div>
            </div>
            <div class="deviation-response-requirement-note">招标文件未提供固定偏离/响应表，以下内容根据正文要求整理，不虚构制式表格。</div>
            <div class="deviation-response-table-wrap">
              <table class="deviation-response-table">
                <thead><tr><th class="col-index">编号</th><th class="col-requirement">招标要求</th><th class="col-response">响应内容</th><th class="col-deviation">偏离/符合</th><th class="col-category">条款属性</th><th class="col-confirm">确认状态</th></tr></thead>
                <tbody data-deviation-body>${buildRows(firstModule)}</tbody>
              </table>
              <div class="deviation-response-empty" data-deviation-empty hidden>没有匹配的条款</div>
            </div>
          </main>
          <aside class="deviation-response-risk">
            <h3>检查结果</h3>
            <div class="deviation-response-risk-summary">
              <div class="deviation-response-risk-stat"><b data-total-count>${total}</b><span>全部条款</span></div>
              <div class="deviation-response-risk-stat"><b data-confirmed-count>${confirmed}</b><span>已确认</span></div>
            </div>
            <div data-risk-list>${buildRisks(firstModule)}</div>
          </aside>
        </div>
        <footer class="deviation-response-footer">
          <div class="deviation-response-progress">已确认 <b data-footer-confirmed>${confirmed}</b> / <span data-footer-total>${total}</span>；重点条款需逐条确认，页码无需在此填写。</div>
          <div class="deviation-response-footer-actions">
            <button class="deviation-response-secondary" type="button" data-deviation-close>取消</button>
            <button class="deviation-response-primary" type="button" data-deviation-export>导出响应文件</button>
          </div>
        </footer>
        <div class="deviation-response-toast" role="status" data-deviation-toast></div>
      </section>
    `;
  };

  const updateCounters = (modal) => {
    const visibleRows = Array.from(modal.querySelectorAll('[data-deviation-row]'));
    const confirmedRows = visibleRows.filter((row) => row.dataset.confirmed === 'true');
    const riskRows = visibleRows.filter((row) => row.dataset.risk === 'true');
    modal.querySelector('[data-total-count]').textContent = String(visibleRows.length);
    modal.querySelector('[data-confirmed-count]').textContent = String(confirmedRows.length);
    modal.querySelector('[data-footer-confirmed]').textContent = String(confirmedRows.length);
    modal.querySelector('[data-footer-total]').textContent = String(visibleRows.length);
    modal.querySelector('[data-risk-count]').textContent = String(riskRows.length);
  };

  const applyFilter = (modal) => {
    const filter = modal.querySelector('[data-filter].active')?.dataset.filter || 'all';
    const keyword = modal.querySelector('[data-deviation-search]')?.value.trim().toLowerCase() || '';
    let matched = 0;
    modal.querySelectorAll('[data-deviation-row]').forEach((row) => {
      const matchesFilter = filter === 'all'
        || (filter === 'risk' && row.dataset.risk === 'true')
        || (filter === 'unconfirmed' && row.dataset.confirmed !== 'true');
      const matchesKeyword = !keyword || row.textContent.toLowerCase().includes(keyword);
      row.hidden = !(matchesFilter && matchesKeyword);
      if (!row.hidden) matched += 1;
    });
    modal.querySelector('[data-deviation-empty]').hidden = matched !== 0;
  };

  const renderModule = (modal, index) => {
    const module = modeConfig.modules[index] || modeConfig.modules[0];
    modal.querySelectorAll('[data-module-index]').forEach((button) => button.classList.toggle('active', Number(button.dataset.moduleIndex) === index));
    modal.querySelector('[data-current-table]').textContent = module.name;
    modal.querySelector('[data-deviation-body]').innerHTML = buildRows(module);
    modal.querySelector('[data-risk-list]').innerHTML = buildRisks(module);
    const requirementsMode = module.kind === 'requirements';
    modal.querySelector('[data-deviation-main]').classList.toggle('requirements-mode', requirementsMode);
    modal.querySelector('[data-detection-pill]').textContent = requirementsMode ? '响应要求编写' : '制式表格填写';
    modal.querySelector('[data-detection-copy]').textContent = requirementsMode
      ? '已从正文提取响应要求，未虚构制式表格'
      : '已保留原表名称、字段顺序和偏离选项';
    modal.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
    modal.querySelector('[data-deviation-search]').value = '';
    updateCounters(modal);
    applyFilter(modal);
  };

  const closeDeviationModal = () => {
    if (!activeModal) return;
    const previousFocus = activeModal.__previousFocus;
    activeModal.remove();
    activeModal = null;
    document.documentElement.classList.remove('deviation-response-open');
    document.body.classList.remove('deviation-response-open');
    previousFocus?.focus?.({ preventScroll: true });
  };

  function openDeviationModal(trigger) {
    closeDeviationModal();
    const modal = document.createElement('div');
    modal.className = 'deviation-response-modal';
    modal.dataset.deviationResponseModal = mode;
    modal.innerHTML = modalTemplate(getSourceFileName());
    modal.__previousFocus = trigger || document.activeElement;
    activeModal = modal;
    document.documentElement.classList.add('deviation-response-open');
    document.body.classList.add('deviation-response-open');
    document.body.append(modal);

    modal.querySelectorAll('[data-deviation-close]').forEach((button) => button.addEventListener('click', closeDeviationModal));
    modal.querySelectorAll('[data-module-index]').forEach((button) => button.addEventListener('click', () => renderModule(modal, Number(button.dataset.moduleIndex))));
    modal.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
      modal.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
      applyFilter(modal);
    }));
    modal.querySelector('[data-deviation-search]').addEventListener('input', () => applyFilter(modal));
    modal.querySelector('[data-deviation-body]').addEventListener('click', (event) => {
      const button = event.target.closest('[data-row-confirm]');
      if (!button) return;
      const row = button.closest('[data-deviation-row]');
      const confirmed = row.dataset.confirmed !== 'true';
      row.dataset.confirmed = String(confirmed);
      button.classList.toggle('confirmed', confirmed);
      button.textContent = confirmed ? '已确认' : '确认';
      updateCounters(modal);
      applyFilter(modal);
    });
    modal.querySelector('[data-batch-confirm]').addEventListener('click', () => {
      let count = 0;
      modal.querySelectorAll('[data-deviation-row]').forEach((row) => {
        if (row.dataset.important === 'true') return;
        row.dataset.confirmed = 'true';
        const button = row.querySelector('[data-row-confirm]');
        button.classList.add('confirmed');
        button.textContent = '已确认';
        count += 1;
      });
      updateCounters(modal);
      applyFilter(modal);
      showToast(modal, `已批量确认 ${count} 条普通条款`);
    });
    modal.querySelectorAll('[data-deviation-save]').forEach((button) => button.addEventListener('click', () => showToast(modal, '草稿已保存')));
    modal.querySelectorAll('[data-deviation-export], [data-deviation-export-top]').forEach((button) => button.addEventListener('click', () => {
      const unconfirmedImportant = modal.querySelectorAll('[data-deviation-row][data-important="true"][data-confirmed="false"]').length;
      showToast(modal, unconfirmedImportant ? `仍有 ${unconfirmedImportant} 条重点条款待确认，已生成预览文件` : '响应文件已生成');
    }));
    modal.addEventListener('click', (event) => { if (event.target === modal) closeDeviationModal(); });
    modal.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDeviationModal(); });
    modal.querySelector('[data-deviation-close]')?.focus({ preventScroll: true });
  }

  const ensureAction = (panel) => {
    if (panel.querySelector('.deviation-response-action')) return;
    const quickMode = panel.querySelector('.quick-mode');
    if (!quickMode) return;
    const button = document.createElement('button');
    button.className = 'deviation-response-action';
    button.type = 'button';
    button.innerHTML = `<span><i aria-hidden="true">≋</i>${escapeHtml(modeConfig.actionLabel)}</span>`;
    button.addEventListener('click', () => openDeviationModal(button));
    quickMode.append(button);
  };

  const ensureRecord = (panel) => {
    if (panel.querySelector('.deviation-response-record')) return;
    const title = api.createRecordTitle(mode, getSourceFileName());
    const row = document.createElement('div');
    row.className = 'record-row deviation-response-record';
    row.innerHTML = `
      <button class="record-main" type="button" aria-label="查看${modeConfig.actionLabel}结果">
        <span class="record-icon deviation"><img src="./assets/figma/record-tech.svg" alt="" /></span>
        <span class="record-copy"><strong title="${escapeHtml(title)}">${escapeHtml(title)}</strong><small>已生成 · 点击查看和确认</small></span>
      </button>
      <button class="more-button" type="button" aria-label="更多操作"><img src="./assets/figma/more.svg" alt="" /></button>
    `;
    row.querySelector('.record-main').addEventListener('click', () => openDeviationModal(row));
    getResultList(panel).append(row);
    panel.querySelector('.result-empty')?.remove();
  };

  const sync = () => {
    syncQueued = false;
    const panel = document.getElementById('result-panel');
    if (!panel) return;
    ensureAction(panel);
    ensureRecord(panel);
  };

  const scheduleSync = () => {
    if (syncQueued) return;
    syncQueued = true;
    window.requestAnimationFrame(sync);
  };

  scheduleSync();
  new MutationObserver(scheduleSync).observe(app, { childList: true, subtree: true });
})();
