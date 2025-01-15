<template>
  <div class="ping">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Ping测试</h3>
          <el-button-group>
            <el-button type="primary" @click="startTest" :loading="loading">
              开始测试
            </el-button>
            <el-button @click="clearResults">
              清除结果
            </el-button>
            <el-button @click="showFavorites = true">
              从收藏夹选择
            </el-button>
          </el-button-group>
        </div>
      </template>

      <!-- 输入区域 -->
      <el-form :model="form" label-position="top">
        <el-form-item label="目标地址（每行一个域名或IP）">
          <el-input
            v-model="form.addresses"
            type="textarea"
            :rows="4"
            placeholder="请输入要测试的域名或IP地址，每行一个"
          />
        </el-form-item>
        <el-form-item label="测试选项">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="数据包大小">
                <el-input-number
                  v-model="form.packetSize"
                  :min="32"
                  :max="65507"
                  :step="1"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="超时时间(秒)">
                <el-input-number
                  v-model="form.timeout"
                  :min="1"
                  :max="10"
                  :step="1"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="测试次数">
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
      <div v-if="results.length > 0" class="results-table">
        <el-table :data="results" style="width: 100%" border>
          <el-table-column prop="host" label="主机" width="180" />
          <el-table-column prop="ip" label="IP地址" width="150" />
          <el-table-column label="延迟" width="200">
            <template #default="{ row }">
              {{ row.min }}/{{ row.avg }}/{{ row.max }} ms
            </template>
          </el-table-column>
          <el-table-column prop="loss" label="丢包率" width="100">
            <template #default="{ row }">
              {{ row.loss }}%
            </template>
          </el-table-column>
          <el-table-column prop="ttl" label="TTL" width="80" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="addToFavorites(row.host)"
              >
                收藏
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 收藏夹对话框 -->
    <el-dialog
      v-model="showFavorites"
      title="从收藏夹选择"
      width="500px"
    >
      <el-table
        :data="favorites"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="note" label="备注" />
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showFavorites = false">取消</el-button>
          <el-button type="primary" @click="addSelectedToInput">
            添加到输入框
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import storageService from '../services/storage'

// 表单数据
const form = reactive({
  addresses: '',
  packetSize: 32,
  timeout: 3,
  count: 4
})

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const favorites = ref([])
const selectedFavorites = ref([])

// 加载收藏列表
const loadFavorites = () => {
  favorites.value = storageService.getFavorites()
}

// 在组件挂载时加载收藏列表
loadFavorites()

// 开始测试
const startTest = async () => {
  if (!form.addresses.trim()) {
    ElMessage.warning('请输入要测试的地址')
    return
  }

  loading.value = true
  results.value = [] // 清空之前的结果
  
  try {
    const addresses = form.addresses.split('\n').filter(addr => addr.trim())
    const tempResults = []

    for (const host of addresses) {
      try {
        console.log('正在测试主机:', host)
        // 调用主进程执行ping测试
        const result = await window.electron.ipcRenderer.invoke('ping-test', {
          host,
          count: form.count,
          size: form.packetSize,
          timeout: form.timeout
        })
        
        console.log('获取到ping结果:', result)
        tempResults.push({
          host,
          ip: result.ip || '-',
          min: result.min || '-',
          avg: result.avg || '-',
          max: result.max || '-',
          loss: result.loss || '-',
          ttl: result.ttl || '-'
        })
      } catch (error) {
        console.error('测试失败:', error)
        tempResults.push({
          host,
          ip: '-',
          min: '-',
          avg: '-',
          max: '-',
          loss: '-',
          ttl: '-',
          error: error.message
        })
        ElMessage.error(`测试 ${host} 失败: ${error.message}`)
      }
    }

    results.value = tempResults
  } catch (error) {
    console.error('测试过程出错:', error)
    ElMessage.error('测试失败：' + error.message)
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
    storageService.addFavorite({ address, note: '' })
    ElMessage.success('已添加到收藏夹')
  } catch (error) {
    ElMessage.error('添加失败：' + error.message)
  }
}

// 处理收藏夹选择变化
const handleSelectionChange = (selection) => {
  selectedFavorites.value = selection
}

// 添加选中的收藏到输入框
const addSelectedToInput = () => {
  const currentValue = form.addresses.trim()
  const newAddresses = selectedFavorites.value.map(f => f.address).join('\n')
  form.addresses = currentValue ? `${currentValue}\n${newAddresses}` : newAddresses
  showFavorites.value = false
}
</script>

<style scoped>
.ping {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-table {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 