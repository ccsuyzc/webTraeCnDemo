// 圈子相关API统一管理

// 获取所有圈子
export async function fetchCirclesApi() {
  const res = await fetch('/groups');
  return res.json();
}

// 获取圈子帖子列表
export async function fetchGroupPostsApi(groupId) {
  if (!groupId) return { posts: [] };
  const res = await fetch(`/groups/${groupId}/posts`);
  return res.json();
}

// 获取最新10条帖子
export async function fetchLatestPostsApi() {
  const res = await fetch('/posts/latest');
  return res.json();
}

// 发布帖子
export async function publishPostApi(groupId, content, images = []) {
  if (!content.trim() || !groupId) return { post: null };
  const res = await fetch(`/groups/${groupId}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, images })
  });
  return res.json();
}

// 添加评论
export async function addCommentApi(postId, text) {
  if (!text?.trim()) return { comment: null };
  const res = await fetch(`/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
}

// 点赞帖子
export async function likePostApi(postId) {
  const res = await fetch(`/posts/${postId}/like`, { method: 'POST' });
  return res.json();
}