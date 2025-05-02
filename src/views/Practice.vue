<template>
  <div class="practice-page">
    <h1>在线刷题</h1>
    <p>选择一个模块开始学习和练习。</p>
    <el-row :gutter="20" class="module-list">
      <el-col
        v-for="module in learningModules"
        :key="module.id"
        :xs="24" :sm="12" :md="8" :lg="6"
      >
        <el-card class="module-card" shadow="hover" @click="navigateTo(module.route)">
          <div class="card-content">
            <h3 class="module-title">{{ module.name }}</h3>
            <p class="module-description">{{ module.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElRow, ElCol, ElCard } from 'element-plus';

const router = useRouter();

const learningModules = ref([
  {
    id: 'sql',
    name: 'SQL 在线学习',
    description: '学习和练习结构化查询语言。',
    route: '/practice/sql' // 假设的路由
  },
  {
    id: 'regex',
    name: '正则表达式在线学习',
    description: '掌握强大的文本匹配模式。',
    route: '/practice/regex' // 假设的路由
  },
  // 可以添加更多模块...
  {
    id: 'python',
    name: 'Python 编程练习',
    description: '通过实战提升 Python 技能。',
    route: '/practice/python' // 假设的路由
  },
    {
    id: 'java',
    name: 'Java 编程练习',
    description: '通过实战提升 Java 技能。',
    route: '/practice/java' // 假设的路由
  },
]);

const navigateTo = (route) => {
  if (route) {
    router.push(route);
  } else {
    console.warn('No route defined for this module.');
    // 可以选择性地显示提示信息给用户
    // ElMessage.warning('该模块暂未开放');
  }
};
</script>

<style scoped>
.practice-page {
  padding: 30px;
  text-align: center;
  background-color: #f4f7f6; /* 淡雅的背景色 */
}

h1 {
  color: #333;
  margin-bottom: 15px;
}

p {
  color: #666;
  margin-bottom: 30px;
}

.module-list {
  justify-content: center; /* 卡片居中显示 */
}

.module-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px; /* 轻微圆角 */
  overflow: hidden; /* 确保内容不超过卡片边界 */
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); /* 悬停时更明显的阴影 */
}

.card-content {
  padding: 20px;
}

.module-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #409EFF; /* Element Plus 主题色 */
  margin-bottom: 10px;
}

.module-description {
  font-size: 0.95em;
  color: #555;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .practice-page {
    padding: 20px;
  }
  .el-col {
    /* 在小屏幕上确保列之间有间距 */
    margin-bottom: 20px;
  }
}
</style>