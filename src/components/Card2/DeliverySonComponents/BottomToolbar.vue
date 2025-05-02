<template>
    <div class="bottom-toolbar" :class="{ visible: props.selectedCount > 0 }">
      <div class="counter">{{ props.selectedCount }} 选中项</div>
      <div class="actions">
        <el-button size="small" @click="emit('clear-selection')">清除选择</el-button>
        <el-button type="primary" size="small" @click="emit('download-selected')">
          下载 ({{ props.selectedCount }})
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    selectedCount: {
      type: Number,
      default: 0
    }
  });

  const emit = defineEmits(['clear-selection', 'download-selected']);
  </script>
  
  <style scoped>
  /* 保持原有底部工具栏样式 */
  /* Styles seem compatible, no changes needed unless specific adjustments for Element Plus are required */
  .bottom-toolbar {
    /* Example: Add some basic styling if missing */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 10px 20px;
    box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.3s ease-in-out;
    transform: translateY(100%);
    z-index: 100;
  }

  .bottom-toolbar.visible {
    transform: translateY(0);
  }

  .counter {
    color: #606266;
  }

  .actions .el-button + .el-button {
    margin-left: 10px;
  }
  </style>