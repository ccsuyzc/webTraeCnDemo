<template>
  <div class="forum-container">
    <div class="left-sidebar">
      <div class="filter-options">
        <div class="filter-item" :class="{ active: activeFilter === 'latest' }" @click="selectFilter('latest')">最新</div>
        <div class="filter-item" :class="{ active: activeFilter === 'hot' }" @click="selectFilter('hot')">热门</div>
        <div class="filter-item" :class="{ active: activeFilter === 'followed' }" @click="selectFilter('followed')">关注</div>
      </div>
      <div class="my-circles">
        <div class="sidebar-title">我的圈子</div>
        <div class="circle-item" :class="{ active: activeFilter === 'circle-feedback' }" @click="selectFilter('circle-feedback')">反馈 & 建议</div>
        <div class="circle-item" :class="{ active: activeFilter === 'circle-backend' }" @click="selectFilter('circle-backend')">服务端与架构</div>
        <div class="circle-item" :class="{ active: activeFilter === 'circle-camp' }" @click="selectFilter('circle-camp')">青训营-快乐出发</div>
      </div>
      <div class="recommended-circles">
        <div class="sidebar-title">推荐圈子</div>
        <div class="circle-item" :class="{ active: activeFilter === 'circle-aicoding' }" @click="selectFilter('circle-aicoding')">AICoding交流</div>
        <div class="circle-item" :class="{ active: activeFilter === 'circle-llm' }" @click="selectFilter('circle-llm')">大模型生态圈</div>
      </div>
    </div>
    <div class="main-content">
      <div class="post-editor">
        <textarea v-model="newPostContent" placeholder="快和掘友一起分享新鲜事！告诉你个小秘密，发布沸点时添加圈子和话题会被更多掘友看到哦~"></textarea>
        <div class="editor-actions">
          <div class="actions-left">
            <span>表情</span>
            <span>图片</span>
            <span>链接</span>
            <span>话题</span>
            <span>代码</span>
          </div>
          <div class="actions-right">
             <span class="char-count">{{ newPostContent.length }}/1000</span>
            <button class="publish-btn" @click="publishPost">发布</button>
          </div>
        </div>
         <div class="select-circle">请选择圈子 </div>
      </div>
      <div class="post-feed">
        <!-- Use v-for to loop through posts -->
        <div class="post-item" v-for="post in posts" :key="post.id">
          <div class="post-header">
            <img :src="post.avatar" alt="avatar" class="post-avatar">
            <div class="post-author-info">
              <span class="author-name">{{ post.author }}</span>
              <span class="post-meta">{{ post.meta }}</span>
            </div>
          </div>
          <div class="post-content">
            {{ post.content }}
          </div>
          <div class="post-actions">
            <span>分享</span>
            <span @click="toggleComments(post.id)">评论 {{ post.comments.length }}</span>
            <span>点赞 {{ post.likes }}</span>
          </div>
          <!-- Comment Section -->
          <div v-if="expandedComments[post.id]" class="comment-section">
            <div class="existing-comments">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <span class="comment-author">{{ comment.author }}:</span>
                <span class="comment-text">{{ comment.text }}</span>
              </div>
              <div v-if="post.comments.length === 0" class="no-comments">暂无评论</div>
            </div>
            <div class="comment-editor">
              <textarea v-model="newCommentText[post.id]" placeholder="发表你的评论..."></textarea>
              <button @click="addComment(post.id)">发布评论</button>
            </div>
          </div>
        </div>
        <!-- Static posts removed, replaced by v-for -->
      </div>
    </div>
    <div class="right-sidebar">
      <!-- Right sidebar content remains the same -->
      <div class="user-profile-card">
         <img src="https://avatars.githubusercontent.com/u/1?v=4" alt="avatar" class="profile-avatar">
         <div class="profile-name">言起志</div>
         <div class="profile-title">全栈CV工程师 @言起志科...</div>
         <div class="profile-stats">
            <div><span>57</span><span>沸点</span></div>
            <div><span>3</span><span>圈子</span></div>
            <div><span>60</span><span>关注</span></div>
            <div><span>64</span><span>关注者</span></div>
         </div>
      </div>
      <div class="featured-posts">
        <div class="sidebar-title">精选沸点</div>
        <div class="featured-item">兄弟们，你们所在公司的福利都有哪些，发出来让我这个土狗开开... <br> <span class="featured-meta">2赞 · 168评论</span></div>
        <div class="featured-item">家人们想问一下这种恋爱关系是不是正常的... <br> <span class="featured-meta">2赞 · 158评论</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const activeFilter = ref('latest'); // 默认筛选
