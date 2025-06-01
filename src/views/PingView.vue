<template>
  <PageContainer>
    <template #header>
      <PageHeader
        :title="$t('pages.pingTest')"
        :loading="loading"
        @start-test="startTest"
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
            <el-form-item :label="$t('form.timeout') + '(' + $t('common.seconds') + ')'">
              <el-input-number
                v-model="form.timeout"
                :min="1"
                :max="10"
                :step="1"
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
        </el-row>
      </el-form-item>
    </el-form>

    <!-- 结果表格 -->
    <ResultsTable
      :data="results"
      :columns="tableColumns"
      address-key="host"
      @add-to-favorites="addToFavorites"
    >
      <template #latency="{ row }">
        {{ row.min }}/{{ row.avg }}/{{ row.max }} ms
      </template>
      <template #loss="{ row }">
        {{ row.loss }}%
      </template>
      <template #ttl="{ row }">
        {{ row.ttl }}
      </template>
    </ResultsTable>

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
import { ref, reactive, inject } from 'vue'
import { ElMessage } from 'element-plus'
import storageService from '../services/storage'
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

// 表单数据
const form = reactive({
  packetSize: 32,
  timeout: 3,
  count: 4
})

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const showBatchAdd = ref(false)

// 表格列配置
const tableColumns = [
  { prop: 'host', label: $t('table.hostname'), width: 180 },
  { prop: 'ip', label: $t('table.ip'), width: 150 },
  { 
    prop: 'latency', 
    label: $t('table.min') + '/' + $t('table.avg') + '/' + $t('table.max'), 
    width: 200, 
    slot: 'latency' 
  },
  { prop: 'loss', label: $t('table.loss'), width: 100, slot: 'loss' },
  { prop: 'ttl', label: $t('table.ttl'), width: 80, slot: 'ttl' }
]

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
        console.log('正在Ping测试:', address)
        
        // 使用真实的ping测试
        const result = await window.electronAPI.invoke('ping-test', {
          host: address,
          count: form.count,
          size: form.packetSize,
          timeout: form.timeout
        })
        
        tempResults.push({
          host: result.host,
          ip: result.ip,
          min: result.min,
          avg: result.avg,
          max: result.max,
          loss: result.loss,
          ttl: result.ttl
        })
      } catch (error) {
        console.error('测试失败:', error)
        tempResults.push({
          host: address,
          ip: '-',
          min: '-',
          avg: '-',
          max: '-',
          loss: 100,
          ttl: '-',
          error: error.message
        })
        ElMessage.error(`${$t('messages.testFailed')} ${address}: ${error.message}`)
      }
    }

    results.value = tempResults
    console.log('测试完成，结果:', results.value)
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
      note: $t('messages.addedFromPage', { page: $t('pages.pingTest') })
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
</script>

<style scoped>
/* 页面特定样式可以在这里添加 */
</style> 