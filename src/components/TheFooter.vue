<template>
  <footer class="footer">
    <div class="footer-content">
      <el-row :gutter="40">
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <h3>学子通教育装备商城</h3>
          <p>专业的教育装备供应商，为教育现代化提供优质产品和服务。</p>
          <div class="subscribe-box">
            <el-input
              v-model="subscribeEmail"
              placeholder="输入邮箱订阅资讯"
              class="subscribe-input"
            />
            <el-button type="primary" size="small" class="subscribe-btn" @click="handleSubscribe">
              订阅
            </el-button>
          </div>
          <div class="social-links">
            <el-button circle :icon="ChatDotRound" />
            <el-button circle :icon="Message" />
            <el-button circle :icon="Phone" />
          </div>
        </el-col>
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <h4>产品分类</h4>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="navigateTo('/products', { category: '多媒体设备' })">多媒体设备</a></li>
            <li><a href="#" @click.prevent="navigateTo('/products', { category: '教学设备' })">教学设备</a></li>
            <li><a href="#" @click.prevent="navigateTo('/products', { category: '实验设备' })">实验设备</a></li>
            <li><a href="#" @click.prevent="navigateTo('/products', { category: '家具设备' })">家具设备</a></li>
          </ul>
        </el-col>
        <el-col :span="6" :xs="24" :sm="12" :md="6">
          <h4>关于我们</h4>
          <ul class="footer-links">
            <li><a href="#" @click.prevent="navigateTo('/about')">公司简介</a></li>
            <li><a href="#" @click.prevent="navigateTo('/contact')">联系我们</a></li>
            <li><a href="#" @click.prevent="showHelp">帮助中心</a></li>
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
        <p>京ICP备1145141919号 | 京公网安备1145141919810号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Phone, Message, Location, ChatDotRound } from '@element-plus/icons-vue';

const router = useRouter();
const subscribeEmail = ref('');

const navigateTo = (path, query) => {
  router.push({ path, query });
};

const handleSubscribe = () => {
  if (subscribeEmail.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscribeEmail.value)) {
    ElMessage.success('订阅成功，感谢您的关注！');
    subscribeEmail.value = '';
  } else {
    ElMessage.error('请输入有效的邮箱地址');
  }
};

const showHelp = () => ElMessage.info('正在跳转到帮助中心...');
</script>

<style scoped>
.footer {
  background-color: #333;
  color: white;
  padding: 60px 0;
  border-top: 4px solid #409eff;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.footer h3, .footer h4 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #ffffff;
}

.footer p {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
}

.subscribe-box {
  display: flex;
  margin: 20px 0;
  gap: 10px;
}

.subscribe-input {
  flex-grow: 1;
}

/* Element Plus input style override for dark background */
.subscribe-input :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}
.subscribe-input :deep(.el-input__inner) {
  color: white;
}
.subscribe-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.subscribe-btn {
  white-space: nowrap;
}

.social-links {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #409eff;
}

.contact-info p {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.contact-info .el-icon {
  margin-right: 10px;
  font-size: 16px;
}

.footer .el-divider {
  background-color: rgba(255, 255, 255, 0.2);
}

.footer-bottom {
  text-align: center;
  margin-top: 30px;
  padding-top: 30px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}
</style>