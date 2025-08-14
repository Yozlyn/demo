<template>
  <div class="customer-grades-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入等级名称/ID"  
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

    <!-- 会员等级数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="cgId"
            height="calc(100vh - 280px)" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column prop="cgName" label="等级名称" min-width="150" />
            <el-table-column prop="cgDiscount" label="折扣率" width="100">
              <template #default="scope">
                {{ (scope.row.cgDiscount * 100).toFixed(0) }}%
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
      <el-form :model="state.form" ref="ruleFormRef" :rules="state.rules">
        <el-form-item 
          label="等级ID" 
          :label-width="state.formLabelWidth" 
          prop="cgId"
          v-if="state.isEdit"
        >
          <el-input v-model="state.form.cgId" autocomplete="off" readonly />
        </el-form-item>
        <el-form-item label="等级名称" :label-width="state.formLabelWidth" prop="cgName">
          <el-input v-model="state.form.cgName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="折扣率" :label-width="state.formLabelWidth" prop="cgDiscount">
          <el-input-number v-model="state.form.cgDiscount" :min="0" :max="1" :step="0.01" />
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
import type { FormInstance, FormRules } from 'element-plus';

// 定义会员等级数据类型接口
interface CustomerGrade {
  cgId: number;
  cgName: string;
  cgDiscount: number;
}

// 定义表单数据类型
interface CustomerGradeForm extends CustomerGrade {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: CustomerGrade[];
  count: number;
}

// 定义通用API响应类型
interface ApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

// 定义 state 的类型
interface State {
  dialogFormVisible: boolean;
  dialogTitle: string;
  isEdit: boolean;
  formLabelWidth: string;
  tableData: CustomerGrade[];
  pageNum: number;
  pageSize: number;
  total: number;
  form: CustomerGradeForm;
  rules: FormRules;
}

const ruleFormRef = ref<FormInstance>();
const tableLoading = ref(false);
const searchQuery = ref('');
const selectedRows = ref<CustomerGrade[]>([]);

// 页面状态管理
const state = reactive<State>({
  dialogFormVisible: false,
  dialogTitle: '修改会员等级信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    cgId: 0,
    cgName: "",
    cgDiscount: 0,
  },
  rules: {
    cgName: [
      { required: true, message: '等级名称不能为空', trigger: 'blur' },
    ],
    cgDiscount: [
      { required: true, message: '折扣率不能为空', trigger: 'blur' },
    ],
  },
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.cgName.includes(searchQuery.value) || 
                       item.cgId.toString().includes(searchQuery.value);
    return searchMatch;
  });
});

// 获取会员等级数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/customerGrade/page", {
    params: {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
    },
  }).then(res => {
    if (res.data.code === 0) {
      state.tableData = res.data.data.map(item => ({
        cgId: item.cgId || 0,
        cgName: item.cgName || "",
        cgDiscount: item.cgDiscount || 0,
      }));
      console.log("Fetched customer grades data:", state.tableData);
      state.total = res.data.count;
    } else {
      ElMessage.error("获取数据失败：" + (res.data.msg || "未知错误"));
    }
  }).catch(err => {
    console.error('获取数据失败详情：', err);
    ElMessage.error('获取数据失败：' + err.message);
  }).finally(() => {
    tableLoading.value = false;
  });
};

// 分页相关函数
const refreshData = (page: number) => { state.pageNum = page; getData(); };
const handleSizeChange = (size: number) => { state.pageSize = size; getData(); };

// 新增会员等级
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增会员等级';
  state.dialogFormVisible = true;
  state.form = {
    cgId: 0,
    cgName: "",
    cgDiscount: 0,
  };
  ruleFormRef.value?.resetFields();
};

// 编辑会员等级
const handleEdit = (row: CustomerGrade) => {
  state.isEdit = true;
  state.dialogTitle = '修改会员等级信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/customerGrade/update" 
    : "http://localhost:8080/customerGrade/add";
  
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

// 删除会员等级
const handleDelete = (row: CustomerGrade) => {
  ElMessageBox.confirm(
    `确定要删除等级ID为${row.cgId}的会员等级吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/customerGrade/delete", { 
        gradeId: row.cgId 
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

// 表格选择和批量删除
const handleSelectionChange = (val: CustomerGrade[]) => { selectedRows.value = val; };

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的会员等级');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的会员等级吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      const gradeIds = selectedRows.value.map(row => row.cgId.toString());
      const res = await axios.post<ApiResponse>("http://localhost:8080/customerGrade/batchDelete", { gradeIds });
      if (res.data.code === 0) {
        ElMessage.success(`成功删除${selectedRows.value.length}个会员等级`);
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
.customer-grades-container {
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
  .customer-grades-container {
    padding: 16px;
  }
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>