<template>
  <div class="products">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>教育装备产品</h1>
      <p>为教育机构提供全方位的教学设备解决方案</p>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="selectedCategory" placeholder="选择分类" @change="filterProducts">
            <el-option label="全部分类" value=""></el-option>
            <el-option label="多媒体设备" value="多媒体设备"></el-option>
            <el-option label="教学设备" value="教学设备"></el-option>
            <el-option label="实验设备" value="实验设备"></el-option>
            <el-option label="家具设备" value="家具设备"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="priceRange" placeholder="价格范围" @change="filterProducts">
            <el-option label="全部价格" value=""></el-option>
            <el-option label="1000元以下" value="0-1000"></el-option>
            <el-option label="1000-5000元" value="1000-5000"></el-option>
            <el-option label="5000-10000元" value="5000-10000"></el-option>
            <el-option label="10000元以上" value="10000-999999"></el-option>
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-input v-model="searchKeyword" placeholder="搜索产品名称..." @input="filterProducts">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <!-- 产品列表 -->
    <div class="products-grid">
      <el-row :gutter="20">
        <el-col :span="6" v-for="product in filteredProducts" :key="product.id">
          <el-card class="product-card" :body-style="{ padding: '0px' }">
            <img :src="product.image" class="product-image" />
            <div class="product-info">
              <div class="product-header">
                <h3>{{ product.name }}</h3>
                <el-tag size="small" :type="product.tagType">{{ product.category }}</el-tag>
              </div>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-specs">
                <div class="spec-item" v-for="spec in product.specs" :key="spec.name">
                  <span class="spec-name">{{ spec.name }}:</span>
                  <span class="spec-value">{{ spec.value }}</span>
                </div>
              </div>
              <div class="product-rating">
                <el-rate v-model="product.rating" disabled show-score />
                <span class="sales-count">(已售{{ product.sales }}件)</span>
              </div>
              <div class="product-footer">
                <div class="price-info">
                  <span class="product-price">¥{{ product.price.toLocaleString() }}</span>
                  <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice.toLocaleString() }}</span>
                </div>
                <div class="action-buttons">
                  <el-button type="primary" size="small" :icon="ShoppingCart">
                    加入购物车
                  </el-button>
                  <el-button type="success" size="small">
                    立即购买
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalProducts"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Search, ShoppingCart } from '@element-plus/icons-vue'

