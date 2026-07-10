<template>
  <div class="re-stage-container">
    <div class="image-bg"></div>
    <div class="bg-overlay"></div>

    <div class="stage-content">
      <!-- 页面标题 -->
      <div class="stage-header">
        <button class="btn-back-home" @click="$router.push('/')">← 返回首页</button>
        <h1 class="stage-title">不动产智能尽调分析</h1>
        <p class="stage-subtitle">七智能体专业分析 | 投资决策委员会模式</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="store.status === 'processing'" class="loading-section">
        <div class="loading-spinner"></div>
        <p class="loading-text">智能体分析进行中...</p>

        <!-- 进度条 -->
        <div class="phase-progress">
          <div
            v-for="agent in agents"
            :key="agent.key"
            class="phase-item"
            :class="{
              completed: isPhaseCompleted(agent.phase),
              active: isPhaseActive(agent.phase),
            }"
          >
            <div class="phase-icon">{{ agent.icon }}</div>
            <div class="phase-name">{{ agent.name }}</div>
            <div class="phase-dot" :class="{ done: isPhaseCompleted(agent.phase), current: isPhaseActive(agent.phase) }"></div>
          </div>
        </div>
      </div>

      <!-- 完成状态 -->
      <div v-if="store.status === 'completed' && store.agentResults" class="results-section">
        <!-- 主审报告 -->
        <div v-if="store.agentResults.chiefReport" class="report-card chief-report">
          <div class="report-header">
            <span class="report-icon">⚖️</span>
            <h2>主审分析师综合报告</h2>
            <span v-if="store.agentResults.chiefReport.assetRating" class="rating-badge" :class="ratingClass">
              {{ store.agentResults.chiefReport.assetRating.level }}
            </span>
          </div>

          <div class="exec-summary" v-if="store.agentResults.chiefReport.executiveSummary">
            <h3>执行摘要</h3>
            <p>{{ store.agentResults.chiefReport.executiveSummary }}</p>
          </div>

          <div class="findings-grid" v-if="store.agentResults.chiefReport.coreFindings">
            <div class="finding-card highlights">
              <h4>亮点与优势</h4>
              <ul>
                <li v-for="item in store.agentResults.chiefReport.coreFindings.highlights" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="finding-card weaknesses">
              <h4>弱项与不足</h4>
              <ul>
                <li v-for="item in store.agentResults.chiefReport.coreFindings.weaknesses" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>

          <div class="risk-section" v-if="store.agentResults.chiefReport.riskTop5?.length">
            <h3>Top 5 风险提示</h3>
            <div class="risk-list">
              <div v-for="r in store.agentResults.chiefReport.riskTop5" :key="r.rank" class="risk-item">
                <span class="risk-rank">#{{ r.rank }}</span>
                <span class="risk-name">{{ r.risk }}</span>
                <span class="risk-severity" :class="r.severity">{{ r.severity }}</span>
                <span class="risk-mitigation">{{ r.mitigation }}</span>
              </div>
            </div>
          </div>

          <div class="financing-section" v-if="store.agentResults.chiefReport.financingRecommendation">
            <h3>融资建议</h3>
            <p><strong>推荐渠道：</strong>{{ store.agentResults.chiefReport.financingRecommendation.channel }}</p>
            <p><strong>理由：</strong>{{ store.agentResults.chiefReport.financingRecommendation.rationale }}</p>
          </div>

          <div class="investment-section" v-if="store.agentResults.chiefReport.investmentRecommendation">
            <h3>投资建议</h3>
            <span class="invest-level" :class="investLevelClass">
              {{ store.agentResults.chiefReport.investmentRecommendation.level }}
            </span>
            <p v-if="store.agentResults.chiefReport.investmentRecommendation.conditions">
              <strong>条件：</strong>{{ store.agentResults.chiefReport.investmentRecommendation.conditions }}
            </p>
          </div>
        </div>

        <!-- 各智能体分析卡片 -->
        <div class="agent-cards">
          <div class="agent-card" v-if="store.agentResults.operations">
            <div class="card-header">
              <span class="card-icon">🏢</span>
              <h4>资产运营分析</h4>
              <span class="card-score">{{ store.agentResults.operations.overallScore || '-' }}分</span>
            </div>
            <div class="card-body">
              <p>{{ store.agentResults.operations.summary || '分析完成' }}</p>
            </div>
          </div>

          <div class="agent-card" v-if="store.agentResults.cashFlow">
            <div class="card-header">
              <span class="card-icon">💰</span>
              <h4>现金流预测</h4>
              <span class="card-score">{{ store.agentResults.cashFlow.overallScore || '-' }}分</span>
            </div>
            <div class="card-body">
              <p>{{ store.agentResults.cashFlow.summary || '分析完成' }}</p>
              <div v-if="store.agentResults.cashFlow.debtMetrics" class="debt-metrics">
                <span>DSCR: {{ store.agentResults.cashFlow.debtMetrics.dscr || 'N/A' }}</span>
                <span>LTV: {{ store.agentResults.cashFlow.debtMetrics.ltv || 'N/A' }}%</span>
              </div>
            </div>
          </div>

          <div class="agent-card" v-if="store.agentResults.risk">
            <div class="card-header">
              <span class="card-icon">🛡️</span>
              <h4>风险评估</h4>
              <span class="card-score">{{ store.agentResults.risk.overallRiskScore || '-' }}分</span>
            </div>
            <div class="card-body">
              <p>{{ store.agentResults.risk.summary || '分析完成' }}</p>
            </div>
          </div>

          <div class="agent-card" v-if="store.agentResults.esg">
            <div class="card-header">
              <span class="card-icon">🌱</span>
              <h4>ESG与碳金融</h4>
              <span class="card-score">{{ store.agentResults.esg.esgScore || '-' }}分</span>
            </div>
            <div class="card-body">
              <p>{{ store.agentResults.esg.summary || '分析完成' }}</p>
            </div>
          </div>

          <div class="agent-card" v-if="store.agentResults.compliance">
            <div class="card-header">
              <span class="card-icon">📋</span>
              <h4>合规尽调</h4>
              <span class="card-score">{{ store.agentResults.compliance.complianceScore || '-' }}分</span>
            </div>
            <div class="card-body">
              <p>{{ store.agentResults.compliance.summary || '分析完成' }}</p>
            </div>
          </div>

          <div class="agent-card" v-if="store.agentResults.financingMaterial">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <h4>融资材料</h4>
            </div>
            <div class="card-body">
              <p>{{ store.agentResults.financingMaterial.summary || '材料已生成' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 失败状态 -->
      <div v-if="store.status === 'failed'" class="error-section">
        <p class="error-text">分析失败，请返回重试</p>
        <button class="btn-back" @click="$router.push('/')">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAnalysisStore } from '../stores/analysis'
import api from '../services/api'

const store = useAnalysisStore()
const route = useRoute()

onMounted(async () => {
  const analysisId = route.query.id || store.currentAnalysisId
  if (!analysisId) return

  store.currentAnalysisId = analysisId
  store.analysisType = 'real_estate'

  try {
    const response = await api.getAnalysisStatus(analysisId)
    const record = response.data.data

    if (record.status === 'completed') {
      store.status = 'completed'
      store.agentResults = record.agentResults || {}
    } else if (record.status === 'processing') {
      store.status = 'processing'
      store.pollRealEstateStatus()
    } else if (record.status === 'failed') {
      store.status = 'failed'
    }
  } catch (err) {
    console.error('Load analysis status error:', err)
  }
})

const agents = [
  { key: 'operations', name: '资产运营', icon: '🏢', phase: 1 },
  { key: 'cashFlow', name: '现金流预测', icon: '💰', phase: 2 },
  { key: 'risk', name: '风险管理', icon: '🛡️', phase: 3 },
  { key: 'esg', name: 'ESG碳金融', icon: '🌱', phase: 4 },
  { key: 'compliance', name: '合规尽调', icon: '📋', phase: 5 },
  { key: 'financing', name: '融资材料', icon: '📄', phase: 6 },
  { key: 'chief', name: '主审报告', icon: '⚖️', phase: 7 },
]

function isPhaseCompleted(phase) {
  const phases = store.agentResults?.phases || []
  return phases.some(p => p.phase === phase && p.status === 'completed')
}

function isPhaseActive(phase) {
  const phases = store.agentResults?.phases || []
  return phases.some(p => p.phase === phase && p.status === 'processing')
}

const ratingClass = computed(() => {
  const level = store.agentResults?.chiefReport?.assetRating?.level
  if (!level) return ''
  if (['A', 'B'].includes(level)) return 'rating-good'
  if (['C'].includes(level)) return 'rating-mid'
  return 'rating-bad'
})

const investLevelClass = computed(() => {
  const level = store.agentResults?.chiefReport?.investmentRecommendation?.level
  if (!level) return ''
  if (level.includes('推荐') && !level.includes('不')) return 'invest-good'
  if (level.includes('谨慎')) return 'invest-mid'
  return 'invest-bad'
})
</script>

<style scoped>
.re-stage-container {
  height: 100vh;
  width: 100%;
  background: #1a1c2c;
  color: #fff;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.image-bg {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-image: url('/背景/微信图片_20260619220517_136_30.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.bg-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  z-index: 1;
}

.stage-content {
  position: relative;
  z-index: 2;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.stage-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.btn-back-home {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back-home:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.3);
}

.stage-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.stage-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
}

