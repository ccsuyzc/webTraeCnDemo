<template>
  <div class="my-articles-page">
    <el-card class="articles-card">
      <h2>我的文章</h2>
      <el-table :data="articles" style="width: 100%">
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="250" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editArticle(scope.row)">修改</el-button>
            <el-button size="small" type="danger" @click="deleteArticle(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 假设有api/articles.js用于请求文章数据
// import { fetchArticlesByUser, deleteArticleById } from '@/api/articles'; // 引入API

const route = useRoute();
const router = useRouter();
const userId = route.params.userId;
const articles = ref([]);

onMounted(async () => {
  // 这里应调用后端API获取文章列表
  // try {
  //   articles.value = await fetchArticlesByUser(userId);
  // } catch (error) {
  //   console.error('获取文章列表失败:', error);
  //   // 可以添加用户提示，例如使用 Element Plus 的 Message 组件
  // }
  // 模拟数据
  articles.value = [
    { id: 1, title: '我的第一篇文章', status: '已发布', description: '这是我的第一篇博客文章，关于Vue 3的入门。', createdAt: '2024-05-01 10:00', ip: '192.168.1.1' },
    { id: 2, title: '深入理解Pinia', status: '审核中', description: '详细介绍了Pinia状态管理库的核心概念和用法。', createdAt: '2024-05-15 14:30', ip: '10.0.0.5' },
    { id: 3, title: 'Vue Router进阶', status: '已发布', description: '探讨Vue Router的动态路由、导航守卫等高级特性。', createdAt: '2024-06-01 09:20', ip: '172.16.0.10' },
  ];
});

function getStatusType(status) {
  if (status === '已发布') return 'success';
  if (status === '审核中') return 'warning';
  if (status === '草稿') return 'info';
  return '';
}

function editArticle(article) {
  router.push({ path: `/editor/${article.id}` }); // 跳转到编辑器页面，并带上文章ID
  console.log('编辑文章:', article);
}

async function deleteArticle(article) {
  // 在实际应用中，这里会调用API删除文章
  // try {
  //   await deleteArticleById(article.id);
  //   articles.value = articles.value.filter(a => a.id !== article.id); // 从列表中移除
  //   // Element Plus 提示删除成功
  //   ElMessage.success('文章删除成功');
  // } catch (error) {
  //   console.error('删除文章失败:', error);
  //   // Element Plus 提示删除失败
  //   ElMessage.error('文章删除失败');
  // }
  console.log('删除文章:', article);
  // 模拟删除
  articles.value = articles.value.filter(a => a.id !== article.id);
  // 在实际项目中，你可能需要引入 ElMessage
  // import { ElMessage } from 'element-plus';
  // ElMessage.success(`删除了文章: ${article.title}`);
}
</script>

<style scoped>
.my-articles-page {
  padding: 32px;
  max-width: 1200px; /* 增加了最大宽度以适应更多列 */
  margin: 64px auto 0;
}
.articles-card {
  border-radius: 12px;
  padding: 24px;
}

/* 可以添加更多自定义样式 */
.el-table .el-button + .el-button {
  margin-left: 8px;
}
</style>