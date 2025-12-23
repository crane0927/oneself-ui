/**
 * RSA 加密工具
 * 使用 jsencrypt 库进行 RSA 加密
 */

import JSEncrypt from "jsencrypt";

/**
 * RSA 公钥 / 私钥（Base64 编码）
 * 从环境变量或配置中获取
 */
const RSA_PUBLIC_KEY_BASE64 =
  import.meta.env.ONESELF_UI_PUBLIC_KEY ||
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxVWA1jOYBcaSaBCQNzdMvLIU93I/p+J0iTbePVp9Ff9Cb+W4dn81GcGMy5AxfoHaqR1xnEdTg32xkmGDdGcY0LyfaWMtoryTweddKGH//cXBC8Ig5mxbUaqyA8czLzy96zwyvST1xY+LYLDt2Sez4jeJsQjMLc6S/gpy/FMKIm4vB0zW50kfJhspkZB3/V+6rVk6cJJ18XvEHY+5ALXQaxddahFdI60Yxcyk/Q7BbhGX7y4xJlsER+x5zaoMfyN4X5AuDEa+G9vcql3AUxB78G93jN0c8wfsDsIfUnUDQcY3SkhYLmZRkNjTq4bD4lBLYfI/opz6oTPyyeXo2NuAywIDAQAB";

// 私钥通常只在前端本地调试或特殊场景才会配置，生产环境应只在服务端持有
const RSA_PRIVATE_KEY_BASE64 =
  import.meta.env.ONESELF_UI_RSA_PRIVATE_KEY ||
  "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFVYDWM5gFxpJoEJA3N0y8shT3cj+n4nSJNt49Wn0V/0Jv5bh2fzUZwYzLkDF+gdqpHXGcR1ODfbGSYYN0ZxjQvJ9pYy2ivJPB510oYf/9xcELwiDmbFtRqrIDxzMvPL3rPDK9JPXFj4tgsO3ZJ7PiN4mxCMwtzpL+CnL8Uwoibi8HTNbnSR8mGymRkHf9X7qtWTpwknXxe8Qdj7kAtdBrF11qEV0jrRjFzKT9DsFuEZfvLjEmWwRH7HnNqgx/I3hfkC4MRr4b29yqXcBTEHvwb3eM3RzzB+wOwh9SdQNBxjdKSFguZlGQ2NOrhsPiUEth8j+inPqhM/LJ5ejY24DLAgMBAAECggEABBHE0+YBexECwOmih7j4uKV1gDrXbDdjztaWU66TiMoYTSVwHeV2q17N7/67vo+f+j/UsXPZGYuUh1/CbbqYjOlu4iX88W+xHl0Ok0AeHtYeqobo1cejRHZgMGrBt/YpNnop07O468ePiMFtTj6e24noqYF0cHdjmaCOiXyO53HT9oxmrom4FK5IxOZKVaFvtkF0VRh4oagM7cioTX0jLq3tpRzaMGYak+NxDnVfbJ3JZheGOqiYpXv2NRh9XiK7zBBeOA/1OU4tVR3l+6l2r6WKTUazf0x+vxFnRroBcyBMrRaaep0g52p4SO6z+TT/lD4RgOuN09d7ViukN0aa+QKBgQDUfXDheXN2jlrM8LAUVasBxlEXAOyRSu3MRyl7d06om55QYebAkdD8pvplLYZBSaecgmTwDZhNc/OTbyHRfebLUV3ZKkiMjsfzJYEBwXvDRuoZ+jgik+DgrgHKGSmI8TjAAtlAsvxYIs6+O/sc44H2fCD4lpv5ogqWa3zsg+J3yQKBgQDtvZir2erBnXWlPGDdp/BTDaRMPxllVjTUis4Gk9UUtruR/xMpQrjJoTuTpceZbogYztM7kaSiKoQubrCtrKRlTc9ms40+2vKknAW8GESgNMu+lxhgkDapuGyLX4EMzi9cr9h9ofC+IhswKY6za1k3Zb4BP4PYexPsNCx83lXl8wKBgH8Cn+dWFgsGWgXn1AfDkRzVcoDif4T1GaCh5Iy1KqIjqoR3kFsIjbeHA2JYzMfXg8VMN5M5PREGvtAgfEFhFQPwlb0JxiWl7qRKhYsMILL/f0yZwNYCOEd0GwO2+JmvPfGfgkZm9eiknZkd9yI0ZulzFq4gMAkNr3BrvVcOGd7pAoGAU7AwNB6L8wgYx8fPWXeqs7HTqjt0FyYXhtIt4Ebd9WK1+JjQB/BC2Ed3j2wGLU6pfgIgfZGxYJyS1z2D2D8zx61yWvbNu9ibHbMGmcX5MmQjbL4HiMZ7V5diLlW6OeXC6l/EV8VP175tz7BxWVtqloOsNQhEw0ngI3/iQTqLBl0CgYEAsNBEtS9Y4nC+HNFPR6mg7NvDp8velVnuVf0ztLxTxgaEI/Eti9B32k6VE23eQBcx9BMzN/LoBv+ANGsUn7uIsuOsj5TbNGWr0RR9BnS1HqO/WuWwdrtRG5hsHscwvOesNIoYaBptiTSlTPc9FcpPEbmg1Le53tYZ12+5XlGOgxQ= ";

