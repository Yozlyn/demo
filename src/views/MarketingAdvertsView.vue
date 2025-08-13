<template>
  <!-- 面包屑导航与新增按钮在同一行 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <<el-breadcrumb :separator="' > '" style="display: flex; align-items: center;">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>营销中心</el-breadcrumb-item>
      <el-breadcrumb-item>广告管理</el-breadcrumb-item>
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
    <el-table-column prop="advertId" label="广告ID" width="120" />
    <el-table-column prop="advertName" label="广告名称" width="150" />
    <el-table-column prop="advertType" label="广告类型" width="120" />
    <el-table-column prop="imageUrl" label="图片URL" min-width="200">
      <template #default="scope">
        <el-image style="width: 100px; height: 100px" :src="scope.row.imageUrl" fit="cover" />
      </template>
    </el-table-column>
    <el-table-column prop="linkUrl" label="链接URL" min-width="200" />
    <el-table-column prop="startDate" label="开始日期" width="150" />
    <el-table-column prop="endDate" label="结束日期" width="150" />
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

const ruleFormRef = ref<FormInstance>()

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
})

// 获取广告数据
const getData = () => {
  axios.get<PageResponse>("http://localhost:8080/marketingAdvert/page", {
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

// 新增广告
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

// 编辑广告
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

