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
  .post(createGroup); //crate a new group

router.get('/my-groups', getMyGroups);  // Get all groups for the authenticated user

router.route('/:id')
  .get(getGroupById)  // Get a specific group by ID
  .delete(deleteGroup); //needs to be implemented again

router.get('/:id/balances', getGroupBalances);

router.route('/:id/members')
  .post(addMember);    //needs to be implemented again

router.delete('/:id/members/:memberId', removeMember); //needs to be implemented again

export default router;
