import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12");

/**
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
