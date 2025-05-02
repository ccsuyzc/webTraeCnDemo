<template>
  <div class="login-container">
    <h2>登录</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="账号密码登录" name="account">
        <el-form @submit.prevent="handleAccountLogin" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="username" required></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="password" show-password required></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%;">登录</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="邮箱验证码登录" name="email">
        <el-form @submit.prevent="handleEmailLogin" label-position="top">
          <el-form-item label="邮箱" prop="email">
            <el-input type="email" v-model="email" required></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="emailCode">
            <el-input v-model="emailCode" required style="width: calc(100% - 110px); margin-right: 10px;"></el-input>
            <el-button :disabled="emailCountdown>0" @click="sendEmailCode" style="width: 100px;">{{ emailCountdown>0 ? emailCountdown+'s后重试' : '获取验证码' }}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%;">登录</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="手机号登录" name="phone">
        <el-form @submit.prevent="handlePhoneLogin" label-position="top">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="phone" required></el-input>
          </el-form-item>
          <el-form-item label="短信验证码" prop="smsCode">
            <el-input v-model="smsCode" required style="width: calc(100% - 110px); margin-right: 10px;"></el-input>
            <el-button :disabled="smsCountdown>0" @click="sendSmsCode" style="width: 100px;">{{ smsCountdown>0 ? smsCountdown+'s后重试' : '获取验证码' }}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%;">登录</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <div class="third-login">
      <span>第三方登录：</span>
      <el-button icon="el-icon-chat-dot-round" @click="handleWeChatLogin">微信登录</el-button>
      <el-button icon="el-icon-message" @click="handleQQLogin">QQ登录</el-button>
    </div>
    <p>还没有账号？ <router-link to="/register">去注册</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'; // 引入 ElMessage
import { loginWithAccount } from '@/api/auth'; // 导入登录 API 函数
import { useAuthStore } from '@/store/authStore'; // 引入 auth store

const activeTab = ref('account');
const username = ref('');
const password = ref('');
const email = ref('');
const emailCode = ref('');
const phone = ref('');
const smsCode = ref('');
const emailCountdown = ref(0);
const smsCountdown = ref(0);
const router = useRouter();
const authStore = useAuthStore(); // 使用 auth store
let emailTimer = null;
let smsTimer = null;

const handleAccountLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.error('请输入用户名和密码');
    return;
  }
  try {
    const response = await loginWithAccount(username.value, password.value);
    console.log('登录成功:', response.data);
    // 存储 token 和用户信息 (示例：存入 localStorage)
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userInfo', JSON.stringify(response.data.data));
    localStorage.setItem('user', JSON.stringify(response.data.data));
        const success = await authStore.login(username.value, password.value);
 if (success) {
     ElMessage.success('登录成功');
    router.push('/'); // 跳转到首页或其他页面
     // 跳转由 authStore 处理
    } else {
     // 错误消息由 authStore 处理或在这里补充
     ElMessage.error('登录失败，请检查用户名或密码'); // 可选：如果 store 中没有显示消息
    }
  } catch (error) {
     console.error('登录失败:', error.response ? error.response.data : error.message);
     ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试');
  }
};
const handleEmailLogin = () => {
  // 邮箱验证码登录逻辑
  console.log('邮箱验证码登录:', { email: email.value, code: emailCode.value });
  // router.push('/');
};
const handlePhoneLogin = () => {
  // 手机号验证码登录逻辑
  console.log('手机号登录:', { phone: phone.value, code: smsCode.value });
  // router.push('/');
};
const sendEmailCode = () => {
  if (!email.value) { alert('请输入邮箱'); return; }
  emailCountdown.value = 60;
  emailTimer = setInterval(() => {
    emailCountdown.value--;
    if (emailCountdown.value <= 0) clearInterval(emailTimer);
  }, 1000);
  // 调用API发送邮箱验证码
  console.log('发送邮箱验证码到:', email.value);
};
const sendSmsCode = () => {
  if (!phone.value) { alert('请输入手机号'); return; }
  smsCountdown.value = 60;
  smsTimer = setInterval(() => {
    smsCountdown.value--;
    if (smsCountdown.value <= 0) clearInterval(smsTimer);
  }, 1000);
  // 调用API发送短信验证码
  console.log('发送短信验证码到:', phone.value);
};
const handleWeChatLogin = () => {
  // 跳转微信授权或弹窗
  alert('微信登录功能待接入');
};
const handleQQLogin = () => {
  // 跳转QQ授权或弹窗
  alert('QQ登录功能待接入');
};
</script>

<style scoped>
.login-container {
  max-width: 450px; /* 稍微加宽容器 */
  margin: 80px auto; /* 增加顶部边距 */
  padding: 30px; /* 增加内边距 */
  border: 1px solid #ebeef5; /* 使用 Element Plus 边框颜色 */
  border-radius: 8px; /* 更圆润的边角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
  text-align: center;
  background-color: #fff; /* 添加背景色 */
}

h2 {
  margin-bottom: 25px; /* 增加标题下方间距 */
  color: #303133; /* 使用 Element Plus 主文本颜色 */
}

/* 调整 el-tabs 样式 */
:deep(.el-tabs__nav-wrap::after) {
  height: 1px; /* 减小下划线高度 */
}

:deep(.el-tabs__item) {
  font-size: 15px; /* 调整标签页字体大小 */
}

.el-form {
  margin-top: 20px; /* 表单顶部增加间距 */
}

.el-form-item {
  margin-bottom: 20px; /* 增加表单项间距 */
}

/* 调整标签样式 */
:deep(.el-form-item__label) {
  padding-bottom: 0; /* 移除标签底部内边距 */
  line-height: normal; /* 调整行高 */
  color: #606266; /* 使用 Element Plus 次要文本颜色 */
}

/* 调整输入框和按钮 */
.el-input {
  height: 40px; /* 统一输入框高度 */
}

.el-button {
  height: 40px; /* 统一按钮高度 */
  /* Element Plus 按钮已有良好样式，移除自定义背景色 */
}

.third-login {
  margin: 30px 0 20px 0; /* 调整第三方登录区域边距 */
  color: #909399; /* 使用 Element Plus 提示文字颜色 */
  font-size: 14px;
}

.third-login .el-button {
  margin-left: 10px;
  height: auto; /* 第三方登录按钮高度自适应 */
  padding: 8px 15px; /* 调整内边距 */
}

p {
  margin-top: 25px; /* 增加底部文字上方间距 */
  font-size: 14px;
  color: #606266;
}

p a {
  color: #409EFF; /* 使用 Element Plus 主题色 */
  text-decoration: none;
}

p a:hover {
  text-decoration: underline;
}
</style>