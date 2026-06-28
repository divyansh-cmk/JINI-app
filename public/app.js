/**
 * JINI AI Companion - Application Engine
 * Implements SPA routing, State Management, LLM Simulations, Web Speech APIs,
 * Workspaces, Writing/Learning Tools, and Productivity Suites.
 */

// --- GLOBAL STATE ---
const STATE = {
  activePage: 'home',
  theme: 'dark',
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  geminiApiKey: '',
  user: {
    name: 'Divyansh',
    avatar: 'D',
    tier: 'FREE ACCOUNT', // FREE, PRO, ENTERPRISE
    memory: [
      { id: 1, fact: "Prefers Electric Purple styling vibes" },
      { id: 2, fact: "Developing a premium companion interface called JINI" },
      { id: 3, fact: "Writes Javascript and Tailwind CSS solutions" },
      { id: 4, fact: "Works on MacBook system layouts" }
    ]
  },
  stats: {
    chats: 12,
    toolsRun: 8,
    tokens: '2.4k'
  },
  brainMode: false,
  personality: 'friendly', // friendly, professional, coding, academic, creative
  chats: [
    {
      id: 0,
      title: "Current JINI Chat Session",
      messages: [] // Loaded dynamically
    },
    {
      id: 1,
      title: "Math homework help & scientific formulas",
      messages: [
        { sender: 'user', text: 'Solve the equation: 3x + 12 = 36' },
        { sender: 'jini', text: '🧠 JINI Brain Reasoning:\n1. Subtract 12 from both sides: 3x = 24\n2. Divide both sides by 3: x = 8.\n\nThe final solution is x = 8.' }
      ]
    }
  ],
  activeChatId: 0,
  folders: [
    { id: 'all', name: 'All Projects', icon: 'folder_open', count: 3 },
    { id: 'writing', name: 'Creative Writing', icon: 'draw', count: 1 },
    { id: 'code', name: 'Code Projects', icon: 'code', count: 1 },
    { id: 'uni', name: 'Uni Homework', icon: 'school', count: 1 }
  ],
  activeFolderId: 'all',
  projects: [
    { id: 101, folderId: 'writing', title: 'Cyberpunk Novel Concept', tag: 'STORY', date: '2h ago', icon: 'edit_document' },
    { id: 102, folderId: 'code', title: 'API Integration Helper', tag: 'DEVELOPMENT', date: '3 days ago', icon: 'terminal' },
    { id: 103, folderId: 'uni', title: 'Calculus Formulas Summary', tag: 'MATHEMATICS', date: 'Yesterday', icon: 'functions' }
  ],
  notes: [
    { id: 1, title: 'JINI Feature Ideas', content: 'Add a full voice interruption engine using SpeechSynthesis. Ensure light dismiss behaves cleanly with dialogs.' },
    { id: 2, title: 'Tailwind Palette Sync', content: 'Obsidian Nebula utilizes deep blue surface #0b1326, primary violet #ddb7ff, and secondary blue #adc6ff.' }
  ],
  todos: [
    { id: 1, text: 'Enable JINI Brain Reasoning toggle', completed: true },
    { id: 2, text: 'Test web speech audio wave fluctuation', completed: false },
    { id: 3, text: 'Validate responsive layout elements', completed: false }
  ],
  habits: [
    { id: 1, text: 'Hydrate (Drink 3L Water)', completed: true },
    { id: 2, text: 'Write AI Code Scripts', completed: true },
    { id: 3, text: 'Physical Exercise / Workout', completed: false }
  ],
  voiceState: {
    active: false,
    identity: 'Aria',
    speaking: false,
    recognitionActive: false
  },
  activeNoteId: null,
  activeToolSubtab: 'writing',
  activeLearningModule: 'explain',
  activeUploadedFiles: []
};

// --- PROVIDERS & MODELS CONFIGURATION ---
const PROVIDER_MODELS = {
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' }
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'o1-mini', label: 'o1 Mini' }
  ],
  anthropic: [
    { value: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' }
  ],
  groq: [
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70b' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7b' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9b' }
  ],
  openrouter: [
    { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70b (OR)' },
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (OR)' }
  ],
  together: [
    { value: 'meta-llama/Llama-3.3-70b-Instruct-Turbo', label: 'Llama 3.3 70b (Together)' },
    { value: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7b (Together)' }
  ],
  huggingface: [
    { value: 'meta-llama/Llama-3.2-3B-Instruct', label: 'Llama 3.2 3B' }
  ],
  ollama: [
    { value: 'llama3', label: 'Llama 3 (Local)' },
    { value: 'mistral', label: 'Mistral (Local)' }
  ]
};

function syncProviderModelsDropdown(providerVal) {
  const modelSelect = document.getElementById('chat-model-select');
  if (modelSelect) {
    modelSelect.innerHTML = '';
    const models = PROVIDER_MODELS[providerVal] || [];
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.value;
      option.textContent = model.label;
      modelSelect.appendChild(option);
    });
  }
}

function changeChatProvider(val) {
  STATE.provider = val;
  syncProviderModelsDropdown(val);
  const models = PROVIDER_MODELS[val] || [];
  if (models.length > 0) {
    STATE.model = models[0].value;
    const modelSelect = document.getElementById('chat-model-select');
    if (modelSelect) {
      modelSelect.value = STATE.model;
    }
  }
  saveStateToStorage();
}

function changeChatModel(val) {
  STATE.model = val;
  saveStateToStorage();
}

// --- INITIALIZATION ---
function initializeApp() {
  // Load saved state if exists
  loadStateFromStorage();
  
  // Initialize UI components
  initSPA();
  updateGreeting();
  updateNeuralStability();
  renderNotes();
  renderTodos();
  renderHabits();
  renderFolders();
  renderProjects();
  renderMemoryLogs();
  
  // Set initial theme
  setThemeMode(STATE.theme);

  // Set initial API key input value
  const keyInput = document.getElementById('pref-gemini-key');
  if (keyInput) keyInput.value = STATE.geminiApiKey || '';

  // Initialize Provider / Model dropdowns in the sidebar
  const providerSelect = document.getElementById('chat-provider-select');
  if (providerSelect) {
    providerSelect.value = STATE.provider || 'gemini';
    syncProviderModelsDropdown(providerSelect.value);
    
    const modelSelect = document.getElementById('chat-model-select');
    if (modelSelect && STATE.model) {
      modelSelect.value = STATE.model;
    }
  }

  // Periodically fluctuate stability bar
  setInterval(fluctuateStability, 3000);
}

// Bind functions to window for robust inline HTML onclick interactions
window.navigateTo = navigateTo;
window.togglePopover = togglePopover;
window.clearNotifications = clearNotifications;
window.toggleBrainMode = toggleBrainMode;
window.triggerQuickAction = triggerQuickAction;
window.startNewChat = startNewChat;
window.loadChat = loadChat;
window.filterChatHistory = filterChatHistory;
window.populateAndSend = populateAndSend;
window.handleChatInputKeydown = handleChatInputKeydown;
window.triggerFileInput = triggerFileInput;
window.handleDocumentUpload = handleDocumentUpload;
window.handleImageUpload = handleImageUpload;
window.removeUploadedFile = removeUploadedFile;
window.changeChatPersonality = changeChatPersonality;
window.changeChatProvider = changeChatProvider;
window.changeChatModel = changeChatModel;
window.toggleChatVoiceDictation = toggleChatVoiceDictation;
window.sendChatMessage = sendChatMessage;
window.selectWorkspaceFolder = selectWorkspaceFolder;
window.promptCreateFolder = promptCreateFolder;
window.promptCreateProject = promptCreateProject;
window.deleteProjectAsset = deleteProjectAsset;
window.showShareWorkspaceModal = showShareWorkspaceModal;
window.copyShareWorkspaceLink = copyShareWorkspaceLink;
window.switchToolSubtab = switchToolSubtab;
window.adaptWritingFormLabels = adaptWritingFormLabels;
window.executeWritingTool = executeWritingTool;
window.copyWritingOutput = copyWritingOutput;
window.switchLearningModule = switchLearningModule;
window.generateTopicExplanation = generateTopicExplanation;
window.solveMathProblem = solveMathProblem;
window.translateText = translateText;
window.flipFlashcard = flipFlashcard;
window.createQuiz = createQuiz;
window.submitQuizAnswer = submitQuizAnswer;
window.addNewNote = addNewNote;
window.filterNotes = filterNotes;
window.openNoteForEdit = openNoteForEdit;
window.saveNoteEdits = saveNoteEdits;
window.closeNoteEditor = closeNoteEditor;
window.deleteNote = deleteNote;
window.addNewTodo = addNewTodo;
window.toggleTodoStatus = toggleTodoStatus;
window.deleteTodo = deleteTodo;
window.toggleHabitStatus = toggleHabitStatus;
window.executeDeepResearch = executeDeepResearch;
window.copyResearchReport = copyResearchReport;
window.toggleVoiceConnection = toggleVoiceConnection;
window.changeVoiceSetting = changeVoiceSetting;
window.interruptVoiceOutput = interruptVoiceOutput;
window.updateProfileName = updateProfileName;
window.setThemeMode = setThemeMode;
window.toggleTheme = toggleTheme;
window.clearAllMemoryLogs = clearAllMemoryLogs;
window.deleteMemory = deleteMemory;
window.simulateSignOut = simulateSignOut;
window.subscribeToPlan = subscribeToPlan;
window.processUpgradePayment = processUpgradePayment;
window.handleGlobalSearchKeydown = handleGlobalSearchKeydown;
window.submitGlobalSearch = submitGlobalSearch;
window.showModal = showModal;
window.closeModal = closeModal;
window.showAuthModal = showAuthModal;
window.simulateGoogleLogin = simulateGoogleLogin;
window.simulateEmailLogin = simulateEmailLogin;
window.clearActivityFeed = clearActivityFeed;
window.deleteActivityItem = deleteActivityItem;
window.saveGeminiKey = saveGeminiKey;
window.toggleKeyVisibility = toggleKeyVisibility;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// --- STATE STORAGE ---
function saveStateToStorage() {
  localStorage.setItem('jini_state', JSON.stringify({
    theme: STATE.theme,
    provider: STATE.provider,
    model: STATE.model,
    geminiApiKey: STATE.geminiApiKey,
    user: STATE.user,
    notes: STATE.notes,
    todos: STATE.todos,
    habits: STATE.habits,
    projects: STATE.projects,
    folders: STATE.folders
  }));
}

