// src/api/articles.js
import axios from 'axios'; // 假设你使用 axios
import { BASE_URL } from './config'; // 引入基础 URL

// 基础 URL，根据你的后端配置修改
// const API_BASE_URL = '/api'; // 或者 http://localhost:3000/api 等

/**
 * 获取待修改的文章
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} - 待修改的文章对象
 */
export const fetchArticleToModify = async (userId) => {
  try {
    console.log(`Fetching article detail for ID: ${userId}`);
    const response = await axios.get(`${BASE_URL}/articles/${userId}`);
    // 假设后端返回的数据结构是 { code: 0, data: { ...article data... } } 或直接是文章对象
    // 需要根据实际后端返回调整
    if (response.data.data ) {
      return response.data.data; // 如果有 code 和 data 结构
    } else if (response.data) {
      return response.data; // 如果直接返回文章对象
    } else {
      throw new Error('Invalid response structure from API');
    }
  } catch (error) {
    console.error(`Error fetching article detail for ID ${id}:`, error);
    // 可以抛出错误或返回 null/特定错误对象，以便调用者处理
    throw error; // 重新抛出错误，让调用组件处理
  }
}
/**
 * 根据标签获取文章列表
 * @param {string} tag - 文章标签
 * @returns {Promise<Array>} - 文章列表
 */
export const fetchArticlesByTag = async (tag) => {
  try {
    // 模拟 API 请求
    console.log(`Fetching articles for tag: ${tag}`);
    // 实际请求
    const response = await axios.get(`${BASE_URL}/articles`, { params: { tag } });
    return response.data; // 假设后端直接返回文章数组

    // --- 模拟数据移除 ---

  } catch (error) {
    console.error('Error fetching articles:', error);
    // 可以根据需要进行更复杂的错误处理，例如返回一个空数组或抛出错误
    return [];
  }
};

// 你可以在这里添加其他文章相关的 API 函数，例如：
// export const postArticle = async (articleData) => { ... };

/**
 * 获取所有文章标签
 * @returns {Promise<Array>} - 标签列表
 */
export const fetchTags = async () => {
  try {
    // 实际请求
    const response = await axios.get(`${BASE_URL}/tags`);
    return response.data.data; // 根据用户提供的响应结构 { "data": [...] }

  } catch (error) {
    console.error('Error fetching tags:', error);
    return []; // 返回空数组或抛出错误
  }
};

/**
 * 获取所有文章分类
 * @returns {Promise<Array>} - 分类列表
 */
export const fetchCategories = async () => {
  try {
    // 实际请求
    const response = await axios.get(`${BASE_URL}/categories`);
    return response.data; // 根据用户提供的响应结构 [...] 

  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // 返回空数组或抛出错误
  }
};

/**
 * 根据 ID 获取文章详情
 * @param {string|number} id - 文章 ID
 * @returns {Promise<Object>} - 文章详情对象
 */
export const fetchArticleDetailById = async (id) => {
  try {
    console.log(`Fetching article detail for ID: ${id}`);
    const response = await axios.get(`${BASE_URL}/articles/${id}`);
    // 假设后端返回的数据结构是 { code: 0, data: { ...article data... } } 或直接是文章对象
    // 需要根据实际后端返回调整
    if (response.data.data ) {
      return response.data.data; // 如果有 code 和 data 结构
    } else if (response.data) {
      return response.data; // 如果直接返回文章对象
    } else {
      throw new Error('Invalid response structure from API');
    }
  } catch (error) {
    console.error(`Error fetching article detail for ID ${id}:`, error);
    // 可以抛出错误或返回 null/特定错误对象，以便调用者处理
    throw error; // 重新抛出错误，让调用组件处理
  }
};

export const createArticle = async (data) => {
  try {
    // 设置请求头，添加认证信息
    const token = localStorage.getItem('token');
    console.log("token", token);
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // 设置请求头，添加用户信息 
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      axios.defaults.headers.common['X-User-ID'] = userInfo.id;
    }
    const response = await axios.post(`${BASE_URL}/articles`, data);
    return response.data; // 假设后端返回 { success: true, articleId: ... } 或类似结构
  } catch (error) {
    console.error('Error creating article:', error);
    // 根据后端返回的错误信息，可以提供更具体的错误提示
    const errorMessage = error.response?.data?.error || '文章创建失败';
    throw new Error(errorMessage);
  }
}

