const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../../.env') }); // Search root if launched from backend directory

module.exports = {
  PORT: process.env.PORT || 8080,
  DEFAULT_PROVIDER: process.env.DEFAULT_PROVIDER || 'gemini',
  DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gemini-2.5-flash',
  
  // API Keys and URLs mapping
  providers: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-2.5-flash'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: 'gpt-4o-mini',
      baseURL: 'https://api.openai.com/v1'
    },
    anthropic: {
      apiKey: process.env.CLAUDE_API_KEY,
      defaultModel: 'claude-3-5-haiku-latest',
      baseURL: 'https://api.anthropic.com/v1'
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      defaultModel: 'llama-3.3-70b-versatile',
      baseURL: 'https://api.groq.com/openai/v1'
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultModel: 'meta-llama/llama-3.3-70b-instruct',
      baseURL: 'https://openrouter.ai/api/v1'
    },
    together: {
      apiKey: process.env.TOGETHER_API_KEY,
      defaultModel: 'meta-llama/Llama-3.3-70b-Instruct-Turbo',
      baseURL: 'https://api.together.xyz/v1'
    },
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY,
      defaultModel: 'meta-llama/Llama-3.2-3B-Instruct',
      baseURL: 'https://api-inference.huggingface.co/v1'
    },
    ollama: {
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      defaultModel: 'llama3'
    }
  }
};
