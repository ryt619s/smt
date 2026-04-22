import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdraw' | 'swap' | 'mining_reward' | 'mlm_reward';
  asset: 'USDT' | 'SMT' | 'BNB';
  amount: number;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['deposit', 'withdraw', 'swap', 'mining_reward', 'mlm_reward'], 
      required: true 
    },
    asset: { type: String, enum: ['USDT', 'SMT', 'BNB'], required: true },
    amount: { type: Number, required: true },
    txHash: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
