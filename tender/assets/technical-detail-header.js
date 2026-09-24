(function () {
  function bindHeader() {
    var logo = document.querySelector('.brand-logo-crop');
    var product = document.querySelector('.brand-product');
    var project = document.querySelector('.brand-project');
    if (!logo || !product || !project || product.dataset.headerBound === 'true') return false;

    product.dataset.headerBound = 'true';
    logo.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    product.setAttribute('role', 'link');
    product.setAttribute('tabindex', '0');
    product.setAttribute('aria-label', '返回标书撰写列表');

    var goToList = function (event) {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = './index.html';
    };

    product.addEventListener('click', goToList);
    product.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') goToList(event);
    });

    project.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    project.addEventListener('keydown', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    return true;
  }

  if (!bindHeader()) {
    var observer = new MutationObserver(function () {
      if (bindHeader()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
