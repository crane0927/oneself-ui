<template>
  <el-container
    class="main-layout"
    :class="{
      'top-menu-layout': menuPosition === 'top',
      'dark-mode': isDarkMode,
    }"
  >
    <!-- 左侧菜单布局 -->
    <template v-if="menuPosition === 'left'">
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
          <el-sub-menu index="system">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/dept">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>部门管理</template>
            </el-menu-item>
            <el-menu-item index="/user">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/role">
              <el-icon><Avatar /></el-icon>
              <template #title>角色管理</template>
            </el-menu-item>
            <el-menu-item index="/configuration">
              <el-icon><Setting /></el-icon>
              <template #title>参数配置</template>
            </el-menu-item>
          </el-sub-menu>
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
              <el-button
                :icon="Menu"
                circle
                @click="toggleMenuPosition"
                class="menu-position-btn"
                title="切换到顶部菜单"
              />
              <el-button
                :icon="isDarkMode ? Sunny : Moon"
                circle
                @click="toggleTheme"
                class="theme-toggle-btn"
                :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'"
              />
              <el-avatar :size="32" class="user-avatar">
                {{ userInfo?.username?.charAt(0)?.toUpperCase() || "U" }}
              </el-avatar>
              <span class="username">{{ userInfo?.username || "用户" }}</span>
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
    </template>

    <!-- 顶部菜单布局 -->
    <template v-else>
      <el-container class="top-menu-container">
        <!-- 顶部 Logo 和菜单栏 -->
        <el-header class="top-header">
          <div class="top-header-left">
            <div class="top-logo">
              <h1 class="top-logo-text">Oneself</h1>
            </div>
            <el-menu
              :default-active="activeMenu"
              class="top-menu"
              mode="horizontal"
              router
              @select="handleMenuSelect"
            >
              <el-menu-item index="/">
                <el-icon><HomeFilled /></el-icon>
                <span>首页</span>
              </el-menu-item>
              <el-sub-menu index="system">
                <template #title>
                  <el-icon><Tools /></el-icon>
                  <span>系统管理</span>
                </template>
                <el-menu-item index="/dept">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>部门管理</span>
                </el-menu-item>
                <el-menu-item index="/user">
                  <el-icon><User /></el-icon>
                  <span>用户管理</span>
                </el-menu-item>
                <el-menu-item index="/role">
                  <el-icon><Avatar /></el-icon>
                  <span>角色管理</span>
                </el-menu-item>
                <el-menu-item index="/configuration">
                  <el-icon><Setting /></el-icon>
                  <span>参数配置</span>
                </el-menu-item>
              </el-sub-menu>
            </el-menu>
          </div>
          <div class="top-header-right">
            <div class="user-info">
              <el-button
                :icon="Menu"
                circle
                @click="toggleMenuPosition"
                class="menu-position-btn"
                title="切换到左侧菜单"
              />
              <el-button
                :icon="isDarkMode ? Sunny : Moon"
                circle
                @click="toggleTheme"
                class="theme-toggle-btn"
                :title="isDarkMode ? '切换到日间模式' : '切换到夜间模式'"
              />
              <el-avatar :size="32" class="user-avatar">
                {{ userInfo?.username?.charAt(0)?.toUpperCase() || "U" }}
              </el-avatar>
              <span class="username">{{ userInfo?.username || "用户" }}</span>
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
        <div class="top-content-wrapper">
          <slot />
        </div>
      </el-container>
    </template>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  HomeFilled,
  OfficeBuilding,
  Setting,
  User,
  Avatar,
  SwitchButton,
  Fold,
  Expand,
  Tools,
  Menu,
  Sunny,
  Moon,
} from "@element-plus/icons-vue";
import { authApi } from "../api/index.js";
import { STORAGE_KEYS } from "../api/config.js";

const router = useRouter();
const route = useRoute();

const isCollapse = ref(false);
const userInfo = ref(null);
const menuPosition = ref("left"); // 'left' 或 'top'
const isDarkMode = ref(false); // 主题模式：false=日间，true=夜间

