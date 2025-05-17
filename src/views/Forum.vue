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
        <div class="circle-item" v-for="circle in circles" :key="circle.ID"
          :class="{ active: selectedCircleId === (circle.ID ) }"
          @click="selectFilter('circle-' + (circle.Name ))">
          {{ circle.Name  }}
        </div>
      </div>
      <div class="my-circles">
        <div class="sidebar-title">推荐圈子</div>
        <div class="circle-item" v-for="circle in Recommendedcircles" :key="circle.ID"
          :class="{ active: selectedCircleId === (circle.ID ) }"
          @click="selectFilter('circle-' + (circle.Name ))">
          {{ circle.Name  }}
        </div>
      </div>
    </div>
    <div class="main-content">
      <div class="post-editor">
        <textarea v-model="newPostContent" placeholder="快和掘友一起分享新鲜事！告诉你个小秘密，发布沸点时添加圈子和话题会被更多掘友看到哦~"></textarea>
        <div class="editor-actions">
          <div class="actions-left">
            <span>表情</span>
            <span @click="triggerImageUpload">图片</span>
            <input ref="imageInput" type="file" accept="image/*" multiple style="display:none" @change="handleImageChange" />
            <span>链接</span>
            <span>话题</span>
            <span>代码</span>
          </div>
          <div class="actions-right">
             <span class="char-count">{{ newPostContent.length }}/1000</span>
            <button class="publish-btn" @click="publishPost">发布</button>
          </div>
        </div>
        <button @click="batchSyncLikes">测试</button>
        <div class="image-grid" v-if="uploadedImages.length ||0">
          <div v-for="(img, idx) in uploadedImages" :key="img.url" class="image-item"
               @mouseenter="hoveredImageIdx = idx" @mouseleave="hoveredImageIdx = null">
            <img :src="img.url" @click="previewImage(img.url)" class="upload-preview-img" />
            <span v-if="hoveredImageIdx === idx" class="delete-icon" @click.stop="deleteImage(idx, img)">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" style="background:rgba(0,0,0,0.5);border-radius:50%;display:block;margin:auto;">
              </svg>
            </span>
          </div>
        </div>
        <div v-if="previewImgUrl" class="img-preview-modal" @click.self="previewImgUrl = ''">
          <img :src="previewImgUrl" class="img-preview-large" />
        </div>
        <div class="select-circle">
          <span>请选择圈子：</span>
          <select v-model="selectedCircleId" @focus="loadUserJoinedGroups">
            <option v-for="circle in userJoinedCircles" :key="circle.ID" :value="circle.ID">{{ circle.Name }}</option>
            <option v-if="userJoinedCircles.length === 0" value="1">默认圈子</option>
          </select>
        </div>
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
            <template v-if="post.authorId === da.ID">
              <span class="delete-post-btn" @click="confirmDeletePost(post)">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#f56c6c" style="vertical-align:middle;cursor:pointer;"><path d="M16 9v8H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1M18 7H6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7z"/></svg>
              </span>
            </template>
          </div>
          <div class="post-content">
            {{ post.content }}
          </div>
          <div v-if="parseImages(post.Images).length > 0" class="image-grid">
            <div v-for="(img, idx) in parseImages(post.Images)" :key="img" class="image-item"
                 @mouseenter="hoveredImageIdx = 'post-' + post.id + '-' + idx" @mouseleave="hoveredImageIdx = null">
              <img :src="img" @click="previewImage(img)" class="upload-preview-img" />
            </div>
          </div>
          <div class="post-actions">
            <!-- <span>分享</span> -->
            <span @click="toggleComments(post.id)">评论 {{  "this"+post.CommentCount }}</span>
            <span @click="toggleLike(post)" :class="{'liked': post.liked}">
              <template v-if="post.IsLiked">取消点赞</template>
              <template v-else>点赞</template>
              {{ post.likes }}
            </span>
          </div>
          <!-- Comment Section -->
          <div v-if="expandedComments[post.id]" class="comment-section">
            <div class="existing-comments">
              <CommentTree :comments="mapComments(post.comments)" :postId="post.id" @reply="handleReply" />
              <div class="comment-item" v-for="comment in post.comments" :key="comment.id">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-text">{{ comment.text }}</span>
              </div>
              <div v-if="post.comments.length === 0" class="no-comments">暂无评论</div>
            </div>
            <div class="comment-editor">
              <textarea v-model="newCommentText[post.id]" placeholder="发表你的评论..."></textarea>
              <button @click="addComment(post)">发布评论</button>
            </div>
          </div>
        </div>
        <!-- Static posts removed, replaced by v-for -->
      </div>
    </div>
    <div class="right-sidebar">
      <!-- Right sidebar content remains the same -->
      <div class="user-profile-card">
         <img :src=da.AvatarURL alt="avatar" class="profile-avatar">
         <div class="profile-name">{{ da.Username }}</div>
         <div class="profile-title">{{ da.PersonalIntroduction }}</div>
         <div class="profile-stats">
            <div><span>{{ 0 }}</span><span>圈子</span></div>
            <div><span>{{ 0 }}</span><span>关注</span></div>
            <div><span>{{ da.NumberOfFans || 0 }}</span><span>粉丝</span></div>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getNewGroups,batchLike,fetchCirclesApi, deletePost,fetchGroupPostsApi, fetchLatestPostsApi, publishPostApi, addCommentApi, likePostApi } from '../api/forum';
