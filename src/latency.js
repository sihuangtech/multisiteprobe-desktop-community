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