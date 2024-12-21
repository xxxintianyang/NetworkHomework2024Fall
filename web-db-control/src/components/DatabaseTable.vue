<script setup>
import { ref, watch } from 'vue'
import { api } from '../services/api'
import EditDialog from './EditDialog.vue'

const props = defineProps({
  tableName: String
})

const tableData = ref([])
const columns = ref([])
const loading = ref(false)
const showDialog = ref(false)
const editingRecord = ref(null)
const dialogMode = ref('add')

const fetchTableStructure = async () => {
  if (!props.tableName) return
  try {
    const structure = await api.getTableStructure(props.tableName)
    columns.value = structure
  } catch (error) {
    console.error('获取表结构失败:', error)
  }
}

const fetchTableData = async () => {
  if (!props.tableName) return
  
  loading.value = true
  try {
    const data = await api.getTableData(props.tableName)
    tableData.value = data
  } catch (error) {
    console.error('获取表数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  if (!props.tableName) {
    alert('请先选择一个数据表')
    return
  }
  dialogMode.value = 'add'
  editingRecord.value = columns.value.reduce((acc, col) => {
    if (!['id', 'created_at', 'updated_at'].includes(col.Field)) {
      acc[col.Field] = ''
    }
    return acc
  }, {})
  showDialog.value = true
}

const editRow = (row) => {
  dialogMode.value = 'edit'
  editingRecord.value = { ...row }
  showDialog.value = true
}

const deleteRow = async (row) => {
  if (!confirm('确定要删除这条记录吗？')) return
  
  try {
    await api.deleteRecord(props.tableName, row.id)
    await fetchTableData()
  } catch (error) {
    console.error('删除记录失败:', error)
    alert(error.response?.data?.message || '删除失败')
  }
}

const handleSave = async (data) => {
  try {
    if (dialogMode.value === 'add') {
      await api.addRecord(props.tableName, data)
    } else {
      await api.updateRecord(props.tableName, data.id, data)
    }
    showDialog.value = false
    await fetchTableData()
  } catch (error) {
    console.error('保存记录失败:', error)
    alert(error.response?.data?.message || '保存失败')
  }
}

const refreshData = (data) => {
  if (data) {
    tableData.value = data
  } else {
    fetchTableData()
  }
}

watch(() => props.tableName, async (newVal) => {
  if (newVal) {
    await fetchTableStructure()
    await fetchTableData()
  }
})

defineExpose({ refreshData })
</script>

<template>
  <div class="database-table">
    <h2>{{ tableName || '请选择数据表' }}</h2>
    
    <div class="table-actions">
      <button @click="handleAdd" class="add-button">添加记录</button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <table v-else-if="tableName && columns.length">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.Field">{{ col.Field }}</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in tableData" :key="row.id">
          <td v-for="col in columns" :key="col.Field">{{ row[col.Field] }}</td>
          <td class="actions">
            <button @click="editRow(row)">编辑</button>
            <button @click="deleteRow(row)" class="delete">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="tableName" class="no-data">
      暂无数据
    </div>
    
    <EditDialog
      v-if="showDialog"
      v-model:visible="showDialog"
      :table-name="tableName"
      :record="editingRecord"
      :mode="dialogMode"
      :columns="columns"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.database-table {
  width: 100%;
  overflow-x: auto;
  color: #000;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  color: #000;
}

.actions button {
  margin-right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.actions button.delete {
  background: #ff4444;
  color: white;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.table-actions {
  margin-bottom: 1rem;
}

.add-button {
  background: #42b983;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

h2 {
  color: #000;
}
</style> 