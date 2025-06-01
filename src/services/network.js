const dns = require('dns')
const axios = require('axios')
const { exec } = require('child_process')
const util = require('util')

// 将callback形式的函数转换为Promise形式
const execPromise = util.promisify(exec)
const dnsResolve4 = util.promisify(dns.resolve4)
const dnsResolve6 = util.promisify(dns.resolve6)
const dnsResolveCname = util.promisify(dns.resolveCname)
const dnsResolveMx = util.promisify(dns.resolveMx)

/**
 * 网络测试服务类
 */
class NetworkService {
  /**
   * 执行ping测试
   * @param {string} host - 目标主机
   * @param {Object} options - 测试选项
   * @returns {Promise} 返回ping测试结果
   */
  async pingHost(host, options = {}) {
    const { count = 4, size = 32, timeout = 3 } = options
    
    try {
      // 根据操作系统构建不同的 ping 命令
      let cmd
      if (process.platform === 'win32') {
        cmd = `ping -n ${count} -l ${size} -w ${timeout * 1000} ${host}`
      } else {
        // macOS/Linux - 使用简单的ping命令以确保显示每个回复的详细信息（包括TTL）
        cmd = `ping -c ${count} ${host}`
      }
      
      const { stdout } = await execPromise(cmd)
      return this.parsePingOutput(stdout, host)
    } catch (error) {
      console.error('Ping测试失败:', error)
      throw new Error(`Ping测试失败: ${error.message}`)
    }
  }

