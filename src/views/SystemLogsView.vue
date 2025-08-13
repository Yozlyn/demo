<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统设置</el-breadcrumb-item>
      <el-breadcrumb-item>操作日志</el-breadcrumb-item>
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
    <el-table-column prop="logId" label="日志ID" width="120" />
    <el-table-column prop="userId" label="用户ID" width="120" />
    <el-table-column prop="username" label="用户名" width="150" />
    <el-table-column prop="operation" label="操作" width="180" />
    <el-table-column prop="operationTime" label="操作时间" width="180" />
    <el-table-column prop="ipAddress" label="IP地址" width="150" />
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

const ruleFormRef = ref<FormInstance>()

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改日志信息',
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
    { required: true, message: '用户ID不能为空', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
  ],
  operation: [
    { required: true, message: '操作不能为空', trigger: 'blur' },
  ],
  operationTime: [
    { required: true, message: '操作时间不能为空', trigger: 'blur' },
  ],
  ipAddress: [
    { required: true, message: 'IP地址不能为空', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '状态不能为空', trigger: 'blur' },
  ],
})

// 获取日志数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/systemLog/page", {
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

// 新增日志
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增日志';
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
  state.dialogTitle = '修改日志信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/systemLog/update" 
    : "http://localhost:8080/systemLog/add";
  
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

// 删除日志
const handleDelete = (row: SystemLog) => {
  ElMessageBox.confirm(
    `确定要删除日志ID为${row.logId}的日志吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/systemLog/delete", { 
        logId: row.logId 
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
    default: return 'info';
  }
};

// 状态文本映射
const getStatusText = (status: string) => {
  switch (status) {
    case 'success': return '成功';
    case 'failed': return '失败';
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

