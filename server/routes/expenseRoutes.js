import express from 'express';
import {
  createExpense,
  getMyExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  settleUp,
  getFriendExpenses,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/') // Create a new expense
  .post(createExpense);

router.get('/my-expenses', getMyExpenses); // Get all expenses for the authenticated user
router.post('/settle-up', settleUp);
router.get('/friend/:friendId', getFriendExpenses);

router.route('/:id') // Get, update, or delete a specific expense by ID
  .get(getExpenseById)  
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
