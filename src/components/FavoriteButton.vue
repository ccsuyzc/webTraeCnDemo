<template>
  <el-button :type="isFavorited ? 'primary' : 'default'" :icon="isFavorited ? StarFilled : Star" @click="toggleFavorite" :loading="isLoading">
    {{ isFavorited ? '已收藏' : '收藏' }}
  </el-button>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import { Star, StarFilled } from '@element-plus/icons-vue';
import { checkFavoriteStatus, favoriteArticle, unfavoriteArticle } from '@/api/collection';
import { useAuthStore } from '@/store/authStore';

const props = defineProps({
  articleId: {
    type: [Number, String],
    required: true,
  },
});

const authStore = useAuthStore();
const userId = ref(authStore.user?.ID);

const isFavorited = ref(false);
const isLoading = ref(false);

async function fetchFavoriteStatus() {
  if (!userId.value || !props.articleId) return;
  isLoading.value = true;
  try {
    const response = await checkFavoriteStatus(userId.value, props.articleId);
    if (response.data && typeof response.data.is_favorite === 'boolean') {
      isFavorited.value = response.data.is_favorite;
    } else {
      // 接口可能返回非预期的格式，或者收藏状态未知，默认未收藏
      isFavorited.value = false;
      console.warn('检查收藏状态API响应格式不正确:', response.data);
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    // ElMessage.error('检查收藏状态失败'); // 避免过多提示打扰用户
    isFavorited.value = false; // 出错时默认为未收藏
  } finally {
    isLoading.value = false;
  }
}

async function toggleFavorite() {
  if (!userId.value || !props.articleId) {
    ElMessage.warning('请先登录后再操作');
    return;
  }
  isLoading.value = true;
  try {
    if (isFavorited.value) {
      await unfavoriteArticle(userId.value, props.articleId);
      isFavorited.value = false;
      ElMessage.success('已取消收藏');
    } else {
      await favoriteArticle(userId.value, props.articleId);
      isFavorited.value = true;
      ElMessage.success('收藏成功');
    }
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  } finally {
    isLoading.value = false;
  }
}

// 监听 articleId 或 userId 的变化，重新获取收藏状态
watch(() => [props.articleId, userId.value], () => {
  fetchFavoriteStatus();
}, { immediate: true });

// 组件挂载时，如果用户信息后续才加载完成，也需要重新获取状态
onMounted(() => {
  // 如果初始userId为空，可能是authStore还未初始化完毕
  if (!userId.value && authStore.user?.ID) {
      userId.value = authStore.user.ID;
      fetchFavoriteStatus(); // 用户信息加载后再次尝试获取
  }
});

</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>