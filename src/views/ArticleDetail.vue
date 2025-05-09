<template>
  <div class="article-detail-layout">
    <!-- 左侧操作栏 -->
    <div class="left-bar">
      <el-card class="action-card">
        <!-- Add v-if condition here -->
        <el-button v-if="currentUserId && article.authorId === currentUserId" type="primary" class="action-btn edit-btn" @click="editArticle">编辑</el-button>
        <el-button class="action-btn" @click="Collection" >收藏</el-button>
        <!-- Share Button with Dropdown -->
        <el-dropdown @command="handleShareCommand" class="action-btn le share-dropdown">
          <el-button class="action-btn share-btn-inner">
            分享<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="copyLink">复制链接</el-dropdown-item>
              <el-dropdown-item command="generateQRCode">生成二维码</el-dropdown-item>
              <!-- <el-dropdown-item command="downloadQRCodeBackend">后端生成二维码</el-dropdown-item> -->
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button class="action-btn le">举报</el-button>
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
        <div ref="articleBodyRef" class="article-body" v-html="article.content"></div>
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
              <el-button  size="small" @click="startReply(comment)" class="reply-btn">回复</el-button>

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

    <!-- QR Code Dialog -->
    <el-dialog v-model="qrCodeDialogVisible" title="分享文章二维码" width="300px" center>
      <div ref="qrCodeContainer" style="text-align: center; padding: 20px;">
        <qrcode-vue :value="qrCodeValue" :size="200" level="H" />
        <p style="margin-top: 10px; font-size: 14px; color: #666;">扫码分享给朋友</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="qrCodeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="downloadQRCode">下载二维码</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- AI Explanation Button -->
    <el-button
      v-if="aiButtonVisible"
      :style="aiButtonStyle"
      type="primary"
      size="small"
      class="ai-explain-button"
      @click="showAiChat"
    >
      AI 解释
    </el-button>

    <!-- AI Chat Dialog -->
    <el-dialog
      v-model="aiChatDialogVisible"
      title="AI 智能解释"
      width="500px"
      draggable
      :close-on-click-modal="false"
      @closed="resetAiChat"
      class="ai-chat-dialog"
    >
      <div class="ai-chat-content">
        <el-scrollbar ref="aiChatScrollbarRef" height="300px">
          <div ref="aiChatMessagesRef">
            <div v-for="(msg, idx) in aiChatMessages" :key="idx" :class="['chat-msg', msg.role]">
              <el-avatar :size="30" class="avatar" :class="msg.role">
                {{ msg.role === 'user' ? '我' : 'AI' }}
              </el-avatar>
              <div class="msg-bubble">
                <v-md-preview :text="msg.text"></v-md-preview>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <el-input
        v-model="aiChatInput"
        placeholder="继续提问..."
        @keyup.enter="sendAiQuery"
        class="ai-chat-input"
        clearable
        size="small"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 3 }"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="aiChatDialogVisible = false" size="small">关闭</el-button>
          <el-button type="primary" @click="sendAiQuery" size="small" :disabled="!aiChatInput.trim() && aiChatMessages.length <= 1">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </div>

  <!-- QR Code Dialog -->
  <!-- <el-dialog v-model="qrCodeDialogVisible" title="分享文章二维码" width="300px" center>
    <div ref="qrCodeContainer" style="text-align: center; padding: 20px;">
      <qrcode-vue :value="qrCodeValue" :size="200" level="H" />
      <p style="margin-top: 10px; font-size: 14px; color: #666;">扫码分享给朋友</p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="qrCodeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="downloadQRCode">下载二维码</el-button>
      </span>
    </template>
  </el-dialog> -->

</template>