// 从 localStorage 加载菜单位置偏好
const MENU_POSITION_KEY = "menu_position";
const THEME_KEY = "theme_mode";

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 切换侧边栏折叠
function toggleCollapse() {
  isCollapse.value = !isCollapse.value;
}

// 切换菜单位置
function toggleMenuPosition() {
  menuPosition.value = menuPosition.value === "left" ? "top" : "left";
  localStorage.setItem(MENU_POSITION_KEY, menuPosition.value);
}

// 切换主题模式
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem(THEME_KEY, isDarkMode.value ? "dark" : "light");
  // 应用到 body 元素，方便全局样式控制
  if (isDarkMode.value) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// 菜单选择处理
function handleMenuSelect(key) {
  router.push(key);
}

// 获取用户信息
function loadUserInfo() {
  const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr);
    } catch (e) {
      userInfo.value = {
        username: userInfoStr,
      };
    }
  } else {
    userInfo.value = {
      username: "用户",
    };
  }
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm("确定要退出登录吗？", "退出确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    try {
      await authApi.logout();
      ElMessage.success("退出成功");
    } catch (error) {
      console.error("退出登录失败:", error);
      if (
        error.name === "CORS_ERROR" ||
        error.message?.includes("Failed to fetch")
      ) {
        console.warn("网络错误，执行本地退出");
      }
    }

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    router.push("/login");
  } catch (error) {
    if (error === "cancel") {
      return;
    }
    console.error("退出登录失败:", error);
  }
}

onMounted(() => {
  loadUserInfo();
  // 加载菜单位置偏好
  const savedPosition = localStorage.getItem(MENU_POSITION_KEY);
  if (savedPosition === "top" || savedPosition === "left") {
    menuPosition.value = savedPosition;
  }
  // 加载主题偏好
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    isDarkMode.value = true;
    document.body.classList.add("dark-mode");
  } else {
    isDarkMode.value = false;
    document.body.classList.remove("dark-mode");
  }
});
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: #ffffff;
  transition: width 0.3s;
  overflow: hidden;
  border-right: 1px solid #e4e7ed;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
}

.logo-text {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.logo-text-mini {
  color: #303133;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
  background: #ffffff;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #606266;
  height: 56px;
  line-height: 56px;
  background-color: transparent;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 600;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  color: #606266;
  height: 56px;
  line-height: 56px;
  background-color: transparent;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

.sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #409eff;
}

/* 子菜单容器背景 */
.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background: #ffffff;
}

/* 子菜单项样式 */
.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  background-color: transparent;
  color: #606266;
  padding-left: 50px !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 600;
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

.user-info > * {
  margin: 0 !important;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.menu-position-btn {
  margin: 0 !important;
}

.logout-btn {
  margin: 0 !important;
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

/* 顶部菜单布局样式 */
.top-menu-layout {
  flex-direction: column;
}

.top-menu-container {
  height: 100vh;
  flex-direction: column;
}

.top-header {
  height: 60px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  border-bottom: 1px solid #e4e7ed;
}

.top-header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.top-logo {
  margin-right: 40px;
  display: flex;
  align-items: center;
}

.top-logo-text {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.top-menu {
  flex: 1;
  background: transparent;
  border-bottom: none;
}

.top-menu :deep(.el-menu-item) {
  color: #606266;
  border-bottom: 2px solid transparent;
  height: 60px;
  line-height: 60px;
}

.top-menu :deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

.top-menu :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 600;
  border-bottom: 3px solid #409eff;
  border-bottom-color: #409eff;
}

.top-menu :deep(.el-sub-menu__title) {
  color: #606266;
  border-bottom: 2px solid transparent;
  height: 60px;
  line-height: 60px;
}

.top-menu :deep(.el-sub-menu__title:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

.top-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #409eff;
  background-color: #f5f7fa;
  font-weight: 600;
}

.top-menu :deep(.el-sub-menu .el-menu) {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.top-menu :deep(.el-sub-menu .el-menu-item) {
  background-color: transparent;
  color: #606266;
  height: 48px;
  line-height: 48px;
}

.top-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

.top-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 600;
}

.top-menu :deep(.el-icon) {
  margin-right: 6px;
  font-size: 16px;
}

.top-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-header-right .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-header-right .user-info > * {
  margin: 0 !important;
}

.top-header-right .username {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.top-content-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 20px;
}

.top-content-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.top-content-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.top-content-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.theme-toggle-btn {
  margin: 0 !important;
}

/* 夜间模式样式 */
.dark-mode .sidebar {
  background: #1d1e1f;
  border-right-color: #2d2d2d;
}

.dark-mode .logo-container {
  background: #1d1e1f;
  border-bottom-color: #2d2d2d;
}

.dark-mode .logo-text,
.dark-mode .logo-text-mini {
  color: #e5eaf3;
}

.dark-mode .sidebar-menu {
  background: #1d1e1f;
}

.dark-mode .sidebar-menu :deep(.el-menu-item) {
  color: #a8abb2;
}

.dark-mode .sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .sidebar-menu :deep(.el-sub-menu__title) {
  color: #a8abb2;
}

.dark-mode .sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #409eff;
}

.dark-mode .sidebar-menu :deep(.el-sub-menu .el-menu) {
  background: #1d1e1f;
}

.dark-mode .sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  color: #a8abb2;
}

