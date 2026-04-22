import { ethers } from 'ethers';
import { encrypt } from './crypto';

export interface WalletData {
  address: string;
  encryptedMnemonic: string;
  encryptedPrivateKey: string;
}

export const generateUniqueWallet = (): WalletData => {
  // Generate a random wallet (BIP-39 mnemonic + HD keys)
  const wallet = ethers.Wallet.createRandom();
  
  const mnemonic = wallet.mnemonic?.phrase;
  if (!mnemonic) {
    throw new Error('Failed to generate mnemonic');
  }

  const encryptedMnemonic = encrypt(mnemonic);
  const encryptedPrivateKey = encrypt(wallet.privateKey);

  return {
    address: wallet.address,
    encryptedMnemonic,
    encryptedPrivateKey
  };
};
