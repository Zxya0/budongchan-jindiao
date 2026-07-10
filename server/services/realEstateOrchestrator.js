import mongoose from 'mongoose';
import agentOperations from './agents/assetOperationsAgent.js';
import agentCashFlow from './agents/cashFlowAgent.js';
import agentRisk from './agents/riskManagementAgent.js';
import agentESG from './agents/esgAgent.js';
import agentCompliance from './agents/complianceAgent.js';
import agentFinancing from './agents/financingMaterialAgent.js';
import agentChief from './agents/chiefAnalystAgent.js';

const AnalysisRecordSchema = new mongoose.Schema({
  stockCode: { type: String, required: true },
  stockName: { type: String },
  analysisType: { type: String, default: 'stock', enum: ['stock', 'real_estate'] },
  riskProfile: { type: String, default: 'steady' },
  marketSentiment: { type: String },
  status: { type: String, default: 'processing', enum: ['processing', 'completed', 'failed'] },
  phases: { type: Array, default: [] },
  currentPhase: { type: Number, default: 0 },
  structuredData: { type: mongoose.Schema.Types.Mixed, default: {} },
  agentResults: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AnalysisRecord = mongoose.models.AnalysisRecord || mongoose.model('AnalysisRecord', AnalysisRecordSchema);

class RealEstateOrchestrator {
  async startAnalysis(recordId, options = {}) {
    console.log(`[RealEstate] Starting analysis for record: ${recordId}`);
    const record = await AnalysisRecord.findById(recordId);
    if (!record) throw new Error('分析记录不存在');

    try {
      record.status = 'processing';
      record.analysisType = 'real_estate';
      record.agentResults = {
        phases: [],
        operations: null,
        cashFlow: null,
        risk: null,
        esg: null,
        compliance: null,
        financingMaterial: null,
        chiefReport: null,
      };
      await record.save();

      const assetData = {
        projectName: record.structuredData?.projectName || record.stockName || '待评估资产',
        assetType: record.structuredData?.assetType || '商业综合体',
        location: record.structuredData?.location || record.structuredData?.city || '未知',
        totalArea: record.structuredData?.totalArea || record.structuredData?.buildingArea || 0,
        buildYear: record.structuredData?.buildYear || 0,
        floors: record.structuredData?.floors || 0,
        occupancyRate: record.structuredData?.occupancyRate || 0,
        averageRent: record.structuredData?.averageRent || 0,
        majorTenants: record.structuredData?.majorTenants || [],
        financingAmount: record.structuredData?.financingAmount || 0,
        propertyValue: record.structuredData?.propertyValue || 0,
        loanAmount: record.structuredData?.loanAmount || 0,
        annualRevenue: record.structuredData?.annualRevenue || 0,
        annualExpense: record.structuredData?.annualExpense || 0,
        netOperatingIncome: record.structuredData?.netOperatingIncome || 0,
      };

      const structuredData = record.structuredData || {};
      const financingScenario = options.financingScenario || 'bankLoan';

      await this.updatePhase(record, 1, 'processing', '资产运营智能体正在分析...');
      const operationsResult = agentOperations.analyze(assetData, structuredData);
      record.agentResults.operations = operationsResult;
      await this.updatePhase(record, 1, 'completed', '资产运营分析完成', operationsResult);

      await this.updatePhase(record, 2, 'processing', '现金流预测智能体正在分析...');
      const cashFlowResult = agentCashFlow.analyze(assetData, structuredData, operationsResult);
      record.agentResults.cashFlow = cashFlowResult;
      await this.updatePhase(record, 2, 'completed', '现金流预测完成', cashFlowResult);

      await this.updatePhase(record, 3, 'processing', '风险管理智能体正在分析...');
      const riskResult = agentRisk.analyze(assetData, structuredData, operationsResult, cashFlowResult);
      record.agentResults.risk = riskResult;
      await this.updatePhase(record, 3, 'completed', '风险评估完成', riskResult);

      await this.updatePhase(record, 4, 'processing', 'ESG智能体正在分析...');
      const esgResult = agentESG.analyze(assetData, structuredData, operationsResult);
      record.agentResults.esg = esgResult;
      await this.updatePhase(record, 4, 'completed', 'ESG分析完成', esgResult);

      await this.updatePhase(record, 5, 'processing', '合规尽调智能体正在分析...');
      const complianceResult = agentCompliance.analyze(assetData);
      record.agentResults.compliance = complianceResult;
      await this.updatePhase(record, 5, 'completed', '合规尽调完成', complianceResult);

      await this.updatePhase(record, 6, 'processing', '融资材料智能体正在生成...');
      const financingResult = agentFinancing.generate(assetData, financingScenario, complianceResult);
      record.agentResults.financingMaterial = financingResult;
      await this.updatePhase(record, 6, 'completed', '融资材料生成完成', financingResult);

      await this.updatePhase(record, 7, 'processing', '主审分析师正在整合报告...');
      const chiefReport = agentChief.synthesize({
        operations: operationsResult,
        cashFlow: cashFlowResult,
        risk: riskResult,
        esg: esgResult,
        compliance: complianceResult,
        financingMaterial: financingResult,
      }, assetData);
      record.agentResults.chiefReport = chiefReport;
      await this.updatePhase(record, 7, 'completed', '分析报告生成完成', chiefReport);

      record.status = 'completed';
      await record.save();

      console.log(`[RealEstate] Analysis completed for record: ${recordId}`);
      return record.agentResults;
    } catch (error) {
      console.error(`[RealEstate] Analysis failed:`, error.message);
      record.status = 'failed';
      record.error = error.message;
      await record.save();
      throw error;
    }
  }

  async updatePhase(record, phaseNum, status, message, result = null) {
    const existing = record.agentResults.phases.find(p => p.phase === phaseNum);
    if (existing) {
      existing.status = status;
      existing.message = message;
      if (result) existing.result = result;
    } else {
      record.agentResults.phases.push({
        phase: phaseNum,
        name: this.getPhaseName(phaseNum),
        status,
        message,
        result,
      });
    }
    record.markModified('agentResults');
    await record.save();
  }

  getPhaseName(phase) {
    const names = {
      1: '资产运营分析',
      2: '现金流预测',
      3: '风险评估',
      4: 'ESG与碳金融',
      5: '合规尽调',
      6: '融资材料',
      7: '主审报告',
    };
    return names[phase] || `阶段${phase}`;
  }

  getAgentList() {
    return [
      { key: 'operations', name: '资产运营智能体', icon: '🏢', description: '招商能力、运营效率、租户管理', phase: 1 },
      { key: 'cashFlow', name: '现金流预测智能体', icon: '💰', description: '现金流预测、压力测试、偿债指标', phase: 2 },
      { key: 'risk', name: '风险管理智能体', icon: '🛡️', description: '风险识别、量化评估、缓释策略', phase: 3 },
      { key: 'esg', name: 'ESG与碳金融智能体', icon: '🌱', description: '碳排放、绿色改造、ESG披露', phase: 4 },
      { key: 'compliance', name: '合规尽调智能体', icon: '📋', description: '合规检查、材料核验、融资适配', phase: 5 },
      { key: 'financing', name: '融资材料智能体', icon: '📄', description: '融资方案、材料生成、模板定制', phase: 6 },
      { key: 'chief', name: '主审分析师智能体', icon: '⚖️', description: '结论整合、分歧识别、报告生成', phase: 7 },
    ];
  }
}

export default new RealEstateOrchestrator();