import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import i18nService from './services/i18nService'
import './style.css'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 初始化国际化服务
i18nService.init()

// 全局提供国际化服务
app.provide('$t', i18nService.t)
app.provide('$i18n', i18nService)

// 使用插件
app.use(ElementPlus)
app.use(router)

// 挂载应用
app.mount('#app') 