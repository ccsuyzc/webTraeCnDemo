<template>
  <div id="sqlEditor">
    <div ref="editorRef" :style="editorStyle" />
    <el-space :size="16" style="margin-top: 16px">
      <el-button
        type="primary"
        style="width: 180px"
        @click="doSubmit"
        :disabled="!isReady" 
      >
        运行
      </el-button>
      <el-button @click="doFormat">格式化</el-button>
      <el-button @click="doReset">重置</el-button>
    </el-space>
  </div>
</template>

<script setup>
import {
  // CSSProperties,
  computed, // 引入 computed
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  defineProps,
  ref,
  toRaw,
  toRefs,
  watchEffect,
  defineEmits, // 添加 defineEmits
} from "vue";
import * as monaco from "monaco-editor";
import { format } from "sql-formatter";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { initDB, runSQL } from "../../core/sqlExecutor";
import { ElMessage } from "element-plus";

// 配置 Monaco 环境
self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

const props = defineProps({
  level: {
    type: Object,
    required: true,
  },
  editorStyle: {
    type: Object,
    // default: undefined, // Default is already undefined for Object type
  },
  resultStatus: {
    type: Number,
    required: true,
  },
  onSubmit: {
    type: Function,
    required: true,
  },
});

// 添加 emits 定义
const emit = defineEmits(['submit', 'initialDataLoaded']);

const { level } = toRefs(props);
const inputEditor = ref();
const editorRef = ref();
const db = ref();

// 计算属性，判断编辑器和数据库是否准备就绪
const isReady = computed(() => !!inputEditor.value && !!db.value);

// 添加组件状态控制
const isMounted = ref(true)
const pendingOperations = new Set()

/**
 * 获取初始表数据
 */
const fetchInitialData = async () => {
  if (!db.value || !level.value?.displayTableSQL) {
    console.log("DB not ready or no displayTableSQL for fetchInitialData");
    emit('initialDataLoaded', []); // 如果没有初始查询SQL，传递空数组
    return;
  }
  try {
    const operationId = Symbol();
    pendingOperations.add(operationId);
    console.log("Fetching initial data...");
    const initialData = runSQL(toRaw(db.value), level.value.displayTableSQL);
    if (isMounted.value && pendingOperations.has(operationId)) {
      console.log("Initial data fetched:", initialData);
      emit('initialDataLoaded', initialData);
    }
    pendingOperations.delete(operationId);
  } catch (error) {
    console.error("获取初始数据失败: ", error);
    if (isMounted.value && pendingOperations.has(operationId)) {
      ElMessage.error("获取初始表数据失败: " + error.message);
      emit('initialDataLoaded', []); // 出错时传递空数组
    }
     pendingOperations.delete(operationId);
  }
};

watchEffect(async () => {
  // 初始化 / 更新默认 SQL
  if (inputEditor.value) {
    toRaw(inputEditor.value).setValue(
      "-- 请在此处输入 SQL\n" + level.value.defaultSQL
    );
  }
  // 初始化 / 更新 DB
  if (level.value?.initSQL) {
    const operationId = Symbol();
    pendingOperations.add(operationId);
    try {
      console.log("Initializing DB with initSQL...");
      // 确保在组件挂载状态下才更新 db.value
      const initializedDb = await initDB(level.value.initSQL);
      if (isMounted.value && pendingOperations.has(operationId)) {
        db.value = initializedDb;
        console.log("Database initialized successfully.");
        // 数据库初始化成功后，获取初始数据
        await fetchInitialData();
      }
    } catch (e) {
      console.error("数据库初始化失败：", e);
      if (isMounted.value && pendingOperations.has(operationId)) {
         ElMessage.error("数据库初始化失败: " + e.message);
         db.value = null; // Ensure db is null on failure
      }
    } finally {
        pendingOperations.delete(operationId);
    }
  } else {
    // 如果没有 initSQL，也尝试初始化一个空的 DB
    const operationId = Symbol();
    pendingOperations.add(operationId);
    try {
      console.log("Initializing DB (no specific SQL)...");
      const initializedDb = await initDB();
       if (isMounted.value && pendingOperations.has(operationId)) {
          db.value = initializedDb;
          console.log("Database initialized (no specific SQL).");
          // 即使没有 initSQL，也尝试获取初始数据（如果定义了 displayTableSQL）
          await fetchInitialData();
       }
    } catch (e) {
      console.error("数据库初始化失败：", e);
       if (isMounted.value && pendingOperations.has(operationId)) {
          ElMessage.error("数据库初始化失败: " + e.message);
          db.value = null;
       }
    } finally {
        pendingOperations.delete(operationId);
    }
  }
});

