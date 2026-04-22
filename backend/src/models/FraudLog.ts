import mongoose, { Document, Schema } from 'mongoose';

export interface IFraudLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  reason: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
}

const FraudLogSchema: Schema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action:    { type: String, required: true },
  reason:    { type: String, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IFraudLog>('FraudLog', FraudLogSchema);
