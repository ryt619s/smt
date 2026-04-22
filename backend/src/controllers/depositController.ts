import { Request, Response } from 'express';
import Deposit from '../models/Deposit';
import Transaction from '../models/Transaction';

// ─── POST /api/wallet/deposit/request ──────────────────────────────────────
export const requestDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { amount, txHash } = req.body;

    if (!amount || !txHash) {
      res.status(400).json({ error: 'Amount and Transaction Hash are required' });
      return;
    }

    if (Number(amount) <= 0) {
      res.status(400).json({ error: 'Invalid deposit amount' });
      return;
    }

    // Check if txHash already claimed
    const existing = await Deposit.findOne({ txHash });
    if (existing) {
      res.status(400).json({ error: 'This transaction hash has already been submitted.' });
      return;
    }

    const deposit = new Deposit({
      userId,
      amount: Number(amount),
      txHash,
      status: 'pending'
    });
    await deposit.save();

    await new Transaction({
      userId,
      type: 'deposit',
      asset: 'USDT',
      amount: Number(amount),
      status: 'pending',
      metadata: { txHash, depositId: deposit._id }
    }).save();

    res.status(201).json({ message: 'Deposit request submitted. Waiting for admin approval.', deposit });
  } catch (error) {
    console.error('[DEPOSIT ERROR]', error);
    res.status(500).json({ error: 'Server error processing deposit request' });
  }
};
