// 预加载脚本，用于在渲染器进程中使用Node.js模块
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    measureLatency: (urls) => ipcRenderer.invoke('measure-latency', urls)
});