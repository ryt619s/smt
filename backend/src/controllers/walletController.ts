import { Request, Response } from 'express';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import User from '../models/User';

export const getWalletBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      res.status(200).json({
        availableBalance: 0,
        lockedBalance:    0,
        totalBalance:     0,
        smt:              0,
        walletAddress:    'Not Generated',
      });
      return;
    }

    const available = wallet.balances.usdt;
    const locked    = wallet.lockedBalances?.usdt ?? 0;

    res.status(200).json({
      availableBalance: available,
      lockedBalance:    locked,
      totalBalance:     available + locked,
      smt:              wallet.balances.smt,
      walletAddress:    wallet.addressId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving balance' });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { limit = 10 } = req.query;

    const txs = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({ transactions: txs });
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving transactions' });
  }
};
