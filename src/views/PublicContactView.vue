<template>
  <div class="contact">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>联系我们</h1>
      <p>我们随时为您提供专业的教育装备咨询服务</p>
    </div>

    <!-- 联系方式 -->
    <section class="contact-info">
      <el-row :gutter="30">
        <el-col :span="8">
          <el-card class="contact-card">
            <div class="contact-icon">
              <el-icon size="48" color="#409EFF"><Phone /></el-icon>
            </div>
            <h3>电话咨询</h3>
            <p class="contact-detail">400-888-9999</p>
            <p class="contact-desc">工作时间：周一至周五 9:00-18:00</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="contact-card">
            <div class="contact-icon">
              <el-icon size="48" color="#67C23A"><Message /></el-icon>
            </div>
            <h3>邮箱联系</h3>
            <p class="contact-detail">service@xuezitong.com</p>
            <p class="contact-desc">我们会在24小时内回复您的邮件</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="contact-card">
            <div class="contact-icon">
              <el-icon size="48" color="#E6A23C"><Location /></el-icon>
            </div>
            <h3>公司地址</h3>
            <p class="contact-detail">北京市海淀区中关村大街1号</p>
            <p class="contact-desc">欢迎您到公司实地考察</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 在线留言 -->
    <section class="message-form">
      <div class="section-header">
        <h2>在线留言</h2>
        <p>请填写以下信息，我们会尽快与您联系</p>
      </div>
      <el-row :gutter="40">
        <el-col :span="12">
          <el-form 
            ref="messageFormRef" 
            :model="messageForm" 
            :rules="messageRules" 
            label-width="100px"
            class="message-form-content"
          >
            <el-form-item label="姓名" prop="name">
              <el-input v-model="messageForm.name" placeholder="请输入您的姓名" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="messageForm.phone" placeholder="请输入您的联系电话" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="messageForm.email" placeholder="请输入您的邮箱地址" />
            </el-form-item>
            <el-form-item label="公司/学校" prop="company">
              <el-input v-model="messageForm.company" placeholder="请输入您的公司或学校名称" />
            </el-form-item>
            <el-form-item label="咨询类型" prop="type">
              <el-select v-model="messageForm.type" placeholder="请选择咨询类型" style="width: 100%">
                <el-option label="产品咨询" value="product"></el-option>
                <el-option label="价格咨询" value="price"></el-option>
                <el-option label="技术支持" value="support"></el-option>
                <el-option label="售后服务" value="service"></el-option>
                <el-option label="合作洽谈" value="cooperation"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="留言内容" prop="message">
              <el-input 
                v-model="messageForm.message" 
                type="textarea" 
                :rows="5"
                placeholder="请详细描述您的需求或问题"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitMessage" :loading="submitting">
                提交留言
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <div class="contact-image">
            <img src="/src/assets/home/banner2.jpg" alt="联系我们" />
            <div class="contact-tips">
              <h3>为什么选择我们？</h3>
              <ul>
                <li>✓ 8年行业经验，专业可靠</li>
                <li>✓ 3000+学校的信赖选择</li>
                <li>✓ 完善的售后服务体系</li>
                <li>✓ 一站式教育装备解决方案</li>
                <li>✓ 国家认证的高品质产品</li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 服务网点 -->
    <section class="service-network">
      <div class="section-header">
        <h2>服务网点</h2>
        <p>我们在全国主要城市设有服务网点，为您提供就近服务</p>
      </div>
      <el-row :gutter="20">
        <el-col :span="6" v-for="office in offices" :key="office.id">
          <el-card class="office-card">
            <h4>{{ office.city }}</h4>
            <p class="office-address">{{ office.address }}</p>
            <p class="office-phone">电话：{{ office.phone }}</p>
            <p class="office-manager">负责人：{{ office.manager }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 常见问题 -->
    <section class="faq-section">
      <div class="section-header">
        <h2>常见问题</h2>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item 
          v-for="faq in faqs" 
          :key="faq.id" 
          :title="faq.question" 
          :name="faq.id"
        >
          <div>{{ faq.answer }}</div>
        </el-collapse-item>
      </el-collapse>
    </section>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { Phone, Message, Location } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Contact',
  components: {
    Phone,
    Message,
    Location
  },
  setup() {
    const messageFormRef = ref()
    const submitting = ref(false)
    const activeNames = ref(['1'])

    const messageForm = reactive({
      name: '',
      phone: '',
      email: '',
      company: '',
      type: '',
      message: ''
    })

    const messageRules = {
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      company: [
        { required: true, message: '请输入公司或学校名称', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择咨询类型', trigger: 'change' }
      ],
      message: [
        { required: true, message: '请输入留言内容', trigger: 'blur' },
        { min: 10, message: '留言内容至少10个字符', trigger: 'blur' }
      ]
    }

    const offices = ref([
      {
        id: 1,
        city: '北京办事处',
        address: '海淀区中关村大街1号',
        phone: '010-88888888',
        manager: '张经理'
      },
      {
        id: 2,
        city: '上海办事处',
        address: '浦东新区陆家嘴金融区',
        phone: '021-66666666',
        manager: '李经理'
      },
      {
        id: 3,
        city: '广州办事处',
        address: '天河区珠江新城CBD',
        phone: '020-77777777',
        manager: '王经理'
      },
      {
        id: 4,
        city: '深圳办事处',
        address: '南山区科技园高新区',
        phone: '0755-99999999',
        manager: '刘经理'
      }
    ])

    const faqs = ref([
      {
        id: '1',
        question: '如何选择适合的教育装备？',
        answer: '我们会根据您的具体需求、预算和使用场景，为您推荐最适合的产品。您可以通过电话或在线咨询的方式联系我们的专业顾问。'
      },
      {
        id: '2',
        question: '产品质量如何保证？',
        answer: '我们所有产品均通过国家相关质量认证，提供正规发票和质保服务。产品质量问题可享受免费维修或更换服务。'
      },
      {
        id: '3',
        question: '是否提供安装和培训服务？',
        answer: '是的，我们提供专业的安装调试服务和使用培训。大型设备我们会派遣技术人员上门安装，并对使用人员进行操作培训。'
      },
      {
        id: '4',
        question: '售后服务如何？',
        answer: '我们提供7x24小时客服支持，产品享有1-3年不等的质保期。质保期内免费维修，质保期外提供有偿维修服务。'
      },
      {
        id: '5',
        question: '可以提供定制化解决方案吗？',
        answer: '可以的。我们有专业的技术团队，可以根据您的特殊需求提供定制化的教育装备解决方案。'
      }
    ])

    const submitMessage = async () => {
      if (!messageFormRef.value) return
      
      try {
        await messageFormRef.value.validate()
        submitting.value = true
        
        // 模拟提交请求
        setTimeout(() => {
          ElMessage.success('留言提交成功！我们会尽快与您联系。')
          resetForm()
          submitting.value = false
        }, 2000)
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }

    const resetForm = () => {
      if (messageFormRef.value) {
        messageFormRef.value.resetFields()
      }
    }

    return {
      messageFormRef,
      messageForm,
      messageRules,
      submitting,
      activeNames,
      offices,
      faqs,
      submitMessage,
      resetForm,
      Phone,
      Message,
      Location
    }
  }
}
</script>

<style scoped>
.contact {
  min-height: 100vh;
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

.contact-info, .message-form, .service-network, .faq-section {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.contact-info {
  background: white;
}

.contact-card {
  text-align: center;
  padding: 40px 20px;
  height: 100%;
  transition: transform 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
}

.contact-icon {
  margin-bottom: 20px;
}

.contact-card h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.contact-detail {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.contact-desc {
  font-size: 14px;
  color: #666;
}

.message-form {
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 32px;
  margin-bottom: 15px;
  color: #333;
}

.section-header p {
  font-size: 16px;
  color: #666;
}

.message-form-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contact-image {
  position: relative;
}

.contact-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.contact-tips {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.contact-tips h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.contact-tips ul {
  list-style: none;
  padding: 0;
}

.contact-tips li {
  padding: 8px 0;
  color: #666;
  font-size: 14px;
}

.service-network {
  background: white;
}

.office-card {
  text-align: center;
  padding: 30px 20px;
  height: 100%;
}

.office-card h4 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.office-address {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.office-phone, .office-manager {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.faq-section {
  background: #f8f9fa;
}

.faq-section .el-collapse {
  border: none;
}

.faq-section .el-collapse-item {
  margin-bottom: 10px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 20px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .contact-info, .message-form, .service-network, .faq-section {
    padding: 40px 15px;
  }
  
  .message-form-content {
    padding: 20px;
  }
  
  .contact-image {
    margin-top: 30px;
  }
}
</style>

