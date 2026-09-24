(() => {
  const copy = document.documentElement?.dataset.uploadCopy;
  const app = document.getElementById('app');

  if (!app || !copy) return;

  const sync = () => {
    document.querySelectorAll('.dropzone span').forEach((text) => {
      if (text.textContent !== copy) text.textContent = copy;
    });
  };

  sync();
  new MutationObserver(sync).observe(app, {
    childList: true,
    subtree: true,
  });
})();