import { fetchUserJoinedGroupsApi } from '../api/forum';
import { ElMessage } from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios';
import CommentTree from "./CommentTree.vue";

function mapComments(comments) {
  if (!Array.isArray(comments)) return [];
  return comments.map(c => ({
    ID: c.id || c.ID,
    UserID: c.userid || c.UserID,
    User: c.User || { Username: c.author || c.UserName },
    Content: c.content || c.Content || c.text,
    CreatedAt: c.date || c.CreatedAt,
    Replies: mapComments(c.replies || c.Replies || c.children || [])
  }));
}
const da = reactive({
  Username: JSON.parse(localStorage.getItem('user')).Username ||'',
  AvatarURL: JSON.parse(localStorage.getItem('user')).AvatarURL || "https://avatars.githubusercontent.com/u/1?v=4",
  PersonalIntroduction:JSON.parse(localStorage.getItem('user')).PersonalIntroduction ||'',
  PersonalSignature: JSON.parse(localStorage.getItem('user')).PersonalSignature||'',
  NumberOfFans:JSON.parse(localStorage.getItem('user')).NumberOfFans|| 0,
  NumberOfFollow: JSON.parse(localStorage.getItem('user')).NumberOfFollow||0,
})

const activeFilter = ref('latest'); // 默认筛选
const newPostContent = ref('');
const expandedComments = reactive({}); // 跟踪展开的评论区 { postId: boolean }
const newCommentText = reactive({}); // 跟踪每个帖子的评论输入 { postId: string }

// 圈子相关数据
const circles = ref([]); // 圈子列表
const Recommendedcircles = ref([]); // 推荐圈子列表
const selectedCircleId = ref(null); // 当前选择的圈子ID
const posts = ref([]); // 当前显示的帖子列表
const loadingPosts = ref(false);
const loadingCircles = ref(false);
const errorCircles = ref('');
// confirmDeletePost 
const confirmDeletePost = async (post) => { 
  // 让用户确认删除
  const confirmed = window.confirm('确认删除此帖子吗？');
  if (!confirmed) return;

  // 调用删除帖子的API
  try {
    let response = await deletePost(post.id);
     console.log("this isi si",selectedCircleId.value);
    if (selectedCircleId.value){
      fetchLatestPosts()
    }else{
        // 刷新帖子列表
    fetchGroupPosts(selectedCircleId.value); 
    ElMessage.success('删除成功');
    }
  
  }
  catch (error) {
    ElMessage.error(error.message || '删除失败');
  }
};

