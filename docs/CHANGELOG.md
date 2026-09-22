# 更新日志

本文件记录了 MultiSite Latency Tool 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划中的功能

- [ ] 支持IPv6地址测试
- [ ] 添加网络质量评分功能
- [ ] 支持自定义DNS服务器
- [ ] 添加测试结果导出功能
- [ ] 支持多语言界面
- [ ] 添加网络监控功能
- [ ] 支持测试计划和定时任务

## [1.5.0] - 2026-09-22

### 变更 🔧

- 使用官方 npm CLI 将全部依赖升级至最新版本：Electron 36 → 44、Vite 6 → 8（切换至 rolldown 构建引擎）、vue-router 4 → 5、@vitejs/plugin-vue 5 → 6、element-plus 2.9 → 2.14、axios → 1.20、dotenv 16 → 18、electron-store → 11、electron-builder → 26.15 等

### 修复 🐛

- 适配 electron-store 11（纯 ESM 包）在 CommonJS 环境下的加载：更新 `electron-store-wrapper.js`，从 `require()` 返回的命名空间对象中正确取出 default 导出

## [1.4.3] - 2025-10-04

### 新增 ✨

- 添加 `FUNDING.yml` 配置文件，支持 GitHub 赞助

## [1.4.2] - 2025-08-16

### 变更 🔧

- 将 iOS（multisiteprobe）子项目移出主仓库，改为独立仓库维护
- 在 `.gitignore` 中忽略分离出来的 `multisiteprobe-ios/` 与 `multisiteprobe-android/`

### 移除 🗑

- 删除多余的项目文件和资源（iOS Xcode 工程文件等），简化项目结构

## [1.4.1] - 2025-06-30

### 新增 ✨

- 添加社交媒体宣传文案（`social_media_posts.md`）
- 添加视频脚本（`video_script.md`，含 Bilibili / YouTube 元数据）

### 变更 🔧

- 移除 TracerouteView 中的冗余工具状态检查和提示组件，进一步简化代码结构

## [1.4.0] - 2025-06-02

### 新增 ✨

- **HTTP 测试功能**：主进程新增 `http-test` IPC 通道，支持 GET/POST/HEAD 方法、自定义超时与请求头，HTTPS 连接失败时自动回退 HTTP，HttpView 接入真实请求（替代原模拟数据）
- **Traceroute 工具状态检查**：新增 `check-traceroute-status` IPC 通道
- **系统信息接口**：preload 暴露 `getSystemInfo`，返回平台、架构、Node / Electron 版本
- 新增 `dnsService.js` 服务模块（DNS 解析、记录查询）
- 新增 `errorHandler` 错误处理模块

### 变更 🔧

- 增强工具状态检查和网络请求功能：放宽构建版本的网络安全配置（允许跨域请求、不安全内容）
- 优化 ping 命令输出解析：改进 macOS/Linux 平台 TTL 值提取逻辑，支持小数丢包率
- 更新 `package.json` 描述为多站点运维检测工具
- 简化 TracerouteView 代码结构，移除工具状态提示组件，优化用户体验

## [1.3.0] - 2025-06-01

### 新增 ✨

- **DNS 测试功能**：支持 A / AAAA / CNAME / MX / TXT / NS 记录查询，支持自定义 DNS 服务器（Google、Cloudflare、114DNS、阿里云、百度、腾讯、Quad9、OpenDNS 等），DnsView 接入真实查询（替代原模拟数据）
- Windows 平台 MTR 改用内置 PathPing 工具，无需额外安装

## [1.2.2] - 2025-05-31

### 变更 🔧

- 重构主进程和渲染进程的 IPC 处理逻辑：将各类测试处理程序抽取到 `src/utils/ipcHandlers.js` 独立模块，大幅精简 main.js
- 优化 MTR 工具状态检查和路径管理：支持多路径自动检测（Homebrew、系统目录等），MTR 命令使用检测到的完整路径

### 新增 ✨

- 添加 `docs/HOMEPAGE.md` 主页宣传文档

## [1.2.1] - 2025-05-30

### 变更 🔧

- 更新项目名称和功能，优化用户体验（新增应用图标 icns/ico/png 多尺寸）

### 文档 📄

- `.gitignore` 添加 LaTeX 辅助文件规则
- 移动 `CHANGELOG.md` 与 `DEVELOPMENT.md` 至 `docs/` 目录
- 新增 `docs/DOCUMENT.md` 与 LaTeX 版设计文档 `docs/document.tex`

### 修复 🐛

- 修复窗口标题设置逻辑，支持多语言显示

## [1.2.0] - 2025-05-29

### 新增 ✨

- **用户界面组件化**：新增 AddressInputList、BatchAddDialog、FavoritesDialog、PageContainer、PageHeader、ResultsTable 等通用组件
- **国际化（i18n）**：新增 `i18nService` 与中英文语言包（zh-CN / en-US），界面支持简体中文和英文切换
- **设置页面**：新增 SettingsView 设置页
- **服务层**：新增 `ipService` / `network` / `storage` 服务模块，重构 `ip2location` 服务
- 添加 `start.sh` / `start.bat` 启动脚本与 `.env.example` 环境变量模板
- 添加 `electron-store-wrapper.js` 包装器，解决 electron-store 的 ESM 加载问题

