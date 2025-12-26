import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 代理认证相关接口
      "/oneself-auth": {
        target: "http://127.0.0.1:9100",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      // 代理系统管理接口（部门等）
      "/oneself-system": {
        target: "http://127.0.0.1:9100",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});
