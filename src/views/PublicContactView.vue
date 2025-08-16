<template>
  <div class="contact-page">
    <div class="page-header">
      <h1>联系我们</h1>
      <p>我们随时为您提供专业的教育装备咨询服务</p>
    </div>

    <section class="contact-info acrylic-section reveal-section">
      <div class="section-header">
        <h2>联系方式</h2>
        <div class="section-divider"></div>
      </div>
      <el-row :gutter="30">
        <el-col :span="8">
          <div class="contact-card">
            <div class="contact-icon"><el-icon size="48"><Phone /></el-icon></div>
            <h3>电话咨询</h3>
            <p class="contact-detail">400-888-9999</p>
            <p class="contact-desc">工作时间：周一至周五 9:00-18:00</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="contact-card">
            <div class="contact-icon"><el-icon size="48"><Message /></el-icon></div>
            <h3>邮箱联系</h3>
            <p class="contact-detail">service@xuezitong.com</p>
            <p class="contact-desc">我们会在24小时内回复您的邮件</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="contact-card">
            <div class="contact-icon"><el-icon size="48"><Location /></el-icon></div>
            <h3>公司地址</h3>
            <p class="contact-detail">北京市海淀区中关村大街1号</p>
            <p class="contact-desc">欢迎您到公司实地考察</p>
          </div>
        </el-col>
      </el-row>
    </section>

    <section class="message-form acrylic-section reveal-section">
        <div class="section-header">
        <h2>在线留言</h2>
        <p>请填写以下信息，我们会尽快与您联系</p>
        <div class="section-divider"></div>
      </div>
      <el-row :gutter="40" justify="center">
        <el-col :span="16">
          <el-form 
            ref="messageFormRef" 
            :model="messageForm" 
            :rules="messageRules" 
            label-position="top"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="您的姓名" prop="name">
                  <el-input v-model="messageForm.name" placeholder="请输入您的姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="messageForm.phone" placeholder="请输入您的联系电话" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="公司/学校" prop="company">
              <el-input v-model="messageForm.company" placeholder="请输入您的公司或学校名称" />
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
              <el-button type="primary" @click="submitMessage" :loading="submitting" size="large">
                提交留言
              </el-button>
              <el-button @click="resetForm" size="large">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </section>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Phone, Message, Location } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const messageFormRef = ref();
const submitting = ref(false);
const messageForm = reactive({ name: '', phone: '', company: '', message: '' });
const messageRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司或学校名称', trigger: 'blur' }],
  message: [{ required: true, message: '请输入留言内容', trigger: 'blur' }],
};

const submitMessage = async () => {
  if (!messageFormRef.value) return;
  await messageFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      setTimeout(() => {
        ElMessage.success('留言提交成功！我们会尽快与您联系。');
        resetForm();
        submitting.value = false;
      }, 1500);
    }
  });
};
const resetForm = () => {
  if (messageFormRef.value) {
    messageFormRef.value.resetFields();
  }
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
/* --- 【变更点2】新增的布局样式 --- */
.contact-page .acrylic-section {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50px;
  padding: 60px 40px; /* 恢复内边距 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .contact-page .acrylic-section {
    padding-left: 15px;
    padding-right: 15px;
  }
}
/* --- 以上是新增样式 --- */


.contact-page { background-color: #f8f9fa; padding-bottom: 30px; } /* 添加 padding-bottom 防止底部内容紧贴 */
.contact-card { text-align: center; }
.contact-icon { margin-bottom: 20px; color: #409eff; }
.contact-card h3 { font-size: 1.5rem; margin-bottom: 15px; color: #333; }
.contact-detail { font-size: 1.1rem; font-weight: 500; color: #333; margin-bottom: 10px; }
.contact-desc { font-size: 0.9rem; color: #666; }
.el-form-item { margin-bottom: 25px; }
.el-button--primary { background-color: #FFA500; border-color: #FFA500;}
/* --- 页面头部样式 --- */
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