const { ping } = require('ping')
const { traceroute } = require('traceroute')
const dns = require('dns')
const axios = require('axios')
const { exec } = require('child_process')
const util = require('util')

// 将callback形式的函数转换为Promise形式
const execPromise = util.promisify(exec)
const dnsResolve = util.promisify(dns.resolve)

/**
 * 网络测试服务类
 */
class NetworkService {
  /**
   * 执行ping测试
   * @param {string} host - 目标主机
   * @returns {Promise} 返回ping测试结果
   */
  async pingHost(host) {
    try {
      const result = await ping.promise.probe(host, {
        timeout: 10,
        extra: ['-c', '4']
      })
      return {
        host: result.host,
        alive: result.alive,
        time: result.time,
        min: result.min,
        max: result.max,
        avg: result.avg,
        packetLoss: result.packetLoss
      }
    } catch (error) {
      console.error('Ping测试失败:', error)
      throw error
    }
  }

  /**
   * 执行HTTP测试
   * @param {string} url - 目标URL
   * @returns {Promise} 返回HTTP测试结果
   */
  async httpTest(url) {
    try {
      const start = Date.now()
      const response = await axios.get(url)
      const end = Date.now()
      return {
        url,
        status: response.status,
        statusText: response.statusText,
        time: end - start,
        headers: response.headers
      }
    } catch (error) {
      console.error('HTTP测试失败:', error)
      throw error
    }
  }

  /**
   * 执行DNS解析测试
   * @param {string} domain - 目标域名
   * @returns {Promise} 返回DNS解析结果
   */
  async dnsTest(domain) {
    try {
      const start = Date.now()
      const addresses = await dnsResolve(domain)
      const end = Date.now()
      return {
        domain,
        addresses,
        time: end - start
      }
    } catch (error) {
      console.error('DNS测试失败:', error)
      throw error
    }
  }

  /**
   * 执行MTR测试
   * @param {string} host - 目标主机
   * @returns {Promise} 返回MTR测试结果
   */
  async mtrTest(host) {
    try {
      const { stdout } = await execPromise(`mtr -n -r -c 4 ${host}`)
      return this.parseMtrOutput(stdout)
    } catch (error) {
      console.error('MTR测试失败:', error)
      throw error
    }
  }

  /**
   * 执行路由追踪
   * @param {string} host - 目标主机
   * @returns {Promise} 返回路由追踪结果
   */
  async tracerouteTest(host) {
    return new Promise((resolve, reject) => {
      const hops = []
      traceroute.trace(host, {
        maxHops: 30,
        timeout: 5
      }, (err, hop) => {
        if (err) {
          reject(err)
          return
        }
        if (hop) {
          hops.push(hop)
        } else {
          resolve(hops)
        }
      })
    })
  }

  /**
   * 解析MTR输出结果
   * @private
   * @param {string} output - MTR命令输出
   * @returns {Object[]} 解析后的MTR结果
   */
  parseMtrOutput(output) {
    const lines = output.split('\n')
    const hops = []
    
    for (let i = 2; i < lines.length - 1; i++) {
      const fields = lines[i].trim().split(/\s+/)
      if (fields.length >= 10) {
        hops.push({
          hop: parseInt(fields[0]),
          host: fields[1],
          loss: parseFloat(fields[2]),
          sent: parseInt(fields[3]),
          last: parseFloat(fields[4]),
          avg: parseFloat(fields[5]),
          best: parseFloat(fields[6]),
          worst: parseFloat(fields[7]),
          stDev: parseFloat(fields[8])
        })
      }
    }
    
    return hops
  }
}

export default new NetworkService() 