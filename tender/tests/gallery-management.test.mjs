import test from 'node:test';
import assert from 'node:assert/strict';
await import('../assets/gallery-management.mjs');

const gallery = {
  moduleDestination: globalThis.moduleDestination,
  GalleryStore: globalThis.GalleryStore,
  buildGalleryDetailUrl: globalThis.buildGalleryDetailUrl,
};

test('moduleDestination routes the gallery tab to the gallery page', () => {
  assert.equal(typeof gallery.moduleDestination, 'function');
  assert.equal(gallery.moduleDestination('图库管理'), './gallery-management.html');
  assert.equal(gallery.moduleDestination('标书撰写'), './index.html');
  assert.equal(gallery.moduleDestination('智能审查'), './intelligent-review.html');
});

test('GalleryStore filters galleries without mutating the source list', () => {
  assert.equal(typeof gallery.GalleryStore, 'function');
  const store = new gallery.GalleryStore([
    { id: 1, title: 'AI服务器图', count: 30, updatedAt: '2025-05-02 09:20:47' },
    { id: 2, title: '产品架构图', count: 18, updatedAt: '2025-06-12 10:00:00' },
  ]);

  store.setQuery('服务器');

  assert.deepEqual(store.visible().map((item) => item.title), ['AI服务器图']);
  assert.equal(store.items.length, 2);
});

test('GalleryStore sorts by newest and image count', () => {
  const store = new gallery.GalleryStore([
    { id: 1, title: '旧图库', count: 42, updatedAt: '2025-05-02 09:20:47' },
    { id: 2, title: '新图库', count: 12, updatedAt: '2025-06-12 10:00:00' },
  ]);

  store.setSort('newest');
  assert.deepEqual(store.visible().map((item) => item.id), [2, 1]);

  store.setSort('count');
  assert.deepEqual(store.visible().map((item) => item.id), [1, 2]);
});

test('GalleryStore creates and deletes galleries with stable state', () => {
  const store = new gallery.GalleryStore([
    { id: 7, title: '原有图库', count: 3, updatedAt: '2025-05-02 09:20:47' },
  ]);

  const created = store.create('  施工现场图  ', '2026-08-29 15:30:00');
  assert.deepEqual(created, {
    id: 8,
    title: '施工现场图',
    count: 0,
    updatedAt: '2026-08-29 15:30:00',
  });
  assert.equal(store.items.length, 2);

  assert.equal(store.remove(7), true);
  assert.deepEqual(store.items.map((item) => item.id), [8]);
  assert.equal(store.remove(999), false);
  assert.throws(() => store.create('   '), /请输入图库名称/);
});

test('GalleryStore updates the active gallery count without changing other galleries', () => {
  const store = new gallery.GalleryStore([
    { id: 1, title: 'AI服务器', count: 30, updatedAt: '2025-05-02 09:20:47' },
    { id: 2, title: '产品能力', count: 18, updatedAt: '2025-06-12 10:00:00' },
  ]);

  assert.equal(store.updateCount(2, 21, '2026-09-11 18:20:00'), true);
  assert.deepEqual(store.items, [
    { id: 1, title: 'AI服务器', count: 30, updatedAt: '2025-05-02 09:20:47' },
    { id: 2, title: '产品能力', count: 21, updatedAt: '2026-09-11 18:20:00' },
  ]);
  assert.equal(store.updateCount(999, 1), false);
});

test('buildGalleryDetailUrl opens the embedded detail workspace for the selected gallery', () => {
  assert.equal(typeof gallery.buildGalleryDetailUrl, 'function');
  assert.equal(
    gallery.buildGalleryDetailUrl({ id: 8, title: '数据中心 & 网络', count: 12 }),
    './gallery-demo/gallery-detail.html?embedded=1&id=8&title=%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83%20%26%20%E7%BD%91%E7%BB%9C&count=12',
  );
  assert.equal(
    gallery.buildGalleryDetailUrl({ id: 9, title: '新建图库', count: 0 }, true),
    './gallery-demo/gallery-detail.html?embedded=1&id=9&title=%E6%96%B0%E5%BB%BA%E5%9B%BE%E5%BA%93&count=0&mode=new',
  );
});