function loadStateFromStorage() {
  const saved = localStorage.getItem('jini_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      STATE.theme = parsed.theme || STATE.theme;
      STATE.provider = parsed.provider || 'gemini';
      STATE.model = parsed.model || 'gemini-2.5-flash';
      STATE.geminiApiKey = parsed.geminiApiKey || '';
      STATE.user = parsed.user || STATE.user;
      STATE.notes = parsed.notes || STATE.notes;
      STATE.todos = parsed.todos || STATE.todos;
      STATE.habits = parsed.habits || STATE.habits;
      STATE.projects = parsed.projects || STATE.projects;
      STATE.folders = parsed.folders || STATE.folders;
    } catch (e) {
      console.error('Error loading local state: ', e);
    }
  }
}

// --- SPA ROUTING ---
function initSPA() {
  const hash = window.location.hash.replace('#', '');
  if (['home', 'chat', 'workspace', 'tools', 'voice', 'profile'].includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }
}

function navigateTo(pageId) {
  STATE.activePage = pageId;
  window.location.hash = pageId;

  // Update navbar items
  document.querySelectorAll('nav a').forEach(nav => {
    nav.classList.remove('text-primary', 'drop-shadow-[0_0_8px_rgba(221,183,255,0.8)]', 'scale-110');
    nav.classList.add('text-on-surface-variant/60');
    const icon = nav.querySelector('.material-symbols-outlined');
    icon.style.fontVariationSettings = "'FILL' 0";
  });

  const activeNav = document.getElementById(`nav-${pageId}`);
  if (activeNav) {
    activeNav.classList.add('text-primary', 'drop-shadow-[0_0_8px_rgba(221,183,255,0.8)]', 'scale-110');
    activeNav.classList.remove('text-on-surface-variant/60');
    const activeIcon = activeNav.querySelector('.material-symbols-outlined');
    activeIcon.style.fontVariationSettings = "'FILL' 1";
  }

  // Switch pages with transition
  document.querySelectorAll('main > section').forEach(sec => {
    sec.classList.add('hidden-section');
  });

  const activeSection = document.getElementById(`page-${pageId}`);
  if (activeSection) {
    activeSection.classList.remove('hidden-section');
  }

  // Toggle Global Search Bar visibility (hidden in Chat and Voice mode)
  const searchBar = document.getElementById('global-search-container');
  if (pageId === 'chat' || pageId === 'voice') {
    searchBar.classList.add('hidden');
  } else {
    searchBar.classList.remove('hidden');
  }

  // Auto-scroll chat to bottom if switching to Chat
  if (pageId === 'chat') {
    scrollChatBottom();
  }
}

// --- INTERACTIVE POPUPS / POPPERS ---
function togglePopover(popoverId) {
  const popover = document.getElementById(popoverId);
  const otherPopoverId = popoverId === 'notification-popover' ? 'profile-popover' : 'notification-popover';
  const otherPopover = document.getElementById(otherPopoverId);
  
  if (otherPopover) otherPopover.classList.add('hidden');
  
  if (popover) {
    popover.classList.toggle('hidden');
  }
}

// Close popovers if clicked outside
document.addEventListener('click', (e) => {
  const popoverSelectors = ['#notification-popover', '#profile-popover', 'button[onclick*="togglePopover"]'];
  let clickedInside = false;
  popoverSelectors.forEach(selector => {
    if (e.target.closest(selector)) clickedInside = true;
  });

  if (!clickedInside) {
    document.getElementById('notification-popover').classList.add('hidden');
    document.getElementById('profile-popover').classList.add('hidden');
  }
});

// Clear notifications logs
function clearNotifications() {
  const list = document.getElementById('notification-list');
  list.innerHTML = `<p class="text-xs text-on-surface-variant/60 text-center py-4">No new notifications</p>`;
}

// --- DYNAMIC GREETINGS & DECORATIVE PILLS ---
function updateGreeting() {
  const hr = new Date().getHours();
  let greet = "Hello, I'm JINI.";
  if (hr >= 5 && hr < 12) greet = "Good morning! I'm JINI.";
  else if (hr >= 12 && hr < 18) greet = "Good afternoon! I'm JINI.";
  else if (hr >= 18 && hr < 22) greet = "Good evening! I'm JINI.";
  else greet = "Up late? I'm JINI.";
  
  const greetEl = document.getElementById('greeting-title');
  if (greetEl) {
    greetEl.innerHTML = `${greet} <br/><span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Your AI companion.</span>`;
  }
}

// --- NEURAL STABILITY ENGINE (BENTO EFFECT) ---
function updateNeuralStability() {
  const stability = Math.floor(Math.random() * 8) + 88; // 88% - 95%
  const bar = document.getElementById('neural-stability-bar');
  const txt = document.getElementById('stability-percentage');
  
  if (bar && txt) {
    bar.style.width = `${stability}%`;
    txt.textContent = `${stability}% Stable`;
  }
}

function fluctuateStability() {
  if (Math.random() > 0.4) {
    updateNeuralStability();
  }
}

// Brain switch toggle syncs
function toggleBrainMode(enabled) {
  STATE.brainMode = enabled;
  
  // Sync both switches
  const dashSwitch = document.getElementById('dashboard-brain-switch');
  const chatSwitch = document.getElementById('chat-brain-switch');
  if (dashSwitch) dashSwitch.checked = enabled;
  if (chatSwitch) chatSwitch.checked = enabled;

  // Update Brain indicator
  const indicator = document.getElementById('brain-sync-indicator');
  const indText = document.getElementById('brain-sync-text');
  
  if (enabled) {
    if (indicator) {
      indicator.classList.remove('bg-[#39ff14]');
      indicator.classList.add('bg-primary');
    }
    if (indText) indText.textContent = "BRAIN: DEEP THINKING";
    addActivityLog('JINI Brain Enabled', 'Configuration', 'Just now', 'psychology');
  } else {
    if (indicator) {
      indicator.classList.remove('bg-primary');
      indicator.classList.add('bg-[#39ff14]');
    }
    if (indText) indText.textContent = "BRAIN: ACTIVE";
  }
}

// --- QUICK ACTIONS WIDGET ROUTING ---
function triggerQuickAction(action) {
  navigateTo('tools');
  switch (action) {
    case 'email':
      switchToolSubtab('writing', document.querySelector('.tool-subtab'));
      document.getElementById('writing-tool-type').value = 'email';
      adaptWritingFormLabels('email');
      break;
    case 'pdf':
      navigateTo('chat');
      triggerFileInput('document-upload-trigger');
      break;
    case 'image':
      navigateTo('chat');
      triggerFileInput('image-upload-trigger');
      break;
    case 'explain':
      switchToolSubtab('learning', document.querySelectorAll('.tool-subtab')[1]);
      switchLearningModule('explain', document.querySelector('.learning-module-btn'));
      break;
    case 'code':
      navigateTo('chat');
      populateAndSend("Explain how to debug a memory leak in Node.js applications.");
      break;
    case 'translate':
      switchToolSubtab('learning', document.querySelectorAll('.tool-subtab')[1]);
      switchLearningModule('translator', document.querySelectorAll('.learning-module-btn')[2]);
      break;
  }
}

// --- CHAT MODULE ENGINE ---
function scrollChatBottom() {
  const screen = document.getElementById('chat-message-screen');
  if (screen) {
    setTimeout(() => {
      screen.scrollTo({
        top: screen.scrollHeight,
        behavior: 'smooth'
      });
    }, 50);
  }
}

function clearCurrentChat() {
  STATE.chats[STATE.activeChatId].messages = [];
  const screen = document.getElementById('chat-message-screen');
  if (screen) {
    screen.innerHTML = `
      <div class="message-bubble-jini p-4 rounded-lg space-y-3 max-w-[85%]">
        <p class="text-xs leading-relaxed">
          Chat cleared. I'm JINI. How can I assist you with your workspace assets or research queries today?
        </p>
      </div>
    `;
  }
  STATE.activeUploadedFiles = [];
  updateUploadedFilesUI();
}

function startNewChat() {
  const newId = STATE.chats.length;
  const newChat = {
    id: newId,
    title: `New JINI Chat Session #${newId}`,
    messages: []
  };
  STATE.chats.push(newChat);
  STATE.activeChatId = newId;

  // Add sidebar item
  const list = document.getElementById('chat-history-list');
  const item = document.createElement('div');
  item.className = 'p-2.5 bg-primary/10 rounded-lg border border-primary/20 text-xs font-semibold cursor-pointer flex justify-between items-center chat-history-item';
  item.onclick = () => loadChat(newId);
  item.innerHTML = `
    <span class="truncate pr-2">New Chat Session #${newId}</span>
    <span class="text-[9px] text-primary/70">ACTIVE</span>
  `;
  
  // Remove active tag from others
  document.querySelectorAll('.chat-history-item').forEach(el => {
    el.classList.remove('bg-primary/10', 'border-primary/20', 'font-semibold');
    el.classList.add('hover:bg-surface-bright/30', 'text-on-surface-variant/80');
    const label = el.querySelector('span:last-child');
    if (label && label.textContent === 'ACTIVE') label.textContent = 'Saved';
  });

  list.insertBefore(item, list.firstChild);
  clearCurrentChat();
  addActivityLog(`Created Chat Session #${newId}`, 'Chat History', 'Just now', 'chat_bubble');
}

