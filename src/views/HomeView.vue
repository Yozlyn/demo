<template>
  <!-- 保持原模板不变 -->
  <el-container class="layout-container" :style="{ height: '100vh' }">
    <!-- 侧边栏 - 支持折叠 -->
    <el-aside 
      :width="isCollapse ? '64px' : '260px'" 
      class="sidebar"
      :class="{ 'sidebar-collapsed': isCollapse }"
    >
      <!-- 侧边栏内容 -->
      <div class="sidebar-header">
        <div class="logo" :class="{ 'logo-collapsed': isCollapse }">
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <span v-if="!isCollapse" class="logo-text">学子通教育装备商城</span>
        </div>
      </div>
      
      <!-- 菜单部分 -->
      <el-menu 
        :default-openeds="['1', '2']"
        router 
        :collapse="isCollapse"
        collapse-transition
        class="main-menu"
        :active-text-color="activeColor"
        :text-color="menuTextColor"
        :background-color="sidebarBgColor"
      >
        <!-- 商品管理 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon class="menu-icon"><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/products/list" class="menu-item">
            <el-icon class="item-icon"><List /></el-icon>
            <span>商品列表</span>
          </el-menu-item>
          <el-menu-item index="/admin/products/categories" class="menu-item">
            <el-icon class="item-icon"><Folder /></el-icon>
            <span>商品分类</span>
          </el-menu-item>
          <el-menu-item index="/admin/products/inventory" class="menu-item">
            <el-icon class="item-icon"><Box /></el-icon>
            <span>库存管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/products/reviews" class="menu-item">
            <el-icon class="item-icon"><Star /></el-icon>
            <span>商品评价</span>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 订单管理 -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon class="menu-icon"><ShoppingCart /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/admin/orders/list" class="menu-item">
            <el-icon class="item-icon"><List /></el-icon>
            <span>订单列表</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders/pending" class="menu-item">
            <el-icon class="item-icon"><Clock /></el-icon>
            <span>待处理订单</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders/refunds" class="menu-item">
            <el-icon class="item-icon"><RefreshLeft /></el-icon>
            <span>退款处理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders/statistics" class="menu-item">
            <el-icon class="item-icon"><Histogram /></el-icon>
            <span>订单统计</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 客户管理 -->
        <el-sub-menu index="3">
          <template #title>
            <el-icon class="menu-icon"><User /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/admin/customers/list" class="menu-item">
            <el-icon class="item-icon"><List /></el-icon>
            <span>客户列表</span>
          </el-menu-item>
          <el-menu-item index="/admin/customers/grades" class="menu-item">
            <el-icon class="item-icon"><Rank /></el-icon>
            <span>会员等级</span>
          </el-menu-item>
          <el-menu-item index="/admin/customers/addresses" class="menu-item">
            <el-icon class="item-icon"><MapLocation /></el-icon>
            <span>地址管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 营销中心 -->
        <el-sub-menu index="4">
          <template #title>
            <el-icon class="menu-icon"><Ticket /></el-icon>
            <span>营销中心</span>
          </template>
          <el-menu-item index="/admin/marketing/coupons" class="menu-item">
            <el-icon class="item-icon"><Discount /></el-icon>
            <span>优惠券管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/marketing/activities" class="menu-item">
            <el-icon class="item-icon"><Present /></el-icon>
            <span>促销活动</span>
          </el-menu-item>
          <el-menu-item index="/admin/marketing/adverts" class="menu-item">
            <el-icon class="item-icon"><Picture /></el-icon>
            <span>广告管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 系统设置 -->
        <el-sub-menu index="5">
          <template #title>
            <el-icon class="menu-icon"><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admin/system/users" class="menu-item">
            <el-icon class="item-icon"><UserFilled /></el-icon>
            <span>管理员设置</span>
          </el-menu-item>
          <el-menu-item index="/admin/system/payment" class="menu-item">
            <el-icon class="item-icon"><Money /></el-icon>
            <span>支付设置</span>
          </el-menu-item>
          <el-menu-item index="/admin/system/logistics" class="menu-item">
            <el-icon class="item-icon"><Van /></el-icon>
            <span>物流设置</span>
          </el-menu-item>
          <el-menu-item index="/admin/system/logs" class="menu-item">
            <el-icon class="item-icon"><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-content">
          <div class="left-actions">
            <el-icon 
              class="header-icon" 
              @click="toggleCollapse" 
              :title="isCollapse ? '展开菜单' : '折叠菜单'"
            >
              <el-icon v-if="isCollapse"><Expand /></el-icon>
              <el-icon v-else><Fold /></el-icon>
            </el-icon>
            <el-icon 
              class="header-icon" 
              @click="refreshCurrentRoute" 
              title="刷新当前页面"
            >
              <Refresh />
            </el-icon>
            <span class="breadcrumb">{{ currentBreadcrumb }}</span>
          </div>
          <div class="right-actions">
            <div class="search-box">
              <el-input 
                placeholder="搜索菜单、商品或订单..." 
                v-model="searchQuery" 
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <el-icon 
              class="header-icon" 
              @click="toggleFullScreen"
              :title="isFullScreen ? '退出全屏' : '全屏'"
            >
              <el-icon v-if="isFullScreen"><ZoomOut /></el-icon>
              <el-icon v-else><FullScreen /></el-icon>
            </el-icon>
            <el-dropdown trigger="click">
              <el-avatar class="user-avatar">
                <img src="@/assets/images/avatar.jpg" alt="管理员头像">
              </el-avatar>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span class="username">管理员</span>
          </div>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }" :key="routeKey">
          <component :is="Component" v-if="Component" />
          <div v-else class="error-placeholder">
            加载组件失败，请检查路由或网络。
          </div>
        </router-view>
      </el-main>
      
      <el-footer class="footer">
        <div class="footer-content">
          <p>© 2025 学子通教育装备商城. 保留所有权利.</p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { 
  Monitor, Goods, List, Folder, Box, Star, 
  ShoppingCart, Setting, Clock, RefreshLeft, Histogram, User, 
  Rank, MapLocation, Ticket, Discount, Present, Picture, 
  UserFilled, Money, Van, Document, Search, Refresh,
  FullScreen, ZoomOut, Expand, Fold
} from '@element-plus/icons-vue';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 侧边栏折叠状态
const isCollapse = ref(false);