  /**
   * 执行HTTP测试
   * @param {string} url - 目标URL
   * @param {Object} options - 测试选项
   * @returns {Promise} 返回HTTP测试结果
   */
  async httpTest(url, options = {}) {
    const { method = 'GET', timeout = 5000, headers = {} } = options
    
    try {
      const start = Date.now()
      const response = await axios({
        method,
        url,
        timeout,
        headers,
        validateStatus: () => true // 接受所有状态码
      })
      const end = Date.now()
      
      return {
        url,
        method,
        status: response.status,
        statusText: response.statusText,
        time: end - start,
        headers: response.headers,
        size: JSON.stringify(response.data).length
      }
    } catch (error) {
      console.error('HTTP测试失败:', error)
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时')
      }
      throw new Error(`HTTP测试失败: ${error.message}`)
    }
  }

  /**
   * 执行DNS解析测试
   * @param {string} domain - 目标域名
   * @param {string} type - 记录类型 (A, AAAA, CNAME, MX)
   * @returns {Promise} 返回DNS解析结果
   */
  async dnsTest(domain, type = 'A') {
    try {
      const start = Date.now()
      let result
      
      switch (type.toUpperCase()) {
        case 'A':
          result = await dnsResolve4(domain)
          break
        case 'AAAA':
          result = await dnsResolve6(domain)
          break
        case 'CNAME':
          result = await dnsResolveCname(domain)
          break
        case 'MX':
          result = await dnsResolveMx(domain)
          break
        default:
          throw new Error(`不支持的DNS记录类型: ${type}`)
      }
      
      const end = Date.now()
      
      return {
        domain,
        type,
        records: result,
        time: end - start
      }
    } catch (error) {
      console.error('DNS测试失败:', error)
      throw new Error(`DNS解析失败: ${error.message}`)
    }
  }

  /**
   * 执行MTR测试
   * @param {string} host - 目标主机
   * @param {Object} options - 测试选项
   * @returns {Promise} 返回MTR测试结果
   */
  async mtrTest(host, options = {}) {
    const { count = 4 } = options
    
    try {
      let cmd
      if (process.platform === 'win32') {
        // Windows下使用pathping作为替代
        cmd = `pathping -n -q ${count} ${host}`
      } else {
        // macOS/Linux使用mtr
        cmd = `mtr -n -r -c ${count} ${host}`
      }
      
      const { stdout } = await execPromise(cmd)
      return this.parseMtrOutput(stdout, host)
    } catch (error) {
      console.error('MTR测试失败:', error)
      throw new Error(`MTR测试失败: ${error.message}`)
    }
  }

  /**
   * 执行路由追踪
   * @param {string} host - 目标主机
   * @param {Object} options - 测试选项
   * @returns {Promise} 返回路由追踪结果
   */
  async tracerouteTest(host, options = {}) {
    const { maxHops = 30 } = options
    
    try {
      let cmd
      if (process.platform === 'win32') {
        cmd = `tracert -h ${maxHops} ${host}`
      } else {
        cmd = `traceroute -m ${maxHops} ${host}`
      }
      
      const { stdout } = await execPromise(cmd)
      return this.parseTracerouteOutput(stdout, host)
    } catch (error) {
      console.error('路由追踪失败:', error)
      throw new Error(`路由追踪失败: ${error.message}`)
    }
  }

  /**
   * 解析ping输出结果
   * @private
   * @param {string} output - ping命令输出
   * @param {string} host - 目标主机
   * @returns {Object} 解析后的ping结果
   */
  parsePingOutput(output, host) {
    const result = {
      host,
      ip: '',
      min: 0,
      avg: 0,
      max: 0,
      loss: 0,
      ttl: 0,
      sent: 0,
      received: 0
    }
    
    // 从输出中提取IP地址
    const ipMatch = output.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)
    if (ipMatch) {
      result.ip = ipMatch[0]
    }
    
    // 解析统计信息
    if (process.platform === 'win32') {
      // Windows 输出解析
      const statsMatch = output.match(/最短 = (\d+)ms，最长 = (\d+)ms，平均 = (\d+)ms/)
      const lossMatch = output.match(/(\d+)% 丢失/)
      const ttlMatch = output.match(/TTL=(\d+)/)
      const packetMatch = output.match(/已发送 = (\d+)，已接收 = (\d+)/)
      
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
      if (packetMatch) {
        result.sent = parseInt(packetMatch[1])
        result.received = parseInt(packetMatch[2])
      }
    } else {
      // macOS/Linux 输出解析
      const statsMatch = output.match(/min\/avg\/max(?:\/mdev)? = ([\d.]+)\/([\d.]+)\/([\d.]+)/)
      const lossMatch = output.match(/(\d+(?:\.\d+)?)% packet loss/)
      const packetMatch = output.match(/(\d+) packets transmitted, (\d+) received/)
      
      if (statsMatch) {
        result.min = parseFloat(statsMatch[1])
        result.avg = parseFloat(statsMatch[2])
        result.max = parseFloat(statsMatch[3])
      }
      if (lossMatch) {
        result.loss = parseFloat(lossMatch[1])
      }
      if (packetMatch) {
        result.sent = parseInt(packetMatch[1])
        result.received = parseInt(packetMatch[2])
      }
      
      // 从每个ping回复中提取TTL值（如果有的话）
      const ttlMatches = output.match(/ttl=(\d+)/gi)
      if (ttlMatches && ttlMatches.length > 0) {
        // 取第一个TTL值
        const ttlMatch = ttlMatches[0].match(/ttl=(\d+)/i)
        if (ttlMatch) {
          result.ttl = parseInt(ttlMatch[1])
        }
      }
    }
    
    return result
  }

  /**
   * 解析MTR输出结果
   * @private
   * @param {string} output - MTR命令输出
   * @param {string} host - 目标主机
   * @returns {Object} 解析后的MTR结果
   */
  parseMtrOutput(output, host) {
    const lines = output.split('\n')
    const hops = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('HOST') || trimmed.startsWith('Start')) {
        continue
      }
      
      // 解析MTR输出行
      const fields = trimmed.split(/\s+/)
      if (fields.length >= 7) {
        const hop = {
          hop: parseInt(fields[0]) || hops.length + 1,
          host: fields[1] || '???',
          loss: parseFloat(fields[2]) || 0,
          sent: parseInt(fields[3]) || 0,
          last: parseFloat(fields[4]) || 0,
          avg: parseFloat(fields[5]) || 0,
          best: parseFloat(fields[6]) || 0,
          worst: parseFloat(fields[7]) || 0,
          stDev: parseFloat(fields[8]) || 0
        }
        hops.push(hop)
      }
    }
    
    return {
      host,
      hops
    }
  }

  /**
   * 解析traceroute输出结果
   * @private
   * @param {string} output - traceroute命令输出
   * @param {string} host - 目标主机
   * @returns {Object} 解析后的traceroute结果
   */
  parseTracerouteOutput(output, host) {
    const lines = output.split('\n')
    const hops = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('traceroute') || trimmed.startsWith('Tracing')) {
        continue
      }
      
      // 解析traceroute输出行
      const hopMatch = trimmed.match(/^\s*(\d+)\s+(.+)/)
      if (hopMatch) {
        const hopNum = parseInt(hopMatch[1])
        const hopData = hopMatch[2]
        
        // 提取IP地址和时间
        const ipMatch = hopData.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)
        const timeMatches = hopData.match(/([\d.]+)\s*ms/g)
        
        const hop = {
          hop: hopNum,
          ip: ipMatch ? ipMatch[1] : '???',
          times: timeMatches ? timeMatches.map(t => parseFloat(t)) : [],
          hostname: ''
        }
        
        // 尝试提取主机名
        const hostnameMatch = hopData.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
        if (hostnameMatch && hostnameMatch[1] !== hop.ip) {
          hop.hostname = hostnameMatch[1]
        }
        
        hops.push(hop)
      }
    }
    
    return {
      host,
      hops
    }
  }
}

module.exports = new NetworkService() 