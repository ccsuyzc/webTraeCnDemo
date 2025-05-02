<template>
  <el-container class="ai-coding-container">
    <!-- 左侧历史记录 -->
    <el-aside width="300px" class="history-panel">
      <div class="history-header">
        <span class="history-title">历史问答</span>
        <!-- 新增：新建对话按钮 -->
        <el-button type="primary" size="small" @click="newConversation">新建对话</el-button>
      </div>
      <el-scrollbar class="history-list">
        <div
          v-for="(item, idx) in history"
          :key="idx"
          class="history-item"
          :class="{ active: idx === activeHistory }"
          @click="selectHistory(idx)"
        >
          <div class="history-item-content">
            <div class="history-q">Q: {{ item.question }}</div>
            <div class="history-a">A: {{ item.answer }}</div>
          </div>
          <!-- 新增：删除按钮 -->
          <el-button
            type="danger"
            :icon="Delete"
            circle
            size="small"
            class="delete-history-btn"
            @click.stop="deleteHistory(idx)"
          />
        </div>
      </el-scrollbar>
      <!-- 新增：API Token 输入区域 -->
      <div class="api-token-section">
        <el-input
          v-model="apiTokenInput"
          placeholder="输入你的 DeepSeek API Token"
          size="small"
          clearable
        />
        <el-button type="success" size="small" @click="saveApiToken">保存</el-button>
      </div>
    </el-aside>

    <!-- 右侧聊天区域 -->
    <el-container class="chat-area">
      <!-- 新增：聊天区域标题栏 -->
      <el-header class="chat-header" height="60px">
        <span class="chat-title">{{ history[activeHistory]?.question || '当前对话' }}</span>
      </el-header>
      <el-main class="chat-panel">
        <el-scrollbar ref="chatScrollbarRef" class="chat-content-scrollbar">
          <div ref="chatContentRef" class="chat-content">
            <div v-for="(msg, idx) in chat" :key="idx" :class="['chat-msg', msg.role]">
              <el-avatar :size="36" class="avatar" :class="msg.role">
                {{ msg.role === 'user' ? '我' : 'AI' }}
              </el-avatar>
              <div class="msg-bubble">
                <!-- 使用 v-md-preview 渲染消息 -->
                <v-md-preview :text="msg.text"></v-md-preview>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </el-main>
      <el-footer class="chat-input-bar" height="auto">
        <el-input
          v-model="input"
          placeholder="请输入你的问题..."
          @keyup.enter="sendMsg"
          class="chat-input"
          clearable
          size="large"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
        />
        <el-button type="primary" @click="sendMsg" size="large" :disabled="!input.trim()">发送</el-button>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import { ElMessage, ElScrollbar, ElInput, ElButton, ElContainer, ElAside, ElMain, ElHeader, ElFooter, ElAvatar } from 'element-plus'; // 引入需要的 Element Plus 组件
import { Delete } from '@element-plus/icons-vue'; // 引入删除图标
import { getAIChatResponse } from '@/api/ai'; // 引入 AI API 函数
// 引入 v-md-preview
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

const history = ref([
  {
    question: 'Vue是什么？',
    answer: 'Vue是一款渐进式JavaScript框架。',
    chat: [
      { role: 'user', text: 'Vue是什么？' },
      { role: 'ai', text: 'Vue (读音 /vjuː/，类似于 view) 是一套用于构建用户界面的渐进式框架。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与现代化的工具链以及各种支持类库结合使用时，Vue 也完全能够为复杂的单页应用提供驱动。' }
    ]
  },
  {
    question: 'Element Plus怎么用？',
    answer: 'Element Plus是基于Vue3的UI组件库。',
    chat: [
      { role: 'user', text: 'Element Plus怎么用？' },
      { role: 'ai', text: 'Element Plus 是一套为开发者、设计师和产品经理准备的基于 Vue 3.0 的桌面端组件库。你可以通过 npm 或 yarn 安装它，然后在你的 Vue 项目中引入并注册组件即可使用。它提供了丰富的组件和详细的文档。' }
    ]
  }
]);

