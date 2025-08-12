import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔓 Public routes
router.post('/register', registerUser); // Register new user (auto-approve patient)
router.post('/login', loginUser);       // Login and receive JWT

// 🔐 Protected routes (require token)
router
  .route('/profile')
  .get(protect, getUserProfile)         // Get logged-in user's profile
  .put(protect, updateUserProfile);     // Update profile info (name, password, etc.)

export default router;
