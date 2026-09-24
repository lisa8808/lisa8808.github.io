(function () {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './assets/list-unified.css?v=20260911-owner2';
  link.addEventListener('load', function () {
    document.dispatchEvent(new CustomEvent('list-unified-css-ready'));
  });
  document.head.appendChild(link);
})();
