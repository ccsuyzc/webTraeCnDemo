<template>
  <div class="comment-tree">
    <div v-for="comment in comments" :key="comment.ID" class="comment-item">
      <div class="comment-main">
        <span class="comment-author">{{ comment.UserID ? (comment.User.Username || '用户'+comment.UserID) : '匿名' }}：</span>
        <span class="comment-text">{{ comment.Content }}</span>
        <span class="comment-meta">{{ comment.CreatedAt }}</span>
        <span class="reply-btn" @click="showReplyInput(comment.ID)">回复</span>
      </div>
      <div v-if="replyInputVisible[comment.ID]" class="reply-editor">
        <textarea v-model="replyText[comment.ID]" placeholder="回复..."></textarea>
        <button @click="submitReply(comment)">提交</button>
        <button @click="hideReplyInput(comment.ID)">取消</button>
      </div>
      <div v-if="comment.Replies && comment.Replies.length > 0" class="comment-children">
        <CommentTree :comments="comment.Replies" :postId="props.postId" @reply="$emit('reply', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, reactive } from 'vue';
const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  postId: {
    type: [String, Number],
    required: true
  }
});
const emit = defineEmits(['reply']);
const replyInputVisible = reactive({});
const replyText = reactive({});
function showReplyInput(commentId) {
  replyInputVisible[commentId] = true;
  replyText[commentId] = '';
}
function hideReplyInput(commentId) {
  replyInputVisible[commentId] = false;
  replyText[commentId] = '';
}
function submitReply(comment) {
  if (!replyText[comment.ID] || !replyText[comment.ID].trim()) return;
  emit('reply', {
    parentId: comment.ID,
    content: replyText[comment.ID],
    postId: props.postId // 新增，确保每次回复都带上 postId
  });
  hideReplyInput(comment.ID);
}
</script>

<style scoped>
.comment-tree {
  margin-left: 0;
}
.comment-item {
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 2px solid #f0f0f0;
}
.comment-main {
  font-size: 13px;
  margin-bottom: 2px;
}
.comment-author {
  font-weight: 500;
  color: #515767;
  margin-right: 5px;
}
.comment-text {
  color: #333;
}
.comment-meta {
  color: #aaa;
  font-size: 12px;
  margin-left: 8px;
}
.reply-btn {
  color: #1e80ff;
  margin-left: 10px;
  cursor: pointer;
  font-size: 12px;
}
.reply-editor {
  margin: 6px 0 6px 0;
}
.reply-editor textarea {
  width: 90%;
  min-height: 36px;
  resize: vertical;
  font-size: 13px;
  margin-bottom: 4px;
}
.reply-editor button {
  margin-right: 8px;
  font-size: 12px;
}
.comment-children {
  margin-left: 18px;
  border-left: 1px dashed #e0e0e0;
  padding-left: 8px;
}
</style>