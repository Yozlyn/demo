// src/stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 定义一个商品类型 (如果是TypeScript)
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  // state: 存放购物车商品的核心数据
  const items = ref<Product[]>([])

  // getters: 相当于计算属性，方便我们获取一些衍生状态
  // 购物车商品总数
  const totalItemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })
  // 购物车总价
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  // actions: 用于修改 state 的方法
  // 添加商品到购物车
  function addItem(productToAdd) {
    const existingItem = items.value.find(item => item.id === productToAdd.id)
    if (existingItem) {
      existingItem.quantity++
      ElMessage.success(`${productToAdd.name} 数量+1`)
    } else {
      items.value.push({ ...productToAdd, quantity: 1 })
      ElMessage.success(`已将 ${productToAdd.name} 加入购物车`)
    }
  }

  // 从购物车移除商品
  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId)
  }

  // 更新商品数量
  function updateQuantity(productId, newQuantity) {
    const itemToUpdate = items.value.find(item => item.id === productId)
    if (itemToUpdate) {
      if (newQuantity > 0) {
        itemToUpdate.quantity = newQuantity
      } else {
        removeItem(productId) // 如果数量减到0，就直接移除
      }
    }
  }

  return { items, totalItemCount, totalPrice, addItem, removeItem, updateQuantity }
})