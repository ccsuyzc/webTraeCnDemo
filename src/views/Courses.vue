<template>
  <div class="courses-page">
    <h1>课程中心</h1>
    <p>这里是课程内容。</p>
    <!-- 在这里添加课程列表或其他内容 -->
    <div class="course-list-container">
      <Card2 :videos="dummyCourses" @download-single="handleDownloadSingle" @download-selected="handleDownloadSelected" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Card2 from '@/components/Card2/index.vue'; // 引入重构后的 Card2 组件

// 创建虚拟课程数据
const dummyCourses = ref([
  {
    id: 1,
    imgSrc: 'https://via.placeholder.com/300x169/eee/999?text=Course+1+Thumb',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4', // 示例视频
    title: 'Vue 3 入门教程',
    description: '学习 Vue 3 的基础知识。'
  },
  {
    id: 2,
    imgSrc: 'https://via.placeholder.com/300x169/ddd/777?text=Course+2+Thumb',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'React 深度指南',
    description: '深入理解 React 核心概念。'
  },
  {
    id: 3,
    imgSrc: 'https://via.placeholder.com/300x169/ccc/555?text=Course+3+Thumb',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Node.js 后端开发',
    description: '使用 Node.js 构建高效后端服务。'
  },
  {
    id: 4,
    imgSrc: 'https://via.placeholder.com/300x169/bbb/333?text=Course+4+Thumb',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Element Plus 实战',
    description: '掌握 Element Plus UI 库。'
  },
  // 可以添加更多课程...
]);

// 处理下载事件 (示例)
const handleDownloadSingle = (course) => {
  console.log('下载单个课程:', course);
  alert(`开始下载课程: ${course.title}`);
};

const handleDownloadSelected = (courses) => {
  console.log('下载选中课程:', courses);
  if (courses.length > 0) {
    const titles = courses.map(c => c.title).join(', ');
    alert(`开始下载 ${courses.length} 个选中课程: ${titles}`);
  } else {
    alert('没有选中任何课程可供下载。');
  }
};

</script>

<style scoped>
.courses-page {
  padding: 20px;
  /* text-align: center; */ /* 取消居中，让 Card2 组件正常布局 */
}

.course-list-container {
  margin-top: 20px;
}

/* 可以添加针对 Card2 容器的额外样式 */
</style>