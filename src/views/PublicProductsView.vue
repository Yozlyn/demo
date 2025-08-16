<template>
  <div class="products-page">
    <div class="page-header">
      <h1>教育装备产品</h1>
      <p>为教育机构提供全方位的教学设备解决方案</p>
    </div>

    <section class="content-wrapper acrylic-section reveal-section">
      <div class="filter-area">
        <el-row :gutter="20" align="middle">
          <el-col :span="6">
            <el-select v-model="selectedCategory" placeholder="选择分类" style="width: 100%;">
              <el-option label="全部分类" value=""></el-option>
              <el-option label="多媒体设备" value="多媒体设备"></el-option>
              <el-option label="教学设备" value="教学设备"></el-option>
              <el-option label="实验设备" value="实验设备"></el-option>
              <el-option label="家具设备" value="家具设备"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="priceRange" placeholder="价格范围" style="width: 100%;">
              <el-option label="全部价格" value=""></el-option>
              <el-option label="1000元以下" value="0-1000"></el-option>
              <el-option label="1000-5000元" value="1000-5000"></el-option>
              <el-option label="5000-10000元" value="5000-10000"></el-option>
              <el-option label="10000元以上" value="10000-999999"></el-option>
            </el-select>
          </el-col>
          <el-col :span="12">
            <el-input v-model="searchKeyword" placeholder="搜索产品名称...">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
        </el-row>
      </div>

      <div class="products-grid">
        <el-row :gutter="30">
          <el-col 
            :span="6" 
            v-for="product in paginatedProducts" 
            :key="product.id"
            class="product-col"
          >
            <el-card class="product-card" :body-style="{ padding: '0px' }">
              <img :src="product.image" class="product-image" />
              <div class="product-info">
                <div class="product-header">
                  <h3>{{ product.name }}</h3>
                  <el-tag size="small" :type="product.tagType">{{ product.category }}</el-tag>
                </div>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-rating">
                  <el-rate v-model="product.rating" disabled show-score text-color="#ff9900" />
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
      </div>
    </section>

    <div class="pagination-section">
      <el-pagination
        v-if="filteredProducts.length > pageSize"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredProducts.length"
        layout="prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
      />
      <el-empty v-if="filteredProducts.length === 0" description="没有找到符合条件的产品" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { Search, ShoppingCart } from '@element-plus/icons-vue';
import debounce from 'lodash.debounce';

const route = useRoute();
const cartStore = useCartStore();

const selectedCategory = ref('');
const priceRange = ref('');
const searchKeyword = ref(route.query.search || '');
const currentPage = ref(1);
const pageSize = ref(8);

const allProducts = ref([
    { id: 'P001', name: '智能交互白板', price: 8999, originalPrice: 9999, rating: 4.8, sales: 156, image: '/hots/hot1.png', category: '多媒体设备', tagType: 'success', description: '支持多点触控，内置教学软件，提升课堂互动体验' },
    { id: 'P002', name: '教学一体机', price: 12999, originalPrice: 14999, rating: 4.9, sales: 89, image: '/hots/hot2.png', category: '教学设备', tagType: 'primary', description: '集投影、音响、电脑于一体的现代化教学设备' },
    { id: 'P003', name: '学生实验桌', price: 1299, originalPrice: 1599, rating: 4.7, sales: 234, image: '/hots/hot3.png', category: '实验设备', tagType: 'warning', description: '符合人体工程学设计，安全环保材质制造' },
    { id: 'P004', name: '多媒体讲台', price: 3599, originalPrice: 4299, rating: 4.6, sales: 67, image: '/hots/hot4.png', category: '教学设备', tagType: 'info', description: '集成多种教学设备控制功能的智能讲台' },
    { id: 'P101', name: '4K超高清教学一体机', price: 15999, rating: 4.9, image: '/newnew/new1.png', category: '教学设备', tagType: 'primary', description: '4K分辨率+120Hz刷新率，支持40点触控' },
    { id: 'P102', name: '便携式科学实验箱', price: 2499, rating: 4.7, image: '/newnew/new2.png', category: '实验设备', tagType: 'success', description: '包含200+实验器材，符合初中科学课程标准' },
    { id: 'P103', name: 'AI智能录播系统', price: 29999, rating: 4.8, image: '/newnew/new3.png', category: '多媒体设备', tagType: 'warning', description: '自动跟踪教师移动，智能聚焦板书内容' },
    { id: 'P104', name: '人体工学学生椅', price: 899, rating: 4.6, image: '/newnew/new4.png', category: '家具设备', tagType: 'info', description: '可调节高度与靠背角度，预防脊柱侧弯' },
]);

const filteredProducts = ref([...allProducts.value]);

const filterProducts = () => {
    let products = allProducts.value;
    if (selectedCategory.value) {
        products = products.filter(p => p.category === selectedCategory.value);
    }
    if (priceRange.value) {
        const [min, max] = priceRange.value.split('-').map(Number);
        products = products.filter(p => p.price >= min && p.price <= max);
    }
    if (searchKeyword.value) {
        products = products.filter(p => p.name.toLowerCase().includes(searchKeyword.value.toLowerCase()));
    }
    filteredProducts.value = products;
    currentPage.value = 1;
};

watch([selectedCategory, priceRange], filterProducts);
watch(searchKeyword, debounce(filterProducts, 300));

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = currentPage.value * pageSize.value;
    return filteredProducts.value.slice(start, end);
});

const handlePageChange = (page) => {
    currentPage.value = page;
    window.scrollTo({ top: 300, behavior: 'smooth' });
};

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  setTimeout(() => {
    document.querySelectorAll('.reveal-section').forEach(section => {
      observer.observe(section);
    });
  }, 100);
});
</script>

<style scoped>
.content-wrapper {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px 40px;
}

.pagination-section {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px 40px;
}

@media (max-width: 768px) {
  .content-wrapper,
  .pagination-section {
    padding-left: 15px;
    padding-right: 15px;
  }
}

.products-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}
.filter-area {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.products-grid {
  padding-top: 40px;
}

.product-col {
  margin-bottom: 40px;
}

.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}
.product-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
}
.product-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.product-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
  flex-grow: 1; 
  min-height: 50px;
}
.product-rating {
  margin-bottom: 15px;
}
.product-footer {
  margin-top: auto; 
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #F56C6C;
}
.buy-btn {
  background-color: #FFA500;
  border-color: #FFA500;
}
.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 15px;
}

.page-header p {
  font-size: 18px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 20px;
    margin-bottom: 40px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}
</style>