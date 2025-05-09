import axios from 'axios';
import { AI_SERVICE_CONFIG } from './config';

/**
 * 获取 AI 聊天回复
 * @param {Array<{role: 'user' | 'assistant' | 'system', content: string}>} messages - 聊天历史记录
 * @param {string | null} [userToken=null] - 用户提供的可选 API Token
 * @returns {Promise<string>} - AI 的回复内容
 */
export async function getAIChatResponse(messages, userToken = null, stream = false, model = null) { // 新增 stream 和 model 参数
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
      model: model || 'deepseek-chat', // 使用传入的model，否则使用默认值
      // 其他 DeepSeek API 参数可以按需添加
      stream: stream, // 根据传入参数决定是否流式传输
      temperature: 0.7, // 调整创造性，可以根据需要修改
      max_tokens: 1024
    };

    try {
      if (stream) {
        // 流式传输使用 fetch
        const response = await fetch(config.deepseek.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json', // 虽然对于stream可能不是必须，但加上无妨
            'Authorization': `Bearer ${apiKeyToUse}`
          },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          console.error('DeepSeek API stream error:', errorData);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || errorData.message || 'Unknown error'}`);
        }
        return response.body; // 返回 ReadableStream
      } else {
        // 非流式传输使用 axios (保持原有逻辑)
        const response = await axios.post(config.deepseek.apiUrl, requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKeyToUse}`
          }
        });

        // 检查响应结构并提取回复
        if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
          return response.data.choices[0].message.content;
        } else {
          console.error('DeepSeek API 响应格式不符合预期:', response.data);
          // throw new Error('错误：无法从 DeepSeek 获取有效回复。'); // 改为抛出错误
          throw new Error('Unexpected API response structure from DeepSeek.');
        }
      }
    } catch (error) {
      console.error('调用 DeepSeek API 时出错:', error.response ? error.response.data : error.message, error);
      // throw `错误：与 DeepSeek 通信失败 (${error.response ? error.response.status : 'Network Error'})。`; // 改为抛出错误对象
      if (error instanceof Error) throw error;
      throw new Error(`与 DeepSeek 通信失败 (${error.response ? error.response.status : 'Network Error'})`);
    }

  } else if (config.type === 'custom_backend') {
    // --- 调用自定义后端 API ---
    try {
      // 注意：自定义后端的请求/响应格式可能需要调整
      const requestPayload = {
        messages: messages.map(({ role, text }) => ({ role, content: text })),
      };
      if (model) {
        requestPayload.model = model; // 如果提供了模型，则添加到请求中
      }
      const response = await axios.post(config.custom_backend.apiUrl, requestPayload);

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

/**
 * 获取可用的大模型列表
 * @returns {Promise<Array<string>>} - 可用模型名称列表
 */
export async function getAvailableModels() {
  const config = AI_SERVICE_CONFIG;
  // 假设模型列表的获取不依赖于特定的AI服务类型，或者有一个通用的后端端点
  // 如果不同服务类型有不同的获取模型方式，则需要在此处添加类似 getAIChatResponse 中的逻辑判断

  // 示例：从自定义后端获取模型列表
  // 您需要根据您的实际后端API来调整此部分
  if (config.type === 'custom_backend' && config.custom_backend.modelsUrl) {
    try {
      const response = await axios.get(config.custom_backend.modelsUrl);
      if (response.data && Array.isArray(response.data.models)) {
        return response.data.models;
      } else {
        console.error('获取模型列表API响应格式不符合预期:', response.data);
        throw new Error('无法从后端获取有效的模型列表。');
      }
    } catch (error) {
      console.error('调用获取模型列表API时出错:', error.response ? error.response.data : error.message);
      throw new Error(`获取模型列表失败 (${error.response ? error.response.status : 'Network Error'})`);
    }
  } else if (config.type === 'deepseek') {
    // 对于 DeepSeek，模型通常是固定的，或者在配置中指定
    // 这里可以返回一个预定义的列表，或者从配置中读取
    // 例如： return ['deepseek-chat', 'deepseek-coder'];
    // 为了简单起见，我们暂时返回一个固定的模型，实际应用中您可能需要更复杂的逻辑
    console.warn('DeepSeek 模型列表是硬编码的，请根据需要调整 getAvailableModels 函数。');
    return ['deepseek-chat']; // 示例模型
  } else {
    console.warn('未配置获取模型列表的有效方式，将返回空列表。');
    return []; // 或者抛出错误，或返回一个默认/空列表
  }
}