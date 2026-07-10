<template>
  <div class="entry-container">
    <div class="image-bg"></div>
    <div class="bg-overlay"></div>

    <div class="content-wrapper">
      <h1 class="title">Agent AI 不动产风险管理与可信融资尽调平台</h1>
      <p class="subtitle">Agent AI Real Estate Risk Management & Trusted Financing Due Diligence Platform</p>

      <!-- 模式切换 -->
      <div class="mode-tabs">
        <button
          class="mode-tab"
          :class="{ active: activeMode === 'quick' }"
          @click="activeMode = 'quick'"
        >
          <el-icon><Search /></el-icon> 快速搜索
        </button>
        <button
          class="mode-tab"
          :class="{ active: activeMode === 'form' }"
          @click="activeMode = 'form'"
        >
          <el-icon><EditPen /></el-icon> 结构化录入
        </button>
        <button
          class="mode-tab"
          :class="{ active: activeMode === 'upload' }"
          @click="activeMode = 'upload'"
        >
          <el-icon><Upload /></el-icon> 文件上传
        </button>
        <button
          class="mode-tab real-estate-tab"
          :class="{ active: activeMode === 'realestate' }"
          @click="activeMode = 'realestate'"
        >
          <el-icon><OfficeBuilding /></el-icon> 不动产尽调
        </button>
      </div>

      <!-- 模式说明 -->
      <p class="mode-desc">{{ modeDescription }}</p>

      <!-- 快速搜索模式 -->
      <div v-show="activeMode === 'quick'" class="mode-panel">
        <div class="search-bar-container">
          <div class="search-box">
            <input
              v-model="quickForm.stockCode"
              type="text"
              placeholder="输入股票名称或代码 (如: 600519)"
              class="search-input"
              @keyup.enter="handleQuickSearch"
            />
            <button class="search-btn" @click="handleQuickSearch" :disabled="quickLoading">
              <el-icon v-if="!quickLoading"><Search /></el-icon>
              <el-icon v-else class="is-loading"><Loading /></el-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- 结构化表单模式 -->
      <div v-show="activeMode === 'form'" class="mode-panel form-panel">
        <StockForm ref="stockFormRef" @submit="handleFormSubmit" />
      </div>

      <!-- 文件上传模式 -->
      <div v-show="activeMode === 'upload'" class="mode-panel">
        <FileUploader @confirm="handleFileConfirm" />
      </div>

      <!-- 不动产尽调模式 -->
      <div v-show="activeMode === 'realestate'" class="mode-panel real-estate-panel">
        <RealEstateForm ref="reFormRef" @submit="handleRealEstateSubmit" />
      </div>

      <!-- 低置信度确认弹窗 -->
      <el-dialog
        v-model="showConfirmDialog"
        title="确认识别结果"
        width="600px"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <div class="confirm-intro">
          以下字段置信度较低，请确认或修改后提交：
        </div>
        <div class="confirm-fields">
          <div v-for="(info, key) in lowConfFields" :key="key" class="confirm-field">
            <label class="confirm-label">{{ fieldLabelMap[key] || key }}</label>
            <input
              v-model="confirmedFields[key]"
              class="form-input"
              :class="{ 'low-conf': info.confidence < 0.7 }"
            />
            <span class="conf-badge" :class="info.confidence < 0.5 ? 'low' : 'mid'">
              {{ (info.confidence * 100).toFixed(0) }}%
            </span>
          </div>
        </div>
        <template #footer>
          <el-button @click="showConfirmDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmSubmit">确认并提交</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalysisStore } from '../stores/analysis'
import { Search, Loading, EditPen, Upload, OfficeBuilding } from '@element-plus/icons-vue'
import StockForm from '../components/StockForm.vue'
import FileUploader from '../components/FileUploader.vue'
import RealEstateForm from '../components/RealEstateForm.vue'

const router = useRouter()
const store = useAnalysisStore()

const activeMode = ref('quick')
const quickLoading = ref(false)
const formLoading = ref(false)

const quickForm = ref({ stockCode: '' })

const stockFormRef = ref(null)
const showConfirmDialog = ref(false)
const lowConfFields = ref({})
const confirmedFields = ref({})
const currentParseResult = ref(null)

const modeDescription = computed(() => {
  const map = {
    quick: '输入股票代码，AI 自动搜索全网数据进行分析',
    form: '逐项填写股票财务数据，获取更精准的分析结果',
    upload: '上传 Excel、PDF 等文件，自动提取股票数据',
    realestate: '填写不动产资产数据，启动七智能体专业尽调分析',
  }
  return map[activeMode.value]
})

