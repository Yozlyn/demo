<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>客户管理</el-breadcrumb-item>
      <el-breadcrumb-item>会员等级</el-breadcrumb-item>
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
    <el-table-column prop="gradeId" label="等级ID" width="120" />
    <el-table-column prop="gradeName" label="等级名称" width="150" />
    <el-table-column prop="minPoints" label="最低积分" width="120" />
    <el-table-column prop="maxPoints" label="最高积分" width="120" />
    <el-table-column prop="discountRate" label="折扣率" width="100">
      <template #default="scope">
        {{ scope.row.discountRate * 100 }}%
      </template>
    </el-table-column>
    <el-table-column prop="description" label="描述" min-width="200" />
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
        label="等级ID" 
        :label-width="state.formLabelWidth" 
        prop="gradeId"
        v-if="state.isEdit"
      >
        <el-input v-model="state.form.gradeId" autocomplete="off" readonly />
      </el-form-item>
      <el-form-item label="等级名称" :label-width="state.formLabelWidth" prop="gradeName">
        <el-input v-model="state.form.gradeName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="最低积分" :label-width="state.formLabelWidth" prop="minPoints">
        <el-input-number v-model="state.form.minPoints" :min="0" />
      </el-form-item>
      <el-form-item label="最高积分" :label-width="state.formLabelWidth" prop="maxPoints">
        <el-input-number v-model="state.form.maxPoints" :min="0" />
      </el-form-item>
      <el-form-item label="折扣率" :label-width="state.formLabelWidth" prop="discountRate">
        <el-input-number v-model="state.form.discountRate" :min="0" :max="1" :step="0.01" />
      </el-form-item>
      <el-form-item label="描述" :label-width="state.formLabelWidth" prop="description">
        <el-input type="textarea" v-model="state.form.description" autocomplete="off" />
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

// 定义会员等级数据类型接口
interface CustomerGrade {
  gradeId: string;
  gradeName: string;
  minPoints: number;
  maxPoints: number;
  discountRate: number;
  description: string;
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

const ruleFormRef = ref<FormInstance>()

// 页面状态管理
const state = reactive({
  dialogFormVisible: false,
  dialogTitle: '修改会员等级信息',
  isEdit: true,
  formLabelWidth: "140px",
  tableData: [] as CustomerGrade[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  form: {
    gradeId: "",
    gradeName: "",
    minPoints: 0,
    maxPoints: 0,
    discountRate: 0,
    description: "",
  } as CustomerGradeForm,
});

// 表单校验规则
const rules = reactive({
  gradeName: [
    { required: true, message: '等级名称不能为空', trigger: 'blur' },
  ],
  minPoints: [
    { required: true, message: '最低积分不能为空', trigger: 'blur' },
  ],
  maxPoints: [
    { required: true, message: '最高积分不能为空', trigger: 'blur' },
  ],
  discountRate: [
    { required: true, message: '折扣率不能为空', trigger: 'blur' },
  ],
})

// 获取会员等级数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/customerGrade/page", {
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

// 新增会员等级
const handleAdd = () => {
  state.isEdit = false;
  state.dialogTitle = '新增会员等级';
  state.dialogFormVisible = true;
  state.form = {
    gradeId: "",
    gradeName: "",
    minPoints: 0,
    maxPoints: 0,
    discountRate: 0,
    description: "",
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
    `确定要删除等级ID为${row.gradeId}的会员等级吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await axios.post<ApiResponse>("http://localhost:8080/customerGrade/delete", { 
        gradeId: row.gradeId 
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

