import mongoose from 'mongoose';
import MiningPackage from '../models/MiningPackage';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import MLMNode from '../models/MLMNode';

import Deposit from '../models/Deposit';
import { distributeMLMReward } from '../controllers/mlmController';

const BASE_RESERVE_POOL = 1000; // Base constant if there are no deposits

export const distributeMiningRewards = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Starting daily mining reward distribution...');
    
    const activePackages = await MiningPackage.find({ isActive: true }).session(session);
    if (activePackages.length === 0) {
      console.log('No active mining packages.');
      await session.abortTransaction();
      return;
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // 1. Calculate recent deposits
    const depositsAgg = await Deposit.aggregate([
      { $match: { status: 'approved', createdAt: { $gte: yesterday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const recentDeposits = depositsAgg.length > 0 ? depositsAgg[0].total : 0;

    // 2. Calculate fees (5% of withdrawals) and reinvestments (package purchases via 'swap' tx type)
    const txsAgg = await Transaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: yesterday } } },
      { $group: {
          _id: null,
          totalWithdrawals: {
            $sum: { $cond: [{ $eq: ['$type', 'withdraw'] }, '$amount', 0] }
          },
          totalReinvestments: {
            // swap transactions represent package purchases, amount is stored as negative cost
            $sum: { $cond: [{ $eq: ['$type', 'swap'] }, { $abs: '$amount' }, 0] }
          }
      }}
    ]);

    const txStats = txsAgg.length > 0 ? txsAgg[0] : { totalWithdrawals: 0, totalReinvestments: 0 };
    const withdrawalFees = txStats.totalWithdrawals * 0.05; // 5% withdrawal fee assumption
    const recentReinvestments = txStats.totalReinvestments;
    
    // Total pool = 20% of new deposits + 50% of withdrawal fees + 10% of reinvestments + Base Reserve Pool
    const DAILY_POOL_USD = (recentDeposits * 0.20) + (withdrawalFees * 0.50) + (recentReinvestments * 0.10) + BASE_RESERVE_POOL;

    let totalHashrate = activePackages.reduce((sum, pkg) => sum + pkg.hashrate, 0);

    for (const pkg of activePackages) {
      const rewardUSD = (pkg.hashrate / totalHashrate) * (DAILY_POOL_USD * 0.50); // 50% of pool goes to mining
      
      const wallet = await Wallet.findOne({ userId: pkg.userId }).session(session);
      if (wallet) {
        // Assume reward given in SMT equivalent or direct USDT. Giving in USDT for simplicity.
        // Actually prompt says "Dynamic reward engine...", we will credit USDT balance so they can withdraw or swap.
        wallet.balances.usdt += rewardUSD;
        await wallet.save({ session });

        const tx = new Transaction({
          userId: pkg.userId,
          type: 'mining_reward',
          asset: 'USDT',
          amount: rewardUSD,
          status: 'completed'
        });
        await tx.save({ session });
        
        // Distribute MLM commissions based on standard distribution percentage of the reward
        await distributeMLMReward(pkg.userId, rewardUSD, session);
      }
    }

    console.log('Successfully distributed mining rewards.');
    await session.commitTransaction();
  } catch (err) {
    console.error('Error distributing rewards:', err);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
};
