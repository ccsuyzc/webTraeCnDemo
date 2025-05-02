<template>
  <div class="stats-page">
    <el-card class="stats-card">
      <h2>数据统计</h2>
      <div style="height: 400px">
        <v-chart :option="chartOption" autoresize />
      </div>
      <div class="stats-summary">
        <div class="summary-item">
          <span class="summary-label">总阅读量：</span>
          <span class="summary-value">{{ totalViews }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">总点赞数：</span>
          <span class="summary-value">{{ totalLikes }}</span>
        </div>
      </div>
      <div style="height: 350px; margin-top: 32px">
        <v-chart :option="pieOption" autoresize />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchStatsByUser } from '../api/stats';
import VChart from 'vue-echarts';

const route = useRoute();
const userId = route.params.userId;
const chartOption = ref({
  title: { text: '文章阅读量统计', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['阅读量', '点赞数'], top: 30 },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [
    { name: '阅读量', type: 'bar', data: [], label: { show: true, position: 'top' } },
    { name: '点赞数', type: 'line', data: [], label: { show: true, position: 'top' } }
  ]
});

const pieOption = ref({
  title: { text: '分类分布', left: 'center' },
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [
    {
      name: '分类',
      type: 'pie',
      radius: '60%',
      data: [],
      label: { show: true, formatter: '{b}: {c} ({d}%)' }
    }
  ]
});

const totalViews = ref(0);
const totalLikes = ref(0);

onMounted(async () => {
  const stats = await fetchStatsByUser(userId);
  // 文章统计
  chartOption.value.xAxis.data = stats.articles.map(a => a.title);
  chartOption.value.series[0].data = stats.articles.map(a => a.views);
  chartOption.value.series[1].data = stats.articles.map(a => a.likes);
  // 分类饼图
  pieOption.value.series[0].data = stats.categoryStats.map(c => ({ name: c.name, value: c.value }));
  // 总数
  totalViews.value = stats.totalViews;
  totalLikes.value = stats.totalLikes;
});
</script>

<style scoped>
.stats-page {
  padding: 32px;
  max-width: 900px;
  margin: 64px auto 0;
}
.stats-card {
  border-radius: 12px;
  padding: 24px;
}
.stats-summary {
  display: flex;
  gap: 48px;
  margin: 24px 0 0 0;
  font-size: 18px;
  justify-content: center;
}
.summary-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.summary-label {
  color: #888;
  margin-right: 8px;
}
.summary-value {
  color: #409eff;
  font-weight: bold;
}
</style>