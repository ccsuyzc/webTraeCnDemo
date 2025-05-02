import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/authStore'; // 引入 auth store
import UserSettings from '../views/UserSettings.vue'
import CreatorCenter from '../views/CreatorCenter.vue'
import Editor from '../views/Editor.vue'
import Drafts from '../views/Drafts.vue'
import Stats from '../views/Stats.vue'
import SearchView from '../views/SearchView.vue' // Import the new SearchView
import Home from '../views/Home.vue'
import User from '../views/User.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import AICoding from '../views/AICoding.vue'
import Forum from '../views/Forum.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Courses from '../views/Courses.vue'
import Practice from '../views/Practice.vue'
import Chat from '../views/Chat.vue'


const routes = [
  { path: '/', component: Home },
  { path: '/creator', component: CreatorCenter }, // 创作者中心
  { path: '/drafts/:userId', component: Drafts }, // 草稿箱
  { path: '/stats/:userId', component: Stats }, // 统计
  { path: '/user/:id', component: User }, // 用户
  { path: '/article/:id', component: ArticleDetail }, // 文章详情
  { path: '/ai', component: AICoding }, // AI
  { path: '/forum', component: Forum }, // 论坛
  { path: '/login', component: Login }, // 登录
  { path: '/register', component: Register }, // 注册
  { path: '/editor', component: Editor }, // 编辑器
  { path: '/editor/:id', component: Editor }, // 编辑器    
  { path: '/courses', component: Courses }, // 课程
  { path: '/practice', component: Practice }, // 练习
  { path: '/settings', component: UserSettings }, // 设置
  { path: '/chat', component: Chat },
  { path: '/chat/:userId', component: Chat },
  { path: '/creator/stats', component: Stats, meta: { requiresAuth: true } }, // 统计数据
  { path: '/search', component: SearchView }, // Add the search route
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {

  const authStore = useAuthStore(); // 引入 auth store
  const requiresAuth = ['CreatorCenter', 'EditorNew', 'EditorEdit', 'AI', 'User', 'UserSettings', 'Drafts', 'Stats']; // 需要登录的路由名称
  const publicPages = ['Login', 'Register']; // 公开页面（登录后不应访问）
  const authRequired = requiresAuth.includes(to.name); // 判断是否需要登录
  const loggedIn = authStore.isLoggedIn; // 判断是否已登录
  const isPublicPage = publicPages.includes(to.name); // 判断是否是公开页面

  // 如果尝试访问需要登录的页面但未登录
  if (authRequired && !loggedIn) { 
    console.log('Navigation blocked: requires auth, not logged in. Redirecting to /login');
    return next({ name: 'Login', query: { redirect: to.fullPath } }); // 重定向到登录页，并带上原目标路径
  }
  // 如果已登录，但尝试访问登录或注册页面
  if (loggedIn && isPublicPage) {
    console.log('Navigation blocked: already logged in, trying to access public page. Redirecting to /');
    return next({ name: 'Home' }); // 重定向到首页
  }

  // 其他情况，允许导航
  next();
});

export default router;