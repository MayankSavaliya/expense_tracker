import mongoose from 'mongoose';

const friendSchema = mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending'
    },
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of friend relationships
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Friend = mongoose.model('Friend', friendSchema);

export default Friend;
