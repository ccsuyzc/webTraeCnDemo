<template>
  <div
    class="video-card"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleCardClick" 
  >
    <el-popover
      class="box-item"
      placement="bottom-start"
      :width="210"
      trigger="hover"
    >
      <template #reference>
        <!-- 视频容器 -->
        <div class="video-thumbnail-container">
          <img :src="video.imgSrc" class="video-thumbnail" />
          <video ref="videoPlayer" class="video-player" loop muted>
            <source :src="video.VideoSrc" type="video/mp4" />
          </video>
          <!-- 视频时长 (示例位置，可调整) -->
          <div class="video-duration">{{ video.duration }}</div>

          <!-- 按钮组 (Removed) -->
          <!-- <div class="video-actions">
            <div class="left-actions">
              <el-checkbox
                :model-value="video.IsSelect" 
                @change="handleCheckboxChange"
              />
            </div>
            <div class="right-actions">
              <el-button
                class="action-btn"
                size="small" 
                @click.stop="handleDownload"
                icon="el-icon-download" 
              />
            </div>
          </div> -->

          <!-- 移除旧的覆盖层 -->
          <!-- <div class="video-info-overlay">
          </div> -->
        </div>
      </template>
      <!-- Assuming CardDetails is already Vue 3 compatible or will be refactored -->
      <!-- If CardDetails is not available/compatible, remove or replace it -->
      <!-- <CardDetails :cardData="video"></CardDetails> -->
      <!-- <div>卡片详情占位符</div>  -->
    </el-popover>
    <!-- 卡片下方的文字信息区域 -->
    <div class="video-card-content">
      <h3 class="video-title" :title="video.title">{{ video.title }}</h3>
      <div class="video-meta">
        <span class="author-info">
          <!-- 使用 Element Plus 图标 -->
          <el-icon><User /></el-icon> {{ video.author }}
        </span>
        <span class="publish-date">{{ video.publishDate }}</span>
      </div>
      <div class="video-stats">
        <span><el-icon><VideoPlay /></el-icon> {{ formatViews(video.views) }}</span>
        <span><el-icon><ChatLineRound /></el-icon> {{ formatComments(video.comments) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import { ElPopover, ElIcon } from 'element-plus'; // Removed ElCheckbox, ElButton
import { User, VideoPlay, ChatLineRound } from '@element-plus/icons-vue'; // 引入所需图标
// Assuming CardDetails is not needed for this refactor or will be handled separately
// import CardDetails from "@/components/ContainerCenter/TikTok/Card/CardDetails/CardDetails.vue";

const props = defineProps({
  video: {
    type: Object,
    required: true,
    // Ensure video object has an 'id' property
    // validator: (value) => value && value.id !== undefined
  },
});

const router = useRouter(); // Get router instance

// const emit = defineEmits(['select-change', 'download']); (Removed emits)

const videoPlayer = ref(null);

const handleMouseEnter = () => {
  // if (!props.video.IsSelect && videoPlayer.value) { (Removed IsSelect check)
  if (videoPlayer.value) {
    videoPlayer.value.play();
  }
};

const handleMouseLeave = () => {
  // if (!props.video.IsSelect && videoPlayer.value) { (Removed IsSelect check)
  if (videoPlayer.value) {
    const player = videoPlayer.value;
    player.pause();
    player.currentTime = 0;
  }
};

// Function to handle card click and navigate
const handleCardClick = () => {
  // Assuming video object has an 'id'. Adjust if needed.
  if (props.video && props.video.id) {
    router.push({ name: 'VideoPlayer', params: { id: props.video.id } });
  } else {
    console.error('Video ID is missing, cannot navigate.');
    // Optionally navigate to a default or error page
  }
};

// 处理复选框的选中状态 (Removed)
// const handleCheckboxChange = (value) => {
//   console.log("点击了复选框", value);
//   // Emit an event with the video data and the new selection state
//   emit('select-change', { ...props.video, IsSelect: value });
// };

// (Removed handleDownload)
// const handleDownload = () => {
//   emit('download', props.video);
// };

// 格式化播放量
const formatViews = (views) => {
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + '万';
  }
  return views;
};

// 格式化评论数
const formatComments = (comments) => {
  if (comments >= 10000) {
    return (comments / 10000).toFixed(1) + '万';
  }
  return comments;
};

</script>
  
  <style scoped>
.video-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.video-thumbnail-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
}

.video-card:hover .video-thumbnail {
  opacity: 0;
}

.video-card:hover .video-player {
  display: block;
  animation: fadeIn 0.3s ease;
}

/* Removed .video-actions styles */
/* .video-actions { ... } */
/* .left-actions { ... } */
/* .right-actions { ... } */
/* .action-btn { ... } */

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-card-content {
  padding: 12px;
}

.video-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  /* 多行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: calc(1.4em * 2); /* 适应两行的高度 */
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-info .el-icon {
  margin-right: 4px;
}

.video-stats {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.video-stats span {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.video-stats .el-icon {
  margin-right: 4px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>