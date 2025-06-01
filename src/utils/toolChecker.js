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
        if (process.platform === 'win32') {
            // Windows 系统使用内置的 tracert，无需检查
            return {
                installed: true,
                status: 'ready',
                path: 'tracert',
                tool: 'tracert'
            };
        } else if (process.platform === 'darwin') {
            // macOS 系统使用内置的 traceroute，无需检查
            return {
                installed: true,
                status: 'ready',
                path: 'traceroute',
                tool: 'traceroute'
            };
        } else {
            // Linux 系统，需要检查 traceroute 是否安装
            console.log('Linux 平台，检查 traceroute 工具安装状态...');
            
            // 尝试多个可能的 traceroute 命令
            const tracerouteCommands = ['traceroute', 'tracepath'];
            let traceroutePath = '';
            let toolName = '';
            
            for (const cmd of tracerouteCommands) {
                try {
                    const { stdout } = await execAsync(`which ${cmd}`);
                    traceroutePath = stdout.trim();
                    toolName = cmd;
                    console.log(`找到 ${cmd} 工具:`, traceroutePath);
                    break;
                } catch (error) {
                    console.log(`未找到 ${cmd} 工具`);
                    continue;
                }
            }
            
            if (traceroutePath) {
                // 检查工具是否可执行
                try {
                    await execAsync(`${toolName} --help`);
                    return {
                        installed: true,
                        status: 'ready',
                        path: traceroutePath,
                        tool: toolName
                    };
                } catch (error) {
                    console.log(`${toolName} 工具存在但无法执行:`, error);
                    return {
                        installed: true,
                        status: 'permission_error',
                        path: traceroutePath,
                        tool: toolName,
                        error: `${toolName} 工具无法执行，可能需要权限`,
                        installInstructions: await getLinuxTracerouteInstallInstructions()
                    };
                }
            } else {
                // 未找到任何 traceroute 工具
                console.log('Linux 系统未安装 traceroute 工具');
                return {
                    installed: false,
                    status: 'not_installed',
                    error: 'Linux 系统未安装 traceroute 工具',
                    installInstructions: await getLinuxTracerouteInstallInstructions()
                };
            }
        }
    } catch (error) {
        console.error('检查 traceroute 状态时发生错误:', error);
        return {
            installed: false,
            status: 'check_error',
            error: `检查失败: ${error.message}`,
            installInstructions: await getLinuxTracerouteInstallInstructions()
        };
    }
}

/**
 * 获取 Linux 系统的 traceroute 安装说明
 * @returns {Promise<string>} 安装说明
 */
async function getLinuxTracerouteInstallInstructions() {
    try {
        // 检测 Linux 发行版
        const distro = await detectLinuxDistribution();
        
        switch (distro.family) {
            case 'debian':
                return `${distro.name} 系统安装命令:\nsudo apt update && sudo apt install traceroute\n\n备选方案:\nsudo apt install iputils-tracepath`;
                
            case 'redhat':
                if (distro.name.includes('fedora')) {
                    return `${distro.name} 系统安装命令:\nsudo dnf install traceroute\n\n备选方案:\nsudo dnf install iputils`;
                } else {
                    return `${distro.name} 系统安装命令:\nsudo yum install traceroute\n\n备选方案:\nsudo yum install iputils`;
                }
                
            case 'arch':
                return `${distro.name} 系统安装命令:\nsudo pacman -S traceroute\n\n备选方案:\nsudo pacman -S iputils`;
                
            case 'suse':
                return `${distro.name} 系统安装命令:\nsudo zypper install traceroute\n\n备选方案:\nsudo zypper install iputils`;
                
            case 'alpine':
                return `${distro.name} 系统安装命令:\nsudo apk add traceroute\n\n备选方案:\nsudo apk add iputils`;
                
            default:
                return `通用 Linux 安装命令:\n\nUbuntu/Debian: sudo apt install traceroute\nCentOS/RHEL: sudo yum install traceroute\nFedora: sudo dnf install traceroute\nArch Linux: sudo pacman -S traceroute\nopenSUSE: sudo zypper install traceroute\nAlpine: sudo apk add traceroute\n\n备选工具 tracepath 通常已预装在大多数 Linux 发行版中`;
        }
    } catch (error) {
        console.error('检测 Linux 发行版失败:', error);
        return `通用 Linux 安装命令:\n\nUbuntu/Debian: sudo apt install traceroute\nCentOS/RHEL: sudo yum install traceroute\nFedora: sudo dnf install traceroute\nArch Linux: sudo pacman -S traceroute\nopenSUSE: sudo zypper install traceroute\nAlpine: sudo apk add traceroute\n\n备选工具 tracepath 通常已预装在大多数 Linux 发行版中`;
    }
}

