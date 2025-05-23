import mongoose from 'mongoose';
import User from './User.js';

const transactionSchema = mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: false,
    },
    isPersonal: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],    netBalances: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        balance: Number, // Negative: User owes money, Positive: User is owed money
      }
    ],
    minimizedTransactions: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: Number,
      }
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Generate minimized transactions to settle all debts
 * @param {Array} netBalances - Array of objects with user ID and balance
 * @returns {Array} Array of transactions (from, to, amount)
 */
transactionSchema.statics.minimizeTransactions = function(netBalances) {
  // Users with NEGATIVE balances are debtors (they owe money)
  // Users with POSITIVE balances are creditors (they are owed money)
  const debtors = netBalances
    .filter(entry => entry.balance < 0)  // Negative balance means they owe money
    .map(entry => ({ user: entry.user, amount: Math.abs(entry.balance) }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
    
  const creditors = netBalances
    .filter(entry => entry.balance > 0)  // Positive balance means they are owed money
    .map(entry => ({ user: entry.user, amount: entry.balance }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
    
  const transactions = [];
  
  // Process all debtors against creditors
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    
    // Calculate the transaction amount (minimum of what's owed and what's to be paid)
    const amount = Math.min(debtor.amount, creditor.amount);
    
    // Round to 2 decimal places
    const roundedAmount = parseFloat(amount.toFixed(2));
    
    // Add the transaction
    transactions.push({
      from: debtor.user,
      to: creditor.user,
      amount: roundedAmount
    });
    
    // Update remaining balances
    debtor.amount -= roundedAmount;
    creditor.amount -= roundedAmount;
    
    // Remove users with zero or near-zero balance
    if (debtor.amount < 0.01) debtors.shift();
    if (creditor.amount < 0.01) creditors.shift();
  }
  return transactions;
};

/**
 * Updates existing transaction or creates a new one based on expense data
 * @param {Object} expense - The newly created expense document
 * @returns {Object} The updated or created transaction
 */
transactionSchema.statics.updateOrCreateFromExpense = async function(expense) {
  try {
    const groupId = expense.group || null;
    const isPersonal = !groupId;
    console.log(groupId);
    // Extract unique participants from expense
    const participants = [
      ...new Set([
        ...expense.paidBy.map(p => p.user.toString()),
        ...expense.owedBy.map(o => o.user.toString())
      ])
    ];

    // Try to find an existing transaction
    let transaction = await this.findOne(
      groupId 
        ? { group: groupId } 
        : { 
            isPersonal: true, 
            participants: { $all: participants, $size: participants.length } 
          }
    );
    //group id is null then it is a personal transaction and directly add the balance into the user account
    if (groupId === null) {
      const userId = expense.paidBy[0].user.toString();
      const userBalance = expense.owedBy.find(o => o.user.toString() === userId);
      if (userBalance) {
        const balance = userBalance.amount;
        const user = await User.find(
          { _id: userId }
        );
        if (user) {
          user.balance += balance;
          await user.save();
        }
      }
    }

    if (!transaction) {
      // If no transaction exists, create one
      transaction = new this({
        group: groupId,
        isPersonal,
        participants,
        netBalances: [],
        minimizedTransactions: []
      });
    }

    // Merge current balances with new expense balances
    const balanceMap = {};

    // Add existing transaction balances to the map
    transaction.netBalances.forEach(item => {
      const userId = item.user.toString();
      balanceMap[userId] = (balanceMap[userId] || 0) + item.balance;
    });

    // Add new expense balances to the map
    expense.userBalances.forEach(item => {
      const userId = item.user.toString();
      balanceMap[userId] = (balanceMap[userId] || 0) + item.balance;
    });

    // Convert balance map back to array format with rounded values
    transaction.netBalances = Object.entries(balanceMap).map(([userId, balance]) => ({
      user: userId,
      balance: parseFloat(balance.toFixed(2))
    }));

    // Filter out zero or near-zero balances
    transaction.netBalances = transaction.netBalances.filter(item => 
      Math.abs(item.balance) >= 0.01
    );

    // Recompute minimized transactions
    transaction.minimizedTransactions = this.minimizeTransactions(transaction.netBalances);

    // Save and return the updated transaction
    await transaction.save();
    return transaction;
  } catch (error) {
    throw error;
  }
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
