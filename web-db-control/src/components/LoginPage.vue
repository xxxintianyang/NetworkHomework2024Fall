<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    return
  }

  loading.value = true
  try {
    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (username.value === 'admin' && password.value === 'admin') {
      emit('login', { username: username.value })
    } else {
      throw new Error('用户名或密码错误')
    }
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">DB</span>
        </div>
        <h1>Database Manager</h1>
        <p class="subtitle">Welcome back! Please login to your account.</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            v-model="username"
            placeholder="Enter your username"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="password"
            placeholder="Enter your password"
            required
            :disabled="loading"
          >
        </div>

        <button 
          type="submit" 
          class="login-button"
          :disabled="loading"
        >
          <span class="button-text">{{ loading ? 'Logging in...' : 'Login' }}</span>
          <span class="button-loader" v-if="loading"></span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: fixed;
  top: 0;
  left: 0;
}

.login-content {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.6s ease-out;
  margin: 0 auto;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  margin-bottom: 1.5rem;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #1a1a1a;
  color: white;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

input {
  padding: 0.75rem 1rem;
  border: 1.5px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #1a1a1a;
}

input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.login-button {
  padding: 0.875rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.login-button:hover {
  background: #000;
}

.login-button:disabled {
  background: #666;
  cursor: not-allowed;
}

.button-loader {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  position: absolute;
  right: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 