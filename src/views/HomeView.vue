<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-aside width="200px">
      <el-scrollbar>
        <el-menu :default-openeds="['1', '3']">
          <el-sub-menu index="1">
            <template #title>
              <el-icon><message /></el-icon>销售模块
            </template>
            <el-menu-item index="1-1"><el-icon><Avatar /></el-icon>用户管理</el-menu-item>
            <el-menu-item index="1-2">客户管理</el-menu-item>
            <el-menu-item index="1-3">销售管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><icon-menu /></el-icon>Navigator Two
            </template>
            <el-menu-item-group>
              <template #title>Group 1</template>
              <el-menu-item index="2-1">Option 1</el-menu-item>
              <el-menu-item index="2-2">Option 2</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Group 2">
              <el-menu-item index="2-3">Option 3</el-menu-item>
            </el-menu-item-group>
            <el-sub-menu index="2-4">
              <template #title>Option 4</template>
              <el-menu-item index="2-4-1">Option 4-1</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><setting /></el-icon>Navigator Three
            </template>
            <el-menu-item-group>
              <template #title>Group 1</template>
              <el-menu-item index="3-1">Option 1</el-menu-item>
              <el-menu-item index="3-2">Option 2</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Group 2">
              <el-menu-item index="3-3">Option 3</el-menu-item>
            </el-menu-item-group>
            <el-sub-menu index="3-4">
              <template #title>Option 4</template>
              <el-menu-item index="3-4-1">Option 4-1</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <div class="toolbar">
          <el-dropdown>
            <el-icon style="margin-right: 8px; margin-top: 1px">
              <setting />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>{{state.suName}}</span>
        </div>
      </el-header>

      <el-main>
        <el-scrollbar>
          <el-table :data="state.tableData">
            <el-table-column prop="suId" label="编号" width="140" />
            <el-table-column prop="suName" label="名称" width="120" />
            <el-table-column prop="suPwd" label="密码" width="120" />
            <el-table-column prop="suRole" label="角色" width="120" />
            <el-table-column prop="suTime" label="时间" width="120" />
          </el-table>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { Menu as IconMenu, Message, Setting, Avatar } from "@element-plus/icons-vue";
import { reactive, onMounted } from "vue";
import axios from "axios";
import {useRouter} from 'vue-router'

const router = useRouter()

// 定义页面的数据变量对象state
const state = reactive({
  tableData: [],
  suName: ''
});

// 获取后台数据的方法定义
const getData = () => {
  axios({
    method: "get",
    url: "http://localhost:8080/sysUser/listUser"
  }).then((res) => {
    state.tableData = res.data;
  });
};

// 退出登录的方法
const logout = () => {
  // 清除本地保存的登录信息
  localStorage.clear()
  // 跳转到登录页面
  router.push('/login')
}


// 页面初始化之后会执行这个方法
onMounted(() => {
  const suName = localStorage.getItem('suName')
  if(suName){
    state.suName = suName
  }else{
    router.push('/login')
  }

  // 初始化表格数据
  getData();
});
</script>


<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside,
.el-menu,
.el-sub-menu,
.el-menu-item,
.el-menu-item-group {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
