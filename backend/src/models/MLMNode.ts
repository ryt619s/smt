import mongoose, { Document, Schema } from 'mongoose';

export interface IMLMNode extends Document {
  userId: mongoose.Types.ObjectId;
  sponsorId: mongoose.Types.ObjectId;
  level: number;
  totalTeamSize: number;
  totalTeamHashrate: number;
}

const MLMNodeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    sponsorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: Number, required: true }, // Distance from the root or absolute system depth
    totalTeamSize: { type: Number, default: 0 },
    totalTeamHashrate: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IMLMNode>('MLMNode', MLMNodeSchema);
