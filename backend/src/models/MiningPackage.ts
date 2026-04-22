import mongoose, { Document, Schema } from 'mongoose';

export interface IMiningPackage extends Document {
  userId: mongoose.Types.ObjectId;
  packageType: 'Basic' | 'Pro' | 'Ultra';
  hashrate: number;
  costUSD: number;
  isActive: boolean;
  startDate: Date;
}

const MiningPackageSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    packageType: { type: String, enum: ['Basic', 'Pro', 'Ultra'], required: true },
    hashrate: { type: Number, required: true },
    costUSD: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IMiningPackage>('MiningPackage', MiningPackageSchema);
