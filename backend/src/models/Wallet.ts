import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  mnemonicEncrypted: string;
  privateKeyEncrypted: string;
  addressId: string;
  balances: {
    usdt: number;
    smt: number;
    bnb: number;
  };
  lockedBalances: {
    usdt: number;
  };
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    mnemonicEncrypted: { type: String, required: true },
    privateKeyEncrypted: { type: String, required: true },
    addressId: { type: String, required: true, unique: true },
    balances: {
      usdt: { type: Number, default: 0 },
      smt:  { type: Number, default: 0 },
      bnb:  { type: Number, default: 0 }
    },
    lockedBalances: {
      usdt: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>('Wallet', WalletSchema);