// 获取该用户加入的所有圈子（调用API）
const fetchCircles = async () => {

  loadingCircles.value = true;
  errorCircles.value = '';
  try {
    const data = await fetchUserJoinedGroupsApi(JSON.parse(localStorage.getItem('user')).ID);
    console.log(data);
    if (Array.isArray(data.groups)) {
      circles.value = data.groups;
      // 移除自动赋值selectedCircleId的逻辑
    } else {
      errorCircles.value = '圈子数据格式错误';
    }
  } catch (e) {
    errorCircles.value = '圈子加载失败';
  } finally {
    loadingCircles.value = false;
  }
};
// 获取给该用户推荐的圈子
const getRecommendedCircles = async () => { 
 let res = await getNewGroups();
 Recommendedcircles.value = res.groups;
 console.log("推荐的圈子",Recommendedcircles.value);
};

// 获取圈子帖子列表
const fetchGroupPosts = async (groupId) => {
  if (!groupId) return;
  loadingPosts.value = true;
  try {
    const data = await fetchGroupPostsApi(groupId);
    posts.value = Array.isArray(data.posts)             
      ? data.posts.map(post => ({
          id: post.ID ,
          content: post.Content ,
          author: post.Author.Username || '' ,
          avatar: post.Author.AvatarURL || '',
          meta: post.CreatedAt  || '',
          likes: post.LikeCount  || 0,
          comments: post.GroupComments || [],
          Images: post.Images || [],
          CommentCount: post.CommentCount || 0,
          IsLiked: post.IsLiked || false,
        }
      ))
      : [];
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
    const data = await fetchLatestPostsApi();
    posts.value = Array.isArray(data.posts)
      ? data.posts.map(post => ({
          id: post.ID ,
          content: post.Content ,
          author: post.Author?.Username  || '',
          avatar: post.Author?.AvatarURL  || '',
          meta: post.CreatedAt  || '',
          likes: post.LikeCount  || 0,
          comments: post.GroupComments  || [],
          Images: post.Images || [],
          CommentCount: post.CommentCount || 0,
          IsLiked: post.IsLiked || false,
        }))
      : [];
  } catch (e) {
    posts.value = [];
  } finally {
    loadingPosts.value = false;
  }
};

// 切换筛选
const selectFilter = (filter) => {
  activeFilter.value = filter;
  // 切换导航时取消圈子高亮
  if (filter === 'latest' || filter === 'hot' || filter === 'followed') {
    selectedCircleId.value = null;
  }
  Object.keys(expandedComments).forEach(key => delete expandedComments[key]);
  Object.keys(newCommentText).forEach(key => delete newCommentText[key]);
  if (filter === 'latest') {
    fetchLatestPosts();
  } else if (filter.startsWith('circle-')) {
    // 选择圈子
    const circleName = filter.replace('circle-', '');
    const circle = circles.value.find(c => c.Name === circleName || c.name === circleName) || Recommendedcircles.value.find(c => c.Name === circleName || c.name === circleName);
    if (circle) {
      selectedCircleId.value = circle.ID || circle.id;
      activeFilter.value = null;
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
const userJoinedCircles = ref([]);

const loadUserJoinedGroups = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.ID || 1;
  try {
    const data = await fetchUserJoinedGroupsApi(userId);
    if (Array.isArray(data.groups) && data.groups.length > 0) {
      userJoinedCircles.value = data.groups;
      // 不自动赋值selectedCircleId
    } else {
      userJoinedCircles.value = [];
      // 不自动赋值selectedCircleId
    }
  } catch {
    userJoinedCircles.value = [];
    // 不自动赋值selectedCircleId
  }
};

const uploadedImages = ref([]); // [{url, filename}]
const hoveredImageIdx = ref(null);
const previewImgUrl = ref('');

const triggerImageUpload = () => {
  if (uploadedImages.value.length >= 9) {
    alert('最多只能上传9张图片');
    return;
  }
  imageInput.value && imageInput.value.click();
};

const imageInput = ref(null);

const handleImageChange = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  const remain = 9 - uploadedImages.value.length;
  const uploadFiles = files.slice(0, remain);
  for (const file of uploadFiles) {
    if (!file.type.startsWith('image/')) {
      alert('仅支持图片格式');
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片不能超过5MB');
      continue;
    }
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('http://127.0.0.1:8080/api/upload-image', formData, {headers: {'Content-Type': 'multipart/form-data'}});
      if (res.data && res.data.url) {
        let url = res.data.url;
        // 检查返回的url是否已经包含 /api 前缀，避免重复拼接
        if (!url.startsWith('/api')) {
          url = '/api' + url;
        }
        uploadedImages.value.push({url: 'http://127.0.0.1:8080' + url, filename: url.split('/').pop()});
      } else {
        alert('上传失败，未返回图片地址');
      }
    } catch (err) {
      alert('上传失败');
    }
  }
  e.target.value = '';
};

