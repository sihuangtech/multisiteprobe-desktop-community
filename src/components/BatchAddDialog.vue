<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    width="500px"
  >
    <el-input
      v-model="inputText"
      type="textarea"
      :rows="6"
      :placeholder="placeholder"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="confirmAdd">
          确认添加
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '批量添加'
  },
  placeholder: {
    type: String,
    default: '请输入要添加的内容，每行一个'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const inputText = ref('')

// 确认添加
const confirmAdd = () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入要添加的内容')
    return
  }
  
  const items = inputText.value.split('\n')
    .map(item => item.trim())
    .filter(item => item)
  
  if (items.length === 0) {
    ElMessage.warning('没有有效的内容可添加')
    return
  }
  
  emit('confirm', items)
  emit('update:modelValue', false)
  inputText.value = ''
  ElMessage.success(`已添加 ${items.length} 个项目`)
}

// 监听对话框关闭，清空输入
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    inputText.value = ''
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 