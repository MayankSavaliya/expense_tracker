import Transaction from "../models/Transaction";

export const settleTransaction = async (transactionId , fromUserId , toUserId , amount) => {
    try {
        const transaction = await Transaction.findById(transactionId);
        
        if (!transaction) {
        throw new Error('Transaction not found');
        }
    
        // Find the net balance for the fromUser
        const fromBalance = transaction.netBalances.find(balance => balance.user.toString() === fromUserId);
        if (!fromBalance || fromBalance.balance < amount) {
        throw new Error('Insufficient balance for settlement');
        }
    
        // Update the balances
        fromBalance.balance -= amount;
    
        const toBalance = transaction.netBalances.find(balance => balance.user.toString() === toUserId);
        if (toBalance) {
        toBalance.balance += amount;
        } else {
        transaction.netBalances.push({ user: toUserId, balance: amount });
        }
    
        await transaction.save();
        return transaction;
    } catch (error) {
        console.error('Error settling transaction:', error);
        throw error;
    }
}