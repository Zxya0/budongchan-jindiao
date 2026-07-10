<template>
  <div class="stock-form">
    <div class="form-row">
      <div class="form-group" :class="{ 'is-error': errors.stockCode }">
        <label class="form-label">股票代码 <span class="required">*</span></label>
        <input
          v-model="form.stockCode"
          class="form-input"
          placeholder="6位数字代码（如 600519）"
          maxlength="6"
          @input="clearFieldError('stockCode')"
        />
        <p v-if="errors.stockCode" class="field-error">{{ errors.stockCode[0] }}</p>
      </div>
      <div class="form-group">
        <label class="form-label">股票名称</label>
        <input v-model="form.stockName" class="form-input" placeholder="如 贵州茅台" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">所属行业</label>
        <input v-model="form.industry" class="form-input" placeholder="如 白酒、新能源" />
      </div>
      <div class="form-group">
        <label class="form-label">市场情绪</label>
        <select v-model="form.marketSentiment" class="form-input">
          <option value="">请选择</option>
          <option value="乐观">乐观</option>
          <option value="中性">中性</option>
          <option value="悲观">悲观</option>
        </select>
      </div>
    </div>

    <div class="section-title">财务数据</div>

    <div class="form-row">
      <div class="form-group" :class="{ 'is-error': errors.currentPrice }">
        <label class="form-label">当前股价(元)</label>
        <input v-model="form.currentPrice" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.currentPrice" class="field-error">{{ errors.currentPrice[0] }}</p>
      </div>
      <div class="form-group" :class="{ 'is-error': errors.marketCap }">
        <label class="form-label">总市值(亿)</label>
        <input v-model="form.marketCap" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.marketCap" class="field-error">{{ errors.marketCap[0] }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group" :class="{ 'is-error': errors.pe }">
        <label class="form-label">市盈率(PE)</label>
        <input v-model="form.pe" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.pe" class="field-error">{{ errors.pe[0] }}</p>
      </div>
      <div class="form-group" :class="{ 'is-error': errors.pb }">
        <label class="form-label">市净率(PB)</label>
        <input v-model="form.pb" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.pb" class="field-error">{{ errors.pb[0] }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group" :class="{ 'is-error': errors.revenue }">
        <label class="form-label">营业收入(亿)</label>
        <input v-model="form.revenue" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.revenue" class="field-error">{{ errors.revenue[0] }}</p>
      </div>
      <div class="form-group" :class="{ 'is-error': errors.netProfit }">
        <label class="form-label">净利润(亿)</label>
        <input v-model="form.netProfit" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.netProfit" class="field-error">{{ errors.netProfit[0] }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group" :class="{ 'is-error': errors.revenueGrowth }">
        <label class="form-label">营收增长率(%)</label>
        <input v-model="form.revenueGrowth" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.revenueGrowth" class="field-error">{{ errors.revenueGrowth[0] }}</p>
      </div>
      <div class="form-group" :class="{ 'is-error': errors.profitGrowth }">
        <label class="form-label">利润增长率(%)</label>
        <input v-model="form.profitGrowth" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.profitGrowth" class="field-error">{{ errors.profitGrowth[0] }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group" :class="{ 'is-error': errors.roe }">
        <label class="form-label">ROE(%)</label>
        <input v-model="form.roe" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.roe" class="field-error">{{ errors.roe[0] }}</p>
      </div>
      <div class="form-group" :class="{ 'is-error': errors.debtRatio }">
        <label class="form-label">资产负债率(%)</label>
        <input v-model="form.debtRatio" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.debtRatio" class="field-error">{{ errors.debtRatio[0] }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group" :class="{ 'is-error': errors.eps }">
        <label class="form-label">每股收益(EPS)</label>
        <input v-model="form.eps" class="form-input" type="number" step="0.001" placeholder="0.000" />
        <p v-if="errors.eps" class="field-error">{{ errors.eps[0] }}</p>
      </div>
      <div class="form-group" :class="{ 'is-error': errors.dividend }">
        <label class="form-label">股息率(%)</label>
        <input v-model="form.dividend" class="form-input" type="number" step="0.01" placeholder="0.00" />
        <p v-if="errors.dividend" class="field-error">{{ errors.dividend[0] }}</p>
      </div>
    </div>

    <!-- 校验警告 -->
    <div v-if="warnings.length > 0" class="warnings-box">
      <el-icon><WarningFilled /></el-icon>
      <div>
        <p v-for="(w, i) in warnings" :key="i" class="warn-item">{{ w.message }}</p>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="form-actions">
      <el-button type="primary" size="large" :disabled="!canSubmit" @click="handleSubmit" :loading="submitting">
        <el-icon><Check /></el-icon> 提交并开始分析
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { WarningFilled, Check } from '@element-plus/icons-vue'
import api from '../services/api'

