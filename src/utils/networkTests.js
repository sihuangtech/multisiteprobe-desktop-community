/**
 * 网络测试服务
 * 统一的网络测试功能入口，整合各个测试服务模块
 */

const { executeMtrTest, parseMtrOutput } = require('./mtrService');
const { executeTracerouteTest, parseTracerouteOutput } = require('./tracerouteService');

module.exports = {
    executeMtrTest,
    executeTracerouteTest,
    parseMtrOutput,
    parseTracerouteOutput
}; 