/**
 * 获取指定用户的所有草稿
 * @param {string|number} userId - 用户 ID
 * @returns {Promise<Array>} - 草稿列表
 */
export const fetchUserDrafts = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/articles/draft/${userId}`);
    // 假设后端返回 { data: [...] } 结构
    return response.data.data || []; 
  } catch (error) {
    console.error(`Error fetching drafts for user ${userId}:`, error);
    ElMessage.error('获取草稿列表失败');
    return [];
  }
};

/**
 * 获取指定用户的特定草稿内容
 * @param {string|number} userId - 用户 ID
 * @param {string|number} draftId - 草稿 ID
 * @returns {Promise<object>} - 草稿详情
 */
// export const fetchDraftDetail = async (userId, draftId) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/articles/draft/${userId}/${draftId}`);
//     // 假设后端直接返回草稿对象
//     return response.data; 
//   } catch (error) {
//     console.error(`Error fetching draft detail for user ${userId}, draft ${draftId}:`, error);
//     ElMessage.error('获取草稿详情失败');
//     throw error; // 重新抛出错误，让调用者处理
//   }
// };

// TODO: 添加保存草稿到后端的 API 函数
// export const saveDraftToBackend = async (draftData) => { ... };

// TODO: 添加从后端删除草稿的 API 函数

/**
 * 获取指定文章的评论列表
 * @param {string|number} articleId - 文章 ID
 * @returns {Promise<Array>} - 评论列表
 */
// export const fetchArticleComments = async (articleId) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/articles/${articleId}/comments`);
//     // 假设后端返回 { data: [...] } 结构
//     return response.data.data || [];
//   } catch (error) {
//     console.error(`Error fetching comments for article ${articleId}:`, error);
//     // 可以使用 Element Plus 的 ElMessage 进行提示
//     // ElMessage.error('获取评论列表失败');
//     return []; // 返回空数组或根据需要抛出错误
//   }
// };

/**
 * 提交新评论
 * @param {object} commentData - 评论数据 { articleid, content, userid, parentid? }
 * @returns {Promise<object>} - 后端返回的响应
 */
// export const postComment = async (commentData) => {
//   try {
//     // 确保包含认证 token
//     const token = localStorage.getItem('token');
//     const headers = {};
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
//     const response = await axios.post(`${BASE_URL}/comments`, commentData, { headers });
//     return response.data; // 假设后端返回 { success: true, comment: {...} } 或类似结构
//   } catch (error) {
//     console.error('Error posting comment:', error);
//     const errorMessage = error.response?.data?.error || '评论发表失败';
//     // 可以使用 Element Plus 的 ElMessage 进行提示
//     // ElMessage.error(errorMessage);
//     throw new Error(errorMessage);
//   }
// };
// export const deleteDraftFromBackend = async (draftId) => { ... };

export const updateArticle = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/articles/${id}`, data);
    return response.data; // 假设后端返回 { success: true } 或类似结构
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
    const errorMessage = error.response?.data?.error || '文章更新失败';
    throw new Error(errorMessage);
  }
}

/**
 * 获取指定用户的所有草稿
 * @param {string|number} userId - 用户 ID
 * @returns {Promise<Array>} - 草稿列表
 */
// export const fetchUserDrafts = async (userId) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/articles/draft/${userId}`);
//     // 假设后端返回 { data: [...] } 结构
//     return response.data.data || []; 
//   } catch (error) {
//     console.error(`Error fetching drafts for user ${userId}:`, error);
//     ElMessage.error('获取草稿列表失败');
//     return [];
//   }
// };

/**
 * 获取指定用户的特定草稿内容
 * @param {string|number} userId - 用户 ID
 * @param {string|number} draftId - 草稿 ID
 * @returns {Promise<object>} - 草稿详情
 */
export const fetchDraftDetail = async (userId, draftId) => {
  try {
    const response = await axios.get(`${BASE_URL}/articles/draft/${userId}/${draftId}`);
    // 假设后端直接返回草稿对象
    return response.data.data;  
  } catch (error) {
    console.error(`Error fetching draft detail for user ${userId}, draft ${draftId}:`, error);
    ElMessage.error('获取草稿详情失败');
    throw error; // 重新抛出错误，让调用者处理
  }
};

