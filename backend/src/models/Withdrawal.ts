import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  netAmount: number;       // 75% of amount (after fee)
  fee: number;             // 5% platform fee
  reinvestAmount: number;  // 20% auto-reinvest
  walletAddress: string;
  status: 'pending' | 'otp_pending' | 'approved' | 'completed' | 'rejected' | 'failed';
  adminNote?: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema(
  {
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount:         { type: Number, required: true },
    netAmount:      { type: Number, required: true },
    fee:            { type: Number, required: true },
    reinvestAmount: { type: Number, required: true },
    walletAddress:  { type: String, required: true },
    status:         {
      type: String,
      enum: ['pending', 'otp_pending', 'approved', 'completed', 'rejected', 'failed'],
      default: 'otp_pending'
    },
    adminNote:      { type: String },
    txHash:         { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
