<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElTabs, ElTabPane, ElButton, ElTag, ElMessage } from 'element-plus';
import { fetchUserDetails, fetchUserArticles } from '../api/users'; // 导入 API 函数
import { useAuthStore } from '../store/authStore'; // 导入 Auth Store
import dayjs from 'dayjs'; // 导入 dayjs 用于日期格式化

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const user = ref(null); // 存储用户详细信息
const articles = ref([]); // 存储用户文章列表
const activeTab = ref('article');
const isLoading = ref(true);
const error = ref(null);

// 获取当前登录用户的ID
const currentUserId = computed(() => authStore.user.ID);
// 获取当前查看的用户页面的ID
const viewedUserId = computed(() => parseInt(route.params.id));

// 判断当前查看的是否是登录用户自己的页面
const isOwnProfile = computed(() => currentUserId.value === viewedUserId.value);

onMounted(async () => {
  const userId = route.params.id;
  if (!userId) {
    error.value = '未找到用户 ID。';
    isLoading.value = false;
    ElMessage.error('无法加载用户信息，缺少用户ID');
    // 可以选择重定向到首页或错误页
    // router.push('/');
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    // 并行获取用户详情和文章列表
    const [userDetailsResponse, userArticlesResponse] = await Promise.all([
      fetchUserDetails(userId),
      fetchUserArticles(userId)
    ]);

    // 处理用户详情
    if (userDetailsResponse) {
      user.value = userDetailsResponse;
      // 可以在这里格式化加入日期等
      if (user.value.CreatedAt) {
        user.value.joinDate = dayjs(user.value.CreatedAt).format('YYYY-MM-DD');
      }
    } else {
      throw new Error(userDetailsResponse.message || '获取用户信息失败');
    }

    // 处理文章列表
    // 注意：fetchUserArticles 已经处理了 code === 0 的情况，直接返回 data
    articles.value = userArticlesResponse.map(article => ({
      id: article.ID,
      title: article.Title,
      // 格式化文章元数据，例如发布时间和阅读数
      meta: `${dayjs(article.CreatedAt).format('YYYY-MM-DD')} · ${article.ViewCount || 0}阅读 · ${article.LikeCount || 0}赞`,
      desc: article.Description || '暂无描述'
    }));

  } catch (err) {
    console.error('Failed to fetch user data:', err);
    error.value = err.message || '加载用户信息或文章失败，请稍后再试。';
    ElMessage.error(error.value);
  } finally {
    isLoading.value = false;
  }
});

function goToArticle(id) {
  router.push(`/article/${id}`);
}

function goToSettings() {
  // 只有是自己的主页时才能跳转到设置
  if (isOwnProfile.value) {
    router.push('/settings'); // 假设设置页路由为 /settings
  } else {
    ElMessage.warning('无法访问他人的设置页面');
  }
}

function goToChat() {
  if (!currentUserId.value) {
    ElMessage.warning('请先登录再发送私信');
    return;
  }
  if (isOwnProfile.value) {
    ElMessage.info('不能给自己发送私信');
    return;
  }
  // 跳转到聊天页面，需要目标用户的ID
  router.push(`/chat/${viewedUserId.value}`);
}

// 添加关注/取消关注功能 (示例，需要后端API支持)
function followUser() {
  if (!currentUserId.value) {
    ElMessage.warning('请先登录');
    return;
  }
  // 调用关注API...
  console.log(`Follow user ${viewedUserId.value}`);
  ElMessage.success('关注成功 (模拟)');
  // 可能需要更新 user.value 中的关注状态和关注者数量
}

</script>

