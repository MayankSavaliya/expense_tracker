import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../middleware/errorHandler.js';
import crypto from 'crypto';


const generateAvatarUrl = () => {
  // Generate random number between 1 and 99 for men's portraits
  const randomNumber = Math.floor(Math.random() * 99) + 1;
  return `https://randomuser.me/api/portraits/men/${randomNumber}.jpg`;
};

// @desc    Register user
// @route   POST /api/users
// @access  Public

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(
        new ErrorResponse('User already exists', StatusCodes.BAD_REQUEST)
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    console.log(user);
    if(user){
      user.avatar = generateAvatarUrl();
      await user.save();
    }
    sendTokenResponse(user, StatusCodes.CREATED, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // Validate email & password
    if (!email || !password) {
      return next(
        new ErrorResponse('Please provide an email and password', StatusCodes.BAD_REQUEST)
      );
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(
        new ErrorResponse('Invalid credentials', StatusCodes.UNAUTHORIZED)
      );
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(
        new ErrorResponse('Invalid credentials', StatusCodes.UNAUTHORIZED)
      );
    }

    sendTokenResponse(user, StatusCodes.OK, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorResponse('User not found', StatusCodes.NOT_FOUND)
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorResponse('User not found', StatusCodes.NOT_FOUND)
      );
    }

    const { name, email, password, avatar } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;

    const updatedUser = await user.save();

    sendTokenResponse(updatedUser, StatusCodes.OK, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (for adding friends)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    // Exclude current user
    const users = await User.find({
      _id: { $ne: req.user.id }
    }).select('name email avatar');

    res.status(StatusCodes.OK).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send friend request
// @route   POST /api/users/send-friend-request
// @access  Private
// Friend-related functionality has been moved to friendController.js

// Friend-related functionality has been moved to friendController.js

// @desc    Request password reset
// @route   POST /api/users/reset-password-request
// @access  Public
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(
        new ErrorResponse('No user found with that email', StatusCodes.NOT_FOUND)
      );
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // In a real application, you would send an email with this token
    // For now, we'll just return it
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset link sent to email',
      resetToken, // In production, don't send this in the response
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Hash token from params
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorResponse('Invalid or expired token', StatusCodes.BAD_REQUEST)
      );
    }

    // Set new password and clear reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, StatusCodes.OK, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by name or email
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return next(new ErrorResponse('Search query is required', StatusCodes.BAD_REQUEST));
    }
    
    // Search by name or email, excluding current user
    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user.id } }
      ]
    }).select('name email avatar');
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Helper to send JWT token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: user,
  });
};
