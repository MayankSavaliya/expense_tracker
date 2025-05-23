import asyncHandler from 'express-async-handler';
import Friend from '../models/Friend.js';
import User from '../models/User.js';

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
const sendFriendRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  // Check if userId is provided
  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }
  
  // Check if trying to add self
  if (userId === req.user.id) {
    res.status(400);
    throw new Error('Cannot send friend request to yourself');
  }
  
  // Check if user exists
  const recipientExists = await User.findById(userId);
  if (!recipientExists) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if already friends or request already sent
  const existingFriendship = await Friend.findOne({
    $or: [
      { requester: req.user.id, recipient: userId },
      { requester: userId, recipient: req.user.id }
    ]
  });

  if (existingFriendship) {
    if (existingFriendship.status === 'accepted') {
      res.status(400);
      throw new Error('Already friends with this user');
    } else if (
      existingFriendship.requester.toString() === req.user.id && 
      existingFriendship.status === 'pending'
    ) {
      res.status(400);
      throw new Error('Friend request already sent');
    } else if (
      existingFriendship.recipient.toString() === req.user.id && 
      existingFriendship.status === 'pending'
    ) {
      // If the other user already sent a request, accept it instead
      existingFriendship.status = 'accepted';
      await existingFriendship.save();
      
      res.status(200).json({
        success: true,
        data: existingFriendship,
        message: 'Friend request accepted'
      });
      return;
    }
  }
  
  // Create new friend request
  const friendRequest = await Friend.create({
    requester: req.user.id,
    recipient: userId,
    status: 'pending'
  });
  
  res.status(201).json({
    success: true,
    data: friendRequest,
    message: 'Friend request sent successfully'
  });
});
// @desc    Accept friend request
// @route   PUT /api/friends/accept/:id
// @access  Private
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const friendRequest = await Friend.findById(req.params.id);
  
  if (!friendRequest) {
    res.status(404);
    throw new Error('Friend request not found');
  }
  
  // Verify the request was sent to the current user
  if (friendRequest.recipient.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to accept this request');
  }
  
  // Check if already accepted
  if (friendRequest.status === 'accepted') {
    res.status(400);
    throw new Error('Friend request already accepted');
  }
  
  friendRequest.status = 'accepted';
  await friendRequest.save();
  
  res.status(200).json({
    success: true,
    data: friendRequest,
    message: 'Friend request accepted'
  });
});

// @desc    Reject friend request
// @route   PUT /api/friends/reject/:id
// @access  Private
const rejectFriendRequest = asyncHandler(async (req, res) => {
  const friendRequest = await Friend.findById(req.params.id);
  
  if (!friendRequest) {
    res.status(404);
    throw new Error('Friend request not found');
  }
  
  // Verify the request was sent to the current user
  if (friendRequest.recipient.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to reject this request');
  }
  
  // Delete the request instead of marking as rejected
  await Friend.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Friend request rejected and removed'
  });
});

// @desc    Delete/Remove friend
// @route   DELETE /api/friends/:id
// @access  Private
const removeFriend = asyncHandler(async (req, res) => {
  const friendshipId = req.params.id;
  
  const friendship = await Friend.findById(friendshipId);
  
  if (!friendship) {
    res.status(404);
    throw new Error('Friendship not found');
  }
  
  // Verify the user is part of this friendship
  if (friendship.requester.toString() !== req.user.id && 
      friendship.recipient.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to remove this friendship');
  }
  
  await Friend.findByIdAndDelete(friendshipId);
  
  res.status(200).json({
    success: true,
    message: 'Friend removed successfully'
  });
});

// @desc    Get all friend requests (incoming and outgoing)
// @route   GET /api/friends/requests
// @access  Private
const getIncomingRequests = asyncHandler(async (req, res) => {
  // Get incoming requests (where user is recipient)
  const incomingRequests = await Friend.find({
    recipient: req.user.id,
    status: 'pending'
  }).populate('requester', 'name email avatar');
  
  res.status(200).json({
    success: true,
    data: incomingRequests
  });
});

// @desc    Get outgoing friend requests
// @route   GET /api/friends/outgoing
// @access  Private
const getOutgoingRequests = asyncHandler(async (req, res) => {
  // Get outgoing requests (where user is requester)
  const outgoingRequests = await Friend.find({
    requester: req.user.id,
    status: 'pending'
  }).populate('recipient', 'name email avatar');
  
  res.status(200).json({
    success: true,
    data: outgoingRequests
  });
});

// @desc    Get user's friends
// @route   GET /api/friends
// @access  Private
const getFriends = asyncHandler(async (req, res) => {
  // Find all accepted friendships where the user is either requester or recipient
  const friendships = await Friend.find({
    $or: [
      { requester: req.user.id, status: 'accepted' },
      { recipient: req.user.id, status: 'accepted' }
    ]
  });
  
  // Extract friend IDs (the other user in each friendship)
  const friendIds = friendships.map(friendship => {
    return friendship.requester.toString() === req.user.id
      ? friendship.recipient
      : friendship.requester;
  });
  
  // Get friend details
  const friends = await User.find({ _id: { $in: friendIds } })
    .select('name email avatar');
  
  res.status(200).json({
    success: true,
    data: friends
  });
});

// Block and unblock functionality removed as per requirements

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends
};
