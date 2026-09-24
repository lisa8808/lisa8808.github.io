const MODULE_ROUTES = new Map([
  ['标书撰写', './index.html'],
  ['智能审查', './intelligent-review.html'],
  ['企业信息', './company-management.html'],
  ['图库管理', './gallery-management.html'],
]);

function moduleDestination(moduleName) {
  return MODULE_ROUTES.get(moduleName) ?? null;
}

class GalleryStore {
  constructor(items = []) {
    this.items = items.map((item) => ({ ...item }));
    this.query = '';
    this.sort = 'newest';
  }

  setQuery(query) {
    this.query = String(query ?? '').trim().toLocaleLowerCase('zh-CN');
  }

  setSort(sort) {
    this.sort = sort;
  }

  visible() {
    const filtered = this.query
      ? this.items.filter((item) => item.title.toLocaleLowerCase('zh-CN').includes(this.query))
      : [...this.items];

    if (this.sort === 'count') {
      return filtered.sort((a, b) => b.count - a.count || b.id - a.id);
    }

    if (this.sort === 'name') {
      return filtered.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    }

    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id);
  }

  create(title, updatedAt = formatDateTime(new Date())) {
    const normalizedTitle = String(title ?? '').trim();
    if (!normalizedTitle) throw new Error('请输入图库名称');

    const nextId = this.items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const item = { id: nextId, title: normalizedTitle, count: 0, updatedAt };
    this.items.push(item);
    return { ...item };
  }

  remove(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) return false;
    this.items.splice(index, 1);
    return true;
  }

  updateCount(id, count, updatedAt = formatDateTime(new Date())) {
    const item = this.items.find((candidate) => candidate.id === id);
    if (!item) return false;
    item.count = Math.max(0, Math.trunc(Number(count) || 0));
    item.updatedAt = updatedAt;
    return true;
  }
}

function buildGalleryDetailUrl(item, isNew = false) {
  const params = new URLSearchParams({
    embedded: '1',
    id: String(item.id),
    title: item.title,
    count: String(item.count),
  });
  if (isNew) params.set('mode', 'new');
  return `./gallery-demo/gallery-detail.html?${params.toString().replace(/\+/g, '%20')}`;
}

globalThis.moduleDestination = moduleDestination;
globalThis.GalleryStore = GalleryStore;
globalThis.buildGalleryDetailUrl = buildGalleryDetailUrl;

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleModuleNavigation, true);
  if (document.body?.dataset.page === 'gallery') initializeGalleryPage();
}

function handleModuleNavigation(event) {
  const target = event.target.closest('[data-module], .primary-tab');
  if (!target) return;

  const moduleName = target.dataset.module || target.textContent.trim();
  const destination = moduleDestination(moduleName);
  if (destination) {
    if (window.location.pathname.endsWith(destination.slice(1))) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.href = destination;
    return;
  }

  if (document.body.dataset.page === 'gallery') {
    event.preventDefault();
    showToast(`${moduleName}模块暂未开放`);
  }
}

