import express from "express";
import {
  getAllMovies,
  getMovieById,
  getShowsByMovie,
  createMovie,
} from "../controllers/movie.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleCheck.js";
import {
  movieValidation,
  idParamValidation,
} from "../middleware/validation.js";

const router = express.Router();

/**
 * @route   GET /api/movies
 * @desc    Get all movies
 */
router.get("/", getAllMovies);

/**
 * @route   GET /api/movies/:id
 * @desc    Get movie by ID
 */
router.get("/:id", idParamValidation, getMovieById);

/**
 * @route   GET /api/movies/:id/shows
 * @desc    Get shows for a movie
 */
router.get("/:id/shows", idParamValidation, getShowsByMovie);

/**
 * @route   POST /api/movies
 * @desc    Create a new movie
 */
router.post("/", authenticateToken, requireAdmin, movieValidation, createMovie);

export default router;
