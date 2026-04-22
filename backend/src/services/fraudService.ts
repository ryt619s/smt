import mongoose from 'mongoose';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Withdrawal from '../models/Withdrawal';
import Deposit from '../models/Deposit';
import FraudLog from '../models/FraudLog';

const HIGH_RISK_AMOUNT      = 1000;   // USD
const WITHDRAWAL_WINDOW_MS  = 10 * 60 * 1000;  // 10 minutes
const WITHDRAWAL_COUNT_LIMIT = 3;
const DEPOSIT_WINDOW_MS     = 60 * 60 * 1000;  // 1 hour

type RiskLevel = 'low' | 'medium' | 'high';

async function flagUser(userId: mongoose.Types.ObjectId | string, reason: string, riskLevel: RiskLevel) {
  await User.findByIdAndUpdate(userId, {
    isFlagged:   true,
    fraudReason: reason,
    riskLevel,
  });
}

async function saveLog(userId: mongoose.Types.ObjectId | string, action: string, reason: string, riskLevel: RiskLevel) {
  await new FraudLog({ userId, action, reason, riskLevel }).save();
}

// ─── checkWithdrawalAnomalies ─────────────────────────────────────────────────
export const checkWithdrawalAnomalies = async (
  userId: mongoose.Types.ObjectId | string,
  amount: number
): Promise<void> => {
  const reasons: string[] = [];
  let riskLevel: RiskLevel = 'low';

  // Rule 1: ≥ 3 withdrawals in last 10 minutes
  const recentWithdrawalCount = await Withdrawal.countDocuments({
    userId,
    createdAt: { $gte: new Date(Date.now() - WITHDRAWAL_WINDOW_MS) },
  });
  if (recentWithdrawalCount >= WITHDRAWAL_COUNT_LIMIT) {
    reasons.push(`${recentWithdrawalCount} withdrawals requested within 10 minutes`);
    riskLevel = 'high';
  }

  // Rule 2: High value withdrawal
  if (amount > HIGH_RISK_AMOUNT) {
    reasons.push(`High-value withdrawal of $${amount.toFixed(2)}`);
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
  }

  // Rule 3: Recent deposit + immediate withdrawal
  const recentDeposit = await Deposit.findOne({
    userId,
    status: 'approved',
    createdAt: { $gte: new Date(Date.now() - DEPOSIT_WINDOW_MS) },
  });
  if (recentDeposit) {
    reasons.push(`Withdrawal requested within 1 hour of deposit approval`);
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
  }

  if (reasons.length > 0) {
    const reason = reasons.join('; ');
    await saveLog(userId, 'suspicious_withdrawal', reason, riskLevel);
    await flagUser(userId, reason, riskLevel);
    console.warn(`[FRAUD] User ${userId} flagged: ${reason}`);
  }
};

// ─── logAuthAnomaly ───────────────────────────────────────────────────────────
export const logAuthAnomaly = async (
  userId: mongoose.Types.ObjectId | string,
  reason: string
): Promise<void> => {
  const riskLevel: RiskLevel = 'medium';
  await saveLog(userId, 'auth_anomaly', reason, riskLevel);
  await flagUser(userId, reason, riskLevel);
  console.warn(`[FRAUD] Auth anomaly for user ${userId}: ${reason}`);
};
