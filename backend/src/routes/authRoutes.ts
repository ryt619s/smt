import { Router } from 'express';
import { register, verifyRegistrationOTP, login, requestPasswordResetOTP, resetPasswordWithOTP, resendOTP } from '../controllers/authController';
import { otpRateLimiter, loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', otpRateLimiter, register);
router.post('/verify-otp', verifyRegistrationOTP);     // alias used by frontend
router.post('/verify-registration', verifyRegistrationOTP);
router.post('/resend-otp', otpRateLimiter, resendOTP); // resend button on verify page
router.post('/login', loginRateLimiter, login);
router.post('/forgot-password', otpRateLimiter, requestPasswordResetOTP);
router.post('/reset-password', resetPasswordWithOTP);

export default router;
