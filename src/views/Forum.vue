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
         <div class="select-circle">请选择圈子 ></div>
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
import { ref, reactive } from 'vue';

const activeFilter = ref('latest'); // Default filter
const newPostContent = ref('');
const expandedComments = reactive({}); // Tracks expanded comment sections { postId: boolean }
const newCommentText = reactive({}); // Tracks new comment input for each post { postId: string }

// Sample posts data (replace with actual API call)
const allPosts = {
  latest: [
    { id: 1, author: '随云632', avatar: 'https://avatars.githubusercontent.com/u/2?v=4', meta: '前端开发 · 20分钟前', content: '一面过了，HR说联系二面，几天过去了，还没动静，啥情况啊，不会是刷KPI的吧', likes: 10, comments: [{id: 101, author: '用户A', text: '可能是流程慢'}] },
    { id: 2, author: '蟹蟹蟹风流', avatar: 'https://avatars.githubusercontent.com/u/3?v=4', meta: '后端开发 · 12分钟前', content: '又发现一个宝藏工具！', likes: 5, comments: [] },
  ],
  hot: [
    { id: 3, author: '热门用户1', avatar: 'https://avatars.githubusercontent.com/u/4?v=4', meta: '产品经理 · 1小时前', content: '这个热门帖子内容示例', likes: 150, comments: [] },
  ],
  followed: [
     { id: 4, author: '关注用户A', avatar: 'https://avatars.githubusercontent.com/u/5?v=4', meta: '设计师 · 2小时前', content: '这是我关注的人发的帖子', likes: 25, comments: [] },
  ],
  'circle-feedback': [
    { id: 5, author: '反馈用户', avatar: 'https://avatars.githubusercontent.com/u/6?v=4', meta: '测试 · 5分钟前', content: '建议增加XX功能', likes: 2, comments: [] },
  ],
  // Add more posts for other filters/circles as needed
};

const posts = ref(allPosts[activeFilter.value] || []);

const selectFilter = (filter) => {
  activeFilter.value = filter;
  // Simulate fetching posts based on the filter
  posts.value = allPosts[filter] || [];
  // Reset comment states when filter changes
  Object.keys(expandedComments).forEach(key => delete expandedComments[key]);
  Object.keys(newCommentText).forEach(key => delete newCommentText[key]);
};

const publishPost = () => {
  if (!newPostContent.value.trim()) return;
  // Simulate adding a new post (add to the beginning of the 'latest' list for demo)
  const newPost = {
    id: Date.now(), // Simple unique ID
    author: '言起志', // Current user (example)
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    meta: '刚刚',
    content: newPostContent.value,
    likes: 0,
    comments: []
  };
  // Add to the general pool if needed, and update current view if it's 'latest'
  if (!allPosts['latest']) allPosts['latest'] = [];
  allPosts['latest'].unshift(newPost);
  if (activeFilter.value === 'latest') {
    posts.value = allPosts['latest'];
  }
  newPostContent.value = ''; // Clear input
};

const toggleComments = (postId) => {
  expandedComments[postId] = !expandedComments[postId];
  if (expandedComments[postId] && !newCommentText[postId]) {
      newCommentText[postId] = ''; // Initialize comment input when expanded
  }
};

const addComment = (postId) => {
  const text = newCommentText[postId]?.trim();
  if (!text) return;

  const postIndex = posts.value.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    const newComment = {
      id: Date.now(), // Simple unique ID
      author: '言起志', // Current user (example)
      text: text
    };
    posts.value[postIndex].comments.push(newComment);

    // Also update the comment in the main allPosts data if necessary
    // This part depends on how you manage the source data
    const filterKey = activeFilter.value;
    const originalPostIndex = allPosts[filterKey]?.findIndex(p => p.id === postId);
    if (originalPostIndex !== -1) {
        allPosts[filterKey][originalPostIndex].comments.push(newComment);
    }

    newCommentText[postId] = ''; // Clear input
  }
};

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