const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP. Please wait a moment before trying again.",
  },
  skip: (req) => process.env.NODE_ENV === "test", // Skip in tests
});

module.exports = rateLimiter;