const emit = defineEmits(['submit'])

const form = ref({
  stockCode: '',
  stockName: '',
  industry: '',
  marketSentiment: '',
  currentPrice: '',
  marketCap: '',
  pe: '',
  pb: '',
  revenue: '',
  netProfit: '',
  revenueGrowth: '',
  profitGrowth: '',
  roe: '',
  debtRatio: '',
  eps: '',
  dividend: '',
})

const errors = ref({})
const warnings = ref([])
const submitting = ref(false)

const canSubmit = computed(() => {
  return form.value.stockCode && form.value.stockCode.length === 6
})

// 接收文件解析结果填充表单
function fillFromParse(parseResult) {
  const fields = parseResult.fields
  const mapping = {
    stockCode: 'stockCode',
    stockName: 'stockName',
    industry: 'industry',
    marketSentiment: 'marketSentiment',
    currentPrice: 'currentPrice',
    marketCap: 'marketCap',
    pe: 'pe',
    pb: 'pb',
    revenue: 'revenue',
    netProfit: 'netProfit',
    revenueGrowth: 'revenueGrowth',
    profitGrowth: 'profitGrowth',
    roe: 'roe',
    debtRatio: 'debtRatio',
    eps: 'eps',
    dividend: 'dividend',
  }

  for (const [key, fieldKey] of Object.entries(mapping)) {
    if (fields[fieldKey] !== undefined && fields[fieldKey] !== '') {
      form.value[key] = fields[fieldKey]
    }
  }

  // 标记低置信度字段
  if (parseResult.lowConfidenceFields) {
    for (const [key, info] of Object.entries(parseResult.lowConfidenceFields)) {
      const mapped = Object.keys(mapping).find(k => mapping[k] === key)
      if (mapped && info.confidence < 0.7) {
        warnings.value.push({ field: mapped, message: `${info.label}: 置信度 ${(info.confidence * 100).toFixed(0)}%，请人工确认` })
      }
    }
  }
}

// 前端本地校验
async function validate() {
  errors.value = {}
  warnings.value = []

  // 股票代码必填
  if (!form.value.stockCode) {
    errors.value.stockCode = ['股票代码为必填项']
    return false
  }
  if (!/^\d{6}$/.test(form.value.stockCode)) {
    errors.value.stockCode = ['请输入6位数字股票代码']
    return false
  }

  // 数值范围校验
  const numericFields = {
    currentPrice: { min: 0.01, max: 100000 },
    marketCap: { min: 0, max: 1000000 },
    pe: { min: -1000, max: 10000 },
    pb: { min: -100, max: 1000 },
    revenue: { min: 0, max: 100000 },
    netProfit: { min: -100000, max: 100000 },
    revenueGrowth: { min: -100, max: 10000 },
    profitGrowth: { min: -1000, max: 100000 },
    roe: { min: -200, max: 200 },
    debtRatio: { min: 0, max: 100 },
    eps: { min: -1000, max: 10000 },
    dividend: { min: 0, max: 50 },
  }

  for (const [key, range] of Object.entries(numericFields)) {
    const val = form.value[key]
    if (val !== '' && val !== undefined && val !== null) {
      const num = parseFloat(val)
      if (isNaN(num) || num < range.min || num > range.max) {
        errors.value[key] = [`值应在${range.min}~${range.max}之间`]
      }
    }
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  const valid = await validate()
  if (!valid) return

  submitting.value = true
  try {
    const result = await api.submitFormData(form.value)
    emit('submit', result.data.data)
  } catch (err) {
    const data = err.response?.data?.data
    if (data?.fieldErrors) {
      errors.value = data.fieldErrors
    }
    if (data?.warnings) {
      warnings.value = data.warnings
    }
  } finally {
    submitting.value = false
  }
}

function clearFieldError(key) {
  if (errors.value[key]) {
    const newErrors = { ...errors.value }
    delete newErrors[key]
    errors.value = newErrors
  }
}

defineExpose({ fillFromParse })
</script>

<style scoped>
.stock-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.form-group {
  flex: 1;
  min-width: 0;
}

.form-group.is-error .form-input {
  border-color: #f56c6c;
}

.form-label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  margin-bottom: 4px;
}

.required {
  color: #f56c6c;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
  background: rgba(255, 255, 255, 0.12);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.field-error {
  color: #f56c6c;
  font-size: 12px;
  margin: 2px 0 0;
}

.section-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.warnings-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(230, 162, 60, 0.15);
  border: 1px solid rgba(230, 162, 60, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  color: #e6a23c;
  font-size: 13px;
}

.warn-item {
  margin: 2px 0;
}

.form-actions {
  margin-top: 24px;
  text-align: center;
}
</style>