const newPostContent = ref('');
const expandedComments = reactive({}); // 跟踪展开的评论区 { postId: boolean }
const newCommentText = reactive({}); // 跟踪每个帖子的评论输入 { postId: string }

// 圈子相关数据
const circles = ref([]); // 圈子列表
const selectedCircleId = ref(null); // 当前选择的圈子ID
const posts = ref([]); // 当前显示的帖子列表
const loadingPosts = ref(false);
const loadingCircles = ref(false);

// 获取所有圈子
const fetchCircles = async () => {
  loadingCircles.value = true;
  try {
    const res = await fetch('/groups');
    const data = await res.json();
    if (Array.isArray(data.groups)) {
      circles.value = data.groups;
      if (!selectedCircleId.value && data.groups.length > 0) {
        selectedCircleId.value = data.groups[0].ID || data.groups[0].id;
      }
    }
  } catch (e) {
    // 错误处理
  } finally {
    loadingCircles.value = false;
  }
};

// 获取圈子帖子列表
const fetchGroupPosts = async (groupId) => {
  if (!groupId) return;
  loadingPosts.value = true;
  try {
    const res = await fetch(`/groups/${groupId}/posts`);
    const data = await res.json();
    posts.value = Array.isArray(data.posts) ? data.posts : [];
  } catch (e) {
    posts.value = [];
  } finally {
    loadingPosts.value = false;
  }
};

// 获取最新10条帖子
const fetchLatestPosts = async () => {
  loadingPosts.value = true;
  try {
    const res = await fetch('/posts/latest');
    const data = await res.json();
    posts.value = Array.isArray(data.posts) ? data.posts : [];
  } catch (e) {
    posts.value = [];
  } finally {
    loadingPosts.value = false;
  }
};

// 切换筛选
const selectFilter = (filter) => {
  activeFilter.value = filter;
  Object.keys(expandedComments).forEach(key => delete expandedComments[key]);
  Object.keys(newCommentText).forEach(key => delete newCommentText[key]);
  if (filter === 'latest') {
    fetchLatestPosts();
  } else if (filter.startsWith('circle-')) {
    // 选择圈子
    const circleName = filter.replace('circle-', '');
    const circle = circles.value.find(c => c.Name === circleName || c.name === circleName);
    if (circle) {
      selectedCircleId.value = circle.ID || circle.id;
      fetchGroupPosts(selectedCircleId.value);
    }
  } else {
    posts.value = [];
  }
};

// 选择圈子（用于发帖）
const handleSelectCircle = (circleId) => {
  selectedCircleId.value = circleId;
  fetchGroupPosts(circleId);
};

// 发布帖子
const publishPost = async () => {
  if (!newPostContent.value.trim() || !selectedCircleId.value) return;
  try {
    const res = await fetch(`/groups/${selectedCircleId.value}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPostContent.value, images: [] })
    });
    const data = await res.json();
    if (data.post) {
      posts.value.unshift(data.post);
      newPostContent.value = '';
    }
  } catch (e) {}
};

// 展开/收起评论
const toggleComments = (postId) => {
  expandedComments[postId] = !expandedComments[postId];
  if (expandedComments[postId] && !newCommentText[postId]) {
    newCommentText[postId] = '';
  }
};

// 添加评论
const addComment = async (postId) => {
  const text = newCommentText[postId]?.trim();
  if (!text) return;
  try {
    const res = await fetch(`/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.comment) {
      const post = posts.value.find(p => p.ID === postId || p.id === postId);
      if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push(data.comment);
      }
      newCommentText[postId] = '';
    }
  } catch (e) {}
};

// 点赞帖子
const likePost = async (postId) => {
  try {
    const res = await fetch(`/posts/${postId}/like`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      const post = posts.value.find(p => p.ID === postId || p.id === postId);
      if (post) post.likes = (post.likes || 0) + 1;
    }
  } catch (e) {}
};

onMounted(() => {
  fetchCircles();
  fetchLatestPosts();
});
</script>

<style scoped>
.forum-container {
  display: flex;
  padding-top: 80px; /* Adjust based on TopNavBar height */
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
  background-color: #f4f5f5;
}

.left-sidebar, .right-sidebar {
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
   align-self: flex-start; /* Align to top */
}

.left-sidebar {
  width: 200px;
}

.right-sidebar {
  width: 280px;
}

