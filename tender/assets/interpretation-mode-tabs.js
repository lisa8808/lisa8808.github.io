(() => {
  const formatMinute = (date = new Date()) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  };
  const addMinuteSuffix = (title) => /_\d{12}$/.test(title) ? title : `${title}_${formatMinute()}`;
  const enhanceTabs = () => {
    const tabList = document.querySelector('#result-panel .result-tabs');
    if (!tabList) return false;

    const tabs = Array.from(tabList.querySelectorAll('.result-tab'));
    const orderedKeys = ['prebid', 'technical', 'business', 'deviation'];
    const labels = {
      prebid: '标书研判',
      technical: '技术部分',
      business: '商务部分',
      deviation: '偏离响应',
    };
    const orderedTabs = orderedKeys
      .map((key) => tabs.find((tab) => tab.dataset.modeTab === key))
      .filter(Boolean);
    if (orderedTabs.length !== orderedKeys.length) return false;

    const activeKey = document.body.classList.contains('deviation-mode-page')
      ? 'deviation'
      : 'prebid';
    orderedTabs.forEach((tab) => {
      tab.textContent = labels[tab.dataset.modeTab];
      const active = tab.dataset.modeTab === activeKey;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    tabList.append(...orderedTabs);
    return true;
  };

  const enhanceEvaluationMode = () => {
    const preciseButtons = Array.from(
      document.querySelectorAll('#result-panel .result-mode .tool-grid > button'),
    );
    const quickButton = document.querySelector('#result-panel .quick-action');
    if (preciseButtons.length < 2 || !quickButton) return false;

    preciseButtons[0].querySelector('span').innerHTML = '<b>01</b> 标书要点解读';
    preciseButtons[1].querySelector('span').innerHTML = '<b>02</b> 投标符合性自评';
    preciseButtons.slice(2).forEach((button) => button.remove());

    const quickText = Array.from(quickButton.childNodes)
      .find((node) => node.nodeType === 3 && node.textContent.trim());
    if (quickText) quickText.textContent = '一键投标自评';
    return true;
  };

  const replaceTitle = (title, nextText) => {
    if (title.textContent.trim() === nextText) return;
    title.textContent = nextText;
    title.title = nextText;
  };

  const enhanceRecords = () => {
    const resultList = document.querySelector('#result-panel .result-list');
    if (!resultList) return false;

    const processingRows = Array.from(document.querySelectorAll('#result-panel .processing-row'));
    processingRows.forEach((row) => {
      const title = row.querySelector('strong');
      const text = title?.textContent.trim() || '';
      if (text.startsWith('招标文件解读_') || text.startsWith('标前解读_') || text.startsWith('标书要点解读_')) {
        replaceTitle(title, addMinuteSuffix(text.replace(/^招标文件解读_/, '标书要点解读_').replace(/^标前解读_/, '标书要点解读_')));
      } else if (text.startsWith('标前评估_') || text.startsWith('投标自评_') || text.startsWith('投标符合性自评_')) {
        replaceTitle(title, addMinuteSuffix(text.replace(/^(?:标前评估_|投标自评_)/, '投标符合性自评_')));
      }
    });
    const seenProcessingProjects = new Set(
      processingRows
        .map((row) => row.querySelector('strong')?.textContent.trim().match(/^(?:标前评估_|投标自评_|投标符合性自评_)(.+)$/)?.[1]?.replace(/_\d{12}$/, ''))
        .filter(Boolean),
    );
    processingRows.forEach((row) => {
      const title = row.querySelector('strong');
      const match = title?.textContent.trim().match(/^技术标投标(?:大纲|正文)_(.+)$/);
      if (!match) return;

      const projectName = match[1].replace(/_\d{12}$/, '');
      if (seenProcessingProjects.has(projectName)) {
        row.remove();
        return;
      }
      seenProcessingProjects.add(projectName);
      replaceTitle(title, addMinuteSuffix(`投标符合性自评_${projectName}`));
    });

    const generatedRows = Array.from(document.querySelectorAll('#result-panel .record-row'));
    generatedRows.forEach((row) => {
      const title = row.querySelector('.record-main strong');
      const text = title?.textContent.trim() || '';
      if (text.startsWith('招标文件解读_') || text.startsWith('标前解读_') || text.startsWith('标书要点解读_')) {
        replaceTitle(title, addMinuteSuffix(text.replace(/^招标文件解读_/, '标书要点解读_').replace(/^标前解读_/, '标书要点解读_')));
      } else if (text.startsWith('标前评估_') || text.startsWith('投标自评_') || text.startsWith('投标符合性自评_')) {
        replaceTitle(title, addMinuteSuffix(text.replace(/^(?:标前评估_|投标自评_)/, '投标符合性自评_')));
      }
    });
    const seenGeneratedProjects = new Set(
      generatedRows
        .map((row) => row.querySelector('.record-main strong')?.textContent.trim().match(/^(?:标前评估_|投标自评_|投标符合性自评_)(.+)$/)?.[1]?.replace(/_\d{12}$/, ''))
        .filter(Boolean),
    );
    generatedRows.forEach((row) => {
      const title = row.querySelector('.record-main strong');
      const text = title?.textContent.trim() || '';
      if (text.startsWith('技术标投标大纲_')) {
        row.remove();
        return;
      }
      if (text.startsWith('技术标投标正文_')) {
        const projectName = text.replace(/^技术标投标正文_/, '').replace(/_\d{12}$/, '');
        if (seenGeneratedProjects.has(projectName)) {
          row.remove();
          return;
        }
        seenGeneratedProjects.add(projectName);
        replaceTitle(title, addMinuteSuffix(`投标符合性自评_${projectName}`));
      }
    });
    return true;
  };

  const enhancePage = () => {
    const tabsReady = enhanceTabs();
    const modeReady = enhanceEvaluationMode();
    const recordsReady = enhanceRecords();
    return tabsReady && modeReady && recordsReady;
  };

  const watchRecords = () => {
    const resultList = document.querySelector('#result-panel .result-list');
    if (!resultList) return;
    const observer = new MutationObserver(enhanceRecords);
    observer.observe(resultList, { childList: true, subtree: true, characterData: true });
  };

  if (enhancePage()) {
    watchRecords();
  } else {
    const observer = new MutationObserver(() => {
      if (enhancePage()) {
        observer.disconnect();
        watchRecords();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
