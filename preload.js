'use strict';

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

// 预加载脚本，用于在渲染器进程中使用Node.js模块
const { contextBridge, ipcRenderer } = require('electron');

// 从主进程获取版本信息
const appVersion = process.env.APP_VERSION; // 将在主进程中注入
const buildDate = process.env.BUILD_DATE; // 将在主进程中注入

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
  }
});

// 暴露electronAPI给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppVersion: () => appVersion, // 暴露版本号
  getBuildDate: () => buildDate // 暴露构建日期
});