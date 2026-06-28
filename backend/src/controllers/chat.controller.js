const ProviderFactory = require('../services/ai/ProviderFactory');
const logger = require('../utils/logger');

// Personality definitions
const PERSONALITY_PROMPTS = {
  friendly: "You are JINI, a warm, modern, and intelligent AI companion. Keep your tone polite, clean, supportive, and professional. Avoid excessive emojis, childish slang (such as 'bestie', 'slay', 'vibing'), and unnecessary punctuation. Speak clearly, helpfully, and professionally.",
  professional: "You are JINI, a highly polished, professional consultant companion. Write structured, articulate, polite, and precise business-level responses.",
  coding: "You are JINI, an elite software engineering companion. Focus on clean syntax, optimal algorithms, modular comments, and explain code structures clearly using markdown code blocks.",
  academic: "You are JINI, a rigorous academic explainer. Provide deep scientific definitions, step-by-step proofs, logical outlines, and clear educational summaries.",
  creative: "You are JINI, a creative muse. Use rich metaphors, poetic analogies, visual storytelling hooks, and creative brainstorming prompts."
};

/**
 * 1. Chat Completion / Stream Controller
 */
async function chatCompletion(req, res, next) {
  const { messages, message, history, provider, model, personality, brainMode, stream } = req.body;

  try {
    const selectedProvider = provider || 'gemini';
    const providerInstance = ProviderFactory.getProvider(selectedProvider);
    
    // Choose model or fall back to default
    const selectedModel = model || providerInstance.defaultModel;

    let baseInstruction = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.friendly;

    if (brainMode) {
      baseInstruction += "\n\nFirst, analyze the user query step-by-step. Detail your plan, plan evaluations, and logical reasoning inside a section starting exactly with '🧠 JINI Brain Reasoning:' and list the reasoning steps. Then, write the final actual response separated by a double newline.";
    }

    // Normalize input formats
    const normalizedMessages = providerInstance.normalizeMessages({ messages, message, history });

    if (normalizedMessages.length === 0) {
      return res.status(400).json({ success: false, error: 'No messages provided.' });
    }

    if (stream) {
      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      logger.info(`Started streaming response using ${selectedProvider} (${selectedModel})`);

      try {
        await providerInstance.generate(
          normalizedMessages,
          baseInstruction,
          selectedModel,
          true,
          (chunkText) => {
            // Write SSE chunk
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        );
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (streamError) {
        logger.error(`Stream generation error: ${streamError.message}`, streamError);
        res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
        res.end();
      }
    } else {
      logger.info(`Generating JSON response using ${selectedProvider} (${selectedModel})`);
      const result = await providerInstance.generate(
        normalizedMessages,
        baseInstruction,
        selectedModel,
        false
      );

      res.json({
        success: true,
        provider: selectedProvider,
        model: selectedModel,
        reply: result.text,
        text: result.text // compatibility with legacy frontend
      });
    }
  } catch (err) {
    logger.error(`Chat completion controller failed: ${err.message}`, err);
    next(err);
  }
}

/**
 * 2. Deep Research / Grounded Search Controller
 */
async function research(req, res, next) {
  const { query, provider, model } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'No search query provided.' });
  }

  try {
    const selectedProvider = provider || 'gemini';
    const providerInstance = ProviderFactory.getProvider(selectedProvider);
    const selectedModel = model || providerInstance.defaultModel;

    const systemInstruction = "You are JINI Deep Research Assistant. Perform synthesis on web search grounds, compile a detailed, well-cited report, and highlight key references.";
    const normalizedMessages = [{ role: 'user', content: query }];

    logger.info(`Starting research using ${selectedProvider} (${selectedModel})`);

    // Enable search grounding tool if selected Gemini
    const options = {
      useSearch: selectedProvider === 'gemini'
    };

    const result = await providerInstance.generate(
      normalizedMessages,
      systemInstruction,
      selectedModel,
      false,
      null,
      options
    );

    res.json({
      success: true,
      provider: selectedProvider,
      model: selectedModel,
      reply: result.text,
      text: result.text,
      sources: result.sources || []
    });
  } catch (err) {
    logger.error(`Research controller failed: ${err.message}`, err);
    next(err);
  }
}

/**
 * 3. AI Writing Suite Controller
 */
