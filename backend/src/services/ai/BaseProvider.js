/**
 * Abstract Base class for AI Providers
 */
class BaseProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || '';
    this.baseURL = config.baseURL || '';
    this.defaultModel = config.defaultModel || '';
  }

  /**
   * Abstract generate method - must be implemented by subclasses
   * @param {Array} messages - Normalized message history [{ role, content }]
   * @param {string} systemPrompt - System prompt instructions
   * @param {string} model - Specific model to use
   * @param {boolean} stream - Whether to stream the response
   * @param {Function} onChunk - Callback for stream chunks: (chunkText) => {}
   * @returns {Promise<Object>} - Contains { text } response if not streaming
   */
  async generate(messages, systemPrompt, model, stream, onChunk) {
    throw new Error('generate method must be implemented by the provider');
  }

  /**
   * Helper to normalize messages from the client
   * Handles:
   * 1. Array of { sender, text } (Existing JINI frontend format)
   * 2. Array of { role, content } (Standard LLM format)
   * 3. Combined { message, history } (Requirement 4 format)
   */
  normalizeMessages({ messages, message, history }) {
    let normalized = [];

    if (messages && Array.isArray(messages)) {
      normalized = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : (m.role || 'assistant'),
        content: m.text || m.content || ''
      }));
    } else if (history && Array.isArray(history)) {
      normalized = history.map(h => ({
        role: h.role || (h.sender === 'user' ? 'user' : 'assistant'),
        content: h.content || h.text || ''
      }));
    }

    if (message) {
      normalized.push({ role: 'user', content: message });
    }

    return normalized;
  }
}

module.exports = BaseProvider;
