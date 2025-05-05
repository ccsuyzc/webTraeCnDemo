<template>
  <div class="courses-page">
    <!-- 筛选/排序选项卡 -->
    <el-tabs v-model="activeSortTab" class="sort-tabs">
      <el-tab-pane label="综合排序" name="comprehensive"></el-tab-pane>
      <el-tab-pane label="最多播放" name="mostPlayed"></el-tab-pane>
      <el-tab-pane label="最新发布" name="latest"></el-tab-pane>
      <el-tab-pane label="最多弹幕" name="mostComments"></el-tab-pane>
      <el-tab-pane label="最多收藏" name="mostCollected"></el-tab-pane>
    </el-tabs>

    <!-- 课程列表 -->
    <div class="course-list-container">
      <Card2 :videos="sortedCourses" />
      <!-- Removed @download-single="handleDownloadSingle" @download-selected="handleDownloadSelected" -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElTabs, ElTabPane } from 'element-plus';
import Card2 from '@/components/Card2/index.vue'; // 引入重构后的 Card2 组件

// 当前激活的排序标签
const activeSortTab = ref('comprehensive');

// 创建虚拟课程数据 (添加播放量、发布日期等字段)
const dummyCourses = ref([
  {
    id: 1,
    imgSrc: 'https://via.placeholder.com/300x169/eee/999?text=Vue3+%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: '【2025最新版】 Vue3入门到精通, 零基础快速上手视频教程(已完结)',
    author: '土豆本体',
    publishDate: '2024-01-10',
    views: 125000,
    comments: 218,
    duration: '4:09:16'
  },
  {
    id: 2,
    imgSrc: 'https://via.placeholder.com/300x169/ddd/777?text=%E5%B0%9A%E7%A1%85%E8%B0%B7Vue3',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: '尚硅谷Vue3入门到实战, 最新版vue3+TypeScript前端开发教程',
    author: '尚硅谷',
    publishDate: '2023-12-19',
    views: 2304000,
    comments: 36000,
    duration: '14:09:30'
  },
  {
    id: 3,
    imgSrc: 'https://via.placeholder.com/300x169/ccc/555?text=Vue3%E5%85%A8%E5%AE%B6%E6%A1%B6',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: '2025徐老师Vue3全家桶课程+大型项目实战',
    author: '前端徐老师',
    publishDate: '2024-05-01', // 假设日期
    views: 31000,
    comments: 150, // 假设数据
    duration: '190课时'
  },
  {
    id: 4,
    imgSrc: 'https://via.placeholder.com/300x169/bbb/333?text=Vue3+%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E7%B2%BE%E9%80%9A',
    VideoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: '【2023最新版】Vue3从入门到精通, 零基础小白也能听得懂, 写得出',
    author: '蔡蔡小趴菜',
    publishDate: '2023-04-04',
    views: 1259000,
    comments: 11000,
    duration: '06:02:30'
  },
  // 可以添加更多课程...
]);

// 计算属性，根据选择的排序方式返回排序后的课程列表
const sortedCourses = computed(() => {
  const courses = [...dummyCourses.value];
  switch (activeSortTab.value) {
    case 'mostPlayed':
      return courses.sort((a, b) => b.views - a.views);
    case 'latest':
      // 注意：日期字符串比较可能不准确，实际应用中应转换为 Date 对象比较
      return courses.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    case 'mostComments':
      return courses.sort((a, b) => b.comments - a.comments);
    case 'mostCollected':
      // 假设有收藏数字段 'collections'
      // return courses.sort((a, b) => b.collections - a.collections);
      return courses; // 暂时返回原样
    case 'comprehensive':
    default:
      return courses; // 综合排序暂时返回原样
  }
});

// 处理下载事件 (示例) (Removed)
// const handleDownloadSingle = (course) => {
//   console.log('下载单个课程:', course);
//   alert(`开始下载课程: ${course.title}`);
// };

// const handleDownloadSelected = (courses) => {
//   console.log('下载选中课程:', courses);
//   if (courses.length > 0) {
//     const titles = courses.map(c => c.title).join(', ');
//     alert(`开始下载 ${courses.length} 个选中课程: ${titles}`);
//   } else {
//     alert('没有选中任何课程可供下载。');
//   }
// };

</script>

<style scoped>
.courses-page {
  padding: 20px;
  margin: 60px;
}

.sort-tabs {
  margin-bottom: 20px; /* 在选项卡和列表之间添加一些间距 */
}

.courses-page {
  padding: 20px;
  /* text-align: center; */ /* 取消居中，让 Card2 组件正常布局 */
}

.course-list-container {
  margin-top: 20px;
  /* 应用 Grid 布局 */
  display: grid;
  /* grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 响应式列宽 */
  gap: 20px; /* 卡片间距 */
}

/* Card2 组件本身可能不需要额外样式，因为布局由父容器控制 */
/* 如果 Card2 内部有特定布局需求，可以在其组件内部调整 */
</style>