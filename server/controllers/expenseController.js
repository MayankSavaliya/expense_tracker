import Expense from '../models/Expense.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../middleware/errorHandler.js';
import { addExpense } from '../services/expenseService.js';
import { deleteExpenseById } from '../services/expenseService.js';

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    
    console.log('Creating expense with data:', req.body);
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED));
    }

    const expense = await addExpense(req.body,req.user._id);
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: expense,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for current user
// @route   GET /api/expenses/my-expenses
// @access  Private
export const getMyExpenses = async (req, res, next) => {
  try {
    // Check if user exists in the request
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }
    // Get expenses where the user paid or owes
    const expenses = await Expense.find({
      $or: [
        { 'paidBy.user': req.user._id },
        { 'owedBy.user': req.user._id },
      ],
    })
      .populate('paidBy.user', 'name email avatar')
      .populate('owedBy.user', 'name email avatar')
      .populate('group', 'name')
      .sort({ date: -1 });

    // console.log(expenses);
    res.status(StatusCodes.OK).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res, next) => {
  try {
    // Check if user exists in the request
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const expense = await Expense.findById(req.params.id)
      .populate('paidBy.user', 'name email avatar')
      .populate('owedBy.user', 'name email avatar')
      .populate('group', 'name');

    if (!expense) {
      return next(
        new ErrorResponse(`Expense not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // // Check if user has permission to view this expense
    // const isDebtor = expense.owedBy.some(
    //   (debtor) => debtor.user._id.toString() === req.user._id.toString()
    // );
    // const isPayer = expense.paidBy.some(
    //   (payer) => payer.user._id.toString() === req.user._id.toString()
    // );

    // if (!isDebtor && !isPayer) {
    //   return next(
    //     new ErrorResponse('Not authorized to view this expense', StatusCodes.UNAUTHORIZED)
    //   );
    // }

    res.status(StatusCodes.OK).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED));
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return next(
        new ErrorResponse(`Expense not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user created the expense
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return next(
        new ErrorResponse('Not authorized to update this expense', StatusCodes.UNAUTHORIZED)
      );
    }

    await deleteExpenseById(req.params.id);
    expense= await addExpense(req.body, req.user._id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: expense,
    });

    // Now create a new expense with the updated data
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED));
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return next(
        new ErrorResponse(`Expense not found with id of ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user created the expense
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return next(
        new ErrorResponse('Not authorized to delete this expense', StatusCodes.UNAUTHORIZED)
      );
    }

    await deleteExpenseById(req.params.id, req.user._id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Expense deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Settle up with a friend
// @route   POST /api/expenses/settle-up
// @access  Private
export const settleUp = async (req, res, next) => {
  try {
    // Check if user exists in the request
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const { friendId, amount, description = 'Settlement payment', method = 'cash' } = req.body;

    // Verify friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return next(
        new ErrorResponse(`User not found with id of ${friendId}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if they are friends
    const user = await User.findById(req.user._id);
    if (!user.friends || !user.friends.includes(friendId)) {
      return next(
        new ErrorResponse(`${friend.name} is not in your friends list`, StatusCodes.BAD_REQUEST)
      );
    }    // Create a settlement expense (negative expense to offset balances)
    const settleExpense = await Expense.create({
      description: description,
      amount: amount,
      paidBy: [{ user: req.user._id, amount }],
      owedBy: [{ user: friendId, amount }],
      userBalances: [
        { user: req.user._id, balance: amount },  // I paid (positive balance means I'm owed money)
        { user: friendId, balance: -amount }      // They owe me (negative balance means they owe money)
      ],
      splitType: 'exact',
      category: 'Settlement',
      notes: `Settlement: ${method}`,
      createdBy: req.user._id,
    });
      // Update the transaction record
    const transaction = await Transaction.updateOrCreateFromExpense(settleExpense);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        settlement: settleExpense,
        updatedBalances: transaction.netBalances,
        minimizedTransactions: transaction.minimizedTransactions
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expenses with a specific friend
// @route   GET /api/expenses/friend/:friendId
// @access  Private
export const getFriendExpenses = async (req, res, next) => {
  try {
    // Check if user exists in the request
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const friendId = req.params.friendId;

    // Verify friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return next(
        new ErrorResponse(`User not found with id of ${friendId}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if they are friends
    const user = await User.findById(req.user._id);
    if (!user.friends || !user.friends.includes(friendId)) {
      return next(
        new ErrorResponse(`${friend.name} is not in your friends list`, StatusCodes.BAD_REQUEST)
      );
    }

    // Get expenses where both the user and friend are involved, but not group expenses
    const expenses = await Expense.find({
      $and: [
        { group: { $exists: false } }, // Exclude group expenses
        {
          $or: [
            { 'paidBy.user': req.user._id },
            { 'owedBy.user': req.user._id }
          ]
        },
        {
          $or: [
            { 'paidBy.user': friendId },
            { 'owedBy.user': friendId }
          ]
        }
      ]
    })
      .populate('paidBy.user', 'name email avatar')
      .populate('owedBy.user', 'name email avatar')
      .sort({ date: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: expenses.length,
      expenses: expenses
    });
  } catch (error) {
    next(error);
  }
};