// TODO: 添加保存草稿到后端的 API 函数
// export const saveDraftToBackend = async (draftData) => { ... };

// TODO: 添加从后端删除草稿的 API 函数

/**
 * 获取指定文章的评论列表
 * @param {string|number} articleId - 文章 ID
 * @returns {Promise<Array>} - 评论列表
 */
export const fetchArticleComments = async (articleId) => {
  try {
    const response = await axios.get(`${BASE_URL}/articles/${articleId}/comments`);
    // 假设后端返回 { data: [...] } 结构
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching comments for article ${articleId}:`, error);
    // 可以使用 Element Plus 的 ElMessage 进行提示
    // ElMessage.error('获取评论列表失败');
    return []; // 返回空数组或根据需要抛出错误
  }
};

/**
 * 提交新评论
 * @param {object} commentData - 评论数据 { articleid, content, userid, parentid? }
 * @returns {Promise<object>} - 后端返回的响应
 */
export const postComment = async (commentData) => {
  try {
    // 确保包含认证 token
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.post(`${BASE_URL}/comments`, commentData, { headers });
    return response.data; // 假设后端返回 { success: true, comment: {...} } 或类似结构
  } catch (error) {
    console.error('Error posting comment:', error);
    const errorMessage = error.response?.data?.error || '评论发表失败';
    // 可以使用 Element Plus 的 ElMessage 进行提示
    // ElMessage.error(errorMessage);
    throw new Error(errorMessage);
  }
};
// export const deleteDraftFromBackend = async (draftId) => { ... };

/**
 * 获取推荐文章
 * @param {number} count - 获取的文章数量
 * @returns {Promise<Array>} - 文章列表
 */
export const fetchRecommendedArticles = async (count) => {
  // 如果用户没有登录，返回空数组，就请求原来的接口
  if (!localStorage.getItem('userInfo')) {
    return [];
  }
  let userId = JSON.parse(localStorage.getItem('userInfo')).ID;
  try {
    // const response = await axios.get(`${BASE_URL}/articles/rarticles/${count}`);  原来的
    const response = await axios.get(`${BASE_URL}/articles/recommended_article/${userId}`);
    // console.log(response.data.data);
    return response.data.data; 
  } catch (error) {
    console.error(`Error fetching recommended articles (count: ${userId}):`, error);
    return [];
  }
};

/**
 * 根据分类 ID 获取文章列表
 * @param {string|number} categoryId - 分类 ID
 * @param {number} count - 获取的文章数量
 * @returns {Promise<Array>} - 文章列表
 */
export const fetchArticlesByCategory = async (categoryId, count) => {
  try {
    const response = await axios.get(`${BASE_URL}/articles/rarticle/${categoryId}/${count}`);
    return response.data.data; // 假设后端直接返回文章数组
  } catch (error) {
    console.error(`Error fetching articles for category ${categoryId} (count: ${count}):`, error);
    return [];
  }
};

// 新增：搜索文章
export const searchArticles = async (query) => {
  let userId = JSON.parse(localStorage.getItem('userInfo')).ID;
  if (userId) {
    try {
      const response = await axios.get(`${BASE_URL}/search/articles`, {
        params: { q: query , userid: userId}
      });
      // console.log("this is ", response.data);
      
      return response.data; // 假设后端直接返回 { local: [], external: [] }
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error; // 或者处理错误，返回一个特定的错误对象
    }
  }else{
    try {
      const response = await axios.get(`${BASE_URL}/search/articles`, {
        params: { q: query }
      });
      // console.log("this is ", response.data);
      
      return response.data; // 假设后端直接返回 { local: [], external: [] }
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error; // 或者处理错误，返回一个特定的错误对象
    }
  }
 
};

/**
 * 发送文章阅读记录
 * @param {object} historyData - 阅读记录数据 { UserID, ArticleID, Duration, Timestamp }
 * @returns {Promise<object>} - 后端返回的响应
 */
export const recordReadingHistory = async (historyData) => {
  try {
    // 确保包含认证 token，如果后端需要的话
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // 后端接口地址 /api/reading-history
    const response = await axios.post(`${BASE_URL}/reading-history`, historyData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error posting reading history:', error);
    const errorMessage = error.response?.data?.error || '发送阅读记录失败';
    // ElMessage.error(errorMessage); // 可以在组件中处理提示
    throw new Error(errorMessage);
  }
};