/**
 * API 接口封装
 */

import { get, post, del } from './request.js'
import { API_PATHS, STORAGE_KEYS } from './config.js'

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

export default {
  auth: authApi
}

