import { Request, Response } from 'express';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import Withdrawal from '../models/Withdrawal';
import Deposit from '../models/Deposit';
import FraudLog from '../models/FraudLog';

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers   = await User.countDocuments();
    const activeUsers  = await User.countDocuments({ isVerified: true, isBanned: false });
    const bannedUsers  = await User.countDocuments({ isBanned: true });

    const wallets = await Wallet.find();
    let totalUsdt = 0, totalSmt = 0;
    wallets.forEach(w => { totalUsdt += w.balances.usdt; totalSmt += w.balances.smt; });

    const totalDeposits    = await Deposit.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]);
    const totalWithdrawals = await Withdrawal.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, sum: { $sum: '$netAmount' } } }]);
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const pendingDeposits    = await Deposit.countDocuments({ status: 'pending' });
    const flaggedUsers       = await User.countDocuments({ isFlagged: true });

    const recentTxs = await Transaction.find().sort({ createdAt: -1 }).limit(15).populate('userId', 'email name');

    res.status(200).json({
      users:       { total: totalUsers, active: activeUsers, banned: bannedUsers },
      balances:    { usdt: totalUsdt, smt: totalSmt },
      deposits:    { totalApproved: totalDeposits[0]?.sum || 0, pending: pendingDeposits },
      withdrawals: { totalCompleted: totalWithdrawals[0]?.sum || 0, pending: pendingWithdrawals },
      fraud:       { flaggedUsers },
      recentTransactions: recentTxs,
    });
  } catch (err: any) {
    console.error('[ADMIN STATS]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET /api/admin/users ────────────────────────────────────────────────────
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (search) query.$or = [{ email: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }];

    const users = await User.find(query)
      .select('-passwordHash -emailOTP -resetOTP -withdrawalOTP')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.status(200).json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/admin/users/:id/ban ───────────────────────────────────────────
export const toggleBanUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.role === 'admin') { res.status(403).json({ error: 'Cannot ban admin users' }); return; }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: user.isBanned });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET /api/admin/deposits ─────────────────────────────────────────────────
export const getPendingDeposits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'pending' } = req.query;
    const deposits = await Deposit.find({ status: status as string }).sort({ createdAt: -1 }).populate('userId', 'email name');
    res.status(200).json({ deposits });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/admin/deposits/:id/approve ────────────────────────────────────
export const approveDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const deposit = await Deposit.findById(id);
    if (!deposit) { res.status(404).json({ error: 'Deposit not found' }); return; }
    if (deposit.status !== 'pending') { res.status(400).json({ error: 'Deposit already processed' }); return; }

    const wallet = await Wallet.findOne({ userId: deposit.userId });
    if (!wallet) { res.status(404).json({ error: 'User wallet not found' }); return; }

    wallet.balances.usdt += deposit.amount;
    await wallet.save();

    deposit.status    = 'approved';
    deposit.adminNote = note;
    await deposit.save();

    await new Transaction({ userId: deposit.userId, type: 'deposit', asset: 'USDT', amount: deposit.amount, status: 'completed' }).save();

    res.status(200).json({ message: 'Deposit approved and balance credited', deposit });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/admin/deposits/:id/reject ─────────────────────────────────────
export const rejectDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const deposit = await Deposit.findById(id);
    if (!deposit) { res.status(404).json({ error: 'Deposit not found' }); return; }
    if (deposit.status !== 'pending') { res.status(400).json({ error: 'Deposit already processed' }); return; }

    deposit.status = 'rejected';
    deposit.adminNote = note;
    await deposit.save();

    res.status(200).json({ message: 'Deposit rejected', deposit });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET /api/admin/withdrawals ───────────────────────────────────────────────
export const getPendingWithdrawals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'pending' } = req.query;
    const withdrawals = await Withdrawal.find({ status: status as string }).sort({ createdAt: -1 }).populate('userId', 'email name');
    res.status(200).json({ withdrawals });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/admin/withdrawals/:id/approve ─────────────────────────────────
export const approveWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { txHash, note } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) { res.status(404).json({ error: 'Withdrawal not found' }); return; }
    if (withdrawal.status !== 'pending') { res.status(400).json({ error: 'Withdrawal already processed' }); return; }

    // ── Deduct from lockedBalances (funds already removed from available) ──
    const wallet = await Wallet.findOne({ userId: withdrawal.userId });
    if (wallet) {
      const lockedDeduct = withdrawal.amount - withdrawal.reinvestAmount; // reinvest already returned
      wallet.lockedBalances.usdt = Math.max(0, (wallet.lockedBalances.usdt ?? 0) - lockedDeduct);
      await wallet.save();
    }

    withdrawal.status    = 'completed';
    withdrawal.txHash    = txHash;
    withdrawal.adminNote = note;
    await withdrawal.save();

    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id },
      { status: 'completed', 'metadata.txHash': txHash }
    );

    res.status(200).json({ message: 'Withdrawal approved and released', withdrawal });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/admin/withdrawals/:id/reject ───────────────────────────────────
export const rejectWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) { res.status(404).json({ error: 'Withdrawal not found' }); return; }
    if (withdrawal.status !== 'pending') { res.status(400).json({ error: 'Withdrawal already processed' }); return; }

    // ── Refund: move locked funds back to available balance ──
    const wallet = await Wallet.findOne({ userId: withdrawal.userId });
    if (wallet) {
      const lockedNet = withdrawal.amount - withdrawal.reinvestAmount; // the net that stayed locked
      wallet.lockedBalances.usdt  = Math.max(0, (wallet.lockedBalances.usdt ?? 0) - lockedNet);
      wallet.balances.usdt       += lockedNet;
      await wallet.save();
    }

    withdrawal.status    = 'rejected';
    withdrawal.adminNote = note;
    await withdrawal.save();

    res.status(200).json({ message: 'Withdrawal rejected and funds fully refunded to available balance', withdrawal });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET /api/admin/transactions ─────────────────────────────────────────────
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, page = 1, limit = 25 } = req.query;
    const query: any = {};
    if (userId) query.userId = userId;
    if (type)   query.type   = type;

    const txs = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('userId', 'email name');

    const total = await Transaction.countDocuments(query);
    res.status(200).json({ transactions: txs, total });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET /api/admin/fraud-logs ────────────────────────────────────────────────
export const getFraudLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const logs = await FraudLog.find()
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('userId', 'email name riskLevel isFlagged');
    const total = await FraudLog.countDocuments();
    res.status(200).json({ logs, total });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── GET /api/admin/flagged-users ─────────────────────────────────────────────
export const getFlaggedUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({ isFlagged: true })
      .select('email name riskLevel fraudReason isFlagged createdAt')
      .sort({ updatedAt: -1 });
    res.status(200).json({ users, total: users.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error' });
  }
};
