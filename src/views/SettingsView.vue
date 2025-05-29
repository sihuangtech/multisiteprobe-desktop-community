<template>
  <div class="settings-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ $t('settings.title') }}</h3>
          <div class="save-status">
            <el-icon v-if="saving" class="is-loading"><Loading /></el-icon>
            <span v-if="lastSaved" class="save-time">{{ $t('settings.lastSaved') }}: {{ lastSaved }}</span>
          </div>
        </div>
      </template>

      <el-form :model="settings" label-width="120px" label-position="left">
        <!-- API配置 -->
        <el-card class="setting-card">
          <template #header>
            <h3>{{ $t('settings.apiConfig') }}</h3>
          </template>
          
          <el-form :model="apiSettings" label-width="150px">
            <el-form-item :label="$t('settings.ipLookupService')">
              <el-select v-model="apiSettings.ipLookupService" :placeholder="$t('settings.ipLookupService')" @change="saveApiSettings">
                <el-option 
                  label="ip-api.com (免费)" 
                  value="ip-api"
                  :disabled="false"
                >
                  <span>ip-api.com ({{ $t('common.free') || '免费' }})</span>
                  <span style="float: right; color: #8cc8ff; font-size: 12px;">{{ $t('common.recommended') || '推荐' }}</span>
                </el-option>
                <el-option 
                  label="ipapi.co (免费)" 
                  value="ipapi"
                  :disabled="false"
                >
                  <span>ipapi.co ({{ $t('common.free') || '免费' }})</span>
                </el-option>
                <el-option 
                  label="IP2Location (付费)" 
                  value="ip2location"
                  :disabled="!apiSettings.ip2locationApiKey"
                >
                  <span>IP2Location ({{ $t('common.paid') || '付费' }})</span>
                  <span v-if="!apiSettings.ip2locationApiKey" style="float: right; color: #f56c6c; font-size: 12px;">{{ $t('common.apiKeyRequired') || '需要API密钥' }}</span>
                </el-option>
                <el-option 
                  label="IPInfo.io (免费/付费)" 
                  value="ipinfo"
                  :disabled="false"
                >
                  <span>IPInfo.io ({{ $t('common.freePaid') || '免费/付费' }})</span>
                </el-option>
                <el-option 
                  label="自动选择 (推荐)" 
                  value="auto"
                  :disabled="false"
                >
                  <span>{{ $t('common.autoSelect') || '自动选择' }} ({{ $t('common.recommended') || '推荐' }})</span>
                  <span style="float: right; color: #67c23a; font-size: 12px;">{{ $t('common.smart') || '智能' }}</span>
                </el-option>
              </el-select>
              <div class="setting-description">
                {{ $t('settings.ipLookupServiceDesc') || '选择IP地理位置查询服务。自动选择模式会依次尝试多个服务以确保查询成功。' }}
              </div>
            </el-form-item>

            <el-form-item 
              :label="$t('settings.ip2locationApiKey')" 
              v-show="apiSettings.ipLookupService === 'ip2location' || apiSettings.ipLookupService === 'auto'"
            >
              <el-input
                v-model="apiSettings.ip2locationApiKey"
                :placeholder="$t('settings.ip2locationApiKeyPlaceholder') || '请输入IP2Location API密钥'"
                show-password
                clearable
                @blur="saveApiSettings"
              />
              <div class="setting-description">
                {{ $t('settings.ip2locationApiKeyDesc') || '在' }} 
                <el-link @click="openInBrowser('https://www.ip2location.io/')" type="primary">
                  IP2Location{{ $t('common.officialWebsite') || '官网' }}
                </el-link> 
                {{ $t('common.registerToGet') || '注册获取免费API密钥' }}
              </div>
            </el-form-item>

            <el-form-item 
              :label="$t('settings.ipinfoToken')" 
              v-show="apiSettings.ipLookupService === 'ipinfo' || apiSettings.ipLookupService === 'auto'"
            >
              <el-input
                v-model="apiSettings.ipinfoToken"
                :placeholder="$t('settings.ipinfoTokenPlaceholder') || '请输入IPInfo.io访问令牌（可选）'"
                show-password
                clearable
                @blur="saveApiSettings"
              />
              <div class="setting-description">
                {{ $t('settings.ipinfoTokenDesc') || '可选。提供Token可获得更高的查询限额和更详细的信息' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.queryTimeout')">
              <el-input-number
                v-model="apiSettings.ipLookupTimeout"
                :min="3"
                :max="30"
                :step="1"
                style="width: 200px"
                @change="saveApiSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.seconds') || '秒' }}</span>
              <div class="setting-description">
                {{ $t('settings.queryTimeoutDesc') || 'IP查询请求的超时时间，建议5-10秒' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.serviceTest')">
              <div class="service-test-section">
                <el-button 
                  type="primary" 
                  :loading="testingService" 
                  @click="testCurrentService"
                  :disabled="!canTestService"
                >
                  {{ $t('settings.testCurrentService') }}
                </el-button>
                <el-button 
                  type="default" 
                  :loading="testingAllServices" 
                  @click="testAllServices"
                >
                  {{ $t('settings.testAllServices') }}
                </el-button>
                
                <div v-if="testResults.length > 0" class="test-results">
                  <h4>{{ $t('common.testResults') || '测试结果' }}：</h4>
                  <div v-for="result in testResults" :key="result.service" class="test-result-item">
                    <el-tag 
                      :type="result.success ? 'success' : 'danger'" 
                      size="small"
                      style="margin-right: 10px"
                    >
                      {{ getServiceName(result.service) }}
                    </el-tag>
                    <span v-if="result.success" class="success-info">
                      ✓ {{ $t('table.responseTime') || '响应时间' }}: {{ result.responseTime }}ms
                    </span>
                    <span v-else class="error-info">
                      ✗ {{ result.error }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="setting-description">
                {{ $t('settings.serviceTestDesc') || '测试IP查询服务的连通性和响应速度' }}
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 网络测试配置 -->
        <el-card class="setting-card">
          <template #header>
            <h3>{{ $t('settings.networkConfig') }}</h3>
          </template>
          
          <el-form :model="networkSettings" label-width="150px">
            <el-form-item :label="$t('settings.defaultTimeout')">
              <el-input-number
                v-model="networkSettings.defaultTimeout"
                :min="1"
                :max="60"
                :step="1"
                style="width: 200px"
                @change="saveNetworkSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.seconds') || '秒' }}</span>
              <div class="setting-description">
                {{ $t('settings.defaultTimeoutDesc') || '网络测试的默认超时时间' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.defaultRetries')">
              <el-input-number
                v-model="networkSettings.defaultRetries"
                :min="1"
                :max="10"
                :step="1"
                style="width: 200px"
                @change="saveNetworkSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.times') || '次' }}</span>
              <div class="setting-description">
                {{ $t('settings.defaultRetriesDesc') || '测试失败时的重试次数' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.maxConcurrency')">
              <el-input-number
                v-model="networkSettings.maxConcurrency"
                :min="1"
                :max="20"
                :step="1"
                style="width: 200px"
                @change="saveNetworkSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.count') || '个' }}</span>
              <div class="setting-description">
                {{ $t('settings.maxConcurrencyDesc') || '同时进行的最大测试数量' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.pingCount')">
              <el-input-number
                v-model="networkSettings.pingCount"
                :min="1"
                :max="20"
                :step="1"
                style="width: 200px"
                @change="saveNetworkSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.times') || '次' }}</span>
              <div class="setting-description">
                {{ $t('settings.pingCountDesc') || '每次Ping测试发送的数据包数量' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.pingPacketSize')">
              <el-input-number
                v-model="networkSettings.pingPacketSize"
                :min="8"
                :max="1472"
                :step="8"
                style="width: 200px"
                @change="saveNetworkSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.bytes') || '字节' }}</span>
              <div class="setting-description">
                {{ $t('settings.pingPacketSizeDesc') || 'Ping数据包的大小，默认32字节' }}
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 界面配置 -->
        <el-card class="setting-card">
          <template #header>
            <h3>{{ $t('settings.uiConfig') }}</h3>
          </template>
          
          <el-form :model="uiSettings" label-width="150px">
            <el-form-item :label="$t('settings.theme')">
              <el-select v-model="uiSettings.theme" :placeholder="$t('settings.theme')" @change="onThemeChange">
                <el-option :label="$t('common.lightTheme') || '浅色主题'" value="light" />
                <el-option :label="$t('common.darkTheme') || '深色主题'" value="dark" />
                <el-option :label="$t('common.autoTheme') || '跟随系统'" value="auto" />
              </el-select>
              <div class="setting-description">
                {{ $t('settings.themeDesc') || '选择应用的外观主题' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.language')">
              <el-select v-model="uiSettings.language" :placeholder="$t('settings.language')" @change="onLanguageChange">
                <el-option :label="$t('common.simplifiedChinese') || '简体中文'" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
              <div class="setting-description">
                {{ $t('settings.languageDesc') || '选择应用界面语言' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.autoUpdate')">
              <el-switch v-model="uiSettings.autoUpdate" @change="saveUiSettings" />
              <div class="setting-description">
                {{ $t('settings.autoUpdateDesc') || '启用后会自动检查并下载应用更新' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.showNotifications')">
              <el-switch v-model="uiSettings.showNotifications" @change="saveUiSettings" />
              <div class="setting-description">
                {{ $t('settings.showNotificationsDesc') || '启用后会显示测试完成等通知消息' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.compactMode')">
              <el-switch v-model="uiSettings.compactMode" @change="saveUiSettings" />
              <div class="setting-description">
                {{ $t('settings.compactModeDesc') || '启用后界面会更加紧凑，适合小屏幕' }}
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 数据管理 -->
        <el-card class="setting-card">
          <template #header>
            <h3>{{ $t('settings.dataManagement') }}</h3>
          </template>
          
          <el-form :model="dataSettings" label-width="150px">
            <el-form-item :label="$t('settings.autoSaveFavorites')">
              <el-switch v-model="dataSettings.autoSaveFavorites" @change="saveDataSettings" />
              <div class="setting-description">
                {{ $t('settings.autoSaveFavoritesDesc') || '启用后会自动保存添加到收藏夹的项目' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.maxHistoryRecords')">
              <el-input-number
                v-model="dataSettings.maxHistoryRecords"
                :min="100"
                :max="10000"
                :step="100"
                style="width: 200px"
                @change="saveDataSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.records') || '条' }}</span>
              <div class="setting-description">
                {{ $t('settings.maxHistoryRecordsDesc') || '保存的最大历史记录数量' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.autoCleanHistory')">
              <el-switch v-model="dataSettings.autoCleanHistory" @change="saveDataSettings" />
              <div class="setting-description">
                {{ $t('settings.autoCleanHistoryDesc') || '启用后会自动清理过期的历史记录' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.cleanHistoryDays')" v-show="dataSettings.autoCleanHistory">
              <el-input-number
                v-model="dataSettings.cleanHistoryDays"
                :min="1"
                :max="365"
                :step="1"
                style="width: 200px"
                @change="saveDataSettings"
              />
              <span style="margin-left: 10px">{{ $t('common.days') || '天' }}</span>
              <div class="setting-description">
                {{ $t('settings.cleanHistoryDaysDesc') || '历史记录的保留天数，超过此时间的记录会被自动删除' }}
              </div>
            </el-form-item>

            <el-form-item :label="$t('settings.dataOperations')">
              <div class="data-operations">
                <el-button type="primary" @click="exportSettings">
                  {{ $t('settings.exportSettings') }}
                </el-button>
                <el-button type="default" @click="importSettings">
                  {{ $t('settings.importSettings') }}
                </el-button>
                <el-button type="warning" @click="resetSettings">
                  {{ $t('settings.resetSettings') }}
                </el-button>
                <el-button type="danger" @click="clearAllData">
                  {{ $t('settings.clearAllData') }}
                </el-button>
              </div>
              <div class="setting-description">
                {{ $t('settings.dataOperationsDesc') || '管理应用数据：导出/导入设置，重置或清除所有数据' }}
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 关于信息 -->
        <el-card class="setting-card">
          <template #header>
            <h3>{{ $t('settings.about') }}</h3>
          </template>
          
          <el-descriptions :column="3" border>
            <el-descriptions-item :label="$t('settings.appName')">
              {{ $t('settings.appNameValue') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.version')">
              {{ currentAppInfo.version }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.buildDate')">
              {{ currentAppInfo.buildDate }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.author')">
              {{ getAppAuthor() }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.email')">
              <el-link @click="openInBrowser(`mailto:${currentAppInfo.email}`)" type="primary">
                {{ currentAppInfo.email }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.license')">
              {{ currentAppInfo.license }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.homepage')">
              <el-link @click="openInBrowser(currentAppInfo.homepage)" type="primary">
                {{ currentAppInfo.homepage }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.repository')">
              <div class="repository-links">
                <el-link @click="openInBrowser(currentAppInfo.repository.github)" type="primary" style="margin-right: 10px">
                  GitHub
                </el-link>
                <el-link @click="openInBrowser(currentAppInfo.repository.gitee)" type="primary">
                  Gitee
                </el-link>
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.bugReports')">
              <div class="repository-links">
                <el-link @click="openInBrowser(currentAppInfo.bugReports.github)" type="primary" style="margin-right: 10px">
                  GitHub Issues
                </el-link>
                <el-link @click="openInBrowser(currentAppInfo.bugReports.gitee)" type="primary">
                  Gitee Issues
                </el-link>
              </div>
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="app-description">
            <p>{{ getAppDescription() }}</p>
          </div>
        </el-card>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import storageService from '../services/storage'
import ipService from '../services/ipService'
import { getAppInfo, getDescription, getAuthor } from '../config/appInfo'

// 注入国际化服务
const $t = inject('$t')
const $i18n = inject('$i18n')

// 应用信息
const currentAppInfo = ref(getAppInfo())

// 获取当前语言的应用描述
const getAppDescription = () => {
  return getDescription($i18n.currentLanguage.value)
}

// 获取当前语言的作者名字
const getAppAuthor = () => {
  return getAuthor($i18n.currentLanguage.value)
}

// 用默认浏览器打开链接
const openInBrowser = (url) => {
  console.log('openInBrowser called with URL:', url)
  // 直接使用window.open在默认浏览器中打开链接
  window.open(url, '_blank')
}

// 保存状态
const saving = ref(false)
const lastSaved = ref('')

// API设置
const apiSettings = reactive({
  ipLookupService: 'auto',
  ip2locationApiKey: '',
  ipinfoToken: '',
  ipLookupTimeout: 8
})

// 服务测试相关
const testingService = ref(false)
const testingAllServices = ref(false)
const testResults = ref([])

// 计算属性：是否可以测试当前服务
const canTestService = computed(() => {
  if (apiSettings.ipLookupService === 'ip2location' && !apiSettings.ip2locationApiKey) {
    return false
  }
  return true
})

// 获取服务名称
const getServiceName = (serviceId) => {
  const services = {
    'auto': $t('common.autoSelect') || '自动选择',
    'ip-api': 'ip-api.com',
    'ipapi': 'ipapi.co',
    'ip2location': 'IP2Location',
    'ipinfo': 'IPInfo.io'
  }
  return services[serviceId] || serviceId
}

// 网络测试设置
const networkSettings = reactive({
  defaultTimeout: 5,
  defaultRetries: 3,
  maxConcurrency: 5,
  pingCount: 4,
  pingPacketSize: 32
})

// 界面设置
const uiSettings = reactive({
  theme: 'light',
  language: 'zh-CN',
  autoUpdate: true,
  showNotifications: true,
  compactMode: false
})

// 数据管理设置
const dataSettings = reactive({
  autoSaveFavorites: true,
  maxHistoryRecords: 1000,
  autoCleanHistory: true,
  cleanHistoryDays: 30
})

// 主题切换处理
const onThemeChange = (theme) => {
  $i18n.setTheme(theme)
  saveUiSettings()
}

// 语言切换处理
const onLanguageChange = (language) => {
  $i18n.setLanguage(language)
  saveUiSettings()
}

// 自动保存函数
const autoSave = async (category, settings) => {
  saving.value = true
  try {
    storageService.saveSettings(category, { ...settings })
    lastSaved.value = new Date().toLocaleTimeString()
    console.log(`${category}设置已自动保存`)
  } catch (error) {
    console.error(`保存${category}设置失败:`, error)
    ElMessage.error($t('messages.saveFailed') || `保存${category}设置失败`)
  } finally {
    saving.value = false
  }
}

// 各类设置的保存函数
const saveApiSettings = () => autoSave('api', apiSettings)
const saveNetworkSettings = () => autoSave('network', networkSettings)
const saveUiSettings = () => autoSave('ui', uiSettings)
const saveDataSettings = () => autoSave('data', dataSettings)

// 加载设置
const loadSettings = () => {
  try {
    // 加载API设置
    const savedApiSettings = storageService.getSettings('api') || {}
    Object.assign(apiSettings, {
      ipLookupService: savedApiSettings.ipLookupService || 'auto',
      ip2locationApiKey: savedApiSettings.ip2locationApiKey || '',
      ipinfoToken: savedApiSettings.ipinfoToken || '',
      ipLookupTimeout: savedApiSettings.ipLookupTimeout || 8
    })

    // 加载网络设置
    const savedNetworkSettings = storageService.getSettings('network') || {}
    Object.assign(networkSettings, {
      defaultTimeout: savedNetworkSettings.defaultTimeout || 5,
      defaultRetries: savedNetworkSettings.defaultRetries || 3,
      maxConcurrency: savedNetworkSettings.maxConcurrency || 5,
      pingCount: savedNetworkSettings.pingCount || 4,
      pingPacketSize: savedNetworkSettings.pingPacketSize || 32
    })

    // 加载界面设置
    const savedUiSettings = storageService.getSettings('ui') || {}
    Object.assign(uiSettings, {
      theme: savedUiSettings.theme || 'light',
      language: savedUiSettings.language || 'zh-CN',
      autoUpdate: savedUiSettings.autoUpdate !== false,
      showNotifications: savedUiSettings.showNotifications !== false,
      compactMode: savedUiSettings.compactMode || false
    })

    // 加载数据设置
    const savedDataSettings = storageService.getSettings('data') || {}
    Object.assign(dataSettings, {
      autoSaveFavorites: savedDataSettings.autoSaveFavorites !== false,
      maxHistoryRecords: savedDataSettings.maxHistoryRecords || 1000,
      autoCleanHistory: savedDataSettings.autoCleanHistory !== false,
      cleanHistoryDays: savedDataSettings.cleanHistoryDays || 30
    })

    console.log('设置加载完成')
  } catch (error) {
    console.error('加载设置失败:', error)
    ElMessage.error($t('messages.loadFailed') || '加载设置失败')
  }
}

// 测试当前选择的服务
const testCurrentService = async () => {
  testingService.value = true
  testResults.value = []
  
  try {
    const settings = {
      ip2locationApiKey: apiSettings.ip2locationApiKey,
      ipinfoToken: apiSettings.ipinfoToken
    }
    
    const result = await ipService.testService(apiSettings.ipLookupService, settings)
    
    testResults.value = [{
      service: apiSettings.ipLookupService,
      success: result.success,
      responseTime: result.responseTime,
      error: result.error,
      data: result.data
    }]
    
    if (result.success) {
      ElMessage.success(`${getServiceName(apiSettings.ipLookupService)} ${$t('messages.testSuccess') || '测试成功'}！${$t('table.responseTime') || '响应时间'}: ${result.responseTime}ms`)
    } else {
      ElMessage.error(`${getServiceName(apiSettings.ipLookupService)} ${$t('messages.testFailed') || '测试失败'}: ${result.error}`)
    }
  } catch (error) {
    ElMessage.error(($t('messages.testFailed') || '测试失败') + ': ' + error.message)
    testResults.value = [{
      service: apiSettings.ipLookupService,
      success: false,
      error: error.message
    }]
  } finally {
    testingService.value = false
  }
}

// 测试所有可用服务
const testAllServices = async () => {
  testingAllServices.value = true
  testResults.value = []
  
  try {
    const servicesToTest = ['ip-api', 'ipapi', 'ipinfo']
    
    // 如果有IP2Location密钥，也测试它
    if (apiSettings.ip2locationApiKey) {
      servicesToTest.push('ip2location')
    }
    
    const settings = {
      ip2locationApiKey: apiSettings.ip2locationApiKey,
      ipinfoToken: apiSettings.ipinfoToken
    }
    
    const results = []
    
    for (const serviceId of servicesToTest) {
      try {
        const result = await ipService.testService(serviceId, settings)
        results.push({
          service: serviceId,
          success: result.success,
          responseTime: result.responseTime,
          error: result.error,
          data: result.data
        })
      } catch (error) {
        results.push({
          service: serviceId,
          success: false,
          error: error.message
        })
      }
    }
    
    testResults.value = results
    
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    
    if (successCount === totalCount) {
      ElMessage.success(`${$t('common.all') || '所有'} ${totalCount} ${$t('common.services') || '个服务'}${$t('messages.testSuccess') || '测试成功'}！`)
    } else if (successCount > 0) {
      ElMessage.warning(`${successCount}/${totalCount} ${$t('common.services') || '个服务'}${$t('messages.testSuccess') || '测试成功'}`)
    } else {
      ElMessage.error($t('common.allServicesTestFailed') || '所有服务测试失败')
    }
  } catch (error) {
    ElMessage.error(($t('common.batchTestFailed') || '批量测试失败') + ': ' + error.message)
  } finally {
    testingAllServices.value = false
  }
}

// 重置设置
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      $t('messages.confirmReset') || '确定要重置所有设置吗？此操作不可撤销。',
      $t('settings.resetSettings') || '重置设置',
      {
        confirmButtonText: $t('buttons.confirm') || '确定',
        cancelButtonText: $t('buttons.cancel') || '取消',
        type: 'warning'
      }
    )

    // 重置为默认值
    Object.assign(apiSettings, {
      ipLookupService: 'auto',
      ip2locationApiKey: '',
      ipinfoToken: '',
      ipLookupTimeout: 8
    })

    Object.assign(networkSettings, {
      defaultTimeout: 5,
      defaultRetries: 3,
      maxConcurrency: 5,
      pingCount: 4,
      pingPacketSize: 32
    })

    Object.assign(uiSettings, {
      theme: 'light',
      language: 'zh-CN',
      autoUpdate: true,
      showNotifications: true,
      compactMode: false
    })

    Object.assign(dataSettings, {
      autoSaveFavorites: true,
      maxHistoryRecords: 1000,
      autoCleanHistory: true,
      cleanHistoryDays: 30
    })

    // 保存重置后的设置
    await Promise.all([
      autoSave('api', apiSettings),
      autoSave('network', networkSettings),
      autoSave('ui', uiSettings),
      autoSave('data', dataSettings)
    ])
    
    ElMessage.success($t('messages.resetSuccess') || '设置已重置为默认值')
  } catch (error) {
    // 用户取消操作
    console.log('用户取消重置操作')
  }
}

// 导出设置
const exportSettings = () => {
  try {
    const allSettings = {
      api: { ...apiSettings },
      network: { ...networkSettings },
      ui: { ...uiSettings },
      data: { ...dataSettings },
      exportTime: new Date().toISOString(),
      version: currentAppInfo.value.version
    }

    const dataStr = JSON.stringify(allSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `MultiSiteLatencyTool-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    ElMessage.success($t('messages.exportSuccess') || '设置导出成功')
  } catch (error) {
    console.error('导出设置失败:', error)
    ElMessage.error($t('messages.exportFailed') || '导出设置失败')
  }
}

// 导入设置
const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result)
        
        // 验证导入的设置格式
        if (!importedSettings.api || !importedSettings.network) {
          throw new Error($t('messages.invalidSettingsFile') || '无效的设置文件格式')
        }

        // 应用导入的设置
        Object.assign(apiSettings, importedSettings.api)
        Object.assign(networkSettings, importedSettings.network)
        Object.assign(uiSettings, importedSettings.ui)
        Object.assign(dataSettings, importedSettings.data)

        // 保存导入的设置
        await Promise.all([
          autoSave('api', apiSettings),
          autoSave('network', networkSettings),
          autoSave('ui', uiSettings),
          autoSave('data', dataSettings)
        ])
        
        ElMessage.success($t('messages.importSuccess') || '设置导入成功')
      } catch (error) {
        console.error('导入设置失败:', error)
        ElMessage.error(($t('messages.importFailed') || '导入设置失败') + '：' + error.message)
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// 清除所有数据
const clearAllData = async () => {
  try {
    await ElMessageBox.confirm(
      $t('messages.confirmClearAll') || '确定要清除所有应用数据吗？包括收藏夹、历史记录和设置。此操作不可撤销！',
      $t('settings.clearAllData') || '清除所有数据',
      {
        confirmButtonText: $t('buttons.confirmClear') || '确定清除',
        cancelButtonText: $t('buttons.cancel') || '取消',
        type: 'error'
      }
    )

    // 清除所有存储的数据
    storageService.clearAll()
    
    // 重置当前设置为默认值
    await resetSettings()
    
    ElMessage.success($t('messages.clearAllSuccess') || '所有数据已清除')
  } catch (error) {
    // 用户取消操作
    console.log('用户取消清除操作')
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-view {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.save-time {
  color: #67c23a;
}

.setting-card {
  margin-bottom: 20px;
}

.setting-description {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.service-test-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.test-results {
  margin-top: 10px;
  width: 100%;
}

.test-result-item {
  margin-bottom: 5px;
}

.success-info {
  color: #67c23a;
}

.error-info {
  color: #f56c6c;
}

.data-operations {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.data-operations .el-button {
  margin: 0;
}

.app-description {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
}

.repository-links {
  display: flex;
  align-items: center;
}

/* 深色主题下的描述区域 */
html.dark .app-description {
  background-color: #3a3a3a;
  color: #e5e7eb;
}
</style> 