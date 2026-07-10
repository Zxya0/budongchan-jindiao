class ChiefAnalystAgent {
  synthesize(results, assetData) {
    const { operations, cashFlow, risk, esg, compliance, financingMaterial } = results;
    
    const scores = [
      { name: '运营', score: operations?.score || 75, weight: 0.25 },
      { name: '财务', score: cashFlow?.riskLevel === '低' ? 85 : cashFlow?.riskLevel === '中' ? 70 : 55, weight: 0.25 },
      { name: '风险', score: risk?.overallRiskScore || 75, weight: 0.20 },
      { name: 'ESG', score: esg?.esgScore || 65, weight: 0.15 },
      { name: '合规', score: compliance?.complianceScore || 50, weight: 0.15 },
    ];
    
    const weightedScore = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
    const overallScore = Math.round(weightedScore);
    
    const recommendations = [];
    if (compliance?.complianceScore && compliance.complianceScore < 60) {
      recommendations.push('优先完成合规材料补全，这是融资前提');
    }
    if (operations?.tenantAnalysis?.warningSignals?.length > 0) {
      recommendations.push('优化租户结构，降低行业集中度风险');
    }
    if (cashFlow?.riskLevel === '高') {
      recommendations.push('优化债务结构，降低偿债压力');
    }
    if (esg?.carbonAnalysis?.trend === '需改进') {
      recommendations.push('制定绿色改造计划，提升ESG表现');
    }
    
    const investmentAdvice = overallScore >= 80 ? '强烈推荐' : overallScore >= 65 ? '谨慎推荐' : '不建议投资';
    
    const fairValue = (assetData.propertyValue || 100000) * (overallScore / 100);
    
    return {
      summary: '主审报告生成完成',
      executiveSummary: {
        assetName: assetData.projectName || '待评估资产',
        assetType: assetData.assetType,
        location: assetData.location,
        overallScore,
        investmentAdvice,
        fairValue: `${fairValue.toFixed(0)}万元`,
        assessmentDate: new Date().toISOString().split('T')[0],
      },
      keyFindings: [
        { category: '运营表现', content: `出租率${operations?.occupancyAnalysis?.currentRate || 85}%，运营评分${operations?.score || 75}分`, status: operations?.score >= 80 ? 'positive' : 'neutral' },
        { category: '财务健康', content: `DSCR ${cashFlow?.keyMetrics?.dscr || 1.5}倍，LTV ${cashFlow?.keyMetrics?.ltv || 50}%`, status: cashFlow?.riskLevel === '低' ? 'positive' : 'warning' },
        { category: '风险状况', content: `综合风险评分${risk?.overallRiskScore || 75}分，${risk?.riskLevel || '中'}风险`, status: risk?.riskLevel === '低' ? 'positive' : 'warning' },
        { category: 'ESG表现', content: `碳排放强度${esg?.carbonAnalysis?.intensity || 100} kgCO2/m2，ESG评分${esg?.esgScore || 65}分`, status: esg?.esgScore >= 70 ? 'positive' : 'neutral' },
        { category: '合规状态', content: `${compliance?.gapList?.length || 0}项合规缺口，${compliance?.priorityGaps?.filter(g => g.risk === '高').length || 0}项高优先级`, status: compliance?.complianceScore >= 70 ? 'positive' : 'negative' },
      ],
      riskWarnings: [
        ...(compliance?.priorityGaps?.filter(g => g.risk === '高').map(g => g.name) || []),
        ...(operations?.tenantAnalysis?.warningSignals || []),
        ...(cashFlow?.riskWarnings || []),
      ],
      recommendations,
      financingRecommendation: financingMaterial?.scenario || '银行经营性物业贷款',
      scores,
    };
  }
}

module.exports = new ChiefAnalystAgent();