async function writingSuite(req, res, next) {
  const { type, title, instructions, tone, length, provider, model } = req.body;

  if (!title || !instructions) {
    return res.status(400).json({ success: false, error: 'Missing required form fields.' });
  }

  try {
    const selectedProvider = provider || 'gemini';
    const providerInstance = ProviderFactory.getProvider(selectedProvider);
    const selectedModel = model || providerInstance.defaultModel;

    const promptText = `Write a detailed, premium ${length}-length draft for a ${type} with the subject/focus "${title}". Instructions to include: ${instructions}. Match tone '${tone}'. Do not include formatting meta blocks.`;
    const normalizedMessages = [{ role: 'user', content: promptText }];
    const systemInstruction = "You are a professional copywriter assistant. Draft high-quality marketing copy, novels, emails, and articles.";

    logger.info(`Generating writing draft using ${selectedProvider} (${selectedModel})`);

    const result = await providerInstance.generate(
      normalizedMessages,
      systemInstruction,
      selectedModel,
      false
    );

    res.json({
      success: true,
      provider: selectedProvider,
      model: selectedModel,
      reply: result.text,
      text: result.text
    });
  } catch (err) {
    logger.error(`Writing controller failed: ${err.message}`, err);
    next(err);
  }
}

/**
 * 4. Learning & Academic Tutor Controller
 */
async function learningTutor(req, res, next) {
  const { module: learnModule, topic, text, targetLang, provider, model } = req.body;

  let promptText = "";
  let systemInstruction = "You are JINI Academic Tutor. Explain subjects cleanly using relatable metaphors.";

  if (learnModule === 'explain') {
    promptText = `Explain the concept: "${topic}" to a student. Provide core definitions, a visual analogy, and common use cases.`;
  } else if (learnModule === 'math') {
    promptText = `Solve the step-by-step calculations for: "${topic}". Outline algebraic rules applied in each step.`;
  } else if (learnModule === 'translator') {
    promptText = `Translate this statement: "${text}" into ${targetLang}. Return the translation formatted inside brackets, e.g. '[Translation]: ...'`;
  } else if (learnModule === 'quiz') {
    promptText = `Generate a single multiple choice quiz question about HTML, CSS, or JS development. Return it strictly formatted as JSON object: {"question": "...", "options": ["...", "...", "...", "..."], "answer": "..."}. Choose a random topic.`;
    systemInstruction = "You are a software tester quiz compiler. Return JSON output only.";
  } else {
    return res.status(400).json({ success: false, error: 'Invalid learning module requested.' });
  }

  try {
    const selectedProvider = provider || 'gemini';
    const providerInstance = ProviderFactory.getProvider(selectedProvider);
    const selectedModel = model || providerInstance.defaultModel;

    const normalizedMessages = [{ role: 'user', content: promptText }];

    logger.info(`Running learning module "${learnModule}" using ${selectedProvider} (${selectedModel})`);

    const result = await providerInstance.generate(
      normalizedMessages,
      systemInstruction,
      selectedModel,
      false
    );

    res.json({
      success: true,
      provider: selectedProvider,
      model: selectedModel,
      reply: result.text,
      text: result.text
    });
  } catch (err) {
    logger.error(`Learning controller failed: ${err.message}`, err);
    next(err);
  }
}

/**
 * 5. Vision OCR Image Analysis Controller
 */
async function visionOCR(req, res, next) {
  const { image, provider, model } = req.body;

  if (!image) {
    return res.status(400).json({ success: false, error: 'No image payload uploaded.' });
  }

  try {
    // Vision currently defaults to Google Gemini if other model doesn't support it
    const selectedProvider = provider || 'gemini';
    const providerInstance = ProviderFactory.getProvider(selectedProvider);
    const selectedModel = model || providerInstance.defaultModel;

    const systemInstruction = "You are JINI Vision, an AI lens assistant. Analyze photos and screenshots precisely.";
    
    logger.info(`Running vision OCR analysis using ${selectedProvider} (${selectedModel})`);

    const options = {
      image: image
    };

    const result = await providerInstance.generate(
      [], // Empty messages since content is generated from image options
      systemInstruction,
      selectedModel,
      false,
      null,
      options
    );

    res.json({
      success: true,
      provider: selectedProvider,
      model: selectedModel,
      reply: result.text,
      text: result.text
    });
  } catch (err) {
    logger.error(`Vision controller failed: ${err.message}`, err);
    next(err);
  }
}

/**
 * 6. Get Available Providers Configuration
 */
function getProvidersList(req, res) {
  try {
    const list = ProviderFactory.getAvailableProviders();
    res.json({ success: true, providers: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  chatCompletion,
  research,
  writingSuite,
  learningTutor,
  visionOCR,
  getProvidersList
};
