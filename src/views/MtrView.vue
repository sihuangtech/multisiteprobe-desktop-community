<template>
  <div class="mtr">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>MTR测试</h3>
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
              <el-form-item label="测试次数">
                <el-input-number
                  v-model="form.count"
                  :min="1"
                  :max="100"
                  :step="1"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大跳数">
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

      <!-- 结果区域 -->
      <div v-if="results.length > 0" class="results-area">
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <h4>{{ result.host }}</h4>
          <el-table :data="result.hops" style="width: 100%" border>
            <el-table-column prop="hop" label="跳数" width="80" />
            <el-table-column prop="host" label="主机" min-width="180" />
            <el-table-column prop="ip" label="IP地址" width="150" />
            <el-table-column label="丢包率" width="100">
              <template #default="{ row }">
                {{ row.loss }}%
              </template>
            </el-table-column>
            <el-table-column label="延迟" width="200">
              <template #default="{ row }">
                {{ row.min }}/{{ row.avg }}/{{ row.max }} ms
              </template>
            </el-table-column>
            <el-table-column prop="location" label="地理位置" width="200" />
          </el-table>
          <div class="result-actions">
            <el-button type="primary" link @click="addToFavorites(result.host)">
              添加到收藏夹
            </el-button>
          </div>
        </div>
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
  packetSize: 64,
  count: 10,
  maxHops: 30
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
  try {
    const addresses = form.addresses.split('\n').filter(addr => addr.trim())
    // TODO: 调用后端API进行测试
    // 模拟测试结果
    results.value = addresses.map(host => ({
      host,
      hops: Array(5).fill().map((_, i) => ({
        hop: i + 1,
        host: `router-${i + 1}.example.com`,
        ip: '192.168.1.' + (i + 1),
        loss: Math.floor(Math.random() * 10),
        min: 10 + i * 5,
        avg: 15 + i * 5,
        max: 20 + i * 5,
        location: '中国 上海'
      }))
    }))
  } catch (error) {
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
.mtr {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-area {
  margin-top: 20px;
}

.result-item {
  margin-bottom: 30px;
}

.result-item h4 {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.result-actions {
  margin-top: 10px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 