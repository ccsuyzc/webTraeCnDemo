<template>
  <div class="search-results-page container">
    <h1 class="page-title">搜索结果: "{{ searchQuery }}"</h1>
    <div v-if="loading" class="loading-indicator">加载中...</div>
    <div v-else-if="error" class="error-message">加载失败: {{ error }}</div>
    <div v-else>
      <!-- 本地结果 -->
      <section v-if="localResults.length > 0" class="results-section local-results">
        <h2>站内结果</h2>
        <ul class="result-list">
          <li v-for="result in localResults" :key="result.ID" class="result-item card">
            <div class="card-content">
              <h3 class="result-title">
                <router-link :to="`/article/${result.ID}`">{{ result.Title }}</router-link>
              </h3>
              <p class="result-meta">
                <span class="author">{{ result.UserName }}</span> ·
                <span class="time">{{ formatTime(result.PublishTime) }}</span>
              </p>
              <p class="result-description">{{ result.Description || '暂无描述' }}</p>
              <div class="result-stats">
                <span><i class="fas fa-eye"></i> {{ result.ViewCount || 0 }}</span>
                <span><i class="fas fa-thumbs-up"></i> {{ result.LikeCount || 0 }}</span>
                <span><i class="fas fa-comment"></i> {{ result.CommentCount || 0 }}</span>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- 外部结果 -->
      <section v-if="externalResults.length > 0" class="results-section external-results">
        <h2>站外结果</h2>
        <ul class="result-list">
          <li v-for="(result, index) in externalResults" :key="result.id || index" class="result-item card">
             <div class="card-content">
               <h3 class="result-title">
                 <a :href="result.url" target="_blank" rel="noopener noreferrer">{{ result.title }}</a>
               </h3>
               <p class="result-description">{{ result.desc || '暂无描述' }}</p>
               <p class="result-meta">
                 <span class="source">来源: {{ getDomain(result.url) }}</span>
               </p>
             </div>
          </li>
        </ul>
      </section>

      <div v-if="localResults.length === 0 && externalResults.length === 0" class="no-results">
        没有找到与 "{{ searchQuery }}" 相关的结果。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { searchArticles } from '@/api/articles' // 确认 search API 函数路径
import dayjs from 'dayjs'; // 引入 dayjs
import relativeTime from 'dayjs/plugin/relativeTime'; // 引入相对时间插件
import 'dayjs/locale/zh-cn'; // 引入中文语言包

dayjs.extend(relativeTime);
dayjs.locale('zh-cn'); // 设置 dayjs 使用中文

const route = useRoute()
const searchQuery = ref(route.query.q || '')
const localResults = ref([])
const externalResults = ref([])
const loading = ref(false)
const error = ref(null)

// 格式化时间
const formatTime = (time) => {
  if (!time || time === '0001-01-01T00:00:00Z') return '未知时间';
  // 尝试将时间转换为相对时间，例如“2年前”
  const date = dayjs(time);
  const now = dayjs();
  if (now.diff(date, 'year') >= 1) {
    return date.fromNow(); // 超过一年显示相对时间
  }
  return date.format('YYYY-MM-DD HH:mm'); // 一年内显示具体日期时间
};

// 从 URL 获取域名作为来源
const getDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '未知来源';
  }
};

const performSearch = async (query) => {
  if (!query) {
    localResults.value = []
    externalResults.value = []
    return
  }
  loading.value = true
  error.value = null
  try {
    const response = await searchArticles(query) // 调用 API
    console.log('Search API Response:', response); // 打印 API 响应
    // 确保 response.data 存在并且包含 local 和 external
    if (response) {
      localResults.value = response.local || []
      externalResults.value = response.external || []
      console.log('Local Results:', localResults.value);
      console.log('External Results:', externalResults.value);
    } else {
      console.error('Invalid API response structure:', response);
      localResults.value = [];
      externalResults.value = [];
      error.value = '无效的API响应格式';
    }
  } catch (err) {
    console.error('Search failed:', err)
    error.value = err.message || '搜索失败'
    localResults.value = []
    externalResults.value = []
  } finally {
    loading.value = false
  }
}

// 监听路由查询参数变化
watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || ''
  performSearch(searchQuery.value)
}, { immediate: true }) // 立即执行一次

// 组件挂载时执行一次搜索 (如果 watch 的 immediate: true 已设置，则此步可能多余)
// onMounted(() => {
//   performSearch(searchQuery.value)
// })
</script>

<style scoped>
/* 引入 Font Awesome (确保已在项目中安装或通过 CDN 引入) */
/* @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'); */

.container {
  max-width: 960px;
  margin: 30px auto;
  padding: 0 15px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 1.8em;
  color: #333;
}

.loading-indicator, .error-message, .no-results {
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-size: 1.1em;
}

.error-message {
  color: #e53e3e; /* Red color for errors */
}

.results-section {
  margin-bottom: 40px;
}

.results-section h2 {
  font-size: 1.5em;
  color: #444;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 15px;
  transition: box-shadow 0.3s ease;
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 15px 20px;
}

.result-title {
  font-size: 1.2em;
  margin: 0 0 8px 0;
}

.result-title a {
  text-decoration: none;
  color: #007bff; /* Blue link color */
  font-weight: 600;
}

.result-title a:hover {
  text-decoration: underline;
}

.result-meta {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 8px;
}

.result-meta .author,
.result-meta .time,
.result-meta .source {
  margin-right: 5px;
}

.result-description {
  font-size: 0.95em;
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
  /* Optional: Limit description lines */
  /* display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis; */
}

.result-stats {
  font-size: 0.85em;
  color: #777;
}

.result-stats span {
  margin-right: 15px;
}

.result-stats i {
  margin-right: 4px;
}

/* Specific styles for external results if needed */
.external-results .result-title a {
  color: #28a745; /* Green link color for external */
}

</style>