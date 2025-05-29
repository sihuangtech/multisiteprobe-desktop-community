export default {
  // Navigation menu
  nav: {
    ipLookup: 'IP Lookup',
    dns: 'DNS Test',
    http: 'HTTP Test',
    mtr: 'MTR Test',
    traceroute: 'Traceroute',
    favorites: 'Favorites',
    settings: 'Settings',
    test: 'Test'
  },
  
  // Common terms
  common: {
    free: 'Free',
    paid: 'Paid',
    freePaid: 'Free/Paid',
    recommended: 'Recommended',
    smart: 'Smart',
    autoSelect: 'Auto Select',
    apiKeyRequired: 'API Key Required',
    officialWebsite: ' Official Website',
    registerToGet: 'Register to get free API key',
    seconds: 'seconds',
    times: 'times',
    count: 'count',
    bytes: 'bytes',
    records: 'records',
    days: 'days',
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',
    autoTheme: 'Follow System',
    simplifiedChinese: 'Simplified Chinese',
    testResults: 'Test Results',
    all: 'All',
    services: ' services',
    allServicesTestFailed: 'All services test failed',
    batchTestFailed: 'Batch test failed'
  },
  
  // Common buttons
  buttons: {
    start: 'Start Test',
    startQuery: 'Start Query',
    clear: 'Clear Results',
    add: 'Add',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    confirmClear: 'Confirm Clear',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    reset: 'Reset',
    test: 'Test',
    fromFavorites: 'From Favorites',
    batchAdd: 'Batch Add',
    clearAll: 'Clear All',
    favorite: 'Favorite'
  },
  
  // Table column headers
  table: {
    address: 'Address',
    domain: 'Domain',
    url: 'URL',
    ip: 'IP Address',
    query: 'Query Address',
    country: 'Country/Region',
    region: 'Province/State',
    city: 'City',
    isp: 'ISP',
    status: 'Status Code',
    responseTime: 'Response Time',
    contentLength: 'Content Size',
    contentType: 'Content Type',
    recordType: 'Record Type',
    result: 'Resolution Result',
    dnsServer: 'DNS Server',
    note: 'Note',
    createdAt: 'Created At',
    actions: 'Actions',
    hop: 'Hop',
    hostname: 'Hostname',
    location: 'Location',
    loss: 'Loss Rate',
    ttl: 'TTL',
    min: 'Min',
    avg: 'Avg',
    max: 'Max',
    target: 'Target'
  },
  
  // Form labels
  form: {
    targetList: 'Target Address List',
    domainList: 'Target Domain List',
    urlList: 'Target URL List',
    testOptions: 'Test Options',
    recordType: 'Record Type',
    dnsServer: 'DNS Server',
    timeout: 'Timeout',
    retries: 'Retries',
    method: 'Request Method',
    packetSize: 'Packet Size',
    count: 'Test Count',
    maxHops: 'Max Hops',
    systemDefault: 'System Default'
  },
  
  // Placeholder text
  placeholder: {
    enterAddress: 'Enter IP address or domain',
    enterDomain: 'Enter domain (e.g., example.com)',
    enterUrl: 'Enter complete URL (e.g., https://www.example.com)',
    batchAdd: 'Enter content to add, one per line',
    search: 'Search favorites',
    selectRecordType: 'Select record type',
    selectDnsServer: 'Select DNS server',
    selectMethod: 'Select request method'
  },
  
  // Page titles
  pages: {
    ipLookup: 'IP/Domain Lookup',
    dnsTest: 'DNS Test',
    httpTest: 'HTTP Test',
    mtrTest: 'MTR Test',
    traceroute: 'Traceroute',
    pingTest: 'Ping Test'
  },
  
  // Test options
  testOptions: {
    aRecord: 'A Record',
    aaaaRecord: 'AAAA Record',
    cnameRecord: 'CNAME Record',
    mxRecord: 'MX Record',
    txtRecord: 'TXT Record',
    nsRecord: 'NS Record',
    getMethod: 'GET',
    postMethod: 'POST',
    headMethod: 'HEAD'
  },
  
  // Messages
  messages: {
    addSuccess: 'Added successfully',
    deleteSuccess: 'Deleted successfully',
    updateSuccess: 'Updated successfully',
    saveSuccess: 'Saved successfully',
    exportSuccess: 'Exported successfully',
    exportFailed: 'Export failed',
    importSuccess: 'Imported successfully',
    importFailed: 'Import failed',
    resetSuccess: 'Reset successfully',
    testSuccess: 'Test successful',
    addToFavorites: 'Added to favorites',
    alreadyInFavorites: 'This address is already in favorites',
    pleaseAddAddress: 'Please add at least one address',
    pleaseAddDomain: 'Please add at least one domain',
    pleaseAddUrl: 'Please add at least one URL',
    pleaseSelectItems: 'Please select items to add',
    pleaseEnterContent: 'Please enter content to add',
    noValidContent: 'No valid content to add',
    confirmDelete: 'Are you sure you want to delete this favorite?',
    confirmReset: 'Are you sure you want to reset all settings? This action cannot be undone.',
    confirmClearAll: 'Are you sure you want to clear all application data? Including favorites, history and settings. This action cannot be undone!',
    clearAllSuccess: 'All data has been cleared',
    invalidSettingsFile: 'Invalid settings file format',
    getCurrentIpFailed: 'Failed to get current IP information',
    queryFailed: 'Query failed',
    testFailed: 'Test failed',
    saveFailed: 'Save failed',
    loadFailed: 'Load failed',
    testCompleted: 'Test completed',
    addedFromPage: 'Added from {page} page'
  },
  
  // Settings page
  settings: {
    title: 'Application Settings',
    lastSaved: 'Last saved',
    apiConfig: 'API Configuration',
    networkConfig: 'Network Test Configuration',
    uiConfig: 'Interface Configuration',
    dataManagement: 'Data Management',
    about: 'About Information',
    
    // API settings
    ipLookupService: 'IP Lookup Service',
    ipLookupServiceDesc: 'Select IP geolocation query service. Auto select mode will try multiple services in sequence to ensure query success.',
    ip2locationApiKey: 'IP2Location API Key',
    ip2locationApiKeyPlaceholder: 'Enter IP2Location API key',
    ip2locationApiKeyDesc: 'At',
    ipinfoToken: 'IPInfo.io Token',
    ipinfoTokenPlaceholder: 'Enter IPInfo.io access token (optional)',
    ipinfoTokenDesc: 'Optional. Providing a token gives you higher query limits and more detailed information',
    queryTimeout: 'Query Timeout',
    queryTimeoutDesc: 'Timeout for IP query requests, recommended 5-10 seconds',
    serviceTest: 'Service Test',
    serviceTestDesc: 'Test connectivity and response speed of IP query services',
    testCurrentService: 'Test Current Service',
    testAllServices: 'Test All Services',
    
    // Network settings
    defaultTimeout: 'Default Timeout',
    defaultTimeoutDesc: 'Default timeout for network tests',
    defaultRetries: 'Default Retries',
    defaultRetriesDesc: 'Number of retries when test fails',
    maxConcurrency: 'Max Concurrency',
    maxConcurrencyDesc: 'Maximum number of concurrent tests',
    pingCount: 'Ping Test Count',
    pingCountDesc: 'Number of packets sent per ping test',
    pingPacketSize: 'Ping Packet Size',
    pingPacketSizeDesc: 'Size of ping packets, default 32 bytes',
    
    // Interface settings
    theme: 'Theme',
    themeDesc: 'Select application appearance theme',
    language: 'Language',
    languageDesc: 'Select application interface language',
    autoUpdate: 'Auto Update',
    autoUpdateDesc: 'Automatically check and download application updates',
    showNotifications: 'Show Notifications',
    showNotificationsDesc: 'Show notification messages such as test completion',
    compactMode: 'Compact Mode',
    compactModeDesc: 'More compact interface, suitable for small screens',
    
    // Data settings
    autoSaveFavorites: 'Auto Save Favorites',
    autoSaveFavoritesDesc: 'Automatically save items added to favorites',
    maxHistoryRecords: 'Max History Records',
    maxHistoryRecordsDesc: 'Maximum number of history records to keep',
    autoCleanHistory: 'Auto Clean History',
    autoCleanHistoryDesc: 'Automatically clean expired history records',
    cleanHistoryDays: 'History Retention Days',
    cleanHistoryDaysDesc: 'Number of days to keep history records, records older than this will be automatically deleted',
    dataOperations: 'Data Operations',
    dataOperationsDesc: 'Manage application data: export/import settings, reset or clear all data',
    exportSettings: 'Export Settings',
    importSettings: 'Import Settings',
    resetSettings: 'Reset Settings',
    clearAllData: 'Clear All Data',
    
    // About information
    appName: 'Application Name',
    appNameValue: 'MultiSite Latency Tool',
    version: 'Version',
    buildDate: 'Build Date',
    author: 'Author',
    email: 'Email',
    license: 'Open Source License',
    homepage: 'Product Homepage',
    repository: 'Project Repository',
    bugReports: 'Bug Reports'
  },
  
  // Current IP information
  currentIp: {
    title: 'Current IP Information',
    address: 'Current IP Address',
    country: 'Country/Region',
    region: 'Province/State',
    city: 'City',
    isp: 'ISP',
    queryTime: 'Query Time',
    loading: 'Getting current IP information...',
    error: 'Unable to get current IP information, please click refresh to retry'
  },
  
  // Favorites
  favorites: {
    title: 'Favorites',
    addFavorite: 'Add Favorite',
    editFavorite: 'Edit Favorite',
    selectFromFavorites: 'Select from Favorites',
    addToList: 'Add to List',
    selectTestType: 'Select Test Type'
  },
  
  // Home page
  home: {
    tracerouteDesc: 'Trace the path of data packets from source to destination, showing latency and geographic information for each hop',
    favoritesDesc: 'Manage frequently used target addresses for quick testing',
    moreFeatures: 'More Features',
    comingSoon: 'Coming Soon...'
  }
} 