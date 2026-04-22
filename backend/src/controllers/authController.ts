import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Wallet from '../models/Wallet';
import MLMNode from '../models/MLMNode';
import { generateUniqueWallet } from '../utils/wallet';
import { sendOTPEmail } from '../services/emailService';
import { logAuthAnomaly } from '../services/fraudService';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

const generateOTPData = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    return { otp, expiry };
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('\n--- NEW REGISTRATION REQUEST ---');
    console.log('[DEBUG] Incoming Body:', { ...req.body, password: '[HIDDEN]' });

    if (mongoose.connection.readyState !== 1) {
        console.error('[DATABASE ERRROR] MongoDB is not connected.');
        res.status(500).json({ error: 'Fatal: Database disconnected. Ensure your IP is whitelisted in MongoDB Atlas (0.0.0.0/0).' });
        return;
    }

    const { email, password, name, referralCode: inputReferralCode } = req.body;
    
    // 1. Basic validation
    if (!email || !password || !name) {
        console.error('[VALIDATION FAILED] Missing required fields');
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
    }

    let user = await User.findOne({ email });
    if (user) {
        if (user.isVerified) {
            console.error('[COLLISION] Email already registered', email);
            res.status(400).json({ error: 'Email already exists' });
            return;
        }
        // If unverified, we can resend OTP but let's clear their old data to restart flow cleanly.
        await User.deleteOne({ email });
    }

    // 2. Handle Sponsor Checking (referredBy)
    let referredById = null;
    if (inputReferralCode) {
        const sponsor = await User.findOne({ referralCode: inputReferralCode });
        if (!sponsor) {
             res.status(400).json({ error: 'Invalid sponsor referral code' });
             return;
        }
        referredById = sponsor._id;
    }

    // 3. Generate UNIQUE referral code for this new user
    let generatedReferralCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        generatedReferralCode = `SMT${randomStr}`;
        const existing = await User.findOne({ referralCode: generatedReferralCode });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
         res.status(500).json({ error: 'Collision error generating referral code. Please try again.' });
         return;
    }

    // 4. Finalize User Creation
    const { otp, expiry } = generateOTPData();
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = new User({ 
        email, 
        passwordHash, 
        name, 
        referredBy: referredById, 
        referralCode: generatedReferralCode, 
        emailOTP: otp, 
        otpExpiry: expiry, 
        isVerified: false 
    });
    
    await newUser.save();

    // 5. Generate Wallet & MLM Node
    const walletData = generateUniqueWallet();
    const wallet = new Wallet({
      userId: newUser._id, addressId: walletData.address, mnemonicEncrypted: walletData.encryptedMnemonic, privateKeyEncrypted: walletData.encryptedPrivateKey
    });
    await wallet.save();

    let level = 1;
    if (referredById) {
      const sponsorNode = await MLMNode.findOne({ userId: referredById });
      if (sponsorNode) level = sponsorNode.level + 1;
    }
    const mlmNode = new MLMNode({ userId: newUser._id, sponsorId: referredById || newUser._id, level });
    await mlmNode.save();

    // 6. Send Email and Return
    await sendOTPEmail(email, otp, 'Registration');
    console.log(`[SUCCESS] User registered gracefully: ${email} | New SMT Code: ${generatedReferralCode} | Sponsor attached: ${inputReferralCode || 'None'}`);
    
    res.status(201).json({ message: 'Registration successful! OTP sent to email. Please verify to activate account.' });
  } catch (error: any) {
    console.error('\n[CRITICAL AUTH ERROR TRACE] -----------------------');
    console.error(error);
    console.error('---------------------------------------------------\n');
    res.status(500).json({ error: error.message || 'Unknown Server Error occurred' });
  }
};

export const verifyRegistrationOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
             res.status(404).json({ error: 'User not found' });
             return;
        }
        if (user.isVerified) {
             res.status(400).json({ error: 'Account already verified' });
             return;
        }
        if (user.emailOTP !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
             res.status(400).json({ error: 'Invalid or expired OTP' });
             return;
        }

        user.isVerified = true;
        user.emailOTP = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const payload = { sub: user._id, role: user.role, iat: Date.now() };
        const token = jwt.sign(payload, JWT_SECRET);

        res.status(200).json({ message: 'Account verified successfully', token, user: { id: user._id, email: user.email, name: user.name, rank: user.rank }});
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        res.status(404).json({ error: 'Invalid credentials' });
        return;
    }

    if (user.isBanned) {
        res.status(403).json({ error: 'Account suspended' });
        return;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        res.status(423).json({ error: `Account locked. Try again in ${remaining} minutes.` });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
         user.loginAttempts += 1;
         if (user.loginAttempts >= 5) {
             user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
             // Trigger fraud detection
             logAuthAnomaly(user._id as any, `5 consecutive failed login attempts from ${req.ip}`).catch(console.error);
         }
         await user.save();
         const attemptsLeft = Math.max(0, 5 - user.loginAttempts);
         const errorMsg = user.loginAttempts >= 5
           ? 'Account locked for 15 minutes due to multiple failed attempts.'
           : `Invalid credentials. ${attemptsLeft} attempts remaining.`;
         res.status(401).json({ error: errorMsg });
         return;
    }

    if (!user.isVerified) {
         res.status(403).json({ error: 'Email not verified. Please check your email for OTP.' });
         return;
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();

    const payload = { sub: user._id, role: user.role, iat: Date.now() };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name, rank: user.rank, referralCode: user.referralCode, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const requestPasswordResetOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const { otp, expiry } = generateOTPData();
    user.emailOTP = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, otp, 'Password Reset');
    res.status(200).json({ message: 'Password reset OTP sent to email.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPasswordWithOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    if (user.emailOTP !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
         res.status(400).json({ error: 'Invalid or expired OTP' });
         return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.emailOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: 'Email is required' }); return; }

    const user = await User.findOne({ email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.isVerified) { res.status(400).json({ error: 'Account already verified' }); return; }

    const { otp, expiry } = generateOTPData();
    user.emailOTP = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, otp, 'Registration');
    console.log(`[AUTH] OTP resent to ${email}`);
    res.status(200).json({ message: 'New OTP sent to email' });
  } catch (error: any) {
    console.error('[AUTH] resendOTP error:', error);
    res.status(500).json({ error: error.message });
  }
};
