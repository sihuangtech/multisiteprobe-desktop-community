<template>
  <div v-if="data.length > 0" class="results-table">
    <el-table :data="data" style="width: 100%" border>
      <el-table-column 
        v-for="column in columns" 
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
      >
        <template #default="{ row }" v-if="column.slot">
          <slot :name="column.slot" :row="row"></slot>
        </template>
        <template #default="{ row }" v-else-if="column.formatter">
          {{ column.formatter(row[column.prop], row) }}
        </template>
      </el-table-column>
      
      <!-- 操作列 -->
      <el-table-column 
        :label="$t('table.actions')" 
        width="100" 
        fixed="right"
        v-if="showActions"
      >
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="$emit('add-to-favorites', getAddressFromRow(row))"
          >
            {{ $t('buttons.favorite') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入国际化服务
const $t = inject('$t')

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  addressKey: {
    type: String,
    default: 'address'
  }
})

const emit = defineEmits(['add-to-favorites'])

// 从行数据中获取地址
const getAddressFromRow = (row) => {
  // 尝试多个可能的地址字段
  return row[props.addressKey] || row.url || row.domain || row.query || row.target || ''
}
</script>

<style scoped>
.results-table {
  margin-top: 20px;
}
</style> 