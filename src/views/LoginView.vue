<template>
  <div 
    class="login-container" 
    :style="{ backgroundImage: `url(${randomWallpaper})`, backgroundPosition: `${bgX}px ${bgY}px` }"
    @mousemove="handleMouseMove"
  >
    <!-- 花瓣容器 -->
    <div class="petals-container" ref="petalsContainer"></div>
    
    <!-- 登录卡片 -->
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <h2 class="login-title">学子通教育装备商城管理系统</h2>
        <p class="login-desc">请输入账号信息</p>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
        label-position="left"
        label-width="70px"
        @submit.prevent="handleLogin"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="suName">
          <el-input 
            v-model="loginForm.suName" 
            placeholder="请输入用户名" 
            prefix-icon="User"
            :maxlength="20"
            clearable
            autofocus
          />
        </el-form-item>
        
        <!-- 密码 -->
        <el-form-item label="密码" prop="suPwd">
          <el-input 
            v-model="loginForm.suPwd" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock"
            :show-password="showPassword"
            @click:password="showPassword = !showPassword"
            :maxlength="20"
          />
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item 
          v-if="!rememberMe || !hasSavedPassword" 
          label="验证码" 
          prop="captcha"
        >
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              class="captcha-input"
              :maxlength="4"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <span>{{ captchaText }}</span>
            </div>
          </div>
        </el-form-item>
        
        <!-- 记住密码和忘记密码 -->
        <el-form-item class="form-actions">
          <el-checkbox v-model="rememberMe" size="small">记住密码</el-checkbox>
          <el-link type="primary" underline="never" class="forgot-password" @click="handleForgotPassword">
            忘记密码?
          </el-link>
        </el-form-item>
        
        <!-- 登录按钮 -->
        <el-form-item class="login-btn-group">
          <el-button 
            type="primary" 
            class="login-btn" 
            native-type="submit"
            :loading="loginLoading"
          >
            登录
          </el-button>
        </el-form-item>
        
        <!-- 其他登录方式 -->
        <div class="other-login">
          <div class="line"></div>
          <span class="other-login-text">其他登录方式</span>
          <div class="line"></div>
        </div>
        
        <div class="social-login">
          <el-button circle size="large" type="success" @click="handleSocialLogin('wechat')">
            <svg t="1753868751557" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7010" width="24" height="24" fill="currentColor">
              <path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z" p-id="7011"></path>
            </svg>
          </el-button>
          <el-button circle size="large" type="default" @click="handleSocialLogin('QQ')">
            <svg t="1753868771769" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7980" width="24" height="24" fill="currentColor">
              <path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" p-id="7981"></path>
            </svg>
          </el-button>
        </div>
      </el-form>
    </el-card>
    
    <!-- 页脚信息 -->
    <div class="login-footer">
      <p>© 2025 Y2024web Company. All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElCheckbox, ElLink, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from "axios";
import CryptoJS from 'crypto-js';

// 导入所有壁纸图片
const wallpapers = import.meta.glob('@/assets/wallpapers/*.{jpg,png,jpeg}', { eager: true });

// 提取图片路径数组
const wallpaperPaths = Object.values(wallpapers).map((module: any) => module.default);

// 随机选择一张图片
const randomWallpaper = wallpaperPaths.length 
  ? wallpaperPaths[Math.floor(Math.random() * wallpaperPaths.length)]
  : '';

// 视差效果相关
const bgX = ref(0);
const bgY = ref(0);
const parallaxFactor = 20;

const handleMouseMove = (e: MouseEvent) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const mouseX = (e.clientX / windowWidth) - 0.5;
  const mouseY = (e.clientY / windowHeight) - 0.5;
  bgX.value = mouseX * parallaxFactor;
  bgY.value = mouseY * parallaxFactor;
};

// 登录表单类型定义
interface LoginForm {
  suName: string;
  suPwd: string;
  captcha: string;
}

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm> | null>(null);

// 登录表单数据
const loginForm = reactive<LoginForm>({
  suName: '',
  suPwd: '',
  captcha: ''
});

// 验证码相关
const captchaText = ref<string>('1234');

// 状态变量
const showPassword = ref<boolean>(false);
const rememberMe = ref<boolean>(false);
const loginLoading = ref<boolean>(false);
const hasSavedPassword = ref<boolean>(false);

// 路由实例
const router = useRouter();

// 表单验证规则
const loginRules = {
  suName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  suPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 20, message: '密码长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为4个字符', trigger: 'blur' }
  ]
};

