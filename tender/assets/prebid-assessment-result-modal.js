(() => {
  const PREFIX = '投标符合性自评_';
  const DEFAULT_COMPANY = '四川华鲲振宇智能科技有限责任公司';
  let lastFocused = null;

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const DAY_MS = 24 * 60 * 60 * 1000;
  const assessNow = new Date();
  const bidDeadline = new Date('2025-07-31T09:30:00+08:00');
  const pad2 = (value) => String(value).padStart(2, '0');
  const assessStamp = `${assessNow.getFullYear()}-${pad2(assessNow.getMonth() + 1)}-${pad2(assessNow.getDate())} ${pad2(assessNow.getHours())}:${pad2(assessNow.getMinutes())}`;
  const assessDate = assessStamp.slice(0, 10);
  const deadlinePassed = assessNow.getTime() > bidDeadline.getTime();
  const deadlineGapDays = Math.max(1, Math.ceil(Math.abs(assessNow.getTime() - bidDeadline.getTime()) / DAY_MS));
  const deadlineTone = deadlinePassed ? 'bad' : (bidDeadline.getTime() - assessNow.getTime() <= 3 * DAY_MS ? 'pending' : 'ok');
  const deadlineDetail = deadlinePassed
    ? `招标条件：2025-07-31 09:30 截止递交并开标 · 企业/资料情况：截至评估基准时间 ${assessDate}，截止时间已过去 ${deadlineGapDays} 天`
    : `招标条件：2025-07-31 09:30 截止递交并开标 · 距评估基准时间 ${assessDate} 剩余 ${deadlineGapDays} 天`;
  const verdictTitle = deadlinePassed ? '已错过投标时间' : '仍在有效投标期内';
  const verdictDetail = deadlinePassed
    ? `投标截止时间 2025-07-31 09:30 已超过评估基准时间 ${assessStamp}，时间模块为不满足，不得用技术响应或商务条件抵消`
    : `距离投标截止时间 2025-07-31 09:30 还有 ${deadlineGapDays} 天，请按期完成递交`;
  const resolveCompany = (title) => {
    const candidate = title.slice(PREFIX.length).trim();
    if (!candidate || candidate.includes('某高校高性能计算GPU集群建设项目') || candidate.includes('供应链金融服务平台项目')) return DEFAULT_COMPANY;
    return candidate;
  };

  const sourceDoc = typeof window !== 'undefined' ? window.tenderSourceDocument : null;
  const overviewDoc = typeof window !== 'undefined' ? window.tenderProjectOverview : null;
  const scoreDoc = typeof window !== 'undefined' ? window.tenderScoreStandard : null;

  const renderDocTable = (rows) => `<table class="assessment-doc-table"><tbody>${(rows || []).map((row, rowIndex) => `<tr>${row.map((cell) => { const tag = rowIndex === 0 ? 'th' : 'td'; return `<${tag}>${esc(cell).replace(/\n/g, '<br>')}</${tag}>`; }).join('')}</tr>`).join('')}</tbody></table>`;

  const renderSourceReference = () => {
    if (!sourceDoc?.sections?.length) return '<h4>招标原文件</h4><p>招标原文件数据未加载。</p>';
    const cover = sourceDoc.cover || {};
    const head = `<div class="assessment-source-meta"><span>招标文件原文</span><small>${esc(sourceDoc.fileName || '')}</small></div>
      <h3>${esc(cover.title || '')}</h3>
      <p class="assessment-source-ref">${esc((cover.meta || []).join(' · '))}</p>`;
    const body = sourceDoc.sections.map((section) => {
      const blocks = (section.blocks || []).map((block) => {
        if (block.kind === 'heading') return `<h4>${esc(block.text)}</h4>`;
        if (block.kind === 'table') return renderDocTable(block.rows);
        if (block.kind === 'image') return `<img class="assessment-doc-image" src="${esc(block.src)}" alt="">`;
        return `<p>${esc(block.text)}</p>`;
      }).join('');
      return `<section class="assessment-doc-section"><h4 class="assessment-doc-chapter">${esc(section.chapter)}</h4>${blocks}</section>`;
    }).join('');
    return head + body;
  };

  const renderOverviewReference = () => {
    if (!overviewDoc?.groups?.length) return '<h4>项目概述</h4><p>项目概述数据未加载。</p>';
    const groups = overviewDoc.groups.map((group) => {
      const blocks = (group.blocks || []).map((block) => {
        if (block.kind === 'heading') return `<p class="assessment-doc-sub">${esc(block.text)}</p>`;
        if (block.kind === 'table') return renderDocTable(block.rows);
        if (block.kind === 'list' || block.kind === 'olist') {
          const tag = block.kind === 'olist' ? 'ol' : 'ul';
          return `<${tag}>${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
        }
        return `<p>${esc(block.text)}</p>`;
      }).join('');
      return `<details class="assessment-doc-group"${group.heading.startsWith('一、') ? ' open' : ''}><summary>${esc(group.heading)}</summary><div class="assessment-doc-group-body">${blocks}</div></details>`;
    }).join('');
    return `<h4>项目概述</h4>${groups}`;
  };

  const renderScoreReference = () => {
    if (!scoreDoc?.items?.length) return '<h4>评分项</h4><p>评分标准数据未加载。</p>';
    const items = scoreDoc.items.map((item) => {
      const paras = (item.paras || []).map((para) => `<p>${esc(para)}</p>`).join('');
      if (item.kind === 'remark') return `<article class="assessment-doc-score"><strong>${esc(item.title || '备注')}</strong>${paras}</article>`;
      return `<article class="assessment-doc-score"><div class="assessment-doc-score-head"><strong>${esc(item.part || '')}</strong><b>${esc(item.score || '')}</b></div>${paras}</article>`;
    }).join('');
    const total = scoreDoc.total?.value ? `<article class="assessment-doc-score"><div class="assessment-doc-score-head"><strong>总分</strong><b>${esc(scoreDoc.total.value)}</b></div></article>` : '';
    const notes = scoreDoc.notes?.paras?.length ? `<article class="assessment-doc-score"><strong>${esc(scoreDoc.notes.title || '说明')}</strong>${scoreDoc.notes.paras.map((para) => `<p>${esc(para)}</p>`).join('')}</article>` : '';
    return `<h4>${esc(scoreDoc.title || '评分项')}</h4>${items}${total}${notes}`;
  };

  const basicReference = `<h4>项目基础信息</h4><dl>
      <dt>项目名称</dt><dd>某高校高性能计算GPU集群建设项目</dd>
      <dt>项目编号</dt><dd>ZKQ2025-XXXX-XXXX（H）</dd>
      <dt>项目标段</dt><dd>高性能计算GPU集群</dd>
      <dt>采购类别</dt><dd>货物（货物供货及伴随服务）</dd>
      <dt>项目包数</dt><dd>共 1 个包</dd>
      <dt>资金来源</dt><dd>专项资金，已落实</dd>
      <dt>采购预算</dt><dd>人民币 3950 万元</dd>
      <dt>最高限价</dt><dd>人民币 3950 万元</dd>
      <dt>采购人</dt><dd>某双一流高校</dd>
      <dt>采购代理机构</dt><dd>某招标代理公司</dd>
      <dt>采购方式</dt><dd>公开招标</dd>
      <dt>联合体投标</dt><dd>不接受</dd>
      <dt>进口产品</dt><dd>本项目包不接受进口设备投标</dd>
      <dt>核心产品</dt><dd>GPU计算节点1</dd>
      <dt>交货地点</dt><dd>某双一流高校信息中心</dd>
      <dt>交货期</dt><dd>合同签订后 45 个日历天</dd>
      <dt>质保期</dt><dd>不低于 3 年，自货物供货、安装、调试正常且经采购人确认验收合格之日起算</dd>
      <dt>付款方式</dt><dd>验收合格后 7 个工作日内提交合同总金额 10% 的履约保证金，采购人支付 100%；使用半年后 7 个工作日内退还</dd>
      <dt>售后响应</dt><dd>24 小时在线；30 分钟响应；市内 4 小时、市外 24 小时到场</dd>
      <dt>验收要求</dt><dd>安装调试完成、正常运行 1 个月内提出验收申请，可按要求送第三方检测</dd>
      <dt>项目模式</dt><dd>“交钥匙”项目，报价包含所有实施费用</dd>
    </dl>`;

  const referenceContent = {
    source: `<div class="assessment-source-document">${renderSourceReference()}</div>`,
    basic: basicReference,
    overview: renderOverviewReference(),
    score: renderScoreReference(),
  };

  const status = (label, tone, detail, basis = {}, manuallyMarked = false) => {
    const names = { missing: '信息缺失', ok: '满足', bad: '不满足', pending: '待确认' };
    const source = basis.source || '招标文件';
    const why = basis.why || '';
    const tooltip = `初始状态：${names[tone]}｜当前状态：${names[tone]}｜来源：${source}｜更新时间：${assessStamp}${why ? `｜备注：${why}` : ''}`;
    const basisHtml = `<p class="assessment-basis">评估依据：${esc(source)}${why ? ` · ${esc(why)}` : ''}</p>`;
    return `<div class="assessment-item" data-assessment-status="${tone}" data-initial-status="${tone}" data-source="${esc(source)}"><div><strong>${esc(label)}</strong><p>${esc(detail)}</p>${basisHtml}</div><div class="assessment-status-wrap"><select class="assessment-status-select ${tone}" aria-label="${esc(label)}状态" data-assessment-status-select><option value="missing" ${tone === 'missing' ? 'selected' : ''}>信息缺失</option><option value="ok" ${tone === 'ok' ? 'selected' : ''}>满足</option><option value="bad" ${tone === 'bad' ? 'selected' : ''}>不满足</option><option value="pending" ${tone === 'pending' ? 'selected' : ''}>待确认</option></select><small class="assessment-user-mark" ${manuallyMarked ? '' : 'hidden'} tabindex="0" data-tooltip="${esc(tooltip)}">人工标记</small></div></div>`;
  };


  const tabContent = {
    timeline: `<section class="assessment-panel"><h3>时间与递交约束</h3><p class="assessment-note">评估基准时间：${assessStamp} · 时间类约束按当前评估时间实时判断。</p>
      ${status('投标截止时间', deadlineTone, deadlineDetail, { source: '招标文件第一章 投标邀请 四、提交投标文件截止时间、开标时间和地点', why: deadlinePassed ? '以当前评估基准时间判断，已错过投标时间' : '需在截止时间前完成递交' })}
      ${status('递交地点', 'pending', '招标条件：某省某市某园区招标代理公司 1 号开标室 · 企业/资料情况：历史投标文件已递交', { source: '招标文件第一章 投标邀请 四、提交投标文件截止时间、开标时间和地点', why: '需以当时递交回执为准' })}
      ${status('投标有效期', 'ok', '招标条件：投标截止日期后 90 日历日 · 企业/资料情况：投标函承诺 90 日历日', { source: '招标文件第二章 供应商须知前附表 3.3.1 · 投标函', why: '以投标函承诺为依据' })}
      ${status('文件份数', 'pending', '招标条件：正本 1 份、副本 4 份、电子 PDF 1 份（U盘）· 企业/资料情况：投标文件已编制', { source: '招标文件第二章 供应商须知前附表 3.6.4', why: '需核实际装订和电子文件' })}</section>`,
    qualification: `<section class="assessment-panel"><h3>投标人资格要求</h3><p class="assessment-note">按招标文件资格条件逐项与企业资料、投标文件比对。</p>
      ${status('独立法人', 'ok', '企业/资料情况：已提供营业执照', { source: '招标文件第一章 申请人的资格要求（1）· 企业资料', why: '主体资料存在' })}
      ${status('财务制度', 'ok', '企业/资料情况：已提供 2024 年审计报告', { source: '招标文件第四章 附表1 资格审查表 · 企业资料', why: '审计报告存在' })}
      ${status('履约能力', 'ok', '企业/资料情况：已提供声明函', { source: '招标文件第四章 附表1 资格审查表 · 企业资料', why: '声明存在' })}
      ${status('税收证明', 'pending', '企业/资料情况：已提供项目期税收证明', { source: '招标文件第四章 附表1 资格审查表 · 企业资料', why: '项目期材料需按公告前 6 个月口径复核' })}
      ${status('社保证明', 'pending', '企业/资料情况：已提供项目期社保证明', { source: '招标文件第四章 附表1 资格审查表 · 企业资料', why: '项目期材料需按公告前 6 个月口径复核' })}
      ${status('无重大违法', 'ok', '企业/资料情况：已提供声明', { source: '招标文件第四章 附表1 资格审查表 · 企业资料', why: '声明存在' })}
      ${status('信用查询', 'pending', '企业/资料情况：已提供查询截图', { source: '招标文件第一章 申请人的资格要求（4）', why: '招标要求以投标截止当日查询结果为准' }, true)}
      ${status('关联关系', 'ok', '企业/资料情况：供应商基本情况表已声明无', { source: '招标文件第一章 申请人的资格要求（2）· 供应商基本情况表', why: '声明存在' })}
      ${status('前期服务', 'ok', '企业/资料情况：供应商基本情况表已声明未提供', { source: '招标文件第一章 申请人的资格要求（3）· 供应商基本情况表', why: '声明存在' })}</section>`,
    mandatory: `<section class="assessment-panel"><h3>★号及不允许偏离项</h3><p class="assessment-note">按招标文件第三章技术要求与商务条款，对投标技术/商务偏离表逐项比对；14 项 ★ 指标任意一项不满足即作无效标处理。</p>
      ${status('14 项★技术指标', 'ok', '资料/响应情况：投标技术偏离表均响应无偏离，并提供彩页、白皮书、截图等证明材料', { source: '投标技术偏离表 · 招标文件第三章 技术要求', why: '证明材料需在定稿前逐项复核' }, true)}
      ${status('9 项商务实质性条款', 'pending', '资料/响应情况：商务偏离表均响应无偏离', { source: '商务响应/偏离表 · 招标文件第三章 二、商务条款', why: '付款方式表述存在冲突' }, true)}
      ${status('管理服务器机箱高度', 'pending', '资料/响应情况：招标要求 1U，响应 2U', { source: '技术偏离表 · 招标文件第三章 技术要求', why: '疑似负偏离或笔误，需核对产品资料' }, true)}
      ${status('200G IB交换机类型', 'pending', '资料/响应情况：招标要求 HDR，响应存在 NDR/HDR 混用', { source: '技术偏离表 · 招标文件第三章 技术要求', why: '需核对产品资料' })}</section>`,
    rejection: `<section class="assessment-panel"><h3>明确废标约束</h3><p class="assessment-note">按招标文件无效投标与废标条款，对投标文件、报价文件逐项比对。</p>
      <div class="assessment-risk-block" data-assessment-non-status="risk"><strong>有效供应商数量</strong><span class="assessment-status risk">风险提示</span><p>无符合采购人专业要求的供应商，或对招标文件作实质响应的供应商不足三家的，应予废标。竞争数量无法预判，不输出企业满足性结论。</p></div>
      <div class="assessment-risk-block" data-assessment-non-status="risk"><strong>报价规则</strong><span class="assessment-status risk">风险提示</span><p>投标报价超过采购预算、分项预算或最高限价（3950 万元）的，投标无效；开标一览表与投标文件不一致时以开标一览表为准，大写与小写金额不一致时以大写金额为准。报价是否超限价见下方“报价不超限价”逐项判断。</p></div>
      ${status('报价不超限价', 'missing', '资料/响应情况：开标一览表和分项报价表为空', { source: '投标报价文件（开标一览表、分项报价表）', why: '无法判断报价是否超过 3950 万元' }, true)}
      ${status('投标函格式', 'pending', '资料/响应情况：投标函已提供', { source: '招标文件第六章 投标文件格式 · 投标函', why: '需复核签字、盖章、日期和报价填写' })}
      ${status('缺项漏项', 'ok', '资料/响应情况：技术偏离表 43 行已填写', { source: '投标技术响应/偏离表', why: '需按评标口径复核一般指标 17 项分组' })}
      ${status('商务条款响应', 'pending', '资料/响应情况：9 项已填写', { source: '商务响应/偏离表', why: '付款方式表述冲突' })}
      ${status('虚假材料', 'pending', '资料/响应情况：未发现直接证据', { source: '招标文件第四章 附表2 符合性检查表', why: '需核验证明材料来源' })}</section>`,
  };

  function getModal() {
    let backdrop = document.querySelector('[data-prebid-assessment-result]');
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.className = 'prebid-assessment-result-backdrop';
    backdrop.dataset.prebidAssessmentResult = 'true';
    backdrop.hidden = true;
    backdrop.innerHTML = `<section class="prebid-assessment-result-modal" role="dialog" aria-modal="true" aria-labelledby="prebidAssessmentResultTitle">
      <header class="prebid-assessment-result-header">
        <div class="prebid-assessment-result-title"><img src="./assets/figma/tool-demand-new.svg" alt=""><h2 id="prebidAssessmentResultTitle">投标符合性自评</h2></div>
        <div class="prebid-assessment-result-actions"><button type="button" class="prebid-assessment-download">下载</button><button type="button" class="prebid-assessment-reassess">重新评估</button><button type="button" class="prebid-assessment-result-close" aria-label="关闭投标符合性自评">×</button></div>
      </header>
      <div class="assessment-reassessing-overlay" data-assessment-reassessing hidden>
        <div class="assessment-reassessing-card" role="status" aria-live="polite">
          <span class="assessment-reassessing-spinner" aria-hidden="true"></span>
          <strong>正在重新评估</strong>
          <small>正在重新核对招标条件与企业资料，请稍候</small>
        </div>
      </div>
      <div class="prebid-assessment-result-workspace"><aside class="assessment-source-pane"><nav class="assessment-left-tabs" role="tablist" aria-label="招标文件参考目录"><button class="is-active" type="button" role="tab" data-reference-tab="source">招标原文件</button><button type="button" role="tab" data-reference-tab="basic">项目基础信息</button><button type="button" role="tab" data-reference-tab="overview">项目概述</button><button type="button" role="tab" data-reference-tab="score">评分项</button></nav><div class="assessment-left-content" data-reference-content>${referenceContent.source}</div></aside><main class="assessment-result-pane">
        <div class="assessment-result-overview">
          <div class="assessment-meta-row"><div><span>招标文件</span><strong>招标文件-某高校高性能计算GPU集群建设项目.docx</strong></div><div><span>评估基准时间</span><strong>${assessStamp}</strong></div></div>
          <div aria-label="评估企业"><span>评估企业</span><strong data-assessment-company-result>四川华鲲振宇智能科技有限责任公司</strong></div>
          <div class="assessment-conclusion"><span>评估结果：</span><strong>共 22 项</strong><span class="assessment-summary-status assessment-summary-missing">信息缺失 1</span><span class="assessment-summary-status assessment-summary-ok">满足 9</span><span class="assessment-summary-status assessment-summary-bad">不满足 1</span><span class="assessment-summary-status assessment-summary-pending">待确认 11</span><span class="assessment-summary-status assessment-summary-risk">另有风险提示 2 项</span></div>
          <div class="assessment-verdict${deadlinePassed ? ' is-bad' : ' is-ok'}" data-assessment-verdict><span>总体结论：</span><strong>${verdictTitle}</strong><small>${esc(verdictDetail)}</small></div>
        </div>
        <nav class="assessment-result-tabs" role="tablist" aria-label="标前评估模块">${[['timeline','时间与递交约束'],['qualification','投标人资格要求'],['mandatory','★号及不允许偏离项'],['rejection','明确废标约束']].map(([key,label], index) => `<button type="button" role="tab" class="assessment-result-tab${index === 0 ? ' is-active' : ''}" aria-selected="${index === 0}" data-assessment-result-tab="${key}"><span>${label}</span></button>`).join('')}</nav>
        <div class="assessment-result-content" data-assessment-result-content></div>
      </main></div></section>`;
    document.body.append(backdrop);
    const content = backdrop.querySelector('[data-assessment-result-content]');
    const activate = (key) => {
      const filterCounts = { timeline: [4, 0, 1, 1, 2], qualification: [9, 0, 6, 0, 3], mandatory: [4, 0, 1, 0, 3], rejection: [5, 1, 1, 0, 3] };
      const headings = { timeline: '时间与递交约束', qualification: '投标人资格要求', mandatory: '★号及不允许偏离项', rejection: '明确废标约束' };
      const labels = ['全部', '信息缺失', '满足', '不满足', '待确认'];
      const counts = filterCounts[key] || filterCounts.timeline;
      const panel = tabContent[key] || tabContent.timeline;
      const filterKeys = ['all', 'missing', 'ok', 'bad', 'pending'];
      const filterHtml = labels.map((label, index) => `<button class="assessment-filter-${filterKeys[index]} ${index === 0 ? 'is-active' : ''}" type="button" data-assessment-filter="${filterKeys[index]}">${label}<b>${counts[index]}</b></button>`).join('');
      content.innerHTML = `<div class="assessment-panel-head"><div class="assessment-filters" role="group" aria-label="状态筛选">${filterHtml}</div></div>${panel.replace(/<section class="assessment-panel"><h3>[^<]+<\/h3>/, '<section class="assessment-panel">')}`;
      content.scrollTop = 0;
      backdrop.querySelectorAll('[data-assessment-result-tab]').forEach((tab) => { const active = tab.dataset.assessmentResultTab === key; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); });
      content.querySelectorAll('[data-assessment-filter]').forEach((filter) => filter.addEventListener('click', () => { const value = filter.dataset.assessmentFilter; content.querySelectorAll('[data-assessment-filter]').forEach((item) => item.classList.toggle('is-active', item === filter)); content.querySelectorAll('[data-assessment-status]').forEach((item) => { item.hidden = value !== 'all' && item.dataset.assessmentStatus !== value; }); content.querySelectorAll('[data-assessment-non-status]').forEach((item) => { item.hidden = value !== 'all'; }); }));
      content.querySelectorAll('[data-assessment-status-select]').forEach((select) => select.addEventListener('change', () => { const item = select.closest('[data-assessment-status]'); const initial = item.dataset.initialStatus; const names = { missing: '信息缺失', ok: '满足', bad: '不满足', pending: '待确认' }; item.dataset.assessmentStatus = select.value; select.className = `assessment-status-select ${select.value}`; const mark = item.querySelector('.assessment-user-mark'); mark.hidden = false; mark.dataset.tooltip = `初始状态：${names[initial]}｜当前状态：${names[select.value]}｜来源：${item.dataset.source || '招标文件'}｜更新时间：${assessStamp}`; }));
    };
    backdrop.querySelectorAll('[data-assessment-result-tab]').forEach((tab) => tab.addEventListener('click', () => activate(tab.dataset.assessmentResultTab)));
    backdrop.querySelector('.prebid-assessment-result-close').addEventListener('click', closeModal);
    backdrop.querySelector('.prebid-assessment-download').addEventListener('click', () => {
      const contentText = `投标符合性自评\n招标文件：招标文件-某高校高性能计算GPU集群建设项目.docx\n评估基准时间：${assessStamp}\n总体结论：${verdictTitle}（${verdictDetail}）\n评估结果：共 22 项　满足 9　待确认 11　信息缺失 1　不满足 1　另有风险提示 2 项`;
      const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = '投标符合性自评.txt'; link.click(); URL.revokeObjectURL(link.href);
    });
    const beginReassessment = (company) => {
      const modal = backdrop.querySelector('.prebid-assessment-result-modal');
      const loading = backdrop.querySelector('[data-assessment-reassessing]');
      const reassessButton = backdrop.querySelector('.prebid-assessment-reassess');
      loading.hidden = false;
      modal.setAttribute('aria-busy', 'true');
      reassessButton.disabled = true;
      window.clearTimeout(backdrop.__reassessTimer);
      backdrop.__reassessTimer = window.setTimeout(() => {
        backdrop.querySelector('[data-assessment-company-result]').textContent = company;
        loading.hidden = true;
        modal.setAttribute('aria-busy', 'false');
        reassessButton.disabled = false;
      }, 1800);
    };
    backdrop.querySelector('.prebid-assessment-reassess').addEventListener('click', () => {
      const selectedCompany = backdrop.querySelector('[data-assessment-company-result]').textContent.trim();
      document.dispatchEvent(new CustomEvent('open-prebid-assessment', {
        detail: {
          skipInterpretation: true,
          modalTitle: '重新评估',
          submitLabel: '重新评估',
          selectedCompany,
          onSubmit: beginReassessment,
        },
      }));
    });
    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModal(); });
    activate('timeline');
    const referenceContentEl = backdrop.querySelector('[data-reference-content]');
    const activateReference = (key) => { referenceContentEl.innerHTML = referenceContent[key] || referenceContent.basic; backdrop.querySelectorAll('[data-reference-tab]').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.referenceTab === key)); };
    backdrop.querySelectorAll('[data-reference-tab]').forEach((tab) => tab.addEventListener('click', () => activateReference(tab.dataset.referenceTab)));
    activateReference('basic');
    return backdrop;
  }

  function openModal(title) { const backdrop = getModal(); lastFocused = document.activeElement; backdrop.querySelector('[data-assessment-company-result]').textContent = resolveCompany(title); backdrop.hidden = false; document.body.classList.add('prebid-assessment-result-open'); requestAnimationFrame(() => backdrop.querySelector('.prebid-assessment-result-close').focus()); }
  function closeModal() { const backdrop = document.querySelector('[data-prebid-assessment-result]'); if (!backdrop || backdrop.hidden) return; backdrop.hidden = true; document.body.classList.remove('prebid-assessment-result-open'); lastFocused?.focus?.(); }

  document.addEventListener('click', (event) => { const target = event.target.closest('#result-panel .record-row .record-main'); if (!target) return; const title = target.querySelector('strong')?.textContent?.trim() || ''; if (!(title.startsWith(PREFIX) || title.startsWith('投标自评_') || title.startsWith('标前评估_'))) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); openModal(title.replace(/^(?:标前评估_|投标自评_)/, PREFIX)); }, true);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
})();
