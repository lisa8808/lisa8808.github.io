(function () {
  var moduleRoutes = {
    '标书撰写': './index.html',
    '智能审查': './intelligent-review.html',
    '企业信息': './company-management.html',
    '图库管理': './gallery-management.html'
  };

  function moduleTab(node) {
    if (!node || !node.closest) return null;

    var tab = node.closest('[data-module], .primary-tab');
    if (tab) return tab;

    // Bundles sometimes render module buttons without a data-module attribute.
    var control = node.closest('button, a, [role="tab"], [role="link"]');
    if (!control) return null;
    return control.closest('.primary-tabs, [aria-label*="模块"], .list-toolbar') ? control : null;
  }

  function samePage(destination) {
    if (typeof URL !== 'function') return false;
    try {
      var target = new URL(destination, window.location.href);
      return target.pathname === new URL(window.location.href).pathname;
    } catch (error) {
      return false;
    }
  }

  function navigateModule(event) {
    var target = moduleTab(event.target);
    if (!target) return;

    var moduleName = (target.dataset.module || target.textContent || '').trim();
    var destination = moduleRoutes[moduleName];
    if (!destination || samePage(destination)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.href = destination;
  }

  document.addEventListener('click', navigateModule, true);

  window.sharedModuleRoutes = moduleRoutes;
  window.sharedModuleDestination = function (moduleName) {
    return moduleRoutes[String(moduleName == null ? '' : moduleName).trim()] || null;
  };

  function navigateTenderProject(event) {
    if (!window.location.pathname.endsWith('/index.html')) return;

    var target = event.target;
    if (!target || !target.closest) return;

    var existingCard = target.closest('.tender-card');
    if (existingCard && target.closest('.tender-card-actions')) return;

    var destination = null;
    if (target.closest('.create-button, .new-project-card')) {
      destination = './interpretation-detail-empty.html';
    } else if (existingCard) {
      destination = './interpretation-detail-active.html';
    }

    if (!destination) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.href = destination;
  }

  document.addEventListener('click', navigateTenderProject, true);

  function bindHeader() {
    var logo = document.querySelector('.brand-logo-crop, .brand-mark');
    var brand = logo && logo.closest('.brand');
    var logoImage = logo && logo.querySelector('img');
    var product = document.querySelector('.brand-product');
    var project = document.querySelector('.brand-project');
    if (!logo || !brand || logo.dataset.sharedLogoBound === 'true') return false;

    // Some standalone bundles render the brand shell without preserving the image URL.
    if (!logoImage) {
      logoImage = document.createElement('img');
      logoImage.alt = '华鲲元启 | 智能投标';
      logo.appendChild(logoImage);
    }
    var fallbackLogo = './assets/list-huakun-tender-logo-cczIqQ47.png';
    var useFallbackLogo = function () {
      if (logoImage.dataset.sharedLogoFallback === 'true') return;
      logoImage.dataset.sharedLogoFallback = 'true';
      logoImage.src = fallbackLogo;
    };
    logoImage.addEventListener('error', useFallbackLogo);
    if (!logoImage.getAttribute('src')) useFallbackLogo();
    else if (logoImage.complete && logoImage.naturalWidth === 0) useFallbackLogo();
    logoImage.style.display = 'block';
    logoImage.style.visibility = 'visible';
    logoImage.style.opacity = '1';

    logo.dataset.sharedLogoBound = 'true';
    if (!product) {
      var dot = document.createElement('span');
      dot.className = 'brand-dot';
      dot.textContent = '·';
      brand.insertBefore(dot, logo.nextSibling);
      product = document.createElement('span');
      product.className = 'brand-product shared-brand-product';
      product.textContent = 'AI投标助手';
      brand.appendChild(product);
    }

    if (isListPage()) {
      var listSeparator = brand.querySelector('.brand-separator');
      var listProject = brand.querySelector('.brand-project');
      if (listSeparator) listSeparator.remove();
      if (listProject) listProject.remove();
    } else {
      if (!brand.querySelector('.brand-separator')) {
        var separator = document.createElement('span');
        separator.className = 'brand-separator';
        brand.appendChild(separator);
      }

      if (!project) {
        project = document.createElement('span');
        project.className = 'brand-project';
        brand.appendChild(project);
      }
      project.textContent = getProjectName();
    }
    product.dataset.sharedHeaderBound = 'true';
    product.setAttribute('role', 'link');
    product.setAttribute('tabindex', '0');
    product.setAttribute('aria-label', '返回标书撰写列表');

    var stop = function (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    var goToList = function (event) {
      stop(event);
      window.location.href = './index.html';
    };

    logo.addEventListener('click', stop);
    product.addEventListener('click', goToList);
    product.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') goToList(event);
    });

    if (project) {
      project.addEventListener('click', stop);
      project.addEventListener('keydown', stop);
    }
    return true;
  }

  function getPageName() {
    var path = window.location.pathname;
    if (path.endsWith('company-management.html')) return '企业信息';
    if (path.endsWith('gallery-management.html')) return '图库管理';
    if (path.endsWith('business-detail-active.html')) return '商务标';
    if (path.endsWith('interpretation-detail-empty.html')) return '标书撰写';
    if (path.endsWith('technical-detail-empty.html') || path.endsWith('technical-detail-active.html')) return '技术标';
    return '标书撰写';
  }

  function getProjectName() {
    var hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    var projectName = hashParams.get('project') || new URLSearchParams(window.location.search).get('project');
    if (projectName) return projectName;

    var detailProject = document.querySelector('.project-assistant-brand h1');
    if (detailProject && detailProject.textContent.trim()) return detailProject.textContent.trim();

    var path = window.location.pathname;
    // 空白页是还没上传招标资料的新项目，没有正式项目名。
    if (path.endsWith('interpretation-detail-empty.html') || path.endsWith('technical-detail-empty.html')) {
      return '未命名项目';
    }
    if (path.endsWith('technical-detail-active.html') || path.endsWith('interpretation-detail-active.html') || path.endsWith('deviation-detail-active.html') || path.endsWith('business-detail-active.html')) {
      return '某高校高性能计算GPU集群建设项目';
    }
    return getPageName();
  }

  function isListPage() {
    var app = document.querySelector('.app');
    return Boolean(app && app.classList.contains('is-list'));
  }

  if (!bindHeader()) {
    var observer = new MutationObserver(function () {
      if (bindHeader()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
