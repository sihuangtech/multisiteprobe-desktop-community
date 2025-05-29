<template>
  <div class="address-input-list">
    <div class="section-header">
      <h4>{{ title }}</h4>
      <el-button type="success" @click="addItem" size="small">
        <el-icon><Plus /></el-icon>
        {{ addButtonText }}
      </el-button>
    </div>
    
    <div class="address-list">
      <div 
        v-for="(item, index) in modelValue" 
        :key="item.id" 
        class="address-item"
      >
        <el-input
          :model-value="getItemValue(item)"
          @update:model-value="updateItem(index, $event)"
          :placeholder="placeholder"
          clearable
        >
          <template #prepend>
            <span class="item-number">{{ index + 1 }}</span>
          </template>
          <template #append>
            <el-button 
              @click="removeItem(index)" 
              type="danger" 
              size="small"
              :disabled="modelValue.length <= 1"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <div class="batch-actions">
      <el-button @click="clearAll" size="small">
        {{ $t('buttons.clearAll') }}
      </el-button>
      <el-button @click="$emit('batch-add')" size="small">
        {{ $t('buttons.batchAdd') }}
      </el-button>
      <el-button @click="$emit('from-favorites')" size="small" v-if="showFavoritesButton">
        {{ $t('buttons.fromFavorites') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

// 注入国际化服务
const $t = inject('$t')

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '目标地址列表'
  },
  placeholder: {
    type: String,
    default: '请输入地址'
  },
  addButtonText: {
    type: String,
    default: '添加地址'
  },
  valueKey: {
    type: String,
    default: 'address'
  },
  showFavoritesButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'batch-add', 'from-favorites'])

// 获取条目的值
const getItemValue = (item) => {
  return item[props.valueKey] || ''
}

// 更新条目
const updateItem = (index, value) => {
  const newList = [...props.modelValue]
  newList[index] = { ...newList[index], [props.valueKey]: value }
  emit('update:modelValue', newList)
}

// 添加条目
const addItem = () => {
  const newItem = {
    id: Date.now(),
    [props.valueKey]: ''
  }
  emit('update:modelValue', [...props.modelValue, newItem])
}

// 删除条目
const removeItem = (index) => {
  if (props.modelValue.length > 1) {
    const newList = [...props.modelValue]
    newList.splice(index, 1)
    emit('update:modelValue', newList)
  }
}

// 清空所有
const clearAll = () => {
  const newItem = {
    id: Date.now(),
    [props.valueKey]: ''
  }
  emit('update:modelValue', [newItem])
}
</script>

<style scoped>
.address-input-list {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-item {
  width: 100%;
}

.item-number {
  display: inline-block;
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: #606266;
}

.batch-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}
</style> 