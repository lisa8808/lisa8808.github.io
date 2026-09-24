(() => {
  const rules = [
    ['招标文件解读_', '技术要求解读_'],
    ['技术标投标大纲_', '技术大纲_'],
    ['技术标投标正文_', '技术正文_'],
  ];

  const pad = (value) => String(value).padStart(2, '0');
  const formatMinute = (date = new Date()) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;

  function minuteFromRow(row) {
    const value = row?.querySelector('.record-copy small')?.textContent?.trim() || '';
    const match = value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})/);
    if (!match) return formatMinute();
    return `${match[1]}${pad(match[2])}${pad(match[3])}${pad(match[4])}${match[5]}`;
  }

  function normalizeTitle(value, row) {
    let title = String(value || '').trim();
    const rule = rules.find(([oldPrefix, newPrefix]) => title.startsWith(oldPrefix) || title.startsWith(newPrefix));
    if (!rule) return title;
    const [oldPrefix, newPrefix] = rule;
    if (title.startsWith(oldPrefix)) title = `${newPrefix}${title.slice(oldPrefix.length)}`;
    if (!/_\d{12}$/.test(title)) title = `${title}_${minuteFromRow(row)}`;
    return title;
  }

  function syncToolNames(panel) {
    panel.querySelectorAll('.tool-grid button').forEach((button) => {
      const compact = button.textContent.replace(/\s+/g, '');
      if (compact.includes('01') && compact.includes('文件解读')) {
        const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          if (node.nodeValue.includes('文件解读')) node.nodeValue = node.nodeValue.replace('文件解读', '技术要求解读');
          node = walker.nextNode();
        }
      }
      syncToolLayout(button);
    });
  }

  function syncToolLayout(button) {
    if (button.classList.contains('technical-tool-card')) return;
    const compact = button.textContent.replace(/\s+/g, '');
    const match = compact.match(/^(0[123])(.+)$/);
    const image = button.querySelector('.tool-image');
    if (!match || !image) return;

    const top = document.createElement('span');
    top.className = 'technical-tool-card-top';
    const number = document.createElement('b');
    number.textContent = match[1];
    top.append(image, number);

    const label = document.createElement('span');
    label.className = 'technical-tool-card-label';
    label.textContent = match[2];

    button.replaceChildren(top, label);
    button.classList.add('technical-tool-card');
  }

  function syncRecordNames(panel) {
    panel.querySelectorAll('.processing-row, .record-row').forEach((row) => {
      const titleNode = row.querySelector('.processing-copy strong, .record-copy strong');
      if (!titleNode) return;
      const title = normalizeTitle(titleNode.textContent, row);
      if (title === titleNode.textContent.trim()) return;
      titleNode.textContent = title;
      titleNode.title = title;
    });
  }

  function sync() {
    const panel = document.getElementById('result-panel');
    if (!panel) return;
    syncToolNames(panel);
    syncRecordNames(panel);
  }

  const app = document.getElementById('app');
  sync();
  if (app) new MutationObserver(sync).observe(app, { childList: true, subtree: true });

  window.TechnicalResultNaming = { formatMinute, normalizeTitle };
})();
