import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Wallet from '../models/Wallet';
import User from '../models/User';
import { generateUniqueWallet } from '../utils/wallet';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to DB');

    // Give 10,000 USDT to all users, and create wallets if they don't have one
    const users = await User.find({});
    for (const u of users) {
      let wallet = await Wallet.findOne({ userId: u._id });
      if (!wallet) {
        const walletData = generateUniqueWallet();
        wallet = new Wallet({
          userId: u._id,
          addressId: walletData.address,
          mnemonicEncrypted: walletData.encryptedMnemonic,
          privateKeyEncrypted: walletData.encryptedPrivateKey,
          balances: { usdt: 10000, smt: 500, bnb: 0 }
        });
      } else {
        wallet.balances.usdt = 10000;
        wallet.balances.smt = 500;
      }
      await wallet.save();
      console.log(`Funded wallet for ${u.email} with 10k USDT`);
    }

    console.log('All done!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
