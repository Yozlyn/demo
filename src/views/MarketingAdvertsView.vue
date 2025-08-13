<template>
  <div class="users-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入广告名称/ID"  
          :prefix-icon="Search"
          size="default"
          style="width: 250px;"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="状态" size="default" style="margin-left: 10px; width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="启用" value="active"></el-option>
          <el-option label="禁用" value="inactive"></el-option>
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

    <!-- 广告数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="advertId"
            height="calc(100vh - 280px)" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column prop="advertName" label="广告名称" min-width="150" />
            <el-table-column prop="advertType" label="广告类型" width="120" />
            <el-table-column prop="imageUrl" label="图片" width="120">
              <template #default="scope">
                <el-image 
                  style="width: 80px; height: 80px; border-radius: 4px;"
                  :src="scope.row.imageUrl"
                  fit="cover"
                  :preview-src-list="[scope.row.imageUrl]"
                  preview-teleported
                />
              </template>
            </el-table-column>
            <el-table-column prop="linkUrl" label="链接URL" min-width="200" />
            <el-table-column prop="startDate" label="开始日期" width="150" />
            <el-table-column prop="endDate" label="结束日期" width="150" />
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
          label="广告ID" 
          :label-width="state.formLabelWidth" 
          prop="advertId"
          v-if="state.isEdit"
        >
          <el-input v-model="state.form.advertId" autocomplete="off" readonly />
        </el-form-item>
        <el-form-item label="广告名称" :label-width="state.formLabelWidth" prop="advertName">
          <el-input v-model="state.form.advertName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="广告类型" :label-width="state.formLabelWidth" prop="advertType">
          <el-input v-model="state.form.advertType" autocomplete="off" />
        </el-form-item>
        <el-form-item label="图片URL" :label-width="state.formLabelWidth" prop="imageUrl">
          <el-input v-model="state.form.imageUrl" autocomplete="off" />
        </el-form-item>
        <el-form-item label="链接URL" :label-width="state.formLabelWidth" prop="linkUrl">
          <el-input v-model="state.form.linkUrl" autocomplete="off" />
        </el-form-item>
        <el-form-item label="开始日期" :label-width="state.formLabelWidth" prop="startDate">
          <el-date-picker
            v-model="state.form.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" :label-width="state.formLabelWidth" prop="endDate">
          <el-date-picker
            v-model="state.form.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" :label-width="state.formLabelWidth" prop="status">
          <el-select v-model="state.form.status" placeholder="请选择状态">
            <el-option label="启用" value="active"></el-option>
            <el-option label="禁用" value="inactive"></el-option>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from "axios";
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

// 定义广告数据类型接口
interface MarketingAdvert {
  advertId: string;
  advertName: string;
  advertType: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  status: string;
}

// 定义表单数据类型
interface MarketingAdvertForm extends MarketingAdvert {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: MarketingAdvert[];
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
const searchQuery = ref('');
const statusFilter = ref('');
const selectedRows = ref<MarketingAdvert[]>([]);

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改广告信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as MarketingAdvert[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    advertId: "",
    advertName: "",
    advertType: "",
    imageUrl: "",
    linkUrl: "",
    startDate: "",
    endDate: "",
    status: "",
  } as MarketingAdvertForm,
});

// 表单校验规则
const rules = reactive({
  advertName: [
    { required: true, message: '广告名称不能为空', trigger: 'blur' },
  ],
  advertType: [
    { required: true, message: '广告类型不能为空', trigger: 'blur' },
  ],
  imageUrl: [
    { required: true, message: '图片URL不能为空', trigger: 'blur' },
  ],
  linkUrl: [
    { required: true, message: '链接URL不能为空', trigger: 'blur' },
  ],
  startDate: [
    { required: true, message: '开始日期不能为空', trigger: 'blur' },
  ],
  endDate: [
    { required: true, message: '结束日期不能为空', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '状态不能为空', trigger: 'blur' },
  ],
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.advertName.includes(searchQuery.value) || 
                       item.advertId.includes(searchQuery.value);
    const statusMatch = !statusFilter.value || item.status === statusFilter.value;
    return searchMatch && statusMatch;
  });
});

// 状态类型映射
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'info';
    default: return 'info';
  }
};

// 状态文本映射
const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '启用';
    case 'inactive': return '禁用';
    default: return status;
  }
};

// 获取广告数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/marketingAdvert/page", {
    params: {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
    },
  }).then(res => {
    state.tableData = res.data.data;
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

// 新增/编辑广告
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增广告';
  state.dialogFormVisible = true;
  state.form = {
    advertId: "",
    advertName: "",
    advertType: "",
    imageUrl: "",
    linkUrl: "",
    startDate: "",
    endDate: "",
    status: "",
  };
  ruleFormRef.value?.resetFields();
};

const handleEdit = (row: MarketingAdvert) => {
  state.isEdit = true;
  state.dialogTitle = '修改广告信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/marketingAdvert/update" 
    : "http://localhost:8080/marketingAdvert/add";
  
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

// 删除广告
const handleDelete = (row: MarketingAdvert) => {
  ElMessageBox.confirm(
    `确定要删除广告ID为${row.advertId}的广告吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/marketingAdvert/delete", { 
        advertId: row.advertId 
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
const handleSelectionChange = (val: MarketingAdvert[]) => { selectedRows.value = val; };

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的广告');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的广告吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      const advertIds = selectedRows.value.map(row => row.advertId);
      const res = await axios.post<ApiResponse>("http://localhost:8080/marketingAdvert/batchDelete", { advertIds });
      if (res.data.code === 0) {
        ElMessage.success(`成功删除${selectedRows.value.length}个广告`);
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

