<template>
  <div class="user-profile-container">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      <div v-if="loading" class="loading-spinner">
        <el-spinner size="large"></el-spinner>
      </div>
      <el-form 
        v-else-if="form.customerId"
        :model="form" 
        ref="ruleFormRef" 
        :rules="rules" 
        label-width="120px"
        class="profile-form"
      >
        <el-form-item label="客户ID">
          <el-input v-model="form.customerId" disabled />
        </el-form-item>
        <el-form-item label="用户名" prop="customerName">
          <el-input v-model="form.customerName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="customerPhone">
          <el-input v-model="form.customerPhone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="customerEmail">
          <el-input v-model="form.customerEmail" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="留空则不修改密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword" v-if="form.password">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
        <el-form-item label="性别" prop="customerGender">
           <el-select v-model="form.customerGender" placeholder="请选择性别">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
            <el-option label="未知" value="未知"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="customerBirthday">
          <el-date-picker v-model="form.customerBirthday" type="date" placeholder="选择生日" style="width: 100%;" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="地址" prop="customerAddress">
          <el-input v-model="form.customerAddress" />
        </el-form-item>
        <el-form-item label="客户等级">
          <el-input v-model="form.customerLevel" disabled />
        </el-form-item>
         <el-form-item label="注册时间">
          <el-input v-model="form.registrationDate" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">保存修改</el-button>
        </el-form-item>
      </el-form>
      <el-empty v-else description="未能加载用户信息，请先登录" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import type { FormInstance, FormRules } from 'element-plus';

interface Customer {
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  password?: string;
  customerGender: string;
  customerBirthday: string;
  customerAddress: string;
  customerLevel: string;
  registrationDate: string;
}
interface CustomerForm extends Customer {
  confirmPassword?: string;
}
interface ApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

const router = useRouter();
const ruleFormRef = ref<FormInstance>();
const loading = ref(true);
const form = ref<Partial<CustomerForm>>({});

const validatePass = (rule: any, value: any, callback: any) => {
  if (form.value.password && value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.value.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  customerName: [{ required: true, message: "客户名称不能为空", trigger: "blur" }],
  customerPhone: [{ required: true, message: "联系方式不能为空", trigger: "blur" }],
  confirmPassword: [{ validator: validatePass, trigger: 'blur' }],
});

const getUserData = async () => {
  const customerId = localStorage.getItem('customerId');
  if (!customerId) {
    ElMessage.error('您尚未登录，请先登录');
    loading.value = false;
    return;
  }

  try {
    const res = await axios.get<ApiResponse>(`http://localhost:8080/customer/detail/${customerId}`);
    if (res.data.code === 0 && res.data.data.length > 0) {
      form.value = { ...res.data.data[0], password: '', confirmPassword: '' };
    } else {
      ElMessage.error(res.data.msg || '获取用户信息失败');
    }
  } catch (error) {
    ElMessage.error('请求用户信息失败');
  } finally {
    loading.value = false;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();

  const payload = { ...form.value };
  delete payload.confirmPassword;
  if (!payload.password) {
      delete payload.password;
  }

  try {
    const res = await axios.post<ApiResponse>("http://localhost:8080/customer/update", payload);
    if (res.data.code === 0) {
      ElMessage.success("信息更新成功！");
      getUserData();
    } else {
      ElMessage.error(res.data.msg || "更新失败");
    }
  } catch (error) {
    ElMessage.error("请求失败，请稍后重试");
  }
};

onMounted(() => {
  getUserData();
});
</script>

<style scoped>
.user-profile-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.profile-card {
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
}
.card-header {
  font-size: 20px;
  font-weight: bold;
}
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
.profile-form {
  padding: 20px;
}
</style>