function loadChat(chatId) {
  STATE.activeChatId = chatId;
  
  // Update UI active styles
  document.querySelectorAll('.chat-history-item').forEach((el, index) => {
    // Reverse index mapping since we prepended items
    const revIndex = STATE.chats.length - 1 - index;
    if (revIndex === chatId) {
      el.className = 'p-2.5 bg-primary/10 rounded-lg border border-primary/20 text-xs font-semibold cursor-pointer flex justify-between items-center chat-history-item';
      const label = el.querySelector('span:last-child');
      if (label) {
        label.textContent = 'ACTIVE';
        label.className = 'text-[9px] text-primary/70';
      }
    } else {
      el.className = 'p-2.5 hover:bg-surface-bright/30 rounded-lg text-xs cursor-pointer flex justify-between items-center text-on-surface-variant/80 chat-history-item';
      const label = el.querySelector('span:last-child');
      if (label && label.textContent === 'ACTIVE') {
        label.textContent = 'Saved';
        label.className = 'text-[9px] text-on-surface-variant/40';
      }
    }
  });

  const screen = document.getElementById('chat-message-screen');
  screen.innerHTML = '';

  const messages = STATE.chats[chatId].messages;
  if (messages.length === 0) {
    screen.innerHTML = `
      <div class="message-bubble-jini p-4 rounded-lg space-y-3 max-w-[85%]">
        <p class="text-xs leading-relaxed">
          Hello! I'm ready to collaborate. Let's research topics or organize files in your workspace.
        </p>
      </div>
    `;
  } else {
    messages.forEach(msg => {
      appendChatMessageUI(msg.sender, msg.text);
    });
  }
  scrollChatBottom();
}

