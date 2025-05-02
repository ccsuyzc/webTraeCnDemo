// src/api/auth.js
import axios from 'axios';
import { BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginWithAccount = (username, password) => {
  return apiClient.post('/login', { username, password });
};

// 可以添加其他认证相关的 API 函数，例如注册、登出等