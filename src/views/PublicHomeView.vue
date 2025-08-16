<template>
  <div class="public-home" :style="homeBackgroundStyle">
    <div class="main-container">
      <section class="section carousel-section">
        <el-carousel height="580px" indicator-position="outside" :autoplay="true" :interval="5000">
          <el-carousel-item v-for="(banner, index) in banners" :key="index">
            <div class="carousel-item">
              <div class="carousel-bg">
                <img :src="banner.image" :alt="banner.title" />
              </div>
              <div class="carousel-content">
                <h2>{{ banner.title }}</h2>
                <p>{{ banner.description }}</p>
                <el-button
                  type="primary"
                  size="large"
                  @click="handleBannerClick(banner)"
                >
                  {{ banner.buttonText }}
                </el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </section>

      <section class="section new-products-section reveal-section acrylic-section">
        <div class="section-header">
          <h2>新品上市</h2>
          <p>每月更新教育装备，引领教学创新</p>
          <div class="section-divider"></div>
        </div>
        <el-row :gutter="30">
          <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" v-for="product in newProducts" :key="product.id">
            <el-card class="product-card new-product-card" :body-style="{ padding: '0px' }">
              <div class="product-tag-new">新品</div>
              <img :src="product.image" class="product-image" loading="lazy" />
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
                  <div class="price-wrap">
                    <span class="product-price">¥{{ product.price.toLocaleString() }}</span>
                    <span class="product-original-price" v-if="product.originalPrice">
                      ¥{{ product.originalPrice.toLocaleString() }}
                    </span>
                  </div>
                  <el-button type="primary" size="small" :icon="ShoppingCart" class="buy-btn">
                    立即购买
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </section>

      <section class="section products-section reveal-section acrylic-section">
        <div class="section-header">
          <h2>热门教育装备</h2>
          <p>为学校和教育机构提供专业的教学设备和解决方案</p>
          <div class="section-divider"></div>
        </div>
        <el-row :gutter="30">
          <el-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" v-for="product in products" :key="product.id">
            <el-card class="product-card" :body-style="{ padding: '0px' }">
              <img :src="product.image" class="product-image" loading="lazy" />
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
                  <el-button 
                    type="primary" 
                    size="small" 
                    :icon="ShoppingCart" 
                    class="buy-btn"
                    @click="cartStore.addItem(product.id)"
                  >
                    加入购物车
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div class="more-products">
          <el-button type="primary" size="large" @click="$router.push('/products')" class="more-btn">
            查看更多商品
            <el-icon class="more-icon"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </section>


      <section class="section cases-section reveal-section acrylic-section">
        <div class="section-header">
          <h2>成功案例</h2>
          <p>全国2000+学校的共同选择</p>
          <div class="section-divider"></div>
        </div>
        <el-row :gutter="40">
          <el-col :span="8" :xs="24" :sm="24" :md="8" v-for="(caseItem, index) in cases" :key="index">
            <div class="case-card">
              <div class="case-image-wrap">
                <img :src="caseItem.image" :alt="caseItem.school" class="case-image" loading="lazy" />
                <div class="case-overlay">
                  <span class="case-category">{{ caseItem.category }}</span>
                </div>
              </div>
              <div class="case-info">
                <h3 class="case-school">{{ caseItem.school }}</h3>
                <p class="case-desc">{{ caseItem.description }}</p>
                <div class="case-stats">
                  <span class="stat-item">
                    <el-icon><User /></el-icon> {{ caseItem.studentCount }}名学生受益
                  </span>
                  <span class="stat-item">
                    <el-icon><Calendar /></el-icon> {{ caseItem.cooperationYear }}年合作
                  </span>
                </div>
                <el-button link class="case-detail-btn" @click="showCaseDetail(caseItem)">
                  查看详情 <el-icon class="detail-icon"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </section>

      <section class="section news-section reveal-section acrylic-section">
        <div class="section-header">
          <h2>教育资讯</h2>
          <p>关注教育装备行业动态与教学创新</p>
          <div class="section-divider"></div>
        </div>
        <el-row :gutter="30">
          <el-col :span="12" :xs="24" :sm="24" :md="12">
            <div class="featured-news">
              <img :src="featuredNewsImage" alt="精选资讯" class="featured-image" loading="lazy" />
              <div class="featured-content">
                <span class="news-tag">政策解读</span>
                <h3 class="news-title">《教育信息化2.0行动计划》对中小学装备的影响</h3>
                <p class="news-summary">深度解析最新政策对校园装备升级的具体要求，帮助学校把握采购方向...</p>
                <div class="news-meta">
                  <span><el-icon><Calendar /></el-icon> 2025-03-15</span>
                  <span><el-icon><View /></el-icon> 2.4k阅读</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12" :xs="24" :sm="24" :md="12">
            <div class="news-list">
              <div class="news-item" v-for="(news, index) in latestNews" :key="index">
                <div class="news-item-content">
                  <h4 class="news-item-title">{{ news.title }}</h4>
                  <p class="news-item-desc">{{ news.summary }}</p>
                  <div class="news-item-meta">
                    <span><el-icon><Calendar /></el-icon> {{ news.date }}</span>
                    <span class="news-item-category">{{ news.category }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="more-news">
          <el-button link class="more-news-btn">
            查看全部资讯 <el-icon class="more-icon"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </section>

      <section class="section features-section reveal-section acrylic-section">
        <div class="section-header">
          <h2>我们的优势</h2>
          <div class="section-divider"></div>
        </div>
        <el-row :gutter="30">
          <el-col :span="8" :xs="24" :sm="24" :md="8" v-for="(feature, index) in features" :key="index">
            <div class="feature-item" @mouseenter="featureHoverIndex = index" @mouseleave="featureHoverIndex = -1">
              <el-icon
                size="64"
                :color="featureHoverIndex === index ? '#2F80ED' : '#666'"
                class="feature-icon"
              >
                <component :is="feature.icon" />
              </el-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </el-col>
        </el-row>
      </section>

      <section class="section partners-section reveal-section acrylic-section">
        <div class="section-header">
          <h2>合作伙伴</h2>
          <p>与全国数千所学校建立长期合作关系</p>
          <div class="section-divider"></div>
        </div>
        <div class="partners-logos">
          <div class="partner-item" v-for="(partner, index) in partners" :key="index">
            <div class="partner-logo-container">
              <img :src="partner.logo" :alt="partner.name" class="partner-logo-img" />
            </div>
            <span class="partner-name">{{ partner.name }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useCartStore } from '@/stores/cart';
import {
  ShoppingCart, Trophy, Tools, Headset, ArrowRight, User, Calendar, View
} from '@element-plus/icons-vue';

const router = useRouter();
const cartStore = useCartStore();

// --- 响应式状态定义 ---
const featureHoverIndex = ref(-1);

// --- 模拟数据 ---
const banners = ref([
  { image: '/home/banner1.png', title: '智能教学设备', description: '为现代化教学提供先进的智能设备解决方案，覆盖K12到高等教育全场景', buttonText: '了解详情', path: '/products?category=智能设备' },
  { image: '/home/banner2.png', title: '实验室装备', description: '符合新课标要求的专业实验室设备，助力科学教育发展与创新人才培养', buttonText: '查看产品', path: '/products?category=实验设备' },
  { image: '/home/banner3.png', title: '多媒体教学', description: '打造互动式多媒体教学环境，让知识传递更高效、更生动', buttonText: '立即咨询', path: '/contact' }
]);
const newProducts = ref([
  { id: 'P101', name: '4K超高清教学一体机', price: 15999, originalPrice: 17999, rating: 4.9, image: '/newnew/new1.png', category: '教学设备', tagType: 'primary', description: '4K分辨率+120Hz刷新率，支持40点触控' },
  { id: 'P102', name: '便携式科学实验箱', price: 2499, rating: 4.7, image: '/newnew/new2.png', category: '实验设备', tagType: 'success', description: '包含200+实验器材，符合初中科学课程标准' },
  { id: 'P103', name: 'AI智能录播系统', price: 29999, originalPrice: 32999, rating: 4.8, image: '/newnew/new3.png', category: '多媒体设备', tagType: 'warning', description: '自动跟踪教师移动，智能聚焦板书内容' },
  { id: 'P104', name: '人体工学学生椅', price: 899, rating: 4.6, image: '/newnew/new4.png', category: '家具设备', tagType: 'info', description: '可调节高度与靠背角度，预防脊柱侧弯' }
]);
const products = ref([
  { id: 'P001', name: '智能交互白板', price: 8999, rating: 4.8, image: '/hots/hot1.png', category: '多媒体设备', tagType: 'success', description: '支持多点触控，内置教学软件' },
  { id: 'P002', name: '教学一体机', price: 12999, rating: 4.9, image: '/hots/hot2.png', category: '教学设备', tagType: 'primary', description: '集投影、音响、电脑于一体' },
  { id: 'P003', name: '学生实验桌', price: 1299, rating: 4.7, image: '/hots/hot3.png', category: '实验设备', tagType: 'warning', description: '符合人体工程学设计，安全环保' },
  { id: 'P004', name: '多媒体讲台', price: 3599, rating: 4.6, image: '/hots/hot4.png', category: '讲台设备', tagType: 'info', description: '集成多种教学设备控制功能的智能讲台' }
]);
const cases = ref([
  { school: '北京市第一中学', image: '/success/success1.png', category: '多媒体教室改造', description: '完成30间教室的多媒体设备升级，实现智能教学全覆盖', studentCount: 2800, cooperationYear: 2023 },
  { school: '上海实验中学', image: '/success/success2.png', category: '实验室建设', description: '建成8间标准化理科实验室，满足新课标实验教学要求', studentCount: 1500, cooperationYear: 2024 },
  { school: '广州外国语学校', image: '/success/success3.png', category: '校园整体方案', description: '提供从教室到图书馆的一站式装备解决方案', studentCount: 3200, cooperationYear: 2022 }
]);
const latestNews = ref([
  { title: '2025年教育装备采购趋势分析', summary: '从政策导向和技术发展角度，预测今年教育装备市场的三大趋势...', date: '2025-04-02', category: '行业分析' },
  { title: '智能交互设备在课堂教学中的应用技巧', summary: '资深教师分享智能白板的5个实用教学技巧，提升课堂效率...', date: '2025-03-28', category: '教学方法' },
  { title: '实验室安全管理规范与设备维护指南', summary: '详解实验室设备的日常维护要点与安全管理规范...', date: '2025-03-10', category: '设备维护' }
]);
const features = ref([
  // 用 markRaw 包裹每个图标组件
  { icon: markRaw(Trophy), title: '品质保证', description: '所有产品均通过国家质量认证，提供可靠保障' },
  { icon: markRaw(Tools), title: '专业服务', description: '提供从选型到安装调试的全程专业服务支持' },
  { icon: markRaw(Headset), title: '售后无忧', description: '7x24小时客服支持，完善的售后服务体系' }
]);

const partners = ref([
  { name: '北京大学', logo: '/university/beijing.png' },
  { name: '复旦大学', logo: '/university/fudan.png' },
  { name: '南京大学', logo: '/university/nanjing.png' },
  { name: '清华大学', logo: '/university/qinghua.png' },
  { name: '上海交通大学', logo: '/university/shanghai.webp' },
  { name: '浙江大学', logo: '/university/zhejiang.png' },
]);
const featuredNewsImage = ref('/news/featured.png');

// --- 计算属性 ---
const homeBackgroundStyle = computed(() => ({
  backgroundImage: `url(/homebackground/homebackground.jpg)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed'
}));

// --- 方法 ---
const handleBannerClick = (banner) => {
  if (banner.path) {
    router.push(banner.path);
  }
};

const showCaseDetail = (caseItem) => {
  ElMessage.info(`正在查看 ${caseItem.school} 的案例详情...`);
};

// --- 生命周期钩子 ---
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-section').forEach(section => {
    observer.observe(section);
  });
});
</script>

<style scoped>
/* --- 页面主体及通用样式 --- */
.carousel-item {
  position: relative;
  height: 100%;
}

.carousel-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: scale-in 1.5s ease-out;
}

@keyframes scale-in {
  from { transform: scale(1.05); }
  to { transform: scale(1); }
}

.carousel-content {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
  color: white;
  text-align: left;
  z-index: 10;
}

.carousel-content h2 {
  font-size: 58px;
  font-weight: bold;
  margin-bottom: 20px;
}

.carousel-content p {
  font-size: 20px;
  margin-bottom: 30px;
  max-width: 600px;
}

.product-card {
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.product-info {
  padding: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.product-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.product-description {
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
  height: 42px;
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
  color: #F56C6C;
}

.more-products {
  margin-top: 50px;
}

.more-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 30px;
}

.more-icon {
  margin-left: 8px;
  transition: transform 0.3s;
}

.more-btn:hover .more-icon {
  transform: translateX(3px);
}

.feature-item {
  padding: 30px;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.feature-item h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.feature-item p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.partners-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
}

.partner-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
}

.partner-logo-container {
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.partner-logo-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.partner-name {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.product-tag-new {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #F56C6C;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  z-index: 10;
}

.new-product-card {
  position: relative;
}

.price-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-original-price {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.case-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.case-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.1);
}

.case-image-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.case-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.case-card:hover .case-image {
  transform: scale(1.05);
}

.case-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
}

.case-category {
  color: white;
  background: #2F80ED;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.case-info {
  padding: 20px;
}

.case-school {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.case-desc {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.case-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #888;
}

.stat-item .el-icon {
  margin-right: 5px;
  font-size: 14px;
}

.case-detail-btn {
  color: #2F80ED;
  padding: 0;
  display: flex;
  align-items: center;
}

.detail-icon {
  margin-left: 5px;
  font-size: 14px;
  transition: transform 0.3s;
}

.case-detail-btn:hover .detail-icon {
  transform: translateX(3px);
}

.featured-news {
  display: flex;
  gap: 20px;
  background: #f7f9fc;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  height: 100%;
}

.featured-image {
  width: 40%;
  object-fit: cover;
}

.featured-content {
  padding: 25px;
  width: 60%;
  display: flex;
  flex-direction: column;
}

.news-tag {
  display: inline-block;
  background: #E6F7FF;
  color: #1890FF;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 10px;
  width: fit-content;
}

.news-title {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
  line-height: 1.4;
}

.news-summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
}

.news-meta {
  display: flex;
  gap: 15px;
  color: #888;
  font-size: 14px;
}

.news-meta .el-icon {
  margin-right: 5px;
  font-size: 14px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.news-item {
  background: #f7f9fc;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: transform 0.3s;
}

.news-item:hover {
  transform: translateX(5px);
}

.news-item-title {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.news-item-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-item-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 12px;
}

.news-item-category {
  background: #E6F7FF;
  padding: 2px 8px;
  border-radius: 4px;
}

.more-news {
  text-align: right;
  margin-top: 30px;
}

.more-news-btn {
  color: #2F80ED;
  font-size: 16px;
  display: flex;
  align-items: center;
  margin-left: auto;
}

@media (max-width: 992px) {
  .featured-news {
    flex-direction: column;
  }

  .featured-image, .featured-content {
    width: 100%;
  }

  .featured-image {
    height: 200px;
  }
}

@media (max-width: 768px) {
  .carousel-item {
    height: 400px;
  }

  .carousel-content h2 {
    font-size: 36px;
  }

  .carousel-content p {
    font-size: 16px;
  }

  .case-image-wrap {
    height: 160px;
  }
}
</style>