<template>
  <PageContainer>
    <template #header>
      <PageHeader
        :title="$t('pages.mtrTest')"
        :loading="loading"
        @start-test="startTest"
        @clear-results="clearResults"
        @from-favorites="showFavorites = true"
      />
    </template>

    <!-- MTR 工具状态显示 -->
    <el-card class="mtr-status-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ getToolDisplayName() }} 工具状态</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="checkMtrStatus"
            :loading="statusLoading"
          >
            刷新状态
          </el-button>
        </div>
      </template>
      
      <div class="status-content">
        <div v-if="mtrStatus.status === 'ready'" class="status-item status-ready">
          <div class="status-title">
            <el-icon><SuccessFilled /></el-icon>
            <span>{{ getToolDisplayName() }} 工具已安装且可用</span>
          </div>
          <div v-if="mtrStatus.tool" class="tool-info">
            <span class="tool-type">使用工具: {{ getToolDescription() }}</span>
          </div>
        </div>
        
        <div v-else-if="mtrStatus.status === 'permission_required'" class="status-item status-warning">
          <div class="status-details">
            <div class="status-title">
              <el-icon><WarningFilled /></el-icon>
              <span>{{ getToolDisplayName() }} 工具已安装，但需要管理员权限</span>
            </div>
            <div class="status-solutions">
              <div class="solution-title">💡 解决方案：</div>
              <div class="solution-item">
                <strong>1. 设置权限：</strong>
                <code class="command-code">{{ mtrStatus.permissionSolution }}</code>
              </div>
              <div class="solution-item">
                <strong>2. 或者使用路由追踪功能作为替代</strong>
              </div>
              <div class="solution-item manual-run">
                <strong>3. 手动运行：</strong>
                <code class="command-code">sudo mtr 目标地址</code>
                <span v-if="$platform === 'darwin'">（推荐在终端中手动运行）</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="mtrStatus.status === 'not_installed'" class="status-item status-error">
          <div class="status-details">
            <div class="status-title">
              <el-icon><CircleCloseFilled /></el-icon>
              <span>{{ getToolDisplayName() }} 工具未安装</span>
            </div>
            <div class="status-solutions">
              <div class="solution-title">📦 安装方法：</div>
              <div class="solution-item">
                <code class="command-code">{{ mtrStatus.installInstructions }}</code>
              </div>
              <div v-if="!isWindows()" class="solution-item manual-run">
                <strong>💡 提示：</strong>安装后可能需要重启应用程序
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="status-item status-loading">
          <div class="status-title">
            <el-icon><Loading /></el-icon>
            <span>正在检查 {{ getToolDisplayName() }} 工具状态...</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 输入区域 -->
    <AddressInputList
      v-model="addressList"
      :title="$t('form.targetList')"
      :placeholder="$t('placeholder.enterAddress')"
      :add-button-text="$t('buttons.add') + $t('table.address')"
      value-key="address"
      @batch-add="showBatchAdd = true"
      @from-favorites="showFavorites = true"
    />

    <!-- 测试选项 -->
    <el-form :model="form" label-position="top">
      <el-form-item :label="$t('form.testOptions')">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('form.packetSize') + '(' + $t('common.bytes') + ')'">
              <el-input-number
                v-model="form.packetSize"
                :min="8"
                :max="1472"
                :step="8"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('form.count')">
              <el-input-number
                v-model="form.count"
                :min="1"
                :max="100"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('form.maxHops')">
              <el-input-number
                v-model="form.maxHops"
                :min="1"
                :max="64"
                :step="1"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <!-- 结果显示 -->
    <div v-if="results.length > 0" class="results-section">
      <div v-for="(result, index) in results" :key="index" class="result-item">
        <h4>{{ result.target }}</h4>
        <el-table :data="result.hops" style="width: 100%" border>
          <el-table-column prop="hop" :label="$t('table.hop')" width="80" />
          <el-table-column prop="ip" :label="$t('table.ip')" width="150" />
          <el-table-column prop="hostname" :label="$t('table.hostname')" min-width="200" />
          <el-table-column prop="loss" :label="$t('table.loss')" width="100">
            <template #default="{ row }">
              {{ row.loss }}%
            </template>
          </el-table-column>
          <el-table-column prop="avg" :label="$t('table.avg')" width="100">
            <template #default="{ row }">
              {{ row.avg }} ms
            </template>
          </el-table-column>
          <el-table-column prop="min" :label="$t('table.min')" width="100">
            <template #default="{ row }">
              {{ row.min }} ms
            </template>
          </el-table-column>
          <el-table-column prop="max" :label="$t('table.max')" width="100">
            <template #default="{ row }">
              {{ row.max }} ms
            </template>
          </el-table-column>
          <el-table-column prop="location" :label="$t('table.location')" width="200" />
        </el-table>
      </div>
    </div>

    <template #dialogs>
      <!-- 收藏夹对话框 -->
      <FavoritesDialog
        v-model="showFavorites"
        @selected="handleFavoritesSelected"
      />

      <!-- 批量添加对话框 -->
      <BatchAddDialog
        v-model="showBatchAdd"
        :title="$t('buttons.batchAdd') + $t('table.address')"
        :placeholder="$t('placeholder.batchAdd')"
        @confirm="handleBatchAdd"
      />
    </template>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SuccessFilled, WarningFilled, CircleCloseFilled, Loading } from '@element-plus/icons-vue'
import storageService from '../services/storage'
import {
  PageContainer,
  PageHeader,
  AddressInputList,
  FavoritesDialog,
  BatchAddDialog
} from '../components'

