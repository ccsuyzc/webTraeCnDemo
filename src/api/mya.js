import axios from 'axios'; // 假设你有一个封装好的axios实例
import { BASE_URL } from './config';
// 根据用户ID获取所有文章（已发布、审核中、被驳回）
export function fetchUserArticlesByStatus(userId) {
  return axios({
    url: `${BASE_URL}/articles/userall/${userId}`,
    method: 'get'
  });
}