function filterChatHistory(query) {
  const items = document.querySelectorAll('.chat-history-item');
  items.forEach(item => {
    const text = item.querySelector('span').textContent.toLowerCase();
    if (text.includes(query.toLowerCase())) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

function populateAndSend(text) {
  const input = document.getElementById('chat-main-input');
  if (input) {
    input.value = text;
    sendChatMessage();
  }
}

function handleChatInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
  
  // Character count updates
  setTimeout(() => {
    const counter = document.getElementById('chat-char-counter');
    if (counter) {
      counter.textContent = `${e.target.value.length} chars`;
    }
  }, 10);
}

function triggerFileInput(triggerId) {
  document.getElementById(triggerId).click();
}

function handleDocumentUpload(input) {
  const file = input.files[0];
  if (file) {
    STATE.activeUploadedFiles.push({
      name: file.name,
      type: 'document',
      size: (file.size / 1024).toFixed(1) + ' KB',
      fileRaw: file
    });
    updateUploadedFilesUI();
    
    // Simulate Document Intelligence processing
    addNotification('Document intelligence processing...', `Extracting structures from ${file.name}`);
    setTimeout(() => {
      addNotification('Document OCR Extracted', `${file.name} metadata synthesized successfully.`);
      addActivityLog(`Analyzed ${file.name}`, 'Document Intelligence', 'Just now', 'description');
    }, 2000);
  }
}

function handleImageUpload(input) {
  const file = input.files[0];
  if (file) {
    STATE.activeUploadedFiles.push({
      name: file.name,
      type: 'image',
      size: (file.size / 1024).toFixed(1) + ' KB',
      fileRaw: file
    });
    updateUploadedFilesUI();
    
    // Simulate Vision OCR processing
    addNotification('AI Vision Syncing', `Parsing pixels in screenshot: ${file.name}`);
    setTimeout(() => {
      addNotification('Image OCR complete', `Objects and textual lines verified.`);
      addActivityLog(`Analyzed Image ${file.name}`, 'AI Vision', 'Just now', 'image');
    }, 1500);
  }
}

function updateUploadedFilesUI() {
  const container = document.getElementById('chat-uploaded-files-container');
  if (!container) return;
  
  if (STATE.activeUploadedFiles.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  
  container.classList.remove('hidden');
  container.innerHTML = '';
  
  STATE.activeUploadedFiles.forEach((file, idx) => {
    const pill = document.createElement('div');
    pill.className = 'px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-[10px] flex items-center gap-1.5 font-semibold text-primary';
    pill.innerHTML = `
      <span class="material-symbols-outlined text-xs">${file.type === 'image' ? 'image' : 'description'}</span>
      <span class="truncate max-w-[120px]">${file.name} (${file.size})</span>
      <button class="hover:text-error cursor-pointer" onclick="removeUploadedFile(${idx})"><span class="material-symbols-outlined text-[10px] align-middle">close</span></button>
    `;
    container.appendChild(pill);
  });
}

function removeUploadedFile(index) {
  STATE.activeUploadedFiles.splice(index, 1);
  updateUploadedFilesUI();
}

function changeChatPersonality(val) {
  STATE.personality = val;
  const headerName = document.getElementById('chat-header-name');
  
  const map = {
    friendly: 'JINI Friendly',
    professional: 'JINI Professional',
    coding: 'JINI Coding Guru',
    academic: 'JINI Academic Explainer',
    creative: 'JINI Creative Muse'
  };
  
  if (headerName) {
    headerName.textContent = map[val] || 'JINI Companion';
  }
  addActivityLog(`Changed JINI profile to ${map[val]}`, 'Preferences', 'Just now', 'settings');
}

function toggleChatVoiceDictation() {
  const btn = document.getElementById('chat-voice-dictation-btn');
  
  if (!STATE.voiceState.recognitionActive) {
    // Attempt standard SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      
      rec.onstart = () => {
        STATE.voiceState.recognitionActive = true;
        btn.classList.add('bg-primary/20', 'text-primary', 'neon-pulse');
        addNotification('Listening via Microphone', 'Speak your query to JINI');
      };
      
      rec.onresult = (e) => {
        const val = e.results[0][0].transcript;
        document.getElementById('chat-main-input').value = val;
      };
      
      rec.onerror = (e) => {
        console.error('Speech recognition error: ', e);
        STATE.voiceState.recognitionActive = false;
        btn.classList.remove('bg-primary/20', 'text-primary', 'neon-pulse');
      };
      
      rec.onend = () => {
        STATE.voiceState.recognitionActive = false;
        btn.classList.remove('bg-primary/20', 'text-primary', 'neon-pulse');
      };
      
      rec.start();
    } else {
      // Mock voice input since browser has no SpeechRecognition
      btn.classList.add('bg-primary/20', 'text-primary', 'neon-pulse');
      setTimeout(() => {
        document.getElementById('chat-main-input').value = "Simulated voice draft: How can I optimize code parameters?";
        btn.classList.remove('bg-primary/20', 'text-primary', 'neon-pulse');
      }, 2000);
    }
  }
}

function formatJiniMessage(text) {
  if (text.includes('🧠 JINI Brain Reasoning:')) {
    const parts = text.split('\n\n');
    const brainReasoning = parts[0].replace('🧠 JINI Brain Reasoning:\n', '');
    const actualResponse = parts.slice(1).join('\n\n') || '';
    
    return `
      <details name="brain-steps" class="mb-3 border border-primary/20 rounded-lg p-2.5 bg-primary/5 text-[11px]" open>
        <summary class="font-mono text-primary font-bold cursor-pointer outline-none select-none list-none flex justify-between items-center">
          <span>🧠 JINI Brain Reasoning Process</span>
          <span class="material-symbols-outlined text-xs">expand_more</span>
        </summary>
        <div class="mt-2 text-on-surface-variant font-mono space-y-1.5 whitespace-pre-wrap">${brainReasoning}</div>
      </details>
      <p class="text-xs leading-relaxed whitespace-pre-wrap">${actualResponse}</p>
    `;
  } else {
    return `<p class="text-xs leading-relaxed whitespace-pre-wrap">${text}</p>`;
  }
}

function appendChatMessageUI(sender, text) {
  const screen = document.getElementById('chat-message-screen');
  if (!screen) return;
  
  const outer = document.createElement('div');
  outer.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start items-start gap-2 max-w-[85%]'}`;
  
  const formattedText = formatJiniMessage(text);

  if (sender === 'user') {
    outer.innerHTML = `
      <div class="bg-secondary/15 border border-secondary/30 rounded-lg p-3 max-w-[80%] shadow-sm">
        ${formattedText}
      </div>
    `;
  } else {
    outer.innerHTML = `
      <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-primary/20 bg-surface-container-low">
        <img src="logo.png?v=1" alt="JINI" class="w-full h-full object-cover"/>
      </div>
      <div class="message-bubble-jini p-4 rounded-lg shadow-sm flex-grow">
        ${formattedText}
      </div>
    `;
  }
  screen.appendChild(outer);
  scrollChatBottom();
}

function sendChatMessage() {
  const input = document.getElementById('chat-main-input');
  if (!input) return;
  
  const text = input.value.trim();
  if (!text && STATE.activeUploadedFiles.length === 0) return;
  
  // Format prompt including uploaded file details if any
  let promptText = text;
  if (STATE.activeUploadedFiles.length > 0) {
    const fileNames = STATE.activeUploadedFiles.map(f => `[${f.name}]`).join(', ');
    promptText = `${promptText}\n\n*Attachments: ${fileNames}*`;
  }

  // Check for image upload scenario
  const imgFile = STATE.activeUploadedFiles.find(f => f.type === 'image');

  // Clear inputs
  input.value = '';
  document.getElementById('chat-char-counter').textContent = '0 chars';
  
  // Add to state & render user message
  const activeChat = STATE.chats[STATE.activeChatId];
  activeChat.messages.push({ sender: 'user', text: promptText });
  appendChatMessageUI('user', promptText);
  
  // Trigger loading typing indicator
  const screen = document.getElementById('chat-message-screen');
  const typingBubble = document.createElement('div');
  typingBubble.id = 'jini-typing-indicator';
  typingBubble.className = 'flex justify-start items-start gap-2 max-w-[85%]';
  typingBubble.innerHTML = `
    <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-primary/20 bg-surface-container-low">
      <img src="logo.png?v=1" alt="JINI" class="w-full h-full object-cover"/>
    </div>
    <div class="message-bubble-jini px-4 py-3 rounded-lg flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
      <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
      <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
    </div>
  `;
  screen.appendChild(typingBubble);
  scrollChatBottom();

  // Clear file attachments lists
  STATE.activeUploadedFiles = [];
  updateUploadedFilesUI();

  // Increment stats
  STATE.stats.chats++;
  document.getElementById('stat-chats').textContent = STATE.stats.chats;

  const processResponse = (replyText) => {
    // Remove typing indicator
    const ind = document.getElementById('jini-typing-indicator');
    if (ind) ind.remove();

    activeChat.messages.push({ sender: 'jini', text: replyText });
    appendChatMessageUI('jini', replyText);
    
    // Check if JINI learned anything from user statement
    checkOrganicLearning(text);

    // Speak response if voice active
    if (STATE.voiceState.speaking || STATE.activePage === 'voice') {
      const cleanSpokenText = replyText.includes('🧠 JINI Brain Reasoning:')
        ? replyText.split('\n\n')[1] || replyText
        : replyText;
      speakText(cleanSpokenText);
    }
  };

  if (imgFile && imgFile.fileRaw) {
    // Base64 OCR Vision request
    const reader = new FileReader();
    reader.onload = function(event) {
      const base64Data = event.target.result;
      fetch('/api/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': STATE.geminiApiKey || ''
        },
        body: JSON.stringify({
          image: base64Data,
          provider: STATE.provider,
          model: STATE.model
        })
      })
      .then(res => res.json())
      .then(data => {
        processResponse(data.text);
      })
      .catch(err => {
        console.error('Vision API error:', err);
        const ind = document.getElementById('jini-typing-indicator');
        if (ind) ind.remove();
        appendChatMessageUI('jini', '⚠️ Vision OCR upload failed. Verify local backend server status.');
      });
    };
    reader.readAsDataURL(imgFile.fileRaw);
  } else {
    // Standard chat API with Server-Sent Events (SSE) streaming
    (async () => {
      let accumulatedText = '';
      let textContainer = null;
      let outer = null;
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': STATE.geminiApiKey || ''
          },
          body: JSON.stringify({
            messages: activeChat.messages,
            personality: STATE.personality,
            brainMode: STATE.brainMode,
            provider: STATE.provider,
            model: STATE.model,
            stream: true
          })
        });

        const ind = document.getElementById('jini-typing-indicator');
        if (ind) ind.remove();

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Server error ${response.status}`);
        }

        // Append blank message bubble for streaming text
        outer = document.createElement('div');
        outer.className = 'flex justify-start items-start gap-2 max-w-[85%]';
        outer.innerHTML = `
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-primary/20 bg-surface-container-low">
            <img src="logo.png?v=1" alt="JINI" class="w-full h-full object-cover"/>
          </div>
          <div class="message-bubble-jini p-4 rounded-lg shadow-sm flex-grow">
            <div class="stream-text"></div>
          </div>
        `;
        screen.appendChild(outer);
        scrollChatBottom();
        textContainer = outer.querySelector('.stream-text');

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }
          accumulatedText = data.text || '';
          textContainer.innerHTML = formatJiniMessage(accumulatedText);
          scrollChatBottom();
        } else {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                  const chunkText = parsed.text;
                  if (chunkText) {
                    accumulatedText += chunkText;
                    textContainer.innerHTML = formatJiniMessage(accumulatedText);
                    scrollChatBottom();
                  }
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunk lines
                }
              }
            }
          }
        }

        // Push completed message to state conversation history
        activeChat.messages.push({ sender: 'jini', text: accumulatedText });
        checkOrganicLearning(text);

        // Speak response if voice active
        if (STATE.voiceState.speaking || STATE.activePage === 'voice') {
          const cleanSpokenText = accumulatedText.includes('🧠 JINI Brain Reasoning:')
            ? accumulatedText.split('\n\n')[1] || accumulatedText
            : accumulatedText;
          speakText(cleanSpokenText);
        }

      } catch (err) {
        console.error('Chat API SSE stream error:', err);
        const ind = document.getElementById('jini-typing-indicator');
        if (ind) ind.remove();
        
        if (textContainer) {
          textContainer.innerHTML = `<span class="text-error font-semibold">⚠️ Synaptic network error: ${err.message}</span>`;
        } else {
          appendChatMessageUI('jini', `⚠️ Synaptic network error: ${err.message}`);
        }
      }
    })();
  }
}

// --- SIMULATED RESPOND ENGINE ---
function getSimulatedResponse(input) {
  const query = input.toLowerCase();
  let text = '';
  let plainText = '';
  
  // JINI Brain reasoning prefix steps
  const reasoning = "🧠 JINI Brain Reasoning:\n- Parse user command sequence.\n- Cross reference synaptic preferences: " + STATE.user.name + " profile.\n- Retrieve multi-tool context for tone '" + STATE.personality + "'.\n- Synthesize custom structured response.";

  // Matching specific user queries
  if (query.includes('email') || query.includes('thank my team')) {
    plainText = "Subject: Legendary Work Team!\n\nHi team,\n\nI wanted to express my sincere gratitude for your incredible efforts in bringing our latest project to completion ahead of schedule. Your creativity and dedication have made this launch an absolute triumph. Let's keep this momentum going!\n\nBest regards,\n" + STATE.user.name;
    text = STATE.brainMode ? `${reasoning}\n\n${plainText}` : plainText;
  }
  else if (query.includes('quantum') || query.includes('physics')) {
    plainText = "Quantum computing is like building sandcastles with magic blocks that can be in multiple places at the same time. While regular computers use standard switches (bits) that are either ON or OFF, quantum computers use qubits which can be both ON and OFF simultaneously (superposition). This allows them to solve massive puzzles instantly!";
    text = STATE.brainMode ? `${reasoning}\n\n${plainText}` : plainText;
  }
  else if (query.includes('jwt') || query.includes('token') || query.includes('node.js')) {
    plainText = "Here is a clean Node.js implementation to sign JSON Web Tokens:\n\nconst jwt = require('jsonwebtoken');\n\nfunction generateUserToken(userPayload) {\n  const secretKey = process.env.JWT_SECRET || 'nebula_glow_key';\n  return jwt.sign(userPayload, secretKey, { expiresIn: '24h' });\n}\n\nThis token will expire automatically after 24 hours.";
    text = STATE.brainMode ? `${reasoning}\n\n${plainText}` : plainText;
  }
  else if (query.includes('linkedin') || query.includes('post')) {
    plainText = "✨ The future is context-aware! ✨\n\nImagine an AI companion that actually remembers your style, layout preferences, and workflow habits rather than resetting every single session.\n\nThat is exactly what we are building with JINI. Complete sync across research, tools, and tasks. Time to level up.\n\n#AICompanion #Productivity #FutureTech #EdTech";
    text = STATE.brainMode ? `${reasoning}\n\n${plainText}` : plainText;
  }
  else {
    // Default variations based on personality
    const responses = {
      friendly: "Yo! That is super interesting. I've logged that query in my active neural buffer. How else can we collaborate on your workspaces today, bestie?",
      professional: "Thank you for the prompt. I have processed the inputs using the current intelligence module. Please let me know how you would like to proceed with the execution steps.",
      coding: "Syntax check passed. That approach looks optimized. Let me know if you need to draft unit tests, configure environment variables, or build custom routes for this codebase.",
      academic: "A thorough review of the criteria indicates a strong correlation between the subjects. Let's break down the definitions further if you need step-by-step notes.",
      creative: "A spark of inspiration! We can weave this theme into your notes, story boards, or concept drafts. Let's paint this obsidian canvas with primary neons."
    };
    plainText = responses[STATE.personality] || responses.friendly;
    text = STATE.brainMode ? `${reasoning}\n\n${plainText}` : plainText;
  }

  return { text, plainText };
}

// Organic Memory learning detection
function checkOrganicLearning(text) {
  const query = text.toLowerCase();
  let learnedFact = null;
  
  if (query.includes('i am a') || query.includes('i work as a')) {
    const job = text.substring(text.toLowerCase().indexOf('as a') + 4).trim();
    if (job) learnedFact = `Works as ${job}`;
  }
  else if (query.includes('favorite color is')) {
    const color = text.substring(text.toLowerCase().indexOf('color is') + 8).trim();
    if (color) learnedFact = `Favorite color: ${color}`;
  }
  else if (query.includes('my name is')) {
    const name = text.substring(text.toLowerCase().indexOf('name is') + 8).trim();
    if (name) {
      STATE.user.name = name;
      updateProfileName(name);
      learnedFact = `User name corrected to ${name}`;
    }
  }

  if (learnedFact) {
    const newId = STATE.user.memory.length + 1;
    STATE.user.memory.push({ id: newId, fact: learnedFact });
    saveStateToStorage();
    renderMemoryLogs();
    
    // Alert user
    addNotification('AI Memory Synced', `JINI learned: "${learnedFact}"`);
  }
}

// --- WORKSPACE FOLDER CRUD ---
function renderFolders() {
  const list = document.getElementById('workspace-folders-list');
  if (!list) return;
  
  // Save first All Projects tab
  const allTab = list.querySelector('.workspace-folder-tab');
  list.innerHTML = '';
  if (allTab) list.appendChild(allTab);
  
  STATE.folders.forEach(folder => {
    if (folder.id === 'all') return; // Handled statically
    
    const btn = document.createElement('button');
    btn.className = `w-full text-left p-2.5 rounded-lg text-xs font-semibold flex justify-between items-center workspace-folder-tab ${STATE.activeFolderId === folder.id ? 'bg-primary/10 border border-primary/20 text-primary active-folder' : 'hover:bg-surface-bright/20'}`;
    btn.onclick = () => selectWorkspaceFolder(folder.id);
    btn.innerHTML = `
      <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm text-primary">${folder.icon}</span> ${folder.name}</span>
      <span class="text-[9px] px-1.5 py-0.2 bg-surface-bright/35 rounded font-mono">${folder.count}</span>
    `;
    list.appendChild(btn);
  });
}

function selectWorkspaceFolder(folderId) {
  STATE.activeFolderId = folderId;
  
  // Reset tabs visual state
  document.querySelectorAll('.workspace-folder-tab').forEach(btn => {
    btn.classList.remove('bg-primary/10', 'border', 'border-primary/20', 'text-primary', 'active-folder');
    btn.classList.add('hover:bg-surface-bright/20');
  });

  // Re-apply active class to selected button
  const folder = STATE.folders.find(f => f.id === folderId);
  const titleEl = document.getElementById('selected-folder-title');
  if (titleEl && folder) {
    titleEl.textContent = folder.name;
  }

  renderFolders();
  renderProjects();
}

function promptCreateFolder() {
  const name = prompt('Enter new folder workspace name:');
  if (name) {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    STATE.folders.push({
      id: id,
      name: name,
      icon: 'folder',
      count: 0
    });
    saveStateToStorage();
    renderFolders();
    addNotification('Folder Created', `Workspace folder '${name}' added successfully.`);
  }
}

function renderProjects() {
  const grid = document.getElementById('workspace-projects-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // Filter by active folder
  const filtered = STATE.activeFolderId === 'all' 
    ? STATE.projects 
    : STATE.projects.filter(p => p.folderId === STATE.activeFolderId);
    
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-2 text-center p-8 bg-surface-bright/20 rounded-lg border border-dashed border-outline-variant/30 text-xs text-on-surface-variant">
        No projects or documents stored in this workspace folder yet.
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'glass-card p-5 flex flex-col justify-between h-40';
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-xl">${p.icon}</span>
        </div>
        <button class="text-on-surface-variant hover:text-error transition-colors" onclick="deleteProjectAsset(${p.id})">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
      <div class="mt-4 space-y-1">
        <h4 class="font-bold text-sm truncate">${p.title}</h4>
        <div class="flex justify-between items-center text-[10px] font-mono text-on-surface-variant/80">
          <span class="outline-chip px-1.5 py-0.2 rounded">${p.tag}</span>
          <span>${p.date}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Update count elements
  const allCount = document.getElementById('all-folders-count');
  if (allCount) allCount.textContent = STATE.projects.length;
}

function promptCreateProject() {
  const title = prompt('Enter asset project title:');
  if (!title) return;
  
  const tag = prompt('Enter category tag (e.g. MARKETING, DESIGN, DATA):', 'ASSET');
  if (!tag) return;

  const newProj = {
    id: Date.now(),
    folderId: STATE.activeFolderId === 'all' ? 'writing' : STATE.activeFolderId,
    title: title,
    tag: tag.toUpperCase(),
    date: 'Just now',
    icon: 'draft'
  };

  STATE.projects.push(newProj);
  
  // Increment count in folder
  const folder = STATE.folders.find(f => f.id === newProj.folderId);
  if (folder) folder.count++;

  saveStateToStorage();
  renderProjects();
  renderFolders();
  addNotification('Asset Uploaded', `'${title}' added to JINI Workspace.`);
}

function deleteProjectAsset(id) {
  const projIdx = STATE.projects.findIndex(p => p.id === id);
  if (projIdx > -1) {
    const proj = STATE.projects[projIdx];
    
    // Decrement count
    const folder = STATE.folders.find(f => f.id === proj.folderId);
    if (folder && folder.count > 0) folder.count--;
    
    STATE.projects.splice(projIdx, 1);
    saveStateToStorage();
    renderProjects();
    renderFolders();
    addNotification('Asset Deleted', 'Item removed from cloud storage.');
  }
}

// Share link triggers
function showShareWorkspaceModal() {
  const code = 'ws_' + Math.random().toString(36).substring(2, 10);
  document.getElementById('workspace-share-link').value = `https://jini.ai/workspace/share/${code}`;
  showModal('share-workspace-modal');
}

