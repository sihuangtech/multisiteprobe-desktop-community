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
import { ref, reactive, inject } from 'vue'
import { ElMessage } from 'element-plus'
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

// 地址列表
const addressList = ref([
  { id: Date.now(), address: '' }
])

// 表单数据
const form = reactive({
  packetSize: 64,
  count: 10,
  maxHops: 30
})

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const showBatchAdd = ref(false)

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
        console.log('正在测试地址:', address)
        
        // 模拟MTR测试结果
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
        
        const hops = []
        const hopCount = Math.floor(Math.random() * 15) + 5
        
        for (let i = 1; i <= hopCount; i++) {
          hops.push({
            hop: i,
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            hostname: i === hopCount ? address : `hop${i}.example.com`,
            loss: Math.floor(Math.random() * 5),
            avg: Math.floor(Math.random() * 100) + 10,
            min: Math.floor(Math.random() * 50) + 5,
            max: Math.floor(Math.random() * 150) + 20,
            location: `Location ${i}`
          })
        }
        
        tempResults.push({
          target: address,
          hops
        })
      } catch (error) {
        console.error('测试失败:', error)
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
</style> 