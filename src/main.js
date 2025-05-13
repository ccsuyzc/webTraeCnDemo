import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import pinia from './store'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入编辑器
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
// highlightjs
import hljs from 'highlight.js';
// 引入 Pinia store
import { useAuthStore } from './store/authStore';

VMdEditor.use(githubTheme, {
  Hljs: hljs,
});

//  引入预览组件
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css'
VMdPreview.use(githubTheme, {
    Hljs: hljs,
  });

const app = createApp(App)
app.use(pinia)

// 在挂载路由之前检查认证状态
const authStore = useAuthStore(pinia); // Pass pinia instance
authStore.checkAuth();

app.use(router)
app.use(ElementPlus) // 使用 Element Plus
app.use(VMdEditor); // 使用 VMdEditor编辑器
app.use(VMdPreview); // 使用 VMdPreview预览组件
app.mount('#app')















