import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Withdrawal from '../models/Withdrawal';
import Transaction from '../models/Transaction';
import { sendOTPEmail } from '../services/emailService';
import { checkWithdrawalAnomalies } from '../services/fraudService';

const OTP_EXPIRY_MS  = 5 * 60 * 1000;
const MIN_WITHDRAWAL = 10;   // USDT
const PLATFORM_FEE   = 0.05; // 5%
const REINVEST_RATE  = 0.20; // 20%
const NET_RATE       = 0.75; // 75% to user

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── POST /api/withdraw/request ───────────────────────────────────────────────
export const requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId  = (req as any).user?._id;
    const { amount, walletAddress } = req.body;

    if (!amount || !walletAddress) {
      res.status(400).json({ error: 'Amount and wallet address are required' });
      return;
    }

    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAWAL) {
      res.status(400).json({ error: `Minimum withdrawal is ${MIN_WITHDRAWAL} USDT` });
      return;
    }

    const wallet = await Wallet.findOne({ userId });
    // Check AVAILABLE balance (not locked)
    if (!wallet || wallet.balances.usdt < withdrawAmount) {
      res.status(400).json({ error: 'Insufficient available USDT balance' });
      return;
    }

    // Prevent duplicate pending withdrawal
    const pending = await Withdrawal.findOne({ userId, status: { $in: ['otp_pending', 'pending'] } });
    if (pending) {
      res.status(400).json({ error: 'You already have a pending withdrawal. Complete or cancel it first.' });
      return;
    }

    // ── Instantly lock funds from available → locked ──
    wallet.balances.usdt       -= withdrawAmount;
    wallet.lockedBalances.usdt += withdrawAmount;
    await wallet.save();

    // Calculate breakdown
    const fee         = withdrawAmount * PLATFORM_FEE;
    const reinvestAmt = withdrawAmount * REINVEST_RATE;
    const netAmount   = withdrawAmount * NET_RATE;

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      userId,
      amount: withdrawAmount,
      netAmount,
      fee,
      reinvestAmount: reinvestAmt,
      walletAddress,
      status: 'otp_pending',
    });
    await withdrawal.save();

    // Generate and store hashed OTP on user
    const otp       = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const user      = await User.findById(userId);

    if (!user) {
      // Rollback wallet on error
      wallet.balances.usdt       += withdrawAmount;
      wallet.lockedBalances.usdt -= withdrawAmount;
      await wallet.save();
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.withdrawalOTP        = hashedOTP;
    user.withdrawalOTPExpiry  = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    await sendOTPEmail(user.email, otp, 'Withdrawal');

    // Run fraud checks asynchronously (non-blocking)
    checkWithdrawalAnomalies(userId, withdrawAmount).catch(console.error);

    res.status(200).json({
      message: 'Funds locked. OTP sent to your email. Valid for 5 minutes.',
      withdrawalId: withdrawal._id,
      breakdown: { total: withdrawAmount, netToWallet: netAmount, platformFee: fee, autoReinvest: reinvestAmt },
    });
  } catch (err: any) {
    console.error('[WITHDRAW REQUEST] Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/withdraw/confirm ───────────────────────────────────────────────
export const confirmWithdrawal = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req as any).user?._id;
    const { otp, withdrawalId } = req.body;

    if (!otp || !withdrawalId) {
      res.status(400).json({ error: 'OTP and withdrawalId are required' });
      return;
    }

    const user = await User.findById(userId).session(session);
    if (!user || !user.withdrawalOTP || !user.withdrawalOTPExpiry) {
      res.status(400).json({ error: 'No pending withdrawal OTP found' });
      await session.abortTransaction();
      return;
    }

    if (user.withdrawalOTPExpiry < new Date()) {
      // OTP expired — refund locked funds back to available
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (wallet) {
        const wd = await Withdrawal.findById(withdrawalId).session(session);
        if (wd && wd.status === 'otp_pending') {
          wallet.balances.usdt       += wd.amount;
          wallet.lockedBalances.usdt -= wd.amount;
          wd.status = 'rejected';
          await wallet.save({ session });
          await wd.save({ session });
        }
      }
      await session.commitTransaction();
      res.status(400).json({ error: 'OTP expired. Funds returned to your available balance.' });
      return;
    }

    const isMatch = await bcrypt.compare(otp, user.withdrawalOTP);
    if (!isMatch) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, userId, status: 'otp_pending' }).session(session);
    if (!withdrawal) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Withdrawal not found or already processed' });
      return;
    }

    // ── Move to pending admin approval; funds stay locked ──
    // Only reinvest portion is returned to available balance
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    // Reinvest portion returns to available; locked holds only the net payout
    wallet.balances.usdt       += withdrawal.reinvestAmount;
    wallet.lockedBalances.usdt -= withdrawal.reinvestAmount;
    await wallet.save({ session });

    // Update withdrawal status → pending admin approval
    withdrawal.status = 'pending';
    await withdrawal.save({ session });

    // Log transaction
    await new Transaction({
      userId,
      type: 'withdraw',
      asset: 'USDT',
      amount: withdrawal.netAmount,
      status: 'pending',
      metadata: { withdrawalId: withdrawal._id, walletAddress: withdrawal.walletAddress },
    }).save({ session });

    // Clear OTP
    user.withdrawalOTP       = undefined;
    user.withdrawalOTPExpiry = undefined;
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: 'Withdrawal confirmed and pending admin approval. Funds remain locked until processed.',
      netAmount: withdrawal.netAmount,
      status: 'pending',
    });
  } catch (err: any) {
    await session.abortTransaction();
    console.error('[WITHDRAW CONFIRM] Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  } finally {
    session.endSession();
  }
};
