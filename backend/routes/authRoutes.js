import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// -------------------------------------------------------------------------
// PUBLIC ROUTES: Sign In and Registration for both Admin and Members
// -------------------------------------------------------------------------

// @route   POST /api/auth/signup
router.post('/signup', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);



router.get('/members', protect, async (req, res) => {
  try {
    // Database query logic: Filters out Admins and returns only required fields
    const members = await User.find({ role: 'Member' }).select('name email role');
    res.json(members);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to fetch team members database bucket', 
      error: err.message 
    });
  }
});

export default router;