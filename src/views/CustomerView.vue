<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="'>'" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/user' }">销售模块</el-breadcrumb-item>
      <el-breadcrumb-item>客户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 新增按钮 -->
    <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
  </div>

  <el-table :data="state.customerData" style="width: 100%" border stripe v-loading="state.loading">
    <!-- 前端计算序号 -->
    <el-table-column fixed label="编号" width="150">
      <template #default="scope">
        {{ (state.pageNum - 1) * state.pageSize + scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="customerName" label="客户名称" width="200" />
    <el-table-column prop="contact" label="联系方式" width="200" />
    <el-table-column prop="email" label="邮箱" width="200" />
    <el-table-column prop="createdAt" label="创建时间" />
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
      <!-- 编辑时显示客户ID（仅作为标识，不允许修改），新增时隐藏 -->
      <el-form-item 
        label="客户ID" 
        :label-width="state.formLabelWidth" 
        prop="customerId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.customerId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="客户名称" :label-width="state.formLabelWidth" prop="customerName">
        <el-input v-model="state.form.customerName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="联系方式" :label-width="state.formLabelWidth" prop="contact">
        <el-input v-model="state.form.contact" autocomplete="off" />
      </el-form-item>
      <el-form-item label="邮箱" :label-width="state.formLabelWidth" prop="email">
        <el-input v-model="state.form.email" autocomplete="off" />
      </el-form-item>
      <el-form-item label="创建时间" :label-width="state.formLabelWidth" prop="createdAt">
        <el-date-picker
          v-model="state.form.createdAt"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择日期时间"
          style="width: 100%"
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
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from "axios";
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus'

// 定义客户数据类型接口
interface Customer {
  customerId: string;
  customerName: string;
  contact: string;
  email: string;
  createdAt: string;
}

// 定义表单数据类型
interface CustomerForm extends Customer {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: Customer[];
  count: number;
}

// 定义通用API响应类型
interface ApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

const ruleFormRef = ref<FormInstance>()

// 定义页面的数据变量对象
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改客户信息',
  isEdit: true, // 区分新增和编辑
  formLabelWidth: "140px",
  customerData: [] as Customer[],
  pageNum: 1, // 第几页
  pageSize: 15, // 每页多少行数据
  total: 0,
  loading: false,
  form: {
    customerId: "",
    customerName: "",
    contact: "",
    email: "",
    createdAt: ""
  } as CustomerForm,
});

// 校验规则
const rules = reactive({
  customerName: [
    { required: true, message: '客户名称不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  contact: [
    { required: false, message: '请输入联系方式', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  createdAt: [
    { required: true, message: '创建时间不能为空', trigger: 'blur' }
  ]
});

// 获取后台数据
const getCustomerData = () => {
  state.loading = true;
  axios.get<PageResponse>("http://localhost:8080/customer/pageCustomers", {
    params: {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
    },
  }).then(res => {
    state.customerData = res.data.data;
    state.total = res.data.count;
    state.loading = false;
  }).catch(err => {
    state.loading = false;
    ElMessage.error('获取数据失败：' + err.message);
  });
};

// 页码改变时刷新数据
const refreshData = (page: number) => {
  state.pageNum = page;
  getCustomerData();
};

// 新增按钮点击事件
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增客户';
  state.dialogFormVisible = true;
  // 重置表单
  state.form = {
    customerId: "",
    customerName: "",
    contact: "",
    email: "",
    createdAt: ""
  };
  ruleFormRef.value?.resetFields();
};

// 编辑按钮点击事件
const handleEdit = (row: Customer) => {
  state.isEdit = true;
  state.dialogTitle = '修改客户信息';
  state.dialogFormVisible = true;
  // 回填表单数据
  state.form = { ...row };
};

// 提交表单（新增/编辑）
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/customer/update" 
    : "http://localhost:8080/customer/add";
  
  try {
    const res = await axios.post<ApiResponse>(url, state.form);
    if (res.data.code === 0) {
      ElMessage.success(state.isEdit ? '修改成功' : '新增成功');
      state.dialogFormVisible = false;
      getCustomerData(); // 刷新数据
    } else {
      ElMessage.error(res.data.msg || (state.isEdit ? '修改失败' : '新增失败'));
    }
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试');
  }
};

// 删除按钮点击事件
const handleDelete = (row: Customer) => {
  ElMessageBox.confirm(
    `确定要删除客户 ${row.customerName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/customer/delete", { 
        customerId: row.customerId 
      });
      
      if (res.data.code === 0) {
        ElMessage.success('删除成功');
        getCustomerData();
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
onMounted(getCustomerData);
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