<template>
  <div class="about-page">
    <div class="page-header">
      <h1>关于学子通</h1>
      <p>专业的教育装备供应商，致力于推动教育现代化发展</p>
    </div>

    <!-- 公司简介: 应用容器布局 -->
    <section class="company-intro reveal-section acrylic-section">
      <el-row :gutter="40" align="middle">
        <el-col :span="12">
          <div class="intro-content">
            <h2>公司简介</h2>
            <p>
              学子通教育装备商城成立于2015年，是一家专业从事教育装备研发、生产、销售和服务的综合性企业。
              我们致力于为各级各类学校、教育机构提供优质的教学设备和完整的解决方案。
            </p>
            <p>
              经过多年的发展，公司已成为教育装备行业的知名品牌，产品涵盖多媒体教学设备、实验室装备、
              校园家具、体育器材等多个领域，服务覆盖全国31个省市自治区。
            </p>
            <div class="company-stats">
              <div class="stat-item">
                <div class="stat-number">8</div>
                <div class="stat-label">年行业经验</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">3000+</div>
                <div class="stat-label">合作学校</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50000+</div>
                <div class="stat-label">服务师生</div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="intro-image">
            <img src="/contact/contact1.png" alt="公司介绍" />
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 企业文化: 不加容器 -->
    <section class="company-culture reveal-section plain-section">
      <div class="section-header">
        <h2>企业文化</h2>
      </div>
      <el-row :gutter="30">
        <el-col :span="8">
          <el-card class="culture-card">
            <div class="culture-icon">
              <el-icon size="48" color="#409EFF"><Aim /></el-icon>
            </div>
            <h3>企业使命</h3>
            <p>为教育现代化提供优质装备，让每个孩子都能享受到先进的教学环境</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="culture-card">
            <div class="culture-icon">
              <el-icon size="48" color="#67C23A"><View /></el-icon>
            </div>
            <h3>企业愿景</h3>
            <p>成为中国领先的教育装备综合服务商，推动教育事业的持续发展</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="culture-card">
            <div class="culture-icon">
              <el-icon size="48" color="#E6A23C"><Star /></el-icon>
            </div>
            <h3>核心价值观</h3>
            <p>诚信、创新、专业、服务，以客户需求为导向，持续创造价值</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 发展历程: 应用容器布局 -->
    <section class="company-history reveal-section acrylic-section">
      <div class="section-header">
        <h2>发展历程</h2>
      </div>
      <el-timeline>
        <el-timeline-item timestamp="2015年" placement="top">
          <el-card>
            <h4>公司成立</h4>
            <p>学子通教育装备商城正式成立，开始专注于教育装备领域</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2017年" placement="top">
          <el-card>
            <h4>业务扩展</h4>
            <p>产品线扩展至多媒体教学设备，与多家知名厂商建立合作关系</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2019年" placement="top">
          <el-card>
            <h4>技术创新</h4>
            <p>成立研发中心，推出多款自主研发的智能教学设备</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2021年" placement="top">
          <el-card>
            <h4>服务升级</h4>
            <p>建立完善的售后服务体系，提供7x24小时技术支持</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2023年" placement="top">
          <el-card>
            <h4>数字化转型</h4>
            <p>启动数字化转型，打造线上线下一体化服务平台</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </section>

    <!-- 资质荣誉: 不加容器 -->
    <section class="company-honors reveal-section plain-section">
      <div class="section-header">
        <h2>资质荣誉</h2>
      </div>
      <el-row :gutter="20">
        <el-col :span="6" v-for="honor in honors" :key="honor.id">
          <el-card class="honor-card">
            <div class="honor-icon">
              <el-icon size="40" color="#F56C6C"><Trophy /></el-icon>
            </div>
            <h4>{{ honor.title }}</h4>
            <p>{{ honor.description }}</p>
            <span class="honor-year">{{ honor.year }}</span>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 核心团队: 应用容器布局 -->
    <section class="team-intro reveal-section acrylic-section">
      <div class="section-header">
        <h2>核心团队</h2>
        <p>拥有丰富经验的专业团队，为客户提供优质服务</p>
      </div>
      <el-row :gutter="30">
        <el-col :span="8" v-for="member in teamMembers" :key="member.id">
          <el-card class="team-card">
            <div class="member-avatar">
              <el-avatar :size="80" :icon="UserFilled" />
            </div>
            <h3>{{ member.name }}</h3>
            <p class="member-position">{{ member.position }}</p>
            <p class="member-description">{{ member.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Aim, View, Star, Trophy, UserFilled } from '@element-plus/icons-vue'

export default {
  name: 'About',
  components: {
    Aim,
    View,
    Star,
    Trophy,
    UserFilled
  },
  setup() {
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

    const honors = ref([
        {
        id: 1,
        title: '高新技术企业',
        description: '国家高新技术企业认定',
        year: '2020年'
      },
      {
        id: 2,
        title: '质量管理体系认证',
        description: 'ISO9001质量管理体系认证',
        year: '2019年'
      },
      {
        id: 3,
        title: '教育装备行业优秀企业',
        description: '中国教育装备行业协会颁发',
        year: '2021年'
      },
      {
        id: 4,
        title: '创新产品奖',
        description: '教育装备展示会创新产品奖',
        year: '2022年'
      }
    ]);

    const teamMembers = ref([
      {
        id: 1,
        name: '张总经理',
        position: '总经理',
        description: '拥有15年教育装备行业经验，致力于推动教育现代化发展'
      },
      {
        id: 2,
        name: '李技术总监',
        position: '技术总监',
        description: '资深技术专家，负责产品研发和技术创新工作'
      },
      {
        id: 3,
        name: '王销售总监',
        position: '销售总监',
        description: '丰富的市场营销经验，深度了解客户需求和市场趋势'
      }
    ]);

    return {
      honors,
      teamMembers,
      Aim,
      View,
      Star,
      Trophy,
      UserFilled
    }
  }
}
</script>

<style scoped>
.about-page {
  background-color: #f8f9fa;
  padding-bottom: 30px;
}

/* 毛玻璃/亚克力效果容器 */
.acrylic-section {
  position: relative;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 1400px;
  margin: 50px auto;
  padding: 40px 40px;
}

/* 普通区块，用于对齐 */
.plain-section {
  max-width: 1400px;
  margin: 50px auto;
  padding: 60px 40px;
}


.intro-content h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

.intro-content p {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 20px;
}

.company-stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.intro-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
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

.culture-card {
  text-align: center;
  padding: 30px 20px;
  height: 100%;
}

.culture-icon {
  margin-bottom: 20px;
}

.culture-card h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.culture-card p {
  color: #666;
  line-height: 1.6;
}

.company-history .el-timeline {
  padding-left: 20px;
}

.company-history .el-card {
  margin-left: 20px;
}

.company-history h4 {
  margin-bottom: 10px;
  color: #333;
}

.honor-card {
  text-align: center;
  padding: 30px 20px;
  height: 100%;
  position: relative;
}

.honor-icon {
  margin-bottom: 15px;
}

.honor-card h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.honor-card p {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.honor-year {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #999;
}

.team-card {
  text-align: center;
  padding: 30px 20px;
  height: 100%;
  background-color: transparent;
  box-shadow: none;
}

.member-avatar {
  margin-bottom: 20px;
}

.team-card h3 {
  font-size: 18px;
  margin-bottom: 5px;
  color: #333;
}

.member-position {
  font-size: 14px;
  color: #409EFF;
  margin-bottom: 15px;
}

.member-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .acrylic-section, .plain-section {
    padding: 40px 15px;
    margin: 30px auto;
  }
  
  .company-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .intro-content, .intro-image {
    margin-bottom: 30px;
  }
}

/* --- 页面头部样式 --- */
.page-header {
  text-align: center;
  margin-bottom: 0; /* 调整与第一个容器的间距 */
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
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}
</style>
