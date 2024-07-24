/*
  MultiSite Latency Tool

  Copyright (C) 2024 Snake Konginchrist

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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