<script setup>
import { ref, onMounted } from 'vue'
import DatabaseTable from './components/DatabaseTable.vue'
import DatabaseOperations from './components/DatabaseOperations.vue'
import LoginPage from './components/LoginPage.vue'
import { api } from './services/api'
import CreateTableDialog from './components/CreateTableDialog.vue'

const currentTable = ref('')
const tables = ref([])
const loading = ref(true)
const isLoggedIn = ref(false)
const user = ref(null)
const showCreateTable = ref(false)

const fetchTables = async () => {
  try {
    tables.value = await api.getTables()
  } catch (error) {
    console.error('获取表列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleLogin = (userData) => {
  user.value = userData
  isLoggedIn.value = true
  fetchTables()
}

const handleLogout = () => {
  user.value = null
  isLoggedIn.value = false
  currentTable.value = ''
  tables.value = []
}

const handleCreateTable = async (tableData) => {
  try {
    await api.createTable(tableData)
    await fetchTables() // 刷新表列表
  } catch (error) {
    alert('创建表失败: ' + error.message)
  }
}

onMounted(fetchTables)
</script>

<template>
  <Transition name="fade" mode="out-in">
    <LoginPage 
      v-if="!isLoggedIn" 
      @login="handleLogin"
    />
    
    <div v-else class="app-container">
      <div class="container">
        <header>
          <Transition name="slide-right">
            <div class="logo">
              <span class="icon">DB</span>
              <h1>Database Manager</h1>
            </div>
          </Transition>
          
          <Transition name="slide-right">
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <button class="logout-button" @click="handleLogout">
                Logout
              </button>
            </div>
          </Transition>
        </header>

        <main class="main-content" :class="{ 'loading': loading }">
          <Transition name="slide-right">
            <div class="sidebar">
              <div class="section-header">
                <div class="section-title">数据表</div>
                <button class="create-table-button" @click="showCreateTable = true">
                  创建表
                </button>
              </div>
              <div class="table-list-container">
                <TransitionGroup name="slide-right" tag="ul" class="table-list">
                  <li v-for="table in tables" 
                      :key="table"
                      :class="{ active: currentTable === table }"
                      @click="currentTable = table">
                    {{ table }}
                  </li>
                </TransitionGroup>
              </div>
            </div>
          </Transition>

          <Transition name="fade" mode="out-in">
            <div class="content">
              <DatabaseOperations 
                :tableName="currentTable" 
                @refresh="$refs.dataTable?.refreshData"
              />
              <DatabaseTable 
                ref="dataTable"
                :tableName="currentTable" 
              />
            </div>
          </Transition>
        </main>
      </div>
    </div>
  </Transition>

  <Transition name="slide-up">
    <CreateTableDialog
      v-if="showCreateTable"
      v-model:visible="showCreateTable"
      @create="handleCreateTable"
    />
  </Transition>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#app {
  width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 优雅的滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 添加全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 添加按钮悬浮动画 */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 添加表格行悬浮动画 */
tr {
  transition: all 0.2s ease;
}

tr:hover {
  background-color: #f8f9fa;
}

/* 添加列表项悬浮动画 */
.table-list li {
  transition: all 0.2s ease;
}

.table-list li:hover {
  transform: translateX(5px);
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 1400px;
  background: transparent;
}

header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon {
  background: #1a1a1a;
  color: #ffffff;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}

h1 {
  color: #1a1a1a;
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.5px;
}

.main-content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  min-height: calc(100vh - 200px);
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.main-content.loading {
  opacity: 0.5;
}

.sidebar {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.table-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.table-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 8px;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 400;
}

.table-list li:hover {
  background: #f8f9fa;
}

.table-list li.active {
  background: #f0f0f0;
  color: #1a1a1a;
  font-weight: 500;
}

.content {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 16px;
  min-height: 500px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

@media (max-width: 1024px) {
  .app-container {
    padding: 1rem;
  }

  .main-content {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    height: auto;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.logout-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1.5px solid #eee;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: #f8f9fa;
  border-color: #ddd;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.create-table-button {
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.create-table-button:hover {
  background: #000;
}
</style>
