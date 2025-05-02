import {BASE_URL} from './config';
import axios from 'axios';

// 根据用户ID获取用户详细信息
export const fetchUserDetails = async (userId) => {
  
    const response = await axios.get(`${BASE_URL}/users/${userId}`);
    console.log(`API Call userInfo: fetchUserDetails(${userId})`, response.data.data);
    return response.data.data; // 假设后端直接返回用户信息对象
  
};

// 根据用户ID获取用户发布的文章列表
export const fetchUserArticles = async (userId) => {
 
    const response = await axios.get(`${BASE_URL}/articles/published/${userId}`);
    console.log(`API Call articles: fetchUserArticles(${userId})`, response.data.data);
    // 假设后端返回 { code: 0, data: [...] } 结构
    if (response.data) {
      return response.data.data || []; // 返回文章数组或空数组
    } else {
      throw new Error(response.data.message || 'Failed to fetch user articles');
    }
 
};

// 更新用户详细信息
export const updateUserDetails = async (userId, userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${userId}`, userData);
    console.log(`更新之后的：(${userId})`, response.data);
    // 假设后端返回 { code: 0, message: 'success', data: ... } 或类似结构
    if (response.data) {
      return response.data.data; // 返回更新后的用户信息或其他成功标识
    } else {
      throw new Error(response.data.message || 'Failed to update user details');
    }
  } catch (error) {
    console.error(`Error updating user details for user ${userId}:`, error);
    // 抛出错误，以便调用方可以处理
    throw error.response?.data || error; 
  }
};