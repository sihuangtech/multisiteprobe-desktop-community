'use strict';

// CommonJS 包装器，避免 ESM 加载问题
let Store;

try {
  // 尝试使用 CommonJS 方式加载
  Store = require('electron-store');
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