<template>
  <div class="sales-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-header">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: 
      
    }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 订单概览卡片 -->
    <el-row :gutter="20" class="sales-overview">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in orderOverview" :key="index">
        <el-card shadow="hover" class="overview-card" :class="item.type">
          <div class="overview-content">
            <div class="overview-icon">
              <el-icon :size="32">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">{{ item.label }}</div>
              <div class="overview-value">{{ formatValue(item.value, item.format) }}</div>
              <div class="overview-trend" :class="item.trend > 0 ? 'up' : 'down'">
                <el-icon><ArrowUp v-if="item.trend > 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(item.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单图表和筛选 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 订单趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单趋势分析</span>
              <div class="chart-controls">
                <el-select v-model="chartType" size="small" @change="updateChart">
                  <el-option label="订单量" value="orders"></el-option>
                  <el-option label="销售额" value="amount"></el-option>
                </el-select>
                <el-select v-model="timePeriod" size="small" @change="updateChart" style="margin-left: 10px;">
                  <el-option label="近7天" value="7days"></el-option>
                  <el-option label="近30天" value="30days"></el-option>
                  <el-option label="近90天" value="90days"></el-option>
                  <el-option label="近一年" value="1year"></el-option>
                </el-select>
              </div>
            </div>
          </template>
          <div class="chart-container" ref="orderChartContainer">
            <canvas ref="orderChart" width="100%" height="350"></canvas>
          </div>
        </el-card>
      </el-col>

      <!-- 订单排行 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="ranking-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单排行榜</span>
              <el-select v-model="rankingType" size="small" @change="updateRanking">
                <el-option label="商品" value="product"></el-option>
                <el-option label="客户" value="customer"></el-option>
              </el-select>
            </div>
          </template>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(item, index) in rankingData" :key="index">
              <div class="ranking-number" :class="getRankingClass(index)">{{ index + 1 }}</div>
              <div class="ranking-info">
                <div class="ranking-name">{{ item.name }}</div>
                <div class="ranking-desc">{{ item.desc }}</div>
              </div>
              <div class="ranking-value">
                <div class="value">{{ formatValue(item.value, item.format) }}</div>
                <div class="percentage">{{ item.percentage }}%</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单数据表格 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单数据详情</span>
              <div class="table-controls">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索订单号、客户名称..."
                  prefix-icon="Search"
                  size="small"
                  style="width: 250px; margin-right: 10px;"
                  clearable
                />
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  style="margin-right: 10px;"
                  @change="handleDateChange"
                />
                <el-button type="primary" size="small" @click="exportData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
          </template>
          
          <el-table 
            :data="orderData" 
            style="width: 100%" 
            v-loading="tableLoading"
            border
            stripe
            height="400"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="orderNo" label="订单号" width="140" />
            <el-table-column prop="customerName" label="客户名称" width="120" />
            <el-table-column prop="productName" label="商品名称" min-width="200" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
              <template #default="scope">
                ¥{{ scope.row.totalAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderDate" label="订单日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button size="small" type="text" @click="viewDetail(scope.row)">
                  查看
                </el-button>
                <el-button size="small" type="text" @click="editOrder(scope.row)">
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
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
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowUp, ArrowDown, Download } from '@element-plus/icons-vue';
import axios from 'axios';

// 定义订单数据的接口
interface OrderData {
  orderNo: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  orderDate: string;
  status: string;
}

// 响应式数据
const orderOverview = ref([
  {
    label: '今日订单量',
    value: 89,
    trend: 8.5,
    icon: 'ShoppingCart',
    type: 'success',
    format: 'number'
  },
  {
    label: '今日销售额',
    value: 125600,
    trend: 15.2,
    icon: 'Money',
    type: 'primary',
    format: 'currency'
  },
  {
    label: '月度订单量',
    value: 2856,
    trend: 12.3,
    icon: 'TrendCharts',
    type: 'warning',
    format: 'number'
  },
  {
    label: '平均订单金额',
    value: 68.5,
    trend: 5.8,
    icon: 'DataAnalysis',
    type: 'info',
    format: 'currency'
  }
]);

// 图表相关
const chartType = ref('orders');
const timePeriod = ref('30days');
const orderChart = ref();
const orderChartContainer = ref();

// 排行榜相关
const rankingType = ref('product');
const rankingData = ref([
  { name: '智能投影仪', desc: '教学设备', value: 156000, percentage: 25.6, format: 'currency' },
  { name: '电子白板', desc: '教学设备', value: 89000, percentage: 18.2, format: 'currency' },
  { name: '学生平板', desc: '学习工具', value: 67000, percentage: 15.8, format: 'currency' },
  { name: '实验器材', desc: '实验设备', value: 45000, percentage: 12.4, format: 'currency' },
  { name: '体育器材', desc: '体育用品', value: 32000, percentage: 8.9, format: 'currency' }
]);

// 表格相关
const orderData = ref<OrderData[]>([]); // 添加类型注解
const tableLoading = ref(false);
const searchQuery = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 分析弹窗
const analysisDialogVisible = ref(false);
const analysisChart = ref();
const analysisData = reactive({
  totalAmount: 0,
  orderCount: 0,
  avgOrderAmount: 0,
  customerCount: 0
});

// 格式化数值
const formatValue = (value: number, format: string) => {
  switch (format) {
    case 'currency':
      return `¥${value.toLocaleString()}`;
    case 'percentage':
      return `${value}%`;
    case 'number':
      return value.toLocaleString();
    default:
      return value.toString();
  }
};

// 获取排行榜样式类
const getRankingClass = (index: number) => {
  if (index === 0) return 'first';
  if (index === 1) return 'second';
  if (index === 2) return 'third';
  return 'normal';
};

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'confirmed': 'primary',
    'shipped': 'info',
    'delivered': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'confirmed': '已确认',
    'shipped': '已发货',
    'delivered': '已送达',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

// 更新图表
const updateChart = () => {
  nextTick(() => {
    drawOrderChart();
  });
};

// 绘制订单图表
const drawOrderChart = () => {
  if (!orderChart.value) return;
  
  const canvas = orderChart.value;
  const ctx = canvas.getContext('2d');
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 模拟数据
  const data = generateChartData();
  
  // 绘制图表
  drawLineChart(ctx, data, canvas.width, canvas.height);
};

// 生成图表数据
const generateChartData = () => {
  const days = timePeriod.value === '7days' ? 7 : 
               timePeriod.value === '30days' ? 30 : 
               timePeriod.value === '90days' ? 90 : 365;
  
  const data = [];
  for (let i = 0; i < days; i++) {
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
      value: Math.random() * 1000 + 500
    });
  }
  return data;
};