function initializeGalleryPage() {
  const store = new GalleryStore([
    { id: 1, title: 'AI服务器图', count: 30, updatedAt: '2025-05-02 09:20:47' },
    { id: 2, title: '行业解决方案图', count: 26, updatedAt: '2025-05-16 14:32:08' },
    { id: 3, title: '产品架构图', count: 18, updatedAt: '2025-06-12 10:05:26' },
    { id: 4, title: '网络拓扑图', count: 42, updatedAt: '2025-07-04 16:18:32' },
    { id: 5, title: '数据中心平面图', count: 15, updatedAt: '2025-07-19 11:43:51' },
    { id: 6, title: '智慧园区场景图', count: 21, updatedAt: '2025-08-08 17:26:14' },
  ]);

  const grid = document.querySelector('#galleryGrid');
  const empty = document.querySelector('#galleryEmpty');
  const searchControl = document.querySelector('#searchControl');
  const searchInput = document.querySelector('#gallerySearch');
  const searchButton = document.querySelector('#searchButton');
  const createModal = document.querySelector('#createModal');
  const nameInput = document.querySelector('#galleryName');
  const nameError = document.querySelector('#galleryNameError');
  const deleteModal = document.querySelector('#deleteModal');
  const deleteDescription = document.querySelector('#deleteModalDescription');
  let view = 'grid';
  let pendingDeleteId = null;

  function render() {
    const visible = store.visible();
    const hasNoMatches = Boolean(store.query) && visible.length === 0;
    empty.hidden = !hasNoMatches;
    grid.hidden = hasNoMatches;
    grid.classList.toggle('list-view', view === 'list');
    grid.innerHTML = `
      <button class="new-gallery-card" type="button" data-create-gallery>
        <span class="new-gallery-icon">${icon('plus')}</span>
        <span>新建图库</span>
      </button>
      ${visible.map(galleryCard).join('')}
    `;
  }

  function openCreateModal() {
    createModal.hidden = false;
    nameInput.value = '';
    nameError.textContent = '';
    window.setTimeout(() => nameInput.focus(), 0);
  }

  function closeCreateModal() {
    createModal.hidden = true;
  }

  function createGallery() {
    try {
      const item = store.create(nameInput.value);
      closeCreateModal();
      render();
      showToast(`已创建图库“${item.title}”`);
    } catch (error) {
      nameError.textContent = error.message;
      nameInput.focus();
    }
  }

  function openDeleteModal(id) {
    const item = store.items.find((candidate) => candidate.id === id);
    if (!item) return;
    pendingDeleteId = id;
    deleteDescription.textContent = `删除后，“${item.title}”中的 ${item.count} 张图片将无法恢复。`;
    deleteModal.hidden = false;
    window.setTimeout(() => document.querySelector('#confirmDelete').focus(), 0);
  }

  function closeDeleteModal() {
    deleteModal.hidden = true;
    pendingDeleteId = null;
  }

  document.querySelector('#createGalleryButton').addEventListener('click', openCreateModal);
  document.querySelector('#confirmCreate').addEventListener('click', createGallery);
  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeCreateModal));
  document.querySelectorAll('[data-close-delete]').forEach((button) => button.addEventListener('click', closeDeleteModal));
  document.querySelector('#confirmDelete').addEventListener('click', () => {
    const item = store.items.find((candidate) => candidate.id === pendingDeleteId);
    if (!item || !store.remove(pendingDeleteId)) return;
    closeDeleteModal();
    render();
    showToast(`已删除图库“${item.title}”`);
  });

  createModal.addEventListener('click', (event) => {
    if (event.target === createModal) closeCreateModal();
  });
  deleteModal.addEventListener('click', (event) => {
    if (event.target === deleteModal) closeDeleteModal();
  });
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') createGallery();
  });
  searchButton.addEventListener('click', () => {
    const open = !searchControl.classList.contains('open');
    searchControl.classList.toggle('open', open);
    searchButton.setAttribute('aria-expanded', String(open));
    if (open) searchInput.focus();
    if (!open && !searchInput.value) {
      store.setQuery('');
      render();
    }
  });
  searchInput.addEventListener('input', () => {
    store.setQuery(searchInput.value);
    render();
  });
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      view = button.dataset.view;
      document.querySelectorAll('[data-view]').forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle('active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      render();
    });
  });
  document.querySelectorAll('[data-toast]').forEach((button) => {
    button.addEventListener('click', () => showToast(button.dataset.toast));
  });
  grid.addEventListener('click', (event) => {
    if (event.target.closest('[data-create-gallery]')) return openCreateModal();
    const deleteButton = event.target.closest('[data-delete-id]');
    if (deleteButton) return openDeleteModal(Number(deleteButton.dataset.deleteId));
    const downloadButton = event.target.closest('[data-download-id]');
    if (downloadButton) {
      const item = store.items.find((candidate) => candidate.id === Number(downloadButton.dataset.downloadId));
      if (item) showToast(`已开始下载“${item.title}”（${item.count}张）`);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!deleteModal.hidden) closeDeleteModal();
    else if (!createModal.hidden) closeCreateModal();
  });

  render();
}

function galleryCard(item) {
  const title = escapeHtml(item.title);
  return `
    <article class="gallery-card" data-gallery-id="${item.id}">
      <span class="folder-mark" aria-hidden="true">${icon('folder')}</span>
      <strong class="gallery-title" title="${title}">${title}</strong>
      <span class="gallery-count">共计 ${item.count} 张</span>
      <time class="gallery-date" datetime="${item.updatedAt.replace(' ', 'T')}">更新于 ${item.updatedAt}</time>
      <span class="card-actions">
        <button class="card-action" type="button" data-download-id="${item.id}" aria-label="下载${title}" title="下载">${icon('download')}</button>
        <button class="card-action danger" type="button" data-delete-id="${item.id}" aria-label="删除${title}" title="删除">${icon('trash')}</button>
      </span>
    </article>
  `;
}

function icon(name) {
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    folder: '<path d="M3.5 7.5h6l2-2h9v13h-17z"/><path d="M3.5 9.5h17"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2200);
}
