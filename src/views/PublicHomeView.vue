<template>
  <div class="public-home" :style="homeBackgroundStyle">
    <div class="navbar">
      <div class="nav-left">
        <router-link to="/" class="brand-link">
          <el-icon class="brand-icon"><Monitor /></el-icon>
          <span class="brand-text">学子通教育装备商城</span>
        </router-link>
      </div>

      <div class="nav-center">
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

      <div class="nav-right">
        <router-link to="/" class="nav-item">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/products" class="nav-item">
          <el-icon><Goods /></el-icon>
          <span>商品</span>
        </router-link>
        <el-button type="info" :icon="ShoppingCart" class="cart-btn" circle>
          <el-tooltip content="购物车" placement="bottom">
            <span></span>
          </el-tooltip>
          <el-badge :value="cartCount" class="cart-badge" />
        </el-button>
        <el-avatar icon="el-icon-user-solid" class="user-avatar" />
      </div>
    </div>

    <div class="main-container">
      <section class="section carousel-section">
        <el-carousel height="500px" indicator-position="outside">
          <el-carousel-item v-for="(banner, index) in banners" :key="index">
            <div class="carousel-item">
              <img :src="banner.image" :alt="banner.title" />
              <div class="carousel-content">
                <h2>{{ banner.title }}</h2>
                <p>{{ banner.description }}</p>
                <el-button type="primary" size="large">{{ banner.buttonText }}</el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </section>

      <section class="section products-section">
        <div class="section-header">
          <h2>热门教育装备</h2>
          <p>为学校和教育机构提供专业的教学设备和解决方案</p>
        </div>
        <el-row :gutter="30">
          <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" v-for="product in products" :key="product.id">
            <el-card class="product-card" :body-style="{ padding: '0px' }">
              <img :src="product.image" class="product-image" />
              <div class="product-info">
                <div class="product-header">
                  <h3>{{ product.name }}</h3>
                  <el-tag size="small" :type="product.tagType">{{ product.category }}</el-tag>
                </div>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-rating">
                  <el-rate v-model="product.rating" disabled show-score />
                </div>
                <div class="product-footer">
                  <span class="product-price">¥{{ product.price.toLocaleString() }}</span>
                  <el-button type="primary" size="small" :icon="ShoppingCart" class="buy-btn">
                    立即购买
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div class="more-products">
          <el-button type="primary" size="large" @click="$router.push('/products')">
            查看更多商品
          </el-button>
        </div>
      </section>

      <section class="section features-section">
        <div class="section-header">
          <h2>我们的优势</h2>
        </div>
        <el-row :gutter="30">
          <el-col :span="8" :xs="24" :sm="24" :md="8" v-for="(feature, index) in features" :key="index">
            <div class="feature-item">
              <el-icon size="64" color="#2F80ED"><component :is="feature.icon" /></el-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </el-col>
        </el-row>
      </section>

      <section class="section partners-section">
        <div class="section-header">
          <h2>合作伙伴</h2>
          <p>与全国数千所学校建立长期合作关系</p>
        </div>
        <div class="partners-logos">
          <div class="partner-item" v-for="(partner, index) in partners" :key="index">
            <img :src="partner.logo" :alt="partner.name" class="partner-logo-img" />
            <span class="partner-name">{{ partner.name }}</span>
          </div>
        </div>
      </section>
    </div>

    <footer class="footer">
      <div class="footer-content">
        <el-row :gutter="40">
          <el-col :span="6" :xs="24" :sm="12" :md="6">
            <h3>学子通教育装备商城</h3>
            <p>专业的教育装备供应商，为教育现代化提供优质产品和服务。</p>
            <div class="social-links">
              <el-button circle :icon="ChatDotRound" />
              <el-button circle :icon="Message" />
              <el-button circle :icon="Phone" />
            </div>
          </el-col>
          <el-col :span="6" :xs="24" :sm="12" :md="6">
            <h4>产品分类</h4>
            <ul class="footer-links">
              <li><a href="#" @click="navigateToProducts('多媒体设备')">多媒体设备</a></li>
              <li><a href="#" @click="navigateToProducts('教学设备')">教学设备</a></li>
              <li><a href="#" @click="navigateToProducts('实验设备')">实验设备</a></li>
              <li><a href="#" @click="navigateToProducts('家具设备')">家具设备</a></li>
            </ul>
          </el-col>
          <el-col :span="6" :xs="24" :sm="12" :md="6">
            <h4>客户服务</h4>
            <ul class="footer-links">
              <li><router-link to="/contact">联系我们</router-link></li>
              <li><router-link to="/about">关于我们</router-link></li>
              <li><a href="#" @click="showService">售后服务</a></li>
              <li><a href="#" @click="showHelp">帮助中心</a></li>
            </ul>
          </el-col>
          <el-col :span="6" :xs="24" :sm="12" :md="6">
            <h4>联系信息</h4>
            <div class="contact-info">
              <p><el-icon><Phone /></el-icon> 400-888-9999</p>
              <p><el-icon><Message /></el-icon> service@xuezitong.com</p>
              <p><el-icon><Location /></el-icon> 北京市海淀区中关村大街1号</p>
            </div>
          </el-col>
        </el-row>
        <el-divider />
        <div class="footer-bottom">
          <p>&copy; 2025 学子通教育装备商城. All Rights Reserved.</p>
          <p>京ICP备12345678号 | 京公网安备11010802012345号</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Monitor, House, Goods, InfoFilled, Phone, Search, ShoppingCart, Trophy, Tools, Headset,
  ChatDotRound, Message, Location
} from '@element-plus/icons-vue'

