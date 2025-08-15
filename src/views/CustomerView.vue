<template>
  <div class="users-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入客户名称/联系方式/邮箱"  
          :prefix-icon="Search"
          size="default"
          style="width: 250px;"
          clearable
        />
      </div>
      <div>
        <el-button 
          class="custom-primary-button" 
          :icon="Plus" 
          @click="handleAdd"
        >
          新增
        </el-button>
        <el-button 
          class="custom-batch-delete-button" 
          :icon="Delete"
          style="margin-left: 10px;" 
          @click="handleBatchDelete" 
          :disabled="selectedRows.length === 0"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 客户数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="customerId"
            height="calc(100vh - 280px)" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column prop="customerName" label="客户名称" min-width="180" />
            <el-table-column prop="customerPhone" label="联系方式" width="150" />
            <el-table-column prop="customerEmail" label="邮箱" min-width="200" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column fixed="right" label="操作" width="140">
              <template #default="scope">
                <el-tooltip content="编辑" placement="top">
                  <el-button 
                    :icon="Edit" 
                    size="default"
                    class="custom-edit-button"
                    @click="handleEdit(scope.row)"
                    style="margin-right: 8px;"
                  />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button 
                    :icon="Delete" 
                    size="default"
                    class="custom-delete-button"
                    @click="handleDelete(scope.row)"
                  />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="state.pageNum"
              v-model:page-size="state.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="state.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="refreshData"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表单弹窗 -->
    <el-dialog v-model="state.dialogFormVisible" :title="state.dialogTitle" width="600">
      <el-form :model="state.form" ref="ruleFormRef" :rules="rules">
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
        <el-form-item label="联系方式" :label-width="state.formLabelWidth" prop="customerPhone">
          <el-input v-model="state.form.customerPhone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" :label-width="state.formLabelWidth" prop="customerEmail">
          <el-input v-model="state.form.customerEmail" autocomplete="off" />
        </el-form-item>
        <el-form-item label="注册时间" :label-width="state.formLabelWidth" prop="registrationDate">
          <el-date-picker
            v-model="state.form.registrationDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择注册时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="state.dialogFormVisible = false">取消</el-button>
          <el-button class="custom-edit-button" @click="submitForm(ruleFormRef)">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { Plus, Edit, Delete, Search } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";

// 定义客户数据类型接口
interface Customer {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  registrationDate: string;
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

const ruleFormRef = ref<FormInstance>();
const tableLoading = ref(false);
const searchQuery = ref("");
const selectedRows = ref<Customer[]>([]);

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: "修改客户信息",
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as Customer[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    registrationDate: "",
    createdAt: ""
  } as CustomerForm,
});

// 表单校验规则
const rules = reactive({
  customerName: [
    { required: true, message: "客户名称不能为空", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" }
  ],
  customerPhone: [
    { required: true, message: "联系方式不能为空", trigger: "blur" },
    { pattern: /^\d{10,20}$/, message: "请输入10-20位的电话号码", trigger: "blur" }
  ],
  customerEmail: [
    { type: "email", message: "请输入有效的邮箱地址", trigger: ["blur", "change"] }
  ],
  registrationDate: [
    { required: true, message: "注册时间不能为空", trigger: "blur" }
  ]
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.customerName.includes(searchQuery.value) || 
                       item.customerPhone.includes(searchQuery.value) ||
                       item.customerEmail.includes(searchQuery.value);
    return searchMatch;
  });
});

// 获取客户数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/customer/pageCustomers", {
    params: {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
    },
  }).then(res => {
    state.tableData = res.data.data;
    state.total = res.data.count;
  }).catch(err => {
    console.error("获取数据失败：", err);
    ElMessage.error("获取数据失败：" + err.message);
  }).finally(() => {
    tableLoading.value = false;
  });
};

// 分页相关函数
const refreshData = (page: number) => { state.pageNum = page; getData(); };
const handleSizeChange = (size: number) => { state.pageSize = size; getData(); };

// 新增客户
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = "新增客户";
  state.dialogFormVisible = true;
  state.form = {
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    registrationDate: "",
    createdAt: ""
  };
  ruleFormRef.value?.resetFields();
};

