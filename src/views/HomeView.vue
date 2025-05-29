<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <h2>{{ $t('settings.appName') }}</h2>
            </div>
          </template>
          <div class="feature-list">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="feature-card" @click="$router.push('/traceroute')">
                  <el-icon><Position /></el-icon>
                  <h3>{{ $t('nav.traceroute') }}</h3>
                  <p>{{ $t('home.tracerouteDesc') }}</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="$router.push('/favorites')">
                  <el-icon><Star /></el-icon>
                  <h3>{{ $t('nav.favorites') }}</h3>
                  <p>{{ $t('home.favoritesDesc') }}</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card">
                  <el-icon><Setting /></el-icon>
                  <h3>{{ $t('home.moreFeatures') }}</h3>
                  <p>{{ $t('home.comingSoon') }}</p>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { Position, Star, Setting } from '@element-plus/icons-vue'

// 注入国际化服务
const $t = inject('$t')
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-list {
  margin-top: 20px;
}

.feature-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.feature-card .el-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin: 10px 0;
  font-size: 18px;
}

.feature-card p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}
</style> 