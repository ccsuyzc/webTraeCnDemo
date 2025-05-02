<template>
  <div class="register-container">
    <h2>注册</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="手机号注册" name="phone">
        <el-form @submit.prevent="handlePhoneRegister" label-position="top">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="phone" required></el-input>
          </el-form-item>
          <el-form-item label="短信验证码" prop="smsCode">
            <el-input v-model="smsCode" required style="width: calc(100% - 110px); margin-right: 10px;"></el-input>
            <el-button :disabled="smsCountdown>0" @click="sendSmsCode" style="width: 100px;">{{ smsCountdown>0 ? smsCountdown+'s后重试' : '获取验证码' }}</el-button>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="password" show-password required></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input type="password" v-model="confirmPassword" show-password required></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%;">注册</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="邮箱注册" name="email">
        <el-form @submit.prevent="handleEmailRegister" label-position="top">
          <el-form-item label="邮箱" prop="email">
            <el-input type="email" v-model="email" required></el-input>
          </el-form-item>
          <el-form-item label="邮箱验证码" prop="emailCode">
            <el-input v-model="emailCode" required style="width: calc(100% - 110px); margin-right: 10px;"></el-input>
            <el-button :disabled="emailCountdown>0" @click="sendEmailCode" style="width: 100px;">{{ emailCountdown>0 ? emailCountdown+'s后重试' : '获取验证码' }}</el-button>
          </el-form-item>
          <el-form-item label="密码" prop="password2">
            <el-input type="password" v-model="password2" show-password required></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword2">
            <el-input type="password" v-model="confirmPassword2" show-password required></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" style="width: 100%;">注册</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <div class="third-login">
      <span>第三方注册：</span>
      <el-button icon="el-icon-chat-dot-round" @click="handleWeChatRegister">微信注册</el-button>
      <el-button icon="el-icon-message" @click="handleQQRegister">QQ注册</el-button>
    </div>
    <p>已有账号？ <router-link to="/login">去登录</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const activeTab = ref('phone');
const phone = ref('');
const smsCode = ref('');
const smsCountdown = ref(0);
const email = ref('');
const emailCode = ref('');
const emailCountdown = ref(0);
const password = ref('');
const confirmPassword = ref('');
const password2 = ref('');
const confirmPassword2 = ref('');
const router = useRouter();
let smsTimer = null;
let emailTimer = null;

const handlePhoneRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致！');
    return;
  }
  // 手机号注册逻辑
  console.log('手机号注册:', { phone: phone.value, code: smsCode.value, password: password.value });
  // router.push('/login');
};
const handleEmailRegister = () => {
  if (password2.value !== confirmPassword2.value) {
    alert('两次输入的密码不一致！');
    return;
  }
  // 邮箱注册逻辑
  console.log('邮箱注册:', { email: email.value, code: emailCode.value, password: password2.value });
  // router.push('/login');
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
const handleWeChatRegister = () => {
  alert('微信注册功能待接入');
};
const handleQQRegister = () => {
  alert('QQ注册功能待接入');
};
</script>

<style scoped>
.register-container {
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
}

/* 主注册按钮使用 Element Plus 默认样式 */
/* .el-form-item .el-button[type="primary"] { */
  /* 可以根据需要覆盖默认样式，但通常不需要 */
/* } */

.third-login {
  margin: 30px 0 20px 0; /* 调整第三方登录区域边距 */
  color: #909399; /* 使用 Element Plus 提示文字颜色 */
  font-size: 14px;
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
  gap: 10px; /* 设置元素之间的间距 */
}

.third-login .el-button {
  margin-left: 0; /* 移除之前的左边距，使用 gap 代替 */
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