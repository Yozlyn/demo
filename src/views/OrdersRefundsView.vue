<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>退款处理</el-breadcrumb-item>
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
    <el-table-column prop="refundId" label="退款ID" width="120" />
    <el-table-column prop="orderId" label="订单ID" width="120" />
    <el-table-column prop="customerId" label="客户ID" width="120" />
    <el-table-column prop="refundAmount" label="退款金额" width="120" />
    <el-table-column prop="refundReason" label="退款原因" min-width="200" />
    <el-table-column prop="applyDate" label="申请日期" width="150" />
    <el-table-column prop="status" label="状态" width="100">
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)">
          {{ getStatusText(scope.row.status) }}
        </el-tag>
      </template>
    </el-table-column>
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
        label="退款ID" 
        :label-width="state.formLabelWidth" 
        prop="refundId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.refundId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="订单ID" :label-width="state.formLabelWidth" prop="orderId">
        <el-input v-model="state.form.orderId" autocomplete="off" />
      </el-form-item>
      <el-form-item label="客户ID" :label-width="state.formLabelWidth" prop="customerId">
        <el-input v-model="state.form.customerId" autocomplete="off" />
      </el-form-item>
      <el-form-item label="退款金额" :label-width="state.formLabelWidth" prop="refundAmount">
        <el-input-number v-model="state.form.refundAmount" :min="0" />
      </el-form-item>
      <el-form-item label="退款原因" :label-width="state.formLabelWidth" prop="refundReason">
        <el-input type="textarea" v-model="state.form.refundReason" autocomplete="off" />
      </el-form-item>
      <el-form-item label="申请日期" :label-width="state.formLabelWidth" prop="applyDate">
        <el-date-picker
          v-model="state.form.applyDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="状态" :label-width="state.formLabelWidth" prop="status">
        <el-select v-model="state.form.status" placeholder="请选择状态">
          <el-option label="待处理" value="pending"></el-option>
          <el-option label="已批准" value="approved"></el-option>
          <el-option label="已拒绝" value="rejected"></el-option>
          <el-option label="已退款" value="refunded"></el-option>
        </el-select>
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

// 定义退款数据类型接口
interface OrderRefund {
  refundId: string;
  orderId: string;
  customerId: string;
  refundAmount: number;
  refundReason: string;
  applyDate: string;
  status: string;
}

// 定义表单数据类型
interface OrderRefundForm extends OrderRefund {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: OrderRefund[];
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
  dialogTitle: '修改退款信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as OrderRefund[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    refundId: "",
    orderId: "",
    customerId: "",
    refundAmount: 0,
    refundReason: "",
    applyDate: "",
    status: "",
  } as OrderRefundForm,
});

// 表单校验规则
const rules = reactive({
  orderId: [
    { required: true, message: '订单ID不能为空', trigger: 'blur' },
  ],
  customerId: [
    { required: true, message: '客户ID不能为空', trigger: 'blur' },
  ],
  refundAmount: [
    { required: true, message: '退款金额不能为空', trigger: 'blur' },
  ],
  refundReason: [
    { required: true, message: '退款原因不能为空', trigger: 'blur' },
  ],
  applyDate: [
    { required: true, message: '申请日期不能为空', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '状态不能为空', trigger: 'blur' },
  ],
})

// 获取退款数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/orderRefund/page", {
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

// 新增退款
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增退款';
  state.dialogFormVisible = true;
  state.form = {
    refundId: "",
    orderId: "",
    customerId: "",
    refundAmount: 0,
    refundReason: "",
    applyDate: "",
    status: "",
  };
  ruleFormRef.value?.resetFields();
};

// 编辑退款
const handleEdit = (row: OrderRefund) => {
  state.isEdit = true;
  state.dialogTitle = '修改退款信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/orderRefund/update" 
    : "http://localhost:8080/orderRefund/add";
  
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

// 删除退款
const handleDelete = (row: OrderRefund) => {
  ElMessageBox.confirm(
    `确定要删除退款ID为${row.refundId}的退款吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/orderRefund/delete", { 
        refundId: row.refundId 
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
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    case 'refunded': return 'info';
    default: return 'info';
  }
};

// 状态文本映射
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待处理';
    case 'approved': return '已批准';
    case 'rejected': return '已拒绝';
    case 'refunded': return '已退款';
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

