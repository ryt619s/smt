import { Router } from 'express';
import {
  getSystemStats, getAllUsers, toggleBanUser,
  getPendingDeposits, approveDeposit, rejectDeposit,
  getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  getAllTransactions, getFraudLogs, getFlaggedUsers
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import rateLimit from 'express-rate-limit';

const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

const router = Router();
// All admin routes: must be authenticated AND be an admin role
router.use(authMiddleware, adminMiddleware, adminLimiter);

router.get('/stats',                       getSystemStats);
router.get('/users',                       getAllUsers);
router.post('/users/:id/ban',              toggleBanUser);
router.get('/deposits',                    getPendingDeposits);
router.post('/deposits/:id/approve',       approveDeposit);
router.post('/deposits/:id/reject',        rejectDeposit);
router.get('/withdrawals',                 getPendingWithdrawals);
router.post('/withdrawals/:id/approve',    approveWithdrawal);
router.post('/withdrawals/:id/reject',     rejectWithdrawal);
router.get('/transactions',                getAllTransactions);
router.get('/fraud-logs',                  getFraudLogs);
router.get('/flagged-users',               getFlaggedUsers);

export default router;
