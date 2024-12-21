<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'create'])

const tableName = ref('')
const columns = ref([
  { name: 'id', type: 'INT', length: '', isPrimary: true, autoIncrement: true, nullable: false }
])
const loading = ref(false)

const addColumn = () => {
  columns.value.push({
    name: '',
    type: 'VARCHAR',
    length: '255',
    isPrimary: false,
    autoIncrement: false,
    nullable: true
  })
}

const removeColumn = (index) => {
  if (index === 0) return // 不允许删除ID列
  columns.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!tableName.value) {
    alert('请输入表名')
    return
  }

  if (columns.value.some(col => !col.name)) {
    alert('请填写所有列名')
    return
  }

  loading.value = true
  try {
    await emit('create', {
      tableName: tableName.value,
      columns: columns.value
    })
    emit('update:visible', false)
    // 重置表单
    tableName.value = ''
    columns.value = [
      { name: 'id', type: 'INT', length: '', isPrimary: true, autoIncrement: true, nullable: false }
    ]
  } finally {
    loading.value = false
  }
}

const dataTypes = [
  'INT',
  'VARCHAR',
  'TEXT',
  'DECIMAL',
  'DATETIME',
  'BOOLEAN'
]
</script>

<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <h3>创建新数据表</h3>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>表名</label>
          <input 
            v-model="tableName"
            type="text"
            placeholder="输入表名"
            required
          >
        </div>

        <div class="columns-section">
          <div class="section-header">
            <h4>列定义</h4>
            <button type="button" @click="addColumn" class="add-button">
              添加列
            </button>
          </div>

          <div class="columns-list">
            <div v-for="(column, index) in columns" 
                 :key="index"
                 class="column-item">
              <div class="column-grid">
                <input 
                  v-model="column.name"
                  placeholder="列名"
                  :disabled="index === 0"
                  required
                >
                
                <select v-model="column.type">
                  <option v-for="type in dataTypes" 
                          :key="type" 
                          :value="type">
                    {{ type }}
                  </option>
                </select>

                <input 
                  v-if="column.type === 'VARCHAR' || column.type === 'DECIMAL'"
                  v-model="column.length"
                  placeholder="长度"
                  type="text"
                >
                
                <div class="column-options">
                  <label>
                    <input 
                      type="checkbox" 
                      v-model="column.nullable"
                      :disabled="column.isPrimary"
                    >
                    可空
                  </label>
                  
                  <label>
                    <input 
                      type="checkbox" 
                      v-model="column.isPrimary"
                      :disabled="index !== 0"
                    >
                    主键
                  </label>
                  
                  <label>
                    <input 
                      type="checkbox" 
                      v-model="column.autoIncrement"
                      :disabled="!column.isPrimary"
                    >
                    自增
                  </label>
                </div>

                <button 
                  v-if="index !== 0"
                  type="button" 
                  @click="removeColumn(index)"
                  class="remove-button"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button 
            type="button" 
            @click="$emit('update:visible', false)"
          >
            取消
          </button>
          <button 
            type="submit"
            :disabled="loading"
            class="primary"
          >
            {{ loading ? '创建中...' : '创建表' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

h3 {
  margin: 0 0 1.5rem;
  font-size: 20px;
  font-weight: 500;
}

h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 14px;
  font-weight: 500;
}

input, select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.columns-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.column-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.column-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr auto;
  gap: 1rem;
  align-items: center;
}

.column-options {
  display: flex;
  gap: 1rem;
}

.column-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.dialog-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: #f0f0f0;
}

button.primary {
  background: #1a1a1a;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-button {
  background: #1a1a1a;
  color: white;
}

.remove-button {
  background: #ff4444;
  color: white;
}

@media (max-width: 768px) {
  .column-grid {
    grid-template-columns: 1fr;
  }
}
</style> 