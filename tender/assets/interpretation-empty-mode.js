(() => {
  const disableModeButton = (button) => {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  };

  const removeDeviationAction = () => {
    document.querySelector('#result-panel .deviation-response-action')?.remove();
  };

  const watchOperationArea = () => {
    const resultPanel = document.querySelector('#result-panel');
    if (!resultPanel) return;
    const observer = new MutationObserver(removeDeviationAction);
    observer.observe(resultPanel, { childList: true, subtree: true });
  };

  const enhanceEmptyEvaluationMode = () => {
    const preciseButtons = Array.from(
      document.querySelectorAll('#result-panel .result-mode .tool-grid > button'),
    );
    const quickButton = document.querySelector('#result-panel .quick-action');
    if (preciseButtons.length < 2 || !quickButton) return false;

    removeDeviationAction();

    preciseButtons[0].querySelector('span').innerHTML = '<b>01</b> 标书要点解读';
    preciseButtons[1].querySelector('span').innerHTML = '<b>02</b> 投标符合性自评';
    preciseButtons.slice(2).forEach((button) => button.remove());

    const quickText = Array.from(quickButton.childNodes)
      .find((node) => node.nodeType === 3 && node.textContent.trim());
    if (quickText) quickText.textContent = '一键投标自评';

    [preciseButtons[0], preciseButtons[1], quickButton].forEach(disableModeButton);
    return true;
  };

  if (enhanceEmptyEvaluationMode()) {
    watchOperationArea();
  } else {
    const observer = new MutationObserver(() => {
      if (enhanceEmptyEvaluationMode()) {
        observer.disconnect();
        watchOperationArea();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
