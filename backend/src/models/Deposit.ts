import mongoose, { Document, Schema } from 'mongoose';

export interface IDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  txHash?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema: Schema = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount:    { type: Number, required: true },
    txHash:    { type: String },
    status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IDeposit>('Deposit', DepositSchema);
