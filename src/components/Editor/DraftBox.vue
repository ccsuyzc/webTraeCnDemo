<template>
  <div class="draft-box-container">
    <h3 class="draft-title"><span>草稿箱</span><el-button type="primary" @click="refreshDrafts">加载线上</el-button></h3>
    <!-- <el-scrollbar height="calc(100% - 48px)"> --> <!-- Approx title height + margin -->
    <!-- Remove height and custom class, let flexbox handle sizing -->
    <el-scrollbar>
      <div v-if="drafts.length === 0" class="empty-drafts">
        暂无草稿
      </div>
      <el-card v-for="draft in drafts" :key="draft.ID" class="draft-card" shadow="hover">
        <div class="draft-item">
          <span class="draft-item-title">{{ draft.Title }}</span>
          <div class="draft-actions">
            <el-button type="primary" link size="small" @click="loadDraft(draft.ID)">加载</el-button>
            <el-button type="danger" link size="small" @click="deleteDraft(draft.ID)">删除</el-button>
          </div>
        </div>
      </el-card>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // Import defineExpose
import { ElCard, ElButton, ElScrollbar, ElMessage } from 'element-plus'; // Import Element Plus components
import { fetchUserDrafts, fetchDraftDetail } from '@/api/articles'; // Import API functions

const drafts = ref([]);
const emit = defineEmits(['load-draft']); // Define emit function

// Function to load drafts, extracted for reusability
const loadDrafts = async () => {
  drafts.value = []; // Clear existing drafts before loading
  // 1. Load from local storage first
  try {
    const localDrafts = JSON.parse(localStorage.getItem('localDrafts') || '[]');
    // Add a flag to distinguish local drafts if needed, or rely on ID format
    drafts.value = localDrafts.map(d => ({ ...d, isLocal: true }));
    console.log('Loaded drafts from local storage:', drafts.value);
  } catch (error) {
    console.error('Failed to load drafts from local storage:', error);
    ElMessage.error('加载本地草稿失败');
  }

  // 2. Fetch from backend (Requires user ID)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.ID) {
    try {
      const backendDrafts = await fetchUserDrafts(userInfo.ID);
      console.log('Fetched drafts from backend:', backendDrafts);
      // Simple merge strategy: Add backend drafts if they don't exist locally (based on title/content perhaps? or a backend ID if available)
      // For now, let's just append backend drafts, assuming they have unique IDs from the backend
      // A more robust approach would involve proper merging/deduplication
      const backendDraftsWithFlag = backendDrafts.map(d => ({ ...d, isLocal: false, id: d.ID })); // Assuming backend returns ID field
      // Combine and potentially filter duplicates if backend drafts might also be in local storage
      // Filter local drafts that might have been synced/saved to backend (needs a proper sync mechanism)
      const combinedDrafts = [...drafts.value, ...backendDraftsWithFlag];
      // Basic deduplication based on ID (prefer backend version if IDs match)
      const uniqueDrafts = Array.from(new Map(combinedDrafts.map(d => [d.id || d.ID, d])).values());

      drafts.value = uniqueDrafts;
      // Simple sort by timestamp if available, otherwise keep order
      drafts.value.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    } catch (error) {
      // Error message is handled within fetchUserDrafts
      console.error('Failed to fetch drafts from backend:', error);
    }
  } else {
    console.warn('User info not found, cannot fetch backend drafts.');
  }
};

onMounted(async () => {
  // 如果浏览器已经有草稿，则不加载草稿
//  let i = localStorage.getItem('localDrafts')
//   if (!i) {
    await loadDrafts(); // Call the extracted function
  // }
});

