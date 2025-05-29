/**
 * 数据存储服务类
 * 使用localStorage作为存储后端，兼容浏览器环境
 */
class StorageService {
  constructor() {
    this.FAVORITES_KEY = 'multisitelatencytool_favorites'
    this.SETTINGS_KEY_PREFIX = 'multisitelatencytool_settings_'
    this.HISTORY_KEY = 'multisitelatencytool_history'
  }

  /**
   * 获取所有收藏的站点
   * @returns {Array} 收藏的站点列表
   */
  getFavorites() {
    try {
      const data = localStorage.getItem(this.FAVORITES_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      return []
    }
  }

  /**
   * 保存收藏列表
   * @param {Array} favorites - 收藏列表
   */
  saveFavorites(favorites) {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('保存收藏列表失败:', error)
    }
  }

  /**
   * 添加站点到收藏夹
   * @param {Object} site - 站点信息
   * @param {string} site.address - IP地址或域名
   * @param {string} site.note - 备注信息
   * @returns {boolean} 添加是否成功
   */
  addFavorite(site) {
    try {
      const favorites = this.getFavorites()
      if (!favorites.some(f => f.address === site.address)) {
        favorites.push({
          id: Date.now(),
          ...site,
          createdAt: new Date().toISOString()
        })
        this.saveFavorites(favorites)
        return true
      }
      return false
    } catch (error) {
      console.error('添加收藏失败:', error)
      return false
    }
  }

  /**
   * 从收藏夹中删除站点
   * @param {string} id - 站点ID
   * @returns {boolean} 删除是否成功
   */
  removeFavorite(id) {
    try {
      const favorites = this.getFavorites()
      const newFavorites = favorites.filter(f => f.id !== id)
      if (newFavorites.length !== favorites.length) {
        this.saveFavorites(newFavorites)
        return true
      }
      return false
    } catch (error) {
      console.error('删除收藏失败:', error)
      return false
    }
  }

  /**
   * 更新收藏站点的信息
   * @param {string} id - 站点ID
   * @param {Object} updates - 更新的信息
   * @returns {boolean} 更新是否成功
   */
  updateFavorite(id, updates) {
    try {
      const favorites = this.getFavorites()
      const index = favorites.findIndex(f => f.id === id)
      if (index !== -1) {
        favorites[index] = {
          ...favorites[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.saveFavorites(favorites)
        return true
      }
      return false
    } catch (error) {
      console.error('更新收藏失败:', error)
      return false
    }
  }

  /**
   * 搜索收藏的站点
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的站点列表
   */
  searchFavorites(keyword) {
    try {
      const favorites = this.getFavorites()
      if (!keyword) return favorites
      
      const lowerKeyword = keyword.toLowerCase()
      return favorites.filter(f => 
        f.address.toLowerCase().includes(lowerKeyword) ||
        (f.note && f.note.toLowerCase().includes(lowerKeyword))
      )
    } catch (error) {
      console.error('搜索收藏失败:', error)
      return []
    }
  }

  // 设置相关方法
  getSettings(category) {
    try {
      const key = this.SETTINGS_KEY_PREFIX + category
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`获取${category}设置失败:`, error)
      return null
    }
  }

  saveSettings(category, settings) {
    try {
      const key = this.SETTINGS_KEY_PREFIX + category
      localStorage.setItem(key, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error(`保存${category}设置失败:`, error)
      throw error
    }
  }

  getAllSettings() {
    try {
      const settings = {}
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.SETTINGS_KEY_PREFIX)
      )
      
      keys.forEach(key => {
        const category = key.replace(this.SETTINGS_KEY_PREFIX, '')
        settings[category] = this.getSettings(category)
      })
      
      return settings
    } catch (error) {
      console.error('获取所有设置失败:', error)
      return {}
    }
  }

  // 历史记录相关方法
  getHistory() {
    try {
      const data = localStorage.getItem(this.HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('获取历史记录失败:', error)
      return []
    }
  }

  addHistory(item) {
    try {
      const history = this.getHistory()
      const newItem = {
        id: Date.now(),
        ...item,
        timestamp: new Date().toISOString()
      }
      
      // 添加到历史记录开头
      history.unshift(newItem)
      
      // 限制历史记录数量
      const maxRecords = this.getSettings('data')?.maxHistoryRecords || 1000
      if (history.length > maxRecords) {
        history.splice(maxRecords)
      }
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
      return newItem
    } catch (error) {
      console.error('添加历史记录失败:', error)
      throw error
    }
  }

  clearHistory() {
    try {
      localStorage.removeItem(this.HISTORY_KEY)
      return true
    } catch (error) {
      console.error('清除历史记录失败:', error)
      throw error
    }
  }

  // 数据管理方法
  exportAllData() {
    try {
      return {
        favorites: this.getFavorites(),
        settings: this.getAllSettings(),
        history: this.getHistory(),
        exportTime: new Date().toISOString(),
        version: '1.0.0'
      }
    } catch (error) {
      console.error('导出数据失败:', error)
      throw error
    }
  }

  importAllData(data) {
    try {
      // 验证数据格式
      if (!data || typeof data !== 'object') {
        throw new Error('无效的数据格式')
      }

      // 导入收藏夹
      if (data.favorites && Array.isArray(data.favorites)) {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(data.favorites))
      }

      // 导入设置
      if (data.settings && typeof data.settings === 'object') {
        Object.keys(data.settings).forEach(category => {
          this.saveSettings(category, data.settings[category])
        })
      }

      // 导入历史记录
      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history))
      }

      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      throw error
    }
  }

  clearAll() {
    try {
      // 获取所有相关的键
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('multisitelatencytool_')
      )
      
      // 删除所有相关数据
      keys.forEach(key => localStorage.removeItem(key))
      
      return true
    } catch (error) {
      console.error('清除所有数据失败:', error)
      throw error
    }
  }

  // 获取存储使用情况
  getStorageInfo() {
    try {
      const info = {
        favoritesCount: this.getFavorites().length,
        historyCount: this.getHistory().length,
        settingsCategories: Object.keys(this.getAllSettings()).length,
        totalSize: 0
      }

      // 计算总存储大小（近似值）
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('multisitelatencytool_')) {
          info.totalSize += localStorage.getItem(key).length
        }
      })

      return info
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return {
        favoritesCount: 0,
        historyCount: 0,
        settingsCategories: 0,
        totalSize: 0
      }
    }
  }
}

export default new StorageService() 