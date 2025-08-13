<template>
  <div class="sales-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-header">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 销售概览卡片 -->
    <el-row :gutter="20" class="sales-overview">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in salesOverview" :key="index">
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

    <!-- 销售图表和筛选 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 销售趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售趋势分析</span>
              <div class="chart-controls">
                <el-select v-model="chartType" size="small" @change="updateChart">
                  <el-option label="销售额" value="amount"></el-option>
                  <el-option label="订单量" value="orders"></el-option>
                  <el-option label="客户数" value="customers"></el-option>
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
          <div class="chart-container" ref="salesChartContainer">
            <canvas ref="salesChart" width="100%" height="350"></canvas>
          </div>
        </el-card>
      </el-col>

      <!-- 销售排行 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="ranking-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售排行榜</span>
              <el-select v-model="rankingType" size="small" @change="updateRanking">
                <el-option label="商品" value="product"></el-option>
                <el-option label="分类" value="category"></el-option>
                <el-option label="销售员" value="salesperson"></el-option>
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

    <!-- 销售数据表格 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售数据详情</span>
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
            :data="salesData" 
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
            <el-table-column prop="unitPrice" label="单价" width="100" align="right">
              <template #default="scope">
                ¥{{ scope.row.unitPrice.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
              <template #default="scope">
                ¥{{ scope.row.totalAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="salesperson" label="销售员" width="100" />
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

    <!-- 销售分析弹窗 -->
    <el-dialog v-model="analysisDialogVisible" title="销售分析详情" width="80%" top="5vh">
      <div class="analysis-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="analysis-chart">
              <h4>销售趋势</h4>
              <canvas ref="analysisChart" width="100%" height="200"></canvas>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="analysis-stats">
              <h4>统计数据</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-label">总销售额</div>
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

// 定义销售数据的接口
interface SaleData {
  orderNo: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  salesperson: string;
  orderDate: string;
  status: string;
}

// 响应式数据
const salesOverview = ref([
  {
    label: '今日销售额',
    value: 125600,
    trend: 15.2,
    icon: 'Money',
    type: 'primary',
    format: 'currency'
  },
  {
    label: '今日订单',
    value: 89,
    trend: 8.5,
    icon: 'ShoppingCart',
    type: 'success',
    format: 'number'
  },
  {
    label: '月度销售额',
    value: 2856000,
    trend: 12.3,
    icon: 'TrendCharts',
    type: 'warning',
    format: 'currency'
  },
  {
    label: '客户转化率',
    value: 68.5,
    trend: 5.8,
    icon: 'User',
    type: 'info',
    format: 'percentage'
  }
]);

// 图表相关
const chartType = ref('amount');
const timePeriod = ref('30days');
const salesChart = ref();
const salesChartContainer = ref();

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
const salesData = ref<SaleData[]>([]); // 添加类型注解
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
    drawSalesChart();
  });
};

// 绘制销售图表
const drawSalesChart = () => {
  if (!salesChart.value) return;
  
  const canvas = salesChart.value;
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
      value: Math.random() * 10000 + 5000
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
  loadSalesData();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadSalesData();
};

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadSalesData();
};

// 加载销售数据
const loadSalesData = async () => {
  tableLoading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟数据
    salesData.value = [
      {
        orderNo: 'ORD20250101001',
        customerName: '北京第一中学',
        productName: '智能投影仪 4K超清版',
        quantity: 2,
        unitPrice: 2999.00,
        totalAmount: 5998.00,
        salesperson: '张三',
        orderDate: '2025-01-01',
        status: 'delivered'
      },
      {
        orderNo: 'ORD20250101002',
        customerName: '上海实验小学',
        productName: '电子白板 75寸触控版',
        quantity: 1,
        unitPrice: 8999.00,
        totalAmount: 8999.00,
        salesperson: '李四',
        orderDate: '2025-01-01',
        status: 'shipped'
      },
      {
        orderNo: 'ORD20250101003',
        customerName: '广州育才中学',
        productName: '学生平板 10寸学习版',
        quantity: 50,
        unitPrice: 1299.00,
        totalAmount: 64950.00,
        salesperson: '王五',
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
const viewDetail = (row: SaleData) => {
  ElMessage.info(`查看订单详情: ${row.orderNo}`);
};

// 编辑订单
const editOrder = (row: SaleData) => {
  ElMessage.info(`编辑订单: ${row.orderNo}`);
};

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出功能开发中...');
};

// 初始化
onMounted(() => {
  loadSalesData();
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

/* 销售概览卡片 */
.sales-overview {
  margin-bottom: 20px;
}

.overview-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.overview-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.overview-card.success {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.overview-card.warning {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.overview-card.info {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.overview-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.overview-icon {
  margin-right: 16px;
  opacity: 0.8;
}

.overview-info {
  flex: 1;
}

.overview-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.overview-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.9;
}

/* 卡片样式 */
.chart-card, .ranking-card, .table-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.chart-card:hover, .ranking-card:hover, .table-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-controls, .table-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 图表容器 */
.chart-container {
  height: 350px;
  padding: 20px;
}

/* 排行榜样式 */
.ranking-list {
  padding: 16px 0;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background-color: #f8f9fa;
  margin: 0 -16px;
  padding: 12px 16px;
  border-radius: 8px;
}

.ranking-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
}

.ranking-number.first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
}

.ranking-number.second {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.ranking-number.third {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  color: white;
}

.ranking-number.normal {
  background-color: #f0f2f5;
  color: #606266;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.ranking-desc {
  font-size: 12px;
  color: #909399 !important;
}

.ranking-value {
  text-align: right;
}

.ranking-value .value {
  font-weight: 600;
  margin-bottom: 4px;
}

.ranking-value .percentage {
  font-size: 12px;
  color: #909399;
}

/* 表格样式 */
.table-card .el-table {
  background-color: transparent;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 分析弹窗样式 */
.analysis-content {
  padding: 20px;
}

.analysis-chart, .analysis-stats {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.analysis-chart h4, .analysis-stats h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sales-container {
    padding: 16px;
  }
  
  .chart-controls, .table-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overview-card, .chart-card, .ranking-card, .table-card {
  animation: fadeInUp 0.6s ease-out;
}
</style>