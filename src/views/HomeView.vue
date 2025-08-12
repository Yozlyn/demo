<template>
  <el-container class="layout-container" :class="{ 'dark-mode': isDark }" :style="{ height: '100vh' }">
    <!-- 侧边栏 - 支持折叠 -->
    <el-aside 
      :width="isCollapse ? '64px' : '260px'" 
      class="sidebar"
      :class="{ 'sidebar-collapsed': isCollapse }"
    >
      <div class="sidebar-header">
        <div class="logo" :class="{ 'logo-collapsed': isCollapse }">
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <span v-if="!isCollapse" class="logo-text">学子通教育装备商城</span>
        </div>
        <el-icon 
          class="collapse-btn" 
          @click="toggleCollapse"
        >
          <ArrowRight v-if="!isCollapse" />
          <ArrowLeft v-else />
        </el-icon>
      </div>
      
      <div class="menu-section" v-if="!isCollapse">
        <p class="menu-section-title">主要功能</p>
      </div>
      
      <el-menu 
        :default-openeds="['1', '2', '3']" 
        router 
        :collapse="isCollapse"
        :collapse-transition="false"
        class="main-menu"
        :active-text-color="activeColor"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Histogram /></el-icon>
            <span v-if="!isCollapse">监控中心</span>
          </template>
          <el-menu-item index="/dashboard-overview">
            <el-icon><PieChart /></el-icon>
            <span v-if="!isCollapse">数据概览</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/analysis">
            <el-icon><TrendCharts /></el-icon>
            <span v-if="!isCollapse">深度分析</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/visitors">
            <el-icon><User /></el-icon>
            <span v-if="!isCollapse">访客统计</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Document /></el-icon>
            <span v-if="!isCollapse">内容管理</span>
          </template>
          <el-menu-item index="/content/articles">
            <el-icon><Document /></el-icon>
            <span v-if="!isCollapse">文章管理</span>
          </el-menu-item>
          <el-menu-item index="/content/comments">
            <el-icon><Message /></el-icon>
            <span v-if="!isCollapse">评论管理</span>
          </el-menu-item>
          <el-menu-item index="/content/categories">
            <el-icon><Folder /></el-icon>
            <span v-if="!isCollapse">分类管理</span>
          </el-menu-item>
        </el-sub-menu>
        
        <div class="menu-section" v-if="!isCollapse">
          <p class="menu-section-title">系统配置</p>
        </div>
        
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span v-if="!isCollapse">系统设置</span>
          </template>
          <el-menu-item index="/system/users">
            <el-icon><UserFilled /></el-icon>
            <span v-if="!isCollapse">用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/menu">
            <el-icon><Menu /></el-icon>
            <span v-if="!isCollapse">菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/system/logs">
            <el-icon><RefreshLeft /></el-icon>
            <span v-if="!isCollapse">操作日志</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container class="main-container">
      <!-- 头部导航 -->
      <el-header class="header">
        <div class="header-content">
          <div class="breadcrumb-container">
            <el-breadcrumb :separator="isCollapse ? '/' : '>'">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in state.breadcrumbItems" :key="index" :to="item.path">
                {{ item.label }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-actions">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索功能/内容..." 
              class="search-input"
              prefix-icon="Search"
            ></el-input>
            
            <div class="user-info">
              <el-badge :value="unreadNotifications" class="notification-badge">
                <el-icon class="notification-icon"><Bell /></el-icon>
              </el-badge>
              <el-dropdown placement="bottom-end">
                <div class="user-dropdown">
                  <el-avatar class="user-avatar" :src="userAvatar"></el-avatar>
                  <span v-if="!isMobile" class="user-name">{{ state.userName }}</span>
                  <el-icon class="arrow-down"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToProfile">
                      <el-icon><UserFilled /></el-icon>
                      <span>个人中心</span>
                    </el-dropdown-item>
                    <el-dropdown-item @click="logout">
                      <el-icon><SwitchButton /></el-icon>
                      <span>退出登录</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </el-header>
      
      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 核心指标概览 -->
        <el-row :gutter="20" class="core-indicators">
          <el-col :span="24">
            <el-card shadow="hover" class="indicators-card">
              <div class="indicators-container">
                <div class="indicator-item">
                  <div class="indicator-label">总访问次数</div>
                  <div class="indicator-value">9,120</div>
                  <div class="indicator-trend up">
                    <el-icon><ArrowUp /></el-icon> 较上周 +20%
                  </div>
                </div>
                <div class="indicator-item">
                  <div class="indicator-label">点击量</div>
                  <div class="indicator-value">8,952</div>
                  <div class="indicator-trend down">
                    <el-icon><ArrowDown /></el-icon> 较上周 -12%
                  </div>
                </div>
                <div class="indicator-item">
                  <div class="indicator-label">新用户</div>
                  <div class="indicator-value">156</div>
                  <div class="indicator-trend up">
                    <el-icon><ArrowUp /></el-icon> 较上周 +30%
                  </div>
                </div>
                <div class="indicator-item">
                  <div class="indicator-label">日访问量</div>
                  <div class="indicator-value">1,200</div>
                  <div class="indicator-trend up">
                    <el-icon><ArrowUp /></el-icon> 周同比 +5%
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 图表和动态区域 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <!-- 左侧趋势图表 -->
          <el-col :span="16">
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>用户增长趋势</span>
                  <el-select v-model="chartPeriod" size="small" class="chart-period-select">
                    <el-option label="本月" value="month"></el-option>
                    <el-option label="本季度" value="quarter"></el-option>
                    <el-option label="全年" value="year"></el-option>
                  </el-select>
                </div>
              </template>
              <div class="chart-container">
                <!-- 图表占位区域 -->
                <div class="chart-placeholder">
                  <div class="chart-line"></div>
                  <div class="chart-axis-x">1月 2月 3月 4月 5月 6月 7月 8月 9月 10月 11月 12月</div>
                  <div class="chart-axis-y">0 20 40 60 80</div>
                </div>
              </div>
              <div class="chart-stats">
                <div class="chart-stat-item">总用户量: 32,000</div>
                <div class="chart-stat-item">今年增长: +15%</div>
                <div class="chart-stat-item">用户概述: 比上周 +23%</div>
              </div>
            </el-card>
          </el-col>
          
          <!-- 右侧任务和动态 -->
          <el-col :span="8">
            <el-card shadow="hover" class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>代办事项</span>
                  <span class="badge">待处理 +6</span>
                </div>
              </template>
              <div class="task-list">
                <div class="task-item" v-for="task in tasks" :key="task.id">
                  <div class="task-time">{{ task.time }}</div>
                  <div class="task-content">{{ task.content }}</div>
                  <el-progress :percentage="task.progress" stroke-width="3" :stroke-color="task.color" />
                </div>
              </div>
              <el-button size="small" type="text" class="view-all-btn">查看全部任务</el-button>
            </el-card>
            
            <el-card shadow="hover" class="dashboard-card" style="margin-top: 20px;">
              <template #header>
                <div class="card-header">
                  <span>系统动态</span>
                </div>
              </template>
              <div class="activity-list">
                <div class="activity-item" v-for="activity in activities" :key="activity.id">
                  <el-avatar :src="activity.avatar" class="activity-avatar" size="small"></el-avatar>
                  <div class="activity-content">
                    <span class="activity-user">{{ activity.user }}</span>
                    <span class="activity-action">{{ activity.action }}</span>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 快捷功能区 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card shadow="hover" class="actions-card">
              <template #header>
                <div class="card-header">
                  <span>快捷功能</span>
                </div>
              </template>
              <div class="actions-container">
                <el-button type="primary" @click="handleAction('analysis')" class="action-btn">
                  <el-icon><TrendCharts /></el-icon> 数据分析
                </el-button>
                <el-button type="success" @click="handleAction('articles')" class="action-btn">
                  <el-icon><Document /></el-icon> 文章管理
                </el-button>
                <el-button type="info" @click="handleAction('users')" class="action-btn">
                  <el-icon><User /></el-icon> 用户管理
                </el-button>
                <el-button type="warning" @click="handleAction('tasks')" class="action-btn">
                  <el-icon><CircleCheck /></el-icon> 任务管理
                </el-button>
                <el-button type="default" @click="handleAction('settings')" class="action-btn">
                  <el-icon><Setting /></el-icon> 系统设置
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
      
      <!-- 页脚 -->
      <el-footer class="footer">
        <div class="footer-content">
        <p>© 2025 Y2024web Company. All Rights Reserved.</p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { 
  Monitor, 
  Histogram, 
  PieChart, 
  TrendCharts, 
  User, 
  Document, 
  Message, 
  Folder, 
  Setting, 
  Menu, 
  RefreshLeft, 
  Bell, 
  UserFilled, 
  SwitchButton, 
  ArrowDown, 
  ArrowUp, 
  ArrowRight, 
  ArrowLeft, 
  CircleCheck 
} from "@element-plus/icons-vue";
import { reactive, ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useMediaQuery } from '@vueuse/core';

// 响应式判断移动设备
const isMobile = useMediaQuery('(max-width: 768px)');
// 检测系统暗黑模式
const isDark = useMediaQuery('(prefers-color-scheme: dark)');

// 路由相关
const router = useRouter();
const route = useRoute();

// 状态管理
interface State {
  userName: string;
  breadcrumbItems: Array<{ path: string; label: string }>;
}
const state = reactive<State>({
  userName: '',
  breadcrumbItems: []
});

// 侧边栏折叠状态
const isCollapse = ref(false);
// 菜单激活颜色
const activeColor = '#409eff';
// 搜索关键词
const searchQuery = ref('');
// 通知相关
const unreadNotifications = ref(5);
const userAvatar = ref('https://picsum.photos/id/64/200/200');
// 图表周期选择
const chartPeriod = ref('year');

// 任务列表数据
const tasks = ref([
  { id: 1, time: '上午09:30', content: '回复邮件', progress: 60, color: '#409eff' },
  { id: 2, time: '上午10:30', content: '工作汇报整理', progress: 20, color: '#e6a23c' },
  { id: 3, time: '下午02:00', content: '产品需求会议', progress: 0, color: '#67c23a' },
  { id: 4, time: '下午03:30', content: '整理会议内容', progress: 0, color: '#67c23a' }
]);

// 系统动态数据
const activities = ref([
  { 
    id: 1, 
    user: '中小鱼', 
    action: '关注了谇谇淰', 
    time: '10分钟前',
    avatar: 'https://picsum.photos/id/237/100/100'
  },
  { 
    id: 2, 
    user: '何小荷', 
    action: '发表文章《Vue3 + TypeScript 项目实战》', 
    time: '1小时前',
    avatar: 'https://picsum.photos/id/238/100/100'
  },
  { 
    id: 3, 
    user: '谇谇淰', 
    action: '提出问题「主题可以配置吗」', 
    time: '2小时前',
    avatar: 'https://picsum.photos/id/239/100/100'
  },
  { 
    id: 4, 
    user: '发呆草', 
    action: '兑换了物品《奇特的一生》', 
    time: '3小时前',
    avatar: 'https://picsum.photos/id/240/100/100'
  }
]);

// 更新面包屑导航
const updateBreadcrumb = (route: any) => {
  if (!route || !route.matched) return;
  const matched = route.matched.filter((m: any) => m.meta && m.meta.title);
  state.breadcrumbItems = matched.map((m: any) => ({
    path: m.path,
    label: m.meta.title
  }));
};

// 监听路由变化更新面包屑
watch(() => route, (newRoute) => {
  updateBreadcrumb(newRoute);
}, { immediate: true });

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
  if (isMobile.value && !isCollapse.value) {
    isCollapse.value = true; // 移动端默认折叠
  }
};

