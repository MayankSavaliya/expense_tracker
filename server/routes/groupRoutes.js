import express from 'express';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  removeMember,
  deleteGroup,
  getGroupBalances,
} from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .post(createGroup);

router.get('/my-groups', getMyGroups);

router.route('/:id')
  .get(getGroupById)
  .delete(deleteGroup);

router.get('/:id/balances', getGroupBalances);

router.route('/:id/members')
  .post(addMember);

router.delete('/:id/members/:memberId', removeMember);

export default router;
