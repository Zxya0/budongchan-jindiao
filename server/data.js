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

const REAL_ESTATE_FIELDS = [
  { key: 'projectName', label: '项目名称', type: 'string', required: true, placeholder: '请输入项目名称', hint: '项目名称' },
  { key: 'stockCode', label: '资产编号', type: 'string', required: true, placeholder: '请输入资产编号', hint: '资产唯一标识' },
  { key: 'assetType', label: '资产类型', type: 'string', required: true, placeholder: '如：写字楼、商业综合体、产业园区', hint: '选择资产类型' },
  { key: 'location', label: '所在区域', type: 'string', required: true, placeholder: '如：北京市朝阳区CBD', hint: '资产所在位置' },
  { key: 'city', label: '所在城市', type: 'string', required: true, placeholder: '如：北京', hint: '城市' },
  { key: 'totalArea', label: '总建筑面积(㎡)', type: 'number', required: true, placeholder: '请输入总建筑面积', min: 0, max: 1000000, hint: '总建筑面积，单位：平方米' },
  { key: 'buildingArea', label: '可租赁面积(㎡)', type: 'number', required: false, placeholder: '请输入可租赁面积', min: 0, max: 1000000, hint: '可租赁面积' },
  { key: 'buildYear', label: '建成年代', type: 'number', required: false, placeholder: '如：2015', min: 1980, max: 2026, hint: '建筑竣工年份' },
  { key: 'floors', label: '楼层数', type: 'number', required: false, placeholder: '请输入楼层数', min: 1, max: 200, hint: '总楼层数' },
  { key: 'occupancyRate', label: '出租率(%)', type: 'number', required: false, placeholder: '请输入出租率', min: 0, max: 100, hint: '当前出租率（0-100%）' },
  { key: 'averageRent', label: '平均租金(元/㎡/月)', type: 'number', required: false, placeholder: '请输入平均租金', min: 0, max: 2000, hint: '平均月租金' },
  { key: 'majorTenants', label: '主要租户', type: 'string', required: false, placeholder: '如：华为、腾讯、字节跳动', hint: '主要租户名称，逗号分隔' },
  { key: 'propertyValue', label: '资产评估值(万元)', type: 'number', required: false, placeholder: '请输入资产评估值', min: 0, max: 100000000, hint: '资产评估价值' },
  { key: 'loanAmount', label: '贷款余额(万元)', type: 'number', required: false, placeholder: '请输入贷款余额', min: 0, max: 100000000, hint: '当前贷款余额' },
  { key: 'annualRevenue', label: '年营业收入(万元)', type: 'number', required: false, placeholder: '请输入年营业收入', min: 0, max: 10000000, hint: '年营业收入' },
  { key: 'annualExpense', label: '年运营支出(万元)', type: 'number', required: false, placeholder: '请输入年运营支出', min: 0, max: 10000000, hint: '年运营支出' },
  { key: 'netOperatingIncome', label: '净运营收入(万元)', type: 'number', required: false, placeholder: '请输入净运营收入', min: -10000000, max: 10000000, hint: 'NOI净运营收入' },
  { key: 'financingAmount', label: '融资需求金额(万元)', type: 'number', required: false, placeholder: '请输入融资需求金额', min: 0, max: 10000000, hint: '期望融资金额' },
  { key: 'propertyType', label: '产权性质', type: 'string', required: false, placeholder: '如：出让/划拨', hint: '土地产权性质' },
  { key: 'landUseYears', label: '土地使用年限(年)', type: 'number', required: false, placeholder: '请输入土地使用年限', min: 0, max: 70, hint: '土地使用年限' },
  { key: 'remainingYears', label: '剩余年限(年)', type: 'number', required: false, placeholder: '请输入剩余年限', min: 0, max: 70, hint: '剩余土地使用年限' },
  { key: 'annualEnergy', label: '年能耗(kWh)', type: 'number', required: false, placeholder: '请输入年能耗量', min: 0, max: 100000000, hint: '年电力消耗量' },
  { key: 'annualWater', label: '年用水量(吨)', type: 'number', required: false, placeholder: '请输入年用水量', min: 0, max: 10000000, hint: '年用水量' },
  { key: 'greenCertification', label: '绿色认证', type: 'string', required: false, placeholder: '如：LEED金级/绿建三星', hint: '绿色建筑认证' },
  { key: 'propertyManagement', label: '物业管理公司', type: 'string', required: false, placeholder: '请输入物业公司名称', hint: '物业管理公司' },
  { key: 'financingScenario', label: '融资场景', type: 'string', required: false, placeholder: '如：bankLoan/abs/reits', hint: '融资场景选择' },
];

