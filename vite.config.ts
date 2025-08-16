import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      // 当有 /api 前缀的请求时，会自动代理到 target 地址
      '/api': {
        target: 'http://localhost:8080', // Spring Boot 后端服务地址
        changeOrigin: true, // 允许跨域
      }
    }
  }
})