const deleteImage = async (idx, img) => {
  try {
    await axios.delete('http://127.0.0.1:8080/api/delete-image', {params: {filename: img.filename}});
    uploadedImages.value.splice(idx, 1);
  } catch {
    alert('删除失败');
  }
};

// 预览图片
const previewImage = (url) => {
  previewImgUrl.value = url;
};

// 修改发布帖子逻辑，确保selectedCircleId有值
const publishPost = async () => {
  if (!newPostContent.value.trim() || !selectedCircleId.value) return;
  try {
    const imageUrls = uploadedImages.value.map(img => img.url);
    const data = await publishPostApi(selectedCircleId.value, newPostContent.value, imageUrls);
    if (data.code || data.code == 200) {
      posts.value.unshift(data.post);
      newPostContent.value = '';
      uploadedImages.value = [];
      message.success('发布帖子成功');
      if (selectedCircleId.value){
      fetchLatestPosts()
    }else{
        // 刷新帖子列表
    fetchGroupPosts(selectedCircleId.value); 
    }
    } else {
      message.error('发布帖子失败');
    }
  } catch (e) {}
};

// 展开/收起评论
const toggleComments = async (postId) => {
  expandedComments[postId] = !expandedComments[postId];
  if (expandedComments[postId]) {
    // 只有展开时才请求评论
    try {
      const res = await axios.get(`http://127.0.0.1:8080/api/postcomments/${postId}`);
      const targetPost = posts.value.find(p => p.ID === postId || p.id === postId);
      if (targetPost) {
        targetPost.comments = res.data.comments || [];
      }
    } catch (e) {
      // 可以根据需要提示错误
    }
    if (!newCommentText[postId]) {
      newCommentText[postId] = '';
    }
  }
};

// 添加评论
const addComment = async (post) => {
  let postId = post.id;
  const text = newCommentText[postId]?.trim();
  if (!text) return;
  try {
    let data
    if (post.CommentCount === 0) {
       data = await addCommentApi(postId, text,null);
    }else{
       data = await addCommentApi(postId, text,post.CommentCount);
    }
    if (data.comment) {
      // 立即将新评论插入当前帖子的评论数组
      const targetPost = posts.value.find(p => p.ID === postId || p.id === postId);
      if (targetPost) {
        if (!targetPost.comments) targetPost.comments = [];
        targetPost.comments.push(data.comment);
      }
      newCommentText[postId] = '';
    }
  } catch (e) {}
};
// 新增：处理评论回复
const handleReply = async ({ postId, parentId, content }) => {
  if (!content || !postId) return;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.ID || 1;
    const res = await axios.post(`http://127.0.0.1:8080/api/posts/${postId}/comments`, {
      content,
      parent_id: parentId,
      user_id: userId
    });
    if (res.data && res.data.comment) {
      // 找到对应的帖子
      const targetPost = posts.value.find(p => p.ID === postId || p.id === postId);
      if (targetPost) {
        // 递归查找父评论
        function insertReply(comments, parentId, reply) {
          for (let c of comments) {
            if (c.ID === parentId) {
              c.Replies = c.Replies || [];
              c.Replies.push(reply);
              return true;
            }
            if (c.Replies && insertReply(c.Replies, parentId, reply)) {
              return true;
            }
          }
          return false;
        }
        if (parentId) {
          // 回复评论
          insertReply(targetPost.comments, parentId, res.data.comment);
        } else {
          // 回复帖子（一级评论）
          targetPost.comments = targetPost.comments || [];
          targetPost.comments.push(res.data.comment);
        }
      }
    }
  } catch (e) {
    ElMessage.error('回复失败');
  }
};
// 点赞操作本地队列
const likeActionQueue = reactive({}); // { postId: 'like' | 'unlike' }

