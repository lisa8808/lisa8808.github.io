(() => {
  const ACTIVE_PAGE = './interpretation-detail-active.html';
  const EMPTY_PAGE = './interpretation-detail-empty.html';

  // 列表演示数据：第一项带完整演示内容，其余项目点进去只有上传招标文件的空白页。
  const PROJECT_OWNER = '易天行';
  const pad = (value) => String(value).padStart(2, '0');
  const formatDateTime = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const loadedAt = Date.now();
  // 项目时间都按“现在”往前推，保证演示数据看上去是最近创建、最近访问的。
  const recentTime = (minutes) => formatDateTime(new Date(loadedAt - Math.round(minutes * 60 * 1000)));
  const HOUR = 60;
  const DAY = 24 * HOUR;

  const PROJECTS = [
    {
      title: '某高校高性能计算GPU集群建设项目',
      description: '已完成2次技术标撰写，3次商务标撰写',
      minutesAgo: 6,
    },
    {
      title: '市政务云信创服务器采购项目',
      description: '尚未上传招标资料',
      minutesAgo: 2 * HOUR + 18,
      empty: true,
    },
    {
      title: '城市轨道交通智能运维平台建设项目',
      description: '尚未上传招标资料',
      minutesAgo: DAY + 5 * HOUR,
      empty: true,
    },
    {
      title: '三甲医院数据中心机房设备采购项目',
      description: '尚未上传招标资料',
      minutesAgo: 3 * DAY + 7 * HOUR,
      empty: true,
    },
    {
      title: '省级电网调度自动化系统改造项目',
      description: '尚未上传招标资料',
      minutesAgo: 6 * DAY + 9 * HOUR,
      empty: true,
    },
    {
      title: '智慧园区安防监控与门禁系统集成项目',
      description: '尚未上传招标资料',
      minutesAgo: 13 * DAY + 4 * HOUR,
      empty: true,
    },
  ]
    .map((project) => {
      const date = recentTime(project.minutesAgo);
      window.ProjectCreatedTime?.remember(project.title, date);
      return { ...project, date };
    })
    .sort((a, b) => a.minutesAgo - b.minutesAgo);

  const setText = (node, value) => {
    if (!node || node.textContent.trim() === value) return;
    node.textContent = value;
  };

  const ensureCardOwner = (card) => {
    let owner = card.querySelector(':scope > .tender-card-owner');
    if (!owner) {
      owner = document.createElement('span');
      owner.className = 'tender-card-owner';
      owner.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
      const name = document.createElement('span');
      name.className = 'tender-card-owner-name';
      name.textContent = PROJECT_OWNER;
      owner.append(name);
      card.append(owner);
    }
    const name = owner.querySelector('.tender-card-owner-name');
    if (name && name.textContent !== PROJECT_OWNER) name.textContent = PROJECT_OWNER;
    return owner;
  };

  // 编辑人跟当前时间同一行：详情页式卡片靠左，列表视图里时间靠右，所以按时间实际位置贴着它的左侧排。
  const layoutCardOwner = (card, owner) => {
    const date = card.querySelector('.tender-card-date');
    if (!date) return;
    const listView = Boolean(card.closest('.project-grid')?.classList.contains('list-view'));
    if (listView) {
      // 列表视图卡片只有 94px 高，时间右侧就是操作按钮，编辑人在这个视图里不展示，
      // 但要把网格视图留下的内联定位清掉，让时间回到列表视图自己的位置。
      if (date.style.left) date.style.left = '';
      return;
    }
    const cardBox = card.getBoundingClientRect();
    const dateBox = date.getBoundingClientRect();
    const ownerWidth = Math.ceil(owner.getBoundingClientRect().width);
    if (!ownerWidth) return;

    const bottom = Math.max(0, Math.round(cardBox.bottom - dateBox.bottom));
    owner.style.top = 'auto';
    owner.style.bottom = `${bottom}px`;
    owner.style.right = 'auto';
    owner.style.left = '22px';
    date.style.left = `${22 + ownerWidth + 12}px`;
  };

  const reconcileProjectCards = () => {
    const cards = Array.from(document.querySelectorAll('.tender-card'));
    if (!cards.length) return false;
    // 搜索过滤会改变卡片数量，这时不改名，避免项目名称与卡片错位。
    if (cards.length !== PROJECTS.length) return true;

    cards.forEach((card, index) => {
      const project = PROJECTS[index];
      const title = card.querySelector('.tender-card-title');
      setText(title, project.title);
      if (title) title.title = project.title;
      setText(card.querySelector('.tender-card-description'), project.description);
      setText(card.querySelector('.tender-card-date'), project.date);
      card.dataset.projectCreatedAt = project.date;
      layoutCardOwner(card, ensureCardOwner(card));
      if (project.empty) card.dataset.demoEmptyProject = 'true';
      else delete card.dataset.demoEmptyProject;
    });
    return true;
  };

  const openProject = (card) => {
    const projectName = card.querySelector('.tender-card-title')?.textContent?.trim();
    const target = new URL(
      card.dataset.demoEmptyProject === 'true' ? EMPTY_PAGE : ACTIVE_PAGE,
      window.location.href,
    );
    if (projectName) target.searchParams.set('project', projectName);
    if (card.dataset.projectCreatedAt) target.searchParams.set('createdAt', card.dataset.projectCreatedAt);
    window.location.href = target.href;
  };

  const activateProjectCard = (event) => {
    const card = event.target?.closest?.('.tender-card');
    if (!card || event.target.closest('.tender-card-actions')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openProject(card);
  };

  // 公共头部的列表点击拦截注册在本脚本之前，所以卡片跳转要在 window 捕获阶段先接管，
  // 按项目带上名称参数：带内容的项目进详情页，其余项目进只有上传入口的空白页。
  window.addEventListener('click', activateProjectCard, true);
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    activateProjectCard(event);
  }, true);

  reconcileProjectCards();
  const observer = new MutationObserver(reconcileProjectCards);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
  // 卡片样式表、字体晚于脚本生效时，编辑人的宽度会变，需要再排一次。
  document.addEventListener('list-unified-css-ready', reconcileProjectCards);
  window.addEventListener('load', reconcileProjectCards);
  document.fonts?.ready?.then(reconcileProjectCards);
})();
