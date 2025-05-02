<template>
  <div class="editor-layout"> <!-- Changed class for layout -->
    <AIAssistant class="sidebar left-sidebar" />
    <div class="editor-main-content"> <!-- Wrapper for central content -->
      <h2>{{ isEditing ? '编辑文章' : '新建文章' }}</h2>
      <el-input v-model="title" placeholder="请输入文章标题" class="title-input"></el-input>
      <v-md-editor 
         v-model="content" 
         height="600px"
         :disabled-menus="[]"
          @upload-image="handleUploadImage"
      ></v-md-editor>
      <div class="button-group">
        <el-button type="primary" @click="openPublishDialog">{{ isEditing ? '更新文章' : '发布文章' }}</el-button>
        <el-button @click="saveDraft">{{ isEditingDraft ? '修改草稿' : '保存草稿' }}</el-button>
        <el-button v-if="isEditing" @click="cancelEdit">取消编辑</el-button>
        <el-button @click="cancelEdit">取消</el-button>
      </div>
    </div>
    <DraftBox ref="draftBoxRef" class="sidebar right-sidebar" @load-draft="loadDraftContent" />

    <!-- Publish/Update Dialog -->
    <el-dialog
      v-model="publishDialogVisible"
      :title="isEditing ? '更新文章信息' : '发布文章信息'"
      width="500px"
      :before-close="handleCloseDialog"
    >
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="文章封面">
          <el-upload
            class="cover-uploader"
            :action="uploadActionUrl" 
            name="image" 
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :on-error="handleCoverError"
            :before-upload="beforeCoverUpload"
            accept="image/jpeg,image/png,image/gif"
          >
            <img v-if="publishForm.coverImageUrl" :src="publishForm.coverImageUrl.startsWith('/') ? BASE_URL + publishForm.coverImageUrl : publishForm.coverImageUrl" class="cover-image" alt="封面预览"/>
            <el-icon v-else class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__tip">
              点击上传封面，仅支持JPG/PNG/GIF格式，大小不超过5MB
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="文章描述">
          <el-input v-model="publishForm.description"></el-input>
        </el-form-item>
        <el-form-item label="文章标签">
          <el-select
            v-model="publishForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入文章标签"
            style="width: 100%;"
          >
            <el-option
              v-for="item in availableTags"
              :key="item.ID"
              :label="item.Name"
              :value="item.Name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文章分类">
          <el-select v-model="publishForm.category" placeholder="请选择文章分类" style="width: 100%;">
             <el-option
              v-for="item in availableCategories"
              :key="item.ID"  
              :label="item.Name" 
              :value="item.Name" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="confirmPublish">{{ isEditing ? '确认更新' : '确认发布' }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Add computed
import { useRoute, useRouter } from 'vue-router';
// Re-add necessary Element Plus components and the icon
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption, ElUpload, ElIcon, ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import hljs from 'highlight.js';
import { fetchArticleDetailById, createArticle, updateArticle, fetchTags, fetchCategories } from '@/api/articles'; // 引入API
import { BASE_URL } from '@/api/config'; // 引入基础 URL
import axios from 'axios'; // 引入 axios 用于上传图片
// Re-import sidebar components
import AIAssistant from '../components/Editor/AIAssistant.vue'; 
import DraftBox from '../components/Editor/DraftBox.vue'; 

const route = useRoute();
const router = useRouter();

const draftBoxRef = ref(null); // Add ref for DraftBox

const isEditing = ref(false);
const articleId = ref(null);
const title = ref('');
const content = ref('');

const isEditingDraft = ref(false); // Tracks if editing a draft
const currentDraftId = ref(null); // ID of the draft being edited

// State for the publish dialog
const publishDialogVisible = ref(false);
const availableTags = ref([]);
const availableCategories = ref([]);
const publishForm = ref({ // Keep as ref
  coverImageUrl: '',
  tags: [], // Use 'tags'
  category: '', // Use 'category'
  description: '',   // 文章描述
  user_name:'' // 作者
});

onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true;
    articleId.value = route.params.id;
    try {
      // Fetch actual article data
      const articleData = await fetchArticleDetailById(articleId.value);
      title.value = articleData.title;
      content.value = articleData.content;
      // Assuming API returns these fields directly in the detail endpoint
      publishForm.value.coverImageUrl = articleData.coverImageUrl || ''; 
      publishForm.value.tags = articleData.tags || []; // Expecting array of strings
      publishForm.value.category = articleData.category || ''; // Expecting string
    } catch (error) {
        ElMessage.error('获取文章详情失败');
        console.error(`Failed to fetch article ${articleId.value}:`, error);
        // Optionally redirect or handle error state
        router.push('/creator'); 
    }
  } else {
    isEditing.value = false;
    console.log('Creating a new article');
  }

  // Fetch tags and categories for the dialog
  try {
    // Assuming fetchTags and fetchCategories return arrays of strings based on API response structure
    availableTags.value = await fetchTags(); 
    availableCategories.value = await fetchCategories(); 

  } catch (error) {
    ElMessage.error('获取标签或分类失败');
    console.error('Failed to fetch tags/categories:', error);
  }
});

