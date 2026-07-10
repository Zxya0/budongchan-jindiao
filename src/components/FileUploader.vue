<template>
  <div class="file-uploader">
    <div
      class="upload-zone"
      :class="{ 'is-dragover': isDragover, 'is-uploading': uploading }"
      @dragover.prevent="isDragover = true"
      @dragleave.prevent="isDragover = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls,.csv,.pdf,.docx,.doc"
        style="display: none"
        @change="handleFileSelect"
      />

      <template v-if="!uploading && !parseResult">
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <p class="upload-text">拖拽文件到此处，或点击选择文件</p>
        <p class="upload-hint">支持 Excel、CSV、PDF、Word 格式，最大 20MB</p>
      </template>

      <!-- 上传进度 -->
      <template v-if="uploading">
        <el-icon class="upload-icon is-spin"><Loading /></el-icon>
        <p class="upload-text">正在解析文件...</p>
        <el-progress :percentage="progress" :stroke-width="6" style="width: 60%; margin-top: 12px" />
      </template>

      <!-- 解析结果 -->
      <template v-if="parseResult && !uploading">
        <el-icon class="upload-icon result-icon"><CircleCheckFilled /></el-icon>
        <p class="upload-text">{{ parseResult.meta.fileName }}</p>
        <p class="upload-hint">
          解析完成，提取到 {{ extractedCount }} 个字段
          <template v-if="lowConfCount > 0">
            ，<span class="warn-text">{{ lowConfCount }} 个需确认</span>
          </template>
        </p>
        <div class="upload-actions">
          <el-button size="small" text @click.stop="handleReupload">重新上传</el-button>
          <el-button size="small" type="primary" @click.stop="$emit('confirm', parseResult)">
            确认数据
          </el-button>
        </div>
      </template>
    </div>

    <!-- 错误提示 -->
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled, Loading, CircleCheckFilled } from '@element-plus/icons-vue'
import api from '../services/api'

const emit = defineEmits(['confirm'])

const fileInput = ref(null)
const isDragover = ref(false)
const uploading = ref(false)
const progress = ref(0)
const errorMsg = ref('')
const parseResult = ref(null)

const extractedCount = computed(() => {
  if (!parseResult.value) return 0
  return Object.values(parseResult.value.fields).filter(v => v !== undefined && v !== '').length
})

const lowConfCount = computed(() => {
  if (!parseResult.value) return 0
  return Object.keys(parseResult.value.lowConfidenceFields || {}).length
})

function triggerFileInput() {
  if (uploading.value) return
  fileInput.value?.click()
}

async function uploadFile(file) {
  if (!file) return

  errorMsg.value = ''
  uploading.value = true
  progress.value = 30

  try {
    // 模拟进度
    const progressTimer = setInterval(() => {
      if (progress.value < 90) progress.value += 10
    }, 200)

    const result = await api.uploadFile(file)

    clearInterval(progressTimer)
    progress.value = 100
    parseResult.value = result.data.data

    setTimeout(() => {
      uploading.value = false
    }, 500)
  } catch (err) {
    uploading.value = false
    progress.value = 0
    errorMsg.value = err.response?.data?.msg || '文件上传失败，请重试'
  }
}

function handleDrop(e) {
  isDragover.value = false
  const file = e.dataTransfer.files[0]
  if (file) uploadFile(file)
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) uploadFile(file)
  // 重置 input 以允许重复选择同一文件
  e.target.value = ''
}

function handleReupload() {
  parseResult.value = null
  errorMsg.value = ''
}
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.06);
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.upload-zone.is-dragover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.15);
}

.upload-zone.is-uploading {
  cursor: default;
  border-color: rgba(255, 255, 255, 0.2);
}

.upload-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}

.upload-icon.result-icon {
  color: #67c23a;
}

.upload-icon.is-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.upload-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  margin: 4px 0;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  margin: 4px 0;
}

.warn-text {
  color: #e6a23c;
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.error-msg {
  color: #f56c6c;
  font-size: 13px;
  text-align: center;
  margin-top: 8px;
}
</style>