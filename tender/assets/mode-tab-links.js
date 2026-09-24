(() => {
  const tabDefinitions = [
    { key: 'prebid', label: '标书研判', aliases: ['标书研判', '标前评估'] },
    { key: 'technical', label: '技术部分', aliases: ['技术部分', '技术标'] },
    { key: 'business', label: '商务部分', aliases: ['商务部分', '商务标'] },
    { key: 'deviation', label: '偏离响应', aliases: ['偏离响应'] },
  ];

  const currentMode = document.body.classList.contains('deviation-mode-page')
    ? 'deviation'
    : document.body.classList.contains('interpretation-mode-page')
      ? 'prebid'
      : document.body.classList.contains('business-mode-page')
        ? 'business'
        : 'technical';

  const ensureModeTabs = () => {
    const tabList = document.querySelector('#result-panel .result-tabs');
    if (!tabList) return false;

    const resultHeaderTitle = document.querySelector('#result-panel .result-header h2');
    resultHeaderTitle?.remove();

    const existingTabs = Array.from(tabList.querySelectorAll('.result-tab'));
    existingTabs
      .filter((tab) => tab.textContent.trim() === '结果')
      .forEach((tab) => tab.remove());

    const orderedTabs = tabDefinitions.map(({ key, label, aliases }) => {
      let tab = existingTabs.find((candidate) => (
        candidate.dataset.modeTab === key
        || (key === 'prebid' && candidate.dataset.interpretationTab === 'true')
        || aliases.includes(candidate.textContent.trim())
      ));

      if (!tab) {
        tab = document.createElement('button');
        tab.type = 'button';
        tab.role = 'tab';
        tab.className = 'result-tab';
      }

      tab.dataset.modeTab = key;
      if (key === 'prebid') tab.dataset.interpretationTab = 'true';
      tab.textContent = label;
      const active = key === currentMode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      return tab;
    });

    tabList.append(...orderedTabs);
    return true;
  };

  if (!ensureModeTabs()) {
    const observer = new MutationObserver(() => {
      if (ensureModeTabs()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
