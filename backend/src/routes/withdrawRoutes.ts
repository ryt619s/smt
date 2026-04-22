import { Router } from 'express';
import { requestWithdrawal, confirmWithdrawal } from '../controllers/withdrawController';
import { authMiddleware } from '../middleware/authMiddleware';
import { otpRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All withdrawal routes require JWT authentication
router.post('/request',  authMiddleware, otpRateLimiter, requestWithdrawal);
router.post('/confirm',  authMiddleware, confirmWithdrawal);

export default router;