// 点赞帖子（本地记录，不立即请求后端）
const toggleLike = (post) => {
  // 本地切换点赞状态
  post.IsLiked = !post.IsLiked;
  if (post.IsLiked) {
    post.likes = (post.likes || 0) + 1;
    likeActionQueue[post.id] = 'like';
  } else {
    post.likes = Math.max((post.likes || 1) - 1, 0);
    likeActionQueue[post.id] = 'unlike';
  }
};

// 页面卸载时批量上报点赞操作
const batchSyncLikes = async () => {
  const actions = Object.entries(likeActionQueue).map(([postId, action]) => ({ postId, action }));
  if (actions.length === 0) return;
  try {
    // await axios.post('http://127.0.0.1:8080/api/batch-like', { actions });
   let i =  await batchLike({actions})
   if (i.code == 200){
     // 清空队列
     Object.keys(likeActionQueue).forEach(key => delete likeActionQueue[key]);
   }
  } catch (e) {
    // 可以选择本地缓存，或提示用户稍后重试
    console.error('批量点赞失败', e);
  }
};

// 监听页面卸载
window.addEventListener('beforeunload', batchSyncLikes);
onMounted(() => {
  fetchCircles();     // 加载圈子列表
  fetchLatestPosts(); // 加载最新帖子
  getRecommendedCircles(); // 加载推荐圈子列表
});

// 解析帖子图片字段（Images为JSON字符串）
function parseImages(images) {
  if (!images) return [];
  try {
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      const arr = JSON.parse(images);
      if (Array.isArray(arr)) return arr;
    }
    return [];
  } catch {
    return [];
  }
}
</script>

<style scoped>


.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 90px);
  gap: 12px;
  margin: 12px 0 0 0;
  max-width: 300px;
}
.image-item {
  width: 90px;
  height: 90px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f7f8fa;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: filter 0.2s;
}
.image-item:hover .upload-preview-img {
  filter: blur(1px) brightness(0.8);
}
.delete-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.2s;
}
.image-item .delete-icon {
  opacity: 0;
  pointer-events: none;
}
.image-item:hover .delete-icon {
  opacity: 1;
  pointer-events: auto;
}
.img-preview-modal {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-preview-large {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
}

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
    display: inline-flex;
    align-items: center;
    margin-top: -45px;
    margin-left: 10px;
    margin-bottom: 10px;
    border: none;
    box-shadow: none;
}
.select-circle span {
    margin-right: 8px;
    color: #1e80ff;
    font-weight: 500;
}
.select-circle select {
    min-width: 120px;
    padding: 6px 16px;
    border: 1px solid #e0e3e8;
    border-radius: 16px;
    background: #f7f8fa;
    color: #252933;
    font-size: 14px;
    outline: none;
    transition: border 0.2s;
    margin-left: 0;
    box-shadow: none;
}
.select-circle select:focus {
    border: 1.5px solid #1e80ff;
    background: #fff;
}


/* Post Feed Styles */
.post-feed .post-item {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.post-header {
  position: relative;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
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

.delete-post-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255,255,255,0.85);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.delete-post-btn:hover {
  background: #f56c6c;
  box-shadow: 0 4px 16px rgba(245,108,108,0.15);
}
.delete-post-btn svg {
  fill: #f56c6c;
  transition: fill 0.2s;
}
.delete-post-btn:hover svg {
  fill: #fff;
}

</style>


