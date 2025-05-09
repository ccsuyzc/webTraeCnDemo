// src/api/config.js
export const BASE_URL = 'http://localhost:8080/api';

// AI 服务配置
export const AI_SERVICE_CONFIG = {
  // 可选值: 'deepseek', 'custom_backend'
  type: 'deepseek', // 默认使用 deepseek
  deepseek: {
    apiKey: 'sk-340a96bc42f74a98b33b4bfe49953387', // 请替换为你的 DeepSeek API Key
    apiUrl: 'https://api.deepseek.com/chat/completions'
  },
  custom_backend: {
    apiUrl: `${BASE_URL}/ai/chat`, // 假设自定义后端的 API 地址
    modelsUrl: `${BASE_URL}/ai/models` // 新增：获取模型列表的 API 地址
  }
};