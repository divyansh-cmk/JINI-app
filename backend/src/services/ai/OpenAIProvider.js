const BaseProvider = require('./BaseProvider');

class OpenAIProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.defaultModel = config.defaultModel || 'gpt-4o-mini';
  }

  async generate(messages, systemPrompt, model, stream, onChunk) {
    const activeModel = model || this.defaultModel;
    const url = `${this.baseURL}/chat/completions`;
    const key = this.apiKey;

    if (!key) {
      throw new Error(`API key is not configured for provider using baseURL: ${this.baseURL}`);
    }

    // Standard OpenAI payload messages
    const apiMessages = [];
    
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    messages.forEach(msg => {
      // Map 'assistant' or other sender tags to 'assistant'
      const role = msg.role === 'user' ? 'user' : (msg.role === 'system' ? 'system' : 'assistant');
      apiMessages.push({ role, content: msg.content });
    });

    const bodyPayload = {
      model: activeModel,
      messages: apiMessages,
      stream: !!stream
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    };

    // Special header configurations for OpenRouter
    if (url.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'https://github.com/divyansh-cmk/JINI-app';
      headers['X-Title'] = 'JINI AI Companion';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI-compatible API Error (${response.status}) on ${url}: ${errorText}`);
    }

    if (stream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Hold partial line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const chunkText = parsed.choices?.[0]?.delta?.content;
              if (chunkText) {
                onChunk(chunkText);
              }
            } catch (err) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
      return { text: '' };
    } else {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return { text };
    }
  }
}

module.exports = OpenAIProvider;
