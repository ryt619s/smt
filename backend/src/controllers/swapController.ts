import { Request, Response } from 'express';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

// Base price starting at $0.50
let currentSMTPriceUSD = 0.50;

export const swapTokens = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = (req as any).user?._id;
    const { amount, direction } = req.body; 
    // direction: 'USDT_TO_SMT' | 'SMT_TO_USDT'
    
    if (amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    if (direction === 'USDT_TO_SMT') {
      if (wallet.balances.usdt < amount) {
        await session.abortTransaction();
        res.status(400).json({ error: 'Insufficient USDT balance' });
        return;
      }
      
      const amountSmt = amount / currentSMTPriceUSD;
      const amountSmtFinal = amountSmt * 0.99; // 1% slippage
      
      wallet.balances.usdt -= amount;
      wallet.balances.smt += amountSmtFinal;
      await wallet.save({ session });

      const tx = new Transaction({
        userId, type: 'swap', asset: 'SMT', amount: amountSmtFinal, status: 'completed'
      });
      await tx.save({ session });

      currentSMTPriceUSD += (amount * 0.00001); // Price increases slightly on buy

      await session.commitTransaction();
      res.status(200).json({ message: 'Swap successful', received: amountSmtFinal, asset: 'SMT', newPrice: currentSMTPriceUSD });
      
    } else if (direction === 'SMT_TO_USDT') {
      if (wallet.balances.smt < amount) {
        await session.abortTransaction();
        res.status(400).json({ error: 'Insufficient SMT balance' });
        return;
      }

      const amountUsdt = amount * currentSMTPriceUSD;
      const amountUsdtFinal = amountUsdt * 0.99; // 1% slippage

      wallet.balances.smt -= amount;
      wallet.balances.usdt += amountUsdtFinal;
      await wallet.save({ session });

      const tx = new Transaction({
        userId, type: 'swap', asset: 'USDT', amount: amountUsdtFinal, status: 'completed'
      });
      await tx.save({ session });

      currentSMTPriceUSD = Math.max(0.10, currentSMTPriceUSD - (amountUsdt * 0.00001)); // Price decreases slightly on sell

      await session.commitTransaction();
      res.status(200).json({ message: 'Swap successful', received: amountUsdtFinal, asset: 'USDT', newPrice: currentSMTPriceUSD });
    } else {
      await session.abortTransaction();
      res.status(400).json({ error: 'Invalid swap direction' });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Server error during swap' });
  } finally {
    session.endSession();
  }
};

export const getPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ price: currentSMTPriceUSD });
  } catch (error) {
    res.status(500).json({ error: 'Server error parsing price' });
  }
};
