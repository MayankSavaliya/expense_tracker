import Group from '../models/Group.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js'; // Added import
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res, next) => {
  try {
    // Set creator to current user
    req.body.creator = req.user.id;
    
    // If members are provided, ensure the creator is also a member
    if (req.body.members && !req.body.members.includes(req.user.id)) {
      req.body.members.push(req.user.id);
    } else if (!req.body.members) {
      req.body.members = [req.user.id];
    }
    // console.log(req.body);
    const group = await Group.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all groups for current user
// @route   GET /api/groups/my-groups
// @access  Private
export const getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      members: req.user.id,
    })
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('expenses', 'amount')
      .sort({ createdAt: -1 });

    //now for all the groups, get the total expenses fist of all find group by id then get the expenses

    const processedGroups = await Promise.all(groups.map(async (group) => {
      const groupObj = group.toObject({ virtuals: true });
      
      // Calculate total expenses using your custom method
      const totalExpenses = await group.totalExpenses();
      groupObj.totalExpenses = totalExpenses;
      
      // Get current user's balance in the group using your custom method
      const userBalance = await group.getMemberBalance(req.user.id);
      groupObj.yourBalance = userBalance;
      
      return groupObj;
    }));


    res.status(StatusCodes.OK).json({
      success: true,
      count: groups.length,
      data: processedGroups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate({
        path: 'expenses',
        populate: [
          {
            path: 'paidBy.user owedBy.user userBalances.user',
            select: 'name email avatar'
          },
          {
            path: 'createdBy',
            select: 'name email avatar'
          }
        ]
      });

    if (!group) {
      return next(
        new ErrorResponse(`Group not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is a member of the group
    if (!group.members.some(member => member._id.toString() === req.user.id)) {
      return next(
        new ErrorResponse('Not authorized to view this group', StatusCodes.UNAUTHORIZED)
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
export const addMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(
        new ErrorResponse(`Group not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is the creator of the group
    if (group.creator.toString() !== req.user.id) {
      return next(
        new ErrorResponse('Not authorized to add members to this group', StatusCodes.UNAUTHORIZED)
      );
    }

    const { memberId } = req.body;

    // Check if user exists
    const user = await User.findById(memberId);
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${memberId}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is already a member
    if (group.members.includes(memberId)) {
      return next(
        new ErrorResponse('User is already a member of this group', StatusCodes.BAD_REQUEST)
      );
    }

    // Add member to group
    group.members.push(memberId);
    await group.save();

    res.status(StatusCodes.OK).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:memberId
// @access  Private
export const removeMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(
        new ErrorResponse(`Group not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is the creator of the group
    if (group.creator.toString() !== req.user.id) {
      return next(
        new ErrorResponse('Not authorized to remove members from this group', StatusCodes.UNAUTHORIZED)
      );
    }

    // Cannot remove the creator
    if (req.params.memberId === group.creator.toString()) {
      return next(
        new ErrorResponse('Cannot remove the creator from the group', StatusCodes.BAD_REQUEST)
      );
    }

    // Check if user is a member
    if (!group.members.includes(req.params.memberId)) {
      return next(
        new ErrorResponse('User is not a member of this group', StatusCodes.BAD_REQUEST)
      );
    }

    // Remove member from group
    group.members = group.members.filter(
      member => member.toString() !== req.params.memberId
    );
    await group.save();

    res.status(StatusCodes.OK).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(
        new ErrorResponse(`Group not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is the creator of the group
    if (group.creator.toString() !== req.user.id) {
      return next(
        new ErrorResponse('Not authorized to delete this group', StatusCodes.UNAUTHORIZED)
      );
    }

    await group.deleteOne();

    res.status(StatusCodes.OK).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group balances and statistics
// @route   GET /api/groups/:id/balances
// @access  Private
export const getGroupBalances = async (req, res, next) => {
  try {
    // Get the group with members and expenses
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email avatar')
      .populate({
        path: 'expenses',
        populate: [
          {
            path: 'paidBy.user owedBy.user',
            select: 'name email avatar'
          }
        ]
      });

    if (!group) {
      return next(
        new ErrorResponse(`Group not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is a member of the group
    if (!group.members.some(member => member._id.toString() === req.user.id)) {
      return next(
        new ErrorResponse("Not authorized to view this group's balances", StatusCodes.UNAUTHORIZED)
      );  
    }

    // Get the group transaction with populated user details
    const groupTransaction = await Transaction.findOne({ group: group._id })
      .populate('netBalances.user', 'name email avatar')
      .populate('minimizedTransactions.from', 'name email avatar')
      .populate('minimizedTransactions.to', 'name email avatar');

    // Initialize memberExpenses map with all members
    const memberExpensesMap = {};
    group.members.forEach(member => {
      memberExpensesMap[member._id.toString()] = {
        id: member._id.toString(),
        name: member.name,
        avatar: member.avatar,
        paid: 0,
        owed: 0,
        balance: 0,
        settlements: []
      };
    });
    // console.log(groupTransaction);
    // Calculate balances based on transactions
    if (groupTransaction) {
      groupTransaction.netBalances.forEach(item => {
        const userId = item.user._id.toString();
        const balance = item.balance;
        console.log(userId, balance);
        if (memberExpensesMap[userId]) {
          memberExpensesMap[userId].balance += balance;
        }
      });

      groupTransaction.minimizedTransactions.forEach(transaction => {
        const fromUserId = transaction.from._id.toString();
        const toUserId = transaction.to._id.toString();
        const amount = transaction.amount;
        if (memberExpensesMap[fromUserId]) {
          memberExpensesMap[fromUserId].owed += amount;
          memberExpensesMap[fromUserId].settlements.push({
            id: toUserId,
            amount: -amount
          }); 
        }
        if (memberExpensesMap[toUserId]) {
          memberExpensesMap[toUserId].paid += amount;
        }
        //also add to memebers into the settlements
        if (memberExpensesMap[toUserId]) {
          memberExpensesMap[toUserId].settlements.push({
            id: fromUserId,
            amount
          });
        }
      });
    }
    // Convert the map to an array
    const memberExpenses = Object.values(memberExpensesMap);
    // Sort members by balance
    memberExpenses.sort((a, b) => b.balance - a.balance);
    // Calculate category distribution
    const categoryDistribution = group.expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      const amount = expense.amount || 0;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    // Convert category distribution to an array of objects
    const categoryDistributionArray = Object.entries(categoryDistribution).map(([category, amount]) => ({
      category,
      amount,
      color: getCategoryColor(category)
    }));
    // Sort category distribution by amount
    categoryDistributionArray.sort((a, b) => b.amount - a.amount);
    //Now return the response
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        groupId: group._id,
        groupName: group.name,
        members: memberExpenses,
        categoryDistribution: categoryDistributionArray
      }
    });

  } catch (error) {
    next(error);
  }
};

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    'Food & Drink': '#EF4444',
    'Shopping': '#F59E0B',
    'Housing': '#A78BFA',
    'Transportation': '#60A5FA',
    'Entertainment': '#EC4899',
    'Utilities': '#4ECCA3',
    'Health': '#10B981',
    'Travel': '#8B5CF6',
    'Other': '#6B7280'
  }; // Corrected: Added closing brace for the colors object
  return colors[category] || colors['Other'];
};
