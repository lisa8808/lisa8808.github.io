(() => {
  const PROJECT_NAME = '某高校高性能计算GPU集群建设项目';
  const CORE_FILE = '某高校高性能计算GPU集群建设项目.docx';
  const FOLLOW_UP_QUESTIONS = ['解读招标文件要点', '开展投标符合性自评', '查看项目与评分解析'];
  const CONTEXT_PROMPTS = ['帮我做标书要点解读', '帮我做投标符合性自评', '查看项目与评分解析'];
  const FLOW_BY_PROMPT = new Map([
    [FOLLOW_UP_QUESTIONS[0], 'interpretation'],
    [CONTEXT_PROMPTS[0], 'interpretation'],
    [FOLLOW_UP_QUESTIONS[1], 'assessment'],
    [CONTEXT_PROMPTS[1], 'assessment'],
    [FOLLOW_UP_QUESTIONS[2], 'score'],
    [CONTEXT_PROMPTS[2], 'score'],
  ]);
  const ASSESSMENT_COMPANIES = [
    '四川华鲲振宇智能科技有限责任公司',
    '北京华鲲振宇智能科技有限责任公司',
  ];

  const DEMO_MESSAGES = [
    {
      question: '这个项目主要建设什么，交付范围有哪些？',
      answer: '根据当前选择的招标资料，本项目面向某高校建设高性能计算 GPU 集群，交付范围包括计算节点、GPU 加速卡、存储与高速网络、集群调度平台、机房部署、系统集成、验收测试和运维服务。重点是形成可稳定运行的异构算力平台，而不只是提供硬件设备。',
    },
    {
      question: '评标时最需要重点响应哪些内容？',
      answer: `建议优先响应四类内容：GPU 算力与节点配置、异构架构兼容性、集群部署和性能验证方案、售后与驻场服务保障。依据《${CORE_FILE}》中的评分标准，评审会重点关注方案完整性、性能指标可验证性、实施进度、项目团队经验以及故障响应机制，建议在技术方案中逐项对应评分标准。`,
    },
    {
      question: '帮我做标书要点解读。',
      answer: `当前招标资料中识别到 1 份核心招标文件：《${CORE_FILE}》。请确认是否使用该文件执行标书要点解读，确认后我再继续。`,
    },
    {
      question: `确认使用《${CORE_FILE}》做标书要点解读。`,
      label: '用户确认',
      configTitle: '已确认标书要点解读配置',
      config: [
        ['招标文件', `《${CORE_FILE}》`],
        ['任务类型', '标书要点解读'],
      ],
      answer: `已按照您确认的配置开始解读《${CORE_FILE}》。标书要点解读任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开查看《标书要点解读_${CORE_FILE.replace(/\.[^.]+$/, '')}》。`,
    },
    {
      question: '基于标书要点解读，帮我做投标符合性自评。',
      configTitle: '投标符合性自评配置确认',
      config: [
        ['招标文件', `《${CORE_FILE}》`],
        ['评估企业主体', '请选择评估企业主体', 'enterprise'],
        ['评估范围', '时间与递交约束、投标人资格要求、★号及不允许偏离项、明确废标约束'],
      ],
      pendingConfirm: true,
      suggestions: ['取消', '确认并开始投标符合性自评'],
      answer: '好的，我会基于标书要点解读结果和企业资料，对时间节点、投标人资格、★号及不允许偏离项、明确废标约束进行逐项核对。开始前需要确认评估企业主体，请在下方配置弹窗中选择企业。请选择评估企业主体，确认并开始投标符合性自评后，系统会生成逐项评估结果。',
      waiting: ['等待您的回答……', '等待用户确认 · 正在确认【评估企业主体】'],
    },
    {
      question: '选择四川华鲲振宇智能科技有限责任公司进行评估。',
      label: '用户确认',
      configTitle: '已确认投标符合性自评配置',
      config: [
        ['招标文件', `《${CORE_FILE}》`],
        ['评估企业主体', '四川华鲲振宇智能科技有限责任公司'],
        ['评估范围', '时间与递交约束、投标人资格要求、★号及不允许偏离项、明确废标约束'],
      ],
      answer: `已按照您确认的配置开始投标符合性自评《${CORE_FILE}》。投标符合性自评任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开并下载评估结果。`,
    },
    {
      question: '请把待确认项和可能导致废标的风险先列出来。',
      suggestions: ['解读招标文件要点', '开展投标符合性自评', '查看项目与评分解析'],
      answer: '当前初步核对发现：投标截止时间、技术保证金到账状态、同类业绩是否满足项目定义、原厂授权及项目期社保材料仍需人工确认；有效供应商数量和报价规则属于竞争与报价风险，系统会单独提示，不直接判定企业满足或不满足。',
    },
  ];

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

  const stripExtension = (name) => String(name || '').replace(/\.[^.]+$/, '');

  const bridge = () => window.__prebidConversationBridge || null;

  const projectTenderFileName = () => {
    const name = bridge()?.projectTenderFileName?.();
    return name || CORE_FILE;
  };

  const coreTenderAvailable = () => {
    const available = bridge()?.coreTenderAvailable?.();
    return typeof available === 'boolean' ? available : true;
  };

  const generatedInterpretationFiles = () => bridge()?.interpretationFiles?.() || [];

  const missingCoreFileText = '在您的招标资料中暂未找到适配的核心招标文件，请检查是否在“招标资料”中已上传并勾选核心招标文件。';

  let conversationRoot = null;
  let messageList = null;
  let actionTemplate = null;
  let pendingConfigCancel = null;

  const scrollConversation = () => {
    if (!conversationRoot || typeof conversationRoot.scrollTo !== 'function') return;
    window.requestAnimationFrame(() => {
      conversationRoot.scrollTo({ top: conversationRoot.scrollHeight, behavior: 'smooth' });
    });
  };

  const hideFollowUpQuestions = () => {
    conversationRoot?.querySelectorAll('.message-suggestions:not(.pending-confirm-actions)')
      .forEach((container) => { container.style.display = 'none'; });
  };

  const showToast = (message) => {
    document.querySelector('[data-interpretation-conversation-toast]')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.interpretationConversationToast = 'true';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.append(toast);
    window.clearTimeout(window.__interpretationConversationToastTimer);
    window.__interpretationConversationToastTimer = window.setTimeout(() => toast.remove(), 2400);
  };

  const createMessageActions = (template) => {
    if (template) return template.cloneNode(true);
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    const save = document.createElement('button');
    save.className = 'save-note';
    save.type = 'button';
    save.innerHTML = '<span>保存问答</span>';
    const copy = document.createElement('button');
    copy.className = 'copy-action';
    copy.type = 'button';
    copy.setAttribute('aria-label', '复制回复');
    copy.textContent = '复制';
    actions.append(save, copy);
    return actions;
  };

  const createAssistantMessage = (item, actionTemplate) => {
    const message = document.createElement('div');
    message.className = 'chat-message assistant';

    if (item.label) {
      const label = document.createElement('b');
      label.className = 'message-label';
      label.textContent = item.label;
      message.append(label);
    }

    if (item.config) {
      const config = document.createElement('div');
      config.className = `config-record${item.pendingConfirm ? ' pending-confirm-card' : ''}`;
      const title = document.createElement('div');
      title.className = 'config-record-title';
      title.textContent = item.configTitle;
      config.append(title);
      item.config.forEach(([labelText, valueText, controlType]) => {
        const row = document.createElement('div');
        row.className = 'config-record-row';
        const label = document.createElement('span');
        label.className = 'config-record-label';
        label.textContent = labelText;
        const value = controlType === 'enterprise'
          ? document.createElement('select')
          : document.createElement('span');
        value.className = 'config-record-value';
        if (controlType === 'enterprise') {
          value.setAttribute('aria-label', '选择评估企业主体');
          value.innerHTML = '<option value="" selected disabled>请选择评估企业主体</option><option>四川华鲲振宇智能科技有限责任公司</option><option>北京华鲲振宇智能科技有限责任公司</option>';
        } else {
          value.textContent = valueText;
        }
        row.append(label, value);
        config.append(row);
      });
      message.append(config);
    }

    const text = document.createElement('span');
    text.className = 'message-text';
    text.textContent = item.answer;
    message.append(text);

    if (item.waiting) {
      const waiting = document.createElement('div');
      waiting.className = 'config-waiting';
      const [headline, detail] = item.waiting;
      const headlineElement = document.createElement('strong');
      headlineElement.textContent = headline;
      waiting.append(headlineElement);
      if (detail) {
        const detailElement = document.createElement('span');
        detailElement.textContent = detail;
        waiting.append(detailElement);
      }
      message.append(waiting);
    }

    if (Array.isArray(item.suggestions) && item.suggestions.length > 0) {
      const suggestions = document.createElement('div');
      suggestions.className = `message-suggestions${item.pendingConfirm ? ' pending-confirm-actions' : ''}`;
      item.suggestions.forEach((suggestion) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = suggestion;
        if (item.pendingConfirm && suggestion.startsWith('确认')) button.className = 'pending-confirm';
        suggestions.append(button);
      });
      message.append(suggestions);
    }

    message.append(createMessageActions(actionTemplate));
    return message;
  };

  const updateProjectContext = (conversation) => {
    const context = conversation.querySelector('.project-context');
    if (!context) return;
    const heading = context.querySelector('h1');
    if (heading) {
      heading.textContent = PROJECT_NAME;
      heading.title = PROJECT_NAME;
    }
    const description = context.querySelector('.project-description');
    if (description) {
      description.textContent = `当前项目为${PROJECT_NAME}，重点建设 GPU 加速计算、集群调度、高速互联、存储系统和机房配套环境。华鲲AI投标助手已结合左侧上传的招标资料与标书撰写参考，对项目背景、资格条件、技术参数、评分标准及响应要点进行梳理，后续回答和生成内容均会引用这些文件。`;
    }
    const shortcuts = Array.from(context.querySelectorAll('.context-suggestions button'));
    CONTEXT_PROMPTS.forEach((text, index) => {
      if (shortcuts[index]) {
        const label = shortcuts[index].querySelector('span') || shortcuts[index];
        label.textContent = text;
        shortcuts[index].setAttribute('aria-label', text);
      }
    });
  };

  const updateInputShortcuts = (conversation) => {
    const shortcutContainer = Array.from(
      conversation.querySelectorAll('.chat-message.assistant .message-suggestions:not(.pending-confirm-actions)'),
    ).at(-1);
    const shortcuts = Array.from(shortcutContainer?.querySelectorAll('button') || []);
    FOLLOW_UP_QUESTIONS.forEach((text, index) => {
      if (shortcuts[index]) {
        shortcuts[index].textContent = text;
        shortcuts[index].setAttribute('aria-label', text);
      }
    });
  };

  const appendUserMessage = (text) => {
    if (!messageList) return null;
    const message = document.createElement('div');
    message.className = 'chat-message user';
    const content = document.createElement('span');
    content.className = 'message-text';
    content.textContent = text;
    message.append(content);
    messageList.append(message);
    scrollConversation();
    return message;
  };

  const appendAssistantMessage = (text, options = {}) => {
    if (!messageList) return null;
    const message = createAssistantMessage({
      answer: text,
      label: options.label,
      configTitle: options.configTitle,
      config: options.config,
      pendingConfirm: options.pendingConfirm,
      suggestions: options.followUps,
      waiting: options.waiting,
    }, actionTemplate);
    messageList.append(message);
    scrollConversation();
    return message;
  };

  const createConfigRecord = (title, rows) => {
    const config = document.createElement('div');
    config.className = 'config-record';
    const titleElement = document.createElement('div');
    titleElement.className = 'config-record-title';
    titleElement.textContent = title;
    config.append(titleElement);
    rows.forEach(([labelText, valueText]) => {
      const row = document.createElement('div');
      row.className = 'config-record-row';
      const label = document.createElement('span');
      label.className = 'config-record-label';
      label.textContent = labelText;
      const value = document.createElement('span');
      value.className = 'config-record-value';
      value.textContent = valueText;
      row.append(label, value);
      config.append(row);
    });
    return config;
  };

  const createConfirmActions = (onConfirm, onCancel) => {
    const actions = document.createElement('div');
    actions.className = 'message-suggestions pending-confirm-actions';
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', onCancel);
    const confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = 'pending-confirm';
    confirmButton.textContent = '确认';
    confirmButton.addEventListener('click', onConfirm);
    actions.append(cancelButton, confirmButton);
    return actions;
  };

  const settleCard = (message, title, text) => {
    if (!message) return;
    const card = message.querySelector('.config-record');
    if (card) {
      card.classList.remove('pending-confirm-card');
      if (title) card.querySelector('.config-record-title').textContent = title;
    }
    const actions = message.querySelector('.pending-confirm-actions');
    if (actions) actions.remove();
    const content = message.querySelector('.message-text');
    if (content && text) content.textContent = text;
  };

  // 初始演示数据里的待确认卡片（投标符合性自评）同样按对话确认项主逻辑工作。
  const bindDemoPendingCard = () => {
    const message = messageList
      ?.querySelector('.chat-message.assistant .config-record.pending-confirm-card')
      ?.closest('.chat-message');
    if (!message || message.dataset.prebidPendingCardBound === 'true') return;
    const actions = message.querySelector('.pending-confirm-actions');
    const select = message.querySelector('select');
    if (!actions || !select) return;
    message.dataset.prebidPendingCardBound = 'true';

    const tender = projectTenderFileName();
    const waiting = message.querySelector('.config-waiting');
    const clearWaiting = () => waiting?.remove();

    actions.querySelector('.pending-confirm')?.addEventListener('click', () => {
      const company = select.value;
      if (!company) {
        showToast('请选择评估企业主体');
        return;
      }
      clearWaiting();
      settleCard(
        message,
        '已确认投标符合性自评配置',
        `已按照您确认的配置开始投标符合性自评《${tender}》。投标符合性自评任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开并下载评估结果。`,
      );
      const row = select.closest('.config-record-row');
      const label = row.querySelector('.config-record-label');
      const value = document.createElement('span');
      value.className = 'config-record-value';
      value.textContent = company;
      row.replaceChildren(label, value);
      bridge()?.createAssessmentTask?.();
      attachFollowUpQuestions(message);
    });

    actions.querySelector('button:not(.pending-confirm)')?.addEventListener('click', () => {
      clearWaiting();
      settleCard(message, '已取消投标符合性自评配置', '配置已取消，此任务已取消。您可以在输入框中重新发起任务。');
      attachFollowUpQuestions(message);
    });
  };

  const attachFollowUpQuestions = (message) => {
    if (!message) return;
    const suggestions = document.createElement('div');
    suggestions.className = 'message-suggestions';
    FOLLOW_UP_QUESTIONS.forEach((question) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = question;
      button.setAttribute('aria-label', question);
      suggestions.append(button);
    });
    message.append(suggestions);
    scrollConversation();
  };

  const setComposerDisabled = (disabled) => {
    const form = document.querySelector('.chat-input');
    const input = form?.querySelector('input[aria-label="提问内容"]');
    if (!form || !input) return;
    input.disabled = disabled;
    form.classList.toggle('is-disabled', disabled);
  };

  const closeAssessmentConfigPanel = () => {
    const panel = document.querySelector('[data-prebid-conversation-config]');
    if (panel) {
      if (panel.__prebidConfigKeydown) document.removeEventListener('keydown', panel.__prebidConfigKeydown, true);
      panel.remove();
    }
    conversationRoot?.classList.remove('prebid-config-open');
    if (conversationRoot) conversationRoot.style.bottom = '';
    setComposerDisabled(false);
  };

  // 用户中途发起其他任务时，先按取消逻辑收尾上一个未提交的配置。
  const cancelPendingConfig = () => {
    const cancel = pendingConfigCancel;
    pendingConfigCancel = null;
    if (typeof cancel === 'function') cancel();
  };

  const openAssessmentConfigPanel = ({ tender, files, message }) => {
    closeAssessmentConfigPanel();
    const panel = document.createElement('section');
    panel.className = 'conversation-config-panel';
    panel.dataset.prebidConversationConfig = 'true';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'conversationConfigTitle');
    panel.innerHTML = `
      <header>
        <h2 id="conversationConfigTitle">投标符合性自评配置确认</h2>
        <button class="conversation-config-close" type="button" aria-label="关闭投标符合性自评配置">×</button>
      </header>
      <div class="conversation-config-content">
        <p class="conversation-config-file"><strong>招标文件：</strong><span>${escapeHtml(tender)}</span></p>
        <section class="conversation-config-dependency">
          <h3>标书要点解读</h3>
          <p>投标符合性自评需依赖标书要点解读生成，请选择项目中已生成的标书要点解读文件。</p>
          <label class="conversation-config-field" for="prebidConversationInterpretation">
            <span><b>*</b>选择已生成标书要点解读文件</span>
            <select id="prebidConversationInterpretation" data-prebid-config-interpretation>
              <option value="">请选择标书要点解读文件</option>
              ${files.map((file) => `<option value="${escapeHtml(file)}">${escapeHtml(file)}</option>`).join('')}
            </select>
          </label>
        </section>
        <label class="conversation-config-field" for="prebidConversationCompany">
          <span><b>*</b>选择评估企业主体</span>
          <select id="prebidConversationCompany" data-prebid-config-company>
            <option value="">请选择企业</option>
            ${ASSESSMENT_COMPANIES.map((company) => `<option value="${escapeHtml(company)}">${escapeHtml(company)}</option>`).join('')}
          </select>
        </label>
      </div>
      <footer>
        <button class="conversation-config-cancel" type="button">取消</button>
        <button class="conversation-config-submit" type="button">确认并开始投标符合性自评</button>
      </footer>`;
    (conversationRoot.parentElement || conversationRoot).append(panel);
    conversationRoot.classList.add('prebid-config-open');
    // 弹窗高度随内容变化，按实际高度收拢对话滚动区，避免内容被弹窗遮住。
    conversationRoot.style.bottom = `${panel.offsetHeight + 20}px`;
    setComposerDisabled(true);

    const cancelConfig = () => {
      pendingConfigCancel = null;
      closeAssessmentConfigPanel();
      const waiting = message.querySelector('.config-waiting');
      if (waiting) waiting.remove();
      const card = message.querySelector('.config-record');
      if (card) card.querySelector('.config-record-title').textContent = '已取消投标符合性自评配置';
      const content = message.querySelector('.message-text');
      if (content) content.textContent = '配置已取消，此任务已取消。您可以在输入框中重新发起任务。';
      attachFollowUpQuestions(message);
    };

    const submitConfig = () => {
      const file = panel.querySelector('[data-prebid-config-interpretation]').value;
      const company = panel.querySelector('[data-prebid-config-company]').value;
      if (!file || !company) {
        showToast('请选择标书要点解读文件和评估企业主体');
        return;
      }
      pendingConfigCancel = null;
      closeAssessmentConfigPanel();
      const waiting = message.querySelector('.config-waiting');
      if (waiting) waiting.remove();
      const content = message.querySelector('.message-text');
      if (content) {
        content.textContent = `已按照您确认的配置开始投标符合性自评《${tender}》。投标符合性自评任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开并下载评估结果。`;
        content.before(createConfigRecord('已确认投标符合性自评配置', [
          ['招标文件', `《${tender}》`],
          ['标书要点解读文件', file],
          ['评估企业主体', company],
        ]));
      }
      attachFollowUpQuestions(message);
      bridge()?.createAssessmentTask?.();
    };

    panel.querySelector('.conversation-config-close').addEventListener('click', cancelConfig);
    panel.querySelector('.conversation-config-cancel').addEventListener('click', cancelConfig);
    panel.querySelector('.conversation-config-submit').addEventListener('click', submitConfig);

    panel.__prebidConfigKeydown = (event) => {
      if (event.key !== 'Escape') return;
      cancelConfig();
    };
    document.addEventListener('keydown', panel.__prebidConfigKeydown, true);
    pendingConfigCancel = cancelConfig;
  };

  const requestInterpretationConfirm = () => {
    const tender = projectTenderFileName();
    if (!coreTenderAvailable()) {
      appendAssistantMessage(missingCoreFileText, { followUps: FOLLOW_UP_QUESTIONS });
      return;
    }
    const message = appendAssistantMessage(
      `好的，我将为您解读招标文件要点《${tender}》。开始前需要向您确认本次处理的核心招标文件，确认后我会创建标书要点解读任务。`,
      {
        configTitle: '标书要点解读确认',
        config: [['招标文件', `《${tender}》`], ['任务类型', '标书要点解读']],
        pendingConfirm: true,
      },
    );
    if (!message) return;
    message.append(createConfirmActions(
      () => {
        settleCard(
          message,
          '已确认标书要点解读配置',
          `已按照您确认的配置开始解读《${tender}》。标书要点解读任务已创建，您可以在右侧“生成记录”中查看进度；完成后可打开查看《标书要点解读_${stripExtension(tender)}》。`,
        );
        bridge()?.createInterpretationTask?.();
        attachFollowUpQuestions(message);
      },
      () => {
        settleCard(message, '已取消标书要点解读配置', '配置已取消，此任务已取消。您可以在输入框中重新发起任务。');
        attachFollowUpQuestions(message);
      },
    ));
    scrollConversation();
  };

  const requestAssessmentConfig = () => {
    const tender = projectTenderFileName();
    if (!coreTenderAvailable()) {
      appendAssistantMessage(missingCoreFileText, { followUps: FOLLOW_UP_QUESTIONS });
      return;
    }
    const message = appendAssistantMessage(
      `好的，我会为您做投标符合性自评《${tender}》。开始前需要确认标书要点解读文件和评估企业主体，请完成下方配置。`,
      { waiting: ['等待您的回答……', '等待用户确认 · 正在确认【评估企业主体】'] },
    );
    openAssessmentConfigPanel({ tender, files: generatedInterpretationFiles(), message });
  };

  const showProjectScoreAnswer = () => {
    const tender = projectTenderFileName();
    appendAssistantMessage(
      `根据当前项目的招标文件解读内容，本项目为高校建设高性能计算 GPU 集群，主要建设内容包括 GPU 计算节点、加速卡、高速存储与网络、集群调度平台、机房配套及运维服务。相关依据为：《${tender}》中的项目概述与评分标准。评分项集中在项目开发技术方案、项目实施方案和服务保障三类，评分标准对方案完整性、科学性、可行性和风险应对进行综合评价，建议按评分项逐条对应响应。`,
      { followUps: FOLLOW_UP_QUESTIONS },
    );
  };

  const runFollowUpQuestion = (question) => {
    const flow = FLOW_BY_PROMPT.get(question);
    if (!flow) return;
    cancelPendingConfig();
    hideFollowUpQuestions();
    closeAssessmentConfigPanel();
    appendUserMessage(question);
    if (flow === 'interpretation') requestInterpretationConfirm();
    else if (flow === 'assessment') requestAssessmentConfig();
    else showProjectScoreAnswer();
  };

  const bindFollowUpQuestions = () => {
    document.addEventListener('click', (event) => {
      const button = event.target?.closest?.('.chat-messages .message-suggestions:not(.pending-confirm-actions) > button, .project-context .context-suggestions button');
      if (!button) return;
      const question = button.textContent.trim();
      if (!FLOW_BY_PROMPT.has(question)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      runFollowUpQuestion(question);
    }, true);
  };

  const renderDemoConversation = () => {
    const conversation = document.querySelector('.conversation-body');
    const messages = conversation?.querySelector('.chat-messages');
    if (!conversation || !messages || messages.dataset.interpretationConversationDemo === 'true') return Boolean(messages);

    conversationRoot = conversation;
    messageList = messages;
    updateProjectContext(conversation);
    actionTemplate = messages.querySelector('.chat-message.assistant .message-actions');
    const fragment = document.createDocumentFragment();
    DEMO_MESSAGES.forEach((item) => {
      const user = document.createElement('div');
      user.className = 'chat-message user';
      const userText = document.createElement('span');
      userText.className = 'message-text';
      userText.textContent = item.question;
      user.append(userText);
      fragment.append(user, createAssistantMessage(item, actionTemplate));
    });
    messages.replaceChildren(fragment);
    messages.dataset.interpretationConversationDemo = 'true';
    updateInputShortcuts(conversation);
    bindFollowUpQuestions();
    bindDemoPendingCard();
    return true;
  };

  if (renderDemoConversation()) return;
  const observer = new MutationObserver(() => {
    if (renderDemoConversation()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
