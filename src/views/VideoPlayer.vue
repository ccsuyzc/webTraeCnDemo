<template>
  <div class="video-player-page">
    <div class="main-content">
      <!-- Left Section: Video Player and Info -->
      <div class="video-section">
        <h1 class="video-title">{{ videoData.title }}</h1>
        <div class="video-meta-stats">
          <span>{{ videoData.views }} 观看</span>
          <span>{{ videoData.likes }} 点赞</span>
          <span>{{ videoData.publishDate }}</span>
        </div>
        <div class="player-container">
          <!-- Placeholder for video player -->
          <video controls :src="videoData.videoSrc" class="video-element"></video>
        </div>
        <div class="video-description">
          <p>{{ videoData.description }}</p>
        </div>
        <div class="comments-section">
          <h2>评论区</h2>
          <!-- Placeholder for comments -->
          <p>评论功能待实现...</p>
        </div>
      </div>

      <!-- Right Section: Author Info and Playlist -->
      <div class="sidebar-section">
        <div class="author-info-box">
          <img :src="authorData.avatar" alt="Author Avatar" class="author-avatar" />
          <h3>{{ authorData.name }}</h3>
          <button>+ 关注</button>
          <p>{{ authorData.bio }}</p>
        </div>
        <div class="playlist-box">
          <h3>视频选集 ({{ playlist.length }})</h3>
          <ul>
            <li v-for="item in playlist" :key="item.id" @click="playVideo(item.id)">
              {{ item.title }} - {{ item.duration }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// --- Placeholder Data (Replace with actual data fetching) ---
const videoData = ref({
  id: null,
  title: '【2025最新版】Vue3入门到精通, 零基础快速上手视频教程(已完结)',
  views: '12.5万',
  likes: '849',
  publishDate: '2025-01-10',
  videoSrc: '/path/to/your/video.mp4', // Replace with actual video source
  description: '这是一个示例视频描述。Vue 3 带来了许多新特性和改进...', 
});

const authorData = ref({
  avatar: '/path/to/avatar.png', // Replace with actual avatar path
  name: '土豆本体',
  bio: '分享知识，共同进步。',
});

const playlist = ref([
  { id: 1, title: '001_Vue3开篇', duration: '05:13' },
  { id: 2, title: '002_Vue3简介', duration: '02:43' },
  { id: 3, title: '003_创建Vue3工程', duration: '17:01' },
  // ... add more playlist items
]);
// --- End Placeholder Data ---

onMounted(() => {
  const videoId = route.params.id;
  videoData.value.id = videoId;
  // TODO: Fetch actual video data based on videoId
  console.log('Loading video with ID:', videoId);
  // fetchVideoDetails(videoId);
  // fetchAuthorDetails(videoId); // Or based on video data
  // fetchPlaylist(videoId); // Or based on video data
});

const playVideo = (videoId) => {
  console.log('Switching to video:', videoId);
  // Navigate to the new video's page or update the current player
  router.push({ name: 'VideoPlayer', params: { id: videoId } });
  // You might need to reload data or update the player source directly
  // fetchVideoDetails(videoId);
};

// Add methods for fetching data (fetchVideoDetails, fetchAuthorDetails, fetchPlaylist)

</script>

<style scoped>
.video-player-page {
  padding: 20px;
  background-color: #f4f4f4; /* Light background for the page */
}

.main-content {
  display: flex;
  max-width: 1200px; /* Limit content width */
  margin: 0 auto; /* Center content */
  gap: 20px; /* Space between left and right sections */
}

.video-section {
  flex: 3; /* Takes up more space */
  background-color: #fff; /* White background for video area */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.sidebar-section {
  flex: 1; /* Takes up less space */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.video-meta-stats {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.video-meta-stats span {
  margin-right: 15px;
}

.player-container {
  width: 100%;
  margin-bottom: 20px;
  background-color: #000; /* Black background for player */
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-description {
  margin-bottom: 20px;
  line-height: 1.6;
}

.comments-section h2 {
  margin-bottom: 15px;
}

.author-info-box, .playlist-box {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.author-info-box {
  text-align: center;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.author-info-box h3 {
  margin-bottom: 10px;
}

.author-info-box button {
  padding: 8px 15px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.author-info-box p {
  font-size: 14px;
  color: #666;
}

.playlist-box h3 {
  margin-bottom: 10px;
}

.playlist-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px; /* Limit playlist height */
  overflow-y: auto;
}

.playlist-box li {
  padding: 10px 5px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 14px;
}

.playlist-box li:hover {
  background-color: #f9f9f9;
}

.playlist-box li:last-child {
  border-bottom: none;
}

/* Responsive adjustments if needed */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  .video-section, .sidebar-section {
    flex: none;
    width: 100%;
  }
}
</style>