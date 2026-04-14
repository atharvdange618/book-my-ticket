import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  registerValidation,
  loginValidation,
} from "../middleware/validation.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post("/register", authLimiter, registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
router.post("/login", authLimiter, loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 */
router.get("/me", authenticateToken, getMe);

export default router;
