/**
 * HTTP测试服务模块
 * 提供HTTP/HTTPS连接测试功能
 */

const https = require('https');
const http = require('http');
const networkConfig = require('./networkConfig');
const ErrorHandler = require('./errorHandler');

class HttpService {
    constructor() {
        this.isDev = process.env.NODE_ENV === 'development';
    }

    /**
     * 执行HTTP测试
     * @param {Object} options - 测试选项
     * @returns {Promise} 测试结果
     */
    async executeTest(options) {
        const { url, method = 'GET', timeout = 10000, headers = {} } = options;
        
        try {
            const startTime = Date.now();
            
            this._logEnvironmentInfo(url);
            
            // 处理URL格式
            const processedUrl = this._processUrl(url);
            const urlObj = new URL(processedUrl);
            const isHttps = urlObj.protocol === 'https:';
            const protocol = isHttps ? https : http;
            
            // 构建请求选项
            const requestOptions = this._buildRequestOptions(urlObj, method, timeout, headers, isHttps);
            
            this._logTestInfo(processedUrl, method, timeout, requestOptions);
            
            return await this._performRequest(protocol, requestOptions, processedUrl, isHttps, startTime, options);
            
        } catch (error) {
            ErrorHandler.logError(error, 'HTTP_TEST_INITIALIZATION', { url, method, timeout });
            throw new Error(`HTTP测试失败: ${error.message}`);
        }
    }

