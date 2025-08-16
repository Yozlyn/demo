<template>
  <div class="dashboard-container">
    <!-- 核心指标概览 -->
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
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 销售与订单趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售与订单趋势</span>
              <el-select v-model="timePeriod" size="small" @change="updateChart" style="width: 120px;">
                <el-option label="近7天" value="7days"></el-option>
                <el-option label="近30天" value="30days"></el-option>
                <el-option label="近90天" value="90days"></el-option>
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="mainChartContainer">
            <canvas ref="mainChart"></canvas>
          </div>
        </el-card>
      </el-col>

      <!-- 核心指标与待办事项 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="ranking-card">
           <el-tabs v-model="activeTab" class="dashboard-tabs">
            <el-tab-pane label="待办事项" name="tasks">
              <div class="task-list">
                <div class="task-item" v-for="task in pendingTasks" :key="task.name" @click="navigateTo(task.path)">
                  <el-icon class="task-icon" :color="task.color"><component :is="task.icon" /></el-icon>
                  <div class="task-info">
                    <span class="task-name">{{ task.name }}</span>
                    <span class="task-count">{{ task.count }}</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="热销商品" name="products">
              <div class="ranking-list">
                <div class="ranking-item" v-for="(item, index) in topProducts" :key="index">
                  <div class="ranking-number" :class="getRankingClass(index)">{{ index + 1 }}</div>
                  <div class="ranking-info">
                    <div class="ranking-name">{{ item.name }}</div>
                  </div>
                  <div class="ranking-value">{{ item.value }} 件</div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="高价值客户" name="customers">
               <div class="ranking-list">
                <div class="ranking-item" v-for="(item, index) in topCustomers" :key="index">
                  <div class="ranking-number" :class="getRankingClass(index)">{{ index + 1 }}</div>
                  <div class="ranking-info">
                    <div class="ranking-name">{{ item.name }}</div>
                  </div>
                  <div class="ranking-value">{{ formatValue(item.value, 'currency') }}</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近期订单列表 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">近期订单</span>
              <el-button type="primary" link @click="navigateTo('/admin/orders/list')">查看全部</el-button>
            </div>
          </template>
          
          <el-table 
            :data="recentOrders" 
            style="width: 100%" 
            v-loading="tableLoading"
            border
            stripe
            height="350"
          >
            <el-table-column prop="order_no" label="订单号" width="180" />
            <el-table-column prop="customer_name" label="客户名称" width="120" />
            <el-table-column prop="total_amount" label="订单金额" width="120">
              <template #default="scope">
                {{ formatValue(scope.row.total_amount, 'currency') }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="订单状态" width="120">
               <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">{{ formatStatus(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="order_date" label="下单时间" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button size="small" link @click="viewDetail(scope.row.order_id)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, markRaw, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ShoppingCart, Money, User, Goods, Bell, List, RefreshLeft } from '@element-plus/icons-vue';
// 确保您已安装并引入 Chart.js
// npm install chart.js
import Chart from 'chart.js/auto';

// --- 类型定义 ---
interface Order {
  order_id: string;
  order_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  order_date: string;
}

// --- 响应式数据 ---
const router = useRouter();
let mainChartInstance: Chart | null = null;

// 核心指标
const overviewData = ref([
  { label: '总销售额', value: 58345.50, icon: markRaw(Money), type: 'primary', format: 'currency' },
  { label: '总订单数', value: 25, icon: markRaw(ShoppingCart), type: 'success', format: 'number' },
  { label: '客户总数', value: 10, icon: markRaw(User), type: 'warning', format: 'number' },
  { label: '在售商品数', value: 29, icon: markRaw(Goods), type: 'info', format: 'number' }
]);

// 图表
const timePeriod = ref('30days');
const mainChart = ref<HTMLCanvasElement | null>(null);
const mainChartContainer = ref<HTMLDivElement | null>(null);

// 右侧卡片
const activeTab = ref('tasks');
const pendingTasks = ref([
    { name: '待付款订单', count: 4, icon: markRaw(Money), color: '#E6A23C', path: '/admin/orders/pending' },
    { name: '待发货订单', count: 5, icon: markRaw(List), color: '#409EFF', path: '/admin/orders/pending' },
    { name: '待处理退款', count: 5, icon: markRaw(RefreshLeft), color: '#F56C6C', path: '/admin/orders/refunds' }
]);
const topProducts = ref([
  { name: '无线耳机', value: 6 },
  { name: '笔记本电脑', value: 4 },
  { name: '智能手机', value: 4 },
  { name: 'Apple iPhone 15 Pro', value: 1 },
  { name: 'Samsung Galaxy S24', value: 1 }
]);
const topCustomers = ref([
  { name: '吴十', value: 25000.00 },
  { name: '钱七', value: 15000.00 },
  { name: '冯十二', value: 6000.00 },
  { name: '王五', value: 5500.00 },
  { name: '周九', value: 2500.00 }
]);

// 表格
const recentOrders = ref<Order[]>([]);
const tableLoading = ref(false);

// --- 方法 ---

// 格式化数值
const formatValue = (value: number, format: string) => {
  switch (format) {
    case 'currency':
      return `¥${value.toLocaleString()}`;
    case 'number':
      return value.toLocaleString();
    default:
      return value.toString();
  }
};

// 获取排行榜样式
const getRankingClass = (index: number) => {
  if (index === 0) return 'first';
  if (index === 1) return 'second';
  if (index === 2) return 'third';
  return 'normal';
};

