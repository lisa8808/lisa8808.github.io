const MODULE_ROUTES = new Map([
  ['标书撰写', './index.html'],
  ['智能审查', './intelligent-review.html'],
  ['企业信息', './company-management.html'],
  ['图库管理', './gallery-management.html'],
]);

const NEW_REVIEW_ROUTE = './intelligent-review-new.html';
const DETAIL_REVIEW_ROUTE = './intelligent-review-detail.html';
const REAL_PROJECT_NAME = '某单位大语言模型AI算力基础设施建设项目';
const REAL_TENDER_FILE = '某单位大语言模型AI算力基础设施建设项目招标文件 最终版.docx';

function moduleDestination(moduleName) {
  return MODULE_ROUTES.get(moduleName) ?? null;
}

function reviewDestination(projectId = '') {
  return projectId
    ? `${DETAIL_REVIEW_ROUTE}?project=${encodeURIComponent(projectId)}`
    : DETAIL_REVIEW_ROUTE;
}

globalThis.intelligentReviewModuleDestination = moduleDestination;
globalThis.reviewDestination = reviewDestination;

if (typeof document !== 'undefined' && document.body?.dataset.page === 'intelligent-review') {
  initializeReviewList();
}

function initializeReviewList() {
  const grid = document.querySelector('#reviewGrid');
  const empty = document.querySelector('#reviewEmpty');
  const searchControl = document.querySelector('#searchControl');
  const searchInput = document.querySelector('#reviewSearch');
  const searchButton = document.querySelector('#searchButton');
  const projectTime = globalThis.ProjectCreatedTime;

  function cardDestination(card) {
    const target = new URL(card.dataset.href || DETAIL_REVIEW_ROUTE, window.location.href);
    const projectName = card.dataset.title || '';
    const displayedTime = card.querySelector('time')?.textContent?.trim() || '';
    const createdAt = projectTime?.parse(displayedTime);
    if (projectName && !target.searchParams.has('project')) target.searchParams.set('project', projectName);
    if (createdAt) target.searchParams.set('createdAt', projectTime.formatCard(createdAt));
    return target.href;
  }

  function describeProject(project) {
    const histories = Array.isArray(project.histories) ? project.histories : [];
    const reviewing = histories.find((entry) => window.Review2Store.historyStatus(entry) === 'reviewing');
    if (reviewing) return `正在审查《${window.Review2Store.stripExt(reviewing.bidName)}》`;
    if (!histories.length) return '已创建，尚未开始审查';
    const latest = histories[0];
    const issues = latest ? (latest.issues || 0) : 0;
    return `已完成${histories.length}次标书审查，最新发现${issues}项问题`;
  }

  function isRealDemoProject(project) {
    return project
      && project.scheme === 'review1'
      && project.name === REAL_PROJECT_NAME
      && project.tenderFile?.name === REAL_TENDER_FILE;
  }

  function cleanStoredProjects() {
    if (!window.Review2Store) return;
    const projects = window.Review2Store.read();
    const filtered = projects.filter((project) => project.scheme !== 'review2' && !isRealDemoProject(project));
    if (filtered.length !== projects.length) window.Review2Store.write(filtered);
  }

  function renderStoredProjects() {
    if (!window.Review2Store) return;
    const template = document.querySelector('#storedReviewTemplate');
    grid.querySelectorAll('[data-stored-project]').forEach((card) => card.remove());

    window.Review2Store.read()
      .slice()
      .reverse()
      .filter((project) => project.scheme === 'review1')
      .forEach((project) => {
        const card = template.content.firstElementChild.cloneNode(true);
        const histories = Array.isArray(project.histories) ? project.histories : [];
        const latest = project.updatedAt || histories[0]?.createdAt || project.createdAt;
        const reviewing = histories.some((entry) => window.Review2Store.historyStatus(entry) === 'reviewing');

        card.dataset.storedProject = 'true';
        card.dataset.projectId = project.id;
        card.dataset.href = reviewDestination(project.id);
        card.dataset.title = project.name;
        card.title = project.name;
        card.querySelector('h2').textContent = project.name;
        card.querySelector('.review-description').textContent = describeProject(project);
        const latestDate = projectTime?.parse(latest) || latest;
        card.querySelector('time').textContent = projectTime?.formatCard(latestDate) || window.Review2Store.fmtTime(latest);
        projectTime?.remember(project.name, latestDate);
        card.classList.toggle('is-reviewing', reviewing);
        card.querySelector('.completion-badge').setAttribute('aria-label', reviewing ? '审查中' : '已创建');
        card.querySelector('[data-edit-review]').setAttribute('aria-label', `编辑${project.name}`);
        card.querySelector('[data-delete-review]').setAttribute('aria-label', `删除${project.name}`);
        grid.appendChild(card);
      });
  }

  function presetStatusKeyOf(card) {
    return window.Review2Store.presetStatusKey(card.dataset.title || REAL_PROJECT_NAME);
  }

  function updatePresetProjectCards() {
    grid.querySelectorAll('[data-real-project]').forEach((card) => {
      let status = {};
      try {
        status = JSON.parse(window.localStorage.getItem(presetStatusKeyOf(card)) || '{}');
      } catch (error) {
        status = {};
      }
      const defaultReviews = Number(card.dataset.defaultReviews) || 2;
      const defaultIssues = Number(card.dataset.defaultIssues) || 0;
      const reviews = Number.isFinite(status.reviews) ? status.reviews : defaultReviews;
      const issues = Number.isFinite(status.issues) ? status.issues : defaultIssues;
      const fallbackTime = card.dataset.defaultUpdated ? new Date(card.dataset.defaultUpdated) : new Date();
      const storedTime = projectTime?.read(card.dataset.title);
      const updatedAt = status.updatedAt ? new Date(status.updatedAt) : storedTime || fallbackTime;
      card.querySelector('.review-description').textContent = `已完成${reviews}次标书审查，最新发现${issues}项问题`;
      card.querySelector('time').textContent = projectTime?.formatCard(updatedAt) || updatedAt.toLocaleString('zh-CN', { hour12: false });
      projectTime?.remember(card.dataset.title, updatedAt);
    });
  }

  function filterCards() {
    const query = searchInput.value.trim().toLocaleLowerCase('zh-CN');
    let visibleCount = 0;
    grid.querySelectorAll('[data-review-project]').forEach((card) => {
      const matches = !query || (card.dataset.title || '').toLocaleLowerCase('zh-CN').includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    empty.hidden = visibleCount > 0;
  }

  function refresh() {
    renderStoredProjects();
    updatePresetProjectCards();
    filterCards();
  }

  document.addEventListener('click', (event) => {
    const moduleButton = event.target.closest('[data-module]');
    if (moduleButton) {
      const destination = moduleDestination(moduleButton.dataset.module);
      if (destination) {
        event.preventDefault();
        window.location.href = destination;
      }
      return;
    }

    if (event.target.closest('[data-create-review]')) {
      window.location.href = NEW_REVIEW_ROUTE;
      return;
    }

    const card = event.target.closest('[data-review-project]');
    if (!card) return;
    if (event.target.closest('[data-edit-review]')) {
      if (!card.dataset.projectId || !window.Review2Store) {
        showToast('预置演示项目名称不可编辑');
        return;
      }
      const project = window.Review2Store.find(card.dataset.projectId);
      if (!project) return;
      const nextName = window.prompt('编辑项目名称', project.name);
      if (nextName === null) return;
      const normalizedName = nextName.trim();
      if (!normalizedName) {
        showToast('项目名称不能为空');
        return;
      }
      project.name = normalizedName;
      window.Review2Store.save(project);
      refresh();
      showToast('项目名称已更新');
      return;
    }
    if (event.target.closest('[data-delete-review]')) {
      if (!window.confirm('确定删除该审查项目吗？')) return;
      if (card.dataset.projectId && window.Review2Store) window.Review2Store.remove(card.dataset.projectId);
      card.remove();
      filterCards();
      showToast('审查项目已删除');
      return;
    }
    window.location.href = cardDestination(card);
  });

  grid.addEventListener('keydown', (event) => {
    const card = event.target.closest('[data-review-project]');
    if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    window.location.href = cardDestination(card);
  });

  searchInput.addEventListener('input', filterCards);
  searchButton.addEventListener('click', () => {
    const open = !searchControl.classList.contains('open');
    searchControl.classList.toggle('open', open);
    searchButton.setAttribute('aria-expanded', String(open));
    if (open) searchInput.focus();
    if (!open && !searchInput.value) filterCards();
  });

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const listView = button.dataset.view === 'list';
      grid.classList.toggle('list-view', listView);
      document.querySelectorAll('[data-view]').forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle('active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
    });
  });

  window.addEventListener('storage', (event) => {
    const presetKeys = [...grid.querySelectorAll('[data-real-project]')].map((card) => presetStatusKeyOf(card));
    if (!event.key || event.key === 'review2Projects' || presetKeys.includes(event.key)) refresh();
  });
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });

  cleanStoredProjects();
  refresh();
}

function showToast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { element.hidden = true; }, 2200);
}
