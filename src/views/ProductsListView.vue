<template>
  <div class="users-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入商品名称/ID"
          :prefix-icon="Search"
          size="default"
          style="width: 250px;"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="状态" size="default" style="margin-left: 10px; width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="上架" value="on_sale"></el-option>
          <el-option label="下架" value="off_sale"></el-option>
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

    <!-- 商品数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="productId"
            height="calc(100vh - 280px)"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column label="商品图片" width="100">
              <template #default="scope">
                <el-image
                  style="width: 60px; height: 60px; border-radius: 4px;"
                  :src="scope.row.imageUrl || '/src/assets/images/default_product.png'"
                  fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品名称" min-width="180" />
            <el-table-column prop="categoryId" label="分类" width="120">
              <template #default="scope">
                {{ getCategoryName(scope.row.categoryId) }}
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="100" />
            <el-table-column prop="stockQuantity" label="库存" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
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
          label="商品ID"
          :label-width="state.formLabelWidth"
          prop="productId"
          v-if="state.isEdit"
        >
          <el-input v-model="state.form.productId" autocomplete="off" readonly />
        </el-form-item>
        <el-form-item label="商品名称" :label-width="state.formLabelWidth" prop="productName">
          <el-input v-model="state.form.productName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="分类" :label-width="state.formLabelWidth" prop="categoryId">
          <el-select v-model="state.form.categoryId" placeholder="请选择商品分类" style="width: 100%;">
            <el-option
              v-for="category in categoryOptions"
              :key="category.categoryId"
              :label="category.categoryName"
              :value="category.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" :label-width="state.formLabelWidth" prop="price">
          <el-input-number v-model="state.form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存" :label-width="state.formLabelWidth" prop="stockQuantity">
          <el-input-number v-model="state.form.stockQuantity" :min="0" />
        </el-form-item>
        <el-form-item label="状态" :label-width="state.formLabelWidth" prop="status">
          <el-select v-model="state.form.status" placeholder="请选择状态">
            <el-option label="上架" value="on_sale"></el-option>
            <el-option label="下架" value="off_sale"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" :label-width="state.formLabelWidth" prop="createTime">
          <el-date-picker
            v-model="state.form.createTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择日期时间"
            style="width: 100%"
            :disabled="state.isEdit"
          />
        </el-form-item>
        <el-form-item label="商品图片URL" :label-width="state.formLabelWidth" prop="imageUrl">
          <el-input v-model="state.form.imageUrl" autocomplete="off" />
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

// --- 类型定义 ---
interface ProductCategory {
  categoryId: string;
  categoryName: string;
}

interface Product {
  productId: string;
  productName: string;
  categoryId: string;
  price: number;
  stockQuantity: number;
  status: string;
  createTime: string;
  imageUrl?: string;
}

interface ProductForm extends Omit<Product, 'stock'> {
  stockQuantity: number;
}

interface PageResponse<T> {
  code: number;
  msg?: string;
  data: T[];
  count: number;
}

interface ApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

// --- 响应式状态 ---
const ruleFormRef = ref<FormInstance>();
const tableLoading = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const selectedRows = ref<Product[]>([]);
const categoryOptions = ref<ProductCategory[]>([]);

const state = reactive({
  dialogFormVisible: false,
  dialogTitle: "修改商品信息",
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as Product[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {} as ProductForm,
});

// --- 表单校验规则 ---
const rules = reactive({
  productName: [{ required: true, message: "商品名称不能为空", trigger: "blur" }],
  categoryId: [{ required: true, message: "分类不能为空", trigger: "change" }],
  price: [{ required: true, message: "价格不能为空", trigger: "blur" }],
  stockQuantity: [{ required: true, message: "库存不能为空", trigger: "blur" }],
  status: [{ required: true, message: "状态不能为空", trigger: "blur" }],
  createTime: [{ required: true, message: "创建时间不能为空", trigger: "change" }],
});

// --- 计算属性 ---
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.productName.includes(searchQuery.value) ||
                       item.productId.includes(searchQuery.value);
    const statusMatch = !statusFilter.value || item.status === statusFilter.value;
    return searchMatch && statusMatch;
  });
});

// --- 方法 ---
const getCategoryName = (categoryId: string) => {
  const category = categoryOptions.value.find(c => c.categoryId === categoryId);
  return category ? category.categoryName : '未知分类';
};

const getStatusType = (status: string) => {
  return status === "on_sale" ? "success" : "danger";
};

const getStatusText = (status: string) => {
  return status === "on_sale" ? "上架" : "下架";
};

// --- API 调用 ---
const loadCategories = async () => {
  try {
    const res = await axios.get<PageResponse<ProductCategory>>("http://localhost:8080/productCategories/list");
    if (res.data.code === 0) {
      categoryOptions.value = res.data.data;
    } else {
      ElMessage.error("加载分类失败");
    }
  } catch (error) {
    ElMessage.error("加载分类请求失败");
  }
};

const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse<Product>>("http://localhost:8080/product/page", {
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

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit ? "/product/update" : "/product/add";
  try {
    const res = await axios.post<ApiResponse>(`http://localhost:8080${url}`, state.form);
    if (res.data.code === 0) {
      ElMessage.success(state.isEdit ? "修改成功" : "新增成功");
      state.dialogFormVisible = false;
      getData();
    } else {
      ElMessage.error(res.data.msg || "操作失败");
    }
  } catch (error) {
    ElMessage.error("提交失败，请稍后重试");
  }
};

// --- 事件处理 ---
const refreshData = (page: number) => { state.pageNum = page; getData(); };
const handleSizeChange = (size: number) => { state.pageSize = size; getData(); };

const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = "新增商品";
  state.form = {
    productId: "",
    productName: "",
    categoryId: "",
    price: 0,
    stockQuantity: 0,
    status: "on_sale",
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    imageUrl: "",
  };
  state.dialogFormVisible = true;
  ruleFormRef.value?.resetFields();
};

const handleEdit = (row: Product) => {
  state.isEdit = true;
  state.dialogTitle = "修改商品信息";
  state.form = { ...row };
  state.dialogFormVisible = true;
};

const handleDelete = (row: Product) => {
  ElMessageBox.confirm(`确定要删除商品 ${row.productName} 吗?`, "警告", {
    type: "warning",
  }).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/product/delete", { productId: row.productId });
      if (res.data.code === 0) {
        ElMessage.success("删除成功");
        getData();
      } else {
        ElMessage.error(res.data.msg || "删除失败");
      }
    } catch (error) {
      ElMessage.error("删除请求失败");
    }
  }).catch(() => ElMessage.info("操作已取消"));
};

const handleSelectionChange = (val: Product[]) => { selectedRows.value = val; };

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return;
  ElMessageBox.confirm(`确定要删除${selectedRows.value.length}个选中的商品吗？`, "警告", {
    type: "warning",
  }).then(async () => {
    try {
      const productIds = selectedRows.value.map(row => row.productId);
      const res = await axios.post<ApiResponse>("http://localhost:8080/product/batchDelete", productIds);
      if (res.data.code === 0) {
        ElMessage.success("批量删除成功");
        getData();
      } else {
        ElMessage.error(res.data.msg || "批量删除失败");
      }
    } catch (error) {
      ElMessage.error("批量删除请求失败");
    }
  }).catch(() => ElMessage.info("操作已取消"));
};

// --- 生命周期钩子 ---
onMounted(() => {
  getData();
  loadCategories();
});
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
