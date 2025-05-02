<template>
  <el-container class="chat-container">
    <!-- 左侧联系人列表 -->
    <el-aside width="280px" class="contact-panel">
      <div class="contact-header">
        <el-input
          v-model="searchQuery"
          placeholder="搜索联系人"
          :prefix-icon="Search"
          size="small"
          clearable
        />
      </div>
      <el-scrollbar class="contact-list">
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          class="contact-item"
          :class="{ active: conv.id === activeConversationId }"
          @click="selectConversation(conv.id)"
        >
          <el-avatar :size="40" :src="conv.avatar" class="contact-avatar" />
          <div class="contact-info">
            <div class="contact-name-time">
              <span class="contact-name">{{ conv.name }}</span>
              <span class="contact-time">{{ conv.time }}</span>
            </div>
            <div class="contact-last-msg">{{ conv.lastMessage }}</div>
          </div>
        </div>
        <el-empty v-if="filteredConversations.length === 0" description="暂无联系人" :image-size="60"></el-empty>
      </el-scrollbar>
    </el-aside>

    <!-- 右侧聊天区域 -->
    <el-container class="chat-area" v-if="activeConversation">
      <el-header class="chat-header" height="60px">
        <span class="chat-title">{{ activeConversation.name }}</span>
        <el-dropdown>
          <el-icon class="el-dropdown-link" :size="20"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>查看资料</el-dropdown-item>
              <el-dropdown-item>清空聊天记录</el-dropdown-item>
              <el-dropdown-item divided>删除好友</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="chat-panel">
        <el-scrollbar ref="chatScrollbarRef" class="chat-content-scrollbar">
          <div ref="chatContentRef" class="chat-content">
            <div v-for="(msg, idx) in messages" :key="idx" :class="['chat-msg', msg.sender === 'me' ? 'user' : 'other']">
              <el-avatar :size="36" :src="msg.sender === 'me' ? currentUser.avatar : activeConversation.avatar" class="avatar" />
              <div class="msg-bubble">
                 <span class="msg-text">{{ msg.text }}</span>
                 <span class="msg-time">{{ msg.time }}</span>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </el-main>
         <el-footer class="chat-input-bar" height="auto">
           <div class="chat-actions">
             <el-tooltip content="表情" placement="top">
               <el-icon :size="22"><MostlyCloudy /></el-icon>
             </el-tooltip>
             <el-tooltip content="发送图片" placement="top">
               <el-icon :size="22"><PictureFilled /></el-icon>
             </el-tooltip>
             <!-- 可以添加更多操作按钮 -->
           </div>
           <div class="chat-input-row">
             <el-input
               v-model="newMessage"
               placeholder="输入消息..."
               @keyup.enter="sendMessage"
               class="chat-input"
               clearable
               size="large"
               type="textarea"
               :autosize="{ minRows: 1, maxRows: 4 }"
             />
             <el-button type="primary" @click="sendMessage" size="large" :disabled="!newMessage.trim()">发送</el-button>
           </div>
         </el-footer>
    </el-container>
    <el-container v-else class="chat-area-empty">
        <el-empty description="选择一个联系人开始聊天吧" :image-size="100"></el-empty>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { ElContainer, ElAside, ElMain, ElHeader, ElFooter, ElInput, ElButton, ElScrollbar, ElAvatar, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElEmpty, ElTooltip } from 'element-plus';
import { Search, MoreFilled, MostlyCloudy, PictureFilled } from '@element-plus/icons-vue';

// 模拟当前用户信息
const currentUser = ref({
  id: 'user_me',
  name: '我',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' // 示例头像
});

// 模拟联系人/会话列表数据
const conversations = ref([
  {
    id: 1,
    name: '言志志',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 示例头像
    lastMessage: '你好',
    time: '20:40',
    messages: [
      { sender: 'other', text: '你好', time: '20:40' },
      { sender: 'me', text: '你好', time: '20:40' }
    ]
  },
  {
    id: 2,
    name: '技术交流群',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', // 示例群头像
    lastMessage: '今晚有分享吗？',
    time: '昨天',
    messages: [
       { sender: 'other', text: '今晚有分享吗？', time: '昨天 18:30' }
    ]
  },
  // ...更多会话
]);

const searchQuery = ref('');
const activeConversationId = ref(null); // 当前选中的会话ID
const newMessage = ref('');
const chatScrollbarRef = ref(null);
const chatContentRef = ref(null);

