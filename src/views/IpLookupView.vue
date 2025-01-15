<template>
  <div class="ip-lookup">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>IP/域名查询</h3>
          <el-button-group>
            <el-button type="primary" @click="startQuery" :loading="loading">
              开始查询
            </el-button>
            <el-button @click="clearResults">
              清除结果
            </el-button>
            <el-button @click="showFavorites = true">
              从收藏夹选择
            </el-button>
          </el-button-group>
        </div>
      </template>

      <!-- 输入区域 -->
      <el-form :model="form" label-position="top">
        <el-form-item label="目标地址（每行一个域名或IP）">
          <el-input
            v-model="form.addresses"
            type="textarea"
            :rows="4"
            placeholder="请输入要查询的域名或IP地址，每行一个"
          />
        </el-form-item>
      </el-form>

      <!-- 结果表格 -->
      <div v-if="results.length > 0" class="results-table">
        <el-table :data="results" style="width: 100%" border>
          <el-table-column prop="query" label="查询地址" width="180" />
          <el-table-column prop="ip" label="IP地址" width="150" />
          <el-table-column prop="country" label="国家/地区" width="120" />
          <el-table-column prop="region" label="省份/州" width="120" />
          <el-table-column prop="city" label="城市" width="120" />
          <el-table-column prop="isp" label="ISP" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="addToFavorites(row.query)"
              >
                收藏
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 收藏夹对话框 -->
    <el-dialog
      v-model="showFavorites"
      title="从收藏夹选择"
      width="500px"
    >
      <el-table
        :data="favorites"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="note" label="备注" />
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showFavorites = false">取消</el-button>
          <el-button type="primary" @click="addSelectedToInput">
            添加到输入框
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import storageService from '../services/storage'
import ip2locationService from '../services/ip2location'

// 表单数据
const form = reactive({
  addresses: ''
})

// 状态变量
const loading = ref(false)
const results = ref([])
const showFavorites = ref(false)
const favorites = ref([])
const selectedFavorites = ref([])

// 加载收藏列表
const loadFavorites = () => {
  favorites.value = storageService.getFavorites()
}

// 在组件挂载时加载收藏列表
loadFavorites()

// 解析域名为IP地址
const resolveDomain = async (domain) => {
  try {
    // 通过 IPC 调用主进程的 DNS 解析
    const ip = await window.electron.ipcRenderer.invoke('resolve-dns', domain)
    return ip
  } catch (error) {
    console.error('域名解析失败:', error)
    return domain // 如果解析失败，返回原始输入
  }
}

// 开始查询
const startQuery = async () => {
  if (!form.addresses.trim()) {
    ElMessage.warning('请输入要查询的地址')
    return
  }

  loading.value = true
  results.value = [] // 清空之前的结果
  
  try {
    const addresses = form.addresses.split('\n').filter(addr => addr.trim())
    const tempResults = [] // 使用临时数组存储结果

    for (const address of addresses) {
      try {
        console.log('正在查询地址:', address)
        // 先尝试解析域名为IP
        const ip = await resolveDomain(address)
        console.log('解析到IP:', ip)
        
        // 查询IP地理位置
        const info = await ip2locationService.lookup(ip)
        console.log('获取到地理位置信息:', info)
        
        tempResults.push({
          query: address,
          ip: ip,
          country: info.country_name || '-',
          region: info.region_name || '-',
          city: info.city_name || '-',
          isp: info.isp || '-'
        })
      } catch (error) {
        console.error('查询失败:', error)
        tempResults.push({
          query: address,
          ip: '-',
          country: '-',
          region: '-',
          city: '-',
          isp: '-',
          error: error.message
        })
        ElMessage.error(`查询 ${address} 失败: ${error.message}`)
      }
    }

    results.value = tempResults // 更新响应式结果数组
    console.log('查询完成，结果:', results.value)
  } catch (error) {
    console.error('查询过程出错:', error)
    ElMessage.error('查询失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 清除结果
const clearResults = () => {
  results.value = []
}

// 添加到收藏夹
const addToFavorites = (address) => {
  // TODO: 调用收藏夹API
  ElMessage.success('已添加到收藏夹')
}

// 处理收藏夹选择变化
const handleSelectionChange = (selection) => {
  selectedFavorites.value = selection
}

// 添加选中项到输入框
const addSelectedToInput = () => {
  const currentValue = form.addresses.trim()
  const newAddresses = selectedFavorites.value.map(item => item.address)
  form.addresses = currentValue
    ? `${currentValue}\n${newAddresses.join('\n')}`
    : newAddresses.join('\n')
  showFavorites.value = false
}
</script>

<style scoped>
.ip-lookup {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-table {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 