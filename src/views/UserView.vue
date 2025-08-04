<template>
  <el-table :data="state.tableData" style="width: 100%">
    <el-table-column fixed prop="suId" label="编号" width="150" />
    <el-table-column prop="suName" label="用户名" width="120" />
    <el-table-column prop="suRole" label="角色" width="120" />
    <el-table-column prop="suTime" label="创建时间" />
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          Detail
        </el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
    <!-- 分页工具栏 -->
  <el-pagination
    background
    layout="prev, pager, next"
    :total="state.total"
    :page-size="state.pageSize"
    @current-change="refreshData"
  />
</template>

<script lang="ts" setup>
import { reactive, onMounted } from "vue";
import axios from "axios";

// 定义页面的数据变量对象state
const state = reactive({
  tableData: [],
  pageNum: 1,   //第几页
  pageSize: 2,   //每页有多少行数据
  total: 0
});

// 获取后台数据的方法定义
const getData = () => {
  axios({
    method: "get",
    url: "http://localhost:8080/sysUser/pageUser",
    params: {
        pageNum: state.pageNum,
        pageSize: state.pageSize
    }
  }).then((res) => {
    state.tableData = res.data.data;
    state.total = res.data.count
  });
};

// 当页码改变时，刷新数据
const refreshData = (page) => {
    state.pageNum = page
    getData()
}

const handleClick = () => {
  console.log('click')
}

// 页面初始化之后会执行这个方法
onMounted(() => {
  // 初始化表格数据
  getData();
});
</script>
