import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends
} from '../controllers/friendController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Friend request endpoints
router.post('/request', sendFriendRequest);
router.put('/accept/:id', acceptFriendRequest);
router.put('/reject/:id', rejectFriendRequest);
router.get('/incoming', getIncomingRequests);
router.get('/outgoing', getOutgoingRequests);

// Friends management
router.get('/', getFriends);
router.delete('/:id', removeFriend);

export default router;
