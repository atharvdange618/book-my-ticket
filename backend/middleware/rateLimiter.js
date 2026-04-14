import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints (register, login)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for booking endpoints
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: "Too many booking requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