const activeHistory = ref(0);
const chat = ref([]); // 当前对话的聊天记录，初始为空
const input = ref('');
const chatContentRef = ref(null); // Ref for chat content inner div
const chatScrollbarRef = ref(null); // Ref for el-scrollbar component
const apiTokenInput = ref(''); // API Token 输入框绑定
const userApiToken = ref(''); // 用户保存的 API Token

// Function to scroll chat to bottom
const scrollToBottom = () => {
  nextTick(() => {
    const scrollbar = chatScrollbarRef.value;
    if (scrollbar) {
      scrollbar.wrapRef.scrollTop = scrollbar.wrapRef.scrollHeight;
    }
  });
};

// 组件挂载时加载历史记录和 API Token
onMounted(() => {
  loadHistory();
  // 加载用户保存的 API Token
  const savedToken = localStorage.getItem('deepseek_api_token');
  if (savedToken) {
    userApiToken.value = savedToken;
    apiTokenInput.value = savedToken; // 同步到输入框
  }

  // 如果有历史记录，默认选中第一个
  if (history.value.length > 0) {
    selectHistory(0);
  } else {
    // 如果没有历史记录，创建一个新的空对话
    newConversation();
  }
  scrollToBottom(); // 初始加载后滚动到底部
});

watch(chat, () => {
  scrollToBottom();
})

// --- 新增/修改的函数 ---

// 加载历史记录
// function loadHistory() {
//   const savedHistory = localStorage.getItem('ai_chat_history');
//   if (savedHistory) {
//     history.value = JSON.parse(savedHistory);
//   } else {
//     // 如果没有保存的历史记录，可以使用初始的示例数据或一个空数组
//     history.value = []; // 或者使用上面的示例数据
//   }
// }

// 保存历史记录
function saveHistory() {
  localStorage.setItem('ai_chat_history', JSON.stringify(history.value));
}

// // 新增：删除历史记录
// function deleteHistory(index) {
//   history.value.splice(index, 1);
//   saveHistory(); // 保存更改
//   // 如果删除的是当前激活的对话
//   if (activeHistory.value === index) {
//     // 如果还有其他历史记录，选中第一个，否则新建一个
//     if (history.value.length > 0) {
//       selectHistory(0);
//     } else {
//       newConversation();
//     }
//   } else if (activeHistory.value > index) {
//     // 如果删除的是前面的记录，调整激活索引
//     activeHistory.value--;
//   }
// }

// // 新增：新建对话
// function newConversation() {
//   const newChatEntry = {
//     question: `新对话 ${Date.now()}`,
//     answer: '', // 初始答案为空
//     chat: [{ role: 'ai', text: '你好！有什么可以帮你的吗？' }] // 初始系统消息改为 ai
//   };
//   history.value.unshift(newChatEntry); // 在列表开头添加新对话
//   activeHistory.value = 0; // 激活新对话
//   chat.value = history.value[0].chat;
//   input.value = ''; // 清空输入框
//   saveHistory(); // 保存新建的对话
//   scrollToBottom();
// }

// // 新增：保存 API Token 到 localStorage
// function saveApiToken() {
//   const token = apiTokenInput.value.trim();
//   if (token) {
//     localStorage.setItem('deepseek_api_token', token);
//     userApiToken.value = token;
//     ElMessage.success('API Token 已保存');
//   } else {
//     localStorage.removeItem('deepseek_api_token');
//     userApiToken.value = '';
//     ElMessage.info('API Token 已清除');
//   }
// }

// --- 修改 sendMsg 和 selectHistory ---

function selectHistory(idx) {
  activeHistory.value = idx;
  chat.value = history.value[idx].chat;
  scrollToBottom();
}

// async function sendMsg() {
//   const text = input.value.trim();
//   if (!text) return;

//   const userMessage = { role: 'user', text: text };
//   chat.value.push(userMessage);

//   // 更新当前激活历史记录的 question 和 answer (如果这是第一条用户消息)
//   if (chat.value.filter(m => m.role === 'user').length === 1) {
//     history.value[activeHistory.value].question = text.substring(0, 20); // 取前20个字符作为问题概览
//   }

//   input.value = ''; // 清空输入框
//   scrollToBottom(); // 滚动到底部

//   // 准备发送给 API 的消息历史
//   const messagesForApi = chat.value.map(({ role, text }) => ({ role: role === 'ai' ? 'assistant' : role, content: text }));

