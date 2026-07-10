<template>
  <div class="re-form-container">
    <div class="form-section">
      <h3 class="section-title">基本信息</h3>
      <div class="form-grid">
        <div class="form-group" :class="{ required: f.required }" v-for="f in basicFields" :key="f.key">
          <label class="form-label">{{ f.label }}<span v-if="f.required" class="required">*</span></label>
          <input
            v-model="form[f.key]"
            :type="f.type === 'number' ? 'number' : 'text'"
            :placeholder="f.placeholder"
            class="form-input"
            :class="{ 'is-error': errors[f.key] }"
            @input="clearError(f.key)"
          />
          <p v-if="errors[f.key]" class="field-error">{{ errors[f.key] }}</p>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">运营指标</h3>
      <div class="form-grid">
        <div class="form-group" v-for="f in operationFields" :key="f.key">
          <label class="form-label">{{ f.label }}</label>
          <input
            v-model="form[f.key]"
            :type="f.type === 'number' ? 'number' : 'text'"
            :placeholder="f.placeholder"
            class="form-input"
            :class="{ 'is-error': errors[f.key] }"
            @input="clearError(f.key)"
          />
          <span v-if="form[f.key] !== '' && form[f.key] !== undefined" class="field-hint">{{ f.hint }}</span>
          <p v-if="errors[f.key]" class="field-error">{{ errors[f.key] }}</p>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">财务数据</h3>
      <div class="form-grid">
        <div class="form-group" v-for="f in financialFields" :key="f.key">
          <label class="form-label">{{ f.label }}</label>
          <input
            v-model="form[f.key]"
            :type="f.type === 'number' ? 'number' : 'text'"
            :placeholder="f.placeholder"
            class="form-input"
            :class="{ 'is-error': errors[f.key] }"
            @input="clearError(f.key)"
          />
          <span v-if="form[f.key] !== '' && form[f.key] !== undefined" class="field-hint">{{ f.hint }}</span>
          <p v-if="errors[f.key]" class="field-error">{{ errors[f.key] }}</p>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">ESG与产权</h3>
      <div class="form-grid">
        <div class="form-group" v-for="f in esgFields" :key="f.key">
          <label class="form-label">{{ f.label }}</label>
          <input
            v-model="form[f.key]"
            :type="f.type === 'number' ? 'number' : 'text'"
            :placeholder="f.placeholder"
            class="form-input"
            :class="{ 'is-error': errors[f.key] }"
            @input="clearError(f.key)"
          />
          <span v-if="form[f.key] !== '' && form[f.key] !== undefined" class="field-hint">{{ f.hint }}</span>
          <p v-if="errors[f.key]" class="field-error">{{ errors[f.key] }}</p>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">融资意向</h3>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">融资场景</label>
          <select v-model="form.financingScenario" class="form-input">
            <option value="bankLoan">银行经营性物业贷款</option>
            <option value="abs">资产支持证券(ABS)</option>
            <option value="reits">公募REITs</option>
            <option value="insuranceDebt">保险资金债权投资</option>
            <option value="trust">信托融资</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">融资需求金额(万元)</label>
          <input
            v-model="form.financingAmount"
            type="number"
            placeholder="请输入融资需求金额"
            class="form-input"
          />
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-reset" @click="resetForm">重置表单</button>
      <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
        <el-icon v-if="submitting" class="is-loading"><Loading /></el-icon>
        {{ submitting ? '提交分析中...' : '启动七智能体分析' }}
      </button>
    </div>
    <p class="submit-hint">提交后将依次启动：资产运营 → 现金流预测 → 风险管理 → ESG碳金融 → 合规尽调 → 融资材料 → 主审分析师</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import api from '../services/api'

const emit = defineEmits(['submit'])

const form = ref({
  projectName: '',
  stockCode: '',
  assetType: '',
  location: '',
  city: '',
  totalArea: '',
  buildingArea: '',
  buildYear: '',
  floors: '',
  occupancyRate: '',
  averageRent: '',
  majorTenants: '',
  propertyValue: '',
  loanAmount: '',
  annualRevenue: '',
  annualExpense: '',
  netOperatingIncome: '',
  financingAmount: '',
  propertyType: '',
  landUseYears: '',
  remainingYears: '',
  annualEnergy: '',
  annualWater: '',
  greenCertification: '',
  propertyManagement: '',
  financingScenario: 'bankLoan',
})

const errors = ref({})
const submitting = ref(false)

const basicFields = [
  { key: 'projectName', label: '项目名称', type: 'string', required: true, placeholder: '如：XX大厦', hint: '' },
  { key: 'stockCode', label: '资产编号', type: 'string', required: true, placeholder: '资产唯一标识', hint: '' },
  { key: 'assetType', label: '资产类型', type: 'string', required: true, placeholder: '写字楼/商业综合体/产业园区', hint: '' },
  { key: 'location', label: '所在区域', type: 'string', required: true, placeholder: '如：北京市朝阳区CBD', hint: '' },
  { key: 'city', label: '所在城市', type: 'string', required: true, placeholder: '如：北京', hint: '' },
]