function copyShareWorkspaceLink() {
  const link = document.getElementById('workspace-share-link');
  if (link) {
    link.select();
    navigator.clipboard.writeText(link.value);
    addNotification('Link Copied', 'Group sync share link copied to clipboard.');
  }
}

// --- TOOLS NAVIGATION & SUBPANELS ---
function switchToolSubtab(tabId, button) {
  STATE.activeToolSubtab = tabId;
  
  // Visual button class updates
  document.querySelectorAll('.tool-subtab').forEach(btn => {
    btn.className = 'px-4 py-2.5 border-b-2 border-transparent hover:border-outline font-semibold text-xs uppercase tracking-wider text-on-surface-variant tool-subtab';
  });
  
  button.className = 'px-4 py-2.5 border-b-2 border-primary font-bold text-xs uppercase tracking-wider text-primary tool-subtab active';

  // Toggle active subpanel
  document.querySelectorAll('.tool-subpanel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  const target = document.getElementById(`tool-subpanel-${tabId}`);
  if (target) target.classList.remove('hidden');
}

// Adapt form inputs dynamically depending on type selection
function adaptWritingFormLabels(type) {
  const titleLabel = document.getElementById('writing-label-title');
  const promptLabel = document.getElementById('writing-label-prompt');
  const titleInput = document.getElementById('writing-input-title');
  const promptInput = document.getElementById('writing-input-prompt');

  const configs = {
    email: { t: 'Subject / Focus', p: 'Points to cover', pt: 'e.g. Requesting a meeting reschedule', pp: 'Propose Wednesday 14:00. Detail timezone discrepancies...' },
    essay: { t: 'Essay Topic / Thesis Statement', p: 'Research constraints & details', pt: 'e.g. Ethics of ambient genetic computing', pp: 'Outline structural pros, cons, and regulatory boundaries...' },
    blog: { t: 'Blog Headline / Subject', p: 'SEO Keywords & sections', pt: 'e.g. 5 Habits of High Performance Coders', pp: 'Include mentions of workspace structure, focus zones, and JINI...' },
    social: { t: 'Social Platform Target', p: 'Vibe & description summary', pt: 'e.g. LinkedIn, Twitter, Instagram', pp: 'Share the launch of our new premium mascot visualizer...' },
    resume: { t: 'Desired Job Title', p: 'Key Skills & experience history', pt: 'e.g. Senior Frontend Web Engineer', pp: 'Vanilla JS, CSS layout grids, Google Chrome DevTools audits...' },
    coverletter: { t: 'Job Title & Company', p: 'Why you fit the role parameters', pt: 'e.g. UX Designer at Space Exploration Corp', pp: 'Passionate about minimal luxury dashboards and dark mode interfaces...' },
    story: { t: 'Story Theme / Protagonist', p: 'Plot twist / Scene details', pt: 'e.g. Cyberpunk detective solves neural mystery', pp: 'A neon-purple rain falls on the glass skyscraper while she parses logs...' },
    grammar: { t: 'Language Context', p: 'Text containing mistakes', pt: 'e.g. Professional American English', pp: 'Enter the draft paragraph with typos here...' },
    summary: { t: 'Focus Depth', p: 'Long text passage to compress', pt: 'e.g. Detailed key insights summary', pp: 'Paste documents, research sheets, or blog structures here...' }
  };

  const config = configs[type] || configs.email;
  if (titleLabel) titleLabel.textContent = config.t;
  if (promptLabel) promptLabel.textContent = config.p;
  if (titleInput) titleInput.placeholder = config.pt;
  if (promptInput) promptInput.placeholder = config.pp;
}

function executeWritingTool() {
  const type = document.getElementById('writing-tool-type').value;
  const title = document.getElementById('writing-input-title').value.trim();
  const promptText = document.getElementById('writing-input-prompt').value.trim();
  const tone = document.getElementById('writing-input-tone').value;
  const length = document.getElementById('writing-input-length').value;

  if (!title || !promptText) {
    alert('Please fill out both form inputs before generating drafts.');
    return;
  }

  // Display generating indicator
  const out = document.getElementById('writing-output-area');
  out.textContent = "JINI Writing Agents are building the drafts... Synchronizing context buffers...";
  
  // Increment stats
  STATE.stats.toolsRun++;
  document.getElementById('stat-tools').textContent = STATE.stats.toolsRun;

  fetch('/api/writing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': STATE.geminiApiKey || ''
    },
    body: JSON.stringify({
      type,
      title,
      instructions: promptText,
      tone,
      length,
      provider: STATE.provider,
      model: STATE.model
    })
  })
  .then(res => res.json())
  .then(data => {
    out.textContent = data.text;
    document.getElementById('writing-word-counter').textContent = data.text.split(/\s+/).length;
    addNotification('AI content written', `Draft generated via JINI ${type} tool.`);
    addActivityLog(`Generated ${type} Draft`, 'AI Writing Suite', 'Just now', 'auto_awesome');
  })
  .catch(err => {
    console.error('Writing API error:', err);
    out.textContent = "⚠️ Failed to compile AI writer results. Check local API connection.";
  });
}

