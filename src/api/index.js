/**
 * API 接口封装
 */

import { get, post, put, del } from './request.js'
import { API_PATHS, STORAGE_KEYS, SYSTEM_API_BASE_URL } from './config.js'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 获取验证码
   * @returns {Promise<Object>} 返回 { captchaId, captchaImage }
   */
  async getCaptcha() {
    return await get(API_PATHS.AUTH.CAPTCHA)
  },

  /**
   * 用户登录
   * @param {Object} params - 登录参数
   * @param {string} params.username - 用户名
   * @param {string} params.password - RSA加密后的密码
   * @param {string} params.captchaId - 验证码ID
   * @param {string} params.captchaCode - 验证码
   * @returns {Promise<Object>}
   */
  async login(params) {
    const response = await post(API_PATHS.AUTH.LOGIN, params)

    console.log('登录响应:', response)

    // 保存令牌
    // 登录返回的 data 直接作为 token 使用
    let token = null
    if (response.data) {
      // 如果 data 是字符串，直接作为 token
      if (typeof response.data === 'string') {
        token = response.data
      } else if (response.data.token) {
        token = response.data.token
      } else if (response.data.accessToken) {
        token = response.data.accessToken
      }
    } else if (response.token) {
      token = response.token
    } else if (response.accessToken) {
      token = response.accessToken
    }

    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      console.log('保存 token 到 localStorage:', token.substring(0, 20) + '...')
    } else {
      console.warn('登录响应中未找到 token')
    }

    // 保存刷新令牌
    if (response.data?.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken)
    } else if (response.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
    }

    // 保存用户信息
    let userInfo = null
    if (response.data?.user) {
      userInfo = response.data.user
    } else if (response.data && typeof response.data === 'object' && !response.data.token && !response.data.accessToken) {
      // 如果 data 是对象且不是 token，可能是用户信息
      userInfo = response.data
    } else if (response.user) {
      userInfo = response.user
    } else {
      // 如果没有用户信息，至少保存用户名
      userInfo = {
        username: params.username
      }
    }

    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    }

    return response
  },

  /**
   * 用户登出
   * @returns {Promise<Object>}
   */
  async logout() {
    const response = await del(API_PATHS.AUTH.LOGOUT)

    // 清除本地存储的认证信息
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)

    return response
  },

  /**
   * 刷新 Token
   * @returns {Promise<Object>}
   */
  async refreshToken() {
    const response = await post(API_PATHS.AUTH.REFRESH)

    if (response.data) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data)
    } else if (response.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    }

    return response
  }
}

/**
 * 部门相关 API
 */
export const deptApi = {
  /**
   * 查询所有部门列表
   * @returns {Promise<Object>}
   */
  async getAllList() {
    return await get(API_PATHS.DEPT.LIST, { baseUrl: SYSTEM_API_BASE_URL })
  },

  /**
   * 查询部门树
   * @returns {Promise<Object>}
   */
  async getTree() {
    return await get(API_PATHS.DEPT.TREE, { baseUrl: SYSTEM_API_BASE_URL })
  },

  /**
   * 分页查询部门
   * @param {Object} params - 查询参数
   * @param {Object} params.condition - 查询条件
   * @param {string} params.condition.deptName - 部门名称（可选）
   * @param {string} params.condition.status - 状态（可选）
   * @param {Object} params.pagination - 分页信息
   * @param {number} params.pagination.pageNum - 页码
   * @param {number} params.pagination.pageSize - 每页大小
   * @param {Array} params.pagination.sorts - 排序字段列表（可选）
   * @returns {Promise<Object>}
   */
  async getPage(params) {
    return await post(API_PATHS.DEPT.PAGE, params, { baseUrl: SYSTEM_API_BASE_URL })
  },

  /**
   * 根据 ID 查询部门
   * @param {string} id - 部门 ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    return await get(API_PATHS.DEPT.GET(id), { baseUrl: SYSTEM_API_BASE_URL })
  },

  /**
   * 新增部门
   * @param {Object} data - 部门数据
   * @param {string} data.deptName - 部门名称
   * @param {string} data.parentId - 父节点 ID
   * @param {number} data.sortOrder - 排序
   * @param {string} data.status - 部门状态 (NORMAL/LOCKED)
   * @returns {Promise<Object>}
   */
  async create(data) {
    return await post(API_PATHS.DEPT.CREATE, data, { baseUrl: SYSTEM_API_BASE_URL })
  },

  /**
   * 修改部门
   * @param {string} id - 部门 ID
   * @param {Object} data - 部门数据
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    return await put(API_PATHS.DEPT.UPDATE(id), data, { baseUrl: SYSTEM_API_BASE_URL })
  },

  /**
   * 删除部门
   * @param {string[]} ids - 部门 ID 数组
   * @returns {Promise<Object>}
   */
  async delete(ids) {
    return await del(API_PATHS.DEPT.DELETE, ids, { baseUrl: SYSTEM_API_BASE_URL })
  },

  /**
   * 更新部门状态
   * @param {string} status - 状态 (NORMAL/LOCKED)
   * @param {string[]} ids - 部门 ID 数组
   * @returns {Promise<Object>}
   */
  async updateStatus(status, ids) {
    return await put(API_PATHS.DEPT.UPDATE_STATUS(status), ids, { baseUrl: SYSTEM_API_BASE_URL })
  }
}

export default {
  auth: authApi,
  dept: deptApi
}

