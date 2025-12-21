/**
 * HTTP 请求封装
 */

import { API_BASE_URL, STORAGE_KEYS } from './config.js'

/**
 * 创建请求配置
 * @param {Object} options - 请求选项
 * @returns {RequestInit}
 */
function createRequestConfig(options = {}) {
  const { method = 'GET', headers = {}, body, token } = options

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  // 添加认证令牌
  // 根据后端要求，登录返回的 data 直接作为 Authorization
  if (token) {
    defaultHeaders['Authorization'] = token
  } else {
    // 尝试从本地存储获取令牌
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (storedToken) {
      // 直接使用 token 值作为 Authorization（不带 Bearer 前缀）
      defaultHeaders['Authorization'] = storedToken
      console.log('使用保存的 token 作为 Authorization:', storedToken.substring(0, 20) + '...')
    }
    // 注意：登录接口不需要 token，所以不显示警告
  }

  const config = {
    method,
    headers: defaultHeaders
  }

  if (body && method !== 'GET' && method !== 'HEAD') {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  return config
}

/**
 * 处理响应
 * @param {Response} response - Fetch 响应对象
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type')

  if (contentType && contentType.includes('application/json')) {
    const data = await response.json()

    if (!response.ok) {
      const error = new Error(data.message || data.msg || `HTTP error! status: ${response.status}`)
      error.status = response.status
      error.data = data
      error.code = data.code
      throw error
    }

    return data
  } else {
    const text = await response.text()

    if (!response.ok) {
      const error = new Error(text || `HTTP error! status: ${response.status}`)
      error.status = response.status
      throw error
    }

    return text
  }
}

/**
 * 发送 HTTP 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
export async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const config = createRequestConfig({
      ...options,
      signal: controller.signal
    })

    const response = await fetch(fullUrl, config)
    return await handleResponse(response)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }

    // 处理 CORS 错误
    if (error.message && error.message.includes('Failed to fetch')) {
      const corsError = new Error('请求失败：可能是 CORS 跨域问题，请检查后端配置')
      corsError.name = 'CORS_ERROR'
      corsError.originalError = error
      throw corsError
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * GET 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
export function get(url, options = {}) {
  return request(url, { ...options, method: 'GET' })
}

/**
 * POST 请求
 * @param {string} url - 请求 URL
 * @param {any} data - 请求数据
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
export function post(url, data, options = {}) {
  return request(url, { ...options, method: 'POST', body: data })
}

/**
 * DELETE 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
export function del(url, options = {}) {
  return request(url, { ...options, method: 'DELETE' })
}

