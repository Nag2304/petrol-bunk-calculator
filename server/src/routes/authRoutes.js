import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import pool from "../config/db.js";
import { env } from "../config/env.js";

const router = express.Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", async (request, response) => {
  const schema = authSchema.extend({ name: z.string().min(2) });
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid registration details" });
  }

  const { name, email, password } = parsed.data;
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) {
    return response.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = jwt.sign(user, env.JWT_SECRET, { expiresIn: "7d" });
  response.status(201).json({ token, user });
});

router.post("/login", async (request, response) => {
  const parsed = authSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid login details" });
  }

  const { email, password } = parsed.data;
  const result = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    return response.status(401).json({ message: "Incorrect email or password" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return response.status(401).json({ message: "Incorrect email or password" });
  }

  const safeUser = { id: user.id, name: user.name, email: user.email };
  const token = jwt.sign(safeUser, env.JWT_SECRET, { expiresIn: "7d" });
  response.json({ token, user: safeUser });
});

export default router;