// --- Cover Image Upload Logic ---
const uploadActionUrl = computed(() => `${BASE_URL}/upload-image`);

const handleCoverSuccess = (response, uploadFile) => {
  console.log('Upload success response:', response);
  if (response && response.url) {
    publishForm.value.coverImageUrl = response.url; // Access with .value
    ElMessage.success('封面上传成功');
  } else {
    console.error('Upload success but no URL returned:', response);
    ElMessage.error('封面上传成功，但无法获取图片地址');
  }
};

const handleCoverError = (error, uploadFile, uploadFiles) => {
  console.error('Upload error:', error);
  let errorMessage = '封面上传失败';
  try {
    // 尝试解析错误响应体
    const errorResponse = JSON.parse(error.message || '{}');
    if (errorResponse && errorResponse.error) {
      errorMessage = `封面上传失败: ${errorResponse.error}`;
    }
  } catch (e) {
    // 解析失败，使用通用错误消息
    console.error('Error parsing upload error response:', e);
  }
  ElMessage.error(errorMessage);
};

const beforeCoverUpload = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('封面图片仅支持 JPG/PNG/GIF 格式!');
    return false;
  }
  if (rawFile.size > maxSize) {
    ElMessage.error('封面图片大小不能超过 5MB!');
    return false;
  }
  return true;
};
// --- End Cover Image Upload Logic ---


const openPublishDialog = () => {
  // Clear form data only when creating a new article
  if (!isEditing.value) {
     publishForm.value.coverImageUrl = ''; // Access with .value
     publishForm.value.tags = []; // Use 'tags' and access with .value
     publishForm.value.category = ''; // Use 'category' and access with .value
  }
  publishDialogVisible.value = true;
};
  
const handleCloseDialog = () => {
  publishDialogVisible.value = false;
};

