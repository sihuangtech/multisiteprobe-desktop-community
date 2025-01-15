<template>
  <div class="dns">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>DNS测试</h3>
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
        <el-form-item label="目标域名（每行一个）">
          <el-input
            v-model="form.domains"
            type="textarea"
            :rows="4"
            placeholder="请输入要测试的域名，每行一个"
          />
        </el-form-item>
        <el-form-item label="测试选项">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="记录类型">
                <el-select v-model="form.recordType">
                  <el-option label="A" value="A" />
                  <el-option label="AAAA" value="AAAA" />
                  <el-option label="CNAME" value="CNAME" />
                  <el-option label="MX" value="MX" />
                  <el-option label="TXT" value="TXT" />
                  <el-option label="NS" value="NS" />
                  <el-option label="SOA" value="SOA" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="DNS服务器">
                <el-input v-model="form.dnsServer" placeholder="可选，默认使用系统DNS" />
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
          </el-row>
        </el-form-item>
      </el-form>

      <!-- 结果表格 -->
      <div v-if="results.length > 0" class="results-table">
        <el-table :data="results" style="width: 100%" border>
          <el-table-column prop="domain" label="域名" width="180" />
          <el-table-column prop="type" label="记录类型" width="100" />
          <el-table-column prop="result" label="解析结果" min-width="200" />
          <el-table-column label="响应时间" width="120">
            <template #default="{ row }">
              {{ row.time }} ms
            </template>
          </el-table-column>
          <el-table-column prop="ttl" label="TTL" width="80" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="addToFavorites(row.domain)"
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
  domains: '',
  recordType: 'A',
  dnsServer: '',
  timeout: 3
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
  if (!form.domains.trim()) {
    ElMessage.warning('请输入要测试的域名')
    return
  }

  loading.value = true
  try {
    const domains = form.domains.split('\n').filter(domain => domain.trim())
    // TODO: 调用后端API进行测试
    // 模拟测试结果
    results.value = domains.map(domain => ({
      domain,
      type: form.recordType,
      result: '8.8.8.8',
      time: 50,
      ttl: 300
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
const addToFavorites = (domain) => {
  try {
    storageService.addFavorite({ address: domain, note: '' })
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
  const currentValue = form.domains.trim()
  const newDomains = selectedFavorites.value.map(f => f.address).join('\n')
  form.domains = currentValue ? `${currentValue}\n${newDomains}` : newDomains
  showFavorites.value = false
}
</script>

<style scoped>
.dns {
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