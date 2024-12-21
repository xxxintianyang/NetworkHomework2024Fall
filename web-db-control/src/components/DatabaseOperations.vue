<script setup>
import { ref } from 'vue'
import { api } from '../services/api'

const props = defineProps({
  tableName: String
})

const emit = defineEmits(['refresh'])
const searchQuery = ref('')

const handleSearch = async () => {
  if (!props.tableName) {
    alert('请先选择一个数据表');
    return;
  }

  try {
    const data = await api.getTableData(props.tableName, searchQuery.value)
    emit('refresh', data)
  } catch (error) {
    console.error('搜索失败:', error)
    alert('搜索失败: ' + error.message)
  }
}

const handleClear = () => {
  searchQuery.value = ''
  handleSearch()
}
</script>

<template>
  <div class="database-operations">
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="输入关键字搜索..."
        @keyup.enter="handleSearch"
        :disabled="!tableName"
      >
      <button 
        @click="handleSearch"
        :disabled="!tableName"
        class="search-button"
      >
        搜索
      </button>
      <button 
        v-if="searchQuery"
        @click="handleClear"
        class="clear-button"
      >
        清除
      </button>
    </div>
    <div class="search-hint" v-if="tableName">
      <small>提示：搜索将匹配所有字段的内容</small>
    </div>
  </div>
</template>

<style scoped>
.database-operations {
  margin-bottom: 1rem;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 0.5rem;
}

.search-bar input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  font-size: 14px;
}

.search-bar input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-button {
  background: #2c3e50;
  color: white;
}

.clear-button {
  background: #e74c3c;
  color: white;
}

.search-hint {
  color: #666;
  font-size: 12px;
}
</style> 