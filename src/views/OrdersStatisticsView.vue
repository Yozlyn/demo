<template>
  <div class="users-container">
    <!-- 顶部筛选和操作 -->
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="请输入订单号/客户名称"  
          :prefix-icon="Search"
          size="default"
          style="width: 250px;"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="状态" size="default" style="margin-left: 10px; width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="待处理" value="pending"></el-option>
          <el-option label="已确认" value="confirmed"></el-option>
          <el-option label="已发货" value="shipped"></el-option>
          <el-option label="已送达" value="delivered"></el-option>
          <el-option label="已取消" value="cancelled"></el-option>
        </el-select>
      </div>
      <div>
        <el-button 
          class="custom-primary-button" 
          :icon="Download" 
          @click="exportData"
        >
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 订单数据表格 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <el-table 
            :data="filteredTableData"
            style="width: 100%"
            v-loading="tableLoading"
            border
            stripe
            row-key="orderNo"
            height="calc(100vh - 280px)" 
          >
            <el-table-column type="index" label="编号" width="60" />
            <el-table-column prop="orderNo" label="订单号" min-width="150" />
            <el-table-column prop="customerName" label="客户名称" width="120" />
            <el-table-column prop="productName" label="商品名称" min-width="200" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="totalAmount" label="总金额" width="120">
              <template #default="scope">
                ¥{{ scope.row.totalAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderDate" label="订单日期" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="140">
              <template #default="scope">
                <el-tooltip content="查看详情" placement="top">
                  <el-button 
                    :icon="Search" 
                    size="default"
                    class="custom-edit-button"
                    @click="viewDetail(scope.row)"
                    style="margin-right: 8px;"
                  />
                </el-tooltip>
                <el-tooltip content="编辑" placement="top">
                  <el-button 
                    :icon="Edit" 
                    size="default"
                    class="custom-edit-button"
                    @click="editOrder(scope.row)"
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

    <!-- 订单分析弹窗 -->
    <el-dialog v-model="analysisDialogVisible" title="订单分析详情" width="80%" top="5vh">
      <div class="analysis-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="analysis-chart">
              <h4>订单趋势</h4>
              <canvas ref="analysisChart" width="100%" height="200"></canvas>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="analysis-stats">
              <h4>统计数据</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-label">总订单金额</div>
                  <div class="stat-value">¥{{ analysisData.totalAmount.toLocaleString() }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">订单数量</div>
                  <div class="stat-value">{{ analysisData.orderCount }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">平均订单金额</div>
                  <div class="stat-value">¥{{ analysisData.avgOrderAmount.toFixed(2) }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">客户数量</div>
                  <div class="stat-value">{{ analysisData.customerCount }}</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref, computed, nextTick } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from "axios";
import { Plus, Edit, Delete, Search, Download } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

// 定义订单数据类型接口
interface OrderStatistic {
  orderNo: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  orderDate: string;
  status: string;
}

// 定义分页响应数据类型
interface PageResponse {
  code: number;
  msg?: string;
  data: OrderStatistic[];
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

// 页面状态管理
const state = reactive({
  tableData: [] as OrderStatistic[],
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 分析弹窗
const analysisDialogVisible = ref(false);
const analysisChart = ref();
const analysisData = reactive({
  totalAmount: 0,
  orderCount: 0,
  avgOrderAmount: 0,
  customerCount: 0
});

// 过滤数据
const filteredTableData = computed(() => {
  return state.tableData.filter(item => {
    const searchMatch = item.orderNo.includes(searchQuery.value) || 
                       item.customerName.includes(searchQuery.value);
    const statusMatch = !statusFilter.value || item.status === statusFilter.value;
    return searchMatch && statusMatch;
  });
});

// 状态类型映射
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'primary';
    case 'shipped': return 'info';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'info';
  }
};

// 状态文本映射
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待处理';
    case 'confirmed': return '已确认';
    case 'shipped': return '已发货';
    case 'delivered': return '已送达';
    case 'cancelled': return '已取消';
    default: return status;
  }
};

// 获取订单统计数据
const getData = () => {
  tableLoading.value = true;
  axios.get<PageResponse>("http://localhost:8080/orderStatistic/page", {
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

// 查看详情
const viewDetail = (row: OrderStatistic) => {
  analysisDialogVisible.value = true;
  // 模拟获取分析数据
  analysisData.totalAmount = row.totalAmount;
  analysisData.orderCount = row.quantity;
  analysisData.avgOrderAmount = row.totalAmount / row.quantity;
  analysisData.customerCount = 1; // 假设单个订单只涉及一个客户
  nextTick(() => {
    drawAnalysisChart();
  });
};

// 绘制分析图表
const drawAnalysisChart = () => {
  if (!analysisChart.value) return;
  
  const canvas = analysisChart.value;
  const ctx = canvas.getContext('2d');
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 模拟数据
  const data = [
    { date: '2025-01-01', value: 1000 },
    { date: '2025-01-02', value: 1200 },
    { date: '2025-01-03', value: 900 },
    { date: '2025-01-04', value: 1500 },
    { date: '2025-01-05', value: 1100 },
  ];
  
  // 绘制图表
  drawLineChart(ctx, data, canvas.width, canvas.height);
};

// 绘制折线图 (通用函数)
const drawLineChart = (ctx: CanvasRenderingContext2D, data: any[], width: number, height: number) => {
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // 找出最大值和最小值
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // 绘制坐标轴
  ctx.strokeStyle = '#e4e7ed';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // 绘制数据线
  ctx.strokeStyle = '#409eff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = height - padding - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // 绘制数据点
  ctx.fillStyle = '#409eff';
  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = height - padding - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
};

// 编辑订单 (占位函数)
const editOrder = (row: OrderStatistic) => {
  ElMessage.info(`编辑订单: ${row.orderNo}`);
};

// 导出数据 (占位函数)
const exportData = () => {
  ElMessage.success('数据导出功能开发中...');
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

