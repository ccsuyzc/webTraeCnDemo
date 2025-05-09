import { defineStore } from 'pinia';
import { loginWithAccount } from '@/api/auth'; // 假设你的 API 调用在这里
import router from '@/router'; // 引入 router

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('userInfo')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    getUser: (state) => state.user,
    getToken: (state) => state.token,
  },
  actions: {
    async login(username, password) {
      try {
        const response = await loginWithAccount(username, password);
        // 假设响应包含 token 和用户信息
        const { token, data } = response.data; 

        this.token = token;
        this.user = data;
        this.isAuthenticated = true;

        // 将 token 和用户信息存储到 localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('userInfo', JSON.stringify(data));

        // 登录成功后可以跳转到首页或其他页面
        router.push('/'); 
        return true; // 表示登录成功
      } catch (error) {
        console.error('Login failed:', error);
        this.logout(); // 登录失败时清空状态
        return false; // 表示登录失败
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userInfo');
      // 登出后跳转到登录页
      router.push('/login');
    },
    // 应用启动时检查本地存储
    checkAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('userInfo');
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
      } else {
        this.logout(); // 如果本地没有，确保状态是登出状态
      }
    },
    // 新增：更新用户信息 Action
    updateUserInfo(newUserInfo) {
      // 合并现有用户数据和新数据
      const updatedUser = { ...this.user, ...newUserInfo };
      this.user = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userInfo', JSON.stringify(updatedUser)); // 保持一致性
      console.log('AuthStore user info updated:', this.user);
    },

    // 该函数用来更新仓库的数据
    updateUser(user, token) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;
    }
  },
});