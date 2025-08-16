<template>
  <router-view v-if="isAdminRoute" />
  
  <div v-else class="public-layout">
    <TheNavbar />
    <main class="content-wrapper">
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TheNavbar from './components/TheNavbar.vue';
import TheFooter from './components/TheFooter.vue';

const route = useRoute();

// 计算属性，用于判断当前路由是否属于后台管理界面
const isAdminRoute = computed(() => {
  // 如果路由路径以 /admin 开头, 并且它不是登录页, 就认为是后台路由
  return route.path.startsWith('/admin') && route.name !== 'login';
});
</script>

<style>
/* 这里的样式会影响全局 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa; /* 给一个浅灰色底色，让毛玻璃效果更明显 */
}

.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
}
</style>