//   // 添加一个临时的 AI 加载中消息
//   const loadingMessage = { role: 'ai', text: '思考中...' }; // 使用 'ai' 角色
//   chat.value.push(loadingMessage);
//   scrollToBottom();

//   try {
//     // 调用 AI API 获取回复，传入用户 Token
//     const aiResponseText = await getAIChatResponse(messagesForApi, userApiToken.value);
//     // 移除加载中消息
//     chat.value.pop();
//     const aiMessage = { role: 'ai', text: aiResponseText }; // 使用 'ai' 角色
//     chat.value.push(aiMessage);
//     // 更新当前激活历史记录的 answer
//     history.value[activeHistory.value].answer = aiResponseText.substring(0, 30); // 取前30个字符作为答案概览
//     saveHistory(); // 保存更新后的历史记录
//   } catch (error) {
//     // 处理 API 调用错误
//     console.error('AI response error:', error);
//     // 移除加载中消息
//     chat.value.pop();
//     chat.value.push({ role: 'ai', text: `抱歉，AI 回复时遇到了问题: ${error.message || '未知错误'}` }); // 使用 'ai' 角色
//     saveHistory(); // 即使出错也保存一下记录
//   }

//   scrollToBottom(); // AI 回复后再次滚动到底部
// }, { deep: true });

// function selectHistory(idx) {
//   activeHistory.value = idx;
//   chat.value = history.value[idx].chat;
//   scrollToBottom();
// },

// --- 新增/修改的函数 ---

// 加载历史记录
function loadHistory() {
  const savedHistory = localStorage.getItem('ai_chat_history');
  if (savedHistory) {
    history.value = JSON.parse(savedHistory);
  } else {
    // 如果没有保存的历史记录，可以使用初始的示例数据或一个空数组
    history.value = []; // 或者使用上面的示例数据
  }
}

// // 保存历史记录
// function saveHistory() {
//   localStorage.setItem('ai_chat_history', JSON.stringify(history.value));
// }

// 新增：删除历史记录
function deleteHistory(index) {
  history.value.splice(index, 1);
  saveHistory(); // 保存更改
  // 如果删除的是当前激活的对话
  if (activeHistory.value === index) {
    // 如果还有其他历史记录，选中第一个，否则新建一个
    if (history.value.length > 0) {
      selectHistory(0);
    } else {
      newConversation();
    }
  } else if (activeHistory.value > index) {
    // 如果删除的是前面的记录，调整激活索引
    activeHistory.value--;
  }
}
// 新增：新建对话
function newConversation() {
  const newChatEntry = {
    question: `新对话 ${Date.now()}`,
    answer: '', // 初始答案为空
    chat: [{ role: 'ai', text: '你好！有什么可以帮你的吗？' }] // 初始系统消息改为 ai
  };
  history.value.unshift(newChatEntry); // 在列表开头添加新对话
  activeHistory.value = 0; // 激活新对话
  chat.value = history.value[0].chat;
  input.value = ''; // 清空输入框
  saveHistory(); // 保存新建的对话
  scrollToBottom();
}

// 新增：保存 API Token 到 localStorage
function saveApiToken() {
  const token = apiTokenInput.value.trim();
  if (token) {
    localStorage.setItem('deepseek_api_token', token);
    userApiToken.value = token;
    ElMessage.success('API Token 已保存');
  } else {
    localStorage.removeItem('deepseek_api_token');
    userApiToken.value = '';
    ElMessage.info('API Token 已清除');
  }
}

// --- 修改 sendMsg 和 selectHistory ---

// function selectHistory(idx) {
//   activeHistory.value = idx;
//   chat.value = history.value[idx].chat;
//   scrollToBottom();
// }

// async function sendMsg() {
//   const text = input.value.trim();
//   if (!text) return;

//   const userMessage = { role: 'user', text: text };
//   chat.value.push(userMessage);

//   // 更新当前激活历史记录的 question 和 answer (如果这是第一条用户消息)
//   if (chat.value.filter(m => m.role === 'user').length === 1) {
//     history.value[activeHistory.value].question = text.substring(0, 20); // 取前20个字符作为问题概览
//   }

