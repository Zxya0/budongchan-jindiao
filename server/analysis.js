import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

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

router.post('/', async (req, res) => {
  try {
    const { stockCode, riskProfile, marketSentiment } = req.body;
    if (!stockCode) {
      return res.status(400).json({ msg: 'Stock Code is required' });
    }

    const newRecord = new AnalysisRecord({
      stockCode,
      riskProfile: riskProfile || 'steady',
      marketSentiment: marketSentiment || '',
      analysisType: 'stock',
    });

    const savedRecord = await newRecord.save();
    res.json({ msg: 'Analysis started', data: { analysisId: savedRecord._id } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/real-estate', async (req, res) => {
  try {
    const {
      projectName, stockCode, assetType, location, city,
      totalArea, buildingArea, buildYear, floors,
      occupancyRate, averageRent, majorTenants,
      financingAmount, propertyValue, loanAmount,
      annualRevenue, annualExpense, netOperatingIncome,
      propertyType, landUseYears, remainingYears,
      annualEnergy, annualWater, greenCertification, propertyManagement,
      financingScenario, uploadedDocs,
    } = req.body;

    if (!projectName && !stockCode) {
      return res.status(400).json({ msg: '项目名称或资产编号为必填项' });
    }

    const newRecord = new AnalysisRecord({
      stockCode: stockCode || projectName,
      stockName: projectName || '',
      analysisType: 'real_estate',
      structuredData: {
        projectName, assetType, location, city,
        totalArea, buildingArea, buildYear, floors,
        occupancyRate, averageRent, majorTenants: majorTenants || [],
        financingAmount, propertyValue, loanAmount,
        annualRevenue, annualExpense, netOperatingIncome,
        propertyType, landUseYears, remainingYears,
        annualEnergy, annualWater, greenCertification, propertyManagement,
        financingScenario: financingScenario || 'bankLoan',
      },
    });

    const savedRecord = await newRecord.save();

    const { default: orchestrator } = await import('./services/realEstateOrchestrator.js');
    orchestrator.startAnalysis(savedRecord._id, {
      financingScenario: financingScenario || 'bankLoan',
      uploadedDocs: uploadedDocs || [],
    }).catch(err => {
      console.error('[RealEstate] Async analysis error:', err.message);
    });

    res.json({ msg: '不动产分析已启动', data: { analysisId: savedRecord._id, analysisType: 'real_estate' } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/agents', (req, res) => {
  res.json({
    data: [
      { key: 'operations', name: '资产运营智能体', icon: '🏢', phase: 1 },
      { key: 'cashflow', name: '现金流预测智能体', icon: '💰', phase: 2 },
      { key: 'risk', name: '风险管理智能体', icon: '🛡️', phase: 3 },
      { key: 'esg', name: 'ESG与碳金融智能体', icon: '🌱', phase: 4 },
      { key: 'compliance', name: '合规尽调智能体', icon: '📋', phase: 5 },
      { key: 'financing', name: '融资材料智能体', icon: '📁', phase: 6 },
      { key: 'chief', name: '主审分析师智能体', icon: '🎯', phase: 7 },
    ],
  });
});

router.get('/financing-scenarios', async (req, res) => {
  try {
    const scenarios = [
      { key: 'bankLoan', name: '银行经营性物业贷款', description: '适合稳定运营的成熟物业' },
      { key: 'abs', name: '资产支持证券(ABS)', description: '适合大规模资产池融资' },
      { key: 'reits', name: '公募REITs', description: '适合基础设施类资产' },
      { key: 'insurance', name: '保险资金债权投资', description: '适合长期持有型资产' },
      { key: 'trust', name: '信托融资', description: '灵活融资方案' },
    ];
    res.json({ data: scenarios });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await AnalysisRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ msg: 'Analysis not found' });
    }
    res.json({ data: record });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Analysis not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;