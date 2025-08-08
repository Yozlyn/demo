<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-aside width="260px">
      <el-menu :default-openeds="['1']" router>
        <el-sub-menu index="1">
          <template #title>
            <el-icon><message /></el-icon>
            <span>销售模块</span>
          </template>
          <el-menu-item index="/user">
            <el-icon><Avatar /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/customer">
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </el-menu-item>
          <el-menu-item index="/sales">
            <el-icon><Switch /></el-icon>
            <span>销售管理</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="2">
          <template #title>
            <el-icon><icon-menu /></el-icon>
            <span>Navigator Two</span>
          </template>
          <el-menu-item-group>
            <template #title>Group 1</template>
            <el-menu-item index="2-1">Option 1</el-menu-item>
            <el-menu-item index="2-2">Option 2</el-menu-item>
          </el-menu-item-group>
          <el-sub-menu index="2-4">
            <template #title>Option 4</template>
            <el-menu-item index="2-4-1">Option 4-1</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        
        <el-sub-menu index="3">
          <template #title>
            <el-icon><setting /></el-icon>
            <span>Navigator Three</span>
          </template>
          <el-menu-item-group>
            <template #title>Group 1</template>
            <el-menu-item index="3-1">Option 1</el-menu-item>
            <el-menu-item index="3-2">Option 2</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header height="60px" class="header">
        <div class="toolbar">
          <div class="system-title">学子通教育装备商城后台管理系统</div>
          <span>{{ state.suName }}</span>
          <el-dropdown>
            <el-icon class="setting-icon"><setting /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { Menu as IconMenu, Message, Setting, Avatar, User, Switch } from "@element-plus/icons-vue";
import { reactive, onMounted } from "vue";
import { useRouter } from 'vue-router'

const router = useRouter()

const state = reactive({
  suName: ''
});

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  const suName = localStorage.getItem('suName')
  if (suName) {
    state.suName = suName
  } else {
    router.push('/login')
  }
});
</script>

<style scoped>
.layout-container-demo {
  background-color: #f8fafc; /* 整体布局背景色，浅灰色，可调整为 #ffffff（白色）等 */
}

/* 侧边栏样式调整 */
.el-aside {
  background-color: #ffffff; /* 侧边栏背景色，白色 */
  border-right: 1px solid #e2e8f0; /* 右边框，浅灰色 */
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.03); /* 轻微阴影，增强立体感 */
}

.el-menu {
  border-right: none; /* 移除菜单右边框 */
  background-color: #ffffff; /* 菜单背景色，白色 */
  padding-top: 8px; /* 顶部内边距，建议 4px-12px */
}

/* 一级菜单样式 */
:deep(.el-sub-menu__title) {
  color: #475569; /* 文字颜色，深灰色，建议范围：#333333（深色）到 #64748b（浅灰） */
  height: 64px; /* 菜单项高度，适配文字大小，建议 56px-72px */
  line-height: 64px; /* 行高，与 height 保持一致以垂直居中 */
  border-radius: 7px; /* 圆角，建议 4px-8px */
  margin: 0 8px; /* 左右外边距，建议 4px-12px */
  font-size: 18px; /* 一级菜单文字大小，建议 16px-20px，调整时注意与 height 匹配 */
}

/* 子菜单样式 */
:deep(.el-menu-item) {
  color: #475569; /* 文字颜色，与一级菜单一致，建议范围：#333333 到 #64748b */
  height: 64px; /* 菜单项高度，与一级菜单一致，建议 56px-72px */
  line-height: 64px; /* 行高，与 height 保持一致 */
  border-radius: 7px; /* 圆角，建议 4px-8px */
  margin: 0 8px; /* 左右外边距 */
  font-size: 16px; /* 子菜单文字大小，建议 14px-18px */
}

/* 菜单悬停效果 */
:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: #f1f5f9; /* 悬停背景色，浅灰色，建议 #e5e7eb 到 #f8fafc */
}

/* 菜单选中效果 */
:deep(.el-menu-item.is-active) {
  color: #3b82f6; /* 选中文字颜色，蓝色，建议 #2563eb 到 #60a5fa */
  background-color: #eff6ff; /* 选中背景色，浅蓝色，建议 #dbeafe 到 #f0f9ff */
}

.el-icon {
  margin-right: 16px; /* 菜单图标与文字间距，建议 12px-20px */
  width: 48px; /* 菜单图标宽度，建议 40px-56px */
  height: 48px; /* 菜单图标高度 */
}

/* 顶部导航调整 */
.header {
  background-color: #ffffff; /* 头部背景色，白色 */
  border-bottom: 1px solid #e2e8f0; /* 下边框，浅灰色 */
  padding: 0 20px; /* 左右内边距，建议 16px-24px */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* 轻微阴影 */
}

.toolbar {
  display: flex;
  align-items: center; /* 垂直居中，确保文字和图标对齐 */
  justify-content: flex-end; /* 右对齐 */
  gap: 15px; /* 元素间距（用户名与图标间），建议 10px-20px */
  height: 100%; /* 占满头部高度 */
}

.toolbar span {
  font-size: 16px; /* 用户名称文字大小，建议 14px-18px */
  color: #475569; /* 用户名称颜色，深灰色，建议 #333333 到 #64748b */
}

:deep(.setting-icon) {
  color: #64748b; /* 设置图标颜色，浅灰色，建议 #475569 到 #94a3b8 */
  cursor: pointer;
  width: 24px; /* 设置图标宽度，建议 20px-28px */
  height: 24px; /* 设置图标高度，建议 20px-28px */
  font-size: 24px; /* 设置图标字体大小（因 el-icon 使用字体图标），与 width/height 一致 */
}

/* 系统标题样式 */
.system-title {
  font-size: 21px; /* 标题文字大小 */
  color: #333333; /* 标题颜色 */
  font-weight: 400; /* 加粗显示 */
  margin-right: auto; /* 推到左侧 */
}

/* 主内容区调整 */
.main-content {
  padding: 24px; /* 内边距，建议 12px-24px */
  background-color: #f8fafc; /* 背景色，浅灰色 */
}
</style>