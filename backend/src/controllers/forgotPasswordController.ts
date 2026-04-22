import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { sendOTPEmail } from '../services/emailService';

const OTP_EXPIRY_MS  = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_TRIES  = 5;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: 'Email is required' }); return; }

    const user = await User.findOne({ email });
    if (!user) {
      // Security: don't reveal if email exists
      res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
      return;
    }

    if (user.isBanned) { res.status(403).json({ error: 'Account suspended' }); return; }

    const otp        = generateOTP();
    const hashedOTP  = await bcrypt.hash(otp, 10);
    const expiry     = new Date(Date.now() + OTP_EXPIRY_MS);

    user.resetOTP        = hashedOTP;
    user.resetOTPExpiry  = expiry;
    user.resetOTPAttempts = 0;
    user.resetVerified   = false;
    await user.save();

    await sendOTPEmail(email, otp, 'Password Reset');
    console.log(`[FORGOT-PWD] OTP sent to ${email}`);

    res.status(200).json({ message: 'OTP sent to your registered email. Valid for 5 minutes.' });
  } catch (err: any) {
    console.error('[FORGOT-PWD] Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/auth/verify-reset-otp ─────────────────────────────────────────
export const verifyResetOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) { res.status(400).json({ error: 'Email and OTP are required' }); return; }

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP || !user.resetOTPExpiry) {
      res.status(400).json({ error: 'No password reset request found. Request a new OTP.' });
      return;
    }

    // Check attempt limit
    if (user.resetOTPAttempts >= MAX_OTP_TRIES) {
      user.resetOTP = undefined;
      user.resetOTPExpiry = undefined;
      await user.save();
      res.status(429).json({ error: 'Too many failed attempts. Request a new OTP.' });
      return;
    }

    // Check expiry
    if (user.resetOTPExpiry < new Date()) {
      res.status(400).json({ error: 'OTP has expired. Request a new one.' });
      return;
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      user.resetOTPAttempts += 1;
      await user.save();
      const remaining = MAX_OTP_TRIES - user.resetOTPAttempts;
      res.status(400).json({ error: `Invalid OTP. ${remaining} attempt(s) remaining.` });
      return;
    }

    // OTP valid — allow password reset
    user.resetVerified    = true;
    user.resetOTPAttempts = 0;
    await user.save();

    res.status(200).json({ message: 'OTP verified. You may now reset your password.' });
  } catch (err: any) {
    console.error('[VERIFY-RESET-OTP] Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ error: 'Email and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    if (!user.resetVerified) {
      res.status(403).json({ error: 'OTP not verified. Verify OTP before resetting password.' });
      return;
    }

    // Update password and clear all reset fields
    user.passwordHash    = await bcrypt.hash(newPassword, 12);
    user.resetOTP        = undefined;
    user.resetOTPExpiry  = undefined;
    user.resetVerified   = false;
    user.resetOTPAttempts = 0;
    user.loginAttempts   = 0;  // also clear login lock
    user.lockedUntil     = undefined;
    await user.save();

    console.log(`[RESET-PWD] Password reset for ${email}`);
    res.status(200).json({ message: 'Password reset successfully. You may now log in.' });
  } catch (err: any) {
    console.error('[RESET-PWD] Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
