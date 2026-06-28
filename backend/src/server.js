const express = require('express');
const path = require('path');
const config = require('./config/config');
const logger = require('./utils/logger');
const { corsMiddleware, helmetMiddleware, rateLimitMiddleware } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// Apply security headers and CORS
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Request parsing with limit (to support base64 image vision uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apply rate limiting on api routes
app.use('/api', rateLimitMiddleware);

// Serve static frontend assets from the public directory
app.use(express.static(path.join(__dirname, '../../public')));

// Mount API routes
app.use('/api', chatRoutes);

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Global error handler middleware
app.use(errorHandler);

// Start server listener only when run directly
if (require.main === module) {
  app.listen(config.PORT, () => {
    logger.info(`🚀 JINI Companion Server active on http://localhost:${config.PORT}`);
  });
}

module.exports = app;