.dark-mode .sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .header {
  background-color: #1d1e1f;
  border-bottom-color: #2d2d2d;
}

.dark-mode .username {
  color: #e5eaf3;
}

.dark-mode .top-header {
  background: #1d1e1f;
  border-bottom-color: #2d2d2d;
}

.dark-mode .top-logo-text {
  color: #e5eaf3;
}

.dark-mode .top-menu :deep(.el-menu-item) {
  color: #a8abb2;
}

.dark-mode .top-menu :deep(.el-menu-item:hover) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .top-menu :deep(.el-menu-item.is-active) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .top-menu :deep(.el-sub-menu__title) {
  color: #a8abb2;
}

.dark-mode .top-menu :deep(.el-sub-menu__title:hover) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .top-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #409eff;
  background-color: #2d2d2d;
}

.dark-mode .top-menu :deep(.el-sub-menu .el-menu) {
  background: #1d1e1f;
  border-color: #2d2d2d;
}

.dark-mode .top-menu :deep(.el-sub-menu .el-menu-item) {
  color: #a8abb2;
}

.dark-mode .top-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .top-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #2d2d2d;
  color: #409eff;
}

.dark-mode .top-header-right .username {
  color: #e5eaf3;
}

.dark-mode .content-wrapper,
.dark-mode .top-content-wrapper {
  background-color: #141414;
}

/* 夜间模式 - 按钮样式 */
.dark-mode .header .el-button,
.dark-mode .top-header .el-button {
  background-color: #2d2d2d;
  border-color: #2d2d2d;
  color: #e5eaf3;
}

.dark-mode .header .el-button:hover,
.dark-mode .top-header .el-button:hover {
  background-color: #3d3d3d;
  border-color: #3d3d3d;
  color: #409eff;
}

.dark-mode .header .el-button.is-circle,
.dark-mode .top-header .el-button.is-circle {
  background-color: #2d2d2d;
  border-color: #2d2d2d;
  color: #e5eaf3;
}

.dark-mode .header .el-button.is-circle:hover,
.dark-mode .top-header .el-button.is-circle:hover {
  background-color: #3d3d3d;
  border-color: #3d3d3d;
  color: #409eff;
}

/* 夜间模式 - 危险按钮（退出按钮） */
.dark-mode .header .el-button--danger.is-plain,
.dark-mode .top-header .el-button--danger.is-plain {
  background-color: transparent;
  border-color: #f56c6c;
  color: #f56c6c;
}

.dark-mode .header .el-button--danger.is-plain:hover,
.dark-mode .top-header .el-button--danger.is-plain:hover {
  background-color: rgba(245, 108, 108, 0.1);
  border-color: #f56c6c;
  color: #f56c6c;
}

/* 夜间模式 - 主题切换按钮特殊样式 */
.dark-mode .theme-toggle-btn {
  background-color: #2d2d2d;
  border-color: #2d2d2d;
  color: #fdb813;
}

.dark-mode .theme-toggle-btn:hover {
  background-color: #3d3d3d;
  border-color: #3d3d3d;
  color: #ffd700;
}
</style>
