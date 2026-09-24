(() => {
  const config = window.__TENDER_DEVIATION_RESPONSE_CONFIG__;
  if (!config || !document.body?.classList.contains('deviation-mode-page')) return;

  let activeModal = null;
  const scoreIndexModule = {
    name: '评分索引',
    kind: 'score-index',
    rows: [
      { id: '1', requirement: '技术方案完整性与可行性', category: '技术评分' },
      { id: '2', requirement: '项目实施与服务保障能力', category: '技术评分' },
      { id: '3', requirement: '商务条款及合同响应情况', category: '商务评分' },
    ],
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

  const getSourceFile = () => document.querySelector(
    '#app .upload-panel .upload-group .file-row[aria-pressed="true"] .ellipsis, #app .upload-panel .upload-group .file-row .ellipsis',
  )?.textContent.trim() || '某高校高性能计算GPU集群建设项目.docx';

  const tableMarkup = (module, resultType) => {
    const isWriting = resultType === 'writing';
    if (module.kind === 'score-index') {
      return `<div class="analysis-table-wrap"><table class="analysis-table analysis-score-table"><thead><tr><th>序号</th><th>评分项</th><th>评审类别</th><th>对应响应内容</th><th>文件来源</th><th>对应页码</th></tr></thead><tbody>${module.rows.map((row) => {
        const source = row.category.includes('技术') ? '技术标投标正文' : '商务标投标正文';
        return `<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.requirement)}</td><td>${escapeHtml(row.category)}</td>${isWriting
          ? `<td class="analysis-response-cell">详见投标文件“${escapeHtml(row.requirement)}”相关章节</td><td class="analysis-response-cell">${source}</td>`
          : '<td class="analysis-empty-cell" aria-label="待撰写响应内容"></td><td class="analysis-empty-cell" aria-label="待匹配文件来源"></td>'}<td class="analysis-empty-cell" aria-label="页码保留为空"></td></tr>`;
      }).join('')}</tbody></table></div>`;
    }
    const requirementHeading = module.kind === 'requirements' ? '响应要求' : '招标要求';
    return `<div class="analysis-table-wrap"><table class="analysis-table"><thead><tr><th>编号</th><th>${requirementHeading}</th><th>响应内容</th><th>偏离/响应选项</th><th>条款属性</th></tr></thead><tbody>${module.rows.map((row) => `<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.requirement)}</td>${isWriting
      ? `<td class="analysis-response-cell">${escapeHtml(row.response)}</td><td><span class="analysis-tag">${escapeHtml(row.deviation)}</span></td>`
      : '<td class="analysis-empty-cell" aria-label="待撰写响应内容"></td><td class="analysis-empty-cell" aria-label="待填写偏离或响应选项"></td>'}<td>${escapeHtml(row.category)}${row.important ? ' · ★重点条款' : ''}</td></tr>`).join('')}</tbody></table></div>`;
  };

  const open = (trigger, resultType, recordTitle) => {
    activeModal?.remove();
    const isWriting = resultType === 'writing';
    const modules = [scoreIndexModule, ...config.getModeConfig('technical').modules, ...config.getModeConfig('business').modules];
    const displayTitle = recordTitle || `响应解读_${getSourceFile().replace(/\.[^.]+$/, '')}`;
    const resultMeta = isWriting ? '撰写结果' : '框架提取结果';
    const resultNote = isWriting
      ? '已根据投标正文完成响应内容与偏离选项填写；对应页码按要求保留为空'
      : '当前为框架抽取结果，响应内容及偏离选项将在“偏离/响应撰写”中填写';
    const modal = document.createElement('div');
    modal.className = 'business-outline-modal deviation-analysis-modal';
    modal.innerHTML = `<section class="shell" role="dialog" aria-modal="true" aria-labelledby="deviationAnalysisTitle">
      <div class="topbar"><div class="title" id="deviationAnalysisTitle">${escapeHtml(displayTitle)}</div><div class="analysis-meta">${resultMeta}</div><div class="actions"><button class="action" type="button" data-analysis-download>下载</button></div><button class="close" type="button" data-analysis-close aria-label="关闭${resultMeta}">×</button></div>
      <section class="analysis-page"><div class="workspace">
        <aside class="left"><div class="directory-head"><strong>提取目录</strong><span>共 ${modules.length} 项</span></div>${modules.map((module, index) => `<button class="node ${index === 0 ? 'active score-index-node' : ''}" type="button" data-analysis-module="${index}"><span class="label">${escapeHtml(module.name)}</span><span class="origin">${module.kind === 'table' ? '制式表格' : '依据要求生成'}</span></button>`).join('')}</aside>
        <div class="outline-resizer" aria-hidden="true"></div>
        <main class="main"><div class="source-head"><div class="source-heading"><span data-analysis-heading>${escapeHtml(modules[0].name)}</span><small>来源：招标文件</small></div></div><div class="analysis-source"><div class="analysis-source-note"><span class="analysis-kind" data-analysis-kind>依据要求生成</span><span>${resultNote}</span></div><div data-analysis-content>${tableMarkup(modules[0], resultType)}</div></div></main>
      </div></section>
    </section>`;
    document.body.append(modal);
    activeModal = modal;
    const render = (index) => {
      const module = modules[index] || modules[0];
      modal.querySelectorAll('[data-analysis-module]').forEach((item) => item.classList.toggle('active', Number(item.dataset.analysisModule) === index));
      modal.querySelector('[data-analysis-heading]').textContent = module.name;
      modal.querySelector('[data-analysis-kind]').textContent = module.kind === 'table' ? '制式表格' : '依据要求生成';
      modal.querySelector('[data-analysis-content]').innerHTML = tableMarkup(module, resultType);
    };
    modal.querySelectorAll('[data-analysis-module]').forEach((item) => item.addEventListener('click', () => render(Number(item.dataset.analysisModule))));
    modal.querySelector('[data-analysis-close]').addEventListener('click', () => { modal.remove(); activeModal = null; trigger?.focus?.(); });
    modal.addEventListener('click', (event) => { if (event.target === modal) modal.remove(); });
    modal.querySelector('[data-analysis-download]').addEventListener('click', () => { modal.querySelector('.analysis-kind').textContent = '已加入下载队列'; });
    modal.querySelector('[data-analysis-close]').focus();
  };

  document.addEventListener('click', (event) => {
    const main = event.target.closest?.('#result-panel .record-row .record-main, #result-panel .processing-row');
    const title = main?.querySelector('strong')?.textContent.trim() || '';
    const isAnalysis = title.startsWith('响应解读_');
    const isWriting = title.startsWith('响应正文_');
    if (!main || (!isAnalysis && !isWriting)) return;
    if (main.matches('.processing-row')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    open(main, isWriting ? 'writing' : 'analysis', title);
  }, true);
})();
