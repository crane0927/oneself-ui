<template>
  <div class="login-container">
    <el-card class="login-box" shadow="always">
      <template #header>
        <div class="login-header">
          <h1 class="system-title">Oneself</h1>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="formRules"
        @submit.prevent="handleLogin"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :disabled="loading"
            clearable
            autocomplete="username"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            :disabled="loading"
            clearable
            autocomplete="current-password"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <el-icon
                class="password-toggle"
                @click="showPassword = !showPassword"
                :style="{ cursor: loading ? 'not-allowed' : 'pointer' }"
              >
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="captchaCode">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captchaCode"
              placeholder="请输入验证码"
              :disabled="loading"
              maxlength="4"
              clearable
              @keyup.enter="handleLogin"
              style="flex: 1"
            />
            <div
              class="captcha-image-wrapper"
              @click="refreshCaptcha"
              v-loading="loadingCaptcha"
            >
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="验证码"
                class="captcha-image"
              />
              <div v-else class="captcha-placeholder">点击获取验证码</div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!isFormValid"
            @click="handleLogin"
            style="width: 100%"
            size="large"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />

      <div class="login-footer">
        <p class="copyright">© 2025 Oneself. All rights reserved.</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { authApi } from '../api/index.js'
import { encryptPassword } from '../utils/crypto.js'

const router = useRouter()
const formRef = ref(null)

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

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为4位', trigger: 'blur' }
  ]
}

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
    ElMessage.error('获取验证码失败，请重试')
    errorMessage.value = '获取验证码失败，请重试'
  } finally {
    loadingCaptcha.value = false
  }
}

// 处理登录
async function handleLogin() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch (error) {
    if (error === false) {
      errorMessage.value = '请填写完整信息'
      return
    }
  }

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
      ElMessage.error('密码加密失败，请重试')
      return
    }

    if (!encryptedPassword) {
      errorMessage.value = '密码加密失败，请重试'
      ElMessage.error('密码加密失败，请重试')
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
    ElMessage.success('登录成功')

    // 跳转到主页
    router.push('/')

  } catch (error) {
    console.error('登录失败:', error)

    // 根据错误类型显示不同提示
    if (error.code === 401 || error.status === 401) {
      errorMessage.value = '用户名或密码错误'
      ElMessage.error('用户名或密码错误')
    } else if (error.message) {
      errorMessage.value = error.message
      ElMessage.error(error.message)
    } else {
      errorMessage.value = '登录失败，请检查网络连接'
      ElMessage.error('登录失败，请检查网络连接')
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
}

.system-title {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
  letter-spacing: 2px;
}

.password-toggle {
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: #409eff;
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.captcha-image-wrapper {
  width: 120px;
  min-width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: #f5f7fa;
  flex-shrink: 0;
}

.captcha-image-wrapper:hover {
  border-color: #409eff;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captcha-placeholder {
  font-size: 12px;
  color: #909399;
  text-align: center;
  padding: 0 8px;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.copyright {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
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

