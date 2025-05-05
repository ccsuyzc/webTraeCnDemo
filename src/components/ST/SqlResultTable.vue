<template>
  <el-table
    class="sql-result-table"
    :data="resultData" 
    size="default"
    :pagination="{ hideOnSinglePage: true, pageSize: 20 }"
    border
    stripe
    style="width: 100%"
  >
    <el-table-column
      v-for="column in columns"
      :key="column.dataIndex"
      :prop="column.dataIndex"
      :label="column.title"
    />
  </el-table>
</template>

<script setup>
import { computed, toRefs } from "vue";
// import { QueryExecResult } from "sql.js";

// interface SqlResultProps {
//   result: QueryExecResult[];
// }

const props = defineProps({
  result: {
    type: Array,
    default: () => [],
  },
});

// e.g. [{"columns":["a","b"],"values":[[0,"hello"],[1,"world"]]}]
const { result } = toRefs(props);

// 结果表格列头
const columns = computed(() => {
  if (result?.value?.[0]?.columns) {
    return result.value[0].columns.map((column) => {
      return {
        title: column,
        dataIndex: column,
      };
    });
  }
  return [];
});

// 结果表格数据
const resultData = computed(() => {
  if (!result?.value?.[0]?.values) {
    return [];
  }
  const tempColumns = result.value[0].columns;
  return result.value[0].values.map((originRow) => {
    const rowData = {};
    originRow.forEach((col, index) => {
      // Ensure the key exists before assigning
      if (tempColumns[index] !== undefined) {
         rowData[tempColumns[index]] = col === null ? 'NULL' : col; // Display NULL for null values
      }
    });
    return rowData;
  });
});
</script>

<style>
.sql-result-table .el-table__cell {
  padding: 8px 0; /* Adjust padding as needed */
}
</style>