// 编辑客户
const handleEdit = (row: Customer) => {
  state.isEdit = true;
  state.dialogTitle = "修改客户信息";
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/customer/update" 
    : "http://localhost:8080/customer/add";
  
  // 映射前端字段到后端字段
  const payload = {
    customerId: state.isEdit ? parseInt(state.form.customerId) : undefined,
    customerName: state.form.customerName,
    customerPhone: state.form.customerPhone,
    customerEmail: state.form.customerEmail,
    registrationDate: state.form.registrationDate
  };
  
  try {
    const res = await axios.post<ApiResponse>(url, payload);
    if (res.data.code === 0) {
      ElMessage.success(state.isEdit ? "修改成功" : "新增成功");
      state.dialogFormVisible = false;
      getData();
    } else {
      console.error("后端错误：", res.data);
      ElMessage.error(res.data.msg || (state.isEdit ? "修改失败" : "新增失败"));
    }
  } catch (error) {
    console.error("提交失败：", error);
    ElMessage.error("提交失败，请稍后重试");
  }
};

// 删除客户
const handleDelete = (row: Customer) => {
  ElMessageBox.confirm(
    `确定要删除客户 ${row.customerName} 吗？`,
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/customer/delete", { 
        customerId: parseInt(row.customerId) 
      });
      
      if (res.data.code === 0) {
        ElMessage.success("删除成功");
        getData();
      } else {
        ElMessage.error(res.data.msg || "删除失败");
      }
    } catch (error) {
      console.error("删除失败：", error);
      ElMessage.error("删除失败，请稍后重试");
    }
  }).catch(() => {
    ElMessage.info("操作已取消");
  });
};

// 表格选择和批量删除
const handleSelectionChange = (val: Customer[]) => { selectedRows.value = val; };

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要删除的客户");
    return;
  }
  
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的客户吗？`, "警告", {
    confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"
  }).then(async () => {
    try {
      // 提取客户ID数组
      const customerIds = selectedRows.value.map(row => parseInt(row.customerId));
      
      // 关键修复：直接传递数组而不是包装在对象中
      const res = await axios.post<ApiResponse>(
        "http://localhost:8080/customer/batchDelete", 
        customerIds  // 这里去掉了对象包装
      );
      
      if (res.data.code === 0) {
        ElMessage.success(`成功删除${selectedRows.value.length}个客户`);
        selectedRows.value = [];
        getData();
      } else {
        ElMessage.error(res.data.msg || "批量删除失败");
      }
    } catch (error) {
      console.error("批量删除失败：", error);
      ElMessage.error("批量删除失败，请稍后重试");
    }
  }).catch(() => ElMessage.info("操作已取消"));
};

// 页面初始化
onMounted(getData);
</script>

<style scoped>
.users-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-actions {
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-grow: 1;
}

.table-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.el-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
}

.el-table td {
  padding: 6px;
}

.el-table .cell {
  line-height: 1.5;
}

/* 表格样式 */
.el-table {
  background-color: #fff;
  border-radius: 8px;
}

/* 禁用表格内部滚动，让滚动事件传递到页面 */
.el-table .el-table__body-wrapper {
  overflow: hidden !important;
}

.el-table__body-wrapper::-webkit-scrollbar {
  display: none !important;
}

.table-card .el-card__body {
  padding: 0;
  overflow: visible;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 统一按钮样式 */
.custom-primary-button,
.custom-batch-delete-button,
.custom-edit-button {
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

.custom-primary-button:hover,
.custom-batch-delete-button:hover,
.custom-edit-button:hover {
  background-color: #c6e2ff;
  border-color: #b3d8ff;
}

.custom-batch-delete-button {
  border-color: #79bbff;
}

.custom-batch-delete-button:hover {
  background-color: #b3d8ff;
  border-color: #66b1ff;
}

.custom-batch-delete-button:disabled {
  background-color: #f5f7fa;
  border-color: #dfe4ed;
  color: #c0c4cc;
}

.custom-delete-button {
  background-color: #fde2e2;
  border-color: #fab6b6;
  color: #f56c6c;
}

.custom-delete-button:hover {
  background-color: #f8c7c7;
  border-color: #f89898;
}

@media (max-width: 768px) {
  .users-container {
    padding: 16px;
  }
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>