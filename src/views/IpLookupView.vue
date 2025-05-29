<template>
  <PageContainer>
    <!-- 当前IP信息卡片 -->
    <el-card class="current-ip-card">
      <template #header>
        <div class="card-header">
          <h3>{{ $t('currentIp.title') }}</h3>
          <el-button @click="refreshCurrentIp" :loading="currentIpLoading" size="small">
            <el-icon><Refresh /></el-icon>
            {{ $t('buttons.refresh') }}
          </el-button>
        </div>
      </template>
      
      <div v-if="currentIpInfo && !currentIpLoading" class="current-ip-info">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>{{ $t('currentIp.address') }}:</label>
              <span class="ip-address">{{ currentIpInfo.ip }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>{{ $t('currentIp.country') }}:</label>
              <span>{{ currentIpInfo.country || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>{{ $t('currentIp.region') }}:</label>
              <span>{{ currentIpInfo.region || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>{{ $t('currentIp.city') }}:</label>
              <span>{{ currentIpInfo.city || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>{{ $t('currentIp.isp') }}:</label>
              <span>{{ currentIpInfo.isp || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>{{ $t('currentIp.queryTime') }}:</label>
              <span>{{ formatDate(currentIpInfo.queryTime) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <div v-else-if="currentIpLoading" class="loading-info">
        <el-icon class="is-loading"><Loading /></el-icon>
        {{ $t('currentIp.loading') }}
      </div>
      
      <div v-else class="error-info">
        <el-icon><Warning /></el-icon>
        {{ $t('currentIp.error') }}
      </div>
    </el-card>

    <template #header>
      <PageHeader
        :title="$t('pages.ipLookup')"
        :start-button-text="$t('buttons.startQuery')"
        :loading="loading"
        @start-test="startQuery"
        @clear-results="clearResults"
        @from-favorites="showFavorites = true"
      />
    </template>

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

    <!-- 结果表格 -->
    <ResultsTable
      :data="results"
      :columns="tableColumns"
      address-key="query"
      @add-to-favorites="addToFavorites"
    />

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
import { ref, reactive, onMounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Loading, Warning } from '@element-plus/icons-vue'
import storageService from '../services/storage'
import ipService from '../services/ipService'
import {
  PageContainer,
  PageHeader,
  AddressInputList,
  ResultsTable,
  FavoritesDialog,
  BatchAddDialog
} from '../components'

// 注入国际化服务
const $t = inject('$t')

// 地址列表
const addressList = ref([
  { id: Date.now(), address: '' }
])

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const showBatchAdd = ref(false)

// 当前IP信息相关
const currentIpInfo = ref(null)
const currentIpLoading = ref(false)

// 表格列配置
const tableColumns = [
  { prop: 'query', label: $t('table.query'), width: 200 },
  { prop: 'ip', label: $t('table.ip'), width: 150 },
  { prop: 'country', label: $t('table.country'), width: 150 },
  { prop: 'region', label: $t('table.region'), width: 150 },
  { prop: 'city', label: $t('table.city'), width: 120 },
  { prop: 'isp', label: $t('table.isp'), minWidth: 200 }
]

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// 获取当前IP信息
const getCurrentIpInfo = async () => {
  currentIpLoading.value = true
  try {
    // 直接使用IP查询服务获取当前IP和地理位置信息
    // 传入空字符串或特殊标识让服务知道要查询当前IP
    const result = await ipService.lookupIpLocation('current')
    
    if (result.success) {
      currentIpInfo.value = {
        ip: result.data.ip || '-',
        country: result.data.country || '-',
        region: result.data.region || '-',
        city: result.data.city || '-',
        isp: result.data.isp || '-',
        queryTime: new Date()
      }
    } else {
      console.error('获取当前IP信息失败:', result.error)
      ElMessage.error($t('messages.getCurrentIpFailed') + ': ' + result.error)
    }
  } catch (error) {
    console.error('获取当前IP信息异常:', error)
    ElMessage.error($t('messages.getCurrentIpFailed') + ': ' + error.message)
  } finally {
    currentIpLoading.value = false
  }
}

// 刷新当前IP信息
const refreshCurrentIp = () => {
  getCurrentIpInfo()
}

// 开始查询
const startQuery = async () => {
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
        console.log('正在查询地址:', address)
        
        const result = await ipService.lookupIpLocation(address)
        
        if (result.success) {
          tempResults.push({
            query: address,
            ip: result.data.ip || address,
            country: result.data.country || '-',
            region: result.data.region || '-',
            city: result.data.city || '-',
            isp: result.data.isp || '-'
          })
        } else {
          tempResults.push({
            query: address,
            ip: '-',
            country: '-',
            region: '-',
            city: '-',
            isp: $t('messages.queryFailed') + ': ' + result.error
          })
          ElMessage.error(`${$t('messages.queryFailed')} ${address}: ${result.error}`)
        }
      } catch (error) {
        console.error('查询失败:', error)
        tempResults.push({
          query: address,
          ip: '-',
          country: '-',
          region: '-',
          city: '-',
          isp: $t('messages.queryFailed') + ': ' + error.message
        })
        ElMessage.error(`${$t('messages.queryFailed')} ${address}: ${error.message}`)
      }
    }

    results.value = tempResults
    console.log('查询完成，结果:', results.value)
  } catch (error) {
    console.error('查询过程出错:', error)
    ElMessage.error($t('messages.queryFailed') + '：' + error.message)
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
      note: $t('messages.addedFromPage', { page: $t('pages.ipLookup') })
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

// 组件挂载时获取当前IP信息
onMounted(() => {
  getCurrentIpInfo()
})
</script>

<style scoped>
.current-ip-card {
  margin-bottom: 20px;
}

.current-ip-info {
  padding: 10px 0;
}

.current-ip-info .el-row + .el-row {
  margin-top: 15px;
}

.info-item {
  margin-bottom: 8px;
}

.info-item label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
}

.ip-address {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: bold;
  color: #409EFF;
  font-size: 16px;
}

.loading-info, .error-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
}

.loading-info .el-icon {
  margin-right: 8px;
}

.error-info {
  color: #F56C6C;
}

.error-info .el-icon {
  margin-right: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 