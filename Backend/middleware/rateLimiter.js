const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

// General API limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  message: { message: "Too many requests, please try again later." },
});

// Auth limiter
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  message: { message: "Too many auth attempts, please try again in 15 minutes." },
  skip: (req) => req.path === "/me" || req.method === "GET",
});

// Password reset limiter
exports.resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 5,
  trustProxy: true,
  message: { message: "Too many reset requests, please try again in an hour." },
});

// Upload limiter
exports.uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 500 : 50,
  trustProxy: true,
  message: { message: "Upload limit reached, please try again later." },
});
