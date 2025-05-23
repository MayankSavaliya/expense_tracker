import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paidBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        }
      },
    ],
    owedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        }
      },
    ],
    userBalances: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        balance: {
          type: Number,
          required: true,
        }
      },
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: [
        'Food & Drink',
        'Shopping',
        'Housing',
        'Transportation',
        'Entertainment',
        'Utilities',
        'Health',
        'Travel',
        'Other',
        'other',
        'travel'
      ],
      default: 'Other',
    },
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage'],
      default: 'equal',
    },
    notes: {
      type: String,
      trim: true,
    },
    receiptImage: {
      type: String,
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);


// // Middleware to keep track of group's total expenses
// expenseSchema.post('save', async function () {
//   if (this.group) {
//     const Group = mongoose.model('Group');
//     await Group.findByIdAndUpdate(this.group, {
//       $addToSet: { expenses: this._id },
//     });
//   }
// });

// // Middleware to remove expense from group when deleted
// expenseSchema.post('remove', async function () {
//   if (this.group) {
//     const Group = mongoose.model('Group');
//     await Group.findByIdAndUpdate(this.group, {
//       $pull: { expenses: this._id },
//     });
//   }
// });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
