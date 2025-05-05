<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElTabs, ElTabPane, ElButton, ElTag, ElMessage, ElMessageBox } from 'element-plus'; // 导入 ElMessageBox
import { fetchUserDetails, fetchUserArticles, checkMutualFollow, followUserApi, unfollowUserApi } from '../api/users'; // 导入新的 API 函数
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
const followStatus = ref(0); // 0: 未知/未关注, 1: 互相关注, 2: A关注B, 3: B关注A
const isProcessingFollow = ref(false); // 防止重复点击

// 获取当前登录用户的ID
const currentUserId = computed(() => authStore.user.ID);
// 获取当前查看的用户页面的ID
const viewedUserId = computed(() => parseInt(route.params.id));

// 判断当前查看的是否是登录用户自己的页面
const isOwnProfile = computed(() => currentUserId.value === viewedUserId.value);

// 根据 followStatus 计算关注按钮文本
const followButtonText = computed(() => {
  if (isOwnProfile.value) return '编辑资料'; // 自己的主页显示编辑资料
  switch (followStatus.value) {
    case 1: // 互相关注
    case 2: // A关注B (当前用户关注了对方)
      return '已关注';
    case 3: // B关注A (对方关注了你，但你没关注)
    case 0: // 无关注关系
    default:
      return '关注';
  }
});

// 根据 followStatus 计算是否已关注对方
const isFollowing = computed(() => followStatus.value === 1 || followStatus.value === 2);

onMounted(async () => {
  const userId = route.params.id;
  if (!userId) {
    error.value = '未找到用户 ID。';
    isLoading.value = false;
    ElMessage.error('无法加载用户信息，缺少用户ID');
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    // 并行获取用户详情和文章列表
    const fetchPromises = [
      fetchUserDetails(userId),
      fetchUserArticles(userId)
    ];

    // 如果不是自己的主页，并且已登录，则检查关注状态
    if (!isOwnProfile.value && currentUserId.value) {
      fetchPromises.push(checkMutualFollow(currentUserId.value, viewedUserId.value));
    }

    const [userDetailsResponse, userArticlesResponse, mutualFollowStatus] = await Promise.all(fetchPromises);

    // 处理用户详情
    if (userDetailsResponse) {
      user.value = userDetailsResponse;
      if (user.value.CreatedAt) {
        user.value.joinDate = dayjs(user.value.CreatedAt).format('YYYY-MM-DD');
      }
    } else {
      throw new Error('获取用户信息失败');
    }

    // 处理文章列表
    articles.value = userArticlesResponse.map(article => ({
      id: article.ID,
      title: article.Title,
      meta: `${dayjs(article.CreatedAt).format('YYYY-MM-DD')} · ${article.ViewCount || 0}阅读 · ${article.LikeCount || 0}赞`,
      desc: article.Description || '暂无描述'
    }));

    // 处理关注状态 (仅当请求发送并返回时)
    if (mutualFollowStatus !== undefined) {
      followStatus.value = mutualFollowStatus.code;
      console.log('关注状态:', mutualFollowStatus);
    }

  } catch (err) {
    console.error('Failed to fetch user data or follow status:', err);
    error.value = err.message || '加载用户信息、文章或关注状态失败，请稍后再试。';
    ElMessage.error(error.value);
  } finally {
    isLoading.value = false;
  }
});

function goToArticle(id) {
  router.push(`/article/${id}`);
}

function goToSettings() {
  if (isOwnProfile.value) {
    router.push('/settings');
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

  // 新增：检查互关状态
  if (followStatus.value !== 1) { // 1 代表互相关注
    ElMessage.warning('双方互相关注后才能发送私信。');
    return;
  }

  // 只有互相关注才能跳转
  router.push(`/chat?userId=${viewedUserId.value}`); // 修改路由传递方式，使用 query 参数
}

// 处理关注/取消关注操作
async function handleFollowAction() {
  if (isProcessingFollow.value) return; // 防止重复提交
  if (!currentUserId.value) {
    ElMessage.warning('请先登录');
    return;
  }
  if (isOwnProfile.value) {
    // 如果是自己的主页，按钮功能是编辑资料
    goToSettings();
    return;
  }

  isProcessingFollow.value = true;
  try {
    if (isFollowing.value) {
      // --- 取消关注 ---
      await ElMessageBox.confirm('确定要取消关注该用户吗？', '取消关注', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      // 用户确认取消
      const response = await unfollowUserApi(currentUserId.value, viewedUserId.value);
      if (response.code === 0) { // 假设后端成功返回 code 0
        ElMessage.success('已取消关注');
        // 更新关注状态，需要重新检查或根据后端逻辑推断
        // 简单处理：认为取消后变为“无关注”或“B关注A”
        followStatus.value = followStatus.value === 1 ? 3 : 0;
        // 如果有关注者数量，也需要更新 user.value.followerCount--
      } else {
        ElMessage.error(response.message || '取消关注失败');
      }
    } else {
      // --- 关注 ---
      const response = await followUserApi(currentUserId.value, viewedUserId.value);
      if (response.code == 200) { // 假设后端成功返回 code 0
        ElMessage.success('关注成功');
        // 更新关注状态，需要重新检查或根据后端逻辑推断
        // 简单处理：认为关注后变为“A关注B”或“互相关注”
        followStatus.value = followStatus.value === 3 ? 1 : 2;
        // 如果有关注者数量，也需要更新 user.value.followerCount++
      } else {
        ElMessage.error(response.message || '关注失败');
      }
    }
  } catch (error) {
    // ElMessageBox 的取消操作会抛出 'cancel' 字符串，需要捕获但不提示错误
    if (error !== 'cancel') {
        console.error('Follow/Unfollow action failed:', error);
        const errorMsg = error?.message || (isFollowing.value ? '取消关注失败' : '关注失败');
        ElMessage.error(errorMsg);
    }
  } finally {
    isProcessingFollow.value = false;
  }
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
            <img class="avatar" :src="user.AvatarURL || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" alt="avatar" />
            <div class="user-basic">
              <div class="user-name">{{ user.Username }} <el-tag v-if="user.isVerified" size="small" type="info">认证</el-tag></div>
              <div class="user-desc">{{ user.PersonalIntroduction || '暂无个人简介' }}</div>
              <div class="user-links">
                <!-- 根据是否是自己的主页显示不同按钮 -->
                <!-- 修改按钮点击事件为 handleFollowAction -->
                <el-button
                  v-if="!isOwnProfile"
                  size="small"
                  :type="isFollowing ? 'default' : 'primary'" 
                  :plain="isFollowing" 
                  @click="handleFollowAction"
                  :loading="isProcessingFollow"
                >
                  {{ followButtonText }}
                </el-button>
                <el-button v-if="!isOwnProfile" size="small" @click="goToChat">私信</el-button>
                <el-button v-if="isOwnProfile" size="small" @click="goToSettings">编辑资料</el-button>
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
              <div class="follow-num">{{ user.NumberOfFans || 0 }}</div>
              <div class="follow-label">关注了</div>
            </div>
            <div class="follow-item">
              <!-- 动态关注者数 -->
              <div class="follow-num">{{ user.NumberOfFollow || 0 }}</div>
              <div class="follow-label">粉丝数</div>
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
            <el-tab-pane label="收藏" name="column">收藏文章 (待开发)</el-tab-pane>
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