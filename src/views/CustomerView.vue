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
            <el-table-column prop="customerId" label="ID" width="60" />
            <el-table-column prop="customerName" label="客户名称" min-width="120" />
            <el-table-column prop="customerPhone" label="联系方式" width="150" />
            <el-table-column prop="customerEmail" label="邮箱" min-width="180" />
            <el-table-column prop="customerLevel" label="客户等级" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="registrationDate" label="注册时间" width="180" />
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
    <el-dialog v-model="state.dialogFormVisible" :title="state.dialogTitle" width="600px">
      <el-form :model="state.form" ref="ruleFormRef" :rules="rules" label-width="100px">
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="state.form.customerName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="联系方式" prop="customerPhone">
          <el-input v-model="state.form.customerPhone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="customerEmail">
          <el-input v-model="state.form.customerEmail" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password" :required="!state.isEdit">
          <el-input v-model="state.form.password" type="password" show-password :placeholder="state.isEdit ? '留空则不修改' : '请输入密码'" autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!state.isEdit || state.form.password">
          <el-input v-model="state.form.confirmPassword" type="password" show-password placeholder="请再次输入密码" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" prop="customerGender">
           <el-select v-model="state.form.customerGender" placeholder="请选择性别">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
            <el-option label="未知" value="未知"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="customerBirthday">
          <el-date-picker v-model="state.form.customerBirthday" type="date" placeholder="选择生日" style="width: 100%;" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="地址" prop="customerAddress">
          <el-input v-model="state.form.customerAddress" autocomplete="off" />
        </el-form-item>
        <el-form-item label="客户等级" prop="customerLevel">
           <el-select v-model="state.form.customerLevel" placeholder="请选择等级">
            <el-option label="普通" value="普通"></el-option>
            <el-option label="白银" value="白银"></el-option>
            <el-option label="黄金" value="黄金"></el-option>
            <el-option label="铂金" value="铂金"></el-option>
            <el-option label="钻石" value="钻石"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
           <el-select v-model="state.form.status" placeholder="请选择状态">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="冻结" value="冻结"></el-option>
            <el-option label="注销" value="注销"></el-option>
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
import type { FormInstance, FormRules } from "element-plus";

// 定义客户数据类型接口
interface Customer {
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  password?: string;
  customerGender: string;
  customerBirthday: string;
  customerAddress: string;
  customerLevel: string;
  registrationDate: string;
  lastLoginTime: string;
  totalOrders: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 定义表单数据类型, 增加确认密码字段
interface CustomerForm extends Customer {
  confirmPassword?: string;
}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: Customer[];
  count: number;
}

interface ApiResponse {
  code: number;
  msg?: string;
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
  tableData: [] as Customer[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {} as CustomerForm,
});

// 自定义密码校验规则
const validatePass = (rule: any, value: any, callback: any) => {
  if (state.form.password && value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== state.form.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 表单校验规则
const rules = reactive<FormRules>({
  customerName: [{ required: true, message: "客户名称不能为空", trigger: "blur" }],
  customerPhone: [{ required: true, message: "联系方式不能为空", trigger: "blur" }],
  password: [{ required: !state.isEdit, message: "密码不能为空", trigger: "blur" }],
  confirmPassword: [{ validator: validatePass, trigger: 'blur' }],
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    return item.customerName.includes(searchQuery.value) || 
           item.customerPhone.includes(searchQuery.value) ||
           (item.customerEmail && item.customerEmail.includes(searchQuery.value));
  });
});

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  if (status === '正常') return 'success';
  if (status === '冻结') return 'warning';
  if (status === '注销') return 'danger';
  return 'info';
};

// 获取客户数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/customer/pageCustomers", {
    params: { pageNum: state.pageNum, pageSize: state.pageSize },
  }).then(res => {
    state.tableData = res.data.data;
    state.total = res.data.count;
  }).catch(err => {
    ElMessage.error("获取数据失败：" + err.message);
  }).finally(() => {
    tableLoading.value = false;
  });
};

// 分页
const refreshData = (page: number) => { state.pageNum = page; getData(); };
const handleSizeChange = (size: number) => { state.pageSize = size; getData(); };

// 新增客户
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = "新增客户";
  state.form = {
    password: '',
    confirmPassword: '',
    customerLevel: '普通',
    status: '正常',
  } as CustomerForm;
  state.dialogFormVisible = true;
  ruleFormRef.value?.resetFields();
};

// 编辑客户
const handleEdit = (row: Customer) => {
  state.isEdit = true;
  state.dialogTitle = "修改客户信息";
  state.form = { ...row, password: '', confirmPassword: '' }; // 清空密码字段以便选择性修改
  state.dialogFormVisible = true;
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  
  const url = state.isEdit ? "/customer/update" : "/customer/add";
  
  // 准备提交的数据，移除确认密码字段
  const payload = { ...state.form };
  delete payload.confirmPassword;

  axios.post<ApiResponse>(`http://localhost:8080${url}`, payload)
    .then(res => {
      if (res.data.code === 0) {
        ElMessage.success(state.isEdit ? "修改成功" : "新增成功");
        state.dialogFormVisible = false;
        getData();
      } else {
        ElMessage.error(res.data.msg || "操作失败");
      }
    }).catch(error => {
      ElMessage.error("提交失败，请稍后重试");
    });
};

// 删除客户
const handleDelete = (row: Customer) => {
  ElMessageBox.confirm(`确定要删除客户 ${row.customerName} 吗？`, "警告", {
    type: "warning",
  }).then(() => {
    axios.post<ApiResponse>("http://localhost:8080/customer/delete", { customerId: row.customerId })
      .then(res => {
        if (res.data.code === 0) {
          ElMessage.success("删除成功");
          getData();
        } else {
          ElMessage.error(res.data.msg || "删除失败");
        }
      }).catch(() => ElMessage.error("删除请求失败"));
  }).catch(() => ElMessage.info("操作已取消"));
};

// 批量删除
const handleSelectionChange = (val: Customer[]) => { selectedRows.value = val; };

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return;
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的客户吗？`, "警告", {
    type: "warning",
  }).then(() => {
    const customerIds = selectedRows.value.map(row => row.customerId);
    axios.post<ApiResponse>("http://localhost:8080/customer/batchDelete", customerIds)
      .then(res => {
        if (res.data.code === 0) {
          ElMessage.success("批量删除成功");
          getData();
        } else {
          ElMessage.error(res.data.msg || "批量删除失败");
        }
      }).catch(() => ElMessage.error("批量删除请求失败"));
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

.el-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
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

.custom-delete-button {
  background-color: #fde2e2;
  border-color: #fab6b6;
  color: #f56c6c;
}

.custom-delete-button:hover {
  background-color: #f8c7c7;
  border-color: #f89898;
}
</style>
