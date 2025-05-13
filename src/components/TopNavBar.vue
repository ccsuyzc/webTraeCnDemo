<template>
  <header class="top-navbar">
    <div class="top-navbar-left">
      <img src="/vite.svg" alt="Logo" class="top-logo" />
      <span class="top-title">Go博客平台</span>
    </div>
    <nav class="top-nav-list">
      <span class="top-nav-item" :class="{active: activeTab==='首页'}" @click="selectTab('首页')">首页</span>
      <span class="top-nav-item" :class="{active: activeTab==='AI Coding'}" @click="selectTab('AI Coding')">问ai</span>
      <span class="top-nav-item" :class="{active: activeTab==='圈子'}" @click="selectTab('圈子')">圈子</span>
      <span class="top-nav-item" :class="{active: activeTab==='课程'}" @click="selectTab('课程')">课程</span>
      <span class="top-nav-item" :class="{active: activeTab==='刷题'}" @click="selectTab('刷题')">刷题</span>
      <span class="top-nav-item" :class="{active: activeTab==='私信'}" @click="selectTab('私信')">私信</span>
      <span class="top-nav-item" :class="{active: activeTab==='APP'}" @click="selectTab('APP')">APP</span>
      <span class="top-nav-item" :class="{active: activeTab==='插件'}" @click="selectTab('插件')">插件</span>
    </nav>
    <div class="top-navbar-right">
      <div class="search-container">
        <input 
          class="search-input" 
          placeholder="探索Go博客平台" 
          v-model="searchQuery"
          @focus="showHistoryDropdown"
          @blur="hideHistoryDropdown"
          @keydown.enter="handleSearch"
        />
        <div v-if="showHistory && searchHistory.length > 0" class="search-history-dropdown">
          <ul>
            <li v-for="(item, index) in searchHistory" :key="index" @mousedown="searchFromHistory(item)">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
      <button class="write-btn" @click="handleWrite">创作中心</button>
      <div class="avatar-container">
        <img :src="avatarURL" class="avatar" alt="avatar" @click="toggleAvatarDropdown"/>
        <div v-if="showAvatarDropdown" class="avatar-dropdown">
          <div class="dropdown-item" @click="handleGoToProfile">个人主页</div>
          <div class="dropdown-item" @click="handleLogout">退出登录</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue' // Import onMounted
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore' // Import auth store

const router = useRouter()
const authStore = useAuthStore() // Use auth store

const activeTab = ref('首页')
const searchQuery = ref('') // Add searchQuery state
const searchHistory = ref([]) // Add searchHistory state
const showHistory = ref(false) // Add showHistory state
const showAvatarDropdown = ref(false) // State for avatar dropdown visibility

// 从store中获取用户信息 并更新AvatarURL 
// Use authStore state if available, otherwise fallback to localStorage
const user = reactive(authStore.user || JSON.parse(localStorage.getItem('userInfo')) || {})
const avatarURL = ref(user.AvatarURL || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

// Load search history on mount
onMounted(() => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
})

function selectTab(tab) {
  activeTab.value = tab
  // 这里可以根据tab切换页面内容
  if (tab === 'AI Coding') {
    router.push("/ai")
  } 
  if (tab === '首页') {
    router.push("/")
  }
  if (tab === '圈子') {
    router.push("/forum")
  }
  if (tab === '课程') {
    router.push("/courses")
  }
  if (tab === '刷题') {
    router.push("/practice")
  }
  if (tab === '私信') {
    router.push("/chat")
  }
}

function handleWrite() {
  router.push("/creator")
}

function toggleAvatarDropdown() {
  showAvatarDropdown.value = !showAvatarDropdown.value
}

function handleGoToProfile() {
  showAvatarDropdown.value = false // Close dropdown
  // Check if user is logged in (using store state or token in localStorage)
  if ( localStorage.getItem('token')) {
    const userId = authStore.user.ID // Optional chaining for safety
    if (userId) {
      router.push(`/user/${userId}`)
    } else {
      // Fallback or handle error if user ID is somehow missing
      console.error("当前用户缺少id");
      router.push('/login') // Redirect to login if ID missing but token exists?
    }
  } else {
    // Not logged in, redirect to login
    console.log("当前用户缺少token");
    router.push('/login')
  }
}

// ---   ---
function showHistoryDropdown() {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
  showHistory.value = true
}

function hideHistoryDropdown() {
  // Delay hiding to allow click on history item
  setTimeout(() => {
    showHistory.value = false
  }, 200) 
}

function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return

  // Update search history in localStorage
  let history = searchHistory.value
  // Remove existing entry if present
  history = history.filter(item => item !== query)
  // Add new query to the beginning
  history.unshift(query)
  // Limit history size (e.g., to 10 items)
  if (history.length > 10) {
    history.pop()
  }
  localStorage.setItem('searchHistory', JSON.stringify(history))
  searchHistory.value = history // Update local state
  searchQuery.value = '' // Clear input after search
  showHistory.value = false // Hide dropdown

  // Navigate to search results page
  router.push({ path: '/search', query: { q: query } })
}

function searchFromHistory(query) {
  searchQuery.value = query
  handleSearch()
}
// --- End Search Functions ---

// --- Logout Function ---
function handleLogout() {
  showAvatarDropdown.value = false // Close dropdown
  authStore.logout() // Call logout action from store
  // Optionally clear local reactive user state if needed, though store should handle it
  Object.keys(user).forEach(key => delete user[key]); 
  avatarURL.value = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'; // Reset avatar
  router.push('/login') // Redirect to login
}

</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 200;
  padding: 0 32px;
  box-sizing: border-box;
}
.top-navbar-left {
  display: flex;
  align-items: center;
}
.top-logo {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}
.top-title {
  font-size: 22px;
  font-weight: bold;
  color: #1e80ff;
}
.top-nav-list {
  display: flex;
  gap: 24px;
  margin-left: 40px;
}
.top-nav-item {
  font-size: 16px;
  color: #333;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.top-nav-item.active,
.top-nav-item:hover {
  background: #f5f7fa;
  color: #1e80ff;
}
.top-navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Add styles for search container and dropdown */
.search-container {
  position: relative;
}

.search-input {
  height: 32px;
  border: 1px solid #e5e6eb;
  border-radius: 16px;
  padding: 0 16px;
  font-size: 15px;
  outline: none;
  background: #f5f7fa;
  transition: border 0.2s;
  width: 200px; /* Adjust width as needed */
}
.search-input:focus {
  border: 1px solid #1e80ff;
}

.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.search-history-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-history-dropdown li {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.search-history-dropdown li:hover {
  background-color: #f5f7fa;
}
.write-btn {
  background: #1e80ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.write-btn:hover {
  background: #0056b3;
}
.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-left: 8px;
  border: 1px solid #e5e6eb;
  cursor: pointer;
}

.avatar-dropdown {
  position: absolute;
  top: calc(100% + 5px); /* Position below the avatar with a small gap */
  right: 0; /* Align to the right edge of the container */
  background-color: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 210;
  min-width: 100px; /* Ensure minimum width */
  padding: 5px 0; /* Add some vertical padding */
}

.dropdown-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

</style>