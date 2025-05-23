// Calculate balances between users
export const calculateBalances = (expenses) => {
  const balances = {};

  for (const expense of expenses) {
    const paidBy = expense.paidBy._id.toString();
    
    // For each participant in the expense
    for (const participant of expense.participants) {
      const userId = participant.user._id.toString();
      
      // Skip if the participant is the one who paid or it's already settled
      if (userId === paidBy || participant.settled) {
        continue;
      }
      
      // Initialize balances for this pair if not exists
      const key = [paidBy, userId].sort().join('_');
      if (!balances[key]) {
        balances[key] = {
          users: [paidBy, userId],
          amount: 0,
        };
      }
      
      // Update balance - positive means first user owes second user
      if (paidBy === balances[key].users[0]) {
        balances[key].amount -= participant.share;
      } else {
        balances[key].amount += participant.share;
      }
    }
  }

  // Convert to array with formatted information
  return Object.values(balances).map((balance) => {
    const [user1, user2] = balance.users;
    const amount = Math.abs(balance.amount).toFixed(2);
    
    if (balance.amount > 0) {
      return { from: user1, to: user2, amount };
    } else if (balance.amount < 0) {
      return { from: user2, to: user1, amount };
    } else {
      return { from: user1, to: user2, amount: 0 };
    }
  }).filter((balance) => Number(balance.amount) > 0);
};

// Split expense function - to calculate shares based on splitType
export const splitExpense = (amount, participants, splitType, customSplit) => {
  // Initialize shares
  const shares = {};
  
  switch (splitType) {
    case 'equal':
      const equalShare = amount / participants.length;
      participants.forEach(userId => {
        shares[userId] = equalShare;
      });
      break;
      
    case 'exact':
      // Custom split should be an object with user IDs as keys and exact amounts as values
      if (customSplit) {
        Object.keys(customSplit).forEach(userId => {
          shares[userId] = customSplit[userId];
        });
      }
      break;
      
    case 'percentage':
      // Custom split should be an object with user IDs as keys and percentages as values
      if (customSplit) {
        Object.keys(customSplit).forEach(userId => {
          shares[userId] = (amount * customSplit[userId]) / 100;
        });
      }
      break;
      
    default:
      // Default to equal split
      const defaultShare = amount / participants.length;
      participants.forEach(userId => {
        shares[userId] = defaultShare;
      });
  }
  
  return shares;
};
