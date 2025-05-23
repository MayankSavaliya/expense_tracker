import mongoose, { connect } from 'mongoose';
import Transaction from './Transaction.js';
const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
    icon: {
      type: String,
      default: 'Users'
    },
    iconBg: {
      type: String,
      default: 'bg-mint-500'
    },
    type: {
      type: String,
      enum: ['shared', 'trip', 'home', 'custom'],
      default: 'shared'
    },
  },
  {
    timestamps: true,
    toJson:{virtuals:true},
    toObject:{virtuals:true}
  }
);

// Make sure creator is always a member and filter out null values
groupSchema.pre('save', function (next) {
  // Filter out null or undefined values from members array
  this.members = this.members.filter(member => member !== null && member !== undefined);
  
  // Ensure creator is always a member
  if (!this.members.includes(this.creator)) {
    this.members.push(this.creator);
  }
  next();
});

groupSchema.methods.totalExpenses = async function () {
  let total = 0;
  this.expenses.forEach(expense => {
    total += expense.amount; // Assuming each expense has an amount field
  });
  return total;
}
// Method to get a member's balance within the group
groupSchema.methods.getMemberBalance = async function(userId) {
  try {
    const transaction = await Transaction.findOne({ 
      group: this._id 
    }).populate('netBalances.user', 'name email avatar');
    
    if (!transaction || !transaction.netBalances) {
      return 0;
    }
    
    const userBalance = transaction.netBalances.find(
      balance => balance.user && balance.user._id.toString() === userId.toString()
    );
    
    return userBalance ? userBalance.balance : 0;
  } catch (error) {
    console.error('Error getting member balance:', error);
    return 0;
  }
};
const Group = mongoose.model('Group', groupSchema);

export default Group;
