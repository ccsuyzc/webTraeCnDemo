<template>
  <div class="my-articles-page">
    <el-card class="articles-card">
      <h2>我的文章</h2>
      <el-tabs v-model="activeTabName" @tab-click="handleClick">
        <el-tab-pane label="已发布" name="published">
          <el-table :data="publishedArticles" style="width: 100%">
            <el-table-column prop="Title" label="标题" width="200" />
            <el-table-column prop="Status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.Status)">{{ scope.row.Status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="Description" label="描述" width="250" show-overflow-tooltip />
            <el-table-column prop="PublishTime" label="发布时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.PublishTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="editArticle(scope.row)">修改</el-button>
                <el-button size="small" type="danger" @click="deleteArticle(scope.row, 'published')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="审核中" name="pending_review">
          <el-table :data="pendingReviewArticles" style="width: 100%">
            <el-table-column prop="Title" label="标题" width="200" />
            <el-table-column prop="Status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.Status)">{{ scope.row.Status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="Description" label="描述" width="250" show-overflow-tooltip />
            <el-table-column prop="SubmitTime" label="提交时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.SubmitTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="editArticle(scope.row)">修改</el-button>
                <el-button size="small" type="danger" @click="deleteArticle(scope.row, 'pending_review')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="被驳回" name="rejected">
          <el-table :data="rejectedArticles" style="width: 100%">
            <el-table-column prop="Title" label="标题" width="200" />
            <el-table-column prop="Status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.Status)">{{ scope.row.Status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="RejectReason" label="驳回理由" width="250" show-overflow-tooltip />
            <el-table-column prop="AuditTime" label="审核时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.AuditTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="editArticle(scope.row)">修改</el-button>
                <el-button size="small" type="danger" @click="deleteArticle(scope.row, 'rejected')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElTabs, ElTabPane, ElTable, ElTableColumn, ElTag, ElButton, ElMessage, ElMessageBox } from 'element-plus';
import { fetchUserArticlesByStatus } from '@/api/mya'; // 引入新的API函数
import { useAuthStore } from '@/store/authStore'; // 引入Auth Store
import dayjs from 'dayjs'; // 引入 dayjs 用于日期格式化

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const publishedArticles = ref([]);
const pendingReviewArticles = ref([]);
const rejectedArticles = ref([]);
const activeTabName = ref('published');
const isLoading = ref(true);

// 假设用户ID从AuthStore获取，如果MyArticles是当前登录用户的文章列表
// 如果是从路由参数获取，则使用 route.params.userId
const userId = ref(authStore.user?.ID); // 使用可选链确保user存在

onMounted(async () => {
  if (!userId.value) {
    // 如果路由中有userId，则优先使用路由中的userId，例如查看他人文章列表的场景
    if (route.params.userId) {
        userId.value = route.params.userId;
    } else {
        ElMessage.error('用户ID未找到，无法加载文章列表');
        isLoading.value = false;
        return;
    }
  }
  await loadArticles();
});

async function loadArticles() {
  isLoading.value = true;
  try {
    const response = await fetchUserArticlesByStatus(userId.value);
    if (response.data.success ) {
      publishedArticles.value = response.data.data.published || [];
      pendingReviewArticles.value = response.data.data.pending_review || [];
      rejectedArticles.value = response.data.data.rejected || [];
    } else {
      ElMessage.error(response.message || '获取文章列表失败');
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    ElMessage.error('获取文章列表失败，请检查网络或联系管理员');
  } finally {
    isLoading.value = false;
  }
}

function getStatusType(status) {
  if (status === 'published') return 'success';
  if (status === 'pending' || status === 'pending_review') return 'warning'; // API返回的是pending_review，但通常状态可能是pending
  if (status === 'rejected') return 'danger';
  if (status === 'draft') return 'info';
  return '';
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr || dateTimeStr === '0001-01-01T00:00:00Z') return 'N/A';
  return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm:ss');
}

function editArticle(article) {
  router.push({ path: `/editor/${article.ID}` });
}

async function deleteArticle(article, type) {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章《${article.Title}》吗？此操作不可撤销。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    // 在实际应用中，这里会调用API删除文章
    // await deleteArticleById(article.ID); // 假设有这个API
    ElMessage.success('文章删除成功（模拟）');
    // 从对应列表中移除
    if (type === 'published') {
      publishedArticles.value = publishedArticles.value.filter(a => a.ID !== article.ID);
    } else if (type === 'pending_review') {
      pendingReviewArticles.value = pendingReviewArticles.value.filter(a => a.ID !== article.ID);
    } else if (type === 'rejected') {
      rejectedArticles.value = rejectedArticles.value.filter(a => a.ID !== article.ID);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error);
      ElMessage.error('文章删除失败（模拟）');
    }
  }
}

function handleClick(tab, event) {
  // console.log(tab, event);
  // 如果需要，可以在标签页切换时执行操作，例如重新加载数据
}

</script>

<style scoped>
.my-articles-page {
  padding: 32px;
  max-width: 1200px;
  margin: 64px auto 0;
}
.articles-card {
  border-radius: 12px;
  padding: 24px;
}

.el-table .el-button + .el-button {
  margin-left: 8px;
}
</style>