/**
 * 将 Base64 编码的公钥转换为 PEM 格式
 * @param {string} base64Key - Base64 编码的公钥
 * @returns {string} PEM 格式的公钥
 */
function base64ToPEM(base64Key) {
  // 将 Base64 字符串每 64 个字符换行
  const chunks = [];
  for (let i = 0; i < base64Key.length; i += 64) {
    chunks.push(base64Key.slice(i, i + 64));
  }
  const keyBody = chunks.join("\n");
  return `-----BEGIN PUBLIC KEY-----\n${keyBody}\n-----END PUBLIC KEY-----`;
}

/**
 * 将 Base64 编码的私钥转换为 PEM 格式
 * @param {string} base64Key - Base64 编码的私钥
 * @returns {string} PEM 格式的私钥
 */
function base64PrivateKeyToPEM(base64Key) {
  const chunks = [];
  for (let i = 0; i < base64Key.length; i += 64) {
    chunks.push(base64Key.slice(i, i + 64));
  }
  const keyBody = chunks.join("\n");
  return `-----BEGIN PRIVATE KEY-----\n${keyBody}\n-----END PRIVATE KEY-----`;
}

/**
 * RSA 加密密码
 * @param {string} password - 原始密码
 * @param {string} publicKeyBase64 - RSA 公钥（Base64 编码，可选）
 * @returns {string} 加密后的密码（Base64 编码）
 */
export function encryptPassword(password, publicKeyBase64 = null) {
  try {
    const keyBase64 = publicKeyBase64 || RSA_PUBLIC_KEY_BASE64;
    const publicKeyPEM = base64ToPEM(keyBase64);

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKeyPEM);

    const encrypted = encrypt.encrypt(password);

    if (!encrypted) {
      throw new Error("密码加密失败，请检查公钥是否正确");
    }

    return encrypted;
  } catch (error) {
    console.error("RSA 加密失败:", error);
    throw new Error("密码加密失败: " + (error.message || "未知错误"));
  }
}

/**
 * RSA 解密密码（使用私钥）
 * @param {string} encryptedPassword - 加密后的密码（Base64 编码）
 * @param {string} privateKeyBase64 - RSA 私钥（Base64 编码，可选）
 * @returns {string} 解密后的原始密码
 */
export function decryptPassword(encryptedPassword, privateKeyBase64 = null) {
  try {
    const keyBase64 = privateKeyBase64 || RSA_PRIVATE_KEY_BASE64;

    if (!keyBase64) {
      throw new Error("未配置 RSA 私钥，无法解密");
    }

    const privateKeyPEM = base64PrivateKeyToPEM(keyBase64);

    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKeyPEM);

    const decrypted = decrypt.decrypt(encryptedPassword);

    if (decrypted === false || decrypted === null) {
      throw new Error("密码解密失败，请检查私钥是否正确");
    }

    return decrypted;
  } catch (error) {
    console.error("RSA 解密失败:", error);
    throw new Error("密码解密失败: " + (error.message || "未知错误"));
  }
}

/**
 * 获取默认的 RSA 公钥
 * @returns {string} Base64 编码的公钥
 */
export function getDefaultPublicKey() {
  return RSA_PUBLIC_KEY_BASE64;
}

/**
 * 获取默认的 RSA 私钥（仅用于本地调试或特殊场景）
 * 生产环境请勿在前端保留私钥
 * @returns {string} Base64 编码的私钥
 */
export function getDefaultPrivateKey() {
  return RSA_PRIVATE_KEY_BASE64;
}
