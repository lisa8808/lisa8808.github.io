(() => {
  const app = document.getElementById('app');

  if (!app) return;

  const moreIcon = './assets/figma/more.svg';
  const deleteIcon = './assets/figma/project-delete.svg';

  const closeMenus = (panel, except) => {
    panel.querySelectorAll('.file-row.menu-open').forEach((row) => {
      if (row === except) return;

      row.classList.remove('menu-open');
      const menu = row.querySelector('.file-row-menu');
      if (menu) menu.hidden = true;
    });
  };

  const toggleMenu = (event, row, menu, panel) => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = row.classList.contains('menu-open');
    closeMenus(panel, row);
    row.classList.toggle('menu-open', !isOpen);
    menu.hidden = isOpen;
  };

  const enhanceRow = (row, panel) => {
    if (row.dataset.actionsReady === 'true') return;

    row.dataset.actionsReady = 'true';

    const more = document.createElement('span');
    more.className = 'file-more-button';
    more.tabIndex = 0;
    more.setAttribute('role', 'button');
    more.setAttribute('aria-label', '更多操作');

    const moreImage = document.createElement('img');
    moreImage.src = moreIcon;
    moreImage.alt = '';
    more.append(moreImage);

    const menu = document.createElement('span');
    menu.className = 'file-row-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'menu');

    const remove = document.createElement('span');
    remove.className = 'file-delete-action';
    remove.tabIndex = 0;
    remove.setAttribute('role', 'menuitem');

    const deleteImage = document.createElement('img');
    deleteImage.src = deleteIcon;
    deleteImage.alt = '';

    const label = document.createElement('span');
    label.textContent = '删除';
    remove.append(deleteImage, label);
    menu.append(remove);

    const checkbox = row.querySelector('.check-button');
    row.insertBefore(more, checkbox || null);
    row.append(menu);

    more.addEventListener('click', (event) => toggleMenu(event, row, menu, panel));
    more.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      toggleMenu(event, row, menu, panel);
    });

    remove.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      row.remove();
    });
    remove.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      event.stopPropagation();
      row.remove();
    });
  };

  const attachPanel = (panel) => {
    if (panel.dataset.fileActionsReady === 'true') return;

    panel.dataset.fileActionsReady = 'true';

    const syncRows = () => {
      panel.querySelectorAll('.file-row').forEach((row) => enhanceRow(row, panel));
    };

    syncRows();

    new MutationObserver(syncRows).observe(panel, {
      childList: true,
      subtree: true,
    });
  };

  const syncPanel = () => {
    const panel = app.querySelector('.upload-panel');
    if (panel) attachPanel(panel);
  };

  syncPanel();

  new MutationObserver(syncPanel).observe(app, {
    childList: true,
    subtree: true,
  });

  document.addEventListener('click', (event) => {
    app.querySelectorAll('.upload-panel').forEach((panel) => {
      if (!panel.contains(event.target)) closeMenus(panel);
    });
  });
})();
