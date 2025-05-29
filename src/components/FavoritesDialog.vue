<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="$t('favorites.selectFromFavorites')"
    width="500px"
  >
    <el-table
      :data="favorites"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="address" :label="$t('table.address')" />
      <el-table-column prop="note" :label="$t('table.note')" />
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">{{ $t('buttons.cancel') }}</el-button>
        <el-button type="primary" @click="addSelected">
          {{ $t('favorites.addToList') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue'
import { ElMessage } from 'element-plus'
import storageService from '../services/storage'

// 注入国际化服务
const $t = inject('$t')

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'selected'])

const favorites = ref([])
const selectedFavorites = ref([])

// 加载收藏列表
const loadFavorites = () => {
  favorites.value = storageService.getFavorites()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedFavorites.value = selection
}

// 添加选中项
const addSelected = () => {
  if (selectedFavorites.value.length === 0) {
    ElMessage.warning($t('messages.pleaseSelectItems'))
    return
  }
  
  emit('selected', selectedFavorites.value)
  emit('update:modelValue', false)
  selectedFavorites.value = []
  ElMessage.success(`${$t('messages.addSuccess')} ${selectedFavorites.value.length} ${$t('table.address')}`)
}

// 组件挂载时加载收藏列表
onMounted(() => {
  loadFavorites()
})

// 监听对话框打开，重新加载收藏列表
const handleDialogOpen = () => {
  if (props.modelValue) {
    loadFavorites()
  }
}

// 监听modelValue变化
watch(() => props.modelValue, handleDialogOpen)
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 