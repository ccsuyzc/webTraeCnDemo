
<template>
  <div class="yzc">
    <!-- 选择控制 (Removed) -->
    <!-- <selection-control
      v-model:select-all="selectAll" 
      :is-indeterminate="isIndeterminate"
      :total="videos.length" 
      @change="handleSelectAllChange"
    /> -->

    <!-- 视频列表 -->
    <div class="video-grid">
      <video-card
        v-for="video in paginatedVideos" 
        :key="video.id"
        :video="video"
      />
    </div>

    <!-- 分页器 -->
    <div class="div-pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-model:current-page="currentPage" 
        :page-sizes="[10, 20, 50, 100]" 
        v-model:page-size="pageSize" 
        layout="total, sizes, prev, pager, next, jumper"
        :total="videos.length" 
      >
      </el-pagination>
    </div>

    <!-- 底部工具栏 (Removed) -->
    <!-- <bottom-toolbar
      :selected-count="selectedCount"
      @clear-selection="clearSelection"
      @download-selected="downloadSelected"
    /> -->
  </div>
</template>
    
    <script setup>
import { ref, computed, watch } from 'vue';
import VideoCard from "./DeliverySonComponents/VideoCard.vue";
// import SelectionControl from "./DeliverySonComponents/SelectionControl.vue"; (Removed)
// import BottomToolbar from "./DeliverySonComponents/BottomToolbar.vue"; (Removed)

// --- Props and Emits ---
const props = defineProps({
  // Accept videos data as a prop instead of using Vuex
  videos: {
    type: Array,
    required: true,
    default: () => []
  }
});

// const emit = defineEmits(['update:videos', 'download-single', 'download-selected']); (Removed download emits)
const emit = defineEmits(['update:videos']);

// --- State ---
// const selectAll = ref(false); // 全选状态 (Removed)
// const isIndeterminate = ref(false); // 部分选中状态 (Removed)
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示数量

// --- Computed Properties ---

// Make videos reactive locally if needed, or work directly with props if parent manages state
// For simplicity here, we assume internal management based on prop, emitting updates
// const internalVideos = ref(props.videos.map(v => ({ ...v, IsSelect: v.IsSelect ?? false }))); (Removed IsSelect)
const internalVideos = ref(props.videos.map(v => ({ ...v })));

watch(() => props.videos, (newVal) => {
  // internalVideos.value = newVal.map(v => ({ ...v, IsSelect: v.IsSelect ?? false })); (Removed IsSelect)
  internalVideos.value = newVal.map(v => ({ ...v }));
  // updateSelectAllState(); // Update selection state when props change (Removed)
}, { deep: true });


/**
 * 计算选中的视频数量 (Removed)
 */
// const selectedCount = computed(() => {
//   return internalVideos.value.filter((v) => v.IsSelect).length;
// });

/**
 * 计算当前页显示的视频
 */
const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return internalVideos.value.slice(start, end);
});

// --- Methods ---

/**
 * 处理视频选择事件 (Removed)
 */
// const handleVideoSelect = (updatedVideo) => {
//   console.log("要修改的数据", updatedVideo);
//   const index = internalVideos.value.findIndex(v => v.id === updatedVideo.id);
//   if (index !== -1) {
//     internalVideos.value[index].IsSelect = updatedVideo.IsSelect;
//     // Emit event to notify parent about the change if needed
//     // emit('update:videos', internalVideos.value); 
//   }
//   updateSelectAllState();
// };

/**
 * 更新全选状态函数 (Removed)
 */
// const updateSelectAllState = () => {
//   const total = internalVideos.value.length;
//   const selected = selectedCount.value;
//   if (total === 0) {
//       selectAll.value = false;
//       isIndeterminate.value = false;
//   } else {
//       selectAll.value = selected === total;
//       isIndeterminate.value = selected > 0 && selected < total;
//   }
// };

/**
 * 全选状态变化处理函数 (Removed)
 */
// const handleSelectAllChange = (val) => {
//   selectAll.value = val; // Update local state first
//   internalVideos.value.forEach((video) => {
//     video.IsSelect = val;
//   });
//   isIndeterminate.value = false; // Reset indeterminate state
//   // emit('update:videos', internalVideos.value); // Notify parent if needed
// };

// 下载选中的视频 (Removed)
// const downloadSelected = () => {
//   const selectedVideosToDownload = internalVideos.value.filter(v => v.IsSelect);
//   console.log("下载选中", selectedVideosToDownload);
//   emit('download-selected', selectedVideosToDownload);
// };

// 清除全选 (Removed)
// const clearSelection = () => {
//   internalVideos.value.forEach((video) => {
//     video.IsSelect = false;
//   });
//   selectAll.value = false;
//   isIndeterminate.value = false;
//   // emit('update:videos', internalVideos.value); // Notify parent if needed
// };

// 下载单个视频 (Removed)
// const downloadSingle = (video) => {
//   console.log("下载单个视频", video);
//   emit('download-single', video);
// };

// 分页大小改变
const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`);
  pageSize.value = val;
  currentPage.value = 1; // Reset to first page when size changes
};

// 当前页改变
const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`);
  currentPage.value = val;
};

// Watchers (if needed, e.g., for debugging or complex interactions)
// watch(selectedCount, (newVal) => {
//   console.log('Selected count changed:', newVal);
//   updateSelectAllState();
// });

// Initial state update (Removed)
// updateSelectAllState();

</script>
    
    <style scoped>
/* 全局样式 */
/* body removed as it's likely handled globally */

.yzc {
  /* max-width: 1100px; */
  min-width: none;
  /* margin: 0 auto; */
  padding: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 响应式列 */
  gap: 20px; /* 卡片间距 */
  margin-bottom: 20px; /* 与分页器的间距 */
}

.div-pagination {
  display: flex;
  justify-content: center; /* 分页器居中 */
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr; /* 移动端单列 */
  }
  .yzc {
    padding: 10px;
  }
}
</style>