    /**
     * 处理URL格式
     * @param {string} url - 原始URL
     * @returns {string} 处理后的URL
     */
    _processUrl(url) {
        let processedUrl = url.trim();
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
        }
        return processedUrl;
    }

    /**
     * 构建请求选项
     * @param {URL} urlObj - URL对象
     * @param {string} method - HTTP方法
     * @param {number} timeout - 超时时间
     * @param {Object} headers - 请求头
     * @param {boolean} isHttps - 是否为HTTPS
     * @returns {Object} 请求选项
     */
    _buildRequestOptions(urlObj, method, timeout, headers, isHttps) {
        // 获取网络配置
        const config = networkConfig.getFullConfig({ isHttps, timeout });
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method.toUpperCase(),
            timeout: config.timeout,
            headers: {
                ...config.headers,
                ...headers
            },
            // 应用平台特定配置
            ...config
        };

        // 移除不属于请求选项的配置
        delete requestOptions.headers;
        requestOptions.headers = {
            ...config.headers,
            ...headers
        };

        return requestOptions;
    }

    /**
     * 执行HTTP请求
     * @param {Object} protocol - HTTP或HTTPS模块
     * @param {Object} requestOptions - 请求选项
     * @param {string} processedUrl - 处理后的URL
     * @param {boolean} isHttps - 是否为HTTPS
     * @param {number} startTime - 开始时间
     * @param {Object} originalOptions - 原始选项
     * @returns {Promise} 请求结果
     */
    _performRequest(protocol, requestOptions, processedUrl, isHttps, startTime, originalOptions) {
        return new Promise((resolve, reject) => {
            const req = protocol.request(requestOptions, (res) => {
                this._handleResponse(res, processedUrl, startTime, resolve, reject);
            });

            this._setupRequestHandlers(req, processedUrl, requestOptions, isHttps, originalOptions, resolve, reject);
            
            this._sendRequest(req, processedUrl);
        });
    }

    /**
     * 处理HTTP响应
     * @param {Object} res - 响应对象
     * @param {string} processedUrl - 处理后的URL
     * @param {number} startTime - 开始时间
     * @param {Function} resolve - Promise resolve函数
     * @param {Function} reject - Promise reject函数
     */
    _handleResponse(res, processedUrl, startTime, resolve, reject) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log('HTTP响应接收:', {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            responseTime,
            headers: Object.keys(res.headers)
        });
        
        const contentLength = res.headers['content-length'] || '-';
        const contentType = res.headers['content-type'] || '-';
        
        let dataLength = 0;
        
        res.on('data', (chunk) => {
            dataLength += chunk.length;
        });
        
        res.on('end', () => {
            console.log('HTTP响应完成:', {
                dataLength,
                contentLength,
                responseTime,
                success: true
            });
            
            resolve({
                url: processedUrl,
                method: res.req.method,
                status: res.statusCode,
                statusText: res.statusMessage || '',
                responseTime,
                contentLength: contentLength === '-' ? dataLength : contentLength,
                contentType,
                headers: res.headers
            });
        });
        
        res.on('error', (error) => {
            ErrorHandler.logError(error, 'HTTP_RESPONSE_STREAM', { url: processedUrl });
            reject(new Error(`响应流错误: ${error.message}`));
        });
    }

    /**
     * 设置请求事件处理器
     * @param {Object} req - 请求对象
     * @param {string} processedUrl - 处理后的URL
     * @param {Object} requestOptions - 请求选项
     * @param {boolean} isHttps - 是否为HTTPS
     * @param {Object} originalOptions - 原始选项
     * @param {Function} resolve - Promise resolve函数
     * @param {Function} reject - Promise reject函数
     */
    _setupRequestHandlers(req, processedUrl, requestOptions, isHttps, originalOptions, resolve, reject) {
        // 错误处理
        req.on('error', (error) => {
            this._handleRequestError(error, processedUrl, requestOptions, isHttps, originalOptions, resolve, reject);
        });

        // 超时处理
        req.on('timeout', () => {
            ErrorHandler.logError(
                new Error(`请求超时 (${requestOptions.timeout}ms)`),
                'HTTP_REQUEST_TIMEOUT',
                { url: processedUrl, timeout: requestOptions.timeout }
            );
            req.destroy();
            reject(new Error(`请求超时 (${requestOptions.timeout}ms)`));
        });

        // Socket处理
        req.on('socket', (socket) => {
            this._setupSocketHandlers(socket, processedUrl, requestOptions.timeout);
        });
    }

    /**
     * 处理请求错误
     * @param {Error} error - 错误对象
     * @param {string} processedUrl - 处理后的URL
     * @param {Object} requestOptions - 请求选项
     * @param {boolean} isHttps - 是否为HTTPS
     * @param {Object} originalOptions - 原始选项
     * @param {Function} resolve - Promise resolve函数
     * @param {Function} reject - Promise reject函数
     */
    _handleRequestError(error, processedUrl, requestOptions, isHttps, originalOptions, resolve, reject) {
        const urlObj = new URL(processedUrl);
        const context = `${urlObj.hostname}:${requestOptions.port}`;
        
        // 使用错误处理器处理错误
        const errorInfo = ErrorHandler.handleNetworkError(error, context);
        
        // 检查是否应该回退到HTTP
        if (this._shouldFallbackToHttp(isHttps, error)) {
            this._fallbackToHttp(processedUrl, originalOptions, resolve, reject, error);
            return;
        }

        reject(new Error(errorInfo.message));
    }

    /**
     * 判断是否应该回退到HTTP
     * @param {boolean} isHttps - 是否为HTTPS
     * @param {Error} error - 错误对象
     * @returns {boolean} 是否应该回退
     */
    _shouldFallbackToHttp(isHttps, error) {
        const fallbackCodes = [
            'ENOTFOUND', 'ECONNREFUSED', 'CERT_HAS_EXPIRED',
            'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'SELF_SIGNED_CERT_IN_CHAIN', 'EPROTO'
        ];
        return isHttps && fallbackCodes.includes(error.code);
    }

    /**
     * 回退到HTTP协议
     * @param {string} processedUrl - 处理后的URL
     * @param {Object} originalOptions - 原始选项
     * @param {Function} resolve - Promise resolve函数
     * @param {Function} reject - Promise reject函数
     * @param {Error} originalError - 原始错误
     */
    _fallbackToHttp(processedUrl, originalOptions, resolve, reject, originalError) {
        console.log('HTTPS连接失败，尝试HTTP...', {
            errorCode: originalError.code,
            isDev: this.isDev,
            platform: process.platform
        });
        
        const httpUrl = processedUrl.replace('https://', 'http://');
        
        this.executeTest({ ...originalOptions, url: httpUrl })
            .then(resolve)
            .catch((httpError) => {
                ErrorHandler.logError(httpError, 'HTTP_FALLBACK_FAILED', {
                    httpsError: originalError.message,
                    httpError: httpError.message,
                    url: processedUrl
                });
                reject(new Error(`HTTPS和HTTP连接都失败: ${originalError.message}`));
            });
    }

    /**
     * 设置Socket事件处理器
     * @param {Object} socket - Socket对象
     * @param {string} processedUrl - 处理后的URL
     * @param {number} timeout - 超时时间
     */
    _setupSocketHandlers(socket, processedUrl, timeout) {
        const socketConfig = networkConfig.getSocketConfig(timeout);
        
        // 应用Socket配置
        if (socketConfig.keepAlive) {
            socket.setKeepAlive(true, socketConfig.keepAliveInitialDelay);
        }
        if (socketConfig.noDelay) {
            socket.setNoDelay(true);
        }

        socket.setTimeout(timeout);
        socket.on('timeout', () => {
            ErrorHandler.logError(
                new Error('Socket超时'),
                'SOCKET_TIMEOUT',
                { url: processedUrl, timeout }
            );
            socket.destroy();
        });
        
        // 构建版本特定的Socket事件监听
        if (!this.isDev && process.platform === 'linux') {
            socket.on('error', (socketError) => {
                ErrorHandler.logError(socketError, 'SOCKET_ERROR', { url: processedUrl });
            });
            
            socket.on('connect', () => {
                console.log('Socket连接成功:', {
                    url: processedUrl,
                    localAddress: socket.localAddress,
                    localPort: socket.localPort
                });
            });
        }
    }

    /**
     * 发送请求
     * @param {Object} req - 请求对象
     * @param {string} processedUrl - 处理后的URL
     */
    _sendRequest(req, processedUrl) {
        try {
            req.end();
            console.log('HTTP请求已发送:', {
                url: processedUrl,
                method: req.method,
                isDev: this.isDev,
                platform: process.platform
            });
        } catch (error) {
            ErrorHandler.logError(error, 'HTTP_REQUEST_SEND', { url: processedUrl });
            throw new Error(`发送请求失败: ${error.message}`);
        }
    }

    /**
     * 记录环境信息
     * @param {string} url - 测试URL
     */
    _logEnvironmentInfo(url) {
        console.log('HTTP测试环境信息:', {
            platform: process.platform,
            isDev: this.isDev,
            nodeVersion: process.version,
            electronVersion: process.versions.electron,
            url: url
        });
    }

    /**
     * 记录测试信息
     * @param {string} processedUrl - 处理后的URL
     * @param {string} method - HTTP方法
     * @param {number} timeout - 超时时间
     * @param {Object} requestOptions - 请求选项
     */
    _logTestInfo(processedUrl, method, timeout, requestOptions) {
        console.log('执行HTTP测试:', { 
            url: processedUrl, 
            method, 
            timeout, 
            platform: process.platform,
            isDev: this.isDev,
            hostname: requestOptions.hostname,
            port: requestOptions.port
        });
    }
}

module.exports = new HttpService(); 