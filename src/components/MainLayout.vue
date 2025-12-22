<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo-container">
        <h1 v-if="!isCollapse" class="logo-text">Oneself</h1>
        <h1 v-else class="logo-text-mini">O</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/dept">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>部门管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? Expand : Fold"
            circle
            @click="toggleCollapse"
            class="collapse-btn"
          />
        </div>
        <div class="header-right">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ userInfo?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <span class="username">{{ userInfo?.username || '用户' }}</span>
            <el-button
              type="danger"
              plain
              @click="handleLogout"
              :icon="SwitchButton"
              circle
              class="logout-btn"
            />
          </div>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <slot />
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  OfficeBuilding,
  SwitchButton,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { authApi } from '../api/index.js'
import { STORAGE_KEYS } from '../api/config.js'

const router = useRouter()
const route = useRoute()

const isCollapse = ref(false)
const userInfo = ref(null)

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 切换侧边栏折叠
function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

// 菜单选择处理
function handleMenuSelect(key) {
  router.push(key)
}

// 获取用户信息
function loadUserInfo() {
  const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO)
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr)
    } catch (e) {
      userInfo.value = {
        username: userInfoStr
      }
    }
  } else {
    userInfo.value = {
      username: '用户'
    }
  }
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    try {
      await authApi.logout()
      ElMessage.success('退出成功')
    } catch (error) {
      console.error('退出登录失败:', error)
      if (error.name === 'CORS_ERROR' || error.message?.includes('Failed to fetch')) {
        console.warn('网络错误，执行本地退出')
      }
    }

    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    router.push('/login')
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('退出登录失败:', error)
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4a;
  border-bottom: 1px solid #1f2d3d;
}

.logo-text {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.logo-text-mini {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
  background-color: #304156;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
  height: 56px;
  line-height: 56px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #263445;
  color: #409eff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: #fff;
}

.sidebar-menu :deep(.el-icon) {
  margin-right: 8px;
  font-size: 18px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.logout-btn {
  margin-left: 8px;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 20px;
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar,
.content-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb,
.content-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover,
.content-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>

