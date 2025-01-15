/*
  MultiSite Latency Tool

  Copyright (C) 2024 Snake Konginchrist

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// 引入Electron模块
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const dns = require('dns');
const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

// 将dns.resolve4转换为Promise形式
const dnsResolve4 = util.promisify(dns.resolve4);

// 初始化存储
Store.initRenderer();

// 创建窗口的函数
function createWindow() {
    console.log('Creating window...')
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // 根据环境加载不同的URL
    const isDev = process.env.NODE_ENV === 'development'
    console.log('Development mode:', isDev)
    
    if (isDev) {
        console.log('Loading development server URL...')
        // 开发模式下加载开发服务器地址
        mainWindow.loadURL('http://localhost:3000').catch(err => {
            console.error('Failed to load URL:', err)
        })
        // 只在按下快捷键时打开开发者工具
        mainWindow.webContents.on('before-input-event', (event, input) => {
            // Command+Option+I (Mac) 或 Ctrl+Shift+I (Windows/Linux)
            if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') {
                mainWindow.webContents.openDevTools()
            }
        })
    } else {
        console.log('Loading production build...')
        mainWindow.loadFile('dist/index.html').catch(err => {
            console.error('Failed to load file:', err)
        })
    }

    // 监听窗口准备就绪事件
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Window loaded successfully')
    })

    // 监听加载错误事件
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription)
    })
}

// 当Electron完成初始化时被调用
app.whenReady().then(() => {
    console.log('App is ready')
    createWindow()

    app.on('activate', function () {
        console.log('App activated')
        // 在macOS上，当点击dock图标并且没有其他窗口打开时，
        // 通常在应用程序中重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 监听所有窗口关闭事件
app.on('window-all-closed', function () {
    console.log('All windows closed')
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

// 添加 IPC 处理程序
ipcMain.handle('resolve-dns', async (event, domain) => {
    try {
        const ips = await dnsResolve4(domain)
        return ips[0] // 返回第一个IP地址
    } catch (error) {
        console.error('DNS解析失败:', error)
        return domain // 如果解析失败，返回原始输入
    }
})

// 添加 ping 测试处理程序
ipcMain.handle('ping-test', async (event, options) => {
    const { host, count = 4, size = 32, timeout = 3 } = options
    
    try {
        // 根据操作系统构建不同的 ping 命令
        let cmd
        if (process.platform === 'win32') {
            cmd = `ping -n ${count} -l ${size} -w ${timeout * 1000} ${host}`
        } else {
            cmd = `ping -c ${count} -s ${size} -W ${timeout} ${host}`
        }
        
        console.log('执行ping命令:', cmd)
        const { stdout } = await execPromise(cmd)
        console.log('ping输出:', stdout)
        
        // 解析输出结果
        const result = {
            host,
            ip: '',
            min: 0,
            avg: 0,
            max: 0,
            loss: 0,
            ttl: 0
        }
        
        // 从输出中提取IP地址
        const ipMatch = stdout.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)
        if (ipMatch) {
            result.ip = ipMatch[0]
        }
        
        // 解析统计信息
        if (process.platform === 'win32') {
            // Windows 输出解析
            const statsMatch = stdout.match(/最短 = (\d+)ms，最长 = (\d+)ms，平均 = (\d+)ms/)
            const lossMatch = stdout.match(/(\d+)% 丢失/)
            const ttlMatch = stdout.match(/TTL=(\d+)/)
            
            if (statsMatch) {
                result.min = parseInt(statsMatch[1])
                result.max = parseInt(statsMatch[2])
                result.avg = parseInt(statsMatch[3])
            }
            if (lossMatch) {
                result.loss = parseInt(lossMatch[1])
            }
            if (ttlMatch) {
                result.ttl = parseInt(ttlMatch[1])
            }
        } else {
            // macOS/Linux 输出解析
            const statsMatch = stdout.match(/min\/avg\/max(?:\/mdev)? = ([\d.]+)\/([\d.]+)\/([\d.]+)/)
            const lossMatch = stdout.match(/(\d+)% packet loss/)
            const ttlMatch = stdout.match(/ttl=(\d+)/)
            
            if (statsMatch) {
                result.min = parseFloat(statsMatch[1])
                result.avg = parseFloat(statsMatch[2])
                result.max = parseFloat(statsMatch[3])
            }
            if (lossMatch) {
                result.loss = parseInt(lossMatch[1])
            }
            if (ttlMatch) {
                result.ttl = parseInt(ttlMatch[1])
            }
        }
        
        return result
    } catch (error) {
        console.error('ping测试失败:', error)
        throw new Error(`Ping测试失败: ${error.message}`)
    }
})