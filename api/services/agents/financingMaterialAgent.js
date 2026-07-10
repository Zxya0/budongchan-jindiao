class FinancingMaterialAgent {
  generate(assetData, scenario, complianceResult) {
    const scenarioTemplates = {
      bankLoan: {
        name: '银行经营性物业贷款',
        description: '适合稳定运营的成熟物业',
        directories: [
          { name: '一、基础资料', items: ['企业营业执照', '公司章程', '法定代表人身份证明'] },
          { name: '二、资产证明', items: ['产权证书', '土地使用证', '规划许可证'] },
          { name: '三、财务资料', items: ['近三年财务报表', '审计报告', '纳税证明'] },
          { name: '四、运营资料', items: ['租赁合同', '出租率证明', '租户清单'] },
        ],
      },
      abs: {
        name: '资产支持证券(ABS)',
        description: '适合大规模资产池融资',
        directories: [
          { name: '一、交易结构', items: ['交易说明书', '评级报告', '法律意见书'] },
          { name: '二、资产池', items: ['底层资产清单', '现金流预测', '尽职调查报告'] },
          { name: '三、发行文件', items: ['募集说明书', '承销协议', '托管协议'] },
        ],
      },
      reits: {
        name: '公募REITs',
        description: '适合基础设施类资产',
        directories: [
          { name: '一、资产说明', items: ['基础设施资产证明', '运营资质', '项目批复'] },
          { name: '二、估值报告', items: ['资产评估报告', '现金流模型', '市场分析'] },
          { name: '三、发行文件', items: ['招募说明书', '基金合同', '托管协议'] },
        ],
      },
      insurance: {
        name: '保险资金债权投资',
        description: '适合长期持有型资产',
        directories: [
          { name: '一、项目资料', items: ['项目可行性报告', '政府批复', '环评文件'] },
          { name: '二、融资方案', items: ['融资协议', '担保措施', '还款计划'] },
          { name: '三、风控资料', items: ['风险评估报告', '缓释措施', '监控方案'] },
        ],
      },
      trust: {
        name: '信托融资',
        description: '灵活融资方案',
        directories: [
          { name: '一、信托计划', items: ['信托合同', '风险揭示书', '认购协议'] },
          { name: '二、基础资产', items: ['资产证明', '收益权转让协议', '担保文件'] },
          { name: '三、合规文件', items: ['尽调报告', '法律意见', '监管报备'] },
        ],
      },
    };
    
    const template = scenarioTemplates[scenario] || scenarioTemplates.bankLoan;
    
    return {
      summary: '融资材料生成完成',
      scenario: template.name,
      template,
      customizations: [
        `根据资产类型(${assetData.assetType})定制`,
        `根据融资金额(${assetData.financingAmount}万元)调整`,
        `根据所在城市(${assetData.city})补充市场分析`,
      ],
      missingMaterials: complianceResult?.gapList?.map(g => g.name) || [],
    };
  }
  
  getScenarios() {
    return [
      { key: 'bankLoan', name: '银行经营性物业贷款', description: '适合稳定运营的成熟物业' },
      { key: 'abs', name: '资产支持证券(ABS)', description: '适合大规模资产池融资' },
      { key: 'reits', name: '公募REITs', description: '适合基础设施类资产' },
      { key: 'insurance', name: '保险资金债权投资', description: '适合长期持有型资产' },
      { key: 'trust', name: '信托融资', description: '灵活融资方案' },
    ];
  }
}

module.exports = new FinancingMaterialAgent();