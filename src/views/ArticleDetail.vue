<template>
  <div class="article-detail-layout">
    <!-- 左侧操作栏 -->
    <div class="left-bar">
      <el-card class="action-card">
        <!-- Add v-if condition here -->
        <el-button v-if="article.authorId === currentUserId" type="primary"  class="action-btn edit-btn" @click="editArticle">编辑</el-button>
        <el-button  class="action-btn">收藏</el-button>
        <el-button class="action-btn le">分享</el-button>
        <el-button  class="action-btn le">举报</el-button>
      </el-card>
    </div>
    <!-- 中间文章内容 -->
    <div class="main-content">
      <el-card class="article-card">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span>作者：{{ article.author }}</span>
          <span class="meta-divider">|</span>
          <span>{{ article.date }}</span>
          <span class="meta-divider">|</span>
          <span>阅读 {{ article.views }}</span>
        </div>
        <div class="article-body" v-html="article.content"></div>
      </el-card>

      <!-- 评论区 -->
      <el-card class="comment-section">
        <h3 class="comment-title">评论区</h3>
        <!-- 评论输入 -->
        <div class="comment-input-area">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="请输入评论内容..."
          />
          <el-button type="primary" @click="submitComment" class="submit-comment-btn">发表评论</el-button>
        </div>
        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-if="comments.length === 0" class="no-comments">暂无评论</div>
          <!-- Modify comment item structure -->
          <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <el-avatar :size="32" :src="comment.authorAvatar" class="comment-avatar"/>
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-date">{{ comment.date }}</span>
              <!-- Add Reply Button -->
              <el-button type="text" size="small" @click="startReply(comment)" class="reply-btn">回复</el-button>

            </div>
            <!-- Modify comment content display -->
            <div class="comment-content">
              <span v-if="comment.parentusername" class="reply-to">@{{ comment.parentusername }}</span>
              {{ comment.content }}
            </div>
            <!-- Reply Input Area -->
            <div v-if="replyingTo === comment.id" class="reply-input-area">
              <el-input
                v-model="replyContent"
                type="textarea"
                :rows="2"
                :placeholder="`回复 @${replyingToUsername}:`"
                class="reply-input"
              />
              <div class="reply-actions">
                <!-- Change submitReply(comment) to submitComment -->
                <el-button type="primary" size="small" @click="submitComment" class="submit-reply-btn">提交回复</el-button>
                <el-button size="small" @click="cancelReply" class="cancel-reply-btn">取消</el-button>
              </div>
            </div>
            <!-- TODO: Add logic to display nested replies if needed -->
          </div>
        </div>
      </el-card>
    </div>
    <!-- 右侧作者信息、目录、相关推荐 -->
    <div class="right-bar">
      <el-card class="author-card">
        <div class="author-avatar" @click="goToUserProfile">
          <el-avatar :size="56" :src="article.authorAvatar" />
        </div>
        <div class="author-name" @click="goToUserProfile">{{ article.author }}</div>
        <div class="author-desc">{{ article.authorDesc }}</div>
        <el-button size="small" type="primary" class="follow-btn">关注</el-button>
      </el-card>
      <!-- <el-card class="toc-card">
        <div class="toc-title">目录</div>
        <ul class="toc-list">
          <li v-for="item in toc" :key="item.id">{{ item.title }}</li>
        </ul>
      </el-card> -->
      <el-card class="recommend-card">
        <div class="recommend-title">相关推荐</div>
        <ul class="recommend-list">
          <li v-for="rec in recommends" :key="rec.id">{{ rec.title }}</li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' // Import useRouter
// 导入 Element Plus 组件 (如果需要显式导入)
// import { ElInput, ElButton, ElCard, ElAvatar, ElMessage } from 'element-plus'
import { fetchArticleDetailById, fetchArticleComments, postComment } from '../api/articles'; // 导入 API 函数
import { useAuthStore } from '../store/authStore'; // 导入 Auth Store

const route = useRoute()
const router = useRouter() // Initialize router
const authStore = useAuthStore(); // Initialize auth store

