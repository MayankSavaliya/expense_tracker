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
router.post('/request', sendFriendRequest);  // Send a friend request
router.put('/accept/:id', acceptFriendRequest); // Accept a friend request
router.put('/reject/:id', rejectFriendRequest); // Reject a friend request
router.get('/incoming', getIncomingRequests); // Get incoming friend requests
router.get('/outgoing', getOutgoingRequests); // Get outgoing friend requests

// Friends management
router.get('/', getFriends); // Get all friends
router.delete('/:id', removeFriend); // Remove a friend

export default router;