// 格式化订单状态
const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
        'pending_payment': '待付款',
        'shipped': '已发货',
        'completed': '已完成',
        'pending_shipment': '待发货'
    };
    return statusMap[status] || '未知';
};
const getStatusTagType = (status: string) => {
    const typeMap: { [key: string]: string } = {
        'pending_payment': 'warning',
        'shipped': 'primary',
        'completed': 'success',
        'pending_shipment': 'info'
    };
    return typeMap[status] || 'info';
};

// 模拟生成图表数据
const generateChartData = () => {
  const days = timePeriod.value === '7days' ? 7 : 30;
  const labels = [];
  const salesData = [];
  const ordersData = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    labels.push(`${date.getMonth() + 1}-${date.getDate()}`);
    salesData.push(Math.floor(Math.random() * 5000 + 1000));
    ordersData.push(Math.floor(Math.random() * 20 + 5));
  }
  return { labels, salesData, ordersData };
};

// 绘制图表
const drawMainChart = () => {
  if (!mainChart.value) return;
  const ctx = mainChart.value.getContext('2d');
  if (!ctx) return;

  if (mainChartInstance) {
    mainChartInstance.destroy();
  }

  const { labels, salesData, ordersData } = generateChartData();

  mainChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'line',
          label: '销售额',
          data: salesData,
          borderColor: '#E6A23C',
          backgroundColor: 'rgba(230, 162, 60, 0.2)',
          yAxisID: 'y',
          tension: 0.3,
          fill: true,
        },
        {
          type: 'bar',
          label: '订单量',
          data: ordersData,
          backgroundColor: '#409EFF',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '销售额 (元)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: '订单量'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
    },
  });
};

const updateChart = () => {
    nextTick(() => {
        drawMainChart();
    });
};

// 加载近期订单数据
const loadRecentOrders = async () => {
  tableLoading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    // 使用SQL文件中的数据作为模拟数据
    recentOrders.value = [
      { order_id: 'ORD010', order_no: 'ORDER20240815010', customer_name: '周九', total_amount: 398.00, status: 'pending_payment', order_date: '2025-08-15 20:00:00' },
      { order_id: 'ORD009', order_no: 'ORDER20240815009', customer_name: '孙八', total_amount: 4999.00, status: 'completed', order_date: '2025-08-15 19:00:00' },
      { order_id: 'ORD008', order_no: 'ORDER20240815008', customer_name: '钱七', total_amount: 7999.00, status: 'shipped', order_date: '2025-08-15 18:00:00' },
      { order_id: 'ORD007', order_no: 'ORDER20240815007', customer_name: '赵六', total_amount: 199.00, status: 'pending_payment', order_date: '2025-08-15 17:00:00' },
      { order_id: 'ORD006', order_no: 'ORDER20240815006', customer_name: '王五', total_amount: 9998.00, status: 'completed', order_date: '2025-08-15 16:00:00' },
    ];
  } catch (error) {
    ElMessage.error('加载订单数据失败');
  } finally {
    tableLoading.value = false;
  }
};

// 导航
const navigateTo = (path: string) => {
  router.push(path);
};

// 查看详情
const viewDetail = (orderId: string) => {
  ElMessage.info(`正在查看订单 ${orderId} 的详情...`);
  // router.push(`/admin/orders/detail/${orderId}`);
};

// --- 生命周期 ---
onMounted(() => {
  loadRecentOrders();
  updateChart();
  window.addEventListener('resize', updateChart);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateChart);
    if(mainChartInstance) {
        mainChartInstance.destroy();
    }
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f8f9fa;
}

/* 概览卡片 */
.overview-card {
  border-radius: 8px;
  color: #fff;
  height: 120px;
}
.overview-card.primary { background: linear-gradient(45deg, #409eff, #79bbff); }
.overview-card.success { background: linear-gradient(45deg, #67c23a, #95d475); }
.overview-card.warning { background: linear-gradient(45deg, #e6a23c, #eebe77); }
.overview-card.info { background: linear-gradient(45deg, #909399, #b1b3b8); }

.overview-content { display: flex; align-items: center; width: 100%; }
.overview-icon { margin-right: 15px; }
.overview-info { flex-grow: 1; }
.overview-label { font-size: 14px; opacity: 0.8; }
.overview-value { font-size: 24px; font-weight: bold; margin-top: 5px; }

/* 通用卡片样式 */
.chart-card, .ranking-card, .table-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

/* 图表 */
.chart-container {
  position: relative;
  height: 350px;
}

/* 右侧卡片 */
.dashboard-tabs {
  height: 398px;
}
.task-list, .ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.task-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.3s;
}
.task-item:hover {
  background-color: #f0f2f5;
}
.task-icon {
  font-size: 24px;
  margin-right: 12px;
}
.task-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}
.task-name {
  color: #606266;
}
.task-count {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}
.ranking-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #909399;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 10px;
  font-size: 12px;
}
.ranking-number.first { background-color: #f56c6c; color: #fff; }
.ranking-number.second { background-color: #e6a23c; color: #fff; }
.ranking-number.third { background-color: #409eff; color: #fff; }
.ranking-info { flex-grow: 1; }
.ranking-name { color: #303133; }
.ranking-value { font-weight: 500; color: #606266; }

/* 表格 */
.el-table th {
  background-color: #f5f7fa;
}
</style>
