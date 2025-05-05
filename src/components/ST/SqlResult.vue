<template>
  <el-card
    id="sqlResult"
    title="执行结果"
    :extra="RESULT_STATUS_INFO_MAP[resultStatus]"
    :bordered="false"
    style="max-height: 420px; overflow-y: auto"
  >
    <!-- 1. 显示错误信息 -->
    <div v-if="errorMsg">❌ 语句错误：{{ errorMsg }}</div>

    <!-- 2. 如果已执行查询 (status 不是 DEFAULT) -->
    <template v-else-if="resultStatus !== RESULT_STATUS_ENUM.DEFAULT">
      <!-- 2a. 显示用户查询结果 -->
      <sql-result-table v-if="result && result.length > 0 && result[0]?.columns && result[0]?.values" :result="result" />
      <!-- 2b. 显示查询成功但无结果 -->
      <div v-else>查询成功，无结果显示。</div>
    </template>

    <!-- 3. 如果是初始状态 (status 是 DEFAULT) -->
    <template v-else-if="resultStatus === RESULT_STATUS_ENUM.DEFAULT">
      <!-- 3a. 显示初始数据 -->
      <sql-result-table v-if="initialResult && initialResult.length > 0 && initialResult[0]?.columns && initialResult[0]?.values" :result="initialResult" title="初始数据" />
      <!-- 3b. 提示用户运行 SQL -->
      <div v-else>请在上方编辑器中输入 SQL 并运行。</div>
    </template>

    <!-- 4. 保底情况 (理论上不应到达) -->
    <div v-else>等待查询...</div>
  </el-card>
</template>

<script setup>
import { toRefs } from "vue";
import SqlResultTable from "./SqlResultTable.vue";
import { RESULT_STATUS_INFO_MAP, RESULT_STATUS_ENUM } from "../../core/result"; // 引入 RESULT_STATUS_ENUM

const props = defineProps({
  result: {
    type: Array,
    default: () => [],
  },
  // 新增：接收初始数据
  initialResult: {
    type: Array,
    default: () => [],
  },
  answerResult: {
    type: Array,
    default: () => [],
  },
  resultStatus: {
    type: Number,
    required: true,
  },
  errorMsg: {
    type: String,
    default: "",
  },
  level: {
    type: Object,
    default: undefined,
  },
});

const { result, initialResult, resultStatus, errorMsg } = toRefs(props); // 解构新增的 prop
</script>