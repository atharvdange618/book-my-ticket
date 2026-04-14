import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET =
  process.env.JWT_SECRET || "7XGlTYY3KHl3PY3zIDctIlSqD2fntGqp/nYsFjJoNns=";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d";

/**
 * Generate JWT token for a user
 * @param {object} payload - User data to encode (typically {userId, email, role})
 * @returns {string} - JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}
