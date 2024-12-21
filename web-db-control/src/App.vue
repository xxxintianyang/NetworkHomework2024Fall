<script setup>
import { ref, onMounted } from 'vue'
import DatabaseTable from './components/DatabaseTable.vue'
import DatabaseOperations from './components/DatabaseOperations.vue'
import { api } from './services/api'

const currentTable = ref('')
const tables = ref([])

const fetchTables = async () => {
  try {
    tables.value = await api.getTables()
  } catch (error) {
    console.error('获取表列表失败:', error)
  }
}

onMounted(fetchTables)
</script>

<template>
  <div class="container">
    <header>
      <h1>数据库管理系统</h1>
    </header>

    <main class="main-content">
      <div class="sidebar">
        <h2>数据表列表</h2>
        <ul class="table-list">
          <li v-for="table in tables" 
              :key="table"
              :class="{ active: currentTable === table }"
              @click="currentTable = table">
            {{ table }}
          </li>
        </ul>
      </div>

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
    </main>
  </div>
</template>

<style>
/* 添加全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #ffffff;
}

#app {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
}
</style>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
}

header {
  margin-bottom: 2rem;
  text-align: center;
}

h1, h2 {
  color: #000000;
}

.main-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
}

.sidebar {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
}

.table-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.table-list li {
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  color: #000000;
  margin-bottom: 4px;
}

.table-list li:hover {
  background: #e0e0e0;
}

.table-list li.active {
  background: #2c3e50;
  color: white;
}

.content {
  background: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
