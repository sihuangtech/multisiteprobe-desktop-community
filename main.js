'use strict';

// 引入Electron模块
const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const Store = require('./electron-store-wrapper');

// 引入工具模块
const ipcHandlers = require(path.join(__dirname, 'src/utils/ipcHandlers'));

// 创建窗口的函数
function createWindow() {
    // 检查 preload 脚本路径
    const preloadPath = path.join(__dirname, 'preload.js');
    
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'assets/icon.png'), // 设置窗口图标
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: preloadPath,
            // 在构建版本中允许网络请求
            webSecurity: false, // 在生产环境中允许跨域请求
            allowRunningInsecureContent: true, // 允许不安全内容
            experimentalFeatures: true // 启用实验性功能
        }
    });

    // 根据环境加载不同的URL
    const isDev = process.env.NODE_ENV === 'development'
    
    if (isDev) {
        // 开发模式下加载开发服务器地址
        mainWindow.loadURL('http://localhost:3000').catch(err => {
            console.error('Failed to load URL:', err)
        })
        
        // 支持多种快捷键打开开发者工具
        mainWindow.webContents.on('before-input-event', (event, input) => {
            // F12 键
            if (input.key.toLowerCase() === 'f12') {
                mainWindow.webContents.toggleDevTools()
            }
            // Command+Option+I (Mac) 或 Ctrl+Shift+I (Windows/Linux)
            if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') {
                mainWindow.webContents.toggleDevTools()
            }
            // Command+Option+J (Mac) 或 Ctrl+Shift+J (Windows/Linux)
            if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'j') {
                mainWindow.webContents.toggleDevTools()
            }
        })
    } else {
        mainWindow.loadFile('dist/index.html').catch(err => {
            console.error('Failed to load file:', err)
        })
    }

    // 阻止新窗口在Electron内部打开，强制使用默认浏览器
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // 使用默认浏览器打开外部链接
        shell.openExternal(url)
        return { action: 'deny' }
    })

    // 兼容旧版本的new-window事件
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        shell.openExternal(url)
    })
}

// 当Electron完成初始化时被调用
app.whenReady().then(() => {
    // 在Linux构建版本中设置更宽松的安全策略
    if (process.platform === 'linux' && process.env.NODE_ENV !== 'development') {
        // 允许不安全的HTTP请求
        app.commandLine.appendSwitch('--ignore-certificate-errors');
        app.commandLine.appendSwitch('--ignore-ssl-errors');
        app.commandLine.appendSwitch('--ignore-certificate-errors-spki-list');
        app.commandLine.appendSwitch('--disable-web-security');
        app.commandLine.appendSwitch('--allow-running-insecure-content');
        app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
    }
    
    createWindow()

    // 移除默认菜单栏
    Menu.setApplicationMenu(null);

    app.on('activate', function () {
        // 在macOS上，当点击dock图标并且没有其他窗口打开时，
        // 通常在应用程序中重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 监听所有窗口关闭事件
app.on('window-all-closed', function () {
    // 在macOS上，除非用户用Cmd + Q确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') app.quit()
})

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
})

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// 注册 IPC 处理程序
ipcMain.handle('resolve-dns', ipcHandlers.handleDnsResolve);
ipcMain.handle('dns-test', ipcHandlers.handleDnsTest);
ipcMain.handle('open-external', (event, url) => ipcHandlers.handleOpenExternal(event, url, shell));
ipcMain.handle('ping-test', ipcHandlers.handlePingTest);
ipcMain.handle('http-test', ipcHandlers.handleHttpTest);
ipcMain.handle('ip2location-lookup', ipcHandlers.handleIp2LocationLookup);
ipcMain.handle('check-mtr-status', ipcHandlers.handleCheckMtrStatus);
ipcMain.handle('check-traceroute-status', ipcHandlers.handleCheckTracerouteStatus);
ipcMain.handle('mtr-test', ipcHandlers.handleMtrTest);
ipcMain.handle('traceroute-test', ipcHandlers.handleTracerouteTest);