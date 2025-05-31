/**
 * MTR测试服务
 * 提供MTR网络测试功能
 */

const { exec } = require('child_process');
const { batchQueryIPLocations } = require('./ipLocationService');
const { checkMtrStatus } = require('./toolChecker');

/**
 * 执行 MTR 测试
 * @param {string} address 目标地址
 * @param {Object} options 测试选项
 * @returns {Promise<Object>} 测试结果
 */
async function executeMtrTest(address, options) {
    const { count = 5, packetSize = 64, maxHops = 15 } = options;

    try {
        // 首先检查 MTR 状态
        const mtrStatus = await checkMtrStatus();
        if (!mtrStatus.installed) {
            throw new Error(`MTR 未安装。安装方法: ${mtrStatus.installInstructions}`);
        }
        
        // 获取 MTR 的完整路径
        const mtrPath = mtrStatus.path || 'mtr';
        console.log('使用 MTR 路径:', mtrPath);
        
        // 根据操作系统构建 MTR 命令
        let cmd;
        
        if (process.platform === 'win32') {
            cmd = `"${mtrPath}" -r -c ${count} -s ${packetSize} --no-dns ${address}`;
        } else if (process.platform === 'darwin') {
            // macOS 使用 osascript 弹出图形化密码输入窗口
            cmd = `osascript -e 'do shell script "${mtrPath} -r -c ${count} -s ${packetSize} -m ${maxHops} -n ${address}" with administrator privileges'`;
        } else {
            cmd = `"${mtrPath}" -r -c ${count} -s ${packetSize} -m ${maxHops} -n ${address}`;
        }
        
        console.log('MTR 命令:', cmd);
        
        // 执行命令并获取输出
        const output = await new Promise((resolve, reject) => {
            exec(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    console.error('MTR 命令执行失败:', error);
                    console.error('stderr:', stderr);
                    // 检查是否是权限问题
                    if (stderr && (stderr.includes('Failure to open') || stderr.includes('Permission denied'))) {
                        reject(new Error('MTR 需要管理员权限才能运行，请查看上方状态区域的解决方案'));
                    } else {
                        reject(error);
                    }
                } else {
                    console.log('MTR 命令输出:', stdout);
                    resolve(stdout);
                }
            });
        });
        
        // 解析输出
        const hops = await parseMtrOutput(output);
        console.log('MTR 解析结果:', hops);
        
        return {
            success: true,
            target: address,
            hops: hops
        };
        
    } catch (error) {
        console.error('MTR 测试失败:', error);
        return {
            success: false,
            error: error.message || '执行命令失败'
        };
    }
}

/**
 * 解析 MTR 输出
 * @param {string} output MTR 命令输出
 * @returns {Promise<Array>} 解析后的跳数数据
 */
async function parseMtrOutput(output) {
    const hops = [];
    console.log('原始MTR输出:', JSON.stringify(output));
    
    if (process.platform === 'win32') {
        // 解析 Windows mtr 输出
        const lines = output.split('\n').filter(line => line.trim());
        let hop = 1;
        for (const line of lines) {
            const match = line.match(/\s*\d+\.\s+(\d+\.\d+ms|\*)\s+(\d+\.\d+ms|\*)\s+(\d+\.\d+ms|\*)\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})?/);
            if (match) {
                const rtt1 = match[1] === '*' ? '*' : match[1];
                const rtt2 = match[2] === '*' ? '*' : match[2];
                const rtt3 = match[3] === '*' ? '*' : match[3];
                const ip = match[4] || '';
                
                if (ip) {
                    const rtts = [rtt1, rtt2, rtt3].filter(rtt => rtt !== '*').map(rtt => {
                        const m = rtt.match(/(\d+)/);
                        return m ? parseInt(m[1]) : null;
                    }).filter(n => n !== null);
                    
                    const avg = rtts.length > 0 ? rtts.reduce((sum, val) => sum + val, 0) / rtts.length : 0;
                    const min = rtts.length > 0 ? Math.min(...rtts) : 0;
                    const max = rtts.length > 0 ? Math.max(...rtts) : 0;
                    
                    hops.push({
                        hop: hop++,
                        ip: String(ip),
                        hostname: String(ip),
                        loss: Number(rtts.length < 3 ? Math.round((3 - rtts.length) / 3 * 100) : 0),
                        avg: Number(avg),
                        min: Number(min),
                        max: Number(max),
                        location: String('')
                    });
                }
            }
        }
    } else {
        // 解析 Linux/macOS mtr 报告输出
        // 直接使用正则表达式在整个字符串中查找所有跳数行
        // 使用\s+匹配多个空格，处理字段间变长空格
        const hopRegex = /(\d+)\.\|--\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+(\d+\.\d+)%\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/g;
        
        let match;
        console.log('开始全局匹配MTR跳数...');
        console.log('使用的正则表达式:', hopRegex);
        
        while ((match = hopRegex.exec(output)) !== null) {
            console.log('找到跳数:', match);
            hops.push({
                hop: Number(parseInt(match[1])),
                ip: String(match[2]),
                hostname: String(match[2]),
                loss: Number(parseFloat(match[3])),
                avg: Number(parseFloat(match[6])),  // 平均值
                min: Number(parseFloat(match[7])),  // 最小值
                max: Number(parseFloat(match[8])),  // 最大值
                location: String('') // 稍后查询
            });
        }
        
        // 如果全局匹配失败，尝试手动测试单行
        if (hops.length === 0) {
            console.log('全局匹配失败，尝试手动测试...');
            const testLine = "  1.|-- 192.168.2.1                0.0%     5    4.3   5.0   4.0   8.1   1.7";
            const testMatch = testLine.match(/(\d+)\.\|--\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+(\d+\.\d+)%\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
            console.log('测试行匹配结果:', testMatch);
        }
    }
    
    // 批量查询地理位置信息
    await batchQueryIPLocations(hops, 'MTR');
    
    console.log('MTR解析完成，共解析到', hops.length, '个跳数');
    return hops;
}

module.exports = {
    executeMtrTest,
    parseMtrOutput
}; 