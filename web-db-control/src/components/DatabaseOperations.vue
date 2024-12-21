<script setup>
import { ref } from 'vue'
import { api } from '../services/api'

const props = defineProps({
  tableName: String
})

const emit = defineEmits(['refresh'])
const searchQuery = ref('')

const handleSearch = async () => {
  try {
    const data = await api.getTableData(props.tableName, searchQuery.value)
    emit('refresh', data)
  } catch (error) {
    console.error('搜索失败:', error)
  }
}
</script>

<template>
  <div class="database-operations">
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="搜索记录..."
        @keyup.enter="handleSearch"
      >
      <button @click="handleSearch">搜索</button>
    </div>
  </div>
</template>

<style scoped>
.database-operations {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-bar input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #2c3e50;
  color: white;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
</style> 