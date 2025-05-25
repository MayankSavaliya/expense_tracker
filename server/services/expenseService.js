import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import Transaction from '../models/Transaction.js';

export const addExpense = async (expenseData,userId) => {

    const { amount: totalAmount } = expenseData; 
    const splitType = expenseData.splitType || expenseData.splitMethod || 'equal';

    const paidBy = expenseData.paidBy;
    const owedBy = expenseData.owedBy;

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
        description: expenseData.description,
        amount: totalAmount,
        paidBy: processedPaidBy,
        owedBy: processedOwedBy, 
        userBalances,
        group: expenseData.group,
        date: expenseData.date || Date.now(),
        category: expenseData.category || 'Other',
        splitType: splitType, 
        notes: expenseData.notes,
        receiptImage: expenseData.receiptImage,
        createdBy: userId,
    });
    // Update transactions based on this new expense
    await Transaction.updateOrCreateFromExpense(expense);

    // If this expense belongs to a group, add it to the group's expenses
    if (expenseData.group) {
        await Group.findByIdAndUpdate(
        expenseData.group,
        { $addToSet: { expenses: expense._id } },
        { new: true }
        );
    }

    return expense;
};


export const deleteExpenseById = async (expenseId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new Error(`Expense not found with id of ${expenseId}`);
  if (expense.createdBy.toString() !== userId.toString())
    throw new Error(`Not authorized to delete this expense`);

  const inverseExpense = await Expense.create({
    description: `Deletion: ${expense.description}`,
    amount: expense.amount,
    paidBy: expense.paidBy,
    owedBy: expense.owedBy,
    userBalances: expense.userBalances.map(balance => ({
      user: balance.user,
      balance: -balance.balance,
    })),
    group: expense.group,
    date: Date.now(),
    category: expense.category,
    splitType: expense.splitType,
    createdBy: expense.createdBy,
  });

  await Transaction.updateOrCreateFromExpense(inverseExpense);

  if (expense.group) {
    await Group.findByIdAndUpdate(expense.group, {
      $pull: { expenses: expense._id },
    });
  }

  await Promise.all([
    expense.deleteOne(),
    inverseExpense.deleteOne(),
  ]);
};

