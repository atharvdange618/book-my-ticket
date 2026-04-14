/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
  }

  next();
}

/**
 * Middleware to check if user has either user or admin role
 */
export function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  if (req.user.role !== "user" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Invalid role." });
  }

  next();
}
