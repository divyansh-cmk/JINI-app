const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configure CORS options
const corsOptions = {
  origin: '*', // Allow all origins for the API, or customize if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key']
};

// API Rate Limiter: maximum of 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for local Ollama requests or non-API routes
    return !req.path.startsWith('/api/');
  }
});

// Configure Helmet with Content Security Policy designed for our frontend resources
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:*", "http:*"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "https://*.googleapis.com"],
      mediaSrc: ["'self'", "data:", "blob:"]
    }
  }
});

module.exports = {
  corsMiddleware: cors(corsOptions),
  helmetMiddleware: helmetConfig,
  rateLimitMiddleware: apiLimiter
};
