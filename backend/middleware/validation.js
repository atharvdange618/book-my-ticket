import { body, param, validationResult } from "express-validator";

/**
 * Middleware to check validation results
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * Registration validation rules
 */
export const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  body("name")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Name must be between 2 and 255 characters"),
  handleValidationErrors,
];

/**
 * Login validation rules
 */
export const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

/**
 * Booking validation rules
 */
export const bookingValidation = [
  body("seatIds")
    .isArray({ min: 1 })
    .withMessage("At least one seat must be selected"),
  body("seatIds.*").isInt({ min: 1 }).withMessage("Invalid seat ID"),
  body("showId").isInt({ min: 1 }).withMessage("Valid show ID is required"),
  handleValidationErrors,
];

/**
 * Movie creation validation rules
 */
export const movieValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters"),
  body("description").optional().trim(),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer (in minutes)"),
  body("genre")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Genre must be less than 100 characters"),
  body("rating")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Rating must be less than 10 characters"),
  body("base_price")
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),
  body("poster_url").optional().trim(),
  handleValidationErrors,
];

/**
 * Show creation validation rules
 */
export const showValidation = [
  body("movieId").isInt({ min: 1 }).withMessage("Valid movie ID is required"),
  body("showTime")
    .isISO8601()
    .withMessage("Valid show time is required (ISO 8601 format)")
    .custom((value) => {
      const showDate = new Date(value);
      const now = new Date();
      if (showDate <= now) {
        throw new Error("Show time must be in the future");
      }
      return true;
    }),
  body("screenNumber")
    .isInt({ min: 1 })
    .withMessage("Valid screen number is required"),
  handleValidationErrors,
];

/**
 * Role update validation rules
 */
export const roleUpdateValidation = [
  param("userId").isInt({ min: 1 }).withMessage("Valid user ID is required"),
  body("role")
    .isIn(["user", "admin"])
    .withMessage('Role must be either "user" or "admin"'),
  handleValidationErrors,
];

/**
 * ID parameter validation
 */
export const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid ID is required"),
  handleValidationErrors,
];
