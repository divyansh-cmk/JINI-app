/**
 * JINI AI Companion - Express Backend Server
 * Connects frontend features to the Internet and Google Gemini API (with Search Grounding)
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // support large base64 image uploads

// Serve static frontend assets from the current directory
app.use(express.static(path.join(__dirname, '..')));

// --- JINI PERSONALITY DEFINITIONS ---
const PERSONALITY_PROMPTS = {
  friendly: "You are JINI, a super friendly, enthusiastic Gen-Z AI companion. Use cool slang (like 'vibing', 'legendary', 'bestie', 'slay', 'chill'), modern emojis, and keep the tone energetic and supportive. Talk like a real supportive best friend.",
  professional: "You are JINI, a highly polished, professional corporate consultant companion. Write structured, articulate, polite, and precise business-level responses.",
  coding: "You are JINI, an elite software engineering companion. Focus on clean syntax, optimal algorithms, modular comments, and explain code structures clearly using markdown code blocks.",
  academic: "You are JINI, a rigorous academic explainer. Provide deep scientific definitions, step-by-step proofs, logical outlines, and clear educational summaries.",
  creative: "You are JINI, a creative muse. Use rich metaphors, poetic analogies, visual storytelling hooks, and creative brainstorming prompts."
};

// --- GEMINI API CALL HELPER ---
async function callGemini(contents, systemInstructionText = "", useSearch = false, clientKey = "") {
  const apiKey = clientKey || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("⚠️ GEMINI_API_KEY is not configured. Running in mock fallback mode.");
    return { text: null, fallback: true };
  }

  try {
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const bodyPayload = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    // Include System instructions if provided
    if (systemInstructionText) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstructionText }]
      };
    }

    // Enable Google Search Grounding if requested
    if (useSearch) {
      bodyPayload.tools = [{ googleSearch: {} }];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error status ${response.status}:`, errorText);
      return { text: null, error: errorText, fallback: true };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Parse Grounding citations if search grounding tool was run
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

    return { text, sources, fallback: false };
  } catch (e) {
    console.error("Failed to query Gemini API:", e);
    return { text: null, error: e.message, fallback: true };
  }
}

// --- API ENDPOINTS ---

// 1. Chat Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, personality, brainMode } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages payload structure." });
  }

  let baseInstruction = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.friendly;

  if (brainMode) {
    baseInstruction += "\n\nFirst, analyze the user query step-by-step. Detail your plan, plan evaluations, and logical reasoning inside a section starting exactly with '🧠 JINI Brain Reasoning:' and list the reasoning steps. Then, write the final actual response separated by a double newline.";
  }

  // Format messages into Gemini role structure
  const contents = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const result = await callGemini(contents, baseInstruction, false, req.headers['x-gemini-key']);

  if (result.fallback) {
    // Graceful fallback to mock data
    const lastQuery = messages[messages.length - 1]?.text || "";
    const mockResponse = getMockReply(lastQuery, personality, brainMode);
    return res.json({ text: mockResponse, fallback: true });
  }

  res.json({ text: result.text, fallback: false });
});

// 2. Deep Research / Search Grounding Endpoint
app.post('/api/research', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "No search query provided." });
  }

  const systemInstruction = "You are JINI Deep Research Assistant. Perform synthesis on web search grounds, compile a detailed, well-cited report, and highlight key references.";
  const contents = [{
    role: 'user',
    parts: [{ text: query }]
  }];

  const result = await callGemini(contents, systemInstruction, true, req.headers['x-gemini-key']);

  if (result.fallback) {
    // Generate mock research report with sample citations
    const reportText = `# Research Report: ${query}\n\n## Summary Findings\nThis represents a fallback report. (Insert GEMINI_API_KEY for live results).\n\n## Citations\n- [Standard Web Science Index](https://arxiv.org/)\n- [UX Premium Interfaces Guide](https://spaceux-corp.com/)`;
    const mockSources = [
      { title: "Standard Web Science Index", url: "https://arxiv.org/" },
      { title: "UX Premium Interfaces Guide", url: "https://spaceux-corp.com/" }
    ];
    return res.json({ text: reportText, sources: mockSources, fallback: true });
  }

  res.json({ text: result.text, sources: result.sources, fallback: false });
});

// 3. AI Writing Suite Endpoint
app.post('/api/writing', async (req, res) => {
  const { type, title, instructions, tone, length } = req.body;

  if (!title || !instructions) {
    return res.status(400).json({ error: "Missing required form fields." });
  }

  const promptText = `Write a detailed, premium ${length}-length draft for a ${type} with the subject/focus "${title}". Instructions to include: ${instructions}. Match tone '${tone}'. Do not include formatting meta blocks.`;
  const contents = [{
    role: 'user',
    parts: [{ text: promptText }]
  }];

  const result = await callGemini(contents, "You are a professional copywriter assistant. Draft high-quality marketing copy, novels, emails, and articles.", false, req.headers['x-gemini-key']);

  if (result.fallback) {
    const fallbackText = `JINI Fallback Copywriting output for [${type}]:\n\nSubject: ${title}\n\nKey points requested: ${instructions}\n\nTone: ${tone} | Length: ${length}\n\n(Note: Configure a GEMINI_API_KEY environment variable to compile live copywriter drafts here).`;
    return res.json({ text: fallbackText, fallback: true });
  }

  res.json({ text: result.text, fallback: false });
});

// 4. Learning & Translator Endpoint
app.post('/api/learning', async (req, res) => {
  const { module, topic, text, targetLang } = req.body;

  let promptText = "";
  let systemInstruction = "You are JINI Academic Tutor. Explain subjects cleanly using relatable metaphors.";

  if (module === 'explain') {
    promptText = `Explain the concept: "${topic}" to a student. Provide core definitions, a visual analogy, and common use cases.`;
  } else if (module === 'math') {
    promptText = `Solve the step-by-step calculations for: "${topic}". Outline algebraic rules applied in each step.`;
  } else if (module === 'translator') {
    promptText = `Translate this statement: "${text}" into ${targetLang}. Return the translation formatted inside brackets, e.g. '[Translation]: ...'`;
  } else if (module === 'quiz') {
    promptText = `Generate a single multiple choice quiz question about HTML, CSS, or JS development. Return it strictly formatted as JSON object: {"question": "...", "options": ["...", "...", "...", "..."], "answer": "..."}. Choose a random topic.`;
    systemInstruction = "You are a software tester quiz compiler. Return JSON output only.";
  }

  const contents = [{
    role: 'user',
    parts: [{ text: promptText }]
  }];

  const result = await callGemini(contents, systemInstruction, false, req.headers['x-gemini-key']);

  if (result.fallback) {
    let fallbackText = "Academic module fallback reply.";
    if (module === 'translator') {
      fallbackText = `[Translation]: (Simulated ${targetLang} translation of: "${text}").`;
    } else if (module === 'quiz') {
      fallbackText = JSON.stringify({
        question: "Which CSS property applies glassmorphism blur effects?",
        options: ["filter: blur()", "backdrop-filter: blur()", "background-blur: 10px", "opacity: 0.5"],
        answer: "backdrop-filter: blur()"
      });
    } else {
      fallbackText = `JINI Learning Explainer fallback for "${topic}".\n\n(Configure GEMINI_API_KEY env for live tutor instructions).`;
    }
    return res.json({ text: fallbackText, fallback: true });
  }

  res.json({ text: result.text, fallback: false });
});

// 5. Image Vision OCR Analysis Endpoint
app.post('/api/vision', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image payload uploaded." });
  }

  try {
    const [prefix, base64Data] = image.split(',');
    const mimeType = prefix.match(/:(.*?);/)[1];

    const contents = [{
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

    const result = await callGemini(contents, "You are JINI Vision, an AI lens assistant. Analyze photos and screenshots precisely.", false, req.headers['x-gemini-key']);

    if (result.fallback) {
      return res.json({ text: "JINI Vision fallback description: OCR complete. Screenshot verified. (Configure API keys for live image parsing).", fallback: true });
    }

    res.json({ text: result.text, fallback: false });
  } catch (err) {
    res.status(500).json({ error: "Failed to parse image visual parameters." });
  }
});

// --- MOCK RESPONSE UTILITY FALLBACKS ---
function getMockReply(query, personality, brainMode) {
  const reasoning = "🧠 JINI Brain Reasoning:\n1. Server running in Fallback mode.\n2. Return pre-formatted simulated answers.\n3. Prompt user to configure GEMINI_API_KEY environment variable.";
  const queryLower = query.toLowerCase();
  let text = "";

  if (queryLower.includes('quantum')) {
    text = "Quantum computing is like building sandcastles with magic blocks that can be in multiple places at the same time. While regular computers use standard switches (bits) that are either ON or OFF, quantum computers use qubits which can be both ON and OFF simultaneously (superposition). This allows them to solve massive puzzles instantly!";
  } else if (queryLower.includes('jwt') || queryLower.includes('node.js')) {
    text = "Here is a clean Node.js implementation to sign JSON Web Tokens:\n\nconst jwt = require('jsonwebtoken');\n\nfunction generateUserToken(userPayload) {\n  const secretKey = process.env.JWT_SECRET || 'nebula_glow_key';\n  return jwt.sign(userPayload, secretKey, { expiresIn: '24h' });\n}\n\nThis token will expire automatically after 24 hours.";
  } else {
    const responses = {
      friendly: "Yo! That is super interesting. I've logged that query in my active neural buffer. How else can we collaborate on your workspaces today, bestie?",
      professional: "Thank you for the prompt. I have processed the inputs using the current intelligence module. Please let me know how you would like to proceed with the execution steps.",
      coding: "Syntax check passed. That approach looks optimized. Let me know if you need to draft unit tests, configure environment variables, or build custom routes for this codebase.",
      academic: "A thorough review of the criteria indicates a strong correlation between the subjects. Let's break down the definitions further if you need step-by-step notes.",
      creative: "A spark of inspiration! We can weave this theme into your notes, story boards, or concept drafts. Let's paint this obsidian canvas with primary neons."
    };
    text = responses[personality] || responses.friendly;
  }

  return brainMode ? `${reasoning}\n\n${text}` : text;
}

// Export app for serverless deployment (Vercel)
module.exports = app;

// Start Server listener only when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 JINI Companion Server active on http://localhost:${PORT}`);
  });
}
