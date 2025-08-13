<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="'>'" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/sales' }">销售模块</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/user' }">用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 新增按钮 -->
    <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
  </div>

  <el-table :data="state.tableData" style="width: 100%" border stripe>
    <!-- 前端计算序号 -->
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
          <!-- 编辑按钮 -->
          <el-button 
            :icon="Edit" 
            size="small" 
            type="primary" 
            @click="handleEdit(scope.row)"
            class="edit-btn"
          />
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <!-- 删除按钮 -->
          <el-button 
            :icon="Delete" 
            size="small" 
            type="primary" 
            @click="handleDelete(scope.row)"
            class="delete-btn"
          />
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页工具栏 -->
  <div style="position: fixed; bottom: 20px; left: 0; right: 0; display: flex; justify-content: center; z-index: 10;">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="state.total"
      :page-size="state.pageSize"
      @current-change="refreshData"
    ></el-pagination>
  </div>

  <el-dialog v-model="state.dialogFormVisible" :title="state.dialogTitle" width="500">
    <el-form :model="state.form" ref="ruleFormRef" :rules="rules">
      <!-- 编辑时显示数据库ID，新增时隐藏 -->
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
          <el-option label="普通用户" value="user"></el-option>
          <el-option label="管理员" value="admin"></el-option> 
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" :label-width="state.formLabelWidth" prop="suTime">
        <el-date-picker
          v-model="state.form.suTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择日期时间"
          style="width: 100%"
        ></el-date-picker>
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
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 定义用户数据类型接口
interface User {
  suId: string;
  suName: string;
  suRole: string;
  suTime: string;
  suPwd?: string;
}

// 定义表单数据类型
interface UserForm extends User {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: User[];
  count: number;
}

// 定义通用API响应类型
interface ApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

const ruleFormRef = ref<FormInstance>()

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改用户信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as User[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    suId: "",
    suName: "",
    suRole: "",
    suTime: "",
    suPwd: ""
  } as UserForm,
});

// 表单校验规则
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
      required: () => !state.isEdit,
      message: '密码不能为空', 
      trigger: 'blur' 
    },
    { min: 4, max: 20, message: '密码长度在 4 到 20 个字符', trigger: 'blur' }
  ]
})

// 获取用户数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/sysUser/pageUser", {
    params: {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
    },
  }).then(res => {
    state.tableData = res.data.data;
    state.total = res.data.count;
  }).catch(err => {
    ElMessage.error('获取数据失败：' + err.message)
  });
};

// 刷新分页数据
const refreshData = (page: number) => {
  state.pageNum = page;
  getData();
};

// 新增用户
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增用户';
  state.dialogFormVisible = true;
  state.form = {
    suId: "",
    suName: "",
    suRole: "",
    suTime: "",
    suPwd: ""
  };
  ruleFormRef.value?.resetFields();
};

// 编辑用户
const handleEdit = (row: User) => {
  state.isEdit = true;
  state.dialogTitle = '修改用户信息';
  state.dialogFormVisible = true;
  state.form = { ...row, suPwd: '' };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/sysUser/update" 
    : "http://localhost:8080/sysUser/add";
  
  try {
    const res = await axios.post<ApiResponse>(url, state.form);
    if (res.data.code === 0) {
      ElMessage.success(state.isEdit ? '修改成功' : '新增成功');
      state.dialogFormVisible = false;
      getData();
    } else {
      ElMessage.error(res.data.msg || (state.isEdit ? '修改失败' : '新增失败'));
    }
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试');
  }
};

// 删除用户
const handleDelete = (row: User) => {
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
      const res = await axios.post<ApiResponse>("http://localhost:8080/sysUser/delete", { 
        suId: row.suId 
      });
      
      if (res.data.code === 0) {
        ElMessage.success('删除成功');
        getData();
      } else {
        ElMessage.error(res.data.msg || '删除失败');
      }
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => {
    ElMessage.info('操作已取消');
  });
};

// 页面初始化
onMounted(getData);
</script>

<style scoped>
/* 面包屑样式 */
::v-deep .el-breadcrumb {
  font-size: 14px;
}

::v-deep .el-breadcrumb__item .el-breadcrumb__inner {
  font-size: 17px;
}

::v-deep .el-breadcrumb__separator {
  font-size: 14px;
  margin: 0 8px;
}

/* 表格样式 */
::v-deep .el-table__inner-wrapper {
  font-size: 16px !important;
}

::v-deep .el-table th.el-table__cell > .cell {
  font-size: 15px !important;
  font-weight: bold;
}

::v-deep .el-table td.el-table__cell > .cell {
  font-size: 14px !important;
}

/* 圆形按钮样式 */
.edit-btn {
  color: #409EFF;
  background-color: #ecf5ff;
  margin-right: 8px;
}

.delete-btn {
  color: #F56C6C;
  background-color: #fef0f0;
}

/* 按钮图标大小 */
::v-deep .el-button .el-icon {
  font-size: 16px;
}

.el-main {
  margin: 10px;
}
</style>