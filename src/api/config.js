/**
 * API 配置文件
 */

// API 基础地址（根据实际环境配置）
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.104:8081/oneself-auth'

// API 路径配置
export const API_PATHS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    CAPTCHA: '/auth/captcha',
    REFRESH: '/auth/refresh'
  }
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info'
}

