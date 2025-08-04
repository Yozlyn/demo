<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb :separator-icon="ArrowRight" style="margin-bottom: 10px;">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>销售模块</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
  </el-breadcrumb>

  <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
  <el-table :data="state.tableData" style="width: 100%" border stripe>
    <!-- 前端计算序号，替代原有的suId显示 -->
    <el-table-column fixed label="编号" width="150">
      <template #default="scope">
        {{ (state.pageNum - 1) * state.pageSize + scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="suName" label="用户名" width="120" />
    <el-table-column prop="suRole" label="角色" width="120" />
    <el-table-column prop="suTime" label="创建时间" />
    <el-table-column fixed="right" label="操作" min-width="120">
      <template #default="scope">
        <el-tooltip content="编辑" placement="top">
          <el-button type="text" :icon="Edit" @click="handleEdit(scope.row)"></el-button>
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <el-button type="text" class="delete-action" :icon="Delete" @click="handleDelete(scope.row)"></el-button>
        </el-tooltip>
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
    style="margin-top: 10px; text-align: right"
  />

  <el-dialog v-model="state.dialogFormVisible" :title="state.dialogTitle" width="500">
    <el-form :model="state.form" ref="ruleFormRef" :rules="rules">
      <!-- 编辑时显示数据库ID（仅作为标识，不允许修改），新增时隐藏 -->
      <el-form-item 
        label="系统ID" 
        :label-width="state.formLabelWidth" 
        prop="suId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.suId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="用户名" :label-width="state.formLabelWidth" prop="suName">
        <el-input v-model="state.form.suName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="角色" :label-width="state.formLabelWidth" prop="suRole">
        <el-select v-model="state.form.suRole" placeholder="请选择角色">
          <el-option label="普通用户" value="user" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" :label-width="state.formLabelWidth" prop="suTime">
        <el-date-picker
          v-model="state.form.suTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择日期时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="密码" :label-width="state.formLabelWidth" prop="suPwd">
        <el-input 
          v-model="state.form.suPwd" 
          autocomplete="off" 
          type="password"
          placeholder="新增必填，编辑不填则不修改"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="state.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from "axios";
import { ArrowRight } from '@element-plus/icons-vue'
import { Plus } from '@element-plus/icons-vue'
import { Edit } from '@element-plus/icons-vue'
import { Delete } from '@element-plus/icons-vue'

const ruleFormRef = ref()

// 定义页面的数据变量对象state
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改用户信息',
  isEdit: true, // 区分新增和编辑
  formLabelWidth: "140px",
  tableData: [],
  pageNum: 1, //第几页
  pageSize: 10, //每页有多少行数据
  total: 0,
  form: {
    suId: "",
    suName: "",
    suRole: "",
    suTime: "",
    suPwd: ""
  },
});

// 校验规则（移除suId的校验，因为前端不维护编号）
const rules = reactive({
  suName: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  suRole: [
    { required: true, message: '角色不能为空', trigger: 'blur' }
  ],
  suTime: [
    { required: true, message: '创建时间不能为空', trigger: 'blur' }
  ],
  suPwd: [
    { 
      required: () => !state.isEdit, // 新增时必填，编辑时可选
      message: '密码不能为空', 
      trigger: 'blur' 
    },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

// 获取后台数据
const getData = () => {
  axios({
    method: "get",
    url: "http://localhost:8080/sysUser/pageUser",
    params: {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
    },
  }).then((res) => {
    state.tableData = res.data.data;
    state.total = res.data.count;
  }).catch(err => {
    ElMessage.error('获取数据失败：' + err.message)
  });
};

// 页码改变时刷新数据
const refreshData = (page) => {
  state.pageNum = page;
  getData();
};

// 新增按钮点击事件
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增用户';
  state.dialogFormVisible = true;
  // 重置表单（清空ID）
  state.form = {
    suId: "",
    suName: "",
    suRole: "",
    suTime: "",
    suPwd: ""
  };
  // 重置表单验证
  if (ruleFormRef.value) {
    ruleFormRef.value.resetFields();
  }
};

// 编辑按钮点击事件
const handleEdit = (row) => {
  state.isEdit = true;
  state.dialogTitle = '修改用户信息';
  state.dialogFormVisible = true;
  // 回填表单数据（包含ID用于后台识别）
  state.form = JSON.parse(JSON.stringify(row));
  // 清空密码（编辑时不显示原密码）
  state.form.suPwd = '';
};

// 提交表单（新增/编辑）
const submitForm = async (formEl) => {
  if (!formEl) return;
  try {
    await formEl.validate();
    // 校验成功，提交数据
    const url = state.isEdit 
      ? "http://localhost:8080/sysUser/update" 
      : "http://localhost:8080/sysUser/add";
    
    const res = await axios({
      method: "post",
      url,
      data: state.form // 使用data传递json数据（对应后端@RequestBody）
    });

    if (res.data.code === 0) {
      ElMessage.success(state.isEdit ? '修改成功' : '新增成功');
      state.dialogFormVisible = false;
      getData(); // 刷新数据
    } else {
      ElMessage.error(res.data.msg || (state.isEdit ? '修改失败' : '新增失败'));
    }
  } catch (err) {
    console.log('表单校验失败:', err);
  }
};

// 删除按钮点击事件
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户${row.suName}吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios({
        method: "post",
        url: "http://localhost:8080/sysUser/delete",
        data: { suId: row.suId }
      });
      
      if (res.data.code === 0) {
        ElMessage.success('删除成功');
        getData(); // 刷新数据
      } else {
        ElMessage.error(res.data.msg || '删除失败');
      }
    } catch (err) {
      ElMessage.error('删除失败：' + err.message);
    }
  }).catch(() => {
    ElMessage.info('操作已取消');
  });
};

// 页面初始化
onMounted(() => {
  getData();
});
</script>

<style scoped>
.el-main {
  margin: 10px;
}
.delete-action {
  color: red;
}
</style>