<template>
  <div class="user-page">
    <div v-if="isLoading" class="loading-state">正在加载用户数据...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <template v-else-if="user">
      <div class="user-main">
        <el-card class="user-info-card">
          <div class="user-info-top">
            <!-- 使用动态头像 -->
            <img class="avatar" :src="user.AvatarURL || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" alt="avatar" />
            <div class="user-basic">
              <!-- 使用动态用户名和认证状态 (如果后端提供) -->
              <div class="user-name">{{ user.Username }} <el-tag v-if="user.isVerified" size="small" type="info">认证</el-tag></div>
              <!-- 使用动态描述 -->
              <div class="user-desc">{{ user.PersonalIntroduction || '暂无个人简介' }}</div>
              <div class="user-links">
                <!-- 根据是否是自己的主页显示不同按钮 -->
                <el-button v-if="!isOwnProfile" size="small" type="primary" @click="followUser">关注</el-button>
                <el-button v-if="!isOwnProfile" size="small" @click="goToChat">私信</el-button>
                <el-button v-if="isOwnProfile" size="small" @click="goToSettings">编辑资料</el-button> <!-- 修改为编辑资料 -->
              </div>
            </div>
          </div>
          <div class="user-achievements">
            <!-- 动态徽章等成就 (需要后端数据) -->
            <el-tag size="small" type="success">获得徽章 {{ user.badgeCount || 0 }}</el-tag>
            <el-tag v-if="user.popularityRank" size="small" type="warning">{{ user.popularityRank }}</el-tag>
            <el-tag size="small" type="info">文档被点赞 {{ user.totalLikes || 0 }}</el-tag>
          </div>
          <div class="user-follow">
            <div class="follow-item">
              <!-- 动态关注数 -->
              <div class="follow-num">{{ user.followingCount || 0 }}</div>
              <div class="follow-label">关注了</div>
            </div>
            <div class="follow-item">
              <!-- 动态关注者数 -->
              <div class="follow-num">{{ user.followerCount || 0 }}</div>
              <div class="follow-label">关注者</div>
            </div>
          </div>
        </el-card>
        <el-card class="user-article-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="文章" name="article">
              <div v-if="articles.length === 0" class="no-articles">该用户还没有发布文章</div>
              <div v-else class="article-list">
                <!-- 使用动态文章列表 -->
                <el-card class="article-item" v-for="item in articles" :key="item.id" @click="goToArticle(item.id)" style="cursor: pointer;">
                  <div class="article-title">{{ item.title }}</div>
                  <div class="article-meta">{{ item.meta }}</div>
                  <div class="article-desc">{{ item.desc }}</div>
                </el-card>
              </div>
            </el-tab-pane>
            <el-tab-pane label="专栏" name="column">专栏内容 (待开发)</el-tab-pane>
            <el-tab-pane label="沸点" name="hot">沸点内容 (待开发)</el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
      <div class="user-sidebar">
        <el-card class="sidebar-card">
          <div class="sidebar-title">个人成就</div>
          <!-- 动态侧边栏信息 -->
          <div class="sidebar-item">文档被阅读 {{ user.totalViews || 0 }}</div>
          <div class="sidebar-item">能力值 {{ user.abilityScore || 0 }}</div>
          <div class="sidebar-item">收藏集 {{ user.collectionCount || 0 }}</div>
          <div class="sidebar-item">关注标签 {{ user.followedTagsCount || 0 }}</div>
          <div class="sidebar-item">加入于 {{ user.joinDate || '未知' }}</div>
        </el-card>
      </div>
    </template>
    <div v-else class="no-user-data">无法加载用户数据</div>
  </div>
</template>

<style scoped>
.user-page {
  display: flex;
  gap: 36px;
  max-width: 1300px;
  padding: 32px;
  max-width: 1200px;
  margin: 64px auto 0;
  padding: 32px 0;
  background: #f5f7fa;
}
.user-main {
  flex: 1.7;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.user-info-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  margin-bottom: 0;
  padding: 24px 32px 18px 32px;
}
.user-info-top {
  display: flex;
  align-items: center;
  gap: 22px;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #e0e3e7;
  object-fit: cover; /* Ensure avatar image covers the area */
}
.user-basic {
  flex: 1;
}
.user-name {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-desc {
  color: #888;
  font-size: 15px;
  margin: 6px 0 10px 0;
}
.user-links {
  display: flex;
  gap: 10px;
}
.user-achievements {
  margin: 18px 0 0 0;
  display: flex;
  flex-wrap: wrap; /* Allow tags to wrap */
  gap: 10px;
}
.user-follow {
  display: flex;
  gap: 36px;
  margin-top: 18px;
}
.follow-item {
  text-align: center;
}
.follow-num {
  font-size: 20px;
  font-weight: bold;
  color: #1e80ff;
}
.follow-label {
  font-size: 13px;
  color: #888;
}
.user-article-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  padding: 0 0 18px 0;
}
.article-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.article-item {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  padding: 22px 28px;
  background: #fff;
}
.article-title {
  font-size: 19px;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px; /* Add some space below title */
}
.article-meta {
  font-size: 13px;
  color: #888;
  margin: 6px 0;
}
.article-desc {
  color: #555;
  font-size: 15px;
  line-height: 1.6; /* Improve readability */
}
.user-sidebar {
  flex: 0.8;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sidebar-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  padding: 24px 20px;
}
.sidebar-title {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}
.sidebar-item {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}

/* Loading and Error States */
.loading-state,
.error-state,
.no-articles,
.no-user-data {
  text-align: center;
  color: #888;
  padding: 40px 0;
  font-size: 16px;
}

/* Ensure tabs content area has some padding */
:deep(.el-tabs__content) {
    padding: 16px;
}

</style>