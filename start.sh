#!/bin/bash

# MultiSite Latency Tool 启动脚本
# 用于快速启动开发环境

echo "🚀 MultiSite Latency Tool 启动脚本"
echo "=================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js 16.0或更高版本"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请确保Node.js正确安装"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接或尝试使用国内镜像"
        echo "   使用淘宝镜像: npm config set registry https://registry.npmmirror.com/"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到.env文件"
    echo "   请创建.env文件并配置IP2Location API密钥"
    echo "   示例内容:"
    echo "   IP2LOCATION_API_KEY=your_api_key_here"
    echo "   NODE_ENV=development"
    echo ""
    echo "   获取API密钥: https://www.ip2location.com/"
    echo ""
    read -p "是否继续启动？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🚀 正在启动开发服务器..."
echo "   - Vite开发服务器将在 http://localhost:3000 启动"
echo "   - Electron应用将自动打开"
echo "   - 按 Ctrl+C 停止服务"
echo ""

# 启动开发服务器
npm run electron:dev 