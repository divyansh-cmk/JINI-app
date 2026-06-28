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
   * Check if the configured API key is missing or a placeholder
   */
  isPlaceholder() {
    const key = this.apiKey;
    if (!key) return true;
    const lowerKey = key.trim().toLowerCase();
    return lowerKey === '' || lowerKey.includes('your_') || lowerKey.includes('api_key_here') || lowerKey === 'placeholder';
  }

  /**
   * Helper to generate a simulated streamed or static response when keys are not configured
   */
  async generateSimulated(messages, systemPrompt, model, stream, onChunk, options, providerName) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    const queryLower = lastMsg.toLowerCase();
    let text = "";

    // Determine personality from system prompt or context if possible
    let personality = 'friendly';
    if (systemPrompt) {
      if (systemPrompt.includes('professional')) personality = 'professional';
      else if (systemPrompt.includes('software engineering') || systemPrompt.includes('coding')) personality = 'coding';
      else if (systemPrompt.includes('Academic') || systemPrompt.includes('academic')) personality = 'academic';
      else if (systemPrompt.includes('creative')) personality = 'creative';
    }

    const responses = {
      friendly: "Yo! That is super interesting. I've logged that query in my active neural buffer. How else can we collaborate on your workspaces today, bestie?",
      professional: "Thank you for the prompt. I have processed the inputs using the current intelligence module. Please let know how you would like to proceed with the execution steps.",
      coding: "Syntax check passed. That approach looks optimized. Let me know if you need to draft unit tests, configure environment variables, or build custom routes for this codebase.",
      academic: "A thorough review of the criteria indicates a strong correlation between the subjects. Let's break down the definitions further if you need step-by-step notes.",
      creative: "A spark of inspiration! We can weave this theme into your notes, story boards, or concept drafts. Let's paint this obsidian canvas with primary neons."
    };

    let baseReply = responses[personality] || responses.friendly;

    if (queryLower.includes('quantum')) {
      baseReply = "Quantum computing is like building sandcastles with magic blocks that can be in multiple places at the same time. While regular computers use standard switches (bits) that are either ON or OFF, quantum computers use qubits which can be both ON and OFF simultaneously (superposition). This allows them to solve massive puzzles instantly!";
    } else if (queryLower.includes('jwt') || queryLower.includes('node.js')) {
      baseReply = "Here is a clean Node.js implementation to sign JSON Web Tokens:\n\nconst jwt = require('jsonwebtoken');\n\nfunction generateUserToken(userPayload) {\n  const secretKey = process.env.JWT_SECRET || 'nebula_glow_key';\n  return jwt.sign(userPayload, secretKey, { expiresIn: '24h' });\n}\n\nThis token will expire automatically after 24 hours.";
    }

    const envVarName = `${providerName.toUpperCase()}_API_KEY`;
    const warningMessage = `⚠️ **Demo Mode (Simulated Response)**: The API key for provider **${providerName}** is not configured or is using a placeholder in the \`.env\` file.

To unlock live answers, please edit the root \`.env\` file in your project folder to set a valid key:
\`\`\`env
${envVarName}=your_real_api_key_here
\`\`\`
Then restart the server.

---

**Simulated Answer:**
${baseReply}`;

    if (stream && onChunk) {
      // Stream the response back in words to simulate real-time typing
      const words = warningMessage.split(' ');
      for (const word of words) {
        onChunk(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 30)); // typing speed simulation
      }
      return { text: warningMessage };
    } else {
      return { text: warningMessage };
    }
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
