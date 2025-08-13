<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品评价</el-breadcrumb-item>
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
    <el-table-column prop="reviewId" label="评价ID" width="120" />
    <el-table-column prop="productId" label="商品ID" width="120" />
    <el-table-column prop="customerId" label="客户ID" width="120" />
    <el-table-column prop="rating" label="评分" width="100" />
    <el-table-column prop="comment" label="评论内容" min-width="200" />
    <el-table-column prop="reviewDate" label="评价日期" width="150" />
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
        label="评价ID" 
        :label-width="state.formLabelWidth" 
        prop="reviewId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.reviewId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="商品ID" :label-width="state.formLabelWidth" prop="productId">
        <el-input v-model="state.form.productId" autocomplete="off" />
      </el-form-item>
      <el-form-item label="客户ID" :label-width="state.formLabelWidth" prop="customerId">
        <el-input v-model="state.form.customerId" autocomplete="off" />
      </el-form-item>
      <el-form-item label="评分" :label-width="state.formLabelWidth" prop="rating">
        <el-input-number v-model="state.form.rating" :min="1" :max="5" />
      </el-form-item>
      <el-form-item label="评论内容" :label-width="state.formLabelWidth" prop="comment">
        <el-input type="textarea" v-model="state.form.comment" autocomplete="off" />
      </el-form-item>
      <el-form-item label="评价日期" :label-width="state.formLabelWidth" prop="reviewDate">
        <el-date-picker
          v-model="state.form.reviewDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
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

// 定义商品评价数据类型接口
interface ProductReview {
  reviewId: string;
  productId: string;
  customerId: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

// 定义表单数据类型
interface ProductReviewForm extends ProductReview {}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: ProductReview[];
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
  dialogTitle: '修改商品评价信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as ProductReview[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    reviewId: "",
    productId: "",
    customerId: "",
    rating: 0,
    comment: "",
    reviewDate: "",
  } as ProductReviewForm,
});

// 表单校验规则
const rules = reactive({
  productId: [
    { required: true, message: '商品ID不能为空', trigger: 'blur' },
  ],
  customerId: [
    { required: true, message: '客户ID不能为空', trigger: 'blur' },
  ],
  rating: [
    { required: true, message: '评分不能为空', trigger: 'blur' },
  ],
  comment: [
    { required: true, message: '评论内容不能为空', trigger: 'blur' },
  ],
  reviewDate: [
    { required: true, message: '评价日期不能为空', trigger: 'change' },
  ],
})

// 获取商品评价数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/productReview/page", {
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

// 新增商品评价
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增商品评价';
  state.dialogFormVisible = true;
  state.form = {
    reviewId: "",
    productId: "",
    customerId: "",
    rating: 0,
    comment: "",
    reviewDate: "",
  };
  ruleFormRef.value?.resetFields();
};

// 编辑商品评价
const handleEdit = (row: ProductReview) => {
  state.isEdit = true;
  state.dialogTitle = '修改商品评价信息';
  state.dialogFormVisible = true;
  state.form = { ...row };
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  const url = state.isEdit 
    ? "http://localhost:8080/productReview/update" 
    : "http://localhost:8080/productReview/add";
  
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

// 删除商品评价
const handleDelete = (row: ProductReview) => {
  ElMessageBox.confirm(
    `确定要删除评价ID为${row.reviewId}的商品评价吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/productReview/delete", { 
        reviewId: row.reviewId 
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

