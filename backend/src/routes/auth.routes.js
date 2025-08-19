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
  try {
    const { name = "Admin", email = "admin@leo.com", password = "admin123", department = "HR" } = req.body || {};
    
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const admin = await User.create({
      name,
      email,
      password,
      department,
      role: ROLES.ADMIN,
    });

    console.log('Admin created:', { id: admin._id, email: admin.email });
    res.status(201).json({ 
      message: "Admin created successfully", 
      id: admin._id,
      email: admin.email 
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({ 
      message: "Error creating admin", 
      error: error.message 
    });
  }
});

/**
 * Register user (Employee or Admin)
 * Body: { name, email, password, department, role }
 * role can be "EMPLOYEE" or "ADMIN"
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, and password are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      department: department ? department.trim() : undefined,
      role: role && Object.values(ROLES).includes(role) ? role : ROLES.EMPLOYEE,
    });

    console.log('User registered:', { id: user._id, email: user.email, role: user.role });
    
    res.status(201).json({ 
      message: "Registration successful",
      user: {
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: "Error registering user", 
      error: err.message 
    });
  }
});

/**
 * Login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    console.log('User logged in:', { id: user._id, email: user.email, role: user.role });

    res.json({
      message: "Login successful",
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
    console.error('Login error:', err);
    res.status(500).json({ 
      message: "Error logging in", 
      error: err.message 
    });
  }
});

/**
 * Get current user profile
 */
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;