import { Request, Response } from 'express';
import MiningPackage from '../models/MiningPackage';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import User from '../models/User';
import mongoose from 'mongoose';
import { distributeMLMReward } from './mlmController';

const PACKAGES = {
  Basic: { cost: 50, hashrate: 100 },
  Pro: { cost: 100, hashrate: 220 },
  Ultra: { cost: 500, hashrate: 1200 }
};

export const getPackages = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ packages: PACKAGES });
};

export const purchasePackage = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req as any).user?._id;
    const { type } = req.body;
    
    if (!['Basic', 'Pro', 'Ultra'].includes(type)) {
       res.status(400).json({ error: 'Invalid package type' });
       return;
    }

    const pkgConfig = PACKAGES[type as keyof typeof PACKAGES];

    // Check user balance
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet || wallet.balances.usdt < pkgConfig.cost) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Insufficient USDT balance' });
      return;
    }

    // Deduct balance
    wallet.balances.usdt -= pkgConfig.cost;
    await wallet.save({ session });

    // Record Transaction
    const tx = new Transaction({
      userId,
      type: 'swap', // Used for internal package purchase
      asset: 'USDT',
      amount: -pkgConfig.cost,
      status: 'completed'
    });
    await tx.save({ session });

    // Create Mining Package
    const miningPkg = new MiningPackage({
      userId,
      packageType: type,
      hashrate: pkgConfig.hashrate,
      costUSD: pkgConfig.cost
    });
    await miningPkg.save({ session });

    // Distribute affiliate commission dynamically 
    await distributeMLMReward(userId, pkgConfig.cost, session);

    await session.commitTransaction();
    res.status(200).json({ message: 'Package purchased successfully', miningPkg });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Server error during purchase' });
  } finally {
    session.endSession();
  }
};

export const getActivePackages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const packages = await MiningPackage.find({ userId, isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ packages });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching packages' });
  }
};