//   input.value = ''; // 清空输入框
//   scrollToBottom(); // 滚动到底部

//   // 准备发送给 API 的消息历史
//   const messagesForApi = chat.value.map(({ role, text }) => ({ role: role === 'ai' ? 'assistant' : role, content: text }));

//   // 添加一个临时的 AI 加载中消息
//   const loadingMessage = { role: 'ai', text: '思考中...' }; // 使用 'ai' 角色
//   chat.value.push(loadingMessage);
//   scrollToBottom();

//   try {
//     // 调用 AI API 获取回复，传入用户 Token
//     const aiResponseText = await getAIChatResponse(messagesForApi, userApiToken.value);
//     // 移除加载中消息
//     chat.value.pop();
//     const aiMessage = { role: 'ai', text: aiResponseText }; // 使用 'ai' 角色
//     chat.value.push(aiMessage);
//     // 更新当前激活历史记录的 answer
//     history.value[activeHistory.value].answer = aiResponseText.substring(0, 30); // 取前30个字符作为答案概览
//     saveHistory(); // 保存更新后的历史记录
//   } catch (error) {
//     // 处理 API 调用错误
//     console.error('AI response error:', error);
//     // 移除加载中消息
//     chat.value.pop();
//     chat.value.push({ role: 'ai', text: `抱歉，AI 回复时遇到了问题: ${error.message || '未知错误'}` }); // 使用 'ai' 角色
//     saveHistory(); // 即使出错也保存一下记录
//   }

//   scrollToBottom(); // AI 回复后再次滚动到底部
// }

async function sendMsg() { // 改为 async 函数
  const text = input.value.trim();
  if (!text) return;

  const userMessage = { role: 'user', text: text };
  chat.value.push(userMessage);
  input.value = ''; // 清空输入框
  scrollToBottom(); // 滚动到底部

  // 准备发送给 API 的消息历史
  // 注意：这里的 chat.value 包含了刚刚添加的用户消息
  // 我们需要传递一个只包含 role 和 text 的消息数组副本
  const messagesForApi = chat.value.map(({ role, text }) => ({ role, content: text }));

  try {
    // 调用 AI API 获取回复
    const aiResponseText = await getAIChatResponse(messagesForApi);
    const aiMessage = { role: 'ai', text: aiResponseText };
    chat.value.push(aiMessage);
  } catch (error) {
    // 处理 API 调用错误，例如显示错误消息
    console.error('AI response error:', error);
    chat.value.push({ role: 'ai', text: '抱歉，AI 回复时遇到了问题。' });
  }

  scrollToBottom(); // AI 回复后再次滚动到底部
}
</script>

<style scoped>
.ai-coding-container {
  height: calc(100vh - 100px); /* 减去可能的导航栏高度，确保占满剩余空间 */
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f7f8fa;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  padding: 32px 0;
}

/* 左侧历史记录 */
.history-panel {
  background: #ffffff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.history-list {
  flex: 1;
  padding: 8px;
}

.history-item {
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  border: 1px solid transparent;
  display: flex; /* 让内容和按钮在同一行 */
  justify-content: space-between; /* 内容居左，按钮居右 */
  align-items: center; /* 垂直居中 */
}

.history-item-content {
  flex-grow: 1; /* 让内容区域占据可用空间 */
  overflow: hidden; /* 防止长文本溢出 */
  margin-right: 10px; /* 和删除按钮保持间距 */
}