.main-content {
  flex-grow: 1;
  min-width: 0; /* Prevent overflow */
}

.filter-options .filter-item,
.my-circles .circle-item,
.recommended-circles .circle-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 14px;
}

.filter-options .filter-item:hover,
.my-circles .circle-item:hover,
.recommended-circles .circle-item:hover {
  background-color: #f7f8fa;
}

.filter-item.active,
.circle-item.active {
  background-color: #eaf2ff;
  color: #1e80ff;
  font-weight: 500;
}

.comment-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.existing-comments {
  margin-bottom: 15px;
}

.comment-item {
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.comment-author {
  font-weight: 500;
  color: #515767;
  margin-right: 5px;
}

.comment-text {
  color: #8a919f;
}

.no-comments {
    font-size: 13px;
    color: #aaa;
}

.comment-editor textarea {
  width: 100%;
  min-height: 50px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  font-size: 13px;
  resize: vertical;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.comment-editor button {
  background-color: #1e80ff;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  float: right;
}

.comment-editor button:hover {
  background-color: #0056b3;
}

/* Ensure other styles are preserved */
.forum-container {
  display: flex;
  padding-top: 80px; /* Adjust based on TopNavBar height */
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
  background-color: #f4f5f5;
}

.left-sidebar, .right-sidebar {
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
   align-self: flex-start; /* Align to top */
}

.left-sidebar {
  width: 200px;
}

.right-sidebar {
  width: 280px;
}

.main-content {
  flex-grow: 1;
  min-width: 0; /* Prevent overflow */
}

.filter-options .filter-item,
.my-circles .circle-item,
.recommended-circles .circle-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 14px;
}

.filter-options .filter-item:hover,
.my-circles .circle-item:hover,
.recommended-circles .circle-item:hover {
  background-color: #f7f8fa;
}

/* Active class style moved above */

.sidebar-title {
  font-size: 14px;
  color: #8a919f;
  padding: 10px 12px;
  margin-top: 10px;
}

.my-circles, .recommended-circles {
    margin-top: 15px;
}

/* Post Editor Styles */
.post-editor {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.post-editor textarea {
  width: 100%;
  min-height: 80px;
  border: none;
  resize: none;
  outline: none;
  font-size: 14px;
  margin-bottom: 10px;
  padding: 10px;
  box-sizing: border-box;
  background-color: #f7f8fa;
  border-radius: 4px;
}

.editor-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.actions-left span {
  margin-right: 15px;
  cursor: pointer;
  color: #8a919f;
  font-size: 14px;
}

.actions-right {
    display: flex;
    align-items: center;
}

.char-count {
    font-size: 12px;
    color: #c2c8d1;
    margin-right: 10px;
}

.publish-btn {
  background-color: #1e80ff;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.publish-btn:hover {
  background-color: #0056b3;
}

.select-circle {
    color: #1e80ff;
    background-color: #eaf2ff;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    cursor: pointer;
    display: inline-block;
    margin-top: -45px; /* Adjust position */
    margin-left: 10px;
}

/* Post Feed Styles */
.post-feed .post-item {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.post-author-info .author-name {
  font-weight: 500;
  font-size: 15px;
  color: #252933;
}

.post-author-info .post-meta {
  font-size: 13px;
  color: #8a919f;
  display: block;
}

.post-content {
  font-size: 14px;
  color: #515767;
  line-height: 1.6;
  margin-bottom: 15px;
}

.post-actions {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #8a919f;
}

.post-actions span {
  cursor: pointer;
}

.post-actions span:hover {
  color: #1e80ff;
}

/* Right Sidebar Styles */
.user-profile-card, .featured-posts {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.user-profile-card {
    text-align: center;
}

.profile-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 10px;
}

.profile-name {
    font-size: 16px;
    font-weight: 500;
    color: #252933;
    margin-bottom: 4px;
}

.profile-title {
    font-size: 12px;
    color: #8a919f;
    margin-bottom: 15px;
}

.profile-stats {
    display: flex;
    justify-content: space-around;
    text-align: center;
    font-size: 14px;
    color: #8a919f;
}

.profile-stats div span:first-child {
    display: block;
    font-weight: 500;
    color: #252933;
    font-size: 16px;
}

.featured-posts .featured-item {
  font-size: 14px;
  color: #515767;
  margin-bottom: 10px;
  line-height: 1.5;
}

.featured-meta {
    font-size: 12px;
    color: #8a919f;
    margin-top: 4px;
    display: inline-block;
}

</style>