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
      <el-scrollbar class="contact-list" v-loading="isLoadingContacts">
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
        <el-empty v-if="!isLoadingContacts && filteredConversations.length === 0" description="暂无关注的人" :image-size="60"></el-empty>
      </el-scrollbar>
    </el-aside>

    <!-- 右侧聊天区域 -->
    <el-container class="chat-area" v-if="activeConversationId">
      <el-header class="chat-header" height="60px">
        <span class="chat-title">{{ activeConversation?.name || '聊天' }}</span>
        <el-dropdown>
          <el-icon class="el-dropdown-link" :size="20"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>查看资料</el-dropdown-item>
              <el-dropdown-item>清空聊天记录</el-dropdown-item>
              <el-dropdown-item divided>取消关注</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="chat-panel" v-loading="isLoadingMessages">
        <!-- 未互关提示 -->
        <div v-if="!isLoadingMessages && !isMutuallyFollowing && activeConversationId" class="not-mutual-follow-overlay">
          <span>互相关注后才能开始聊天</span>
        </div>
        <el-scrollbar ref="chatScrollbarRef" class="chat-content-scrollbar">
          <div ref="chatContentRef" class="chat-content">
            <!-- 消息列表 -->
            <div v-for="msg in messages" :key="msg.id" :class="['chat-msg', msg.sender === 'me' ? 'user' : 'other']">
              <el-avatar :size="36" :src="msg.avatar" class="avatar" />
              <div class="msg-bubble">
                 <span class="msg-text">{{ msg.text }}</span>
                 <!-- <span class="msg-time">{{ msg.time }}</span> --> <!-- 时间暂时不在气泡内显示 -->
              </div>
            </div>
            <el-empty v-if="!isLoadingMessages && isMutuallyFollowing && messages.length === 0" description="暂无消息，开始聊天吧" :image-size="80"></el-empty>
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
               :disabled="!isMutuallyFollowing" 
             />
             <el-button type="primary" @click="sendMessage" size="large" :disabled="!newMessage.trim() || !isMutuallyFollowing">发送</el-button>
           </div>
         </el-footer>
    </el-container>
    <el-container v-else class="chat-area-empty">
        <el-empty description="选择一个联系人开始聊天吧" :image-size="100"></el-empty>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'; // 添加 onUnmounted
import { useRoute } from 'vue-router';
import { ElContainer, ElAside, ElMain, ElHeader, ElFooter, ElInput, ElButton, ElScrollbar, ElAvatar, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElEmpty, ElTooltip, ElMessage } from 'element-plus';
import { Search, MoreFilled, MostlyCloudy, PictureFilled } from '@element-plus/icons-vue';
import { useAuthStore } from '../store/authStore';
import { fetchFollowingList, fetchUserDetails, checkMutualFollow, fetchMessages, sendMessageApi } from '../api/users';

const route = useRoute();
const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.ID);

// 当前用户信息 (从 store 获取)
const currentUser = computed(() => ({
  id: currentUserId.value,
  name: authStore.user?.Username || '我',
  avatar: authStore.user?.AvatarURL || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
}));

// 联系人/会话列表数据 (将从 API 获取)
const conversations = ref([]);
const isLoadingContacts = ref(false);

// 模拟联系人/会话列表数据 (保留原始结构作为参考，后续替换)
/*
const conversations_mock = ref([
  {
    id: 1,
    name: '言志志',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
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
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    lastMessage: '今晚有分享吗？',
    time: '昨天',
    messages: [
       { sender: 'other', text: '今晚有分享吗？', time: '昨天 18:30' }
    ]
  },
]);
*/

const searchQuery = ref('');
const activeConversationId = ref(null); // 当前选中的会话用户ID
const newMessage = ref('');
const chatScrollbarRef = ref(null);
const chatContentRef = ref(null);
const messages = ref([]); // 当前激活会话的消息列表 (将从 API 获取)
const isLoadingMessages = ref(false);
const isMutuallyFollowing = ref(false); // 是否互相关注
const messagePollingInterval = ref(null); // 定时器 ID