// Publish/Update article
const confirmPublish = async () => {
  // Add validation check at the beginning of the function
  if (!title.value || title.value.trim() === '') {
    ElMessage.error('文章标题不能为空');
    return; // Stop execution if title is empty
  }
  if (!content.value || content.value.trim() === '') {
    ElMessage.error('文章内容不能为空');
    return; // Stop execution if content is empty
  }
  if (!publishForm.value.category) {
    ElMessage.error('请选择文章分类');
    return;
  }

  // Find category ID
  const selectedCategory = availableCategories.value.find(cat => cat.Name === publishForm.value.category);
  if (!selectedCategory) {
    ElMessage.error('选择的分类无效');
    return;
  }
  const categoryId = selectedCategory.ID;

  // Find tag IDs
  const tagIds = publishForm.value.tags.map(tagName => {
    const selectedTag = availableTags.value.find(tag => tag.Name === tagName);
    // Handle newly created tags if necessary (assuming they might not have an ID immediately)
    // For now, we assume selected tags exist in availableTags
    return selectedTag ? selectedTag.ID : null; 
  }).filter(id => id !== null); // Filter out nulls if any tag wasn't found

  // Use correct form fields and access with .value
  let user = JSON.parse(localStorage.getItem('userInfo'))
  console.log("用户信息",user);
  
//   let token = JSON.parse(localStorage.getItem('token'))
//  console.log("token",token);
 
  const articleData = {
    title: title.value,
    content: content.value,
    avatar_link: publishForm.value.coverImageUrl, // Map to backend field name
    tag_ids: tagIds, // Use mapped IDs
    category_id: categoryId, // Use mapped ID
    status: 'published', // Add status field as required by backend
    // user_id is handled by the backend via authentication context
    user_id:user.ID,
    description: publishForm.value.description, // Map to backend field name
    user_name:user.Username
    // token:token
  };
console.log("发送的文章数据",articleData);
  try {
    let response;
    if (isEditing.value) { 
      console.log('Updating article with data:', { id: articleId.value, ...articleData });
      // Pass ID separately if API expects it like updateArticle(id, data)
      response = await updateArticle(articleId.value, articleData); 
      ElMessage.success('文章更新成功');
      router.push('/creator'); // Redirect after success
    } else { 
      console.log('Publishing new article with data:', articleData);
      response = await createArticle(articleData);
      ElMessage.success('文章发布成功');
      router.push('/creator'); // Redirect after success
    }
    publishDialogVisible.value = false; 
  } catch (error) {
    // Use error message from API call if available
    ElMessage.error(`操作失败: ${error.message || '请稍后再试'}`);
    console.error('Failed to save article:', error);
  }
};

// Save draft
const saveDraft = async () => {
  const draftData = {
    id: isEditingDraft.value ? currentDraftId.value : `local_${Date.now()}`,
    title: title.value,
    content: content.value,
    coverImageUrl: publishForm.value.coverImageUrl,
    tags: publishForm.value.tags,
    category: publishForm.value.category,  
    timestamp: new Date().toISOString(),
    // Keep articleId if we were editing an article and saved it as a draft
    articleId: isEditing.value ? articleId.value : null,
    user_id: userId.value,
    user_name:user.Username
  };

  try {
    let localDrafts = JSON.parse(localStorage.getItem('localDrafts') || '[]');

    if (isEditingDraft.value) {
      // Update existing draft
      const index = localDrafts.findIndex(d => d.id === currentDraftId.value);
      if (index !== -1) {
        localDrafts[index] = draftData;
        ElMessage.success('草稿已更新');
      } else {
        // Fallback: If draft not found (edge case), save as new
        localDrafts.push(draftData);
        ElMessage.success('草稿已保存'); // Or a different message?
      }
    } else {
      // Save as new draft
      localDrafts.push(draftData);
      ElMessage.success('草稿已保存到本地');
    }

    localStorage.setItem('localDrafts', JSON.stringify(localDrafts));

    // Refresh the DraftBox component
    if (draftBoxRef.value) {
      draftBoxRef.value.refreshDrafts();
    }

    // Clear editor content after saving
    title.value = '';
    content.value = '';
    publishForm.value.coverImageUrl = '';
    publishForm.value.tags = [];
    publishForm.value.category = '';
    isEditing.value = false; // Reset article editing state
    articleId.value = null;
    isEditingDraft.value = false; // Reset draft editing state
    currentDraftId.value = null;

    // TODO: Implement save/update draft API call to backend
    // e.g., if (isEditingDraft.value) await updateDraftBackend(draftData); else await saveDraftToBackend(draftData);
  } catch (error) {
    console.error('Failed to save draft locally:', error);
    ElMessage.error('本地保存草稿失败');
  }
};

