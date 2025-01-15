<template>
  <div class="favorites">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>收藏夹</h3>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索收藏"
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="showAddDialog = true">
              添加收藏
            </el-button>
          </div>
        </div>
      </template>

      <!-- 收藏列表 -->
      <el-table :data="filteredFavorites" style="width: 100%">
        <el-table-column prop="address" label="地址" width="300" />
        <el-table-column prop="note" label="备注" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="editFavorite(row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="openTestDialog(row)">
                测试
              </el-button>
              <el-button type="danger" link @click="deleteFavorite(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingFavorite ? '编辑收藏' : '添加收藏'"
      width="500px"
    >
      <el-form :model="favoriteForm" label-width="80px">
        <el-form-item label="地址">
          <el-input v-model="favoriteForm.address" placeholder="域名或IP地址" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="favoriteForm.note"
            type="textarea"
            placeholder="备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveFavorite">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 测试类型选择对话框 -->
    <el-dialog
      v-model="showTestDialog"
      title="选择测试类型"
      width="400px"
    >
      <el-radio-group v-model="selectedTestType">
        <el-radio label="traceroute">路由追踪</el-radio>
        <el-radio label="ping">Ping</el-radio>
        <el-radio label="http">HTTP</el-radio>
        <el-radio label="dns">DNS</el-radio>
        <el-radio label="mtr">MTR</el-radio>
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTestDialog = false">取消</el-button>
          <el-button type="primary" @click="startTest">
            开始测试
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import storageService from '../services/storage'

const router = useRouter()

// 状态变量
const favorites = ref([])
const searchQuery = ref('')
const showAddDialog = ref(false)
const showTestDialog = ref(false)
const selectedFavorite = ref(null)
const selectedTestType = ref('traceroute')
const editingFavorite = ref(null)
const favoriteForm = ref({
  address: '',
  note: ''
})

// 加载收藏列表
const loadFavorites = () => {
  favorites.value = storageService.getFavorites()
}

// 在组件挂载时加载收藏列表
loadFavorites()

// 过滤后的收藏列表
const filteredFavorites = computed(() => {
  if (!searchQuery.value) return favorites.value
  const query = searchQuery.value.toLowerCase()
  return favorites.value.filter(
    item => item.address.toLowerCase().includes(query) ||
           item.note.toLowerCase().includes(query)
  )
})

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 编辑收藏
const editFavorite = (favorite) => {
  editingFavorite.value = favorite
  favoriteForm.value = { ...favorite }
  showAddDialog.value = true
}

// 保存收藏
const saveFavorite = () => {
  if (!favoriteForm.value.address.trim()) {
    ElMessage.warning('请输入地址')
    return
  }

  try {
    if (editingFavorite.value) {
      storageService.updateFavorite(editingFavorite.value.id, favoriteForm.value)
    } else {
      storageService.addFavorite(favoriteForm.value)
    }
    loadFavorites() // 重新加载列表
    showAddDialog.value = false
    editingFavorite.value = null
    favoriteForm.value = { address: '', note: '' }
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  }
}

// 删除收藏
const deleteFavorite = (favorite) => {
  ElMessageBox.confirm(
    '确定要删除这个收藏吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    try {
      storageService.removeFavorite(favorite.id)
      loadFavorites() // 重新加载列表
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败：' + error.message)
    }
  }).catch(() => {})
}

// 显示测试对话框
const openTestDialog = (favorite) => {
  selectedFavorite.value = favorite
  showTestDialog.value = true
}

// 开始测试
const startTest = () => {
  if (!selectedFavorite.value) return

  showTestDialog.value = false
  // 根据选择的测试类型跳转到相应页面
  router.push({
    path: `/${selectedTestType.value}`,
    query: { address: selectedFavorite.value.address }
  })
}
</script>

<style scoped>
.favorites {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 