<template>
  <div class="users-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入收货人姓名/ID"  
          :prefix-icon="Search"
          size="default"
          style="width: 250px;"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="是否默认" size="default" style="margin-left: 10px; width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="是" :value="true"></el-option>
          <el-option label="否" :value="false"></el-option>
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

    <!-- 地址数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="addressId"
            height="calc(100vh - 280px)" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column prop="consigneeName" label="收货人" min-width="150" />
            <el-table-column prop="consigneePhone" label="收货电话" width="150" />
            <el-table-column prop="province" label="省份" width="100" />
            <el-table-column prop="city" label="城市" width="100" />
            <el-table-column prop="district" label="区/县" width="100" />
            <el-table-column prop="detailAddress" label="详细地址" min-width="200" />
            <el-table-column prop="isDefault" label="是否默认" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.isDefault ? 'success' : 'info'" size="small">
                  {{ scope.row.isDefault ? '是' : '否' }}
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
          label="地址ID" 
          :label-width="state.formLabelWidth" 
          prop="addressId"
          v-if="state.isEdit"
        >
          <el-input v-model="state.form.addressId" autocomplete="off" readonly />
        </el-form-item>
        <el-form-item label="客户ID" :label-width="state.formLabelWidth" prop="customerId">
          <el-input v-model="state.form.customerId" autocomplete="off" />
        </el-form-item>
        <el-form-item label="收货人" :label-width="state.formLabelWidth" prop="consigneeName">
          <el-input v-model="state.form.consigneeName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="收货电话" :label-width="state.formLabelWidth" prop="consigneePhone">
          <el-input v-model="state.form.consigneePhone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="省份" :label-width="state.formLabelWidth" prop="province">
          <el-input v-model="state.form.province" autocomplete="off" />
        </el-form-item>
        <el-form-item label="城市" :label-width="state.formLabelWidth" prop="city">
          <el-input v-model="state.form.city" autocomplete="off" />
        </el-form-item>
        <el-form-item label="区/县" :label-width="state.formLabelWidth" prop="district">
          <el-input v-model="state.form.district" autocomplete="off" />
        </el-form-item>
        <el-form-item label="详细地址" :label-width="state.formLabelWidth" prop="detailAddress">
          <el-input type="textarea" v-model="state.form.detailAddress" autocomplete="off" />
        </el-form-item>
        <el-form-item label="是否默认" :label-width="state.formLabelWidth" prop="isDefault">
          <el-switch v-model="state.form.isDefault" />
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

// 定义地址数据类型接口
interface CustomerAddress {
  addressId: string;
  customerId: string;
  consigneeName: string;
  consigneePhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault: boolean;
}

// 定义表单数据类型
interface CustomerAddressForm extends CustomerAddress {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: CustomerAddress[];
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
const selectedRows = ref<CustomerAddress[]>([]);

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改地址信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as CustomerAddress[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    addressId: "",
    customerId: "",
    consigneeName: "",
    consigneePhone: "",
    province: "",
    city: "",
    district: "",
    detailAddress: "",
    isDefault: false,
  } as CustomerAddressForm,
});

// 表单校验规则
const rules = reactive({
  customerId: [
    { required: true, message: '客户ID不能为空', trigger: 'blur' },
  ],
  consigneeName: [
    { required: true, message: '收货人不能为空', trigger: 'blur' },
  ],
  consigneePhone: [
    { required: true, message: '收货电话不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '省份不能为空', trigger: 'blur' },
  ],
  city: [
    { required: true, message: '城市不能为空', trigger: 'blur' },
  ],
  district: [
    { required: true, message: '区/县不能为空', trigger: 'blur' },
  ],
  detailAddress: [
    { required: true, message: '详细地址不能为空', trigger: 'blur' },
  ],
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.consigneeName.includes(searchQuery.value) || 
                       item.addressId.includes(searchQuery.value);
    const statusMatch = statusFilter.value === '' || 
                        item.isDefault === (statusFilter.value === 'true');
    return searchMatch && statusMatch;
  });
});

// 获取地址数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/customerAddress/page", {
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

// 新增/编辑地址
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增地址';
  state.dialogFormVisible = true;
  state.form = {
    addressId: "",
    customerId: "",
    consigneeName: "",
    consigneePhone: "",
    province: "",
    city: "",
    district: "",
    detailAddress: "",
    isDefault: false,
  };
  ruleFormRef.value?.resetFields();
};

const handleEdit = (row: CustomerAddress) => {
  state.isEdit = true;
  state.dialogTitle = '修改地址信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/customerAddress/update" 
    : "http://localhost:8080/customerAddress/add";
  
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

// 删除地址
const handleDelete = (row: CustomerAddress) => {
  ElMessageBox.confirm(
    `确定要删除地址ID为${row.addressId}的地址吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/customerAddress/delete", { 
        addressId: row.addressId 
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
const handleSelectionChange = (val: CustomerAddress[]) => { selectedRows.value = val; };

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的地址');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的地址吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      const addressIds = selectedRows.value.map(row => row.addressId);
      const res = await axios.post<ApiResponse>("http://localhost:8080/customerAddress/batchDelete", { addressIds });
      if (res.data.code === 0) {
        ElMessage.success(`成功删除${selectedRows.value.length}个地址`);
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

