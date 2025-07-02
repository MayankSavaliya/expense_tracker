import express from 'express';
import {
  getAllSettlements,
  getUserSettlements,
  getGroupSettlements,
  getSettlementById
} from '../controllers/settlementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/settlements
// @desc    Get all settlements for current user
// @access  Private
router.get('/', getAllSettlements);

// @route   GET /api/settlements/user/:userId
// @desc    Get settlements for specific user
// @access  Private
router.get('/user/:userId', getUserSettlements);

// @route   GET /api/settlements/group/:groupId
// @desc    Get settlements for specific group
// @access  Private
router.get('/group/:groupId', getGroupSettlements);

// @route   GET /api/settlements/:id
// @desc    Get single settlement by ID
// @access  Private
router.get('/:id', getSettlementById);

export default router;