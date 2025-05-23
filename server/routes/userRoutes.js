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
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/reset-password-request', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/', protect, getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/search', protect, searchUsers);

export default router;
