<template>
  <div class="sql-levels-page">
    <el-row :gutter="40">
      <!-- 主线关卡 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>主线关卡</span>
            </div>
          </template>
          <el-scrollbar height="60vh">
            <el-list class="level-list">
              <el-list-item v-for="(level, index) in mainLevels" :key="level.key">
                <div class="level-item">
                  <span>{{ index + 1 }}. {{ level.name }}</span>
                  <el-button type="primary" plain size="small" @click="startChallenge(level.key)">挑战</el-button>
                </div>
              </el-list-item>
            </el-list>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 自定义关卡 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>自定义关卡</span>
            </div>
          </template>
          <el-scrollbar height="60vh">
            <el-list class="level-list">
              <el-list-item v-for="level in customLevels" :key="level.key">
                <div class="level-item">
                  <span>{{ level.name }}</span>
                  <el-button type="success" plain size="small" @click="startChallenge(level.key)">挑战</el-button>
                </div>
              </el-list-item>
            </el-list>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 尝试从 sql-mother 子项目导入关卡数据
// 注意：这可能需要调整构建配置或复制/调整数据结构
import mainLevelsData from '../core/levels/mainLevels.js';
import customLevelsData from '../core/levels/customLevels.js';

const router = useRouter();

// 将导入的数据包装在 ref 中（如果它们不是响应式的）
// 假设 mainLevelsData 和 customLevelsData 是数组
const mainLevels = ref(mainLevelsData || []);
const customLevels = ref(customLevelsData || []);

const startChallenge = (levelKey) => {
  if (levelKey) {
    // 跳转到具体的刷题页面，路由待定义
    router.push(`/sql-practice/${levelKey}`);
  } else {
    console.warn('Level key is missing.');
    // 可以添加 Element Plus 的消息提示
    // ElMessage.warning('无法开始挑战，关卡信息缺失');
  }
};
</script>

<style scoped>
.sql-levels-page {
  padding: 20px; /* 减少页面内边距 */
  background-color: #f5f7fa; /* 使用 Element Plus 推荐的背景色 */
}

.box-card {
  border-radius: 8px; /* 添加圆角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 添加更柔和的阴影 */
  height: auto; /* 让卡片高度自适应内容 */
  min-height: 70vh; /* 保持最小高度 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600; /* 稍微加粗 */
  font-size: 18px; /* 增大标题字号 */
  color: #303133; /* Element Plus 主要文字颜色 */
}

.level-list {
  padding: 0; /* 移除列表内边距，让列表项控制 */
}

.el-list-item {
  padding: 15px 20px; /* 调整列表项内边距 */
  border-bottom: 1px solid #ebeef5; /* 添加分隔线 */
  transition: background-color 0.3s; /* 添加悬停效果 */
}

.el-list-item:last-child {
  border-bottom: none; /* 移除最后一个列表项的底部分隔线 */
}

.el-list-item:hover {
  background-color: #ecf5ff; /* 悬停背景色 */
}

.level-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.level-item span {
  flex-grow: 1;
  margin-right: 15px; /* 增大间距 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px; /* 调整字体大小 */
  color: #606266; /* Element Plus 常规文字颜色 */
}

.el-button {
  flex-shrink: 0;
}

/* 调整滚动条高度，使其在卡片内部滚动 */
.el-scrollbar {
  height: calc(70vh - 60px); /* 减去卡片头部和内边距的大致高度 */
}

.el-scrollbar__wrap {
  overflow-x: hidden; /* 防止水平滚动 */
}
</style>