// 搜索框数据
const searchQuery = ref('');

// 全屏状态
const isFullScreen = ref(false);

// 路由实例
const router = useRouter();
const route = useRoute();

// 用于刷新当前路由组件
const routeKey = ref(Date.now());

// 退出登录
const handleLogout = () => {
  // 清除所有登录相关数据
  localStorage.removeItem('suId');
  localStorage.removeItem('suName');
  localStorage.removeItem('suRole');
  localStorage.removeItem('username');
  localStorage.removeItem('encryptedPassword');
  router.push('/admin/login');
};

// 折叠/展开侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 全屏切换
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error('Failed to enter fullscreen:', err);
    });
    isFullScreen.value = true;
  } else if (document.exitFullscreen) {
    document.exitFullscreen().catch((err) => {
      console.error('Failed to exit fullscreen:', err);
    });
    isFullScreen.value = false;
  }
};

// 刷新当前路由组件
const refreshCurrentRoute = () => {
  routeKey.value = Date.now();
};

// 计算当前面包屑导航
const currentBreadcrumb = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment);
  // 处理 /admin 默认路由
  if (pathSegments.length === 1 && pathSegments[0] === 'admin') {
    return '仪表盘';
  }
  // 确保路径至少有 admin/xxx/xxx 结构
  if (pathSegments.length < 3 || pathSegments[0] !== 'admin') {
    return '未知页面';
  }
  const menuMap: Record<string, string> = {
    products: '商品管理',
    orders: '订单管理',
    customers: '客户管理',
    marketing: '营销中心',
    system: '系统设置'
  };
  const subMenuMap: Record<string, string> = {
    list: '列表',
    categories: '分类',
    inventory: '库存管理',
    reviews: '评价',
    pending: '待处理订单',
    refunds: '退款处理',
    statistics: '统计',
    grades: '会员等级',
    addresses: '地址管理',
    coupons: '优惠券管理',
    activities: '促销活动',
    adverts: '广告管理',
    users: '管理员设置',
    payment: '支付设置',
    logistics: '物流设置',
    logs: '操作日志'
  };
  const primary = menuMap[pathSegments[1]] || pathSegments[1];
  const secondary = subMenuMap[pathSegments[2]] || pathSegments[2];
  return `${primary} / ${secondary}`;
});

