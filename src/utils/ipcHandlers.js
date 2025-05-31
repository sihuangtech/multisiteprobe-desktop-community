const dns = require('dns');
const util = require('util');
const { exec } = require('child_process');
const https = require('https');
const http = require('http');

const toolChecker = require('./toolChecker');
const networkTests = require('./networkTests');

// 将dns.resolve4转换为Promise形式
const dnsResolve4 = util.promisify(dns.resolve4);
const execPromise = util.promisify(exec);

/**
 * DNS 解析处理程序
 */
async function handleDnsResolve(event, domain) {
    try {
        const ips = await dnsResolve4(domain);
        return ips[0]; // 返回第一个IP地址
    } catch (error) {
        console.error('DNS解析失败:', error);
        return domain; // 如果解析失败，返回原始输入
    }
}

/**
 * 打开外部链接处理程序
 */
async function handleOpenExternal(event, url, shell) {
    try {
        await shell.openExternal(url);
        return { success: true };
    } catch (error) {
        console.error('打开外部链接失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Ping 测试处理程序
 */
async function handlePingTest(event, options) {
    const { host, count = 4, size = 32, timeout = 3 } = options;
    
    try {
        // 根据操作系统构建不同的 ping 命令
        let cmd;
        if (process.platform === 'win32') {
            cmd = `ping -n ${count} -l ${size} -w ${timeout * 1000} ${host}`;
        } else {
            cmd = `ping -c ${count} -s ${size} -W ${timeout} ${host}`;
        }
        
        console.log('执行ping命令:', cmd);
        const { stdout } = await execPromise(cmd);
        console.log('ping输出:', stdout);
        
        // 解析输出结果
        const result = {
            host,
            ip: '',
            min: 0,
            avg: 0,
            max: 0,
            loss: 0,
            ttl: 0
        };
        
        // 从输出中提取IP地址
        const ipMatch = stdout.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        if (ipMatch) {
            result.ip = ipMatch[0];
        }
        
        // 解析统计信息
        if (process.platform === 'win32') {
            // Windows 输出解析
            const statsMatch = stdout.match(/最短 = (\d+)ms，最长 = (\d+)ms，平均 = (\d+)ms/);
            const lossMatch = stdout.match(/(\d+)% 丢失/);
            const ttlMatch = stdout.match(/TTL=(\d+)/);
            
            if (statsMatch) {
                result.min = parseInt(statsMatch[1]);
                result.max = parseInt(statsMatch[2]);
                result.avg = parseInt(statsMatch[3]);
            }
            if (lossMatch) {
                result.loss = parseInt(lossMatch[1]);
            }
            if (ttlMatch) {
                result.ttl = parseInt(ttlMatch[1]);
            }
        } else {
            // macOS/Linux 输出解析
            const statsMatch = stdout.match(/min\/avg\/max(?:\/mdev)? = ([\d.]+)\/([\d.]+)\/([\d.]+)/);
            const lossMatch = stdout.match(/(\d+)% packet loss/);
            const ttlMatch = stdout.match(/ttl=(\d+)/);
            
            if (statsMatch) {
                result.min = parseFloat(statsMatch[1]);
                result.avg = parseFloat(statsMatch[2]);
                result.max = parseFloat(statsMatch[3]);
            }
            if (lossMatch) {
                result.loss = parseInt(lossMatch[1]);
            }
            if (ttlMatch) {
                result.ttl = parseInt(ttlMatch[1]);
            }
        }
        
        return result;
    } catch (error) {
        console.error('ping测试失败:', error);
        throw new Error(`Ping测试失败: ${error.message}`);
    }
}

/**
 * IP2Location 查询处理程序
 */
async function handleIp2LocationLookup(event, ip, userSettings = null) {
    return new Promise(async (resolve, reject) => {
        try {
            // 获取用户设置，如果没有传入则使用默认设置
            const settings = userSettings || {
                ipLookupService: 'auto',
                ip2locationApiKey: '',
                ipinfoToken: '',
                ipLookupTimeout: 8
            };

            let targetIp = ip;
            
            // 如果传入的是'current'，则先获取当前IP
            if (ip === 'current') {
                console.log('检测到查询当前IP请求，正在获取当前IP...');
                
                // 定义所有可用的IP地理位置服务，它们都能返回当前IP
                const currentIpServices = {
                    'ip-api': {
                        name: 'ip-api',
                        url: `http://ip-api.com/json/?fields=status,message,country,regionName,city,isp,query`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data);
                            if (result.status === 'success') {
                                return {
                                    ip: result.query,
                                    country_name: result.country,
                                    region_name: result.regionName,
                                    city_name: result.city,
                                    isp: result.isp
                                };
                            } else {
                                throw new Error(result.message || '查询失败');
                            }
                        }
                    },
                    'ipapi': {
                        name: 'ipapi',
                        url: `https://ipapi.co/json/`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data);
                            if (result.error) {
                                throw new Error(result.reason || '查询失败');
                            }
                            return {
                                ip: result.ip,
                                country_name: result.country_name,
                                region_name: result.region,
                                city_name: result.city,
                                isp: result.org
                            };
                        }
                    },
                    'ip2location': {
                        name: 'ip2location',
                        url: `https://api.ip2location.io/v2/ip?key=${settings.ip2locationApiKey}&format=json`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data);
                            if (result.error) {
                                throw new Error(result.error.error_message || '查询失败');
                            }
                            return {
                                ip: result.ip,
                                country_name: result.country_name,
                                region_name: result.region_name,
                                city_name: result.city_name,
                                isp: result.isp
                            };
                        },
                        requiresKey: true
                    },
                    'ipinfo': {
                        name: 'ipinfo',
                        url: settings.ipinfoToken 
                            ? `https://ipinfo.io/json?token=${settings.ipinfoToken}`
                            : `https://ipinfo.io/json`,
                        parseResponse: (data) => {
                            const result = JSON.parse(data);
                            if (result.error) {
                                throw new Error(result.error.message || '查询失败');
                            }
                            return {
                                ip: result.ip,
                                country_name: result.country,
                                region_name: result.region,
                                city_name: result.city,
                                isp: result.org
                            };
                        }
                    }
                };

                // 根据用户设置选择服务
                let servicesToTry = [];
                
                if (settings.ipLookupService === 'auto') {
                    // 自动模式：按优先级尝试所有可用服务
                    servicesToTry = ['ip-api', 'ipapi'];
                    
                    // 如果有API密钥，添加付费服务
                    if (settings.ip2locationApiKey) {
                        servicesToTry.unshift('ip2location'); // 优先使用付费服务
                    }
                    if (settings.ipinfoToken) {
                        servicesToTry.push('ipinfo');
                    } else {
                        servicesToTry.push('ipinfo'); // 免费版本
                    }
                } else {
                    // 指定服务模式
                    const selectedService = currentIpServices[settings.ipLookupService];
                    if (!selectedService) {
                        reject(new Error('不支持的IP查询服务'));
                        return;
                    }
                    
                    // 检查是否需要API密钥
                    if (selectedService.requiresKey && !settings.ip2locationApiKey) {
                        reject(new Error('IP2Location服务需要API密钥'));
                        return;
                    }
                    
                    servicesToTry = [settings.ipLookupService];
                }

                // 尝试查询当前IP和地理位置
                for (const serviceName of servicesToTry) {
                    const service = currentIpServices[serviceName];
                    if (!service) continue;

                    try {
                        console.log(`尝试使用 ${service.name} 查询当前IP和地理位置...`);
                        const result = await queryIpLocation(service, '', settings.ipLookupTimeout);
                        console.log(`成功从 ${service.name} 获取到当前IP信息:`, result);
                        
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
                        });
                        return;
                    } catch (error) {
                        console.error(`${service.name} 查询失败:`, error.message);
                        continue;
                    }
                }
                
                reject(new Error('所有IP查询服务都不可用'));
                return;
            }

            // 定义所有可用的IP地理位置服务（用于查询指定IP）
            const allServices = {
                'ip-api': {
                    name: 'ip-api',
                    url: `http://ip-api.com/json/${targetIp}?fields=status,message,country,regionName,city,isp,query`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data);
                        if (result.status === 'success') {
                            return {
                                country_name: result.country,
                                region_name: result.regionName,
                                city_name: result.city,
                                isp: result.isp
                            };
                        } else {
                            throw new Error(result.message || '查询失败');
                        }
                    }
                },
                'ipapi': {
                    name: 'ipapi',
                    url: `https://ipapi.co/${targetIp}/json/`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data);
                        if (result.error) {
                            throw new Error(result.reason || '查询失败');
                        }
                        return {
                            country_name: result.country_name,
                            region_name: result.region,
                            city_name: result.city,
                            isp: result.org
                        };
                    }
                },
                'ip2location': {
                    name: 'ip2location',
                    url: `https://api.ip2location.io/v2/ip?ip=${targetIp}&key=${settings.ip2locationApiKey}&format=json`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data);
                        if (result.error) {
                            throw new Error(result.error.error_message || '查询失败');
                        }
                        return {
                            country_name: result.country_name,
                            region_name: result.region_name,
                            city_name: result.city_name,
                            isp: result.isp
                        };
                    },
                    requiresKey: true
                },
                'ipinfo': {
                    name: 'ipinfo',
                    url: settings.ipinfoToken 
                        ? `https://ipinfo.io/${targetIp}?token=${settings.ipinfoToken}`
                        : `https://ipinfo.io/${targetIp}/json`,
                    parseResponse: (data) => {
                        const result = JSON.parse(data);
                        if (result.error) {
                            throw new Error(result.error.message || '查询失败');
                        }
                        return {
                            country_name: result.country,
                            region_name: result.region,
                            city_name: result.city,
                            isp: result.org
                        };
                    }
                }
            };

            // 根据用户设置选择服务
            let servicesToTry = [];
            
            if (settings.ipLookupService === 'auto') {
                // 自动模式：按优先级尝试所有可用服务
                servicesToTry = ['ip-api', 'ipapi'];
                
                // 如果有API密钥，添加付费服务
                if (settings.ip2locationApiKey) {
                    servicesToTry.unshift('ip2location'); // 优先使用付费服务
                }
                if (settings.ipinfoToken) {
                    servicesToTry.push('ipinfo');
                } else {
                    servicesToTry.push('ipinfo'); // 免费版本
                }
            } else {
                // 指定服务模式
                const selectedService = allServices[settings.ipLookupService];
                if (!selectedService) {
                    reject(new Error('不支持的IP查询服务'));
                    return;
                }
                
                // 检查是否需要API密钥
                if (selectedService.requiresKey && !settings.ip2locationApiKey) {
                    reject(new Error('IP2Location服务需要API密钥'));
                    return;
                }
                
                servicesToTry = [settings.ipLookupService];
            }

            // 尝试查询服务
            for (const serviceName of servicesToTry) {
                const service = allServices[serviceName];
                if (!service) continue;

                try {
                    console.log(`尝试使用 ${service.name} 查询IP地理位置...`);
                    const result = await queryIpLocation(service, targetIp, settings.ipLookupTimeout);
                    console.log(`成功从 ${service.name} 获取到地理位置信息:`, result);
                    
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
                    });
                    return;
                } catch (error) {
                    console.error(`${service.name} 查询失败:`, error.message);
                    continue;
                }
            }
            
            reject(new Error('所有IP地理位置服务都不可用'));
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 辅助函数：查询IP地理位置
 */
function queryIpLocation(service, ip, timeout = 8000) {
    return new Promise((resolve, reject) => {
        const url = new URL(service.url);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            timeout: timeout * 1000,
            headers: {
                'User-Agent': 'MultiSiteLatencyTool/1.0'
            }
        };

        const protocol = url.protocol === 'https:' ? https : http;
        
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = service.parseResponse(data);
                    resolve(result);
                } catch (error) {
                    reject(new Error('解析响应失败: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('请求失败: ' + error.message));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('请求超时'));
        });

        req.end();
    });
}

/**
 * MTR 状态检查处理程序
 */
async function handleCheckMtrStatus(event) {
    return await toolChecker.checkMtrStatus();
}

/**
 * MTR 测试处理程序
 */
async function handleMtrTest(event, address, options) {
    return await networkTests.executeMtrTest(address, options);
}

/**
 * 路由追踪测试处理程序
 */
async function handleTracerouteTest(event, address, options) {
    return await networkTests.executeTracerouteTest(address, options);
}

module.exports = {
    handleDnsResolve,
    handleOpenExternal,
    handlePingTest,
    handleIp2LocationLookup,
    handleCheckMtrStatus,
    handleMtrTest,
    handleTracerouteTest
}; 