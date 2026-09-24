(() => {
  const PROCESSING_SELECTOR = '#result-panel .processing-row.technical-interpretation-processing, #result-panel .processing-row.technical-outline-processing, #result-panel .processing-row.technical-body-processing, #result-panel .processing-row.business-outline-processing, #result-panel .processing-row.business-body-processing';

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  const closeMenus = (except = null) => {
    document.querySelectorAll(`${PROCESSING_SELECTOR} .technical-task-menu`).forEach((menu) => {
      if (menu === except) return;
      menu.remove();
      menu.closest('.processing-row')?.querySelector('.more-button')?.setAttribute('aria-expanded', 'false');
    });
  };

  const openTaskMenu = (row, button) => {
    const existing = row.querySelector('.technical-task-menu');
    if (existing) {
      existing.remove();
      button.setAttribute('aria-expanded', 'false');
      return;
    }

    closeMenus();
    const menu = document.createElement('div');
    menu.className = 'result-menu task-menu technical-task-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = '<button type="button" role="menuitem" data-technical-stop-task>停止任务并删除</button>';
    row.append(menu);
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-haspopup', 'menu');
  };

  const closeConfirm = (backdrop) => {
    backdrop?.remove();
    document.documentElement.classList.remove('technical-task-confirm-open');
    document.body.classList.remove('technical-task-confirm-open');
  };

  const showActionToast = (text) => {
    document.querySelector('[data-technical-task-action-toast]')?.remove();
    const toast = document.createElement('div');
    toast.className = 'technical-task-action-toast';
    toast.dataset.technicalTaskActionToast = 'true';
    toast.textContent = text;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 1800);
  };

  const openConfirm = (row) => {
    const existing = document.querySelector('[data-technical-task-confirm]');
    if (existing) return;

    const title = row.querySelector('.processing-copy strong')?.textContent?.trim() || '当前任务';
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop technical-task-confirm-backdrop';
    backdrop.dataset.technicalTaskConfirm = 'true';
    backdrop.innerHTML = `
      <section class="confirm-modal technical-task-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="technical-task-confirm-title">
        <h2 id="technical-task-confirm-title">停止任务并删除</h2>
        <p>是否取消并删除正在生成的“${escapeHtml(title)}”？</p>
        <footer>
          <button class="secondary-button" type="button" data-technical-task-cancel>取消</button>
          <button class="danger-button" type="button" data-technical-task-confirm-delete>停止任务并删除</button>
        </footer>
      </section>`;

    const close = () => closeConfirm(backdrop);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });
    backdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    backdrop.querySelector('[data-technical-task-cancel]').addEventListener('click', close);
    backdrop.querySelector('[data-technical-task-confirm-delete]').addEventListener('click', () => {
      if (!row.isConnected) return;
      row.remove();
      close();
      showActionToast('任务已停止并删除');
    });

    closeMenus();
    document.body.append(backdrop);
    document.documentElement.classList.add('technical-task-confirm-open');
    document.body.classList.add('technical-task-confirm-open');
    backdrop.querySelector('[data-technical-task-cancel]').focus({ preventScroll: true });
  };

  document.addEventListener('click', (event) => {
    const more = event.target.closest?.(`${PROCESSING_SELECTOR} .more-button`);
    if (more) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openTaskMenu(more.closest('.processing-row'), more);
      return;
    }

    const stop = event.target.closest?.(`${PROCESSING_SELECTOR} [data-technical-stop-task]`);
    if (stop) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openConfirm(stop.closest('.processing-row'));
      return;
    }

    if (!event.target.closest?.(`${PROCESSING_SELECTOR} .technical-task-menu`)) closeMenus();
  }, true);
})();
