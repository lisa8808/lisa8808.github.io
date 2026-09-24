(() => {
  const PREFIX = '技术大纲_';
  let activeModal = null;

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  function renderDocTable(rows) {
    if (!Array.isArray(rows) || !rows.length) return '';
    return `<div class="technical-outline-doc-table-wrap"><table class="technical-outline-doc-table"><tbody>${rows.map((row, rowIndex) => `<tr>${row.map((cell) => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      return `<${tag}>${escapeHtml(cell).replace(/\n/g, '<br>')}</${tag}>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function renderSourceBlock(block) {
    if (!block) return '';
    if (block.kind === 'heading') {
      const tag = Number(block.level) >= 3 ? 'h5' : 'h4';
      return `<${tag}>${escapeHtml(block.text)}</${tag}>`;
    }
    if (block.kind === 'table') return renderDocTable(block.rows);
    if (block.kind === 'image') return `<img class="technical-outline-source-image" src="${escapeHtml(block.src)}" alt="">`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }

  function renderSourcePanel() {
    const doc = typeof window !== 'undefined' ? window.tenderSourceDocument : null;
    if (!doc?.sections?.length) return '';
    const cover = doc.cover || {};
    const meta = Array.isArray(cover.meta) ? cover.meta : [];
    const head = `
      <div class="technical-outline-source-document-head">
        <span>招标文件原文</span>
        <small>${escapeHtml(doc.fileName || '')}</small>
      </div>
      ${cover.code ? `<strong>${escapeHtml(cover.code)}</strong>` : ''}
      ${cover.title ? `<h3>${escapeHtml(cover.title)}</h3>` : ''}
      ${cover.subtitle ? `<h4>${escapeHtml(cover.subtitle)}</h4>` : ''}
      ${meta.length ? `<div class="technical-outline-source-meta">${meta.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>` : ''}`;
    const sections = doc.sections.map((section) => `
      <section class="technical-outline-source-section">
        <h4>${escapeHtml(section.chapter)}</h4>
        ${(section.blocks || []).map(renderSourceBlock).join('')}
      </section>`).join('');
    return head + sections;
  }

  function renderOverviewBlock(block) {
    if (!block) return '';
    if (block.kind === 'heading') return `<p class="technical-outline-overview-sub">${escapeHtml(block.text)}</p>`;
    if (block.kind === 'table') return renderDocTable(block.rows);
    if (block.kind === 'list' || block.kind === 'olist') {
      const tag = block.kind === 'olist' ? 'ol' : 'ul';
      return `<${tag}>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
    }
    if (block.kind === 'quote') return `<p class="technical-outline-overview-note">${escapeHtml(block.text)}</p>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  }

  function renderOverviewPanel() {
    const doc = typeof window !== 'undefined' ? window.tenderProjectOverview : null;
    if (!doc?.groups?.length) return '';
    return doc.groups.map((group, index) => `
      <details class="technical-outline-overview-group"${index <= 1 ? ' open' : ''}>
        <summary>${escapeHtml(group.heading)}</summary>
        <div class="technical-outline-overview-body">${(group.blocks || []).map(renderOverviewBlock).join('')}</div>
      </details>`).join('');
  }

  function renderScorePanel() {
    const doc = typeof window !== 'undefined' ? window.tenderScoreStandard : null;
    if (!doc?.items?.length) return '';
    const items = doc.items.map((item) => {
      const paragraphs = (item.paras || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
      if (item.kind === 'remark') {
        return `<article class="technical-outline-score-item technical-outline-score-note"><div><strong>${escapeHtml(item.title || '备注')}</strong></div>${paragraphs}</article>`;
      }
      const title = [item.part, item.project].filter(Boolean).join(' · ');
      return `<article class="technical-outline-score-item"><div><strong>${escapeHtml(title)}</strong><b>${escapeHtml(item.score || '')}</b></div>${paragraphs}</article>`;
    }).join('');
    const total = doc.total?.value
      ? `<article class="technical-outline-score-item technical-outline-score-total"><div><strong>${escapeHtml(doc.total.label || '总分')}</strong><b>${escapeHtml(doc.total.value)}</b></div></article>`
      : '';
    const notes = doc.notes?.paras?.length
      ? `<article class="technical-outline-score-item technical-outline-score-note"><div><strong>${escapeHtml(doc.notes.title || '说明')}</strong></div>${(doc.notes.paras || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</article>`
      : '';
    const policy = doc.policy?.rows?.length
      ? `<article class="technical-outline-score-item technical-outline-score-note"><div><strong>${escapeHtml(doc.policy.title || '政府采购政策')}</strong></div>${renderDocTable(doc.policy.rows)}</article>`
      : '';
    return items + total + notes + policy;
  }

  function createSourcePanels() {
    return {
      source: renderSourcePanel() || '<strong>招标文件数据未加载。</strong>',
      score: renderScorePanel() || '<h4>主要评分点</h4><p>评分标准数据未加载。</p>',
      overview: renderOverviewPanel() || '<h4>项目概述</h4><p>项目概述数据未加载。</p>',
    };
  }

  const toc = (level, text) => ({ level, text });
  const chapters = [
    {
      title: '1 技术货物规格书',
      sections: [
        toc(1, '1.1 技术要求点对点应答'),
        toc(2, '1.1.1 GPU计算节点1（单台配置）'),
        toc(3, '1.1.1.1 机箱：8U高度，机架式服务器'),
        toc(3, '1.1.1.2 ★处理器'),
        toc(3, '1.1.1.3 ★内存'),
        toc(3, '1.1.1.4 ▲SSD'),
        toc(3, '1.1.1.5 ★GPU卡'),
        toc(3, '1.1.1.6 PCIe插槽'),
        toc(3, '1.1.1.7 IO接口及网卡'),
        toc(3, '1.1.1.8 ▲IB卡'),
        toc(3, '1.1.1.9 电源及风扇'),
        toc(2, '1.1.2 GPU计算节点2（单台配置）'),
        toc(3, '1.1.2.1 机箱：4U高度，机架式服务器'),
        toc(3, '1.1.2.2 ★CPU处理器'),
        toc(3, '1.1.2.3 ★内存：≥1024GB'),
        toc(3, '1.1.2.4 存储及Raid卡'),
        toc(3, '1.1.2.5 ★AI卡'),
        toc(3, '1.1.2.6 网络'),
        toc(3, '1.1.2.7 电源及风扇'),
        toc(2, '1.1.3 计算卡1（单张配置）'),
        toc(3, '1.1.3.1 ★单块GPU卡显存≥141GB；卡间互联带宽≥900GB/s'),
        toc(3, '1.1.3.2 #单块GPU卡FP64算力≥1TFLOPS'),
        toc(3, '1.1.3.3 #单块GPU卡FP32算力≥1TFLOPS'),
        toc(3, '1.1.3.4 #单块GPU卡FP16算力≥100TFLOPS'),
        toc(2, '1.1.4 ★计算卡2（单张配置）'),
        toc(2, '1.1.5 管理服务器（单台配置）'),
        toc(3, '1.1.5.1 机箱：1U高度，机架式服务器'),
        toc(3, '1.1.5.2 ★处理器'),
        toc(3, '1.1.5.3 ★内存'),
        toc(3, '1.1.5.4 SSD'),
        toc(3, '1.1.5.5 PCIe插槽及IO接口'),
        toc(3, '1.1.5.6 ★网卡'),
        toc(3, '1.1.5.7 电源与风扇'),
        toc(3, '1.1.5.8 ▲管理系统（任意1台管理服务器上配置一套）（单套配置）'),
        toc(2, '1.1.6 800G IB交换机（单台配置）'),
        toc(2, '1.1.7 200G IB交换机（单台配置）'),
        toc(2, '1.1.8 万兆以太网交换机（单台配置）'),
        toc(2, '1.1.9 千兆以太网交换机（单台配置）'),
        toc(2, '1.1.10 存储服务器（单台配置）'),
        toc(3, '1.1.10.1 ★处理器'),
        toc(3, '1.1.10.2 ★内存：≥256G内存'),
        toc(3, '1.1.10.3 ★存储'),
        toc(3, '1.1.10.4 其它配置'),
        toc(3, '1.1.10.5 存储系统（在3台存储服务器上各配置一套）（单套配置）'),
        toc(4, '1.1.10.5.1 部署方式'),
        toc(4, '1.1.10.5.2 ▲文件系统'),
        toc(4, '1.1.10.5.3 数据管理'),
        toc(4, '1.1.10.5.4 ▲数据回收站'),
        toc(4, '1.1.10.5.5 ▲数据分层'),
        toc(1, '1.2 货物性能参数应有技术资料'),
        toc(2, '1.2.1 GPU技术节点1产品彩页（某8U GPU服务器）'),
        toc(2, '1.2.2 GPU计算节点2产品彩页（某4U国产ARM服务器）'),
        toc(2, '1.2.3 计算卡1产品彩页（某GPU计算卡）'),
        toc(2, '1.2.4 计算卡2产品彩页（某国产NPU AI）'),
        toc(1, '1.3 供应商认为需要提供的其他技术资料'),
        toc(2, '1.3.1 制造商授权和售后服务承诺'),
        toc(2, '1.3.2 服务器环境标志认证证书'),
      ],
    },
    {
      title: '2 技术响应/偏离表',
      sections: [toc(1, '（制式表格，正文为响应/偏离表内容，无下级标题）')],
    },
    {
      title: '3 技术能力相关文件',
      sections: [toc(1, '3.1 服务器相关材料')],
    },
    {
      title: '4 节能环保产品清单及证明材料',
      sections: [toc(1, '（制式清单及证明材料，无下级标题）')],
    },
    {
      title: '5 供货计划',
      sections: [
        toc(1, '5.1 建设周期'),
        toc(1, '5.2 质量管理'),
        toc(2, '5.2.1 制定质量计划'),
        toc(2, '5.2.2 “过程和工作产品”的质量检查'),
        toc(2, '5.2.3 不符合项的跟踪处理'),
      ],
    },
    {
      title: '6 调试验收方案',
      sections: [
        toc(1, '6.1 验收依据'),
        toc(1, '6.2 注意事项'),
        toc(1, '6.3 验收时间'),
        toc(1, '6.4 测试组网图'),
        toc(1, '6.5 测试环境'),
        toc(2, '6.5.1 测试硬件配置'),
        toc(2, '6.5.2 测试软件'),
        toc(1, '6.6 测试约定'),
        toc(2, '6.6.1 结果描述'),
        toc(1, '6.7 测试用例及测试记录'),
        toc(2, '6.7.1 基本功能测试'),
        toc(3, '6.7.1.1 服务器硬件检测'),
        toc(3, '6.7.1.2 服务器硬件模块标示检测'),
        toc(3, '6.7.1.3 服务器上架测试'),
        toc(3, '6.7.1.4 服务器上电测试'),
        toc(3, '6.7.1.5 RAID 配置测试'),
        toc(3, '6.7.1.6 操作系统安装测试'),
        toc(2, '6.7.2 管理功能测试'),
        toc(3, '6.7.2.1 状态指示灯测试'),
        toc(3, '6.7.2.2 服务器 iBMC IP 查询，设置测试'),
        toc(3, '6.7.2.3 服务器远程上电，下电测试'),
        toc(3, '6.7.2.4 服务器部件信息查询测试'),
        toc(2, '6.7.3 可靠性测试'),
        toc(3, '6.7.3.1 电源冗余测试'),
        toc(3, '6.7.3.2 风扇冗余测试'),
        toc(3, '6.7.3.3 硬盘冗余测试'),
        toc(2, '6.7.4 稳定性测试'),
        toc(3, '6.7.4.1 长时间稳定性压力测试'),
        toc(1, '6.8 测试结果分析'),
        toc(2, '6.8.1 测试基本信息'),
        toc(2, '6.8.2 测试结果列表'),
        toc(1, '6.9 客户建议及结果确认'),
        toc(2, '6.9.1 客户建议'),
        toc(2, '6.9.2 结果确认'),
      ],
    },
    {
      title: '7 售后服务方案',
      sections: [
        toc(1, '7.1 人员配置计划'),
        toc(1, '7.2 售后服务承诺'),
        toc(1, '7.3 售后服务体系'),
        toc(1, '7.4 售后服务项目'),
        toc(1, '7.5 安装调测'),
        toc(1, '7.6 技术服务'),
        toc(1, '7.7 专业服务监督体系'),
      ],
    },
    {
      title: '培训服务计划方案',
      sections: [
        toc(1, '培训目的'),
        toc(1, '培训内容'),
        toc(1, '培训流程'),
        toc(1, '培训计划'),
        toc(1, '培训课程'),
        toc(1, '培训质量保障机制'),
      ],
    },
    {
      title: '8 其它',
      sections: [],
    },
  ];

  const DEFAULT_WRITING_IDEA = '锚定评分项「技术规范书应答」，作为全篇总领章节，阐明对项目背景、采购内容及技术规范要求的总体理解与应答承诺，为后续各技术章节提供总纲，突出我司产品完全满足并优于招标要求的整体站位。';

  function showToast(modal, message) {
    const toast = modal.querySelector('[data-outline-toast]');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => { toast.hidden = true; }, 1800);
  }

  function createChapterElement(title, writingIdea) {
    const chapter = document.createElement('article');
    chapter.className = 'technical-outline-chapter';
    chapter.tabIndex = 0;
    chapter.dataset.chapterThought = writingIdea;
    chapter.innerHTML = `
      <div class="chapter-heading"><strong>${escapeHtml(title)}</strong><span>约8页/4000字</span></div>
      <div class="chapter-sections"><p>${escapeHtml(writingIdea)}</p></div>
      <div class="chapter-tools">
        <button type="button" data-chapter-action="编写思路">编写思路</button>
        <button type="button" data-chapter-action="新增下一章节">新增下一章节</button>
        <button type="button" data-chapter-action="删除">删除</button>
      </div>`;
    return chapter;
  }

  function closeChapterDialog(modal) {
    modal.querySelector('[data-chapter-dialog]')?.remove();
  }

  function openChapterDialog(modal, action, chapter) {
    closeChapterDialog(modal);
    const shell = modal.querySelector('.technical-outline-shell');
    const chapterTitle = chapter.querySelector('.chapter-heading strong')?.textContent.trim() || '当前章节';
    const writingIdea = chapter.dataset.chapterThought || DEFAULT_WRITING_IDEA;
    const dialogBackdrop = document.createElement('div');
    dialogBackdrop.className = 'technical-outline-dialog-backdrop';
    dialogBackdrop.dataset.chapterDialog = action;

    if (action === '编写思路') {
      dialogBackdrop.innerHTML = `
        <section class="technical-outline-dialog" role="dialog" aria-modal="true" aria-labelledby="chapterThoughtTitle">
          <header><h3 id="chapterThoughtTitle">编写思路</h3><button type="button" data-dialog-close aria-label="关闭">×</button></header>
          <div class="technical-outline-dialog-body">
            <textarea data-dialog-writing-idea aria-label="编写思路">${escapeHtml(writingIdea)}</textarea>
          </div>
          <footer><button class="technical-outline-dialog-secondary" type="button" data-dialog-close>取消</button><button class="technical-outline-dialog-primary" type="button" data-dialog-submit>重新生成本章节</button></footer>
        </section>`;
    } else if (action === '新增下一章节') {
      dialogBackdrop.innerHTML = `
        <section class="technical-outline-dialog" role="dialog" aria-modal="true" aria-labelledby="chapterAddTitle">
          <header><h3 id="chapterAddTitle">新增下一章节</h3><button type="button" data-dialog-close aria-label="关闭">×</button></header>
          <div class="technical-outline-dialog-body technical-outline-dialog-form">
            <label>章节标题<input type="text" data-dialog-chapter-title placeholder="请输入章节标题"></label>
            <label>编写思路<textarea data-dialog-writing-idea placeholder="请输入编写思路（必填）"></textarea></label>
          </div>
          <footer><button class="technical-outline-dialog-secondary" type="button" data-dialog-close>取消</button><button class="technical-outline-dialog-primary" type="button" data-dialog-submit disabled>生成并新增</button></footer>
        </section>`;
    } else {
      dialogBackdrop.innerHTML = `
        <section class="technical-outline-dialog is-delete" role="alertdialog" aria-modal="true" aria-labelledby="chapterDeleteTitle">
          <div class="technical-outline-delete-copy"><span aria-hidden="true">!</span><div><h3 id="chapterDeleteTitle">删除章节</h3><p>确定删除该章节吗？</p></div></div>
          <footer><button class="technical-outline-dialog-secondary" type="button" data-dialog-close>取消</button><button class="technical-outline-dialog-primary" type="button" data-dialog-submit>确定</button></footer>
        </section>`;
    }

    shell.append(dialogBackdrop);
    const close = () => closeChapterDialog(modal);
    dialogBackdrop.addEventListener('click', (event) => {
      if (event.target === dialogBackdrop || event.target.closest('[data-dialog-close]')) close();
    });

    const submit = dialogBackdrop.querySelector('[data-dialog-submit]');
    if (action === '新增下一章节') {
      const titleInput = dialogBackdrop.querySelector('[data-dialog-chapter-title]');
      const ideaInput = dialogBackdrop.querySelector('[data-dialog-writing-idea]');
      const syncDisabled = () => { submit.disabled = !titleInput.value.trim() || !ideaInput.value.trim(); };
      titleInput.addEventListener('input', syncDisabled);
      ideaInput.addEventListener('input', syncDisabled);
      titleInput.focus({ preventScroll: true });
    } else {
      dialogBackdrop.querySelector('[data-dialog-writing-idea]')?.focus({ preventScroll: true });
    }

    submit.addEventListener('click', () => {
      if (action === '编写思路') {
        const value = dialogBackdrop.querySelector('[data-dialog-writing-idea]').value.trim();
        if (!value) return;
        chapter.dataset.chapterThought = value;
        close();
        modal.__startOutlineLoading?.();
        return;
      }
      if (action === '新增下一章节') {
        const title = dialogBackdrop.querySelector('[data-dialog-chapter-title]').value.trim();
        const idea = dialogBackdrop.querySelector('[data-dialog-writing-idea]').value.trim();
        if (!title || !idea) return;
        const newChapter = createChapterElement(title, idea);
        chapter.insertAdjacentElement('afterend', newChapter);
        modal.querySelectorAll('[data-chapter-index]').forEach((item) => item.classList.remove('is-active'));
        newChapter.classList.add('is-active');
        newChapter.dataset.chapterIndex = String(modal.querySelectorAll('.technical-outline-chapter').length - 1);
        close();
        newChapter.scrollIntoView({ block: 'center', behavior: 'smooth' });
        modal.__startOutlineLoading?.();
        return;
      }
      const nextChapter = chapter.nextElementSibling || chapter.previousElementSibling;
      chapter.remove();
      nextChapter?.classList.add('is-active');
      close();
      showToast(modal, '章节已删除');
    });
  }

  function closeModal() {
    if (!activeModal) return;
    const focusTarget = activeModal.__previousFocus;
    (activeModal.__outlineTimers || []).forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    activeModal.remove();
    activeModal = null;
    document.documentElement.classList.remove('technical-outline-result-open');
    document.body.classList.remove('technical-outline-result-open');
    focusTarget?.focus?.({ preventScroll: true });
  }

  function openModal(title, trigger) {
    closeModal();
    const safeTitle = escapeHtml(title);
    const sourcePanels = createSourcePanels();
    const modal = document.createElement('div');
    modal.className = 'technical-outline-result-modal';
    modal.dataset.technicalOutlineResult = 'true';
    modal.__previousFocus = trigger;
    modal.innerHTML = `
      <section class="technical-outline-shell" role="dialog" aria-modal="true" aria-labelledby="technical-outline-result-title">
        <header class="technical-outline-topbar">
          <div class="technical-outline-title"><span>标题：</span><strong id="technical-outline-result-title" data-outline-title>${safeTitle}</strong><button type="button" data-edit-title aria-label="编辑标题"><img src="./assets/figma/project-edit.svg" alt=""></button></div>
          <div class="technical-outline-actions">
            <button class="regenerate" type="button" data-regenerate><img src="./assets/figma/record-refresh.svg" alt="">重新生成</button>
            <button class="secondary" type="button" data-outline-download>下载</button>
            <button class="primary" type="button" data-generate-body>立即生成全文</button>
            <button class="close" type="button" data-outline-close aria-label="关闭">×</button>
          </div>
        </header>
        <div class="technical-outline-workspace">
          <main class="technical-outline-main">
            <div class="technical-outline-summary">
              <div><strong>☰ 技术标目录</strong><span>预计生成122332字｜123页</span></div>
            </div>
            <div class="technical-outline-chapters">
              ${chapters.map((chapter, index) => `
                <article class="technical-outline-chapter${index === 0 ? ' is-active' : ''}" tabindex="0" data-chapter-index="${index}">
                  <div class="chapter-heading"><strong>${chapter.title}</strong><span>约8页/4000字</span></div>
                  <div class="chapter-sections">${chapter.sections.map((section) => `<p class="outline-toc-level-${section.level}">${escapeHtml(section.text)}</p>`).join('')}</div>
                  <div class="chapter-tools">
                    <button type="button" data-chapter-action="编写思路">编写思路</button>
                    <button type="button" data-chapter-action="新增下一章节">新增下一章节</button>
                    <button type="button" data-chapter-action="删除">删除</button>
                  </div>
                </article>`).join('')}
            </div>
            <div class="technical-outline-loading" data-outline-loading hidden aria-live="polite">
              <div class="technical-outline-loading-visual">
                <img src="./assets/figma/tool-outline-new.svg" alt="">
              </div>
              <div class="technical-outline-loading-progress">
                <div><i data-loading-bar></i></div><span data-loading-percent>12%</span>
              </div>
              <strong>正在生成大纲</strong>
              <p>请稍候，AI 正在为您生成投标文件大纲</p>
            </div>
            <form class="technical-outline-prompt" data-outline-prompt>
              <textarea aria-label="修改要求" data-outline-prompt-input autocomplete="off" spellcheck="false" placeholder="请输入您想要修改的章节或内容"></textarea>
              <div class="technical-outline-command-chip" data-outline-command-chip hidden>
                <span class="command-label">☷ 调整目录层级</span>
                <button type="button" data-level-decrease aria-label="减少目录层级">−</button>
                <output data-level-value aria-label="当前目录层级">4</output>
                <button type="button" data-level-increase aria-label="增加目录层级">+</button>
                <button type="button" data-remove-command aria-label="取消调整目录层级">×</button>
              </div>
              <button type="button" data-adjust-level>☷ 调整目录层级</button>
              <button class="send" type="submit" aria-label="发送修改要求"><img src="./assets/figma/send.svg" alt=""></button>
            </form>
          </main>
          <aside class="technical-outline-source">
            <nav role="tablist" aria-label="招标资料">
              <button class="is-active" type="button" role="tab" aria-selected="true" data-source-tab="source">招标文件</button>
              <button type="button" role="tab" aria-selected="false" data-source-tab="score">评分点</button>
              <button type="button" role="tab" aria-selected="false" data-source-tab="overview">项目概述</button>
            </nav>
            <div class="technical-outline-source-body" data-source-body>${sourcePanels.source}</div>
          </aside>
        </div>
        <div class="technical-outline-toast" data-outline-toast hidden></div>
      </section>`;

    modal.querySelectorAll('[data-outline-close]').forEach((button) => button.addEventListener('click', closeModal));
    modal.querySelector('[data-outline-download]').addEventListener('click', () => {
      const downloadTitle = modal.querySelector('[data-outline-title]')?.textContent?.trim() || '技术大纲';
      const filename = `${downloadTitle.replace(/[\\/:*?"<>|]/g, '_')}.docx`;
      const content = `技术标目录\n\n${chapters.map((chapter) => `${chapter.title}\n${chapter.sections.map((section) => section.text).join('\n')}`).join('\n\n')}`;
      const url = URL.createObjectURL(new Blob([content], { type: 'application/octet-stream' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    });
    const prompt = modal.querySelector('[data-outline-prompt]');
    const promptInput = prompt.querySelector('textarea');
    const adjustButton = prompt.querySelector('[data-adjust-level]');
    const commandChip = prompt.querySelector('[data-outline-command-chip]');
    const loading = modal.querySelector('[data-outline-loading]');
    const main = modal.querySelector('.technical-outline-main');
    const regenerateButton = modal.querySelector('[data-regenerate]');
    const generateBodyButton = modal.querySelector('[data-generate-body]');
    const sendButton = prompt.querySelector('.send');
    let outlineLevel = 4;

    const rememberTimer = (timer) => {
      modal.__outlineTimers ||= [];
      modal.__outlineTimers.push(timer);
      return timer;
    };
    const renderOutlineLevel = () => {
      prompt.querySelector('[data-level-value]').textContent = String(outlineLevel);
      prompt.querySelector('[data-level-decrease]').disabled = outlineLevel <= 1;
      prompt.querySelector('[data-level-increase]').disabled = outlineLevel >= 8;
    };
    const startLoading = () => {
      if (main.classList.contains('is-loading')) return;
      const progressBar = loading.querySelector('[data-loading-bar]');
      const progressText = loading.querySelector('[data-loading-percent]');
      let progress = 12;
      loading.hidden = false;
      main.classList.add('is-loading');
      prompt.classList.add('is-loading');
      regenerateButton.disabled = true;
      sendButton.disabled = true;
      promptInput.readOnly = true;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
      const progressTimer = rememberTimer(setInterval(() => {
        progress = Math.min(92, progress + Math.ceil(Math.random() * 9));
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
      }, 360));
      rememberTimer(setTimeout(() => {
        clearInterval(progressTimer);
        progressBar.style.width = '100%';
        progressText.textContent = '100%';
        rememberTimer(setTimeout(() => {
          loading.hidden = true;
          main.classList.remove('is-loading');
          prompt.classList.remove('is-loading');
          regenerateButton.disabled = false;
          sendButton.disabled = false;
          promptInput.readOnly = false;
        }, 220));
      }, 4000));
    };
    modal.__startOutlineLoading = startLoading;
    regenerateButton.addEventListener('click', startLoading);
    generateBodyButton.addEventListener('click', () => {
      closeModal();
      window.dispatchEvent(new CustomEvent('technical:generate-full-from-outline'));
    });
    const enterLevelMode = () => {
      prompt.classList.add('is-level-mode');
      commandChip.hidden = false;
      adjustButton.hidden = true;
      promptInput.value = '调整目录层级';
      promptInput.placeholder = '请输入需要调整的目录及目标层级';
      promptInput.focus({ preventScroll: true });
      promptInput.setSelectionRange(promptInput.value.length, promptInput.value.length);
    };
    const exitLevelMode = () => {
      prompt.classList.remove('is-level-mode');
      commandChip.hidden = true;
      adjustButton.hidden = false;
      promptInput.value = '';
      promptInput.placeholder = '请输入您想要修改的章节或内容';
      promptInput.focus({ preventScroll: true });
    };
    adjustButton.addEventListener('click', enterLevelMode);
    prompt.querySelector('[data-level-decrease]').addEventListener('click', () => {
      outlineLevel = Math.max(1, outlineLevel - 1);
      renderOutlineLevel();
    });
    prompt.querySelector('[data-level-increase]').addEventListener('click', () => {
      outlineLevel = Math.min(8, outlineLevel + 1);
      renderOutlineLevel();
    });
    prompt.querySelector('[data-remove-command]').addEventListener('click', exitLevelMode);
    renderOutlineLevel();
    modal.querySelector('[data-edit-title]').addEventListener('click', () => {
      const titleNode = modal.querySelector('[data-outline-title]');
      titleNode.contentEditable = titleNode.contentEditable !== 'true';
      if (titleNode.contentEditable === 'true') titleNode.focus();
    });
    modal.querySelectorAll('[data-source-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        modal.querySelectorAll('[data-source-tab]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
        });
        modal.querySelector('[data-source-body]').innerHTML = sourcePanels[button.dataset.sourceTab];
      });
    });
    modal.querySelector('.technical-outline-chapters').addEventListener('click', (event) => {
      const chapter = event.target.closest('.technical-outline-chapter');
      if (!chapter) return;
      modal.querySelectorAll('.technical-outline-chapter').forEach((item) => item.classList.toggle('is-active', item === chapter));
      const actionButton = event.target.closest('[data-chapter-action]');
      if (!actionButton) return;
      event.stopPropagation();
      openChapterDialog(modal, actionButton.dataset.chapterAction, chapter);
    });
    prompt.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = event.currentTarget.querySelector('textarea').value.trim();
      if (!value) {
        showToast(modal, '请输入修改要求');
        return;
      }
      startLoading();
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (modal.querySelector('[data-chapter-dialog]')) closeChapterDialog(modal);
      else closeModal();
    });

    document.body.append(modal);
    document.documentElement.classList.add('technical-outline-result-open');
    document.body.classList.add('technical-outline-result-open');
    activeModal = modal;
    modal.querySelector('[data-outline-close]').focus({ preventScroll: true });
  }

  document.addEventListener('click', (event) => {
    const result = event.target.closest('#result-panel .record-row .record-main');
    if (!result) return;
    const title = result.querySelector('strong')?.textContent?.trim() || result.textContent.trim();
    if (!title.startsWith(PREFIX)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openModal(title, result);
  }, true);
})();
