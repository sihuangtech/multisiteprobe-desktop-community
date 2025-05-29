<template>
  <div class="card-header">
    <h3>{{ title }}</h3>
    <el-button-group>
      <el-button 
        type="primary" 
        @click="$emit('start-test')" 
        :loading="loading"
        v-if="showStartButton"
      >
        {{ startButtonText }}
      </el-button>
      <el-button 
        @click="$emit('clear-results')"
        v-if="showClearButton"
      >
        {{ clearButtonText }}
      </el-button>
      <el-button 
        @click="$emit('from-favorites')"
        v-if="showFavoritesButton"
      >
        {{ $t('buttons.fromFavorites') }}
      </el-button>
      <slot name="extra-buttons"></slot>
    </el-button-group>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入国际化服务
const $t = inject('$t')

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showStartButton: {
    type: Boolean,
    default: true
  },
  showClearButton: {
    type: Boolean,
    default: true
  },
  showFavoritesButton: {
    type: Boolean,
    default: true
  },
  startButtonText: {
    type: String,
    default: () => inject('$t')('buttons.start')
  },
  clearButtonText: {
    type: String,
    default: () => inject('$t')('buttons.clear')
  }
})

defineEmits(['start-test', 'clear-results', 'from-favorites'])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 