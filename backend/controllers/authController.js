import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', { expiresIn: '30d' });
};

// @desc    Register a new employee (Standard Members Only - ADMIN BLOCKED)
// @route   POST /api/auth/signup
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // STRICT SECURITY GUARD: Force blocking manual Admin registration attempts
    if (role === 'Admin' || role === 'admin') {
      return res.status(403).json({ 
        message: 'Security Violation: Manual registration for Admin accounts is strictly prohibited.' 
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already registered with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'Member' // Locked to Member default state
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

// @desc    Login Handler supporting fixed static Admin and dynamic DB Members
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const formattedEmail = email.toLowerCase().trim();

    // -------------------------------------------------------------------------
    // FIXED MASTER ADMIN CREDENTIALS BYPASS LOCK
    // -------------------------------------------------------------------------
    if (formattedEmail === 'admin@gmail.com' && password === 'admin123') {
      // Check if Admin exists in database to avoid ID relational breaks
      let adminUser = await User.findOne({ email: 'admin@gmail.com' });
      
      if (!adminUser) {
        // If not found, instantly inject the seed record into your MongoDB cluster
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        adminUser = await User.create({
          name: 'System Admin Manager',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'Admin'
        });
      }

      return res.json({
        token: generateToken(adminUser._id),
        user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: 'Admin' }
      });
    }

    // Standard Verification for Regular Team Members registered inside database
    const user = await User.findOne({ email: formattedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Side Login Crash', error: error.message });
  }
};