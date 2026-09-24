(() => {
  let userInteracted = false;

  const markInteraction = () => {
    userInteracted = true;
  };

  const scrollToBottom = () => {
    if (userInteracted) return;
    document.querySelectorAll('.conversation-body').forEach((body) => {
      body.scrollTop = body.scrollHeight;
    });
  };

  const observer = new MutationObserver(() => {
    requestAnimationFrame(scrollToBottom);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  requestAnimationFrame(() => {
    scrollToBottom();
    requestAnimationFrame(scrollToBottom);
  });
  window.addEventListener('load', scrollToBottom);
  window.setTimeout(() => {
    scrollToBottom();
    observer.disconnect();
  }, 1200);

  document.addEventListener('pointerdown', markInteraction, { once: true, capture: true });
  document.addEventListener('wheel', markInteraction, { once: true, capture: true, passive: true });
  document.addEventListener('touchmove', markInteraction, { once: true, capture: true, passive: true });
  document.addEventListener('keydown', markInteraction, { once: true, capture: true });
})();
