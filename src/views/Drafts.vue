<template>
  <div class="drafts-page">
    <el-card class="drafts-card">
      <h2>我的草稿</h2>
      <el-table :data="drafts" style="width: 100%">
        <el-table-column prop="title" label="标题" width="300" />
        <el-table-column prop="updatedAt" label="最后修改时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="editDraft(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 假设有api/drafts.js用于请求草稿数据
// import { fetchDraftsByUser } from '../api/drafts';

const route = useRoute();
const router = useRouter();
const userId = route.params.userId;
const drafts = ref([]);

onMounted(async () => {
  // 这里应调用后端API获取草稿列表
  // drafts.value = await fetchDraftsByUser(userId);
  drafts.value = [
    { id: 1, title: '草稿一', updatedAt: '2024-06-01 12:00' },
    { id: 2, title: '草稿二', updatedAt: '2024-06-02 15:30' }
  ];
});

function editDraft(draft) {
  router.push({ path: '/editor', query: { id: draft.id } });
}
</script>

<style scoped>
.drafts-page {
  padding: 32px;
  max-width: 900px;
  margin: 64px auto 0;
}
.drafts-card {
  border-radius: 12px;
  padding: 24px;
}
</style>