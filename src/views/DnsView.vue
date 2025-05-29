<template>
  <PageContainer>
    <template #header>
      <PageHeader
        :title="$t('pages.dnsTest')"
        :loading="loading"
        @start-test="startTest"
        @clear-results="clearResults"
        @from-favorites="showFavorites = true"
      />
    </template>

    <!-- 输入区域 -->
    <AddressInputList
      v-model="domainList"
      :title="$t('form.domainList')"
      :placeholder="$t('placeholder.enterDomain')"
      :add-button-text="$t('buttons.add') + $t('table.domain')"
      value-key="domain"
      @batch-add="showBatchAdd = true"
      @from-favorites="showFavorites = true"
    />

    <!-- 测试选项 -->
    <el-form :model="form" label-position="top">
      <el-form-item :label="$t('form.testOptions')">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('form.recordType')">
              <el-select v-model="form.recordType" :placeholder="$t('placeholder.selectRecordType')">
                <el-option :label="$t('testOptions.aRecord')" value="A" />
                <el-option :label="$t('testOptions.aaaaRecord')" value="AAAA" />
                <el-option :label="$t('testOptions.cnameRecord')" value="CNAME" />
                <el-option :label="$t('testOptions.mxRecord')" value="MX" />
                <el-option :label="$t('testOptions.txtRecord')" value="TXT" />
                <el-option :label="$t('testOptions.nsRecord')" value="NS" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('form.dnsServer')">
              <el-select v-model="form.dnsServer" :placeholder="$t('placeholder.selectDnsServer')">
                <el-option :label="$t('form.systemDefault')" value="default" />
                <el-option label="8.8.8.8 (Google)" value="8.8.8.8" />
                <el-option label="1.1.1.1 (Cloudflare)" value="1.1.1.1" />
                <el-option label="114.114.114.114" value="114.114.114.114" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('form.timeout') + '(' + $t('common.seconds') + ')'">
              <el-input-number
                v-model="form.timeout"
                :min="1"
                :max="30"
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
      address-key="domain"
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
        :title="$t('buttons.batchAdd') + $t('table.domain')"
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
import PageContainer from '../components/PageContainer.vue'
import PageHeader from '../components/PageHeader.vue'
import AddressInputList from '../components/AddressInputList.vue'
import ResultsTable from '../components/ResultsTable.vue'
import FavoritesDialog from '../components/FavoritesDialog.vue'
import BatchAddDialog from '../components/BatchAddDialog.vue'

// 注入国际化服务
const $t = inject('$t')

// 域名列表
const domainList = ref([
  { id: Date.now(), domain: '' }
])

// 表单数据
const form = reactive({
  recordType: 'A',
  dnsServer: 'default',
  timeout: 5
})

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const showBatchAdd = ref(false)

// 表格列配置
const tableColumns = [
  { prop: 'domain', label: $t('table.domain'), width: 200 },
  { prop: 'recordType', label: $t('table.recordType'), width: 100 },
  { prop: 'result', label: $t('table.result'), minWidth: 300 },
  { 
    prop: 'responseTime', 
    label: $t('table.responseTime'), 
    width: 120,
    formatter: (value) => `${value} ms`
  },
  { prop: 'dnsServer', label: $t('table.dnsServer'), width: 150 }
]

// 开始测试
const startTest = async () => {
  const validDomains = domainList.value
    .map(item => item.domain.trim())
    .filter(domain => domain)
  
  if (validDomains.length === 0) {
    ElMessage.warning($t('messages.pleaseAddDomain'))
    return
  }

  loading.value = true
  results.value = []
  
  try {
    const tempResults = []

    for (const domain of validDomains) {
      try {
        console.log('正在测试域名:', domain)
        
        // 模拟DNS测试结果
        const startTime = Date.now()
        
        // 这里应该调用实际的DNS查询API
        // 现在使用模拟数据
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
        
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        let result = ''
        switch (form.recordType) {
          case 'A':
            result = '192.168.1.1, 192.168.1.2'
            break
          case 'AAAA':
            result = '2001:db8::1, 2001:db8::2'
            break
          case 'CNAME':
            result = 'alias.example.com'
            break
          case 'MX':
            result = '10 mail.example.com, 20 mail2.example.com'
            break
          case 'TXT':
            result = 'v=spf1 include:_spf.example.com ~all'
            break
          case 'NS':
            result = 'ns1.example.com, ns2.example.com'
            break
        }
        
        tempResults.push({
          domain,
          recordType: form.recordType,
          result,
          responseTime,
          dnsServer: form.dnsServer === 'default' ? $t('form.systemDefault') : form.dnsServer
        })
      } catch (error) {
        console.error('测试失败:', error)
        tempResults.push({
          domain,
          recordType: form.recordType,
          result: $t('messages.queryFailed'),
          responseTime: '-',
          dnsServer: form.dnsServer === 'default' ? $t('form.systemDefault') : form.dnsServer,
          error: error.message
        })
        ElMessage.error(`${$t('messages.testFailed')} ${domain}: ${error.message}`)
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
const addToFavorites = (domain) => {
  try {
    const success = storageService.addFavorite({
      address: domain,
      note: $t('messages.addedFromPage', { page: $t('pages.dnsTest') })
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
    domainList.value.push({
      id: Date.now() + Math.random(),
      domain: item.address
    })
  })
}

// 处理批量添加
const handleBatchAdd = (domains) => {
  domains.forEach(domain => {
    domainList.value.push({
      id: Date.now() + Math.random(),
      domain
    })
  })
}
</script>

<style scoped>
/* 页面特定样式可以在这里添加 */
</style> 