// 加密密码
const encryptPassword = (password: string, key: string) => {
  return CryptoJS.AES.encrypt(password, key).toString();
};

// 解密密码
const decryptPassword = (encryptedPassword: string, key: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('解密失败:', error);
    return '';
  }
};

// 刷新验证码
const refreshCaptcha = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  captchaText.value = result;
};

// 处理登录
const handleLogin = async (event?: Event) => {
  if (loginLoading.value) return;
  if (!loginFormRef.value) return;
  
  try {
    let validateFields = ['suName', 'suPwd'];
    if (!rememberMe.value || !hasSavedPassword.value) {
      validateFields.push('captcha');
    }
    
    await loginFormRef.value.validateField(validateFields);
    
    loginLoading.value = true;
    
    const loginParams: Partial<LoginForm> = {
      suName: loginForm.suName,
      suPwd: loginForm.suPwd
    };
    
    if (!rememberMe.value || !hasSavedPassword.value) {
      loginParams.captcha = loginForm.captcha;
      if (loginParams.captcha.toUpperCase() !== captchaText.value) {
        ElMessage.error('验证码不正确');
        loginLoading.value = false;
        refreshCaptcha();
        return;
      }
    }
    
    axios({
      method: "get",
      url: "http://localhost:8080/sysUser/login",
      params: loginParams
    }).then((res) => {
      if (res.data.code == 0) {
        ElMessage.success('登录成功');
        localStorage.setItem('suName', res.data.data[0].suName);
        localStorage.setItem('suId', res.data.data[0].suId);
        localStorage.setItem('suRole', res.data.data[0].suRole);
        
        if (rememberMe.value) {
          localStorage.setItem('username', loginForm.suName);
          // 加密密码，使用用户名作为密钥（可加盐）
          const encryptedPwd = encryptPassword(loginForm.suPwd, loginForm.suName + '_salt');
          localStorage.setItem('encryptedPassword', encryptedPwd);
          hasSavedPassword.value = true;
        } else {
          localStorage.removeItem('username');
          localStorage.removeItem('encryptedPassword');
          hasSavedPassword.value = false;
        }
        
        router.push('/admin');
      } else {
        ElMessage.error('登录失败: ' + (res.data.msg || '用户名或密码错误'));
        if (!rememberMe.value || !hasSavedPassword.value) {
          refreshCaptcha();
        }
      }
    }).catch(error => {
      console.error('登录请求失败:', error);
      ElMessage.error('登录请求失败，请稍后重试');
      if (!rememberMe.value || !hasSavedPassword.value) {
        refreshCaptcha();
      }
    }).finally(() => {
      loginLoading.value = false;
    });
  } catch (error) {
    console.error('表单验证失败:', error);
    loginLoading.value = false;
    return;
  }
};

// 处理忘记密码
const handleForgotPassword = () => {
  ElMessage.info('即将跳转到密码重置页面');
};

// 社交登录
const handleSocialLogin = (type: string) => {
  if (type === 'wechat') {
    window.location.href = 'https://wx.qq.com/';
  } else if (type === 'QQ') {
    window.location.href = 'https://ti.qq.com/qqlevel/index';
  }
};

// 花瓣飘落效果
const petalsContainer = ref<HTMLDivElement | null>(null);
let animationFrameId: number;
let petals: HTMLDivElement[] = [];
const totalPetals = 30;

