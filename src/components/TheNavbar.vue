<template>
  <div class="navbar">
    <div class="nav-left">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <img src="@/assets/logo.png" alt="学子通 Logo" class="brand-logo-img" />
          <span class="brand-text">学子通教育装备商城</span>
        </router-link>
      </div>
    </div>
    <div class="nav-right">
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <el-icon class="search-icon" @click="handleSearch"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="manual-nav">
        <router-link to="/" class="nav-link">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/products" class="nav-link">
          <el-icon><Goods /></el-icon>
          <span>商品</span>
        </router-link>
        <router-link to="/contact" class="nav-link">
          <el-icon><Phone /></el-icon>
          <span>联系我们</span>
        </router-link>
                <router-link to="/about" class="nav-link">
          <el-icon><Star /></el-icon>
          <span>关于我们</span>
        </router-link>
      </div>
      <div class="nav-actions">
        <el-button type="info" :icon="ShoppingCart" class="cart-btn" circle>
          <el-badge 
            :value="cartStore.totalItemCount" 
            class="cart-badge" 
            :hidden="cartStore.totalItemCount === 0" 
          />
        </el-button>
        
        <!-- 根据登录状态显示不同内容 -->
        <el-dropdown v-if="isLoggedIn" trigger="click" class="user-dropdown">
          <el-avatar src="/images/avatar.jpg" class="user-avatar" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="User" @click="goToUserProfile">个人中心</el-dropdown-item>
              <el-dropdown-item :icon="Platform" @click="goToAdmin">后台管理</el-dropdown-item>
              <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div v-else class="login-actions">
            <el-button type="primary" link @click="loginDialogVisible = true">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')">注册</el-button>
        </div>

      </div>
    </div>

    <!-- 登录弹窗 -->
    <el-dialog v-model="loginDialogVisible" title="用户登录" width="400px">
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="loginDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleLogin" :loading="loginLoading">
            登录
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { Search, House, Goods, ShoppingCart, Star, Phone, Platform, User, SwitchButton } from '@element-plus/icons-vue';

const router = useRouter();
const searchKeyword = ref('');
const cartStore = useCartStore();
const isLoggedIn = ref(false);
const loginDialogVisible = ref(false);
const loginLoading = ref(false);
const loginFormRef = ref();

const loginForm = reactive({
  phone: '',
  password: ''
});

const loginRules = reactive({
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
});

const checkLoginStatus = () => {
  if (localStorage.getItem('customerId')) {
    isLoggedIn.value = true;
  } else {
    isLoggedIn.value = false;
  }
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loginLoading.value = true;
      axios.post('http://localhost:8080/customer/login', {
        phone: loginForm.phone,
        password: loginForm.password
      }).then(res => {
        if (res.data.code === 0 && res.data.data.length > 0) {
          const customer = res.data.data[0];
          localStorage.setItem('customerId', customer.customerId);
          localStorage.setItem('customerName', customer.customerName);
          ElMessage.success('登录成功！');
          loginDialogVisible.value = false;
          checkLoginStatus();
        } else {
          ElMessage.error(res.data.msg || '登录失败');
        }
      }).catch(() => {
        ElMessage.error('登录请求失败');
      }).finally(() => {
        loginLoading.value = false;
      });
    }
  });
};

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/products', query: { search: searchKeyword.value } });
  }
};

const goToAdmin = () => {
  router.push('/admin');
};

const goToUserProfile = () => {
  router.push('/user/profile');
};

const handleLogout = () => {
  localStorage.removeItem('customerId');
  localStorage.removeItem('customerName');
  isLoggedIn.value = false;
  ElMessage.success('您已成功退出');
  router.push('/');
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 40px; height: 60px; background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky; top: 0; z-index: 1000;
}
.nav-left, .nav-right { display: flex; align-items: center; gap: 20px; }
.brand-link { display: flex; align-items: center; text-decoration: none; color: #333; }
.brand-logo-img { height: 32px; width: auto; margin-right: 10px; }
.brand-text { font-size: 20px; font-weight: bold; white-space: nowrap; }
.search-input { width: 200px; }
.manual-nav { display: flex; align-items: center; gap: 10px; }
.nav-link {
  display: flex; align-items: center; padding: 0 15px; height: 60px;
  text-decoration: none; color: #606266; font-size: 16px;
  border-bottom: 2px solid transparent; transition: all 0.2s;
}
.nav-link:hover { color: #409eff; }
.nav-link.router-link-exact-active { color: #409eff; border-bottom-color: #409eff; }
.nav-link .el-icon { margin-right: 5px; }
.nav-actions { display: flex; align-items: center; gap: 20px; }
.cart-btn.el-button.is-circle {
  position: relative; border: none; background: none; color: #606266;
  font-size: 24px; transition: color 0.3s;
}
.cart-btn.el-button.is-circle:hover { color: #409eff; background-color: transparent; }
.cart-badge { position: absolute; top: -5px; right: -5px; }
.user-dropdown { cursor: pointer; }
.user-avatar { background-color: #e9e9eb; color: #666; }
.user-dropdown :deep(.el-icon) { font-size: 16px; margin-right: 8px; }
.login-actions { display: flex; align-items: center; gap: 10px; }
</style>
