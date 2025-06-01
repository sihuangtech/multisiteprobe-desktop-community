export default {
  // 导航菜单
  nav: {
    ipLookup: 'IP查询',
    dns: 'DNS测试',
    http: 'HTTP测试',
    mtr: 'MTR测试',
    traceroute: '路由追踪',
    favorites: '收藏夹',
    settings: '设置',
    test: '测试'
  },
  
  // 通用词汇
  common: {
    free: '免费',
    paid: '付费',
    freePaid: '免费/付费',
    recommended: '推荐',
    smart: '智能',
    autoSelect: '自动选择',
    apiKeyRequired: '需要API密钥',
    officialWebsite: '官网',
    registerToGet: '注册获取免费API密钥',
    seconds: '秒',
    times: '次',
    count: '个',
    bytes: '字节',
    records: '条',
    days: '天',
    lightTheme: '浅色主题',
    darkTheme: '深色主题',
    autoTheme: '跟随系统',
    simplifiedChinese: '简体中文',
    testResults: '测试结果',
    all: '所有',
    services: '个服务',
    allServicesTestFailed: '所有服务测试失败',
    batchTestFailed: '批量测试失败',
    version: '版本'
  },
  
  // 通用按钮
  buttons: {
    start: '开始测试',
    startQuery: '开始查询',
    clear: '清除结果',
    add: '添加',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    confirmClear: '确定清除',
    refresh: '刷新',
    export: '导出',
    import: '导入',
    reset: '重置',
    test: '测试',
    fromFavorites: '从收藏夹选择',
    batchAdd: '批量添加',
    clearAll: '清空所有',
    favorite: '收藏',
    recheckTool: '重新检查工具'
  },
  
  // 表格列标题
  table: {
    address: '地址',
    domain: '域名',
    url: 'URL',
    ip: 'IP地址',
    query: '查询地址',
    country: '国家/地区',
    region: '省份/州',
    city: '城市',
    isp: 'ISP',
    status: '状态码',
    responseTime: '响应时间',
    contentLength: '内容大小',
    contentType: '内容类型',
    recordType: '记录类型',
    result: '解析结果',
    dnsServer: 'DNS服务器',
    note: '备注',
    createdAt: '创建时间',
    actions: '操作',
    hop: '跳数',
    hostname: '主机名',
    location: '地理位置',
    loss: '丢包率',
    ttl: 'TTL',
    min: '最小值',
    avg: '平均值',
    max: '最大值',
    target: '目标'
  },
  
  // 表单标签
  form: {
    targetList: '目标地址列表',
    domainList: '目标域名列表',
    urlList: '目标URL列表',
    testOptions: '测试选项',
    recordType: '记录类型',
    dnsServer: 'DNS服务器',
    timeout: '超时时间',
    retries: '重试次数',
    method: '请求方法',
    packetSize: '数据包大小',
    count: '测试次数',
    maxHops: '最大跳数',
    systemDefault: '系统默认'
  },
  
  // 占位符文本
  placeholder: {
    enterAddress: '请输入IP地址或域名',
    enterDomain: '请输入域名（如：example.com）',
    enterUrl: '请输入网址（如：www.example.com）',
    batchAdd: '请输入要添加的内容，每行一个',
    search: '搜索收藏',
    selectRecordType: '选择记录类型',
    selectDnsServer: '选择DNS服务器',
    selectMethod: '选择请求方法'
  },
  
  // 页面标题
  pages: {
    ipLookup: 'IP/域名查询',
    dnsTest: 'DNS测试',
    httpTest: 'HTTP测试',
    mtrTest: 'MTR测试',
    traceroute: '路由追踪',
    pingTest: 'Ping测试'
  },
  
  // 测试选项
  testOptions: {
    aRecord: 'A记录',
    aaaaRecord: 'AAAA记录',
    cnameRecord: 'CNAME记录',
    mxRecord: 'MX记录',
    txtRecord: 'TXT记录',
    nsRecord: 'NS记录',
    getMethod: 'GET',
    postMethod: 'POST',
    headMethod: 'HEAD'
  },
  
  // 消息提示
  messages: {
    addSuccess: '添加成功',
    deleteSuccess: '删除成功',
    updateSuccess: '更新成功',
    saveSuccess: '保存成功',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',
    importSuccess: '导入成功',
    importFailed: '导入失败',
    resetSuccess: '重置成功',
    testSuccess: '测试成功',
    addToFavorites: '已添加到收藏夹',
    alreadyInFavorites: '该地址已在收藏夹中',
    pleaseAddAddress: '请至少添加一个地址',
    pleaseAddDomain: '请至少添加一个域名',
    pleaseAddUrl: '请至少添加一个URL',
    pleaseSelectItems: '请选择要添加的收藏项',
    pleaseEnterContent: '请输入要添加的内容',
    noValidContent: '没有有效的内容可添加',
    confirmDelete: '确定要删除这个收藏吗？',
    confirmReset: '确定要重置所有设置吗？此操作不可撤销。',
    confirmClearAll: '确定要清除所有应用数据吗？包括收藏夹、历史记录和设置。此操作不可撤销！',
    clearAllSuccess: '所有数据已清除',
    invalidSettingsFile: '无效的设置文件格式',
    getCurrentIpFailed: '获取当前IP信息失败',
    queryFailed: '查询失败',
    testFailed: '测试失败',
    saveFailed: '保存失败',
    loadFailed: '加载失败',
    testCompleted: '测试完成',
    addedFromPage: '从{page}页面添加',
    ipcRendererUndefined: 'IPC渲染器未定义，无法执行测试',
    toolNotInstalled: '{tool} 工具未安装',
    toolPermissionError: '工具权限错误',
    toolReady: '{tool} 工具已就绪',
    toolNotReady: '{tool} 工具未就绪',
    checkToolFailed: '检查工具状态失败'
  },
  
  // 设置页面
  settings: {
    title: '应用设置',
    lastSaved: '上次保存',
    apiConfig: 'API配置',
    networkConfig: '网络测试配置',
    uiConfig: '界面配置',
    dataManagement: '数据管理',
    about: '关于信息',
    
    // API设置
    ipLookupService: 'IP查询服务',
    ipLookupServiceDesc: '选择IP地理位置查询服务。自动选择模式会依次尝试多个服务以确保查询成功。',
    ip2locationApiKey: 'IP2Location API密钥',
    ip2locationApiKeyPlaceholder: '请输入IP2Location API密钥',
    ip2locationApiKeyDesc: '在',
    ipinfoToken: 'IPInfo.io Token',
    ipinfoTokenPlaceholder: '请输入IPInfo.io访问令牌（可选）',
    ipinfoTokenDesc: '可选。提供Token可获得更高的查询限额和更详细的信息',
    queryTimeout: '查询超时时间',
    queryTimeoutDesc: 'IP查询请求的超时时间，建议5-10秒',
    serviceTest: '服务测试',
    serviceTestDesc: '测试IP查询服务的连通性和响应速度',
    testCurrentService: '测试当前服务',
    testAllServices: '测试所有服务',
    
    // 网络设置
    defaultTimeout: '默认超时时间',
    defaultTimeoutDesc: '网络测试的默认超时时间',
    defaultRetries: '默认重试次数',
    defaultRetriesDesc: '测试失败时的重试次数',
    maxConcurrency: '最大并发数',
    maxConcurrencyDesc: '同时进行的最大测试数量',
    pingCount: 'Ping测试次数',
    pingCountDesc: '每次Ping测试发送的数据包数量',
    pingPacketSize: 'Ping包大小',
    pingPacketSizeDesc: 'Ping数据包的大小，默认32字节',
    
    // 界面设置
    theme: '主题',
    themeDesc: '选择应用的外观主题',
    language: '语言',
    languageDesc: '选择应用界面语言',
    autoUpdate: '自动更新',
    autoUpdateDesc: '启用后会自动检查并下载应用更新',
    showNotifications: '显示通知',
    showNotificationsDesc: '启用后会显示测试完成等通知消息',
    compactMode: '紧凑模式',
    compactModeDesc: '启用后界面会更加紧凑，适合小屏幕',
    
    // 数据设置
    autoSaveFavorites: '自动保存收藏',
    autoSaveFavoritesDesc: '启用后会自动保存添加到收藏夹的项目',
    maxHistoryRecords: '最大历史记录',
    maxHistoryRecordsDesc: '保存的最大历史记录数量',
    autoCleanHistory: '自动清理历史',
    autoCleanHistoryDesc: '启用后会自动清理过期的历史记录',
    cleanHistoryDays: '历史保留天数',
    cleanHistoryDaysDesc: '历史记录的保留天数，超过此时间的记录会被自动删除',
    dataOperations: '数据操作',
    dataOperationsDesc: '管理应用数据：导出/导入设置，重置或清除所有数据',
    exportSettings: '导出设置',
    importSettings: '导入设置',
    resetSettings: '重置设置',
    clearAllData: '清除所有数据',
    
    // 关于信息
    appName: '应用名称',
    version: '版本',
    buildDate: '构建日期',
    author: '作者',
    email: '邮箱',
    homepage: '产品主页',
    repository: '项目地址',
    bugReports: '问题反馈'
  },
  
  // 当前IP信息
  currentIp: {
    title: '当前IP信息',
    address: '当前IP地址',
    country: '国家/地区',
    region: '省份/州',
    city: '城市',
    isp: 'ISP',
    queryTime: '查询时间',
    loading: '正在获取当前IP信息...',
    error: '无法获取当前IP信息，请点击刷新重试'
  },
  
  // 收藏夹
  favorites: {
    title: '收藏夹',
    addFavorite: '添加收藏',
    editFavorite: '编辑收藏',
    selectFromFavorites: '从收藏夹选择',
    addToList: '添加到列表',
    selectTestType: '选择测试类型'
  },
  
  // 首页
  home: {
    tracerouteDesc: '追踪数据包从源到目标的路径，显示每一跳的延迟和地理位置信息',
    favoritesDesc: '管理常用的目标地址，快速进行测试',
    moreFeatures: '更多功能',
    comingSoon: '敬请期待...'
  }
} 