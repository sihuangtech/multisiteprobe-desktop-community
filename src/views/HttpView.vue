<template>
  <div class="http">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>HTTP测试</h3>
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
        <el-form-item label="目标地址（每行一个URL）">
          <el-input
            v-model="form.urls"
            type="textarea"
            :rows="4"
            placeholder="请输入要测试的URL，每行一个"
          />
        </el-form-item>
        <el-form-item label="测试选项">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="请求方法">
                <el-select v-model="form.method">
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="HEAD" value="HEAD" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="超时时间(秒)">
                <el-input-number
                  v-model="form.timeout"
                  :min="1"
                  :max="30"
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
          <el-table-column prop="url" label="URL" min-width="200" />
          <el-table-column prop="statusCode" label="状态码" width="100" />
          <el-table-column label="响应时间" width="200">
            <template #default="{ row }">
              {{ row.min }}/{{ row.avg }}/{{ row.max }} ms
            </template>
          </el-table-column>
          <el-table-column prop="size" label="响应大小" width="120">
            <template #default="{ row }">
              {{ formatSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="addToFavorites(row.url)"
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
  urls: '',
  method: 'GET',
  timeout: 5,
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

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 开始测试
const startTest = async () => {
  if (!form.urls.trim()) {
    ElMessage.warning('请输入要测试的URL')
    return
  }

  loading.value = true
  try {
    const urls = form.urls.split('\n').filter(url => url.trim())
    // TODO: 调用后端API进行测试
    // 模拟测试结果
    results.value = urls.map(url => ({
      url,
      statusCode: 200,
      min: 50,
      avg: 75,
      max: 100,
      size: 1024 * 1024 // 1MB
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
const addToFavorites = (url) => {
  try {
    storageService.addFavorite({ address: url, note: '' })
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
  const currentValue = form.urls.trim()
  const newUrls = selectedFavorites.value.map(f => f.address).join('\n')
  form.urls = currentValue ? `${currentValue}\n${newUrls}` : newUrls
  showFavorites.value = false
}
</script>

<style scoped>
.http {
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