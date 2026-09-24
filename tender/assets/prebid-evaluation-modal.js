(() => {
  const RESULT_PREFIX = '标书要点解读_';
  const DEFAULT_FILE = '招标文件-某高校高性能计算GPU集群建设项目.docx';
  const sourceDocument = typeof window !== 'undefined' ? window.tenderSourceDocument : null;
  const overviewDocument = typeof window !== 'undefined' ? window.tenderProjectOverview : null;
  const scoreStandard = typeof window !== 'undefined' ? window.tenderScoreStandard : null;
  let lastFocused = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));
  }

  function sourceAnchorAttr(tokens) {
    return tokens ? ` data-prebid-source-anchor="${escapeHtml(tokens)}"` : '';
  }

  function renderSourceTable(rows, rowAnchors) {
    const body = rows.map((row, rowIndex) => {
      const anchor = sourceAnchorAttr(rowAnchors?.[String(rowIndex)] || rowAnchors?.[rowIndex]);
      return `<tr${anchor}>${row.map((cell) => {
        const tag = rowIndex === 0 ? 'th' : 'td';
        return `<${tag}>${escapeHtml(cell).replace(/\n/g, '<br>')}</${tag}>`;
      }).join('')}</tr>`;
    }).join('');
    return `<table><tbody>${body}</tbody></table>`;
  }

  function renderSourceBlock(block) {
    if (!block) return '';
    if (block.kind === 'heading') {
      const tag = Number(block.level) >= 3 ? 'h5' : 'h4';
      return `<${tag}${sourceAnchorAttr(block.anchor)}>${escapeHtml(block.text)}</${tag}>`;
    }
    if (block.kind === 'table') {
      return renderSourceTable(Array.isArray(block.rows) ? block.rows : [], block.rowAnchors);
    }
    if (block.kind === 'image') {
      return `<img class="prebid-original-image" src="${escapeHtml(block.src)}" alt="">`;
    }
    return `<p${sourceAnchorAttr(block.anchor)}>${escapeHtml(block.text)}</p>`;
  }

  function renderSourcePaper() {
    const doc = sourceDocument;
    if (!doc?.sections?.length) return '';
    const cover = doc.cover || {};
    const meta = Array.isArray(cover.meta) ? cover.meta : [];
    const coverHtml = [
      cover.code ? `<p class="prebid-original-code">${escapeHtml(cover.code)}</p>` : '',
      cover.title ? `<h2>${escapeHtml(cover.title)}</h2>` : '',
      cover.subtitle ? `<h3>${escapeHtml(cover.subtitle)}</h3>` : '',
      meta.length
        ? `<div class="prebid-original-meta">${meta.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>`
        : '',
    ].join('');
    const sectionsHtml = doc.sections.map((section, index) => {
      const anchor = section.anchor ? ` data-prebid-source-anchor="${escapeHtml(section.anchor)}"` : '';
      const blocks = (section.blocks || []).map(renderSourceBlock).join('');
      return `<section class="prebid-original-section"${anchor}><span>${escapeHtml(section.chapter)}</span>${blocks}</section>`;
    }).join('');
    return coverHtml + sectionsHtml;
  }

  function hydrateSourcePaper(backdrop) {
    const paper = backdrop.querySelector('.prebid-original-paper');
    const html = renderSourcePaper();
    if (paper && html) paper.innerHTML = html;
    const fileName = backdrop.querySelector('.prebid-original-source-head small');
    if (fileName && sourceDocument?.fileName) fileName.textContent = sourceDocument.fileName;
  }

  function renderOverviewBlock(block) {
    if (!block) return '';
    if (block.kind === 'heading') {
      const className = Number(block.level) >= 4 ? 'prebid-overview-subsub' : 'prebid-overview-sub';
      return `<p class="${className}">${escapeHtml(block.text)}</p>`;
    }
    if (block.kind === 'table') return renderSourceTable(Array.isArray(block.rows) ? block.rows : []);
    if (block.kind === 'list' || block.kind === 'olist') {
      const tag = block.kind === 'olist' ? 'ol' : 'ul';
      const items = (block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    if (block.kind === 'quote') return `<p class="prebid-overview-note">${escapeHtml(block.text)}</p>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }

  function renderOverviewGroups() {
    const doc = overviewDocument;
    if (!doc?.groups?.length) return '';
    return doc.groups.map((group, index) => {
      const blocks = (group.blocks || []).map(renderOverviewBlock).join('');
      return `<details class="prebid-overview-group"${index <= 1 ? ' open' : ''}><summary>${escapeHtml(group.heading)}</summary><div class="prebid-overview-body">${blocks}</div></details>`;
    }).join('');
  }

  function hydrateOverviewPanel(backdrop) {
    const panel = backdrop.querySelector('.prebid-analysis-overview');
    const groups = renderOverviewGroups();
    if (panel && groups) panel.innerHTML = `<h4>项目概述</h4><div class="prebid-analysis-scroll">${groups}</div>`;
  }

  function renderScoreParas(paras) {
    return (paras || []).map((para) => `<p>${escapeHtml(para)}</p>`).join('');
  }

  function renderScoreStandard() {
    const doc = scoreStandard;
    if (!doc?.items?.length) return '';
    const items = doc.items.map((item) => {
      const paras = renderScoreParas(item.paras);
      if (item.kind === 'remark') {
        return `<article class="prebid-score prebid-score-note"><div class="prebid-score-title"><span>${escapeHtml(item.title || '备注')}</span></div>${paras}</article>`;
      }
      const title = [item.part, item.project].filter(Boolean).join(' · ');
      const score = item.score ? `<b>${escapeHtml(item.score)}</b>` : '';
      return `<article class="prebid-score"><div class="prebid-score-title"><span>${escapeHtml(title)}</span>${score}</div>${paras}</article>`;
    }).join('');
    const total = doc.total?.value
      ? `<article class="prebid-score prebid-score-total"><div class="prebid-score-title"><span>${escapeHtml(doc.total.label || '总分')}</span><b>${escapeHtml(doc.total.value)}</b></div></article>`
      : '';
    const notes = doc.notes?.paras?.length
      ? `<article class="prebid-score prebid-score-note"><div class="prebid-score-title"><span>${escapeHtml(doc.notes.title || '说明')}</span></div>${renderScoreParas(doc.notes.paras)}</article>`
      : '';
    const policy = doc.policy?.rows?.length
      ? `<article class="prebid-score prebid-score-note"><div class="prebid-score-title"><span>${escapeHtml(doc.policy.title || '政府采购政策')}</span></div><table class="prebid-score-table"><tbody>${doc.policy.rows.map((row) => `<tr><td>${escapeHtml(row[0] || '')}</td><td>${escapeHtml(row[1] || '')}</td></tr>`).join('')}</tbody></table></article>`
      : '';
    return items + total + notes + policy;
  }

  function hydrateScorePanel(backdrop) {
    const heading = backdrop.querySelector('.prebid-score-heading');
    const panel = heading?.parentElement;
    const body = panel?.querySelector('.prebid-analysis-scroll') || panel;
    const html = renderScoreStandard();
    if (!body || !html) return;
    body.querySelectorAll('.prebid-score').forEach((node) => node.remove());
    body.insertAdjacentHTML('beforeend', html);
  }

  const LOCATE_TARGETS = new Map(Object.entries({
    // 项目基础信息
    'basic:项目名称': 't-project-name',
    'basic:项目编号': 't-project-code',
    'basic:项目标段': 't-project-section',
    'basic:采购类别': 't-project-category',
    'basic:项目包数': 't-project-package',
    'basic:资金来源': 't-project-fund',
    'basic:采购预算': 't-project-budget',
    'basic:最高限价': 't-project-cap',
    'basic:建设目标': 't-project-goal',
    'basic:GPU 计算节点1': 't-item-node1',
    'basic:GPU 计算节点2': 't-item-node2',
    'basic:计算卡1': 't-item-card1',
    'basic:计算卡2': 't-item-card2',
    'basic:管理服务器（含系统）': 't-item-management',
    'basic:800G IB 交换机': 't-item-ib800',
    'basic:200G IB 交换机': 't-item-ib200',
    'basic:万兆以太网交换机': 't-item-eth10g',
    'basic:千兆以太网交换机': 't-item-eth1g',
    'basic:存储服务器（含系统）': 't-item-storage',
    'basic:交货地点': 't-delivery-place',
    'basic:交货期': 't-delivery-term',
    'basic:质保期': 't-warranty',
    'basic:付款方式': 't-payment',
    'basic:售后响应': 't-service-response',
    'basic:验收要求': 't-acceptance',
    'basic:项目模式': 't-turnkey',
    'basic:运行要求': 't-operation',
    // 时间与递交约束
    'timeline:招标文件获取': 't-get-file',
    'timeline:澄清确认': 't-clarify',
    'timeline:投标截止/开标': 't-bid-time',
    'timeline:递交地点': 't-bid-place',
    'timeline:投标有效期': 't-validity',
    'timeline:合同签订': 't-sign-contract',
    'timeline:前置要求': 't-get-file',
    // 投标人资格要求
    'qualification:独立承担民事责任': 't-qual-legal',
    'qualification:商业信誉和财务制度': 't-qual-finance',
    'qualification:履约能力': 't-qual-capability',
    'qualification:税收和社会保障资金': 't-qual-tax',
    'qualification:无重大违法记录': 't-qual-illegal',
    'qualification:其他法定条件': 't-qual-other',
    'qualification:信用要求': 't-qual-credit',
    'qualification:关联关系限制': 't-qual-affiliation',
    'qualification:前期服务限制': 't-qual-prior',
    'qualification:招标文件获取方式': 't-qual-fileway',
    'qualification:市场准入': 't-qual-market',
    // ★号及不允许偏离项
    'mandatory:GPU计算节点1 · 处理器': 't-star-1-2',
    'mandatory:GPU计算节点1 · 内存': 't-star-1-3',
    'mandatory:GPU计算节点1 · GPU卡': 't-star-1-5',
    'mandatory:GPU计算节点2 · CPU': 't-star-2-2',
    'mandatory:GPU计算节点2 · 内存': 't-star-2-3',
    'mandatory:GPU计算节点2 · AI卡': 't-star-2-5',
    'mandatory:计算卡1': 't-star-3',
    'mandatory:计算卡2': 't-star-4',
    'mandatory:管理服务器 · 处理器': 't-star-5-2',
    'mandatory:管理服务器 · 内存': 't-star-5-3',
    'mandatory:管理服务器 · 网卡': 't-star-5-6',
    'mandatory:存储服务器 · 处理器': 't-star-10-1',
    'mandatory:存储服务器 · 内存': 't-star-10-2',
    'mandatory:存储服务器 · 存储': 't-star-10-3',
    // 明确废标约束
    'evaluation:报价上限': 't-eval-price',
    'evaluation:一览表效力': 't-eval-list',
    'evaluation:金额大小写': 't-eval-amount',
    'evaluation:算术修正': 't-eval-arith',
    'evaluation:额外加配': 't-eval-extra',
    'evaluation:缺项漏项': 't-eval-missing',
    'evaluation:附加条件': 't-eval-condition',
    'evaluation:有效供应商要求': 't-eval-count',
    'evaluation:数量不足后果': 't-eval-fail',
    'evaluation:报价规则': 't-eval-price',
    'evaluation:响应完整性': 't-eval-extra',
    'evaluation:有效供应商数量': 't-eval-count',
    // 项目与评分解析
    'score:项目背景与目标': 't-project-goal',
    'score:核心建设内容': 't-score-content',
    'score:交付与履约': 't-score-delivery',
    'score:▲重要技术指标': 't-score-important',
    'score:#关键技术指标': 't-score-key',
    'score:一般技术指标': 't-score-general',
  }));

  function resolveLocateTarget(item, card) {
    const groupTitle = item?.matches?.('[data-evaluation-group]')
      ? item.querySelector('.prebid-subsection-title')
      : null;
    const title = groupTitle
      || item?.querySelector('.prebid-score-title span')
      || item?.querySelector('.prebid-rule-title span')
      || item?.closest('.prebid-requirement-group')?.querySelector('h4')
      || item?.querySelector('span');
    const key = (title?.textContent || '').replace(/★/g, '').trim();
    return LOCATE_TARGETS.get(`${card?.dataset.sourceTarget}:${key}`) || '';
  }

  function getModal() {
    let backdrop = document.querySelector('.prebid-evaluation-backdrop');
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.className = 'prebid-evaluation-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="prebid-evaluation-modal" role="dialog" aria-modal="true" aria-labelledby="prebidEvaluationTitle">
        <header class="prebid-evaluation-header">
          <div class="prebid-evaluation-title">
            <img src="./assets/figma/tool-demand-new.svg" alt="">
            <h2 id="prebidEvaluationTitle">标书要点解读</h2>
          </div>
          <div class="prebid-evaluation-header-actions">
            <button class="prebid-source-toggle" type="button" data-prebid-source-toggle aria-expanded="true">收起招标文件</button>
            <button class="prebid-evaluation-action" type="button">立即评估</button>
            <button class="prebid-evaluation-close" type="button" aria-label="关闭标书要点解读弹窗">×</button>
          </div>
        </header>

        <div class="prebid-evaluation-body prebid-evaluation-workspace" data-prebid-workspace>
          <main class="prebid-evaluation-results">
          <div class="prebid-evaluation-toolbar">
            <p class="prebid-evaluation-section-label">招标文件</p>
            <div class="prebid-evaluation-file">
              <img src="./assets/figma/word.svg" alt="Word文件">
              <span class="prebid-evaluation-file-name"></span>
            </div>
            <p class="prebid-evaluation-section-label prebid-evaluation-result-label">评估信息提取结果</p>
            <nav class="prebid-evaluation-tabs" role="tablist" aria-label="评估信息模块">
            <button class="prebid-evaluation-tab is-active" type="button" role="tab" aria-selected="true" aria-controls="prebid-panel-basic" data-prebid-tab="basic">项目基础信息</button>
            <button class="prebid-evaluation-tab" type="button" role="tab" aria-selected="false" aria-controls="prebid-panel-timeline" data-prebid-tab="timeline">时间与递交约束</button>
            <button class="prebid-evaluation-tab" type="button" role="tab" aria-selected="false" aria-controls="prebid-panel-qualification" data-prebid-tab="qualification">投标人资格要求</button>
            <button class="prebid-evaluation-tab" type="button" role="tab" aria-selected="false" aria-controls="prebid-panel-mandatory" data-prebid-tab="mandatory">★号及不允许偏离项</button>
            <button class="prebid-evaluation-tab" type="button" role="tab" aria-selected="false" aria-controls="prebid-panel-evaluation" data-prebid-tab="evaluation">明确废标约束</button>
            <button class="prebid-evaluation-tab" type="button" role="tab" aria-selected="false" aria-controls="prebid-panel-score" data-prebid-tab="score">项目与评分解析</button>
            </nav>
          </div>

          <div class="prebid-evaluation-grid">
            <section id="prebid-panel-basic" class="prebid-evaluation-card" data-source-target="basic" data-prebid-panel="basic">
              <div class="prebid-evaluation-card-content">
                <section class="prebid-subsection">
                  <h4 class="prebid-subsection-title">项目定位</h4>
                  <div class="prebid-field"><span>项目名称</span><span>某高校高性能计算GPU集群建设项目</span></div>
                  <div class="prebid-field"><span>项目编号</span><span>ZKQ2025-XXXX-XXXX（H）</span></div>
                  <div class="prebid-field"><span>项目标段</span><span>高性能计算GPU集群</span></div>
                  <div class="prebid-field"><span>采购类别</span><span>货物供货及伴随服务</span></div>
                  <div class="prebid-field"><span>项目包数</span><span>1 个包</span></div>
                  <div class="prebid-field"><span>资金来源</span><span>专项资金，已落实</span></div>
                  <div class="prebid-field"><span>采购预算</span><span>人民币 3950 万元</span></div>
                  <div class="prebid-field"><span>最高限价</span><span>人民币 3950 万元</span></div>
                </section>
                <section class="prebid-subsection">
                  <h4 class="prebid-subsection-title">功能与目标</h4>
                  <div class="prebid-field"><span>建设目标</span><span>高性能计算 GPU 集群 1 套，用于公共计算服务平台，面向全校高性能计算相关学科提供算力支撑。</span></div>
                </section>
                <section class="prebid-subsection">
                  <h4 class="prebid-subsection-title">采购内容</h4>
                  <div class="prebid-field"><span>GPU 计算节点1</span><span>13 台</span></div>
                  <div class="prebid-field"><span>GPU 计算节点2</span><span>2 台</span></div>
                  <div class="prebid-field"><span>计算卡1</span><span>104 张</span></div>
                  <div class="prebid-field"><span>计算卡2</span><span>16 张</span></div>
                  <div class="prebid-field"><span>管理服务器（含系统）</span><span>3 台</span></div>
                  <div class="prebid-field"><span>800G IB 交换机</span><span>2 台</span></div>
                  <div class="prebid-field"><span>200G IB 交换机</span><span>1 台</span></div>
                  <div class="prebid-field"><span>万兆以太网交换机</span><span>1 台</span></div>
                  <div class="prebid-field"><span>千兆以太网交换机</span><span>2 台</span></div>
                  <div class="prebid-field"><span>存储服务器（含系统）</span><span>3 台</span></div>
                </section>
                <section class="prebid-subsection">
                  <h4 class="prebid-subsection-title">交付与服务要求</h4>
                  <div class="prebid-field"><span>交货地点</span><span>某高校信息中心</span></div>
                  <div class="prebid-field"><span>交货期</span><span>合同签订后 45 个日历天</span></div>
                  <div class="prebid-field"><span>质保期</span><span>不低于 3 年，自供货、安装、调试正常且经采购人确认验收合格之日起算</span></div>
                  <div class="prebid-field"><span>付款方式</span><span>验收合格后 7 个工作日内提交 10% 履约保证金，甲方支付 100%；使用半年后 7 个工作日内退还</span></div>
                  <div class="prebid-field"><span>售后响应</span><span>24 小时在线；30 分钟响应；市内 4 小时、市外 24 小时到场</span></div>
                  <div class="prebid-field"><span>验收要求</span><span>安装调试完成后正常运行 1 个月，由项目负责人提出验收申请；可送第三方检测</span></div>
                  <div class="prebid-field"><span>项目模式</span><span>“交钥匙”项目，报价包含所有实施费用</span></div>
                  <div class="prebid-field"><span>运行要求</span><span>所有设备安装到位，操作系统、集群管理软件、作业调度系统安装并运行；设备全部加入集群，作业调度测试通过</span></div>
                </section>
              </div>
            </section>

            <section id="prebid-panel-timeline" class="prebid-evaluation-card" data-source-target="timeline" data-prebid-panel="timeline" hidden>
              <div class="prebid-evaluation-card-content">
                <article class="prebid-rule prebid-timeline-rule"><div class="prebid-rule-title prebid-timeline-title"><span>招标文件获取</span><b class="prebid-time">2025-07-10 至 2025-07-16</b><span class="prebid-source">投标邀请</span></div><p>未按规定时间和方式获取招标文件的，不得参加本次投标。</p></article>
                <article class="prebid-rule prebid-timeline-rule"><div class="prebid-rule-title prebid-timeline-title"><span>澄清确认</span><b class="prebid-time">收到澄清文件后 24 小时内</b><span class="prebid-source">供应商须知</span></div><p>逾期未确认将影响澄清文件的效力确认。</p></article>
                <article class="prebid-rule prebid-timeline-rule"><div class="prebid-rule-title prebid-timeline-title"><span>投标截止/开标</span><b class="prebid-time">2025-07-31 09:30</b><span class="prebid-source">投标邀请</span></div><p>逾期递交的投标文件不予受理。</p></article>
                <article class="prebid-rule prebid-timeline-rule"><div class="prebid-rule-title prebid-timeline-title"><span>递交地点</span><b class="prebid-time">某省某市某园区招标代理公司 1 号开标室</b><span class="prebid-source">投标邀请</span></div><p>递交地点错误的，存在不予受理风险。</p></article>
                <article class="prebid-rule prebid-timeline-rule"><div class="prebid-rule-title prebid-timeline-title"><span>投标有效期</span><b class="prebid-time">投标截止日期后 90 日历日</b><span class="prebid-source">供应商须知</span></div><p>投标有效期不足的，按无效投标处理。</p></article>
                <article class="prebid-rule prebid-timeline-rule"><div class="prebid-rule-title prebid-timeline-title"><span>合同签订</span><b class="prebid-time">中标通知书发出之日起 30 日内</b><span class="prebid-source">供应商须知</span></div><p>无正当理由拒签合同的，将取消中标资格。</p></article>
                <article class="prebid-rule prebid-timeline-rule prebid-timeline-note"><div class="prebid-rule-title"><span>前置要求</span><span class="prebid-source">投标邀请</span></div><p>招标文件获取时间为每天上午 9:00-11:30、下午 13:30-16:00。</p></article>
              </div>
            </section>

            <section id="prebid-panel-qualification" class="prebid-evaluation-card" data-source-target="qualification" data-prebid-panel="qualification" hidden>
              <div class="prebid-evaluation-card-content">
                <section class="prebid-requirement-group"><h4>独立承担民事责任</h4><ul><li>招标条件：依法注册的法人、其他组织或自然人。</li><li>需提供资料：营业执照、法人证书、执业许可证、自然人身份证明等。</li></ul></section>
                <section class="prebid-requirement-group"><h4>商业信誉和财务制度</h4><ul><li>招标条件：具有良好商业信誉和健全财务会计制度。</li><li>需提供资料：2024 年度审计财务报告，或基本开户银行近 3 个月内资信证明。</li></ul></section>
                <section class="prebid-requirement-group"><h4>履约能力</h4><ul><li>招标条件：具有履行合同所必需的设备和专业技术能力。</li><li>需提供资料：声明函或证明材料。</li></ul></section>
                <section class="prebid-requirement-group"><h4>税收和社会保障资金</h4><ul><li>招标条件：依法缴纳税收和社会保障资金。</li><li>需提供资料：公告发布前 6 个月内至少 1 个月税收凭据和社会保险凭据。</li></ul></section>
                <section class="prebid-requirement-group"><h4>无重大违法记录</h4><ul><li>招标条件：参加政府采购活动前三年内无重大违法记录。</li><li>需提供资料：书面声明。</li></ul></section>
                <section class="prebid-requirement-group"><h4>其他法定条件</h4><ul><li>招标条件：法律、行政法规规定的其他条件。</li><li>需提供资料：相关证明材料或声明函。</li></ul></section>
                <section class="prebid-requirement-group"><h4>信用要求</h4><ul><li>招标条件：未被列入失信被执行人、严重违法失信行为记录名单、重大税收违法失信主体。</li><li>需提供资料：以投标截止当日查询结果为准。</li></ul></section>
                <section class="prebid-requirement-group"><h4>关联关系限制</h4><ul><li>招标条件：单位负责人为同一人或有直接控股、管理关系的供应商不得参加同一合同项下投标。</li><li>需提供资料：供应商基本情况表中声明。</li></ul></section>
                <section class="prebid-requirement-group"><h4>前期服务限制</h4><ul><li>招标条件：为本项目提供整体设计、规范编制或项目管理、监理、检测服务的不得参加。</li><li>需提供资料：供应商基本情况表中声明。</li></ul></section>
                <section class="prebid-requirement-group"><h4>招标文件获取方式</h4><ul><li>招标条件：以规定方式获取招标文件。</li><li>需提供资料：以代理机构收到获取信息为准。</li></ul></section>
                <section class="prebid-requirement-group"><h4>市场准入</h4><ul><li>招标条件：国家法律法规有要求的，应符合相关规定。</li><li>需提供资料：如有，提供相应证明材料。</li></ul></section>
              </div>
            </section>

            <section id="prebid-panel-mandatory" class="prebid-evaluation-card" data-source-target="mandatory" data-prebid-panel="mandatory" hidden>
              <div class="prebid-evaluation-card-content">
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span>★规则</span><span class="prebid-source">项目采购需求</span></div><p>带 ★ 条款均为实质性要求，只能无偏离或正偏离；任一 ★ 条款未实质性响应，投标文件按无效处理。上级标题带 ★ 时，覆盖其下全部子项和表格。</p></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>GPU计算节点1 · 处理器</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>配置≥2颗可扩展处理器；单颗CPU主频≥2.1GHz，核心数≥48。</span></div><div><b>对应证明材料</b><span>产品彩页、原厂技术白皮书或第三方检测报告。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>GPU计算节点1 · 内存</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>支持DDR5 ECC RDIMM/LRDIMM；插槽≥32个；配置≥32根64GB DDR5 ECC内存，主频≥4800MHz。</span></div><div><b>对应证明材料</b><span>产品彩页、原厂技术白皮书或第三方检测报告。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>GPU计算节点1 · GPU卡</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>支持配置≥8块GPU计算卡；单块显存≥141GB；卡间互联带宽≥900GB/s。</span></div><div><b>对应证明材料</b><span>原厂产品彩页或第三方检测报告。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>GPU计算节点2 · CPU</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>配置≥4颗处理器；产自中国境内；每颗主频≥2.6GHz，≥48物理核心，ARM架构。</span></div><div><b>对应证明材料</b><span>原厂产品彩页或技术白皮书。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>GPU计算节点2 · 内存</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>内存配置≥1024GB。</span></div><div><b>对应证明材料</b><span>产品配置清单或技术白皮书。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>GPU计算节点2 · AI卡</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>支持配置≥8张国产NPU计算卡；单卡显存≥64G，FP16算力≥280TFLOPS。</span></div><div><b>对应证明材料</b><span>原厂产品彩页或第三方检测报告。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>计算卡1</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>单块GPU卡显存≥141GB；卡间互联带宽≥900GB/s。</span></div><div><b>对应证明材料</b><span>原厂产品彩页或第三方检测报告。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>计算卡2</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>国产NPU计算卡；单卡显存≥64G。</span></div><div><b>对应证明材料</b><span>原厂产品彩页或第三方检测报告。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>管理服务器 · 处理器</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>配置≥2颗可扩展处理器；主频≥2.2GHz，核心数≥26。</span></div><div><b>对应证明材料</b><span>产品彩页或原厂技术白皮书。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>管理服务器 · 内存</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>支持DDR4 ECC RDIMM/LRDIMM；插槽≥16个；配置≥16根32GB DDR4 ECC内存，主频≥3200MHz。</span></div><div><b>对应证明材料</b><span>产品配置清单或原厂技术白皮书。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>管理服务器 · 网卡</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>配置≥1个单口≥100G网卡；配置≥1张双口≥10G光口卡。</span></div><div><b>对应证明材料</b><span>产品配置清单或检测报告。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>存储服务器 · 处理器</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>配置≥2颗可扩展处理器；每颗CPU主频≥2.1GHz，核心数≥24。</span></div><div><b>对应证明材料</b><span>产品彩页或原厂技术白皮书。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>存储服务器 · 内存</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>内存配置≥256G。</span></div><div><b>对应证明材料</b><span>产品配置清单或原厂技术白皮书。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
                <article class="prebid-rule prebid-mandatory-rule"><div class="prebid-rule-title"><span><em class="prebid-tag">★</em>存储服务器 · 存储</span><span class="prebid-source">项目采购需求 技术要求</span></div><div class="prebid-hard-fields"><div><b>必须满足内容</b><span>≥2块≥480G SSD系统盘；≥2块≥1.6TB NVMe元数据盘；≥14块≥15.36T NVMe数据盘。</span></div><div><b>对应证明材料</b><span>产品配置清单、检测报告或技术白皮书。</span></div><div><b>不满足后果</b><span>负偏离无效，响应被拒绝。</span></div></div></article>
              </div>
            </section>

            <section id="prebid-panel-evaluation" class="prebid-evaluation-card" data-source-target="evaluation" data-prebid-panel="evaluation" hidden>
              <div class="prebid-evaluation-card-content">
                <section class="prebid-subsection" data-evaluation-group><div class="prebid-subsection-heading"><h4 class="prebid-subsection-title">报价规则</h4><button class="prebid-locate-button" type="button" data-evaluation-group-locate>定位招标原文</button></div>
                  <div class="prebid-field"><span>报价上限</span><span>投标报价超过采购预算、分项预算或最高限价的，投标无效</span></div>
                  <div class="prebid-field"><span>一览表效力</span><span>投标一览表与投标文件相应内容不一致时，以开标一览表为准</span></div>
                  <div class="prebid-field"><span>金额大小写</span><span>大写金额和小写金额不一致时，以大写金额为准</span></div>
                  <div class="prebid-field"><span>算术修正</span><span>总价与单价汇总不一致时，按招标文件规定修正</span></div>
                </section>
                <section class="prebid-subsection" data-evaluation-group><div class="prebid-subsection-heading"><h4 class="prebid-subsection-title">响应完整性</h4><button class="prebid-locate-button" type="button" data-evaluation-group-locate>定位招标原文</button></div>
                  <div class="prebid-field"><span>额外加配</span><span>“加配”“赠送”招标采购内容之外货物的，属无效投标情形</span></div>
                  <div class="prebid-field"><span>缺项漏项</span><span>投标内容出现“缺项”“漏项”的，属无效投标情形</span></div>
                  <div class="prebid-field"><span>附加条件</span><span>附有采购人不能接受条件，或不能满足招标文件商务条款的，属无效投标情形</span></div>
                </section>
                <section class="prebid-subsection" data-evaluation-group><div class="prebid-subsection-heading"><h4 class="prebid-subsection-title">有效供应商数量</h4><button class="prebid-locate-button" type="button" data-evaluation-group-locate>定位招标原文</button></div>
                  <div class="prebid-field"><span>有效供应商要求</span><span>须有符合采购人专业要求的供应商，且实质响应供应商不少于 3 家</span></div>
                  <div class="prebid-field"><span>数量不足后果</span><span>实质响应供应商不足三家的，应予废标</span></div>
                </section>
              </div>
            </section>

            <section id="prebid-panel-score" class="prebid-evaluation-card prebid-evaluation-card-wide" data-source-target="score" data-prebid-panel="score" hidden>
              <div class="prebid-evaluation-card-content">
                <div class="prebid-analysis-grid">
                  <section class="prebid-analysis-panel prebid-analysis-overview">
                    <h4>项目概述</h4>
                    <div class="prebid-analysis-scroll" data-overview-scroll>
                      <article class="prebid-score"><div class="prebid-score-title"><span>项目背景与目标</span><span class="prebid-source">项目采购需求</span></div><p>建设高性能计算 GPU 集群 1 套，用于公共计算服务平台，面向全校高性能计算相关学科提供算力支撑。</p></article>
                      <article class="prebid-score"><div class="prebid-score-title"><span>核心建设内容</span><span class="prebid-source">项目采购需求</span></div><p>采购 GPU 计算节点、计算卡、管理服务器、IB 与以太网交换机、存储服务器等 10 类货物及伴随服务。</p></article>
                      <article class="prebid-score"><div class="prebid-score-title"><span>交付与履约</span><span class="prebid-source">供应商须知</span></div><p>合同签订后 45 个日历天交货，质保不低于 3 年；“交钥匙”项目，报价包含所有实施费用。</p></article>
                    </div>
                  </section>
                  <section class="prebid-analysis-panel">
                    <div class="prebid-score-heading">
                      <h4>评分项</h4>
                      <button class="prebid-locate-button" type="button" data-score-locate>定位招标原文</button>
                    </div>
                    <div class="prebid-analysis-scroll" data-score-scroll>
                      <article class="prebid-score"><div class="prebid-score-title"><span>▲重要技术指标</span><b>18分</b></div><p>6 项完全满足得 18 分，每项负偏离扣 3 分，扣完为止。 <span class="prebid-source">评标办法</span></p></article>
                      <article class="prebid-score"><div class="prebid-score-title"><span>#关键技术指标</span><b>18分</b></div><p>3 项合计满分 18 分，每项负偏离扣 6 分；优于最低要求时须在《技术响应/偏离表》中描述。 <span class="prebid-source">评标办法</span></p></article>
                      <article class="prebid-score"><div class="prebid-score-title"><span>一般技术指标</span><b>35分</b></div><p>一般指标 17 项，满分 35 分，每项负偏离扣 1 分。 <span class="prebid-source">评标办法</span></p></article>
                    </div>
                  </section>
                </div>
              </div>
            </section>
          </div>
          </main>

          <div class="prebid-evaluation-divider" aria-hidden="true"></div>
          <aside class="prebid-original-source" data-prebid-source-panel aria-label="招标原文件">
            <header class="prebid-original-source-head">
              <div>
                <strong>招标原文件</strong>
                <small>招标文件-某高校高性能计算GPU集群建设项目.docx</small>
              </div>
              <button type="button" data-prebid-source-close aria-label="收起招标文件" title="收起">×</button>
            </header>
            <div class="prebid-original-source-body">
              <article class="prebid-original-paper">
                <p class="prebid-original-code">项目编号：ZKQ2025-XXXX-XXXX（H）</p>
                <h2>某高校高性能计算GPU集群建设项目</h2>
                <h3>招标文件</h3>
                <div class="prebid-original-meta">
                  <p>采购人：某双一流高校</p>
                  <p>采购代理机构：某招标代理公司</p>
                  <p>二〇二五年七月</p>
                </div>
                <section class="prebid-original-section is-located" data-prebid-source-anchor="basic">
                  <span>招标原文件</span>
                  <p>正在加载招标原文件全文，如长时间未显示，请刷新页面后重试。</p>
                </section>
              </article>
            </div>
          </aside>
        </div>

      </section>`;

    hydrateSourcePaper(backdrop);
    hydrateOverviewPanel(backdrop);
    hydrateScorePanel(backdrop);
    document.body.append(backdrop);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('.prebid-evaluation-close')) {
        closeModal();
      }
    });
    backdrop.querySelector('.prebid-evaluation-action').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('open-prebid-assessment', {
        detail: {
          skipInterpretation: true,
          modalTitle: '重新评估',
          onSubmit: closeModal,
        },
      }));
    });
    const workspace = backdrop.querySelector('[data-prebid-workspace]');
    const sourceToggle = backdrop.querySelector('[data-prebid-source-toggle]');
    const setSourceOpen = (open) => {
      workspace.classList.toggle('source-collapsed', !open);
      sourceToggle.textContent = open ? '收起招标文件' : '查看招标文件';
      sourceToggle.setAttribute('aria-expanded', String(open));
    };
    const sourcePane = backdrop.querySelector('[data-prebid-source-panel]');
    const tabs = Array.from(backdrop.querySelectorAll('[data-prebid-tab]'));
    const panels = Array.from(backdrop.querySelectorAll('[data-prebid-panel]'));
    const resultsGrid = backdrop.querySelector('.prebid-evaluation-grid');
    const activateTab = (target) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.prebidTab === target;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.prebidPanel !== target;
      });
      if (resultsGrid) resultsGrid.scrollTop = 0;
    };
    tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab.dataset.prebidTab)));
    const resultsToolbar = backdrop.querySelector('.prebid-evaluation-toolbar');
    resultsToolbar?.addEventListener('wheel', (event) => {
      if (!resultsGrid || event.deltaY === 0) return;
      resultsGrid.scrollTop += event.deltaY;
      event.preventDefault();
    }, { passive: false });
    const locateSource = (target) => {
      if (panels.some((panel) => panel.dataset.prebidPanel === target)) activateTab(target);
      const anchor = backdrop.querySelector(`[data-prebid-source-anchor~="${target}"]`);
      if (!anchor || !sourcePane) return;
      backdrop.querySelectorAll('[data-prebid-source-anchor]').forEach((item) => {
        item.classList.toggle('is-located', item === anchor);
      });
      const paneRect = sourcePane.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const sourceHead = sourcePane.querySelector('.prebid-original-source-head');
      const offset = (sourceHead?.getBoundingClientRect().height || 0) + 14;
      const top = sourcePane.scrollTop + anchorRect.top - paneRect.top - offset;
      sourcePane.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    backdrop.querySelectorAll('.prebid-evaluation-card[data-source-target]').forEach((card) => {
      if (card.dataset.sourceTarget === 'score') return;
      const items = [...card.querySelectorAll('.prebid-field, .prebid-rule, .prebid-score, .prebid-requirement-group li')];
      items.forEach((item) => {
        const button = document.createElement('button');
        button.className = 'prebid-locate-button';
        button.type = 'button';
        button.textContent = '定位招标原文';
        button.addEventListener('click', () => {
          const target = resolveLocateTarget(item, card) || card.dataset.sourceTarget;
          setSourceOpen(true);
          window.requestAnimationFrame(() => locateSource(target));
        });
        item.append(button);
      });
    });
    backdrop.querySelectorAll('[data-evaluation-group-locate]').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('.prebid-evaluation-card');
        const target = resolveLocateTarget(button.closest('[data-evaluation-group]'), card) || 'evaluation';
        setSourceOpen(true);
        window.requestAnimationFrame(() => locateSource(target));
      });
    });
    backdrop.querySelector('[data-score-locate]').addEventListener('click', () => {
      setSourceOpen(true);
      window.requestAnimationFrame(() => locateSource('score'));
    });
    sourceToggle.addEventListener('click', () => setSourceOpen(workspace.classList.contains('source-collapsed')));
    backdrop.querySelector('[data-prebid-source-close]').addEventListener('click', () => setSourceOpen(false));
    return backdrop;
  }

  function normalizeFileName(resultTitle) {
    const raw = resultTitle.slice(RESULT_PREFIX.length).trim();
    if (!raw) return DEFAULT_FILE;
    return /\.(docx?|pdf)$/i.test(raw) ? raw : `${raw}.docx`;
  }

  function openModal(resultTitle) {
    const backdrop = getModal();
    lastFocused = document.activeElement;
    backdrop.querySelector('.prebid-evaluation-file-name').textContent = normalizeFileName(resultTitle);
    backdrop.hidden = false;
    document.body.classList.add('prebid-evaluation-modal-open');
    requestAnimationFrame(() => backdrop.querySelector('.prebid-evaluation-close').focus());
  }

  function closeModal() {
    const backdrop = document.querySelector('.prebid-evaluation-backdrop');
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.classList.remove('prebid-evaluation-modal-open');
    lastFocused?.focus?.();
  }

  function showToast(message) {
    let toast = document.querySelector('.interpretation-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'interpretation-toast';
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 1800);
  }

  document.addEventListener('click', (event) => {
    const resultButton = event.target.closest('#result-panel .record-row .record-main');
    if (!resultButton) return;
    const title = resultButton.querySelector('strong')?.textContent?.trim() || '';
    if (!title.startsWith(RESULT_PREFIX)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openModal(title);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();
