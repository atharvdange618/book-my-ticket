import express from "express";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
} from "../controllers/booking.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  bookingValidation,
  idParamValidation,
} from "../middleware/validation.js";
import { bookingLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 */
router.post(
  "/",
  authenticateToken,
  bookingLimiter,
  bookingValidation,
  createBooking,
);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get current user's bookings
 */
router.get("/my-bookings", authenticateToken, getUserBookings);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel a booking
 */
router.delete("/:id", authenticateToken, idParamValidation, cancelBooking);

export default router;
