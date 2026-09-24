(() => {
  const filterTenderCompanies = (companies, keyword) => {
    const query = String(keyword || '').trim().toLowerCase();
    if (!query) return companies.slice();
    return companies.filter((company) => `${company.name} ${company.code}`.toLowerCase().includes(query));
  };

  const resolveTenderCompany = (companies, id) => companies.find((company) => company.id === id) || null;

  const formatGenerationMinute = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(value);
    const pad = (part) => String(part).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  };

  const createTaskTitle = (prefix, fileName, generatedAt) => {
    const sourceName = String(fileName || '').trim() || '当前招标文件';
    return `${prefix}_${sourceName.replace(/\.[^.]+$/, '')}_${formatGenerationMinute(generatedAt)}`;
  };

  const normalizeRecordText = (value, generatedAt = new Date()) => {
    const text = String(value);
    const legacyPrefixes = [
      ['技术标投标大纲_', '商务大纲'],
      ['商务标投标大纲_', '商务大纲'],
      ['技术标投标正文_', '商务正文'],
      ['商务标投标正文_', '商务正文'],
    ];
    const legacy = legacyPrefixes.find(([prefix]) => text.startsWith(prefix));
    if (legacy) return createTaskTitle(legacy[1], text.slice(legacy[0].length), generatedAt);
    return text.replaceAll('技术标', '商务标');
  };

  const config = Object.freeze({
    preciseModes: Object.freeze([
      Object.freeze({ number: '01', name: '生成大纲' }),
      Object.freeze({ number: '02', name: '撰写全文' }),
      ]),
      projectName: '某高校高性能计算GPU集群建设项目',
      quickModeName: '一键生成商务标',
      outlineTaskStatus: '正在生成中',
      bodyTaskStatus: '正在处理',
      formatGenerationMinute,
      createOutlineTaskTitle: (fileName, generatedAt = new Date()) => createTaskTitle('商务大纲', fileName, generatedAt),
      createBodyTaskTitle: (fileName, generatedAt = new Date()) => createTaskTitle('商务正文', fileName, generatedAt),
      isUnsupportedCompletedRecord: (value) => String(value).startsWith('招标文件解读_'),
      normalizeProcessingRecordText: (value, generatedAt = new Date()) => {
        const text = String(value);
        return text.startsWith('招标文件解读_')
          ? createTaskTitle('商务大纲', text.replace(/^招标文件解读_/, ''), generatedAt)
          : normalizeRecordText(text, generatedAt);
      },
      isTechnicalOnlyRecord: (value) => String(value).includes('标前解读') || String(value).includes('标书要点解读'),
      normalizeRecordText,
    filterTenderCompanies,
    resolveTenderCompany,
    normalizeIconPath: (value) => String(value).startsWith('./figma/')
      ? `./assets/${String(value).slice(2)}`
      : String(value),
  });

  if (typeof window !== 'undefined') {
    window.__TENDER_BUSINESS_MODE_CONFIG__ = config;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
  }
})();
