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
  }
})

const emit = defineEmits(['update:visible', 'save'])

const formData = ref({})
const loading = ref(false)

// 根据表名获取默认字段
const getDefaultFields = () => {
  if (props.tableName === 'users') {
    return {
      username: '',
      email: ''
    }
  } else if (props.tableName === 'products') {
    return {
      name: '',
      price: 0,
      stock: 0,
      description: ''
    }
  }
  return {}
}

// 当对话框显示时初始化表单数据
watch(() => props.visible, (val) => {
  if (val) {
    formData.value = props.mode === 'edit' 
      ? { ...props.record }
      : getDefaultFields()
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // 过滤掉不应该提交的字段
    const submitData = { ...formData.value }
    delete submitData.id
    delete submitData.created_at
    delete submitData.updated_at
    
    await emit('save', submitData)
    emit('update:visible', false)
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

const getInputType = (key) => {
  switch (key) {
    case 'email':
      return 'email'
    case 'price':
    case 'stock':
      return 'number'
    default:
      return 'text'
  }
}

const getFieldLabel = (key) => {
  const labels = {
    username: '用户名',
    email: '邮箱',
    name: '名称',
    price: '价格',
    stock: '库存',
    description: '描述'
  }
  return labels[key] || key
}
</script>

<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <h3>{{ mode === 'add' ? '添加记录' : '编辑记录' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <div v-for="(value, key) in formData" 
             :key="key" 
             class="form-item">
          <label>{{ getFieldLabel(key) }}</label>
          <input 
            v-if="key !== 'id' && 
                  key !== 'created_at' && 
                  key !== 'updated_at'"
            v-model="formData[key]"
            :type="getInputType(key)"
            :required="key !== 'description'"
            :step="getInputType(key) === 'number' ? '0.01' : undefined"
          >
          <textarea 
            v-else-if="key === 'description'"
            v-model="formData[key]"
            rows="3"
          ></textarea>
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