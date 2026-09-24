(() => {
  const config = window.__TENDER_BUSINESS_MODE_CONFIG__;
  if (!config) return;

  const companyCodes = {
    四川华鲲振宇智能科技有限责任公司: '91510100MA67G71FX6',
    北京华鲲振宇智能科技有限责任公司: '91110113MA02MJWB42',
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const mount = () => {
    const group = document.querySelector('#app .upload-panel .company-group');
    const select = group?.querySelector('select');
    if (!group || !select || group.dataset.companySelectorReady === 'true') return false;
    group.dataset.companySelectorReady = 'true';

    const companies = Array.from(select.options)
      .filter((option) => !option.disabled && (option.value || option.textContent.trim()))
      .map((option, index) => {
        const name = option.textContent.trim();
        const id = option.value || name || `company-${index}`;
        option.value = id;
        return { id, name, code: companyCodes[name] || `91${String(index + 1).padStart(16, '0')}` };
      });

    select.classList.add('business-company-native-select');
    select.setAttribute('aria-hidden', 'true');
    select.tabIndex = -1;

    const trigger = document.createElement('button');
    trigger.className = 'business-company-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.innerHTML = '<span data-company-trigger-label>选择企业</span><span class="business-company-chevron" aria-hidden="true">⌄</span>';
    group.append(trigger);

    const mask = document.createElement('div');
    mask.className = 'business-company-mask';
    mask.hidden = true;
    mask.innerHTML = `
      <section class="business-company-modal" role="dialog" aria-modal="true" aria-labelledby="business-company-title">
        <header><h2 id="business-company-title">选择投标企业</h2><button type="button" class="business-company-close" data-company-close aria-label="关闭">×</button></header>
        <div class="business-company-content">
          <label class="business-company-search"><span aria-hidden="true">⌕</span><input type="search" data-company-search placeholder="搜索企业名称或统一社会信用代码" aria-label="搜索企业名称或统一社会信用代码"></label>
          <div class="business-company-list" data-company-list role="radiogroup" aria-label="投标企业列表"></div>
          <div class="business-company-empty" data-company-empty hidden></div>
          <a class="business-company-create" href="./company-create.html"><span class="business-company-building" aria-hidden="true">▥</span><span>需要添加新企业？请前往 <strong>企业管理</strong> 完善信息后再选择。</span><span aria-hidden="true">›</span></a>
        </div>
        <footer><button type="button" class="business-company-cancel" data-company-cancel>取消</button><button type="button" class="business-company-confirm" data-company-confirm disabled>确认</button></footer>
      </section>`;
    document.body.append(mask);

    const search = mask.querySelector('[data-company-search]');
    const list = mask.querySelector('[data-company-list]');
    const empty = mask.querySelector('[data-company-empty]');
    const confirm = mask.querySelector('[data-company-confirm]');
    const triggerLabel = trigger.querySelector('[data-company-trigger-label]');
    let pendingId = '';

    const syncTrigger = () => {
      const selected = config.resolveTenderCompany(companies, select.value);
      triggerLabel.textContent = selected?.name || '选择企业';
      trigger.classList.toggle('has-value', Boolean(selected));
    };

    const render = () => {
      const visibleCompanies = config.filterTenderCompanies(companies, search.value);
      list.innerHTML = visibleCompanies.map((company) => {
        const selected = company.id === pendingId;
        return `<button class="business-company-option${selected ? ' selected' : ''}" type="button" role="radio" aria-checked="${selected}" data-company-id="${escapeHtml(company.id)}"><span class="business-company-radio" aria-hidden="true"></span><span><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.code)}</small></span></button>`;
      }).join('');
      const hasResults = visibleCompanies.length > 0;
      list.hidden = !hasResults;
      empty.hidden = hasResults;
      empty.textContent = companies.length ? '未找到匹配企业' : '暂无可选择企业，请先添加企业';
      confirm.disabled = !config.resolveTenderCompany(companies, pendingId);
    };

    const close = () => {
      mask.hidden = true;
      document.body.classList.remove('business-company-selector-open');
      trigger.focus({ preventScroll: true });
    };

    const open = () => {
      pendingId = config.resolveTenderCompany(companies, select.value)?.id || '';
      search.value = '';
      render();
      mask.hidden = false;
      document.body.classList.add('business-company-selector-open');
      search.focus({ preventScroll: true });
    };

    trigger.addEventListener('click', open);
    mask.querySelector('[data-company-close]').addEventListener('click', close);
    mask.querySelector('[data-company-cancel]').addEventListener('click', close);
    mask.addEventListener('click', (event) => { if (event.target === mask) close(); });
    search.addEventListener('input', render);
    list.addEventListener('click', (event) => {
      const option = event.target.closest('[data-company-id]');
      if (!option) return;
      pendingId = option.dataset.companyId;
      render();
    });
    confirm.addEventListener('click', () => {
      const selected = config.resolveTenderCompany(companies, pendingId);
      if (!selected) return;
      select.value = selected.id;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncTrigger();
      close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mask.hidden) close();
    });

    syncTrigger();
    return true;
  };

  if (!mount()) {
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
