<template>
  <div class="register-page">
    <div class="page-header">
      <h1>创建新账户</h1>
      <p>加入我们，开启您的教育装备采购之旅</p>
    </div>

    <section class="register-form-section">
      <el-row justify="center">
        <el-col :xs="24" :sm="16" :md="12" :lg="8">
          <el-form 
            ref="registerFormRef" 
            :model="registerForm" 
            :rules="registerRules" 
            label-position="top"
            class="register-form"
            @submit.prevent="submitRegister"
          >
            <el-form-item label="用户名" prop="customerName">
              <el-input v-model="registerForm.customerName" placeholder="请输入您的用户名" size="large" />
            </el-form-item>
            <el-form-item label="手机号" prop="customerPhone">
              <el-input v-model="registerForm.customerPhone" placeholder="将作为您的登录账号" size="large" />
            </el-form-item>
            <el-form-item label="邮箱" prop="customerEmail">
              <el-input v-model="registerForm.customerEmail" placeholder="请输入您的邮箱" size="large" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码" size="large" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" size="large" />
            </el-form-item>
            <el-form-item>
              <el-button native-type="submit" type="primary" :loading="submitting" size="large" style="width: 100%;">
                立即注册
              </el-button>
            </el-form-item>
            <div class="login-link">
              已有账户？ <el-link type="primary" @click="$router.push('/')">返回首页登录</el-link>
            </div>
          </el-form>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const registerFormRef = ref<FormInstance>();
const submitting = ref(false);

const registerForm = reactive({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  password: '',
  confirmPassword: ''
});

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules = reactive<FormRules>({
  customerName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  customerPhone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  customerEmail: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validatePass, trigger: 'blur' }],
});

const submitRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      axios.post('http://localhost:8080/customer/add', {
        customerName: registerForm.customerName,
        customerPhone: registerForm.customerPhone,
        customerEmail: registerForm.customerEmail,
        password: registerForm.password,
        registrationDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success('注册成功！即将跳转到首页进行登录...');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          ElMessage.error(res.data.msg || '注册失败');
        }
      }).catch(err => {
        ElMessage.error('注册请求失败，请稍后重试');
      }).finally(() => {
        submitting.value = false;
      });
    }
  });
};
</script>

<style scoped>
.register-page { background-color: #f8f9fa; padding-bottom: 50px; }
.page-header {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.page-header h1 { font-size: 36px; margin-bottom: 15px; }
.page-header p { font-size: 18px; opacity: 0.9; }

.register-form-section {
  max-width: 800px;
  margin: -40px auto 0;
  position: relative;
  z-index: 2;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
}
.register-form { padding: 20px; }
.login-link { text-align: center; margin-top: 20px; }
</style>
