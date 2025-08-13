<template>
  <div class="dashboard-container">
    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in overviewData" :key="index">
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

    <!-- 图表和排行 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据趋势分析</span>
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
          <div class="chart-container" ref="mainChartContainer">
            <canvas ref="mainChart" width="100%" height="350"></canvas>
          </div>
        </el-card>
      </el-col>

      <!-- 排行榜 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="ranking-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">排行榜</span>
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

    <!-- 数据表格 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据详情</span>
              <div class="table-controls">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索..."
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
            :data="tableData" 
            style="width: 100%" 
            v-loading="tableLoading"
            border
            stripe
            height="400"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="name" label="名称" width="140" />
            <el-table-column prop="value" label="值" width="120" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button size="small" type="text" @click="viewDetail(scope.row)">
                  查看
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowUp, ArrowDown, Download, ShoppingCart, Money, TrendCharts, User, Search } from '@element-plus/icons-vue';
import axios from 'axios';

// 定义数据接口
interface DashboardData {
  name: string;
  value: number;
  date: string;
}

// 响应式数据
const overviewData = ref([
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
const mainChart = ref();
const mainChartContainer = ref();

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
const tableData = ref<DashboardData[]>([]); 
const tableLoading = ref(false);
const searchQuery = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

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

// 更新图表
const updateChart = () => {
  nextTick(() => {
    drawMainChart();
  });
};

// 绘制主图表
const drawMainChart = () => {
  if (!mainChart.value) return;
  
  const canvas = mainChart.value;
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
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * 10000 + 5000
    });
  }
  return data;
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

// 更新排行榜
const updateRanking = () => {
  // 根据排行榜类型更新数据
  console.log('更新排行榜:', rankingType.value);
};

// 处理日期变化
const handleDateChange = (dates: any) => {
  console.log('日期范围变化:', dates);
  loadTableData();
};

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadTableData();
};

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadTableData();
};

// 加载表格数据
const loadTableData = async () => {
  tableLoading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟数据
    tableData.value = [
      { name: '数据项A', value: 123, date: '2025-01-01' },
      { name: '数据项B', value: 456, date: '2025-01-02' },
      { name: '数据项C', value: 789, date: '2025-01-03' },
    ];
    
    total.value = 100;
  } catch (error) {
    ElMessage.error('加载数据失败');
  } finally {
    tableLoading.value = false;
  }
};

// 查看详情
const viewDetail = (row: DashboardData) => {
  ElMessage.info(`查看详情: ${row.name}`);
};

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出功能开发中...');
};

// 初始化
onMounted(() => {
  loadTableData();
  updateChart();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 概览卡片 */
.overview-cards {
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
}

.overview-info {
  flex-grow: 1;
}

.overview-label {
  font-size: 14px;
  opacity: 0.8;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

.overview-trend {
  font-size: 12px;
  margin-top: 5px;
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
.chart-card,
.ranking-card,
.table-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-card:hover,
.ranking-card:hover,
.table-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.chart-controls .el-select {
  width: 120px;
}

.chart-container {
  width: 100%;
  height: 350px;
}

/* 排行榜 */
.ranking-list {
  padding: 10px 0;
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
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 10px;
}

.ranking-number.first {
  background-color: #e6a23c;
  color: #fff;
}

.ranking-number.second {
  background-color: #409eff;
  color: #fff;
}

.ranking-number.third {
  background-color: #67c23a;
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
  color: #303133;
}

.ranking-value .percentage {
  font-size: 12px;
  color: #909399;
}

/* 表格 */
.table-controls {
  display: flex;
  align-items: center;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  .overview-cards .el-col {
    margin-bottom: 15px;
  }
  .chart-controls,
  .table-controls {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  .chart-controls .el-select,
  .table-controls .el-input,
  .table-controls .el-date-picker {
    width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style>

