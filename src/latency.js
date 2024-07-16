const ping = require('ping');

// 测量单个URL的延迟
async function measureLatency(url) {
    const res = await ping.promise.probe(url);
    return res.time;
}

module.exports = measureLatency;