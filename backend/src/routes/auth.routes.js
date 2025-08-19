import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

/**
 * One-time admin seeder (optional).
 * You can remove this if you only want to use /register
 */
router.post("/seed-admin", async (req, res) => {
  const { name = "Admin", email = "admin@leo.com", password = "admin123", department = "HR" } = req.body || {};
  const exists = await User.findOne({ email });
  if (exists) return res.json({ message: "Admin already exists" });

  const admin = await User.create({
    name,
    email,
    password,
    department,
    role: ROLES.ADMIN,
  });

  res.json({ message: "Admin created", id: admin._id });
});

/**
 * Register user (Employee or Admin)
 * Body: { name, email, password, department, role }
 * role can be "EMPLOYEE" or "ADMIN"
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    // Default role is EMPLOYEE
    const user = await User.create({
      name,
      email,
      password,
      department,
      role: role || ROLES.EMPLOYEE,
    });

    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

/**
 * Login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

export default router;
