'use strict';

// CommonJS 包装器，避免 ESM 加载问题
let Store;

try {
  // electron-store >= 11 为纯 ESM 包，Node 22+ 的 require(esm) 会返回命名空间对象，
  // 需要取出 default 导出才是 Store 类
  const mod = require('electron-store');
  Store = (mod && mod.default) ? mod.default : mod;
} catch (e) {
  console.error('Failed to load electron-store:', e);
  // 提供一个简单的后备实现
  Store = class {
    constructor() {
      this.data = {};
    }
    get(key) {
      return this.data[key];
    }
    set(key, value) {
      this.data[key] = value;
    }
    delete(key) {
      delete this.data[key];
    }
  };
}

module.exports = Store; 