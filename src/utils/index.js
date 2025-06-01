/**
 * 工具模块索引
 * 统一导出所有服务模块
 */

// 核心服务模块
const dnsService = require('./dnsService');
const httpService = require('./httpService');
const pingService = require('./pingService');
const ipLocationService = require('./ipLocationService');

// 工具模块
const networkConfig = require('./networkConfig');
const ErrorHandler = require('./errorHandler');

// 网络测试模块
const toolChecker = require('./toolChecker');
const networkTests = require('./networkTests');

// IPC处理程序
const ipcHandlers = require('./ipcHandlers');

module.exports = {
    // 核心服务
    dnsService,
    httpService,
    pingService,
    ipLocationService,
    
    // 工具
    networkConfig,
    ErrorHandler,
    
    // 网络测试
    toolChecker,
    networkTests,
    
    // IPC处理
    ipcHandlers
}; 