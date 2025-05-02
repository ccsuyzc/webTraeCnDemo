import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'; // 导入 path 模块

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 配置 @ 别名
    },
  },
  plugins: [vue()],
})