// 注入国际化服务
const $t = inject('$t')

// 从 preload 脚本暴露的 API 中获取 invoke 方法
const { invoke } = window.electronAPI || {};

// 地址列表
const addressList = ref([
  { id: Date.now(), address: '' }
])

// 表单数据
const form = reactive({
  packetSize: 64,
  count: 5,
  maxHops: 15
})

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const showBatchAdd = ref(false)
const statusLoading = ref(false)
const mtrStatus = ref({ status: 'checking' })

// 开始测试
const startTest = async () => {
  const validAddresses = addressList.value
    .map(item => item.address.trim())
    .filter(address => address)
  
  if (validAddresses.length === 0) {
    ElMessage.warning($t('messages.pleaseAddAddress'))
    return
  }

  loading.value = true
  results.value = []
  
  try {
    const tempResults = []

    for (const address of validAddresses) {
      try {
        console.log('正在对', address, '执行MTR测试');
        
        // 使用 IPC 调用主进程执行 MTR 测试
        if (invoke) {
          // 将 reactive 对象转换为普通对象
          const formData = {
            packetSize: form.packetSize,
            count: form.count,
            maxHops: form.maxHops
          };
          
          const result = await invoke('mtr-test', address, formData);
          
          if (result && result.success) {
            tempResults.push({
              target: result.target,
              hops: result.hops
            });
          } else {
            throw new Error(result ? result.error : '执行 MTR 测试失败');
          }
        } else {
          console.error('invoke 方法未定义，无法执行 MTR 测试');
          ElMessage.error($t('messages.ipcRendererUndefined'));
          break;
        }
        
      } catch (error) {
        console.error('MTR测试失败:', address, error);
        
        // 如果是权限问题，自动刷新状态检测
        if (error.message && error.message.includes('管理员权限')) {
          await checkMtrStatus();
        }
        
        ElMessage.error(`${$t('messages.testFailed')} ${address}: ${error.message}`);
      }
    }

    results.value = tempResults;
    console.log('MTR测试完成，结果:', results.value);
  } catch (error) {
    console.error('测试过程出错:', error)
    ElMessage.error($t('messages.testFailed') + '：' + error.message)
  } finally {
    loading.value = false
  }
}

// 清除结果
const clearResults = () => {
  results.value = []
}

// 添加到收藏夹
const addToFavorites = (address) => {
  try {
    const success = storageService.addFavorite({
      address: address,
      note: $t('messages.addedFromPage', { page: $t('pages.mtrTest') })
    })
    
    if (success) {
      ElMessage.success($t('messages.addToFavorites'))
    } else {
      ElMessage.warning($t('messages.alreadyInFavorites'))
    }
  } catch (error) {
    console.error('添加收藏失败:', error)
    ElMessage.error($t('messages.saveFailed') + '：' + error.message)
  }
}

// 处理收藏夹选择
const handleFavoritesSelected = (selectedItems) => {
  selectedItems.forEach(item => {
    addressList.value.push({
      id: Date.now() + Math.random(),
      address: item.address
    })
  })
}

// 处理批量添加
const handleBatchAdd = (addresses) => {
  addresses.forEach(address => {
    addressList.value.push({
      id: Date.now() + Math.random(),
      address
    })
  })
}

// 检查 MTR 工具状态
const checkMtrStatus = async () => {
  statusLoading.value = true
  try {
    const result = await invoke('check-mtr-status')
    mtrStatus.value = result
  } catch (error) {
    console.error('检查 MTR 工具状态失败:', error)
    mtrStatus.value = { 
      status: 'error', 
      error: error.message 
    }
  } finally {
    statusLoading.value = false
  }
}

// 组件挂载时检查状态
onMounted(() => {
  checkMtrStatus()
})

// 获取工具显示名称
const getToolDisplayName = () => {
  if (mtrStatus.value.tool === 'pathping') {
    return 'PathPing'
  } else {
    return 'MTR'
  }
}

// 获取工具描述
const getToolDescription = () => {
  if (mtrStatus.value.tool === 'pathping') {
    return 'PathPing (Windows 内置网络诊断工具)'
  } else {
    return 'MTR (My Traceroute 网络诊断工具)'
  }
}

// 判断是否为 Windows 平台
const isWindows = () => {
  return navigator.platform.toLowerCase().includes('win') || 
         navigator.userAgent.toLowerCase().includes('windows')
}
</script>

<style scoped>
.results-section {
  margin-top: 20px;
}

.result-item {
  margin-bottom: 30px;
}

.result-item h4 {
  margin-bottom: 10px;
  color: #409EFF;
}

.mtr-status-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content {
  padding: 10px;
}

.status-item {
  margin-bottom: 10px;
}

.status-ready {
  color: #67C23A;
}

.status-warning {
  color: #E6A23C;
}

.status-error {
  color: #F56C6C;
}

.status-loading {
  color: #909399;
}

.status-help {
  margin-top: 5px;
  font-size: 0.8em;
}

.status-details {
  margin-top: 5px;
}

.status-title {
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-solutions {
  margin-top: 5px;
}

.solution-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.solution-item {
  margin-bottom: 5px;
}

.command-code {
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 4px;
}

.manual-run {
  color: #909399;
}

.install-methods {
  margin-top: 5px;
}

.tool-info {
  margin-top: 5px;
  font-size: 0.8em;
}

.tool-type {
  font-weight: bold;
}

.windows-note {
  margin-top: 5px;
  font-size: 0.8em;
}
</style> 