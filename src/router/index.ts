import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        // 添加默认子路由
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        // 商品管理相关
        {
          path: '/products/list',
          name: 'productsList',
          meta: { title: '商品列表' },
          component: () => import('../views/ProductsListView.vue')
        },
        {
          path: '/products/categories',
          name: 'productsCategories',
          meta: { title: '商品分类' },
          component: () => import('../views/ProductsCategoriesView.vue')
        },
        {
          path: '/products/inventory',
          name: 'productsInventory',
          meta: { title: '库存管理' },
          component: () => import('../views/ProductsInventoryView.vue')
        },
        {
          path: '/products/reviews',
          name: 'productsReviews',
          meta: { title: '商品评价' },
          component: () => import('../views/ProductsReviewsView.vue')
        },
        // 订单管理相关
        {
          path: '/orders/list',
          name: 'ordersList',
          meta: { title: '订单列表' },
          component: () => import('../views/OrdersListView.vue')
        },
        {
          path: '/orders/pending',
          name: 'ordersPending',
          meta: { title: '待处理订单' },
          component: () => import('../views/OrdersPendingView.vue')
        },
        {
          path: '/orders/refunds',
          name: 'ordersRefunds',
          meta: { title: '退款处理' },
          component: () => import('../views/OrdersRefundsView.vue')
        },
        {
          path: '/orders/statistics',
          name: 'ordersStatistics',
          meta: { title: '订单统计' },
          component: () => import('../views/OrdersStatisticsView.vue')
        },
        // 客户管理相关（已有的 /customers/list 保留，其他添加）
        {
          path: '/customers/list',
          name: 'customerList',
          meta: { title: '客户列表' },
          component: () => import('../views/CustomerView.vue')
        },
        {
          path: '/customers/grades',
          name: 'customerGrades',
          meta: { title: '会员等级' },
          component: () => import('../views/CustomerGradesView.vue')
        },
        {
          path: '/customers/addresses',
          name: 'customerAddresses',
          meta: { title: '地址管理' },
          component: () => import('../views/CustomerAddressesView.vue')
        },
        // 营销中心相关
        {
          path: '/marketing/coupons',
          name: 'marketingCoupons',
          meta: { title: '优惠券管理' },
          component: () => import('../views/MarketingCouponsView.vue')
        },
        {
          path: '/marketing/activities',
          name: 'marketingActivities',
          meta: { title: '促销活动' },
          component: () => import('../views/MarketingActivitiesView.vue')
        },
        {
          path: '/marketing/adverts',
          name: 'marketingAdverts',
          meta: { title: '广告管理' },
          component: () => import('../views/MarketingAdvertsView.vue')
        },
        // 系统设置相关
        {
          path: '/system/users',
          name: 'systemUsers',
          meta: { title: '管理员设置' },
          component: () => import('../views/SystemUsersView.vue')
        },
        {
          path: '/system/payment',
          name: 'systemPayment',
          meta: { title: '支付设置' },
          component: () => import('../views/SystemPaymentView.vue')
        },
        {
          path: '/system/logistics',
          name: 'systemLogistics',
          meta: { title: '物流设置' },
          component: () => import('../views/SystemLogisticsView.vue')
        },
        {
          path: '/system/logs',
          name: 'systemLogs',
          meta: { title: '操作日志' },
          component: () => import('../views/SystemLogsView.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    }
  ]
})

export default router

