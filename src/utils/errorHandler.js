/**
 * 错误处理工具模块
 * 提供统一的错误处理和分类功能
 */

class ErrorHandler {
    /**
     * 处理网络错误
     * @param {Error} error - 错误对象
     * @param {string} context - 错误上下文
     * @returns {Object} 处理后的错误信息
     */
    static handleNetworkError(error, context = '') {
        const errorInfo = {
            originalError: error,
            context,
            type: this._classifyError(error),
            message: this._formatErrorMessage(error, context),
            suggestions: this._getErrorSuggestions(error)
        };

        console.error('网络错误处理:', errorInfo);
        return errorInfo;
    }

    /**
     * 分类错误类型
     * @param {Error} error - 错误对象
     * @returns {string} 错误类型
     */
    static _classifyError(error) {
        const errorTypes = {
            'ENOTFOUND': 'DNS_RESOLUTION_FAILED',
            'ECONNREFUSED': 'CONNECTION_REFUSED',
            'ETIMEDOUT': 'CONNECTION_TIMEOUT',
            'ESOCKETTIMEDOUT': 'SOCKET_TIMEOUT',
            'ECONNRESET': 'CONNECTION_RESET',
            'EPROTO': 'PROTOCOL_ERROR',
            'EPROTONOSUPPORT': 'PROTOCOL_NOT_SUPPORTED',
            'CERT_HAS_EXPIRED': 'SSL_CERT_EXPIRED',
            'UNABLE_TO_VERIFY_LEAF_SIGNATURE': 'SSL_CERT_INVALID',
            'SELF_SIGNED_CERT_IN_CHAIN': 'SSL_SELF_SIGNED'
        };

        return errorTypes[error.code] || 'UNKNOWN_ERROR';
    }

    /**
     * 格式化错误消息
     * @param {Error} error - 错误对象
     * @param {string} context - 错误上下文
     * @returns {string} 格式化后的错误消息
     */
    static _formatErrorMessage(error, context) {
        const messages = {
            'ENOTFOUND': `域名解析失败: ${context}`,
            'ECONNREFUSED': `连接被拒绝: ${context}`,
            'ETIMEDOUT': `连接超时: ${context}`,
            'ESOCKETTIMEDOUT': `Socket超时: ${context}`,
            'ECONNRESET': `连接被重置: ${context}`,
            'EPROTO': `协议错误: ${error.message}`,
            'EPROTONOSUPPORT': `不支持的协议: ${error.message}`,
            'CERT_HAS_EXPIRED': `SSL证书已过期: ${context}`,
            'UNABLE_TO_VERIFY_LEAF_SIGNATURE': `SSL证书验证失败: ${context}`,
            'SELF_SIGNED_CERT_IN_CHAIN': `自签名证书: ${context}`
        };

        return messages[error.code] || `网络错误: ${error.message}`;
    }

    /**
     * 获取错误建议
     * @param {Error} error - 错误对象
     * @returns {Array} 建议列表
     */
    static _getErrorSuggestions(error) {
        const suggestions = {
            'ENOTFOUND': [
                '检查域名是否正确',
                '检查网络连接',
                '尝试使用不同的DNS服务器'
            ],
            'ECONNREFUSED': [
                '检查目标服务是否运行',
                '检查防火墙设置',
                '确认端口号是否正确'
            ],
            'ETIMEDOUT': [
                '检查网络连接',
                '增加超时时间',
                '尝试稍后重试'
            ],
            'ESOCKETTIMEDOUT': [
                '检查网络稳定性',
                '增加超时时间',
                '检查代理设置'
            ],
            'ECONNRESET': [
                '检查网络稳定性',
                '尝试重新连接',
                '检查服务器状态'
            ],
            'CERT_HAS_EXPIRED': [
                '联系网站管理员更新证书',
                '尝试使用HTTP协议',
                '检查系统时间是否正确'
            ],
            'UNABLE_TO_VERIFY_LEAF_SIGNATURE': [
                '检查证书链',
                '尝试忽略SSL验证',
                '联系网站管理员'
            ],
            'SELF_SIGNED_CERT_IN_CHAIN': [
                '添加证书到信任列表',
                '尝试忽略SSL验证',
                '使用HTTP协议'
            ]
        };

        return suggestions[error.code] || ['检查网络连接', '稍后重试'];
    }

    /**
     * 判断是否为临时错误
     * @param {Error} error - 错误对象
     * @returns {boolean} 是否为临时错误
     */
    static isTemporaryError(error) {
        const temporaryErrors = [
            'ETIMEDOUT',
            'ESOCKETTIMEDOUT',
            'ECONNRESET',
            'ECONNREFUSED'
        ];

        return temporaryErrors.includes(error.code);
    }

    /**
     * 判断是否应该重试
     * @param {Error} error - 错误对象
     * @param {number} retryCount - 当前重试次数
     * @param {number} maxRetries - 最大重试次数
     * @returns {boolean} 是否应该重试
     */
    static shouldRetry(error, retryCount, maxRetries = 3) {
        if (retryCount >= maxRetries) {
            return false;
        }

        return this.isTemporaryError(error);
    }

    /**
     * 获取重试延迟时间
     * @param {number} retryCount - 重试次数
     * @returns {number} 延迟时间（毫秒）
     */
    static getRetryDelay(retryCount) {
        // 指数退避算法
        return Math.min(1000 * Math.pow(2, retryCount), 10000);
    }

    /**
     * 记录错误日志
     * @param {Error} error - 错误对象
     * @param {string} operation - 操作名称
     * @param {Object} context - 上下文信息
     */
    static logError(error, operation, context = {}) {
        const logData = {
            timestamp: new Date().toISOString(),
            operation,
            error: {
                message: error.message,
                code: error.code,
                stack: error.stack
            },
            context,
            platform: process.platform,
            nodeVersion: process.version
        };

        console.error(`[${operation}] 错误详情:`, logData);
    }
}

module.exports = ErrorHandler; 