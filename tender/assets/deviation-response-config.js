(function (root, factory) {
  const config = factory();
  if (typeof module === 'object' && module.exports) module.exports = config;
  if (root) root.__TENDER_DEVIATION_RESPONSE_CONFIG__ = config;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const technical = {
    actionLabel: '技术标偏离/响应',
    documentLabel: '技术标',
    focusText: '重点评估技术、功能、参数、实施及技术服务相关条款',
    modules: [
      {
        name: '技术响应偏离表',
        kind: 'table',
        count: 4,
        rows: [
          { id: 'T-01', requirement: '★平台应支持不少于 5000 个并发用户访问。', response: '本项目平台支持 8000 个并发用户访问，并提供性能测试报告。', deviation: '正偏离', category: '技术', important: true, confirmed: false, risk: '重点条款需逐条确认，并核验性能测试报告。' },
          { id: 'T-02', requirement: '系统平均响应时间应小于 2 秒。', response: '系统在标准负载下平均响应时间不高于 1.5 秒。', deviation: '正偏离', category: '性能', important: false, confirmed: true },
          { id: 'T-03', requirement: '数据库须支持国产化适配。', response: '支持达梦、人大金仓等国产数据库适配。', deviation: '完全响应', category: '技术', important: false, confirmed: false },
          { id: 'T-04', requirement: '关键业务数据保存期限不少于 5 年。', response: '提供分级存储与备份能力，关键业务数据保存 5 年。', deviation: '无偏离', category: '服务', important: false, confirmed: false },
        ],
      },
      {
        name: '技术服务偏离表',
        kind: 'table',
        count: 3,
        rows: [
          { id: 'TS-01', requirement: '提供 7×24 小时技术支持服务。', response: '提供 7×24 小时热线及远程技术支持服务。', deviation: '完全响应', category: '技术服务', important: false, confirmed: true },
          { id: 'TS-02', requirement: '故障发生后 30 分钟内响应，2 小时内到场。', response: '故障发生后 30 分钟内响应，武汉市内 2 小时到场。', deviation: '无偏离', category: '技术服务', important: true, confirmed: false, risk: '到场范围仅描述武汉市内，请确认是否覆盖招标要求的全部服务区域。' },
          { id: 'TS-03', requirement: '项目验收后提供不少于 3 年免费运维。', response: '项目验收后提供 3 年免费运维服务。', deviation: '完全响应', category: '运维', important: false, confirmed: false },
        ],
      },
      {
        name: '技术响应要求编写',
        kind: 'requirements',
        count: 2,
        rows: [
          { id: 'TR-01', requirement: '说明系统部署架构、容灾机制及扩展能力。', response: '采用双中心部署架构，支持应用与数据库高可用，并可按业务量横向扩展。', deviation: '完全响应', category: '技术', important: false, confirmed: false },
          { id: 'TR-02', requirement: '说明项目培训计划和培训材料交付方式。', response: '提供管理员、业务人员两类培训，并交付电子版操作手册及培训课件。', deviation: '完全响应', category: '培训', important: false, confirmed: false },
        ],
      },
    ],
  };

  const business = {
    actionLabel: '商务标偏离/响应',
    documentLabel: '商务标',
    focusText: '重点评估商务、业务、合同、报价及服务承诺相关条款',
    modules: [
      {
        name: '商务响应偏离表',
        kind: 'table',
        count: 4,
        rows: [
          { id: 'B-01', requirement: '项目交付周期为合同签订后 90 日历天。', response: '承诺合同签订后 85 日历天完成项目交付。', deviation: '正偏离', category: '交付', important: false, confirmed: true },
          { id: 'B-02', requirement: '★投标人须提供项目未完成情况下的处理承诺。', response: '我方承诺在合同约定范围内完成全部项目工作。', deviation: '完全响应', category: '商务', important: true, confirmed: false, risk: '响应内容不够具体，请补充未完成项目的处理方式和责任边界。' },
          { id: 'B-03', requirement: '质保期不少于 3 年。', response: '本项目提供 3 年免费质保服务。', deviation: '无偏离', category: '售后', important: false, confirmed: false },
          { id: 'B-04', requirement: '付款条件按合同专用条款执行。', response: '接受并严格执行合同专用条款约定的付款条件。', deviation: '完全响应', category: '付款', important: false, confirmed: false },
        ],
      },
      {
        name: '合同条款响应表',
        kind: 'table',
        count: 3,
        rows: [
          { id: 'BC-01', requirement: '未经采购人书面同意不得转包或违法分包。', response: '我方承诺不转包、不违法分包。', deviation: '完全响应', category: '合同', important: true, confirmed: false },
          { id: 'BC-02', requirement: '项目资料及成果知识产权归采购人所有。', response: '接受项目成果知识产权归采购人所有的约定。', deviation: '无偏离', category: '知识产权', important: false, confirmed: true },
          { id: 'BC-03', requirement: '双方应对项目过程中获悉的信息承担保密义务。', response: '严格遵守保密义务，并建立项目资料分级管理机制。', deviation: '完全响应', category: '保密', important: false, confirmed: false },
        ],
      },
      {
        name: '商务响应要求编写',
        kind: 'requirements',
        count: 2,
        rows: [
          { id: 'BR-01', requirement: '说明售后服务组织、响应方式和服务期限。', response: '设立专属服务团队，提供热线、远程和现场服务，服务期覆盖质保期全过程。', deviation: '完全响应', category: '售后', important: false, confirmed: false },
          { id: 'BR-02', requirement: '说明项目验收配合和整改承诺。', response: '配合采购人完成阶段验收和最终验收，对发现的问题按要求限期整改。', deviation: '完全响应', category: '验收', important: false, confirmed: false },
        ],
      },
    ],
  };

  const configs = { technical, business };
  const stripExtension = (fileName) => String(fileName || '当前招标文件').replace(/\.(docx?|pdf|wps)$/i, '');
  const formatMinute = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  };

  return {
    getModeConfig(mode) {
      return configs[mode] || technical;
    },
    createRecordTitle(mode, fileName) {
      return `${configs[mode]?.actionLabel || technical.actionLabel}_${stripExtension(fileName)}`;
    },
    createStepRecordTitle(step, fileName, generatedAt = new Date()) {
      const prefix = step === 'analysis' ? '响应解读' : '响应正文';
      return `${prefix}_${stripExtension(fileName)}_${formatMinute(generatedAt)}`;
    },
  };
});
