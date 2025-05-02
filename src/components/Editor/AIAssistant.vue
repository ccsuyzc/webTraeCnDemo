<template>
  <div class="ai-assistant-container">
    <h3>AI 助手</h3>
    <!-- AI 问答交互界面 -->
    <p>这里是 AI 助手的内容区域。</p>
  </div>
</template>

<script setup>
// AI 助手逻辑
</script>

<style scoped>
.ai-assistant-container {
  /* border-right: 1px solid #eee; */ /* Removed border, rely on parent's border */
  padding: 24px; /* Adjusted padding to match main content */
 padding: 32px; /* Consistent padding with main content */  padding: 32px; /* Consistent padding with main content */
  height: 100%; /* 或者根据需要调整 */
  background-color: #fafafa; /* Add a subtle background */
  background-color: #fff; /* Match sidebar background */
  box-sizing: border-box; /* Ensure padding is included in height */
   background-color: #fff; /* Match sidebar background */  
   overflow-y: auto; /* Allow scrolling if content overflows */ box-sizing: border-box; /* Ensure padding is included in height */
}

h3 {
  margin-top: 0; /* Remove default top margin for heading */
  margin-bottom: 16px;
  font-size: 1.1em;
  font-weight: 600;
  color: #303133;
}
</style>