const BaseProvider = require('./BaseProvider');

class OllamaProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.defaultModel = config.defaultModel || 'llama3';
    this.baseURL = config.baseURL || 'http://localhost:11434';
  }

  async generate(messages, systemPrompt, model, stream, onChunk) {
    const activeModel = model || this.defaultModel;
    const url = `${this.baseURL}/api/chat`;

    const apiMessages = [];
    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    messages.forEach(msg => {
      apiMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    const bodyPayload = {
      model: activeModel,
      messages: apiMessages,
      stream: !!stream
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API Error (${response.status}): ${errorText}`);
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
          if (trimmed) {
            try {
              const parsed = JSON.parse(trimmed);
              const chunkText = parsed.message?.content;
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
      const text = data.message?.content || '';
      return { text };
    }
  }
}

module.exports = OllamaProvider;