<script setup>
import dayjs from 'dayjs';
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'; // Add computed, nextTick, onBeforeUnmount
import { useRoute, useRouter } from 'vue-router'; // Import useRouter
// 导入 Element Plus 组件
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElDialog, ElMessage, ElIcon, ElButton, ElInput, ElScrollbar, ElAvatar } from 'element-plus'; // Import necessary components
import { ArrowDown } from '@element-plus/icons-vue'; // Import icon
import QrcodeVue from 'qrcode.vue'; // Import QR Code component
import html2canvas from 'html2canvas'; // Import html2canvas
import { fetchArticleDetailById, fetchArticleComments, postComment, recordReadingHistory } from '../api/articles'; // 导入 API 函数, recordReadingHistory
import { getAIChatResponse } from '@/api/ai'; // 导入 AI API 函数
// 引入 v-md-preview for AI chat
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});
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

// 阅读记录相关状态
const readingStartTime = ref(null);

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

// Share related state
const qrCodeDialogVisible = ref(false);
const qrCodeValue = ref('');
const qrCodeContainer = ref(null); // Ref for the QR code container element

// --- AI Explanation State ---
const articleBodyRef = ref(null); // Ref for the article body element
const selectedText = ref('');
const aiButtonVisible = ref(false);
const aiButtonStyle = ref({});
const aiChatDialogVisible = ref(false);
const aiChatMessages = ref([]); // Stores { role: 'user' | 'ai', text: string }
const aiChatInput = ref('');
const aiChatScrollbarRef = ref(null);
const aiChatMessagesRef = ref(null);
const currentSelectionRange = ref(null); // Store selection range

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

// 获取评论数据的函数
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

// 点击收藏触发的函数
const Collection = async () => {
  
}
// Get current article URL
const currentArticleUrl = computed(() => window.location.href);

// Handle share dropdown commands
const handleShareCommand = (command) => {
  switch (command) {
    case 'copyLink':
      copyLink();
      break;
    case 'generateQRCode':
      showQRCodeDialog();
      break;
    // case 'downloadQRCodeBackend':
    //   downloadQRCodeFromBackend(); // Placeholder for backend call
    //   break;
    default:
      console.warn('Unknown share command:', command);
  }
};

// Copy link to clipboard
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(currentArticleUrl.value);
    ElMessage.success('链接已复制到剪贴板');
  } catch (err) {
    console.error('Failed to copy link: ', err);
    ElMessage.error('复制链接失败');
  }
};

// Show QR code dialog
const showQRCodeDialog = () => {
  qrCodeValue.value = currentArticleUrl.value;
  qrCodeDialogVisible.value = true;
};

