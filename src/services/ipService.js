/**
 * IP查询服务
 * 提供IP地理位置查询功能
 */
import storageService from './storage'

class IpService {
  constructor() {
    this.isElectron = window.electron && window.electron.ipcRenderer
  }

  /**
   * 查询IP地理位置信息
   * @param {string} ip - IP地址，传入'current'表示查询当前IP
   * @param {Object} customSettings - 自定义设置（可选）
   */
  async lookupIpLocation(ip, customSettings = null) {
    if (!this.isElectron) {
      throw new Error('此功能需要在Electron环境中运行')
    }

    try {
      // 获取用户设置
      let settings = customSettings
      if (!settings) {
        const apiSettings = storageService.getSettings('api') || {}
        settings = {
          ipLookupService: apiSettings.ipLookupService || 'auto',
          ip2locationApiKey: apiSettings.ip2locationApiKey || '',
          ipinfoToken: apiSettings.ipinfoToken || '',
          ipLookupTimeout: apiSettings.ipLookupTimeout || 8
        }
      }

      console.log('使用设置查询IP地理位置:', { ip, service: settings.ipLookupService })
      
      const result = await window.electron.ipcRenderer.invoke('ip2location-lookup', ip, settings)
      return result
    } catch (error) {
      console.error('IP地理位置查询失败:', error)
      throw new Error('IP地理位置查询失败: ' + error.message)
    }
  }

  /**
   * 批量查询IP地理位置信息
   * @param {Array} ips - IP地址数组
   * @param {Object} customSettings - 自定义设置（可选）
   */
  async batchLookupIpLocation(ips, customSettings = null) {
    if (!Array.isArray(ips) || ips.length === 0) {
      throw new Error('IP地址列表不能为空')
    }

    const results = []
    const errors = []

    // 获取并发限制设置
    const networkSettings = storageService.getSettings('network') || {}
    const maxConcurrency = networkSettings.maxConcurrency || 5

    // 分批处理
    for (let i = 0; i < ips.length; i += maxConcurrency) {
      const batch = ips.slice(i, i + maxConcurrency)
      const batchPromises = batch.map(async (ip, index) => {
        try {
          const result = await this.lookupIpLocation(ip, customSettings)
          return {
            index: i + index,
            ip,
            success: true,
            data: result
          }
        } catch (error) {
          return {
            index: i + index,
            ip,
            success: false,
            error: error.message
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result)
        } else {
          errors.push(result)
        }
      })
    }

    return {
      results,
      errors,
      total: ips.length,
      success: results.length,
      failed: errors.length
    }
  }

  /**
   * 验证IP地址格式
   * @param {string} ip - IP地址
   */
  validateIp(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  /**
   * 解析输入的IP/域名列表
   * @param {string} input - 输入文本
   */
  parseIpList(input) {
    if (!input || typeof input !== 'string') {
      return []
    }

    // 按行分割，去除空行和空白字符
    const lines = input.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const results = []
    const errors = []

    lines.forEach((line, index) => {
      // 简单的IP/域名验证
      if (this.validateIp(line) || this.validateDomain(line)) {
        results.push({
          index: index + 1,
          address: line,
          type: this.validateIp(line) ? 'ip' : 'domain'
        })
      } else {
        errors.push({
          index: index + 1,
          address: line,
          error: '无效的IP地址或域名格式'
        })
      }
    })

    return {
      valid: results,
      invalid: errors,
      total: lines.length
    }
  }

  /**
   * 验证域名格式
   * @param {string} domain - 域名
   */
  validateDomain(domain) {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
    return domainRegex.test(domain) && domain.length <= 253
  }

  /**
   * 获取支持的IP查询服务列表
   */
  getSupportedServices() {
    return [
      {
        id: 'auto',
        name: '自动选择',
        description: '智能选择最佳可用服务',
        type: 'auto',
        free: true,
        recommended: true
      },
      {
        id: 'ip-api',
        name: 'ip-api.com',
        description: '免费IP地理位置查询服务',
        type: 'free',
        free: true,
        recommended: true
      },
      {
        id: 'ipapi',
        name: 'ipapi.co',
        description: '免费IP地理位置查询服务',
        type: 'free',
        free: true,
        recommended: false
      },
      {
        id: 'ip2location',
        name: 'IP2Location',
        description: '高精度付费IP地理位置服务',
        type: 'paid',
        free: false,
        recommended: false,
        requiresKey: true
      },
      {
        id: 'ipinfo',
        name: 'IPInfo.io',
        description: '免费/付费IP地理位置服务',
        type: 'freemium',
        free: true,
        recommended: false
      }
    ]
  }

  /**
   * 测试IP查询服务连接
   * @param {string} serviceId - 服务ID
   * @param {Object} settings - 服务设置
   */
  async testService(serviceId, settings = {}) {
    try {
      const testIp = '8.8.8.8' // 使用Google DNS作为测试IP
      const customSettings = {
        ipLookupService: serviceId,
        ip2locationApiKey: settings.ip2locationApiKey || '',
        ipinfoToken: settings.ipinfoToken || '',
        ipLookupTimeout: 5 // 测试时使用较短超时
      }

      const startTime = Date.now()
      const result = await this.lookupIpLocation(testIp, customSettings)
      const endTime = Date.now()

      return {
        success: true,
        responseTime: endTime - startTime,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default new IpService() 