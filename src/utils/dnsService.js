/**
 * DNS服务模块
 * 提供DNS解析和测试功能
 */

const dns = require('dns');
const util = require('util');
const ErrorHandler = require('./errorHandler');

class DnsService {
    constructor() {
        // 将DNS方法转换为Promise形式
        this.resolve4 = util.promisify(dns.resolve4);
        this.resolve6 = util.promisify(dns.resolve6);
        this.resolveCname = util.promisify(dns.resolveCname);
        this.resolveMx = util.promisify(dns.resolveMx);
        this.resolveTxt = util.promisify(dns.resolveTxt);
        this.resolveNs = util.promisify(dns.resolveNs);
        
        // 支持的记录类型
        this.supportedRecordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];
    }

    /**
     * 简单DNS解析（返回第一个IP地址）
     * @param {string} domain - 域名
     * @returns {Promise<string>} IP地址或原域名
     */
    async resolve(domain) {
        try {
            const ips = await this.resolve4(domain);
            return ips[0]; // 返回第一个IP地址
        } catch (error) {
            ErrorHandler.logError(error, 'DNS_SIMPLE_RESOLVE', { domain });
            return domain; // 如果解析失败，返回原始输入
        }
    }

    /**
     * DNS测试
     * @param {string} domain - 域名
     * @param {string} recordType - 记录类型
     * @param {string} dnsServer - DNS服务器（'default'表示系统默认）
     * @returns {Promise<Object>} 测试结果
     */
    async test(domain, recordType, dnsServer = 'default') {
        const startTime = Date.now();
        
        try {
            // 验证记录类型
            if (!this.supportedRecordTypes.includes(recordType.toUpperCase())) {
                throw new Error(`不支持的记录类型: ${recordType}`);
            }

            // 设置DNS服务器
            this._setDnsServer(dnsServer);
            
            console.log('DNS 测试:', { domain, recordType, dnsServer });
            
            // 执行DNS查询
            const result = await this._performDnsQuery(domain, recordType.toUpperCase());
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            return {
                success: true,
                domain,
                recordType,
                result: result.length > 0 ? result.join(', ') : '无记录',
                responseTime,
                dnsServer: dnsServer === 'default' ? '系统默认' : dnsServer
            };
            
        } catch (error) {
            ErrorHandler.logError(error, 'DNS_TEST', { domain, recordType, dnsServer });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            return {
                success: false,
                domain,
                recordType,
                result: `查询失败: ${error.message}`,
                responseTime,
                dnsServer: dnsServer === 'default' ? '系统默认' : dnsServer,
                error: error.message
            };
        }
    }

    /**
     * 批量DNS测试
     * @param {Array} queries - 查询列表 [{domain, recordType, dnsServer}]
     * @returns {Promise<Array>} 测试结果列表
     */
    async batchTest(queries) {
        const results = [];
        
        for (const query of queries) {
            const { domain, recordType, dnsServer } = query;
            try {
                const result = await this.test(domain, recordType, dnsServer);
                results.push(result);
            } catch (error) {
                ErrorHandler.logError(error, 'DNS_BATCH_TEST', query);
                results.push({
                    success: false,
                    domain,
                    recordType,
                    result: `批量测试失败: ${error.message}`,
                    responseTime: '-',
                    dnsServer: dnsServer === 'default' ? '系统默认' : dnsServer,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * 获取支持的记录类型
     * @returns {Array} 支持的记录类型列表
     */
    getSupportedRecordTypes() {
        return [...this.supportedRecordTypes];
    }

    /**
     * 验证域名格式
     * @param {string} domain - 域名
     * @returns {boolean} 是否有效
     */
    validateDomain(domain) {
        if (!domain || typeof domain !== 'string') {
            return false;
        }

        // 基本的域名格式验证
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain) && domain.length <= 253;
    }

    /**
     * 验证DNS服务器地址
     * @param {string} dnsServer - DNS服务器地址
     * @returns {boolean} 是否有效
     */
    validateDnsServer(dnsServer) {
        if (dnsServer === 'default') {
            return true;
        }

        // IPv4地址验证
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipv4Regex.test(dnsServer)) {
            const parts = dnsServer.split('.').map(Number);
            return parts.every(part => part >= 0 && part <= 255);
        }

        // IPv6地址验证（简化版）
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv6Regex.test(dnsServer);
    }

    /**
     * 设置DNS服务器
     * @param {string} dnsServer - DNS服务器地址
     * @private
     */
    _setDnsServer(dnsServer) {
        if (dnsServer !== 'default') {
            if (!this.validateDnsServer(dnsServer)) {
                throw new Error(`无效的DNS服务器地址: ${dnsServer}`);
            }
            dns.setServers([dnsServer]);
        } else {
            // 重置为系统默认DNS服务器
            dns.setServers([]);
        }
    }

    /**
     * 执行DNS查询
     * @param {string} domain - 域名
     * @param {string} recordType - 记录类型
     * @returns {Promise<Array>} 查询结果
     * @private
     */
    async _performDnsQuery(domain, recordType) {
        switch (recordType) {
            case 'A':
                return await this.resolve4(domain);
                
            case 'AAAA':
                return await this.resolve6(domain);
                
            case 'CNAME':
                return await this.resolveCname(domain);
                
            case 'MX':
                const mxRecords = await this.resolveMx(domain);
                return mxRecords.map(record => `${record.priority} ${record.exchange}`);
                
            case 'TXT':
                const txtRecords = await this.resolveTxt(domain);
                return txtRecords.map(record => record.join(''));
                
            case 'NS':
                return await this.resolveNs(domain);
                
            default:
                throw new Error(`不支持的记录类型: ${recordType}`);
        }
    }

    /**
     * 获取DNS服务器信息
     * @returns {Object} DNS服务器信息
     */
    getDnsServerInfo() {
        try {
            const servers = dns.getServers();
            return {
                current: servers,
                default: this._getSystemDefaultDns()
            };
        } catch (error) {
            ErrorHandler.logError(error, 'GET_DNS_SERVER_INFO');
            return {
                current: [],
                default: []
            };
        }
    }

    /**
     * 获取系统默认DNS服务器
     * @returns {Array} 默认DNS服务器列表
     * @private
     */
    _getSystemDefaultDns() {
        // 这里可以根据不同操作系统获取默认DNS
        // 目前返回常用的公共DNS服务器作为参考
        return [
            '8.8.8.8',      // Google DNS
            '8.8.4.4',      // Google DNS
            '1.1.1.1',      // Cloudflare DNS
            '1.0.0.1',      // Cloudflare DNS
            '208.67.222.222', // OpenDNS
            '208.67.220.220'  // OpenDNS
        ];
    }

    /**
     * 测试DNS服务器响应速度
     * @param {Array} dnsServers - DNS服务器列表
     * @param {string} testDomain - 测试域名
     * @returns {Promise<Array>} 测试结果
     */
    async testDnsServerSpeed(dnsServers, testDomain = 'google.com') {
        const results = [];
        
        for (const server of dnsServers) {
            try {
                const result = await this.test(testDomain, 'A', server);
                results.push({
                    server,
                    responseTime: result.responseTime,
                    success: result.success,
                    error: result.error
                });
            } catch (error) {
                ErrorHandler.logError(error, 'DNS_SERVER_SPEED_TEST', { server, testDomain });
                results.push({
                    server,
                    responseTime: -1,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // 按响应时间排序
        return results.sort((a, b) => {
            if (!a.success) return 1;
            if (!b.success) return -1;
            return a.responseTime - b.responseTime;
        });
    }
}

module.exports = new DnsService(); 