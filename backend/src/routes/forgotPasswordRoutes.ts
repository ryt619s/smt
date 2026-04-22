import { Router } from 'express';
import { forgotPassword, verifyResetOTP, resetPassword } from '../controllers/forgotPasswordController';
import { otpRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/forgot-password',    otpRateLimiter, forgotPassword);
router.post('/verify-reset-otp',   otpRateLimiter, verifyResetOTP);
router.post('/reset-password',     resetPassword);

export default router;
