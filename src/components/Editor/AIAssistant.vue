<template>
  <div class="ai-assistant-container">
    <h3>AI 助手</h3>
    <el-button type="primary" :loading="loading" @click="handleOptimize" style="margin-bottom: 16px;">AI优化</el-button>
    <div v-if="error" class="ai-error">{{ error }}</div>
    <div v-if="loading" class="ai-loading">AI正在生成优化建议...</div>
    <el-scrollbar style="max-height: 260px; min-height: 60px; border: 1px solid #eee; border-radius: 6px; padding: 12px; background: #fafbfc;" v-if="result">
      <v-md-preview :text="result" />
    </el-scrollbar>
    <div v-else-if="!loading && !error" class="ai-placeholder">点击“AI优化”按钮，获取针对当前文章内容的优化建议。</div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { ElMessage } from 'element-plus';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import hljs from 'highlight.js';
import { getAIChatResponse } from '@/api/ai';

VMdPreview.use(githubTheme, { Hljs: hljs });

// 通过inject获取父组件传递的文章内容
const articleContent = inject('editorContent');

const loading = ref(false);
const result = ref('');
const error = ref('');

async function handleOptimize() {
  error.value = '';
  result.value = '';
  if (!articleContent || !articleContent.value || !articleContent.value.trim()) {
    ElMessage.warning('请先输入文章内容');
    return;
  }
  loading.value = true;
  try {
    // 构造AI请求消息
    const messages = [
      { role: 'user', content: `请帮我优化以下文章内容，并给出具体建议：\n${articleContent.value}` }
    ];
    // 可根据需要传递token
    const aiResponse = await getAIChatResponse(messages);
    result.value = aiResponse.length > 1200 ? aiResponse.slice(0, 1200) + '\n\n（内容过长已截断）' : aiResponse;
  } catch (e) {
    error.value = 'AI请求失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.ai-assistant-container {
  padding: 32px;
  height: 100%;
  background-color: #fff;
  box-sizing: border-box;
  overflow-y: auto;
}
.ai-loading {
  color: #409EFF;
  margin-bottom: 12px;
}
.ai-error {
  color: #f56c6c;
  margin-bottom: 12px;
}
.ai-placeholder {
  color: #bbb;
  font-size: 14px;
  margin-top: 16px;
}
</style>