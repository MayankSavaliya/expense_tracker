import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Settlement from '../models/Settlement.js';
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

// @desc    Get simplified balance summary (total amounts only)  for the dashboard page total owed and toal owes
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
    const { fromUserId, toUserId, amount } = req.body;

    // Validate inputs
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fromUserId, toUserId, or amount"
      });
    }

    // //First of all check if the users exist
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: "One or both users not found"
      });
    }

    //Now find the balance between the two users
    const data = await Transaction.getBalanceBetweenUsers(fromUserId, toUserId);

    if(data.balance>=0){
      return res.status(400).json({
        success: false,
        message: "No pending balance between these users"
      });
    }

    if(Math.abs(data.balance) < amount){
      return res.status(400).json({
        success: false,
        message: `Amount exceeds the pending balance of ${abs(data.balance)}`
      });
    }

    //sort the transactions by touser to from first and after fromuser to touser and in tie case use amount
    data.transactions.sort((a, b) => {
      if (a.from._id.toString() === fromUserId && a.to._id.toString() === toUserId) {
        return 1; // fromUser to toUser comes second
      } else if (a.from._id.toString() === toUserId && a.to._id.toString() === fromUserId) {
        return -1; // toUser to fromUser comes first
      }
      else return a.amount - b.amount; // sort by amount in case of tie
    });

    //Now iterate through the transactions and settle the amount
    let remainingAmount = amount;

    for (const tr of data.transactions) {
      if (remainingAmount <= 0) break; // No more amount to settle

      const transactionAmount = tr.amount;
      const transaction = await Transaction.findById(tr.transactionId);
      //now check if the touser to from user then direct remove that amount from the transaction
      // console.log(tr);
      if (tr.from._id.toString() === fromUserId && tr.to._id.toString() === toUserId) {
        // This is a transaction from fromUser to toUser
        const requiredAmount = Math.min(remainingAmount, transactionAmount);
        transaction.netBalances.forEach(balance => {
          if (balance.user._id.toString() === fromUserId) {
            balance.balance = parseFloat((balance.balance + requiredAmount).toFixed(2)); // Remove from fromUser
          }
          else if (balance.user._id.toString() === toUserId) {
            balance.balance = parseFloat((balance.balance - requiredAmount).toFixed(2)); // Add to toUser
          }
        });
        await transaction.save();
        // // Update remaining amount
        remainingAmount -= requiredAmount;
        // // Clean up near-zero balances and recalculate minimized transactions
        transaction.netBalances = transaction.netBalances.map(balance => ({
          user: balance.user,
          balance: parseFloat(balance.balance.toFixed(2))
        })).filter(balance => Math.abs(balance.balance) >= 0.01);

        transaction.minimizedTransactions = Transaction.minimizeTransactions(transaction.netBalances);

        await transaction.save();
      } 
      else if (tr.from._id.toString() === toUserId && tr.to._id.toString() === fromUserId) {
        // This is a transaction from toUser to fromUser direct settle this no need to check the balance        //Now add balance into the to and remove from the from
        transaction.netBalances.forEach(balance => {
          if (balance.user._id.toString() === fromUserId) {
            balance.balance = parseFloat((balance.balance - transactionAmount).toFixed(2)); // Remove from fromUser
          } else if (balance.user._id.toString() === toUserId) {
            balance.balance = parseFloat((balance.balance + transactionAmount).toFixed(2)); // Add to toUser
          }
        });
        remainingAmount = parseFloat((remainingAmount + transactionAmount).toFixed(2));

        await transaction.save();
        // // Clean up near-zero balances and recalculate minimized transactions
        transaction.netBalances = transaction.netBalances.map(balance => ({
          user: balance.user,
          balance: parseFloat(balance.balance.toFixed(2))
        })).filter(balance => Math.abs(balance.balance) >= 0.01);

        transaction.minimizedTransactions = Transaction.minimizeTransactions(transaction.netBalances);

        await transaction.save();
      }
    }

    const settlement = await Settlement.create({
      fromUser: fromUserId,
      toUser: toUserId,
      amount : parseFloat(amount.toFixed(2)),
      description: `Settlement between ${fromUser.name} and ${toUser.name}`,
      isPersonal: true,
      method: req.body.method || 'cash',
      notes: req.body.notes || '',
    });
    //save
    await settlement.save();

    res.status(200).json({
      success: true,
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

export const groupSettelment = async (req, res) => {
  try {
    const { groupId, toUserId, amount } = req.body;

    const user = req.user;
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required"
      });
    }
    const transaction = await Transaction.findOne({ group: groupId });
    transaction.netBalances.forEach(balance => {
      if (balance.user._id.toString() === user._id.toString()) {
        balance.balance = parseFloat((balance.balance + amount).toFixed(2)); // Remove from current user
      } else if (balance.user._id.toString() === toUserId) {
        balance.balance = parseFloat((balance.balance - amount).toFixed(2)); // Add to the target user
      }
    });    // Clean up near-zero balances and recalculate minimized transactions
    transaction.netBalances = transaction.netBalances.map(balance => ({
      user: balance.user,
      balance: parseFloat(balance.balance.toFixed(2))
    })).filter(balance => Math.abs(balance.balance) >= 0.01);


    transaction.minimizedTransactions = Transaction.minimizeTransactions(transaction.netBalances);

    await transaction.save();

    // Create a new settlement record
    const settlement = await Settlement.create({
      fromUser: user._id,
      toUser: toUserId,
      amount,
      description: `Group settlement`,
      group: groupId,
      isPersonal: false,
      method: req.body.method || 'cash',
      notes: req.body.notes || '',
      relatedTransaction: transaction._id
    });

    res.status(200).json({
      success: true,
      message: "Settlement recorded successfully",
      data: settlement
    });
  }
  catch (error) {
    console.error('Error creating group settlement:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get settlement suggestions for a user
// @route   GET /api/transactions/settlement-suggestions?userId=123
// @access  Private
export const getSettlementSuggestions = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorResponse('User not authenticated', StatusCodes.UNAUTHORIZED)
      );
    }

    const { userId } = req.query;

    if (!userId) {
      return next(
        new ErrorResponse('User ID is required', StatusCodes.BAD_REQUEST)
      );
    }    // Get all transactions where the specified user is a participant
    const transactions = await Transaction.find({
      participants: userId
    })
      .populate('participants', 'name email avatar')
      .populate('minimizedTransactions.from', 'name email avatar')
      .populate('minimizedTransactions.to', 'name email avatar')
      .populate('netBalances.user', 'name email avatar')
      .populate('group', 'name avatar');

    let suggestions = [];    // Get target user details once
    const targetUser = await User.findById(userId).select('name email avatar');

    // Process each transaction to find pending settlements involving the user
    transactions.forEach(transaction => {
      // Check minimized transactions for group settlements
      const userInvolvedTransactions = transaction.minimizedTransactions.filter(
        minTx => minTx.from._id.toString() === userId
      );

      userInvolvedTransactions.forEach(minTx => {
        suggestions.push({
          id: transaction.group ?
            `${minTx.from._id}-${minTx.to._id}-${transaction.group._id}` :
            `${minTx.from._id}-${minTx.to._id}`,
          type: transaction.group ? 'group' : 'personal',
          transactionId: transaction._id,          // Add group details if it's a group transaction
          ...(transaction.group && {
            groupId: transaction.group._id,
            groupName: transaction.group.name,
            groupAvatar: transaction.group.avatar
          }),
          from: {
            id: minTx.from._id,
            name: minTx.from.name,
            email: minTx.from.email,
            avatar: minTx.from.avatar
          },
          to: {
            id: minTx.to._id,
            name: minTx.to.name,
            email: minTx.to.email,
            avatar: minTx.to.avatar
          }, amount: parseFloat(minTx.amount.toFixed(2)),
          description: transaction.group ?
            `Settlement within ${transaction.group.name}` :
            `Personal settlement`
        });
      });
    });    // Sort by amount (highest first)
    const sortedSuggestions = suggestions.sort((a, b) => b.amount - a.amount);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        suggestions: sortedSuggestions,
        totalSuggestions: sortedSuggestions.length,
        totalAmount: parseFloat(sortedSuggestions.reduce((sum, s) => sum + s.amount, 0).toFixed(2))
      }
    });

  } catch (error) {
    next(error);
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
  createSettlement,
  groupSettelment,
  getSettlementSuggestions
};
