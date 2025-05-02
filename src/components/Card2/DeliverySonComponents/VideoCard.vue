<template>
  <div
    class="video-card"
    :class="{ selected: video.IsSelect }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
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
          <!-- 按钮组 -->
          <div class="video-actions">
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
          </div>

          <div class="video-info-overlay">
            <!-- 这里添加你的视频信息内容 -->
          </div>
        </div>
      </template>
      <!-- Assuming CardDetails is already Vue 3 compatible or will be refactored -->
      <!-- If CardDetails is not available/compatible, remove or replace it -->
      <!-- <CardDetails :cardData="video"></CardDetails> -->
      <div>卡片详情占位符</div> 
    </el-popover>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
// Assuming CardDetails is not needed for this refactor or will be handled separately
// import CardDetails from "@/components/ContainerCenter/TikTok/Card/CardDetails/CardDetails.vue";

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['select-change', 'download']);

const videoPlayer = ref(null);

const handleMouseEnter = () => {
  if (!props.video.IsSelect && videoPlayer.value) {
    videoPlayer.value.play();
  }
};

const handleMouseLeave = () => {
  if (!props.video.IsSelect && videoPlayer.value) {
    const player = videoPlayer.value;
    player.pause();
    player.currentTime = 0;
  }
};

// 处理复选框的选中状态
const handleCheckboxChange = (value) => {
  console.log("点击了复选框", value);
  // Emit an event with the video data and the new selection state
  emit('select-change', { ...props.video, IsSelect: value });
};

const handleDownload = () => {
  emit('download', props.video);
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

.video-actions {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.video-card.selected .video-actions,
.video-card:hover .video-actions {
  opacity: 1;
}

.left-actions {
  display: flex;
  align-items: center;
}

.right-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  /* Keep existing styles or update for Element Plus if needed */
  /* Example: Adjust padding/size if default Element Plus button looks different */
  margin-left: 8px;
}


.video-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 15px;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.video-card:hover .video-info-overlay {
  transform: translateY(0);
  opacity: 1;
}

.video-info-content {
  padding: 15px;
  background-color: #fff; /* Added background for content below thumbnail */
}

.video-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.video-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Adjust checkbox style if needed for Element Plus */
.el-checkbox {
  /* Custom styles if needed */
}

/* Adjust popover style if needed */
.el-popover {
  /* Custom styles if needed */
}

/* Remove deep selectors if not needed or update syntax */
/* Example: ::v-deep .el-checkbox__inner */
</style>