<template>
    <el-card shadow="never" class="mb-20">
      <el-row type="flex" align="middle">
        <el-checkbox
          :model-value="props.selectAll" 
          :indeterminate="props.isIndeterminate"
          @update:modelValue="handleLocalSelectAllUpdate" 
          @click="handleSelectAllClick" 
        >
          全选
        </el-checkbox>
        <div class="total-count">
          共 {{ props.total }} 个视频
        </div>
      </el-row>
    </el-card>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';

  const props = defineProps({
    selectAll: Boolean,
    isIndeterminate: Boolean,
    total: Number
  });

  const emit = defineEmits(['update:selectAll', 'change']);

  // Handle the checkbox internal model update
  const handleLocalSelectAllUpdate = (value) => {
    // This primarily handles the indeterminate state clearing when clicked
    // The actual logic is in handleSelectAllClick
  };

  // Handle the click event which triggers the actual state change logic
  const handleSelectAllClick = () => {
    console.log("点击了全选按钮, 当前状态:", props.selectAll);
    // Emit 'change' event with the *intended* new state
    emit('change', !props.selectAll);
    // Also emit 'update:selectAll' to potentially sync parent if needed directly,
    // though 'change' is usually preferred for action triggers.
    emit('update:selectAll', !props.selectAll);
  };

  </script>
  
  <style scoped>
  .el-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }
  
  .el-row {
    padding: 12px 20px;
  }
  
  .total-count {
    margin-left: auto;
    color: #909399;
    font-size: 14px;
  }
  
  /* Element Plus 复选框自定义 */
  /* Use :deep() for scoped styles targeting child components */
  :deep(.el-checkbox .el-checkbox__input.is-indeterminate .el-checkbox__inner) {
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
  </style>