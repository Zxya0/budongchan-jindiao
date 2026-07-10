class CashFlowAgent {
  analyze(assetData, structuredData, operationsResult) {
    const baseNOI = assetData.netOperatingIncome || 5000;
    const propertyValue = assetData.propertyValue || 100000;
    const loanAmount = assetData.loanAmount || 50000;
    
    const annualGrowth = 0.03 + Math.random() * 0.02;
    const years = 5;
    
    const annualForecast = [];
    for (let i = 0; i < years; i++) {
      const noi = baseNOI * Math.pow(1 + annualGrowth, i);
      const debtService = loanAmount * 0.05;
      annualForecast.push({
        year: 2024 + i,
        noi: noi.toFixed(2),
        debtService: debtService.toFixed(2),
        cashFlow: (noi - debtService).toFixed(2),
        dscr: (noi / debtService).toFixed(2),
      });
    }
    
    const dscr = (baseNOI / (loanAmount * 0.05)).toFixed(2);
    const ltv = ((loanAmount / propertyValue) * 100).toFixed(1);
    
    const sensitivityFactors = [
      { name: '出租率', impact: '每变动1%影响现金流约2.5%' },
      { name: '租金水平', impact: '每变动5%影响现金流约4.8%' },
      { name: '运营成本', impact: '每变动10%影响现金流约3.2%' },
      { name: '利率变化', impact: '每变动0.5%影响偿债负担约8%' },
      { name: '空置期', impact: '每延长1个月影响现金流约0.8%' },
    ];
    
    const stressScenarios = [
      { name: '轻度衰退', description: 'GDP增长放缓至2%', impact: 'NOI下降5%-8%', probability: '中' },
      { name: '中度衰退', description: '经济下行，失业率上升', impact: 'NOI下降15%-20%', probability: '低' },
      { name: '严重衰退', description: '市场大幅调整', impact: 'NOI下降30%以上', probability: '极低' },
    ];
    
    const riskLevel = parseFloat(dscr) >= 1.5 ? '低' : parseFloat(dscr) >= 1.2 ? '中' : '高';
    const warnings = [];
    if (riskLevel === '高') warnings.push('偿债能力不足，建议优化债务结构');
    if (parseFloat(ltv) > 60) warnings.push('贷款价值比较高，融资空间有限');
    
    return {
      summary: '现金流预测完成',
      annualForecast,
      quarterlyForecast: ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
        quarter: q,
        cashFlow: (baseNOI / 4 * (0.95 + Math.random() * 0.1)).toFixed(2),
      })),
      keyMetrics: {
        dscr,
        ltv: ltv + '%',
        noi: baseNOI.toFixed(0),
        ffo: (baseNOI * 0.9).toFixed(0),
      },
      sensitivityAnalysis: sensitivityFactors,
      stressScenarios,
      riskLevel,
      riskWarnings: warnings,
    };
  }
}

module.exports = new CashFlowAgent();