<template>
  <div class="users-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入用户名/ID"  
          :prefix-icon="Search"
          size="default"
          style="width: 250px;"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="状态" size="default" style="margin-left: 10px; width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="异常" value="异常"></el-option>
          <el-option label="注销" value="注销"></el-option>
          <el-option label="正常" value="正常"></el-option>
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

    <!-- 用户数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="suId"
            height="calc(100vh - 280px)" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column label="头像" width="80">
              <template #default="scope">
                <el-avatar 
                  :src="scope.row.avatar || '/src/assets/images/avatar.jpg'"
                  :size="40"
                  @error="() => true"
                />
              </template>
            </el-table-column>
            <el-table-column prop="suName" label="用户名" min-width="150">
              <template #default="scope">
                <span>{{ scope.row.suName }}</span>
                <span v-if="scope.row.email" style="margin-left: 10px; color: #909399;">
                  {{ scope.row.email }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="suRole" label="角色" width="120" />
            <el-table-column prop="suId" label="ID" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="suTime" label="创建时间" width="180" />
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
    <el-dialog v-model="state.dialogFormVisible" :title="state.dialogTitle" width="500">
      <el-form :model="state.form" ref="ruleFormRef" :rules="rules">
        <el-form-item label="系统ID" :label-width="state.formLabelWidth" prop="suId" v-if="state.isEdit">
          <el-input v-model="state.form.suId" autocomplete="off" readonly />
        </el-form-item>
        <el-form-item label="用户名" :label-width="state.formLabelWidth" prop="suName">
          <el-input v-model="state.form.suName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" :label-width="state.formLabelWidth">
          <el-input v-model="state.form.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色" :label-width="state.formLabelWidth" prop="suRole">
          <el-select v-model="state.form.suRole" placeholder="请选择角色">
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" :label-width="state.formLabelWidth">
          <el-select v-model="state.form.status" placeholder="请选择状态">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="异常" value="异常"></el-option>
            <el-option label="离职" value="离职"></el-option>
            <el-option label="注销" value="注销"></el-option>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from "axios";
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

// 用户数据接口
interface User {
  suId: string;
  suName: string;
  suRole: string;
  suTime: string;
  suPwd?: string;
  email?: string;
  status?: string;
  avatar?: string;
}

// API响应接口
interface PageResponse {
  code: number;
  msg?: string;
  data: User[];
  count: number;
}

interface ApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

const ruleFormRef = ref<FormInstance>();
const tableLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const selectedRows = ref<User[]>([]);

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改用户信息',
  isEdit: true,
  formLabelWidth: "100px",
  tableData: [] as User[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    suId: "",
    suName: "",
    suRole: "",
    suTime: "",
    suPwd: "",
    email: "",
    status: "正常",
    avatar: ""
  } as User,
});

// 表单校验规则
const rules = reactive({
  suName: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  suRole: [{ required: true, message: '角色不能为空', trigger: 'blur' }],
  suTime: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }],
  suPwd: [{ 
    validator: (rule: any, value: string, callback: any) => {
      if (!state.isEdit && !value) callback(new Error('密码不能为空'));
      else if (value && (value.length < 4 || value.length > 20)) callback(new Error('密码长度在 4 到 20 个字符'));
      else callback();
    }, 
    trigger: 'blur' 
  }]
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.suName.includes(searchQuery.value) || 
                       (item.email && item.email.includes(searchQuery.value)) ||
                       item.suId.includes(searchQuery.value);
    const statusMatch = !statusFilter.value || item.status === statusFilter.value;
    return searchMatch && statusMatch;
  });
});

// 获取状态标签类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '异常': 'danger', '离职': 'info', '正常': 'success'
  };
  return statusMap[status] || 'default';
};

// 获取用户数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/sysUser/pageUser", {
    params: { pageNum: state.pageNum, pageSize: state.pageSize }
  }).then(res => {
    state.tableData = res.data.data.map(user => ({
      ...user,
      email: user.email || '',
      avatar: user.avatar || "/src/assets/images/avatar.jpg"
    }));
    state.total = res.data.count;
  }).catch(err => {
    ElMessage.error('获取数据失败：' + err.message);
  }).finally(() => {
    tableLoading.value = false;
  });
};

// 分页相关函数
const refreshData = (page: number) => { state.pageNum = page; getData(); };
const handleSizeChange = (size: number) => { state.pageSize = size; getData(); };

// 新增/编辑用户
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增用户';
  state.dialogFormVisible = true;
  state.form = { suId: "", suName: "", suRole: "", suTime: "", suPwd: "", email: "", status: "正常", avatar: "" };
  ruleFormRef.value?.resetFields();
};

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
  const url = state.isEdit ? "http://localhost:8080/sysUser/update" : "http://localhost:8080/sysUser/add";
  
  try {
    const submitData: any = { ...state.form, suEmail: state.form.email };
    if (state.isEdit && !state.form.suPwd) delete submitData.suPwd;
    
    const res = await axios.post<ApiResponse>(url, submitData);
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
  ElMessageBox.confirm(`确定要删除用户${row.suName}吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/sysUser/delete", { suId: row.suId });
      if (res.data.code === 0) {
        ElMessage.success('删除成功');
        getData();
      } else {
        ElMessage.error(res.data.msg || '删除失败');
      }
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => ElMessage.info('操作已取消'));
};

// 表格选择和批量删除
const handleSelectionChange = (val: User[]) => { selectedRows.value = val; };

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的用户吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      const suIds = selectedRows.value.map(row => row.suId);
      const res = await axios.post<ApiResponse>("http://localhost:8080/sysUser/batchDelete", { suIds });
      if (res.data.code === 0) {
        ElMessage.success(`成功删除${selectedRows.value.length}个用户`);
        selectedRows.value = [];
        getData();
      } else {
        ElMessage.error(res.data.msg || '批量删除失败');
      }
    } catch (error) {
      ElMessage.error('批量删除失败，请稍后重试');
    }
  }).catch(() => ElMessage.info('操作已取消'));
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