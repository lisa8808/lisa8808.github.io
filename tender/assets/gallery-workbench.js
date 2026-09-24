(function () {
  'use strict';

  var STORAGE_KEY = 'bidMate.galleries';
  var ACTIVE_KEY = 'bidMate.activeGalleryId';
  var GalleryStore = globalThis.GalleryStore;
  if (!GalleryStore) return;

  var defaults = [
    { id: 1, title: 'AI服务器', count: 30, updatedAt: '2026-09-08 10:18:00' },
    { id: 2, title: '产品能力', count: 18, updatedAt: '2026-09-06 16:32:00' },
    { id: 3, title: '行业解决方案', count: 22, updatedAt: '2026-09-02 09:46:00' },
    { id: 4, title: '网络拓扑与安全', count: 16, updatedAt: '2026-08-29 14:20:00' },
  ];

  /**
   * 示例图库常驻：本地存储里被编辑过的数据只作为追加项，绝不覆盖示例数据。
   * 这样即使之前新建/删除过图库，重新打开页面依然是内容齐全的状态。
   */
  function buildStore(storedList) {
    var titles = defaults.map(function (item) { return item.title; });
    var extras = (storedList || []).filter(function (item) {
      return item && item.title && titles.indexOf(item.title) < 0;
    }).map(function (item, index) {
      return {
        id: defaults.length + index + 1,
        title: item.title,
        count: Math.max(0, Math.trunc(Number(item.count) || 0)),
        updatedAt: item.updatedAt || '2026-09-08 10:18:00',
      };
    });
    return new GalleryStore(defaults.concat(extras));
  }

  var store = buildStore(readStored());
  var activeId = Number(readActiveId());
  var activeItem = store.items.find(function (item) { return item.id === activeId; });
  if (!activeItem || !activeItem.count) activeId = defaults[0].id;
  var pendingDeleteId = null;
  var nav = document.getElementById('galleryNav');
  var createModal = document.getElementById('createModal');
  var deleteModal = document.getElementById('deleteModal');
  var nameInput = document.getElementById('galleryName');
  var nameError = document.getElementById('galleryNameError');
  var deleteDescription = document.getElementById('deleteModalDescription');

  function readStored() {
    try {
      var value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function readActiveId() {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch (error) {
      return null;
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.items));
      if (activeId) localStorage.setItem(ACTIVE_KEY, String(activeId));
    } catch (error) {
      /* 本地文件直接打开时浏览器可能禁用存储，页面仍要能正常浏览 */
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character];
    });
  }

  var toastTimer;
  function toast(message) {
    var element = document.getElementById('toast');
    if (!element) return;
    window.clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = window.setTimeout(function () { element.hidden = true; }, 2200);
  }
  globalThis.galleryWorkbenchToast = toast;

  function formatStamp() {
    var date = new Date();
    var pad = function (value) { return String(value).padStart(2, '0'); };
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' +
      pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  /* 右侧图片面板直接改数量时，回写左侧列表 */
  globalThis.GalleryWorkbenchBridge = {
    setCount: function (id, count) {
      if (!Number.isFinite(Number(id))) return;
      if (!store.updateCount(Number(id), Number(count), formatStamp())) return;
      persist();
      renderNav();
    }
  };

  function navItem(item) {
    var active = item.id === activeId;
    return '<div class="gallery-nav-row' + (active ? ' active' : '') + '">' +
      '<button class="gallery-nav-item" type="button" data-gallery-id="' + item.id + '" aria-current="' + (active ? 'page' : 'false') + '">' +
        '<span class="nav-folder"><svg viewBox="0 0 24 24"><path d="M3.5 7.5h6l2-2h9v13h-17z"/><path d="M3.5 9.5h17"/></svg></span>' +
        '<span class="nav-copy"><strong>' + escapeHtml(item.title) + '</strong><small>' + item.count + ' 张图片</small></span>' +
      '</button>' +
      '<button class="nav-delete" type="button" data-delete-gallery="' + item.id + '" aria-label="删除' + escapeHtml(item.title) + '" title="删除图库"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/></svg></button>' +
    '</div>';
  }

  function renderNav() {
    document.getElementById('sidebarCount').textContent = String(store.items.length);
    nav.innerHTML = store.items.map(navItem).join('');
    if (!store.items.length) {
      nav.innerHTML = '<div class="sidebar-empty">暂无图库<br><button type="button" data-empty-create>新建第一个图库</button></div>';
    }
  }

  function openGallery(id, isNew) {
    var item = store.items.find(function (candidate) { return candidate.id === id; });
    if (!item) return;
    activeId = id;
    persist();
    renderNav();
    if (globalThis.galleryDetailOpen) globalThis.galleryDetailOpen(item);
  }

  function openCreate() {
    createModal.hidden = false;
    nameInput.value = '';
    nameError.textContent = '';
    window.setTimeout(function () { nameInput.focus(); }, 0);
  }

  function closeCreate() {
    createModal.hidden = true;
  }

  function createGallery() {
    try {
      var item = store.create(nameInput.value);
      persist();
      closeCreate();
      openGallery(item.id, true);
      toast('已创建图库“' + item.title + '”');
    } catch (error) {
      nameError.textContent = error.message;
      nameInput.focus();
    }
  }

  function openDelete(id) {
    var item = store.items.find(function (candidate) { return candidate.id === id; });
    if (!item) return;
    pendingDeleteId = id;
    deleteDescription.textContent = '删除后，“' + item.title + '”中的 ' + item.count + ' 张图片将无法恢复。';
    deleteModal.hidden = false;
    window.setTimeout(function () { document.getElementById('confirmDelete').focus(); }, 0);
  }

  function closeDelete() {
    pendingDeleteId = null;
    deleteModal.hidden = true;
  }

  function confirmDelete() {
    var item = store.items.find(function (candidate) { return candidate.id === pendingDeleteId; });
    if (!item || !store.remove(pendingDeleteId)) return;
    var deletedActive = activeId === pendingDeleteId;
    if (deletedActive) activeId = store.items[0] && store.items[0].id;
    persist();
    closeDelete();
    renderNav();
    if (activeId) openGallery(activeId);
    else if (globalThis.galleryDetailClear) globalThis.galleryDetailClear();
    toast('已删除图库“' + item.title + '”');
  }

  nav.addEventListener('click', function (event) {
    var createButton = event.target.closest('[data-empty-create]');
    if (createButton) return openCreate();
    var deleteButton = event.target.closest('[data-delete-gallery]');
    if (deleteButton) return openDelete(Number(deleteButton.dataset.deleteGallery));
    var itemButton = event.target.closest('[data-gallery-id]');
    if (itemButton) openGallery(Number(itemButton.dataset.galleryId));
  });
  document.getElementById('createGalleryButton').addEventListener('click', openCreate);
  document.getElementById('confirmCreate').addEventListener('click', createGallery);
  document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
  document.querySelectorAll('[data-close-modal]').forEach(function (button) { button.addEventListener('click', closeCreate); });
  document.querySelectorAll('[data-close-delete]').forEach(function (button) { button.addEventListener('click', closeDelete); });
  nameInput.addEventListener('keydown', function (event) { if (event.key === 'Enter') createGallery(); });
  createModal.addEventListener('click', function (event) { if (event.target === createModal) closeCreate(); });
  deleteModal.addEventListener('click', function (event) { if (event.target === deleteModal) closeDelete(); });
  window.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY) return;
    store = buildStore(readStored());
    if (!store.items.some(function (item) { return item.id === activeId; })) activeId = defaults[0].id;
    renderNav();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!deleteModal.hidden) closeDelete();
    else if (!createModal.hidden) closeCreate();
  });

  renderNav();
  persist();
  if (activeId) openGallery(activeId);
})();
