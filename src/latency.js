const ping = require('ping');

// 测量单个 URL 的延迟
async function measureLatency(url) {
    try {
        // 使用 ping.promise.probe 方法测量延迟
        const res = await ping.promise.probe(url);

        // 如果 ping 成功返回延迟时间，否则返回 'timeout'
        if (res.alive) {
            return res.time;
        } else {
            return 'timeout';
        }
    } catch (error) {
        console.error(`Error while measuring latency for ${url}: ${error.message}`);
        return 'timeout'; // 出现错误时返回 'timeout'
    }
}

module.exports = measureLatency;