const createPetal = () => {
  const petal = document.createElement('div');
  petal.className = 'petal';
  const petalSvg = `
    <svg t="1753879677902" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5228" width="${Math.random() * 40 + 30}" height="${Math.random() * 40 + 30}">
      <path d="M501.7 643.8c-7.5 1.4-52.9 45-67.8 38.6-13.1-5 7.5-50.4-3.7-65.4-11.2-15-97.2 0.5-129.5 15.5-31.8 15-83.7 55.9-101.9 110.4-17.7 53.6-15.9 111.8 15.9 137.7 31.8 26.4 78.5 2.7 78.5 2.7s0.4 65 43.5 74.1c42.1 9.1 125.7-13.2 167.3-77.3 41.6-63.6 30.9-165 23.4-198.1-7.9-33.7-18.2-39.6-25.7-38.2z m371.2-19.1c-53.8-44.6-222.5-79.5-247.8-62.7-25.7 17.2 15.4 58.6 2.3 65.4-12.2 7.3-44.9-27.7-57.5-23.2-12.1 5-29.9 103.2-6.1 163.6 23.9 60.9 113.6 153.2 174.4 126.4 60.8-26.8 52.8-74.5 52.8-74.5s82.7 18.2 113.1-31.8c31.5-49.6 10.9-128.2-31.2-163.2zM585.4 443.4c10.8 8.1 51.4-9.6 61.7 0.4 9.8 10.4-53.3 41.4-34.1 65 19.2 22.7 175.3 38.1 241.2 13.2 59.4-22.3 112.7-78.6 101.9-146.8-9.3-56.8-93-71.8-93-71.8s21-62.3-28.1-85.9c-86.5-42.3-150 27.3-190.2 90.5-36 55.9-70.2 127.7-59.4 135.4zM521.8 66.2c-59.8-14.1-105.2 63.2-105.2 63.2s-59.8-10.4-99.1 25.5c-48.2 43.2-37.9 106.3 8.9 165.9 41.6 52.3 108.5 95.5 120.2 90 11.7-5.9 10.8-48.1 23.8-52.2 14-4.6 21 61.4 51 54.1 29.9-7.3 105.2-135.4 106.2-202.2 1.8-59.8-33.3-127.5-105.8-144.3zM250.7 623.4c66.9-18.7 150-42.7 150.5-65.5 0.5-21.8-70.1-34.1-64.1-60.4 3.7-13.2 72-2.8 76.7-31.4 4.2-21.8-48.6-81.8-116.4-114.5-56.6-27.3-149.1-42.7-189.8 15-34.1 48.2 0.4 101.3 0.4 101.3s-59.3 45-42.5 94.1c19.6 59.1 109.4 82.7 185.2 61.4z m0 0" fill="#d4237a" p-id="5229"></path>
    </svg>
  `;
  petal.innerHTML = petalSvg;
  const size = Math.random() * 120 + 80;
  const startPosX = Math.random() * window.innerWidth;
  const startPosY = -size;
  const duration = Math.random() * 10 + 10;
  const delay = Math.random() * 10;
  const rotation = Math.random() * 360;
  const rotationSpeed = Math.random() * 120 - 60;
  const sway = Math.random() * 50 + 20;
  petal.style.cssText = `
    position: absolute;
    top: ${startPosY}px;
    left: ${startPosX}px;
    opacity: ${Math.random() * 0.7 + 0.3};
    z-index: 0;
    pointer-events: none;
  `;
  const animation = petal.animate(
    [
      { 
        transform: `translate(0, 0) rotate(${rotation}deg)`,
        opacity: Math.random() * 0.7 + 0.3
      },
      { 
        transform: `translate(${sway}px, ${window.innerHeight + size}px) rotate(${rotation + rotationSpeed * duration}deg)`,
        opacity: Math.random() * 0.5
      }
    ],
    {
      duration: duration * 1000,
      delay: delay * 1000,
      iterations: Infinity,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
    }
  );
  (petal as any).animation = animation;
  return petal;
};

const initPetals = () => {
  if (!petalsContainer.value) return;
  petals.forEach(petal => {
    (petal as any).animation.cancel();
    petal.remove();
  });
  petals = [];
  for (let i = 0; i < totalPetals; i++) {
    const petal = createPetal();
    petalsContainer.value.appendChild(petal);
    petals.push(petal);
  }
};

onMounted(() => {
  const savedUsername = localStorage.getItem('username');
  const encryptedPassword = localStorage.getItem('encryptedPassword');
  if (savedUsername && encryptedPassword) {
    loginForm.suName = savedUsername;
    // 解密密码
    loginForm.suPwd = decryptPassword(encryptedPassword, savedUsername + '_salt');
    rememberMe.value = true;
    hasSavedPassword.value = true;
  }
  refreshCaptcha();
  initPetals();
  window.addEventListener('resize', initPetals);
});

watch(rememberMe, (newVal) => {
  if (!newVal) {
    hasSavedPassword.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', initPetals);
  petals.forEach(petal => {
    (petal as any).animation.cancel();
    petal.remove();
  });
  petals = [];
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  transition: background-position 0.1s ease-out;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

.petals-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  padding: 30px 0 20px;
}

.login-title {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 600;
  color: #1f2329;
}

.login-desc {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.login-form {
  padding: 0 30px 30px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 20px;
}

.forgot-password {
  font-size: 12px;
  margin-left: auto;
}

.login-btn-group {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.other-login {
  display: flex;
  align-items: center;
  margin: 25px 0 15px;
}

.line {
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}

.other-login-text {
  padding: 0 15px;
  font-size: 14px;
  color: #6b7280;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.login-footer p {
  margin: 0;
  color: #ffffff;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  color: #409eff;
  font-weight: bold;
  font-size: 20px;
  user-select: none;
  cursor: pointer;
}
</style>