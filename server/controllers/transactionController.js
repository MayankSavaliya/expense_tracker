import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Get transaction balances for current user or a group
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    // Check if user exists in the request
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const { groupId } = req.query;
    let transactions;

    if (groupId) {
      // Get transactions for specific group
      transactions = await Transaction.findOne({ group: groupId })
        .populate('participants', 'name email avatar')
        .populate('minimizedTransactions.from', 'name email avatar')
        .populate('minimizedTransactions.to', 'name email avatar')
        .populate('netBalances.user', 'name email avatar');
    } else {
      // Get personal transactions for user
      transactions = await Transaction.find({
        isPersonal: true,
        participants: req.user._id
      })
        .populate('participants', 'name email avatar')
        .populate('minimizedTransactions.from', 'name email avatar')
        .populate('minimizedTransactions.to', 'name email avatar')
        .populate('netBalances.user', 'name email avatar');
    }

    if (!transactions) {
      return res.status(StatusCodes.OK).json({
        success: true,
        data: { 
          netBalances: [],
          minimizedTransactions: []
        }
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const transaction = await Transaction.findById(req.params.id)
      .populate('participants', 'name email avatar')
      .populate('minimizedTransactions.from', 'name email avatar')
      .populate('minimizedTransactions.to', 'name email avatar')
      .populate('netBalances.user', 'name email avatar')
      .populate('group', 'name');

    if (!transaction) {
      return next(
        new ErrorResponse(`Transaction not found with id ${req.params.id}`, StatusCodes.NOT_FOUND)
      );
    }

    // Check if user is participant
    const isParticipant = transaction.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return next(
        new ErrorResponse('Not authorized to view this transaction', StatusCodes.UNAUTHORIZED)
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's summary of all balances
// @route   GET /api/transactions/summary
// @access  Private
export const getBalanceSummary = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    // Get all transactions where user is a participant
    const transactions = await Transaction.find({
      participants: req.user._id
    })
      .populate('participants', 'name email avatar')
      .populate('group', 'name')
      .populate('netBalances.user', 'name email avatar');

    // Create a summary of balances per group and per friend
    const summary = {
      groups: {},
      friends: {},
      totalOwed: 0,
      totalOwes: 0
    };
    console.log(transactions)
    transactions.forEach(transaction => {
      // Find user's balance in this transaction
      const userBalance = transaction.netBalances.find(
        b => b.user._id.toString() === req.user._id.toString()
      );
      
      if (!userBalance) return;
      
      const balance = userBalance.balance;
      
      if (transaction.group) {
        // Add to group summary
        const groupId = transaction.group._id.toString();
        const groupName = transaction.group.name;
        
        summary.groups[groupId] = {
          id: groupId,
          name: groupName,
          balance
        };
      } else {
        // Add to friend summary
        transaction.participants.forEach(participant => {
          if (participant._id.toString() === req.user._id.toString()) return;
          
          const friendId = participant._id.toString();
          const friendName = participant.name;
          
          // For personal transactions, we need to find the direct balance with this friend
          const friendBalance = transaction.netBalances.find(
            b => b.user._id.toString() === friendId
          );
          
          if (!friendBalance) return;
          
          // We take the negative of the friend's balance to get our balance with them
          const balanceWithFriend = -friendBalance.balance;
          
          summary.friends[friendId] = {
            id: friendId,
            name: friendName,
            balance: balanceWithFriend
          };
        });
      }
        // Add to totals
      // Negative balance means you owe money to others
      // Positive balance means others owe money to you
      if (balance < 0) {
        summary.totalOwes += Math.abs(balance);
      } else if (balance > 0) {
        summary.totalOwed += balance;
      }
    });

    // Convert to arrays
    summary.groups = Object.values(summary.groups);
    summary.friends = Object.values(summary.friends);
    
    // Round totals to 2 decimal places
    summary.totalOwed = parseFloat(summary.totalOwed.toFixed(2));
    summary.totalOwes = parseFloat(summary.totalOwes.toFixed(2));

    res.status(StatusCodes.OK).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get simplified balance summary (total amounts only)
// @route   GET /api/transactions/simple-summary
// @access  Private
export const getSimpleBalanceSummary = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }
    console.log(req.user)
    // Get all transactions where user is a participant
    const transactions = await Transaction.find({
      participants: req.user._id
    }).populate('netBalances.user', 'name');

    let totalOwed = 0;    // Amount others owe you
    let totalOwes = 0;    // Amount you owe others
    console.log(transactions)
    transactions.forEach(transaction => {
      // Find user's balance in this transaction
      const userBalance = transaction.netBalances.find(
        b => b.user._id.toString() === req.user._id.toString()
      );
      
      if (!userBalance) return;
      
      const balance = userBalance.balance;
      
      // Negative balance means you owe money
      if (balance < 0) {
        totalOwes += Math.abs(balance);
      } 
      // Positive balance means others owe you money
      else if (balance > 0) {
        totalOwed += balance;
      }
    });

    // Round to 2 decimal places
    totalOwed = parseFloat(totalOwed.toFixed(2));
    totalOwes = parseFloat(totalOwes.toFixed(2));

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalOwed,    // Amount others owe you
        totalOwes,    // Amount you owe others
        netBalance: parseFloat((totalOwed - totalOwes).toFixed(2))  // Net balance
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all debts for a specific user
export const getUserDebts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all transactions where user is either payer or debtor
    const transactions = await Transaction.find({
      $or: [
        { payer: userId },
        { 'debtors.user': userId }
      ]
    }).populate('payer', 'name email')
      .populate('debtors.user', 'name email')
      .populate('group', 'name');

    // Calculate net amounts
    let totalOwed = 0;
    let totalOwing = 0;
    const debtDetails = [];

    transactions.forEach(transaction => {
      const isPayer = transaction.payer._id.toString() === userId;
      const debtorEntry = transaction.debtors.find(d => d.user._id.toString() === userId);
      
      if (isPayer) {
        // User paid for others
        const amountPerPerson = transaction.amount / transaction.debtors.length;
        totalOwed += amountPerPerson * (transaction.debtors.length - 1);
        
        debtDetails.push({
          type: 'paid',
          amount: amountPerPerson * (transaction.debtors.length - 1),
          transaction: transaction._id,
          date: transaction.date,
          description: transaction.description,
          group: transaction.group?.name
        });
      } else if (debtorEntry) {
        // User owes others
        const amountPerPerson = transaction.amount / transaction.debtors.length;
        totalOwing += amountPerPerson;
        
        debtDetails.push({
          type: 'owe',
          amount: amountPerPerson,
          transaction: transaction._id,
          date: transaction.date,
          description: transaction.description,
          group: transaction.group?.name,
          to: transaction.payer.name
        });
      }
    });

    res.json({
      netAmount: totalOwed - totalOwing,
      summary: {
        totalOwed,
        totalOwing,
        netPosition: totalOwed - totalOwing
      },
      transactions: debtDetails
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get balance between two specific users
export const getBalanceBetweenUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    // Get user information for the response
    const user1 = await User.findById(userId1).select('name email avatar');
    const user2 = await User.findById(userId2).select('name email avatar');
    
    if (!user1 || !user2) {
      return res.status(404).json({ 
        success: false, 
        message: "One or both users not found" 
      });
    }
    
    // Use our new method to get the balance between users
    const balanceData = await Transaction.getBalanceBetweenUsers(userId1, userId2);

    res.json({
      success: true,
      data: balanceData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all debts within a specific group
export const getGroupDebts = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Get all transactions in the group
    const transactions = await Transaction.find({ group: groupId })
      .populate('payer', 'name email')
      .populate('debtors.user', 'name email')
      .populate('group', 'name');

    const userDebts = new Map(); // Map to store net amounts for each user

    transactions.forEach(transaction => {
      const amountPerPerson = transaction.amount / transaction.debtors.length;
      const payerId = transaction.payer._id.toString();

      // Initialize payer's entry if not exists
      if (!userDebts.has(payerId)) {
        userDebts.set(payerId, {
          name: transaction.payer.name,
          totalPaid: 0,
          totalOwed: 0,
          transactions: []
        });
      }

      // Update payer's total paid
      const payerEntry = userDebts.get(payerId);
      payerEntry.totalPaid += transaction.amount;
      payerEntry.transactions.push({
        type: 'paid',
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description
      });

      // Update debtors' amounts
      transaction.debtors.forEach(debtor => {
        const debtorId = debtor.user._id.toString();
        if (debtorId !== payerId) {
          if (!userDebts.has(debtorId)) {
            userDebts.set(debtorId, {
              name: debtor.user.name,
              totalPaid: 0,
              totalOwed: 0,
              transactions: []
            });
          }
          const debtorEntry = userDebts.get(debtorId);
          debtorEntry.totalOwed += amountPerPerson;
          debtorEntry.transactions.push({
            type: 'owe',
            amount: amountPerPerson,
            date: transaction.date,
            description: transaction.description,
            to: transaction.payer.name
          });
        }
      });
    });

    // Convert Map to array and calculate net positions
    const groupDebts = Array.from(userDebts.entries()).map(([userId, data]) => ({
      userId,
      name: data.name,
      netPosition: data.totalPaid - data.totalOwed,
      summary: {  
        totalPaid: data.totalPaid,
        totalOwed: data.totalOwed
      },
      transactions: data.transactions
    }));

    res.json({
      groupId,
      groupName: transactions[0]?.group?.name,
      debts: groupDebts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a settlement between two users
// @route   POST /api/transactions/settlement
// @access  Private
export const createSettlement = async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description } = req.body;
    
    // Validate inputs
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: fromUserId, toUserId, or amount" 
      });
    }
    
    // Ensure amount is positive
    const settleAmount = Math.abs(parseFloat(amount));
    
    // Create the settlement transaction
    const settlement = await Transaction.createSettlement(
      fromUserId, 
      toUserId, 
      settleAmount, 
      description || "Settlement"
    );
    
    res.status(201).json({
      success: true,
      message: "Settlement created successfully",
      data: settlement
    });
  } catch (error) {
    console.error('Error creating settlement:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export default {
  getTransactions,
  getTransactionById,
  getBalanceSummary,
  getSimpleBalanceSummary,
  getUserDebts,
  getBalanceBetweenUsers,
  getGroupDebts,
  createSettlement
};
