<template>
  <div class="favorites">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ $t('favorites.title') }}</h3>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              :placeholder="$t('placeholder.search')"
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="showAddDialog = true">
              {{ $t('favorites.addFavorite') }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 收藏列表 -->
      <el-table :data="filteredFavorites" style="width: 100%">
        <el-table-column prop="address" :label="$t('table.address')" width="300" />
        <el-table-column prop="note" :label="$t('table.note')" />
        <el-table-column prop="createdAt" :label="$t('table.createdAt')" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.actions')" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="editFavorite(row)">
                {{ $t('buttons.edit') }}
              </el-button>
              <el-button type="primary" link @click="openTestDialog(row)">
                {{ $t('buttons.test') }}
              </el-button>
              <el-button type="danger" link @click="deleteFavorite(row)">
                {{ $t('buttons.delete') }}
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingFavorite ? $t('favorites.editFavorite') : $t('favorites.addFavorite')"
      width="500px"
    >
      <el-form :model="favoriteForm" label-width="80px">
        <el-form-item :label="$t('table.address')">
          <el-input v-model="favoriteForm.address" :placeholder="$t('placeholder.enterAddress')" />
        </el-form-item>
        <el-form-item :label="$t('table.note')">
          <el-input
            v-model="favoriteForm.note"
            type="textarea"
            :placeholder="$t('table.note')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">{{ $t('buttons.cancel') }}</el-button>
          <el-button type="primary" @click="saveFavorite">
            {{ $t('buttons.save') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 测试类型选择对话框 -->
    <el-dialog
      v-model="showTestDialog"
      :title="$t('favorites.selectTestType')"
      width="400px"
    >
      <el-radio-group v-model="selectedTestType">
        <el-radio label="traceroute">{{ $t('nav.traceroute') }}</el-radio>
        <el-radio label="ping">Ping{{ $t('nav.test') }}</el-radio>
        <el-radio label="http">{{ $t('nav.http') }}</el-radio>
        <el-radio label="dns">{{ $t('nav.dns') }}</el-radio>
        <el-radio label="mtr">{{ $t('nav.mtr') }}</el-radio>
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTestDialog = false">{{ $t('buttons.cancel') }}</el-button>
          <el-button type="primary" @click="startTest">
            {{ $t('buttons.start') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import storageService from '../services/storage'

// 注入国际化服务
const $t = inject('$t')

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
    ElMessage.warning($t('messages.pleaseAddAddress'))
    return
  }

  try {
    if (editingFavorite.value) {
      const success = storageService.updateFavorite(editingFavorite.value.id, favoriteForm.value)
      if (success) {
        ElMessage.success($t('messages.updateSuccess'))
      } else {
        ElMessage.error($t('messages.saveFailed'))
        return
      }
    } else {
      const success = storageService.addFavorite(favoriteForm.value)
      if (success) {
        ElMessage.success($t('messages.addSuccess'))
      } else {
        ElMessage.warning($t('messages.alreadyInFavorites'))
        return
      }
    }
    
    loadFavorites() // 重新加载列表
    showAddDialog.value = false
    editingFavorite.value = null
    favoriteForm.value = { address: '', note: '' }
  } catch (error) {
    console.error('保存收藏失败:', error)
    ElMessage.error($t('messages.saveFailed') + '：' + error.message)
  }
}

// 删除收藏
const deleteFavorite = (favorite) => {
  ElMessageBox.confirm(
    $t('messages.confirmDelete'),
    $t('buttons.delete'),
    {
      confirmButtonText: $t('buttons.confirm'),
      cancelButtonText: $t('buttons.cancel'),
      type: 'warning'
    }
  ).then(() => {
    try {
      storageService.removeFavorite(favorite.id)
      loadFavorites() // 重新加载列表
      ElMessage.success($t('messages.deleteSuccess'))
    } catch (error) {
      ElMessage.error($t('messages.saveFailed') + '：' + error.message)
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