// 绘制折线图
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

// 更新排行榜
const updateRanking = () => {
  // 根据排行榜类型更新数据
  console.log('更新排行榜:', rankingType.value);
};

// 处理日期变化
const handleDateChange = (dates: any) => {
  console.log('日期范围变化:', dates);
  loadOrderData();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadOrderData();
};

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadOrderData();
};

// 加载订单数据
const loadOrderData = async () => {
  tableLoading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟数据
    orderData.value = [
      {
        orderNo: 'ORD20250101001',
        customerName: '北京第一中学',
        productName: '智能投影仪 4K超清版',
        quantity: 2,
        totalAmount: 5998.00,
        orderDate: '2025-01-01',
        status: 'delivered'
      },
      {
        orderNo: 'ORD20250101002',
        customerName: '上海实验小学',
        productName: '电子白板 75寸触控版',
        quantity: 1,
        totalAmount: 8999.00,
        orderDate: '2025-01-01',
        status: 'shipped'
      },
      {
        orderNo: 'ORD20250101003',
        customerName: '广州育才中学',
        productName: '学生平板 10寸学习版',
        quantity: 50,
        totalAmount: 64950.00,
        orderDate: '2025-01-01',
        status: 'confirmed'
      }
    ];
    
    total.value = 156;
  } catch (error) {
    ElMessage.error('加载数据失败');
  } finally {
    tableLoading.value = false;
  }
};

// 查看详情
const viewDetail = (row: OrderData) => {
  ElMessage.info(`查看订单详情: ${row.orderNo}`);
};

// 编辑订单
const editOrder = (row: OrderData) => {
  ElMessage.info(`编辑订单: ${row.orderNo}`);
};

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出功能开发中...');
};

// 初始化
onMounted(() => {
  loadOrderData();
  updateChart();
});
</script>

<style scoped>
.sales-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 面包屑样式 */
.breadcrumb-header {
  margin-bottom: 20px;
}

/* 概览卡片 */
.sales-overview {
  margin-bottom: 20px;
}

.overview-card {
  border-radius: 8px;
  overflow: hidden;
  color: #fff;
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  padding: 20px;
}

.overview-card.primary {
  background: linear-gradient(45deg, #409eff, #79bbff);
}

.overview-card.success {
  background: linear-gradient(45deg, #67c23a, #95d475);
}

.overview-card.warning {
  background: linear-gradient(45deg, #e6a23c, #eebe77);
}

.overview-card.info {
  background: linear-gradient(45deg, #909399, #b1b3b8);
}

.overview-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.overview-icon {
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

.overview-info {
  flex-grow: 1;
}

.overview-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.overview-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.overview-trend.up {
  color: #67c23a;
}

.overview-trend.down {
  color: #f56c6c;
}

.overview-trend .el-icon {
  margin-right: 3px;
}

/* 图表卡片 */
.chart-card, .ranking-card, .table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.card-title {
  font-size: 18px;
  color: #303133;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 排行榜卡片 */
.ranking-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
}

.ranking-number.first {
  background-color: #e6a23c;
  color: #fff;
}

.ranking-number.second {
  background-color: #909399;
  color: #fff;
}

.ranking-number.third {
  background-color: #b1b3b8;
  color: #fff;
}

.ranking-info {
  flex-grow: 1;
}

.ranking-name {
  font-weight: bold;
  color: #303133;
}

.ranking-desc {
  font-size: 12px;
  color: #909399;
}

.ranking-value {
  text-align: right;
}

.ranking-value .value {
  font-weight: bold;
  color: #606266;
}

.ranking-value .percentage {
  font-size: 12px;
  color: #909399;
}

/* 表格卡片 */
.table-card {
  margin-top: 20px;
}

.table-controls {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗样式 */
.analysis-content {
  padding: 20px;
}

.analysis-chart {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  background-color: #f0f2f5;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}
</style>

