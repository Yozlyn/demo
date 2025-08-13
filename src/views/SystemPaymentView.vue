<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统设置</el-breadcrumb-item>
      <el-breadcrumb-item>支付管理</el-breadcrumb-item>
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
    <el-table-column prop="paymentId" label="支付ID" width="120" />
    <el-table-column prop="paymentMethod" label="支付方式" width="180" />
    <el-table-column prop="accountInfo" label="账户信息" min-width="200" />
    <el-table-column prop="status" label="状态" width="100">
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)">
          {{ getStatusText(scope.row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="lastUpdated" label="最后更新时间" width="180" />
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

  <el-dialog v-model="state.dialogFormVisible" :title="state.dialogTitle" width="600">
    <el-form :model="state.form" ref="ruleFormRef" :rules="rules">
      <el-form-item 
        label="支付ID" 
        :label-width="state.formLabelWidth" 
        prop="paymentId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.paymentId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="支付方式" :label-width="state.formLabelWidth" prop="paymentMethod">
        <el-input v-model="state.form.paymentMethod" autocomplete="off" />
      </el-form-item>
      <el-form-item label="账户信息" :label-width="state.formLabelWidth" prop="accountInfo">
        <el-input type="textarea" v-model="state.form.accountInfo" autocomplete="off" />
      </el-form-item>
      <el-form-item label="状态" :label-width="state.formLabelWidth" prop="status">
        <el-select v-model="state.form.status" placeholder="请选择状态">
          <el-option label="成功" value="success"></el-option>
          <el-option label="失败" value="failed"></el-option>
          <el-option label="处理中" value="processing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="最后更新时间" :label-width="state.formLabelWidth" prop="lastUpdated">
        <el-date-picker
          v-model="state.form.lastUpdated"
          type="datetime"
          placeholder="选择日期时间"
          value-format="YYYY-MM-DD HH:mm:ss"
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

// 定义支付数据类型接口
interface SystemPayment {
  paymentId: string;
  paymentMethod: string;
  accountInfo: string;
  status: string;
  lastUpdated: string;
}

// 定义表单数据类型
interface SystemPaymentForm extends SystemPayment {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: SystemPayment[];
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
  dialogTitle: '修改支付信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as SystemPayment[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    paymentId: "",
    paymentMethod: "",
    accountInfo: "",
    status: "",
    lastUpdated: "",
  } as SystemPaymentForm,
});

// 表单校验规则
const rules = reactive({
  paymentMethod: [
    { required: true, message: '支付方式不能为空', trigger: 'blur' },
  ],
  accountInfo: [
    { required: true, message: '账户信息不能为空', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '状态不能为空', trigger: 'blur' },
  ],
  lastUpdated: [
    { required: true, message: '最后更新时间不能为空', trigger: 'change' },
  ],
})

// 获取支付数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/systemPayment/page", {
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

// 新增支付
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增支付';
  state.dialogFormVisible = true;
  state.form = {
    paymentId: "",
    paymentMethod: "",
    accountInfo: "",
    status: "",
    lastUpdated: "",
  };
  ruleFormRef.value?.resetFields();
};

// 编辑支付
const handleEdit = (row: SystemPayment) => {
  state.isEdit = true;
  state.dialogTitle = '修改支付信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/systemPayment/update" 
    : "http://localhost:8080/systemPayment/add";
  
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

// 删除支付
const handleDelete = (row: SystemPayment) => {
  ElMessageBox.confirm(
    `确定要删除支付ID为${row.paymentId}的支付吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/systemPayment/delete", { 
        paymentId: row.paymentId 
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

// 状态类型映射
const getStatusType = (status: string) => {
  switch (status) {
    case 'success': return 'success';
    case 'failed': return 'danger';
    case 'processing': return 'info';
    default: return 'info';
  }
};

// 状态文本映射
const getStatusText = (status: string) => {
  switch (status) {
    case 'success': return '成功';
    case 'failed': return '失败';
    case 'processing': return '处理中';
    default: return status;
  }
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