.delete-history-btn {
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.history-item:hover {
  background-color: #f0f2f5;
}

.history-item.active {
  background-color: #eaf2ff;
  border-color: #d0e4ff;
}

.history-item.active .history-q,
.history-item.active .history-a {
  color: #1e80ff;
}

.history-q {
  color: #1d2129;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.history-a {
  color: #86909c;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* API Token 输入区域样式 */
.api-token-section {
  padding: 10px 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 防止输入区域被压缩 */
  background-color: #ffffff; /* 保持背景色一致 */
}

.api-token-section .el-input {
  margin-right: 10px;
}

/* 右侧聊天区域 */
.chat-area {
  display: flex;
  flex-direction: column;
}

/* 新增：聊天区域标题栏样式 */
.chat-header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e5e6eb;
  background-color: #ffffff;
  flex-shrink: 0; /* 防止页头被压缩 */
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chat-panel {
  padding: 0; /* 移除内边距，让滚动条控制 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 确保 el-main 不产生自己的滚动条 */
}

.chat-content-scrollbar {
  flex: 1;
}

.chat-content {
  padding: 20px; /* 内边距加在内容区域 */
}

.chat-msg {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.chat-msg.user {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
}

.avatar.user {
  background-color: #1e80ff;
  margin-left: 12px;
}

.avatar.ai {
  /* background-color: #67c23a; */ /* 使用默认或主题色 */
  background-color: #f0f2f5; /* 浅灰色背景 */
  color: #555; /* 深灰色文字 */
  margin-right: 12px;
}

.msg-bubble {
  max-width: calc(100% - 60px); /* 限制最大宽度 */
  /* display: flex; */ /* 移除flex，让v-md-preview自然填充 */
  border-radius: 10px;
  padding: 5px 0px; /* 调整内边距 */
  background-color: #e9e9eb;
  color: #333;
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;
  /* white-space: pre-wrap; */ /* v-md-preview 会处理 */
}

.chat-msg.user .msg-bubble {
  background-color: #eaf2ff;
  border-bottom-right-radius: 0;
}

.chat-msg.ai .msg-bubble {
  background-color: #f0f2f5;
  border-bottom-left-radius: 0;
}

.msg-text {
  padding: 10px 15px;
  border-radius: 10px;
  background-color: #e9e9eb;
  color: #333;
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;
  white-space: pre-wrap; /* 保留换行和空格 */
}

.chat-msg.user .msg-text {
  background-color: #eaf2ff;
  border-bottom-right-radius: 0;
}



/* 底部输入栏 */
.chat-input-bar {
  padding: 15px 20px;
  background: #ffffff;
  border-top: 1px solid #e5e6eb;
  display: flex;
  align-items: flex-end; /* 垂直底部对齐 */
}

.chat-input {
  margin-right: 10px;
}

/* Element Plus 样式覆盖 */
.chat-input :deep(.el-textarea__inner) {
  border-radius: 18px !important; /* 使用 !important 确保覆盖 */
  padding: 8px 15px; /* 调整内边距 */
  background-color: #f7f8fa;
  box-shadow: none; /* 移除默认阴影 */
  border: 1px solid #e5e6eb;
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #1e80ff;
}

.el-button {
  height: auto; /* 让按钮高度自适应 */
  padding: 10px 20px; /* 调整按钮内边距 */
}

/* 滚动条样式 (可选) */
.el-scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: hidden; /* 隐藏水平滚动条 */
}

/* 可以添加更精细的滚动条样式 */
.el-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: #c1c1c1;
  border-radius: 10px;
}

.el-scrollbar :deep(.el-scrollbar__thumb:hover) {
  background-color: #a8a8a8;
}

/* v-md-preview 样式调整 */
.msg-bubble :deep(.vuepress-markdown-body) {
  padding: 5px 15px; /* 调整内边距以适应气泡 */
  background-color: transparent !important; /* 继承气泡背景色 */
  font-size: 14px !important; /* 保持字体大小一致 */
  line-height: 1.6 !important; /* 调整行高 */
  color: inherit !important; /* 继承文字颜色 */
}

/* 移除 v-md-preview 的默认外边距 */
.msg-bubble :deep(.vuepress-markdown-body p) {
  margin: 0 0 8px 0; /* 只保留段落下边距 */
}
.msg-bubble :deep(.vuepress-markdown-body pre) {
    margin: 8px 0 !important; /* 代码块外边距 */
    padding: 10px !important; /* 代码块内边距 */
    border-radius: 6px !important;
}

.msg-bubble :deep(.vuepress-markdown-body code) {
    font-size: 13px !important;
}

/* 针对代码块的样式微调 (可选) */
.msg-bubble .v-md-editor-preview pre,
.msg-bubble .v-md-editor-preview code {
  font-size: 13px; /* 代码字体稍小 */
  border-radius: 4px; /* 代码块圆角 */
}

.msg-bubble .v-md-editor-preview pre {
  margin: 8px 0; /* 代码块外边距 */
  padding: 10px; /* 代码块内边距 */
}
 </style>