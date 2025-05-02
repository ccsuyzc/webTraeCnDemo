<template>
  <div class="home-page">
    <div class="main-content">
      <div class="layout-body">
        <NavBar />
      </div>
      <div class="recommend">
        <h2>{{ articleStore.currentTag }}</h2>
        <div v-if="articleStore.isLoading" class="loading-state">加载中...</div>
        <div v-else-if="articleStore.error" class="error-state">{{ articleStore.error }}</div>
        <div v-else class="article-list">
          <el-card class="article-item" v-for="article in articleStore.articles" :key="article.ID" shadow="hover" @click="goToArticleDetail(article.ID)">
            <div class="article-title">{{ article.Title }}</div>
            <div class="article-meta">{{ article.UserName }} · {{ article.Description }} · {{ article.ViewCount }}阅读</div>
            <div class="article-desc">
              {{ article.desc }}
            </div>
          </el-card>
          <div v-if="!articleStore.articles.length && !articleStore.isLoading" class="empty-state">
            暂无文章
          </div>
        </div>
      </div>
      <div class="sidebar">
        <el-card class="greeting-card">
          <div class="greeting">{{ greeting }}！</div>
          <div class="date-info">今天是 {{ currentDate }}</div>
        </el-card>
        <el-card class="rank-list-card">
          <div class="rank-list">
            <h3>热门文章榜</h3>
            <ol>
              <li v-for="(rankArticle, index) in rankedArticles" :key="rankArticle.id" @click="goToArticleDetail(rankArticle.id)">
                <span class="rank-index">{{ index + 1 }}</span>
                <span class="rank-title">{{ rankArticle.title }}</span>
              </li>
            </ol>
          </div>
        </el-card>
        <el-card class="ad-card">
          <div class="ad-placeholder">广告位</div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import { useArticleStore } from '../store/articleStore'; // 导入 article store
import { onMounted, computed, ref } from 'vue'; // 导入 computed 和 ref
import { useRouter } from 'vue-router'; // 导入 useRouter

const articleStore = useArticleStore(); // 获取 store 实例
const router = useRouter(); // 获取 router 实例

// --- 动态问候语和日期 --- 
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return '上午好';
  } else if (hour < 18) {
    return '下午好';
  } else {
    return '晚上好';
  }
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekDay = weekDays[today.getDay()];
  return `${year}年${month}月${day}日 ${weekDay}`;
};

const greeting = computed(getGreeting);
const currentDate = computed(getCurrentDate);

// --- 热门文章榜 (示例数据) ---
// 在实际应用中，这部分数据应该从 API 获取
const rankedArticles = ref([
  { id: 101, title: '深入理解 Vue 3 Composition API' },
  { id: 102, title: 'Node.js 性能优化实战' },
  { id: 103, title: 'React Hooks 完全指南' },
  { id: 104, title: '现代 CSS 布局技巧' },
  { id: 105, title: '微服务架构设计模式' },
]);

// 组件挂载时加载默认的推荐文章
onMounted(() => {
  // if (articleStore.articles.length === 0) { // 避免重复加载
  //   articleStore.loadArticlesByTag('推荐'); // This line is removed as NavBar now handles initial load
  // }
  // 如果需要，可以在这里加载热门文章榜数据
  // articleStore.loadRankedArticles(); 
});

// 跳转到文章详情页
const goToArticleDetail = (id) => {
  // 确保 id 是有效的，避免跳转到 undefined 或 null 的路由
  if (id !== null && id !== undefined) {
     router.push(`/article/${id}`);
  } else {
    console.warn('Attempted to navigate with invalid article ID:', id);
  }
};
</script>

<style scoped>
.layout-body {
  display: flex;
  flex-direction: row;
  /* margin-top: 64px; */
  /* margin-top: 64px; */
  justify-content: flex-start;
  max-width: 1300px;
  margin-left: auto;
  margin-right: auto;
  gap: 36px;
}
@media (max-width: 900px) {
  .layout-body {
    flex-direction: column;
  }
}
.home-page {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 32px 0;
}
.main-content {
  display: flex;
  justify-content: flex-start;
  gap: 36px;
  max-width: 1300px;
  margin: 0 auto;
  background: none;
}
.recommend {
  flex: 1.7;
  background: none;
  padding: 0;
  margin-top: 60px;
  box-shadow: none;
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
  transition: box-shadow 0.2s;
  background: #fff;
  cursor: pointer; /* 添加鼠标指针样式 */
}
.article-item:hover {
  box-shadow: 0 4px 16px 0 #e0e3e7;
}
.article-title {
  font-size: 19px;
  font-weight: bold;
  color: #222;
}
.article-meta {
  font-size: 13px;
  color: #888;
  margin: 6px 0;
}
.article-desc {
  color: #555;
  font-size: 15px;
}
.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: none;
  padding: 0;
  box-shadow: none;
  margin-top: 60px;
}
.greeting-card {
  padding: 18px 20px; /* 调整内边距 */
  background: #fff; /* 改为白色背景 */
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  border: 1px solid #e8e8e8; /* 添加细边框 */
}
.greeting {
  font-size: 18px;
  color: #333; /* 调整颜色 */
  font-weight: bold;
  /* padding: 18px 0 18px 8px; */
  margin-bottom: 6px; /* 增加与日期的间距 */
}
.date-info {
  font-size: 14px;
  color: #888;
}
.rank-list-card {
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  background: #fff; /* 改为白色背景 */
  border: 1px solid #e8e8e8; /* 添加细边框 */
}
.rank-list {
  padding: 16px 20px; /* 调整内边距 */
}
.rank-list h3 {
  font-size: 16px;
  margin-bottom: 12px; /* 增加标题和列表间距 */
  color: #333;
  font-weight: bold;
}
.rank-list ol {
  padding-left: 0; /* 移除默认的 padding */
  list-style: none; /* 移除默认的列表标记 */
}
.rank-list li {
  font-size: 15px;
  color: #333;
  margin-bottom: 10px; /* 增加列表项间距 */
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.rank-list li:hover .rank-title {
  color: #1e80ff; /* 鼠标悬停时标题变蓝 */
}
.rank-index {
  display: inline-block;
  width: 20px; /* 固定宽度 */
  text-align: center;
  font-weight: bold;
  color: #999;
  margin-right: 10px;
}
/* 为前三名添加特殊样式 */
.rank-list li:nth-child(1) .rank-index,
.rank-list li:nth-child(2) .rank-index,
.rank-list li:nth-child(3) .rank-index {
  color: #ff6f0f; /* 橙色 */
}
.rank-title {
  flex: 1; /* 占据剩余空间 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}
.ad-card {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  border: 1px solid #e8e8e8; /* 添加细边框 */
}
.ad-placeholder {
  color: #bbb;
  font-size: 15px;
}
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  color: #999;
  margin-top: 40px;
  font-size: 16px;
}
</style>