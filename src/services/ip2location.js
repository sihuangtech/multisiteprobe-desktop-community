import axios from 'axios'

// IP2Location API配置
const API_KEY = process.env.IP2LOCATION_API_KEY
const BASE_URL = 'https://api.ip2location.io'

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
      const response = await axios.get(`${BASE_URL}/v2/ip`, {
        params: {
          ip,
          key: API_KEY,
          format: 'json'
        }
      })
      return response.data
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
      const response = await axios.post(`${BASE_URL}/v2/bulk`, {
        ips,
        key: API_KEY,
        format: 'json'
      })
      return response.data
    } catch (error) {
      console.error('批量IP查询失败:', error)
      throw error
    }
  }
}

export default new IP2LocationService() 