const fieldLabelMap = {
  stockCode: '股票代码',
  stockName: '股票名称',
  currentPrice: '当前股价',
  pe: '市盈率',
  pb: '市净率',
  marketCap: '总市值',
  revenue: '营业收入',
  netProfit: '净利润',
  revenueGrowth: '营收增长率',
  profitGrowth: '利润增长率',
  roe: 'ROE',
  debtRatio: '资产负债率',
  eps: '每股收益',
  dividend: '股息率',
  industry: '所属行业',
  marketSentiment: '市场情绪',
}

// 快速搜索
async function handleQuickSearch() {
  if (!quickForm.value.stockCode) return
  quickLoading.value = true
  try {
    await store.startAnalysis(quickForm.value.stockCode, '', '')
    router.push('/stage')
  } catch (e) {
    console.error(e)
  } finally {
    quickLoading.value = false
  }
}

// 结构化表单提交
async function handleFormSubmit(data) {
  router.push('/stage')
}

// 文件解析确认
function handleFileConfirm(parseResult) {
  currentParseResult.value = parseResult
  lowConfFields.value = parseResult.lowConfidenceFields || {}

  // 初始化确认字段
  confirmedFields.value = { ...parseResult.fields }

  if (Object.keys(lowConfFields.value).length > 0) {
    showConfirmDialog.value = true
  } else {
    // 无低置信度字段，直接提交
    submitFormFromParse(parseResult.fields)
  }
}

// 确认低置信度字段后提交
async function handleConfirmSubmit() {
  showConfirmDialog.value = false
  submitFormFromParse(confirmedFields.value)
}

// 用解析结果提交表单数据
async function submitFormFromParse(fields) {
  formLoading.value = true
  try {
    await store.startAnalysisFromForm(fields)
    router.push('/stage')
  } catch (e) {
    console.error(e)
  } finally {
    formLoading.value = false
  }
}

// 不动产尽调提交
async function handleRealEstateSubmit(result) {
  store.analysisType = 'real_estate'
  store.currentAnalysisId = result.analysisId
  store.status = 'processing'
  store.pollRealEstateStatus()
  router.push({ path: '/real-estate-stage', query: { id: result.analysisId } })
}
</script>

<style scoped>
.entry-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1c2c;
  color: white;
  position: relative;
  overflow: auto;
  padding: 40px 20px;
  box-sizing: border-box;
}

.image-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/背景/微信图片_20260619220517_136_30.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.bg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  z-index: 1;
}

.content-wrapper {
  text-align: center;
  width: 100%;
  max-width: 800px;
  padding: 20px;
  position: relative;
  z-index: 2;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  line-height: 1.3;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
  font-weight: 300;
  letter-spacing: 1px;
}

/* 模式切换 */
.mode-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
}

.mode-tab:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.mode-tab.active {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  color: #FFD700;
}

.mode-tab.real-estate-tab.active {
  background: rgba(0, 200, 150, 0.2);
  border-color: #00c896;
  color: #00c896;
}

.mode-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin-bottom: 20px;
}

/* 面板 */
.mode-panel {
  transition: all 0.3s;
}

.form-panel {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 4px;
}

.real-estate-panel {
  max-height: 65vh;
  overflow-y: auto;
  padding: 0 4px;
}

/* 滚动条 */
.form-panel::-webkit-scrollbar,
.real-estate-panel::-webkit-scrollbar {
  width: 4px;
}
.form-panel::-webkit-scrollbar-track,
.real-estate-panel::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
  border-radius: 2px;
}
.form-panel::-webkit-scrollbar-thumb,
.real-estate-panel::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

/* 快速搜索 */
.search-bar-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  padding: 10px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  transition: transform 0.3s, box-shadow 0.3s;
  max-width: 600px;
  margin: 0 auto;
}

.search-bar-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  background: rgba(255, 255, 255, 0.2);
}

.search-box {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 10px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  height: 100%;
  font-size: 1.3rem;
  color: white;
  padding: 0 20px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
}

.search-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #FFD700;
  color: #1a1c2c;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.search-btn:hover {
  transform: scale(1.1);
  background: #fff;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 确认弹窗 */
.confirm-intro {
  color: #e6a23c;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 10px;
  background: rgba(230, 162, 60, 0.1);
  border-radius: 6px;
}

.confirm-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirm-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirm-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.confirm-field .form-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.confirm-field .form-input:focus {
  border-color: #409eff;
}

.confirm-field .form-input.low-conf {
  border-color: #e6a23c;
  background: rgba(230, 162, 60, 0.05);
}

.conf-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.conf-badge.mid {
  background: rgba(230, 162, 60, 0.15);
  color: #e6a23c;
}

.conf-badge.low {
  background: rgba(245, 108, 108, 0.15);
  color: #f56c6c;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }
  .subtitle {
    font-size: 0.85rem;
  }
  .mode-tabs {
    flex-direction: column;
    align-items: center;
  }
}
</style>