// 计算属性：根据搜索过滤联系人
const filteredConversations = computed(() => {
  if (!searchQuery.value) {
    return conversations.value;
  }
  return conversations.value.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 计算属性：获取当前激活的会话对象 (用户信息)
const activeConversation = computed(() => {
  return conversations.value.find(conv => conv.id === activeConversationId.value);
});

// 方法：加载关注列表
const loadFollowingList = async () => {
  if (!currentUserId.value) {
    console.error('无法加载关注列表，用户未登录');
    // ElMessage.error('请先登录'); // 可以在这里提示，但通常入口会控制
    return;
  }
  isLoadingContacts.value = true;
  try {
    const followingResponse = await fetchFollowingList(currentUserId.value);
    if (followingResponse && followingResponse.data && followingResponse.data.list) {
      const followingIds = followingResponse.data.list.map(item => item.id);

      // 获取每个关注用户的详细信息 (并行请求)
      const userDetailPromises = followingIds.map(id => fetchUserDetails(id));
      const userDetailsResponses = await Promise.all(userDetailPromises);

      conversations.value = userDetailsResponses
        .filter(user => user) // 过滤掉获取失败的用户
        .map(user => ({
          id: user.ID,
          name: user.Username,
          avatar: user.AvatarURL || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 默认头像
          lastMessage: '', // 初始为空，后续可考虑获取最后消息
          time: '', // 初始为空
          // messages: [] // 不在这里存储所有消息，按需加载
        }));

      // 检查是否有从 User 页面传递过来的 userId
      const targetUserId = route.query.userId ? parseInt(route.query.userId) : null;
      if (targetUserId && conversations.value.some(c => c.id === targetUserId)) {
          // 如果 URL 参数指定的用户在关注列表中，则自动选中
          selectConversation(targetUserId);
      } else if (conversations.value.length > 0 && !activeConversationId.value) {
          // 否则，如果列表不为空且没有选中项，默认选中第一个 (可选)
          // selectConversation(conversations.value[0].id);
      }

    } else {
      console.warn('获取关注列表响应格式不正确或为空:', followingResponse);
      conversations.value = [];
    }
  } catch (error) {
    console.error('加载关注列表失败:', error);
    ElMessage.error('加载联系人列表失败，请稍后重试');
    conversations.value = [];
  } finally {
    isLoadingContacts.value = false;
  }
};

// 方法：选择会话
const selectConversation = async (id) => {
  if (!currentUserId.value) {
      ElMessage.warning('请先登录');
      return;
  }

  // 清除之前的定时器
  if (messagePollingInterval.value) {
    clearInterval(messagePollingInterval.value);
    messagePollingInterval.value = null;
  }

  activeConversationId.value = id;
  messages.value = []; // 清空旧消息
  isMutuallyFollowing.value = false; // 重置互关状态
  isLoadingMessages.value = true;

  try {
    // 1. 检查互关状态
    const mutualFollowRes = await checkMutualFollow(currentUserId.value, id);
    if (mutualFollowRes && mutualFollowRes.code === 1) { // 假设 code 1 表示互相关注
      isMutuallyFollowing.value = true;

      // 2. 如果互相关注，加载聊天记录
      const messagesRes = await fetchMessages(currentUserId.value, id);
      if (messagesRes && messagesRes.data && messagesRes.data.list) {
        // 格式化消息数据以匹配模板
        const fetchedMessages = messagesRes.data.list.map(msg => ({
          id: msg.ID,
          sender: msg.SenderID === currentUserId.value ? 'me' : 'other',
          text: msg.Content,
          time: new Date(msg.SentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // 格式化时间
          avatar: msg.SenderID === currentUserId.value ? currentUser.value.avatar : activeConversation.value?.avatar
        })).reverse(); // API 返回的是最新的在前面，需要反转

        // 仅在消息列表实际更新时才赋值和滚动
        if (JSON.stringify(messages.value) !== JSON.stringify(fetchedMessages)) {
            messages.value = fetchedMessages;
            scrollToBottom();
        }

        // 启动轮询
        if (!messagePollingInterval.value) {
            messagePollingInterval.value = setInterval(pollMessages, 3000);
        }

      } else {
        console.warn('获取消息列表响应格式不正确或为空:', messagesRes);
        messages.value = []; // 清空以防显示旧数据
      }
    } else {
      // 未互相关注
      ElMessage.info('双方互相关注后才能查看消息和发送私信。');
      messages.value = []; // 清空消息
      // 未互关也需要清除定时器（如果之前启动过）
      if (messagePollingInterval.value) {
        clearInterval(messagePollingInterval.value);
        messagePollingInterval.value = null;
      }
    }
  } catch (error) {
    console.error(`加载与用户 ${id} 的聊天信息失败:`, error);
    ElMessage.error('加载聊天信息失败，请稍后重试');
    messages.value = []; // 清空消息
    // 出错时也清除定时器
    if (messagePollingInterval.value) {
        clearInterval(messagePollingInterval.value);
        messagePollingInterval.value = null;
    }
  } finally {
    isLoadingMessages.value = false;
  }
};

// 新增：轮询获取新消息
const pollMessages = async () => {
    if (!activeConversationId.value || !isMutuallyFollowing.value || !currentUserId.value) {
        // 如果没有选中会话或非互关，停止轮询
        if (messagePollingInterval.value) {
            clearInterval(messagePollingInterval.value);
            messagePollingInterval.value = null;
        }
        return;
    }

    try {
        const messagesRes = await fetchMessages(currentUserId.value, activeConversationId.value);
        if (messagesRes && messagesRes.data && messagesRes.data.list) {
            const fetchedMessages = messagesRes.data.list.map(msg => ({
                id: msg.ID,
                sender: msg.SenderID === currentUserId.value ? 'me' : 'other',
                text: msg.Content,
                time: new Date(msg.SentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: msg.SenderID === currentUserId.value ? currentUser.value.avatar : activeConversation.value?.avatar
            })).reverse();

            // 比较消息列表是否有变化，避免不必要的更新和滚动
            if (JSON.stringify(messages.value) !== JSON.stringify(fetchedMessages)) {
                const scrollbar = chatScrollbarRef.value;
                const isAtBottom = !scrollbar || !scrollbar.wrapRef || (scrollbar.wrapRef.scrollHeight - scrollbar.wrapRef.scrollTop - scrollbar.wrapRef.clientHeight < 1);

                messages.value = fetchedMessages;

                // 只有当滚动条在底部时才自动滚动
                if (isAtBottom) {
                    scrollToBottom();
                }
            }
        } else {
            // 获取失败或无消息，可以考虑是否停止轮询或打印日志
            console.warn('轮询消息失败或无新消息:', messagesRes);
        }
    } catch (error) {
        console.error('轮询消息 API 请求失败:', error);
        // 发生错误时停止轮询，避免连续失败
        if (messagePollingInterval.value) {
            clearInterval(messagePollingInterval.value);
            messagePollingInterval.value = null;
        }
        // 可以选择性地提示用户
        // ElMessage.error('自动刷新消息失败');
    }
};

// 方法：发送消息
const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text || !activeConversationId.value || !currentUserId.value) return;

  // 发送前再次确认是否互相关注 (可选，但更安全)
  if (!isMutuallyFollowing.value) {
      ElMessage.warning('双方互相关注后才能发送私信。');
      return;
  }

  const receiverId = activeConversationId.value;
  const receiverName = activeConversation.value?.name; // 获取接收者名字
  const senderId = currentUserId.value;
  const senderName = currentUser.value.name; // 获取发送者名字

  if (!receiverName) {
      ElMessage.error('无法获取接收者信息');
      return;
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 构造临时消息用于立即显示
  const tempMsg = {
    id: Date.now(), // 临时 ID
    sender: 'me',
    text: text,
    time: timeString,
    avatar: currentUser.value.avatar
  };
  messages.value.push(tempMsg);
  newMessage.value = ''; // 清空输入框
  scrollToBottom(); // 发送消息后滚动到底部

  try {
    // 调用 API 发送消息
    const response = await sendMessageApi({
      sender_id: senderId,
      sender_name: senderName,
      receiver_id: receiverId,
      receiver_name: receiverName,
      content: text
      // message_type 不再需要，根据新接口调整
    });

    // 注意：后端接口返回的 code 可能不是 200，需要根据实际情况调整
    // 假设后端成功返回 code 为 1 或其他表示成功的状态码
    if (response && response.code === 200) { // 根据实际后端成功 code 调整
      console.log('消息发送成功:', response.data);
      // 可选：用后端返回的实际消息替换临时消息，如果需要准确的 ID 和时间戳
      // const sentMsg = response.data;
      // const index = messages.value.findIndex(m => m.id === tempMsg.id);
      // if (index !== -1) {
      //   messages.value.splice(index, 1, {
      //     id: sentMsg.ID,
      //     sender: 'me',
      //     text: sentMsg.Content,
      //     time: new Date(sentMsg.SentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      //     avatar: currentUser.value.avatar
      //   });
      // }
      // 更新会话的最后消息和时间 (如果需要实时更新左侧列表)
      const convIndex = conversations.value.findIndex(c => c.id === receiverId);
      if (convIndex !== -1) {
          conversations.value[convIndex].lastMessage = text;
          conversations.value[convIndex].time = timeString;
          // 将此会话移到顶部 (可选)
          const currentConv = conversations.value.splice(convIndex, 1)[0];
          conversations.value.unshift(currentConv);
      }
    } else {
      console.error('消息发送失败:', response);
      ElMessage.error(response?.message || '消息发送失败');
      // 移除发送失败的临时消息
      const index = messages.value.findIndex(m => m.id === tempMsg.id);
      if (index !== -1) {
        messages.value.splice(index, 1);
      }
    }
  } catch (error) {
    console.error('发送消息 API 请求失败:', error);
    ElMessage.error('消息发送失败，请检查网络连接');
    // 移除发送失败的临时消息
    const index = messages.value.findIndex(m => m.id === tempMsg.id);
    if (index !== -1) {
      messages.value.splice(index, 1);
    }
  }
};

// 方法：滚动聊天记录到底部
const scrollToBottom = () => {
  nextTick(() => {
    const scrollbar = chatScrollbarRef.value;
    if (scrollbar && scrollbar.wrapRef) {
      // 使用 scrollbar.setScrollTop 平滑滚动
      scrollbar.setScrollTop(scrollbar.wrapRef.scrollHeight);
    }
  });
};

// 监听消息变化，自动滚动 (修改为仅在用户发送消息时强制滚动)
// watch(messages, () => {
//   scrollToBottom();
// }, { deep: true });

// 组件挂载后加载关注列表
onMounted(() => {
  loadFollowingList();
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (messagePollingInterval.value) {
    clearInterval(messagePollingInterval.value);
  }
});

// 监听 activeConversationId 变化，如果变为 null，清除定时器
watch(activeConversationId, (newId) => {
    if (!newId && messagePollingInterval.value) {
        clearInterval(messagePollingInterval.value);
        messagePollingInterval.value = null;
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
  position: relative; /* 为提示信息定位 */
}

.chat-content-scrollbar {
  height: 100%;
}

.chat-content {
  padding: 20px;
}

/* 未互关提示 */
.not-mutual-follow-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(247, 248, 250, 0.8); /* 半透明背景 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10; /* 确保在消息之上 */
    color: #86909c;
    font-size: 14px;
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