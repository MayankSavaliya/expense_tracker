import mongoose from 'mongoose';

const settlementSchema = mongoose.Schema(
  {
    // Core settlement information
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'From user is required']
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'To user is required']
    },
    amount: {
      type: Number,
      required: [true, 'Settlement amount is required'],
      min: [0.01, 'Amount must be at least 0.01']
    },
    description: {
      type: String,
      trim: true,
      default: 'Settlement payment'
    },
    
    // Settlement context
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    isPersonal: {
      type: Boolean,
      default: function() {
        return !this.group;
      }
    },
      // Settlement details
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi', 'card', 'other'],
      default: 'cash'
    },
    notes: {
      type: String,
      trim: true
    },
    
    // Related transaction
    relatedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
settlementSchema.index({ fromUser: 1, createdAt: -1 });
settlementSchema.index({ toUser: 1, createdAt: -1 });
settlementSchema.index({ group: 1, createdAt: -1 });
settlementSchema.index({ createdAt: -1 });

// Virtual for settlement direction (from current user's perspective)
settlementSchema.virtual('direction').get(function() {
  // This will need to be set based on the current user context
  return 'outgoing'; // Will be overridden in queries
});

// Static method to get settlements for a user
settlementSchema.statics.getForUser = async function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    group,
    startDate,
    endDate
  } = options;

  const query = {
    $or: [
      { fromUser: userId },
      { toUser: userId }
    ]
  };

  if (group) query.group = group;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return await this.find(query)
    .populate('fromUser', 'name email avatar')
    .populate('toUser', 'name email avatar')
    .populate('group', 'name icon iconBg')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get settlements for a group
settlementSchema.statics.getForGroup = async function(groupId, options = {}) {
  const {
    limit = 50,
    skip = 0
  } = options;

  const query = { group: groupId };

  return await this.find(query)
    .populate('fromUser', 'name email avatar')
    .populate('toUser', 'name email avatar')
    .populate('group', 'name icon iconBg')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get settlement statistics
settlementSchema.statics.getStats = async function(userId, options = {}) {
  const {
    period = 'all', // 'week', 'month', 'year', 'all'
    group
  } = options;

  let dateQuery = {};
  const now = new Date();
  
  switch (period) {
    case 'week':
      dateQuery.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      break;
    case 'month':
      dateQuery.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
      break;
    case 'year':
      dateQuery.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
      break;
  }
  const baseQuery = {
    $or: [
      { fromUser: userId },
      { toUser: userId }
    ],
    ...dateQuery
  };

  if (group) baseQuery.group = group;

  const settlements = await this.find(baseQuery);

  let totalSent = 0;
  let totalReceived = 0;
  let totalCount = settlements.length;

  settlements.forEach(settlement => {
    if (settlement.fromUser.toString() === userId.toString()) {
      totalSent += settlement.amount;
    } else {
      totalReceived += settlement.amount;
    }
  });

  return {
    totalCount,
    totalSent: parseFloat(totalSent.toFixed(2)),
    totalReceived: parseFloat(totalReceived.toFixed(2)),
    netAmount: parseFloat((totalReceived - totalSent).toFixed(2)),
    period
  };
};

const Settlement = mongoose.model('Settlement', settlementSchema);

export default Settlement;