

<script setup>
import { ref, onMounted } from 'vue'; // Import onMounted
import { useArticleStore } from '../store/articleStore'; // 导入 article store
import { fetchCategories } from '../api/articles'; // 导入获取分类的 API 函数

const activeIndex = ref(0);
// 初始化 navItems，包含固定的“推荐”项
const navItems = ref([
  { name: '推荐', tag: '推荐' }, // 固定推荐项
]);

const articleStore = useArticleStore(); // 获取 store 实例

// 组件挂载时获取分类数据并加载推荐文章
onMounted(async () => {
  try {
    const categories = await fetchCategories();
    // 将获取到的分类添加到 navItems，注意转换格式
    const categoryItems = categories.map(cat => ({ name: cat.Name, tag: cat.ID })); // 使用分类 ID 作为 tag
    navItems.value = [navItems.value[0], ...categoryItems]; // 将分类添加到“推荐”后面
  } catch (error) {
    console.error('Failed to load categories:', error);
    // 可以在这里添加用户提示
  }
  // 初始加载推荐文章
  await articleStore.loadArticles('推荐');
});

const handleTagClick = (tag, index) => {
  activeIndex.value = index;
  console.log('Clicked tag/ID:', tag); // tag 现在可能是 '推荐' 或 分类ID
  articleStore.loadArticles(tag); // 调用修改后的 action
};
</script>

<template>
  <nav class="navbar"> <!-- Use nav tag and navbar class -->
    <div class="logo">
      <img src="/vite.svg" alt="Logo" />
      <span>TraeCN</span> <!-- Keep logo text from second template -->
    </div>
    <ul class="nav-list">
      <li
        v-for="(item, index) in navItems"
        :key="index"
        :class="['nav-item', { active: activeIndex === index }]"
        @click="handleTagClick(item.tag, index)"
      >
        {{ item.name }}
      </li>
    </ul>
  </nav>

  <!-- <template>
  <nav class="navbar">
    <div class="logo">
      <img src="/vite.svg" alt="Logo" />
      <span>掘土掘金</span>
    </div>
    <ul class="nav-list">
      <li class="nav-item active">综合</li>
      <li class="nav-item">关注</li>
      <li class="nav-item">GOlang</li>
      <li class="nav-item">前端</li>
      <li class="nav-item">Android</li>
      <li class="nav-item">iOS</li>
      <li class="nav-item">人工智能</li>
      <li class="nav-item">开发工具</li>
      <li class="nav-item">代码人生</li>
      <li class="nav-item">阅读</li>
      <li class="nav-item">排行榜</li>
    </ul>
  </nav>
</template> -->
</template>

<style scoped>
.navbar {
  width: 240px;
  min-height: 600px;
  max-height: 900px;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  margin-top: 40px;
  margin-left: 40px;
  border-radius: 18px;
  box-shadow: 0 4px 16px 0 #f2f3f5;
  padding: 32px 0 32px 0;
}
.logo {
  display: flex;
  align-items: center;
  margin: 32px 0 24px 0;
  font-weight: bold;
  font-size: 22px;
  color: #1e80ff;
}
.logo img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}
.nav-list {
  list-style: none;
  padding: 0;
  width: 100%;
}
.nav-item {
  padding: 16px 36px;
  cursor: pointer;
  color: #333;
  font-size: 17px;
  border-radius: 10px;
  margin-bottom: 6px;
  transition: background 0.2s, color 0.2s;
}
.nav-item.active,
.nav-item:hover {
  background: #f5f7fa;
  color: #1e80ff;
}
</style>