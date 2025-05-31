/**
 * IP地理位置查询服务
 * 提供统一的IP地理位置查询功能
 */

/**
 * 获取IP服务实例
 */
function getIpService() {
    return {
        async lookupIpLocation(ip) {
            try {
                // 从存储中读取用户的API设置
                const fs = require('fs');
                const path = require('path');
                const os = require('os');
                
                // 构建设置文件路径
                const settingsPath = path.join(os.homedir(), '.electron-app', 'settings.json');
                let settings = {
                    ipLookupService: 'auto',
                    ip2locationApiKey: '',
                    ipinfoToken: '',
                    ipLookupTimeout: 8
                };
                
                try {
                    if (fs.existsSync(settingsPath)) {
                        const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                        if (settingsData.api) {
                            settings = {
                                ipLookupService: settingsData.api.ipLookupService || 'auto',
                                ip2locationApiKey: settingsData.api.ip2locationApiKey || '',
                                ipinfoToken: settingsData.api.ipinfoToken || '',
                                ipLookupTimeout: settingsData.api.ipLookupTimeout || 8
                            };
                        }
                    }
                } catch (error) {
                    console.error('读取IP查询设置失败，使用默认设置:', error);
                }
                
                console.log('使用IP查询设置:', settings);
                return await queryIpLocation(ip, settings);
            } catch (error) {
                console.error('IP地理位置查询失败:', error);
                return null;
            }
        }
    };
}

/**
 * 查询IP地理位置信息
 * @param {string} ip IP地址
 * @param {Object} settings 查询设置
 * @returns {Promise<string>} 地理位置信息
 */
async function queryIpLocation(ip, settings) {
    const https = require('https');
    const http = require('http');
    
    return new Promise((resolve) => {
        const timeout = (settings.ipLookupTimeout || 8) * 1000;
        
        // 根据用户设置选择查询服务
        let serviceUrl;
        let parseResponse;
        
        switch (settings.ipLookupService) {
            case 'ip2location':
                if (!settings.ip2locationApiKey) {
                    console.log(`IP ${ip} - IP2Location需要API密钥，跳过查询`);
                    resolve(''); // 没有API密钥，返回空
                    return;
                }
                serviceUrl = `https://api.ip2location.io/?key=${settings.ip2locationApiKey}&ip=${ip}&format=json`;
                parseResponse = (data) => {
                    const result = JSON.parse(data);
                    if (result.country_name) {
                        return `${result.city_name || ''}, ${result.region_name || ''}, ${result.country_name}`.replace(/^,\s*|,\s*$/g, '');
                    }
                    return '';
                };
                break;
                
            case 'ipinfo':
                serviceUrl = settings.ipinfoToken 
                    ? `https://ipinfo.io/${ip}/json?token=${settings.ipinfoToken}`
                    : `https://ipinfo.io/${ip}/json`;
                parseResponse = (data) => {
                    const result = JSON.parse(data);
                    if (result.country) {
                        return `${result.city || ''}, ${result.region || ''}, ${result.country}`.replace(/^,\s*|,\s*$/g, '');
                    }
                    return '';
                };
                break;
                
            case 'ipapi':
                serviceUrl = `https://ipapi.co/${ip}/json/`;
                parseResponse = (data) => {
                    const result = JSON.parse(data);
                    if (result.country_name) {
                        return `${result.city || ''}, ${result.region || ''}, ${result.country_name}`.replace(/^,\s*|,\s*$/g, '');
                    }
                    return '';
                };
                break;
                
            case 'ip-api':
            case 'auto':
            default:
                serviceUrl = `http://ip-api.com/json/${ip}?fields=country,regionName,city`;
                parseResponse = (data) => {
                    const result = JSON.parse(data);
                    // ip-api.com 直接返回数据，不需要检查status
                    if (result.country) {
                        return `${result.city || ''}, ${result.regionName || ''}, ${result.country || ''}`.replace(/^,\s*|,\s*$/g, '');
                    }
                    return '';
                };
                break;
        }
        
        console.log(`查询IP ${ip} - 使用服务: ${settings.ipLookupService}, URL: ${serviceUrl}`);
        
        const isHttps = serviceUrl.startsWith('https:');
        const request = isHttps ? https : http;
        
        const req = request.get(serviceUrl, { timeout }, (res) => {
            let data = '';
            console.log(`IP ${ip} - 响应状态码: ${res.statusCode}`);
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    console.log(`IP ${ip} - 原始响应数据:`, data);
                    const location = parseResponse(data);
                    console.log(`IP ${ip} - 解析后地理位置:`, location);
                    resolve(location);
                } catch (e) {
                    console.error(`解析IP ${ip} 地理位置失败:`, e);
                    console.error(`原始数据:`, data);
                    resolve('');
                }
            });
        });
        
        req.on('error', (error) => {
            console.error(`查询IP ${ip} 地理位置请求失败:`, error);
            resolve('');
        });
        
        req.on('timeout', () => {
            req.destroy();
            console.error(`查询IP ${ip} 地理位置超时`);
            resolve('');
        });
    });
}

/**
 * 判断是否为内网IP
 * @param {string} ip IP地址
 * @returns {boolean} 是否为内网IP
 */
function isPrivateIP(ip) {
    const parts = ip.split('.').map(Number);
    return (
        (parts[0] === 10) || // 10.0.0.0/8
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
        (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
        (parts[0] === 127) || // 127.0.0.0/8 (localhost)
        (parts[0] === 169 && parts[1] === 254) || // 169.254.0.0/16 (link-local)
        (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) // 100.64.0.0/10 (CGNAT)
    );
}

/**
 * 批量查询IP地理位置信息
 * @param {Array} hops 跳数数据数组
 * @param {string} testType 测试类型（用于日志显示）
 * @returns {Promise} 
 */
async function batchQueryIPLocations(hops, testType = '') {
    if (hops.length === 0) return;
    
    console.log(`开始查询${testType}地理位置信息...`);
    const ipService = getIpService();
    
    // 为了避免过多的并发请求，限制并发数
    const maxConcurrency = 3;
    for (let i = 0; i < hops.length; i += maxConcurrency) {
        const batch = hops.slice(i, i + maxConcurrency);
        const locationPromises = batch.map(async (hop) => {
            try {
                // 跳过超时跳数和内网IP地址
                if (hop.ip === '*') {
                    hop.location = '';
                    return;
                }
                
                if (isPrivateIP(hop.ip)) {
                    hop.location = '内网';
                    console.log(`IP ${hop.ip} 是内网地址，跳过查询`);
                    return;
                }
                
                const location = await ipService.lookupIpLocation(hop.ip);
                hop.location = location || '';
                console.log(`IP ${hop.ip} 地理位置:`, hop.location);
            } catch (error) {
                console.error(`查询IP ${hop.ip} 地理位置失败:`, error);
                hop.location = '';
            }
        });
        
        await Promise.all(locationPromises);
    }
    console.log(`${testType}地理位置查询完成`);
}

module.exports = {
    getIpService,
    queryIpLocation,
    isPrivateIP,
    batchQueryIPLocations
}; 