const doFormat = () => {
  try {
    if (!inputEditor.value) return;
    
    const editor = toRaw(inputEditor.value);
    const formatted = format(editor.getValue(), { 
      language: "sqlite",
      indent: "  ",  // 明确指定缩进
    });
    editor.setValue(formatted);
  } catch (error) {
    ElMessage.warning("格式化失败: " + error.message);
  }
};

const doReset = () => {
  if (inputEditor.value) {
    toRaw(inputEditor.value).setValue(
      "-- 请在此处输入 SQL\n" + level.value.defaultSQL
    );
    // 确保模拟 DB 也准备好了再提交
    if (db.value) {
       doSubmit();
    } else {
      console.log("模拟 DB not ready for doSubmit in doReset");
    }
  }
};

/**
 * 提交结果
 */
const doSubmit = () => {
  // 确保编辑器和数据库都已准备好
  if (!isReady.value) {
    ElMessage.warning("编辑器或数据库尚未准备就绪");
    return;
  }
  const inputSql = toRaw(inputEditor.value).getValue();
  console.log("Running SQL:", inputSql);
  let result = [];
  let answerResult = [];
  let errorMsg = '';

  try {
    // 执行用户 SQL
    result = runSQL(toRaw(db.value), inputSql);
    console.log("User SQL Result:", result);

    // 执行答案 SQL (如果存在)
    if (level.value.answer) {
      try {
        // 注意：执行答案 SQL 应该在一个独立的、干净的数据库实例上进行
        // 或者在执行完用户 SQL 后重新初始化数据库以获得正确答案
        // 这里为了简化，暂时在同一个 db 实例上执行，但这可能导致状态污染
        // 更好的做法是每次提交都重新初始化 DB 或克隆 DB 状态
        // 暂时先这样处理，后续可优化
        answerResult = runSQL(toRaw(db.value), level.value.answer);
        console.log("Answer SQL Result:", answerResult);
      } catch (ansError) {
        console.error("执行答案 SQL 失败:", ansError);
        // 答案执行失败不应阻止用户结果的显示，但可以记录
        // errorMsg = `答案 SQL 执行错误: ${ansError.message}`; // 或者不设置 errorMsg
      }
    }
  } catch (e) {
    console.error("执行用户 SQL 失败:", e);
    errorMsg = e.message;
    result = []; // 清空结果以防部分成功
    answerResult = [];
  }

  // 触发 submit 事件，传递实际结果或错误
  emit('submit', inputSql, result, answerResult, errorMsg);
};

onMounted(() => {
  isMounted.value = true; // 组件挂载时设置标志
  if (!editorRef.value) {
    return;
  }
  // hover 提示
  monaco.languages.registerHoverProvider("sql", {
    provideHover: function (model, position) {
      return {
        contents: [
          {
            value: "**SQL 编辑器**",
          },
          {
            value: "在此输入和编辑您的 SQL 查询。",
          },
        ],
      };
    },
  });
  // 输入提示
  monaco.languages.registerCompletionItemProvider("sql", {
    provideCompletionItems: function (
      model,
      position,
      context,
      token
    ) {
      // todo
      return {
        suggestions: [],
      };
    },
  });
  inputEditor.value = monaco.editor.create(editorRef.value, {
    value: "-- 请在此处输入 SQL", // 恢复默认值
    language: "sql",
    theme: "vs-dark",
    formatOnPaste: true,
    automaticLayout: true,
    fontSize: 16,
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
  });
});

// 使用 onBeforeUnmount
onBeforeUnmount(() => {
  isMounted.value = false; // 组件卸载前设置标志
  pendingOperations.clear(); // 清除所有待处理操作
  if (inputEditor.value) {
    toRaw(inputEditor.value).dispose();
  }
  // 添加数据库关闭逻辑
  if (db.value && typeof db.value.close === 'function') {
     try {
       db.value.close();
       console.log("Database closed.");
     } catch (e) {
       console.error("Error closing database:", e);
     }
  }
  db.value = null; // 清理 db 引用
});
</script>

<style>
#sqlEditor {
  position: relative;
  min-height: 400px;  /* 确保最小高度 */
}

#sqlEditor .monaco-editor {
  border-radius: 4px;
  overflow: hidden;
}
</style>