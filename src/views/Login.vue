<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="system-title">Oneself</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            :disabled="loading"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :disabled="loading"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="captcha">验证码</label>
          <div class="captcha-wrapper">
            <input
              id="captcha"
              v-model="loginForm.captchaCode"
              type="text"
              placeholder="请输入验证码"
              :disabled="loading"
              required
              maxlength="4"
              class="captcha-input"
            />
            <div class="captcha-image-wrapper" @click="refreshCaptcha" :class="{ loading: loadingCaptcha }">
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="验证码"
                class="captcha-image"
              />
              <div v-else class="captcha-placeholder">点击获取验证码</div>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>

      <div class="login-footer">
        <p class="copyright">© 2025 Oneself. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/index.js'
import { encryptPassword } from '../utils/crypto.js'

const router = useRouter()

const loading = ref(false)
const loadingCaptcha = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const captchaId = ref('')
const captchaImage = ref('')

const loginForm = reactive({
  username: 'crane',
  password: 'oneself!@#',
  captchaCode: ''
})

// 表单验证
const isFormValid = computed(() => {
  return loginForm.username &&
         loginForm.password &&
         loginForm.captchaCode &&
         captchaId.value
})

// 获取验证码
async function refreshCaptcha() {
  if (loadingCaptcha.value) return

  loadingCaptcha.value = true
  errorMessage.value = ''

  try {
    const response = await authApi.getCaptcha()

    // 根据实际响应结构调整
    if (response.data) {
      captchaId.value = response.data.captchaId || response.data.id
      captchaImage.value = response.data.captchaImage || response.data.image
    } else {
      captchaId.value = response.captchaId || response.id
      captchaImage.value = response.captchaImage || response.image
    }

    // 清空验证码输入
    loginForm.captchaCode = ''
  } catch (error) {
    console.error('获取验证码失败:', error)
    errorMessage.value = '获取验证码失败，请重试'
  } finally {
    loadingCaptcha.value = false
  }
}

// 处理登录
async function handleLogin() {
  if (!isFormValid.value) {
    errorMessage.value = '请填写完整信息'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // RSA 加密密码
    let encryptedPassword
    try {
      encryptedPassword = encryptPassword(loginForm.password)
      console.log('密码加密成功')
    } catch (error) {
      console.error('密码加密失败:', error)
      errorMessage.value = '密码加密失败，请重试'
      return
    }

    const response = await authApi.login({
      username: loginForm.username,
      password: encryptedPassword,
      captchaId: captchaId.value,
      captchaCode: loginForm.captchaCode
    })

    // 登录成功
    console.log('登录成功，完整响应:', response)
    console.log('保存的用户信息:', localStorage.getItem('user_info'))

    // 跳转到主页
    router.push('/')

  } catch (error) {
    console.error('登录失败:', error)

    // 根据错误类型显示不同提示
    if (error.code === 401 || error.status === 401) {
      errorMessage.value = '用户名或密码错误'
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '登录失败，请检查网络连接'
    }

    // 登录失败后刷新验证码
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取验证码
onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.system-title {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.system-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-group label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  width: 70px;
  flex-shrink: 0;
  line-height: 1.5;
  text-align: right;
  display: block;
  padding-right: 8px;
  box-sizing: border-box;
}

.form-group input {
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #fff;
  min-width: 0;
  height: 48px;
  font-family: inherit;
}

.form-group input::placeholder {
  color: #999;
  font-size: 15px;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 48px;
}

.password-input-wrapper input {
  height: 100%;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 18px;
  color: #666;
  transition: color 0.3s;
}

.password-toggle:hover:not(:disabled) {
  color: #667eea;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
  align-items: stretch;
  flex: 1;
  min-width: 0;
}

.captcha-input {
  flex: 1;
  min-width: 0;
  height: 48px;
}

.captcha-image-wrapper {
  width: 120px;
  min-width: 120px;
  height: 48px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: #f5f5f5;
  flex-shrink: 0;
}

.captcha-image-wrapper:hover:not(.loading) {
  border-color: #667eea;
}

.captcha-image-wrapper.loading {
  cursor: wait;
  opacity: 0.6;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captcha-placeholder {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 0 8px;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .system-title {
    font-size: 28px;
  }

  .captcha-wrapper {
    flex-direction: column;
    gap: 12px;
  }

  .captcha-image-wrapper {
    width: 100%;
    min-width: auto;
  }
}
</style>