// Assume currentUserId is available (e.g., from a store or auth context)
// For demonstration, let's hardcode it. Replace with actual user ID logic.
// const currentUserId = ref(1); // Example: Logged-in user ID is 1
// const currentUserAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'); // Example avatar
// const currentUsername = ref('当前用户'); // Example username

// 从 authStore 获取用户信息
const currentUserId = ref(authStore.user.ID || null);
const currentUserAvatar = ref(authStore.user.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'); // 使用 store 中的头像或默认
const currentUsername = ref(authStore.user.Username || '访客'); // 使用 store 中的用户名或默认

const article = ref({ // Initialize with authorId
  id: null,   //文章id 
  title: '',  //文章标题
  author: '', //作者
  authorId: null, // 作者id
  date: '',   //文章日期
  views: 0,   //文章浏览数
  content: '', //文章内容
  authorAvatar: '', //作者头像
  authorDesc: '', //作者描述
  tags: [],   //文章标签
  comments: [], //评论列表
  likes: 0,    //文章点赞数
});
const toc = ref([]); // 初始化为空
const recommends = ref([]); // 初始化为空
const isLoading = ref(true); // 添加加载状态
const error = ref(null); // 添加错误状态

// 评论相关状态
const comments = ref([]); // 评论列表
const newComment = ref(''); // 新评论内容
const replyingTo = ref(null); // ID of the comment being replied to
const replyingToUsername = ref(''); // Username of the author being replied to
const replyContent = ref(''); // Content of the reply
const replyingToUserId = ref(null); // ID of the user being replied to

// Function to initiate replying to a comment
const startReply = (comment) => {
  replyingTo.value = comment.id;
  replyingToUsername.value = comment.author;
  replyingToUserId.value = comment.userid; // Store the user ID
  replyContent.value = ''; // Clear reply input when starting a new reply
};

// Function to cancel the reply
const cancelReply = () => {
  replyingTo.value = null;
  replyingToUsername.value = '';
  replyingToUserId.value = null; // Reset the user ID
  replyContent.value = '';
};

// 模拟获取评论数据的函数
const fetchComments = async (articleId) => {
  console.log(`Fetching comments for article ${articleId}...`);
  try {
    const fetchedComments = await fetchArticleComments(articleId);
    // 格式化评论数据以匹配模板期望的结构
    comments.value = fetchedComments.map(comment => ({
      id: comment.ID, // 假设 API 返回 ID
      author: comment.UserName, // 假设 API 返回 UserName
      userid: comment.UserID, // 假设 API 返回 UserID
      authorAvatar: comment.AvatarURL || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 假设 API 返回 UserAvatar 或使用默认
      date: dayjs(comment.CommentTime).format('YYYY-MM-DD HH:mm'), // 假设 API 返回 CreatedAt
      content: comment.Content, // 假设 API 返回 Content
      // Add parent info if available from API
      parentid: comment.ParentID || null, // Assuming API returns ParentID
      parentusername: comment.ParentUserName || null // Assuming API returns ParentUserName
    }));
    console.log('Comments fetched:', comments.value);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    // ElMessage.error('加载评论失败'); // 可以添加 Element Plus 提示
  }
};

// 提交评论的处理函数 - 调用 API (Modified to handle replies)
const submitComment = async () => {
  const contentToSubmit = replyingTo.value ? replyContent.value : newComment.value;
  if (!contentToSubmit.trim()) {
    console.warn('Comment/Reply content cannot be empty');
    // ElMessage.warning('内容不能为空');
    return;
  }
  if (!currentUserId.value) {
    console.error('User not logged in');
    // ElMessage.error('请先登录再评论');
    return;
  }

  console.log('Submitting comment/reply:', contentToSubmit);
  const commentData = {
    articleid: parseInt(article.value.id),
    content: contentToSubmit,
    userid: currentUserId.value,
    username: currentUsername.value,
    parentid: replyingTo.value, // Add parentid if it's a reply
    parentusername: replyingTo.value ? replyingToUsername.value : null, // Add parentusername if it's a reply
    parentuserid: replyingToUserId.value // Add parentuserid if it's a reply
  };

  try {
    const response = await postComment(commentData);
    console.log('Comment/Reply submitted response:', response);
    // ElMessage.success('发表成功');

    if (replyingTo.value) {
      cancelReply(); // Reset reply state after successful submission
    } else {
      newComment.value = ''; // Clear main comment input
    }

    // 重新获取评论列表以显示最新评论/回复
    await fetchComments(article.value.id);
  } catch (error) {
    console.error('Failed to submit comment/reply:', error);
    // ElMessage.error(error.message || '发表失败');
  }
};

// Renamed the original submitComment to submitTopLevelComment if needed,
// but modifying the existing one is cleaner if the API handles both.
// If you need separate logic, create a new submitReply function.

// Example separate submitReply function (alternative approach):
const submitReply = async (parentComment) => {
  if (!replyContent.value.trim()) {
    console.warn('Reply content cannot be empty');
    return;
  }
   if (!currentUserId.value) {
    console.error('User not logged in');
    return;
  }

  console.log(`Submitting reply to comment ${parentComment.id}:`, replyContent.value);
  const replyData = {
    articleid: parseInt(article.value.id),
    content: replyContent.value,
    userid: currentUserId.value,
    username: currentUsername.value,
    parentid: parentComment.id,
    parentusername: parentComment.author,
    parentuserid: parentComment.userid
  };

  try {
    await postComment(replyData);
    console.log('Reply submitted successfully');
    cancelReply(); // Reset reply state
    await fetchComments(article.value.id); // Refresh comments
  } catch (error) {
    console.error('Failed to submit reply:', error);
    // Handle error display
  }
};


onMounted(async () => {
  const articleId = route.params.id; // 从路由获取 ID
  if (articleId) {
    try {
      isLoading.value = true;
      error.value = null;
      // 获取文章详情
      const fetchedArticle = await fetchArticleDetailById(articleId);
      console.log('Fetched article:', fetchedArticle);
      
      // Assume fetchedArticle now includes authorId and the article id
      article.value.id = articleId; // Store article ID
      article.value.content = fetchedArticle.data.Content;
      article.value.title = fetchedArticle.data.Title;
      article.value.author = fetchedArticle.data.UserName;
      article.value.authorId = fetchedArticle.data.UserID;
      article.value.date = dayjs(fetchedArticle.data.CreatedAt).format('YYYY-MM-DD HH:mm:ss');
      article.value.views = fetchedArticle.data.ViewCount;
      article.value.authorAvatar = fetchedArticle.data.AvatarURL;
      article.value.authorDesc = fetchedArticle.data.UserDesc;
      article.value.tags = fetchedArticle.data.Tags;
      // article.value.comments = fetchedArticle.data.Comments;
      article.value.likes = fetchedArticle.data.LikeCount
      // 获取评论
      await fetchComments(articleId);

      // 实际应用中，目录和推荐列表也可能需要根据文章 ID 获取
      // 这里暂时保留静态数据或根据 fetchedArticle 调整
      toc.value = [
        { id: 1, title: '前言' },
        { id: 2, title: '什么是BSON?' },
        { id: 3, title: 'BSON的具体结构' },
        { id: 4, title: '在Go语言中的使用' },
        { id: 5, title: '总结' },
      ];
      recommends.value = [
        { id: 1, title: 'Go高效之Gin框架和Mongodb数据库实践' },
        { id: 2, title: '关于Go和MongoDB的简单例子' },
        { id: 3, title: '如何在Go中使用MongoDB（详细指南）' },
      ];
    } catch (err) {
      console.error('Failed to fetch article or comments:', err);
      error.value = '加载文章或评论失败，请稍后再试。';
    } finally {
      isLoading.value = false;
    }
  } else {
    error.value = '未找到文章 ID。';
    isLoading.value = false;
  }
});

// Function to handle edit button click
function editArticle() {
  if (article.value.id) {
    router.push(`/editor/${article.value.id}`); // Navigate to editor route with article ID
  }
}

// Function to navigate to user profile
function goToUserProfile() {
  if (article.value.authorId) {
    router.push(`/user/${article.value.authorId}`);
  } else {
    console.warn('Author ID not available for navigation.');
    // Optionally show a message to the user
    // ElMessage.warning('无法跳转到作者主页');
  }
}

</script>

<style scoped>
.article-detail-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  max-width: 1200px;
  margin: 48px auto 0;
  padding: 0 16px;
}
.left-bar {
  width: 120px;
  flex-shrink: 0;
}
.action-card {
  display: flex;
  flex-direction: column;
  gap: 12px;  /*Adjusted gap */
  align-items: stretch;
  padding: 16px 8px;
  border-radius: 12px;
}
.action-btn {
  width: 80%;
  margin-bottom: 10px; /* Remove margin-bottom if using gap */
  padding: 8px 10px; /* Adjust padding */
  font-size: 14px; /* Adjust font size */
  border-radius: 6px; /* Add border-radius */
}

