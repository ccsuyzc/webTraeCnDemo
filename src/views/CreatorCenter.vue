<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function navigateToEditor() {
  router.push('/editor');
}

function navigateToMyArticles() {
  // 假设用户id从本地存储或store获取
  const userId = localStorage.getItem('userId') || '1'; // Consider using authStore for userId
  router.push({ path: `/my-articles/${userId}` }); // Updated path
}

function navigateToStats() {
  const userId = localStorage.getItem('userId') || '1';
  router.push({ path: `/stats/${userId}` });
}

</script>
<template>
  <div class="creator-center">
    <el-card class="main-card">
      <h2>创作中心</h2>
      <div class="function-list">
        <el-card class="function-item" shadow="hover" @click="navigateToEditor">
          <div class="function-title">新建文章</div>
          <div class="function-desc">开始撰写新的博客文章</div>
        </el-card>

        <el-card class="function-item" shadow="hover" @click="navigateToMyArticles">
          <div class="function-title">我的文章</div>
          <div class="function-desc">查看和管理已发布的文章</div>
        </el-card>

        <el-card class="function-item" shadow="hover" @click="navigateToStats">
          <div class="function-title">数据统计</div>
          <div class="function-desc">查看文章阅读量、点赞量等数据</div>
        </el-card>
      </div>
    </el-card>

    <!-- 编辑器已移至 Editor.vue -->
  </div>
</template>

<style scoped>
.creator-center {
  padding: 32px;
  max-width: 1200px;
  margin: 64px auto 0;
}
.main-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  padding: 24px;
}
.function-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 24px;
}
.function-item {
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}
.function-item:hover {
  transform: translateY(-2px);
}
.function-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e80ff;
}
.function-desc {
  color: #666;
  font-size: 14px;
  margin-top: 8px;
}
</style>