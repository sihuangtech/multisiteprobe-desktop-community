# MultiSiteLatencyTool

MultiSiteLatencyTool 是一个开源项目，旨在提供一个简单易用的界面，让用户能够同时测量多个指定网站的延迟，并显示这些网站的 IP 地址及其所在地域信息。用户不仅可以通过该工具快速了解各个网站的访问速度，还能方便地编辑和管理需要测量的网站列表。此外，该工具还集成了 IP2Location.io 的 IP 地理定位服务，帮助用户直观地了解网站服务器的地理分布。通过并发测量技术，MultiSiteLatencyTool 能够高效地处理多个网站的延迟测量任务，为用户提供全面的网络性能分析报告。

## 功能

- 测量多个网站的延迟
- 显示网站的 IP 地址
- 获取 IP 地址的地理位置信息
- 简单易用的用户界面
- 并发测量多个网站

## 安装

1. 克隆项目到本地：

   ```bash
   git clone https://github.com/Snake-Konginchrist/MultiSiteLatencyTool.git
   ```

2. 进入项目目录：

   ```bash
   cd MultiSiteLatencyTool
   ```

3. 安装依赖项：

   ```bash
   npm install
   ```

## 配置

在 `src/geoip.js` 文件中，替换 `YOUR_IP2LOCATION_API_KEY` 为你的 IP2Location.io API 密钥：

```javascript
const IP2LOCATION_API_KEY = 'YOUR_IP2LOCATION_API_KEY'; // 请替换为你的 IP2Location.io API 密钥
```

## 使用

1. 启动应用程序：

   ```bash
   npm start
   ```

2. 在应用程序窗口中，输入要测量的网站 URL 列表，每行一个 URL。

3. 点击“测量延迟”按钮，查看测量结果。

## 文件结构

```plaintext
MultiSiteLatencyTool/
├── package.json
├── main.js
├── preload.js
├── renderer.js
├── index.html
├── assets/
│   └── styles.css
├── src/
│   ├── latency.js
│   └── geoip.js
└── node_modules/
```

- `package.json`: 项目的配置文件，包含项目的依赖项和脚本。
- `main.js`: 主进程文件，负责创建和管理应用窗口。
- `preload.js`: 预加载脚本，用于在渲染器进程中使用 Node.js 模块。
- `renderer.js`: 渲染器进程脚本，处理用户交互和 UI 更新。
- `index.html`: 应用的主页面。
- `assets/styles.css`: 应用的样式文件。
- `src/latency.js`: 负责测量网站延迟的模块。
- `src/geoip.js`: 负责获取 IP 地址和地理位置信息的模块。

## 常见问题

### 安装依赖项时遇到错误

如果在安装依赖项时遇到错误，请尝试以下步骤：

1. 确保没有其他进程正在使用项目文件夹。
2. 尝试删除 `node_modules` 文件夹和 `package-lock.json` 文件：

   ```bash
   rm -rf node_modules package-lock.json
   ```

3. 清理 npm 缓存：

   ```bash
   npm cache clean --force
   ```

4. 重新安装依赖项：

   ```bash
   npm install
   ```

### 启动应用程序时遇到错误

如果在启动应用程序时遇到错误，请确保已正确安装所有依赖项并已配置 IP2Location.io API 密钥。你也可以尝试以管理员权限运行终端，并执行以下命令以确保所有文件权限正确：

```bash
npm start
```

## 许可证

此项目基于 MIT 许可证开源。有关更多信息，请参阅 [LICENSE](LICENSE) 文件。