### 变更 🔧

- 重构项目结构和功能，增强用户体验（各测试视图统一使用组件化布局）

## [1.1.0] - 2025-01-15

### 变更 🔧

- 全面重构项目：从单一文件架构升级为 Vue 3 + Vite + Element Plus 组件化架构
- 引入 Vue Router 路由管理，新增 HomeView、IpLookupView、PingView、HttpView、DnsView、MtrView、TracerouteView、FavoritesView 等视图
- 新增 `src/services/` 服务层（network、storage、ip2location）与 `vite.config.js` 构建配置

### 其他 📝

- README 中开源许可证由 MIT 更新为 GPL-3.0（注释说明）

## [1.0.3] - 2024-12-26

### 变更 🔧

- 更新依赖版本：axios 1.7.4、dotenv ^16.4.7、electron ^33.2.1
- 更新并精简 `package-lock.json`

## [1.0.2] - 2024-07-24

### 变更 🔧

- 开源许可证更新为 GPLv3：替换 LICENSE 文件内容并在各源码文件头部添加 GPL-3.0 声明

## [1.0.1] - 2024-07-17

### 新增 ✨

- 项目初始提交：基于 Electron + Vue 的跨平台网络测试工具基础架构
- 添加英文版 README（`README_en.md`）
- 添加 IP2Location.io API Key 环境变量存储（`.env`）

### 修复 🐛

- 修复中国大陆网络环境下因无法使用 Google DNS 服务导致的 IP 查询失败问题

---

## [1.0.0] - 2024-05-30

### 新增功能 ✨

- **IP/域名地理位置查询**
  - 支持批量查询多个IP地址或域名
  - 显示详细的地理位置信息（国家、地区、城市、ISP等）
  - 集成IP2Location API服务
  - 支持查询结果展示

- **Ping测试功能**
  - 支持多域名并发ping测试
  - 可配置数据包大小、超时时间、测试次数
  - 显示最小/平均/最大延迟和丢包率
  - 跨平台兼容（Windows、macOS、Linux）

- **HTTP测试功能**
  - 支持GET、POST、HEAD方法
  - 显示响应时间、状态码和响应头
  - 支持自定义超时时间
  - 批量测试多个URL

- **DNS测试功能**
  - 支持A、AAAA、CNAME、MX记录查询
  - 显示解析时间和结果
  - 批量域名解析测试

- **MTR测试功能**
  - 网络路径分析
  - 显示每个跳转点的详细信息
  - 支持自定义测试次数

- **路由追踪功能**
  - 显示数据包经过的完整路由路径
  - 支持自定义最大跳数
  - 显示每跳的IP地址和响应时间

- **收藏夹管理**
  - 本地持久化存储收藏记录
  - 支持添加、编辑、删除收藏
  - 支持备注和搜索功能
  - 一键启动各种网络测试

- **用户界面**
  - 现代化的图形界面设计
  - 基于Element Plus组件库
  - 水平导航菜单，支持页面切换
  - 响应式布局设计
  - 中文界面，操作简单直观

### 技术实现 🔧

- **前端框架**: Vue 3.4 + Composition API
- **UI组件库**: Element Plus 2.4
- **路由管理**: Vue Router 4.2
- **桌面框架**: Electron 33.2
- **构建工具**: Vite 5.4
- **HTTP客户端**: Axios
- **数据存储**: electron-store

### 开发工具 🛠

- 添加开发启动脚本（start.sh / start.bat）
- 完善的开发文档（DEVELOPMENT.md）
- 详细的README文档
- 英文版README文档
- 完整的.gitignore配置
- GPL-3.0开源许可证

### 架构设计 🏗

- **主进程**: 负责窗口管理和系统级网络命令执行
- **渲染进程**: Vue应用，处理用户界面和交互
- **服务层**: 模块化的业务服务（IP查询、网络测试、数据存储）
- **IPC通信**: 主进程和渲染进程间的安全通信

### 跨平台支持 🌍

- Windows 10+ 支持
- macOS 10.14+ 支持  
- Ubuntu 18.04+ 支持
- 自动检测操作系统并使用相应的网络命令

### 安全性 🔒

- 使用contextIsolation确保安全的IPC通信
- 环境变量管理敏感信息（API密钥）
- 输入验证和错误处理

---

## 版本说明

### 版本号格式

本项目使用语义化版本号：`主版本号.次版本号.修订号`

- **主版本号**: 当做了不兼容的API修改
- **次版本号**: 当做了向下兼容的功能性新增
- **修订号**: 当做了向下兼容的问题修正

### 变更类型

- `新增功能` - 新增的功能
- `变更` - 对现有功能的变更
- `废弃` - 即将移除的功能
- `移除` - 已移除的功能
- `修复` - 问题修复
- `安全` - 安全相关的修复

---

## 贡献指南

如果您想为本项目贡献代码，请：

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 问题反馈

如果您发现了bug或有功能建议，请在 [Issues](https://gitee.com/Snake-Konginchrist/MultiSiteLatencyTool/issues) 页面提交。
