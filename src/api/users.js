import {BASE_URL} from './config';
import axios from 'axios';


// 根据用户ID获取用户收藏的文章列表
export const fetchUserCollectionArticles = async (userId) => { 

    const response = await axios.get(`${BASE_URL}/articles/collection/${userId}`);
    console.log(`API Call articles: fetchUserCollectionArticles(${userId})`, response.data.data);
    // 假设后端返回 { code: 0, data: [...] } 结构
    if (response.data.success) {
      return response.data.data || []; // 返回文章数组或空数组
    }
};

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

// 检查两个用户之间的关注状态
export const checkMutualFollow = async (userAId, userBId) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/mutual-follow`, {
      params: {
        userA: userAId,
        userB: userBId
      }
    });
    console.log(`API Call: checkMutualFollow(${userAId}, ${userBId})`, response.data);
    // 直接返回后端响应的 status 对象
    return response.data.status;
  } catch (error) {
    console.error(`Error checking mutual follow status between ${userAId} and ${userBId}:`, error);
    throw error.response?.data || error;
  }
};

// 关注用户
export const followUserApi = async (followerId, followedId) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/${followerId}/follow/${followedId}`);
    console.log(`API Call: followUserApi(${followerId}, ${followedId})`, response.data);
    return response.data; // 返回整个响应，以便处理 code 和 message
  } catch (error) {
    console.error(`Error following user ${followedId} by ${followerId}:`, error);
    throw error.response?.data || error;
  }
};

// 取消关注用户
export const unfollowUserApi = async (followerId, followedId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${followerId}/notfollow/${followedId}`);
    console.log(`API Call: unfollowUserApi(${followerId}, ${followedId})`, response.data);
    return response.data; // 返回整个响应
  } catch (error) {
    console.error(`Error unfollowing user ${followedId} by ${followerId}:`, error);
    throw error.response?.data || error;
  }
};

// 获取用户的关注列表
export const fetchFollowingList = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/usersfollowing/${userId}`);
    console.log(`API Call: fetchFollowingList(${userId})`, response.data);
    // 假设后端返回 { code: 0, data: { list: [...], total: ... } } 结构
    if (response.data) {
      return response.data; // 返回包含 list 和 total 的 data 对象
    } else {
      throw new Error(response.data.message || 'Failed to fetch following list');
    }
  } catch (error) {
    console.error(`Error fetching following list for user ${userId}:`, error);
    throw error.response?.data || error;
  }
};

// 获取两个用户之间的聊天记录
export const fetchMessages = async (userAId, userBId, page = 1, perPage = 20) => {
  try {
    const response = await axios.get(`${BASE_URL}/messages/${userAId}/${userBId}`, {
      params: {
        page: page,
        per_page: perPage
      }
    });
    console.log(`API Call: fetchMessages(${userAId}, ${userBId})`, response.data);
    // 假设后端返回 { code: 0, data: { list: [...], pagination: {...} } } 结构
    if (response.data) {
      return response.data; // 返回包含 list 和 pagination 的 data 对象
    } else {
      throw new Error(response.data.message || 'Failed to fetch messages');
    }
  } catch (error) {
    console.error(`Error fetching messages between ${userAId} and ${userBId}:`, error);
    throw error.response?.data || error;
  }
};

// 发送消息
export const sendMessageApi = async (messagePayload) => {
  try {
    // messagePayload 包含 receiver_id, receiver_name, sender_id, sender_name, content
    const response = await axios.post(`${BASE_URL}/messages/send`, messagePayload);
    console.log('API Call: sendMessageApi', messagePayload, response.data);
    return response.data; // 返回整个响应，以便处理 code 和 message
  } catch (error) {
    console.error('Error sending message:', error);
    throw error.response?.data || error;
  }
};