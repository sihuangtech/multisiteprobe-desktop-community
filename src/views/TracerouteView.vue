<template>
  <PageContainer>
    <template #header>
      <PageHeader
        :title="$t('pages.traceroute')"
        :loading="loading"
        @start-test="startTest"
        @clear-results="clearResults"
        @from-favorites="showFavorites = true"
      />
    </template>

    <!-- 工具状态提示 -->
    <el-alert
      v-if="isLinux && toolStatus && !toolStatus.installed"
      :title="$t('messages.toolNotInstalled', { tool: 'traceroute' })"
      type="warning"
      :description="toolStatus.installInstructions"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    >
      <template #default>
        <div>
          <p><strong>{{ $t('messages.toolNotInstalled', { tool: 'traceroute' }) }}</strong></p>
          <div style="white-space: pre-line; margin-top: 10px; font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            {{ toolStatus.installInstructions }}
          </div>
          <el-button 
            type="primary" 
            size="small" 
            style="margin-top: 10px;"
            @click="checkToolStatus"
          >
            {{ $t('buttons.recheckTool') }}
          </el-button>
        </div>
      </template>
    </el-alert>

    <el-alert
      v-else-if="isLinux && toolStatus && toolStatus.status === 'permission_error'"
      :title="$t('messages.toolPermissionError')"
      type="warning"
      :description="toolStatus.error"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    >
      <template #default>
        <div>
          <p><strong>{{ $t('messages.toolPermissionError') }}</strong></p>
          <p>{{ toolStatus.error }}</p>
          <div style="white-space: pre-line; margin-top: 10px; font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            {{ toolStatus.installInstructions }}
          </div>
          <el-button 
            type="primary" 
            size="small" 
            style="margin-top: 10px;"
            @click="checkToolStatus"
          >
            {{ $t('buttons.recheckTool') }}
          </el-button>
        </div>
      </template>
    </el-alert>

    <el-alert
      v-else-if="isLinux && toolStatus && toolStatus.installed && toolStatus.status === 'ready'"
      :title="$t('messages.toolReady', { tool: toolStatus.tool || 'traceroute' })"
      type="success"
      show-icon
      :closable="true"
      style="margin-bottom: 20px;"
    />

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
            <el-form-item :label="$t('form.maxHops')">
              <el-input-number
                v-model="form.maxHops"
                :min="1"
                :max="64"
                :step="1"
              />
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
          <el-table-column prop="rtt1" label="RTT1" width="100">
            <template #default="{ row }">
              {{ row.rtt1 }}
            </template>
          </el-table-column>
          <el-table-column prop="rtt2" label="RTT2" width="100">
            <template #default="{ row }">
              {{ row.rtt2 }}
            </template>
          </el-table-column>
          <el-table-column prop="rtt3" label="RTT3" width="100">
            <template #default="{ row }">
              {{ row.rtt3 }}
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
  maxHops: 15,
  timeout: 2,
  packetSize: 64
})

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const showBatchAdd = ref(false)
const toolStatus = ref(null)
const isLinux = ref(process.platform === 'linux')

// 检查工具状态
const checkToolStatus = async () => {
  // 只在Linux系统上检查工具状态
  if (!isLinux.value) {
    return;
  }
  
  try {
    if (invoke) {
      const status = await invoke('check-traceroute-status');
      toolStatus.value = status;
      console.log('Traceroute工具状态:', status);
      
      if (status.installed && status.status === 'ready') {
        ElMessage.success($t('messages.toolReady', { tool: status.tool || 'traceroute' }));
      }
    } else {
      console.error('invoke 方法未定义，无法检查工具状态');
    }
  } catch (error) {
    console.error('检查traceroute工具状态失败:', error);
    ElMessage.error($t('messages.checkToolFailed') + '：' + error.message);
  }
}

// 开始测试
const startTest = async () => {
  const validAddresses = addressList.value
    .map(item => item.address.trim())
    .filter(address => address)
  
  if (validAddresses.length === 0) {
    ElMessage.warning($t('messages.pleaseAddAddress'))
    return
  }

  // 只在Linux系统上检查工具状态
  if (isLinux.value) {
    if (!toolStatus.value || !toolStatus.value.installed) {
      await checkToolStatus();
      if (!toolStatus.value || !toolStatus.value.installed) {
        ElMessage.error($t('messages.toolNotInstalled', { tool: 'traceroute' }));
        return;
      }
    }

    if (toolStatus.value.status !== 'ready') {
      ElMessage.error($t('messages.toolNotReady', { tool: 'traceroute' }));
      return;
    }
  }

  loading.value = true
  results.value = []
  
  try {
    const tempResults = []

    for (const address of validAddresses) {
      try {
        console.log('正在追踪路由:', address);
        
        // 使用 IPC 调用主进程执行路由追踪测试
        if (invoke) {
          // 将 reactive 对象转换为普通对象
          const formData = {
            maxHops: form.maxHops,
            timeout: form.timeout,
            packetSize: form.packetSize
          };
          
          const result = await invoke('traceroute-test', address, formData);
          
          if (result.success) {
            tempResults.push({
              target: result.target,
              hops: result.hops
            });
          } else {
            throw new Error(result.error || '执行路由追踪测试失败');
          }
        } else {
          console.error('invoke 方法未定义，无法执行路由追踪测试');
          ElMessage.error($t('messages.ipcRendererUndefined'));
          break; // 如果 invoke 未定义，停止测试
        }
        
      } catch (error) {
        console.error('路由追踪测试失败:', address, error);
        ElMessage.error(`${$t('messages.testFailed')} ${address}: ${error.message}`);
      }
    }

    results.value = tempResults;
    console.log('路由追踪测试完成，结果:', results.value);
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
      note: $t('messages.addedFromPage', { page: $t('pages.traceroute') })
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

// 组件挂载时检查工具状态
onMounted(() => {
  // 只在Linux系统上检查工具状态
  if (isLinux.value) {
    checkToolStatus();
  }
})
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