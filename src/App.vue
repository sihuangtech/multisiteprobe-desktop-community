<template>
  <el-container class="app-container">
    <el-header>
      <el-menu mode="horizontal" router>
        <el-menu-item index="/">
          <el-icon><Search /></el-icon>
          IP/域名查询
        </el-menu-item>
        <el-menu-item index="/ping">
          <el-icon><Connection /></el-icon>
          Ping测试
        </el-menu-item>
        <el-menu-item index="/http">
          <el-icon><Monitor /></el-icon>
          HTTP测试
        </el-menu-item>
        <el-menu-item index="/dns">
          <el-icon><Share /></el-icon>
          DNS测试
        </el-menu-item>
        <el-menu-item index="/mtr">
          <el-icon><Histogram /></el-icon>
          MTR测试
        </el-menu-item>
        <el-menu-item index="/traceroute">
          <el-icon><Position /></el-icon>
          路由追踪
        </el-menu-item>
        <el-menu-item index="/favorites">
          <el-icon><Star /></el-icon>
          收藏夹
        </el-menu-item>
      </el-menu>
    </el-header>
    
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { Search, Connection, Monitor, Share, Histogram, Position, Star } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.el-header {
  padding: 0;
  border-bottom: 1px solid #dcdfe6;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-menu-item [class^="el-icon-"] {
  margin-right: 5px;
  vertical-align: middle;
}
</style> 