const loadDraft = async (id) => { // Make async
    console.log(`获取改用户的草稿，该用户ID: ${id}`);
  try {
    let draftToLoad = drafts.value.find(d => d.id === id || d.ID === id); // Check both local 'id' and potential backend 'ID'

    if (!draftToLoad) {
       ElMessage.error('找不到指定的草稿');
       return;
    }

    // If it's a backend draft and we only have the list item (not full content yet)
    // Or if we decide to always fetch fresh details on load
    if (!draftToLoad.isLocal) { // Assuming backend drafts might need fetching details
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.ID) {
            // Assuming the id passed is the backend draft ID (d.ID)
            draftToLoad = await fetchDraftDetail(userInfo.ID, id);
            // Add necessary fields if backend response differs from local structure
            draftToLoad.id = draftToLoad.ID; // Ensure consistency
        } else {
            ElMessage.error('无法获取用户信息以加载草稿详情');
            return;
        }
    }

    // Emit the loaded draft data to the parent component
    emit('load-draft', draftToLoad);

    // Remove the loaded draft from the list *after* emitting
    // drafts.value = drafts.value.filter(d => (d.id || d.ID) !== id);
    // Instead of removing, just refresh the list to reflect potential changes
    await refreshDrafts();

  } catch (error) {
    console.error(`Failed to load draft ${id}:`, error);
    ElMessage.error('加载草稿失败');
  }
};


const deleteDraft = async (id) => { // Make async for potential backend call
    console.log(`Deleting draft with ID: ${id}`);
  const draftToDelete = drafts.value.find(d => d.id === id || d.ID === id);

  if (!draftToDelete) return;

  // 1. Remove from local ref first for immediate UI update
  drafts.value = drafts.value.filter(draft => (draft.ID || draft.ID) !== id);

  // 2. Remove from local storage if it was a local draft
  if (draftToDelete.isLocal || String(id).startsWith('local_')) {
      try {
          let localDrafts = JSON.parse(localStorage.getItem('localDrafts') || '[]');
          localDrafts = localDrafts.filter(d => d.id !== id);
          localStorage.setItem('localDrafts', JSON.stringify(localDrafts));
          ElMessage.success('本地草稿已删除');
      } catch (error) {
          console.error('Failed to delete draft from local storage:', error);
          ElMessage.error('删除本地草稿失败');
          // Optional: Add back to list if local deletion fails?
          await refreshDrafts(); // Refresh to potentially show it again
      }
  }

  // 3. TODO: Implement backend deletion call
  // if (!draftToDelete.isLocal) {
  //   try {
  //     await deleteDraftFromBackend(id); // Assuming id is the backend ID
  //     ElMessage.success('后端草稿已删除');
  //   } catch (error) {
  //     console.error('Failed to delete draft from backend:', error);
  //     ElMessage.error('删除后端草稿失败');
  //     // Optional: Add the draft back to the list if backend deletion fails?
  //     await refreshDrafts();
  //   }
  // }
  else {
      // Placeholder if it's a backend draft but deletion API isn't ready
      if (!draftToDelete.isLocal) {
          ElMessage.info('后端删除功能暂未实现');
      }
  }
};

// Method to refresh the drafts list
const refreshDrafts = async () => {
  console.log('Refreshing drafts list...');
  await loadDrafts(); // Re-run the loading logic
};

// Expose the refresh method to the parent component
defineExpose({
  refreshDrafts
});

</script>

<style scoped>
.draft-box-container {
  /* border-left: 1px solid #eee; */ /* Removed border, rely on parent's border */
  padding: 32px; /* Consistent padding with main content and AI assistant */
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff; /* Match sidebar background */
  box-sizing: border-box; /* Ensure padding is included in height */
}

.draft-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 16px 0; /* Keep margin */
  /* Padding is handled by container */
  font-size: 1.1em;
  font-weight: 600;
  color: #303133;
  flex-shrink: 0; /* Prevent title from shrinking */
}

/* Remove custom scrollbar class styles */
/* .draft-scrollbar {
   flex-grow: 1;
   overflow: auto;
 } */

.el-scrollbar {
  /* Scrollbar itself should not have padding, view inside might */
  flex-grow: 1; /* Allow scrollbar to fill remaining vertical space */
  /* Let el-scrollbar handle its own overflow */
}

.draft-card {
  margin-bottom: 12px;
}

.draft-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
}

.draft-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px; /* Add space between title and actions */
}

.draft-actions .el-button {
  padding: 0; /* Reduce button padding */
  margin-left: 8px;
}

.empty-drafts {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 0.9em;
}
</style>