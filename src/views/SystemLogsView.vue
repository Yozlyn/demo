<template>
  <div class="users-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入用户ID/用户名/操作"  
          :prefix-icon="Search"
          size="default"
          style="width: 250px;"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="状态" size="default" style="margin-left: 10px; width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="成功" value="success"></el-option>
          <el-option label="失败" value="failed"></el-option>
        </el-select>
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

    <!-- 日志数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="logId"
            height="calc(100vh - 280px)" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column prop="userId" label="用户ID" width="120" />
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="operation" label="操作" min-width="180" />
            <el-table-column prop="operationTime" label="操作时间" width="180" />
            <el-table-column prop="ipAddress" label="IP地址" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
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
          label="日志ID" 
          :label-width="state.formLabelWidth" 
          prop="logId"
          v-if="state.isEdit"
        >
          <el-input v-model="state.form.logId" autocomplete="off" readonly />
        </el-form-item>
        <el-form-item label="用户ID" :label-width="state.formLabelWidth" prop="userId">
          <el-input v-model="state.form.userId" autocomplete="off" />
        </el-form-item>
        <el-form-item label="用户名" :label-width="state.formLabelWidth" prop="username">
          <el-input v-model="state.form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="操作" :label-width="state.formLabelWidth" prop="operation">
          <el-input v-model="state.form.operation" autocomplete="off" />
        </el-form-item>
        <el-form-item label="操作时间" :label-width="state.formLabelWidth" prop="operationTime">
          <el-date-picker
            v-model="state.form.operationTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择日期时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="IP地址" :label-width="state.formLabelWidth" prop="ipAddress">
          <el-input v-model="state.form.ipAddress" autocomplete="off" />
        </el-form-item>
        <el-form-item label="状态" :label-width="state.formLabelWidth" prop="status">
          <el-select v-model="state.form.status" placeholder="请选择状态">
            <el-option label="成功" value="success"></el-option>
            <el-option label="失败" value="failed"></el-option>
          </el-select>
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

// 定义日志数据类型接口
interface SystemLog {
  logId: string;
  userId: string;
  username: string;
  operation: string;
  operationTime: string;
  ipAddress: string;
  status: string;
}

// 定义表单数据类型
interface SystemLogForm extends SystemLog {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: SystemLog[];
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
const statusFilter = ref("");
const selectedRows = ref<SystemLog[]>([]);

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: "修改日志信息",
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as SystemLog[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    logId: "",
    userId: "",
    username: "",
    operation: "",
    operationTime: "",
    ipAddress: "",
    status: "",
  } as SystemLogForm,
});

// 表单校验规则
const rules = reactive({
  userId: [
    { required: true, message: "用户ID不能为空", trigger: "blur" },
  ],
  username: [
    { required: true, message: "用户名不能为空", trigger: "blur" },
  ],
  operation: [
    { required: true, message: "操作不能为空", trigger: "blur" },
  ],
  operationTime: [
    { required: true, message: "操作时间不能为空", trigger: "change" },
  ],
  ipAddress: [
    { required: true, message: "IP地址不能为空", trigger: "blur" },
  ],
  status: [
    { required: true, message: "状态不能为空", trigger: "blur" },
  ],
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.userId.includes(searchQuery.value) || 
                       item.username.includes(searchQuery.value) ||
                       item.operation.includes(searchQuery.value);
    const statusMatch = !statusFilter.value || item.status === statusFilter.value;
    return searchMatch && statusMatch;
  });
});

// 状态类型映射
const getStatusType = (status: string) => {
  switch (status) {
    case "success": return "success";
    case "failed": return "danger";
    default: return "info";
  }
};

// 状态文本映射
const getStatusText = (status: string) => {
  switch (status) {
    case "success": return "成功";
    case "failed": return "失败";
    default: return status;
  }
};

// 获取日志数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/systemLog/page", {
    params: {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
    },
  }).then(res => {
    state.tableData = res.data.data;
    state.total = res.data.count;
  }).catch(err => {
    ElMessage.error("获取数据失败：" + err.message);
  }).finally(() => {
    tableLoading.value = false;
  });
};

// 分页相关函数
const refreshData = (page: number) => { state.pageNum = page; getData(); };
const handleSizeChange = (size: number) => { state.pageSize = size; getData(); };

// 新增日志
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = "新增日志";
  state.dialogFormVisible = true;
  state.form = {
    logId: "",
    userId: "",
    username: "",
    operation: "",
    operationTime: "",
    ipAddress: "",
    status: "",
  };
  ruleFormRef.value?.resetFields();
};

// 编辑日志
const handleEdit = (row: SystemLog) => {
  state.isEdit = true;
  state.dialogTitle = "修改日志信息";
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (!valid) {
      ElMessage.error("请填写所有必填字段");
      return;
    }
    const url = state.isEdit 
      ? "http://localhost:8080/systemLog/update" 
      : "http://localhost:8080/systemLog/add";
    const formData = {
      ...state.form,
      operationTime: state.form.operationTime ? new Date(state.form.operationTime).toISOString() : null,
    };
    console.log("Submitting to:", url, "Method: POST", "Data:", formData); // 调试日志
    axios.post<ApiResponse>(url, formData).then(res => {
      if (res.data.code === 0) {
        ElMessage.success(state.isEdit ? "修改成功" : "新增成功");
        state.dialogFormVisible = false;
        getData();
      } else {
        ElMessage.error(res.data.msg || (state.isEdit ? "修改失败" : "新增失败"));
      }
    }).catch(error => {
      console.error("Submit error:", error.response || error); // 详细错误日志
      ElMessage.error("提交失败，请检查网络或服务器");
    });
  });
};

// 删除日志
const handleDelete = (row: SystemLog) => {
  ElMessageBox.confirm(
    `确定要删除日志ID为${row.logId}的日志吗?`,
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/systemLog/delete", { 
        logId: row.logId 
      });
      
      if (res.data.code === 0) {
        ElMessage.success("删除成功");
        getData();
      } else {
        ElMessage.error(res.data.msg || "删除失败");
      }
    } catch (error) {
      ElMessage.error("删除失败，请稍后重试");
    }
  }).catch(() => {
    ElMessage.info("操作已取消");
  });
};

// 表格选择和批量删除
const handleSelectionChange = (val: SystemLog[]) => { selectedRows.value = val; };

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要删除的日志");
    return;
  }
  
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的日志吗？`, "警告", {
    confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"
  }).then(async () => {
    try {
      const logIds = selectedRows.value.map(row => row.logId);
      const res = await axios.post<ApiResponse>("http://localhost:8080/systemLog/batchDelete", logIds);
      if (res.data.code === 0) {
        ElMessage.success(`成功删除${selectedRows.value.length}个日志`);
        selectedRows.value = [];
        getData();
      } else {
        ElMessage.error(res.data.msg || "批量删除失败");
      }
    } catch (error) {
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

.el-table {
  background-color: #fff;
  border-radius: 8px;
}

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