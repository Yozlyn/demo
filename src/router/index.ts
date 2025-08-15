import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 主页路由
    {
      path: '/',
      name: 'home',
      component: () => import('../views/PublicHomeView.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/PublicProductsView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/PublicAboutView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/PublicContactView.vue')
    },
    // 管理后台路由
    {
      path: '/admin/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/admin',
      name: 'admin',
      component: HomeView,
      meta: { requiresAuth: true },
      children: [
        // 添加默认子路由
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        // 商品管理相关
        {
          path: '/admin/products/list',
          name: 'productsList',
          meta: { title: '商品列表' },
          component: () => import('../views/ProductsListView.vue')
        },
        {
          path: '/admin/products/categories',
          name: 'productsCategories',
          meta: { title: '商品分类' },
          component: () => import('../views/ProductsCategoriesView.vue')
        },
        {
          path: '/admin/products/inventory',
          name: 'productsInventory',
          meta: { title: '库存管理' },
          component: () => import('../views/ProductsInventoryView.vue')
        },
        {
          path: '/admin/products/reviews',
          name: 'productsReviews',
          meta: { title: '商品评价' },
          component: () => import('../views/ProductsReviewsView.vue')
        },
        // 订单管理相关
        {
          path: '/admin/orders/list',
          name: 'ordersList',
          meta: { title: '订单列表' },
          component: () => import('../views/OrdersListView.vue')
        },
        {
          path: '/admin/orders/pending',
          name: 'ordersPending',
          meta: { title: '待处理订单' },
          component: () => import('../views/OrdersPendingView.vue')
        },
        {
          path: '/admin/orders/refunds',
          name: 'ordersRefunds',
          meta: { title: '退款处理' },
          component: () => import('../views/OrdersRefundsView.vue')
        },
        {
          path: '/admin/orders/statistics',
          name: 'ordersStatistics',
          meta: { title: '订单统计' },
          component: () => import('../views/OrdersStatisticsView.vue')
        },
        // 客户管理相关（已有的 /customers/list 保留，其他添加）
        {
          path: '/admin/customers/list',
          name: 'customerList',
          meta: { title: '客户列表' },
          component: () => import('../views/CustomerView.vue')
        },
        {
          path: '/admin/customers/grades',
          name: 'customerGrades',
          meta: { title: '会员等级' },
          component: () => import('../views/CustomerGradesView.vue')
        },
        {
          path: '/admin/customers/addresses',
          name: 'customerAddresses',
          meta: { title: '地址管理' },
          component: () => import('../views/CustomerAddressesView.vue')
        },
        // 营销中心相关
        {
          path: '/admin/marketing/coupons',
          name: 'marketingCoupons',
          meta: { title: '优惠券管理' },
          component: () => import('../views/MarketingCouponsView.vue')
        },
        {
          path: '/admin/marketing/activities',
          name: 'marketingActivities',
          meta: { title: '促销活动' },
          component: () => import('../views/MarketingActivitiesView.vue')
        },
        {
          path: '/admin/marketing/adverts',
          name: 'marketingAdverts',
          meta: { title: '广告管理' },
          component: () => import('../views/MarketingAdvertsView.vue')
        },
        // 系统设置相关
        {
          path: '/admin/system/users',
          name: 'systemUsers',
          meta: { title: '管理员设置' },
          component: () => import('../views/SystemUsersView.vue')
        },
        {
          path: '/admin/system/payment',
          name: 'systemPayment',
          meta: { title: '支付设置' },
          component: () => import('../views/SystemPaymentView.vue')
        },
        {
          path: '/admin/system/logistics',
          name: 'systemLogistics',
          meta: { title: '物流设置' },
          component: () => import('../views/SystemLogisticsView.vue')
        },
        {
          path: '/admin/system/logs',
          name: 'systemLogs',
          meta: { title: '操作日志' },
          component: () => import('../views/SystemLogsView.vue')
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const suId = localStorage.getItem('suId');
  // 如果访问的是 /admin 精确路径，直接重定向到 /admin/login
  if (to.path === '/admin' && !suId) {
    next('/admin/login');
    return;
  }
  // 其他需要认证的路由
  if (to.matched.some(record => record.meta.requiresAuth) && to.path !== '/admin/login') {
    if (!suId) {
      next('/admin/login');
    } else {
      next();
    }
  } else {
    next();
  }
});
export default router

