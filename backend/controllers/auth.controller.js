import pool from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/passwordHelper.js";
import { generateToken } from "../utils/tokenHelper.js";

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res) {
  const { email, password, name } = req.body;

  try {
    // Check if user already exist karta hai ya nhi
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // hash the password
    const hashedPassword = await hashPassword(password);

    // insert new user
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at",
      [email, hashedPassword, name, "user"],
    );

    const user = result.rows[0];

    // generate the token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // find user by email
    const result = await pool.query(
      "SELECT id, email, password_hash, name, role FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // verify the password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    // get user info
    const result = await pool.query(
      "SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1",
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
