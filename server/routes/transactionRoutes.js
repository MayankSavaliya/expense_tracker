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
  createSettlement,
  groupSettelment
} from '../controllers/transactionController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Debt tracking routes
router.get('/debts/:userId', getUserDebts);
router.get('/debts/between/:userId1/:userId2', getBalanceBetweenUsers);  //Friend page betwen user balance
router.get('/debts/group/:groupId', getGroupDebts);  

// Settlement routes
router.post('/settlement', createSettlement);  //personal settlement between two users
router.post('/settlement/group', groupSettelment);  //group settlement between users in a group

// Specific routes first
router.get('/summary', getBalanceSummary); //needs some modification to return the summary of all transactions
router.get('/simple-summary', getSimpleBalanceSummary);  //Only for the dashboard total,owe,owed

// Then the parameterized routes
router.get('/', getTransactions); //Get all transactions
router.get('/:id', getTransactionById); //Get specific transaction by ID

export default router;
