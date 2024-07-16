// 渲染器进程脚本
document.getElementById('measure-button').addEventListener('click', async () => {
    const urls = document.getElementById('urls').value.split('\n');
    const results = await window.electron.measureLatency(urls);

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const div = document.createElement('div');
        div.innerHTML = `URL: ${result.url}, 延迟: ${result.latency} ms, IP: ${result.ip}, 地理位置: ${result.location}`;
        resultsContainer.appendChild(div);
    });
});