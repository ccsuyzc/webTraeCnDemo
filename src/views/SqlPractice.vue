<template>
  <div class="sql-practice-page">
    <el-row :gutter="20">
      <!-- Left Side: Question Board -->
      <el-col :span="10">
        <el-card class="box-card question-board-card">
          <template #header>
            <div class="card-header">
              <span>题目描述 - {{ currentLevel?.title }}</span>
            </div>
          </template>
          <QuestionBoard v-if="currentLevel" :level="currentLevel" :resultStatus="resultStatus" />
          <div v-else>
            <p>正在加载关卡信息...</p>
          </div>
        </el-card>
      </el-col>

      <!-- Right Side: Editor and Results -->
      <el-col :span="14">
        <!-- SQL Editor -->
        <el-card class="box-card sql-editor-card">
          <template #header>
            <div class="card-header">
              <span>SQL 编辑器</span>
            </div>
          </template>
          <SqlEditor
            v-if="currentLevel"
            :level="currentLevel"
            :editorStyle="{ height: '300px' }" 
            :resultStatus="resultStatus"
            @submit="handleSqlSubmit"
          />
           <div v-else>
            <p>等待关卡加载...</p>
          </div>
        </el-card>

        <!-- Results -->
        <el-card class="box-card sql-result-card" style="margin-top: 20px;">
          <SqlResult
            :result="sqlResult"
            :answerResult="answerResult"
            :resultStatus="resultStatus"
            :errorMsg="errorMsg"
            :level="currentLevel"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElRow, ElCol, ElCard, ElMessage } from 'element-plus';

// Import components from sql-mother subproject
import QuestionBoard from '../../code/sql-mother-master/src/components/QuestionBoard.vue';
import SqlEditor from '../../code/sql-mother-master/src/components/SqlEditor.vue';
import SqlResult from '../../code/sql-mother-master/src/components/SqlResult.vue';

// Import level data and helpers from sql-mother
import { getLevelByKey } from '../../code/sql-mother-master/src/levels';
import { checkResult, RESULT_STATUS_ENUM } from '../../code/sql-mother-master/src/core/result';
// Assuming LevelType is globally available or defined elsewhere if needed
// import type { LevelType } from '../../code/sql-mother-master/src/types';
// Assuming QueryExecResult is globally available or defined elsewhere if needed
// import type { QueryExecResult } from 'sql.js';

const route = useRoute();
const router = useRouter();

const levelKey = ref(route.params.levelKey);
const currentLevel = ref(null); // Use null initially: ref<LevelType | null>(null);
const sqlResult = ref([]); // ref<QueryExecResult[]>([]);
const answerResult = ref([]); // ref<QueryExecResult[]>([]);
const resultStatus = ref(RESULT_STATUS_ENUM.DEFAULT); // ref<number>(RESULT_STATUS_ENUM.DEFAULT);
const errorMsg = ref(''); // ref<string>('');

// Function to load level data
const loadLevel = (key) => {
  const level = getLevelByKey(key);
  if (level) {
    currentLevel.value = level;
    // Reset state for the new level
    sqlResult.value = [];
    answerResult.value = [];
    resultStatus.value = RESULT_STATUS_ENUM.DEFAULT;
    errorMsg.value = '';
  } else {
    console.error(`Level with key '${key}' not found.`);
    ElMessage.error(`关卡 ${key} 加载失败`);
    currentLevel.value = null; // Ensure level is null if not found
    // Optionally redirect or show an error message
    // router.push('/sql-levels');
  }
};

// Handle SQL submission from SqlEditor component
const handleSqlSubmit = (sql, result, ansResult, errMsg) => {
  sqlResult.value = result;
  answerResult.value = ansResult;
  errorMsg.value = errMsg || ''; // Ensure errorMsg is empty string if undefined

  if (errMsg) {
    resultStatus.value = RESULT_STATUS_ENUM.ERROR;
    // ElMessage.error(`SQL 执行错误: ${errMsg}`); // SqlEditor already shows message
  } else {
    // Check the result if there's no error
    const status = checkResult(result, ansResult, currentLevel.value);
    resultStatus.value = status;
    if (status === RESULT_STATUS_ENUM.SUCCEED) {
      ElMessage.success('恭喜，通过本关！');
    } else if (status === RESULT_STATUS_ENUM.WRONG) {
      ElMessage.error('结果不正确，请检查 SQL 语句');
    }
  }
};

// Load level data when the component mounts
onMounted(() => {
  loadLevel(levelKey.value);
});

// Watch for route changes to load new levels if navigating between practice pages
watch(() => route.params.levelKey, (newKey) => {
  if (newKey && newKey !== levelKey.value) {
    levelKey.value = newKey;
    loadLevel(newKey);
  }
});

</script>

<style scoped>
.sql-practice-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px); /* Adjust based on your nav bar height */
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: calc(100vh - 100px); /* Adjust based on padding and potential header */
  display: flex;
  flex-direction: column;
}

.box-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.box-card :deep(.el-card__body) {
  padding: 20px;
  flex-grow: 1;
  overflow: hidden; /* Prevent content overflow */
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

/* Specific card adjustments */
.question-board-card :deep(.el-card__body) {
  overflow-y: auto; /* Allow scrolling for question content */
}

.sql-editor-card {
  height: auto; /* Let editor define height */
  margin-bottom: 20px;
}

.sql-result-card {
  height: auto; /* Let result content define height */
  flex-grow: 1; /* Allow result card to take remaining space */
}

.sql-result-card :deep(.el-card__body) {
  overflow-y: auto; /* Allow scrolling for results */
}

/* Ensure components inside cards take appropriate space */
.question-board-card > :deep(.el-card__body) > div,
.sql-editor-card > :deep(.el-card__body) > div,
.sql-result-card > :deep(.el-card__body) > div {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Style for QuestionBoard internal card if needed */
:deep(#questionBoard #questionCard) {
  border: none !important;
  box-shadow: none !important;
  height: 100%;
  max-height: none; /* Override sql-mother style */
  min-height: auto; /* Override sql-mother style */
}

/* Style for SqlResult internal card */
:deep(#sqlResult) {
   border: none !important;
   box-shadow: none !important;
   height: 100%;
   max-height: none; /* Override sql-mother style */
   padding: 0 !important; /* Remove internal padding if desired */
}

:deep(#sqlResult .ant-card-head) { /* Target Ant Design header if SqlResult uses it */
  padding: 0 0 10px 0;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
}

:deep(#sqlResult .ant-card-body) { /* Target Ant Design body */
  padding: 10px 0 0 0;
  flex-grow: 1;
  overflow-y: auto;
}


</style>