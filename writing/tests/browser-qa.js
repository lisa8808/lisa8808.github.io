const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const playwrightPath = process.env.PLAYWRIGHT_PATH
  || path.join(process.env.USERPROFILE, '.config/opencode/skills/aurora-slide/node_modules/playwright');
const { chromium } = require(playwrightPath);
const chromePath = process.env.CHROME_PATH
  || path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe');

(async () => {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const page = await browser.newPage({ acceptDownloads: true });
  page.setDefaultTimeout(5000);
  await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href, { waitUntil: 'domcontentloaded', timeout: 10000 });

  const counts = await page.locator('.source-count').innerText();
  if (!counts.includes('4 份文件') || !counts.includes('1 个知识库')) throw new Error(`来源数量错误：${counts}`);
  if (await page.locator('.knowledge-title').count()) throw new Error('知识库来源标题和全选框仍存在');
  if (await page.locator('.knowledge-group > .soft-button').count()) throw new Error('选择知识库按钮仍存在');

  const toolButtons = page.locator('.tool-grid button');
  if (await toolButtons.count() !== 4) throw new Error('工具区应保留四个按钮并删除 PPT');
  const toolBoxes = await toolButtons.evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y) };
  }));
  if (!(toolBoxes[0].y === toolBoxes[1].y && toolBoxes[2].y === toolBoxes[3].y && toolBoxes[2].y > toolBoxes[0].y)) {
    throw new Error(`工具区不是两列两行布局：${JSON.stringify(toolBoxes)}`);
  }
  if (!(await toolButtons.nth(0).getAttribute('class') || '').includes('active')) throw new Error('默认未选中通用写作');
  if (await page.locator('[data-generating-list], .generating-record').count()) throw new Error('页面仍包含正在生成假任务');
  if (await toolButtons.nth(1).isDisabled()) throw new Error('公文写作按钮应可用');
  if (await toolButtons.nth(2).isEnabled() || await toolButtons.nth(3).isEnabled()) throw new Error('思维导图和翻译写作应保持禁用');
  const expectedTitles = ['企业智能办公AI平台实施方案', '企业智能办公AI平台技术服务合同', '企业智能办公AI应用培训通知', '智能体应用实践思考', '企业知识库建设与运营指引', '2026上半年数字化办公工作总结', '2026年度信息系统安全检查通知', '生成式AI应用数据安全管理规范', '智能办公平台试运行问题分析', '智能办公平台试点推进会纪要'];
  const generalTitles = [expectedTitles[0], expectedTitles[1], expectedTitles[3], expectedTitles[4], expectedTitles[5], expectedTitles[8], expectedTitles[9]];
  const officialTitles = [expectedTitles[2], expectedTitles[6], expectedTitles[7]];
  const initialRecordTitles = await page.locator('[data-record-list] .record-open strong').allTextContents();
  if (JSON.stringify(initialRecordTitles) !== JSON.stringify(generalTitles)) throw new Error(`通用写作记录筛选错误：${initialRecordTitles.join(' | ')}`);
  await toolButtons.nth(1).click();
  if (!(await toolButtons.nth(1).getAttribute('class') || '').includes('active')) throw new Error('公文写作未切换为选中状态');
  if ((await toolButtons.nth(0).getAttribute('class') || '').includes('active')) throw new Error('切换公文写作后通用写作仍为选中状态');
  const officialRecordTitles = await page.locator('[data-record-list] .record-open strong').allTextContents();
  if (JSON.stringify(officialRecordTitles) !== JSON.stringify(officialTitles)) throw new Error(`公文写作记录筛选错误：${officialRecordTitles.join(' | ')}`);
  await toolButtons.nth(0).click();
  if (!(await toolButtons.nth(0).getAttribute('class') || '').includes('active')) throw new Error('通用写作未恢复选中状态');
  const restoredGeneralTitles = await page.locator('[data-record-list] .record-open strong').allTextContents();
  if (JSON.stringify(restoredGeneralTitles) !== JSON.stringify(generalTitles)) throw new Error(`通用写作记录恢复错误：${restoredGeneralTitles.join(' | ')}`);

  const chatWidthBeforeCollapse = await page.locator('#chat-panel').evaluate((node) => Math.round(node.getBoundingClientRect().width));
  const resultToggleIcon = await page.locator('.result-toggle-icon').boundingBox();
  if (!resultToggleIcon || resultToggleIcon.width < 16) throw new Error('结果栏收展按钮图标不可见');
  await page.locator('[data-result-toggle]').click();
  await page.waitForTimeout(300);
  const workspaceClass = await page.locator('.workspace').getAttribute('class');
  if (!workspaceClass.includes('result-collapsed')) throw new Error('结果栏未进入收起状态');
  const chatWidthAfterCollapse = await page.locator('#chat-panel').evaluate((node) => Math.round(node.getBoundingClientRect().width));
  if (chatWidthAfterCollapse <= chatWidthBeforeCollapse) throw new Error(`结果栏收起后对话区未拓宽：${chatWidthBeforeCollapse} -> ${chatWidthAfterCollapse}`);
  if ((await page.locator('[data-result-toggle]').getAttribute('aria-label')) !== '展开结果栏') throw new Error('收起后按钮标签未更新');
  await page.locator('[data-result-toggle]').click();
  await page.waitForTimeout(300);
  if ((await page.locator('.workspace').getAttribute('class')).includes('result-collapsed')) throw new Error('结果栏未恢复展开状态');
  if (!(await toolButtons.nth(0).getAttribute('class') || '').includes('active')) throw new Error('结果栏收展后写作模式丢失');

  const recordTitles = await page.locator('[data-record-list] .record-open strong').allTextContents();
  if (JSON.stringify(recordTitles) !== JSON.stringify(generalTitles)) {
    throw new Error(`记录列表错误：${recordTitles.join(' | ')}`);
  }
  const truncatedRecords = await page.locator('[data-record-list] .record-open strong').evaluateAll((titles) => titles.filter((title) => title.scrollWidth > title.clientWidth + 1).map((title) => title.textContent.trim()));
  if (truncatedRecords.length) throw new Error(`生成记录标题被截断：${truncatedRecords.join('、')}`);

  await page.locator('[data-record-id="plan"]').click();
  if (await page.locator('.review-button').isVisible()) throw new Error('详情中的公文校审按钮应隐藏');
  const historyPanel = page.locator('.history-panel');
  const historyToggle = page.locator('[data-history-toggle]');
  if (await historyPanel.isVisible()) throw new Error('详情首次打开时历史版本栏应收起');
  if ((await historyToggle.getAttribute('aria-expanded')) !== 'false') throw new Error('历史版本按钮初始状态错误');
  const editorWidthCollapsed = await page.locator('.editor-panel').evaluate((node) => Math.round(node.getBoundingClientRect().width));
  await historyToggle.click();
  await page.waitForTimeout(200);
  if (!(await historyPanel.isVisible())) throw new Error('点击历史版本后未展开历史栏');
  if ((await historyToggle.getAttribute('aria-expanded')) !== 'true') throw new Error('历史版本按钮展开状态错误');
  const editorWidthExpanded = await page.locator('.editor-panel').evaluate((node) => Math.round(node.getBoundingClientRect().width));
  if (editorWidthExpanded >= editorWidthCollapsed) throw new Error(`历史栏展开后正文区宽度未缩小：${editorWidthCollapsed} -> ${editorWidthExpanded}`);
  if (await page.locator('.history-item').count() < 3) throw new Error('实施方案历史版本不足三个');
  const historyTitles = await page.locator('.history-item strong').allTextContents();
  if (historyTitles.some((title) => title !== expectedTitles[0])) throw new Error(`历史版本标题不统一：${historyTitles.join(' | ')}`);
  const historyTitleStyles = await page.locator('.history-item strong').evaluateAll((titles) => titles.map((title) => ({ weight: Number(getComputedStyle(title).fontWeight), truncated: title.scrollWidth > title.clientWidth + 1 })));
  if (historyTitleStyles.some((style) => style.weight >= 600 || style.truncated)) throw new Error(`历史版本标题样式不符合要求：${JSON.stringify(historyTitleStyles)}`);
  await page.locator('[data-version-id="plan-v2"]').click();
  const versionTitle = await page.locator('#document-title').innerText();
  if (versionTitle !== '标题：企业智能办公AI平台实施方案') throw new Error(`版本切换失败：${versionTitle}`);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('.download-document').click();
  const download = await downloadPromise;
  if (!download.suggestedFilename().endsWith('.txt')) throw new Error('下载文件格式错误');

  await historyToggle.click();
  if (await historyPanel.isVisible()) throw new Error('再次点击历史版本后未收起历史栏');

  await page.locator('.close-modal').click();
  await page.locator('[data-record-id="legacy-agent"]').click();
  if (await page.locator('.history-panel').isVisible()) throw new Error('重新打开记录时历史栏没有恢复默认收起');
  await page.locator('[data-history-toggle]').click();
  const legacyHistoryVersions = await page.locator('.history-item').count();
  const legacyOutlineItems = await page.locator('[data-document-outline] [data-outline-target]').count();
  if (legacyHistoryVersions !== 3) throw new Error(`恢复记录历史版本数量错误：${legacyHistoryVersions}`);
  if (legacyOutlineItems < 10) throw new Error(`恢复记录目录不够完整：${legacyOutlineItems}`);
  await page.locator('[data-version-id="legacy-agent-v2"]').click();
  if ((await page.locator('#document-title').innerText()) !== '标题：智能体应用实践思考') throw new Error('恢复记录版本切换失败');
  await page.locator('.close-modal').click();
  const before = await page.locator('[data-file-group="source"] .file-row').count();
  await page.locator('[data-local-picker="source"]').setInputFiles({
    name: '新增项目补充说明.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: Buffer.from('demo'),
  });
  const after = await page.locator('[data-file-group="source"] .file-row').count();
  if (after !== before + 1) throw new Error('本地文件名未追加到来源列表');

  if (await page.locator('[data-local-picker="knowledge"]').count()) throw new Error('知识库仍连接了本地文件选择器');
  await page.locator('.knowledge-upload').click();
  const knowledgeToast = await page.locator('.toast').innerText();
  if (knowledgeToast !== '无相关权限') throw new Error(`知识库按钮提示错误：${knowledgeToast}`);

  const artifactDir = path.resolve(__dirname, 'artifacts');
  fs.mkdirSync(artifactDir, { recursive: true });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-mode="general"]').click();
  await page.screenshot({ path: path.join(artifactDir, 'writing-demo-1920.png'), fullPage: true });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const truncatedToolLabels = await page.locator('.tool-grid button span').evaluateAll((labels) => labels.filter((label) => label.scrollWidth > label.clientWidth + 1).map((label) => label.textContent.trim()));
  if (truncatedToolLabels.length) throw new Error(`1366 视口工具名称被截断：${truncatedToolLabels.join('、')}`);
  await page.screenshot({ path: path.join(artifactDir, 'writing-demo-1366.png'), fullPage: true });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-record-id="plan"]').click();
  await page.screenshot({ path: path.join(artifactDir, 'document-history-collapsed.png'), fullPage: true });
  await page.locator('[data-history-toggle]').click();
  await page.screenshot({ path: path.join(artifactDir, 'document-history-expanded.png'), fullPage: true });

  console.log(JSON.stringify({ counts, recordCount: recordTitles.length, historyVersions: 3, legacyHistoryVersions, legacyOutlineItems, chatWidthBeforeCollapse, chatWidthAfterCollapse, versionTitle, download: download.suggestedFilename(), sourceRowsAfterUpload: after, knowledgeToast }));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