/**
 * 检测 Linux 发行版
 * @returns {Promise<Object>} 发行版信息
 */
async function detectLinuxDistribution() {
    try {
        // 尝试读取 /etc/os-release 文件
        const { stdout } = await execAsync('cat /etc/os-release');
        const lines = stdout.split('\n');
        const osInfo = {};
        
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                osInfo[key] = value.replace(/"/g, '');
            }
        });
        
        const id = (osInfo.ID || '').toLowerCase();
        const name = osInfo.PRETTY_NAME || osInfo.NAME || id;
        
        // 根据 ID 确定发行版系列
        let family = 'unknown';
        
        if (['ubuntu', 'debian', 'mint', 'elementary', 'pop', 'zorin'].includes(id)) {
            family = 'debian';
        } else if (['rhel', 'centos', 'fedora', 'rocky', 'alma', 'oracle'].includes(id)) {
            family = 'redhat';
        } else if (['arch', 'manjaro', 'endeavouros', 'garuda'].includes(id)) {
            family = 'arch';
        } else if (['opensuse', 'sles', 'sled'].includes(id)) {
            family = 'suse';
        } else if (['alpine'].includes(id)) {
            family = 'alpine';
        } else if (osInfo.ID_LIKE) {
            // 检查 ID_LIKE 字段
            const idLike = osInfo.ID_LIKE.toLowerCase();
            if (idLike.includes('debian')) {
                family = 'debian';
            } else if (idLike.includes('rhel') || idLike.includes('fedora')) {
                family = 'redhat';
            } else if (idLike.includes('arch')) {
                family = 'arch';
            } else if (idLike.includes('suse')) {
                family = 'suse';
            }
        }
        
        return { id, name, family };
        
    } catch (error) {
        console.error('读取 /etc/os-release 失败，尝试其他方法:', error);
        
        // 备用方法：检查包管理器
        try {
            // 检查是否有 apt
            await execAsync('which apt');
            return { id: 'unknown', name: 'Debian-based Linux', family: 'debian' };
        } catch (e) {
            try {
                // 检查是否有 yum
                await execAsync('which yum');
                return { id: 'unknown', name: 'RedHat-based Linux', family: 'redhat' };
            } catch (e2) {
                try {
                    // 检查是否有 dnf
                    await execAsync('which dnf');
                    return { id: 'unknown', name: 'Fedora-based Linux', family: 'redhat' };
                } catch (e3) {
                    try {
                        // 检查是否有 pacman
                        await execAsync('which pacman');
                        return { id: 'unknown', name: 'Arch-based Linux', family: 'arch' };
                    } catch (e4) {
                        try {
                            // 检查是否有 zypper
                            await execAsync('which zypper');
                            return { id: 'unknown', name: 'SUSE-based Linux', family: 'suse' };
                        } catch (e5) {
                            return { id: 'unknown', name: 'Unknown Linux', family: 'unknown' };
                        }
                    }
                }
            }
        }
    }
}

/**
 * 获取 traceroute 安装说明（保持向后兼容）
 * @returns {string} 安装说明
 */
function getTracerouteInstallInstructions() {
    if (process.platform === 'darwin') {
        return 'traceroute 已预装在 macOS 中';
    } else if (process.platform === 'win32') {
        return 'tracert 已预装在 Windows 中';
    } else {
        return '请使用 checkTracerouteStatus() 获取详细的安装说明';
    }
}

module.exports = {
    checkMtrStatus,
    checkTracerouteStatus,
    getPermissionSolution,
    getInstallInstructions
}; 