router.get('/fields', (req, res) => {
  const VALIDATION_RULES = {
    stockCode: { label: '股票代码', type: 'string', required: true },
    stockName: { label: '股票名称', type: 'string' },
    industry: { label: '行业', type: 'string' },
    marketSentiment: { label: '市场情绪', type: 'string' },
  };
  
  const fields = Object.entries(VALIDATION_RULES).map(([key, rules]) => ({
    key,
    label: rules.label,
    type: rules.type,
    required: rules.required || false,
    placeholder: `请输入${rules.label}`,
    hint: rules.message,
  }));

  res.json({ code: 200, data: { fields } });
});

router.get('/fields/real-estate', (req, res) => {
  res.json({ code: 200, data: { fields: REAL_ESTATE_FIELDS } });
});

router.post('/validate', (req, res) => {
  res.json({ code: 200, data: { valid: true, warnings: [] } });
});

router.post('/submit', async (req, res) => {
  try {
    const { stockCode, stockName, industry, marketSentiment, ...financialData } = req.body;

    const newRecord = new AnalysisRecord({
      stockCode,
      stockName: stockName || '',
      marketSentiment: marketSentiment || '',
      structuredData: {
        industry: industry || '',
        financial: financialData,
      },
      dataSource: 'manual_form',
      status: 'pending',
    });

    const savedRecord = await newRecord.save();

    res.json({
      code: 200,
      msg: '数据提交成功，分析已启动',
      data: { analysisId: savedRecord._id, warnings: [] },
    });
  } catch (err) {
    console.error('Submit error:', err.message);
    res.status(500).json({ code: 500, msg: '服务端错误' });
  }
});

router.post('/submit/real-estate', async (req, res) => {
  try {
    const data = req.body;

    if (!data.projectName && !data.stockCode) {
      return res.status(400).json({ code: 400, msg: '项目名称或资产编号为必填项' });
    }

    const warnings = [];
    for (const field of REAL_ESTATE_FIELDS) {
      if (field.type === 'number' && data[field.key] !== undefined && data[field.key] !== null && data[field.key] !== '') {
        const val = Number(data[field.key]);
        if (field.min !== undefined && val < field.min) {
          warnings.push(`${field.label}数值${val}低于合理范围(${field.min})`);
        }
        if (field.max !== undefined && val > field.max) {
          warnings.push(`${field.label}数值${val}超出合理范围(${field.max})`);
        }
      }
    }

    const newRecord = new AnalysisRecord({
      stockCode: data.stockCode || data.projectName,
      stockName: data.projectName || '',
      analysisType: 'real_estate',
      structuredData: {
        projectName: data.projectName,
        assetType: data.assetType,
        location: data.location,
        city: data.city,
        totalArea: data.totalArea ? Number(data.totalArea) : undefined,
        buildingArea: data.buildingArea ? Number(data.buildingArea) : undefined,
        buildYear: data.buildYear ? Number(data.buildYear) : undefined,
        floors: data.floors ? Number(data.floors) : undefined,
        occupancyRate: data.occupancyRate ? Number(data.occupancyRate) : undefined,
        averageRent: data.averageRent ? Number(data.averageRent) : undefined,
        majorTenants: typeof data.majorTenants === 'string' ? data.majorTenants.split(',').map(t => t.trim()) : data.majorTenants || [],
        propertyValue: data.propertyValue ? Number(data.propertyValue) : undefined,
        loanAmount: data.loanAmount ? Number(data.loanAmount) : undefined,
        annualRevenue: data.annualRevenue ? Number(data.annualRevenue) : undefined,
        annualExpense: data.annualExpense ? Number(data.annualExpense) : undefined,
        netOperatingIncome: data.netOperatingIncome ? Number(data.netOperatingIncome) : undefined,
        financingAmount: data.financingAmount ? Number(data.financingAmount) : undefined,
        propertyType: data.propertyType,
        landUseYears: data.landUseYears ? Number(data.landUseYears) : undefined,
        remainingYears: data.remainingYears ? Number(data.remainingYears) : undefined,
        annualEnergy: data.annualEnergy ? Number(data.annualEnergy) : undefined,
        annualWater: data.annualWater ? Number(data.annualWater) : undefined,
        greenCertification: data.greenCertification,
        propertyManagement: data.propertyManagement,
        financingScenario: data.financingScenario || 'bankLoan',
      },
      dataSource: 'manual_form',
      status: 'pending',
    });

    const savedRecord = await newRecord.save();

    const { default: orchestrator } = await import('./services/realEstateOrchestrator.js');
    orchestrator.startAnalysis(savedRecord._id, {
      financingScenario: data.financingScenario || 'bankLoan',
    }).catch(err => console.error('[RealEstate] Async error:', err.message));

    res.json({
      code: 200,
      msg: '不动产数据提交成功，分析已启动',
      data: { analysisId: savedRecord._id, analysisType: 'real_estate', warnings },
    });
  } catch (err) {
    console.error('Real estate submit error:', err.message);
    res.status(500).json({ code: 500, msg: '服务端错误' });
  }
});

export default router;