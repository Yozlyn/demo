<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
    <el-table-column prop="productId" label="商品ID" width="120" />
    <el-table-column prop="productName" label="商品名称" width="180" />
    <el-table-column prop="category" label="分类" width="120" />
    <el-table-column prop="price" label="价格" width="100" />
    <el-table-column prop="stock" label="库存" width="100" />
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
      <el-form-item label="分类" :label-width="state.formLabelWidth" prop="category">
        <el-input v-model="state.form.category" autocomplete="off" />
      </el-form-item>
      <el-form-item label="价格" :label-width="state.formLabelWidth" prop="price">
        <el-input-number v-model="state.form.price" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item label="库存" :label-width="state.formLabelWidth" prop="stock">
        <el-input-number v-model="state.form.stock" :min="0" />
      </el-form-item>
      <el-form-item label="状态" :label-width="state.formLabelWidth" prop="status">
        <el-select v-model="state.form.status" placeholder="请选择状态">
          <el-option label="上架" value="on_sale"></el-option>
          <el-option label="下架" value="off_sale"></el-option>
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

// 定义商品数据类型接口
interface Product {
  productId: string;
  productName: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

// 定义表单数据类型
interface ProductForm extends Product {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: Product[];
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
  dialogTitle: '修改商品信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as Product[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    productId: "",
    productName: "",
    category: "",
    price: 0,
    stock: 0,
    status: "",
  } as ProductForm,
});

// 表单校验规则
const rules = reactive({
  productName: [
    { required: true, message: '商品名称不能为空', trigger: 'blur' },
  ],
  category: [
    { required: true, message: '分类不能为空', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '价格不能为空', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '库存不能为空', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '状态不能为空', trigger: 'blur' },
  ],
})

// 获取商品数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/product/page", {
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

// 新增商品
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增商品';
  state.dialogFormVisible = true;
  state.form = {
    productId: "",
    productName: "",
    category: "",
    price: 0,
    stock: 0,
    status: "",
  };
  ruleFormRef.value?.resetFields();
};

// 编辑商品
const handleEdit = (row: Product) => {
  state.isEdit = true;
  state.dialogTitle = '修改商品信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/product/update" 
    : "http://localhost:8080/product/add";
  
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

// 删除商品
const handleDelete = (row: Product) => {
  ElMessageBox.confirm(
    `确定要删除商品ID为${row.productId}的商品吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/product/delete", { 
        productId: row.productId 
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
    case 'on_sale': return 'success';
    case 'off_sale': return 'info';
    default: return 'info';
  }
};

// 状态文本映射
const getStatusText = (status: string) => {
  switch (status) {
    case 'on_sale': return '上架';
    case 'off_sale': return '下架';
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