// 退出登录
const logout = () => {
  localStorage.clear();
  router.push('/login');
};

// 前往个人资料
const goToProfile = () => {
  router.push('/profile');
};

// 快捷功能处理
const handleAction = (action: string) => {
  const routeMap: Record<string, string> = {
    analysis: '/dashboard/analysis',
    articles: '/content/articles',
    users: '/system/users',
    tasks: '/tasks/list',
    settings: '/system/settings'
  };
  router.push(routeMap[action] || '/');
};

// 页面初始化
onMounted(() => {
  const userName = localStorage.getItem('userName') || '管理员';
  state.userName = userName;
  
  if (isMobile.value) {
    isCollapse.value = true; // 移动端默认折叠侧边栏
  }
});
</script>

<style scoped>
/* 布局容器样式 - 设置整体背景色和溢出控制 */
.layout-container {
  background-color: #ffffff;
  overflow: hidden;
}

/* 暗黑模式下的布局容器背景色 */
.layout-container.dark-mode {
  background-color: #131824;
}

/* 侧边栏样式 - 设置背景、过渡效果和阴影 */
.sidebar {
  background-color: #e8e6e683;
  transition: width 0.3s ease;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 暗黑模式下的侧边栏背景色 */
.dark-mode .sidebar {
  background-color: #1a1a1bd4;
}

/* 侧边栏头部样式 - 布局、边框和背景 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
  border-bottom: 1px solid #e8e6e64a;
  background-color: #e8e6e64a;
}

/* 暗黑模式下的侧边栏头部样式 */
.dark-mode .sidebar-header {
  border-bottom: 1px solid #1a1a1bd4;
  background-color: #1a1a1bd4;
}

/*  logo样式 - 布局和颜色 */
.logo {
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s;
}

/* logo图标样式 */
.logo-icon {
  font-size: 24px;
  margin-right: 8px;
  color: #fff;
}

/* logo文字样式 */
.logo-text {
  font-size: 18px;
}

/* 折叠状态下的logo文字隐藏 */
.logo-collapsed .logo-text {
  display: none;
}

/* 折叠按钮样式 - 颜色、光标和过渡效果 */
.collapse-btn {
  color: #9ca3af;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

/* 折叠按钮悬停效果 */
.collapse-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 菜单分区样式 - 内边距 */
.menu-section {
  padding: 10px 20px 3px;
}

/* 菜单分区标题样式 - 颜色、大小和间距 */
.menu-section-title {
  color: #9ca3af; 
  font-size: 14px;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 1px;
}

/* 主菜单样式 - 背景和边框 */
.main-menu {
  background-color: transparent;
  border-right: none;
  margin-top: 5px;
}

/* 折叠状态下的菜单分区隐藏 */
.sidebar-collapsed .menu-section {
  display: none;
}

/* 折叠状态下的菜单文字隐藏 */
.sidebar-collapsed .el-sub-menu__title span,
.sidebar-collapsed .el-menu-item span {
  display: none;
}

/* 折叠状态下的菜单图标间距调整 */
.sidebar-collapsed .el-sub-menu__title .el-icon,
.sidebar-collapsed .el-menu-item .el-icon {
  margin-right: 0;
}

/* 头部样式 - 背景、边框和阴影 */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 头部内容容器样式 - 布局和高度 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

/* 面包屑容器样式 - 字体和颜色 */
.breadcrumb-container {
  font-size: 14px;
  color: #6b7280;
}

/* 头部操作区样式 - 布局和间距 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 搜索输入框宽度 */
.search-input {
  width: 240px;
}

/* 用户信息区样式 - 布局和间距 */
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 通知图标样式 - 大小、颜色和过渡效果 */
.notification-icon {
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 0px;
  border-radius: 4px;
  transition: all 0.2s;
}

/* 通知图标悬停效果 */
.notification-icon:hover {
  color: #409eff;
  background-color: #eff6ff;
}

/* 用户下拉菜单样式 - 布局、光标和过渡效果 */
.user-dropdown { 
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

/* 用户下拉菜单悬停效果 */
.user-dropdown:hover {
  background-color: #f3f4f6;
}

/* 暗黑模式下的用户下拉菜单悬停效果 */
.dark-mode .user-dropdown:hover {
  background-color: #4b5563;
}

/* 用户头像样式 - 大小和过渡效果 */
.user-avatar {
  width: 36px;
  height: 36px;
  transition: transform 0.2s;
}

/* 用户下拉菜单悬停时的头像缩放效果 */
.user-dropdown:hover .user-avatar {
  transform: scale(1.05);
}

/* 用户名样式 - 字体和颜色 */
.user-name {
  font-size: 14px;
  color: #1f2937;
}

/* 下拉箭头样式 - 大小和颜色 */
.arrow-down {
  font-size: 16px;
  color: #9ca3af;
}

/* 暗黑模式下的通知图标颜色 */
.dark-mode .notification-icon {
  color: #d1d5db;
}

/* 暗黑模式下的通知图标悬停背景 */
.dark-mode .notification-icon:hover {
  background-color: #4b5563;
}

/* 暗黑模式下的面包屑颜色 */
.dark-mode .breadcrumb-container {
  color: #d1d5db;
}

/* 暗黑模式下的头部样式 */
.dark-mode .header {
  background-color: #000000;
  border-bottom: 1px solid #4b5563;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* 暗黑模式下的下拉箭头颜色 */
.dark-mode .arrow-down {
  color: #d1d5db;
}

/* 暗黑模式下的用户名颜色 */
.dark-mode .user-name {
  color: #d1d5db;
}

/* 主内容区样式 - 内边距、滚动和背景 */
.main-content {
  padding: 20px;
  overflow-y: auto;
  background-color: #ffffff;
}

/* 暗黑模式下的主内容区背景 */
.dark-mode .main-content {
  background-color: #000000;
}

/* 核心指标区域样式 - 底部外边距 */
.core-indicators {
  margin-bottom: 20px;
}

/* 指标卡片样式 - 背景 */
.indicators-card {
  background-color: #ffffff;
}

/* 暗黑模式下的指标卡片背景 */
.dark-mode .indicators-card {
  background-color: #232324d4;
}

/* 指标容器样式 - 布局和内边距 */
.indicators-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

/* 单个指标项样式 - 弹性和最小宽度 */
.indicator-item {
  flex: 1;
  min-width: 200px;
}

/* 指标标签样式 - 字体、颜色和间距 */
.indicator-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

/* 暗黑模式下的指标标签颜色 */
.dark-mode .indicator-label {
  color: #d1d5db;
}

/* 指标值样式 - 字体、粗细和间距 */
.indicator-value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

/* 暗黑模式下的指标值颜色 */
.dark-mode .indicator-value {
  color: #f3f4f6;
}

/* 指标趋势样式 - 字体和布局 */
.indicator-trend {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 上升趋势样式 - 颜色 */
.indicator-trend.up {
  color: #10b981;
}

/* 下降趋势样式 - 颜色 */
.indicator-trend.down {
  color: #ef4444;
}

/* 仪表盘卡片通用样式 - 背景、过渡和边框 */
.dashboard-card {
  background-color: #ffffff;
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
}

/* 暗黑模式下的仪表盘卡片背景 */
.dark-mode .dashboard-card {
  background-color: #232324d4;
}

/* 仪表盘卡片悬停效果 */
.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

/* 卡片头部样式 - 字体、布局和边框 */
.card-header {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

/* 暗黑模式下的卡片头部样式 */
.dark-mode .card-header {
  color: #f3f4f6;
  border-bottom: 1px solid #4b5563;
}

/* 徽章样式 - 字体、背景和边框 */
.badge {
  font-size: 12px;
  background-color: #eff6ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 暗黑模式下的徽章样式 */
.dark-mode .badge {
  background-color: #4b5563;
  color: #60a5fa;
}

/* 图表容器样式 - 高度和布局 */
.chart-container {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
}

/* 图表占位区域样式 - 宽高和定位 */
.chart-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 图表线条样式 - 使用SVG背景 */
.chart-line {
  width: 100%;
  height: 80%;
  background: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,60 Q25,30 50,50 T100,40' stroke='%23409eff' stroke-width='2' fill='none' stroke-dasharray='4'/%3E%3C/svg%3E") no-repeat center;
  background-size: 100% 100%;
}

/* X轴样式 - 定位、字体和布局 */
.chart-axis-x {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  box-sizing: border-box;
}

/* 暗黑模式下的X轴颜色 */
.dark-mode .chart-axis-x {
  color: #d1d5db;
}

/* Y轴样式 - 定位、字体和布局 */
.chart-axis-y {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
  padding: 10px 0;
}

/* 暗黑模式下的Y轴颜色 */
.dark-mode .chart-axis-y {
  color: #d1d5db;
}

/* 图表周期选择器宽度 */
.chart-period-select {
  width: 120px;
}

/* 图表统计信息样式 - 布局、内边距和颜色 */
.chart-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  border-top: 1px solid #f3f4f6;
  font-size: 14px;
  color: #6b7280;
}

/* 暗黑模式下的图表统计信息样式 */
.dark-mode .chart-stats {
  border-top: 1px solid #4b5563;
  color: #d1d5db;
}

/* 图表统计项样式 - 布局 */
.chart-stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 任务列表样式 - 内边距 */
.task-list {
  padding: 16px;
}

/* 任务项样式 - 底部外边距 */
.task-item {
  margin-bottom: 16px;
}

/* 最后一个任务项去除底部外边距 */
.task-item:last-child {
  margin-bottom: 0;
}

/* 任务时间样式 - 字体和颜色 */
.task-time {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

/* 暗黑模式下的任务时间颜色 */
.dark-mode .task-time {
  color: #d1d5db;
}

/* 任务内容样式 - 字体和颜色 */
.task-content {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 8px;
}

/* 暗黑模式下的任务内容颜色 */
.dark-mode .task-content {
  color: #f3f4f6;
}

/* 动态列表样式 - 内边距 */
.activity-list {
  padding: 16px;
}

/* 动态项样式 - 布局和边框 */
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

/* 暗黑模式下的动态项边框 */
.dark-mode .activity-item {
  border-bottom: 1px solid #4b5563;
}

/* 最后一个动态项去除底部边框 */
.activity-item:last-child {
  border-bottom: none;
}

/* 动态头像样式 - 上边距 */
.activity-avatar {
  margin-top: 2px;
}

/* 动态内容样式 - 弹性和字体 */
.activity-content {
  flex: 1;
  font-size: 14px;
}

/* 动态用户名字样式 - 粗细和颜色 */
.activity-user {
  font-weight: 500;
  color: #1f2937;
}

/* 暗黑模式下的动态用户名颜色 */
.dark-mode .activity-user {
  color: #f3f4f6;
}

/* 动态动作样式 - 颜色和间距 */
.activity-action {
  color: #6b7280;
  margin: 0 4px;
}

/* 暗黑模式下的动态动作颜色 */
.dark-mode .activity-action {
  color: #d1d5db;
}

/* 动态时间样式 - 字体和颜色 */
.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

/* 暗黑模式下的动态时间颜色 */
.dark-mode .activity-time {
  color: #d1d5db;
}

/* 快捷功能区卡片样式 - 背景 */
.actions-card {
  background-color: #ffffff;
}

/* 暗黑模式下的快捷功能区卡片背景 */
.dark-mode .actions-card {
  background-color: #232324d4;
}

/* 快捷功能容器样式 - 布局和内边距 */
.actions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
}

/* 快捷功能按钮样式 - 过渡效果 */
.action-btn {
  transition: all 0.2s;
}

/* 快捷功能按钮悬停效果 */
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 查看全部按钮样式 - 宽度、颜色和内边距 */
.view-all-btn {
  width: 100%;
  color: #409eff;
  padding: 8px 0;
}

/* 暗黑模式下的查看全部按钮颜色 */
.dark-mode .view-all-btn {
  color: #60a5fa;
}

/* 查看全部按钮悬停效果 */
.view-all-btn:hover {
  color: #2563eb;
  background-color: #eff6ff;
}

/* 暗黑模式下的查看全部按钮悬停效果 */
.dark-mode .view-all-btn:hover {
  color: #3b82f6;
  background-color: #4b5563;
}

/* 页脚样式 - 背景、边框和内边距 */
.footer {
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 12px 20px;
  height: auto;
}

/* 暗黑模式下的页脚样式 */
.dark-mode .footer {
  background-color: #000000;
  border-top: 1px solid #000000;
}

/* 页脚内容样式 - 对齐、颜色和字体 */
.footer-content {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

/* 暗黑模式下的页脚内容颜色 */
.dark-mode .footer-content {
  color: #d1d5db;
}

/* 页脚段落样式 - 外边距 */
.footer-content p {
  margin: 4px 0;
}

/* 菜单样式覆盖 - 颜色、高度和内边距 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #9ca3af;
  height: 50px;
  line-height: 50px;
  padding-left: 20px !important;
  margin: 0 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

/* 菜单项和子菜单标题悬停效果 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #374151 !important;
  color: #fff !important;
}

/* 激活状态的菜单项样式 */
:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.15) !important;
  color: #409eff !important;
  border-left: 3px solid #409eff;
}

/* 菜单图标样式 - 间距和大小 */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 12px;
  font-size: 18px;
}

/* 响应式调整 - 屏幕宽度小于768px时 */
@media (max-width: 768px) {
  /* 隐藏面包屑 */
  .breadcrumb-container {
    display: none;
  }
  
  /* 缩小搜索框宽度 */
  .search-input {
    width: 160px;
  }
  
  /* 隐藏用户名 */
  .user-name {
    display: none;
  }
  
  /* 减小主内容区内边距 */
  .main-content {
    padding: 10px;
  }
  
  /* 指标容器改为垂直布局 */
  .indicators-container {
    flex-direction: column;
  }
  
  /* 列宽设为100% */
  .el-col {
    width: 100% !important;
  }
}
</style>