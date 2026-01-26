// server/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

const STAFF_PIN = process.env.STAFF_PIN || "1234";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// POST /api/auth/login { pin: "1234" }
router.post("/login", (req, res) => {
  const { pin } = req.body || {};
  if (!pin) return res.status(400).json({ ok: false, message: "PIN is required" });

  if (String(pin) !== String(STAFF_PIN)) {
    return res.status(401).json({ ok: false, message: "Invalid PIN" });
  }

  // token good for 12 hours
  const token = jwt.sign({ role: "staff" }, JWT_SECRET, { expiresIn: "12h" });

  return res.json({ ok: true, token });
});

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export default router;
