# 开发指南

本文档为 MultiSite Latency Tool 项目的开发者提供详细的开发指南。

## 📋 目录

- [开发环境设置](#开发环境设置)
- [项目架构](#项目架构)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [调试指南](#调试指南)
- [构建和发布](#构建和发布)
- [常见问题](#常见问题)

## 🛠 开发环境设置

### 系统要求

- **Node.js**: 16.0 或更高版本
- **npm**: 7.0 或更高版本
- **Git**: 用于版本控制
- **操作系统**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

### 快速开始

1. **克隆项目**
   ```bash
   git clone https://gitee.com/Snake-Konginchrist/MultiSiteLatencyTool.git
   cd MultiSiteLatencyTool
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 创建 .env 文件
   cp .env.example .env
   
   # 编辑 .env 文件，设置API密钥
   IP2LOCATION_API_KEY=your_api_key_here
   ```

4. **启动开发服务器**
   ```bash
   # 使用npm命令
   npm run electron:dev
   
   # 或使用启动脚本
   ./start.sh        # macOS/Linux
   start.bat         # Windows
   ```

## 🏗 项目架构

### 技术栈

- **前端框架**: Vue 3.4 (Composition API)
- **UI组件库**: Element Plus 2.4
- **路由管理**: Vue Router 4.2
- **桌面框架**: Electron 33.2
- **构建工具**: Vite 5.4
- **HTTP客户端**: Axios
- **数据存储**: electron-store

### 目录结构

```
MultiSiteLatencyTool/
├── src/                    # 源代码目录
│   ├── components/         # Vue组件
│   │   ├── IpLookupView.vue   # IP查询页面
│   │   ├── PingView.vue       # Ping测试页面
│   │   ├── HttpView.vue       # HTTP测试页面
│   │   ├── DnsView.vue        # DNS测试页面
│   │   ├── MtrView.vue        # MTR测试页面
│   │   ├── TracerouteView.vue # 路由追踪页面
│   │   └── FavoritesView.vue  # 收藏夹页面
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── services/          # 业务服务
│   │   ├── ip2location.js     # IP地理位置服务
│   │   ├── network.js         # 网络测试服务
│   │   └── storage.js         # 数据存储服务
│   ├── utils/             # 工具函数
│   ├── App.vue            # 主应用组件
│   └── main.js            # Vue应用入口
├── public/                # 静态资源
├── dist/                  # 构建输出
├── main.js                # Electron主进程
├── preload.js             # 预加载脚本
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
└── README.md              # 项目说明
```

### 架构设计

#### 1. 主进程 (main.js)
- 负责创建和管理Electron窗口
- 处理IPC通信
- 执行系统级网络命令（ping、traceroute等）
- 管理应用生命周期

#### 2. 渲染进程 (Vue应用)
- 用户界面展示
- 用户交互处理
- 数据展示和管理
- 与主进程通信

#### 3. 服务层
- **IP2Location服务**: 处理IP地理位置查询
- **网络服务**: 封装各种网络测试功能
- **存储服务**: 管理本地数据存储

## 🔄 开发流程

### 1. 添加新功能

#### 步骤1: 创建视图组件
```bash
# 在 src/views/ 目录下创建新组件
touch src/views/NewFeatureView.vue
```

#### 步骤2: 配置路由
```javascript
// src/router/index.js
{
  path: '/new-feature',
  name: 'new-feature',
  component: () => import('../views/NewFeatureView.vue')
}
```

#### 步骤3: 添加导航菜单
```vue
<!-- src/App.vue -->
<el-menu-item index="/new-feature">
  <el-icon><YourIcon /></el-icon>
  新功能
</el-menu-item>
```

#### 步骤4: 实现业务逻辑
```javascript
// src/services/newFeature.js
class NewFeatureService {
  // 实现具体功能
}
```

### 2. 修改现有功能

1. 找到对应的视图组件
2. 修改组件逻辑
3. 更新相关服务
4. 测试功能

### 3. 添加新的网络测试

1. 在 `src/services/network.js` 中添加新方法
2. 在主进程 `main.js` 中添加IPC处理程序
3. 创建对应的视图组件
4. 配置路由和导航

## 📝 代码规范

### Vue组件规范

```vue
<template>
  <!-- 使用语义化的HTML结构 -->
  <div class="component-name">
    <!-- 内容 -->
  </div>
</template>

<script setup>
// 1. 导入依赖
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 2. 定义响应式数据
const loading = ref(false)
const form = reactive({
  // 表单数据
})

// 3. 定义方法
const handleSubmit = () => {
  // 处理逻辑
}

// 4. 生命周期钩子
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
/* 使用scoped样式避免污染 */
.component-name {
  /* 样式定义 */
}
</style>
```

### JavaScript规范

```javascript
// 使用const/let，避免var
const API_URL = 'https://api.example.com'
let currentUser = null

// 函数命名使用驼峰命名法
const getUserInfo = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}

// 类命名使用帕斯卡命名法
class NetworkService {
  constructor() {
    // 构造函数
  }
}
```

### 注释规范

```javascript
/**
 * 执行网络测试
 * @param {string} host - 目标主机
 * @param {Object} options - 测试选项
 * @param {number} options.timeout - 超时时间
 * @param {number} options.count - 测试次数
 * @returns {Promise<Object>} 测试结果
 */
async function performNetworkTest(host, options = {}) {
  // 实现逻辑
}
```

## 🐛 调试指南

### 1. 开发者工具

- **快捷键**: 
  - macOS: `Command + Shift + I`
  - Windows/Linux: `Ctrl + Shift + I`

### 2. 日志调试

```javascript
// 在代码中添加日志
console.log('调试信息:', data)
console.error('错误信息:', error)

// 在主进程中查看日志
// 日志会显示在启动终端中
```

### 3. Vue DevTools

1. 安装Vue DevTools浏览器扩展
2. 在开发者工具中查看Vue组件状态
3. 监控组件数据变化

### 4. 网络请求调试

```javascript
// 在axios请求中添加拦截器
axios.interceptors.request.use(config => {
  console.log('请求配置:', config)
  return config
})

axios.interceptors.response.use(
  response => {
    console.log('响应数据:', response)
    return response
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)
```

### 5. 常见问题调试

#### 问题1: Electron窗口不显示
```javascript
// 检查main.js中的窗口创建逻辑
// 确保开发模式下正确加载URL
if (isDev) {
  mainWindow.loadURL('http://localhost:3000')
} else {
  mainWindow.loadFile('dist/index.html')
}
```

#### 问题2: IPC通信失败
```javascript
// 确保主进程中注册了IPC处理程序
ipcMain.handle('test-function', async (event, data) => {
  // 处理逻辑
})

// 确保渲染进程中正确调用
const result = await window.electron.ipcRenderer.invoke('test-function', data)
```

## 🚀 构建和发布

### 开发构建

```bash
# 启动开发服务器
npm run electron:dev

# 预览生产版本
npm run electron:preview
```

### 生产构建

```bash
# 构建所有平台
npm run electron:build

# 构建特定平台
npm run dist:mac     # macOS
npm run dist:win     # Windows
npm run dist:linux   # Linux
```

### 构建配置

构建配置在 `package.json` 的 `build` 字段中：

```json
{
  "build": {
    "appId": "cn.skstudio.multisitelatencytool",
    "productName": "MultiSiteLatencyTool",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "main.js",
      "preload.js"
    ]
  }
}
```

### 发布流程

1. **更新版本号**
   ```bash
   npm version patch  # 补丁版本
   npm version minor  # 次要版本
   npm version major  # 主要版本
   ```

2. **构建应用**
   ```bash
   npm run electron:build
   ```

3. **测试构建结果**
   - 在不同操作系统上测试安装包
   - 验证所有功能正常工作

4. **发布到仓库**
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   git tag v1.0.0
   git push origin main --tags
   ```

## ❓ 常见问题

### Q1: 如何添加新的网络测试功能？

A: 按照以下步骤：
1. 在 `src/services/network.js` 中添加新的测试方法
2. 在 `main.js` 中添加对应的IPC处理程序
3. 创建新的视图组件
4. 配置路由和导航菜单

### Q2: 如何修改UI样式？

A: 
1. 对于全局样式，修改 `src/App.vue` 中的样式
2. 对于组件样式，在对应组件的 `<style scoped>` 中修改
3. 使用Element Plus的主题定制功能

### Q3: 如何添加新的API服务？

A:
1. 在 `src/services/` 目录下创建新的服务文件
2. 使用axios进行HTTP请求
3. 在组件中导入并使用服务

### Q4: 如何处理跨平台兼容性？

A:
1. 使用 `process.platform` 检测操作系统
2. 为不同平台编写不同的命令
3. 在网络服务中处理平台差异

### Q5: 如何优化应用性能？

A:
1. 使用Vue的懒加载路由
2. 避免在组件中进行重复的网络请求
3. 使用防抖和节流优化用户交互
4. 合理使用缓存机制

## 📚 参考资料

- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Electron 官方文档](https://www.electronjs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [IP2Location API 文档](https://www.ip2location.com/web-service)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

欢迎提交 Issue 和 Pull Request！ 