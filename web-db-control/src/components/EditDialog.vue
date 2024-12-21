<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  tableName: String,
  record: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String,
    default: 'add'
  },
  columns: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = ref({})
const loading = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    formData.value = { ...props.record }
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await emit('save', formData.value)
    emit('update:visible', false)
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

const getInputType = (column) => {
  const type = column.Type.toUpperCase()
  if (type.includes('INT')) return 'number'
  if (type.includes('DECIMAL') || type.includes('FLOAT') || type.includes('DOUBLE')) return 'number'
  if (type.includes('DATE')) return 'date'
  if (type.includes('TIME')) return 'datetime-local'
  return 'text'
}

const isEditable = (field) => {
  return !['id', 'created_at', 'updated_at'].includes(field)
}
</script>

<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <h3>{{ mode === 'add' ? '添加记录' : '编辑记录' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <div v-for="col in columns" 
             :key="col.Field" 
             class="form-item">
          <template v-if="isEditable(col.Field)">
            <label>{{ col.Field }}</label>
            <input 
              v-model="formData[col.Field]"
              :type="getInputType(col)"
              :required="col.Null === 'NO'"
              :placeholder="`请输入${col.Field}`"
            >
          </template>
        </div>
        
        <div class="dialog-actions">
          <button 
            type="button" 
            @click="$emit('update:visible', false)"
          >取消</button>
          <button 
            type="submit"
            :disabled="loading"
            class="primary"
          >
            {{ loading ? '保存中...' : '保存' }}
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
  border-radius: 8px;
  min-width: 400px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  color: #000;
}

.form-item {
  margin-bottom: 1rem;
}

.form-item label {
  display: block;
  margin-bottom: 0.5rem;
  color: #000;
  font-weight: bold;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item textarea {
  resize: vertical;
}

.dialog-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button.primary {
  background: #42b983;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

h3 {
  color: #000;
  margin-bottom: 1.5rem;
}
</style> 