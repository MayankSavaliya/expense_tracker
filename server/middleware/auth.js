import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { ErrorResponse } from './errorHandler.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return next(
        new ErrorResponse('Not authorized to access this route', StatusCodes.UNAUTHORIZED)
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(
        new ErrorResponse('User not found', StatusCodes.NOT_FOUND)
      );
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next(
      new ErrorResponse('Not authorized to access this route', StatusCodes.UNAUTHORIZED)
    );
  }
};
