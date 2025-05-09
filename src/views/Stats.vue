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
  title: { text: '文章阅读量与点赞数统计', left: 'center' },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    }
  },
  toolbox: {
    feature: {
      dataView: { show: true, readOnly: false, title: '数据视图' },
      magicType: { show: true, type: ['line', 'bar'], title: {line: '切换为折线图', bar: '切换为柱状图'} },
      restore: { show: true, title: '还原' },
      saveAsImage: { show: true, title: '保存为图片' }
    },
    top: 0,
    right: 10
  },
  legend: { data: ['阅读量', '点赞数'], top: 30 },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [{
    type: 'category',
    data: [],
    axisPointer: {
      type: 'shadow'
    }
  }],
  yAxis: [{
    type: 'value',
    name: '数量',
    min: 0,
    axisLabel: {
      formatter: '{value}'
    }
  }],
  series: [
    {
      name: '阅读量',
      type: 'bar',
      data: [],
      label: { show: true, position: 'top' },
      tooltip: {
        valueFormatter: function (value) {
          return value + ' 次';
        }
      }
    },
    {
      name: '点赞数',
      type: 'line',
      data: [],
      label: { show: true, position: 'top' },
      tooltip: {
        valueFormatter: function (value) {
          return value + ' 个';
        }
      }
    }
  ]
});

const pieOption = ref({
  title: { text: '文章分类占比', left: 'center' },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'middle',
    data: [] 
  },
  series: [
    {
      name: '分类',
      type: 'pie',
      radius: ['40%', '65%'], 
      center: ['60%', '50%'], 
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: true
      },
      data: []
    }
  ]
});

const totalViews = ref(0);
const totalLikes = ref(0);

onMounted(async () => {
  const stats = await fetchStatsByUser(userId);
  // 文章统计
  if (stats.articles) {
    chartOption.value.xAxis[0].data = stats.articles.map(a => a.title);
    chartOption.value.series[0].data = stats.articles.map(a => a.views);
    chartOption.value.series[1].data = stats.articles.map(a => a.likes);
  }
  // 分类饼图
  if (stats.categoryStats) {
    const categoryData = stats.categoryStats.map(c => ({ name: c.name, value: c.value }));
    pieOption.value.series[0].data = categoryData;
    pieOption.value.legend.data = categoryData.map(c => c.name); // Populate legend data
  }
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