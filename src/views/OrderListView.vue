<template>
  <div class="order-container">
    <!-- 面包屑导航与操作按钮 -->
    <div class="header-section">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增订单
        </el-button>
        <el-button type="info" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 订单统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="6" v-for="(stat, index) in orderStats" :key="index">
        <el-card shadow="hover" class="stat-card" :class="stat.type">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="24">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="订单号">
          <el-input 
            v-model="searchForm.orderNo" 
            placeholder="请输入订单号" 
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input 
            v-model="searchForm.customerName" 
            placeholder="请输入客户名称" 
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select 
            v-model="searchForm.orderStatus" 
            placeholder="请选择状态" 
            clearable
            style="width: 120px;"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select 
            v-model="searchForm.paymentStatus" 
            placeholder="请选择支付状态" 
            clearable
            style="width: 120px;"
          >
            <el-option label="未支付" value="unpaid" />
            <el-option label="已支付" value="paid" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表表格 -->
    <el-card shadow="never" class="table-card">
      <el-table 
        :data="orderList" 
        style="width: 100%" 
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="expand" width="30">
          <template #default="props">
            <div class="order-detail">
              <h4>订单商品明细</h4>
              <el-table :data="props.row.items" size="small">
                <el-table-column prop="productName" label="商品名称" />
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column prop="unitPrice" label="单价" width="100">
                  <template #default="scope">
                    ¥{{ scope.row.unitPrice.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="totalPrice" label="小计" width="100">
                  <template #default="scope">
                    ¥{{ scope.row.totalPrice.toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">¥{{ scope.row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="scope">
            <el-tag :type="getOrderStatusType(scope.row.orderStatus)" size="small">
              {{ getOrderStatusText(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态" width="100">
          <template #default="scope">
            <el-tag :type="getPaymentStatusType(scope.row.paymentStatus)" size="small">
              {{ getPaymentStatusText(scope.row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="120" />
        <el-table-column prop="shippingContact" label="收货人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="text" @click="viewDetail(scope.row)">
              查看
            </el-button>
            <el-button 
              size="small" 
              type="text" 
              @click="handleEdit(scope.row)"
              v-if="scope.row.orderStatus === 'pending'"
            >
              编辑
            </el-button>
            <el-dropdown trigger="click" @command="handleCommand($event, scope.row)">
              <el-button size="small" type="text">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    command="confirm" 
                    v-if="scope.row.orderStatus === 'pending'"
                  >
                    确认订单
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="ship" 
                    v-if="scope.row.orderStatus === 'confirmed'"
                  >
                    发货
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="deliver" 
                    v-if="scope.row.orderStatus === 'shipped'"
                  >
                    确认收货
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="cancel" 
                    v-if="['pending', 'confirmed'].includes(scope.row.orderStatus)"
                  >
                    取消订单
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作栏 -->
      <div class="batch-actions" v-if="selectedOrders.length > 0">
        <span>已选择 {{ selectedOrders.length }} 项</span>
        <el-button size="small" @click="batchConfirm">批量确认</el-button>
        <el-button size="small" @click="batchCancel">批量取消</el-button>
        <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="80%" top="5vh">
      <div class="order-detail-dialog" v-if="currentOrder">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <span>订单信息</span>
              </template>
              <div class="detail-info">
                <div class="info-row">
                  <span class="label">订单号：</span>
                  <span>{{ currentOrder.orderNo }}</span>
                </div>
                <div class="info-row">
                  <span class="label">客户名称：</span>
                  <span>{{ currentOrder.customerName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">订单金额：</span>
                  <span class="amount-text">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">订单状态：</span>
                  <el-tag :type="getOrderStatusType(currentOrder.orderStatus)">
                    {{ getOrderStatusText(currentOrder.orderStatus) }}
                  </el-tag>
                </div>
                <div class="info-row">
                  <span class="label">支付状态：</span>
                  <el-tag :type="getPaymentStatusType(currentOrder.paymentStatus)">
                    {{ getPaymentStatusText(currentOrder.paymentStatus) }}
                  </el-tag>
                </div>
                <div class="info-row">
                  <span class="label">下单时间：</span>
                  <span>{{ currentOrder.createdAt }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <span>收货信息</span>
              </template>
              <div class="detail-info">
                <div class="info-row">
                  <span class="label">收货人：</span>
                  <span>{{ currentOrder.shippingContact }}</span>
                </div>
                <div class="info-row">
                  <span class="label">联系电话：</span>
                  <span>{{ currentOrder.shippingPhone }}</span>
                </div>
                <div class="info-row">
                  <span class="label">收货地址：</span>
                  <span>{{ currentOrder.shippingAddress }}</span>
                </div>
                <div class="info-row" v-if="currentOrder.orderNotes">
                  <span class="label">订单备注：</span>
                  <span>{{ currentOrder.orderNotes }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-card shadow="never" class="detail-card" style="margin-top: 20px;">
          <template #header>
            <span>商品明细</span>
          </template>
          <el-table :data="currentOrder.items" border>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="unitPrice" label="单价" width="100" align="right">
              <template #default="scope">
                ¥{{ scope.row.unitPrice.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="小计" width="120" align="right">
              <template #default="scope">
                ¥{{ scope.row.totalPrice.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>

    <!-- 订单编辑弹窗 -->
    <el-dialog 
      v-model="editDialogVisible" 
      :title="isEdit ? '编辑订单' : '新增订单'" 
      width="70%"
      @close="resetForm"
    >
      <el-form :model="orderForm" :rules="formRules" ref="orderFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="orderForm.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收货人" prop="shippingContact">
              <el-input v-model="orderForm.shippingContact" placeholder="请输入收货人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="shippingPhone">
              <el-input v-model="orderForm.shippingPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态" prop="orderStatus">
              <el-select v-model="orderForm.orderStatus" placeholder="请选择状态" style="width: 100%;">
                <el-option label="待处理" value="pending" />
                <el-option label="已确认" value="confirmed" />
                <el-option label="已发货" value="shipped" />
                <el-option label="已送达" value="delivered" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="收货地址" prop="shippingAddress">
          <el-input 
            v-model="orderForm.shippingAddress" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入收货地址"
          />
        </el-form-item>
        <el-form-item label="订单备注">
          <el-input 
            v-model="orderForm.orderNotes" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入订单备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Download, Search, Refresh, ArrowDown } from '@element-plus/icons-vue';
import axios from 'axios';

// 接口类型定义
interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  orderId?: number;
  orderNo: string;
  customerName: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingContact: string;
  shippingPhone: string;
  shippingAddress: string;
  orderNotes?: string;
  createdAt: string;
  items: OrderItem[];
}

// 响应式数据
const loading = ref(false);
const orderList = ref<Order[]>([]);
const selectedOrders = ref<Order[]>([]);

// 订单统计
const orderStats = ref([
  { label: '待处理', value: 23, icon: 'Clock', type: 'warning' },
  { label: '已确认', value: 45, icon: 'Check', type: 'primary' },
  { label: '已发货', value: 67, icon: 'Truck', type: 'info' },
  { label: '已完成', value: 156, icon: 'CircleCheck', type: 'success' }
]);

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  customerName: '',
  orderStatus: '',
  paymentStatus: '',
  dateRange: []
});

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

// 弹窗控制
const detailDialogVisible = ref(false);
const editDialogVisible = ref(false);
const isEdit = ref(false);
const currentOrder = ref<Order | null>(null);

// 表单数据
const orderForm = reactive<Order>({
  orderNo: '',
  customerName: '',
  totalAmount: 0,
  orderStatus: 'pending',
  paymentStatus: 'unpaid',
  shippingContact: '',
  shippingPhone: '',
  shippingAddress: '',
  orderNotes: '',
  createdAt: '',
  items: []
});

// 表单引用
const orderFormRef = ref();

// 表单验证规则
const formRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  shippingContact: [
    { required: true, message: '请输入收货人', trigger: 'blur' }
  ],
  shippingPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  shippingAddress: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ]
};

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'confirmed': 'primary',
    'shipped': 'info',
    'delivered': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'info';
};

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'confirmed': '已确认',
    'shipped': '已发货',
    'delivered': '已送达',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

// 获取支付状态类型
const getPaymentStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'unpaid': 'warning',
    'paid': 'success',
    'refunded': 'info'
  };
  return statusMap[status] || 'info';
};

// 获取支付状态文本
const getPaymentStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'unpaid': '未支付',
    'paid': '已支付',
    'refunded': '已退款'
  };
  return statusMap[status] || status;
};

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟数据
    orderList.value = [
      {
        orderId: 1,
        orderNo: 'ORD20250101001',
        customerName: '北京第一中学',
        totalAmount: 5998.00,
        orderStatus: 'delivered',
        paymentStatus: 'paid',
        shippingContact: '张老师',
        shippingPhone: '13800138001',
        shippingAddress: '北京市朝阳区教育路123号',
        orderNotes: '请在工作日送货',
        createdAt: '2025-01-01 10:30:00',
        items: [
          { productName: '智能投影仪 4K超清版', quantity: 2, unitPrice: 2999.00, totalPrice: 5998.00 }
        ]
      },
      {
        orderId: 2,
        orderNo: 'ORD20250101002',
        customerName: '上海实验小学',
        totalAmount: 8999.00,
        orderStatus: 'shipped',
        paymentStatus: 'paid',
        shippingContact: '李主任',
        shippingPhone: '13800138002',
        shippingAddress: '上海市浦东新区科技路456号',
        createdAt: '2025-01-01 14:20:00',
        items: [
          { productName: '电子白板 75寸触控版', quantity: 1, unitPrice: 8999.00, totalPrice: 8999.00 }
        ]
      },
      {
        orderId: 3,
        orderNo: 'ORD20250101003',
        customerName: '广州育才中学',
        totalAmount: 64950.00,
        orderStatus: 'confirmed',
        paymentStatus: 'paid',
        shippingContact: '王校长',
        shippingPhone: '13800138003',
        shippingAddress: '广州市天河区教育大道789号',
        createdAt: '2025-01-01 16:45:00',
        items: [
          { productName: '学生平板 10寸学习版', quantity: 50, unitPrice: 1299.00, totalPrice: 64950.00 }
        ]
      }
    ];
    
    pagination.total = 156;
  } catch (error) {
    ElMessage.error('加载订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  loadOrderList();
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    orderNo: '',
    customerName: '',
    orderStatus: '',
    paymentStatus: '',
    dateRange: []
  });
  handleSearch();
};

// 新增订单
const handleAdd = () => {
  isEdit.value = false;
  editDialogVisible.value = true;
  resetForm();
};

// 编辑订单
const handleEdit = (row: Order) => {
  isEdit.value = true;
  editDialogVisible.value = true;
  Object.assign(orderForm, row);
};

// 查看详情
const viewDetail = (row: Order) => {
  currentOrder.value = row;
  detailDialogVisible.value = true;
};

// 处理命令
const handleCommand = (command: string, row: Order) => {
  switch (command) {
    case 'confirm':
      confirmOrder(row);
      break;
    case 'ship':
      shipOrder(row);
      break;
    case 'deliver':
      deliverOrder(row);
      break;
    case 'cancel':
      cancelOrder(row);
      break;
    case 'delete':
      deleteOrder(row);
      break;
  }
};

// 确认订单
const confirmOrder = (row: Order) => {
  ElMessageBox.confirm(`确定要确认订单"${row.orderNo}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.orderStatus = 'confirmed';
    ElMessage.success('订单确认成功');
  });
};

// 发货
const shipOrder = (row: Order) => {
  ElMessageBox.confirm(`确定要发货订单"${row.orderNo}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.orderStatus = 'shipped';
    ElMessage.success('发货成功');
  });
};

// 确认收货
const deliverOrder = (row: Order) => {
  ElMessageBox.confirm(`确定要确认收货订单"${row.orderNo}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.orderStatus = 'delivered';
    ElMessage.success('确认收货成功');
  });
};

// 取消订单
const cancelOrder = (row: Order) => {
  ElMessageBox.confirm(`确定要取消订单"${row.orderNo}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.orderStatus = 'cancelled';
    ElMessage.success('订单取消成功');
  });
};

// 删除订单
const deleteOrder = (row: Order) => {
  ElMessageBox.confirm(`确定要删除订单"${row.orderNo}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功');
    loadOrderList();
  });
};

// 选择变化
const handleSelectionChange = (selection: Order[]) => {
  selectedOrders.value = selection;
};

// 批量操作
const batchConfirm = () => {
  ElMessageBox.confirm('确定要批量确认选中的订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量确认成功');
    selectedOrders.value = [];
    loadOrderList();
  });
};

const batchCancel = () => {
  ElMessageBox.confirm('确定要批量取消选中的订单吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量取消成功');
    selectedOrders.value = [];
    loadOrderList();
  });
};

const batchDelete = () => {
  ElMessageBox.confirm('确定要批量删除选中的订单吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功');
    selectedOrders.value = [];
    loadOrderList();
  });
};

// 导出数据
const exportData = () => {
  ElMessage.info('数据导出功能开发中...');
};

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  loadOrderList();
};

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  loadOrderList();
};

// 提交表单
const submitForm = () => {
  orderFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const action = isEdit.value ? '修改' : '新增';
      ElMessage.success(`${action}成功`);
      editDialogVisible.value = false;
      loadOrderList();
    }
  });
};

// 重置表单
const resetForm = () => {
  Object.assign(orderForm, {
    orderNo: '',
    customerName: '',
    totalAmount: 0,
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
    shippingContact: '',
    shippingPhone: '',
    shippingAddress: '',
    orderNotes: '',
    createdAt: '',
    items: []
  });
  orderFormRef.value?.resetFields();
};

// 初始化
onMounted(() => {
  loadOrderList();
});
</script>

<style scoped>
.order-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 头部样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-card.warning {
  background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
  color: #2d3436;
}

.stat-card.primary {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
}

.stat-card.info {
  background: linear-gradient(135deg, #81ecec, #00cec9);
  color: #2d3436;
}

.stat-card.success {
  background: linear-gradient(135deg, #55efc4, #00b894);
  color: #2d3436;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  margin-right: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 卡片样式 */
.search-card, .table-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

/* 表格样式 */
.amount-text {
  color: #f56c6c;
  font-weight: 600;
}

.order-detail {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.order-detail h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

/* 批量操作栏 */
.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
  margin-top: 10px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情弹窗 */
.order-detail-dialog {
  padding: 20px 0;
}

.detail-card {
  border-radius: 8px;
}

.detail-info {
  padding: 16px 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.info-row .label {
  width: 100px;
  color: #909399;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-container {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .stats-row .el-col {
    margin-bottom: 16px;
  }
}
</style>

