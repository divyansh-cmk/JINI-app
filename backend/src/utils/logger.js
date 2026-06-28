/**
 * Simple Logger utility with timestamps and emojis
 */
const logger = {
  info: (message) => {
    console.log(`[INFO] [${new Date().toISOString()}] ℹ️ ${message}`);
  },
  warn: (message) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ⚠️ ${message}`);
  },
  error: (message, err) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ❌ ${message}`, err || '');
  },
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] [${new Date().toISOString()}] 🔍 ${message}`);
    }
  }
};

module.exports = logger;
