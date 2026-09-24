(() => {
  'use strict';

  // 商务标对话区造数：只改中间对话区文案与输入框上方指令，不动页面其他区域
  // 文件与项目名称一律读当前页面上的数据，不写死
  const getTenderName = () => {
    const row = document.querySelector('#app .upload-panel .upload-group .file-row[aria-pressed="true"], #app .upload-panel .upload-group .file-row');
    const raw = row?.querySelector('.ellipsis')?.textContent?.trim() || row?.textContent?.trim() || '';
    return raw.replace(/\.docx$/i, '').trim() || '某高校高性能计算GPU集群建设项目';
  };
  const formatStamp = () => {
    const now = new Date();
    const pad = (part) => String(part).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
  };
  const ENTERPRISE = '四川华鲲振宇智能科技有限责任公司';
  const OUTLINE_PANEL_TITLE = '商务标生成大纲要素确认';
  const BODY_PANEL_TITLE = '商务标生成正文要素确认';
  const BODY_OUTLINE_DESC = '正文需依赖大纲生成，请选择项目中已生成的大纲文件。';
  let outlineRequirements = '';

  // 按原文案前缀匹配（对话由页面框架渲染，这里只替换对话区文案）
  const buildConversation = () => {
    const tender = getTenderName();
    const TENDER_DOC = `《${tender}.docx》`;
    const OUTLINE_FILE = `商务大纲_${tender}_${formatStamp()}`;
    const BODY_FILE = `商务正文_${tender}_${formatStamp()}`;
    const OUTLINE_BASE = `商务大纲_${tender}`;
    return [
    {
      prefix: '《某高校高性能计算GPU集群建设项目.docx》中有哪些主要评分项？',
      text: `${TENDER_DOC}中有哪些主要评分项？`,
    },
    {
      prefix: '根据您当前选择的相关资料',
      text: `根据您当前选择的相关资料（${TENDER_DOC}），主要评分项包括投标报价、政府采购优惠政策适用情况、类似业绩、供货安装方案、培训及售后服务方案和产品技术响应等内容。相关资料中提到：评分标准分别对投标报价、商务条款响应和技术指标响应进行综合评价。`,
    },
    {
      prefix: '根据当前项目的招标文件解读内容',
      text: '根据当前项目的招标文件内容，建议重点响应产品技术响应（53 分）、投标报价（35 分）和培训及售后服务方案（6 分）等评分项。相关依据为：评分标准对技术指标响应、报价合理性和服务方案完整性设置了较高权重。',
    },
    {
      prefix: '帮我解读招标文件。',
      occurrence: 1,
      text: '帮我生成商务标大纲。',
    },
    {
      prefix: '当前招标资料中识别到 1 份招标文件',
      text: `好的，我会为您生成商务标大纲《${OUTLINE_BASE}》。开始前需要确认招标文件和生成要求，请完成下方配置。`,
    },
    {
      prefix: '好的，我会为您生成技术标大纲',
      text: `好的，我会为您生成商务标大纲《${OUTLINE_BASE}》。开始前需要确认招标文件和生成要求，请完成下方配置。`,
    },
    { prefix: '帮我生成技术标大纲。', remove: true },
    { prefix: '在您的招标资料中暂未找到适配的核心招标文件', remove: true },
    { prefix: '帮我解读招标文件。', occurrence: 2, remove: true },
    {
      prefix: '已按照您确认的配置开始生成技术标大纲',
      text: `已按照您确认的配置开始生成商务标大纲《${OUTLINE_FILE}》。商务标大纲任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开并下载《${OUTLINE_FILE}》。`,
      configTitle: '已确认商务标大纲配置',
      rows: [
        ['招标文件', TENDER_DOC],
        ['生成要求', undefined],
      ],
    },
    {
      prefix: '已按照您确认的配置开始解读',
      text: `已按照您确认的配置开始生成商务标大纲${TENDER_DOC}。商务标大纲任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开并下载《${OUTLINE_FILE}》。`,
      configTitle: '已确认商务标大纲配置',
      rows: [
        ['招标文件', TENDER_DOC],
        ['生成要求', '保持招标原目录不变，重点细化资质材料和同类项目业绩相关子目录'],
      ],
    },
    {
      prefix: '请根据《技术标投标大纲_',
      text: `请根据《${OUTLINE_FILE}》撰写商务标全文。`,
    },
    {
      prefix: '已按照您确认的配置开始生成技术标正文',
      text: `已按照您确认的配置开始生成商务标正文《${BODY_FILE}》。商务标正文任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开并下载结果文件。\n为缩短等待时长，本次将优先生成前三章。内容生成完毕后，您可预览文稿，按需生成完整文档。`,
      configTitle: '已确认商务标正文配置',
      rows: [
        ['招标文件', TENDER_DOC],
        ['商务标大纲', OUTLINE_FILE],
        ['投标企业', ENTERPRISE],
      ],
    },
    {
      prefix: '技术标一般应如何组织章节？',
      text: '商务标一般应如何组织章节？',
    },
    {
      prefix: '当前选择的资料中暂未找到与技术标章节组织直接相关的内容',
      text: '当前选择的资料中暂未找到与商务标章节组织直接相关的内容。基于通用投标业务知识，商务标通常应围绕资格自查表、投标函及附件、报价文件、商务文件和商务响应/偏离表组织章节，并保证目录与正文逐项对应。如果您需要，我也可以继续帮您生成商务标大纲。',
    },
    { prefix: '今天上海天气怎么样？', remove: true },
    { prefix: '看起来您想了解上海的天气', remove: true },
    ];
  };

  // 输入框上方的指令（点击后填入并发送）
  const PROMPTS = ['根据招标文件生成商务标大纲。', '根据商务大纲撰写商务标全文。', '一键生成商务标。'];
  const PLACEHOLDER_MAP = {
    '根据招标文件生成技术标大纲。': '根据招标文件生成商务标大纲。',
    '根据技术标大纲撰写投标正文。': '根据商务大纲撰写商务标全文。',
    '一键生成技术标。': '一键生成商务标。',
  };
  const buildTextReplacements = (tender) => [
    ['《某高校高性能计算GPU集群建设项目.docx》', `《${tender}.docx》`],
    ['某高校高性能计算GPU集群建设项目', tender],
    ['技术标投标大纲_', '商务大纲_'],
    ['技术标投标正文_', '商务正文_'],
    ['技术标', '商务标'],
  ];

  const getMessages = () => Array.from(document.querySelectorAll('.chat-messages > .chat-message'));

  const replaceTextNodes = (root, replacements) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let value = node.nodeValue || '';
      replacements.forEach(([from, to]) => { value = value.split(from).join(to); });
      if (value !== node.nodeValue) node.nodeValue = value;
    });
  };

  const renderConfig = (message, spec) => {
    const record = message.querySelector('.config-record');
    if (!record || !spec.configTitle) return;
    const html = `<div class="config-record-title">${spec.configTitle}</div>${spec.rows
      .map(([label, value]) => `<div class="config-record-row"><span class="config-record-label">${label}</span><span class="config-record-value">${value === undefined ? (outlineRequirements || '无') : value}</span></div>`)
      .join('')}`;
    if (record.innerHTML !== html) record.innerHTML = html;
  };

  const escapeText = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  // 对话区里的大纲配置面板：技术标两步配置 -> 商务标单步要素确认
  const patchOutlineConfigPanelContent = (panel) => {
    const heading = panel.querySelector('.bid-config-head h2');
    if (heading && heading.textContent.trim() !== OUTLINE_PANEL_TITLE) {
      heading.textContent = OUTLINE_PANEL_TITLE;
    }

    const content = panel.querySelector('.outline-config-content');
    const source = getTenderName();
    if (content && content.dataset.businessSource !== source) {
      content.dataset.businessSource = source;
    }

    const footerButton = document.querySelector('.bid-config-panel footer .config-primary');
    const dependencySelect = panel.querySelector('.outline-dependency select');
    // 直接进入生成要求这一步，保持单步确认（解读依赖与页数、层级不再出现）
    if (!panel.querySelector('.outline-step-two')
      && panel.dataset.businessOutlineAdvanced !== 'true'
      && dependencySelect
      && footerButton) {
      // 标记只自动前进一次，避免同一轮里重复触发到「生成大纲」
      panel.dataset.businessOutlineAdvanced = 'true';
      const option = Array.from(dependencySelect.options).find((item) => item.value);
      if (option) {
        dependencySelect.value = option.value;
        dependencySelect.dispatchEvent(new Event('change', { bubbles: true }));
        footerButton.disabled = false;
        footerButton.click();
        return;
      }
    }
    if (!panel.querySelector('.outline-step-two')) return;

    if (footerButton && footerButton.textContent.trim() !== '生成大纲') {
      footerButton.textContent = '生成大纲';
    }

    const requirementsField = panel.querySelector('.outline-step-two textarea');
    if (requirementsField && requirementsField.dataset.businessOutlineRequirements !== 'true') {
      requirementsField.dataset.businessOutlineRequirements = 'true';
      requirementsField.addEventListener('input', () => {
        outlineRequirements = requirementsField.value.trim();
      });
    }
    if (footerButton && footerButton.dataset.businessOutlineConfirm !== 'true') {
      footerButton.dataset.businessOutlineConfirm = 'true';
      footerButton.addEventListener('click', () => {
        const field = panel.querySelector('.outline-step-two textarea');
        if (field) outlineRequirements = field.value.trim();
      }, true);
    }
  };

  // 对话区里的正文配置面板：参照精准模式 02 撰写全文弹窗替换要素
  const patchBodyConfigPanel = (panel) => {
    const heading = panel.querySelector('.bid-config-head h2');
    if (heading && heading.textContent.trim() !== BODY_PANEL_TITLE) {
      heading.textContent = BODY_PANEL_TITLE;
    }

    const card = panel.querySelector('.outline-dependency');
    if (!card) return;

    const cardTitle = card.querySelector('.outline-dependency h3');
    if (cardTitle && cardTitle.textContent.trim() !== '商务标大纲') {
      cardTitle.textContent = '商务标大纲';
    }
    const cardDesc = card.querySelector('.outline-dependency p');
    if (cardDesc && cardDesc.textContent.trim() !== BODY_OUTLINE_DESC) {
      cardDesc.textContent = BODY_OUTLINE_DESC;
    }
    card.querySelectorAll('.outline-dependency select option').forEach((option) => {
      const label = option.textContent;
      const next = label.replace('技术标投标大纲_', '商务大纲_');
      if (label !== next) option.textContent = next;
    });

    const content = panel.querySelector('.outline-config-content');
    if (content && !content.querySelector('[data-business-chat-company]')) {
      const pageSelect = document.querySelector('#app .upload-panel .company-group select');
      const companies = pageSelect
        ? Array.from(pageSelect.options)
          .filter((option) => option.value)
          .map((option) => ({ value: option.value, label: option.textContent.trim() }))
        : [];
      if (!companies.length) companies.push({ value: ENTERPRISE, label: ENTERPRISE });
      // 默认带出页面上已选的投标企业（没有就取第一家），避免选了大纲却卡在没选企业
      const defaultCompany = companies.find((company) => company.value === pageSelect?.value) || companies[0];
      const options = companies
        .map((company) => `<option value="${escapeText(company.value)}"${company === defaultCompany ? ' selected' : ''}>${escapeText(company.label)}</option>`)
        .join('');
      const field = document.createElement('label');
      field.className = 'config-field full-width business-chat-company';
      field.dataset.businessChatCompany = 'true';
      field.innerHTML = `<span><b aria-hidden="true">*</b>选择投标企业</span>`
        + `<select data-business-chat-company-select>${options}</select>`;
      content.append(field);
    }

    const companySelect = content?.querySelector('[data-business-chat-company-select]');
    const outlineSelect = content?.querySelector('.outline-dependency select');
    if (content && !content.querySelector('[data-business-chat-requirement-hint]')) {
      const hint = document.createElement('p');
      hint.className = 'business-chat-requirement-hint';
      hint.dataset.businessChatRequirementHint = 'true';
      hint.hidden = true;
      content.append(hint);
    }
    const requirementHint = content?.querySelector('[data-business-chat-requirement-hint]');
    // 缺哪一项就常驻提示，按钮不会出现「点了没反应」
    // 注意：每次都只在内容真的变化时写 DOM，否则会触发观察器无限重排
    const syncRequirements = () => {
      if (!requirementHint) return;
      const outlineReady = Boolean(outlineSelect?.value);
      const companyReady = Boolean(companySelect?.value);
      const missing = outlineReady && companyReady
        ? ''
        : (outlineReady ? '请选择投标企业后继续' : '请选择商务标大纲后继续');
      const shouldHide = !missing;
      if (requirementHint.hidden !== shouldHide) requirementHint.hidden = shouldHide;
      if (missing && requirementHint.textContent !== missing) requirementHint.textContent = missing;
    };
    [companySelect, outlineSelect].forEach((select) => {
      if (!select || select.dataset.businessChatRequirementBound === 'true') return;
      select.dataset.businessChatRequirementBound = 'true';
      select.addEventListener('change', syncRequirements);
    });
    syncRequirements();

    const footerButton = document.querySelector('.bid-config-panel footer .config-primary');
    if (footerButton && footerButton.textContent.trim() !== '生成正文') {
      footerButton.textContent = '生成正文';
    }
    if (footerButton && footerButton.dataset.businessBodyConfirm !== 'true') {
      footerButton.dataset.businessBodyConfirm = 'true';
      footerButton.addEventListener('click', (event) => {
        const select = document.querySelector('.bid-config-panel [data-business-chat-company-select]');
        if (!select || select.value) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const hint = document.querySelector('.bid-config-panel [data-business-chat-requirement-hint]');
        if (hint && hint.hidden) hint.hidden = false;
        select.focus({ preventScroll: true });
      }, true);
    }
  };

  const patchOutlineConfigPanel = () => {
    const panel = document.querySelector('.bid-config-panel');
    if (!panel) return;

    // 正文面板有大纲卡片标题，大纲面板没有
    const mode = panel.querySelector('.outline-dependency h3') ? 'body' : 'outline';
    if (panel.dataset.businessConfig !== mode) panel.dataset.businessConfig = mode;

    if (mode === 'body') patchBodyConfigPanel(panel);
    else patchOutlineConfigPanelContent(panel);
  };

  // 配置这一轮没走完之前，底部三条引导指令不出现
  const hasPendingConfigRound = () => Boolean(
    document.querySelector('.bid-config-panel') || document.querySelector('.config-waiting'),
  );

  // 只带配置确认卡、没有正文的消息（用户确认卡）也要换成商务标要素
  const patchConfirmedConfig = (message, replacements) => {
    const record = message.querySelector('.config-record');
    if (!record) return;
    const title = record.querySelector('.config-record-title')?.textContent?.trim() || '';
    if (title.includes('大纲配置')) {
      renderConfig(message, {
        configTitle: '已确认商务标大纲配置',
        rows: [
          ['招标文件', `《${getTenderName()}.docx》`],
          ['生成要求', undefined],
        ],
      });
      return;
    }
    replaceTextNodes(record, replacements);
  };

  const syncConversation = () => {
    const conversation = buildConversation();
    const replacements = buildTextReplacements(getTenderName());
    const counters = new Map();
    getMessages().forEach((message) => {
      const text = message.querySelector('.message-text');
      const current = (text?.textContent || '').trim();
      if (!current) {
        patchConfirmedConfig(message, replacements);
        return;
      }
      const spec = conversation.find((item) => current.startsWith(item.prefix));
      if (!spec) {
        if (message.classList.contains('assistant')) replaceTextNodes(message, replacements);
        return;
      }
      const seen = (counters.get(spec.prefix) || 0) + 1;
      counters.set(spec.prefix, seen);
      if (spec.occurrence && seen !== spec.occurrence) return;
      if (spec.remove) {
        message.remove();
        return;
      }
      if (spec.text && text.textContent !== spec.text) text.textContent = spec.text;
      renderConfig(message, spec);
    });
  };

  const getPromptBar = () => {
    let bar = document.querySelector('[data-business-built-in-prompts]');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.className = 'message-suggestions active-built-in-prompts';
    bar.dataset.businessBuiltInPrompts = 'true';
    bar.innerHTML = PROMPTS
      .map((prompt) => `<button type="button" data-business-built-in-prompt="${prompt}">${prompt}</button>`)
      .join('');
    return bar;
  };

  const syncPromptBar = () => {
    const list = document.querySelector('.chat-messages');
    if (!list) return;
    const bar = getPromptBar();
    const pending = hasPendingConfigRound();
    // 引导问题固定在对话最下边（最后一条消息之后）
    if (!pending && list.lastElementChild !== bar) list.append(bar);
    bar.style.display = pending ? 'none' : '';
  };

  // 项目介绍卡片下边的推荐问题去掉
  const removeWelcomeSuggestions = () => {
    document.querySelectorAll('.suggestions, .context-suggestions').forEach((element) => {
      if (element.classList.contains('message-suggestions')) return;
      if (element.closest('.chat-messages')) return;
      element.remove();
    });
  };

  const syncPlaceholder = () => {
    const input = document.querySelector('.chat-input input[aria-label="提问内容"]');
    if (!input) return;
    const mapped = PLACEHOLDER_MAP[input.placeholder];
    if (mapped && mapped !== input.placeholder) input.placeholder = mapped;
  };

  const sendPrompt = (prompt) => {
    const form = document.querySelector('.chat-input');
    const input = form?.querySelector('input[aria-label="提问内容"]');
    if (!form || !input || input.disabled) return;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (valueSetter) valueSetter.call(input, prompt);
    else input.value = prompt;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    window.setTimeout(() => {
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 30);
  };

  const syncAll = () => {
    syncPlaceholder();
    syncConversation();
    patchOutlineConfigPanel();
    removeWelcomeSuggestions();
    syncPromptBar();
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-business-built-in-prompt]');
    if (!button) return;
    event.preventDefault();
    sendPrompt(button.dataset.businessBuiltInPrompt);
  });

  const app = document.getElementById('app');
  syncAll();
  if (app) {
    new MutationObserver(syncAll).observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['placeholder'] });
  }
})();