// 计算属性：根据搜索过滤联系人
const filteredConversations = computed(() => {
  if (!searchQuery.value) {
    return conversations.value;
  }
  return conversations.value.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 计算属性：获取当前激活的会话对象
const activeConversation = computed(() => {
  return conversations.value.find(conv => conv.id === activeConversationId.value);
});

// 计算属性：获取当前激活会话的消息列表
const messages = computed(() => {
  return activeConversation.value ? activeConversation.value.messages : [];
});

// 方法：选择会话
const selectConversation = (id) => {
  activeConversationId.value = id;
  scrollToBottom(); // 切换会话后滚动到底部
};

// 方法：发送消息
const sendMessage = () => {
  const text = newMessage.value.trim();
  if (!text || !activeConversation.value) return;

  const now = new Date();
  const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  const msg = {
    sender: 'me',
    text: text,
    time: timeString
  };

  // 实际应用中，这里应该调用API发送消息
  // 模拟添加到当前会话的消息列表
  activeConversation.value.messages.push(msg);
  // 更新会话的最后消息和时间 (模拟)
  activeConversation.value.lastMessage = text;
  activeConversation.value.time = timeString;

  newMessage.value = ''; // 清空输入框
  scrollToBottom(); // 发送消息后滚动到底部
};

// 方法：滚动聊天记录到底部
const scrollToBottom = () => {
  nextTick(() => {
    const scrollbar = chatScrollbarRef.value;
    if (scrollbar && scrollbar.wrapRef) {
      scrollbar.wrapRef.scrollTop = scrollbar.wrapRef.scrollHeight;
    }
  });
};

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// 组件挂载后，默认选中第一个会话（如果存在）
onMounted(() => {
  if (conversations.value.length > 0) {
    // selectConversation(conversations.value[0].id);
  } else {
      // 如果没有会话，可以显示提示或加载数据
  }
});

</script>

<style scoped>
.chat-container {
  height: calc(100vh - 100px); /* 调整高度以适应布局 */
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f7f8fa;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  margin: 50px auto 0;
  padding: 32px 0;
}

/* 左侧联系人面板 */
.contact-panel {
  background: #ffffff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.contact-header {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.contact-list {
  flex: 1;
  padding: 8px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  border-left: 3px solid transparent; /* 用于激活状态指示 */
}

.contact-item:hover {
  background-color: #f0f2f5;
}

.contact-item.active {
  background-color: #eaf2ff;
  border-left-color: #1e80ff;
}

.contact-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.contact-info {
  flex-grow: 1;
  overflow: hidden; /* 防止文本溢出 */
}

.contact-name-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.contact-name {
  color: #1d2129;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px; /* 限制名字最大宽度 */
}

.contact-time {
  color: #86909c;
  font-size: 12px;
  flex-shrink: 0;
}

.contact-last-msg {
  color: #86909c;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧聊天区域 */
.chat-area {
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa; /* 聊天区域背景色 */
}

.chat-area-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #f7f8fa;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e5e6eb;
  background-color: #ffffff;
  flex-shrink: 0;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.el-dropdown-link {
  cursor: pointer;
  color: #86909c;
}

.chat-panel {
  padding: 0; /* 移除内边距，让滚动条控制 */
  flex: 1;
  overflow: hidden;
}

.chat-content-scrollbar {
  height: 100%;
}

.chat-content {
  padding: 20px;
}

.chat-msg {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start; /* 头像和气泡顶部对齐 */
}

.chat-msg.user {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  margin-top: 5px; /* 轻微下移头像，视觉对齐 */
}

.chat-msg.user .avatar {
  margin-left: 12px;
}

.chat-msg.other .avatar {
  margin-right: 12px;
}

.msg-bubble {
   max-width: calc(100% - 100px); /* 限制最大宽度 */
   padding: 10px 15px;
   border-radius: 6px; /* 调整圆角 */
   background-color: #ffffff; /* 对方消息气泡背景 */
   color: #333;
   line-height: 1.6;
   font-size: 14px;
   word-wrap: break-word;
   position: relative;
   box-shadow: 0 1px 2px rgba(0,0,0,0.05);
   /* 移除时间显示，因为参考图中消息气泡内没有时间 */
   /* display: inline-block; */ /* 让气泡宽度自适应内容 */
 }

.chat-msg.user .msg-bubble {
   background-color: #cce5ff; /* 调整为参考图中的蓝色 */
   border-radius: 6px; /* 保持圆角一致 */
   color: #333; /* 确保文字颜色可见 */
 }

.chat-msg.other .msg-bubble {
   background-color: #f0f0f0; /* 调整为参考图中的浅灰色 */
   border-radius: 6px; /* 保持圆角一致 */
 }

.msg-text {
     display: block; /* 保持块状 */
     /* 移除 margin-bottom 因为时间被移除 */
 }

/* 移除时间样式，因为时间不在气泡内显示 */
 /* .msg-time {
     display: block;
     font-size: 11px;
     color: #a0a0a0;
     text-align: right;
 } */

/* .chat-msg.other .msg-time {
     text-align: left;
 } */

/* 底部输入栏 */
 .chat-input-bar {
   padding: 10px 20px;
   background: #ffffff;
   border-top: 1px solid #e5e6eb;
   display: flex;
   flex-direction: column;
 }

.chat-actions {
     display: flex;
     align-items: center;
     padding-bottom: 8px; /* 调整为 padding */
     color: #606266;
     border-bottom: 1px solid #f0f0f0; /* 添加分隔线 */
     margin-bottom: 8px; /* 与输入框的间距 */
 }

.chat-actions .el-icon {
    margin-right: 15px;
    cursor: pointer;
    transition: color 0.2s;
}

.chat-actions .el-icon:hover {
    color: #1e80ff;
}

.chat-input-row {
     display: flex;
     align-items: flex-end; /* 输入框和按钮底部对齐 */
     width: 100%; /* 确保占满宽度 */
 }

.chat-input {
  margin-right: 10px;
  flex-grow: 1; /* 让输入框占据剩余空间 */
}

/* Element Plus 样式覆盖 */
.chat-input :deep(.el-textarea__inner) {
   border-radius: 6px !important;
   padding: 8px 12px;
   background-color: transparent; /* 改为透明背景 */
   box-shadow: none;
   border: none; /* 移除边框 */
   resize: none; /* 禁止调整大小 */
   line-height: 1.6; /* 调整行高 */
 }

.chat-input :deep(.el-textarea__inner:focus) {
   box-shadow: none; /* 移除 focus 时的阴影 */
   border: none;
   outline: none;
 }

.el-button {
  height: auto;
  padding: 10px 20px;
  flex-shrink: 0;
}

/* 滚动条样式 */
.el-scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.el-scrollbar :deep(.el-scrollbar__bar.is-vertical > div) {
    background-color: #c0c4cc;
}

.el-scrollbar :deep(.el-scrollbar__bar.is-horizontal) {
    display: none; /* 隐藏水平滚动条 */
}

.el-empty {
    margin-top: 20px;
}
</style>