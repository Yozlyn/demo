<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品库存</el-breadcrumb-item>
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
    <el-table-column prop="inventoryId" label="库存ID" width="120" />
    <el-table-column prop="productId" label="商品ID" width="120" />
    <el-table-column prop="productName" label="商品名称" width="180" />
    <el-table-column prop="warehouseLocation" label="仓库位置" width="150" />
    <el-table-column prop="quantity" label="数量" width="100" />
    <el-table-column prop="lastUpdated" label="最后更新时间" width="180" />
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
        label="库存ID" 
        :label-width="state.formLabelWidth" 
        prop="inventoryId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.inventoryId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="商品ID" :label-width="state.formLabelWidth" prop="productId">
        <el-input v-model="state.form.productId" autocomplete="off" />
      </el-form-item>
      <el-form-item label="商品名称" :label-width="state.formLabelWidth" prop="productName">
        <el-input v-model="state.form.productName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="仓库位置" :label-width="state.formLabelWidth" prop="warehouseLocation">
        <el-input v-model="state.form.warehouseLocation" autocomplete="off" />
      </el-form-item>
      <el-form-item label="数量" :label-width="state.formLabelWidth" prop="quantity">
        <el-input-number v-model="state.form.quantity" :min="0" />
      </el-form-item>
      <el-form-item label="最后更新时间" :label-width="state.formLabelWidth" prop="lastUpdated">
        <el-date-picker
          v-model="state.form.lastUpdated"
          type="datetime"
          placeholder="选择日期时间"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
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

// 定义商品库存数据类型接口
interface ProductInventory {
  inventoryId: string;
  productId: string;
  productName: string;
  warehouseLocation: string;
  quantity: number;
  lastUpdated: string;
}

// 定义表单数据类型
interface ProductInventoryForm extends ProductInventory {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: ProductInventory[];
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
  dialogTitle: '修改商品库存信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as ProductInventory[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    inventoryId: "",
    productId: "",
    productName: "",
    warehouseLocation: "",
    quantity: 0,
    lastUpdated: "",
  } as ProductInventoryForm,
});

// 表单校验规则
const rules = reactive({
  productId: [
    { required: true, message: '商品ID不能为空', trigger: 'blur' },
  ],
  productName: [
    { required: true, message: '商品名称不能为空', trigger: 'blur' },
  ],
  warehouseLocation: [
    { required: true, message: '仓库位置不能为空', trigger: 'blur' },
  ],
  quantity: [
    { required: true, message: '数量不能为空', trigger: 'blur' },
  ],
  lastUpdated: [
    { required: true, message: '最后更新时间不能为空', trigger: 'change' },
  ],
})

// 获取商品库存数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/productInventory/page", {
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

// 新增商品库存
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增商品库存';
  state.dialogFormVisible = true;
  state.form = {
    inventoryId: "",
    productId: "",
    productName: "",
    warehouseLocation: "",
    quantity: 0,
    lastUpdated: "",
  };
  ruleFormRef.value?.resetFields();
};

// 编辑商品库存
const handleEdit = (row: ProductInventory) => {
  state.isEdit = true;
  state.dialogTitle = '修改商品库存信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/productInventory/update" 
    : "http://localhost:8080/productInventory/add";
  
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

// 删除商品库存
const handleDelete = (row: ProductInventory) => {
  ElMessageBox.confirm(
    `确定要删除库存ID为${row.inventoryId}的商品库存吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/productInventory/delete", { 
        inventoryId: row.inventoryId 
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

