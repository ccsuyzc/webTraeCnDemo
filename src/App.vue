<script setup>
import TopNavBar from './components/TopNavBar.vue'
</script>

<template>
  <div class="app-root">
    <TopNavBar />
      <main class="main-content">
        <router-view />
      </main>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  flex: 2;
  padding: 32px 40px;
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
  margin-left: 20px;
  flex: 1.7;
  padding: 32px 0 32px 0;
  min-height: calc(100vh - 64px);   
  background: #f5f7fa;
  margin-left: 0;
}

</style>
