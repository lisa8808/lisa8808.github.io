(function () {
  const KEY = "review2Projects";
  const REVIEW_DURATION = 20000;
  let lastWriteOk = true;

  function read() {
    try {
      const raw = window.localStorage.getItem(KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  function write(list) {
    let candidate = list;
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(candidate));
        lastWriteOk = true;
        return true;
      } catch (error) {
        if (candidate.length > 1) {
          candidate = candidate.slice(1);
        } else {
          try {
            window.localStorage.removeItem(KEY);
            window.localStorage.setItem(KEY, JSON.stringify(candidate));
            lastWriteOk = true;
            return true;
          } catch (finalError) {
            lastWriteOk = false;
            return false;
          }
        }
      }
    }
    lastWriteOk = false;
    return false;
  }

  function find(id) {
    if (!id) return null;
    return read().find(project => project.id === id) || null;
  }

  function save(project) {
    const list = read();
    project.updatedAt = Date.now();
    const index = list.findIndex(item => item.id === project.id);
    if (index >= 0) list[index] = project;
    else list.push(project);
    write(list);
    return project;
  }

  function create(data) {
    const now = Date.now();
    const project = {
      id: "p" + now,
      name: data.name || "未命名审查项目",
      scheme: data.scheme || "review2",
      tenderFile: data.tenderFile || { name: "", size: 0 },
      rules: data.rules || null,
      histories: [],
      createdAt: now,
      updatedAt: now
    };
    const list = read();
    list.push(project);
    write(list);
    return project;
  }

  function remove(id) {
    write(read().filter(project => project.id !== id));
  }

  function addHistory(project, bidName) {
    const now = Date.now();
    const entry = {
      id: "h" + now,
      bidName: bidName || "投标文件",
      createdAt: now,
      completesAt: now + REVIEW_DURATION,
      issues: 0
    };
    project.histories.unshift(entry);
    save(project);
    return entry;
  }

  function removeHistory(project, historyId) {
    project.histories = project.histories.filter(entry => entry.id !== historyId);
    save(project);
  }

  function historyStatus(entry) {
    return Date.now() < entry.completesAt ? "reviewing" : "done";
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function fmtTime(timestamp) {
    const date = new Date(timestamp);
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
  }

  function stripExt(name) {
    return (name || "").replace(/\.[^.]+$/, "");
  }

  function presetStatusKey(projectName) {
    return "realProjectDemoStatus:" + encodeURIComponent(String(projectName || "").trim());
  }

  window.Review2Store = {
    read,
    write,
    find,
    save,
    create,
    remove,
    addHistory,
    removeHistory,
    historyStatus,
    fmtTime,
    stripExt,
    presetStatusKey,
    REVIEW_DURATION,
    get lastWriteOk() { return lastWriteOk; }
  };
})();
