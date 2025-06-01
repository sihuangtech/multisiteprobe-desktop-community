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
                <el-option label="8.8.8.8 (Google Primary)" value="8.8.8.8" />
                <el-option label="8.8.4.4 (Google Secondary)" value="8.8.4.4" />
                <el-option label="1.1.1.1 (Cloudflare Primary)" value="1.1.1.1" />
                <el-option label="1.0.0.1 (Cloudflare Secondary)" value="1.0.0.1" />
                <el-option label="114.114.114.114 (114DNS Primary)" value="114.114.114.114" />
                <el-option label="114.114.115.115 (114DNS Secondary)" value="114.114.115.115" />
                <el-option label="223.5.5.5 (阿里云 Primary)" value="223.5.5.5" />
                <el-option label="223.6.6.6 (阿里云 Secondary)" value="223.6.6.6" />
                <el-option label="180.76.76.76 (百度 DNS)" value="180.76.76.76" />
                <el-option label="119.29.29.29 (腾讯 DNS)" value="119.29.29.29" />
                <el-option label="9.9.9.9 (Quad9)" value="9.9.9.9" />
                <el-option label="208.67.222.222 (OpenDNS)" value="208.67.222.222" />
                <el-option label="208.67.220.220 (OpenDNS)" value="208.67.220.220" />
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

// 从 preload 脚本暴露的 API 中获取 invoke 方法
const { invoke } = window.electronAPI || {};

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
        
        // 使用 IPC 调用主进程执行 DNS 测试
        if (invoke) {
          const result = await invoke('dns-test', domain, form.recordType, form.dnsServer);
          
          if (result && result.success) {
            tempResults.push({
              domain: result.domain,
              recordType: result.recordType,
              result: result.result,
              responseTime: result.responseTime,
              dnsServer: result.dnsServer
            });
          } else {
            tempResults.push({
              domain,
              recordType: form.recordType,
              result: result ? result.result : $t('messages.queryFailed'),
              responseTime: '-',
              dnsServer: form.dnsServer === 'default' ? $t('form.systemDefault') : form.dnsServer,
              error: result ? result.error : '未知错误'
            });
          }
        } else {
          console.error('invoke 方法未定义，无法执行 DNS 测试');
          ElMessage.error($t('messages.ipcRendererUndefined'));
          break;
        }
        
      } catch (error) {
        console.error('DNS测试失败:', domain, error);
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
    console.log('DNS测试完成，结果:', results.value)
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