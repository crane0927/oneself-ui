/**
 * RSA 加密工具
 * 使用 jsencrypt 库进行 RSA 加密
 */

import JSEncrypt from 'jsencrypt'

/**
 * RSA 公钥（Base64 编码）
 * 从环境变量或配置中获取
 */
const RSA_PUBLIC_KEY_BASE64 = import.meta.env.VITE_RSA_PUBLIC_KEY ||
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAorKjP6Y+usx1Xvkfaz4NLUWDSVi5QCnYGQzD9ppPrc5BhNp5M7XTsjRJla1deQFqpsWBoHwuWMo4XcwfGwV2JxxFCAHf7ZkT6/FGl/nao/Emg4PjayDms6KLVi7QMLtmiufngs4OrlQ93wxY8dXOuvcm0AHeMPfknTvEZQ2r9QkNn9Co7SWNzo8MftJW3mYumfN+eLpn7sH21qWF8tFQl4SEI9ljhIcJ5jiHbFGay6s+zg2ceeTdRinhfKw5pC1uhPR+oJI9MSeS504t6Ly+nJtxMQ+AyUWOxOIcmSXW1O8TV7pbMIuSkdUVJkoJZBdRQXCNgcjBSTlhJnwwndHsBQIDAQAB'

/**
 * 将 Base64 编码的公钥转换为 PEM 格式
 * @param {string} base64Key - Base64 编码的公钥
 * @returns {string} PEM 格式的公钥
 */
function base64ToPEM(base64Key) {
  // 将 Base64 字符串每 64 个字符换行
  const chunks = []
  for (let i = 0; i < base64Key.length; i += 64) {
    chunks.push(base64Key.slice(i, i + 64))
  }
  const keyBody = chunks.join('\n')
  return `-----BEGIN PUBLIC KEY-----\n${keyBody}\n-----END PUBLIC KEY-----`
}

/**
 * RSA 加密密码
 * @param {string} password - 原始密码
 * @param {string} publicKeyBase64 - RSA 公钥（Base64 编码，可选）
 * @returns {string} 加密后的密码（Base64 编码）
 */
export function encryptPassword(password, publicKeyBase64 = null) {
  try {
    const keyBase64 = publicKeyBase64 || RSA_PUBLIC_KEY_BASE64
    const publicKeyPEM = base64ToPEM(keyBase64)

    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKeyPEM)

    const encrypted = encrypt.encrypt(password)

    if (!encrypted) {
      throw new Error('密码加密失败，请检查公钥是否正确')
    }

    return encrypted
  } catch (error) {
    console.error('RSA 加密失败:', error)
    throw new Error('密码加密失败: ' + (error.message || '未知错误'))
  }
}

/**
 * 获取默认的 RSA 公钥
 * @returns {string} Base64 编码的公钥
 */
export function getDefaultPublicKey() {
  return RSA_PUBLIC_KEY_BASE64
}

