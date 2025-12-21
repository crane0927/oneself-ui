<template>
  <div class="home-container">
    <header class="home-header">
      <div class="header-content">
        <h1 class="system-title">Oneself</h1>
        <div class="user-info">
          <span class="username">{{ userInfo?.username || '用户' }}</span>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </header>

    <main class="home-main">
      <div class="welcome-card">
        <h2>欢迎使用 Oneself 系统</h2>
        <p class="welcome-text">您已成功登录系统</p>

        <div class="info-section">
          <div class="info-item">
            <span class="info-label">用户名：</span>
            <span class="info-value">{{ userInfo?.username || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">登录时间：</span>
            <span class="info-value">{{ loginTime }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/index.js'
import { STORAGE_KEYS } from '../api/config.js'

const router = useRouter()
const userInfo = ref(null)
const loginTime = ref('')

// 获取用户信息
function loadUserInfo() {
  const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO)
  console.log('从 localStorage 读取用户信息:', userInfoStr)

  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr)
      console.log('解析后的用户信息:', userInfo.value)
    } catch (e) {
      console.error('解析用户信息失败:', e)
      // 如果解析失败，尝试作为普通字符串处理
      userInfo.value = {
        username: userInfoStr
      }
    }
  } else {
    console.warn('未找到用户信息，使用默认值')
    // 如果没有用户信息，至少显示默认值
    userInfo.value = {
      username: '用户'
    }
  }

  // 设置登录时间
  const now = new Date()
  loginTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 退出登录
async function handleLogout() {
  try {
    await authApi.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)

    // 如果是 CORS 错误或其他网络错误，仍然清除本地数据
    // 因为前端已经无法与后端通信，本地退出是合理的
    if (error.name === 'CORS_ERROR' || error.message?.includes('Failed to fetch')) {
      console.warn('网络错误，执行本地退出')
    }

    // 即使退出失败，也清除本地数据并跳转
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    router.push('/login')
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.system-title {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
  letter-spacing: 1px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  font-size: 14px;
  color: #333;
}

.logout-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.home-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.welcome-card h2 {
  font-size: 28px;
  color: #333;
  margin: 0 0 12px 0;
}

.welcome-text {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
}

.info-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e0e0e0;
}

.info-item {
  display: flex;
  margin-bottom: 16px;
  font-size: 15px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.info-value {
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 16px 0;
    gap: 12px;
  }

  .welcome-card {
    padding: 24px;
  }

  .welcome-card h2 {
    font-size: 24px;
  }
}
</style>