/* Specific style for the edit button */
.edit-btn {
  background-color: #1e80ff; /* Match write button color */
  color: #fff;
  border: none;
}

.edit-btn:hover {
  background-color: #0056b3; /* Darker shade on hover */
}
.main-content {
  flex: 1 1 0;
  min-width: 0;
  display: flex; /* Use flexbox for main content */
  flex-direction: column; /* Stack items vertically */
  gap: 24px; /* Add gap between article card and comment section */
}
.article-card {
  border-radius: 12px;
  padding: 32px 32px 24px 32px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
}
.article-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
}
.article-meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 24px;
}
.meta-divider {
  margin: 0 8px;
}
.article-body {
  color: #222;
  font-size: 16px;
  line-height: 1.8;
}
.right-bar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.author-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 16px 16px; /* Adjusted padding */
  border-radius: 12px;
  margin-bottom: 0;
}
.author-avatar {
  margin-bottom: 12px;
}
.author-avatar,
.author-name {
  cursor: pointer; /* Add pointer cursor to indicate clickability */
}
.author-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}
.author-desc {
  color: #888;
  font-size: 14px;
  margin-bottom: 12px;
}
.follow-btn {
  margin-top: 8px;
}
.toc-card, .recommend-card {
  border-radius: 12px;
  padding: 16px 12px;
}
.toc-title, .recommend-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}
.toc-list, .recommend-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-list li, .recommend-list li {
  color: #1e80ff;
  font-size: 14px;
  margin-bottom: 6px;
  cursor: pointer;
}
.toc-list li:hover, .recommend-list li:hover {
  text-decoration: underline;
}

