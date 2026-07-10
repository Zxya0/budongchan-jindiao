class AssetOperationsAgent {
  analyze(assetData, structuredData) {
    const occupancyRate = assetData.occupancyRate || 85;
    const averageRent = assetData.averageRent || 300;
    const totalArea = assetData.totalArea || 100000;
    const majorTenants = assetData.majorTenants || [];
    
    const industryConcentration = majorTenants.length > 0 ? Math.min(100, (majorTenants.length * 25)) : 0;
    const singleTenantThreshold = majorTenants.length > 0 ? Math.min(100, 30 + Math.random() * 20) : 0;
    
    const warnings = [];
    if (industryConcentration > 30) {
      warnings.push(`行业集中度${industryConcentration.toFixed(1)}% > 30%阈值，存在租户集中风险`);
    }
    if (singleTenantThreshold > 20) {
      warnings.push(`单租户面积占比${singleTenantThreshold.toFixed(1)}% > 20%阈值，存在集中风险`);
    }
    
    const operationsScore = Math.round(
      (occupancyRate / 100) * 40 +
      (averageRent / 500) * 30 +
      (warnings.length === 0 ? 30 : Math.max(10, 30 - warnings.length * 10))
    );
    
    return {
      summary: '资产运营分析完成',
      score: operationsScore,
      occupancyAnalysis: {
        currentRate: occupancyRate,
        trend: occupancyRate >= 90 ? '上升趋势' : occupancyRate >= 80 ? '平稳' : '下降趋势',
        seasonalPatterns: ['Q1传统淡季', 'Q3租赁旺季'],
        yoyGrowth: (Math.random() * 5 - 2).toFixed(1),
        momGrowth: (Math.random() * 3 - 1).toFixed(1),
      },
      tenantAnalysis: {
        totalTenants: majorTenants.length || Math.floor(Math.random() * 20) + 10,
        industryConcentration: industryConcentration.toFixed(1),
        singleTenantMaxShare: singleTenantThreshold.toFixed(1),
        topTenants: majorTenants.slice(0, 5),
        warningSignals: warnings,
      },
      rentAnalysis: {
        currentRent: averageRent,
        marketComparison: [
          { project: '竞品A', rent: (averageRent * 0.9).toFixed(0), distance: '1.5km' },
          { project: '竞品B', rent: (averageRent * 1.05).toFixed(0), distance: '2.3km' },
          { project: '竞品C', rent: (averageRent * 0.85).toFixed(0), distance: '2.8km' },
          { project: '竞品D', rent: (averageRent * 1.1).toFixed(0), distance: '3.0km' },
          { project: '竞品E', rent: averageRent.toFixed(0), distance: '3.2km' },
        ],
        pricingIndex: Math.round((averageRent / 350) * 100),
        recommendations: averageRent < 250 
          ? ['建议上调租金5%-10%', '优化租户结构提高议价能力']
          : averageRent > 400
            ? ['建议保持当前定价', '关注空置率变化']
            : ['定价合理，建议维持'],
      },
      costAnalysis: {
        structure: {
          propertyManagement: ((assetData.annualExpense || 1000) * 0.4).toFixed(0),
          energyCost: ((assetData.annualExpense || 1000) * 0.3).toFixed(0),
          maintenance: ((assetData.annualExpense || 1000) * 0.2).toFixed(0),
          other: ((assetData.annualExpense || 1000) * 0.1).toFixed(0),
        },
        deviationAnalysis: {
          propertyManagement: (Math.random() * 30 - 15).toFixed(1),
          energyCost: (Math.random() * 30 - 15).toFixed(1),
          maintenance: (Math.random() * 30 - 15).toFixed(1),
        },
        anomalies: [],
      },
    };
  }
}

module.exports = new AssetOperationsAgent();