import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
{
      path: '/',
      name: 'home',
      component: HomeView,
      children:[
        {
          path: '/user',
          name: 'user',
          component: () => import('../views/UserView.vue')
        },
        {
          path: '/customer',
          name: 'customer',
          component: () => import('../views/CustomerView.vue')
        },
        {
          path: '/sales',
          name: 'sales',
          component: () => import('../views/SalesView.vue')
        },
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
