(() => {
  const cleanTitle = (value) => String(value || '').trim();

  const kindForRecord = (scope, title) => {
    const value = cleanTitle(title);
    if (scope === 'technical') {
      if (/^(技术要求解读_|招标文件解读_)/.test(value)) return 'interpretation';
      if (/^(技术大纲_|技术标投标大纲_)/.test(value)) return 'outline';
      if (/^(技术正文_|技术标投标正文_)/.test(value)) return 'body';
    }
    if (scope === 'business') {
      if (/^(商务大纲_|商务标投标大纲_)/.test(value)) return 'outline';
      if (/^(商务正文_|商务标投标正文_)/.test(value)) return 'body';
    }
    return '';
  };

  const actionsForRecord = (scope, title) => {
    const kind = kindForRecord(scope, title);
    if (kind === 'interpretation') return ['generate-outline', 'download', 'view-prompt-source'];
    if (kind === 'outline') return ['generate-body', 'download', 'view-prompt-source'];
    if (kind === 'body') return ['download', 'view-prompt-source'];
    return [];
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { kindForRecord, actionsForRecord };
  }
  if (typeof document === 'undefined') return;

  const scope = document.body.classList.contains('business-mode-page') ? 'business' : 'technical';
  let activeMenu = null;
  let activeButton = null;

  const recordTitle = (row) => cleanTitle(row?.querySelector('.record-copy strong, .record-main strong, strong')?.textContent);

  const closeMenu = () => {
    activeMenu?.remove();
    activeButton?.setAttribute('aria-expanded', 'false');
    activeMenu = null;
    activeButton = null;
  };

  const downloadRecord = (title) => {
    const content = `${title}\n\n该文件由投标助手生成。`;
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title.replace(/[\\/:*?\"<>|]/g, '_')}.docx`;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const projectNameFromTitle = (title) => cleanTitle(title)
    .replace(/^(技术要求解读_|招标文件解读_|技术大纲_|技术标投标大纲_|技术正文_|技术标投标正文_|商务大纲_|商务标投标大纲_|商务正文_|商务标投标正文_)/, '')
    .replace(/_\d{12}$/, '');

  const promptSourceForRecord = (title) => {
    const kind = kindForRecord(scope, title);
    const projectName = projectNameFromTitle(title) || '当前招标项目';
    if (scope === 'business' && kind === 'outline') {
      return {
        prompt: '依据招标文件生成完整标书目录结构，重点识别并组织商务部分所需的资质、业绩、报价及相关材料目录。',
        sources: [`招标文件：${projectName}`],
      };
    }
    if (scope === 'business' && kind === 'body') {
      return {
        prompt: '依据已确认的商务大纲、招标文件要求和当前选定投标企业资料，生成并填写商务部分正文。',
        sources: [`商务大纲：${projectName}`, `招标文件：${projectName}`, '投标企业资料：当前任务选定企业'],
      };
    }
    if (kind === 'interpretation') {
      return {
        prompt: '解读招标文件中的技术要求、评分标准、交付约束和响应要点，并形成结构化结果。',
        sources: [`招标文件：${projectName}`],
      };
    }
    if (kind === 'outline') {
      return {
        prompt: '依据招标文件解读结果生成技术部分大纲，覆盖技术要求、评分要点和交付约束。',
        sources: [`招标文件解读：${projectName}`, `招标文件：${projectName}`],
      };
    }
    return {
      prompt: '依据已确认的技术大纲和招标文件要求生成技术部分正文。',
      sources: [`技术大纲：${projectName}`, `招标文件：${projectName}`],
    };
  };

  const openPromptSourceModal = (title) => {
    document.querySelector('[data-prompt-source-modal]')?.remove();
    const details = promptSourceForRecord(title);
    const backdrop = document.createElement('div');
    backdrop.className = 'generated-prompt-source-backdrop';
    backdrop.dataset.promptSourceModal = 'true';
    backdrop.innerHTML = `
      <section class="generated-prompt-source-modal" role="dialog" aria-modal="true" aria-labelledby="generated-prompt-source-title">
        <header class="generated-prompt-source-header">
          <div>
            <h2 id="generated-prompt-source-title">查看提示和来源</h2>
            <p>${escapeHtml(title)}</p>
          </div>
          <button type="button" class="generated-prompt-source-close" aria-label="关闭">×</button>
        </header>
        <div class="generated-prompt-source-content">
          <section class="generated-prompt-source-section">
            <h3>生成提示</h3>
            <p>${escapeHtml(details.prompt)}</p>
          </section>
          <section class="generated-prompt-source-section">
            <h3>引用来源</h3>
            <ul>${details.sources.map((source) => `<li>${escapeHtml(source)}</li>`).join('')}</ul>
          </section>
        </div>
        <footer><button type="button" class="generated-prompt-source-confirm">关闭</button></footer>
      </section>`;
    const close = () => backdrop.remove();
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('.generated-prompt-source-close, .generated-prompt-source-confirm')) close();
    });
    backdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    document.body.append(backdrop);
    backdrop.querySelector('.generated-prompt-source-close')?.focus({ preventScroll: true });
  };

  const runAction = (action, title) => {
    closeMenu();
    if (action === 'download') {
      downloadRecord(title);
      return;
    }
    if (action === 'view-prompt-source') {
      openPromptSourceModal(title);
      return;
    }
    if (action === 'generate-outline') {
      window.dispatchEvent(new CustomEvent('technical:generate-outline-from-interpretation', { detail: { sourceTitle: title } }));
      return;
    }
    if (action === 'generate-body') {
      const eventName = scope === 'business' ? 'business:generate-full-from-outline' : 'technical:generate-full-from-outline';
      window.dispatchEvent(new CustomEvent(eventName, { detail: { outlineTitle: title } }));
    }
  };

  const labels = {
    'generate-outline': '生成大纲',
    'generate-body': '生成正文',
    download: '下载',
    'view-prompt-source': '查看提示和来源',
  };

  const openMenu = (row, button, point) => {
    const title = recordTitle(row);
    const actions = actionsForRecord(scope, title);
    closeMenu();
    if (!actions.length) return;

    const menu = document.createElement('div');
    menu.className = 'result-menu generated-record-menu';
    menu.setAttribute('role', 'menu');
    actions.forEach((action) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.dataset.recordAction = action;
      item.setAttribute('role', 'menuitem');
      item.innerHTML = action === 'download'
        ? '<img src="./assets/figma/detail-download.svg" alt=""><span>下载</span>'
        : `<span class="generated-record-menu-spacer" aria-hidden="true"></span><span>${labels[action]}</span>`;
      item.addEventListener('click', () => runAction(action, title));
      menu.append(item);
    });

    document.body.append(menu);
    const rect = button?.getBoundingClientRect() || row.getBoundingClientRect();
    const left = point?.x ?? rect.right;
    const top = point?.y ?? rect.bottom;
    const menuRect = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(left - menuRect.width, window.innerWidth - menuRect.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(top + 4, window.innerHeight - menuRect.height - 8))}px`;
    activeMenu = menu;
    activeButton = button || null;
    activeButton?.setAttribute('aria-expanded', 'true');
    menu.querySelector('button')?.focus({ preventScroll: true });
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('#result-panel .record-row:not(.processing-row) .more-button');
    if (button) {
      const row = button.closest('.record-row');
      if (!actionsForRecord(scope, recordTitle(row)).length) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openMenu(row, button);
      return;
    }
    if (!event.target.closest('.generated-record-menu')) closeMenu();
  }, true);

  document.addEventListener('contextmenu', (event) => {
    const row = event.target.closest('#result-panel .record-row:not(.processing-row)');
    if (!row || !actionsForRecord(scope, recordTitle(row)).length) return;
    event.preventDefault();
    event.stopPropagation();
    openMenu(row, row.querySelector('.more-button'), { x: event.clientX, y: event.clientY });
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', closeMenu);
  window.addEventListener('scroll', closeMenu, true);
})();
