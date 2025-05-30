import mongoose from 'mongoose';

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
    ],
    netBalances: [
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
    // Extract unique participants from expense
    const participants = [
      ...new Set([
        ...expense.paidBy.map(p => p.user.toString()),
        ...expense.owedBy.map(o => o.user.toString())
      ])
    ];

    // Try to find an existing transaction
    let transaction = await this.findOne({group: groupId });

    if(isPersonal){
      const netBalances = expense.userBalances.map(balance => ({
        user: balance.user,
        balance: parseFloat(balance.balance.toFixed(2))
      })).filter(item => Math.abs(item.balance) >= 0.01);

      const minimizedTransactions=this.minimizeTransactions(netBalances);

       for (const minTx of minimizedTransactions) {
        const participants = [minTx.from._id.toString(), minTx.to._id.toString()];
        
        // Try to find existing transaction between these two users
        let transaction = await this.findOne({
          isPersonal: true,
          participants: { $all: participants, $size: 2 }
        });

        if (!transaction) {
          // Create new transaction if none exists
          transaction = new this({
            isPersonal: true,
            participants,
            netBalances: [
              { user: minTx.from, balance: -minTx.amount },
              { user: minTx.to, balance: minTx.amount }
            ],
            minimizedTransactions: [minTx]
          });

          await transaction.save();
        } 
        else {

          // Update net balances
          const balanceMap = new Map();

          // Add existing balances to the map
          transaction.netBalances.forEach(item => {
            balanceMap.set(item.user.toString(), item.balance);
          });
          // Update balances based on new minimized transaction
          balanceMap.set(minTx.from.toString(),
            (balanceMap.get(minTx.from.toString()) || 0) - minTx.amount);
          balanceMap.set(minTx.to.toString(),
            (balanceMap.get(minTx.to.toString()) || 0) + minTx.amount);
          
          transaction.netBalances = Array.from(balanceMap.entries())
            .map(([userId, balance]) => ({
              user: userId,
              balance: parseFloat(balance.toFixed(2))
            }));
          
          transaction.minimizedTransactions = this.minimizeTransactions(transaction.netBalances);   

          await transaction.save();
        }
      }
      
      // Return the first transaction (if any were created/updated)
      if (minimizedTransactions.length > 0) {
        return await this.findOne({
          isPersonal: true,
          participants: { 
            $all: [minimizedTransactions[0].from, minimizedTransactions[0].to],
            $size: 2 
          }
        });
      }
      return null;
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

/**
 * Get the balance between two specific users across all transactions
 * @param {String} user1Id - ID of the first user
 * @param {String} user2Id - ID of the second user
 * @returns {Object} Object containing the direct balance between the users
 */
transactionSchema.statics.getBalanceBetweenUsers = async function(user1Id, user2Id) {
  try {
    // Convert IDs to strings for consistent comparison
    user1Id = user1Id.toString();
    user2Id = user2Id.toString();
    
    // Find all transactions where both users are participants
    const transactions = await this.find({
      participants: { $all: [user1Id, user2Id] }
    }).populate('minimizedTransactions.from minimizedTransactions.to', 'name avatar');

    // Extract direct transactions between these two users
    let directTransactions = [];
    let netBalance = 0;
    transactions.forEach(transaction => {
      // From minimizedTransactions, extract only those between the two users
      const relevantTransactions = transaction.minimizedTransactions.filter(t => 
        (t.from._id.toString() === user1Id && t.to._id.toString() === user2Id) || 
        (t.from._id.toString() === user2Id && t.to._id.toString() === user1Id)
      );

      relevantTransactions.forEach(t => {
        // If user1 owes user2, add to balance
        if (t.from._id.toString() === user1Id && t.to._id.toString() === user2Id) {
          netBalance -= t.amount;
          // console.log(netBalance);
          directTransactions.push({
            transactionId: transaction._id,
            ...t.toObject(),
            date: transaction.updatedAt,
            group: transaction.group,
            isPersonal: transaction.isPersonal
          });
        } 
        // If user2 owes user1, subtract from balance
        else if (t.from._id.toString() === user2Id && t.to._id.toString() === user1Id) {
          netBalance += t.amount;
          directTransactions.push({
            transactionId: transaction._id,
            ...t.toObject(),
            date: transaction.updatedAt,
            group: transaction.group,
            isPersonal: transaction.isPersonal
          });
        }
      });
    });

    return { 
      balance: parseFloat(netBalance.toFixed(2)), 
      isUser1Debtor: netBalance < 0, // If positive, user1 owes user2
      transactions: directTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)) 
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Create a settlement transaction between two users
 * @param {String} fromUserId - ID of the user who owes money
 * @param {String} toUserId - ID of the user who is owed money
 * @param {Number} amount - Amount being settled
 * @param {String} description - Optional description of the settlement
 * @returns {Object} The updated transaction object
 */
transactionSchema.statics.createSettlement = async function(fromUserId, toUserId, amount, description = "Settlement") {
  try {
    // Create a simple settlement structure (mirroring the expense structure)
    const settlementData = {
      paidBy: [{ user: fromUserId, amount: amount }], // fromUserId made a payment
      owedBy: [{ user: toUserId, amount: 0 }],      // toUserId is involved; amount 0 for participant identification
      userBalances: [
        { user: fromUserId, balance: -amount },  // Payer's net balance position decreases
        { user: toUserId, balance: amount }    // Receiver's net balance position increases
      ],
      description,
      isPersonal: true, // Explicitly a personal transaction
      group: null,      // No group involved
      // isSettlement: true // This field can be added to transactionSchema if needed for querying settlements
    };
    
    // Reuse the existing updateOrCreateFromExpense method
    const transaction = await this.updateOrCreateFromExpense(settlementData);
    
    return transaction;
  } catch (error) {
    throw error;
  }
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