/* 加载 */
.loading-section {
  text-align: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #00c896;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  font-size: 16px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 30px;
}

/* 进度条 */
.phase-progress {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.phase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.3;
  transition: all 0.5s;
  min-width: 70px;
}

.phase-item.completed { opacity: 0.8; }
.phase-item.active { opacity: 1; }

.phase-icon { font-size: 24px; }
.phase-name { font-size: 11px; color: rgba(255,255,255,0.6); }

.phase-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
}

.phase-dot.done { background: #00c896; border-color: #00c896; }
.phase-dot.current {
  background: transparent;
  border-color: #00c896;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,200,150,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0,200,150,0); }
}

/* 结果 */
.results-section { margin-top: 20px; }

.report-card {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 24px;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.report-icon { font-size: 28px; }
.report-header h2 { font-size: 20px; margin: 0; flex: 1; }

.rating-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 700;
}

.rating-good { background: rgba(0,200,150,0.2); color: #00c896; }
.rating-mid { background: rgba(255,215,0,0.2); color: #FFD700; }
.rating-bad { background: rgba(245,108,108,0.2); color: #f56c6c; }

.exec-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  border-left: 3px solid #FFD700;
}

.exec-summary h3 { font-size: 16px; color: #FFD700; margin: 0 0 10px; }
.exec-summary p { font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.7; }

.findings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.finding-card {
  padding: 16px;
  border-radius: 10px;
  background: rgba(255,255,255,0.03);
}

.finding-card h4 { font-size: 14px; margin: 0 0 10px; }
.finding-card ul { margin: 0; padding-left: 18px; font-size: 13px; color: rgba(255,255,255,0.7); }
.finding-card li { margin-bottom: 4px; line-height: 1.5; }

.highlights { border-left: 3px solid #00c896; }
.highlights h4 { color: #00c896; }
.weaknesses { border-left: 3px solid #e6a23c; }
.weaknesses h4 { color: #e6a23c; }

.risk-section, .financing-section, .investment-section {
  margin-bottom: 20px;
}

.risk-section h3, .financing-section h3, .investment-section h3 {
  font-size: 16px;
  color: #FFD700;
  margin: 0 0 12px;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  font-size: 13px;
}

.risk-rank { font-weight: 700; color: #f56c6c; min-width: 24px; }
.risk-severity {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: rgba(245,108,108,0.2);
  color: #f56c6c;
}

.invest-level {
  display: inline-block;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
}
.invest-good { background: rgba(0,200,150,0.2); color: #00c896; }
.invest-mid { background: rgba(255,215,0,0.2); color: #FFD700; }
.invest-bad { background: rgba(245,108,108,0.2); color: #f56c6c; }

.financing-section p, .investment-section p {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin: 6px 0;
}

/* 智能体卡片 */
.agent-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.agent-card {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  overflow: hidden;
  transition: all 0.3s;
}

.agent-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.card-icon { font-size: 20px; }
.card-header h4 { font-size: 14px; margin: 0; flex: 1; }
.card-score { font-size: 13px; color: #00c896; font-weight: 600; }

.card-body {
  padding: 14px 16px;
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
}

.debt-metrics {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: #FFD700;
}

/* 错误 */
.error-section {
  text-align: center;
  padding: 100px 0;
}

.error-text {
  font-size: 18px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.btn-back {
  padding: 10px 30px;
  border-radius: 25px;
  border: 1px solid rgba(255,255,255,0.3);
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 768px) {
  .findings-grid { grid-template-columns: 1fr; }
  .agent-cards { grid-template-columns: 1fr; }
  .stage-title { font-size: 1.5rem; }
}
</style>