// Download QR code using html2canvas
const downloadQRCode = () => {
  if (!qrCodeContainer.value) {
    ElMessage.error('无法找到二维码元素');
    return;
  }
  html2canvas(qrCodeContainer.value, {
    useCORS: true, // Important if the QR code lib generates external resources or if you have images
    scale: 2, // Increase scale for better resolution
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `article-${article.value.id || 'qrcode'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    qrCodeDialogVisible.value = false; // Close dialog after download
    ElMessage.success('二维码已开始下载');
  }).catch(err => {
    console.error('Failed to download QR code:', err);
    ElMessage.error('下载二维码失败');
  });
};

// Placeholder for backend QR code generation
// const downloadQRCodeFromBackend = async () => {
//   try {
//     // Replace with your actual API call
//     // const response = await fetch(`/api/qrcode?url=${encodeURIComponent(currentArticleUrl.value)}`);
//     // if (!response.ok) throw new Error('Backend QR code generation failed');
//     // const blob = await response.blob();
//     // const url = window.URL.createObjectURL(blob);
//     // const link = document.createElement('a');
//     // link.href = url;
//     // link.download = `article-${article.value.id}-backend.png`;
//     // link.click();
//     // window.URL.revokeObjectURL(url);
//     ElMessage.info('后端二维码生成功能待实现');
//   } catch (error) {
//     console.error('Failed to download QR code from backend:', error);
//     ElMessage.error('从后端下载二维码失败');
//   }
// };

// --- End Share Functionality ---

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

// --- Share Functionality ---


// Placeholder for backend QR code generation
// const downloadQRCodeFromBackend = async () => {
//   try {
//     // Replace with your actual API call
//     // const response = await fetch(`/api/qrcode?url=${encodeURIComponent(currentArticleUrl.value)}`);
//     // if (!response.ok) throw new Error('Backend QR code generation failed');
//     // const blob = await response.blob();
//     // const url = window.URL.createObjectURL(blob);
//     // const link = document.createElement('a');
//     // link.href = url;
//     // link.download = `article-${article.value.id}-backend.png`;
//     // link.click();
//     // window.URL.revokeObjectURL(url);
//     ElMessage.info('后端二维码生成功能待实现');
//   } catch (error) {
//     console.error('Failed to download QR code from backend:', error);
//     ElMessage.error('从后端下载二维码失败');
//   }
// };

// --- End Share Functionality ---

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


// Placeholder for backend QR code generation
// const downloadQRCodeFromBackend = async () => {
//   try {
//     // Replace with your actual API call
//     // const response = await fetch(`/api/qrcode?url=${encodeURIComponent(currentArticleUrl.value)}`);
//     // if (!response.ok) throw new Error('Backend QR code generation failed');
//     // const blob = await response.blob();
//     // const url = window.URL.createObjectURL(blob);
//     // const link = document.createElement('a');
//     // link.href = url;
//     // link.download = `article-${article.value.id}-backend.png`;
//     // link.click();
//     // window.URL.revokeObjectURL(url);
//     ElMessage.info('后端二维码生成功能待实现');
//   } catch (error) {
//     console.error('Failed to download QR code from backend:', error);
//     ElMessage.error('从后端下载二维码失败');
//   }
// };

// --- End Share Functionality ---

// --- 发送阅读历史 ---
const sendReadingRecord = async () => {
  if (readingStartTime.value && currentUserId.value && article.value && article.value.id) {
    const readingDuration = Math.round((Date.now() - readingStartTime.value) / 1000); // in seconds
    if (readingDuration > 0) { // Only record if duration is meaningful
      try {
        await recordReadingHistory({
          article_id: parseInt(article.value.id),
          user_id: currentUserId.value,
          duration: readingDuration, // duration in seconds
        });
        // console.log('Reading history recorded successfully.');
      } catch (err) {
        console.error('Failed to record reading history:', err);
      }
    }
  }
};

onBeforeUnmount(() => {
  sendReadingRecord();
});

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

      if (currentUserId.value && article.value && article.value.id) {
        readingStartTime.value = Date.now();
        // console.log('Reading started at:', new Date(readingStartTime.value).toLocaleTimeString());
      }

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

  // Add mouseup listener after component mounts and article content is potentially loaded
  nextTick(() => {
    if (articleBodyRef.value) {
      articleBodyRef.value.addEventListener('mouseup', handleTextSelection);
      // Add listener to hide button when clicking elsewhere
      document.addEventListener('mousedown', handleMouseDownOutside);
    } else {
      console.warn('articleBodyRef is not available to attach listener.');
    }
  });
});

// Clean up listener on unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (articleBodyRef.value) {
    articleBodyRef.value.removeEventListener('mouseup', handleTextSelection);
  }
  document.removeEventListener('mousedown', handleMouseDownOutside);
});

// Function to hide button when clicking outside
const handleMouseDownOutside = (event) => {
  // Check if the click is outside the button and not part of a text selection action
  if (aiButtonVisible.value && !event.target.closest('.ai-explain-button')) {
      // Use a small timeout to allow the button click event to register if it was the target
      setTimeout(() => {
          const selection = window.getSelection();
          if (!selection || selection.isCollapsed) { // Hide only if no active selection
               aiButtonVisible.value = false;
          }
      }, 100);
  }
};

// --- AI Explanation Functions ---

// Function to scroll AI chat to bottom
const scrollAiChatToBottom = () => {
  nextTick(() => {
    const scrollbar = aiChatScrollbarRef.value;
    if (scrollbar && scrollbar.wrapRef) {
      scrollbar.wrapRef.scrollTop = scrollbar.wrapRef.scrollHeight;
    }
  });
};

// Handle text selection in article body
const handleTextSelection = (event) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  // Check if the selection is within the article body
  let isInsideArticleBody = false;
  if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let container = range.commonAncestorContainer;
      // Traverse up the DOM tree to see if the selection is within articleBodyRef
      while (container) {
          if (container === articleBodyRef.value) {
              isInsideArticleBody = true;
              break;
          }
          container = container.parentNode;
      }
  }

  if (text && isInsideArticleBody) {
    selectedText.value = text;
    currentSelectionRange.value = selection.getRangeAt(0).cloneRange(); // Store the range
    // const rect = currentSelectionRange.value.getBoundingClientRect(); // Not strictly needed for fixed positioning based on click

    // Calculate button position relative to the viewport
    aiButtonStyle.value = {
      position: 'fixed', // Use fixed position relative to viewport
      left: `${event.clientX + 5}px`, // Position based on mouse click coordinates
      top: `${event.clientY + 5}px`,
      zIndex: 1000, // Ensure button is above other content
    };
    aiButtonVisible.value = true;
  } else {
    // If the click was not on the button itself, hide it (handled by handleMouseDownOutside)
    // aiButtonVisible.value = false; // Let handleMouseDownOutside manage hiding
  }
};

// Show AI Chat Dialog
const showAiChat = () => {
  if (!selectedText.value) return;
  aiChatMessages.value = [{ role: 'user', text: `请解释以下内容：\n\n>${selectedText.value.replace(/\n/g, '\n>')}` }];
  aiChatDialogVisible.value = true;
  aiButtonVisible.value = false; // Hide button when dialog opens
  // Optionally send the initial query immediately
  sendAiQuery(true); // Pass flag to indicate initial query
};

// Send query to AI
const sendAiQuery = async (isInitialQuery = false) => {
  const textToSend = isInitialQuery ? selectedText.value : aiChatInput.value.trim();
  if (!textToSend) return;

  if (!isInitialQuery) {
    aiChatMessages.value.push({ role: 'user', text: textToSend });
    aiChatInput.value = ''; // Clear input after sending
  }

  scrollAiChatToBottom();

  // Add loading indicator if desired
  aiChatMessages.value.push({ role: 'ai', text: '思考中...' });
  scrollAiChatToBottom();

  try {
    // Prepare messages for API (use current chat context)
    const apiMessages = aiChatMessages.value
      .filter(msg => msg.text !== '思考中...') // Exclude loading message
      .map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text }));

    // Retrieve user token from local storage if needed by API
    const userToken = localStorage.getItem('deepseek_api_token');

    const response = await getAIChatResponse(apiMessages, userToken);

    // Replace 'Thinking...' with actual response
    const lastMessageIndex = aiChatMessages.value.length - 1;
    if (aiChatMessages.value[lastMessageIndex]?.role === 'ai' && aiChatMessages.value[lastMessageIndex]?.text === '思考中...') {
      aiChatMessages.value[lastMessageIndex].text = response;
    } else {
      // Fallback if 'Thinking...' wasn't the last message (shouldn't happen often)
      aiChatMessages.value.push({ role: 'ai', text: response });
    }

    // Save conversation to history after getting response
    if (isInitialQuery) {
        saveConversationToHistory(selectedText.value, response);
    }

  } catch (error) {
    console.error('AI chat error:', error);
    const lastMessageIndex = aiChatMessages.value.length - 1;
     if (aiChatMessages.value[lastMessageIndex]?.role === 'ai' && aiChatMessages.value[lastMessageIndex]?.text === '思考中...') {
        aiChatMessages.value[lastMessageIndex].text = `抱歉，解释时遇到错误: ${error.message || '请稍后再试'}`;
     } else {
        aiChatMessages.value.push({ role: 'ai', text: `抱歉，解释时遇到错误: ${error.message || '请稍后再试'}` });
     }
    // ElMessage.error('AI 解释失败');
  } finally {
    scrollAiChatToBottom();
  }
};

// Reset AI Chat state when dialog closes
const resetAiChat = () => {
  aiChatMessages.value = [];
  aiChatInput.value = '';
  selectedText.value = ''; // Clear selected text as well
  currentSelectionRange.value = null;
};

// Save conversation to local storage (compatible with AICoding.vue)
const saveConversationToHistory = (question, answer) => {
  const historyKey = 'ai_chat_history';
  let history = [];
  try {
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      history = JSON.parse(savedHistory);
    }
  } catch (e) {
    console.error('Failed to parse AI chat history from localStorage:', e);
    history = []; // Reset if parsing fails
  }

  // Create chat detail matching AICoding format
  const chatDetail = [
    { role: 'user', text: `请解释以下内容：\n\n>${question.replace(/\n/g, '\n>')}` },
    { role: 'ai', text: answer }
    // Add subsequent messages from the popup if needed, currently only saves initial Q&A
  ];

  // Add the new entry
  history.unshift({ // Add to the beginning
    question: `解释：“${question.substring(0, 30)}${question.length > 30 ? '...' : ''}”`, // Shortened question for history list
    answer: answer.substring(0, 50) + (answer.length > 50 ? '...' : ''), // Shortened answer
    chat: chatDetail
  });

  // Limit history size if desired (e.g., keep last 50)
  // history = history.slice(0, 50);

  try {
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save AI chat history to localStorage:', e);
    // ElMessage.error('无法保存对话记录');
  }
};

// --- End AI Explanation Functions ---

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
  /* margin-bottom: 10px; */ /* Removed as gap is used in action-card */
  padding: 8px 10px; /* Adjust padding */
  font-size: 14px; /* Adjust font size */
  border-radius: 6px; /* Add border-radius */
  margin-left: 0 !important; /* Override element-plus strange margin */
}

/* Ensure dropdown takes button width and aligns items */
.share-dropdown {
  width: 80%;
  display: block; /* Make dropdown block to take width */
}

.share-btn-inner {
  width: 100%; /* Make inner button fill dropdown */
  justify-content: center; /* Center text and icon */
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
  position: relative; /* Needed for absolute positioning of AI button */
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

/* .le{ */
  /* margin-left: 0px; */ /* Removed as .action-btn handles margin */
/* } */

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
  padding-left: 10px;}
/* Styles for AI Explanation */
.ai-explain-button {
  /* position: absolute; /* Set via style binding */
  padding: 4px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
}

.ai-chat-dialog .el-dialog__body {
  padding: 10px 20px; /* Adjust padding */
}

.ai-chat-content {
  margin-bottom: 15px;
}

.ai-chat-input {
  margin-top: 10px;
}

/* Reusing chat message styles from AICoding.vue or define similar */
.chat-msg {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start; /* Align avatar and bubble */
}

.chat-msg .avatar {
  margin-right: 10px;
  flex-shrink: 0;
}

.chat-msg .msg-bubble {
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 80%;
  word-wrap: break-word;
}

.chat-msg.user {
  justify-content: flex-end;
}

.chat-msg.user .avatar {
  order: 2;
  margin-right: 0;
  margin-left: 10px;
}

.chat-msg.user .msg-bubble {
  background-color: #e6f7ff; /* Light blue for user */
  border: 1px solid #bae7ff;
  order: 1;
}

.chat-msg.ai .msg-bubble {
  background-color: #f0f0f0; /* Light grey for AI */
  border: 1px solid #d9d9d9;
}

/* Ensure v-md-preview content is styled correctly */
.msg-bubble .v-md-editor-preview {
  padding: 0;
  background: transparent;
}

.msg-bubble .v-md-editor-preview p {
  margin-bottom: 0; /* Adjust paragraph margin inside bubble */
}

</style>