const operationFields = [
  { key: 'totalArea', label: '总建筑面积(㎡)', type: 'number', required: true, placeholder: '总建筑面积', hint: '平方米' },
  { key: 'buildingArea', label: '可租赁面积(㎡)', type: 'number', required: false, placeholder: '可租赁面积', hint: '平方米' },
  { key: 'buildYear', label: '建成年代', type: 'number', required: false, placeholder: '如：2015', hint: '年' },
  { key: 'floors', label: '楼层数', type: 'number', required: false, placeholder: '总楼层', hint: '层' },
  { key: 'occupancyRate', label: '出租率(%)', type: 'number', required: false, placeholder: '当前出租率', hint: '0-100%' },
  { key: 'averageRent', label: '平均租金(元/㎡/月)', type: 'number', required: false, placeholder: '平均月租金', hint: '元/㎡/月' },
  { key: 'majorTenants', label: '主要租户', type: 'string', required: false, placeholder: '逗号分隔', hint: '' },
]

const financialFields = [
  { key: 'propertyValue', label: '资产评估值(万元)', type: 'number', required: false, placeholder: '评估价值', hint: '万元' },
  { key: 'loanAmount', label: '贷款余额(万元)', type: 'number', required: false, placeholder: '当前贷款', hint: '万元' },
  { key: 'annualRevenue', label: '年营业收入(万元)', type: 'number', required: false, placeholder: '年收入', hint: '万元' },
  { key: 'annualExpense', label: '年运营支出(万元)', type: 'number', required: false, placeholder: '年支出', hint: '万元' },
  { key: 'netOperatingIncome', label: '净运营收入(万元)', type: 'number', required: false, placeholder: 'NOI', hint: '万元' },
]

const esgFields = [
  { key: 'propertyType', label: '产权性质', type: 'string', required: false, placeholder: '出让/划拨', hint: '' },
  { key: 'landUseYears', label: '土地使用年限(年)', type: 'number', required: false, placeholder: '使用年限', hint: '年' },
  { key: 'remainingYears', label: '剩余年限(年)', type: 'number', required: false, placeholder: '剩余年限', hint: '年' },
  { key: 'annualEnergy', label: '年能耗(kWh)', type: 'number', required: false, placeholder: '年电力消耗', hint: 'kWh' },
  { key: 'annualWater', label: '年用水量(吨)', type: 'number', required: false, placeholder: '年用水量', hint: '吨' },
  { key: 'greenCertification', label: '绿色认证', type: 'string', required: false, placeholder: 'LEED/绿建等', hint: '' },
  { key: 'propertyManagement', label: '物业管理公司', type: 'string', required: false, placeholder: '物业公司名称', hint: '' },
]

function clearError(key) {
  if (errors.value[key]) {
    delete errors.value[key]
  }
}

function validate() {
  const newErrors = {}
  // 必填项校验
  for (const f of basicFields) {
    if (f.required && !form.value[f.key]) {
      newErrors[f.key] = `${f.label}为必填项`
    }
  }
  if (!form.value.totalArea) {
    newErrors.totalArea = '总建筑面积为必填项'
  }

  // 数值范围校验
  const allFields = [...basicFields, ...operationFields, ...financialFields, ...esgFields]
  for (const f of allFields) {
    if (f.type === 'number' && form.value[f.key] !== '' && form.value[f.key] !== undefined) {
      const val = Number(form.value[f.key])
      if (isNaN(val)) {
        newErrors[f.key] = `${f.label}请输入有效数字`
      }
      if (f.key === 'occupancyRate' && (val < 0 || val > 100)) {
        newErrors[f.key] = '出租率应在0-100%之间'
      }
      if (f.key === 'buildYear' && (val < 1980 || val > 2026)) {
        newErrors[f.key] = '建成年代应在1980-2026之间'
      }
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    // 清理空值
    const submitData = {}
    for (const [key, val] of Object.entries(form.value)) {
      if (val !== '' && val !== undefined && val !== null) {
        submitData[key] = val
      }
    }

    const response = await api.submitRealEstateData(submitData)
    emit('submit', response.data.data)
  } catch (err) {
    console.error('Real estate submit error:', err)
    if (err.response?.data?.msg) {
      alert(err.response.data.msg)
    }
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.value = {
    projectName: '', stockCode: '', assetType: '', location: '', city: '',
    totalArea: '', buildingArea: '', buildYear: '', floors: '',
    occupancyRate: '', averageRent: '', majorTenants: '',
    propertyValue: '', loanAmount: '', annualRevenue: '', annualExpense: '',
    netOperatingIncome: '', financingAmount: '', propertyType: '',
    landUseYears: '', remainingYears: '', annualEnergy: '', annualWater: '',
    greenCertification: '', propertyManagement: '', financingScenario: 'bankLoan',
  }
  errors.value = {}
}
</script>

<style scoped>
.re-form-container {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-align: left;
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #FFD700;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.required {
  color: #f56c6c;
  margin-left: 2px;
}

.form-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #FFD700;
  background: rgba(255, 255, 255, 0.12);
}

.form-input.is-error {
  border-color: #f56c6c;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

select.form-input {
  cursor: pointer;
}

select.form-input option {
  background: #1a1c2c;
  color: #fff;
}

.field-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 2px;
}

.field-error {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 3px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.btn-reset {
  padding: 10px 28px;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-submit {
  padding: 10px 28px;
  border-radius: 25px;
  border: none;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1c2c;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-hint {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 12px;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>