(() => {
  const DETAIL_PAGE = './interpretation-detail-active.html';
  const EMPTY_PAGE = './interpretation-detail-empty.html';

  const openPrebidEvaluation = (card) => {
    const projectName = card.querySelector('.tender-card-title')?.textContent?.trim();
    const page = card.dataset.demoEmptyProject === 'true' ? EMPTY_PAGE : DETAIL_PAGE;
    const target = new URL(page, window.location.href);
    if (projectName) target.searchParams.set('project', projectName);
    if (card.dataset.projectCreatedAt) target.searchParams.set('createdAt', card.dataset.projectCreatedAt);
    window.location.href = target.href;
  };

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.tender-card');
    if (!card || event.target.closest('.tender-card-actions')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openPrebidEvaluation(card);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.tender-card');
    if (!card || event.target.closest('.tender-card-actions')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openPrebidEvaluation(card);
  }, true);
})();
