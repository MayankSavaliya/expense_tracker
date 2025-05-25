import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  requestPasswordReset,
  resetPassword,
  searchUsers
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', registerUser);  // Register a new user
router.post('/login', loginUser);  // Login a user
router.post('/reset-password-request', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/', protect, getUsers); // Get all users (for admin or user management purposes)
router.get('/profile', protect, getUserProfile); // Get the authenticated user's profile
router.put('/profile', protect, updateUserProfile); 
router.get('/search', protect, searchUsers);

export default router;
