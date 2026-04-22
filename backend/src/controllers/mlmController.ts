import { Request, Response } from 'express';
import MLMNode from '../models/MLMNode';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import MiningPackage from '../models/MiningPackage';
import mongoose from 'mongoose';

const MLM_LEVEL_PERCENTS = [12, 6, 5, 4, 3, 2.5, 2, 1.5, 1, 1];

export const distributeMLMReward = async (userId: mongoose.Types.ObjectId, amountUSD: number, session: mongoose.ClientSession): Promise<void> => {
  let currentUserNode = await MLMNode.findOne({ userId }).session(session);
  let currentLevel = 0;

  while (currentUserNode && currentLevel < 10) {
    if (!currentUserNode.sponsorId || currentUserNode.sponsorId.toString() === currentUserNode.userId.toString()) {
      break; // No further sponsor or self-sponsored top node
    }

    const sponsorId = currentUserNode.sponsorId;
    const rewardPercentage = MLM_LEVEL_PERCENTS[currentLevel];
    const rewardAmount = amountUSD * (rewardPercentage / 100);

    const sponsorWallet = await Wallet.findOne({ userId: sponsorId }).session(session);
    if (sponsorWallet) {
      sponsorWallet.balances.usdt += rewardAmount;
      await sponsorWallet.save({ session });

      const tx = new Transaction({
        userId: sponsorId,
        type: 'mlm_reward',
        asset: 'USDT',
        amount: rewardAmount,
        status: 'completed'
      });
      await tx.save({ session });
    }

    // Move up the tree
    currentUserNode = await MLMNode.findOne({ userId: sponsorId }).session(session);
    currentLevel++;
  }
};

// API Endpoint to view team
export const getMyTeam = async (req: Request, res: Response): Promise<void> => {
   try {
     const userId = (req as any).user?._id;
     
     // Build a 10-level tree recursively
     let allDownlines: any[] = [];
     let totalTeamHashrate = 0;

     const getNetwork = async (sponsorIds: string[], level: number) => {
       if (level > 10 || sponsorIds.length === 0) return;
       const nodes = await MLMNode.find({ sponsorId: { $in: sponsorIds } }).populate('userId', 'email name status isVerified createdAt');
       
       for (const n of nodes) {
         if (n.userId && n.userId._id.toString() !== userId.toString()) {
            const userPkgs = await MiningPackage.find({ userId: n.userId._id, isActive: true });
            const userHashrate = userPkgs.reduce((acc, p) => acc + p.hashrate, 0);
            totalTeamHashrate += userHashrate;

            allDownlines.push({
              _id: n._id,
              user: n.userId,
              level,
              hashrate: userHashrate
            });
         }
       }
       const nextSponsorIds = nodes.map(n => n.userId?._id?.toString()).filter(Boolean);
       await getNetwork(nextSponsorIds, level + 1);
     };

     await getNetwork([userId.toString()], 1);

     // Calculate Total Earnings from MLM rewards
     const earningsObj = await Transaction.aggregate([
       { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'mlm_reward', status: 'completed' } },
       { $group: { _id: null, total: { $sum: '$amount' } } }
     ]);
     const totalEarnings = earningsObj.length > 0 ? earningsObj[0].total : 0;

     // Filter direct downlines (level 1)
     const directDownlines = allDownlines.filter(n => n.level === 1);

     res.status(200).json({ 
       network: allDownlines, 
       directCount: directDownlines.length,
       directDownlines,
       totalTeamHashrate,
       totalEarnings
     });
   } catch (error) {
     res.status(500).json({ error: 'Server error parsing team' });
   }
};
