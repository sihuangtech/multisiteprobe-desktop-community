const Store = require('electron-store')

/**
 * 数据存储服务类
 */
class StorageService {
  constructor() {
    this.store = new Store({
      name: 'favorites',
      defaults: {
        favorites: []
      }
    })
  }

  /**
   * 获取所有收藏的站点
   * @returns {Array} 收藏的站点列表
   */
  getFavorites() {
    return this.store.get('favorites')
  }

  /**
   * 添加站点到收藏夹
   * @param {Object} site - 站点信息
   * @param {string} site.address - IP地址或域名
   * @param {string} site.note - 备注信息
   * @returns {boolean} 添加是否成功
   */
  addFavorite(site) {
    const favorites = this.getFavorites()
    if (!favorites.some(f => f.address === site.address)) {
      favorites.push({
        id: Date.now(),
        ...site,
        createdAt: new Date().toISOString()
      })
      this.store.set('favorites', favorites)
      return true
    }
    return false
  }

  /**
   * 从收藏夹中删除站点
   * @param {string} id - 站点ID
   * @returns {boolean} 删除是否成功
   */
  removeFavorite(id) {
    const favorites = this.getFavorites()
    const newFavorites = favorites.filter(f => f.id !== id)
    if (newFavorites.length !== favorites.length) {
      this.store.set('favorites', newFavorites)
      return true
    }
    return false
  }

  /**
   * 更新收藏站点的信息
   * @param {string} id - 站点ID
   * @param {Object} updates - 更新的信息
   * @returns {boolean} 更新是否成功
   */
  updateFavorite(id, updates) {
    const favorites = this.getFavorites()
    const index = favorites.findIndex(f => f.id === id)
    if (index !== -1) {
      favorites[index] = {
        ...favorites[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      this.store.set('favorites', favorites)
      return true
    }
    return false
  }

  /**
   * 搜索收藏的站点
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的站点列表
   */
  searchFavorites(keyword) {
    const favorites = this.getFavorites()
    if (!keyword) return favorites
    
    const lowerKeyword = keyword.toLowerCase()
    return favorites.filter(f => 
      f.address.toLowerCase().includes(lowerKeyword) ||
      (f.note && f.note.toLowerCase().includes(lowerKeyword))
    )
  }
}

export default new StorageService() 