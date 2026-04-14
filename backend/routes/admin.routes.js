import express from "express";
import {
  getAllBookings,
  getAllUsers,
  deleteUser,
  getStats,
} from "../controllers/admin.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleCheck.js";

const router = express.Router();

router.use(authenticateToken, requireAdmin);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings
 */
router.get("/bookings", getAllBookings);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 */
router.get("/users", getAllUsers);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 */
router.delete("/users/:userId", deleteUser);

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin statistics
 */
router.get("/stats", getStats);

export default router;
