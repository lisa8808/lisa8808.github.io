export const STORAGE_KEY = 'official-writing-demo-state-v1';

const allowedExtensions = new Set(['pdf', 'doc', 'docx']);
const extensionOf = (name) => name.split('.').pop().toLowerCase();
const id = () => crypto.randomUUID();

const initialSourceFiles = [
  ['关于公路运输租赁通知.docx', 'docx'],
  ['企业信息技术系统日常运维与技术服务协议.docx', 'docx'],
  ['员工在职及离职后商业秘密保护与保密协议.pdf', 'pdf'],
  ['项目培训工作方案.pdf', 'pdf'],
  ['公文写作规范.docx', 'docx'],
];

const initialKnowledgeFiles = [
  ['关于公路运输租赁公告.docx', 'docx'],
  ['企业信息技术系统日常运维与技术服务协议.docx', 'docx'],
  ['员工在职及离职后商业秘密保护与保密协议.pdf', 'pdf'],
  ['公文格式国家标准.pdf', 'pdf'],
];

const toFile = ([name, type], selected = false) => ({ id: id(), name, type, selected });

export function createInitialState() {
  return {
    sourceFiles: initialSourceFiles.map((file) => toFile(file, true)),
    knowledgeFiles: initialKnowledgeFiles.map((file) => toFile(file)),
    activeTool: 'general',
    messages: [],
    records: [],
    activeRecordId: null,
  };
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.sourceFiles) || !Array.isArray(state.knowledgeFiles)
      || !Array.isArray(state.messages) || !Array.isArray(state.records)) {
      return createInitialState();
    }
    return state;
  } catch {
    return createInitialState();
  }
}

export function saveState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addFiles(state, group, files) {
  const target = state[group];
  if (!Array.isArray(target)) return { added: [], rejected: files.length };

  const names = new Set(target.map((file) => file.name));
  const added = [];
  let rejected = 0;

  for (const file of files) {
    const name = file?.name?.trim();
    if (!name || !allowedExtensions.has(extensionOf(name))) {
      rejected += 1;
      continue;
    }
    if (names.has(name)) continue;

    const next = { id: id(), name, type: extensionOf(name), selected: false };
    target.push(next);
    added.push(next);
    names.add(name);
  }

  return { added, rejected };
}

export function setSelection(state, group, fileId, selected) {
  const file = state[group]?.find((item) => item.id === fileId);
  if (file) file.selected = Boolean(selected);
  return file;
}

export function setAllSelected(state, group, selected) {
  const files = state[group];
  if (!Array.isArray(files)) return;
  files.forEach((file) => { file.selected = Boolean(selected); });
}

function buildOfficialDraft(prompt) {
  return `关于${prompt}的通知\n\n各科室、下属各单位：\n\n为做好${prompt}相关工作，现将有关事项通知如下：\n\n一、工作要求\n请结合实际认真组织落实，确保各项安排有序推进。\n\n二、时间安排\n请于规定时间内完成相关准备工作。\n\n特此通知。`;
}

function buildGeneralDraft(prompt) {
  return `主题：${prompt}\n\n围绕“${prompt}”，建议先明确目标、参与对象和交付时间，再按照准备、执行、复盘三个阶段推进。\n\n请根据实际情况补充负责人、资源安排与验收标准。`;
}

function snapshot(record) {
  return Object.freeze({
    id: id(),
    title: record.title,
    mode: record.mode,
    content: record.content,
    createdAt: record.createdAt,
    savedAt: new Date().toISOString(),
  });
}

export function createRecord(state, prompt) {
  const text = String(prompt).trim();
  const official = state.activeTool === 'official';
  const record = {
    id: id(),
    title: official ? `关于${text.slice(0, 18)}的通知` : text.slice(0, 24),
    mode: state.activeTool,
    content: official ? buildOfficialDraft(text) : buildGeneralDraft(text),
    createdAt: new Date().toISOString(),
    versions: [],
  };
  record.versions.push(snapshot(record));
  state.records.unshift(record);
  state.activeRecordId = record.id;
  return record;
}

export function updateRecord(state, recordId, changes) {
  const record = state.records.find((item) => item.id === recordId);
  if (!record) return undefined;
  if (typeof changes.title === 'string') record.title = changes.title;
  if (typeof changes.content === 'string') record.content = changes.content;
  record.versions.push(snapshot(record));
  return record;
}

export function restoreVersion(state, recordId, versionId) {
  const record = state.records.find((item) => item.id === recordId);
  const version = record?.versions.find((item) => item.id === versionId);
  if (!record || !version) return undefined;
  record.title = version.title;
  record.mode = version.mode;
  record.content = version.content;
  record.versions.push(snapshot(record));
  return record;
}

export function buildDownloadText(record) {
  return `${record.title}\n\n${record.content}`;
}

export function rewriteContent(content, action, instruction = '') {
  const source = String(content);
  const request = String(instruction).trim();
  switch (action) {
    case 'expand':
      return `${source}\n\n补充说明：请各有关单位结合实际细化措施，明确责任分工和完成时限。`;
    case 'shorten':
      return source.length <= 80 ? source : `${source.slice(0, Math.max(40, Math.floor(source.length * 0.45)))}……`;
    case 'rewrite':
      return `经优化表述：${source}`;
    case 'continue':
      return `${source}\n\n后续工作将按计划持续推进，并及时总结反馈。`;
    default:
      return request ? `${source}\n\n修改要求：${request}` : source;
  }
}
