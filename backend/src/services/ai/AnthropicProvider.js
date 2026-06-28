const BaseProvider = require('./BaseProvider');

class AnthropicProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.defaultModel = config.defaultModel || 'claude-3-5-haiku-latest';
  }

  async generate(messages, systemPrompt, model, stream, onChunk) {
    const activeModel = model || this.defaultModel;
    const url = 'https://api.anthropic.com/v1/messages';
    const key = this.apiKey;

    if (!key) {
      throw new Error('Anthropic Claude API key is not configured.');
    }

    // Anthropic requires messages to only contain 'user' and 'assistant' roles.
    // System prompt must be passed as a top-level field.
    const apiMessages = [];
    messages.forEach(msg => {
      // Filter out any system role in history (unlikely but safe)
      if (msg.role !== 'system') {
        apiMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    });

    const bodyPayload = {
      model: activeModel,
      max_tokens: 2048,
      messages: apiMessages,
      stream: !!stream
    };

    if (systemPrompt) {
      bodyPayload.system = systemPrompt;
    }

    const headers = {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic Claude API Error (${response.status}): ${errorText}`);
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
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
                onChunk(parsed.delta.text);
              }
            } catch (err) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }
      return { text: '' };
    } else {
      const data = await response.json();
      // Non-streaming response structure
      const text = data.content?.[0]?.text || '';
      return { text };
    }
  }
}

module.exports = AnthropicProvider;
