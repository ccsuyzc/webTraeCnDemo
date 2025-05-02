import axios from 'axios';
import { AI_SERVICE_CONFIG } from './config';

/**
 * 获取 AI 聊天回复
 * @param {Array<{role: 'user' | 'assistant' | 'system', content: string}>} messages - 聊天历史记录
 * @param {string | null} [userToken=null] - 用户提供的可选 API Token
 * @returns {Promise<string>} - AI 的回复内容
 */
export async function getAIChatResponse(messages, userToken = null) {
  const config = AI_SERVICE_CONFIG;

  if (config.type === 'deepseek') {
    // --- 调用 DeepSeek API ---
    // 优先使用用户提供的 Token，否则使用配置文件中的 Token
    const apiKeyToUse = userToken || config.deepseek.apiKey;
    if (!apiKeyToUse || apiKeyToUse === 'YOUR_DEEPSEEK_API_KEY') {
      console.error('请在 src/api/config.js 中配置您的 DeepSeek API Key');
      return '错误：DeepSeek API Key 未配置。请检查控制台获取更多信息。';
    }

    // 构造 DeepSeek API 请求体
    const requestData = {
      messages: [
        // 可以根据需要添加 system prompt
        // { role: 'system', content: 'You are a helpful assistant.' },
        // 过滤掉非 user 和 assistant 的角色，并只保留 content 和 role
        ...messages.filter(msg => ['user', 'assistant'].includes(msg.role)).map(({ role, content }) => ({ role, content }))
      ],
      model: 'deepseek-chat',
      // 其他 DeepSeek API 参数可以按需添加
      stream: false, // 示例中不使用流式传输
      temperature: 0.7, // 调整创造性，可以根据需要修改
      max_tokens: 1024
    };

    try {
      const response = await axios.post(config.deepseek.apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKeyToUse}`
        }
      });

      // 检查响应结构并提取回复
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        console.error('DeepSeek API 响应格式不符合预期:', response.data);
        return '错误：无法从 DeepSeek 获取有效回复。';
      }
    } catch (error) {
      console.error('调用 DeepSeek API 时出错:', error.response ? error.response.data : error.message);
      return `错误：与 DeepSeek 通信失败 (${error.response ? error.response.status : 'Network Error'})。`;
    }

  } else if (config.type === 'custom_backend') {
    // --- 调用自定义后端 API ---
    try {
      // 注意：自定义后端的请求/响应格式可能需要调整
      const response = await axios.post(config.custom_backend.apiUrl, {
        messages: messages.map(({ role, text }) => ({ role, content: text })) // 传递原始消息格式或根据后端要求调整
      });

      // 假设后端直接返回 AI 的回复文本
      if (response.data && typeof response.data.reply === 'string') {
         return response.data.reply;
      } else {
         console.error('自定义后端响应格式不符合预期:', response.data);
         // 返回一个更明确的错误消息，指示后端实现可能需要检查
         return '错误：自定义后端未返回有效的回复文本。请检查后端实现。';
      }
    } catch (error) {
      console.error('调用自定义后端 API 时出错:', error.response ? error.response.data : error.message);
      return `错误：与自定义后端通信失败 (${error.response ? error.response.status : 'Network Error'})。`;
    }

  } else {
    console.error('无效的 AI 服务类型配置:', config.type);
    return '错误：AI 服务配置类型无效。';
  }
}