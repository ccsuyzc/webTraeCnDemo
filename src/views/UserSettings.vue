<template>
  <div class="user-settings-page">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>个人资料设置</span>
        </div>
      </template>
      <el-form :model="form" label-width="100px">
        <el-form-item label="头像">
          <div class="avatar-uploader-container">
            <el-avatar :size="100" :src="form.avatarUrl || defaultAvatar" class="avatar-preview"></el-avatar>
            <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/upload-image" 
              name="image" 
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
              <el-button size="small" type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传 jpg/png 文件，且不超过 2MB
                </div>
              </template>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" disabled></el-input> 
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input v-model="form.personal_signature"></el-input>
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input type="textarea" v-model="form.bio"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'; // 引入 ElMessage
import { updateUserDetails, fetchUserDetails } from '@/api/users'; // 引入更新和获取用户信息的 API 函数
import { useAuthStore } from '@/store/authStore'; // 引入 auth store

export default {
  data() {
    return {
      form: {
        username: '',
        email: '',
        bio: '', // 对应 personal_introduction
        personal_signature: '', // 新增个性签名字段
        avatarUrl: '' // 对应 avatar_url
      },
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png' // 默认头像
    };
  },
  methods: {
    async loadUserData() { // 改为 async 函数
      const authStore = useAuthStore();
      const currentUserId = authStore.user.ID; // 从 store 获取当前用户 ID

      if (!currentUserId) {
        ElMessage.error('无法获取当前用户ID，请重新登录');
        // 可以选择重定向到登录页
        this.$router.push('/login');
        return;
      }

      console.log('AuthStore User before fetch:', authStore.user);

      try {
        // --- 从后端获取最新用户信息 --- 
        const fetchedUserData = await fetchUserDetails(currentUserId);
        console.log('Fetched User Details:', fetchedUserData);

        if (fetchedUserData && fetchedUserData.ID === currentUserId) {
          // --- 使用获取到的最新数据填充表单 --- 
          this.form.username = fetchedUserData.Username || '';
          this.form.email = fetchedUserData.Email || ''; // 邮箱通常不允许修改，但可以显示
          this.form.bio = fetchedUserData.PersonalIntroduction || '';
          this.form.personal_signature = fetchedUserData.PersonalSignature || '';
          // 如果后端返回了完整的头像 URL，则直接使用；否则，可能需要拼接基础 URL
          // 假设后端 avatar_url 字段存储的是相对路径或需要拼接的路径
          // 如果 avatar_url 是完整 URL，则直接赋值
          this.form.avatarUrl = fetchedUserData.avatar_url ? `http://localhost:8080${fetchedUserData.avatar_url}` : this.defaultAvatar;
          
          // --- 更新 authStore 和 localStorage --- 
          // 确保传递给 updateUserInfo 的对象包含所有需要的字段，且字段名与 store 状态匹配
          const updatedUserInfoForStore = {
            ID: fetchedUserData.ID,
            Username: fetchedUserData.Username,
            Email: fetchedUserData.Email,
            avatar_url: fetchedUserData.avatar_url, // 使用后端返回的字段名
            PersonalSignature: fetchedUserData.PersonalSignature,
            PersonalIntroduction: fetchedUserData.PersonalIntroduction,
            // ... 其他需要同步到 store 的字段
          };
          authStore.updateUserInfo(updatedUserInfoForStore);
          console.log('AuthStore User after update:', authStore.user);

        } else {
          // 如果获取到的用户ID不匹配或数据无效，可以选择报错或使用 store 中的旧数据作为回退
          console.warn('Fetched user ID does not match current user ID or data is invalid. Using data from store as fallback.');
          this.form.username = authStore.user.Username || '';
          this.form.email = authStore.user.Email || '';
          this.form.bio = authStore.user.PersonalIntroduction || '';
          this.form.personal_signature = authStore.user.PersonalSignature || '';
          this.form.avatarUrl = authStore.user.avatar_url ? `http://localhost:8080${authStore.user.avatar_url}` : this.defaultAvatar;
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        ElMessage.error('加载用户信息失败: ' + (error.response?.data?.message || error.message));
        // 加载失败时，仍然尝试使用 store 中的数据填充表单
        this.form.username = authStore.user.Username || '';
        this.form.email = authStore.user.Email || '';
        this.form.bio = authStore.user.PersonalIntroduction || '';
        this.form.personal_signature = authStore.user.PersonalSignature || '';
        this.form.avatarUrl = authStore.user.AvatarURL ? `http://localhost:8080${authStore.user.avatar_url}` : this.defaultAvatar;
      }
    },
    async saveSettings() {
      const authStore = useAuthStore();
      const userId = authStore.user.ID;

      if (!userId) {
        ElMessage.error('无法获取用户ID，请重新登录');
        return;
      }

      const userData = {
        username: this.form.username,
        avatar_url: this.form.avatarUrl,
        personal_signature: this.form.personal_signature,
        personal_introduction: this.form.bio, // 注意字段映射
        user_id: userId // 确保传递 user_id
      };

      console.log('Saving settings for user:', userId, userData);

      try {
        await updateUserDetails(userId, userData);
        ElMessage.success('设置已保存');
        // 更新 store 中的用户信息 (可选，取决于你的应用逻辑)
        // authStore.updateUserInfo({ 
        //     ...authStore.user, 
        //     username: userData.username,
        //     avatar_url: userData.avatar_url,
        //     personal_signature: userData.personal_signature,
        //     personal_introduction: userData.personal_introduction
        // });
        // 保存成功后，重新加载一次数据以确保同步
        await this.loadUserData(); 
        this.$router.push(`/user/${userId}`); // 跳转到用户主页
      } catch (error) {
        console.error('Failed to save settings:', error);
        ElMessage.error('保存设置失败: ' + (error.response?.data?.message || error.message));
      }
    },
    cancel() {
      this.$router.go(-1); // Go back to the previous page
    },
    handleAvatarSuccess(res, file) {
      // 上传成功后的处理，res是服务器返回的数据
      if (res && res.url) {
        // 使用后端返回的 URL 更新头像，并拼接基础路径
        // 假设后端返回的 url 是相对路径如 /uploads/image.png
        // 如果后端返回的是完整 URL，则直接使用 res.url
        this.form.avatarUrl = `http://localhost:8080${res.url}`; // 根据实际情况调整基础 URL
        ElMessage.success('头像上传成功');
      } else {
        // 处理上传失败或返回数据格式不正确的情况
        ElMessage.error('头像上传失败或服务器响应错误');
        console.error('Upload success response error:', res);
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG && !isPNG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!');
      }
      return (isJPG || isPNG) && isLt2M;
    }
  },
  mounted() {
    this.loadUserData(); // 在组件挂载时调用 loadUserData
  }
};
</script>

<style scoped>
.user-settings-page {
  max-width: 800px;
  margin: 60px auto;
  padding: 30px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.settings-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header span {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-button {
  margin-right: 10px;
}

.avatar-uploader-container {
  display: flex;
  align-items: center;
  gap: 20px; /* 间距 */
}

.avatar-preview {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 7px;
}

</style>