'use strict';

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
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('./electron-store-wrapper');
const dns = require('dns');
const util = require('util');
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const execPromise = util.promisify(exec);

// 将dns.resolve4转换为Promise形式
const dnsResolve4 = util.promisify(dns.resolve4);

// 创建窗口的函数
function createWindow() {
    console.log('Creating window...')
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
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

    // 阻止新窗口在Electron内部打开，强制使用默认浏览器
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        console.log('Attempting to open URL:', url)
        // 使用默认浏览器打开外部链接
        shell.openExternal(url)
        return { action: 'deny' }
    })

    // 兼容旧版本的new-window事件
    mainWindow.webContents.on('new-window', (event, url) => {
        console.log('New window requested for URL:', url)
        event.preventDefault()
        shell.openExternal(url)
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

// 添加打开外部链接的IPC处理程序
ipcMain.handle('open-external', async (event, url) => {
    try {
        console.log('IPC open-external called with URL:', url)
        console.log('Using shell.openExternal to open in default browser')
        await shell.openExternal(url)
        console.log('shell.openExternal completed successfully')
        return { success: true }
    } catch (error) {
        console.error('打开外部链接失败:', error)
        return { success: false, error: error.message }
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

// 添加IP2Location查询处理程序
ipcMain.handle('ip2location-lookup', async (event, ip, userSettings = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 获取用户设置，如果没有传入则使用默认设置
            const settings = userSettings || {
                ipLookupService: 'auto',
                ip2locationApiKey: '',
                ipinfoToken: '',
                ipLookupTimeout: 8
            }

            let targetIp = ip
            
            // 如果传入的是'current'，则先获取当前IP
            if (ip === 'current') {
                console.log('检测到查询当前IP请求，正在获取当前IP...')
                
                // 定义所有可用的IP地理位置服务，它们都能返回当前IP
                const currentIpServices = {
                    'ip-api': {
                        name: 'ip-api',
                        url: `http://ip-api.com/json/?fields=status,message,country,regionName,city,isp,query`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data)
                            if (result.status === 'success') {
                                return {
                                    ip: result.query,
                                    country_name: result.country,
                                    region_name: result.regionName,
                                    city_name: result.city,
                                    isp: result.isp
                                }
                            } else {
                                throw new Error(result.message || '查询失败')
                            }
                        }
                    },
                    'ipapi': {
                        name: 'ipapi',
                        url: `https://ipapi.co/json/`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data)
                            if (result.error) {
                                throw new Error(result.reason || '查询失败')
                            }
                            return {
                                ip: result.ip,
                                country_name: result.country_name,
                                region_name: result.region,
                                city_name: result.city,
                                isp: result.org
                            }
                        }
                    },
                    'ip2location': {
                        name: 'ip2location',
                        url: `https://api.ip2location.io/v2/ip?key=${settings.ip2locationApiKey}&format=json`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data)
                            if (result.error) {
                                throw new Error(result.error.error_message || '查询失败')
                            }
                            return {
                                ip: result.ip,
                                country_name: result.country_name,
                                region_name: result.region_name,
                                city_name: result.city_name,
                                isp: result.isp
                            }
                        },
                        requiresKey: true
                    },
                    'ipinfo': {
                        name: 'ipinfo',
                        url: settings.ipinfoToken 
                            ? `https://ipinfo.io/json?token=${settings.ipinfoToken}`
                            : `https://ipinfo.io/json`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data)
                            if (result.error) {
                                throw new Error(result.error.message || '查询失败')
                            }
                            return {
                                ip: result.ip,
                                country_name: result.country,
                                region_name: result.region,
                                city_name: result.city,
                                isp: result.org
                            }
                        }
                    }
                }

                // 根据用户设置选择服务
                let servicesToTry = []
                
                if (settings.ipLookupService === 'auto') {
                    // 自动模式：按优先级尝试所有可用服务
                    servicesToTry = ['ip-api', 'ipapi']
                    
                    // 如果有API密钥，添加付费服务
                    if (settings.ip2locationApiKey) {
                        servicesToTry.unshift('ip2location') // 优先使用付费服务
                    }
                    if (settings.ipinfoToken) {
                        servicesToTry.push('ipinfo')
                    } else {
                        servicesToTry.push('ipinfo') // 免费版本
                    }
                } else {
                    // 指定服务模式
                    const selectedService = currentIpServices[settings.ipLookupService]
                    if (!selectedService) {
                        reject(new Error('不支持的IP查询服务'))
                        return
                    }
                    
                    // 检查是否需要API密钥
                    if (selectedService.requiresKey && !settings.ip2locationApiKey) {
                        reject(new Error('IP2Location服务需要API密钥'))
                        return
                    }
                    
                    servicesToTry = [settings.ipLookupService]
                }

                // 尝试查询当前IP和地理位置
                for (const serviceName of servicesToTry) {
                    const service = currentIpServices[serviceName]
                    if (!service) continue

                    try {
                        console.log(`尝试使用 ${service.name} 查询当前IP和地理位置...`)
                        const result = await queryIpLocation(service, '', settings.ipLookupTimeout)
                        console.log(`成功从 ${service.name} 获取到当前IP信息:`, result)
                        
                        // 直接返回完整结果，包含IP和地理位置信息
                        resolve({
                            success: true,
                            data: {
                                ip: result.ip,
                                country: result.country_name,
                                region: result.region_name,
                                city: result.city_name,
                                isp: result.isp
                            },
                            service: service.name
                        })
                        return
                    } catch (error) {
                        console.error(`${service.name} 查询失败:`, error.message)
                        continue
                    }
                }
                
                reject(new Error('所有IP查询服务都不可用'))
                return
            }

            // 定义所有可用的IP地理位置服务（用于查询指定IP）
            const allServices = {
                'ip-api': {
                    name: 'ip-api',
                    url: `http://ip-api.com/json/${targetIp}?fields=status,message,country,regionName,city,isp,query`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data)
                        if (result.status === 'success') {
                            return {
                                country_name: result.country,
                                region_name: result.regionName,
                                city_name: result.city,
                                isp: result.isp
                            }
                        } else {
                            throw new Error(result.message || '查询失败')
                        }
                    }
                },
                'ipapi': {
                    name: 'ipapi',
                    url: `https://ipapi.co/${targetIp}/json/`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data)
                        if (result.error) {
                            throw new Error(result.reason || '查询失败')
                        }
                        return {
                            country_name: result.country_name,
                            region_name: result.region,
                            city_name: result.city,
                            isp: result.org
                        }
                    }
                },
                'ip2location': {
                    name: 'ip2location',
                    url: `https://api.ip2location.io/v2/ip?ip=${targetIp}&key=${settings.ip2locationApiKey}&format=json`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data)
                        if (result.error) {
                            throw new Error(result.error.error_message || '查询失败')
                        }
                        return {
                            country_name: result.country_name,
                            region_name: result.region_name,
                            city_name: result.city_name,
                            isp: result.isp
                        }
                    },
                    requiresKey: true
                },
                'ipinfo': {
                    name: 'ipinfo',
                    url: settings.ipinfoToken 
                        ? `https://ipinfo.io/${targetIp}?token=${settings.ipinfoToken}`
                        : `https://ipinfo.io/${targetIp}/json`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data)
                        if (result.error) {
                            throw new Error(result.error.message || '查询失败')
                        }
                        return {
                            country_name: result.country,
                            region_name: result.region,
                            city_name: result.city,
                            isp: result.org
                        }
                    }
                }
            }

            // 根据用户设置选择服务
            let servicesToTry = []
            
            if (settings.ipLookupService === 'auto') {
                // 自动模式：按优先级尝试所有可用服务
                servicesToTry = ['ip-api', 'ipapi']
                
                // 如果有API密钥，添加付费服务
                if (settings.ip2locationApiKey) {
                    servicesToTry.unshift('ip2location') // 优先使用付费服务
                }
                if (settings.ipinfoToken) {
                    servicesToTry.push('ipinfo')
                } else {
                    servicesToTry.push('ipinfo') // 免费版本
                }
            } else {
                // 指定服务模式
                const selectedService = allServices[settings.ipLookupService]
                if (!selectedService) {
                    reject(new Error('不支持的IP查询服务'))
                    return
                }
                
                // 检查是否需要API密钥
                if (selectedService.requiresKey && !settings.ip2locationApiKey) {
                    reject(new Error('IP2Location服务需要API密钥'))
                    return
                }
                
                servicesToTry = [settings.ipLookupService]
            }

            // 尝试查询服务
            for (const serviceName of servicesToTry) {
                const service = allServices[serviceName]
                if (!service) continue

                try {
                    console.log(`尝试使用 ${service.name} 查询IP地理位置...`)
                    const result = await queryIpLocation(service, targetIp, settings.ipLookupTimeout)
                    console.log(`成功从 ${service.name} 获取到地理位置信息:`, result)
                    
                    resolve({
                        success: true,
                        data: {
                            ip: targetIp,
                            country: result.country_name,
                            region: result.region_name,
                            city: result.city_name,
                            isp: result.isp
                        },
                        service: service.name
                    })
                    return
                } catch (error) {
                    console.error(`${service.name} 查询失败:`, error.message)
                    continue
                }
            }
            
            reject(new Error('所有IP地理位置服务都不可用'))
        } catch (error) {
            reject(error)
        }
    })
})

// 辅助函数：查询IP地理位置
function queryIpLocation(service, ip, timeout = 8000) {
    return new Promise((resolve, reject) => {
        const url = new URL(service.url)
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            timeout: timeout * 1000,
            headers: {
                'User-Agent': 'MultiSiteLatencyTool/1.0'
            }
        }

        const protocol = url.protocol === 'https:' ? https : http
        
        const req = protocol.request(options, (res) => {
            let data = ''
            
            res.on('data', (chunk) => {
                data += chunk
            })
            
            res.on('end', () => {
                try {
                    const result = service.parseResponse(data)
                    resolve(result)
                } catch (error) {
                    reject(new Error('解析响应失败: ' + error.message))
                }
            })
        })

        req.on('error', (error) => {
            reject(new Error('请求失败: ' + error.message))
        })

        req.on('timeout', () => {
            req.destroy()
            reject(new Error('请求超时'))
        })

        req.end()
    })
}