// 菜单样式配置
const activeColor = '#1890ff';
const menuTextColor = '#333333';
const sidebarBgColor = '#ffffff';
</script>

<style scoped>
/* 设置全局字体为 Noto Sans SC，圆润美观 */
.layout-container {
  overflow: hidden;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  height: 100vh; /* 确保占满视口高度 */
}

/* 自定义细浅灰色滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 侧边栏整体样式（纯白基调） */
.sidebar {
  background-color: v-bind(sidebarBgColor);
  color: v-bind(menuTextColor);
  transition: width 0.3s ease;
  border-right: 1px solid #e8e8e8;
  height: 100%; /* 确保侧边栏填充高度 */
}

/* 侧边栏头部 */
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 64px;
  background-color: #ffffff;
}

.logo {
  display: flex;
  align-items: center;
  flex: 1;
  white-space: nowrap;
}

.logo-icon {
  font-size: 24px;
  color: #666666;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  white-space: nowrap;
}

.logo-collapsed .logo-text {
  display: none;
}

/* 菜单主体 */
.main-menu {
  border-right: none;
  padding-top: 10px;
}

/* 一级菜单分组（添加分割线） */
.menu-group {
  border-bottom: 1px solid #f0f0f0;
}
.menu-group:last-child {
  border-bottom: none;
}

/* 一级菜单样式 */
:deep(.el-sub-menu__title) {
  height: 52px !important;
  line-height: 52px !important;
  padding: 0 20px !important;
  font-size: 16px !important;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
:deep(.el-sub-menu__title:hover) {
  background-color: #f5f5f5 !important;
}
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 12px !important;
  font-size: 18px !important;
  color: #666666 !important;
}

/* 二级菜单样式 */
.menu-item {
  height: 46px !important;
  line-height: 46px !important;
  padding-left: 45px !important;
  font-size: 15px !important;
  transition: all 0.2s ease;
}
:deep(.el-menu-item:hover) {
  background-color: #f5f5f5 !important;
  padding-left: 50px !important;
}
:deep(.el-menu-item.is-active) {
  background-color: #e6f7ff !important;
  border-left: 3px solid #1890ff !important;
}
:deep(.el-menu-item.is-active .el-icon) {
  color: #1890ff !important;
}
:deep(.el-menu-item .el-icon) {
  margin-right: 10px !important;
  font-size: 16px !important;
  color: #666666 !important;
}

/* 子菜单样式 */
:deep(.el-menu-vertical) {
  :deep(.el-sub-menu .el-sub-menu__children) {
    background-color: #ffffff !important;
    padding: 5px 0 !important;
  }
}

/* 主内容区样式 */
.main-container {
  background-color: transparent;
  height: 100%; /* 确保占满父容器高度 */
  display: flex;
  flex-direction: column; /* 垂直排列 */
}

.header {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  flex-shrink: 0; /* 防止头部压缩 */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.left-actions {
  display: flex;
  align-items: center;
}

.right-actions {
  display: flex;
  align-items: center;
}

.search-box {
  width: 250px;
  margin-right: 12px;
}

.search-input {
  width: 100%;
}

.header-icon {
  cursor: pointer;
  font-size: 18px;
  color: #666666;
  margin-right: 16px;
}

.header-icon:hover {
  color: #1890ff;
}

.breadcrumb {
  font-size: 14px;
  color: #333333;
  margin-left: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  cursor: pointer;
  margin-right: 8px;
}

.username {
  font-size: 14px;
  color: #333333;
}

.main-content {
  flex: 1; /* 填充剩余空间 */
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto; /* 允许滚动 */
}

.footer {
  height: 48px;
  background-color: #ffffff;
  text-align: center;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0; /* 防止页脚压缩 */
}

.footer-content {
  line-height: 48px;
  font-size: 12px;
  color: #666;
  background-color: #ffffff;
}
</style>