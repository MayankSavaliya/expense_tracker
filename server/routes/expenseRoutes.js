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

router.route('/')
  .post(createExpense);

router.get('/my-expenses', getMyExpenses);
router.post('/settle-up', settleUp);
router.get('/friend/:friendId', getFriendExpenses);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
