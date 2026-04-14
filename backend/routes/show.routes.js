import express from "express";
import {
  getShowById,
  getSeatsForShow,
  createShow,
} from "../controllers/movie.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleCheck.js";
import { showValidation, idParamValidation } from "../middleware/validation.js";

const router = express.Router();

/**
 * @route   GET /api/shows/:id
 * @desc    Get show details by ID
 */
router.get("/:id", idParamValidation, getShowById);

/**
 * @route   GET /api/shows/:id/seats
 * @desc    Get seats for a show
 */
router.get("/:id/seats", idParamValidation, getSeatsForShow);

/**
 * @route   POST /api/shows
 * @desc    Create a new show
 */
router.post("/", authenticateToken, requireAdmin, showValidation, createShow);

export default router;
