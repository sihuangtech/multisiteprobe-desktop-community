// 应用信息配置
export const appInfo = {
  name: 'MultiSite Latency Tool',
  version: '1.0.0',
  buildDate: '2025-05-29',
  author: {
    'zh-CN': '斯黄',
    'en-US': 'Snake Konginchrist'
  },
  email: 'developer@skstudio.cn',
  license: 'GPL-3.0 License',
  repository: {
    github: 'https://github.com/Snake-Konginchrist/MultiSiteTool-Desktop',
    gitee: 'https://gitee.com/Snake-Konginchrist/MultiSiteTool-Desktop'
  },
  homepage: 'https://www.skstudio.cn/multisitetool',
  bugReports: {
    github: 'https://github.com/Snake-Konginchrist/MultiSiteTool-Desktop/issues',
    gitee: 'https://gitee.com/Snake-Konginchrist/MultiSiteTool-Desktop/issues'
  },
  documentation: {
    github: 'https://github.com/Snake-Konginchrist/MultiSiteTool-Desktop/wiki',
    gitee: 'https://gitee.com/Snake-Konginchrist/MultiSiteTool-Desktop/wiki'
  },
  // 应用描述（支持国际化）
  description: {
    'zh-CN': '多站点延迟测试工具 - 提供IP查询、Ping、HTTP、DNS、MTR、路由追踪等网络测试功能',
    'en-US': 'Multi-Site Latency Tool - Provides IP lookup, Ping, HTTP, DNS, MTR, Traceroute and other network testing features'
  }
}

// 获取应用信息
export const getAppInfo = () => {
  return { ...appInfo }
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
  return appInfo.version
}

// 获取构建信息
export const getBuildInfo = (language = 'zh-CN') => {
  return {
    version: appInfo.version,
    buildDate: appInfo.buildDate,
    author: getAuthor(language)
  }
} 