// 应用信息配置
export const appInfo = {
  name: {
    'zh-CN': '多站点运维检测工具', // 应用名称（中文）
    'en-US': 'Multi-site Operations Monitoring Tool' // 应用名称（英文）
  },
  author: {
    'zh-CN': '斯黄',
    'en-US': 'Snake Konginchrist'
  },
  email: 'developer@skstudio.cn',
  homepage: 'https://www.skstudio.cn/multisitetool',
  // 应用描述（支持国际化）
  description: {
    'zh-CN': '多站点运维检测工具 - 提供IP查询、Ping、HTTP、DNS、MTR、路由追踪等网络测试以及运维检测功能',
    'en-US': 'Multi-site Operations Monitoring Tool - Provides IP lookup, Ping, HTTP, DNS, MTR, Traceroute and other network testing and operations monitoring features'
  },
  // 直接使用全局注入的版本和构建日期
  version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '未知版本',
  buildDate: typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '未知构建日期'
}

// 获取应用信息
export const getAppInfo = () => {
  // 直接返回 appInfo 对象
  return appInfo;
}

// 获取应用名称（根据语言）
export const getAppName = (language = 'zh-CN') => {
  return appInfo.name[language] || appInfo.name['zh-CN']
}

// 获取应用描述（根据语言）
export const getDescription = (language = 'zh-CN') => {
  return appInfo.description[language] || appInfo.description['zh-CN']
}

// 获取作者名字（根据语言）
export const getAuthor = (language = 'zh-CN') => {
  return appInfo.author[language] || appInfo.author['zh-CN']
}

// 获取版本信息
export const getVersion = () => {
  // 直接返回 appInfo 中的版本
  return appInfo.version;
}

// 获取构建信息
export const getBuildInfo = (language = 'zh-CN') => {
  return {
    version: appInfo.version,
    buildDate: appInfo.buildDate,
    author: getAuthor(language)
  }
} 