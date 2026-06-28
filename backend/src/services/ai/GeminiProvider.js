const BaseProvider = require('./BaseProvider');

class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.defaultModel = config.defaultModel || 'gemini-2.5-flash';
  }

  async generate(messages, systemPrompt, model, stream, onChunk, options = {}) {
    const activeModel = model || this.defaultModel;
    const key = this.apiKey;

    if (this.isPlaceholder()) {
      return this.generateSimulated(messages, systemPrompt, model, stream, onChunk, options, 'gemini');
    }

    const bodyPayload = {
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    // Vision payload override if image option is present
    if (options.image) {
      const [prefix, base64Data] = options.image.split(',');
      const mimeType = prefix.match(/:(.*?);/)[1];
      bodyPayload.contents = [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this image. Describe all details clearly, read any visible text lines (OCR), and identify primary objects."
          }
        ]
      }];
    } else {
      // Format messages for Gemini API
      // Gemini roles: 'user' or 'model'
      bodyPayload.contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
    }

    // Enable Google Search Grounding if requested
    if (options.useSearch) {
      bodyPayload.tools = [{ googleSearch: {} }];
    }

    if (systemPrompt) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    if (stream) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:streamGenerateContent?key=${key}&alt=sse`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Stream Error (${response.status}): ${errorText}`);
      }

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
              const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunkText) {
                onChunk(chunkText);
              }
            } catch (err) {
              // Ignore JSON parse errors for incomplete/metadata frames
            }
          }
        }
      }
      return { text: '' }; // Finished streaming
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      let sources = [];
      const metadata = data.candidates?.[0]?.groundingMetadata;
      if (metadata && metadata.groundingChunks) {
        metadata.groundingChunks.forEach(chunk => {
          if (chunk.web) {
            sources.push({
              title: chunk.web.title || "Web Reference",
              url: chunk.web.uri
            });
          }
        });
      }
      return { text, sources };
    }
  }
}

module.exports = GeminiProvider;
