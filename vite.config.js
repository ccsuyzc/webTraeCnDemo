import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 保留路径别名功能

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [vue()], // 移除未安装的 vite-plugin-static-copy 插件
  build: {
    // 移除与插件相关的特殊配置
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})