<template>
  <MainLayout>
    <div class="home-container">
      <main class="home-main">
        <!-- 欢迎卡片 -->
        <el-card class="welcome-card" shadow="hover">
          <template #header>
            <div class="welcome-header">
              <el-icon class="welcome-icon"><Star /></el-icon>
              <h2>欢迎使用 Oneself 系统</h2>
            </div>
          </template>
          <p class="welcome-text">您已成功登录系统</p>

          <el-descriptions :column="1" border class="info-section">
            <el-descriptions-item label="用户名">
              {{ userInfo?.username || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="登录时间">
              {{ loginTime }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Star } from '@element-plus/icons-vue'
import { STORAGE_KEYS } from '../api/config.js'
import MainLayout from '../components/MainLayout.vue'

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
      userInfo.value = {
        username: userInfoStr
      }
    }
  } else {
    console.warn('未找到用户信息，使用默认值')
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

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.home-container {
  height: 100%;
}

.home-main {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
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

.welcome-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.welcome-icon {
  color: #f39c12;
  font-size: 24px;
}

.welcome-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.welcome-text {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
}

.info-section {
  margin-top: 16px;
}

/* 夜间模式样式 */
:deep(.dark-mode) .welcome-header h2,
body.dark-mode .welcome-header h2 {
  color: #e5eaf3 !important;
}

:deep(.dark-mode) .welcome-text,
body.dark-mode .welcome-text {
  color: #a8abb2 !important;
}

/* 夜间模式 - el-descriptions 样式 */
body.dark-mode .info-section :deep(.el-descriptions__table) {
  background-color: #1d1e1f !important;
}

body.dark-mode .info-section :deep(.el-descriptions__label) {
  background-color: #2d2d2d !important;
  color: #a8abb2 !important;
  border-color: #2d2d2d !important;
}

body.dark-mode .info-section :deep(.el-descriptions__content) {
  background-color: #1d1e1f !important;
  color: #e5eaf3 !important;
  border-color: #2d2d2d !important;
}

body.dark-mode .info-section :deep(.el-descriptions__table .el-descriptions__cell) {
  border-color: #2d2d2d !important;
}

body.dark-mode .info-section :deep(.el-descriptions__table.is-bordered .el-descriptions__cell) {
  border-color: #2d2d2d !important;
}
</style>

