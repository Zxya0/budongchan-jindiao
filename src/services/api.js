import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 文件上传专用 client（multipart/form-data）
const uploadClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default {
  // 原有分析接口
  startAnalysis(payload) {
    return apiClient.post('/analysis', payload);
  },
  getAnalysisStatus(id) {
    return apiClient.get(`/analysis/${id}`);
  },

  // 文件上传解析
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return uploadClient.post('/upload/parse', formData);
  },

  // 确认低置信度字段
  confirmFields(parseId, confirmedFields) {
    return apiClient.post('/upload/confirm', { parseId, confirmedFields });
  },

  // 获取表单字段定义
  getFieldDefinitions() {
    return apiClient.get('/data/fields');
  },

  // 仅校验不提交
  validateData(data) {
    return apiClient.post('/data/validate', data);
  },

  // 提交结构化表单数据
  submitFormData(data) {
    return apiClient.post('/data/submit', data);
  },

  // 不动产相关 API
  // 获取不动产字段定义
  getRealEstateFields() {
    return apiClient.get('/data/fields/real-estate');
  },
  // 提交不动产表单数据
  submitRealEstateData(data) {
    return apiClient.post('/data/submit/real-estate', data);
  },
  // 启动不动产分析
  startRealEstateAnalysis(data) {
    return apiClient.post('/analysis/real-estate', data);
  },
  // 获取智能体列表
  getAgentList() {
    return apiClient.get('/analysis/agents');
  },
  // 获取融资场景
  getFinancingScenarios() {
    return apiClient.get('/analysis/financing-scenarios');
  },
};
