<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <h2>多站点延迟测试工具</h2>
            </div>
          </template>
          <div class="feature-list">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="feature-card" @click="$router.push('/traceroute')">
                  <el-icon><Position /></el-icon>
                  <h3>路由追踪</h3>
                  <p>追踪数据包从源到目标的路径，显示每一跳的延迟和地理位置信息</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="$router.push('/favorites')">
                  <el-icon><Star /></el-icon>
                  <h3>收藏夹</h3>
                  <p>管理常用的目标地址，快速进行测试</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card">
                  <el-icon><Setting /></el-icon>
                  <h3>更多功能</h3>
                  <p>敬请期待...</p>
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
import { Position, Star, Setting } from '@element-plus/icons-vue'
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