// 导入背景图片
import homeBackground from '@/assets/homebackground/1.jpg'

export default {
  name: 'PublicHomeView',
  components: {
    Monitor, House, Goods, InfoFilled, Phone, Search, ShoppingCart, Trophy, Tools, Headset,
    ChatDotRound, Message, Location
  },
  setup() {
    const router = useRouter()
    const searchKeyword = ref('')
    const cartCount = ref(3)

    const banners = ref([
      {
        image: '/src/assets/home/banner1.jpg',
        title: '智能教学设备',
        description: '为现代化教学提供先进的智能设备解决方案',
        buttonText: '了解详情'
      },
      {
        image: '/src/assets/home/banner2.jpg',
        title: '实验室装备',
        description: '专业的实验室设备，助力科学教育发展',
        buttonText: '查看产品'
      },
      {
        image: '/src/assets/home/banner3.jpg',
        title: '多媒体教学',
        description: '打造互动式多媒体教学环境',
        buttonText: '立即咨询'
      }
    ])

    const products = ref([
      {
        id: 1,
        name: '智能交互白板',
        price: 8999,
        rating: 4.8,
        image: '/src/assets/home/product1.webp',
        category: '多媒体设备',
        tagType: 'success',
        description: '支持多点触控，内置教学软件，提升课堂互动体验'
      },
      {
        id: 2,
        name: '教学一体机',
        price: 12999,
        rating: 4.9,
        image: '/src/assets/home/product2.jpg',
        category: '教学设备',
        tagType: 'primary',
        description: '集投影、音响、电脑于一体的现代化教学设备'
      },
      {
        id: 3,
        name: '学生实验桌',
        price: 1299,
        rating: 4.7,
        image: '/src/assets/home/product1.webp',
        category: '实验设备',
        tagType: 'warning',
        description: '符合人体工程学设计，安全环保材质制造'
      },
      {
        id: 4,
        name: '多媒体讲台',
        price: 3599,
        rating: 4.6,
        image: '/src/assets/home/product2.jpg',
        category: '讲台设备',
        tagType: 'info',
        description: '集成多种教学设备控制功能的智能讲台'
      }
    ])

    const features = ref([
      {
        icon: 'Trophy',
        title: '品质保证',
        description: '所有产品均通过国家质量认证，为教育机构提供可靠的设备保障'
      },
      {
        icon: 'Tools',
        title: '专业服务',
        description: '提供从产品选型到安装调试的全程专业服务支持'
      },
      {
        icon: 'Headset',
        title: '售后无忧',
        description: '7x24小时客服支持，完善的售后服务体系让您无后顾之忧'
      }
    ])

    const partners = ref([
      { name: '北京大学', logo: '/src/assets/university/beijing.png' },
      { name: '复旦大学', logo: '/src/assets/university/fudan.png' },
      { name: '南京大学', logo: '/src/assets/university/nanjing.jpg' },
      { name: '清华大学', logo: '/src/assets/university/qinghua.png' },
      { name: '上海交通大学', logo: '/src/assets/university/shanghai.webp' },
      { name: '浙江大学', logo: '/src/assets/university/zhejiang.png' },
    ])

    const homeBackgroundStyle = computed(() => ({
      backgroundImage: `url(${homeBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }))

    const handleSearch = () => {
      if (searchKeyword.value.trim()) {
        router.push({
          path: '/products',
          query: { search: searchKeyword.value }
        })
        ElMessage.success(`搜索: ${searchKeyword.value}`)
      }
    }

    const navigateToProducts = (category) => {
      router.push({
        path: '/products',
        query: { category }
      })
    }

    const showService = () => {
      ElMessage.info('售后服务页面开发中...')
    }

    const showHelp = () => {
      ElMessage.info('帮助中心页面开发中...')
    }

    return {
      searchKeyword,
      cartCount,
      banners,
      products,
      features,
      partners,
      homeBackgroundStyle,
      handleSearch,
      navigateToProducts,
      showService,
      showHelp,
      Monitor, House, Goods, InfoFilled, Phone, Search, ShoppingCart, Trophy, Tools, Headset,
      ChatDotRound, Message, Location
    }
  }
}
</script>

<style scoped>
/* -------------------- 通用样式与布局 -------------------- */
.public-home {
  min-height: 100vh;
}

.main-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.section {
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  margin-bottom: 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 38px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.section-header p {
  font-size: 16px;
  color: #7f8c8d;
}

/* -------------------- 头部导航栏优化 -------------------- */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: none;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-center {
  display: flex;
  flex: 1;
  justify-content: center;
  margin: 0 20px; /* 增加与左右两侧的间距 */
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px; /* 增加按钮和菜单项之间的间距 */
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-size: 22px;
  font-weight: bold;
}

.brand-icon {
  margin-right: 8px;
  font-size: 30px;
  color: #2F80ED;
}

.search-input {
  width: 400px; /* 搜索框加宽 */
  border-radius: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 60px; /* 与el-menu-item保持高度一致 */
  text-decoration: none;
  color: #606266;
  font-size: 14px;
  transition: color 0.3s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #2F80ED;
  border-bottom: 2px solid #2F80ED;
}

.nav-item .el-icon {
  margin-right: 5px;
}

.cart-btn {
  position: relative;
  border-radius: 50%;
}

.cart-btn span {
  display: none;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
}

.user-avatar {
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.user-avatar:hover {
  border-color: #2F80ED;
}

/* -------------------- 轮播图美化 -------------------- */
.carousel-section {
  padding-top: 20px;
}

.carousel-item {
  position: relative;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-content {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
  color: white;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
}

.carousel-content h2 {
  font-size: 52px;
  margin-bottom: 20px;
  font-weight: bold;
}

.carousel-content p {
  font-size: 20px;
  margin-bottom: 30px;
  line-height: 1.5;
  max-width: 600px;
}

/* -------------------- 商品卡片优化 -------------------- */
.products-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
}

.product-card {
  margin-bottom: 30px;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
}

.product-info {
  padding: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.product-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #34495e;
}

.product-description {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 15px;
  line-height: 1.5;
  height: 40px;
  overflow: hidden;
}

.product-rating {
  margin-bottom: 15px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  color: #2F80ED;
}

.buy-btn {
  border-radius: 20px;
}

.more-products {
  text-align: center;
  margin-top: 60px;
}

/* -------------------- 特色服务优化 -------------------- */
.features-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
}

.feature-item {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.feature-item h3 {
  margin: 20px 0 15px;
  font-size: 22px;
  color: #34495e;
}

.feature-item p {
  color: #7f8c8d;
  line-height: 1.6;
}

/* -------------------- 合作伙伴模块 -------------------- */
.partners-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
}

.partners-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 40px;
}

.partner-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 140px;
  padding: 10px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.partner-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.partner-logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.partner-item:hover .partner-logo-img {
  filter: grayscale(0%);
  opacity: 1;
}

.partner-name {
  font-size: 14px;
  font-weight: 500;
  color: #555;
  text-align: center;
}

/* -------------------- 页脚优化 -------------------- */
.footer {
  background: #2c3e50;
  color: white;
  padding: 80px 0 30px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer h3, .footer h4 {
  margin-bottom: 20px;
  color: white;
}

.footer h3 {
  font-size: 24px;
}

.footer h4 {
  font-size: 20px;
  font-weight: 600;
}

.footer p {
  line-height: 1.8;
  color: #bdc3c7;
  margin-bottom: 10px;
}

.social-links .el-button {
  background: #34495e;
  border-color: #34495e;
  color: white;
}

.footer-links li {
  margin-bottom: 15px;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #2F80ED;
}

.contact-info p {
  display: flex;
  align-items: center;
  color: #bdc3c7;
}

.contact-info .el-icon {
  margin-right: 10px;
  color: #2F80ED;
  font-size: 18px;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  color: #8c929a;
}

.footer-bottom p {
  margin-bottom: 8px;
  font-size: 14px;
}

/* -------------------- 响应式优化 -------------------- */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 15px;
  }

  .nav-left {
    margin-bottom: 10px;
  }

  .nav-center, .nav-right {
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    margin: 0;
    margin-bottom: 10px;
  }
  
  .search-input {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .brand-link {
    font-size: 20px;
  }

  .carousel-section {
    padding-top: 0;
  }

  .carousel-item {
    height: 300px;
  }
  
  .carousel-content {
    left: 5%;
  }
  
  .carousel-content h2 {
    font-size: 32px;
  }
  
  .carousel-content p {
    font-size: 16px;
  }
  
  .section {
    padding: 40px 0;
  }

  .section-header {
    margin-bottom: 30px;
  }
  
  .section-header h2 {
    font-size: 28px;
  }
  
  .product-card, .feature-item {
    margin-bottom: 20px;
  }
  
  .footer {
    padding: 40px 0 20px;
  }
  
  .footer-content .el-col {
    margin-bottom: 30px;
  }
}
</style>