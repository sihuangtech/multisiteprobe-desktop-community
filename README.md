# MultiSiteLatencyTool (多站点延迟测试工具)

一个基于 Electron + Vue3 的多功能网络测试工具，用于测量多个网站的延迟并获取 IP 地理位置信息。

## 功能特性

- �� IP/域名地理位置查询
  - 支持多标签页查询
  - 每个标签页可独立设置域名
  - 显示详细的地理位置信息
  - 支持导出查询结果

- 🔍 多种网络测试功能
  - Ping 测试：测量网络延迟和丢包率
  - HTTP 测试：测试网站响应时间和状态
  - DNS 测试：测试域名解析性能
  - MTR 测试：网络路径分析
  - 路由追踪：显示数据包经过的路由

- ⭐ 收藏夹功能
  - 本地持久化存储收藏记录
  - 支持添加、编辑、删除收藏
  - 支持备注和搜索功能
  - 一键启动各种网络测试

## 安装说明

1. 克隆项目
```bash
git clone https://gitee.com/Snake-Konginchrist/MultiSiteLatencyTool.git
cd MultiSiteLatencyTool
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```
编辑 `.env` 文件，设置 IP2Location API 密钥

## 使用方法

### 开发模式
```bash
npm run electron:dev
```

### 预览生产版本
```bash
npm run electron:preview
```

### 构建应用
```bash
# 构建所有平台
npm run electron:build

# 构建特定平台
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

## 快捷键

- 开发者工具：
  - macOS: `Command + Shift + I`
  - Windows/Linux: `Ctrl + Shift + I`

## 技术栈

- Electron 33.2
- Vue 3.4
- Element Plus 2.4
- Vite 5.4

## 依赖项

- `electron-store`: 数据持久化
- `axios`: HTTP 请求
- `ping`: ICMP 测试
- `traceroute`: 路由追踪
- `mtr`: MTR 测试

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

[MIT License](LICENSE)