function copyWritingOutput() {
  const text = document.getElementById('writing-output-area').textContent;
  navigator.clipboard.writeText(text);
  addNotification('Copied', 'Draft copied to clipboard.');
}

// --- AI LEARNING SUBMODULES ---
function switchLearningModule(modId, btn) {
  STATE.activeLearningModule = modId;
  
  // Visual buttons state
  document.querySelectorAll('.learning-module-btn').forEach(el => {
    el.className = 'w-full text-left p-3 rounded-lg text-xs font-semibold hover:bg-surface-bright/20 flex justify-between items-center learning-module-btn';
    const icon = el.querySelector('.material-symbols-outlined');
    if (icon) icon.className = 'material-symbols-outlined text-sm text-on-surface-variant';
  });

  btn.className = 'w-full text-left p-3 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 flex justify-between items-center learning-module-btn active';
  const activeIcon = btn.querySelector('.material-symbols-outlined');
  if (activeIcon) activeIcon.className = 'material-symbols-outlined text-sm text-primary';

  // Toggle sections
  document.querySelectorAll('.learn-module-view').forEach(view => {
    view.classList.add('hidden');
  });
  
  const target = document.getElementById(`learn-module-${modId}`);
  if (target) target.classList.remove('hidden');
}

function generateTopicExplanation() {
  const topic = document.getElementById('explain-topic-input').value.trim();
  if (!topic) return;

  const out = document.getElementById('explain-output');
  out.textContent = `Analyzing topic '${topic}'... Organizing conceptual hierarchy...`;

  fetch('/api/learning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': STATE.geminiApiKey || ''
    },
    body: JSON.stringify({
      module: 'explain',
      topic,
      provider: STATE.provider,
      model: STATE.model
    })
  })
  .then(res => res.json())
  .then(data => {
    out.innerHTML = `
      <h4 class="font-bold text-sm text-primary mb-1">${topic.toUpperCase()}</h4>
      <p class="text-xs leading-relaxed whitespace-pre-wrap">${data.text}</p>
    `;
    addActivityLog(`Explained ${topic}`, 'AI Learning Assistant', 'Just now', 'school');
  })
  .catch(err => {
    console.error('Learning Explainer error:', err);
    out.textContent = "⚠️ Failed to fetch academic explainer details.";
  });
}

function solveMathProblem() {
  const prob = document.getElementById('math-problem-input').value.trim();
  if (!prob) return;

  const out = document.getElementById('math-output');
  out.textContent = `Parsing numeric tokens for '${prob}'... Running JINI Brain reasoning...`;

  fetch('/api/learning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': STATE.geminiApiKey || ''
    },
    body: JSON.stringify({
      module: 'math',
      topic: prob,
      provider: STATE.provider,
      model: STATE.model
    })
  })
  .then(res => res.json())
  .then(data => {
    out.innerHTML = `
      <div class="text-primary font-bold border-b border-outline-variant/20 pb-1 mb-2">Math Solver Results</div>
      <p class="text-xs leading-relaxed whitespace-pre-wrap font-mono">${data.text}</p>
    `;
    addActivityLog(`Solved Equation`, 'AI Learning Assistant', 'Just now', 'calculate');
  })
  .catch(err => {
    console.error('Math solver error:', err);
    out.textContent = "⚠️ Failed to calculate math problem solution.";
  });
}

function translateText() {
  const text = document.getElementById('translator-text').value.trim();
  const lang = document.getElementById('translator-lang').value;
  if (!text) return;

  const out = document.getElementById('translator-output');
  out.textContent = 'Translating string...';

  fetch('/api/learning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': STATE.geminiApiKey || ''
    },
    body: JSON.stringify({
      module: 'translator',
      text,
      targetLang: lang,
      provider: STATE.provider,
      model: STATE.model
    })
  })
  .then(res => res.json())
  .then(data => {
    out.innerHTML = `<strong>[${lang.toUpperCase()}]:</strong> ${data.text.replace('[Translation]:', '').trim()}`;
    addActivityLog(`Translated to ${lang}`, 'AI Translator', 'Just now', 'translate');
  })
  .catch(err => {
    console.error('Translator API error:', err);
    out.textContent = "⚠️ Failed to execute translation.";
  });
}

function flipFlashcard(card) {
  card.classList.toggle('flashcard-flipped');
}

// Flashcards arrays
const FLASHCARDS = [
  { q: "What is the capital of Spain?", a: "Madrid" },
  { q: "What HTML element creates native disclosures?", a: "<details> and <summary>" },
  { q: "What does OLED surface layout optimization use?", a: "Deep Obsidian surface #0b1326" },
  { q: "How do you trigger focus boundaries dynamically?", a: "Via the global HTML [inert] attribute" }
];
let activeCardIdx = 0;

function createQuiz() {
  const qContainer = document.getElementById('quiz-container');
  qContainer.classList.remove('hidden');
  
  const options = document.getElementById('quiz-options');
  options.innerHTML = 'Compiling AI Quiz...';
  document.getElementById('quiz-question').textContent = 'Loading custom web questions...';
  document.getElementById('quiz-status').classList.add('hidden');

  fetch('/api/learning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': STATE.geminiApiKey || ''
    },
    body: JSON.stringify({
      module: 'quiz',
      provider: STATE.provider,
      model: STATE.model
    })
  })
  .then(res => res.json())
  .then(data => {
    try {
      const parsed = JSON.parse(data.text);
      document.getElementById('quiz-question').textContent = parsed.question;
      options.innerHTML = '';
      
      parsed.options.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'p-2 bg-surface-bright/30 border border-outline-variant/15 rounded-lg text-left hover:border-primary/50 transition-colors';
        btn.textContent = ans;
        btn.onclick = () => submitQuizAnswer(ans, parsed.answer);
        options.appendChild(btn);
      });
    } catch(e) {
      console.error('Failed to parse quiz response:', e);
      options.innerHTML = 'JSON compilation error. Try compiling again.';
    }
  })
  .catch(err => {
    console.error('Quiz loader error:', err);
    options.innerHTML = '⚠️ Local network sync failed.';
  });
}

function submitQuizAnswer(selected, correct) {
  const status = document.getElementById('quiz-status');
  status.classList.remove('hidden');
  
  if (selected === correct) {
    status.textContent = "✓ Correct! Synaptic memory increased.";
    status.className = "text-xs font-semibold text-[#39ff14] text-center mt-2";
    
    // Cycle flashcard
    activeCardIdx = (activeCardIdx + 1) % FLASHCARDS.length;
    setTimeout(() => {
      document.getElementById('flashcard-front-text').textContent = FLASHCARDS[activeCardIdx].q;
      document.getElementById('flashcard-back-text').textContent = FLASHCARDS[activeCardIdx].a;
      createQuiz();
    }, 1500);
  } else {
    status.textContent = "✗ Incorrect. Try checking another block.";
    status.className = "text-xs font-semibold text-red-400 text-center mt-2";
  }
}

// --- NOTES MANAGER (CRUD) ---
function renderNotes() {
  const list = document.getElementById('productivity-notes-list');
  if (!list) return;
  list.innerHTML = '';

  STATE.notes.forEach(note => {
    const item = document.createElement('div');
    item.className = `p-2 bg-surface-bright/20 border border-outline-variant/10 rounded-lg text-xs cursor-pointer flex justify-between items-center hover:border-primary/40 ${STATE.activeNoteId === note.id ? 'border-primary' : ''}`;
    item.onclick = () => openNoteForEdit(note.id);
    item.innerHTML = `
      <div class="min-w-0 pr-2">
        <span class="font-bold block truncate">${note.title}</span>
        <span class="text-[9px] text-on-surface-variant/70 truncate block">${note.content}</span>
      </div>
      <button class="text-on-surface-variant hover:text-error" onclick="deleteNote(${note.id}); event.stopPropagation();"><span class="material-symbols-outlined text-xs">delete</span></button>
    `;
    list.appendChild(item);
  });
}

function filterNotes(query) {
  const filtered = STATE.notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()));
  const list = document.getElementById('productivity-notes-list');
  list.innerHTML = '';

  filtered.forEach(note => {
    const item = document.createElement('div');
    item.className = 'p-2 bg-surface-bright/20 border border-outline-variant/10 rounded-lg text-xs cursor-pointer flex justify-between items-center hover:border-primary/40';
    item.onclick = () => openNoteForEdit(note.id);
    item.innerHTML = `
      <div class="min-w-0 pr-2">
        <span class="font-bold block truncate">${note.title}</span>
        <span class="text-[9px] text-on-surface-variant/70 truncate block">${note.content}</span>
      </div>
      <button class="text-on-surface-variant hover:text-error" onclick="deleteNote(${note.id}); event.stopPropagation();"><span class="material-symbols-outlined text-xs">delete</span></button>
    `;
    list.appendChild(item);
  });
}

function addNewNote() {
  const newNote = {
    id: Date.now(),
    title: 'New Note Draft',
    content: 'Enter writing points...'
  };
  STATE.notes.push(newNote);
  saveStateToStorage();
  renderNotes();
  openNoteForEdit(newNote.id);
  addNotification('Note Added', 'Created new local scrap notes.');
}

function openNoteForEdit(id) {
  STATE.activeNoteId = id;
  renderNotes();
  
  const note = STATE.notes.find(n => n.id === id);
  if (note) {
    document.getElementById('active-note-editor').classList.remove('hidden');
    document.getElementById('note-edit-title').value = note.title;
    document.getElementById('note-edit-content').value = note.content;
  }
}

function saveNoteEdits() {
  const title = document.getElementById('note-edit-title').value.trim();
  const content = document.getElementById('note-edit-content').value.trim();
  
  const note = STATE.notes.find(n => n.id === STATE.activeNoteId);
  if (note) {
    note.title = title || 'Untitled Note';
    note.content = content || '';
    saveStateToStorage();
    renderNotes();
    closeNoteEditor();
    addNotification('Note Saved', 'Sync complete for note entries.');
  }
}

