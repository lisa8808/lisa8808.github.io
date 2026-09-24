/*
 * 生成记录“处理进度”展示增强（仅改展示，不动任何业务逻辑）
 *
 * 目标：
 * 1. 默认状态不额外添加任何 loading，只处理页面里已经存在的进度记录；
 * 2. 触发任务后，“正在处理中（x/y）”里的数字按节奏逐格递增，肉眼可见地变化；
 * 3. 永远保留最后两步，最多停在倒数第二步（例如 8 步只走到 6/8），不显示“处理完成”。
 */
(() => {
  if (window.__resultProgressTickerReady) return;
  window.__resultProgressTickerReady = true;

  const STEP_DELAY = 2600; // 每格数字停留时长（毫秒）
  const STEP_JITTER = 700; // 各行错开节奏，避免所有记录同时跳动
  const FIRST_PULSE_MIN = 1100; // 首次跳动提前，保证短任务也能看到数字在变
  const FIRST_PULSE_JITTER = 500;
  const RESERVED_STEPS = 2; // 永远保留最后两步不完成
  const COUNTER_PATTERN = /(\d+)\s*\/\s*(\d+)/;

  const tracked = new WeakMap();

  const readCounter = (trigger) => {
    if (!trigger || typeof trigger.querySelector !== 'function') return null;
    const status = trigger.querySelector('small');
    const countNode = trigger.querySelector('.progress-popover-title strong');
    const statusText = status ? status.textContent.trim() : '';
    const countText = countNode ? countNode.textContent.trim() : '';
    const match = COUNTER_PATTERN.exec(statusText) || COUNTER_PATTERN.exec(countText);
    if (!match) return null;
    const current = Number(match[1]);
    const total = Number(match[2]);
    if (!Number.isFinite(current) || !Number.isFinite(total) || total <= 1) return null;
    return {
      current: Math.min(Math.max(current, 1), total),
      total,
      prefix: statusText.split(/[（(]/)[0].trim() || '正在处理中',
    };
  };

  const paint = (trigger, state, current) => {
    state.current = current;
    const status = trigger.querySelector('small');
    if (status) status.textContent = `${state.prefix}（${current}/${state.total}）`;
    const countNode = trigger.querySelector('.progress-popover-title strong');
    if (countNode) countNode.textContent = `${current}/${state.total}`;
    trigger.setAttribute('aria-label', `查看处理进度，当前第 ${current} 步，共 ${state.total} 步`);

    const steps = Array.from(trigger.querySelectorAll('.progress-step'));
    steps.forEach((step, index) => {
      const position = index + 1;
      const stepState = position < current ? 'done' : position === current ? state.currentClass : state.pendingClass;
      step.className = ['progress-step', stepState].filter(Boolean).join(' ');
      const marker = step.querySelector('i');
      if (marker) marker.textContent = position < current ? '✓' : '';
    });
  };

  const register = (trigger) => {
    if (!trigger || tracked.has(trigger)) return;
    const info = readCounter(trigger);
    if (!info) return;

    const steps = Array.from(trigger.querySelectorAll('.progress-step'));
    const cap = Math.max(1, info.total - RESERVED_STEPS); // 最多停在倒数第二步
    const state = {
      total: info.total,
      current: info.current,
      prefix: info.prefix,
      currentClass: steps.some((step) => step.classList.contains('current')) ? 'current' : 'active',
      pendingClass: steps.some((step) => step.classList.contains('pending')) ? 'pending' : '',
    };

    // 已经走到倒数第二步（或更靠后）的记录，回退一格再往上走，保证数字确实在变化
    const start = info.current >= cap ? Math.max(1, cap - 1) : info.current;
    if (start !== info.current) paint(trigger, state, start);
    if (start >= cap) return;

    const pulse = () => {
      if (!trigger.isConnected) {
        window.clearTimeout(state.timer);
        window.clearInterval(state.timer);
        return;
      }
      const latest = readCounter(trigger);
      const observed = latest ? latest.current : state.current;
      if (observed > cap) {
        paint(trigger, state, cap); // 兜底：任何情况下都不让进度推进到“处理完成”
        return;
      }
      if (observed < cap) paint(trigger, state, observed + 1);
    };

    // 第一跳提前到约 1.1s，之后按原有节奏（约 2.6s + 抖动）继续，避免短任务看不到数字变化
    state.timer = window.setTimeout(() => {
      pulse();
      if (!trigger.isConnected) return;
      state.timer = window.setInterval(pulse, STEP_DELAY + Math.round(Math.random() * STEP_JITTER));
    }, FIRST_PULSE_MIN + Math.round(Math.random() * FIRST_PULSE_JITTER));
    tracked.set(trigger, state);
  };

  const syncAll = () => {
    document.querySelectorAll('.progress-trigger').forEach(register);
  };

  let queued = 0;
  const scheduleSync = () => {
    if (queued) return;
    queued = window.setTimeout(() => {
      queued = 0;
      syncAll();
    }, 200);
  };

  const start = () => {
    syncAll();
    new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
