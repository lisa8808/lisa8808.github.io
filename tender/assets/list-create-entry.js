(() => {
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.create-button, .new-project-card')) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.href = './interpretation-detail-empty.html';
  }, true);
})();
