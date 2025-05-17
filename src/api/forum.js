// 圈子相关API统一管理
import axios from 'axios'; // 假设你使用 axios
import { BASE_URL } from './config'; // 引入基础 URL

// 获取推荐的圈子
export async function getNewGroups() {
  let userid = JSON.parse(localStorage.getItem('user')).ID
  const res = await axios.get(`${BASE_URL}/groups/r/${userid}`);
  return res.data;
}

// batchLike 批量点赞
export async function batchLike(body) {
  userid = JSON.parse(localStorage.getItem('user')).ID
  const res = await axios.post(`${BASE_URL}/posts/batch-like/${userid}`, body);
  return res.data;
}

// 删除帖子
export async function deletePost(postId) {
  const res = await axios.delete(`${BASE_URL}/posts/${postId}`);
  return res.data;
}

// 获取所有圈子
export async function fetchCirclesApi() {
  const res = await axios(`${BASE_URL}/groups`);
  return res.data;
}

// 新增：获取用户已加入圈子
export async function fetchUserJoinedGroupsApi(userId) {
  if (!userId) return { groups: [] };
  const res = await axios(`${BASE_URL}/joinedgroups/${userId}/joined-groups`);
  return res.data;
}

// 获取圈子帖子列表
export async function fetchGroupPostsApi(groupId) {
  let userid = JSON.parse(localStorage.getItem('user')).ID
  if (!groupId) return { posts: [] };
  const res = await axios(`${BASE_URL}/groups/${groupId}/posts/${userid}`);
  return res.data;
}

// 获取最新10条帖子
export async function fetchLatestPostsApi() {
  const res = await axios(`${BASE_URL}/posts/latest`);
  return res.data;
}

// 发布帖子
export async function publishPostApi(groupId, content, images = []) {
  if (!content.trim() || !groupId) return { post: null };
  let userid = JSON.parse(localStorage.getItem('user')).ID
  const res = await axios(`${BASE_URL}/groups/${groupId}/posts`, {
    method: 'POST',
    data: { content, images ,userid }
  });
  return res.data;
}

// 添加评论
export async function addCommentApi(postId, text,parent_id) {
  if (!text?.trim()) return { comment: null };
  // const res = await axios(`${BASE_URL}/posts/${postId}/comments`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ text })
  // });
  let body = {
    "content": text,
    "user_id": JSON.parse(localStorage.getItem('user')).ID,
    "parent_id":parent_id || null
  }
  const res = await axios.post(`${BASE_URL}/posts/${postId}/comments`, body);
  return res.data;
}

// 点赞帖子
export async function likePostApi(postId, body) {
  const res = await axios.post(`${BASE_URL}/posts/${postId}/like`, body);
  return res.data;
}

// 取消点赞帖子
export async function unlikePostApi(postId, body) {
  const res = await axios.post(`${BASE_URL}/posts/${postId}/unlike`, body);
  return res.data;
}