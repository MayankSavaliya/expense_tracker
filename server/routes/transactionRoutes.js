import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getTransactions, 
  getTransactionById, 
  getBalanceSummary,
  getSimpleBalanceSummary,
  getUserDebts,
  getBalanceBetweenUsers,
  getGroupDebts,
  createSettlement
} from '../controllers/transactionController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Debt tracking routes
router.get('/debts/:userId', getUserDebts);
router.get('/debts/between/:userId1/:userId2', getBalanceBetweenUsers);
router.get('/debts/group/:groupId', getGroupDebts);

// Settlement route
router.post('/settlement', createSettlement);

// Specific routes first
router.get('/summary', getBalanceSummary);
router.get('/simple-summary', getSimpleBalanceSummary);

// Then the parameterized routes
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

export default router;