.le{
  margin-left: 0px;
}

/* Comment Section Styles */
.comment-section {
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
}

.comment-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.comment-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.submit-comment-btn {
  align-self: flex-end; /* Align button to the right */
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.no-comments {
  color: #888;
  text-align: center;
  padding: 20px 0;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  position: relative; /* Needed for absolute positioning of reply button if desired */
}

.reply-btn {
  margin-left: auto; /* Push reply button to the right */
  padding: 0 4px; /* Adjust padding */
  color: #1e80ff;
}

.reply-input-area {
  margin-top: 10px;
  margin-left: 40px; /* Indent reply area like comment content */
  padding: 10px;
  background-color: #f9f9f9; /* Slight background to differentiate */
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-input {
  /* Style for the reply textarea */
}

.reply-actions {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    gap: 8px;
}

.submit-reply-btn,
.cancel-reply-btn {
  /* Specific styles for reply buttons if needed */
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  padding-left: 40px; /* Indent content relative to avatar */
}

/* Style for the reply-to span */
.reply-to {
  color: #1e80ff; /* Make the @mention stand out */
  font-weight: 500;
  margin-right: 4px;
}

/* Optional: Style for nested replies (requires data structure change) */
.nested-reply {
  margin-left: 40px; /* Further indent replies */
  border-left: 2px solid #eee; /* Add a visual indicator */
  padding-left: 10px;
}
</style>