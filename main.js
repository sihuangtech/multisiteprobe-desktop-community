// 引入Electron模块
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const measureLatency = require('./src/latency');
const getGeoLocation = require('./src/geoip');

// 创建窗口的函数
function createWindow() {
    // 创建浏览器窗口
    const mainWindow  = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // nodeIntegration: true, // 允许在渲染进程中使用Node.js
            // contextIsolation: false, // 在这个示例中关闭上下文隔离以便简化代码
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // 打开开发者工具
    // mainWindow.webContents.openDevTools();

    // 加载index.html
    mainWindow.loadFile('index.html');
}

// 当Electron应用完成时初始化
// app.whenReady().then(createWindow);

// 初始化并创建窗口
app.on('ready', createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    // 在macOS上，除非用户使用Cmd + Q确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// macOS用户在点击dock图标并且没有其他窗口打开时，
// 通常在应用程序中重新创建一个窗口
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('measure-latency', async (event, urls) => {
    const results = [];
    for (const url of urls) {
        const latency = await measureLatency(url);
        const { ip, location } = await getGeoLocation(url);
        results.push({ url, latency, ip, location });
    }
    return results;
});