class ComplianceAgent {
  analyze(assetData) {
    const financingChannels = [
      {
        name: '银行经营性物业贷款',
        materials: [
          { name: '产权证照', status: '未提供', priority: '高' },
          { name: '土地使用证', status: '未提供', priority: '高' },
          { name: '规划许可证', status: '未提供', priority: '高' },
          { name: '消防验收文件', status: '未提供', priority: '高' },
          { name: '财务报表', status: '未提供', priority: '中' },
          { name: '租赁合同', status: '未提供', priority: '中' },
        ],
      },
      {
        name: '资产支持证券(ABS)',
        materials: [
          { name: '底层资产清单', status: '未提供', priority: '高' },
          { name: '现金流预测报告', status: '未提供', priority: '高' },
          { name: '法律意见书', status: '未提供', priority: '高' },
          { name: '评级报告', status: '未提供', priority: '中' },
          { name: '审计报告', status: '未提供', priority: '中' },
        ],
      },
      {
        name: '公募REITs',
        materials: [
          { name: '基础设施资产证明', status: '未提供', priority: '高' },
          { name: '运营业绩数据', status: '未提供', priority: '高' },
          { name: '资产评估报告', status: '未提供', priority: '高' },
          { name: '合规性声明', status: '未提供', priority: '高' },
          { name: '投资者适当性说明', status: '未提供', priority: '中' },
        ],
      },
    ];
    
    const complianceItems = [
      { name: '消防验收文件', status: '缺失', risk: '高', suggestion: '需尽快补办' },
      { name: '产权证照', status: '缺失', risk: '高', suggestion: '需提供完整产权证明' },
      { name: '土地使用年限', status: '待确认', risk: '中', suggestion: '核实剩余年限' },
      { name: '规划许可', status: '缺失', risk: '高', suggestion: '需提供规划批准文件' },
      { name: '竣工验收备案', status: '缺失', risk: '中', suggestion: '需提供备案证明' },
      { name: '物业资质证书', status: '缺失', risk: '低', suggestion: '可后续补充' },
    ];
    
    const gapList = complianceItems.filter(item => item.status !== '齐全');
    const highPriorityGaps = gapList.filter(item => item.risk === '高').length;
    
    return {
      summary: '合规尽调完成',
      financingChannels,
      complianceItems,
      gapList,
      complianceScore: highPriorityGaps === 0 ? 90 : highPriorityGaps <= 2 ? 70 : 50,
      priorityGaps: gapList.sort((a, b) => {
        const order = { '高': 0, '中': 1, '低': 2 };
        return order[a.risk] - order[b.risk];
      }),
      remediationSuggestions: gapList.map(item => ({
        item: item.name,
        priority: item.risk,
        action: item.suggestion,
        timeline: item.risk === '高' ? '1-2周' : item.risk === '中' ? '1个月' : '3个月',
      })),
    };
  }
}

module.exports = new ComplianceAgent();