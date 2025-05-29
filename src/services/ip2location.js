/**
 * IP2Location API服务类
 */
class IP2LocationService {
  /**
   * 查询单个IP地址的地理位置信息
   * @param {string} ip - IP地址
   * @returns {Promise} 返回IP地址的地理位置信息
   */
  async lookup(ip) {
    try {
      // 通过IPC调用主进程进行IP地理位置查询
      const result = await window.electron.ipcRenderer.invoke('ip2location-lookup', ip)
      return result
    } catch (error) {
      console.error('IP查询失败:', error)
      throw error
    }
  }

  /**
   * 批量查询IP地址的地理位置信息
   * @param {string[]} ips - IP地址数组
   * @returns {Promise} 返回批量IP地址的地理位置信息
   */
  async batchLookup(ips) {
    try {
      // 批量查询：逐个调用单个查询
      const results = []
      for (const ip of ips) {
        try {
          const result = await this.lookup(ip)
          results.push({ ip, ...result })
        } catch (error) {
          console.error(`查询IP ${ip} 失败:`, error)
          results.push({ 
            ip, 
            error: error.message,
            country_name: '-',
            region_name: '-',
            city_name: '-',
            isp: '-'
          })
        }
      }
      return results
    } catch (error) {
      console.error('批量IP查询失败:', error)
      throw error
    }
  }
}

export default new IP2LocationService() 