// src/store/articleStore.js
import { defineStore } from 'pinia';
import { fetchRecommendedArticles, fetchArticlesByCategory } from '../api/articles';

export const useArticleStore = defineStore('articles', {
  state: () => ({
    articles: [], // 文章列表
    currentTag: '推荐', // 当前选中的标签或分类ID，默认为推荐
    isLoading: false, // 是否正在加载
    error: null, // 错误信息
  }),
  actions: {
    // 重命名 action 并更新逻辑
    async loadArticles(tagOrId) {
      if (this.isLoading) return; // 防止重复加载
      this.isLoading = true;
      this.error = null;
      this.currentTag = tagOrId;
      // 根据用户要求调整获取数量：推荐 5 篇，分类 2 篇
      let count;

      try {
        let data;
        if (tagOrId === '推荐') {
          count = 5; // 获取 5 篇推荐文章
          console.log(`Fetching recommended articles (count: ${count})`);
          data = await fetchRecommendedArticles(count);
        } else {
          count = 5; // 获取 25篇分类文章
          console.log(`Fetching articles for category ${tagOrId} (count: ${count})`);
          data = await fetchArticlesByCategory(tagOrId, count);
        }
        this.articles = data;
      } catch (err) {
        console.error(`Error loading articles for ${tagOrId}:`, err);
        this.error = '加载文章失败，请稍后再试。';
        this.articles = []; // 出错时清空列表
      } finally {
        this.isLoading = false;
      }
    },
    // 可以在这里添加其他 actions，例如加载文章详情等
  },
  getters: {
    // 可以添加 getters，例如根据 ID 获取特定文章等
    getArticleById: (state) => (id) => {
      return state.articles.find(article => article.id === id);
    },
  },
});