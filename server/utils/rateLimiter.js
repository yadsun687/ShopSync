import { rateLimit, ipKeyGenerator } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global API limiter — 10 requests per minute per IP
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message:
        "Too many requests from this IP, please try again after 1 minute.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default loginLimiter;
