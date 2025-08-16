// 文件路径: src/stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios' // 引入axios
import { ElMessage } from 'element-plus'

// 定义从后端获取的购物车项的完整结构 (包含商品信息)
// 注意：这需要后端在查询购物车时，通过JOIN联查products表来提供
export interface CartItem {
  id: number; // 这是 cart_items 表的主键 id
  customerId: number;
  productId: string;
  quantity: number;
  // 以下是关联商品表的信息
  productName?: string;
  price?: number;
  imageUrl?: string;
}

export const useCartStore = defineStore('cart', () => {
  // state: 存放购物车商品的核心数据
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)

  // getters: 相当于计算属性
  const totalItemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.price || 0) * item.quantity, 0)
  })

  // actions: 方法
  /**
   * 从后端加载整个购物车
   */
  async function fetchCart() {
    isLoading.value = true
    try {
      // 注意：这里的响应数据结构需要和您后端ElResult的格式匹配
      const response = await axios.get('/api/cart')
      if (response.data && response.data.code === 0) {
        items.value = response.data.data
      }
    } catch (error) {
      ElMessage.error('加载购物车失败')
      console.error('加载购物车失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 添加商品到购物车
   * @param productId 商品ID
   * @param quantity 添加的数量
   */
  async function addItem(productId: string, quantity: number = 1) {
    try {
      await axios.post('/api/cart/items', { productId, quantity })
      ElMessage.success('添加成功！')
      // 操作成功后，重新获取整个购物车以保证数据绝对同步
      await fetchCart() 
    } catch (error) {
      ElMessage.error('添加商品失败')
      console.error('添加商品失败:', error)
    }
  }

  /**
   * 从购物车中删除一个项目
   * @param cartItemId 购物车项的ID (注意是cart_items.id, 不是product_id)
   */
  async function removeItem(cartItemId: number) {
    try {
      await axios.delete(`/api/cart/items/${cartItemId}`)
      await fetchCart()
    } catch (error) {
      ElMessage.error('删除商品失败')
      console.error('删除商品失败:', error)
    }
  }
  
  /**
   * 更新购物车中某个项目的数量
   * @param cartItemId 购物车项的ID
   * @param newQuantity 新的数量
   */
  async function updateQuantity(cartItemId: number, newQuantity: number) {
    if (newQuantity <= 0) {
      await removeItem(cartItemId);
      return;
    }
    try {
      await axios.put(`/api/cart/items/${cartItemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
       ElMessage.error('更新数量失败');
       console.error('更新数量失败:', error);
    }
  }

  return { 
    items, 
    isLoading, 
    totalItemCount, 
    totalPrice, 
    fetchCart, 
    addItem, 
    removeItem, 
    updateQuantity 
  }
})