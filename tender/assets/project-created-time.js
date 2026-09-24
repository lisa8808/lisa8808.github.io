(() => {
  "use strict";

  const STORAGE_KEY = "tender-project-created-at";
  const DEFAULT_PROJECT = "某高校高性能计算GPU集群建设项目";
  const DEFAULT_OFFSET_MS = 6 * 60 * 1000;

  const pad = (value) => String(value).padStart(2, "0");

  function parse(value) {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    const text = String(value == null ? "" : value).trim();
    if (!text) return null;

    const match = text.match(
      /^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})(?:日)?(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
    );
    if (!match) return null;

    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0)
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatCard(value) {
    const date = parse(value);
    if (!date) return "";
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join("-") + " " + [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join(":");
  }

  function formatResult(value) {
    const date = parse(value);
    if (!date) return "";
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function projectKey(projectName) {
    return String(projectName == null ? "" : projectName).trim();
  }

  function readStorage() {
    try {
      const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (error) {
      return {};
    }
  }

  function writeStorage(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      // The demo still works without persistent storage.
    }
  }

  function read(projectName) {
    const key = projectKey(projectName);
    if (!key) return null;
    return parse(readStorage()[key]);
  }

  function remember(projectName, value) {
    const key = projectKey(projectName);
    const date = parse(value);
    if (!key || !date) return date;

    const values = readStorage();
    values[key] = formatCard(date);
    writeStorage(values);
    return date;
  }

  function currentProjectName() {
    const search = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes("?")
      ? window.location.hash.slice(window.location.hash.indexOf("?") + 1)
      : "";
    const hash = new URLSearchParams(hashQuery);
    return search.get("project") || hash.get("project") || "";
  }

  function queryCreatedAt() {
    const search = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes("?")
      ? window.location.hash.slice(window.location.hash.indexOf("?") + 1)
      : "";
    const hash = new URLSearchParams(hashQuery);
    return search.get("createdAt")
      || search.get("projectCreatedAt")
      || hash.get("createdAt")
      || hash.get("projectCreatedAt");
  }

  function resolve(options) {
    const config = options && typeof options === "object" ? options : {};
    const projectName = projectKey(config.project) || currentProjectName() || DEFAULT_PROJECT;
    const explicit = parse(config.createdAt);
    if (explicit) {
      remember(projectName, explicit);
      return explicit;
    }

    const fromUrl = parse(queryCreatedAt());
    if (fromUrl) {
      remember(projectName, fromUrl);
      return fromUrl;
    }

    const stored = read(projectName);
    if (stored) return stored;

    const fallback = new Date(Date.now() - DEFAULT_OFFSET_MS);
    remember(projectName, fallback);
    return fallback;
  }

  function stepForTitle(title, scope) {
    const text = String(title || "").trim();
    if (!text) return null;

    if (scope === "prebid") {
      if (text.includes("问答记录")) return 0;
      if (text.includes("标书要点解读") || text.includes("招标文件解读")) return 1;
      if (text.includes("投标符合性自评") || text.includes("符合性自评")) return 2;
      return null;
    }

    if (scope === "technical") {
      if (text.includes("问答记录")) return 0;
      if (text.includes("技术要求解读") || text.includes("招标文件解读") || text.includes("标书要点解读")) return 1;
      if (text.includes("技术大纲") || text.includes("技术标投标大纲")) return 2;
      if (text.includes("技术正文") || text.includes("技术标投标正文")) return 3;
      return null;
    }

    if (scope === "business") {
      if (text.includes("问答记录")) return 0;
      if (text.includes("商务大纲") || text.includes("商务标投标大纲")) return 1;
      if (text.includes("商务正文") || text.includes("商务标投标正文")) return 2;
      return null;
    }

    if (scope === "review") {
      if (text.includes("问答记录")) return 0;
      if (text.includes("审查项清单")) return 1;
      if (text.includes("投标文件审查报告") && !text.includes("_版本")) return 2;
      if (text.includes("投标文件审查报告")) return 3;
      return null;
    }

    if (text.includes("问答记录")) return 0;
    if (text.includes("标书要点解读") || text.includes("审查项清单") || text.includes("商务大纲") || text.includes("技术要求解读")) return 1;
    if (text.includes("投标符合性自评") || text.includes("技术大纲") || text.includes("商务正文")) return 2;
    if (text.includes("技术正文")) return 3;
    return null;
  }

  function resultDate(projectName, step) {
    const base = resolve({ project: projectName });
    const numericStep = Number(step);
    const safeStep = Number.isFinite(numericStep) ? Math.max(0, numericStep) : 0;
    const offset = safeStep * 60 * 1000;
    return new Date(base.getTime() + offset);
  }

  function resultText(projectName, step) {
    return formatResult(resultDate(projectName, step));
  }

  window.ProjectCreatedTime = Object.freeze({
    parse,
    formatCard,
    formatResult,
    read,
    remember,
    resolve,
    stepForTitle,
    resultDate,
    resultText,
  });
})();
