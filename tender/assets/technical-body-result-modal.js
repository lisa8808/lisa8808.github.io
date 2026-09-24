(() => {
  const PREFIX = '技术正文_';
  const ICON = './assets/figma/';
  const fileContent = typeof window !== 'undefined' ? window.technicalFileContent : null;
  const fallbackDirectory = [
    [0, '第一章', '项目开发技术方案'], [1, '1.1', '整体技术方案设计'], [2, '1.1.1', '平台整体架构'],
    [3, '1.1.1.1', '模块功能划分'], [3, '1.1.1.2', '技术选型依据'], [2, '1.1.2', '技术方案的可行性分析'],
  ].map(([level, code, label]) => ({ id: code, level, code, label }));
  const directory = fileContent?.directory?.length ? fileContent.directory : fallbackDirectory;
  const contentById = new Map();
  const defaultDirectoryItem = directory.find((item) => item.code === '1.1.1') || directory[0] || null;
  const fallbackContentNode = {
    id: defaultDirectoryItem?.id || '1.1.1',
    code: defaultDirectoryItem?.code || '1.1.1',
    title: defaultDirectoryItem?.label || '平台整体架构',
    blocks: [{ kind: 'paragraph', text: '正文数据未加载。' }],
    children: [],
  };
  let activeModal = null;

  function registerContent(node) {
    contentById.set(node.id, node);
    (node.children || []).forEach(registerContent);
  }
  (fileContent?.tree || []).forEach(registerContent);
  const defaultContentNode = contentById.get(defaultDirectoryItem?.id) || fallbackContentNode;
  const totalChapterCount = directory.length || 86;
  const totalPageEstimate = 55;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character]));
  }

  function renderTable(rows) {
    if (!Array.isArray(rows) || !rows.length) return '';
    return `<div class="technical-body-editable-table-wrap"><table class="technical-body-editable-table"><tbody>${rows.map((row, rowIndex) => `<tr>${row.map((cell) => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      return `<${tag}>${escapeHtml(cell).replace(/\n/g, '<br>')}</${tag}>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function renderContentBlocks(blocks) {
    if (!blocks?.length) return '<p>本章节暂无正文内容。</p>';
    return blocks.map((block) => {
      if (block.kind === 'table') return renderTable(block.rows);
      return `<p>${escapeHtml(block.text)}</p>`;
    }).join('');
  }

  function renderSectionActions() {
    return `<div class="technical-body-section-actions"><button data-action="撤销">${icon('detail-undo')}撤销</button><button data-action="恢复">${icon('detail-redo')}恢复</button><button data-action="自定义编辑">${icon('detail-custom')}自定义编辑</button><button data-action="插入表格">${icon('detail-table')}插入表格</button><button data-action="插入图片">${icon('detail-image')}插入图片</button></div>`;
  }

  function renderEditorSection(node) {
    return `<article class="technical-body-editor-section" data-editor-section data-section-id="${escapeHtml(node.id)}">
      <header><strong>${escapeHtml(node.code)} ${escapeHtml(node.title)}</strong>${renderSectionActions()}</header>
      <div class="technical-body-editable" contenteditable="true">${renderContentBlocks(node.blocks)}</div>
    </article>`;
  }

  function renderEditorSections(node) {
    if (!node) return '';
    const sections = [];
    const visit = (current) => {
      if (current.blocks?.length) sections.push(renderEditorSection(current));
      (current.children || []).forEach(visit);
    };
    visit(node);
    return sections.join('') || renderEditorSection(node);
  }

  const icon = (name, alt = '') => `<img src="${ICON}${name}.svg" alt="${alt}">`;
  const renderOutlineActions = () => `<div class="outline-actions" role="toolbar" aria-label="章节操作">
    <button class="outline-action outline-action-preview" type="button" data-outline-action="查看正文" data-tooltip="查看正文" title="查看正文" aria-label="查看正文"><span class="outline-action-glyph outline-preview-glyph" aria-hidden="true"></span></button>
    <button class="outline-action outline-action-settings" type="button" data-outline-action="章节设置" data-tooltip="章节设置" title="章节设置" aria-label="章节设置"><span class="outline-action-glyph outline-settings-glyph" aria-hidden="true">⚙</span></button>
    <button class="outline-action outline-action-add" type="button" data-outline-action="新增子章节" data-tooltip="新增子章节" title="新增子章节" aria-label="新增子章节">${icon('detail-edit')}</button>
    <button class="outline-action outline-action-write" type="button" data-outline-action="一键编写" data-tooltip="一键编写" title="一键编写" aria-label="一键编写">${icon('detail-magic')}</button>
    <button class="outline-action outline-action-delete" type="button" data-outline-action="删除章节" data-tooltip="删除章节" title="删除章节" aria-label="删除章节"><span class="outline-action-glyph outline-delete-glyph" aria-hidden="true">×</span></button>
  </div>`;
  const renderDirectory = () => directory.map(({ id, level, code, label }) => `
    <button type="button" class="technical-body-dir-node level-${level}${id === defaultDirectoryItem?.id ? ' is-active' : ''}" data-directory-node data-node-id="${escapeHtml(id)}" data-code="${escapeHtml(code)}" data-label="${escapeHtml(label)}">
      ${level < 2 ? '<span class="technical-body-dir-arrow">⌄</span>' : '<span class="technical-body-dir-indent"></span>'}
      <span class="technical-body-dir-code">${escapeHtml(code)}</span><span class="technical-body-dir-label">${escapeHtml(label)}</span>
    </button>`).join('');
  function countOutlineNodes(node) {
    return 1 + (node.children || []).reduce((total, child) => total + countOutlineNodes(child), 0);
  }

  function flattenOutlineNodes(nodes) {
    return (nodes || []).flatMap((node) => [node, ...flattenOutlineNodes(node.children)]);
  }

  function renderOutlineSettings() {
    if (!fileContent?.tree?.length) return '';
    return fileContent.tree.map((root) => `
      <article class="outline-chapter${root.children?.length ? '' : ' compact'}">
        <header>
          <button type="button" data-outline-collapse aria-label="收起${escapeHtml(root.title)}">⌄</button>
          <strong>${escapeHtml(root.code)} ${escapeHtml(root.title)}</strong>
          <span>${countOutlineNodes(root)} 项</span>
          ${renderOutlineActions()}
        </header>
        ${root.children?.length ? root.children.map((child) => `
          <section class="outline-section">
            <h3>${escapeHtml(child.code)} ${escapeHtml(child.title)}<span>${countOutlineNodes(child)} 项</span></h3>
            ${flattenOutlineNodes(child.children).map((node) => `<div class="outline-settings-row outline-settings-level-${node.level}"><strong>${escapeHtml(node.code)} ${escapeHtml(node.title)}</strong></div>`).join('')}
          </section>`).join('') : (root.code === '4' ? '' : '<div class="outline-settings-empty">该章节为制式内容，无下级目录。</div>')}
      </article>`).join('');
  }

  function toast(message) {
    const node = activeModal?.querySelector('[data-body-result-toast]');
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    clearTimeout(node.__timer);
    node.__timer = setTimeout(() => { node.hidden = true; }, 1600);
  }

  function closeModal() {
    if (!activeModal) return;
    const focusTarget = activeModal.__previousFocus;
    activeModal.remove();
    activeModal = null;
    document.documentElement.classList.remove('technical-body-result-open');
    document.body.classList.remove('technical-body-result-open');
    focusTarget?.focus?.({ preventScroll: true });
  }

  function showPageToast(message) {
    document.querySelector('[data-technical-body-task-toast]')?.remove();
    const node = document.createElement('div');
    node.className = 'technical-body-task-toast';
    node.dataset.technicalBodyTaskToast = 'true';
    node.textContent = message;
    document.body.append(node);
    setTimeout(() => node.remove(), 5200);
  }

  function addProcessingRecord(title) {
    const list = document.querySelector('#result-panel .result-list');
    if (!list) return;
    const steps = ['解析大纲文件', '创建章节编写任务', '生成章节正文', '校验正文结构', '生成结果文件'];
    const row = document.createElement('div');
    row.className = 'processing-row technical-body-processing';
    row.dataset.technicalBodyTask = `${title}-${Date.now()}`;
    row.innerHTML = `
      <img class="processing-icon" src="./assets/figma/record-refresh.svg" alt="">
      <span class="processing-copy">
        <strong title="${title}">${title}</strong>
        <span class="progress-trigger" tabindex="0">
          <small>正在处理中（1/5）</small>
          <span class="progress-popover">
            <span class="progress-popover-title"><b>处理进度</b><strong>1/5</strong></span>
            ${steps.map((step, index) => `<span class="progress-step ${index === 0 ? 'active' : 'pending'}"><i></i>${step}</span>`).join('')}
          </span>
        </span>
      </span>
      <button class="more-button" type="button" aria-label="任务更多操作"><img src="./assets/figma/more.svg" alt=""></button>`;
    list.prepend(row);
  }

  function startFullGeneration(title) {
    closeModal();
    const baseTitle = title.replace(/_\d{12}$/, '');
    const minute = window.TechnicalResultNaming?.formatMinute?.() || new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '');
    addProcessingRecord(`${baseTitle}_${minute}`);
    showPageToast('为缩短等待时长，本次将优先生成技术标前三章。内容生成完毕后，您可预览文稿，按需生成完整文档。');
  }

  function closeBodyDialog(modal) {
    modal?.querySelector('[data-body-dialog]')?.remove();
  }

  function preciseSegmentRow(label) {
    return `<div class="technical-body-precise-segment"><input type="text" value="${label}" data-precise-segment><button type="button" data-remove-segment aria-label="删除段落"><img src="${ICON}project-delete.svg" alt=""></button></div>`;
  }

  function openPreciseDialog(modal) {
    closeBodyDialog(modal);
    const backdrop = document.createElement('div');
    backdrop.className = 'technical-body-dialog-backdrop';
    backdrop.dataset.bodyDialog = 'precise';
    backdrop.innerHTML = `
      <section class="technical-body-dialog technical-body-precise-dialog" role="dialog" aria-modal="true" aria-labelledby="technical-body-precise-title">
        <header class="technical-body-dialog-header">
          <h2 id="technical-body-precise-title">精准编写</h2>
          <button type="button" class="technical-body-dialog-close" data-body-dialog-close aria-label="关闭">×</button>
        </header>
        <div class="technical-body-dialog-scroll">
          <div class="technical-body-dialog-field">
            <label for="technical-precise-title"><i>*</i>标题</label>
            <div class="technical-body-dialog-input-wrap"><input id="technical-precise-title" type="text" maxlength="100" value="项目理解与需求分析" data-precise-title><span data-precise-title-count>9 / 100</span></div>
          </div>
          <div class="technical-body-dialog-field technical-body-paragraph-field">
            <label for="technical-precise-paragraphs"><i>*</i>章节篇幅设置（段数即下级章节节点）</label>
            <div class="technical-body-number-line"><input id="technical-precise-paragraphs" type="number" min="1" max="10" value="4" data-precise-paragraphs><span>段数</span></div>
            <div class="technical-body-range-wrap"><input type="range" min="0" max="2000" step="400" value="400" data-precise-range aria-label="章节篇幅"><div class="technical-body-range-labels"><span>0</span><span>400</span><span>800</span><span>1200</span><span>1600</span><span>2000</span></div></div>
          </div>
          <div class="technical-body-dialog-field">
            <label for="technical-precise-direction"><i>*</i>章节方向</label>
            <textarea id="technical-precise-direction" data-precise-direction>请在不改变章节主题和层级的前提下，结合招标要求补充可执行的技术细节。</textarea>
          </div>
          <div class="technical-body-precise-segment-head"><button type="button" data-cycle-direction>换一换</button><span>本次将重建当前章节的全部下级章节，以下每个段落标题都会成为一个直接子章节（最多 10 个）</span></div>
          <div class="technical-body-precise-segments" data-precise-segments>${['现状与目标', '技术方案', '实施保障', '预期成效'].map(preciseSegmentRow).join('')}</div>
          <button type="button" class="technical-body-precise-add" data-add-segment><b>＋</b>新增段落</button>
          <div class="technical-body-writing-reference"><strong>撰写参考：您已勾选 1 个标书撰写参考文件，将作为撰写参考</strong><span>• 技术规范书-标段2.docx</span></div>
        </div>
        <footer class="technical-body-dialog-footer"><button type="button" class="technical-body-dialog-secondary" data-body-dialog-close>取消</button><button type="button" class="technical-body-dialog-primary" data-precise-confirm>确认</button></footer>
      </section>`;
    modal.append(backdrop);
    const close = () => backdrop.remove();
    const titleInput = backdrop.querySelector('[data-precise-title]');
    const directionInput = backdrop.querySelector('[data-precise-direction]');
    const confirm = backdrop.querySelector('[data-precise-confirm]');
    const updateFormState = () => {
      backdrop.querySelector('[data-precise-title-count]').textContent = `${titleInput.value.length} / 100`;
      confirm.disabled = !titleInput.value.trim() || !directionInput.value.trim();
    };
    titleInput.addEventListener('input', updateFormState);
    directionInput.addEventListener('input', updateFormState);
    backdrop.querySelector('[data-cycle-direction]').addEventListener('click', () => {
      const directions = [
        '请结合招标文件中的评分要求，补充本章节的实施路径、关键技术措施和可验收成果。',
        '请围绕项目目标和技术指标，细化本章节的方案逻辑、落地步骤与风险控制要求。',
        '请在保持当前章节层级不变的前提下，补充与项目场景匹配的技术细节和交付标准。',
      ];
      const next = directions[(Number(directionInput.dataset.directionIndex || 0) + 1) % directions.length];
      directionInput.dataset.directionIndex = String(Number(directionInput.dataset.directionIndex || 0) + 1);
      directionInput.value = next;
      updateFormState();
    });
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('[data-body-dialog-close]')) { close(); return; }
      const remove = event.target.closest('[data-remove-segment]');
      if (remove) { remove.closest('.technical-body-precise-segment')?.remove(); return; }
      if (event.target.closest('[data-add-segment]')) {
        const list = backdrop.querySelector('[data-precise-segments]');
        if (list.children.length >= 10) return;
        list.insertAdjacentHTML('beforeend', preciseSegmentRow('新增段落'));
        list.lastElementChild.querySelector('input')?.focus();
      }
    });
    confirm.addEventListener('click', () => { close(); toast('已提交精准编写配置'); });
    updateFormState();
  }

  function openChapterDownloadDialog(modal) {
    closeBodyDialog(modal);
    const backdrop = document.createElement('div');
    backdrop.className = 'technical-body-dialog-backdrop';
    backdrop.dataset.bodyDialog = 'download';
    backdrop.innerHTML = `
      <section class="technical-body-dialog technical-body-download-dialog" role="dialog" aria-modal="true" aria-labelledby="technical-body-download-title">
        <header class="technical-body-dialog-header"><h2 id="technical-body-download-title">下载本章</h2><button type="button" class="technical-body-dialog-close" data-body-dialog-close aria-label="关闭">×</button></header>
        <div class="technical-body-dialog-scroll">
          <section class="technical-body-download-section technical-body-page-settings"><h3>页面设置</h3><div class="technical-body-settings-row"><label>纸张</label><select><option>A4</option><option>A3</option></select><label>上边距</label><div class="technical-body-page-unit"><input value="25.4" inputmode="decimal"><span>mm</span></div><label>下边距</label><div class="technical-body-page-unit"><input value="25.4" inputmode="decimal"><span>mm</span></div><label>左边距</label><div class="technical-body-page-unit"><input value="25.4" inputmode="decimal"><span>mm</span></div><label>右边距</label><div class="technical-body-page-unit"><input value="25.4" inputmode="decimal"><span>mm</span></div></div></section>
          <section class="technical-body-download-section"><h3>标题层级</h3><div class="technical-body-level-mode"><button type="button" class="is-active" data-level-mode="auto">自动跟随当前内容</button><button type="button" data-level-mode="manual">手动设置层级上限</button><span>当前内容共 3 级，不生成空标题</span></div></section>
          <section class="technical-body-download-section technical-body-title-style"><h3>标题样式<span>（支持一级至七级）</span></h3>${[['第1级', '黑体', '16'], ['第2级', '黑体', '14'], ['第3级', '黑体', '12']].map(([level, font, size]) => `<div class="technical-body-style-row"><strong>${level}</strong><select><option>${font}</option><option>宋体</option></select><div class="technical-body-value-input"><input value="${size}"><span>磅</span></div><div class="technical-body-value-input"><input value="0"><span>mm</span></div><div class="technical-body-value-input"><input value="1.5"><span>倍</span></div><div class="technical-body-align" role="group" aria-label="${level}对齐方式"><button type="button" class="is-active" data-align>☰</button><button type="button" data-align>☰</button><button type="button" data-align>☰</button></div><button type="button" class="technical-body-bold is-active" data-bold aria-label="${level}加粗">B</button></div>`).join('')}</section>
          <section class="technical-body-download-section technical-body-text-style"><h3>正文设置</h3><div class="technical-body-settings-row"><select><option>宋体</option><option>黑体</option></select><div class="technical-body-value-input technical-body-text-size"><input value="12"><span>磅</span></div><div class="technical-body-value-input technical-body-text-spacing"><input value="1.5"><span>倍</span></div><div class="technical-body-value-input technical-body-text-indent"><input value="10"><span>mm</span></div></div></section>
          <section class="technical-body-download-section technical-body-number-settings"><h3>编号设置</h3><label class="technical-body-switch-line"><button type="button" class="technical-body-switch is-on" data-number-switch role="switch" aria-checked="true"><i></i></button><span>启用编号</span><span>一级使用中文章，二级至七级使用阿拉伯数字</span></label></section>
        </div>
        <footer class="technical-body-dialog-footer"><button type="button" class="technical-body-dialog-secondary" data-body-dialog-close>取消</button><button type="button" class="technical-body-dialog-primary" data-download-confirm>下载</button></footer>
      </section>`;
    modal.append(backdrop);
    const close = () => backdrop.remove();
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('[data-body-dialog-close]')) { close(); return; }
      const mode = event.target.closest('[data-level-mode]');
      if (mode) { backdrop.querySelectorAll('[data-level-mode]').forEach((item) => item.classList.toggle('is-active', item === mode)); return; }
      const align = event.target.closest('[data-align]');
      if (align) { align.parentElement.querySelectorAll('[data-align]').forEach((item) => item.classList.toggle('is-active', item === align)); return; }
      const bold = event.target.closest('[data-bold]');
      if (bold) { bold.classList.toggle('is-active'); return; }
      const numberSwitch = event.target.closest('[data-number-switch]');
      if (numberSwitch) { const active = numberSwitch.classList.toggle('is-on'); numberSwitch.setAttribute('aria-checked', String(active)); }
    });
    backdrop.querySelector('[data-download-confirm]').addEventListener('click', () => { close(); toast('本章已开始下载'); });
  }

  function startRewriteLoading(modal) {
    const loading = modal.querySelector('[data-rewrite-loading]');
    loading.hidden = false;
  }

  function openRewriteDialog(modal) {
    closeBodyDialog(modal);
    const backdrop = document.createElement('div');
    backdrop.className = 'technical-body-dialog-backdrop';
    backdrop.dataset.bodyDialog = 'rewrite';
    backdrop.innerHTML = `
      <section class="technical-body-dialog technical-body-rewrite-dialog" role="dialog" aria-modal="true" aria-labelledby="technical-body-rewrite-title">
        <header class="technical-body-dialog-header">
          <h2 id="technical-body-rewrite-title">重新编写</h2>
          <button type="button" class="technical-body-dialog-close" data-body-dialog-close aria-label="关闭">×</button>
        </header>
        <div class="technical-body-dialog-scroll">
          <div class="technical-body-dialog-field">
            <label for="technical-body-rewrite-requirements"><i>*</i>重新编写需求</label>
            <textarea id="technical-body-rewrite-requirements" data-rewrite-requirements placeholder="请输入重新编写的内容、调整方向或需要重点补充的要求"></textarea>
          </div>
        </div>
        <footer class="technical-body-dialog-footer">
          <button type="button" class="technical-body-dialog-secondary" data-body-dialog-close>取消</button>
          <button type="button" class="technical-body-dialog-primary" data-rewrite-submit disabled>提交</button>
        </footer>
      </section>`;
    modal.append(backdrop);
    const input = backdrop.querySelector('[data-rewrite-requirements]');
    const submit = backdrop.querySelector('[data-rewrite-submit]');
    const syncSubmit = () => { submit.disabled = !input.value.trim(); };
    input.addEventListener('input', syncSubmit);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('[data-body-dialog-close]')) backdrop.remove();
    });
    submit.addEventListener('click', () => {
      if (!input.value.trim()) return;
      backdrop.remove();
      startRewriteLoading(modal);
    });
    input.focus({ preventScroll: true });
  }

  function downloadFullDocument(modal) {
    const bookName = modal.querySelector('.technical-body-result-info input')?.value?.trim() || '技术标正文';
    const content = (fileContent?.tree || []).map((root) => {
      const renderNode = (node) => {
        const heading = `h${Math.min(6, Number(node.level || 0) + 1)}`;
        const blocks = node.blocks?.length ? renderContentBlocks(node.blocks) : '';
        return `<${heading}>${escapeHtml(node.code)} ${escapeHtml(node.title)}</${heading}>${blocks}${(node.children || []).map(renderNode).join('')}`;
      };
      return renderNode(root);
    }).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(bookName)}</title></head><body>${content}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'application/msword;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${bookName.replace(/[\\/:*?"<>|]/g, '_')}_技术标正文.doc`;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function openModal(title, trigger) {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'technical-body-result-modal';
    modal.__previousFocus = trigger;
    modal.innerHTML = `
      <section class="technical-body-result-shell" role="dialog" aria-modal="true" aria-labelledby="technical-body-result-title">
        <header class="technical-body-result-topbar">
          <strong id="technical-body-result-title">生成正文</strong>
          <nav class="technical-body-result-tabs" role="tablist"><button type="button" role="tab" aria-selected="false" data-result-tab="outline">目录及设置</button><button class="is-active" type="button" role="tab" aria-selected="true" data-result-tab="body">正文编写</button></nav>
          <div class="technical-body-result-actions"><button type="button" data-outline-generate hidden><span>下载标书</span></button><button type="button" data-download><span>下载标书</span></button><button class="close" type="button" data-close aria-label="关闭">${icon('detail-close')}</button></div>
        </header>
        <div class="technical-body-result-info"><div><label>标书名称</label><input value="某高校高性能计算GPU集群建设项目"></div><div><span>招标文件</span>${icon('word')}<strong>某高校高性能计算GPU集群建设项目.docx</strong></div></div>
        <div class="technical-body-result-progress" data-body-progress><strong>编写进度</strong><span>总计章节: ${totalChapterCount}</span><span>待编写: 0</span><span>已完成: ${totalChapterCount}</span><span>总页数: ${totalPageEstimate}</span><i><b style="width:100%"></b></i><em>100%</em><button type="button" data-generate-all>${icon('detail-magic')}重新编写</button></div>
        <section class="technical-body-outline-page" data-result-page="outline" hidden>
          ${renderOutlineSettings()}
        </section>
        <section class="technical-body-result-workspace" data-result-page="body">
          <aside class="technical-body-result-directory" data-directory><header><strong>目录</strong><div><button type="button" data-refresh-directory title="刷新目录">${icon('record-refresh')}</button><button type="button" data-collapse-directory title="收起目录">${icon('panel-toggle')}</button></div></header><div data-directory-list>${renderDirectory()}</div></aside>
          <main class="technical-body-result-editor">
            <header class="technical-body-chapter-head"><h2><span data-current-code>${escapeHtml(defaultDirectoryItem?.code || '')}</span> <span data-current-label>${escapeHtml(defaultDirectoryItem?.label || '')}</span></h2><div><button type="button" data-precise>${icon('detail-precise')}精准编写</button><button type="button" data-download-chapter>${icon('detail-download-chapter')}下载本章</button></div></header>
            <div class="technical-body-editor-sections" data-editor-sections>${renderEditorSections(defaultContentNode)}</div>
            <div class="technical-body-selection-tools" data-selection-tools hidden><button data-selection-action="AI改写">${icon('detail-magic')}AI改写</button><button data-selection-action="加粗"><b>B</b></button><button data-selection-action="删除线"><s>S</s></button><button data-selection-action="斜体"><i>I</i></button><button data-selection-action="下划线"><u>U</u></button><button data-selection-action="复制">${icon('feedback-copy')}复制</button></div>
          </main>
        </section>
        <div class="technical-body-result-toast" data-body-result-toast hidden></div>
        <div class="technical-body-rewrite-loading" data-rewrite-loading hidden>
          <div class="technical-body-rewrite-loading-card">
            <span class="technical-body-rewrite-spinner" aria-hidden="true"></span>
            <strong>正在重新编写</strong>
            <p>正在根据您的需求重新生成正文，请稍候</p>
            <div class="technical-body-rewrite-progress"><i></i></div>
          </div>
        </div>
      </section>`;

    const query = (selector) => modal.querySelector(selector);
    query('[data-editor-section]')?.classList.add('is-selected');
    query('[data-close]').addEventListener('click', closeModal);
    query('[data-download]').addEventListener('click', () => downloadFullDocument(modal));
    query('[data-outline-generate]').addEventListener('click', () => downloadFullDocument(modal));
    query('[data-generate-all]').addEventListener('click', () => openRewriteDialog(modal));
    query('[data-refresh-directory]').addEventListener('click', () => toast('目录已刷新'));
    query('[data-collapse-directory]').addEventListener('click', () => query('[data-result-page="body"]').classList.toggle('directory-collapsed'));
    query('[data-precise]').addEventListener('click', () => openPreciseDialog(modal));
    query('[data-download-chapter]').addEventListener('click', () => openChapterDownloadDialog(modal));
    modal.querySelectorAll('[data-outline-action]').forEach((button) => button.addEventListener('click', () => toast(`${button.dataset.outlineAction}操作已执行`)));
    modal.querySelectorAll('[data-result-tab]').forEach((tab) => tab.addEventListener('click', () => {
      modal.querySelectorAll('[data-result-tab]').forEach((item) => { const active = item === tab; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
      modal.querySelectorAll('[data-result-page]').forEach((page) => { page.hidden = page.dataset.resultPage !== tab.dataset.resultTab; });
      query('[data-body-progress]').hidden = tab.dataset.resultTab !== 'body';
      query('[data-download]').hidden = tab.dataset.resultTab !== 'body';
      query('[data-outline-generate]').hidden = tab.dataset.resultTab !== 'outline';
    }));
    modal.querySelectorAll('[data-directory-node]').forEach((node) => node.addEventListener('click', () => {
      modal.querySelectorAll('[data-directory-node]').forEach((item) => item.classList.toggle('is-active', item === node));
      query('[data-current-code]').textContent = node.dataset.code;
      query('[data-current-label]').textContent = node.dataset.label;
      const contentNode = contentById.get(node.dataset.nodeId);
      query('[data-editor-sections]').innerHTML = renderEditorSections(contentNode || fallbackContentNode);
      query('[data-editor-section]')?.classList.add('is-selected');
      query('[data-selection-tools]').hidden = true;
    }));
    modal.querySelectorAll('[data-outline-collapse]').forEach((button) => button.addEventListener('click', (event) => event.currentTarget.closest('.outline-chapter').classList.toggle('is-collapsed')));
    modal.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (action) {
        toast('正在处理中，请稍候');
        return;
      }
      const section = event.target.closest('[data-editor-section]');
      if (!section) return;
      modal.querySelectorAll('[data-editor-section]').forEach((item) => item.classList.toggle('is-selected', item === section));
    });
    const selectionTools = query('[data-selection-tools]');
    query('.technical-body-result-editor').addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) { selectionTools.hidden = true; return; }
      const range = selection.getRangeAt(0);
      if (!query('.technical-body-result-editor').contains(range.commonAncestorContainer)) return;
      const rect = range.getBoundingClientRect();
      const editorRect = query('.technical-body-result-editor').getBoundingClientRect();
      selectionTools.style.left = `${Math.max(12, Math.min(rect.left - editorRect.left, editorRect.width - 500))}px`;
      selectionTools.style.top = `${Math.max(56, rect.bottom - editorRect.top + query('.technical-body-result-editor').scrollTop + 8)}px`;
      selectionTools.hidden = false;
    });
    modal.querySelectorAll('[data-selection-action]').forEach((button) => button.addEventListener('mousedown', (event) => event.preventDefault()));
    modal.querySelectorAll('[data-selection-action]').forEach((button) => button.addEventListener('click', () => { toast(`${button.dataset.selectionAction}操作已执行`); selectionTools.hidden = true; }));
    modal.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; if (modal.querySelector('[data-body-dialog]')) closeBodyDialog(modal); else closeModal(); });
    document.body.append(modal);
    activeModal = modal;
    document.documentElement.classList.add('technical-body-result-open');
    document.body.classList.add('technical-body-result-open');
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#result-panel .record-row .record-main');
    if (!button) return;
    const title = button.querySelector('strong')?.textContent?.trim() || '';
    if (!title.startsWith(PREFIX)) return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    openModal(title, button);
  }, true);
})();
