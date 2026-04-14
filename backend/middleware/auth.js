import { verifyToken } from "../utils/tokenHelper.js";

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }

  req.user = decoded;
  next();
}
