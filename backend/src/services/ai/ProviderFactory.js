const config = require('../../config/config');
const GeminiProvider = require('./GeminiProvider');
const OpenAIProvider = require('./OpenAIProvider');
const AnthropicProvider = require('./AnthropicProvider');
const OllamaProvider = require('./OllamaProvider');

class ProviderFactory {
  constructor() {
    this.instances = {};
  }

  /**
   * Get an instance of the requested AI provider
   * @param {string} providerName - Name of the provider (gemini, openai, anthropic, groq, etc.)
   * @returns {BaseProvider} - The provider instance
   */
  getProvider(providerName) {
    const name = (providerName || config.DEFAULT_PROVIDER).toLowerCase();

    // Return cached instance if it exists
    if (this.instances[name]) {
      return this.instances[name];
    }

    const providerConfig = config.providers[name];
    if (!providerConfig) {
      throw new Error(`Unsupported AI Provider: "${providerName}". Available providers are: ${Object.keys(config.providers).join(', ')}`);
    }

    let providerInstance;

    switch (name) {
      case 'gemini':
        providerInstance = new GeminiProvider(providerConfig);
        break;
      case 'anthropic':
        providerInstance = new AnthropicProvider(providerConfig);
        break;
      case 'ollama':
        providerInstance = new OllamaProvider(providerConfig);
        break;
      case 'openai':
      case 'groq':
      case 'openrouter':
      case 'together':
      case 'huggingface':
        // Re-use OpenAIProvider with specific configuration parameters
        providerInstance = new OpenAIProvider(providerConfig);
        break;
      default:
        throw new Error(`AI Provider implementation for "${name}" is not defined in the Factory.`);
    }

    this.instances[name] = providerInstance;
    return providerInstance;
  }

  /**
   * Returns a list of configured providers and their key statuses
   * Useful for the frontend to know what models/providers are available
   */
  getAvailableProviders() {
    return Object.keys(config.providers).map(name => {
      const provider = config.providers[name];
      return {
        name: name,
        configured: name === 'ollama' ? true : !!provider.apiKey,
        defaultModel: provider.defaultModel
      };
    });
  }
}

module.exports = new ProviderFactory();
