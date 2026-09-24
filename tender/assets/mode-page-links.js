(() => {
  const targetByMode = Object.freeze({
    标书研判: './interpretation-detail-active.html',
    技术部分: './technical-detail-active.html',
    商务部分: './business-detail-active.html',
    偏离响应: './deviation-detail-active.html',
  });
  const currentMode = document.body.classList.contains('deviation-mode-page')
    ? '偏离响应'
    : document.body.classList.contains('interpretation-mode-page')
      ? '标书研判'
      : document.body.classList.contains('business-mode-page')
        ? '商务部分'
        : '技术部分';

  const getTargetPageUrl = (targetPage) => {
    const targetUrl = new URL(targetPage, window.location.href);
    targetUrl.search = window.location.search;
    targetUrl.hash = window.location.hash;
    return targetUrl.href;
  };

  document.addEventListener('click', (event) => {
    const tab = event.target?.closest?.('#result-panel .result-tab');
    if (!tab) return;

    const targetMode = tab.textContent.trim();
    const targetPage = targetByMode[targetMode];
    if (!targetPage || targetMode === currentMode) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.href = getTargetPageUrl(targetPage);
  }, true);
})();