export default {
  name: 'Products',
  components: {
    Search,
    ShoppingCart
  },
  setup() {
    const selectedCategory = ref('')
    const priceRange = ref('')
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(12)

    const allProducts = ref([
      {
        id: 1,
        name: '智能交互白板',
        price: 8999,
        originalPrice: 9999,
        rating: 4.8,
        sales: 156,
        image: '/src/assets/home/product1.webp',
        category: '多媒体设备',
        tagType: 'success',
        description: '支持多点触控，内置教学软件，提升课堂互动体验',
        specs: [
          { name: '尺寸', value: '86英寸' },
          { name: '分辨率', value: '4K超高清' },
          { name: '触控点数', value: '20点触控' }
        ]
      },
      {
        id: 2,
        name: '教学一体机',
        price: 12999,
        originalPrice: 14999,
        rating: 4.9,
        sales: 89,
        image: '/src/assets/home/product2.jpg',
        category: '教学设备',
        tagType: 'primary',
        description: '集投影、音响、电脑于一体的现代化教学设备',
        specs: [
          { name: '投影亮度', value: '4000流明' },
          { name: '处理器', value: 'Intel i5' },
          { name: '内存', value: '8GB DDR4' }
        ]
      },
      {
        id: 3,
        name: '学生实验桌',
        price: 1299,
        originalPrice: 1599,
        rating: 4.7,
        sales: 234,
        image: '/src/assets/home/product1.webp',
        category: '实验设备',
        tagType: 'warning',
        description: '符合人体工程学设计，安全环保材质制造',
        specs: [
          { name: '材质', value: '实木+钢架' },
          { name: '尺寸', value: '120x60x75cm' },
          { name: '承重', value: '≤100kg' }
        ]
      },
      {
        id: 4,
        name: '多媒体讲台',
        price: 3599,
        originalPrice: 4299,
        rating: 4.6,
        sales: 67,
        image: '/src/assets/home/product2.jpg',
        category: '教学设备',
        tagType: 'info',
        description: '集成多种教学设备控制功能的智能讲台',
        specs: [
          { name: '材质', value: '钢木结构' },
          { name: '功能', value: '设备集成控制' },
          { name: '尺寸', value: '120x60x110cm' }
        ]
      },
      {
        id: 5,
        name: '科学实验套装',
        price: 899,
        originalPrice: 1199,
        rating: 4.8,
        sales: 345,
        image: '/src/assets/home/product1.webp',
        category: '实验设备',
        tagType: 'success',
        description: '涵盖物理、化学、生物等多学科实验器材',
        specs: [
          { name: '套装内容', value: '200+实验器材' },
          { name: '适用年级', value: '小学-高中' },
          { name: '学科', value: '理化生' }
        ]
      },
      {
        id: 6,
        name: '录播教室系统',
        price: 25999,
        originalPrice: 29999,
        rating: 4.9,
        sales: 23,
        image: '/src/assets/home/product2.jpg',
        category: '多媒体设备',
        tagType: 'danger',
        description: '自动跟踪录制，支持远程教学和课程回放',
        specs: [
          { name: '录制格式', value: '1080P高清' },
          { name: '存储容量', value: '2TB' },
          { name: '网络功能', value: '支持直播推流' }
        ]
      },
      {
        id: 7,
        name: '学生课桌椅',
        price: 299,
        originalPrice: 399,
        rating: 4.5,
        sales: 567,
        image: '/src/assets/home/product1.webp',
        category: '家具设备',
        tagType: 'primary',
        description: '可调节高度，符合学生身体发育需求',
        specs: [
          { name: '材质', value: 'ABS+钢管' },
          { name: '高度调节', value: '6档可调' },
          { name: '承重', value: '≤80kg' }
        ]
      },
      {
        id: 8,
        name: '图书管理系统',
        price: 15999,
        originalPrice: 18999,
        rating: 4.7,
        sales: 45,
        image: '/src/assets/home/product2.jpg',
        category: '管理系统',
        tagType: 'warning',
        description: '智能化图书借阅管理，提高图书馆运营效率',
        specs: [
          { name: '支持图书', value: '10万册' },
          { name: '用户数量', value: '5000人' },
          { name: '功能模块', value: '借还、查询、统计' }
        ]
      }
    ])

    const filteredProducts = computed(() => {
      let products = allProducts.value

      // 分类筛选
      if (selectedCategory.value) {
        products = products.filter(p => p.category === selectedCategory.value)
      }

      // 价格筛选
      if (priceRange.value) {
        const [min, max] = priceRange.value.split('-').map(Number)
        products = products.filter(p => p.price >= min && p.price <= max)
      }

      // 关键词搜索
      if (searchKeyword.value) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          p.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
      }

      return products
    })

    const totalProducts = computed(() => filteredProducts.value.length)

    const filterProducts = () => {
      currentPage.value = 1
    }

    const handlePageChange = (page) => {
      currentPage.value = page
    }

    return {
      selectedCategory,
      priceRange,
      searchKeyword,
      currentPage,
      pageSize,
      allProducts,
      filteredProducts,
      totalProducts,
      filterProducts,
      handlePageChange,
      Search,
      ShoppingCart
    }
  }
}
</script>

<style scoped>
.products {
  min-height: 100vh;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 15px;
}

.page-header p {
  font-size: 18px;
  opacity: 0.9;
}

.filter-section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.products-grid {
  margin-bottom: 40px;
}

.product-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 200px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.product-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
  flex-grow: 1;
}

.product-specs {
  margin-bottom: 15px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 5px;
}

.spec-name {
  color: #999;
}

.spec-value {
  color: #333;
  font-weight: 500;
}

.product-rating {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sales-count {
  font-size: 12px;
  color: #999;
}

.product-footer {
  margin-top: auto;
}

.price-info {
  margin-bottom: 15px;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-right: 10px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons .el-button {
  flex: 1;
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .products {
    padding: 15px;
  }
  
  .page-header {
    padding: 20px 0;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .filter-section .el-row {
    flex-direction: column;
  }
  
  .filter-section .el-col {
    margin-bottom: 15px;
  }
}
</style>

