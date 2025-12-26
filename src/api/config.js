/**
 * API 配置文件
 */

// 判断是否为开发环境
const isDev = import.meta.env.DEV;

// Gateway 网关地址
const GATEWAY_URL = "http://127.0.0.1:9100";

// API 基础地址（根据实际环境配置）
// 所有请求通过网关 127.0.0.1:9100
// 开发环境使用相对路径（通过 Vite 代理到网关），生产环境使用完整网关 URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isDev ? "/oneself-auth" : `${GATEWAY_URL}/oneself-auth`);

// 系统 API 基础地址（部门等系统管理接口）
// 所有请求通过网关 127.0.0.1:9100
export const SYSTEM_API_BASE_URL =
  import.meta.env.VITE_SYSTEM_API_BASE_URL ||
  (isDev ? "/oneself-system" : `${GATEWAY_URL}/oneself-system`);

// API 路径配置
export const API_PATHS = {
  // 认证相关
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    CAPTCHA: "/auth/captcha",
    REFRESH: "/auth/refresh",
  },
  // 部门相关
  DEPT: {
    LIST: "/dept/list/all",
    TREE: "/dept/tree",
    PAGE: "/dept/page",
    GET: (id) => `/dept/${id}`,
    CREATE: "/dept",
    UPDATE: (id) => `/dept/${id}`,
    DELETE: "/dept",
    UPDATE_STATUS: (status) => `/dept/status/${status}`,
  },
  // 参数配置相关
  CONFIGURATION: {
    PAGE: "/configuration/page",
    GET: (id) => `/configuration/${id}`,
    CREATE: "/configuration",
    UPDATE: (id) => `/configuration/${id}`,
    DELETE: "/configuration",
  },
  // 用户相关
  USER: {
    PAGE: "/user/page",
    GET: (id) => `/user/${id}`,
    CREATE: "/user",
    UPDATE: (id) => `/user/${id}`,
    DELETE: "/user",
    UPDATE_STATUS: (status) => `/user/status/${status}`,
    LIST_BY_DEPT: (deptId) => `/user/list/by/dept/${deptId}`,
  },
  // 角色相关
  ROLE: {
    LIST: "/role/list/all",
    PAGE: "/role/page",
    GET: (id) => `/role/${id}`,
    CREATE: "/role",
    UPDATE: (id) => `/role/${id}`,
    DELETE: "/role",
    UPDATE_STATUS: (status) => `/role/status/${status}`,
  },
};

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_INFO: "user_info",
};
