import Settlement from '../models/Settlement.js';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Get all settlements for current user
// @route   GET /api/settlements
// @access  Private
export const getAllSettlements = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const {
      limit = 50,
      page = 1,
      group,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      limit: parseInt(limit),
      skip,
      group,
      startDate,
      endDate
    };

    const settlements = await Settlement.getForUser(req.user._id, options);

    // Add direction for each settlement based on current user
    const settlementsWithDirection = settlements.map(settlement => {
      const settlementObj = settlement.toObject();
      settlementObj.direction = settlement.fromUser._id.toString() === req.user._id.toString() 
        ? 'outgoing' 
        : 'incoming';
      return settlementObj;
    });    // Get total count for pagination
    const totalQuery = {
      $or: [
        { fromUser: req.user._id },
        { toUser: req.user._id }
      ]
    };

    if (group) totalQuery.group = group;
    if (startDate || endDate) {
      totalQuery.createdAt = {};
      if (startDate) totalQuery.createdAt.$gte = new Date(startDate);
      if (endDate) totalQuery.createdAt.$lte = new Date(endDate);
    }

    const total = await Settlement.countDocuments(totalQuery);

    res.status(StatusCodes.OK).json({
      success: true,
      count: settlements.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: settlementsWithDirection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settlements for specific user
// @route   GET /api/settlements/user/:userId
// @access  Private
export const getUserSettlements = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }    const { userId } = req.params;
    const {
      limit = 50,
      page = 1,
      group,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      limit: parseInt(limit),
      skip,
      group,
      startDate,
      endDate
    };

    const settlements = await Settlement.getForUser(userId, options);

    // Add direction for each settlement based on the requested user
    const settlementsWithDirection = settlements.map(settlement => {
      const settlementObj = settlement.toObject();
      settlementObj.direction = settlement.fromUser._id.toString() === userId 
        ? 'outgoing' 
        : 'incoming';
      return settlementObj;
    });    // Get total count for pagination
    const totalQuery = {
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    };

    if (group) totalQuery.group = group;
    if (startDate || endDate) {
      totalQuery.createdAt = {};
      if (startDate) totalQuery.createdAt.$gte = new Date(startDate);
      if (endDate) totalQuery.createdAt.$lte = new Date(endDate);
    }

    const total = await Settlement.countDocuments(totalQuery);

    res.status(StatusCodes.OK).json({
      success: true,
      count: settlements.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: settlementsWithDirection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settlements for specific group
// @route   GET /api/settlements/group/:groupId
// @access  Private
export const getGroupSettlements = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }    const { groupId } = req.params;
    const {
      limit = 50,
      page = 1
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const options = {
      limit: parseInt(limit),
      skip
    };

    const settlements = await Settlement.getForGroup(groupId, options);

    // Add direction for each settlement based on current user
    const settlementsWithDirection = settlements.map(settlement => {
      const settlementObj = settlement.toObject();
      settlementObj.direction = settlement.fromUser._id.toString() === req.user._id.toString() 
        ? 'outgoing' 
        : 'incoming';
      return settlementObj;
    });    // Get total count for pagination
    const totalQuery = { group: groupId };

    const total = await Settlement.countDocuments(totalQuery);

    res.status(StatusCodes.OK).json({
      success: true,
      count: settlements.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: settlementsWithDirection
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Get single settlement by ID
// @route   GET /api/settlements/:id
// @access  Private
export const getSettlementById = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const settlement = await Settlement.findById(req.params.id)
      .populate('fromUser', 'name email avatar')
      .populate('toUser', 'name email avatar')
      .populate('group', 'name icon iconBg')
      .populate('relatedTransaction');

    if (!settlement) {
      return next(
        new ErrorResponse(`Settlement not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is involved in this settlement
    const isInvolved = settlement.fromUser._id.toString() === req.user._id.toString() ||
                      settlement.toUser._id.toString() === req.user._id.toString();

    if (!isInvolved) {
      return next(
        new ErrorResponse('Not authorized to view this settlement', StatusCodes.UNAUTHORIZED)
      );
    }

    // Add direction based on current user
    const settlementObj = settlement.toObject();
    settlementObj.direction = settlement.fromUser._id.toString() === req.user._id.toString() 
      ? 'outgoing' 
      : 'incoming';

    res.status(StatusCodes.OK).json({
      success: true,
      data: settlementObj
    });
  } catch (error) {
    next(error);
  }
};