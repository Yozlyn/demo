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
import { computed, onMounted } from 'vue'; // 引入 onMounted
import { useRoute } from 'vue-router';
import TheNavbar from './components/TheNavbar.vue';
import TheFooter from './components/TheFooter.vue';
import { useCartStore } from '@/stores/cart'; // 引入 cart store

const route = useRoute();
const cartStore = useCartStore();

// 计算属性，用于判断当前路由是否属于后台管理界面
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin') && route.name !== 'login';
});

// 当组件挂载（应用启动）时，自动从后端获取一次购物车数据
onMounted(() => {
  // 只在前台页面加载时获取购物车
  if (!isAdminRoute.value) {
    cartStore.fetchCart();
  }
});
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
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