// Function to load draft content into the editor
const loadDraftContent = (draft) => {
  title.value = draft.title;
  content.value = draft.content;
  publishForm.value.coverImageUrl = draft.coverImageUrl || '';
  publishForm.value.tags = draft.tags || [];
  publishForm.value.category = draft.category || '';

  // If the draft corresponds to an existing article being edited, keep the articleId
  if (draft.articleId) {
    isEditing.value = true;
    articleId.value = draft.articleId;
    isEditingDraft.value = false; // Loading an article's draft, not a standalone draft
    currentDraftId.value = null;
  } else {
    // If it's a standalone draft not linked to a published article
    isEditing.value = false;
    articleId.value = null;
    isEditingDraft.value = true; // Set draft editing state to true
    currentDraftId.value = draft.id; // Store the draft's ID
  }
  ElMessage.info('草稿内容已加载');
};

const cancelEdit = () => {
  router.push('/creator'); // Navigate back to Creator Center
};

const handleUploadImage = (event, insertImage, files)=> {
      // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
      console.log(files);

      // 此处只做示例
      insertImage({
        url:
          'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1269952892,3525182336&fm=26&gp=0.jpg',
        desc: '七龙珠',
        // width: 'auto',
        // height: 'auto',
      });
    }
</script>

<style scoped>
.editor-layout {
  display: flex;
  height: calc(100vh - 64px); /* Adjust based on your nav bar height */
  margin-top: 64px; /* Adjust based on your nav bar height */
  background-color: #fff; /* White background for the whole layout */
}

.sidebar {
  /* - flex: 0 0 250px; */ /* Fixed width for sidebars */
  flex: 0 0 230px; /* Slightly reduced fixed width for sidebars */
  /* overflow-y: auto; */ /* Let child components manage their own scroll */
  height: 100%;
  /* padding: 16px; */ /* Removed padding, handled by child components */
  background-color: #fff; /* White background for sidebars */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */ /* Remove shadow */
  z-index: 1; /* Ensure shadow is visible */
}

.left-sidebar {
  /* border-right: 1px solid #e8e8e8; */ /* Keep border removed, rely on shadow */
 border-right: 1px solid #e8e8e8; /* Re-add subtle border */
}

.right-sidebar {
  /* border-left: 1px solid #e8e8e8; */ /* Keep border removed, rely on shadow */
 border-left: 1px solid #e8e8e8; /* Re-add subtle border */
}

.editor-main-content {
  flex: 1; /* Main content takes remaining space */
  display: flex;
  flex-direction: column;
  padding: 32px; /* Keep padding */
  overflow-y: auto; /* Allow main content to scroll if needed */
  height: 100%;
  background-color: #fff; /* White background for main content */

  border-left: 1px solid #e8e8e8; /* Add border to main content left */
  box-sizing: border-box; /* Include border in width calculation */
   /* border-left: 1px solid #e8e8e8; */ /* Remove border from main content left */
   /* border-right: 1px solid #e8e8e8; */ /* Remove border from main content right */
   /* box-sizing: border-box; */ /* Remove box-sizing if border is removed */
}

/* Remove the redundant editor-container styles */
/* .editor-container { /* Keep original styles if needed elsewhere, or remove if replaced by editor-main-content */
  /* Original styles might be adjusted or removed */
  /* padding: 32px; */ /* Moved to editor-main-content */
  /* max-width: 1000px; */ /* No longer needed with flex */
  /* margin: 64px auto 0; */ /* Handled by editor-layout */
/* } */

.title-input {
  margin-bottom: 20px;
  font-size: 24px; /* Larger font size for title */
}

.button-group {
  margin-top: 20px;
  text-align: right; /* Align buttons to the right */
}

.editor-layout {
  display: flex;
  gap: 20px; /* Add gap between sections */
  padding: 20px;
  max-width: 1400px; /* Limit max width */
  margin: 0 auto; /* Center the layout */
}

.sidebar {
  flex: 0 0 250px; /* Fixed width for sidebars */
  /* Add styles for sidebars if needed, e.g., background, padding */
}

.editor-main-content {
  flex-grow: 1; /* Allow main content to take remaining space */
  min-width: 0; /* Prevent content from overflowing */
}

/* Styles for cover uploader */
.cover-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 178px; /* Adjust width as needed */
  height: 178px; /* Adjust height as needed */
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.el-icon--upload {
  font-size: 28px;
  color: #8c939d;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the area */
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

</style>