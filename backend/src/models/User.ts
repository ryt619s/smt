import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  rank: string;
  isVerified: boolean;
  isBanned: boolean;
  // Registration OTP
  emailOTP?: string;
  otpExpiry?: Date;
  otpAttempts: number;
  // Withdrawal OTP
  withdrawalOTP?: string;
  withdrawalOTPExpiry?: Date;
  // Password Reset OTP
  resetOTP?: string;
  resetOTPExpiry?: Date;
  resetOTPAttempts: number;
  resetVerified: boolean;
  // Login security
  loginAttempts: number;
  lockedUntil?: Date;
  role: 'user' | 'admin';
  // Fraud Detection
  isFlagged: boolean;
  fraudReason?: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email:             { type: String, required: true, unique: true },
    passwordHash:      { type: String, required: true },
    name:              { type: String, required: true },
    referralCode:      { type: String, required: true, unique: true, index: true },
    referredBy:        { type: Schema.Types.ObjectId, ref: 'User' },
    rank:              { type: String, default: 'Member' },
    isVerified:        { type: Boolean, default: false },
    isBanned:          { type: Boolean, default: false },
    // Registration OTP
    emailOTP:          { type: String },
    otpExpiry:         { type: Date },
    otpAttempts:       { type: Number, default: 0 },
    // Withdrawal OTP
    withdrawalOTP:     { type: String },
    withdrawalOTPExpiry: { type: Date },
    // Password Reset
    resetOTP:          { type: String },
    resetOTPExpiry:    { type: Date },
    resetOTPAttempts:  { type: Number, default: 0 },
    resetVerified:     { type: Boolean, default: false },
    // Login Security
    loginAttempts:     { type: Number, default: 0 },
    lockedUntil:       { type: Date },
    role:              { type: String, enum: ['user', 'admin'], default: 'user' },
    // Fraud Detection
    isFlagged:   { type: Boolean, default: false },
    fraudReason: { type: String },
    riskLevel:   { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
