(() => {
  const OUTLINE_PREFIX = '商务大纲_';
  const BODY_PREFIX = '商务正文_';
  const LEGACY_OUTLINE_PREFIX = '商务标投标大纲_';
  const LEGACY_BODY_PREFIX = '商务标投标正文_';
  const PROJECT_NAME = '某高校高性能计算GPU集群建设项目';
  // 投标主体：与 business-body-content.js 里的 supplierName 保持同一名称
  const ENTERPRISE = '四川华鲲振宇智能科技有限责任公司';
  const DEFAULT_FILE = '某高校高性能计算GPU集群建设项目';
  // 斜杠引用弹窗的分类，与企业管理页面的六个板块保持一致
  const REFERENCE_CATEGORIES = ['企业信息', '企业资质', '企业业绩', '人员管理', '财务信息', '其他企业资料'];
  const REFERENCE_ICONS = { 企业信息: '企', 企业资质: '资', 企业业绩: '业', 人员管理: '人', 财务信息: '财', 其他企业资料: '其' };
  const REFERENCE_TABS_MARKUP = REFERENCE_CATEGORIES.map((name, index) => `<button type="button" class="reference-tab${index === 0 ? ' active' : ''}" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" data-reference-tab="${name}">${name}</button>`).join('');
  // 用户新增目录（A/B 项目合同）的正文内容，非原投标文件内容
  const USER_DIRECTORY_CONTENT = {
    'A项目合同': [
      {
        kind: 'table',
        layout: 'kv',
        rows: [
          [{ text: '合同名称', span: 1 }, { text: 'A项目服务器采购合同', span: 1 }],
          [{ text: '甲方名称', span: 1 }, { text: '某科技有限公司', span: 1 }],
          [{ text: '合同金额', span: 1 }, { text: '952.35万元', span: 1 }],
          [{ text: '签订日期', span: 1 }, { text: '2025-06-09', span: 1 }],
          [{ text: '服务内容', span: 1 }, { text: '中心推理服务器供货、安装及调试', span: 1 }],
          [{ text: '证明材料', span: 1 }, { text: '已上传合同关键页扫描件', span: 1 }],
        ],
      },
    ],
    'B项目合同': [
      {
        kind: 'table',
        layout: 'kv',
        rows: [
          [{ text: '合同名称', span: 1 }, { text: 'B项目服务器采购合同', span: 1 }],
          [{ text: '甲方名称', span: 1 }, { text: '某网络科技公司', span: 1 }],
          [{ text: '合同金额', span: 1 }, { text: '71.10万元', span: 1 }],
          [{ text: '签订日期', span: 1 }, { text: '2024-12-26', span: 1 }],
          [{ text: '证明材料', span: 1 }, { text: '', span: 1 }],
        ],
      },
    ],
  };
  let activeModal = null;
  let lastFocused = null;

  const originalWritingBasis = {
    'original-chapter-1': ['招标编写要求', '此章节在招标文件中有明确编写要求，正文生成时将依据招标要求进行编写。'],
    'original-table': ['固定表格或文件', '此章节在招标文件中有固定表格或固定文件，正文生成时将关联并保留“供应商综合情况表”的原格式。'],
    'original-license': ['资质及证明材料', '此章节要求提供“营业执照”，正文生成时将从企业资料库拉取对应资质及证明材料进行填充。'],
    'original-qualification': ['资质及证明材料', '此章节要求提供“企业资质证书”，正文生成时将从企业资料库拉取对应资质及证明材料进行填充。'],
    'original-requirement': ['招标编写要求', '此章节在招标文件中有同类项目业绩编写要求，正文生成时将依据招标要求进行编写。'],
    'original-performance-table': ['固定表格或文件', '此章节在招标文件中有固定表格，正文生成时将关联并保留“同类项目业绩情况表”的原格式。'],
    'original-personnel': ['招标编写要求', '此章节在招标文件中有人员配备编写要求，正文生成时将依据岗位、职责和能力要求进行编写。'],
    'original-progress': ['固定表格或文件', '此章节在招标文件中有固定表格，正文生成时将关联并保留“履约进度计划表”的原格式。'],
    'original-finance': ['资质及证明材料', '此章节要求提供“近三年度财务报告”，正文生成时将从企业资料库拉取对应财务证明材料进行填充。'],
    'original-chapter-2': ['招标编写要求', '此章节在招标文件中有售后服务方案编写要求，正文生成时将依据招标要求进行编写。'],
    'original-warranty': ['招标编写要求', '此章节在招标文件中有免费保修期编写要求，正文生成时将依据招标要求进行编写。'],
    'original-repair': ['招标编写要求', '此章节在招标文件中有应急维修安排编写要求，正文生成时将依据招标要求进行编写。'],
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const getSourceFileName = () => {
    const row = document.querySelector(
      '#app .upload-panel .upload-group .file-row[aria-pressed="true"], #app .upload-panel .upload-group .file-row',
    );
    return row?.querySelector('.ellipsis')?.textContent?.trim()
      || row?.textContent?.trim()
      || DEFAULT_FILE;
  };

  const normalizeTitle = (title) => {
    const value = String(title || '').trim();
    return value.startsWith(OUTLINE_PREFIX) || value.startsWith(BODY_PREFIX)
      || value.startsWith(LEGACY_OUTLINE_PREFIX) || value.startsWith(LEGACY_BODY_PREFIX)
      ? value
      : `${OUTLINE_PREFIX}${value || getSourceFileName()}`;
  };

  const getRecordMode = (title) => {
    const value = String(title || '').trim();
    if (value.startsWith(BODY_PREFIX) || value.startsWith(LEGACY_BODY_PREFIX)) return 'body';
    if (value.startsWith(OUTLINE_PREFIX) || value.startsWith(LEGACY_OUTLINE_PREFIX)) return 'outline';
    return null;
  };

  const getInitialPage = (mode) => mode === 'body' ? 'body' : 'outline';

  const TENDER_FORMAT_CHAPTER = '第六章 投标文件格式';

  const normalizeHeadingText = (value) => String(value || '')
    .replace(/[\s\u3000]+/g, '')
    .replace(/[：:]+$/, '');

  const renderSourceDocTable = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return '';
    return `<div class="source-doc-table-wrap"><table class="source-doc-table"><tbody>${rows.map((row, rowIndex) => `<tr>${row.map((cell) => {
      const tag = rowIndex === 0 ? 'th' : 'td';
      return `<${tag}>${escapeHtml(cell).replace(/\n/g, '<br>')}</${tag}>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;
  };

  const renderSourceDocBlock = (block) => {
    if (!block) return '';
    if (block.kind === 'heading') {
      const tag = Number(block.level) >= 3 ? 'h5' : 'h4';
      return `<${tag}>${escapeHtml(block.text)}</${tag}>`;
    }
    if (block.kind === 'table') return renderSourceDocTable(block.rows);
    if (block.kind === 'image') return `<img class="source-doc-image" src="${escapeHtml(block.src)}" alt="">`;
    return `<p class="source-paragraph">${escapeHtml(block.text)}</p>`;
  };

  // 招标原文与技术标弹窗读取同一份全局数据，商务标按投标文件格式章节切分锚点以便定位。
  const buildTenderSourceParts = () => {
    const doc = typeof window !== 'undefined' ? window.tenderSourceDocument : null;
    if (!doc?.sections?.length) return null;
    const parts = [];
    doc.sections.forEach((section, index) => {
      const blocks = Array.isArray(section.blocks) ? section.blocks : [];
      const baseKey = `doc-${index}`;
      const chapter = section.chapter || TENDER_FORMAT_CHAPTER;
      if (chapter !== TENDER_FORMAT_CHAPTER) {
        parts.push({ key: baseKey, chapter, label: chapter, blocks });
        return;
      }
      let current = { key: baseKey, chapter, label: chapter, blocks: [] };
      blocks.forEach((block, blockIndex) => {
        const isHeading = block.kind === 'heading'
          || (block.kind === 'paragraph' && normalizeHeadingText(block.text) === '附：投标文件目录');
        if (!isHeading) {
          current.blocks.push(block);
          return;
        }
        if (current.blocks.length) parts.push(current);
        current = { key: `${baseKey}-${blockIndex}`, chapter, label: block.text, blocks: [block] };
      });
      parts.push(current);
    });
    return { doc, parts };
  };

  const buildTenderSourcePanel = () => {
    const built = buildTenderSourceParts();
    if (!built) return null;
    const { doc, parts } = built;
    const headingIndex = new Map();
    parts.forEach((part) => {
      const normalized = normalizeHeadingText(part.label);
      if (normalized && !headingIndex.has(normalized)) headingIndex.set(normalized, part.key);
    });
    const formatChapterKey = parts
      .find((part) => normalizeHeadingText(part.label) === normalizeHeadingText(TENDER_FORMAT_CHAPTER))?.key
      || parts[0]?.key;
    const resolveAnchor = (hints) => {
      const list = Array.isArray(hints) ? hints : [hints];
      for (const hint of list) {
        const key = headingIndex.get(normalizeHeadingText(hint));
        if (key) return key;
      }
      for (const hint of list) {
        const normalized = normalizeHeadingText(hint);
        if (!normalized) continue;
        const matched = parts.find((part) => normalizeHeadingText(part.label).startsWith(normalized));
        if (matched) return matched.key;
      }
      return formatChapterKey;
    };
    const html = parts.map((part) => {
      const first = part.blocks[0];
      const repeatsTitle = first && ['heading', 'paragraph'].includes(first.kind) && first.text === part.label;
      const blocks = repeatsTitle ? part.blocks.slice(1) : part.blocks;
      const displayLabel = part.label.replace(/[：:]+$/, '') || part.label;
      return `
        <section class="source-document-section" data-source-anchor="${part.key}" data-source-section="${escapeHtml(displayLabel)}">
          ${part.chapter === part.label ? '' : `<div class="source-ref"><span>${escapeHtml(part.chapter)}</span></div>`}
          <h3>${escapeHtml(displayLabel)}</h3>
          ${blocks.map(renderSourceDocBlock).join('')}
        </section>`;
    }).join('');
    const partByKey = new Map(parts.map((part) => [part.key, part]));
    return { doc, html, resolveAnchor, partByKey };
  };

  // 正文各章节右侧招标文件面板的摘录内容，取自同一份招标原文
  const sourceExcerpt = (sourcePanel, key) => {
    const part = sourcePanel?.partByKey?.get(key);
    if (!part) {
      return { section: '招标文件', title: '招标原文', text: '当前章节未关联招标原文。', hasTable: false };
    }
    const paragraph = (part.blocks || []).find((block) => block.kind === 'paragraph' && block.text?.trim());
    const text = paragraph?.text?.trim() || part.label;
    return {
      section: part.chapter,
      title: part.label.replace(/[：:]+$/, ''),
      text: text.length > 160 ? `${text.slice(0, 160)}…` : text,
      hasTable: (part.blocks || []).some((block) => block.kind === 'table'),
    };
  };

  // 商务标大纲目录结构，来源：interaction/demo造数-参考/05-商务标大纲.md
  const businessOutlineDirectory = [
    { label: '封面', anchor: '封面：', active: true },
    { label: '资格自查表', anchor: '资格自查表', basis: 'original-table' },
    {
      label: '一、投标函及附件',
      anchor: '一、投标函及附件',
      children: [
        { label: '1、投标函', anchor: '1、投标函' },
        { label: '2、法定代表人身份证明', anchor: '2、法定代表人身份证明' },
        { label: '3、法定代表人授权书', anchor: '3、法定代表人授权书' },
        { label: '4、联合体协议书（如适用）', anchor: '4、联合体协议书（如适用）' },
      ],
    },
    {
      label: '二、报价文件',
      anchor: '二、报价文件',
      children: [
        { label: '1、开标一览表', anchor: '1、开标一览表', basis: 'original-table' },
        { label: '2、投标分项报价一览表', anchor: '2、投标分项报价一览表', basis: 'original-table' },
        { label: '3、报价说明（如果有）', anchor: '3、报价说明（如果有）' },
      ],
    },
    {
      label: '三、商务文件',
      anchor: '三、商务文件',
      children: [
        { label: '1、供应商基本情况表', anchor: '1、供应商基本情况表', basis: 'original-table' },
        { label: '2、资格条件承诺书（《中华人民共和国政府采购法》第二十二条）', anchor: '2、资格条件承诺书' },
        { label: '3、其他资质文件', anchor: '3、其他资质文件', basis: 'original-qualification' },
        { label: '4、制造商出具的授权函（适用于进口产品，格式仅供参考）', anchor: '4、制造商出具的授权函' },
        { label: '5、无重大违法记录书面声明函', anchor: '5、无重大违法记录书面声明函' },
        { label: '6、中小企业声明函', anchor: '6、中小企业声明函' },
        { label: '7、监狱企业证明文件（如适用）', anchor: '7、监狱企业证明文件（如适用）' },
        { label: '8、残疾人福利性单位声明函（如适用）', anchor: '8、残疾人福利性单位声明函（如适用）' },
        {
          label: '9、相关业绩情况一览表',
          anchor: '9、相关业绩情况一览表',
          basis: 'original-performance-table',
          children: [
            { label: 'A项目合同', key: 'user-a', user: true },
            { label: 'B项目合同', key: 'user-b', user: true },
          ],
        },
        {
          label: '10、信誉、财务状况证明文件',
          anchor: '10、信誉、财务状况证明文件',
          basis: 'original-finance',
          children: [
            { label: '10-1 信誉证明文件', anchor: '10、信誉、财务状况证明文件' },
            { label: '10-2 财务状况', anchor: '10、信誉、财务状况证明文件', basis: 'original-finance' },
          ],
        },
        { label: '11、商务响应/偏离表', anchor: '11、商务响应/偏离表', basis: 'original-table' },
        { label: '12、具有履行合同所必需的设备和专业技术能力的声明函', anchor: '12、具有履行合同所必需的设备和专业技术能力的声明函' },
        { label: '13、符合法律、行政法规规定的其他条件的声明函', anchor: '13、符合法律、行政法规规定的其他条件的声明函' },
        { label: '14、其它', anchor: '14、其它' },
      ],
    },
    {
      label: '四、技术文件',
      anchor: '四、技术文件',
      basis: 'original-chapter-1',
    },
  ];

  // 目录树摊平成列表，大纲与正文共用同一份结构
  const flatDirectory = (resolveAnchorFn) => {
    const resolveAnchor = typeof resolveAnchorFn === 'function' ? resolveAnchorFn : () => 'doc-unavailable';
    const list = [];
    const walk = (entries, depth, path) => {
      entries.forEach((entry) => {
        const key = entry.user ? entry.key : resolveAnchor(entry.anchor);
        list.push({ ...entry, depth, key, path });
        if (entry.children?.length) walk(entry.children, depth + 1, [...path, entry.label]);
      });
    };
    walk(businessOutlineDirectory, 0, []);
    return list;
  };

  const directoryLevelClass = (depth) => (depth === 0 ? 'chapter' : depth === 1 ? 'sub1' : 'sub2');

  const directoryToggle = (entry) => (entry.depth === 0
    ? `<span class="chapter-toggle" aria-hidden="true">${entry.children?.length ? '▼' : ''}</span>`
    : '');

  const buildOutlineDirectoryMarkup = (directory) => directory.map((entry) => {
    const label = escapeHtml(entry.label);
    const origin = entry.user
      ? '<span class="origin user">用户新增</span>'
      : '<span class="origin original">招标原目录</span>';
    const dots = entry.user
      ? ''
      : `<button class="dots" type="button" data-menu-kind="original" aria-label="${label}更多操作">⋮</button>`;
    return `<div class="node ${directoryLevelClass(entry.depth)}${entry.active ? ' active' : ''}"${entry.children?.length ? ' data-chapter-toggle' : ''} data-directory-view="${entry.key}"${entry.basis ? ` data-writing-basis="${entry.basis}"` : ''}>${directoryToggle(entry)}<span class="label">${label}</span>${origin}${dots}</div>`;
  }).join('\n            ');

  // 正文内容来自 interaction/demo造数-标书/脱敏Word文件 下四份投标文件
  const bodyContentNodes = () => {
    const data = typeof window !== 'undefined' ? window.tenderBusinessBodyContent : null;
    return data?.nodes || {};
  };

  // 首列是「序号」的表格，该列属于制式模板的编号，不算用户待填写内容
  const isSequenceColumn = (table) => table.layout !== 'kv'
    && String(table.rows?.[0]?.[0]?.text || '').trim() === '序号';

  // 纵向合并的单元格来自招标文件制式模板，不参与待填写统计
  const isFillCell = (table, rowIndex, cellIndex, cell) => {
    if (Number(cell?.rowspan) > 1) return false;
    if (cellIndex === 0 && isSequenceColumn(table)) return false;
    return table.layout === 'kv' ? cellIndex !== 0 : rowIndex !== 0;
  };

  const cellSpanAttrs = (cell) => {
    const colspan = Number(cell.span) > 1 ? ` colspan="${Number(cell.span)}"` : '';
    const rowspan = Number(cell.rowspan) > 1 ? ` rowspan="${Number(cell.rowspan)}"` : '';
    return `${colspan}${rowspan}`;
  };

  const countBodyCells = (blocks) => {
    let total = 0;
    let pending = 0;
    (blocks || []).forEach((block) => {
      if (block.kind !== 'table') return;
      (block.rows || []).forEach((row, rowIndex) => row.forEach((cell, cellIndex) => {
        if (!isFillCell(block, rowIndex, cellIndex, cell)) return;
        total += 1;
        if (!String(cell.text || '').trim()) pending += 1;
      }));
    });
    return { total, pending };
  };

  const fillCellMarkup = (cell) => {
    const value = String(cell.text || '').trim();
    const attrs = cellSpanAttrs(cell);
    return value
      ? `<td class="filled" contenteditable="true"${attrs}>${escapeHtml(value).replace(/\n/g, '<br>')}</td>`
      : `<td class="missing" contenteditable="true"${attrs}>请输入</td>`;
  };

  const renderBodyTable = (table) => {
    const rows = (table.rows || []).map((row, rowIndex) => `<tr>${row.map((cell, cellIndex) => {
      if (isFillCell(table, rowIndex, cellIndex, cell)) return fillCellMarkup(cell);
      return `<td class="key"${cellSpanAttrs(cell)}>${escapeHtml(String(cell.text || '').trim()).replace(/\n/g, '<br>')}</td>`;
    }).join('')}</tr>`).join('');
    return `<table class="doc-table${table.layout === 'kv' ? ' kv-table' : ''}"><tbody>${rows}</tbody></table>`;
  };

  const renderBodyMaterial = (block) => {
    // 企业信息里维护了资料图的（营业执照、财务审计报告、税收证明、3A信用证书）直接展示原图
    const preview = block.image
      ? `<img class="material-image" src="${escapeHtml(block.image)}" alt="${escapeHtml(block.name)}" loading="lazy">`
      : `<div class="license-image"><h3>${escapeHtml(block.name)}</h3><div class="license-line"></div><div class="license-line"></div><div class="license-line"></div><div class="license-seal">企业公章</div></div>`;
    return `
              <div class="material-layout">
                <h2>${escapeHtml(block.name)}</h2>
                <div class="material-note" contenteditable="true">${escapeHtml(block.note || '')}</div>
                ${preview}
              </div>`;
  };

  // 正文排版：对齐、缩进、字号都按原文档的段落属性渲染
  const DOC_ALIGN_CLASS = { center: 'is-center', right: 'is-right', both: 'is-justify', left: 'is-left' };
  const DOC_HEADING_SIZES = { 1: 16, 2: 15, 3: 14, 4: 13 };

  const renderBodyBlock = (block) => {
    if (!block) return '';
    if (block.kind === 'cover-gap') return `<div class="doc-cover-gap is-${escapeHtml(block.size || 'lead')}" aria-hidden="true"></div>`;
    if (block.kind === 'material') return renderBodyMaterial(block);
    if (block.kind === 'table') return renderBodyTable(block);
    const text = escapeHtml(String(block.text || '').trim());
    const level = Number(block.level) || 0;
    const alignClass = DOC_ALIGN_CLASS[block.align] || '';
    const classes = [level ? 'doc-heading' : 'doc-paragraph'];
    if (level) {
      classes.push(`doc-heading-${Math.min(level, 4)}`);
      classes.push(`level-${Math.min(level, 4)}`);
    }
    if (alignClass) classes.push(alignClass);
    if (block.bold) classes.push('is-bold');
    const size = level
      ? (DOC_HEADING_SIZES[Math.min(level, 4)] || 14)
      : (Number(block.size) || 12);
    const tag = level ? `h${Math.min(level + 1, 5)}` : 'p';
    const indent = Math.min(Number(block.indent) || 0, 3);
    return `<${tag} class="${classes.join(' ')}" data-size="${size}"${indent ? ` data-indent="${indent}"` : ''}>${text}</${tag}>`;
  };

  // 编辑器工具栏沿用技术标正文同一套 Figma 图标与按钮规格
  const TOOLBAR_ICONS = {
    undo: '<img src="./assets/figma/detail-undo.svg" alt="">',
    redo: '<img src="./assets/figma/detail-redo.svg" alt="">',
    bold: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>',
    italic: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
    underline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>',
    justifyLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',
    justifyCenter: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>',
  };

  const BODY_EDITOR_TOOLBAR = `<div class="editor-toolbar" data-editor-toolbar role="toolbar" aria-label="正文编辑工具栏"><button type="button" data-command="undo" title="撤销">${TOOLBAR_ICONS.undo}撤销</button><button type="button" data-command="redo" title="恢复">${TOOLBAR_ICONS.redo}恢复</button><span class="editor-toolbar-divider" aria-hidden="true"></span><button type="button" data-command="bold" title="加粗">${TOOLBAR_ICONS.bold}加粗</button><button type="button" data-command="italic" title="斜体">${TOOLBAR_ICONS.italic}斜体</button><button type="button" data-command="underline" title="下划线">${TOOLBAR_ICONS.underline}下划线</button><span class="editor-toolbar-divider" aria-hidden="true"></span><button type="button" data-command="justifyLeft" title="左对齐">${TOOLBAR_ICONS.justifyLeft}左对齐</button><button type="button" data-command="justifyCenter" title="居中">${TOOLBAR_ICONS.justifyCenter}居中</button></div>`;

  const buildBodyModel = (directory, sourcePanel) => {
    const contentNodes = bodyContentNodes();
    const info = {};
    const panels = [];
    let total = 0;
    let pending = 0;
    const panelMarkup = (entry, body, overview) => `<section class="body-content-view${panels.length ? '' : ' active'}${overview ? ' is-overview' : ''}" data-body-panel="${escapeHtml(entry.label)}">
            <div class="body-panel-head">
              <div class="preview-meta"><strong>${escapeHtml(entry.label)}</strong><div class="legend"><span><i class="red"></i>未填写</span><span>白色：已填写，可直接修改</span></div></div>
              ${BODY_EDITOR_TOOLBAR}
            </div>
            ${body}
          </section>`;
    // 章节节点（仅做分组）给出子目录概览；用户新增目录给一份可编辑的空白正文
    // 正文区顶部同样显示章节标题（居中放大，带目录编号）；封面本身就是标题页，不再重复
    const docTitleMarkup = (entry) => (entry.label === '封面'
      ? ''
      : `<h2 class="doc-title">${escapeHtml(entry.label)}</h2>`);
    const chapterBodyMarkup = (entry) => {
      const children = entry.children || [];
      const items = children.map((child) => `<p class="doc-chapter-item">${escapeHtml(child.label)}</p>`).join('');
      return `<div class="document">
              ${docTitleMarkup(entry)}
              <p class="doc-paragraph" data-size="12">本章节包含 ${children.length} 个子目录，选择左侧目录即可查看对应正文内容。</p>
              <div class="doc-chapter-list">${items}</div>
            </div>`;
    };
    const defaultUserBlocks = (label) => [{
      kind: 'table',
      layout: 'kv',
      rows: [
        [{ text: '章节名称', span: 1 }, { text: label, span: 1 }],
        [{ text: '正文内容', span: 1 }, { text: '', span: 1 }],
      ],
    }];

    directory.forEach((entry) => {
      const fromData = contentNodes[entry.label];
      const blocks = Array.isArray(fromData) && fromData.length
        ? fromData
        : (USER_DIRECTORY_CONTENT[entry.label] || null);
      if (!blocks && entry.children?.length) {
        info[entry.label] = { total: 0, pending: 0, overview: true, ...sourceExcerpt(sourcePanel, entry.key), path: entry.path };
        panels.push({ key: entry.label, markup: panelMarkup(entry, chapterBodyMarkup(entry), true) });
        return;
      }
      const resolved = blocks || defaultUserBlocks(entry.label);
      const counts = countBodyCells(resolved);
      info[entry.label] = { ...counts, overview: false, ...sourceExcerpt(sourcePanel, entry.key), path: entry.path };
      total += counts.total;
      pending += counts.pending;
      const coverAttr = resolved.some((block) => block.kind === 'cover-gap') ? ' data-cover="true"' : '';
      panels.push({ key: entry.label, markup: panelMarkup(entry, `<div class="document"${coverAttr}>${docTitleMarkup(entry)}${resolved.map(renderBodyBlock).join('')}</div>`, false) });
    });

    const badge = (entry) => {
      const data = info[entry.label];
      if (!data || data.overview) return '';
      return data.pending
        ? `<span class="count red" data-tip="未填写${data.pending}项">${data.pending}</span>`
        : '<span class="count green">✓</span>';
    };

    const first = panels[0];
    const directoryMarkup = directory.map((entry) => {
      const hasPanel = Boolean(info[entry.label]);
      const label = escapeHtml(entry.label);
      const panelData = hasPanel
        ? ` data-body-view="${label}" data-body-pending="${info[entry.label].pending}" data-body-source-section="${escapeHtml(info[entry.label].section)}" data-body-source-title="${escapeHtml(info[entry.label].title)}" data-body-source-text="${escapeHtml(info[entry.label].text)}" data-body-source-table="${info[entry.label].hasTable ? 1 : 0}"`
        : '';
      const origin = entry.user
        ? '<span class="origin user">用户新增</span>'
        : '<span class="origin original">招标原目录</span>';
      const dots = `<button class="dots" type="button" data-menu-kind="${entry.user ? 'user' : 'original'}" aria-label="${label}更多操作">⋮</button>`;
      const active = first && entry.label === first.key ? ' active' : '';
      return `<div class="node ${directoryLevelClass(entry.depth)}${hasPanel ? ' body-node' : ''}${active}"${entry.children?.length ? ' data-chapter-toggle' : ''} data-body-path="${escapeHtml(entry.path.join(' / '))}"${entry.basis ? ` data-writing-basis="${entry.basis}"` : ''}${panelData}>${directoryToggle(entry)}<span class="label">${label}</span>${badge(entry)}${origin}${dots}</div>`;
    }).join('\n            ');

    const filled = Math.max(0, total - pending);
    const percent = total ? Math.round((filled / total) * 10000) / 100 : 0;
    return {
      directoryMarkup,
      panelsMarkup: panels.map((panel) => panel.markup).join('\n            '),
      firstKey: first?.key || '',
      firstInfo: first ? info[first.key] : null,
      totals: { total, pending, filled, percent },
    };
  };

  const outlineTemplate = (title, mode = 'outline') => {
    const recordTitle = escapeHtml(title || `${OUTLINE_PREFIX}${DEFAULT_FILE}`);
    const bodyRecord = mode === 'body';
    const sourcePanel = buildTenderSourcePanel();
    const directory = flatDirectory(sourcePanel?.resolveAnchor);
    const directoryMarkup = buildOutlineDirectoryMarkup(directory);
    const bodyModel = buildBodyModel(directory, sourcePanel);
    const bodyStartInfo = bodyModel.firstInfo || { pending: 0, section: '招标文件', title: '招标原文', text: '', hasTable: false, path: [] };
    const bodyStartLabel = escapeHtml(bodyModel.firstKey || '');
    const bodyStartPath = escapeHtml(bodyStartInfo.path.join(' / '));
    const bodyStartCrumb = bodyStartPath ? `${bodyStartPath} / ${bodyStartLabel}` : bodyStartLabel;
    const sourceFileLabel = escapeHtml(sourcePanel?.doc?.fileName || '招标文件原文');
    const sourceMarkup = sourcePanel?.html || '<p class="source-paragraph">招标文件数据未加载。</p>';
    const bodyTabs = bodyRecord ? '<div class="body-tabs" role="tablist" aria-label="商务标正文页面切换"><button class="body-tab" type="button" role="tab" aria-selected="false" data-body-tab="outline">目录及设置</button><button class="body-tab active" type="button" role="tab" aria-selected="true" data-body-tab="body">正文编写</button></div>' : '';
    const bodyShared = bodyRecord ? `<div class="body-document-info"><div><label for="body-record-title">标书名称</label><input id="body-record-title" data-body-record-title value="${recordTitle}" aria-label="标书名称"></div><div><span>招标文件</span><strong>${escapeHtml(`${DEFAULT_FILE}.docx`)}</strong></div><button class="enterprise-entry" type="button" data-enterprise-entry title="查看当前投标企业">投标企业：${ENTERPRISE}</button></div>` : '';
    const bodyProgress = bodyRecord ? `<div class="body-progress" aria-label="商务标正文编写进度"><div class="body-progress-head"><strong>编写进度</strong><span>已填写 <b data-body-filled>${bodyModel.totals.filled}</b> 项 / 共 <b data-body-total>${bodyModel.totals.total}</b> 项</span><em>待填写 <b data-body-pending>${bodyModel.totals.pending}</b> 项</em><div class="body-progress-track"><div class="body-progress-bar" data-body-progress style="width: ${bodyModel.totals.percent}%;"></div></div><strong class="body-progress-percent">${bodyModel.totals.percent}%</strong></div></div>` : '';
    return `
    <div class="shell" data-business-outline-modal="true" role="dialog" aria-modal="true" aria-labelledby="business-outline-title">
      <div class="topbar">
        <div class="title" id="business-outline-title" data-outline-title>${bodyRecord ? '生成商务标正文' : recordTitle}</div>
        ${bodyTabs}<div class="actions">
          ${bodyRecord ? '' : '<button class="action regenerate" type="button" data-regenerate>重新生成大纲</button>'}
          <button class="action download" type="button" data-outline-download>下载</button>
          ${bodyRecord ? '' : '<button class="action" type="button" data-source-toggle>收起招标文件</button>'}
          ${bodyRecord ? '' : '<button class="action primary" type="button" data-generate-body>立即生成全文</button>'}
        </div>
        <button class="close" type="button" data-outline-close aria-label="关闭目录生成结果">×</button>
      </div>
      ${bodyShared}
      <section class="business-outline-page" data-page="outline">
        <div class="outline-regenerating" data-outline-regenerating hidden aria-live="polite">
          <span class="outline-regenerating-spinner" aria-hidden="true"></span>
          <div><strong>正在重新生成商务标大纲</strong><small>正在根据新的生成要求调整目录，请稍候…</small></div>
        </div>
        <div class="workspace" data-outline-workspace>
          <aside class="left">
            <div class="directory-head">
              <div class="directory-head-copy">
                <strong>商务标目录</strong>
                <small>目录将依据招标文件的封装要求和原目录顺序整理，覆盖投标文件全部部分（含技术标）；技术标仅保留目录，不编写正文。</small>
              </div>
            </div>
            ${directoryMarkup}
            <div class="node-selection-tools" data-node-selection-tools hidden>
              <button class="node-tool locate" type="button" data-selected-locate>定位招标原文</button>
              <button class="node-tool" type="button" data-writing-idea aria-haspopup="dialog">编写思路</button>
              <button class="node-tool" type="button" data-add-section aria-expanded="false">新增章节 ▾</button>
              <button class="node-tool danger" type="button" data-delete-directory hidden>删除目录</button>
              <div class="node-tool-popover" data-add-section-menu hidden>
                <button type="button" data-insert-position="child">新增子章节</button>
                <button type="button" data-insert-position="before">新增前一章节</button>
                <button type="button" data-insert-position="after">新增后一章节</button>
              </div>
            </div>
          </aside>
          <div class="outline-resizer" data-outline-resizer role="separator" aria-label="调整商务标目录和招标文件宽度" aria-orientation="vertical" tabindex="0" title="拖动调整宽度，双击恢复默认"></div>
          <aside class="source">
            <div class="source-head"><div class="source-heading"><span>招标文件</span><small data-source-location>${sourceFileLabel}</small></div><div class="source-head-actions"><button class="source-close" type="button" data-source-close title="收起" hidden>×</button></div></div>
            <div class="source-body">
              ${sourceMarkup}
            </div>
          </aside>
        </div>
      </section>

      <section class="page" data-page="body" hidden>
        ${bodyProgress}
        <div class="workspace body-workspace source-hidden" data-body-workspace>
          <aside class="left" data-body-directory>
            <div class="body-directory-head"><div class="body-directory-title"><strong>商务标目录</strong></div></div>
            ${bodyModel.directoryMarkup}
          </aside>
          <main class="main">
            <div class="section-head"><div><div class="breadcrumb" data-body-breadcrumb>${bodyStartCrumb}</div><div class="current" data-body-current title="${recordTitle}">${recordTitle}</div></div><div class="chapter-stats">本章待填写 <b data-body-missing>${bodyStartInfo.pending}</b> 项</div><div class="section-actions"><button class="small-action" type="button" data-smart-fill>重新智能填充</button><button class="small-action" type="button" data-body-locate>定位招标原文</button><button class="small-action primary" type="button" data-confirm>确认本章内容</button></div></div>
            ${bodyModel.panelsMarkup}
          </main>
          <aside class="source"><div class="source-head"><span>招标文件</span><button class="source-close" type="button" data-body-source-close title="收起">×</button></div><div class="source-body"><div class="source-ref"><span data-body-source-section>${escapeHtml(bodyStartInfo.section)}</span></div><div class="source-block"><strong data-body-source-title>${escapeHtml(bodyStartInfo.title)}</strong><div class="mini-table" data-body-source-table style="display:${bodyStartInfo.hasTable ? 'block' : 'none'};"></div></div><div class="source-text"><strong>招标原文</strong><br><span data-body-source-text>${escapeHtml(bodyStartInfo.text)}</span></div></div></aside>
        </div>
      </section>

      <div class="menu" data-context-menu role="menu"></div>
      <div class="modal-mask" data-regenerate-modal><div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="regenerate-title"><h3 id="regenerate-title">重新生成目录</h3><label class="modal-label" for="regenerate-prompt">生成要求</label><textarea class="instruction-input regenerate-input" id="regenerate-prompt" data-regenerate-prompt required placeholder="请输入生成要求，如:保持招标原目录不变，重点细化资质材料和同类项目业绩相关子目录。"></textarea><p class="regenerate-error" data-regenerate-error hidden>请输入生成要求</p><div class="modal-actions"><button class="small-action" type="button" data-modal-close>取消</button><button class="small-action primary" type="button" data-run-regenerate>开始重新生成</button></div></div></div>
      <div class="modal-mask" data-add-section-modal><div class="modal-box add-section-modal" role="dialog" aria-modal="true" aria-labelledby="add-section-title"><div class="add-section-head"><h3 id="add-section-title">新增章节</h3><button class="add-section-close" type="button" data-add-section-close aria-label="关闭">×</button></div><div class="add-section-form"><div class="add-section-field"><label for="add-section-name"><span class="required-star">*</span>章节名称</label><div class="add-section-input-wrap"><input class="add-section-name" id="add-section-name" data-add-section-name maxlength="128" placeholder="请输入章节名称"><span class="add-section-count" data-add-section-count>0 / 128</span></div></div><div class="add-section-field"><label for="add-section-idea"><span class="required-star">*</span>章节思路</label><textarea class="add-section-idea" id="add-section-idea" data-add-section-idea placeholder="请输入本章节希望AI重点编写的内容或表达要求"></textarea></div></div><div class="modal-actions add-section-footer"><button class="small-action" type="button" data-add-section-cancel>取消</button><button class="small-action primary" type="button" data-add-section-confirm disabled>确定</button></div></div></div>
      <div class="modal-mask" data-writing-idea-modal><div class="modal-box writing-idea-modal" role="dialog" aria-modal="true" aria-labelledby="writing-idea-title"><div class="add-section-head"><h3 id="writing-idea-title">章节编写思路</h3><button class="add-section-close" type="button" data-writing-idea-close aria-label="关闭">×</button></div><div class="writing-idea-content"><span class="origin writing-idea-tag original" data-writing-idea-tag>招标原目录</span><section class="writing-panel" data-original-writing-panel><span class="writing-section-title">招标文件编写依据</span><div class="writing-basis-card"><span class="writing-basis-kind" data-writing-basis-kind>固定表格或文件</span><p data-writing-basis-text></p></div><label class="writing-section-title" for="original-other-writing">其他编写要求（选填）</label><textarea class="writing-idea-textarea" id="original-other-writing" data-original-other-writing placeholder="可补充本章节的重点内容、表达方式或其他要求"></textarea></section><section class="writing-panel" data-user-writing-panel hidden><label class="writing-section-title" for="user-writing-input"><span class="required-star">*</span>编写要求</label><textarea class="writing-idea-textarea user-required" id="user-writing-input" data-user-writing-input placeholder="请输入本章节希望AI编写的内容、重点和表达要求"></textarea></section></div><div class="modal-actions add-section-footer"><button class="small-action" type="button" data-writing-idea-cancel>取消</button><button class="small-action primary" type="button" data-writing-idea-save>保存</button></div></div></div>
      <div class="modal-mask" data-delete-directory-modal><div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="delete-directory-title"><h3 id="delete-directory-title">删除目录</h3><p>确认删除用户新增目录“<span data-delete-directory-name></span>”吗？删除后无法恢复。</p><div class="modal-actions"><button class="small-action" type="button" data-delete-directory-cancel>取消</button><button class="small-action danger" type="button" data-delete-directory-confirm>确认删除</button></div></div></div>
      <div class="toast" data-failure-toast><span>重新生成失败，当前目录已保留。</span><button type="button" data-retry>重试</button><button type="button" data-toast-close>关闭</button></div>
      <div class="modal-mask" data-smart-fill-modal><div class="modal-box" role="dialog" aria-modal="true"><h3>重新智能填充</h3><p>使用企业资料库中的最新信息和材料重新填充当前章节。</p><label class="radio-label"><input type="radio" name="fill-mode" checked> 仅填充空白内容</label><label class="radio-label"><input type="radio" name="fill-mode"> 重新填充全部内容</label><div class="modal-actions"><button class="small-action" type="button" data-smart-fill-close>取消</button><button class="small-action primary" type="button" data-smart-fill-run>开始填充</button></div></div></div>
      <div class="modal-mask" data-confirm-modal><div class="modal-box" role="dialog" aria-modal="true"><h3>确认本章内容</h3><div class="confirm-note" data-confirm-note>系统检测到本章仍有 <b data-confirm-missing>5</b> 项未填写。</div><p data-confirm-message>请确认这些空白内容是否符合实际情况。系统以你的确认结果为准。</p><div class="modal-actions"><button class="small-action" type="button" data-confirm-close>继续填写</button><button class="small-action primary" type="button" data-confirm-anyway>仍然确认</button></div></div></div>
      <div class="modal-mask" data-download-modal><div class="modal-box" role="dialog" aria-modal="true"><h3>下载商务标正文</h3><div class="confirm-note">全文仍有31项未填写。</div><p>系统仅作提醒，是否继续下载以你的确认结果为准。下载后请完成线下签字、盖章及最终核验。</p><div class="modal-actions"><button class="small-action" type="button" data-download-close>返回检查</button><button class="small-action primary" type="button" data-download-anyway>仍然下载</button></div></div></div>
      <div class="modal-mask reference-mask" data-reference-modal><div class="reference-modal" role="dialog" aria-modal="true" aria-labelledby="reference-title"><div class="reference-head"><div><span class="reference-kicker">REFERENCE</span><h3 id="reference-title">引用企业资料</h3></div><button class="reference-close" type="button" data-reference-close aria-label="关闭引用企业资料">×</button></div><div class="reference-search-wrap"><span aria-hidden="true">⌕</span><input type="search" data-reference-search placeholder="搜索企业名称、证书、合同或人员" aria-label="搜索企业资料"></div><div class="reference-tabs" role="tablist" aria-label="企业资料分类">${REFERENCE_TABS_MARKUP}</div><div class="reference-list" data-reference-list></div><div class="reference-empty" data-reference-empty hidden>没有找到匹配的企业资料</div></div></div>
      <div class="modal-mask" data-enterprise-modal><div class="modal-box" role="dialog" aria-modal="true"><h3>当前投标企业</h3><div class="confirm-note"><b>${ENTERPRISE}</b></div><p>本商务标的大纲与正文均使用该企业信息。正文生成及重新智能填充将读取该企业维护的最新资料。</p><div class="modal-actions"><button class="small-action primary" type="button" data-enterprise-close>知道了</button></div></div></div>
    </div>`;
  };

  const bindModal = (modal, initialPage = 'outline') => {
    const root = modal;
    const query = (selector) => root.querySelector(selector);
    const queryAll = (selector) => Array.from(root.querySelectorAll(selector));
    const outlineWorkspace = query('[data-outline-workspace]');
    const bodyWorkspace = query('[data-body-workspace]');
    const outlineDirectoryPanel = query('[data-page="outline"] .left');
    const sourceToggle = query('[data-source-toggle]');
    const sourceClose = query('[data-source-close]');
    const sourceLocation = query('[data-source-location]');
    const outlineResizer = query('[data-outline-resizer]');
    const selectionTools = query('[data-node-selection-tools]');
    const selectedLocate = query('[data-selected-locate]');
    const writingIdea = query('[data-writing-idea]');
    const writingIdeaModal = query('[data-writing-idea-modal]');
    const addSection = query('[data-add-section]');
    const addSectionMenu = query('[data-add-section-menu]');
    const deleteDirectory = query('[data-delete-directory]');
    const deleteDirectoryModal = query('[data-delete-directory-modal]');
    const addSectionModal = query('[data-add-section-modal]');
    const addSectionName = query('[data-add-section-name]');
    const addSectionIdea = query('[data-add-section-idea]');
    const addSectionCount = query('[data-add-section-count]');
    const addSectionConfirm = query('[data-add-section-confirm]');
    const menu = query('[data-context-menu]');
    const toast = query('[data-failure-toast]');
    let activeOutlineNode = query('[data-directory-view].active');
    let activeOutlineTarget = activeOutlineNode?.dataset.directoryView || '';
    let activeWritingNode = activeOutlineNode;
    let activeWritingTarget = activeOutlineTarget;
    let activeWritingIsUser = false;
    let pendingAddNode = activeOutlineNode;
    let pendingAddScope = 'outline';
    let pendingDeleteNode = null;
    let pendingDeleteScope = 'outline';
    let generatedDirectoryIndex = 0;
    let pendingInsertPosition = 'child';
    let contextMenuNode = null;
    let toastTimer;
    let feedbackTimer;

    const showToast = (message, options = {}) => {
      toast.querySelector('span').textContent = message;
      const retry = query('[data-retry]');
      if (retry) retry.hidden = !options.retry;
      const close = query('[data-toast-close]');
      if (close) close.hidden = Boolean(options.processing);
      toast.classList.toggle('is-processing', Boolean(options.processing));
      toast.classList.toggle('is-hint', !options.retry && !options.processing);
      toast.classList.add('open');
      window.clearTimeout(toastTimer);
      if (options.processing) return;
      toastTimer = window.setTimeout(() => toast.classList.remove('open'), options.retry ? 2200 : 2400);
    };
    // 点击后只给一次「正在处理」反馈，Loading 转一下自动消失
    const flashFeedback = (processing, delay = 560) => {
      showToast(processing, { processing: true });
      window.clearTimeout(feedbackTimer);
      feedbackTimer = window.setTimeout(() => {
        toast.classList.remove('open');
        toast.classList.remove('is-processing');
      }, delay);
    };

    const openDialog = (name) => query(`[data-${name}-modal]`)?.classList.add('open');
    const closeDialog = (name) => query(`[data-${name}-modal]`)?.classList.remove('open');
    const closeSelectionPopovers = () => {
      addSectionMenu.hidden = true;
      addSection.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    };

    const selectPage = (page) => {
      root.classList.toggle('body-active', page === 'body');
      queryAll('[data-page]').forEach((item) => item.hidden = item.dataset.page !== page);
      if (sourceToggle) {
        if (page === 'body') {
          sourceToggle.textContent = bodyWorkspace.classList.contains('source-hidden') ? '查看招标文件' : '收起招标文件';
        } else {
          const userDirectory = outlineWorkspace.classList.contains('user-directory');
          const isOpen = userDirectory
            ? outlineWorkspace.classList.contains('source-open')
            : !outlineWorkspace.classList.contains('source-collapsed');
          sourceToggle.textContent = isOpen ? '收起招标文件' : '查看招标文件';
        }
      }
    };
    const selectBodyTab = (page) => {
      selectPage(page);
      queryAll('[data-body-tab]').forEach((tab) => {
        const selected = tab.dataset.bodyTab === page;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
      });
    };

    const locateSource = (target) => {
      const anchor = query(`[data-source-anchor="${target}"]`);
      const sourcePane = query('[data-outline-workspace] > .source');
      if (!anchor || !sourcePane) return;
      queryAll('[data-source-anchor]').forEach((item) => item.classList.toggle('is-located', item === anchor));
      sourceLocation.textContent = `已定位：${anchor.dataset.sourceSection}`;
      const sourceRect = sourcePane.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const sourceHead = sourcePane.querySelector('.source-head');
      const offset = (sourceHead?.getBoundingClientRect().height || 0) + 16;
      const top = sourcePane.scrollTop + anchorRect.top - sourceRect.top - offset;
      sourcePane.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    const openSourceAndLocate = (target) => {
      outlineWorkspace.classList.remove('user-directory', 'source-collapsed');
      if (sourceToggle) {
        sourceToggle.hidden = false;
        sourceToggle.textContent = '收起招标文件';
      }
      sourceClose.hidden = true;
      locateSource(target);
    };

    const isUserDirectoryNode = (node) => Boolean(
      node?.dataset.directoryView?.startsWith('user') || node?.querySelector('.origin.user'),
    );

    const syncSourceToggle = (open) => {
      if (sourceToggle) sourceToggle.textContent = open ? '收起招标文件' : '查看招标文件';
    };

    // 正文弹窗不再提供「查看招标文件」，大纲弹窗保留该按钮控制右侧招标文件面板
    sourceToggle?.addEventListener('click', () => {
      const userDirectory = outlineWorkspace.classList.contains('user-directory');
      const isOpen = userDirectory
        ? outlineWorkspace.classList.contains('source-open')
        : !outlineWorkspace.classList.contains('source-collapsed');
      const willOpen = !isOpen;
      if (userDirectory) outlineWorkspace.classList.toggle('source-open', willOpen);
      else outlineWorkspace.classList.toggle('source-collapsed', !willOpen);
      syncSourceToggle(willOpen);
      sourceClose.hidden = !userDirectory || !willOpen;
      if (willOpen && !userDirectory) locateSource(activeOutlineTarget);
    });
    sourceClose.addEventListener('click', () => {
      if (outlineWorkspace.classList.contains('user-directory')) outlineWorkspace.classList.remove('source-open');
      else outlineWorkspace.classList.add('source-collapsed');
      syncSourceToggle(false);
      sourceClose.hidden = true;
    });

    const selectDirectoryNode = (node) => {
      const target = node.dataset.directoryView;
      activeOutlineNode = node;
      activeOutlineTarget = target;
      queryAll('[data-directory-view]').forEach((item) => item.classList.toggle('active', item === node));
      const userDirectory = target.startsWith('user');
      closeSelectionPopovers();
      selectionTools.hidden = false;
      selectedLocate.hidden = userDirectory;
      deleteDirectory.hidden = !userDirectory;
      // 操作条跟着选中的目录走，直接挂在当前目录节点里（与参考稿一致）
      node.appendChild(selectionTools);
      if (userDirectory) {
        sourceLocation.textContent = '全文浏览（当前目录无招标原文关联）';
        return;
      }
      openSourceAndLocate(target);
    };

    const bindDirectoryNode = (node) => node.addEventListener('click', (event) => {
      if (event.target.closest('.dots') || event.target.closest('.chapter-toggle') || event.target.closest('[data-node-selection-tools]')) return;
      selectDirectoryNode(node);
    });
    queryAll('[data-directory-view]').forEach(bindDirectoryNode);
    if (activeOutlineNode) {
      selectionTools.hidden = false;
      activeOutlineNode.appendChild(selectionTools);
    }
    selectionTools.addEventListener('click', (event) => event.stopPropagation());
    selectedLocate.addEventListener('click', () => openSourceAndLocate(activeOutlineTarget));

    queryAll('[data-chapter-toggle]').forEach((chapter) => chapter.addEventListener('click', (event) => {
      if (!event.target.closest('.chapter-toggle')) return;
      const collapsed = chapter.classList.toggle('collapsed');
      let sibling = chapter.nextElementSibling;
      while (sibling && !sibling.classList.contains('chapter')) {
        sibling.style.display = collapsed ? 'none' : '';
        sibling = sibling.nextElementSibling;
      }
    }));

    const menuItems = { original: [], ai: [['编辑名称', ''], ['删除目录', 'danger']], user: [['编辑名称', ''], ['删除目录', 'danger']] };
    const bodyMenuItems = {
      original: [['编写思路', 'writing'], ['新增子章节', 'child'], ['新增前一章节', 'before'], ['新增后一章节', 'after']],
      user: [['编写思路', 'writing'], ['新增子章节', 'child'], ['新增前一章节', 'before'], ['新增后一章节', 'after'], ['删除目录', 'delete']],
    };
    const placeContextMenu = (button) => {
      const rect = button.getBoundingClientRect();
      menu.style.left = `${Math.min(rect.left, window.innerWidth - 155)}px`;
      menu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - 225)}px`;
      menu.classList.add('open');
    };
    root.addEventListener('click', (event) => {
      const button = event.target.closest('[data-menu-kind]');
      if (!button || !root.contains(button)) return;
      event.stopPropagation();
      const isBodyMenu = Boolean(button.closest('[data-body-directory]'));
      if (isBodyMenu && !query('[data-body-directory]').classList.contains('body-editing')) return;
      contextMenuNode = button.closest('.node');
      const items = isBodyMenu ? bodyMenuItems[button.dataset.menuKind] : menuItems[button.dataset.menuKind];
      if (!items?.length) return;
      menu.dataset.scope = isBodyMenu ? 'body' : 'outline';
      menu.innerHTML = items.map((item) => `<button class="${item[1] === 'danger' ? 'danger' : ''}" type="button" data-menu-action="${item[1]}">${item[0]}</button>`).join('');
      placeContextMenu(button);
    });
    menu.addEventListener('click', (event) => {
      const action = event.target.closest('[data-menu-action]');
      if (!action || !contextMenuNode) return;
      event.stopPropagation();
      menu.classList.remove('open');
      if (action.dataset.menuAction === 'delete') {
        pendingDeleteNode = contextMenuNode;
        pendingDeleteScope = menu.dataset.scope;
        query('[data-delete-directory-name]').textContent = contextMenuNode.querySelector('.label')?.textContent || '当前目录';
        openDialog('delete-directory');
      } else if (action.dataset.menuAction === 'writing') {
        openWritingIdeaFor(contextMenuNode, menu.dataset.scope === 'body' && contextMenuNode.querySelector('[data-menu-kind]')?.dataset.menuKind === 'user', contextMenuNode.dataset.writingBasis);
      } else if (['child', 'before', 'after'].includes(action.dataset.menuAction)) {
        openAddSectionModal(contextMenuNode, 'body', action.dataset.menuAction);
      } else {
        showToast(`${action.textContent}操作已记录，可在目录中继续调整。`);
      }
    });

    const openDeleteDirectory = (node, scope) => {
      if (!isUserDirectoryNode(node)) return;
      pendingDeleteNode = node;
      pendingDeleteScope = scope;
      query('[data-delete-directory-name]').textContent = node.querySelector('.label')?.textContent || '当前目录';
      openDialog('delete-directory');
    };
    deleteDirectory.addEventListener('click', () => {
      if (!activeOutlineTarget.startsWith('user')) return;
      closeSelectionPopovers();
      openDeleteDirectory(activeOutlineNode, 'outline');
    });
    query('[data-delete-directory-cancel]').addEventListener('click', () => closeDialog('delete-directory'));
    query('[data-delete-directory-confirm]').addEventListener('click', () => {
      const nodeToDelete = pendingDeleteNode;
      if (!isUserDirectoryNode(nodeToDelete)) return;
      const selector = pendingDeleteScope === 'outline' ? '[data-directory-view]' : '.node';
      let fallback = nodeToDelete.previousElementSibling;
      while (fallback && !fallback.matches(selector)) fallback = fallback.previousElementSibling;
      if (!fallback) {
        fallback = nodeToDelete.nextElementSibling;
        while (fallback && !fallback.matches(selector)) fallback = fallback.nextElementSibling;
      }
      nodeToDelete.remove();
      closeDialog('delete-directory');
      if (pendingDeleteScope === 'outline' && fallback) selectDirectoryNode(fallback);
      pendingDeleteNode = null;
    });

    const openWritingIdeaFor = (node, userDirectory, basisKey) => {
      activeWritingNode = node;
      activeWritingTarget = basisKey || 'original-chapter-1';
      activeWritingIsUser = userDirectory;
      closeSelectionPopovers();
      const originalPanel = query('[data-original-writing-panel]');
      const userPanel = query('[data-user-writing-panel]');
      const originalInput = query('[data-original-other-writing]');
      const userInput = query('[data-user-writing-input]');
      originalPanel.hidden = userDirectory;
      userPanel.hidden = !userDirectory;
      const tag = query('[data-writing-idea-tag]');
      tag.textContent = userDirectory ? '用户新增' : '招标原目录';
      tag.className = `origin writing-idea-tag ${userDirectory ? 'user' : 'original'}`;
      if (userDirectory) {
        userInput.value = node?.dataset.writingIdea || '';
      } else {
        const basis = originalWritingBasis[activeWritingTarget] || originalWritingBasis['original-chapter-1'];
        query('[data-writing-basis-kind]').textContent = basis[0];
        query('[data-writing-basis-text]').textContent = basis[1];
        originalInput.value = node?.dataset.writingIdea || '';
      }
      query('[data-writing-idea-save]').disabled = userDirectory && !userInput.value.trim();
      openDialog('writing-idea');
      (userDirectory ? userInput : originalInput).focus();
    };
    writingIdea.addEventListener('click', () => openWritingIdeaFor(activeOutlineNode, activeOutlineTarget.startsWith('user'), activeOutlineNode?.dataset.writingBasis || activeOutlineTarget));
    query('[data-user-writing-input]').addEventListener('input', (event) => {
      query('[data-writing-idea-save]').disabled = !event.currentTarget.value.trim();
    });
    query('[data-writing-idea-close]').addEventListener('click', () => closeDialog('writing-idea'));
    query('[data-writing-idea-cancel]').addEventListener('click', () => closeDialog('writing-idea'));
    query('[data-writing-idea-save]').addEventListener('click', () => {
      if (!activeWritingNode) return;
      const input = activeWritingIsUser ? query('[data-user-writing-input]') : query('[data-original-other-writing]');
      if (activeWritingIsUser && !input.value.trim()) return;
      activeWritingNode.dataset.writingIdea = input.value.trim();
      closeDialog('writing-idea');
      showToast('章节编写思路已保存。');
    });

    const validateAddSection = () => {
      addSectionCount.textContent = `${addSectionName.value.length} / 128`;
      addSectionConfirm.disabled = !addSectionName.value.trim() || !addSectionIdea.value.trim();
    };
    const openAddSectionModal = (node, scope, position) => {
      pendingAddNode = node;
      pendingAddScope = scope;
      pendingInsertPosition = position;
      closeSelectionPopovers();
      addSectionName.value = '';
      addSectionIdea.value = '';
      validateAddSection();
      openDialog('add-section');
      addSectionName.focus();
    };
    addSection.addEventListener('click', () => {
      const opening = addSectionMenu.hidden;
      closeSelectionPopovers();
      addSectionMenu.hidden = !opening;
      addSection.setAttribute('aria-expanded', String(opening));
    });
    addSectionMenu.querySelectorAll('[data-insert-position]').forEach((button) => button.addEventListener('click', () => openAddSectionModal(activeOutlineNode, 'outline', button.dataset.insertPosition)));
    addSectionName.addEventListener('input', validateAddSection);
    addSectionIdea.addEventListener('input', validateAddSection);
    query('[data-add-section-close]').addEventListener('click', () => closeDialog('add-section'));
    query('[data-add-section-cancel]').addEventListener('click', () => closeDialog('add-section'));
    addSectionConfirm.addEventListener('click', () => {
      if (!pendingAddNode || addSectionConfirm.disabled) return;
      const newNode = document.createElement('div');
      const currentLevel = pendingAddNode.classList.contains('sub2') ? 'sub2' : pendingAddNode.classList.contains('sub1') ? 'sub1' : 'chapter';
      const childLevel = currentLevel === 'chapter' ? 'sub1' : 'sub2';
      newNode.className = `node ${pendingInsertPosition === 'child' ? childLevel : currentLevel}`;
      newNode.dataset.writingIdea = addSectionIdea.value.trim();
      if (pendingAddScope === 'outline') {
        newNode.dataset.directoryView = `user-generated-${++generatedDirectoryIndex}`;
        newNode.innerHTML = '<span class="label"></span><span class="origin user">用户新增</span>';
      } else {
        newNode.innerHTML = '<span class="label"></span><span class="count red" data-tip="未填写1项">1</span><span class="origin user">用户新增</span><button class="dots" type="button" data-menu-kind="user" aria-label="用户新增目录更多操作">⋮</button>';
      }
      newNode.querySelector('.label').textContent = addSectionName.value.trim();
      if (pendingInsertPosition === 'before') pendingAddNode.insertAdjacentElement('beforebegin', newNode);
      else pendingAddNode.insertAdjacentElement('afterend', newNode);
      closeDialog('add-section');
      if (pendingAddScope === 'outline') {
        bindDirectoryNode(newNode);
        selectDirectoryNode(newNode);
      }
    });

    let resizeMode = null;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const resizeAt = (clientX) => {
      const rect = outlineWorkspace.getBoundingClientRect();
      const nextLeft = clamp(clientX - rect.left, 520, Math.max(520, rect.width - 328));
      outlineWorkspace.style.setProperty('--outline-left-width', `${nextLeft}px`);
      outlineResizer.setAttribute('aria-valuenow', String(Math.round(nextLeft)));
    };
    outlineResizer.addEventListener('pointerdown', (event) => {
      resizeMode = 'directory';
      outlineResizer.classList.add('dragging');
      document.body.classList.add('outline-resizing');
      outlineResizer.setPointerCapture(event.pointerId);
      resizeAt(event.clientX);
    });
    outlineResizer.addEventListener('pointermove', (event) => { if (resizeMode) resizeAt(event.clientX); });
    const finishResize = (event) => {
      if (!resizeMode) return;
      resizeMode = null;
      outlineResizer.classList.remove('dragging');
      document.body.classList.remove('outline-resizing');
      if (outlineResizer.hasPointerCapture(event.pointerId)) outlineResizer.releasePointerCapture(event.pointerId);
    };
    outlineResizer.addEventListener('pointerup', finishResize);
    outlineResizer.addEventListener('pointercancel', finishResize);
    outlineResizer.addEventListener('dblclick', () => {
      outlineWorkspace.style.removeProperty('--outline-left-width');
      outlineResizer.removeAttribute('aria-valuenow');
    });
    outlineResizer.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const rect = outlineResizer.getBoundingClientRect();
      resizeAt(rect.left + (event.key === 'ArrowLeft' ? -16 : 16));
    });

    const downloadOutline = () => {
      const downloadTitle = normalizeTitle(modal.dataset.outlineTitle || `${OUTLINE_PREFIX}${DEFAULT_FILE}`);
      const directoryText = queryAll('[data-directory-view] .label').map((node) => node.textContent.trim()).filter(Boolean).join('\n');
      const blob = new Blob([`${downloadTitle}\n\n${directoryText}`], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${downloadTitle.replace(/[\\/:*?\"<>|]/g, '_')}.docx`;
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      showToast('商务标大纲已开始下载。');
    };
    query('[data-outline-download]').addEventListener('click', () => {
      if (initialPage === 'body') openDialog('download');
      else downloadOutline();
    });
    query('[data-generate-body]')?.addEventListener('click', () => {
      const outlineTitle = modal.dataset.outlineTitle || '';
      closeModal();
      window.dispatchEvent(new CustomEvent('business:generate-full-from-outline', { detail: { outlineTitle } }));
    });
    queryAll('[data-body-tab]').forEach((tab) => tab.addEventListener('click', () => selectBodyTab(tab.dataset.bodyTab)));
    // 顶部标题跟随「标书名称」输入框，切换目录时保持不变
    query('[data-body-record-title]')?.addEventListener('input', (event) => {
      const current = query('[data-body-current]');
      if (!current) return;
      const value = event.currentTarget.value.trim() || '未命名标书';
      current.textContent = value;
      current.title = value;
    });
    queryAll('[data-outline-close]').forEach((button) => button.addEventListener('click', closeModal));
    queryAll('[data-enterprise-entry]').forEach((button) => button.addEventListener('click', () => openDialog('enterprise')));
    query('[data-enterprise-close]').addEventListener('click', () => closeDialog('enterprise'));
    queryAll('.modal-mask').forEach((mask) => mask.addEventListener('click', (event) => { if (event.target === mask) mask.classList.remove('open'); }));

    const regenerateModal = query('[data-regenerate-modal]');
    const regeneratePrompt = query('[data-regenerate-prompt]');
    const regenerateError = query('[data-regenerate-error]');
    query('[data-regenerate]')?.addEventListener('click', () => {
      regenerateError.hidden = true;
      regeneratePrompt.removeAttribute('aria-invalid');
      regenerateModal.classList.add('open');
      regeneratePrompt.focus({ preventScroll: true });
    });
    query('[data-modal-close]').addEventListener('click', () => regenerateModal.classList.remove('open'));
    regeneratePrompt.addEventListener('input', () => {
      if (!regeneratePrompt.value.trim()) return;
      regenerateError.hidden = true;
      regeneratePrompt.removeAttribute('aria-invalid');
    });
    query('[data-run-regenerate]').addEventListener('click', () => {
      const prompt = regeneratePrompt.value.trim();
      if (!prompt) {
        regenerateError.hidden = false;
        regeneratePrompt.setAttribute('aria-invalid', 'true');
        regeneratePrompt.focus({ preventScroll: true });
        return;
      }
      regenerateModal.classList.remove('open');
      const page = query('[data-page="outline"]');
      const loading = query('[data-outline-regenerating]');
      page.classList.add('is-regenerating');
      loading.hidden = false;
      page.setAttribute('aria-busy', 'true');
      queryAll('.topbar .action').forEach((button) => { button.disabled = true; });
      modal.__regenerateTimer = window.setTimeout(() => {
        page.classList.remove('is-regenerating');
        loading.hidden = true;
        page.removeAttribute('aria-busy');
        queryAll('.topbar .action').forEach((button) => { button.disabled = false; });
        showToast('商务标大纲已根据新的生成要求完成更新。');
      }, 2600);
    });
    query('[data-retry]').addEventListener('click', () => showToast('正在重试，当前目录仍可继续使用…'));
    query('[data-toast-close]').addEventListener('click', () => toast.classList.remove('open'));

    const bodySourceToggle = query('[data-body-source-toggle]');
    const bodySourceClose = query('[data-body-source-close]');
    const setBodySource = (open) => {
      bodyWorkspace.classList.toggle('source-hidden', !open);
      if (bodySourceToggle) bodySourceToggle.textContent = open ? '收起招标文件' : '查看招标文件';
    };
    bodySourceToggle?.addEventListener('click', () => setBodySource(bodyWorkspace.classList.contains('source-hidden')));
    bodySourceClose.addEventListener('click', () => {
      setBodySource(false);
      if (sourceToggle) sourceToggle.textContent = '查看招标文件';
    });
    // 招标原文摘录只在点「定位招标原文」时按当前目录刷新，切换目录本身不改动它
    const syncBodySource = () => {
      const activeNode = query('[data-body-directory] .node.active');
      if (!activeNode) return;
      const section = query('[data-body-source-section]');
      const title = query('[data-body-source-title]');
      const text = query('[data-body-source-text]');
      const table = query('[data-body-source-table]');
      if (section) section.textContent = activeNode.dataset.bodySourceSection || '';
      if (title) title.textContent = activeNode.dataset.bodySourceTitle || '';
      if (text) text.textContent = activeNode.dataset.bodySourceText || '';
      if (table) table.style.display = activeNode.dataset.bodySourceTable === '1' ? 'block' : 'none';
    };
    query('[data-body-locate]').addEventListener('click', () => {
      syncBodySource();
      setBodySource(true);
    });
    queryAll('[data-body-directory] .node').forEach((node) => node.addEventListener('click', (event) => {
      if (event.target.closest('.dots')) return;
      queryAll('[data-body-directory] .node').forEach((item) => item.classList.toggle('active', item === node));
      const target = node.dataset.bodyView;
      if (!target) return;
      queryAll('[data-body-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.bodyPanel === target));
      const bodyMain = query('[data-body-workspace] > .main');
      if (bodyMain) bodyMain.scrollTop = 0;
      const breadcrumb = query('[data-body-breadcrumb]');
      // 顶部标题固定显示标书名称，当前所在目录放在面包屑行里
      if (breadcrumb) {
        const label = node.querySelector('.label').textContent;
        breadcrumb.textContent = node.dataset.bodyPath ? `${node.dataset.bodyPath} / ${label}` : label;
      }
      const pending = node.dataset.bodyPending || '0';
      query('[data-body-missing]').textContent = pending;
      query('[data-confirm-missing]').textContent = pending;
    }));
    const isBlankBodyField = (field) => !field.textContent.trim() || field.textContent.trim() === '请输入';
    const syncBodyFieldStatus = (field) => {
      if (!field.matches('.document [contenteditable="true"]')) return;
      const blank = isBlankBodyField(field);
      field.classList.toggle('missing', blank);
      field.classList.toggle('filled', !blank);
      const activePanel = field.closest('[data-body-panel]');
      const missing = activePanel?.querySelectorAll('.document [contenteditable="true"].missing').length || 0;
      query('[data-body-missing]').textContent = String(missing);
      query('[data-confirm-missing]').textContent = String(missing);
    };

    // 正文编辑工具：加粗/斜体/下划线/对齐作用于当前选区；撤销恢复用面板级历史记录，避免 execCommand 在单元格上失效
    const activeBodyPanel = () => queryAll('[data-body-panel]').find((panel) => panel.classList.contains('active'));
    const selectionInPanel = (panel) => {
      const selection = window.getSelection();
      if (!panel || !selection || !selection.rangeCount) return null;
      const anchor = selection.anchorNode;
      if (!anchor || !panel.contains(anchor)) return null;
      const element = anchor.nodeType === 1 ? anchor : anchor.parentElement;
      const editable = element?.closest?.('[contenteditable="true"]');
      return editable && panel.contains(editable) ? editable : null;
    };
    const bodyHistories = new WeakMap();
    const historyFor = (panel) => {
      let record = bodyHistories.get(panel);
      if (!record) {
        const documentNode = panel?.querySelector('.document');
        record = { stack: [documentNode ? documentNode.innerHTML : ''], index: 0, timer: 0 };
        bodyHistories.set(panel, record);
      }
      return record;
    };
    const pushHistory = (panel) => {
      const documentNode = panel?.querySelector('.document');
      if (!documentNode) return;
      const record = historyFor(panel);
      const html = documentNode.innerHTML;
      if (record.stack[record.index] === html) return;
      record.stack = record.stack.slice(0, record.index + 1);
      record.stack.push(html);
      if (record.stack.length > 40) record.stack.shift();
      record.index = record.stack.length - 1;
    };
    const scheduleHistory = (panel) => {
      if (!panel) return;
      const record = historyFor(panel);
      window.clearTimeout(record.timer);
      record.timer = window.setTimeout(() => pushHistory(panel), 400);
    };
    const syncToolbarState = () => {
      const panel = activeBodyPanel();
      const editable = panel ? selectionInPanel(panel) : null;
      queryAll('[data-editor-toolbar] button[data-command]').forEach((button) => {
        const command = button.dataset.command;
        const stateful = editable && ['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter'].includes(command);
        let active = false;
        if (stateful) {
          try {
            active = document.queryCommandState(command);
          } catch {
            active = false;
          }
        }
        button.classList.toggle('is-active', active);
      });
    };
    const bindBodyEditors = (scope) => {
      scope.querySelectorAll('[contenteditable="true"]').forEach((editor) => {
        if (editor.dataset.editorBound === '1') return;
        editor.dataset.editorBound = '1';
        editor.addEventListener('focus', () => {
          if (editor.textContent.trim() !== '请输入') return;
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(editor);
          selection.removeAllRanges();
          selection.addRange(range);
        });
        editor.addEventListener('input', () => {
          syncBodyFieldStatus(editor);
          scheduleHistory(editor.closest('[data-body-panel]'));
        });
        editor.addEventListener('keyup', syncToolbarState);
        editor.addEventListener('mouseup', syncToolbarState);
        editor.addEventListener('keydown', (event) => {
          if (event.key !== '/') return;
          event.preventDefault();
          openReference(editor);
        });
      });
    };
    const applyHistory = (panel, step) => {
      const documentNode = panel?.querySelector('.document');
      if (!documentNode) return 'none';
      const record = historyFor(panel);
      window.clearTimeout(record.timer);
      pushHistory(panel);
      const next = record.index + step;
      if (next < 0) return 'start';
      if (next >= record.stack.length) return 'end';
      record.index = next;
      documentNode.innerHTML = record.stack[next];
      bindBodyEditors(documentNode);
      documentNode.querySelectorAll('[contenteditable="true"]').forEach((field) => syncBodyFieldStatus(field));
      return 'done';
    };

    queryAll('[data-body-panel]').forEach((panel) => {
      historyFor(panel);
      bindBodyEditors(panel);
    });
    root.addEventListener('mouseup', syncToolbarState);
    root.addEventListener('keyup', syncToolbarState);

    queryAll('[data-editor-toolbar] button[data-command]').forEach((button) => {
      button.addEventListener('mousedown', (event) => event.preventDefault());
      button.addEventListener('click', () => {
        const panel = button.closest('[data-body-panel]') || activeBodyPanel();
        if (!panel) return;
        const command = button.dataset.command;
        if (command === 'undo' || command === 'redo') {
          const undoing = command === 'undo';
          applyHistory(panel, undoing ? -1 : 1);
          flashFeedback(undoing ? '正在撤销…' : '正在恢复…');
          return;
        }
        const editable = selectionInPanel(panel);
        if (!editable) {
          flashFeedback('正在处理…');
          return;
        }
        const applied = document.execCommand(command, false, null);
        if (!applied) {
          flashFeedback('正在处理…');
          return;
        }
        syncBodyFieldStatus(editable);
        scheduleHistory(panel);
        syncToolbarState();
        flashFeedback('正在处理…');
      });
    });
    query('[data-smart-fill]').addEventListener('click', () => openDialog('smart-fill'));
    query('[data-smart-fill-close]').addEventListener('click', () => closeDialog('smart-fill'));
    query('[data-smart-fill-run]').addEventListener('click', () => { closeDialog('smart-fill'); showToast('已使用最新企业信息智能填充当前章节。'); });
    query('[data-confirm]').addEventListener('click', () => {
      const missing = Number(query('[data-confirm-missing]').textContent);
      query('[data-confirm-note]').style.display = missing ? 'block' : 'none';
      query('[data-confirm-message]').textContent = missing ? '请确认这些空白内容是否符合实际情况。系统以你的确认结果为准。' : '本章内容已填写完成，请确认内容无误。';
      openDialog('confirm');
    });
    query('[data-confirm-close]').addEventListener('click', () => closeDialog('confirm'));
    query('[data-confirm-anyway]').addEventListener('click', () => { closeDialog('confirm'); query('[data-confirm]').textContent = '本章已确认'; });
    query('[data-body-download]')?.addEventListener('click', () => openDialog('download'));
    query('[data-download-close]')?.addEventListener('click', () => closeDialog('download'));
    query('[data-download-anyway]')?.addEventListener('click', () => { closeDialog('download'); showToast('商务标正文已开始下载。'); });

    const referenceData = {
      企业信息: [
        ['企业名称', ENTERPRISE, '企业基本信息'],
        ['统一社会信用代码', '91510100MA67G71FX6', '企业基本信息'],
        ['法定代表人', '魏靖', '企业基本信息'],
        ['注册地址', '中国（四川）自由贸易试验区成都高新区新程南一路19号', '企业基本信息'],
      ],
      企业资质: [
        ['建筑业企业资质证书', 'H.J112121 · 有效', '资质证书'],
        ['营业执照', '统一社会信用代码：91510100MA67G71FX6 · 有效', '资质材料'],
        ['安全生产许可证', '（鄂）JZ安许证字[2024]012345 · 有效', '资质证书'],
      ],
      企业业绩: [
        ['中国联通某分公司服务器采购合同', '中国联通某分公司 · 190万元', '同类项目业绩'],
        ['武汉某科技园平台建设项目', '武汉某科技园 · 328万元', '同类项目业绩'],
        ['供应链金融服务平台项目', '某大型国企 · 520万元', '同类项目业绩'],
      ],
      人员管理: [
        ['项目经理', '张明 · 项目交付部', '项目人员'],
        ['技术负责人', '李娜 · 技术部', '项目人员'],
        ['售后服务负责人', '王强 · 服务部', '售后服务人员'],
        ['信息系统项目管理师', '张明 · 职业资格', '人员证书'],
        ['系统架构设计师', '李娜 · 职业资格', '人员证书'],
        ['高级工程师', '李娜 · 职称', '人员证书'],
      ],
      财务信息: [
        ['2024年度财务报告', '资产总额 3,280万元 · 净利润 286万元', '财务报告'],
        ['2023年度财务报告', '资产总额 2,940万元 · 净利润 251万元', '财务报告'],
        ['开户银行及账号', '中国建设银行武汉分行 · 4205 **** **** 8890', '财务信息'],
      ],
      其他企业资料: [
        ['原厂授权说明', '原厂授权 · 2026-08-30 上传 · 待核验', '原厂授权'],
        ['信用证明', '3A信用等级证书 · 有效', '信用证明'],
        ['非联合投标声明', '已盖章 · 2026-07-30', '投标声明'],
      ],
    };
    const referenceModal = query('[data-reference-modal]');
    const referenceList = query('[data-reference-list]');
    const referenceEmpty = query('[data-reference-empty]');
    const referenceSearch = query('[data-reference-search]');
    let referenceCategory = '企业信息';
    let referenceTarget = null;
    const renderReferenceList = () => {
      const keyword = referenceSearch.value.trim().toLowerCase();
      const items = (referenceData[referenceCategory] || []).filter(([name, value, type]) => `${name} ${value} ${type}`.toLowerCase().includes(keyword));
      const icon = REFERENCE_ICONS[referenceCategory] || '企';
      referenceList.innerHTML = items.map(([name, value, type]) => `<button class="reference-item" type="button" data-reference-value="${escapeHtml(value)}"><span class="reference-icon">${icon}</span><span class="reference-item-copy"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(value)}</small></span><span class="reference-item-type">${escapeHtml(type)}</span></button>`).join('');
      referenceEmpty.hidden = items.length > 0;
    };
    let referenceTimer;
    const openReference = (target) => {
      referenceTarget = target;
      referenceModal.classList.add('open');
      referenceList.innerHTML = '<div class="reference-loading" data-reference-loading><i></i>正在加载企业资料…</div>';
      referenceEmpty.hidden = true;
      referenceSearch.focus();
      window.clearTimeout(referenceTimer);
      referenceTimer = window.setTimeout(() => {
        renderReferenceList();
        referenceSearch.focus();
      }, 420);
    };
    const closeReference = () => {
      window.clearTimeout(referenceTimer);
      referenceModal.classList.remove('open');
      referenceTarget = null;
    };
    query('[data-reference-close]').addEventListener('click', closeReference);
    referenceModal.addEventListener('click', (event) => {
      if (event.target === referenceModal) closeReference();
    });
    queryAll('[data-reference-tab]').forEach((tab) => tab.addEventListener('click', () => {
      referenceCategory = tab.dataset.referenceTab;
      queryAll('[data-reference-tab]').forEach((item) => {
        const selected = item === tab;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      renderReferenceList();
    }));
    referenceSearch.addEventListener('input', renderReferenceList);
    referenceList.addEventListener('click', (event) => {
      const item = event.target.closest('[data-reference-value]');
      if (!item || !referenceTarget) return;
      referenceTarget.focus();
      document.execCommand('insertText', false, item.dataset.referenceValue);
      syncBodyFieldStatus(referenceTarget);
      closeReference();
    });
    selectBodyTab(initialPage);
  };

  const closeModal = () => {
    if (!activeModal) return;
    if (activeModal.__regenerateTimer) window.clearTimeout(activeModal.__regenerateTimer);
    activeModal.remove();
    activeModal = null;
    document.documentElement.classList.remove('business-outline-modal-open');
    document.body.classList.remove('business-outline-modal-open');
    lastFocused?.focus?.({ preventScroll: true });
  };

  const openModal = (title, trigger, mode = getRecordMode(title)) => {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'business-outline-modal';
    modal.dataset.outlineTitle = normalizeTitle(title);
    modal.innerHTML = outlineTemplate(modal.dataset.outlineTitle, mode);
    document.body.append(modal);
    activeModal = modal;
    lastFocused = trigger || document.activeElement;
    bindModal(modal, getInitialPage(mode));
    document.documentElement.classList.add('business-outline-modal-open');
    document.body.classList.add('business-outline-modal-open');
    const initialClose = mode === 'body'
      ? modal.querySelector('[data-page="body"] [data-outline-close]')
      : modal.querySelector('[data-page="outline"] [data-outline-close], .shell > .topbar [data-outline-close]');
    initialClose?.focus({ preventScroll: true });
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('click', (event) => {
      const recordButton = event.target?.closest?.('#result-panel .record-row .record-main');
      if (!recordButton) return;
      const title = recordButton.querySelector('strong')?.textContent?.trim() || '';
      const mode = getRecordMode(title);
      if (!mode) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openModal(title, recordButton, mode);
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !activeModal) return;
      const openDialogNode = activeModal.querySelector('.modal-mask.open');
      if (openDialogNode) {
        openDialogNode.classList.remove('open');
        return;
      }
      closeModal();
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BODY_PREFIX, OUTLINE_PREFIX, PROJECT_NAME, getInitialPage, getRecordMode, normalizeTitle };
  }
})();
