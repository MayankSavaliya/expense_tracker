import Expense from '../models/Expense.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../middleware/errorHandler.js';
import Group from '../models/Group.js';

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED));
    }
    console.log(req.body);
    const { amount: totalAmount } = req.body; 
    const splitType = req.body.splitType || req.body.splitMethod || 'equal';

    const paidBy = req.body.paidBy || [{ user: req.user._id, amount: totalAmount }];
    const owedBy = req.body.owedBy || [{ user: req.user._id, amount: totalAmount }];

    let processedPaidBy = [];
    switch (splitType) {
      case 'equal': {
        const count = paidBy.length;
        const share = parseFloat((totalAmount / count).toFixed(2));
        let remaining = totalAmount - share * (count - 1);
        processedPaidBy = paidBy.map((payer, i) => ({
          user: payer.user,
          amount: i === count - 1 ? remaining : share,
        }));
        break;
      }
      case 'percentage': {
        processedPaidBy = paidBy.map(payer => ({
          user: payer.user,
          amount: payer.amount,
        }));
        break;
      }
      case 'exact': {
        processedPaidBy = paidBy.map(payer => ({
          user: payer.user,
          amount: payer.amount,
        }));
        break;
      }
    }

    // Process owedBy based on splitType
    let processedOwedBy = [];
    switch (splitType) {
      case 'equal': {
        const count = owedBy.length;
        const share = parseFloat((totalAmount / count).toFixed(2));
        let remaining = totalAmount - share * (count - 1);
        processedOwedBy = owedBy.map((debtor, i) => ({
          user: debtor.user,
          amount: i === count - 1 ? remaining : share,
        }));
        break;
      }
      case 'percentage': {
        processedOwedBy = owedBy.map(debtor => ({
          user: debtor.user,
          amount: amount,
        }));
        break;
      }
      case 'exact': {
        processedOwedBy = owedBy.map(debtor => ({
          user: debtor.user,
          amount: debtor.amount,
        }));
        break;
      }
    }

   const userBalancesTemp = {};
    processedPaidBy.forEach(payer => {
      if (!userBalancesTemp[payer.user]) {
        userBalancesTemp[payer.user] = { paid: 0, owed: 0 };
      }
      userBalancesTemp[payer.user].paid += payer.amount;
    });

    processedOwedBy.forEach(debtor => {
      if (!userBalancesTemp[debtor.user]) {
        userBalancesTemp[debtor.user] = { paid: 0, owed: 0 };
      }
      userBalancesTemp[debtor.user].owed += debtor.amount;
    });

    const userBalances = [];
    for (const userId in userBalancesTemp) {
      const balance = userBalancesTemp[userId];
      const netBalance = parseFloat((balance.paid - balance.owed).toFixed(2));
      userBalances.push({
        user: userId,
        balance: netBalance,
      });
    }
    
    // Now save the expense store the entire like data model
    const expense = await Expense.create({
      description: req.body.description,
      amount: totalAmount,
      paidBy: processedPaidBy,
      owedBy: processedOwedBy, 
      userBalances,
      group: req.body.group,
      date: req.body.date || Date.now(),
      category: req.body.category || 'Other',
      splitType: splitType, 
      notes: req.body.notes,
      receiptImage: req.body.receiptImage,
      createdBy: req.user._id,
    });
    // Update transactions based on this new expense
    await Transaction.updateOrCreateFromExpense(expense);

    // If this expense belongs to a group, add it to the group's expenses
    if (req.body.group) {
      await Group.findByIdAndUpdate(
        req.body.group,
        { $addToSet: { expenses: expense._id } },
        { new: true }
      );
    }

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

    // Check if user has permission to view this expense
    const isDebtor = expense.owedBy.some(
      (debtor) => debtor.user._id.toString() === req.user._id.toString()
    );
    const isPayer = expense.paidBy.some(
      (payer) => payer.user._id.toString() === req.user._id.toString()
    );

    if (!isDebtor && !isPayer) {
      return next(
        new ErrorResponse('Not authorized to view this expense', StatusCodes.UNAUTHORIZED)
      );
    }

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
  //first delete the old expense by id using direct function deleteExpense
  //then create a new expense using the createExpense function

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
    }    // Prepare new request objects for the delete and create functions
    const deleteReq = { ...req, params: { id: req.params.id } };
    const createReq = { ...req, body: { ...req.body, group: expense.group } };
    
    // Create response objects that can be used within our functions
    let deleteRes = { 
      status: function(code) { 
        this.statusCode = code; 
        return this; 
      }, 
      json: function(data) { 
        this.data = data; 
        return this; 
      }
    };
    
    let createRes = { 
      status: function(code) { 
        this.statusCode = code; 
        return this; 
      }, 
      json: function(data) { 
        this.data = data; 
        return this; 
      }
    };
    
    // Create a dummy next function
    const dummyNext = (error) => {
      if (error) throw error;
    };
    
    // Delete the old expense
    await deleteExpense(deleteReq, deleteRes, dummyNext);
    
    // Create a new expense with the updated data
    await createExpense(createReq, createRes, dummyNext);
    
    const newExpense = createRes.data.data;
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: newExpense,
    });
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

    // Create an "inverse" of the expense balances to subtract from transactions
    const inverseBalances = expense.userBalances.map(balance => ({
      user: balance.user,
      balance: -balance.balance  // Negate the balance
    }));

    // Find the relevant transaction and update it
    const groupId = expense.group;
    const participants = [
      ...new Set([
        ...expense.paidBy.map(p => p.user.toString()),
        ...expense.owedBy.map(o => o.user.toString())
      ])
    ];

    let transaction = await Transaction.findOne(
      groupId 
        ? { group: groupId } 
        : { 
            isPersonal: true, 
            participants: { $all: participants, $size: participants.length } 
          }
    );

    if (transaction) {
      // Update balances by applying the inverse
      const balanceMap = {};
      
      // Add existing transaction balances to the map
      transaction.netBalances.forEach(item => {
        const userId = item.user.toString();
        balanceMap[userId] = (balanceMap[userId] || 0) + item.balance;
      });
      
      // Subtract this expense's balances
      inverseBalances.forEach(item => {
        const userId = item.user.toString();
        balanceMap[userId] = (balanceMap[userId] || 0) + item.balance;
      });
      
      // Remove very small balances (rounding errors)
      Object.keys(balanceMap).forEach(key => {
        if (Math.abs(balanceMap[key]) < 0.01) {
          delete balanceMap[key];
        }
      });
      
      // Convert balance map back to array format
      transaction.netBalances = Object.entries(balanceMap).map(([userId, balance]) => ({
        user: userId,
        balance: parseFloat(balance.toFixed(2))
      }));
      
      // Recalculate minimized transactions
      transaction.minimizedTransactions = Transaction.minimizeTransactions(transaction.netBalances);
      
      await transaction.save();
    }

    // Remove from group if it belongs to one
    if (expense.group) {
      await Group.findByIdAndUpdate(
        expense.group,
        { $pull: { expenses: expense._id } }
      );
    }

    // Delete the expense
    await expense.deleteOne();

    res.status(StatusCodes.OK).json({
      success: true,
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
