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

export const loginWithEmail = (email, code) => {
  return apiClient.post('/loginW', { email, code });
};

export const sendVerificationCode = (email) => {
  return apiClient.post('/auth/sendcode', { email });  
};

// 可以添加其他认证相关的 API 函数，例如注册、登出等

export const sendEmailVerificationCode = (email) => {
  return apiClient.post('/auth/sendcode', { email });
};

export const verifyEmailRegistration = (email, code) => {
  return apiClient.post('/auth/verifyregister', { email, code });
};