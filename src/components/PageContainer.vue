<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <slot name="header"></slot>
      </template>
      
      <slot></slot>
    </el-card>
    
    <!-- 对话框插槽 -->
    <slot name="dialogs"></slot>
  </div>
</template>

<script setup>
// 无需props和emits，完全通过插槽传递内容
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 