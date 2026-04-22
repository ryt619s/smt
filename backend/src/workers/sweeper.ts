import { ethers } from 'ethers';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import { decrypt } from '../utils/crypto';
import mongoose from 'mongoose';

// BEP20 USDT Contract on BSC Mainnet
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address account) view returns (uint)"
];

const PROVIDER_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
const CENTRAL_COLD_WALLET = process.env.COLD_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
const CENTRAL_HOT_WALLET_PK = process.env.HOT_WALLET_PK || '0x0000000000000000000000000000000000000000000000000000000000000000';

export const handleUSDTDepositWebhook = async (webhookData: any) => {
  // Moralis/Ankr stream data format usually provides an array of ERC20 transfers
  const transfers = webhookData.erc20Transfers;
  if (!transfers) return;

  for (const transfer of transfers) {
    if (transfer.contract.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
      const dbWallet = await Wallet.findOne({ addressId: { $regex: new RegExp(`^${transfer.to}$`, 'i') } });
      
      if (dbWallet) {
        // Credit user balance internally
        const amountUsdt = parseFloat(ethers.utils.formatUnits(transfer.value, 18));
        dbWallet.balances.usdt += amountUsdt;
        await dbWallet.save();

        const tx = new Transaction({
          userId: dbWallet.userId,
          type: 'deposit',
          asset: 'USDT',
          amount: amountUsdt,
          txHash: transfer.transactionHash,
          status: 'completed'
        });
        await tx.save();

        // Queue sweep
        sweepWallet(dbWallet.addressId);
      }
    }
  }
};

export const sweepWallet = async (userAddress: string) => {
  try {
    const dbWallet = await Wallet.findOne({ addressId: userAddress });
    if (!dbWallet) return;

    const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
    
    // Decrypt user private key
    const userPK = decrypt(dbWallet.privateKeyEncrypted);
    const userSigner = new ethers.Wallet(userPK, provider);
    const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, userSigner);

    const balance = await usdtContract.balanceOf(userAddress);
    if (balance.eq(0)) return;

    // 1. Send BNB Gas from Hot Wallet to User Wallet
    const hotWalletSigner = new ethers.Wallet(CENTRAL_HOT_WALLET_PK, provider);
    const gasLimit = 60000;
    const gasPrice = await provider.getGasPrice();
    const gasCost = gasPrice.mul(gasLimit);

    const bnbTx = await hotWalletSigner.sendTransaction({
      to: userAddress,
      value: gasCost
    });
    await bnbTx.wait(); // wait for gas to arrive

    // 2. Transfer USDT to Cold Wallet
    const sweepTx = await usdtContract.transfer(CENTRAL_COLD_WALLET, balance);
    await sweepTx.wait();

    console.log(`Successfully swept wallet: ${userAddress}`);
  } catch (err) {
    console.error('Sweeping error:', err);
  }
};
