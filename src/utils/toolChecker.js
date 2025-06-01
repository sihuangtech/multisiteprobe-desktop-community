const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * 检查 MTR 工具的安装状态和权限
 * @returns {Promise<Object>} 返回状态对象
 */
async function checkMtrStatus() {
    try {
        let mtrPath = '';
        
        if (process.platform === 'win32') {
            // Windows 系统 - 直接使用内置的 pathping
            console.log('Windows 平台，使用内置的 pathping 工具');
            
            return {
                installed: true,
                hasPermission: true,
                status: 'ready',
                path: 'pathping',
                tool: 'pathping'
            };
        } else {
            // macOS/Linux 系统，尝试多个可能的路径
            const possiblePaths = [
                '/opt/homebrew/sbin/mtr',  // Apple Silicon Mac Homebrew
                '/usr/local/sbin/mtr',     // Intel Mac Homebrew
                '/usr/sbin/mtr',           // 系统安装
                '/usr/bin/mtr',            // 系统安装
                '/usr/local/bin/mtr'       // 其他安装方式
            ];
            
            // 首先尝试 which 命令
            try {
                const { stdout } = await execAsync('which mtr');
                mtrPath = stdout.trim();
                console.log('通过 which 找到 MTR:', mtrPath);
            } catch (whichError) {
                console.log('which 命令未找到 MTR，尝试检查常见路径...');
                
                // 如果 which 失败，检查常见路径
                for (const path of possiblePaths) {
                    try {
                        await execAsync(`test -f "${path}"`);
                        mtrPath = path;
                        console.log('在路径找到 MTR:', path);
                        break;
                    } catch (testError) {
                        // 继续检查下一个路径
                    }
                }
            }
        }
        
        if (!mtrPath) {
            throw new Error('MTR not found in any common locations');
        }
        
        console.log('MTR 安装路径:', mtrPath);
        
        // MTR 已安装，检查是否有权限
        // 检查 MTR 文件是否有 setuid 权限
        try {
            // 获取 MTR 的权限信息
            const { stdout: permissions } = await execAsync(`ls -la "${mtrPath}"`);
            console.log('MTR 文件权限:', permissions);
            
            // 如果是符号链接，获取实际文件的权限
            if (permissions.includes('->')) {
                const linkTarget = permissions.split('->')[1].trim();
                console.log('符号链接目标:', linkTarget);
                
                // 构建完整路径
                let realPath;
                if (linkTarget.startsWith('/')) {
                    // 绝对路径
                    realPath = linkTarget;
                } else {
                    // 相对路径，需要基于符号链接的目录构建
                    const linkDir = mtrPath.substring(0, mtrPath.lastIndexOf('/'));
                    realPath = `${linkDir}/${linkTarget}`;
                }
                
                console.log('实际文件路径:', realPath);
                const { stdout: realPermissions } = await execAsync(`ls -la "${realPath}"`);
                console.log('MTR 实际文件权限:', realPermissions);
                
                // 检查是否有 setuid 权限且所有者是 root
                if (realPermissions.includes('-r-sr-xr-x') && realPermissions.includes(' root ')) {
                    console.log('MTR 有 setuid 权限，可以直接运行');
                    return {
                        installed: true,
                        hasPermission: true,
                        status: 'ready',
                        path: mtrPath,
                        tool: 'mtr'
                    };
                } else {
                    console.log('MTR 需要管理员权限');
                    return {
                        installed: true,
                        hasPermission: false,
                        status: 'permission_required',
                        path: mtrPath,
                        tool: 'mtr',
                        permissionSolution: getPermissionSolution()
                    };
                }
            } else {
                // 检查是否有 setuid 权限且所有者是 root
                if (permissions.includes('-r-sr-xr-x') && permissions.includes(' root ')) {
                    console.log('MTR 有 setuid 权限，可以直接运行');
                    return {
                        installed: true,
                        hasPermission: true,
                        status: 'ready',
                        path: mtrPath,
                        tool: 'mtr'
                    };
                } else {
                    console.log('MTR 需要管理员权限');
                    return {
                        installed: true,
                        hasPermission: false,
                        status: 'permission_required',
                        path: mtrPath,
                        tool: 'mtr',
                        permissionSolution: getPermissionSolution()
                    };
                }
            }
        } catch (permError) {
            console.log('权限检测失败，假设需要管理员权限:', permError);
            return {
                installed: true,
                hasPermission: false,
                status: 'permission_required',
                path: mtrPath,
                tool: 'mtr',
                permissionSolution: getPermissionSolution()
            };
        }
        
    } catch (error) {
        console.log('MTR 未安装:', error);
        // MTR 未安装
        return {
            installed: false,
            hasPermission: false,
            status: 'not_installed',
            installInstructions: getInstallInstructions()
        };
    }
}

/**
 * 获取权限解决方案
 * @returns {string} 权限解决方案
 */
function getPermissionSolution() {
    if (process.platform === 'darwin') {
        // macOS 会弹出图形化密码输入窗口
        return '系统会弹出密码输入窗口，请输入管理员密码';
    } else if (process.platform === 'win32') {
        return '以管理员身份运行此应用程序';
    } else {
        return 'sudo chmod u+s /usr/bin/mtr';
    }
}

/**
 * 获取安装说明
 * @returns {string} 安装说明
 */
function getInstallInstructions() {
    if (process.platform === 'darwin') {
        return 'brew install mtr';
    } else if (process.platform === 'win32') {
        return 'Windows 平台使用内置的 PathPing 工具，无需安装';
    } else {
        return 'Ubuntu/Debian: sudo apt-get install mtr | CentOS/RHEL: sudo yum install mtr | Fedora: sudo dnf install mtr | Arch: sudo pacman -S mtr | openSUSE: sudo zypper install mtr';
    }
}

/**
 * 检查 traceroute 工具状态
 * @returns {Promise<Object>} 返回状态对象
 */
async function checkTracerouteStatus() {
    try {
        const checkCmd = process.platform === 'win32' ? 'where tracert' : 'which traceroute';
        await execAsync(checkCmd);
        
        return {
            installed: true,
            status: 'ready'
        };
    } catch (error) {
        return {
            installed: false,
            status: 'not_installed',
            installInstructions: getTracerouteInstallInstructions()
        };
    }
}

/**
 * 获取 traceroute 安装说明
 * @returns {string} 安装说明
 */
function getTracerouteInstallInstructions() {
    if (process.platform === 'darwin') {
        return 'traceroute 已预装在 macOS 中';
    } else if (process.platform === 'win32') {
        return 'tracert 已预装在 Windows 中';
    } else {
        return 'sudo apt-get install traceroute (Ubuntu/Debian)';
    }
}

module.exports = {
    checkMtrStatus,
    checkTracerouteStatus,
    getPermissionSolution,
    getInstallInstructions
}; 