function closeNoteEditor() {
  document.getElementById('active-note-editor').classList.add('hidden');
  STATE.activeNoteId = null;
  renderNotes();
}

function deleteNote(id) {
  const idx = STATE.notes.findIndex(n => n.id === id);
  if (idx > -1) {
    STATE.notes.splice(idx, 1);
    saveStateToStorage();
    renderNotes();
    if (STATE.activeNoteId === id) closeNoteEditor();
    addNotification('Note Deleted', 'Scrap notes removed.');
  }
}

// --- TODO LIST CHECKLISTS ---
function renderTodos() {
  const container = document.getElementById('productivity-todo-list');
  if (!container) return;
  container.innerHTML = '';

  if (STATE.todos.length === 0) {
    container.innerHTML = `<p class="text-[10px] text-on-surface-variant/50 text-center py-4">No remaining tasks</p>`;
    return;
  }

  STATE.todos.forEach(todo => {
    const item = document.createElement('div');
    item.className = 'flex justify-between items-center text-xs bg-surface-bright/20 p-2 rounded border border-outline-variant/5 hover:border-primary/20';
    item.innerHTML = `
      <label class="flex items-center gap-2 cursor-pointer min-w-0 flex-grow">
        <input type="checkbox" class="rounded border-outline-variant/30 text-primary focus:ring-0 w-3.5 h-3.5" ${todo.completed ? 'checked' : ''} onchange="toggleTodoStatus(${todo.id})">
        <span class="${todo.completed ? 'line-through text-on-surface-variant/60' : ''} truncate">${todo.text}</span>
      </label>
      <button class="text-on-surface-variant hover:text-error" onclick="deleteTodo(${todo.id})">
        <span class="material-symbols-outlined text-xs">close</span>
      </button>
    `;
    container.appendChild(item);
  });
}

function addNewTodo() {
  const input = document.getElementById('todo-input-text');
  const text = input.value.trim();
  if (text) {
    STATE.todos.push({
      id: Date.now(),
      text: text,
      completed: false
    });
    input.value = '';
    saveStateToStorage();
    renderTodos();
    addNotification('Task Added', `Todo '${text}' added to daily checklist.`);
  }
}

function toggleTodoStatus(id) {
  const todo = STATE.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveStateToStorage();
    renderTodos();
  }
}

function deleteTodo(id) {
  const idx = STATE.todos.findIndex(t => t.id === id);
  if (idx > -1) {
    STATE.todos.splice(idx, 1);
    saveStateToStorage();
    renderTodos();
  }
}

// --- HABIT CHECKLIST TRACKER ---
function renderHabits() {
  const container = document.getElementById('habit-list-container');
  if (!container) return;
  container.innerHTML = '';

  STATE.habits.forEach(h => {
    const item = document.createElement('label');
    item.className = 'flex items-center justify-between cursor-pointer bg-surface-bright/20 p-2 rounded border border-outline-variant/5';
    item.innerHTML = `
      <span class="font-semibold">${h.text}</span>
      <input type="checkbox" class="rounded-full border-outline-variant/30 text-primary focus:ring-0 w-4 h-4" ${h.completed ? 'checked' : ''} onchange="toggleHabitStatus(${h.id})">
    `;
    container.appendChild(item);
  });

  calculateHabitsProgress();
}

function toggleHabitStatus(id) {
  const habit = STATE.habits.find(h => h.id === id);
  if (habit) {
    habit.completed = !habit.completed;
    saveStateToStorage();
    renderHabits();
  }
}

function calculateHabitsProgress() {
  const total = STATE.habits.length;
  const completed = STATE.habits.filter(h => h.completed).length;
  
  let percentage = 0;
  if (total > 0) percentage = Math.round((completed / total) * 100);
  
  document.getElementById('habit-progress-text').textContent = `${percentage}%`;
  
  // Calculate SVG circular stroke length: radius is 8, circumference is 2 * pi * r = 50.2
  const circle = document.getElementById('habit-progress-circle');
  if (circle) {
    const offset = 50.2 - (percentage / 100) * 50.2;
    circle.style.strokeDashoffset = offset;
  }
}

// --- DEEP RESEARCH PROFILES ---
function executeDeepResearch() {
  const query = document.getElementById('research-query-input').value.trim();
  if (!query) return;

  const logs = document.getElementById('research-status-logs');
  const bar = document.getElementById('research-progress-bar');
  const pct = document.getElementById('research-progress-pct');
  const stream = document.getElementById('research-log-stream');
  const wrapper = document.getElementById('research-report-wrapper');

  logs.classList.remove('hidden');
  wrapper.classList.add('hidden');
  
  let progress = 0;
  stream.innerHTML = '⚡ Initiating deep crawler sync...';
  
  let searchResultText = '';
  let searchSources = [];
  let fetchError = false;

  fetch('/api/research', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': STATE.geminiApiKey || ''
    },
    body: JSON.stringify({
      query,
      provider: STATE.provider,
      model: STATE.model
    })
  })
  .then(res => res.json())
  .then(data => {
    searchResultText = data.text;
    searchSources = data.sources || [];
  })
  .catch(err => {
    console.error('Research API error:', err);
    fetchError = true;
  });

  const interval = setInterval(() => {
    progress += 20;
    bar.style.width = `${progress}%`;
    pct.textContent = `${progress}%`;

    const logMessages = {
      20: '⚡ Fetching web search indices for "' + query + '"...',
      40: '⚡ Crawling scientific research pages & documentation citations...',
      60: '⚡ Extracting relevant semantic layout points...',
      80: '⚡ Constructing aggregated report outline structure...',
      100: '✓ Citations compiled. Report generated.'
    };

    stream.innerHTML += `<br/>${logMessages[progress]}`;
    stream.scrollTop = stream.scrollHeight;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        logs.classList.add('hidden');
        wrapper.classList.remove('hidden');
        
        if (fetchError) {
          document.getElementById('research-report-output').textContent = "⚠️ Failed to execute web search grounding. Verify backend connection.";
          return;
        }

        const renderReport = () => {
          if (!searchResultText) {
            setTimeout(renderReport, 200);
            return;
          }
          
          let reportContent = searchResultText;
          if (searchSources.length > 0) {
            reportContent += "\n\n## Web Sources & References\n";
            searchSources.forEach((src, idx) => {
              reportContent += `${idx + 1}. [${src.title}](${src.url})\n`;
            });
          }
          document.getElementById('research-report-output').textContent = reportContent;
          addActivityLog(`Researched "${query}"`, 'AI Research Mode', 'Just now', 'travel_explore');
        };
        renderReport();
      }, 500);
    }
  }, 1000);
}

function copyResearchReport() {
  const text = document.getElementById('research-report-output').textContent;
  navigator.clipboard.writeText(text);
  addNotification('Copied Report', 'Citations draft copied.');
}

// --- VOICE SYNC ENGINE ---
function toggleVoiceConnection() {
  const btn = document.getElementById('voice-activation-circle');
  const icon = document.getElementById('voice-icon-symbol');
  const text = document.getElementById('voice-status-heading');
  const pulse = document.getElementById('voice-ring-pulse');
  const wave = document.getElementById('voice-audio-wave');
  const logs = document.getElementById('voice-realtime-transcripts');
  const interrupt = document.getElementById('voice-interrupt-btn');

  if (!STATE.voiceState.active) {
    // Connect Call
    STATE.voiceState.active = true;
    btn.classList.add('border-primary', 'shadow-[0_0_25px_var(--primary)]');
    icon.textContent = 'call_end';
    icon.classList.add('text-primary');
    text.textContent = 'Synced. Speak with JINI hands-free.';
    pulse.classList.remove('hidden');
    wave.classList.add('speaking');
    logs.innerHTML = '"Connected. Hello! I am JINI. How can I help you vibing today?"';
    interrupt.classList.remove('hidden');

    // Speech Synthesis Greeting
    speakText("Hello! I am JINI. How can I help you vibing today?");
  } else {
    // Disconnect
    STATE.voiceState.active = false;
    btn.className = 'w-44 h-44 rounded-full border border-primary/20 flex items-center justify-center bg-gradient-to-tr from-primary/10 to-secondary/10 relative cursor-pointer hover:border-primary/50 group transition-all duration-300';
    icon.textContent = 'call';
    icon.classList.remove('text-primary');
    text.textContent = 'Call disconnected. Setup is ready.';
    pulse.classList.add('hidden');
    wave.classList.remove('speaking');
    logs.innerHTML = '"Press call above to speak with JINI in hands-free companion mode."';
    interrupt.classList.add('hidden');
    
    // Stop synthesis
    window.speechSynthesis.cancel();
  }
}

function changeVoiceSetting() {
  const val = document.getElementById('voice-identity-select').value;
  STATE.voiceState.identity = val;
  addNotification('Voice Profile Switched', `Output settings mapped to ${val}`);
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Clear previous speech
    
    const utter = new SpeechSynthesisUtterance(text);
    
    // Set pitch & speed parameters based on identity selector
    const id = STATE.voiceState.identity;
    if (id === 'Aria') {
      utter.pitch = 1.2;
      utter.rate = 1.0;
    } else if (id === 'Leo') {
      utter.pitch = 0.9;
      utter.rate = 1.05;
    } else if (id === 'Nova') {
      utter.pitch = 0.75;
      utter.rate = 0.95;
    } else if (id === 'Jax') {
      utter.pitch = 1.4;
      utter.rate = 1.25;
    }

    utter.onstart = () => {
      STATE.voiceState.speaking = true;
      document.getElementById('voice-audio-wave').classList.add('speaking');
    };
    
    utter.onend = () => {
      STATE.voiceState.speaking = false;
      document.getElementById('voice-audio-wave').classList.remove('speaking');
      
      // If hands-free is enabled, prompt user input
      if (document.getElementById('voice-hands-free').checked && STATE.voiceState.active) {
        startVoiceDictationListening();
      }
    };

    window.speechSynthesis.speak(utter);
  }
}

function startVoiceDictationListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && STATE.voiceState.active) {
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    
    rec.onstart = () => {
      document.getElementById('voice-realtime-transcripts').innerHTML = '<span class="text-secondary font-bold">Listening...</span>';
    };
    
    rec.onresult = (e) => {
      const val = e.results[0][0].transcript;
      document.getElementById('voice-realtime-transcripts').textContent = `"${val}"`;
      
      // Send to LLM
      setTimeout(() => {
        const reply = getSimulatedResponse(val);
        document.getElementById('voice-realtime-transcripts').innerHTML = `JINI: "${reply.plainText}"`;
        speakText(reply.plainText);
      }, 1000);
    };

    rec.onerror = () => {
      document.getElementById('voice-realtime-transcripts').textContent = '"(Ambient silence. Speak to prompt JINI)"';
    };

    rec.start();
  }
}

function interruptVoiceOutput() {
  window.speechSynthesis.cancel();
  STATE.voiceState.speaking = false;
  document.getElementById('voice-audio-wave').classList.remove('speaking');
  document.getElementById('voice-realtime-transcripts').innerHTML = '<span class="text-red-400 font-bold">Speech Interrupted.</span>';
}

// --- PROFILE SETTINGS MANAGER ---
function updateProfileName(val) {
  STATE.user.name = val || 'Divyansh';
  document.getElementById('profile-display-name').textContent = STATE.user.name;
  document.getElementById('popover-name').textContent = STATE.user.name;
  document.getElementById('popover-avatar').textContent = STATE.user.name[0].toUpperCase();
  document.getElementById('profile-main-avatar').textContent = STATE.user.name[0].toUpperCase();
  document.getElementById('header-avatar-container').textContent = STATE.user.name[0].toUpperCase();
}

function saveGeminiKey(key) {
  STATE.geminiApiKey = key.trim();
  saveStateToStorage();
}

function toggleKeyVisibility() {
  const input = document.getElementById('pref-gemini-key');
  const icon = document.getElementById('key-visibility-icon');
  if (input && icon) {
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = 'visibility_off';
    } else {
      input.type = 'password';
      icon.textContent = 'visibility';
    }
  }
}

function setThemeMode(mode) {
  STATE.theme = mode;
  const html = document.querySelector('html');
  const btnDark = document.getElementById('theme-btn-dark');
  const btnLight = document.getElementById('theme-btn-light');
  const quickIcon = document.getElementById('quick-theme-icon');

  if (mode === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    if (btnLight) btnLight.className = 'flex-1 text-xs py-2 rounded-lg font-bold border border-primary bg-primary/10 text-primary';
    if (btnDark) btnDark.className = 'flex-1 text-xs py-2 rounded-lg font-semibold border border-outline-variant/30 text-on-surface-variant';
    if (quickIcon) quickIcon.textContent = 'dark_mode';
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    if (btnDark) btnDark.className = 'flex-1 text-xs py-2 rounded-lg font-bold border border-primary bg-primary/10 text-primary';
    if (btnLight) btnLight.className = 'flex-1 text-xs py-2 rounded-lg font-semibold border border-outline-variant/30 text-on-surface-variant';
    if (quickIcon) quickIcon.textContent = 'light_mode';
  }
  
  saveStateToStorage();
}

function toggleTheme() {
  if (STATE.theme === 'dark') {
    setThemeMode('light');
  } else {
    setThemeMode('dark');
  }
}

function renderMemoryLogs() {
  const container = document.getElementById('profile-memory-list');
  if (!container) return;
  container.innerHTML = '';

  STATE.user.memory.forEach(m => {
    const item = document.createElement('div');
    item.className = 'p-2 bg-surface-bright/20 border border-outline-variant/10 rounded flex justify-between items-center text-[11px]';
    item.innerHTML = `
      <span class="truncate pr-2">${m.fact}</span>
      <button class="text-on-surface-variant hover:text-error cursor-pointer" onclick="deleteMemory(${m.id})"><span class="material-symbols-outlined text-[10px] align-middle">close</span></button>
    `;
    container.appendChild(item);
  });

  const size = document.getElementById('memory-size-counter');
  if (size) size.textContent = STATE.user.memory.length;
}

function deleteMemory(id) {
  STATE.user.memory = STATE.user.memory.filter(m => m.id !== id);
  saveStateToStorage();
  renderMemoryLogs();
  addNotification('Memory Log Cleared', 'JINI companion fact deleted.');
}

function clearAllMemoryLogs() {
  STATE.user.memory = [];
  saveStateToStorage();
  renderMemoryLogs();
  addNotification('All Memory Wiped', 'Organic learned memory logs fully cleared.');
}

function simulateSignOut() {
  alert('Sign out simulated successfully. Sync links reset.');
  STATE.user.tier = 'FREE ACCOUNT';
  document.getElementById('popover-badge').textContent = 'FREE ACCOUNT';
  document.getElementById('profile-badge-label').textContent = 'FREE COMPANION';
}

// --- MONETIZATION PRICING SYSTEM ---
function subscribeToPlan(tier, price) {
  document.getElementById('selected-upgrade-price').textContent = `$${price}.00/mo`;
  document.getElementById('payment-stage-form').classList.remove('hidden');
  document.getElementById('payment-stage-success').classList.add('hidden');
  
  // Show upgrade modal
  showModal('upgrade-modal');
}

function processUpgradePayment() {
  const num = document.getElementById('payment-card-number').value.trim();
  const exp = document.getElementById('payment-card-expiry').value.trim();
  const cvc = document.getElementById('payment-card-cvc').value.trim();

  if (!num || !exp || !cvc) {
    alert('Please fill out card authentication fields.');
    return;
  }

  // Load animation
  const form = document.getElementById('payment-stage-form');
  const succ = document.getElementById('payment-stage-success');
  
  form.classList.add('hidden');
  succ.classList.remove('hidden');
  
  // Success trigger: upgrade state
  STATE.user.tier = 'PRO ACCOUNT';
  document.getElementById('popover-badge').textContent = 'PRO ACCOUNT';
  document.getElementById('profile-badge-label').textContent = 'PRO COMPANION';
  addNotification('Subscription Active', 'Welcome to JINI Pro premium tier!');
  addActivityLog('Subscribed to JINI Pro', 'Billing', 'Just now', 'workspace_premium');
}

// --- GLOBAL SEARCH BAR UTILITIES ---
function handleGlobalSearchKeydown(e) {
  if (e.key === 'Enter') {
    submitGlobalSearch();
  }
}

function submitGlobalSearch() {
  const input = document.getElementById('global-search-input');
  const text = input.value.trim();
  if (text) {
    input.value = '';
    
    // Switch to chat page and populate text
    navigateTo('chat');
    populateAndSend(text);
  }
}

// --- SECURE MODAL OPEN / CLOSE ---
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.showModal();
    // Add light dismiss behavior: close modal if clicked on background backdrop
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const clickedOutside = (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
      if (clickedOutside) {
        modal.close();
      }
    });
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.close();
  }
}

function showAuthModal() {
  showModal('auth-modal');
}

function simulateGoogleLogin() {
  closeModal('auth-modal');
  updateProfileName('Google_User_Divyansh');
  addNotification('Google Account Synced', 'Credentials authenticated.');
}

function simulateEmailLogin() {
  const email = document.getElementById('auth-email-input').value.trim();
  if (email) {
    closeModal('auth-modal');
    updateProfileName(email.split('@')[0]);
    addNotification('Email Authenticated', 'Profile data synced.');
  }
}

// --- ACTIVITY LOGS & NOTIFICATIONS FEED ---
function addNotification(title, text) {
  const list = document.getElementById('notification-list');
  const item = document.createElement('div');
  item.className = 'text-xs space-y-1 p-2 bg-surface-bright/20 rounded-lg border border-outline-variant/10';
  item.innerHTML = `
    <div class="flex justify-between items-center font-semibold text-primary">
      <span>${title}</span>
      <span class="text-[10px] text-on-surface-variant/60">Just now</span>
    </div>
    <p class="text-on-surface-variant">${text}</p>
  `;
  list.insertBefore(item, list.firstChild);
}

function addActivityLog(title, type, date, icon) {
  const feed = document.getElementById('activity-feed-list');
  if (!feed) return;

  const item = document.createElement('div');
  item.className = 'group bg-surface-container-low/40 border border-outline-variant/10 rounded-lg p-4 flex items-center gap-4 hover:bg-surface-container-high/40 transition-colors';
  item.innerHTML = `
    <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
      <span class="material-symbols-outlined text-2xl">${icon}</span>
    </div>
    <div class="flex-grow min-w-0">
      <h4 class="font-bold text-on-surface text-sm truncate">${title}</h4>
      <p class="text-on-surface-variant text-xs truncate">${type} • ${date}</p>
    </div>
    <button class="text-on-surface-variant hover:text-primary transition-colors" onclick="deleteActivityItem(this)">
      <span class="material-symbols-outlined text-lg">delete</span>
    </button>
  `;
  feed.insertBefore(item, feed.firstChild);
}

function deleteActivityItem(btn) {
  btn.closest('.group').remove();
}

function clearActivityFeed() {
  document.getElementById('activity-feed-list').innerHTML = `
    <div class="text-center p-8 bg-surface-bright/20 rounded-lg border border-dashed border-outline-variant/30 text-xs text-on-surface-variant">
      Recent activity is empty.
    </div>
  `;
}
